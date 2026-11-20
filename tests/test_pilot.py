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
    return {"etat": stove_now.get("etat"),
            "reglee": stove_now.get("flamme_reglee"), "preset": thermostat_now.get("preset"),
            "mode": thermostat_now.get("mode"), **mem}


HOUSE_C = 17.5                                  # the house, cold enough to start without asking


def decide(s, t, mem, now=NOW, house_c=HOUSE_C):
    return pilot.decide(s, t, mem, now, house_c)


class Flame(unittest.TestCase):
    def test_the_demand_gives_the_flame_with_a_margin(self):
        self.assertEqual([pilot.flame_for(d, None) for d in (0, 20, 45, 64, 65, 85, 100)], [2, 2, 3, 3, 4, 5, 5])
        self.assertEqual(pilot.flame_for(71, 3), 3)        # 3 holds from 38 % to 71 %, like the house's rule
        self.assertEqual(pilot.flame_for(72, 3), 4)
        self.assertEqual(pilot.flame_for(38, 3), 3)
        self.assertEqual(pilot.flame_for(37, 3), 2)
        self.assertEqual(pilot.flame_for(3, 2), 2)
        self.assertEqual(pilot.flame_for(60, 1), 3)        # flame 1 is never held by the margin
        self.assertIsNone(pilot.flame_for(None, 3))

    def test_down_at_once_up_thirty_minutes_after_the_last_change(self):
        s, t = stove("chauffe", 4), thermostat("boost", demand=50)
        decision, mem, events = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"], decision["titre"]), ("flamme", 3, "Flamme 4 → 3"))
        self.assertEqual(events[0]["texte"], "Hestia mettrait la flamme à 3.")
        self.assertFalse(decision["accord"])
        # The stove's flame changed ten minutes ago (by anyone), the demand asks one step more: it waits.
        s = stove("chauffe", 3, flamme_depuis=(NOW - timedelta(minutes=10)).isoformat())
        t = thermostat("boost", demand=80)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 3))
        self.assertIn("Il monterait dans 21 min", decision["texte"])
        # Two steps apart: at once.
        decision, _, _ = decide(s, thermostat("boost", demand=95), seen(s, t))
        self.assertEqual(decision["flamme"], 5)
        # Half an hour after the last change: up.
        s = stove("chauffe", 3, flamme_depuis=(NOW - timedelta(minutes=31)).isoformat())
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual(decision["flamme"], 4)

    def test_it_modulates_while_the_stove_lights(self):
        s, t = stove("allumage", 2), thermostat("boost", demand=100)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("flamme", 5))

    def test_flame_one_before_the_room_passes_its_set_point_and_while_it_is_there(self):
        s, t = stove("chauffe", 3), thermostat("boost", demand=90, room=21.4, slope=0.8)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual(decision["flamme"], 1)
        self.assertIn("21,6 °C dans 15 min", decision["texte"])
        # A falling slope does not count: the demand's step again.
        decision, _, _ = decide(s, thermostat("boost", demand=60, room=21.4, slope=-2), seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 3))
        # At 1, it stays there while the room is at its set point; under it, back to the demand's step.
        s = stove("chauffe", 1)
        decision, _, _ = decide(s, thermostat("boost", demand=50, room=21.0), seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 1))
        decision, _, _ = decide(s, thermostat("boost", demand=50, room=20.8), seen(s, t))
        self.assertEqual(decision["flamme"], 3)

    def test_it_keeps_four_orders_to_stop_the_stove(self):
        s, t = stove("chauffe", 4, ecritures=21), thermostat("boost", demand=50)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 4))
        self.assertIn("21 ordres sur 25", decision["texte"])
        # A profile without a daily limit: 20, like the stove's extension.
        s = stove("chauffe", 4, ecritures=16, ecritures_max=None)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertIn("16 ordres sur 20", decision["texte"])

    def test_the_house_moves_the_flame(self):
        s, t = stove("chauffe", 3), thermostat("boost", demand=80)
        _, mem, _ = decide(s, t, seen(s, t))                         # Hestia would raise to 4
        _, _, events = decide(stove("chauffe", 4), t, mem, NOW + timedelta(minutes=1))
        self.assertEqual([(e["texte"], e["accord"]) for e in events], [("La maison a mis la flamme à 4.", True)])
        _, _, events = decide(stove("chauffe", 2), t, mem, NOW + timedelta(minutes=1))
        self.assertEqual([(e["texte"], e["accord"]) for e in events][-1], ("La maison a mis la flamme à 2.", False))


