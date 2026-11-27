"""The stove's profile: data only, its words translated, never guessed."""
import json
import unittest

from maison_fictive import BRICK, PROFILE
from engine import profiles


class Profile(unittest.TestCase):
    def test_every_profile_is_read_and_says_its_integration(self):
        files = sorted((BRICK / "profiles").glob("*.json"))
        self.assertTrue(files)
        loaded = profiles.load_all(BRICK / "profiles")
        self.assertEqual(len(loaded), len(files))
        for p in loaded:
            self.assertTrue(p.integration and p.name)
            # Every word maps to one of the brick's states, and a word is never in two of them.
            states = json.loads((BRICK / "profiles" / f"{p.id}.json").read_text(encoding="utf-8"))["etats"]
            self.assertLessEqual(set(states), set(profiles.STATES))
            words = [w for ws in states.values() for w in ws]
            self.assertEqual(len(words), len(set(words)))

    def test_the_stoves_words_in_french_and_in_english(self):
        for text, state in (("On", "chauffe"), ("Allumage", "allumage"), ("Starting", "allumage"), ("Off", "eteint"),
                            ("Éteindre", "eteint"), ("Nettoyage", "nettoyage"), ("Extinction", "extinction"),
                            ("MEM. ALARM", "alarme")):
            self.assertEqual(PROFILE.translate(text), (state, True), text)

    def test_an_unknown_word_stays_unknown(self):
        self.assertEqual(PROFILE.translate("Mot nouveau"), ("inconnu", False))
        self.assertEqual(PROFILE.translate(None)[0], "inconnu")
        self.assertEqual(PROFILE.translate("unavailable")[0], "inconnu")

    def test_the_alarm(self):
        self.assertIs(PROFILE.alarm("OK"), False)
        self.assertIs(PROFILE.alarm("Sonde fumées"), True)
        self.assertIsNone(PROFILE.alarm("unavailable"))

    def test_each_role_finds_its_entity_and_the_shortest_id_wins(self):
        entities = [{"entity_id": e} for e in ("climate.poele", "climate.poele_vent_front", "sensor.poele_status",
                                               "number.poele_power", "sensor.poele_real_power", "switch.poele_eco_stop",
                                               "sensor.poele_smoke_temperature")]
        found = profiles.match(PROFILE, entities)
        self.assertEqual(found["thermostat"], "climate.poele")
        self.assertEqual(found["flamme"], "number.poele_power")
        self.assertEqual(found["flamme_reelle"], "sensor.poele_real_power")
        self.assertEqual(found["etat"], "sensor.poele_status")
        self.assertNotIn("alarme", found)

    def test_the_fan_falls_back_on_the_main_one_when_the_front_one_is_dead(self):
        """1.1.0b5: on 26 November the stove's integration stopped giving `_vent_front` after a restart (unavailable)
        while `_vent_main` answered: the fan's role goes to the first end that answers, the front one first."""
        entities = [{"entity_id": e} for e in ("climate.poele", "climate.poele_vent_front", "climate.poele_vent_main",
                                               "sensor.poele_status", "number.poele_power")]
        self.assertEqual(profiles.match(PROFILE, entities)["ventilation"], "climate.poele_vent_front")
        both_alive = profiles.match(PROFILE, entities, lambda i: True)
        self.assertEqual(both_alive["ventilation"], "climate.poele_vent_front")
        front_dead = profiles.match(PROFILE, entities, lambda i: not i.endswith("_vent_front"))
        self.assertEqual(front_dead["ventilation"], "climate.poele_vent_main")
        self.assertEqual(front_dead["thermostat"], "climate.poele")
        self.assertEqual(profiles.spares(PROFILE, entities),
                         {"ventilation": ["climate.poele_vent_front", "climate.poele_vent_main"]})
        only_main = [e for e in entities if not e["entity_id"].endswith("_vent_front")]
        self.assertEqual(profiles.match(PROFILE, only_main)["ventilation"], "climate.poele_vent_main")
        self.assertEqual(profiles.spares(PROFILE, only_main), {})


if __name__ == "__main__":
    unittest.main()
