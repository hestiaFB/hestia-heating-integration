"""Hestia Chauffage in a real Home Assistant core, with a made-up house (maison_fictive.py): Versatile Thermostats in
two rooms, a Micronova stove by Agua IOT, its plug, Suivi Stock Pellet and Scheduler. It reads, publishes its few
entities and its interface, and never calls a service. Skipped without Home Assistant."""
from __future__ import annotations

import asyncio
from datetime import datetime, time, timedelta
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

try:
    from homeassistant import loader
    from homeassistant.config_entries import ConfigEntries, ConfigEntry
    from homeassistant.const import EVENT_CALL_SERVICE
    from homeassistant.core import CoreState, HomeAssistant
    from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er, frame, issue_registry as ir
except ImportError:
    raise unittest.SkipTest("Home Assistant is not installed")

import maison_fictive as m

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from custom_components.hestia_heating.const import API_KEY, DOMAIN  # noqa: E402
from custom_components.hestia_heating.websocket import CARD_KEYS, card_view  # noqa: E402
from homeassistant.util import dt as dt_util  # noqa: E402


def eco_between(start, end):
    """A planning's week, day by day, with éco from `start` to `end` (naive, under a day apart) and confort the rest of
    the time."""
    rows = [[] for _ in range(7)]
    cur = start
    while cur < end:
        midnight = datetime.combine(cur.date() + timedelta(days=1), time(0))
        stop = min(end, midnight)
        rows[cur.weekday()].append([cur.strftime("%H:%M"), "24:00" if stop == midnight else stop.strftime("%H:%M"), "eco"])
        cur = stop
    return rows


class SendsThePlanning:
    """A planning Hestia whose thermostat went to confort two minutes ago (éco for three hours before); the last change
    dealt with put half an hour back, so that this one is due."""

    async def _planning(self, thermostat, actif=True, allowed=True):
        hass = self.hass
        hass.set_state(CoreState.running)
        self.sent = []

        async def handler(call):
            self.sent.append((call.service, dict(call.data)))
        for service in ("set_preset_mode", "set_temperature"):
            hass.services.async_register("climate", service, handler)
        entry, c = await self._setup()
        now = dt_util.now().replace(tzinfo=None, second=0, microsecond=0)
        week = eco_between(now - timedelta(hours=3), now - timedelta(minutes=2))
        model = {"plannings": {"essai": {"nom": "Essai", "actif": actif, "jours": "chaque", "reste": "confort",
                                         "plages": week, "thermostats": [thermostat]}}}
        await c.async_set_settings({"planning": model, "planning_autorises": [thermostat] if allowed else []})
        await hass.async_block_till_done()
        self.assertEqual(self.sent, [], "saving the planning sends nothing at once")
        c.applied[thermostat] = {"a": (now - timedelta(minutes=30)).isoformat()}
        c._build()
        await hass.async_block_till_done()
        return entry, c


def entry_of(domain, title, unique_id=None):
    return ConfigEntry(domain=domain, title=title, data={}, options={}, unique_id=unique_id, version=1, minor_version=1,
                       source="user", discovery_keys={}, subentries_data=None)


