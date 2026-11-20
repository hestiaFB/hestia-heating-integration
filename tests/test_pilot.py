"""The stove's pilot « à l'ombre » (engine/pilot.py and its part of the house view), without Home Assistant."""
from __future__ import annotations

from datetime import timedelta
import unittest

import maison_fictive as m
from engine import house, pilot

NOW = m.NOW                                      # Friday 20 November 2026, 21 h 40


def stove(etat="eteint", flamme=None, **more):
    base = {"etat": etat, "flamme_reglee": flamme, "flamme": flamme, "flamme_min": 1, "flamme_max": 5, "fumees": 30.0,
            "alarme": False, "alarme_texte": None, "ecritures": 4, "ecritures_max": 25, "prise_w": 3.0}
    return {**base, **more}


def thermostat(preset="eco", demand=0, room=19.0, target=21.0, slope=0.0, mode="heat", **more):
    return {"preset": preset, "mode": mode, "demande_pct": demand, "temperature": room, "consigne": target,
            "pente": slope, "securite": False, **more}


def seen(stove_now, thermostat_now, **mem):
    """The memory of a pilot that looked one minute ago."""
    return {"jour": NOW.date().isoformat(), "demarrages": 0, "etat": stove_now.get("etat"),
            "reglee": stove_now.get("flamme_reglee"), "preset": thermostat_now.get("preset"), **mem}


class Flame(unittest.TestCase):
    def test_the_demand_gives_the_flame_with_a_margin(self):
        self.assertEqual([pilot.flame_for(d, None) for d in (20, 45, 64, 65, 85, 100)], [2, 3, 3, 4, 5, 5])
        self.assertEqual(pilot.flame_for(70, 3), 3)        # 3 holds from 38 % to 72 %
        self.assertEqual(pilot.flame_for(73, 3), 4)
        self.assertEqual(pilot.flame_for(39, 3), 3)
        self.assertEqual(pilot.flame_for(37, 3), 2)
        self.assertIsNone(pilot.flame_for(None, 3))

    def test_down_at_once_up_at_most_every_half_hour(self):
        s, t = stove("chauffe", 4), thermostat("boost", demand=50)
        decision, mem, events = pilot.decide(s, t, seen(s, t), NOW)
        self.assertEqual((decision["action"], decision["flamme"], decision["titre"]), ("flamme", 3, "Flamme 4 → 3"))
        self.assertEqual(events[0]["texte"], "Hestia mettrait la flamme à 3.")
        self.assertFalse(decision["accord"])
        # Ten minutes after a raise, the demand asks one step more: it waits.
        s, t = stove("chauffe", 3), thermostat("boost", demand=80)
        mem = seen(s, t, cible=3, hausse=(NOW - timedelta(minutes=10)).isoformat())
        decision, _, _ = pilot.decide(s, t, mem, NOW)
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 3))
        self.assertIn("Il monterait dans 21 min", decision["texte"])
        # Two steps behind: at once.
        decision, _, _ = pilot.decide(s, thermostat("boost", demand=95), mem, NOW)
        self.assertEqual(decision["flamme"], 5)

    def test_flame_one_before_the_room_passes_its_set_point(self):
        s, t = stove("chauffe", 3), thermostat("boost", demand=90, room=21.4, slope=0.8)
        decision, _, _ = pilot.decide(s, t, seen(s, t), NOW)
        self.assertEqual(decision["flamme"], 1)
        self.assertIn("21,6 °C dans 15 min", decision["texte"])

    def test_it_keeps_four_orders_to_stop_the_stove(self):
        s, t = stove("chauffe", 4, ecritures=21), thermostat("boost", demand=50)
        decision, _, _ = pilot.decide(s, t, seen(s, t), NOW)
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 4))
        self.assertIn("Plus que 4 ordres", decision["texte"])


