"""Everything Hestia Heating reads from Home Assistant, and nothing it writes: the registries, the states, the other
bricks' public interfaces. The engine (engine/) gets plain dictionaries from here and never touches Home Assistant.

Two moments: `discover()` walks the registries once (at start, and again when an entity, a device or a room changes) to
find the thermostats, the stove and its profile, the plug, Suivi Stock Pellet and the schedules; `snapshot()` then reads
only the states of what was found, on every change.
"""
from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util

from .engine import planning, sources
from .engine.profiles import Profile

_LOGGER = logging.getLogger(__name__)

VT = sources.VT
SCHEDULER = "scheduler"
PELLETS = "suivi_stock_pellet"
PELLET_KEY = "suivi_stock_pellet_key"
WORKDAY = "workday"
WEATHER_API = "hestia_weather_api"
WEATHER_API_VERSION = 1      # the version of Hestia Weather's interface this brick speaks
BRICK = "hestia_heating"     # said to Hestia Weather when listening, so that its settings show this brick linked


@dataclass
class Found:
    """What `discover()` found: entity ids only, read again by `snapshot()` on every change."""
    climates: list[dict] = field(default_factory=list)      # {entity_id, platform, room}
    stove: dict | None = None                                # {profile, device, roles: {role: entity_id}, entities}
    plug: str | None = None
    plugs: list[dict] = field(default_factory=list)          # every power sensor that could be the stove's plug
    pellets: dict[str, str] = field(default_factory=dict)    # {role: entity_id}
    schedules: list[str] = field(default_factory=list)
    workday: str | None = None
    room_names: dict[str, str] = field(default_factory=dict)
    installed: dict[str, bool] = field(default_factory=dict)

    def tracked(self, extra: list[str] | None = None) -> set[str]:
        """The entities whose changes are listened to (and only those)."""
        out = {c["entity_id"] for c in self.climates}
        if self.stove:
            out |= set(self.stove["roles"].values())
        out |= set(self.pellets.values()) | set(self.schedules)
        out |= {e for e in (self.plug, self.workday) if e}
        return out | set(extra or [])


def _area(entities, devices, entry) -> str | None:
    if entry is None:
        return None
    if entry.area_id:
        return entry.area_id
    device = devices.async_get(entry.device_id) if entry.device_id else None
    return device.area_id if device else None


