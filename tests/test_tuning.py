"""The stove's figures (engine/tuning.py, 1.0.0b3, Réglages › Poêle à granulés › Avancé): their bounds, the engine
reading them at the time it decides, the stove's own set point and ÉCO Stop sent before a start; the flame left to the
user while Hestia lights and stops the stove; the fan by Hestia outside « Entier »; what a thermostat drives, chosen."""
from __future__ import annotations

from datetime import timedelta
import unittest

import maison_fictive as m
from engine import driver, granules, house, pilot, tuning

NOW = m.NOW


class Figures(unittest.TestCase):
    def tearDown(self):
        tuning.set_values(None)

    def test_a_figure_never_set_is_its_default(self):
        self.assertEqual(tuning.get("palier_5"), 85)
        self.assertEqual(tuning.minutes("verif_min"), timedelta(minutes=5))
        self.assertEqual(tuning.seconds("recharge_s"), timedelta(seconds=20))
        self.assertIsNone(tuning.get("debit_3"))
        self.assertEqual(tuning.steps(), ((85, 5), (65, 4), (45, 3), (0, 2)))

    def test_only_known_numbers_within_their_bounds_are_saved(self):
        self.assertEqual(tuning.clean(None), {})
        self.assertEqual(tuning.clean({"garde": 5, "surchauffe_c": 27.5, "debit_2": None}),
                         {"garde": 5, "surchauffe_c": 27.5})
        for wrong, said in (({"garde": 1}, "gardés pour l’éteindre : entre 4 et 10, ou vide"),
                            ({"kwh_kg": 7}, "énergie d’un kilo : entre 3 et 6, ou vide"),
                            ({"arret_ecart_c": 0.1}, "éteindre à moins de : entre 0,2 et 3, ou vide"),
                            ({"echecs": True}, "rendre la main après : entre 1 et 3, ou vide"),
                            ({"echecs": "3"}, "rendre la main après : entre 1 et 3, ou vide"),
                            ({"inconnu": 3}, "réglage avancé inconnu : inconnu"),
                            ({"palier_4": 90}, "les paliers de la flamme doivent descendre : flamme 5, puis 4, puis 3")):
            with self.assertRaises(ValueError) as err:
                tuning.clean(wrong)
            self.assertEqual(str(err.exception), said)
        with self.assertRaises(ValueError):
            tuning.clean([1, 2])
        # Every figure has its words for Réglages, and its default within its own bounds.
        self.assertEqual(set(tuning.WORDS), set(tuning.SPEC))
        for key, (default, low, high) in tuning.SPEC.items():
            self.assertTrue(default is None or low <= default <= high, key)
        self.assertEqual(tuning.defaults()["garde"], [4, 4, 10])
        # The brick's promises and its safeties may only be made stricter.
        for key in ("flamme_max_jour", "echecs", "demarrages_max", "surchauffe_c", "alarme_min"):
            self.assertEqual(tuning.SPEC[key][0], tuning.SPEC[key][2], key)
        for key in ("ventil_rythme_min", "garde", "garde_ventil"):
            self.assertEqual(tuning.SPEC[key][0], tuning.SPEC[key][1], key)

    def test_set_values_keeps_numbers_only(self):
        tuning.set_values({"garde": 6, "marge": True, "inconnu": 2, "monter_min": "10"})
        self.assertEqual((tuning.get("garde"), tuning.get("marge"), tuning.get("monter_min")), (6, 7, 30))

    def test_the_flame_follows_the_steps_set_in_reglages(self):
        self.assertEqual(pilot.flame_for(70, None), 4)
        tuning.set_values({"palier_5": 68, "palier_4": 50, "palier_3": 30})
        self.assertEqual(pilot.flame_for(70, None), 5)
        self.assertEqual(pilot.flame_for(35, None), 3)

    def test_warm_enough_follows_its_gap(self):
        self.assertFalse(pilot.warm_enough(19.5, 21.0, "comfort"))
        tuning.set_values({"arret_ecart_c": 2})
        self.assertTrue(pilot.warm_enough(19.5, 21.0, "comfort"))
        self.assertFalse(pilot.warm_enough(19.5, 21.0, "boost"), "in boost, any gap still asks for the stove")

    def test_the_stoves_own_set_point_and_eco_stop_as_reglages_want_them(self):
        point = {"nom": "Consigne interne à 25 °C", "role": "thermostat", "attribut": "temperature", "valeur": 25,
                 "service": "climate.set_temperature", "donnees": {"temperature": 25}}
        eco = {"nom": "ECO Stop", "role": "eco_stop", "valeur": "on", "service": "switch.turn_on"}
        fan = {"nom": "Ventilation en AUTO", "role": "ventilation", "valeur": "AUTO"}
        self.assertEqual(tuning.stove_setting(point)["donnees"], {"temperature": 25})
        self.assertEqual(tuning.stove_setting(fan), fan)
        tuning.set_values({"consigne_poele": 22}, eco_stop=False)
        moved = tuning.stove_setting(point)
        self.assertEqual((moved["valeur"], moved["donnees"]), (22, {"temperature": 22}))
        self.assertEqual(point["valeur"], 25, "the profile's own setting is never changed")
        self.assertEqual({k: tuning.stove_setting(eco)[k] for k in ("valeur", "service")},
                         {"valeur": "off", "service": "switch.turn_off"})
        tuning.set_values({}, eco_stop=None)
        self.assertEqual(tuning.stove_setting(eco)["service"], "switch.turn_on")

    def test_the_pellets_burnt_and_the_heat_of_a_kilo(self):
        profile = {"allumage": 1.2, "flammes": [0.6, 0.8, 1.0, 1.3, 1.6]}
        self.assertEqual(tuning.rates(profile), profile)
        tuning.set_values({"debit_3": 1.1, "debit_allumage": 1.5})
        self.assertEqual(tuning.rates(profile), {"allumage": 1.5, "flammes": [0.6, 0.8, 1.1, 1.3, 1.6]})
        self.assertEqual(profile["flammes"][2], 1.0)
        self.assertEqual(tuning.rates({"flammes": [0.6]})["flammes"], [0.6, 0.6, 1.1])
        self.assertEqual(tuning.kwh_per_kg(), round(4.8 * 0.87, 3))
        self.assertEqual(granules.KWH_PER_KG, round(4.8 * 0.87, 3))
        tuning.set_values({"kwh_kg": 5, "rendement": 90})
        self.assertEqual(tuning.kwh_per_kg(), 4.5)