class StartAndStop(unittest.TestCase):
    def test_the_step_up_to_boost_starts_it_once_a_day(self):
        s = stove()
        decision, mem, events = pilot.decide(s, thermostat("boost"), seen(s, thermostat("eco")), NOW)
        self.assertEqual(decision["action"], "demarrer")
        self.assertEqual([e["texte"] for e in events], ["Hestia démarrerait le poêle."])
        self.assertEqual(mem["demarrages"], 1)
        # Back to frost, then boost again the same day: the stove never relights on its own.
        mem["preset"] = "frost"
        mem["demarrage"] = (NOW - timedelta(hours=2)).isoformat()
        decision, _, _ = pilot.decide(s, thermostat("boost"), mem, NOW)
        self.assertEqual(decision["action"], "refuser")
        self.assertIn("déjà démarré une fois aujourd’hui", decision["texte"])

    def test_no_start_on_first_sight_nor_in_a_warm_room(self):
        decision, _, events = pilot.decide(stove(), thermostat("boost"), {}, NOW)
        self.assertEqual((decision["action"], events), ("attendre", []))
        s = stove()
        decision, _, _ = pilot.decide(s, thermostat("boost", room=21.6), seen(s, thermostat("eco")), NOW)
        self.assertEqual(decision["action"], "refuser")
        self.assertIn("la pièce est déjà à 21,6 °C pour 21 °C visés", decision["texte"])

    def test_the_house_starts_it_in_the_same_minute(self):
        before = stove()
        decision, mem, events = pilot.decide(stove("allumage", 3), thermostat("boost"), seen(before, thermostat("eco")), NOW)
        self.assertEqual(decision["action"], "attendre")
        self.assertEqual([(e["qui"], e["accord"]) for e in events], [("hestia", None), ("maison", True)])

    def test_frost_stops_it_and_the_house_agrees(self):
        s, t = stove("chauffe", 3), thermostat("frost")
        decision, mem, events = pilot.decide(s, t, seen(s, thermostat("boost")), NOW)
        self.assertEqual(decision["action"], "arreter")
        self.assertEqual(events[0]["texte"], "Hestia arrêterait le poêle.")
        decision, mem, events = pilot.decide(stove("extinction", 3), t, mem, NOW + timedelta(minutes=1))
        self.assertEqual([(e["texte"], e["accord"]) for e in events], [("La maison a éteint le poêle.", True)])
        decision, _, _ = pilot.decide(stove("eteint", 3, fumees=45.0, prise_w=2.0), t, mem, NOW + timedelta(minutes=40))
        self.assertIn("Arrêt confirmé", decision["texte"])


class Safety(unittest.TestCase):
    def test_an_alarm_or_a_silent_stove_is_cut(self):
        s, t = stove("chauffe", 3, alarme=True, alarme_texte="Pellet"), thermostat("boost", demand=50)
        decision, _, events = pilot.decide(s, t, seen(stove("chauffe", 3), t), NOW)
        self.assertEqual((decision["action"], decision["ton"]), ("couper", "alert"))
        self.assertIn("en alarme (Pellet)", events[0]["texte"])
        quiet = stove("inconnu", None)
        decision, mem, _ = pilot.decide(quiet, t, seen(stove("chauffe", 3), t), NOW)
        self.assertEqual(decision["action"], "attendre")
        decision, _, _ = pilot.decide(quiet, t, mem, NOW + timedelta(minutes=16))
        self.assertEqual(decision["texte"], "Le poêle ne répond plus depuis 15 minutes.")

    def test_a_room_far_above_its_set_point(self):
        s, t = stove("chauffe", 2), thermostat("boost", demand=0, room=23.2)
        decision, _, _ = pilot.decide(s, t, seen(s, t), NOW)
        self.assertEqual(decision["action"], "couper")
        self.assertIn("2,2 °C au-dessus", decision["texte"])


class TheHouseView(unittest.TestCase):
    def test_the_stove_says_what_hestia_would_do(self):
        view = house.build(m.snapshot())
        p = view["poele"]["pilote"]
        self.assertEqual((p["mode"], p["action"], p["flamme"], p["maison"]), ("ombre", "garder", 3, "flamme 3"))
        self.assertTrue(p["accord"])
        self.assertEqual(view["_pilote"]["evenements"], [])

    def test_switched_off_it_says_nothing(self):
        view = house.build(m.snapshot(pilote="eteint"))
        self.assertEqual(view["poele"]["pilote"], {"mode": "eteint"})
        self.assertIsNone(view["_pilote"])


if __name__ == "__main__":
    unittest.main()
