"""Everything Hestia Heating reads from Home Assistant, and nothing it writes: the registries, the states, the other
bricks' public interfaces. The engine (engine/) gets plain dictionaries from here and never touches Home Assistant.

Two moments: `discover()` walks the registries once (at start, and again when an entity, a device or a room changes) to
find the thermostats, the stove and its profile, the plug, Suivi Stock Pellet and the schedules; `snapshot()` then reads
only the states of what was found, on every change.
"""
from __future__ import annotations

import logging
import re
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta

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
REMOTE = "remote_homeassistant"
# A sensor that gives the temperature of the whole house (the stove's automations often have one).
HOUSE_NAME = re.compile(r"maison|moyenne|logement|house|home|average|mean", re.I)
# A switch that asks for the lowest flame.
LOW_NAME = re.compile(r"flamme|flame|po[eê]le|stove|eco|silence", re.I)
WEATHER_API = "hestia_weather_api"
WEATHER_API_VERSION = 1      # the version of Hestia Weather's interface this brick speaks
BRICK = "hestia_heating"     # said to Hestia Weather when listening, so that its settings show this brick linked
ENERGY_API = "hestia_energy_api"
ENERGY_API_VERSION = 1       # the version of Hestia Énergie's interface this brick reads (its prices only)


@dataclass
class Found:
    """What `discover()` found: entity ids only, read again by `snapshot()` on every change."""
    climates: list[dict] = field(default_factory=list)      # {entity_id, platform, room, vt, energie}
    stove: dict | None = None                                # {profile, device, roles: {role: entity_id}, entities}
    plug: str | None = None
    plugs: list[dict] = field(default_factory=list)          # every power sensor that could be the stove's plug
    plug_switch: str | None = None                           # the switch that cuts the stove's plug (the whole pilot)
    plug_switches: list[dict] = field(default_factory=list)  # every switch that could be it
    thermometers: list[dict] = field(default_factory=list)   # every temperature sensor the pilot could read the house on
    house_sensor: str | None = None                          # the one chosen in Réglages (else: the average of the rooms)
    switches: list[dict] = field(default_factory=list)       # every input_boolean that could ask for the lowest flame
    low_switch: str | None = None                            # the one chosen in Réglages
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
        out |= {e for e in (self.plug, self.workday, self.house_sensor, self.low_switch, self.plug_switch) if e}
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
                           # The stove integration's own entry: its options say how many orders a day it lets through.
                           "entry_id": _entry_of(hass, device, profile.integration),
                           "device": {"name": (device.name_by_user if device else None) or "Poêle",
                                      "maker": device.manufacturer if device else None,
                                      "model": device.model if device else None,
                                      "room": device.area_id if device else None}}
            break
        if found.stove:
            break
    if not found.stove:
        for profile in profiles:
            if profile.id in off_ext or profile.integration in off_ext:
                continue
            found.stove = _stove_by_ids(hass, profile)
            if found.stove:
                break
    stove_ids = set((found.stove or {}).get("entities") or ())
    # 2. The thermostats: every climate with a room temperature, but the stove's own and those a Versatile Thermostat
    # drives (counted once, through it).
    driven: set[str] = set()
    for state in hass.states.async_all("climate"):
        driven |= {e for e in sources.underlying(state.attributes) if e.startswith("climate.")}
    for state in hass.states.async_all("climate"):
        entry = entities.async_get(state.entity_id)
        platform = entry.platform if entry else None
        vt = sources.is_vt(platform, state.attributes)
        if state.entity_id in driven or platform in stove_platforms or state.entity_id in stove_ids:
            continue
        if entry is not None and (entry.disabled_by or entry.hidden_by and not vt):
            continue
        if vt and VT in off_ext:
            continue
        if not vt and state.attributes.get("current_temperature") is None:
            continue
        found.climates.append({"entity_id": state.entity_id, "platform": platform, "room": _area(entities, devices, entry),
                               "vt": vt})
    # 2b. Each thermostat's energy counter (kWh, kept as a statistic, read by Hestia Énergie): an energy sensor of
    # the thermostat's device, else one whose id starts with the thermostat's (« sensor.vt_bureau_energy », a copy).
    _energy_counters(hass, entities, found.climates)
    # 3. The stove's plug: chosen in Réglages, else a power sensor named after the stove (a plug first), off the
    # stove's device and not one of a thermostat's own sensors (« sensor.thermostat_poele_mean_power_cycle »).
    stove_device = (found.stove or {}).get("device_id")
    climate_stems = tuple(s.entity_id.split(".", 1)[1] + "_" for s in hass.states.async_all("climate"))
    for state in hass.states.async_all("sensor"):
        a = state.attributes
        if PELLET_KEY in a and PELLETS not in off_ext and a[PELLET_KEY] not in found.pellets:
            found.pellets[str(a[PELLET_KEY])] = state.entity_id
        if not found.stove:
            continue
        if a.get("device_class") == "temperature":
            entry = entities.async_get(state.entity_id)
            if state.entity_id in stove_ids or stove_device and entry is not None and entry.device_id == stove_device:
                continue
            label = f"{state.entity_id} {a.get('friendly_name') or ''}"
            found.thermometers.append({"entity_id": state.entity_id, "nom": a.get("friendly_name") or state.entity_id,
                                       "maison": bool(HOUSE_NAME.search(label))})
            continue
        if a.get("device_class") != "power":
            continue
        entry = entities.async_get(state.entity_id)
        if state.entity_id in stove_ids or stove_device and entry is not None and entry.device_id == stove_device:
            continue
        if entry is not None and entry.platform == VT or state.entity_id.split(".", 1)[1].startswith(climate_stems):
            continue
        device = devices.async_get(entry.device_id) if entry and entry.device_id else None
        label = " ".join(x for x in (state.entity_id, a.get("friendly_name"), device and (device.name_by_user or device.name)) if x)
        found.plugs.append({"entity_id": state.entity_id, "nom": a.get("friendly_name") or state.entity_id,
                            "poele": bool(sources.STOVE_NAME.search(label)), "prise": bool(sources.PLUG_NAME.search(label))})
    found.thermometers.sort(key=lambda t: (not t["maison"], t["nom"].casefold()))
    # The house's temperature for the pilot: the sensor chosen in Réglages (the one the stove's automations read).
    found.house_sensor = settings.get("pilote_thermometre") if found.stove else None
    # The switch that asks for the lowest flame (the house's « force flamme 1 »), and the stove copied from another
    # house (a lab), which is never sent anything.
    if found.stove:
        found.switches = sorted(({"entity_id": s.entity_id, "nom": s.attributes.get("friendly_name") or s.entity_id,
                                  "flamme": bool(LOW_NAME.search(f"{s.entity_id} {s.attributes.get('friendly_name') or ''}"))}
                                 for s in hass.states.async_all("input_boolean")),
                                key=lambda x: (not x["flamme"], x["nom"].casefold()))
        found.low_switch = settings.get("pilote_flamme_basse")
        platforms = {(entities.async_get(e).platform if entities.async_get(e) else None)
                     for e in found.stove["roles"].values()}
        found.stove["copie"] = not found.stove.get("device_id") or REMOTE in platforms
    chosen = settings.get("poele_prise")
    if found.stove:
        named = [p for p in found.plugs if p["poele"]]
        found.plug = chosen if chosen and hass.states.get(chosen) else next(
            (p["entity_id"] for p in sorted(named, key=lambda p: not p["prise"])), None)
        _plug_switch(hass, entities, found, settings.get("poele_prise_switch"))
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