def burning(flame=3, fan="1", smoke=150.0, **more):
    return {"etat": "chauffe", "flamme": flame, "flamme_reglee": flame, "fumees": smoke, "ventilation": fan,
            "ventilation_niveaux": ["1", "2", "3", "4", "5"], "ecritures": 4, "ecritures_max": 25, **more}


class FanByHestia(unittest.TestCase):
    """« La ventilation : Automatique, par Hestia » while the house lights and stops the stove (1.0.0b3)."""

    def tearDown(self):
        tuning.set_values(None)

    def test_flame_plus_one_then_not_within_its_rhythm(self):
        mem: dict = {}
        orders, events, wake = driver.fan_only(burning(), mem, NOW, False)
        self.assertEqual([(o["geste"], o["valeur"]) for o in orders], [("ventilation", "4")])
        self.assertEqual(events[0]["texte"], "Hestia met la ventilation à 4 : flamme 3 + 1.")
        self.assertEqual(mem["ventilation_seule"]["voulu"], "4")
        orders, _, wake = driver.fan_only(burning(flame=4), mem, NOW + timedelta(minutes=4), False)
        self.assertEqual((orders, wake), ([], 360.0))
        orders, _, _ = driver.fan_only(burning(flame=4), mem, NOW + timedelta(minutes=10), False)
        self.assertEqual([o["valeur"] for o in orders], ["5"])

    def test_its_figures_come_from_reglages(self):
        tuning.set_values({"ventil_fumees_c": 160})
        orders, events, _ = driver.fan_only(burning(fan="3"), {}, NOW, False)
        self.assertEqual([o["valeur"] for o in orders], ["1"])
        self.assertEqual(events[0]["texte"], "Hestia met la ventilation à 1 : au plus bas tant que les fumées sont "
                                             "sous 160 °C.")

    def test_nothing_to_a_copy_nor_when_few_orders_are_left(self):
        mem = {"ventilation_seule": {"chaud": True}}
        self.assertEqual(driver.fan_only(burning(), mem, NOW, True), ([], [], None))
        self.assertNotIn("ventilation_seule", mem)
        self.assertEqual(driver.fan_only(burning(ecritures=19), {}, NOW, False)[0], [])