class HomeAssistantWithAHouse(unittest.IsolatedAsyncioTestCase):
    """A Home Assistant core in memory; `_house()` puts a house in it."""

    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory()
        config = Path(self.directory.name)
        (config / "custom_components").mkdir()
        (config / "custom_components" / DOMAIN).symlink_to(ROOT / "custom_components" / DOMAIN)
        hass = HomeAssistant(str(config))
        await hass.config.async_set_time_zone("Europe/Paris")
        frame.async_setup(hass)
        loader.async_setup(hass)
        hass.config_entries = ConfigEntries(hass, {})
        await hass.config_entries.async_initialize()
        await ar.async_load(hass)
        dr.async_setup(hass)
        await dr.async_load(hass)
        await er.async_load(hass)
        await ir.async_load(hass)
        self.hass = hass
        self.calls = []
        hass.bus.async_listen(EVENT_CALL_SERVICE, lambda e: self.calls.append(e.data))
        self._house()

    async def asyncTearDown(self):
        self.hass.set_state(CoreState.running)
        await self.hass.async_stop()
        self.directory.cleanup()

    def _house(self):
        hass = self.hass
        areas, devices, entities = ar.async_get(hass), dr.async_get(hass), er.async_get(hass)
        rooms = {key: areas.async_create(name).id for key, name in (("sejour", "Séjour"), ("bureau", "Bureau"))}
        hass.config.components.update({"versatile_thermostat", "aguaiot", "suivi_stock_pellet"})
        # The thermostats, each in its room.
        for c in m.climates()[:3]:
            entry = entities.async_get_or_create("climate", "versatile_thermostat", c["entity_id"],
                                                 suggested_object_id=c["entity_id"].split(".")[1])
            entities.async_update_entity(entry.entity_id, area_id=rooms["sejour" if c["room"] == "sejour" else "bureau"])
            hass.states.async_set(c["entity_id"], c["state"], c["attributes"])
        # The stove: one device of Agua IOT, its climate and its sensors.
        stove_entry = entry_of("aguaiot", "Agua IOT")
        hass.config_entries._entries[stove_entry.entry_id] = stove_entry
        device = devices.async_get_or_create(config_entry_id=stove_entry.entry_id, identifiers={("aguaiot", "essai")},
                                             manufacturer="Micronova", model="Essai", name="Poêle essai")
        devices.async_update_device(device.id, area_id=rooms["sejour"])
        stove = m.stove()
        for role, r in stove["roles"].items():
            domain, object_id = r["entity_id"].split(".")
            entities.async_get_or_create(domain, "aguaiot", f"essai{object_id[5:]}", suggested_object_id=object_id,
                                         device_id=device.id, config_entry=stove_entry)
            hass.states.async_set(r["entity_id"], r["state"], {})
        entities.async_get_or_create("climate", "aguaiot", "essai", suggested_object_id="poele", device_id=device.id,
                                     config_entry=stove_entry)
        hass.states.async_set("climate.poele", "heat", {"current_temperature": 19.5, "temperature": 21})
        # The thermostats' energy counters (and a longer id that is not the bureau's own).
        for object_id in ("vt_poele_energy", "vt_bureau_energy", "vt_bureau_test_energy"):
            hass.states.async_set(f"sensor.{object_id}", "12.5", {"device_class": "energy", "state_class": "total_increasing",
                                                                  "unit_of_measurement": "kWh"})
        # Its plug, the pellets and the schedules.
        hass.states.async_set("sensor.prise_du_poele_puissance", "42", {"device_class": "power", "friendly_name": "Prise poêle"})
        for key, r in m.pellets().items():
            hass.states.async_set(r["entity_id"], r["state"], {**r["attributes"], "suivi_stock_pellet_key": key})
        hass.states.async_set("switch.schedule_poele", "on", {
            "entities": ["climate.vt_poele"], "weekdays": ["daily"],
            "timeslots": ["07:00:00 - 09:00:00", "09:00:00 - 18:00:00", "18:00:00 - 23:00:00", "23:00:00 - 07:00:00"],
            "actions": [{"service": "climate.set_preset_mode", "data": {"preset_mode": p}} for p in ("boost", "frost", "boost", "frost")]})

    async def _setup(self):
        from custom_components.hestia_heating import async_setup
        await async_setup(self.hass, {})
        entry = entry_of(DOMAIN, "Maison", "hestia_heating_home")
        self.hass.config_entries._entries[entry.entry_id] = entry
        with patch("homeassistant.setup.async_process_deps_reqs", return_value=None):
            await self.hass.config_entries.async_setup(entry.entry_id)
        await self.hass.async_block_till_done()
        self.assertTrue(hasattr(entry, "runtime_data"), f"{entry.state} {entry.reason}")
        return entry, entry.runtime_data

    def state(self, entity_id):
        s = self.hass.states.get(entity_id)
        return s.state if s else None