def _plug_switch(hass: HomeAssistant, entities, found: Found, chosen: str | None) -> None:
    """The switch that cuts the stove's plug, for the whole pilot's last resort: the one chosen in Réglages, else the
    switch of the plug's own device, else the one named like the plug (« sensor.prise_granules_power » →
    « switch.prise_granules »). Never the stove's own switches (ECO Stop) nor a schedule's."""
    stove_ids = set((found.stove or {}).get("entities") or ())
    stove_device = (found.stove or {}).get("device_id")
    candidates = []
    for s in hass.states.async_all("switch"):
        entry = entities.async_get(s.entity_id)
        if s.entity_id in stove_ids or (stove_device and entry is not None and entry.device_id == stove_device):
            continue
        if (entry is not None and entry.platform == SCHEDULER) or "timeslots" in s.attributes:
            continue
        label = f"{s.entity_id} {s.attributes.get('friendly_name') or ''}"
        candidates.append({"entity_id": s.entity_id, "nom": s.attributes.get("friendly_name") or s.entity_id,
                           "poele": bool(sources.STOVE_NAME.search(label)), "prise": bool(sources.PLUG_NAME.search(label)),
                           "device_id": entry.device_id if entry else None})
    candidates.sort(key=lambda c: (not c["poele"], not c["prise"], c["nom"].casefold()))
    found.plug_switches = [{k: c[k] for k in ("entity_id", "nom", "poele")} for c in candidates if c["poele"] or c["prise"]]
    if chosen and hass.states.get(chosen) is not None:
        found.plug_switch = chosen
        return
    if not found.plug:
        return
    plug_entry = entities.async_get(found.plug)
    same = [c for c in candidates if plug_entry is not None and plug_entry.device_id and c["device_id"] == plug_entry.device_id]
    if len(same) == 1:
        found.plug_switch = same[0]["entity_id"]
        return
    stem = found.plug.split(".", 1)[1]
    for end in ("_power", "_puissance", "_current_power", "_watts", "_w"):
        if stem.endswith(end):
            stem = stem[: -len(end)]
            break
    found.plug_switch = next((c["entity_id"] for c in candidates if c["entity_id"] == f"switch.{stem}"), None)


