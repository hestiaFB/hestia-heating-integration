"""The house in one sentence, room by room, from a made-up house: what the tab and the card say."""
from datetime import timedelta
import unittest

import maison_fictive as m
from engine import house


class House(unittest.TestCase):
    def setUp(self):
        self.view = house.build(m.snapshot())
        self.rooms = {r["id"]: r for r in self.view["pieces"]}

    def test_the_sentence_names_the_stove_its_flame_and_the_help(self):
        h = self.view["maison"]
        self.assertEqual(h["etat"], "chauffe")
        self.assertEqual(h["titre"], "Le poêle chauffe, flamme 3. Un radiateur en appoint. La clim rafraîchit une pièce.")
        self.assertIn("Cette nuit −3 °C dehors.", h["texte"])
        self.assertIn("Prochain changement à 22 h 30 : bureau et chambre d’amis éco.", h["texte"])

    def test_the_stove_draws_no_electricity(self):
        # Only the office's radiator counts: the stove's thermostat drives a stove, not a heater.
        self.assertEqual(self.view["maison"]["electrique_w"], 600)
        stove_source = next(s for s in self.view["sources"] if s["id"] == "climate.vt_poele")
        self.assertEqual(stove_source["type"], "poele")
        self.assertIsNone(stove_source["puissance_w"])

    def test_the_stoves_room_comes_first_then_by_name(self):
        self.assertEqual([r["id"] for r in self.view["pieces"]], ["sejour", "atelier", "bureau", "amis"])
        living = self.rooms["sejour"]
        self.assertTrue(living["poele"])
        self.assertEqual(living["badge"], {"texte": "poêle · flamme 3", "ton": "stove"})
        self.assertEqual(living["consigne"], 21.0)
        self.assertIn("Électrique en appoint seulement sous 17 °C", living["raison"])

    def test_each_room_says_what_it_does(self):
        self.assertEqual(self.rooms["bureau"]["badge"], {"texte": "chauffe · 0,6 kW", "ton": "heat"})
        self.assertEqual(self.rooms["bureau"]["raison"], "Confort jusqu’à 22 h 30, puis éco")
        self.assertEqual(self.rooms["amis"]["badge"]["texte"], "fenêtre ouverte")
        self.assertEqual(self.rooms["amis"]["etat"], "repos")
        self.assertEqual(self.rooms["atelier"]["etat"], "rafraichit")
        self.assertEqual(self.rooms["atelier"]["badge"]["ton"], "cold")

    def test_the_stove_and_its_pellets(self):
        s = self.view["poele"]
        self.assertEqual((s["etat"], s["en_feu"], s["flamme"], s["flamme_max"]), ("chauffe", True, 3, 5))
        self.assertEqual(s["thermostat"], "climate.vt_poele")
        self.assertEqual(s["demande_pct"], 60)
        self.assertTrue(s["prise_tourne"])
        self.assertEqual(s["ecritures"], 4)
        self.assertEqual(s["ecritures_max"], 25)
        g = self.view["granules"]
        # 90 kg in 30 days of use: 3 kg a day, 150 kg left.
        self.assertEqual((g["kg_par_jour"], g["jours"], g["stock_sacs"]), (3.0, 50, 10.0))

    def test_the_smoothed_temperature_of_a_versatile_thermostat(self):
        from engine import sources
        read = lambda **extra: sources.read(m.vt("climate.vt_x", "X", "sejour", **extra))["temperature_lissee"]
        self.assertEqual(read(specific_states={"ema_temp": 20.4}), 20.4)
        self.assertEqual(read(ema_temp=20.6), 20.6)
        self.assertIsNone(read())

    def test_the_cold_to_come(self):
        self.assertEqual(self.view["dehors"]["nuit_min"], -3.0)
        self.assertIsNotNone(self.view["dehors"]["demain_max"])
        self.assertIsNone(house.build(m.snapshot(hourly=None))["dehors"])

    def test_nothing_heats(self):
        quiet = [m.vt("climate.vt_bureau", "Radiateur bureau", "bureau")]
        view = house.build(m.snapshot(stove=m.stove(status="Off"), climates=quiet))
        self.assertEqual(view["maison"]["titre"], "Rien ne chauffe en ce moment.")
        self.assertEqual(view["maison"]["etat"], "repos")
        self.assertEqual(view["poele"]["etat"], "eteint")

    def test_an_unknown_word_of_the_stove_is_shown_never_guessed(self):
        view = house.build(m.snapshot(stove=m.stove(status="Mot nouveau")))
        self.assertEqual((view["poele"]["etat"], view["poele"]["texte"], view["poele"]["a_traduire"]), ("inconnu", "Mot nouveau", True))
        self.assertFalse(view["poele"]["en_feu"])

    def test_a_thermostat_switched_off_in_reglages_is_no_longer_read(self):
        view = house.build(m.snapshot(disabled=["climate.clim_atelier"]))
        self.assertNotIn("atelier", [r["id"] for r in view["pieces"]])
        self.assertNotIn("clim", view["maison"]["titre"])

    def test_the_stoves_thermostat_chosen_in_reglages_wins(self):
        view = house.build(m.snapshot(stove_thermostat="climate.vt_sejour"))
        self.assertEqual(view["poele"]["thermostat"], "climate.vt_sejour")

    def test_a_copied_versatile_thermostat_is_still_one(self):
        # Copied by Remote Home Assistant (a lab), a thermostat's platform is no longer Versatile Thermostat's.
        copied = [dict(c, platform="remote_homeassistant") for c in m.climates()]
        view = house.build(m.snapshot(climates=copied))
        self.assertEqual(view["poele"]["thermostat"], "climate.vt_poele")
        self.assertEqual(view["maison"]["electrique_w"], 600)

    def test_no_stove(self):
        # Without its integration the stove is not guessed: its thermostat is one more thermostat heating.
        view = house.build(m.snapshot(stove=None, pellets=None))
        self.assertIsNone(view["poele"])
        self.assertIsNone(view["granules"])
        self.assertEqual(view["maison"]["titre"], "Deux radiateurs chauffent. La clim rafraîchit une pièce.")

    def test_the_sources_for_the_other_bricks(self):
        keys = {"id", "nom", "type", "piece", "etat", "puissance_w", "demande_pct", "energie_stat", "granules_stat"}
        for s in self.view["sources"]:
            self.assertLessEqual(keys, set(s))

    def test_quick_enough_for_a_small_box(self):
        # Rebuilt at each change of a thermostat: far under the 0.1 s a Home Assistant loop may be held.
        import time
        snap = m.snapshot()
        started = time.perf_counter()
        for _ in range(20):
            house.build(snap)
        self.assertLess((time.perf_counter() - started) / 20, 0.02)


