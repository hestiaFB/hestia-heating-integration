"""The plannings Hestia (engine/home_planning.py and their part of the house view), without Home Assistant."""
from __future__ import annotations

from datetime import date, datetime, timedelta
import unittest

import maison_fictive as m
from engine import home_planning as hp, house, planning

FRIDAY = m.TODAY                      # 20 November 2026, a Friday
SATURDAY = FRIDAY + timedelta(days=1)


def at(day: date, h: int, mi: int = 0) -> datetime:
    return datetime(day.year, day.month, day.day, h, mi)


class Cleaning(unittest.TestCase):
    def test_a_planning_from_the_tab_is_checked_and_put_in_order(self):
        raw = m.home_planning()
        raw["plannings"]["sejour"]["plages"][0] = [["17:00", "00:00", "confort"], ["6:30", "08:30", "confort"]]
        raw["plannings"]["sejour"]["thermostats"] = ["climate.vt_sejour", "climate.vt_sejour", "sensor.pas_un_thermostat"]
        model = hp.clean(raw)
        sejour = model["plannings"]["sejour"]
        self.assertEqual(sejour["plages"][0], [["06:30", "08:30", "confort"], ["17:00", "24:00", "confort"]])
        self.assertEqual(sejour["thermostats"], ["climate.vt_sejour"])
        self.assertEqual(list(model["plannings"]), ["poele", "sejour", "atelier"])

    def test_what_cannot_be_read_is_refused_in_words(self):
        for bad in ({"plages": [[["25:00", "26:00", "confort"]], []]},
                    {"plages": [[["06:00", "07:00", "chaud"]], []]},
                    {"plages": [[["08:00", "07:00", "confort"]], []]},
                    {"plages": [[]]},                                   # « semaine » has two rows
                    {"thermostats": ["climate.vt_poele"]}):             # already in « Poêle »
            raw = m.home_planning()
            raw["plannings"]["sejour"].update(bad)
            with self.assertRaises(ValueError, msg=bad):
                hp.clean(raw)

    def test_a_stored_planning_is_never_refused(self):
        self.assertEqual(hp.loaded(None), hp.default())
        self.assertEqual(hp.loaded({"plannings": "n'importe quoi"}), hp.default())
        # The first 0.3 beta's day types are not carried over: they were only ever a test.
        self.assertEqual(hp.loaded({"commande": False, "journees": {"semaine": {"nom": "Semaine", "creneaux": {}}}}), hp.default())
        self.assertEqual(hp.loaded(m.home_planning()), hp.clean(m.home_planning()))


class Days(unittest.TestCase):
    def test_the_rest_of_the_time_and_the_later_range_wins(self):
        self.assertEqual(hp.day_segments([], "eco"), [(0, 1440, "eco")])
        segments = hp.day_segments([["06:00", "09:00", "confort"], ["08:00", "08:30", "boost"], ["20:00", "24:00", "eco"]], "eco")
        self.assertEqual(segments, [(0, 360, "eco"), (360, 480, "confort"), (480, 510, "boost"), (510, 540, "confort"),
                                    (540, 1440, "eco")])

    def test_monday_to_friday_and_the_week_end(self):
        model = hp.clean(m.home_planning())
        line = hp.timeline(model["plannings"]["sejour"], FRIDAY, 2)
        current, nxt = planning.now_and_next(line, at(FRIDAY, 5))
        self.assertEqual(current, "hors_gel")
        self.assertEqual(nxt, (at(FRIDAY, 6, 30), "confort"))
        saturday = [(x[0], x[1]) for x in line if x[0].date() == SATURDAY]
        self.assertEqual(saturday, [(at(SATURDAY, 8), "confort"), (at(SATURDAY, 23), "hors_gel")])
        # A level held over midnight is one change, not two.
        self.assertNotIn(at(SATURDAY, 0), [x[0] for x in line])

    def test_day_by_day(self):
        p = {"jours": "chaque", "reste": "eco", "plages": [[] for _ in range(7)], "thermostats": []}
        p["plages"][4] = [["18:00", "20:00", "confort"]]
        line = hp.timeline(p, FRIDAY, 2)
        self.assertEqual([(x[0], x[1]) for x in line], [(at(FRIDAY - timedelta(days=1), 0), "eco"),
                                                        (at(FRIDAY, 18), "confort"), (at(FRIDAY, 20), "eco")])

    def test_how_many_times_the_stove_would_light(self):
        model = hp.clean(m.home_planning())
        self.assertEqual(hp.starts_per_week(model["plannings"]["poele"]), 2 * 5 + 2)
        self.assertEqual(hp.starts_per_week({"jours": "tous", "reste": "boost", "plages": [[]]}), 0)


class Due(unittest.TestCase):
    def test_the_change_in_force_is_sent_once_and_a_missed_one_is_caught_up(self):
        line = hp.timeline(hp.clean(m.home_planning())["plannings"]["sejour"], FRIDAY, 2)
        # Never before a baseline: saving the planning sends nothing at once.
        self.assertIsNone(hp.due(line, at(FRIDAY, 21, 40), None))
        self.assertIsNone(hp.due(line, at(FRIDAY, 21, 40), at(FRIDAY, 21, 40)))
        self.assertEqual(hp.due(line, at(FRIDAY, 22, 31), at(FRIDAY, 21, 40)), (at(FRIDAY, 22, 30), "hors_gel"))
        self.assertIsNone(hp.due(line, at(FRIDAY, 22, 45), at(FRIDAY, 22, 30)))
        # Home Assistant stopped from 16 h to 23 h: the 22 h 30 change is caught up, not the 17 h one.
        self.assertEqual(hp.due(line, at(FRIDAY, 23), at(FRIDAY, 16)), (at(FRIDAY, 22, 30), "hors_gel"))