def _energy_counters(hass: HomeAssistant, entities, climates: list[dict]) -> None:
    on_device: dict[str, list[str]] = {}
    counters: list[str] = []
    for state in hass.states.async_all("sensor"):
        a = state.attributes
        if a.get("device_class") != "energy" or a.get("state_class") not in ("total", "total_increasing"):
            continue
        entry = entities.async_get(state.entity_id)
        if entry is not None and entry.disabled_by:
            continue
        counters.append(state.entity_id)
        if entry is not None and entry.device_id:
            on_device.setdefault(entry.device_id, []).append(state.entity_id)
    for c in climates:
        stem = c["entity_id"].split(".", 1)[1] + "_"
        entry = entities.async_get(c["entity_id"])
        mine = on_device.get(entry.device_id, []) if entry is not None and entry.device_id else []
        named = [e for e in counters if e.split(".", 1)[1].startswith(stem)]
        pick = [e for e in mine if e in named] or (mine if len(mine) == 1 else []) or named
        # « sensor.salon_energy » before « sensor.salon_test_energy »: the shortest id is the thermostat's own.
        c["energie"] = min(pick, key=len) if pick else None


def _stove_by_ids(hass: HomeAssistant, profile: Profile) -> dict | None:
    """A stove copied without its device (Remote Home Assistant, as in a lab that copies a home): found by the ids of
    its entities alone, when one stem carries the profile's state and flame, and its smoke or its alarm
    (« sensor.poele_status », « number.poele_power », « sensor.poele_smoke_temperature »). Its other roles are the
    entities of the same domains whose id holds that stem; its climates are those whose id starts with it."""
    roles = profile.roles

    def spec(role: str) -> tuple[str | None, str | None]:
        r = roles.get(role) or {}
        return r.get("domaine"), r.get("fin")

    status_domain, status_end = spec("etat")
    flame_domain, flame_end = spec("flamme")
    if not (status_domain and status_end and flame_domain and flame_end):
        return None
    domains = {r.get("domaine") for r in roles.values()} | {"climate"}
    ids = sorted(s.entity_id for s in hass.states.async_all() if s.domain in domains)
    known = set(ids)
    for status in ids:
        if not (status.startswith(status_domain + ".") and status.endswith(status_end)):
            continue
        stem = status.split(".", 1)[1][: -len(status_end)]
        if len(stem) < 3 or f"{flame_domain}.{stem}{flame_end}" not in known:
            continue
        if not any(d and e and f"{d}.{stem}{e}" in known for d, e in (spec("fumees"), spec("alarme"))):
            continue
        mine = [{"entity_id": i} for i in ids if stem in i.split(".", 1)[1]]
        from .engine.profiles import match
        found_roles = match(profile, [e for e in mine if not e["entity_id"].startswith("climate.")
                                      or e["entity_id"].split(".", 1)[1].startswith(stem)])
        climates = [i for i in ids if i.startswith("climate.") and i.split(".", 1)[1].startswith(stem)]
        principal = hass.states.get(found_roles["thermostat"]) if found_roles.get("thermostat") else None
        name = (principal.attributes.get("friendly_name") if principal else None) or "Poêle"
        return {"profile": profile, "roles": found_roles, "device_id": None,
                "entities": sorted(set(found_roles.values()) | set(climates)),
                "device": {"name": name[:1].upper() + name[1:],
                           "maker": None, "model": None, "room": None}}
    return None