class Planning(unittest.TestCase):
    def test_the_day_of_each_room_and_of_the_stove(self):
        p = house.build(m.snapshot())["planning"]
        lanes = {l["id"]: l for l in p["lignes"]}
        stove = lanes[next(i for i in lanes if lanes[i]["nom"] == "Poêle")]
        self.assertEqual([s["ton"] for s in stove["segments"]], ["hors_gel", "poele", "hors_gel", "poele", "hors_gel"])
        for lane in p["lignes"]:
            self.assertEqual(lane["segments"][0]["de"], 0)
            self.assertEqual(lane["segments"][-1]["a"], 1440)
        self.assertEqual(p["maintenant_min"], 21 * 60 + 40)
        self.assertEqual(p["prochains"][0]["heure"], "22 h 30")
        self.assertEqual(p["prochains"][1]["texte"], "poêle hors gel")

    def test_a_schedule_switched_off_is_not_followed(self):
        off = [m.planning.parse(s.id, s.name, "off", {"entities": list(s.targets), "weekdays": list(s.days),
                                                      "timeslots": [], "actions": []}) for s in m.schedules()]
        p = house.build(m.snapshot(schedules=off))["planning"]
        self.assertEqual(p["prochains"], [])

    def test_tomorrow_morning_is_said_tomorrow(self):
        late = house.build(m.snapshot(now=m.NOW + timedelta(hours=1, minutes=30)))
        self.assertTrue(any(n["texte"].startswith("poêle") and "demain" in n["heure"] for n in late["planning"]["prochains"]))


if __name__ == "__main__":
    unittest.main()