class PlanningHestia(SendsThePlanning, HomeAssistantWithAHouse):
    """A planning Hestia in the made-up house: a preset sent at its change, and only then."""

    async def test_active_it_sends_the_preset_once(self):
        entry, c = await self._planning("climate.vt_sejour")
        self.assertEqual(self.sent, [("set_preset_mode", {"entity_id": "climate.vt_sejour", "preset_mode": "comfort"})])
        self.assertEqual((c.journal[-1]["planning"], c.journal[-1]["thermostats"], c.journal[-1]["statut"]),
                         ("Essai", ["Radiateur séjour"], "envoye"))
        c._build()
        await self.hass.async_block_till_done()
        self.assertEqual(len(self.sent), 1, "a change is sent once")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_on_trial_it_only_says_what_it_would_do(self):
        entry, c = await self._planning("climate.vt_sejour", actif=False)
        self.assertEqual(self.sent, [])
        self.assertEqual(c.journal[-1]["statut"], "ombre")
        self.assertEqual(c.data["planning"]["journal"][-1]["texte"], "en essai, rien envoyé")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_active_it_sends_nothing_to_a_thermostat_not_allowed(self):
        """The lock of Réglages, « Ce que Hestia peut régler »: none at first, so an « Actif » planning sends nothing."""
        entry, c = await self._planning("climate.vt_sejour", allowed=False)
        self.assertEqual(self.sent, [])
        self.assertEqual(c.journal[-1]["statut"], "verrou")
        self.assertEqual(c.data["planning"]["journal"][-1]["texte"], "pas autorisé dans Réglages, rien envoyé")
        self.assertIn("Hestia n’a pas le droit de régler Radiateur séjour", [t["titre"] for t in c.data["a_regler"]])
        self.assertEqual(c.data["planning"]["hestia"][0]["verrouilles"], [{"id": "climate.vt_sejour", "nom": "Radiateur séjour"}])
        self.assertEqual(c.settings["planning_autorises"], [])
        with self.assertRaises(ValueError):
            await c.async_set_settings({"planning_autorises": ["switch.radiateur"]})
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_thermostat_switched_off_stays_off(self):
        attrs = dict(self.hass.states.get("climate.vt_sejour").attributes)
        self.hass.states.async_set("climate.vt_sejour", "off", attrs)
        entry, c = await self._planning("climate.vt_sejour")
        self.assertEqual(self.sent, [])
        self.assertEqual(c.journal[-1]["statut"], "eteint")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_thermostat_scheduler_still_aims_at_is_never_sent(self):
        entry, c = await self._planning("climate.vt_poele")
        self.assertEqual(self.sent, [])
        self.assertEqual(c.journal[-1]["statut"], "bloque")
        self.assertIn("Thermostat poêle suit deux plannings", [t["titre"] for t in c.data["a_regler"]])
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_planning_that_cannot_be_read_is_refused_and_nothing_changes(self):
        entry, c = await self._setup()
        bad = {"plannings": {"a": {"nom": "A", "jours": "tous", "reste": "eco", "plages": [[["09:00", "08:00", "confort"]]],
                                   "thermostats": []}}}
        with self.assertRaises(ValueError):
            await c.async_set_settings({"planning": bad})
        self.assertEqual(c.model, {"plannings": {}})
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))