def _celsius(state) -> float | None:
    """A temperature sensor's value in °C, or None when it says nothing readable."""
    try:
        value = float(state.state)
    except (AttributeError, TypeError, ValueError):
        return None
    if state.attributes.get("unit_of_measurement") == "°F":
        value = (value - 32) / 1.8
    return round(value, 1) if -40 <= value <= 60 else None


def _state(hass: HomeAssistant, entity_id: str | None) -> dict | None:
    state = hass.states.get(entity_id) if entity_id else None
    if state is None:
        return None
    return {"entity_id": entity_id, "state": state.state, "attributes": dict(state.attributes),
            "last_changed": dt_util.as_local(state.last_changed),
            "last_updated": dt_util.as_local(state.last_updated)}


def _entry_of(hass: HomeAssistant, device, domain: str) -> str | None:
    """The config entry of `domain` the device belongs to (`config_entry_id` on recent Home Assistant, else the older
    set of entries)."""
    if device is None:
        return None
    one = getattr(device, "config_entry_id", None)
    ids = [one] if one else list(getattr(device, "config_entries", None) or ())
    return next((eid for eid in ids if (ce := hass.config_entries.async_get_entry(eid)) is not None
                 and ce.domain == domain), None)


def _writes_cap(hass: HomeAssistant, stove: dict) -> int | None:
    """The daily orders the stove integration lets through, read in its options (the profile names the option), or
    None: the profile's own figure then."""
    option = stove["profile"].limits.get("option_ecritures")
    entry = hass.config_entries.async_get_entry(stove["entry_id"]) if option and stove.get("entry_id") else None
    if entry is None:
        return None
    try:
        cap = int(float(entry.options.get(option, entry.data.get(option))))
    except (TypeError, ValueError):
        return None
    return cap if cap > 0 else None


