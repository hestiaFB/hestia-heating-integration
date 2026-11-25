"""The cards' « Argent » at Hestia Énergie's prices (1.0.0b8): each day's euros, by period, from made-up hours."""
from datetime import datetime, timedelta
import unittest

import maison_fictive as m  # noqa: F401 - puts the brick on the path
from engine import money

NOW = datetime(2026, 11, 20, 21, 40, tzinfo=m.TZ)


def hours(first: datetime, kwh: list[float]):
    return [(first + timedelta(hours=i), v) for i, v in enumerate(kwh)]


def hphc(at: datetime, color=None):
    hc = at.hour < 6 or at.hour >= 22
    return {"price": 0.2068 if hc else 0.27, "period": "hc" if hc else "hp", "color": color}


class Money(unittest.TestCase):
    def test_a_day_split_by_period(self):
        rows = hours(datetime(2026, 11, 19, 0, tzinfo=m.TZ), [1.0] * 24)
        out = money.days(rows, [hphc(at) for at, _ in rows], NOW)
        day = out["2026-11-19"]
        self.assertAlmostEqual(day["hc"], 8 * 0.2068, places=4)
        self.assertAlmostEqual(day["hp"], 16 * 0.27, places=4)
        self.assertAlmostEqual(day["total"], day["hc"] + day["hp"], places=4)

    def test_the_stove_counts_the_same_heat_as_electricity(self):
        rows = hours(datetime(2026, 11, 20, 18, tzinfo=m.TZ), [2.0])
        out = money.days(rows, [hphc(rows[0][0])], NOW, per_unit=4.176)
        self.assertAlmostEqual(out["2026-11-20"]["total"], 2 * 4.176 * 0.27, places=4)

    def test_an_hour_without_a_price_leaves_its_day_without_euros(self):
        rows = hours(datetime(2026, 11, 19, 10, tzinfo=m.TZ), [1.0, 1.0])
        self.assertIsNone(money.days(rows, [hphc(rows[0][0]), None], NOW)["2026-11-19"])
        # An hour that used nothing needs no price.
        rows = hours(datetime(2026, 11, 19, 10, tzinfo=m.TZ), [1.0, 0.0])
        self.assertIsNotNone(money.days(rows, [hphc(rows[0][0]), None], NOW)["2026-11-19"])

    def test_tempo_counts_only_today_s_colour(self):
        # Interface v1 gives today's colour only: yesterday is not counted at it.
        rows = hours(datetime(2026, 11, 19, 12, tzinfo=m.TZ), [1.0]) + hours(datetime(2026, 11, 20, 12, tzinfo=m.TZ), [1.0])
        out = money.days(rows, [hphc(at, "bleu") for at, _ in rows], NOW)
        self.assertIsNone(out["2026-11-19"])
        self.assertAlmostEqual(out["2026-11-20"]["total"], 0.27, places=4)

    def test_the_prices_seen(self):
        rows = hours(datetime(2026, 11, 20, 4, tzinfo=m.TZ), [1.0, 1.0, 1.0])
        self.assertEqual(money.seen([hphc(at) for at, _ in rows]), {"prix": {"hc": 0.2068, "hp": 0.27}, "couleur": None})
        self.assertIsNone(money.seen([None]))


if __name__ == "__main__":
    unittest.main()
