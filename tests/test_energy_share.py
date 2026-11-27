"""The heating's share of the gas and the electricity (1.1.0b7, engine/energy_share.py)."""
import math
import unittest
from datetime import date, timedelta

from custom_components.hestia_heating.api import _with_energies
from custom_components.hestia_heating.engine import energy_share

TODAY = date(2026, 11, 27)


def year(gas=None, elec=None, complete=True):
    """A made-up year: the cold follows the seasons (0 in summer, up to 14 degree-days in winter)."""
    days, cold = [], {}
    for n in range(1, 366):
        day = TODAY - timedelta(days=n)
        dju = max(0.0, 7 + 7 * math.cos((day.timetuple().tm_yday - 15) / 365 * 2 * math.pi))
        dju = round(dju if dju > 2 else 0.0, 1)
        cold[day] = dju
        row = {"day": day, "electricity_complete": complete}
        if elec is not None:
            row["electricity_kwh"] = elec(dju, n)
        if gas is not None:
            row.update(gas_kwh=gas(dju, n), gas_quantity=gas(dju, n) / 11.2, gas_complete=complete, gas_unit="m³")
        else:
            row["gas_kwh"] = None
        days.append(row)
    return days, cold


class Share(unittest.TestCase):
    def test_a_gas_home(self):
        """8 kWh a day for the cooking and the hot water, 6 kWh a degree-day for the boiler."""
        days, cold = year(gas=lambda dju, n: 8 + 6 * dju + (n % 3 - 1) * 0.5, elec=lambda dju, n: 9 + n % 2)
        share = energy_share.split(days, cold, TODAY, measured_electricity=False)
        g = share["gaz"]
        self.assertEqual(g["etat"], "pret")
        self.assertAlmostEqual(g["par_degre"], 6, delta=0.3)
        self.assertAlmostEqual(g["reste_par_jour"], 8, delta=0.5, msg="read on the summer's days")
        winter = (TODAY - timedelta(days=330)).isoformat()
        self.assertAlmostEqual(g["jours"][winter], 6 * cold[TODAY - timedelta(days=330)], delta=1)
        summer = next(d for d in cold if cold[d] == 0)
        self.assertLess(g["jours"][summer.isoformat()], 1, "no heating without cold")
        # The electricity does not follow the cold: no figure rather than a made-up one.
        self.assertEqual(share["electricite"]["etat"], "peu_lie")
        self.assertNotIn("jours", share["electricite"])

    def test_an_electric_home_without_thermostats_in_home_assistant(self):
        days, cold = year(elec=lambda dju, n: 7 + 2.5 * dju + (n % 2) * 0.4)
        share = energy_share.split(days, cold, TODAY, measured_electricity=False)
        self.assertEqual(share["gaz"]["etat"], "absent")
        e = share["electricite"]
        self.assertEqual(e["etat"], "pret")
        self.assertAlmostEqual(e["par_degre"], 2.5, delta=0.1)
        some = TODAY - timedelta(days=330)
        self.assertAlmostEqual(e["jours"][some.isoformat()], 2.5 * cold[some], delta=0.3)

    def test_measured_radiators_win(self):
        """Hestia already counts the radiators: the electricity is never guessed on top of them."""
        days, cold = year(elec=lambda dju, n: 7 + 2.5 * dju)
        self.assertEqual(energy_share.split(days, cold, TODAY, True)["electricite"], {"etat": "mesure"})

    def test_too_few_days_or_incomplete_days(self):
        days, cold = year(gas=lambda dju, n: 8 + 6 * dju)
        short = energy_share.split(days[:40], cold, TODAY, False)
        self.assertEqual(short["gaz"]["etat"], "apprend")
        incomplete, _ = year(gas=lambda dju, n: 8 + 6 * dju, complete=False)
        self.assertEqual(energy_share.split(incomplete, cold, TODAY, False)["gaz"]["etat"], "apprend")

    def test_over_a_period_and_one_day(self):
        days, cold = year(gas=lambda dju, n: 8 + 6 * dju)
        share = energy_share.split(days, cold, TODAY, False)
        week = energy_share.over(share, TODAY - timedelta(days=7), TODAY - timedelta(days=1))
        self.assertEqual(week["gaz"]["jours"], 7)
        self.assertIsNone(week["electricite"])
        day = (TODAY - timedelta(days=3)).isoformat()
        self.assertEqual(energy_share.heat_of(share, day)["gaz_kwh"], share["gaz"]["jours"][day])

    def test_the_days_cost_counts_the_gas_once(self):
        base = {"jour": "2026-11-25", "electrique_kwh": 3.0, "electrique_eur": 0.6, "granules_kg": 5.0,
                "granules_eur": 2.0, "chauffage_eur": 2.6, "gagne_eur": 1.0, "prix": "energie"}
        out = _with_energies(base, {"gaz_kwh": 40.0, "gaz_eur": 4.0, "electrique_estime_kwh": None,
                                    "electrique_estime_eur": None}, "2026-11-25")
        self.assertEqual((out["gaz_kwh"], out["chauffage_eur"]), (40.0, 6.6))
        self.assertEqual(base["chauffage_eur"], 2.6, "the day kept by the journal is not changed")
        # A house without any thermostat in Home Assistant gets its day too.
        alone = _with_energies(None, {"gaz_kwh": 30.0, "gaz_eur": None, "electrique_estime_kwh": None,
                                      "electrique_estime_eur": None}, "2026-11-25")
        self.assertEqual((alone["jour"], alone["gaz_kwh"], alone["chauffage_eur"]), ("2026-11-25", 30.0, None))
        self.assertIsNone(_with_energies(None, {"gaz_kwh": None, "electrique_estime_kwh": None}, "2026-11-25"))


if __name__ == "__main__":
    unittest.main()