def discover(hass: HomeAssistant, profiles: list[Profile], settings: dict) -> Found:
    entities, devices, areas = er.async_get(hass), dr.async_get(hass), ar.async_get(hass)
    off_ext = {k for k, v in (settings.get("extensions") or {}).items() if v is False}
    found = Found(room_names={a.id: a.name for a in areas.async_list_areas()})
    found.installed = {d: d in hass.config.components for d in
                       (VT, SCHEDULER, PELLETS, "hestia_weather", "hestia_energy", "hestia_comfort",
                        *(p.integration for p in profiles))}
    # 1. The stove: the first device of a profile's integration whose entities give the profile's state.
    stove_platforms = {p.integration for p in profiles}
    for profile in profiles:
        if profile.id in off_ext or profile.integration in off_ext:
            continue
        by_device: dict[str, list[dict]] = {}
        for entry in entities.entities.values():
            if entry.platform == profile.integration and entry.device_id and not entry.disabled_by:
                by_device.setdefault(entry.device_id, []).append({"entity_id": entry.entity_id, "unique_id": entry.unique_id})
        from .engine.profiles import match
        for device_id, ents in by_device.items():
            roles = match(profile, ents)
            if "etat" not in roles:
                continue
            device = devices.async_get(device_id)
            found.stove = {"profile": profile, "roles": roles, "entities": [e["entity_id"] for e in ents],
                           "device_id": device_id,
                           "device": {"name": (device.name_by_user if device else None) or "Poêle",
                                      "maker": device.manufacturer if device else None,
                                      "model": device.model if device else None,
                                      "room": device.area_id if device else None}}
            break
        if found.stove:
            break
    # 2. The thermostats: every climate with a room temperature, but the stove's own and those a Versatile Thermostat
    # drives (counted once, through it).
    driven: set[str] = set()
    for state in hass.states.async_all("climate"):
        driven |= {e for e in sources.underlying(state.attributes) if e.startswith("climate.")}
    for state in hass.states.async_all("climate"):
        entry = entities.async_get(state.entity_id)
        platform = entry.platform if entry else None
        if state.entity_id in driven or platform in stove_platforms:
            continue
        if entry is not None and (entry.disabled_by or entry.hidden_by and platform != VT):
            continue
        if platform == VT and VT in off_ext:
            continue
        if platform != VT and state.attributes.get("current_temperature") is None:
            continue
        found.climates.append({"entity_id": state.entity_id, "platform": platform, "room": _area(entities, devices, entry)})
    # 3. The stove's plug: chosen in Réglages, else a power sensor named after the stove, off the stove's device.
    stove_device = (found.stove or {}).get("device_id")
    for state in hass.states.async_all("sensor"):
        a = state.attributes
        if PELLET_KEY in a and PELLETS not in off_ext and a[PELLET_KEY] not in found.pellets:
            found.pellets[str(a[PELLET_KEY])] = state.entity_id
        if a.get("device_class") != "power" or not found.stove:
            continue
        entry = entities.async_get(state.entity_id)
        if entry is not None and entry.device_id == stove_device:
            continue
        device = devices.async_get(entry.device_id) if entry and entry.device_id else None
        label = " ".join(x for x in (state.entity_id, a.get("friendly_name"), device and (device.name_by_user or device.name)) if x)
        found.plugs.append({"entity_id": state.entity_id, "nom": a.get("friendly_name") or state.entity_id,
                            "poele": bool(sources.STOVE_NAME.search(label))})
    chosen = settings.get("poele_prise")
    if found.stove:
        found.plug = chosen if chosen and hass.states.get(chosen) else next(
            (p["entity_id"] for p in found.plugs if p["poele"]), None)
    # 4. The schedules (Scheduler) and the Workday sensor.
    if SCHEDULER not in off_ext:
        for entry in entities.entities.values():
            if entry.platform == SCHEDULER and entry.domain == "switch" and not entry.disabled_by:
                found.schedules.append(entry.entity_id)
        if not found.schedules:
            found.schedules = [s.entity_id for s in hass.states.async_all("switch")
                               if s.entity_id.startswith("switch.schedule_") and "timeslots" in s.attributes]
    found.workday = next((e.entity_id for e in entities.entities.values()
                          if e.platform == WORKDAY and e.domain == "binary_sensor" and not e.disabled_by), None)
    return found


def _state(hass: HomeAssistant, entity_id: str | None) -> dict | None:
    state = hass.states.get(entity_id) if entity_id else None
    if state is None:
        return None
    return {"entity_id": entity_id, "state": state.state, "attributes": dict(state.attributes),
            "last_changed": dt_util.as_local(state.last_changed)}


def snapshot(hass: HomeAssistant, found: Found, settings: dict, hourly: list[dict] | None = None) -> dict:
    """The plain dictionary engine.house.build() works on: the states of what was found, now."""
    climates, window_since = [], {}
    for c in found.climates:
        state = hass.states.get(c["entity_id"])
        if state is None:
            continue
        attrs = state.attributes
        climates.append({"entity_id": c["entity_id"], "state": state.state, "attributes": attrs, "platform": c["platform"],
                         "room": c["room"], "name": attrs.get("friendly_name") or c["entity_id"]})
        window = attrs.get("window_manager")
        sensor = window.get("window_sensor_entity_id") if isinstance(window, dict) else None
        if sensor and (ws := hass.states.get(sensor)) is not None:
            window_since[sensor] = dt_util.as_local(ws.last_changed)
    stove = None
    if found.stove:
        roles = {role: s for role, e in found.stove["roles"].items() if (s := _state(hass, e)) is not None}
        stove = {**found.stove, "roles": roles}
    plug = None
    if found.plug and (p := hass.states.get(found.plug)) is not None:
        try:
            plug = {"entity_id": found.plug, "w": float(p.state)}
        except (TypeError, ValueError):
            plug = {"entity_id": found.plug, "w": None}
    pellets = {role: s for role, e in found.pellets.items() if (s := _state(hass, e)) is not None}
    schedules = []
    for entity_id in found.schedules:
        state = hass.states.get(entity_id)
        if state is None:
            continue
        parsed = planning.parse(entity_id, state.attributes.get("friendly_name") or entity_id, state.state, state.attributes)
        if parsed:
            schedules.append(parsed)
    workday = None
    if found.workday and (w := hass.states.get(found.workday)) is not None and w.state in ("on", "off"):
        workday = w.state == "on"
    return {
        "now": dt_util.now(),
        "climates": climates,
        "window_since": window_since,
        "stove": stove,
        "stove_thermostat": settings.get("poele_thermostat"),
        "disabled": [k for k, v in (settings.get("sources") or {}).items() if v is False],
        "plug": plug,
        "pellets": pellets,
        "schedules": schedules,
        "workday": workday,
        "room_names": found.room_names,
        "hourly": hourly,
    }


