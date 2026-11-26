"""1.1.0b1: the house's journal and the house card's figures (engine/journal.py, engine/house_stats.py,
money.heating_day), on made-up days."""
from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
import sys
import unittest
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "custom_components" / "hestia_heating"))
from engine import house_stats as hs, journal, money  # noqa: E402

TZ = ZoneInfo("Europe/Paris")


def day(name, t=None, c=None, heat=None, out=None, stove=None, kwh=None, kg=None, argent=None, room="salon"):
    """A closed day of one room: lists of 24 values, or one value for all hours."""
    def full(v, default):
        return v if isinstance(v, list) else [default if v is None else v] * 24
    d = {"jour": name, "dehors": full(out, None), "poele_min": full(stove, 0.0),
         "pieces": {room: {"t": full(t, None), "c": full(c, None), "min": full(heat, 0.0)}}}
    for k, v in (("kwh", kwh), ("kg", kg), ("argent", argent)):
        if v is not None:
            d[k] = v
    return d


def names(n, last="2026-11-25"):
    end = datetime.fromisoformat(last)
    return [(end - timedelta(days=n - 1 - i)).date().isoformat() for i in range(n)]


class TheJournal(unittest.TestCase):
    def test_each_look_counts_the_minutes_since_the_one_before_as_it_was(self):
        d = journal.open_day("2026-11-26")
        at = datetime(2026, 11, 26, 9, 58, tzinfo=TZ)
        rooms = [{"id": "salon", "t": 19.0, "c": 20.0, "chauffe": True}]
        journal.observe(d, at, rooms, 4.0, True)
        journal.observe(d, at + timedelta(minutes=2), [{"id": "salon", "t": 21.0, "c": 20.0, "chauffe": False}], 6.0, False)
        journal.observe(d, at + timedelta(minutes=4), rooms, 6.0, False)
        closed = journal.close(d)
        self.assertEqual(closed["pieces"]["salon"]["min"][9], 2.0)
        self.assertEqual(closed["pieces"]["salon"]["min"][10], 0.0, "the look at 10 h said it no longer heated")
        self.assertEqual(closed["pieces"]["salon"]["t"][9], 19.0)
        self.assertEqual(closed["pieces"]["salon"]["t"][10], 21.0)
        self.assertEqual(closed["poele_min"][9], 2.0)
        self.assertEqual(closed["dehors"][10], 6.0)

    def test_a_gap_counts_five_minutes_at_most(self):
        d = journal.open_day("2026-11-26")
        at = datetime(2026, 11, 26, 9, 0, tzinfo=TZ)
        journal.observe(d, at, [{"id": "salon", "t": 19.0, "c": 20.0, "chauffe": True}], None, False)
        journal.observe(d, at + timedelta(minutes=40), [], None, False)
        self.assertEqual(journal.close(d)["pieces"]["salon"]["min"][9], 5.0)

    def test_a_recorded_day_is_cut_into_its_hours(self):
        start = datetime(2026, 11, 25, tzinfo=TZ)
        end = start + timedelta(days=1)
        points = [(start - timedelta(hours=3), {"t": 18.0, "c": 19.0, "chauffe": False, "dehors": 3.0}),
                  (start + timedelta(hours=6, minutes=30), {"t": 19.0, "c": 19.0, "chauffe": True, "dehors": 5.0}),
                  (start + timedelta(hours=8), {"t": 20.0, "c": 17.0, "chauffe": False, "dehors": 5.0})]
        hours = journal.hours_of(points, start, end)
        self.assertEqual(hours["min"][5:9], [0.0, 30.0, 60.0, 0.0])
        rec = journal.from_history("2026-11-25", {"salon": [hours]}, journal.burning_minutes(
            [(start, False), (start + timedelta(hours=20, minutes=15), True)], start, end))
        self.assertEqual(rec["pieces"]["salon"]["t"][6], 18.5)
        self.assertEqual(rec["dehors"][0], 3.0)
        self.assertEqual(rec["poele_min"][20:24], [45.0, 60.0, 60.0, 60.0])
        self.assertEqual(journal.known_hours(rec), 24)


