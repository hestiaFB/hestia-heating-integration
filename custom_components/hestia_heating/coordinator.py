"""The brick's heart: what was found, the latest view of the house, and who listens to it.

Cheap by design (rule 7 of CLAUDE.md): the registries are walked again only when an entity, a device or a room
changes; the states of the few dozen entities found are listened to, and one change rebuilds the view after a short
pause that gathers a burst of changes (a Versatile Thermostat writes several attributes at once). The view itself is
plain Python on dictionaries (engine/house.py), well under a millisecond.
"""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import date, datetime, timedelta
from pathlib import Path

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Context, CoreState, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import reader
from .house_journal import HouseJournal
from .const import API_KEY, DOMAIN, PLANNING_STATE_KEY, STORE_KEY, STORE_VERSION, VERSION
from .engine import driver, granules, home_planning, house, money, phrases, pilot, profiles, sources, tuning

_LOGGER = logging.getLogger(__name__)

# A burst of changes is gathered for this long before the view is rebuilt.
PAUSE_S = 1.0
# The registries changed: walked again after this pause (a reload adds and removes many entities at once).
DISCOVER_PAUSE_S = 5.0
# The sentences say « in 12 min », « until 22 h 30 »: rebuilt each minute even when nothing changes.
TICK = timedelta(minutes=1)
# A day's curve read from the recorder is kept this long.
DAY_CACHE_S = 120
# The days' totals (the cards' drawers, 0.8: kWh of a room, kilos of pellets) come from the long-term statistics,
# which grow once an hour: kept this long, for this many days.
HISTORY_CACHE_S = 600
HISTORY_RETRY_S = 60
HISTORY_DAYS = 14
DEFAULTS = {"sources": {}, "extensions": {}, "poele_thermostat": None, "poele_prise": None, "weather_place": None,
            "planning": None, "pilote": "ombre", "pilote_thermometre": None,
            "planning_autorises": [], "pilote_flamme_basse": None,
            "brasier_kg": None, "granules_prix_sac": None, "granules_poids_sac": None,
            "pilote_notifier": None, "poele_prise_switch": None, "couper_prise": True,
            "prix_kwh": None, "pilote_auto": None, "trop_chaud_ecart": None, "pilote_ventilation": "auto",
            "pilote_simulateur": False,
            # 1.0.0b3, the panel made technical: « La flamme : Manuel » while Hestia lights and stops the stove; the
            # stove's figures (Réglages › Avancé, engine/tuning.py); what each thermostat drives when the guess is
            # wrong; the ÉCO Stop wanted; what heats the house (the guide's first step).
            "flamme_manuelle": False, "avance": {}, "types": {}, "poele_eco_stop": True, "equipements": None}
# What heats a house, as the guide asks it (1.0.0b3).
EQUIPMENT = ("radiateur", "poele", "clim", "plancher")
# What the pellets settings may be (Réglages): the fire pot's threshold, a bag's price and weight.
PELLET_LIMITS = {"brasier_kg": (5, 60), "granules_prix_sac": (0.5, 50), "granules_poids_sac": (5, 30),
                 "prix_kwh": (0.01, 2), "trop_chaud_ecart": pilot.OVER_LIMITS}
# What became of a change of a planning Hestia, for each thermostat, as the journal says it.
FATE = {"envoye": "envoyé", "deja": "déjà réglé", "ombre": "en pause, rien envoyé", "bloque": "bloqué par Scheduler",
        "recopie": "thermostat recopié, jamais commandé", "eteint": "thermostat éteint, laissé tel quel",
        "sans_prereglage": "préréglage absent du thermostat", "verrou": "pas permis sur la page de sa pièce, rien envoyé"}
JOURNAL_MAX = 60
# The stove's pilot in « Conseil » (key ombre): its journal says what Hestia would have done and what the house did. Kept a week,
# through a restart, so that several days can be weighed (« d'accord 46 fois sur 48 »).
PILOT_SHOWN = 20
PILOT_DAYS = 7
PILOT_KEEP = 500
PILOT_GAPS = 5
# The pellets' count changes every minute while the stove burns: written at most every 5 minutes (a stop of Home
# Assistant loses at most that), at once when a bag, the factor, the fire pot or the day changes.
PELLETS_SAVE_S = 300
PELLETS_KEYS = ("sacs", "correction", "nettoye_le", "jour", "saison")
PELLET_WORDS = {"brasier_kg": "seuil du brasier (kg)", "granules_prix_sac": "prix d’un sac (€)",
                "granules_poids_sac": "poids d’un sac (kg)", "prix_kwh": "prix du kWh d’électricité (€)",
                "trop_chaud_ecart": "écart « pièce trop chaude » (°C)"}
