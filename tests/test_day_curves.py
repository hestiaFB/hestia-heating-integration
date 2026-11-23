"""The day's curves (the card's and the tab's charts): a thermostat's temperature and set point are attributes, so a
point is placed when it was written, not when the thermostat's state (« heat ») last changed. Skipped without Home
Assistant."""
from __future__ import annotations

from datetime import timedelta
from pathlib import Path
import sys
import unittest

try:
    from homeassistant.core import State
    from homeassistant.util import dt as dt_util
except ImportError:
    raise unittest.SkipTest("Home Assistant is not installed")

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from custom_components.hestia_heating import recorder_history  # noqa: E402
from custom_components.hestia_heating.coordinator import _minutes  # noqa: E402
from custom_components.hestia_heating.reader import day_points  # noqa: E402


class DayCurves(unittest.TestCase):
    def setUp(self):
        self.start = dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0)
        # The thermostat went to « heat » two days ago and has stayed there: only its attributes change today.
        self.heat_since = self.start - timedelta(days=2)

    def climate(self, hour, minute, temperature, target):
        return State("climate.essai", "heat", {"current_temperature": temperature, "temperature": target},
                     last_changed=self.heat_since, last_updated=self.start + timedelta(hours=hour, minutes=minute))

    def test_a_thermostat_s_temperature_spreads_over_the_day(self):
        states = [self.climate(0, 0, 16.0, 16), self.climate(6, 30, 18.5, 19), self.climate(9, 0, 20.5, 19),
                  self.climate(12, 10, 17.0, 16)]
        rows = recorder_history.compact(states, "current_temperature")
        minutes = _minutes(day_points(rows, "current_temperature", self.start), self.start)
        self.assertEqual(minutes, [[0, 16.0], [390, 18.5], [540, 20.5], [730, 17.0]],
                         "each temperature at the minute it was read, not all at midnight")
        targets = _minutes(day_points(recorder_history.compact(states, "temperature"), "temperature", self.start),
                           self.start)
        self.assertEqual([m for m, _ in targets], [0, 390, 730], "the set point steps when it changed")

    def test_a_point_before_midnight_opens_the_day(self):
        before = State("climate.essai", "heat", {"current_temperature": 15.5}, last_changed=self.heat_since,
                       last_updated=self.start - timedelta(hours=3))
        points = day_points(recorder_history.compact([before], "current_temperature"), "current_temperature", self.start)
        self.assertEqual(points, [(self.start, 15.5)])

    def test_a_stove_s_state_keeps_its_text(self):
        state = State("sensor.poele_etat", "Allumage", last_changed=self.start + timedelta(hours=7),
                      last_updated=self.start + timedelta(hours=7))
        self.assertEqual(day_points(recorder_history.compact([state]), None, self.start, text=True),
                         [(self.start + timedelta(hours=7), "Allumage")])


if __name__ == "__main__":
    unittest.main()