class TheFigures(unittest.TestCase):
    def test_inertia_from_the_hours_nothing_heats(self):
        # 15 °C between inside and outside, the house loses 0.3 °C an hour: 0.02 an hour for each degree.
        t = [20.0 - 0.3 * h for h in range(24)]
        days = [day(n, t=t, c=19.0, out=[x - 15 for x in t]) for n in names(2)]
        k = hs.inertia(days)
        self.assertAlmostEqual(k["par_degre"], 0.02, places=4)
        self.assertAlmostEqual(k["a_15"], 0.3, places=2)
        self.assertEqual(k["demi_vie_h"], round(0.693 / k["par_degre"]))

    def test_no_inertia_while_something_heats_or_the_stove_just_stopped(self):
        t = [20.0 - 0.3 * h for h in range(24)]
        self.assertIsNone(hs.inertia([day("2026-11-25", t=t, out=5.0, heat=10.0)]))
        self.assertIsNone(hs.inertia([day("2026-11-25", t=t, out=5.0, stove=[30.0 if h % 2 else 0.0 for h in range(24)])]))

    def test_the_heat_needed_for_each_degree_day_against_the_fortnight_before(self):
        before = [day(n, out=8.0, kwh=30.0) for n in names(28)[:14]]
        now = [day(n, out=8.0, kwh=20.0, kg=2.0) for n in names(28)[14:]]
        need = hs.need(before + now, kwh_per_kg=4.0)
        self.assertEqual(need["kwh_dj"], 2.8, "(20 + 2 × 4) / 10 degree-days")
        self.assertEqual(need["avant"], 3.0)
        self.assertIsNone(hs.need([day(n, out=17.0, kwh=5.0) for n in names(14)], 4.0), "warm days are not heated days")

    def test_warming_up_and_the_heating_time(self):
        t = [18.0 + 0.5 * h for h in range(24)]
        days = [day(n, t=t, c=21.0, heat=60.0, room="chambre") for n in names(4)]
        warm = hs.warming(days, {"chambre": "Chambre"}, None)
        self.assertEqual(warm, [{"id": "chambre", "nom": "Chambre", "min_par_degre": 120, "poele": False}])
        time = hs.heating_time(days, None)
        self.assertEqual((time["poele_min"], time["autres_min"]), (0, 1440))

    def test_the_set_point_held_leaves_hors_gel_out(self):
        t = [19.8] * 12 + [18.0] * 12
        days = [day("2026-11-25", t=t, c=20.0), day("2026-11-24", t=10.0, c=7.0)]
        self.assertEqual(hs.held(days)["pct"], 50)

    def test_at_equal_cold_today_against_yesterday_and_the_week(self):
        past = [day(n, out=8.0, kwh=10.0, argent={"electrique": 2.0, "granules": 0.0}) for n in names(8)]
        past[-1] = day(past[-1]["jour"], out=8.0, kwh=10.0, argent={"electrique": 2.5, "granules": 0.0})
        today = day("2026-11-26", out=[8.0] * 12 + [None] * 12, kwh=5.0, argent={"electrique": 1.0, "granules": 0.0})
        cmp_ = hs.at_equal_cold(past, today, 12, 4.0)
        self.assertEqual(cmp_["base"], "eur")
        self.assertEqual(cmp_["aujourdhui"], 0.2, "1 € for 5 degree-days so far")
        self.assertEqual(cmp_["vs_hier"], -20)
        self.assertEqual(cmp_["vs_semaine"], 0)
        self.assertEqual(cmp_["dehors_vs_hier"], 0.0)

    def test_without_prices_the_heat_is_compared(self):
        past = [day(n, out=8.0, kwh=10.0) for n in names(8)]
        today = day("2026-11-26", out=8.0, kwh=5.0)
        self.assertEqual(hs.at_equal_cold(past, today, 24, 4.0)["base"], "kwh")

    def test_off_peak_and_the_season(self):
        days = [day(n, kwh=10.0, argent={"electrique": 2.0, "kwh_hc": 6.0, "kwh_periode": 10.0}) for n in names(3)]
        self.assertEqual(hs.off_peak(days), {"pct": 60, "kwh": 30.0})
        self.assertIsNone(hs.off_peak([day("2026-11-25", kwh=3.0)]), "without Hestia Énergie's periods")
        self.assertEqual(hs.season(300.0, 100.0, "2026-2027")["pct_poele"], 75)


class TheDaysMoney(unittest.TestCase):
    def test_electricity_at_each_hour_s_price_and_what_the_pellets_saved(self):
        now = datetime(2026, 11, 26, 12, tzinfo=TZ)
        hours = [now.replace(hour=h) for h in range(3)]
        prices = [{"price": 0.2, "period": "hc", "color": None}, {"price": 0.3, "period": "hp", "color": None},
                  {"price": 0.3, "period": "hp", "color": None}]
        out = money.heating_day(hours, [1.0, 2.0, 0.0], [0.0, 1.0, 1.0], prices, now, None, 0.4, 4.0)
        self.assertEqual(out["electrique"], 0.8)
        self.assertEqual(out["granules"], 0.8)
        self.assertEqual(out["gagne"], round(2 * 4 * 0.3 - 0.8, 2))
        self.assertEqual((out["kwh_hc"], out["kwh_periode"]), (1.0, 3.0))
        self.assertEqual(out["prix"], "energie")

    def test_without_hestia_energie_the_price_of_reglages(self):
        now = datetime(2026, 11, 26, 12, tzinfo=TZ)
        out = money.heating_day([now], [2.0], [0.0], None, now, 0.25, None, 4.0)
        self.assertEqual((out["electrique"], out["granules"], out["prix"]), (0.5, 0.0, "reglages"))
        self.assertIsNone(money.heating_day([now], [2.0], [0.0], None, now, None, None, 4.0)["electrique"])

    def test_a_tempo_hour_of_another_day_has_no_price(self):
        now = datetime(2026, 11, 26, 12, tzinfo=TZ)
        yesterday = now - timedelta(days=1)
        out = money.heating_day([yesterday], [2.0], [0.0], [{"price": 0.6, "period": "hp", "color": "red"}], now, None,
                                None, 4.0)
        self.assertIsNone(out["electrique"])


if __name__ == "__main__":
    unittest.main()
