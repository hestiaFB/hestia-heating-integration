"""The brick's health (1.1.0b6, engine/health.py): what is a souci, when it is said, and « réglé »."""
import unittest
from datetime import datetime, timedelta

from custom_components.hestia_heating.engine import health

NOW = datetime(2026, 11, 27, 12, 0)


def plain(text):
    """The texts keep « 11 h 49 » on one line with no-break spaces."""
    return text.replace("\u00a0", " ")


def down(minutes, name="Vitesse Ventilateur", spare=None):
    return {"indisponibles": [{"entite": "climate.poele_vent_front", "nom": name,
                               "depuis": (NOW - timedelta(minutes=minutes)).isoformat(), "remplace_par": spare}]}


class Health(unittest.TestCase):

    def test_an_entity_unavailable_for_ten_minutes_is_said_once(self):
        shown, mem, orders = health.check(down(5), {}, NOW)
        self.assertEqual((shown, orders), ([], []), "a restart's minutes are not a souci")
        shown, mem, orders = health.check(down(11), mem, NOW)
        self.assertEqual([s["sujet"] for s in shown], ["indisponible"])
        self.assertEqual(plain(shown[0]["texte"]), "Vitesse Ventilateur ne répond plus depuis 11 h 49.")
        self.assertEqual([(o["geste"], o["sujet"], o["persistante"]) for o in orders],
                         [("notifier", "sante_indisponible", True)])
        # The next looks show it again, without saying it again.
        shown, mem, orders = health.check(down(20), mem, NOW + timedelta(minutes=1))
        self.assertEqual((len(shown), orders), (1, []))
        # It answers again: out of Home Assistant's notifications, and one last message on the phones.
        shown, mem, orders = health.check({}, mem, NOW + timedelta(minutes=2))
        self.assertEqual(shown, [])
        self.assertEqual([(o["geste"], o["sujet"]) for o in orders],
                         [("effacer", "sante_indisponible"), ("notifier", "sante_indisponible_regle")])
        self.assertEqual(orders[1]["texte"], "Les entités du poêle répondent de nouveau.")
        self.assertNotIn("indisponible", mem)

    def test_a_restart_does_not_say_reglé_before_it_is_true(self):
        _, mem, _ = health.check(down(30), {}, NOW)
        # After a restart, the entity is unavailable again, since the restart: neither a souci nor « réglé ».
        shown, mem, orders = health.check(down(2), mem, NOW)
        self.assertEqual((shown, orders), ([], []))
        self.assertTrue(mem["indisponible"]["dit"])

    def test_a_spare_that_answers_is_said(self):
        shown, _, _ = health.check(down(15, spare="Ventilateur principal"), {}, NOW)
        self.assertEqual(plain(shown[0]["texte"]), "Vitesse Ventilateur (Hestia lit Ventilateur principal à sa place) "
                                            "ne répond plus depuis 11 h 45.")

    def test_two_entities_are_said_together(self):
        facts = down(15)
        facts["indisponibles"].append({"entite": "sensor.poele_fumees", "nom": "Fumées",
                                       "depuis": (NOW - timedelta(minutes=12)).isoformat()})
        shown, _, orders = health.check(facts, {}, NOW)
        self.assertEqual(plain(shown[0]["texte"]), "Vitesse Ventilateur et Fumées ne répondent plus depuis 11 h 45.")
        self.assertEqual(len(orders), 1)

    def test_the_fan_that_does_not_follow(self):
        fan = {"ventilation": {"voulu": "2", "actuel": "5", "a": (NOW - timedelta(minutes=10)).isoformat()}}
        self.assertEqual(health.check(fan, {}, NOW)[0], [])
        fan["ventilation"]["a"] = (NOW - timedelta(minutes=16)).isoformat()
        shown, _, _ = health.check(fan, {}, NOW)
        self.assertEqual(plain(shown[0]["texte"]), "La ventilation reste à 5 : Hestia a demandé 2 à 11 h 44, le poêle n’a pas suivi.")
        fan["ventilation"]["actuel"] = "2"
        self.assertEqual(health.check(fan, {}, NOW)[0], [])

    def test_a_frozen_probe_while_the_stove_burns(self):
        probe = {"sonde": {"valeur": 20.5, "en_chauffe": True, "nom": "Salon"}}
        _, mem, _ = health.check(probe, {}, NOW)
        self.assertEqual(health.check(probe, mem, NOW + timedelta(hours=1))[0], [])
        shown, mem2, _ = health.check(probe, mem, NOW + timedelta(hours=2, minutes=1))
        self.assertEqual(plain(shown[0]["texte"]), "La température de Salon n’a pas bougé depuis 12 h alors que le poêle "
                                            "chauffe : sa sonde est peut-être figée.")
        # The stove off: a room may stay at the same temperature.
        off = {"sonde": {**probe["sonde"], "en_chauffe": False}}
        self.assertEqual(health.check(off, mem, NOW + timedelta(hours=3))[0], [])
        # It moves: the count starts again.
        moved = {"sonde": {**probe["sonde"], "valeur": 20.6}}
        self.assertEqual(health.check(moved, mem2, NOW + timedelta(hours=3))[0], [])

    def test_the_recorder_and_the_other_bricks(self):
        facts = {"non_enregistres": ["les granulés brûlés (sensor.hestia_heating_poele_granules_brules)"],
                 "briques": ["Hestia Weather ne donne pas son lieu : le froid à venir n’est pas compté."]}
        shown, mem, _ = health.check(facts, {}, NOW)
        self.assertEqual([s["sujet"] for s in shown], ["enregistrement"], "the recorder at once, a brick after 10 min")
        self.assertIn("n’enregistre pas les granulés brûlés", shown[0]["texte"])
        shown, mem, _ = health.check(facts, mem, NOW + timedelta(minutes=10))
        self.assertEqual([s["sujet"] for s in shown], ["enregistrement", "briques"])

    def test_nothing_is_sent_for_a_copied_stove_nor_while_home_assistant_starts(self):
        """CLAUDE.md, rule 4: at the lab, the lines show, nothing is sent."""
        shown, mem, orders = health.check({**down(30), "copie": True}, {}, NOW)
        self.assertEqual((len(shown), orders), (1, []))
        self.assertEqual(health.check({}, mem, NOW)[2], [], "nor « réglé »")
        self.assertEqual(health.check({**down(30), "pret": False}, {}, NOW), ([], {}, []))


if __name__ == "__main__":
    unittest.main()