# --- What the other Hestia bricks give (their public interfaces, never their insides) ----------------------------

def weather_api(hass: HomeAssistant):
    """Hestia Weather's interface when it speaks the version this brick knows, else None (absent or another version)."""
    api = hass.data.get(WEATHER_API)
    return api if api is not None and getattr(api, "version", None) == WEATHER_API_VERSION else None


def weather_place(hass: HomeAssistant, chosen: str | None = None) -> dict:
    """Which Hestia Weather place gives the cold outside: `etat` « oui », « non » (not installed), « incompatible »
    (another version of its interface) or « sans_lieu »; `lieu`, `nom`, and every place in `lieux`."""
    out = {"etat": "non", "lieu": None, "nom": None, "lieux": []}
    api = hass.data.get(WEATHER_API)
    if api is None:
        return out
    if getattr(api, "version", None) != WEATHER_API_VERSION:
        return {**out, "etat": "incompatible"}
    try:
        places = [{"id": p["entry_id"], "nom": p.get("title") or ""} for p in api.places()]
    except Exception as err:  # noqa: BLE001 - another brick's trouble never stops this one
        _LOGGER.debug("Hestia Weather's places unavailable: %s", err)
        places = []
    if not places:
        return {**out, "etat": "sans_lieu"}
    place = next((p for p in places if chosen and p["id"] == chosen), places[0])
    return {"etat": "oui", "lieu": place["id"], "nom": place["nom"], "lieux": places}


def weather_hourly(hass: HomeAssistant, place: str | None) -> list[dict] | None:
    api = weather_api(hass)
    if api is None or not place:
        return None
    try:
        return api.hourly(place)
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Hestia Weather's forecast unavailable: %s", err)
        return None


def weather_listen(hass: HomeAssistant, place: str | None, update: Callable[[], None]) -> Callable[[], None]:
    """Listens to this Hestia Weather place, saying who listens: Weather's settings then show Chauffage linked to it."""
    api = weather_api(hass)
    if api is None or not place:
        return lambda: None
    try:
        return api.add_listener(place, update, brick=BRICK)
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Hestia Weather not listened to: %s", err)
        return lambda: None


async def day_history(hass: HomeAssistant, start: datetime, end: datetime, wanted: list[tuple[str, str, str | None]]) -> dict:
    """{name: [(datetime, value)]} for each (name, entity_id, attribute) since `start`: read in the recorder's executor,
    compacted by the socle's recorder_history (one day of one entity at a time)."""
    from homeassistant.components.recorder import get_instance

    from . import recorder_history

    def read():
        out = {}
        for name, entity_id, attribute in wanted:
            rows = recorder_history.read(hass, start, end, [entity_id], attribute).get(entity_id, [])
            points = []
            for row in rows:
                raw = row.attributes.get(attribute) if attribute else row.state
                try:
                    value = float(raw)
                except (TypeError, ValueError):
                    value = None
                points.append((dt_util.as_local(max(row.last_changed, start)), value))
            out[name] = points
        return out

    try:
        return await get_instance(hass).async_add_executor_job(read)
    except Exception as err:  # noqa: BLE001 - no recorder, or a database hiccup: no curve, never an error
        _LOGGER.debug("Day history unavailable: %s", err)
        return {}