def snapshot(hass: HomeAssistant, found: Found, settings: dict, hourly: list[dict] | None = None) -> dict:
    """The plain dictionary engine.house.build() works on: the states of what was found, now."""
    climates, window_since = [], {}
    for c in found.climates:
        state = hass.states.get(c["entity_id"])
        if state is None:
            continue
        attrs = state.attributes
        climates.append({"entity_id": c["entity_id"], "state": state.state, "attributes": attrs, "platform": c["platform"],
                         "room": c["room"], "name": attrs.get("friendly_name") or c["entity_id"], "energie": c.get("energie"),
                         # When it last said something (the panel's « Vos appareils », 1.0.0b3).
                         "vu": dt_util.as_local(state.last_updated).isoformat()})
        window = attrs.get("window_manager")
        sensor = window.get("window_sensor_entity_id") if isinstance(window, dict) else None
        if sensor and (ws := hass.states.get(sensor)) is not None:
            window_since[sensor] = dt_util.as_local(ws.last_changed)
    stove = None
    if found.stove:
        roles = {role: s for role, e in found.stove["roles"].items() if (s := _state(hass, e)) is not None}
        stove = {**found.stove, "roles": roles, "ecritures_max": _writes_cap(hass, found.stove)}
    plug = None
    if found.plug and (p := hass.states.get(found.plug)) is not None:
        try:
            plug = {"entity_id": found.plug, "w": float(p.state)}
        except (TypeError, ValueError):
            plug = {"entity_id": found.plug, "w": None}
    low = None
    if found.low_switch:
        t = hass.states.get(found.low_switch)
        low = {"entity_id": found.low_switch, "nom": (t.attributes.get("friendly_name") if t else None)
               or found.low_switch, "on": bool(t and t.state == "on")}
    # The plug's switch, for the card's « Prise » (0.8): on, off, or None when unknown.
    plug_switch = None
    if found.plug_switch and (t := hass.states.get(found.plug_switch)) is not None:
        plug_switch = {"entity_id": found.plug_switch, "on": None if t.state not in ("on", "off") else t.state == "on"}
    house_sensor = None
    if found.house_sensor:
        t = hass.states.get(found.house_sensor)
        house_sensor = {"entity_id": found.house_sensor, "nom": (t.attributes.get("friendly_name") if t else None)
                        or found.house_sensor, "c": _celsius(t)}
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
        "house_sensor": house_sensor,
        "flamme_basse": low,
        "prise_switch": plug_switch,
        "pellets": pellets,
        "schedules": schedules,
        "workday": workday,
        # Copied from another Home Assistant (Remote Home Assistant, a lab): read, never sent anything.
        "copies": [c["entity_id"] for c in found.climates if c["platform"] == REMOTE],
        "room_names": found.room_names,
        "hourly": hourly,
    }


# --- What the other Hestia bricks give (their public interfaces, never their insides) ----------------------------

def weather_api(hass: HomeAssistant):
    """Hestia Weather's interface when it speaks the version this brick knows, else None (absent or another version)."""
    api = hass.data.get(WEATHER_API)
    return api if api is not None and getattr(api, "version", None) == WEATHER_API_VERSION else None


def energy_prices(hass: HomeAssistant, hours: list[datetime]) -> list[dict | None] | None:
    """Hestia Énergie's price of a kWh at the start of each of these hours (1.0.0b8, the cards' « Argent »):
    [{price, period, color}] by its interface v1 (`tariff`), or None when it is absent, of another version, or has
    no contract. Only its prices are read, never its settings. A Tempo colour is the one of today (v1 gives no other)."""
    api = hass.data.get(ENERGY_API)
    if api is None or getattr(api, "version", None) != ENERGY_API_VERSION:
        return None
    try:
        if api.tariff() is None:
            return None
        out = []
        for at in hours:
            # 1.0.1b1: an hour Hestia Énergie cannot price is an hour without a price (its day without euros), never
            # the end of all its prices.
            try:
                t = api.tariff(at)
            except Exception as err:  # noqa: BLE001 - another brick's trouble never stops this one
                _LOGGER.debug("Hestia Énergie has no price for %s: %s", at, err)
                t = None
            out.append({"price": t.get("price"), "period": t.get("period"), "color": t.get("color")} if t else None)
        return out
    except Exception as err:  # noqa: BLE001 - another brick's trouble never stops this one
        _LOGGER.debug("Hestia Énergie's prices unavailable: %s", err)
        return None


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