class MadeUpHouse(HomeAssistantWithAHouse):
    """The made-up house with its own integrations: rooms, a stove's device, Versatile Thermostat."""

    async def test_it_finds_the_house_and_says_it(self):
        entry, c = await self._setup()
        d = c.data
        self.assertTrue(d["pret"])
        self.assertTrue(d["maison"]["titre"].startswith("Le poêle chauffe, flamme 3."), d["maison"]["titre"])
        self.assertEqual({r["id"] for r in d["pieces"]}, {"sejour", "bureau"})
        self.assertEqual(d["poele"]["thermostat"], "climate.vt_poele")
        self.assertEqual(d["poele"]["prise"], "sensor.prise_du_poele_puissance")
        self.assertEqual(d["granules"]["jours"], 50)
        self.assertEqual(d["planning"]["lignes"][0]["nom"], "Poêle")
        found = {e["id"]: e for e in d["extensions"]}
        self.assertEqual(found["versatile_thermostat"]["trouve"], 3)
        self.assertEqual(found["hestia_weather"]["trouve"], 0)
        self.assertLess(c.last_build_ms, 100)
        # Its few entities, under stable keys.
        self.assertEqual(self.state("sensor.hestia_heating_maison_etat"), "chauffe")
        self.assertEqual(self.state("sensor.hestia_heating_poele_etat"), "chauffe")
        self.assertEqual(self.state("sensor.hestia_heating_poele_flamme"), "3")
        self.assertEqual(self.state("binary_sensor.hestia_heating_poele_alarme"), "off")
        self.assertEqual(self.state("sensor.hestia_heating_poele_granules_jours"), "50")
        self.assertEqual(self.state("binary_sensor.hestia_heating_piece_bureau_en_chauffe"), "on")
        unique = {e.unique_id for e in er.async_entries_for_config_entry(er.async_get(self.hass), entry.entry_id)}
        self.assertIn(f"{entry.entry_id}_piece_bureau_en_chauffe", unique)
        self.assertEqual(self.calls, [], "nothing is sent while the planning Hestia does not command")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_change_of_a_thermostat_is_followed(self):
        entry, c = await self._setup()
        attrs = dict(self.hass.states.get("climate.vt_bureau").attributes, hvac_action="idle", power_percent=0)
        self.hass.states.async_set("climate.vt_bureau", "heat", attrs)
        await asyncio.sleep(1.5)
        await self.hass.async_block_till_done()
        self.assertEqual(self.state("binary_sensor.hestia_heating_piece_bureau_en_chauffe"), "off")
        self.assertEqual(c.data["maison"]["titre"], "Le poêle chauffe, flamme 3.")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_the_interface_for_the_other_bricks(self):
        entry, c = await self._setup()
        api = self.hass.data[API_KEY]
        self.assertEqual(api.version, 1)
        kinds = {s["id"]: s["type"] for s in api.sources()}
        self.assertEqual(kinds["climate.vt_poele"], "poele")
        self.assertEqual(kinds["climate.vt_bureau"], "radiateur")
        self.assertEqual(api.maison()["etat"], "chauffe")
        # 0.2: what Hestia Énergie reads instead of guessing the stove from a « gas » source.
        counters = {s["id"]: s["energie_stat"] for s in api.sources()}
        self.assertEqual(counters["climate.vt_bureau"], "sensor.vt_bureau_energy")
        self.assertIsNone(counters["climate.vt_sejour"])
        stove = api.poele()
        self.assertEqual((stove["etat"], stove["flamme"], stove["thermostat"]), ("chauffe", 3, "climate.vt_poele"))
        self.assertEqual(stove["energie_stat"], "sensor.vt_poele_energy")
        self.assertEqual(stove["granules"]["stat"], "sensor.granules_saison")
        self.assertEqual(stove["granules"]["jours"], 50)
        heard = []
        remove = api.add_listener(lambda: heard.append(1), brick="hestia_energy")
        attrs = dict(self.hass.states.get("climate.vt_bureau").attributes, current_temperature=18.6)
        self.hass.states.async_set("climate.vt_bureau", "heat", attrs)
        await asyncio.sleep(1.5)
        await self.hass.async_block_till_done()
        self.assertTrue(heard)
        energy = next(e for e in c._extensions() if e["id"] == "hestia_energy")
        self.assertEqual(energy["trouve"], 1)
        remove()
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))
        self.assertEqual(api.sources(), [])
        self.assertIsNone(api.poele())

    async def test_the_cards_view_is_lighter(self):
        entry, c = await self._setup()
        view = card_view(c.data)
        self.assertEqual(set(view), set(CARD_KEYS))
        self.assertNotIn("extensions", view)
        self.assertNotIn("thermostats", view["planning"])
        self.assertNotIn("scheduler", view["planning"])
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_the_stove_pilot_in_the_shade_only_watches(self):
        """0.4: the pilot says what Hestia would do and what the house did; it never calls a service."""
        entry, c = await self._setup()
        self.assertEqual(c.data["poele"]["pilote"]["action"], "garder")
        hass = self.hass

        async def change(entity_id, state, **attrs):
            hass.states.async_set(entity_id, state, {**hass.states.get(entity_id).attributes, **attrs})
            await asyncio.sleep(1.5)
            await hass.async_block_till_done()
        await change("climate.vt_poele", "heat", preset_mode="frost")
        self.assertEqual(c.data["poele"]["pilote"]["action"], "arreter")
        await change("sensor.poele_status", "Éteindre")
        await change("climate.vt_poele", "heat", preset_mode="boost")
        # The house is at 20 °C, the mild season: Hestia would ask before starting the stove.
        self.assertEqual(c.data["poele"]["pilote"]["action"], "demander")
        said = [(j["qui"], j["texte"], j["accord"]) for j in c.data["poele"]["pilote"]["journal"]]
        self.assertEqual(said, [("hestia", "Hestia arrêterait le poêle.", None), ("maison", "La maison a éteint le poêle.", True),
                                ("hestia", "Hestia demanderait votre accord pour démarrer le poêle (saison douce).", None)])
        self.assertEqual(c.data["poele"]["pilote"]["accord_jour"], {"oui": 1, "sur": 1})
        self.assertTrue(c.pilot_memory["saison_douce"])
        self.assertNotIn("journal", card_view(c.data)["poele"]["pilote"])
        self.assertEqual(self.calls, [], "the pilot in the shade never calls a service")
        with self.assertRaises(ValueError):
            await c.async_set_settings({"pilote": "actif"})
        await c.async_set_settings({"pilote": "eteint"})
        await hass.async_block_till_done()
        self.assertEqual(c.data["poele"]["pilote"], {"mode": "eteint"})
        self.assertTrue(await hass.config_entries.async_unload(entry.entry_id))

    async def test_the_pilot_reads_the_house_on_the_thermometer_chosen(self):
        """The pilot weighs the house on the automations' own sensor once chosen, else on the rooms' average."""
        hass = self.hass
        hass.states.async_set("sensor.temperature_moyenne_maison", "17.2", {"device_class": "temperature",
                              "unit_of_measurement": "°C", "friendly_name": "Température moyenne maison"})
        hass.states.async_set("sensor.cave", "12", {"device_class": "temperature", "unit_of_measurement": "°C",
                                                    "friendly_name": "Cave"})
        # The stove's own temperatures are never offered.
        hass.states.async_set("sensor.poele_smoke_temperature", "140", {"device_class": "temperature"})
        entry, c = await self._setup()
        offered = [t["entity_id"] for t in c.found.thermometers]
        self.assertEqual(offered[:2], ["sensor.temperature_moyenne_maison", "sensor.cave"])
        self.assertNotIn("sensor.poele_smoke_temperature", offered)
        average = c.data["poele"]["pilote"]["maison_c"]
        self.assertEqual(average, c.data["maison"]["temperature"])
        self.assertIsNone(c.data["poele"]["pilote"]["thermometre"])
        await c.async_set_settings({"pilote_thermometre": "sensor.temperature_moyenne_maison"})
        await hass.async_block_till_done()
        p = c.data["poele"]["pilote"]
        self.assertEqual((p["maison_c"], p["thermometre"], p["thermometre_lu"]), (17.2, "Température moyenne maison", True))
        # Listened to: a change of the sensor is weighed at once.
        hass.states.async_set("sensor.temperature_moyenne_maison", "unavailable", {"device_class": "temperature",
                              "friendly_name": "Température moyenne maison"})
        await asyncio.sleep(1.5)
        await hass.async_block_till_done()
        p = c.data["poele"]["pilote"]
        self.assertEqual((p["maison_c"], p["thermometre_lu"]), (None, False))
        with self.assertRaises(ValueError):
            await c.async_set_settings({"pilote_thermometre": "climate.vt_poele"})
        await c.async_set_settings({"pilote_thermometre": None})
        await hass.async_block_till_done()
        self.assertEqual(c.data["poele"]["pilote"]["maison_c"], average)
        self.assertEqual(self.calls, [])
        self.assertTrue(await hass.config_entries.async_unload(entry.entry_id))

    async def test_the_pilot_keeps_its_journal_a_week_through_a_restart(self):
        """The pilot's journal of the last 7 days is kept in the planning's state: a restart loses nothing."""
        from homeassistant.helpers.storage import Store
        from custom_components.hestia_heating.const import PLANNING_STATE_KEY
        today = dt_util.now().date()
        day = lambda n: (today - timedelta(days=n)).isoformat()  # noqa: E731
        old = [
            {"jour": day(8), "heure": "07:00", "qui": "maison", "texte": "La maison a démarré le poêle.", "accord": False},
            {"jour": day(2), "heure": "07:00", "qui": "hestia", "texte": "Hestia démarrerait le poêle.", "accord": None},
            {"jour": day(2), "heure": "07:01", "qui": "maison", "texte": "La maison a démarré le poêle.", "accord": True},
            {"jour": day(1), "heure": "21:00", "qui": "hestia", "texte": "Hestia garderait la flamme 3.", "accord": None},
            {"jour": day(1), "heure": "21:05", "qui": "maison", "texte": "La maison a mis la flamme 2.", "accord": False},
        ]
        await Store(self.hass, 1, PLANNING_STATE_KEY).async_save({"thermostats": {}, "pilote": {}, "journal_pilote": old})
        entry, c = await self._setup()
        week = c.data["poele"]["pilote"]["accord_semaine"]
        self.assertEqual((week["oui"], week["sur"], week["depuis"]), (1, 2, day(2)), "the 8-day-old gesture is dropped")
        self.assertEqual(week["ecarts"], [{"jour": day(1), "heure": "21:05", "texte": "La maison a mis la flamme 2.",
                                           "hestia": "Hestia garderait la flamme 3."}])
        self.assertEqual(c.data["poele"]["pilote"]["accord_jour"], {"oui": 0, "sur": 0})
        self.assertTrue(all(j["jour"] == today.isoformat() for j in c.data["poele"]["pilote"]["journal"]))
        self.assertEqual(len(c.pilot_journal), 4 + sum(1 for j in c.pilot_journal if j["jour"] == today.isoformat()))
        self.assertNotIn("accord_semaine", card_view(c.data)["poele"]["pilote"])
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_setting_changes_what_is_read(self):
        entry, c = await self._setup()
        await c.async_set_settings({"sources": {"climate.vt_bureau": False}})
        await self.hass.async_block_till_done()
        self.assertEqual([r["id"] for r in c.data["pieces"]], ["sejour"])
        await c.async_set_settings({"poele_prise": None, "extensions": {"suivi_stock_pellet": False}})
        await self.hass.async_block_till_done()
        self.assertIsNone(c.data["granules"])
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))