class TheHouseView(unittest.TestCase):
    def build(self, plannings=None, **changes):
        snap = m.snapshot(home_planning=hp.clean(m.home_planning(**(plannings or {}))), **changes)
        return house.build(snap)

    def test_each_room_says_who_sets_it(self):
        view = self.build()
        lanes = {l["id"]: l for l in view["planning"]["lignes"]}
        self.assertEqual((lanes["sejour"]["source"], lanes["sejour"]["bloque"]), ("Hestia", False))
        self.assertEqual(lanes["atelier"]["source"], "Hestia")
        self.assertEqual(lanes["bureau"]["source"], "Scheduler")
        # « Planning poêle » is still on in Scheduler: the stove follows it, Hestia's is blocked.
        self.assertEqual((lanes["poele"]["source"], lanes["poele"]["bloque"]), ("Scheduler", True))
        self.assertEqual(view["planning"]["source"], "Hestia et Scheduler")
        self.assertTrue(view["planning"]["essai"])

    def test_each_planning_says_now_and_next(self):
        plans = {p["id"]: p for p in self.build()["planning"]["hestia"]}
        self.assertEqual((plans["sejour"]["maintenant"], plans["sejour"]["prochain"]["texte"]), ("confort", "Hors gel à 22 h 30"))
        self.assertEqual(plans["poele"]["maintenant"], "boost, poêle allumé")
        self.assertEqual(plans["poele"]["allumages"], 12)
        self.assertEqual(plans["poele"]["bloques"], [{"id": "climate.vt_poele", "nom": "Thermostat poêle", "scheduler": "Planning poêle"}])
        self.assertEqual(plans["atelier"]["prochain"]["texte"], "Confort demain à 9 h")
        self.assertIsNone(plans["atelier"]["allumages"])

    def test_two_plannings_on_one_thermostat_are_said_only_when_active(self):
        view = self.build()
        self.assertNotIn("Thermostat poêle suit deux plannings", [t["titre"] for t in view["a_regler"]])
        active = dict(m.home_planning()["plannings"]["poele"], actif=True)
        view = self.build({"poele": active})
        todo = next(t for t in view["a_regler"] if t["titre"] == "Thermostat poêle suit deux plannings")
        self.assertEqual(todo["page"], "planning/poele")

    def test_a_change_due_says_what_to_send(self):
        applied = {t: {"a": at(FRIDAY, 17).isoformat()} for t in ("climate.vt_sejour", "climate.vt_poele")}
        view = self.build(now=m.NOW.replace(hour=22, minute=31), applied=applied)
        due = {d["planning"]: d for d in view["planning"]["_dus"]}
        self.assertEqual((due["sejour"]["niveau"], due["sejour"]["actif"]), ("hors_gel", False))
        self.assertEqual(due["sejour"]["cibles"], [{"id": "climate.vt_sejour", "nom": "Radiateur séjour", "vt": True,
                                                    "preset": "frost", "consigne": 7.0, "bloque": None, "recopie": False}])
        self.assertEqual(due["poele"]["cibles"][0]["bloque"], "Planning poêle")
        self.assertIn("climate.clim_atelier", view["planning"]["_sans_repere"])   # no baseline yet: none sent

    def test_the_thermostats_to_tick(self):
        thermostats = self.build()["planning"]["thermostats"]
        self.assertEqual(thermostats[0]["id"], "climate.vt_poele")
        by_id = {t["id"]: t for t in thermostats}
        self.assertEqual(by_id["climate.vt_bureau"]["scheduler_actif"], "Planning radiateurs")
        self.assertIsNone(by_id["climate.vt_bureau"]["planning"])
        self.assertEqual(by_id["climate.vt_sejour"]["planning"], "sejour")
        self.assertEqual(by_id["climate.clim_atelier"]["consignes"]["confort"], 25.0)   # an air conditioner cools
        self.assertIsNone(by_id["climate.vt_sejour"]["consignes"])                      # a Versatile Thermostat: its presets
        self.assertEqual(by_id["climate.vt_sejour"]["niveaux"], ["confort", "eco", "hors_gel", "boost"])

    def test_a_scheduler_schedule_can_be_taken_over(self):
        scheduler = {s["nom"]: s for s in self.build()["planning"]["scheduler"]}
        self.assertEqual(scheduler["Planning radiateurs"]["reprise"], {
            "nom": "Planning radiateurs", "actif": False, "jours": "tous", "reste": "eco",
            "plages": [[["06:30", "08:00", "confort"], ["17:30", "22:30", "confort"]]],
            "thermostats": ["climate.vt_bureau", "climate.vt_amis"]})
        stove = scheduler["Planning poêle"]["reprise"]
        self.assertEqual((stove["reste"], stove["plages"]), ("hors_gel", [[["07:00", "09:00", "boost"], ["18:00", "23:00", "boost"]]]))
        # Taken over as it is, it is a planning the tab can save.
        hp.clean({"plannings": {"repris": scheduler["Planning radiateurs"]["reprise"]}})

    def test_without_a_planning_hestia_nothing_changes_for_scheduler(self):
        view = house.build(m.snapshot())
        lanes = {l["id"]: l for l in view["planning"]["lignes"]}
        self.assertEqual((lanes["poele"]["source"], lanes["poele"]["bloque"]), ("Scheduler", False))
        self.assertEqual(view["planning"]["source"], "Scheduler")
        self.assertEqual((view["planning"]["_dus"], view["planning"]["hestia"]), ([], []))
        self.assertFalse(view["planning"]["essai"])


if __name__ == "__main__":
    unittest.main()