# The card's « Gestion auto » (0.8): off, the pilot only looks (« ombre ») and remembers the mode it had; on again, it
# takes that mode back, else the gentlest one that acts (« flamme »).
AUTO_MODES = ("flamme", "entier")
# The whole pilot (0.7): what a person answers on the phone (the companion app's actions) and the buttons' words; a
# gesture waits this long for Home Assistant's answer.
ANSWER_EVENT = "mobile_app_notification_action"
ACTION_TITLES = {"HESTIA_POELE_OUI": "Oui, allumer", "HESTIA_POELE_NON": "Non", "HESTIA_POELE_NETTOYE": "J’ai nettoyé",
                 "HESTIA_POELE_COUPER": "Couper la prise", "HESTIA_POELE_IGNORER": "Ignorer"}
GESTURE_TIMEOUT_S = 30
TAG = "hestia_poele_"


class HeatingCoordinator:
    def __init__(self, hass: HomeAssistant, entry) -> None:
        self.hass = hass
        self.entry = entry
        self.store = Store(hass, STORE_VERSION, STORE_KEY)
        # The last change of a planning Hestia dealt with, per thermostat: a change that starts later is sent (or caught
        # up after a stop of Home Assistant).
        self.state_store = Store(hass, 1, PLANNING_STATE_KEY)
        self.applied: dict[str, dict] = {}
        self.journal: list[dict] = []
        # The stove's pilot: its memory and its journal of the week (kept with the planning's state).
        self.pilot_memory: dict = {}
        self.pilot_journal: list[dict] = []
        # The pellets counted by Hestia (engine/granules.py), kept with the planning's state.
        self.pellets_memory: dict = {}
        self._pellets_saved = 0.0
        # The whole pilot: the answers given since the last look, since when Home Assistant runs (None when this brick
        # started after it), the next look it asked for, and the phone notices that carry buttons.
        self.answers: dict[str, str] = {}
        self.ha_since: str | None = None
        self._wake = None
        self._asked: set[str] = set()
        self._gestures: asyncio.Task | None = None
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
        self._pending = None
        self._discover_pending = None
        self._days: dict[str, tuple[float, dict]] = {}
        self.last_build_ms: float | None = None
        # The house's journal, hour by hour (1.1.0b1): the house card's figures and the day's cost for Hestia Énergie.
        self.house_journal = HouseJournal(self)

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
        try:
            tuning.set_values(tuning.clean(self.settings.get("avance")), self.settings.get("poele_eco_stop"))
        except ValueError:
            # Figures that no longer fit their bounds (a newer version narrowed them): the defaults, said once.
            _LOGGER.warning("Hestia Chauffage : réglages avancés hors limites, valeurs par défaut")
            tuning.set_values({}, self.settings.get("poele_eco_stop"))
        self.model = home_planning.loaded(self.settings.get("planning"))
        state = await self.state_store.async_load() or {}
        self.applied = state.get("thermostats") or {}
        # The thermostat seen before a restart is not a « before »: a thermostat restored off (or in boost) by the
        # restart is neither a switch-off nor a step up, as for the house's own automations.
        self.pilot_memory = {k: v for k, v in (state.get("pilote") or {}).items() if k not in ("mode", "preset")}
        # The whole pilot's sequences are not carried over a restart: only its day's count and its lock are.
        for key in ("conduite", "conduite_blanc"):
            if key in self.pilot_memory:
                self.pilot_memory[key] = driver.kept(self.pilot_memory[key])
        self.pilot_journal = [j for j in state.get("journal_pilote") or [] if isinstance(j, dict) and j.get("jour") and j.get("qui")]
        # The rate seen before the stop is not carried over it: the time Home Assistant was stopped counts nothing.
        pellets = state.get("granules")
        self.pellets_memory = {**pellets, "debit": 0.0} if isinstance(pellets, dict) else {}
        await self.house_journal.async_load()
        folder = Path(__file__).parent / "profiles"
        self.profiles = await self.hass.async_add_executor_job(profiles.load_all, folder)
        self._discover()
        self._build()

    async def async_start(self) -> None:
        hass = self.hass
        for event in (er.EVENT_ENTITY_REGISTRY_UPDATED, dr.EVENT_DEVICE_REGISTRY_UPDATED, ar.EVENT_AREA_REGISTRY_UPDATED):
            self._unsubs.append(hass.bus.async_listen(event, self._registry_changed))
        self._unsubs.append(async_track_time_interval(hass, self._tick, TICK))
        self._unsubs.append(hass.bus.async_listen(ANSWER_EVENT, self._phone_answer))
        if hass.state is not CoreState.running:
            # The stove's integration or Versatile Thermostat may load after this brick: walked again once all is up.
            self._unsubs.append(hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, self._ha_started))
        self._listen()
        self.house_journal.start()

    async def async_stop(self) -> None:
        # Reloaded: the count of the last minutes is written now, before the new brick reads it.
        await self.state_store.async_save(self._state())
        await self.house_journal.async_stop()
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        for handle in (self._track_unsub, self._weather_unsub, self._pending, self._discover_pending, self._wake):
            if handle:
                handle()
        self._track_unsub = self._weather_unsub = self._pending = self._discover_pending = self._wake = None
        for stopped in list(self._stop_listeners):
            stopped()
        self._stop_listeners.clear()

    @callback
    def _ha_started(self, _event=None) -> None:
        # Home Assistant just started: the whole pilot takes the stove back in hand 3 minutes later (engine/driver.py).
        self.ha_since = dt_util.now().isoformat()
        self._started()

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

    def _build(self) -> None:
        started = time.perf_counter()
        hourly = reader.weather_hourly(self.hass, self.weather.get("lieu")) if self.weather.get("etat") == "oui" else None
        try:
            snap = reader.snapshot(self.hass, self.found, self.settings, hourly)
            today = snap["now"].date().isoformat()
            self.journal = [j for j in self.journal if j.get("jour") == today]
            answers = dict(self.answers)
            snap.update(home_planning=self.model, applied=self.applied, journal=self.journal,
                        pilote=self.settings.get("pilote"), pilote_memoire=self.pilot_memory,
                        flamme_manuelle=self.settings.get("flamme_manuelle") is True,
                        types=self.settings.get("types") or {},
                        trop_chaud=self.settings.get("trop_chaud_ecart"),
                        simulateur=self.settings.get("pilote_simulateur") is True,
                        autorises=self.settings.get("planning_autorises") or [],
                        granules_memoire=self.pellets_memory, granules_reglages=self._pellet_settings(),
                        pret=self.hass.state is CoreState.running,
                        conduite={"reponses": answers, "prise_switch": self.found.plug_switch,
                                  "couper_prise": self.settings.get("couper_prise") is not False,
                                  "ha_depuis": self.ha_since,
                                  "ventilation": self.settings.get("pilote_ventilation")})
            view = house.build(snap)
            due, waiting = view["planning"].pop("_dus"), view["planning"].pop("_sans_repere")
            # Orders only once Home Assistant runs: a thermostat that loads after this brick is not yet there.
            if (due or waiting) and self.hass.state is CoreState.running:
                self._planning_orders(due, waiting, snap["now"])
                view = house.build(snap)
                view["planning"].pop("_dus")
                view["planning"].pop("_sans_repere")
            self._pilot(view.pop("_pilote", None), view.get("poele"), today)
            self._pellets(view.pop("_granules", None))
            # The answers were given to this look: the next one does not see them again.
            for key in answers:
                if self.answers.get(key) == answers[key]:
                    self.answers.pop(key, None)
        except Exception:  # noqa: BLE001 - a strange state never stops the brick: the last good view stays
            _LOGGER.exception("Hestia Chauffage n'a pas pu lire la maison")
            return
        view["pret"] = True
        view["version"] = VERSION
        view["mis_a_jour"] = dt_util.now().isoformat()
        view["meteo"] = {k: self.weather.get(k) for k in ("etat", "nom")}
        # The price of a kWh of electricity (Réglages, 0.8): the cards' « Argent » for a room, and the stove's against
        # the same heat bought as electricity. None: the cards say where to set it.
        view["prix_kwh"] = self.settings.get("prix_kwh")
        # Hestia Énergie's price of a kWh now (1.0.0b8): when it is installed, the cards count the money at its prices.
        now_price = (reader.energy_prices(self.hass, [dt_util.now()]) or [None])[0]
        view["prix_energie"] = {"kwh": now_price["price"], "periode": now_price["period"], "couleur": now_price["color"]} \
            if now_price and now_price.get("price") is not None else None
        view["extensions"] = self._extensions()
        view["changements"] = self._changes(today)
        self.data = view
        try:
            self.house_journal.observe(view, snap["now"], hourly, snap["climates"])
        except Exception:  # noqa: BLE001 - the journal never stops the brick
            _LOGGER.exception("Hestia Chauffage n'a pas pu tenir le journal de la maison")
        self.last_build_ms = round((time.perf_counter() - started) * 1000, 2)
        self._notify()

    def _pilot(self, state: dict | None, stove: dict | None, today: str) -> None:
        """Keep the pilot's memory and its journal of the week, and put today's journal and the week's tally in the
        stove's view. In « flamme » and « entier » modes, make the orders the view gives (never during the start of
        Home Assistant, never to a copy) and look again when the whole pilot asks."""
        if state is not None:
            since = (date.fromisoformat(today) - timedelta(days=PILOT_DAYS - 1)).isoformat()
            kept = [j for j in self.pilot_journal if j["jour"] >= since]
            new = [{"jour": today, **e} for e in state["evenements"]]
            changed = state["memoire"] != self.pilot_memory or bool(new) or len(kept) != len(self.pilot_journal)
            self.pilot_memory = state["memoire"]
            self.pilot_journal = (kept + new)[-PILOT_KEEP:]
            if changed:
                self._save_state()
            if state.get("ordre"):
                self._flame_order(state["ordre"])
            if state.get("ordres"):
                self._drive(state["ordres"], stove)
            self._wake_in(state.get("reveil"))
        if stove and stove.get("pilote", {}).get("mode") in ("ombre", "flamme", "entier"):
            day = [j for j in self.pilot_journal if j["jour"] == today]
            stove["pilote"]["journal"] = day[-PILOT_SHOWN:]
            stove["pilote"]["accord_jour"] = _tally(day)
            stove["pilote"]["accord_semaine"] = {**_tally(self.pilot_journal), "depuis": min(
                (j["jour"] for j in self.pilot_journal), default=today), "ecarts": _gaps(self.pilot_journal)}

    def _changes(self, today: str) -> dict:
        """What Hestia changed today, counted (the panel's overview, 1.0.0b3): the thermostats' modes it set, and what
        it sent to the stove, from the pilot's journal (only gestures actually sent)."""
        modes = sum(len(j.get("thermostats") or []) for j in self.journal
                    if j.get("jour") == today and j.get("statut") == "envoye")
        counts = {"modes": modes, "flamme": 0, "allumer": 0, "eteindre": 0, "ventilation": 0, "autres": 0}
        for e in self.pilot_journal:
            if e.get("jour") != today or e.get("qui") != "hestia" or not e.get("envoye"):
                continue
            text = e.get("texte") or ""
            key = ("flamme" if text.startswith("Hestia met la flamme") else
                   "ventilation" if text.startswith("Hestia met la ventilation") else
                   "allumer" if text.startswith("Hestia allume") else
                   "eteindre" if text.startswith(("Hestia éteint", "Hestia renvoie l’ordre d’arrêt", "Le poêle chauffe encore"))
                   else "autres")
            counts[key] += 1
        counts["total"] = sum(counts.values())
        return counts

    def _flame_order(self, order: dict) -> None:
        """« Flamme » mode: the stove's flame, as the house's modulation sets it (number.set_value), without waiting
        for the answer; the pilot checks 5 minutes later that the flame followed. Only once Home Assistant runs."""
        if self.hass.state is not CoreState.running:
            return
        _LOGGER.info("Pilote du poêle : flamme %s (%s)", order["valeur"], order["entity_id"])
        self.hass.async_create_task(self.hass.services.async_call(
            "number", "set_value", {"entity_id": order["entity_id"], "value": order["valeur"]}, blocking=False,
            context=Context()))

    # --- the whole pilot (0.7): its gestures, its notices, the answers ---------------------------------------------

    def _wake_in(self, seconds: float | None) -> None:
        """The next look the whole pilot asked for (2 s after the settings, 15 s between two stop orders…)."""
        if self._wake:
            self._wake()
            self._wake = None
        if seconds is not None and seconds < TICK.total_seconds():
            self._wake = async_call_later(self.hass, seconds, self._woken)

    @callback
    def _woken(self, _now=None) -> None:
        self._wake = None
        self._build()

    @callback
    def _phone_answer(self, event) -> None:
        """A button of a Hestia notice pressed on a phone (HESTIA_POELE_…)."""
        action = str((event.data or {}).get("action") or "")
        answer = next((k for k, v in driver.ANSWERS.items() if v == action), None)
        if answer is not None:
            self.hass.async_create_task(self.async_answer(answer))

    async def async_answer(self, answer: str) -> None:
        """An answer to the whole pilot, from a phone or from the Poêle page. « nettoye » also starts the fire pot's
        count again (« J'ai nettoyé »)."""
        if answer not in driver.ANSWERS:
            raise ValueError("réponse inconnue")
        if answer == "nettoye":
            await self.async_fire_pot_cleaned()
            return
        self.answers[answer] = dt_util.now().isoformat()
        self._build()

    def _drive(self, orders: list[dict], stove: dict | None) -> None:
        """The whole pilot's gestures, one after the other in one task (the settings, then the order to light; hors gel
        then on). Only once Home Assistant runs, never to an entity copied from another Home Assistant."""
        if self.hass.state is not CoreState.running or not stove:
            return
        calls = [c for o in orders for c in self._calls_of(o, stove)]
        if not calls:
            return
        previous = self._gestures

        async def run() -> None:
            if previous and not previous.done():
                await asyncio.wait({previous}, timeout=GESTURE_TIMEOUT_S)
            for domain, service, data in calls:
                if not self.hass.services.has_service(domain, service):
                    _LOGGER.warning("Pilote du poêle : le service %s.%s n'existe pas", domain, service)
                    continue
                try:
                    await asyncio.wait_for(self.hass.services.async_call(domain, service, data, blocking=True,
                                                                         context=Context()), GESTURE_TIMEOUT_S)
                except Exception as err:  # noqa: BLE001 - one gesture that fails does not stop the next ones
                    _LOGGER.warning("Pilote du poêle : %s.%s n'a pas abouti (%s)", domain, service, err)

        self._gestures = self.hass.async_create_task(run())

    def _sendable(self, entity_id: str | None) -> bool:
        if not entity_id:
            return False
        entry = er.async_get(self.hass).async_get(entity_id)
        if entry is not None and entry.platform == reader.REMOTE:
            _LOGGER.warning("Pilote du poêle : %s est recopié d'une autre maison, rien ne lui est envoyé", entity_id)
            return False
        return self.hass.states.get(entity_id) is not None

    def _calls_of(self, order: dict, stove: dict) -> list[tuple[str, str, dict]]:
        """[(domain, service, data)] for one gesture of engine/driver.py: none when it must not be made."""
        gesture = order.get("geste")
        if gesture == "notifier":
            return self._notice(order)
        if gesture == "effacer":
            return self._clear(order["sujet"])
        if (self.found.stove or {}).get("copie"):
            return []
        profile = (self.found.stove or {}).get("profile")
        orders = profile.orders if profile else {}
        entities = stove.get("entites") or {}
        if gesture == "thermostat":
            target = stove.get("thermostat")
            if not self._sendable(target):
                return []
            _LOGGER.info("Pilote du poêle : %s %s", order["service"], target)
            return [("climate", order["service"], {"entity_id": target, **(order.get("donnees") or {})})]
        if gesture in ("allumer", "eteindre"):
            spec = orders.get(gesture) or {}
            target = entities.get(spec.get("role"))
            if not spec.get("service") or not self._sendable(target):
                return []
            _LOGGER.info("Pilote du poêle : %s (%s)", gesture, target)
            domain, service = spec["service"].split(".", 1)
            return [(domain, service, {"entity_id": target, **(spec.get("donnees") or {})})]
        if gesture == "reglage":
            spec = next((s for s in orders.get("reglages") or () if s.get("role") == order.get("role")), None)
            target = entities.get(order.get("role"))
            if not spec or not self._sendable(target):
                return []
            # The stove's own set point and its ÉCO Stop as Réglages want them (1.0.0b3).
            spec = tuning.stove_setting(spec)
            domain, service = spec["service"].split(".", 1)
            return [(domain, service, {"entity_id": target, **(spec.get("donnees") or {})})]
        if gesture == "ventilation":
            # « Flamme + 1 » (1.0): the profile's own ventilation setting, with the level the driver chose.
            spec = next((s for s in orders.get("reglages") or () if s.get("role") == "ventilation"), None)
            target = entities.get("ventilation")
            if not spec or not spec.get("attribut") or not self._sendable(target):
                return []
            domain, service = spec["service"].split(".", 1)
            return [(domain, service, {"entity_id": target, **(spec.get("donnees") or {}),
                                       spec["attribut"]: order["valeur"]})]
        if gesture == "recharger":
            entry_id = (self.found.stove or {}).get("entry_id")
            if not orders.get("recharger") or not entry_id:
                return []
            _LOGGER.info("Pilote du poêle : intégration du poêle rechargée")
            return [("homeassistant", "reload_config_entry", {"entry_id": entry_id})]
        if gesture == "prise":
            target = self.found.plug_switch
            if not self._sendable(target):
                return []
            _LOGGER.warning("Pilote du poêle : prise du poêle coupée (%s)", target)
            return [("switch", "turn_off", {"entity_id": target})]
        return []

    def _notifier(self) -> str | None:
        target = self.settings.get("pilote_notifier") or ""
        return target[7:] if target.startswith("notify.") else None

    def _notice(self, order: dict) -> list[tuple[str, str, dict]]:
        """A notice: in Home Assistant's notifications when it lasts, and on the phones of the notifier chosen in
        Réglages, with its buttons."""
        subject = TAG + order["sujet"]
        out = []
        if order.get("persistante"):
            out.append(("persistent_notification", "create", {"notification_id": subject, "title": order["titre"],
                                                              "message": order["texte"]}))
        notifier = self._notifier()
        if notifier:
            data: dict = {"tag": subject}
            if order.get("actions"):
                data["actions"] = [{"action": a, "title": ACTION_TITLES.get(a, a)} for a in order["actions"]]
                self._asked.add(order["sujet"])
            out.append(("notify", notifier, {"title": order["titre"], "message": order["texte"], "data": data}))
        return out

    def _clear(self, subject: str) -> list[tuple[str, str, dict]]:
        """A notice no longer true: out of Home Assistant's notifications, and off the phones when it carried buttons
        (the companion app's « clear_notification »)."""
        out = [("persistent_notification", "dismiss", {"notification_id": TAG + subject})]
        notifier = self._notifier()
        if notifier and subject in self._asked:
            self._asked.discard(subject)
            out.append(("notify", notifier, {"message": "clear_notification", "data": {"tag": TAG + subject}}))
        return out

    def _pellet_settings(self) -> dict:
        s = self.settings
        return {"brasier_kg": s.get("brasier_kg"), "prix_sac": s.get("granules_prix_sac"),
                "poids_sac": s.get("granules_poids_sac")}

    def _pellets(self, memory: dict | None) -> None:
        if memory is None:
            return
        at_once = any(memory.get(k) != self.pellets_memory.get(k) for k in PELLETS_KEYS)
        self.pellets_memory = memory
        if at_once or time.monotonic() - self._pellets_saved >= PELLETS_SAVE_S:
            self._pellets_saved = time.monotonic()
            self._save_state()

    async def async_fire_pot_cleaned(self) -> None:
        """« J'ai nettoyé » : the fire pot's count starts again now. Written at once. The whole pilot hears it too (its
        lock of the fire pot is lifted)."""
        bags = granules.bags_of(self.data.get("granules"), self.settings.get("granules_poids_sac"))
        self.pellets_memory = granules.cleaned(self.pellets_memory, bags, dt_util.now())
        self.answers["nettoye"] = dt_util.now().isoformat()
        await self.state_store.async_save(self._state())
        self._build()

    def _state(self) -> dict:
        return {"thermostats": self.applied, "pilote": self.pilot_memory, "journal_pilote": self.pilot_journal,
                "granules": self.pellets_memory}

    def _save_state(self) -> None:
        self.state_store.async_delay_save(self._state, 5)

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
             "usage": "Lit le chauffage de chaque pièce et le poêle (énergie, granulés).",
             "sans": "Hestia Énergie devine le poêle par une source « gaz ».",
             "lien": "https://github.com/hestiaFB/hestia-energy-integration",
             "trouve": 1 if getattr(self.hass.data.get(API_KEY), "readers", {}).get("hestia_energy") else 0},
        ]
        for row in rows:
            row["utilisee"] = off.get(row["id"]) is not False
            # Copied from another Home Assistant (a lab), an integration is not installed here but its entities are read.
            row["installee"] = row["installee"] or row["trouve"] > 0
        return rows

    # --- the plannings Hestia: what is sent, and only that --------------------------------------------------------

    def _planning_orders(self, due: list[dict], waiting: list[str], now: datetime) -> None:
        """Each thermostat whose planning changed level since the last change dealt with: sent when its planning is
        « Actif », else written in the journal as what Hestia would have done (« En pause »)."""
        baseline = now.replace(tzinfo=None, second=0, microsecond=0).isoformat()
        for thermostat in waiting:
            self.applied[thermostat] = {"a": baseline}
        for order in due:
            fates: dict[str, list[str]] = {}
            for target in order["cibles"]:
                self.applied[target["id"]] = {"a": order["a"], "niveau": order["niveau"], "planning": order["planning"]}
                if target["bloque"]:
                    fate = "bloque"
                elif target["recopie"]:
                    fate = "recopie"
                elif not order["actif"]:
                    fate = "ombre"
                elif not target["autorise"]:
                    fate = "verrou"
                else:
                    fate = self._send(target)
                fates.setdefault(fate, []).append(target["nom"])
            at = datetime.fromisoformat(order["a"])
            for fate, names in fates.items():
                self.journal.append({"jour": now.date().isoformat(), "heure": phrases.hour(at), "planning": order["nom"],
                                     "thermostats": names, "niveau": home_planning.WORDS[order["niveau"]],
                                     "statut": fate, "texte": FATE[fate]})
                if fate in ("envoye", "eteint", "sans_prereglage", "recopie"):
                    _LOGGER.info("Planning Hestia « %s », %s pour %s : %s", order["nom"], order["niveau"],
                                 ", ".join(names), FATE[fate])
        self.journal = self.journal[-JOURNAL_MAX:]
        self._save_state()

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
        if "pilote" in changes and changes["pilote"] not in pilot.MODES:
            raise ValueError("mode du pilote inconnu")
        allowed = changes.get("planning_autorises", [])
        if not isinstance(allowed, list) or not all(isinstance(t, str) and t.startswith("climate.") for t in allowed):
            raise ValueError("thermostats autorisés illisibles")
        low = changes.get("pilote_flamme_basse")
        if low is not None and not (isinstance(low, str) and low.startswith("input_boolean.")):
            raise ValueError("interrupteur « flamme au plus bas » illisible")
        sensor = changes.get("pilote_thermometre")
        if sensor is not None and not (isinstance(sensor, str) and sensor.startswith("sensor.")):
            raise ValueError("thermomètre de la maison illisible")
        notifier = changes.get("pilote_notifier")
        if notifier is not None and not (isinstance(notifier, str) and notifier.startswith("notify.")):
            raise ValueError("service de notification illisible")
        cut = changes.get("poele_prise_switch")
        if cut is not None and not (isinstance(cut, str) and cut.startswith("switch.")):
            raise ValueError("interrupteur de la prise illisible")
        if "couper_prise" in changes and not isinstance(changes["couper_prise"], bool):
            raise ValueError("« couper la prise sans réponse » : oui ou non")
        if "pilote_simulateur" in changes and not isinstance(changes["pilote_simulateur"], bool):
            raise ValueError("simulateur du mode Entier : oui ou non")
        if "pilote_ventilation" in changes and changes["pilote_ventilation"] not in driver.FAN_MODES:
            raise ValueError("ventilation : « auto », « flamme » ou « manuel »")
        for key in ("flamme_manuelle", "poele_eco_stop"):
            if key in changes and not isinstance(changes[key], bool):
                raise ValueError(f"{key} : oui ou non")
        if "avance" in changes:
            changes = {**changes, "avance": tuning.clean(changes["avance"])}
        kinds = changes.get("types") or {}
        if not isinstance(kinds, dict) or not all(isinstance(k, str) and k.startswith("climate.") and v in sources.KINDS
                                                  for k, v in kinds.items()):
            raise ValueError("type d’un thermostat illisible")
        kit = changes.get("equipements")
        if kit is not None and not (isinstance(kit, list) and all(k in EQUIPMENT for k in kit)):
            raise ValueError("ce qui chauffe la maison : illisible")
        for key, (low_v, high_v) in PELLET_LIMITS.items():
            value = changes.get(key)
            if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float))
                                      or not low_v <= value <= high_v):
                raise ValueError(f"{PELLET_WORDS[key]} : entre {low_v} et {high_v}, ou vide")
        if "planning" in changes:
            model = home_planning.clean(changes["planning"])
            changes = {**changes, "planning": model}
            # Saved: the level in force is not sent again; the next changes are.
            self.applied = {}
            self.model = model
        for key, value in changes.items():
            if key in DEFAULTS:
                settings[key] = value
        self.settings = settings
        tuning.set_values(settings.get("avance"), settings.get("poele_eco_stop"))
        await self.store.async_save(settings)
        self._started()

    async def async_auto(self, on: bool) -> str:
        """The card's « Flamme : Automatique » (« Gestion auto » before 1.0.0b3): off, the pilot goes back to looking
        only (« ombre ») and keeps the mode it had; on, it takes that mode back (else « flamme »; « entier » only for a
        stove the profile can light and stop). While Hestia lights and stops the stove (« entier »), only the flame
        changes hands (`flamme_manuelle`). Returns the mode now in force. Never switched on for a stove copied from
        another house (a lab)."""
        mode = self.settings.get("pilote") or "ombre"
        if on and (self.data.get("poele") or {}).get("copie"):
            return mode
        if mode == "entier":
            if (self.settings.get("flamme_manuelle") is True) == on:
                await self.async_set_settings({"flamme_manuelle": not on})
            return mode
        if on:
            wanted = self.settings.get("pilote_auto") if self.settings.get("pilote_auto") in AUTO_MODES else "flamme"
            if wanted == "entier" and not (self.data.get("poele") or {}).get("pilotable"):
                wanted = "flamme"
            if mode in AUTO_MODES:
                return mode
            await self.async_set_settings({"pilote": wanted})
            return wanted
        if mode not in AUTO_MODES:
            return mode
        await self.async_set_settings({"pilote": "ombre", "pilote_auto": mode})
        return "ombre"

    # --- a day's curves (the panel's and the card's charts) ------------------------------------------------------

    async def async_day(self, target: str, hours: int | None = None) -> dict:
        """Today's curves since midnight for a room (`piece/<id>`) or the stove (`poele`): temperature and set point,
        flame. With `hours` (the cards' clock, 0.8), the last hours instead, up to now. Read from the recorder at most
        every two minutes per target."""
        key = target if not hours else f"{target}@{hours}"
        cached = self._days.get(key)
        if cached and time.monotonic() - cached[0] < DAY_CACHE_S:
            return cached[1]
        now = dt_util.now()
        start = now - timedelta(hours=hours) if hours else now.replace(hour=0, minute=0, second=0, microsecond=0)
        wanted: list[tuple[str, str, str | None]] = []
        if target == "poele":
            stove = self.data.get("poele") or {}
            entities = stove.get("entites") or {}
            flame = entities.get("flamme_reelle") or entities.get("flamme")
            if flame:
                wanted.append(("flamme", flame, None))
                if entities.get("etat"):
                    wanted.append(("etat", entities["etat"], None))
            if stove.get("thermostat"):
                wanted += [("temperature", stove["thermostat"], "current_temperature"),
                           ("demande", stove["thermostat"], "power_percent")]
                if hours:
                    # The clock draws the stove's set point while it burns (0.8.0b3).
                    wanted.append(("consigne", stove["thermostat"], "temperature"))
        elif target.startswith("piece/"):
            room = next((r for r in self.data.get("pieces") or [] if r["id"] == target[6:]), None)
            if room and room.get("principal"):
                wanted += [("temperature", room["principal"], "current_temperature"),
                           ("consigne", room["principal"], "temperature"),
                           ("demande", room["principal"], "power_percent")]
        series = await reader.day_history(self.hass, start, now, wanted, text=("etat",)) if wanted else {}
        if "etat" in series:
            profile = next((p for p in self.profiles if p.id == (self.data.get("poele") or {}).get("profil")), None)
            series["flamme"] = _burning_only(series.get("flamme") or [], series.pop("etat"), profile)
        view = {"debut": start.isoformat(), "maintenant_min": now.hour * 60 + now.minute,
                "series": {name: _minutes(points, start) for name, points in series.items()}}
        if hours:
            # The minutes count from `debut`; the clock places them from the minute of the day it falls on.
            view.update(debut_min=start.hour * 60 + start.minute, fenetre_min=hours * 60)
            # Each hour's kWh or kilos, from the counter's hourly statistics (0.8.0b3: the clock's hours, on hover).
            stat, unit = self._counter_of(target)
            if stat:
                origin = start.replace(second=0, microsecond=0)
                rows = await reader.hourly_totals(self.hass, stat, unit, origin.replace(minute=0), now)
                view["energie"] = {"unite": unit, "heures": [[int((begin - origin).total_seconds() // 60), value]
                                                             for begin, value in rows]}
        self._days[key] = (time.monotonic(), view)
        return view

    def _counter_of(self, target: str) -> tuple[str | None, str | None]:
        """The counter behind a target's kWh or kilos, and its unit: the stove's pellets (Hestia's own count) or a
        room's energy (its thermostat's counter)."""
        if target == "poele":
            return self._own_entity("sensor", "poele_granules_brules"), "kg"
        if target.startswith("piece/"):
            room = next((r for r in self.data.get("pieces") or [] if r["id"] == target[6:]), None)
            main = (room or {}).get("principal")
            stat = next((c.get("energie") for c in self.found.climates if c["entity_id"] == main), None) if main else None
            return stat, "kWh"
        return None, None

    async def async_history(self, target: str) -> dict:
        """The last days' totals for the cards' drawers (0.8), from the long-term statistics: a room's kWh (its
        thermostat's energy counter) or the stove's pellets (Hestia's own count). Today's total adds what the counter
        moved since its last hourly statistic. Kept ten minutes per target."""
        cached = self._days.get("histoire/" + target)
        if cached and time.monotonic() < cached[0]:
            return cached[1]
        stat, unit = self._counter_of(target)
        now = dt_util.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        first = min(today - timedelta(days=HISTORY_DAYS - 1), today.replace(day=1))
        days = await reader.daily_totals(self.hass, stat, unit, first, now) if stat else {}
        view = {"unite": unit, "stat": stat, "aujourdhui": today.date().isoformat(),
                "jours": [{"jour": (today - timedelta(days=n)).date().isoformat(),
                           "valeur": days.get((today - timedelta(days=n)).date().isoformat())}
                          for n in range(HISTORY_DAYS - 1, -1, -1)],
                "mois": round(sum(v for d, v in days.items() if d >= today.replace(day=1).date().isoformat()), 2)
                if days else None}
        # With Hestia Énergie (1.0.0b8): each day's euros at its prices, hour by hour, split by period (a room's kWh,
        # or the stove's kilos as the same heat bought as electricity). Without it, the card keeps the price of Réglages.
        if stat and reader.energy_prices(self.hass, []) is not None:
            rows = await reader.hourly_totals(self.hass, stat, unit, first, now)
            prices = reader.energy_prices(self.hass, [at for at, _ in rows])
            if prices is not None:
                per_unit = tuning.kwh_per_kg() if unit == "kg" else 1.0
                euros = money.days(rows, prices, now, per_unit)
                view["energie"] = {"euros": [{"jour": d["jour"], **(euros.get(d["jour"]) or {"total": None})}
                                             for d in view["jours"]],
                                   **(money.seen(prices) or {"prix": {}, "couleur": None})}
        # 1.0.1b1: Hestia Énergie installed but not ready yet (Home Assistant starting): these days, read without its
        # prices, are kept one minute only, so that the cards get its euros as soon as it gives them.
        waiting = stat and "energie" not in view and reader.ENERGY_API in self.hass.data
        self._days["histoire/" + target] = (time.monotonic() + (HISTORY_RETRY_S if waiting else HISTORY_CACHE_S), view)
        return view

    def _own_entity(self, platform: str, key: str) -> str | None:
        return er.async_get(self.hass).async_get_entity_id(platform, DOMAIN, f"{self.entry.entry_id}_{key}")


def _burning_only(flames: list[tuple], states: list[tuple], profile) -> list[tuple]:
    """The flame curve at 0 while the stove does not burn: some stoves report a real flame of 1 while off."""
    if profile is None or not states:
        return flames
    changes = sorted([(at, value, "f") for at, value in flames] + [(at, value, "s") for at, value in states],
                     key=lambda c: (c[0], c[2] == "f"))
    out, flame, burning = [], None, None
    for at, value, kind in changes:
        if kind == "s":
            burning = profile.translate(value)[0] in profiles.BURNING
        else:
            flame = value
        shown = flame if burning or burning is None else 0.0
        if out and out[-1][0] == at:
            out[-1] = (at, shown)
        else:
            out.append((at, shown))
    return out


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


def _tally(journal: list[dict]) -> dict:
    """How many gestures of the house were the ones Hestia would have made."""
    house = [j for j in journal if j["qui"] == "maison" and j.get("accord") is not None]
    return {"oui": sum(1 for j in house if j["accord"]), "sur": len(house)}


def _gaps(journal: list[dict]) -> list[dict]:
    """The last gestures of the house Hestia would not have made, newest first, each with what Hestia said before."""
    out, said = [], {}
    for j in journal:
        if j["qui"] == "hestia":
            said[j["jour"]] = j.get("texte")
        elif j.get("accord") is False:
            out.append({"jour": j["jour"], "heure": j.get("heure"), "texte": j.get("texte"), "hestia": said.get(j["jour"])})
    return out[::-1][:PILOT_GAPS]
