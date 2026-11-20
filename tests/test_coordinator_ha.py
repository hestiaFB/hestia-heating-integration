"""Hestia Chauffage in a real Home Assistant core, with a made-up house (maison_fictive.py): Versatile Thermostats in
two rooms, a Micronova stove by Agua IOT, its plug, Suivi Stock Pellet and Scheduler. It reads, publishes its few
entities and its interface, and never calls a service. Skipped without Home Assistant."""
from __future__ import annotations

import asyncio
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
        self.assertEqual(self.calls, [], "Hestia Chauffage 0.1 never calls a service")
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
        heard = []
        remove = api.add_listener(lambda: heard.append(1), brick="hestia_energy")
        attrs = dict(self.hass.states.get("climate.vt_bureau").attributes, current_temperature=18.6)
        self.hass.states.async_set("climate.vt_bureau", "heat", attrs)
        await asyncio.sleep(1.5)
        await self.hass.async_block_till_done()
        self.assertTrue(heard)
        remove()
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))
        self.assertEqual(api.sources(), [])

    async def test_the_cards_view_is_lighter(self):
        entry, c = await self._setup()
        view = card_view(c.data)
        self.assertEqual(set(view), set(CARD_KEYS))
        self.assertNotIn("extensions", view)
        self.assertNotIn("plannings", view["planning"])
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


class CopiedHouse(HomeAssistantWithAHouse):
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
            copy(climate, "off", {"current_temperature": 19.5, "hvac_modes": ["off", "heat"]})
        # Not the stove: a washing machine with a status but no flame.
        copy("sensor.lave_linge_status", "Arrêt", {})
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
        # The stove's own climates are not thermostats of the house; each thermostat without a room is its own.
        ids = {s["id"] for s in d["sources"]}
        self.assertEqual(ids, {"climate.vt_poele", "climate.vt_sejour", "climate.vt_bureau"})
        self.assertEqual({s["id"]: s["type"] for s in d["sources"]}["climate.vt_poele"], "poele")
        self.assertEqual(len(d["pieces"]), 3)
        self.assertTrue(d["maison"]["titre"].startswith("Le poêle chauffe, flamme 3."), d["maison"]["titre"])
        vt = next(e for e in d["extensions"] if e["id"] == "versatile_thermostat")
        self.assertEqual((vt["trouve"], vt["installee"]), (3, True))
        self.assertEqual(d["granules"]["jours"], 50)
        self.assertEqual(self.calls, [], "Hestia Chauffage 0.1 never calls a service")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))

    async def test_a_change_of_a_thermostat_is_followed(self):
        entry, c = await self._setup()
        attrs = dict(self.hass.states.get("climate.vt_bureau").attributes, hvac_action="idle", power_percent=0)
        self.hass.states.async_set("climate.vt_bureau", "heat", attrs)
        await asyncio.sleep(1.5)
        await self.hass.async_block_till_done()
        self.assertEqual(c.data["maison"]["titre"], "Le poêle chauffe, flamme 3.")
        self.assertTrue(await self.hass.config_entries.async_unload(entry.entry_id))


if __name__ == "__main__":
    unittest.main()