def stove_snapshot(**changes):
    snap = m.snapshot(**changes)
    roles = snap["stove"]["roles"]
    roles["ventilation"] = {"entity_id": "climate.poele_vent_front", "state": "heat",
                            "attributes": {"fan_mode": "1", "fan_modes": ["AUTO", "1", "2", "3", "4", "5"]},
                            "last_changed": m.NOW}
    return snap


class HouseSettings(unittest.TestCase):
    def test_the_flame_left_to_the_user_while_hestia_lights_and_stops(self):
        auto = house.build(m.snapshot(pilote="entier", conduite={}))
        self.assertIn("commande", auto["poele"]["pilote"])
        self.assertFalse(auto["poele"]["pilote"]["flamme_manuelle"])
        manual = house.build(m.snapshot(pilote="entier", flamme_manuelle=True, conduite={}))
        self.assertNotIn("commande", manual["poele"]["pilote"])
        self.assertIsNone(manual["_pilote"]["ordre"])
        self.assertTrue(manual["poele"]["pilote"]["flamme_manuelle"])
        # In « Conseil » the flame is the user's too; « flamme_manuelle » means nothing outside « Entier ».
        self.assertTrue(house.build(m.snapshot(pilote="ombre"))["poele"]["pilote"]["flamme_manuelle"])
        flame = house.build(m.snapshot(pilote="flamme", flamme_manuelle=True))
        self.assertIn("commande", flame["poele"]["pilote"])

    def test_the_fan_by_hestia_outside_entier(self):
        snap = stove_snapshot(pilote="ombre", conduite={"ventilation": "flamme"})
        view = house.build(snap)
        self.assertEqual([o["valeur"] for o in view["_pilote"]["ordres"]], ["4"])
        self.assertIn("ventilation_seule", view["_pilote"]["memoire"])
        # Not before Home Assistant runs, never to a copy, nothing when the fan is the stove's or the user's.
        self.assertEqual(house.build(stove_snapshot(pilote="ombre", conduite={"ventilation": "flamme"},
                                                    pret=False))["_pilote"]["ordres"], [])
        copied = stove_snapshot(pilote="flamme", conduite={"ventilation": "flamme"})
        copied["stove"]["copie"] = True
        self.assertEqual(house.build(copied)["_pilote"]["ordres"], [])
        for fan in ("auto", "manuel"):
            view = house.build(stove_snapshot(pilote="flamme", conduite={"ventilation": fan},
                                              pilote_memoire={"ventilation_seule": {"chaud": True}}))
            self.assertEqual(view["_pilote"]["ordres"], [])
            self.assertNotIn("ventilation_seule", view["_pilote"]["memoire"])

    def test_what_a_thermostat_drives_chosen_in_reglages(self):
        view = house.build(m.snapshot(types={"climate.vt_bureau": "plancher", "climate.vt_amis": "volcan"}))
        by_id = {s["id"]: s for s in view["sources"]}
        self.assertEqual((by_id["climate.vt_bureau"]["type"], by_id["climate.vt_bureau"]["type_devine"]),
                         ("plancher", "radiateur"))
        self.assertEqual(by_id["climate.vt_amis"]["type"], by_id["climate.vt_amis"]["type_devine"])

    def test_the_stoves_entities_read_with_their_age(self):
        s = house.build(m.snapshot())["poele"]
        read = {r["role"]: r for r in s["lues"]}
        self.assertEqual(read["flamme"]["entite"], "number.poele_power")
        self.assertEqual(read["flamme"]["valeur"], "3")
        self.assertTrue(read["flamme"]["vu"].startswith("2026-11-20T18:40"))


if __name__ == "__main__":
    unittest.main()