def day_points(rows: list, attribute: str | None, start: datetime, text: bool = False) -> list[tuple]:
    """[(datetime, value)] of recorded rows. A row is placed when it was written (`last_updated`): a thermostat's
    temperature and set point are attributes, and an attribute that changes leaves `last_changed` (the state, « heat »)
    where it was, often days before: every point of the day then fell at midnight and the curve was a vertical line."""
    points = []
    for row in rows:
        raw = row.attributes.get(attribute) if attribute else row.state
        if text:
            value = raw
        else:
            try:
                value = float(raw)
            except (TypeError, ValueError):
                value = None
        points.append((dt_util.as_local(max(row.last_updated, start)), value))
    return points


async def day_history(hass: HomeAssistant, start: datetime, end: datetime, wanted: list[tuple[str, str, str | None]],
                      text: tuple[str, ...] = ()) -> dict:
    """{name: [(datetime, value)]} for each (name, entity_id, attribute) since `start`: read in the recorder's executor,
    compacted by the socle's recorder_history (one day of one entity at a time). The series named in `text` keep
    their raw text (a stove's state), the others are numbers."""
    from homeassistant.components.recorder import get_instance

    from . import recorder_history

    def read():
        return {name: day_points(recorder_history.read(hass, start, end, [entity_id], attribute).get(entity_id, []),
                                 attribute, start, name in text)
                for name, entity_id, attribute in wanted}

    try:
        return await get_instance(hass).async_add_executor_job(read)
    except Exception as err:  # noqa: BLE001 - no recorder, or a database hiccup: no curve, never an error
        _LOGGER.debug("Day history unavailable: %s", err)
        return {}


# The units the long-term statistics are asked in, by the unit the cards show.
STAT_UNITS = {"kWh": {"energy": "kWh"}, "kg": {"mass": "kg"}}
FACTORS = {"Wh": 0.001, "kWh": 1.0, "MWh": 1000.0, "g": 0.001, "kg": 1.0}


async def _counter(hass: HomeAssistant, stat: str, unit: str, start: datetime, now: datetime,
                   period: str) -> tuple[list[tuple[datetime, float]], float | None]:
    """A counter's long-term statistics (`total_increasing`: kWh, kg) since `start`, one row a `period` (« hour »,
    « day »), read in the recorder's executor: [(local start of the row, what it moved)], and what the counter moved
    since its last statistic, read from its state now (None when unknown). No rows when it has no statistics."""
    from homeassistant.components.recorder import get_instance
    from homeassistant.components.recorder.statistics import statistics_during_period

    def read():
        return statistics_during_period(hass, start, now, {stat}, period, STAT_UNITS.get(unit), {"change", "state"})

    try:
        rows = (await get_instance(hass).async_add_executor_job(read)).get(stat) or []
    except Exception as err:  # noqa: BLE001 - no recorder, or a database hiccup: no history, never an error
        _LOGGER.debug("Statistics unavailable for %s: %s", stat, err)
        return [], None
    out: list[tuple[datetime, float]] = []
    last_state = None
    for row in rows:
        begin = row.get("start")
        when = (dt_util.as_local(dt_util.utc_from_timestamp(begin)) if isinstance(begin, (int, float))
                else dt_util.as_local(begin))
        out.append((when, round(max(0.0, float(row.get("change") or 0.0)), 3)))
        if row.get("state") is not None:
            last_state = float(row["state"])
    current = hass.states.get(stat)
    factor = FACTORS.get((current.attributes.get("unit_of_measurement") if current else None) or unit)
    try:
        value = float(current.state) * factor if current is not None and factor is not None else None
    except (TypeError, ValueError):
        value = None
    moved = round(value - last_state, 3) if value is not None and last_state is not None and value >= last_state \
        else None
    return out, moved


