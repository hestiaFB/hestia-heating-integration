"""The brick's heart: what was found, the latest view of the house, and who listens to it.

Cheap by design (rule 7 of CLAUDE.md): the registries are walked again only when an entity, a device or a room
changes; the states of the few dozen entities found are listened to, and one change rebuilds the view after a short
pause that gathers a burst of changes (a Versatile Thermostat writes several attributes at once). The view itself is
plain Python on dictionaries (engine/house.py), well under a millisecond.
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta
from pathlib import Path

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Context, CoreState, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import reader
from .const import API_KEY, PLANNING_STATE_KEY, STORE_KEY, STORE_VERSION, VERSION
from .engine import home_planning, house, phrases, profiles

_LOGGER = logging.getLogger(__name__)

# A burst of changes is gathered for this long before the view is rebuilt.
PAUSE_S = 1.0
# The registries changed: walked again after this pause (a reload adds and removes many entities at once).
DISCOVER_PAUSE_S = 5.0
# The sentences say « in 12 min », « until 22 h 30 »: rebuilt each minute even when nothing changes.
TICK = timedelta(minutes=1)
# A day's curve read from the recorder is kept this long.
DAY_CACHE_S = 120
DEFAULTS = {"sources": {}, "extensions": {}, "poele_thermostat": None, "poele_prise": None, "weather_place": None,
            "planning": None}
# What became of a slot of the planning Hestia, as the journal says it.
FATE = {"envoye": "envoyé", "deja": "déjà réglé", "ombre": "à l’ombre", "bloque": "bloqué par Scheduler",
        "recopie": "thermostat recopié, jamais commandé", "eteint": "thermostat éteint, laissé tel quel",
        "sans_prereglage": "préréglage absent du thermostat"}
JOURNAL_MAX = 60


class HeatingCoordinator:
    def __init__(self, hass: HomeAssistant, entry) -> None:
        self.hass = hass
        self.entry = entry
        self.store = Store(hass, STORE_VERSION, STORE_KEY)
        # The last slot of the planning Hestia dealt with, per lane: a slot that starts later is sent (or caught up).
        self.state_store = Store(hass, 1, PLANNING_STATE_KEY)
        self.applied: dict[str, dict] = {}
        self.journal: list[dict] = []
        self.settings: dict = dict(DEFAULTS)
        self.model: dict = home_planning.default()
        self.profiles: list[profiles.Profile] = []
        self.found = reader.Found()
        self.weather: dict = {"etat": "non"}
        self.data: dict = {"pret": False}
        self._listeners: list = []
        self._stop_listeners: list = []
        self._unsubs: list = []
        self._tracked: set[str] = set()
        self._track_unsub = None
        self._weather_unsub = None
        self._energy_unsub = None
        self._pending = None
        self._discover_pending = None
        self._days: dict[str, tuple[float, dict]] = {}
        self.last_build_ms: float | None = None

    # --- listeners -----------------------------------------------------------------------------------------------

    def add_listener(self, update):
        self._listeners.append(update)

        def remove():
            if update in self._listeners:
                self._listeners.remove(update)
        return remove

    def add_stop_listener(self, stopped):
        """Called once when the brick stops (reloaded, removed): the cards then follow the new one."""
        self._stop_listeners.append(stopped)

        def remove():
            if stopped in self._stop_listeners:
                self._stop_listeners.remove(stopped)
        return remove

    def _notify(self) -> None:
        for update in list(self._listeners):
            update()

    # --- life ----------------------------------------------------------------------------------------------------

    async def async_prepare(self) -> None:
        stored = await self.store.async_load() or {}
        self.settings = {**DEFAULTS, **{k: v for k, v in stored.items() if k in DEFAULTS}}
        self.model = home_planning.loaded(self.settings.get("planning"), dt_util.now().date())
        self.applied = (await self.state_store.async_load() or {}).get("pieces") or {}
        folder = Path(__file__).parent / "profiles"
        self.profiles = await self.hass.async_add_executor_job(profiles.load_all, folder)
        self._discover()
        self._build()

    async def async_start(self) -> None:
        hass = self.hass
        for event in (er.EVENT_ENTITY_REGISTRY_UPDATED, dr.EVENT_DEVICE_REGISTRY_UPDATED, ar.EVENT_AREA_REGISTRY_UPDATED):
            self._unsubs.append(hass.bus.async_listen(event, self._registry_changed))
        self._unsubs.append(async_track_time_interval(hass, self._tick, TICK))
        if hass.state is not CoreState.running:
            # The stove's integration or Versatile Thermostat may load after this brick: walked again once all is up.
            self._unsubs.append(hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, self._started))
        self._listen()

    async def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        for handle in (self._track_unsub, self._weather_unsub, self._energy_unsub, self._pending, self._discover_pending):
            if handle:
                handle()
        self._track_unsub = self._weather_unsub = self._energy_unsub = self._pending = self._discover_pending = None
        for stopped in list(self._stop_listeners):
            stopped()
        self._stop_listeners.clear()

    @callback
    def _started(self, _event=None) -> None:
        self._discover()
        self._listen()
        self._build()

    @callback
    def _registry_changed(self, _event=None) -> None:
        if self._discover_pending:
            self._discover_pending()
        self._discover_pending = async_call_later(self.hass, DISCOVER_PAUSE_S, self._rediscover)

    @callback
    def _rediscover(self, _now=None) -> None:
        self._discover_pending = None
        self._started()

    @callback
    def _tick(self, _now=None) -> None:
        self._build()

    def _discover(self) -> None:
        self.found = reader.discover(self.hass, self.profiles, self.settings)
        off = (self.settings.get("extensions") or {}).get("hestia_weather") is False
        self.weather = {"etat": "coupee"} if off else reader.weather_place(self.hass, self.settings.get("weather_place"))

    def _listen(self) -> None:
        """Listens to the states of what was found, and to Hestia Weather's place; nothing else."""
        tracked = self.found.tracked()
        if tracked != self._tracked or self._track_unsub is None:
            if self._track_unsub:
                self._track_unsub()
            self._tracked = tracked
            self._track_unsub = async_track_state_change_event(self.hass, list(tracked), self._changed) if tracked else None
        if self._weather_unsub:
            self._weather_unsub()
        self._weather_unsub = reader.weather_listen(self.hass, self.weather.get("lieu"), self._changed_weather)
        if self._energy_unsub:
            self._energy_unsub()
        # Hestia Énergie's price is read at each rebuild (each minute at least): listened to only to say the link.
        self._energy_unsub = reader.energy_listen(self.hass, lambda: None) if self._energy_used() else None

    @callback
    def _changed(self, _event=None) -> None:
        if self._pending is None:
            self._pending = async_call_later(self.hass, PAUSE_S, self._rebuild)

    @callback
    def _changed_weather(self) -> None:
        self._changed()

    @callback
    def _rebuild(self, _now=None) -> None:
        self._pending = None
        self._build()

    def _energy_used(self) -> bool:
        return (self.settings.get("extensions") or {}).get("hestia_energy") is not False

    def _build(self) -> None:
        started = time.perf_counter()
        hourly = reader.weather_hourly(self.hass, self.weather.get("lieu")) if self.weather.get("etat") == "oui" else None
        try:
            snap = reader.snapshot(self.hass, self.found, self.settings, hourly)
            today = snap["now"].date().isoformat()
            self.journal = [j for j in self.journal if j.get("jour") == today]
            snap.update(home_planning=self.model, applied=self.applied, journal=self.journal,
                        tarif=reader.energy_tariff(self.hass) if self._energy_used() else None)
            view = house.build(snap)
            due, waiting = view["planning"].pop("_dus"), view["planning"].pop("_sans_repere")
            # Orders only once Home Assistant runs: a thermostat that loads after this brick is not yet there.
            if (due or waiting) and self.hass.state is CoreState.running:
                self._planning_orders(due, waiting, snap["now"])
                view = house.build(snap)
                view["planning"].pop("_dus")
                view["planning"].pop("_sans_repere")
        except Exception:  # noqa: BLE001 - a strange state never stops the brick: the last good view stays
            _LOGGER.exception("Hestia Chauffage n'a pas pu lire la maison")
            return
        view["pret"] = True
        view["version"] = VERSION
        view["mis_a_jour"] = dt_util.now().isoformat()
        view["meteo"] = {k: self.weather.get(k) for k in ("etat", "nom")}
        view["extensions"] = self._extensions()
        self.data = view
        self.last_build_ms = round((time.perf_counter() - started) * 1000, 2)
        self._notify()

    def _extensions(self) -> list[dict]:
        """What the brick reads, installed or not, and switched on or off in Extensions."""
        found, installed = self.found, self.found.installed
        off = self.settings.get("extensions") or {}
        stove = found.stove
        rows = [
            {"id": reader.VT, "groupe": "Thermostats", "nom": "Versatile Thermostat", "installee": installed.get(reader.VT, False),
             "usage": "Chaque pièce : consigne, demande, puissance, fenêtre, délestage.",
             "sans": "Les autres thermostats sont lus quand même, avec moins de détails.",
             "lien": "https://github.com/jmcollin78/versatile_thermostat",
             "trouve": sum(1 for c in found.climates if c.get("vt"))},
        ]
        for p in self.profiles:
            rows.append({"id": p.integration, "groupe": "Poêle", "nom": p.name, "installee": installed.get(p.integration, False),
                         "usage": "L’état du poêle, sa flamme, ses fumées et son alarme, par le profil « " + p.name + " ».",
                         "sans": "Pas de page Poêle.", "lien": p.link,
                         "trouve": 1 if stove and stove["profile"].id == p.id else 0})
        rows += [
            {"id": reader.PELLETS, "groupe": "Poêle", "nom": "Suivi Stock Pellet", "installee": installed.get(reader.PELLETS, False),
             "usage": "Le stock de granulés et les jours qu’il reste.", "sans": "Pas de stock de granulés.",
             "lien": "https://github.com/Kmaxjojo/suivi_stock_pellet", "trouve": len(found.pellets)},
            {"id": reader.SCHEDULER, "groupe": "Planning", "nom": "Scheduler", "installee": installed.get(reader.SCHEDULER, False),
             "usage": "Le planning des pièces qui le suivent, lu sans rien y changer.",
             "sans": "Pas de prochain changement ni de journée dessinée.",
             "lien": "https://github.com/nielsfaber/scheduler-component", "trouve": len(found.schedules)},
            {"id": "hestia_weather", "groupe": "Briques Hestia-FB", "nom": "Hestia Weather",
             "installee": installed.get("hestia_weather", False), "usage": "Le froid de la nuit et de demain.",
             "sans": "Le froid à venir n’est pas dit.", "lien": "https://github.com/hestiaFB/hestia-weather-integration",
             "trouve": 1 if self.weather.get("etat") == "oui" else 0, "lieu": self.weather.get("lieu"),
             "lieu_nom": self.weather.get("nom"), "lieux": self.weather.get("lieux") or []},
            {"id": "hestia_energy", "groupe": "Briques Hestia-FB", "nom": "Hestia Énergie",
             "installee": installed.get("hestia_energy", False),
             "usage": "Lit le chauffage de chaque pièce et le poêle (énergie, granulés) ; donne le prix de l’électricité aux conseils du planning.",
             "sans": "Hestia Énergie devine le poêle par une source « gaz », et le planning ne dit pas ce que coûte l’électrique.",
             "lien": "https://github.com/hestiaFB/hestia-energy-integration",
             "trouve": 1 if getattr(self.hass.data.get(API_KEY), "readers", {}).get("hestia_energy")
             or reader.energy_api(self.hass) is not None else 0},
        ]
        for row in rows:
            row["utilisee"] = off.get(row["id"]) is not False
            # Copied from another Home Assistant (a lab), an integration is not installed here but its entities are read.
            row["installee"] = row["installee"] or row["trouve"] > 0
        return rows

    # --- the planning Hestia: what is sent, and only that ---------------------------------------------------------

    def _planning_orders(self, due: list[dict], waiting: list[str], now: datetime) -> None:
        """Each lane whose slot started since the last one dealt with: sent when « Le planning commande les
        thermostats » is on, else written in the journal as what Hestia would have done (« à l'ombre »)."""
        baseline = now.replace(tzinfo=None, second=0, microsecond=0).isoformat()
        for lane in waiting:
            self.applied[lane] = {"a": baseline}
        for order in due:
            self.applied[order["piece"]] = {"a": order["a"], "niveau": order["niveau"]}
            if order["bloque"]:
                fate = "bloque"
            elif order["recopie"]:
                fate = "recopie"
            elif not self.model.get("commande"):
                fate = "ombre"
            else:
                fates = [self._send(t) for t in order["cibles"]]
                fate = "envoye" if "envoye" in fates else next((f for f in fates if f != "deja"), "deja")
            at = datetime.fromisoformat(order["a"])
            self.journal.append({"jour": now.date().isoformat(), "heure": phrases.hour(at), "piece": order["nom"],
                                 "niveau": home_planning.WORDS[order["niveau"]], "statut": fate, "texte": FATE[fate]})
            if fate in ("envoye", "eteint", "sans_prereglage", "recopie"):
                _LOGGER.info("Planning Hestia, %s %s : %s", order["nom"], order["niveau"], FATE[fate])
        self.journal = self.journal[-JOURNAL_MAX:]
        self.state_store.async_delay_save(lambda: {"pieces": self.applied}, 5)

    def _send(self, target: dict) -> str:
        """One thermostat: its preset (a Versatile Thermostat), else its set point. Never switched on or off, never
        an entity copied from another Home Assistant (a lab copies the home: an order could reach the real one)."""
        hass, entity_id = self.hass, target["id"]
        entry = er.async_get(hass).async_get(entity_id)
        if entry is not None and entry.platform == reader.REMOTE:
            return "recopie"
        state = hass.states.get(entity_id)
        if state is None or state.state in ("off", "unavailable", "unknown"):
            return "eteint"
        attrs = state.attributes
        if target["vt"]:
            if target["preset"] not in (attrs.get("preset_modes") or ()):
                return "sans_prereglage"
            if attrs.get("preset_mode") == target["preset"]:
                return "deja"
            service, data = "set_preset_mode", {"entity_id": entity_id, "preset_mode": target["preset"]}
        else:
            try:
                current = float(attrs.get("temperature"))
            except (TypeError, ValueError):
                current = None
            if current is not None and abs(current - target["consigne"]) < 0.05:
                return "deja"
            service, data = "set_temperature", {"entity_id": entity_id, "temperature": target["consigne"]}
        hass.async_create_task(hass.services.async_call("climate", service, data, blocking=False, context=Context()))
        return "envoye"

    # --- settings ------------------------------------------------------------------------------------------------

    async def async_set_settings(self, changes: dict) -> None:
        """Raises ValueError (in French) when the planning sent is not readable: nothing is saved then."""
        settings = dict(self.settings)
        if "planning" in changes:
            model = home_planning.clean(changes["planning"], dt_util.now().date())
            changes = {**changes, "planning": model}
            # Saved or switched on: the slot in force is not sent again; the next ones are.
            self.applied = {}
            self.model = model
        for key, value in changes.items():
            if key in DEFAULTS:
                settings[key] = value
        self.settings = settings
        await self.store.async_save(settings)
        self._started()

    # --- a day's curves (the panel's and the card's charts) ------------------------------------------------------

    async def async_day(self, target: str) -> dict:
        """Today's curves since midnight for a room (`piece/<id>`) or the stove (`poele`): temperature and set point,
        flame. Read from the recorder at most every two minutes per target."""
        cached = self._days.get(target)
        if cached and time.monotonic() - cached[0] < DAY_CACHE_S:
            return cached[1]
        now = dt_util.now()
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        wanted: list[tuple[str, str, str | None]] = []
        if target == "poele":
            stove = self.data.get("poele") or {}
            entities = stove.get("entites") or {}
            flame = entities.get("flamme_reelle") or entities.get("flamme")
            if flame:
                wanted.append(("flamme", flame, None))
            if stove.get("thermostat"):
                wanted += [("temperature", stove["thermostat"], "current_temperature"),
                           ("demande", stove["thermostat"], "power_percent")]
        elif target.startswith("piece/"):
            room = next((r for r in self.data.get("pieces") or [] if r["id"] == target[6:]), None)
            if room and room.get("principal"):
                wanted += [("temperature", room["principal"], "current_temperature"),
                           ("consigne", room["principal"], "temperature")]
        series = await reader.day_history(self.hass, start, now, wanted) if wanted else {}
        view = {"debut": start.isoformat(), "maintenant_min": now.hour * 60 + now.minute,
                "series": {name: _minutes(points, start) for name, points in series.items()}}
        self._days[target] = (time.monotonic(), view)
        return view


def _minutes(points: list[tuple[datetime, float | None]], start: datetime, step: int = 5) -> list[list]:
    """[[minute of the day, value]] with one point every `step` minutes at most (the last of each step), and every
    change of a stepped value kept (a flame, a set point)."""
    out: list[list] = []
    for at, value in points:
        minute = max(0, int((at - start).total_seconds() // 60))
        if out and minute // step == out[-1][0] // step and out[-1][1] is not None and value is not None and \
                abs(out[-1][1] - value) < 0.5:
            out[-1] = [out[-1][0], value]
            continue
        out.append([minute, None if value is None else round(value, 2)])
    return out