class StartAndStop(unittest.TestCase):
    def test_every_step_up_to_boost_starts_it(self):
        s = stove()
        decision, mem, events = decide(s, thermostat("boost"), seen(s, thermostat("eco")))
        self.assertEqual(decision["action"], "demarrer")
        self.assertEqual([e["texte"] for e in events], ["Hestia démarrerait le poêle."])
        # Back to frost, then boost again the same day (the evening's boost): it starts again.
        mem["preset"] = "frost"
        mem["demarrage"] = (NOW - timedelta(hours=2)).isoformat()
        decision, _, _ = decide(s, thermostat("boost"), mem)
        self.assertEqual(decision["action"], "demarrer")
        # On to heat while the thermostat is already in boost: it starts too.
        decision, _, _ = decide(s, thermostat("boost"), seen(s, thermostat("boost", mode="off")))
        self.assertEqual(decision["action"], "demarrer")

    def test_no_start_on_first_sight_nor_in_a_warm_house(self):
        decision, _, events = decide(stove(), thermostat("boost"), {})
        self.assertEqual((decision["action"], events), ("attendre", []))
        s = stove()
        decision, _, _ = decide(s, thermostat("boost"), seen(s, thermostat("eco")), house_c=21.0)
        self.assertEqual(decision["action"], "refuser")
        self.assertIn("la maison est à 21 °C pour 21 °C visés", decision["texte"])
        decision, _, _ = decide(s, thermostat("boost"), seen(s, thermostat("eco")), house_c=None)
        self.assertIn("la température de la maison est inconnue", decision["texte"])

    def test_refused_when_the_stove_or_its_room_is_not_safe(self):
        s, before = stove(), seen(stove(), thermostat("eco"))
        for case, text in ((dict(stove=stove(alarme=True, alarme_texte="Pellet")), "en alarme (Pellet)"),
                           (dict(stove=stove("inconnu")), "le poêle ne répond pas"),
                           (dict(room=28.5), "la pièce du poêle est à 28,5 °C"),
                           (dict(mode="off"), "le thermostat est éteint")):
            decision, _, _ = decide(case.get("stove", s), thermostat("boost", room=case.get("room", 19.0),
                                                                     mode=case.get("mode", "heat")), before)
            self.assertEqual(decision["action"], "refuser", text)
            self.assertIn(text, decision["texte"])

    def test_the_mild_season_asks_first(self):
        s = stove()
        decision, mem, events = decide(s, thermostat("boost"), seen(s, thermostat("eco")), house_c=18.4)
        self.assertEqual((decision["action"], decision["titre"]), ("demander", "Démarrer ?"))
        self.assertIn("saison douce", decision["texte"])
        self.assertEqual(events[0]["texte"], "Hestia demanderait votre accord pour démarrer le poêle (saison douce).")
        self.assertTrue(mem["saison_douce"])
        # Under 18 °C it no longer asks, and it does not ask again until the house reaches 19 °C.
        _, mem, _ = decide(s, thermostat("frost"), mem, house_c=17.9)
        self.assertFalse(mem["saison_douce"])
        decision, mem, _ = decide(s, thermostat("boost"), mem, house_c=18.6)
        self.assertEqual(decision["action"], "demarrer")
        _, mem, _ = decide(s, thermostat("frost"), mem, house_c=19.0)
        self.assertTrue(mem["saison_douce"])

    def test_the_house_starts_it_in_the_same_minute(self):
        before = stove()
        decision, mem, events = decide(stove("allumage", 3), thermostat("boost", demand=50),
                                       seen(before, thermostat("eco")))
        self.assertEqual(decision["action"], "garder")
        self.assertEqual([(e["qui"], e["accord"]) for e in events], [("hestia", None), ("maison", True)])

    def test_frost_stops_it_and_the_house_agrees(self):
        s, t = stove("chauffe", 3), thermostat("frost")
        decision, mem, events = decide(s, t, seen(s, thermostat("boost")))
        self.assertEqual(decision["action"], "arreter")
        self.assertEqual(events[0]["texte"], "Hestia arrêterait le poêle.")
        decision, mem, events = decide(stove("extinction", 3), t, mem, NOW + timedelta(minutes=1))
        self.assertEqual([(e["texte"], e["accord"]) for e in events], [("La maison a éteint le poêle.", True)])
        decision, _, _ = decide(stove("eteint", 3, fumees=45.0, prise_w=2.0), t, mem, NOW + timedelta(minutes=40))
        self.assertIn("Le poêle est éteint, fumées froides, prise au repos.", decision["texte"])

    def test_off_counts_after_thirty_seconds(self):
        s = stove("chauffe", 3)
        decision, mem, _ = decide(s, thermostat("boost", mode="off", demand=50), seen(s, thermostat("boost")))
        self.assertNotEqual(decision["action"], "arreter")
        decision, _, _ = decide(s, thermostat("boost", mode="off", demand=50), mem, NOW + timedelta(seconds=40))
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Le thermostat est éteint.", decision["texte"])

    def test_a_warm_house_stops_it_after_two_minutes(self):
        s, t = stove("chauffe", 2), thermostat("comfort", demand=20, target=20.0)
        decision, mem, _ = decide(s, t, seen(s, t), house_c=19.5)
        self.assertEqual(decision["action"], "garder")
        decision, _, _ = decide(s, t, mem, NOW + timedelta(minutes=2), house_c=19.5)
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Assez chaud : la maison est à 19,5 °C pour 20 °C visés", decision["texte"])
        # 1 °C under the set point, it keeps heating.
        decision, _, _ = decide(s, t, mem, NOW + timedelta(minutes=2), house_c=18.9)
        self.assertEqual(decision["action"], "garder")