async def daily_totals(hass: HomeAssistant, stat: str, unit: str, start: datetime, now: datetime) -> dict[str, float]:
    """{« 2026-11-24 »: total of the day} of a counter since `start`, from its daily statistics. Today's total adds
    what the counter moved since its last hourly statistic. Empty when the counter has no statistics."""
    rows, moved = await _counter(hass, stat, unit, start, now, "day")
    out = {when.date().isoformat(): change for when, change in rows}
    if rows and moved is not None:
        today = now.date().isoformat()
        out[today] = round(out.get(today, 0.0) + moved, 3)
    return out


async def hourly_totals(hass: HomeAssistant, stat: str, unit: str, start: datetime,
                        now: datetime) -> list[tuple[datetime, float]]:
    """[(local start of the hour, what the counter moved in it)] since `start`, from its hourly statistics (the
    clock's hours). What it moved since its last statistic goes to the hour after it, when that hour has begun (the
    statistics of an hour are written a few minutes after it ends). Empty when the counter has no statistics."""
    rows, moved = await _counter(hass, stat, unit, start, now, "hour")
    if rows and moved is not None:
        following = rows[-1][0] + timedelta(hours=1)
        if following <= now:
            rows.append((following, moved))
    return rows


# --- A past day of the house, for its journal (1.1.0b1) -----------------------------------------------------------

def _climate_values(state) -> dict:
    """What the journal keeps of one recorded state of a thermostat: its temperature, its set point (none while off),
    whether it heats, and the cold outside it knows (Versatile Thermostat)."""
    attrs = state.attributes or {}
    specific = attrs.get("specific_states") if isinstance(attrs.get("specific_states"), dict) else {}

    def number(value):
        try:
            return None if value is None else float(value)
        except (TypeError, ValueError):
            return None
    off = state.state in ("off", "unavailable", "unknown")
    action = attrs.get("hvac_action")
    if action is None:
        demand = number(attrs.get("power_percent"))
        heats = bool(demand and demand > 0)
    else:
        heats = action == "heating"
    return {"t": number(attrs.get("current_temperature")), "c": None if off else number(attrs.get("temperature")),
            "chauffe": heats and not off,
            "dehors": number(specific.get("ext_current_temperature", attrs.get("ext_current_temperature")))}


async def past_day(hass: HomeAssistant, start: datetime, end: datetime, climates: list[str],
                   texts: list[str]) -> tuple[dict[str, list[tuple[datetime, dict]]], dict[str, list[tuple[datetime, str]]]]:
    """One day of the thermostats (their values at each recorded state, the state before `start` first) and of a few
    text entities (the stove's state), read in the recorder's executor one entity at a time; only what the journal
    keeps is held. Empty when there is no recorder."""
    from homeassistant.components.recorder import get_instance, history

    def read():
        values: dict[str, list[tuple[datetime, dict]]] = {}
        words: dict[str, list[tuple[datetime, str]]] = {}
        for entity_id in climates:
            states = history.get_significant_states(hass, start, end, [entity_id], None, True, False, False, False)
            values[entity_id] = [(dt_util.as_local(s.last_updated), _climate_values(s))
                                 for s in states.get(entity_id, [])]
            del states
        for entity_id in texts:
            states = history.get_significant_states(hass, start, end, [entity_id], None, True, False, False, True)
            words[entity_id] = [(dt_util.as_local(s.last_changed), s.state) for s in states.get(entity_id, [])]
            del states
        return values, words

    try:
        return await get_instance(hass).async_add_executor_job(read)
    except Exception as err:  # noqa: BLE001 - no recorder, or a database hiccup: no day, never an error
        _LOGGER.debug("Past day unavailable: %s", err)
        return {}, {}


async def hourly_rows(hass: HomeAssistant, stat: str, unit: str, start: datetime,
                      end: datetime) -> list[tuple[datetime, float]]:
    """A counter's hourly statistics between `start` and `end` (a past day): no « since the last statistic »."""
    rows, _ = await _counter(hass, stat, unit, start, end, "hour")
    return rows