class CopiedHouse(SendsThePlanning, HomeAssistantWithAHouse):
    """The same house copied by Remote Home Assistant, as in the lab: no device, no room, no integration of its own.
    The thermostats say they are Versatile Thermostats by their attributes, the stove by the ids of its entities."""

    def _house(self):
        hass = self.hass
        entities = er.async_get(hass)
        hass.config.components.add("remote_homeassistant")

        def copy(entity_id, state, attrs):
            domain, object_id = entity_id.split(".")
            entities.async_get_or_create(domain, "remote_homeassistant", entity_id, suggested_object_id=object_id)
            hass.states.async_set(entity_id, state, attrs)

        for c in m.climates()[:3]:
            copy(c["entity_id"], c["state"], c["attributes"])
        stems = {"etat": "sensor.essai_status", "alarme": "sensor.essai_alarm", "fumees": "sensor.essai_smoke_temperature",
                 "flamme": "number.essai_power", "flamme_reelle": "sensor.essai_real_power",
                 "ecritures": "sensor.sejour_essai_eeprom_writes_today", "eco_stop": "switch.essai_essai_eco_stop"}
        for role, r in m.stove()["roles"].items():
            copy(stems[role], r["state"], {})
        for climate in ("climate.essai", "climate.essai_vent_front"):
            copy(climate, "off", {"current_temperature": 19.5, "hvac_modes": ["off", "heat"], "friendly_name": climate[8:]})
        # Not the stove: a washing machine with a status but no flame.
        copy("sensor.lave_linge_status", "Arrêt", {})
        # Not the stove's plug: the power its thermostat reckons, and a power named after the stove that is no plug.
        copy("sensor.vt_poele_mean_power_cycle", "0", {"device_class": "power", "friendly_name": "Thermostat poêle"})
        copy("sensor.poele_conso_estimee", "0", {"device_class": "power", "friendly_name": "Poêle estimé"})
        copy("sensor.prise_du_poele_puissance", "42", {"device_class": "power", "friendly_name": "Prise poêle"})
        for key, r in m.pellets().items():
            copy(r["entity_id"], r["state"], {**r["attributes"], "suivi_stock_pellet_key": key})

    async def test_it_finds_the_house_and_says_it(self):
        entry, c = await self._setup()
        d = c.data
        self.assertEqual(d["poele"]["etat"], "chauffe")
        self.assertEqual(d["poele"]["flamme"], 3)
        self.assertEqual(d["poele"]["ecritures"], 4)
        self.assertEqual(d["poele"]["thermostat"], "climate.vt_poele")
        self.assertEqual(d["poele"]["prise"], "sensor.prise_du_poele_puissance")
        self.assertNotIn("sensor.vt_poele_mean_power_cycle", {p["entity_id"] for p in c.found.plugs})
        self.assertEqual(d["poele"]["nom"], "Essai")
        # The stove's own climates are not thermostats of the house; each thermostat without a room is its own.
        ids = {s["id"] for s in d["sources"]}
        self.assertEqual(ids, {"climate.vt_poele", "climate.vt_sejour", "climate.vt_bureau"})
        self.assertEqual({s["id"]: s["type"] for s in d["sources"]}["climate.vt_poele"], "poele")
        self.assertEqual(len(d["pieces"]), 3)
        self.assertTrue(d["maison"]["titre"].startswith("Le poêle chauffe, flamme 3."), d["maison"]["titre"])
        vt = next(e for e in d["extensions"] if e["id"] == "versatile_thermostat")
        self.assertEqual((vt["trouve"], vt["installee"]), (3, True))
        self.assertEqual(d["granules"]["jours"], 50)
        self.assertEqual(self.calls, [], "nothing is sent while the planning Hestia does not command")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_change_of_a_thermostat_is_followed(self):
        entry, c = await self._setup()
        attrs = dict(self.hass.states.get("climate.vt_bureau").attributes, hvac_action="idle", power_percent=0)
        self.hass.states.async_set("climate.vt_bureau", "heat", attrs)
        await asyncio.sleep(1.5)
        await self.hass.async_block_till_done()
        self.assertEqual(c.data["maison"]["titre"], "Le poêle chauffe, flamme 3.")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_copied_thermostat_is_never_sent_anything(self):
        """A lab copies the home: an order to a copied thermostat could reach the real one."""
        entry, c = await self._planning("climate.vt_sejour")
        self.assertEqual(self.sent, [])
        self.assertEqual(c.journal[-1]["statut"], "recopie")
        self.assertTrue(c.data["planning"]["labo"])
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))


if __name__ == "__main__":
    unittest.main()