class Safety(unittest.TestCase):
    def test_an_alarm_that_lasts_two_minutes_is_cut(self):
        t = thermostat("boost", demand=50)
        s = stove("chauffe", 3, alarme=True, alarme_texte="Pellet", alarme_depuis=(NOW - timedelta(seconds=30)).isoformat())
        decision, _, _ = decide(s, t, seen(stove("chauffe", 3), t))
        self.assertEqual(decision["action"], "garder")
        self.assertIn("coupe si elle dure 2 minutes", decision["texte"])
        s["alarme_depuis"] = (NOW - timedelta(minutes=2)).isoformat()
        decision, _, events = decide(s, t, seen(stove("chauffe", 3), t))
        self.assertEqual((decision["action"], decision["ton"]), ("couper", "alert"))
        self.assertIn("en alarme (Pellet) depuis 2 minutes", events[0]["texte"])

    def test_a_silent_stove_is_only_said(self):
        t = thermostat("boost", demand=50)
        quiet = stove("inconnu", None, prise_w=180.0)
        decision, mem, _ = decide(quiet, t, seen(stove("chauffe", 3), t))
        self.assertEqual(decision["action"], "attendre")
        decision, _, events = decide(quiet, t, mem, NOW + timedelta(minutes=16))
        self.assertEqual((decision["action"], decision["ton"]), ("alerter", "alert"))
        self.assertIn("Sa prise tire 180 W : il chauffe encore.", decision["texte"])
        self.assertEqual(events[0]["texte"], "Hestia vous préviendrait : le poêle ne répond plus depuis 15 minutes.")

    def test_a_room_over_28_degrees(self):
        s, t = stove("chauffe", 2), thermostat("boost", demand=0, room=28.2)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual(decision["action"], "couper")
        self.assertIn("La pièce du poêle est à 28,2 °C, au-dessus de 28 °C.", decision["texte"])


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
