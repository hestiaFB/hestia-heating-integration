"""The pellets' tank empty, seen from the smoke (1.1.0b9, engine/tank.py), replayed on a made-up evening shaped like
the one of 27 November: flame 1 steady around 120 °C, then the smoke falling while the flame does not change."""
import unittest
from datetime import datetime, timedelta

from custom_components.hestia_heating.engine import granules, health, tank, tuning

START = datetime(2026, 11, 27, 18, 0)


def stove(smoke, flame=1, etat="chauffe", plug=None):
    return {"etat": etat, "flamme": flame, "fumees": smoke, "prise_w": plug}


class Evening:
    def __init__(self, mem=None):
        self.mem, self.now, self.doubt = mem, START, None

    def burn(self, minutes, smoke, **kw):
        """One look a minute for `minutes`, the smoke given as a number or a function of the minute."""
        for m in range(minutes):
            value = smoke(m) if callable(smoke) else smoke
            self.mem, self.doubt = tank.watch(self.mem, stove(value, **kw), self.now)
            self.now += timedelta(minutes=1)
        return self.doubt


class TankEmpty(unittest.TestCase):
    def tearDown(self):
        tuning.set_values(None)

    def test_nothing_before_the_flame_is_learnt(self):
        e = Evening()
        # 25 minutes at flame 1: not yet steady long enough to learn half an hour of it, then the smoke falls.
        self.assertIsNone(e.burn(25, 120))
        self.assertIsNone(e.burn(30, lambda m: 120 - m * 2))
        self.assertLess(e.mem["normes"]["1"]["n"], tank.LEARNT)

    def test_the_evening_of_27_november(self):
        e = Evening()
        self.assertIsNone(e.burn(60, lambda m: 118 + (m % 5)))   # learnt: about 120 °C at flame 1
        self.assertAlmostEqual(e.mem["normes"]["1"]["c"], 120, delta=2)
        self.assertIsNone(e.burn(10, 113))                        # 7 °C under: not yet
        doubt = e.burn(12, 102)                                   # 16 °C under: the doubt
        self.assertIsNotNone(doubt)
        self.assertIn("son réservoir de granulés est peut-être vide", doubt["texte"])
        self.assertIn("en flamme 1", doubt["texte"])
        # The level is not learnt down while in doubt.
        self.assertAlmostEqual(e.mem["normes"]["1"]["c"], 120, delta=2)
        # The stove stops by itself: the doubt stays, said differently.
        e.mem, doubt = tank.watch(e.mem, stove(70, etat="eteint"), e.now)
        self.assertIn("Le poêle s’est arrêté", doubt["texte"])
        # Filled and lit again: gone once the smoke is back near its level.
        self.assertIsNotNone(e.burn(5, 90, flame=3))
        self.assertIsNone(e.burn(2, 118, flame=3))

    def test_a_fast_fall_counts_once_a_little_under(self):
        e = Evening()
        e.burn(60, 120)
        doubt = e.burn(10, lambda m: 120 - m * 1.2)               # 120 → 109: 11 °C in 10 minutes
        self.assertIsNotNone(doubt)

    def test_a_new_flame_waits_for_its_smoke_to_settle(self):
        e = Evening()
        e.burn(60, 140, flame=3)
        e.burn(60, 120, flame=1)
        # From flame 1 to flame 3: the smoke climbs slowly, never a doubt.
        self.assertIsNone(e.burn(30, lambda m: min(140, 120 + m), flame=3))

    def test_never_when_set_to_0_and_each_stove_its_own_level(self):
        tuning.set_values({"reservoir_ecart_c": 0})
        e = Evening()
        e.burn(60, 120)
        self.assertIsNone(e.burn(20, 60))
        tuning.set_values(None)
        # A stove whose flame 1 smokes at 80 °C: 80 is its normal, not a tank empty.
        e = Evening()
        self.assertIsNone(e.burn(90, 80))
        self.assertAlmostEqual(e.mem["normes"]["1"]["c"], 80, delta=1)

    def test_no_pellet_is_counted_while_in_doubt(self):
        # engine/house.py gives the pellets' count the stove as « vide » while in doubt: no kilo an hour.
        self.assertGreater(granules.rate(stove(100)), 0)
        self.assertEqual(granules.rate({**stove(100), "etat": "vide"}), 0)

    def test_it_becomes_a_souci_of_the_brick(self):
        e = Evening()
        e.burn(60, 120)
        doubt = e.burn(12, 100, plug=9)
        self.assertIn("Sa prise tire 9 W.", doubt["texte"])
        shown, mem, orders = health.check({"reservoir": doubt}, {}, e.now)
        self.assertEqual([s["sujet"] for s in shown], ["reservoir"])
        self.assertEqual(orders[0]["sujet"], "sante_reservoir")
        shown, mem, orders = health.check({"reservoir": None}, mem, e.now + timedelta(minutes=30))
        self.assertEqual(shown, [])
        self.assertEqual([o["geste"] for o in orders], ["effacer", "notifier"])
        self.assertIn("de nouveau des granulés", orders[1]["texte"])


if __name__ == "__main__":
    unittest.main()
