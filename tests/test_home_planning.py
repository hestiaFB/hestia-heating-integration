"""The planning Hestia (engine/home_planning.py and its part of the house view), without Home Assistant."""
from __future__ import annotations

from datetime import date, datetime, timedelta
import unittest

import maison_fictive as m
from engine import home_planning as hp, house

FRIDAY = m.TODAY                      # 20 November 2026, a Friday


def at(day: date, h: int, mi: int = 0) -> datetime:
    return datetime(day.year, day.month, day.day, h, mi)


class Cleaning(unittest.TestCase):
    def test_a_planning_from_the_tab_is_checked_and_put_in_order(self):
        raw = m.home_planning(jours={"2026-11-23": "teletravail", "2026-11-01": "weekend", "2027-12-25": "weekend"})
        raw["journees"]["semaine"]["creneaux"]["sejour"] = [["17:00", "confort"], ["6:30", "eco"], ["17:00", "boost"]]
        model = hp.clean(raw, FRIDAY)
        self.assertEqual(model["journees"]["semaine"]["creneaux"]["sejour"], [["06:30", "eco"], ["17:00", "boost"]])
        # A day gone by, or too far ahead, is left out.
        self.assertEqual(model["jours"], {"2026-11-23": "teletravail"})
        self.assertFalse(model["commande"])

    def test_what_cannot_be_read_is_refused_in_words(self):
        for bad in ({"journees": {"semaine": {"nom": "S", "creneaux": {"sejour": [["25:00", "confort"]]}}}},
                    {"journees": {"semaine": {"nom": "S", "creneaux": {"sejour": [["06:00", "chaud"]]}}}},
                    {"semaine": ["semaine"] * 6},
                    {"pieces": {"sejour": {"temperatures": {"confort": 50}}}}):
            with self.assertRaises(ValueError):
                hp.clean({**m.home_planning(), **bad}, FRIDAY)

    def test_a_stored_planning_is_never_refused(self):
        self.assertEqual(hp.loaded(None), hp.default())
        self.assertEqual(hp.loaded({"semaine": "n'importe quoi"}), hp.default())
        kept = hp.loaded(m.home_planning(jours={"2026-11-19": "weekend", "2026-11-21": "teletravail"}), FRIDAY)
        self.assertEqual(kept["jours"], {"2026-11-21": "teletravail"})


class Days(unittest.TestCase):
    def test_the_week_a_day_changed_and_a_public_holiday(self):
        model = hp.clean(m.home_planning(jours={"2026-11-23": "teletravail"}), FRIDAY)
        self.assertEqual(hp.day_type(model, FRIDAY), "semaine")
        self.assertEqual(hp.day_type(model, FRIDAY + timedelta(days=1)), "weekend")
        self.assertEqual(hp.day_type(model, date(2026, 11, 23)), "teletravail")
        # The Workday sensor says « not a working day » on a weekday: it follows the public holidays' day type.
        self.assertEqual(hp.day_type(model, FRIDAY, workday=False), "weekend")
        week = hp.week_ahead(model, FRIDAY)
        self.assertEqual([d["jour"] for d in week], ["ven", "sam", "dim", "lun", "mar", "mer", "jeu"])
        self.assertEqual([d["change"] for d in week], [False, False, False, True, False, False, False])

    def test_a_lane_keeps_the_evening_before_until_its_first_slot(self):
        model = hp.clean(m.home_planning(), FRIDAY)
        line = hp.timeline(model, "sejour", FRIDAY, 2)
        current, nxt = __import__("engine.planning", fromlist=["x"]).now_and_next(line, at(FRIDAY, 5))
        self.assertEqual(current, "hors_gel")            # Thursday's 22 h 30
        self.assertEqual(nxt, (at(FRIDAY, 6, 30), "confort"))
        # Saturday follows the week-end: comfort from 8 h only.
        saturday = [(x[0], x[1]) for x in line if x[0].date() == FRIDAY + timedelta(days=1)]
        self.assertEqual(saturday, [(at(FRIDAY + timedelta(days=1), 8), "confort"), (at(FRIDAY + timedelta(days=1), 23), "hors_gel")])


class ColdMornings(unittest.TestCase):
    def hourly(self, temperature: float, day: date):
        return [{"time": (datetime(day.year, day.month, day.day, h) - timedelta(hours=1)).replace(tzinfo=m.TZ).isoformat(),
                 "temperature": temperature} for h in range(24)]

    def test_a_cold_night_starts_the_morning_earlier(self):
        model = hp.clean(m.home_planning(), FRIDAY)
        saturday = FRIDAY + timedelta(days=3)          # Monday 23, a working day
        line = hp.timeline(model, "sejour", saturday, 1, hourly=self.hourly(-3.0, saturday), tz=m.TZ)
        morning = next(x for x in line if x[0].date() == saturday and x[1] == "confort")
        # 13 degrees under 10 °C: 65 minutes, up to the setting's 60.
        self.assertEqual(morning[0], at(saturday, 5, 30))
        self.assertEqual((morning[2]["avance"], morning[2]["prevu"], morning[2]["dehors"]), (60, at(saturday, 6, 30), -3.0))
        evening = next(x for x in line if x[0].date() == saturday and x[0].hour >= 12 and x[1] == "confort")
        self.assertEqual(evening[0], at(saturday, 17))   # only the morning's first step up

    def test_a_mild_night_changes_nothing(self):
        model = hp.clean(m.home_planning(), FRIDAY)
        monday = FRIDAY + timedelta(days=3)
        line = hp.timeline(model, "sejour", monday, 1, hourly=self.hourly(8.0, monday), tz=m.TZ)
        morning = next(x for x in line if x[0].date() == monday and x[1] == "confort")
        self.assertEqual((morning[0], morning[2].get("avance")), (at(monday, 6, 20), 10))
        line = hp.timeline(model, "sejour", monday, 1, hourly=self.hourly(12.0, monday), tz=m.TZ)
        self.assertEqual(next(x for x in line if x[0].date() == monday and x[1] == "confort")[0], at(monday, 6, 30))
        off = hp.clean(m.home_planning(anticipation={"actif": False, "max_min": 60}), FRIDAY)
        line = hp.timeline(off, "sejour", monday, 1, hourly=self.hourly(-3.0, monday), tz=m.TZ)
        self.assertEqual(next(x for x in line if x[0].date() == monday and x[1] == "confort")[0], at(monday, 6, 30))


class Due(unittest.TestCase):
    def test_the_slot_in_force_is_sent_once_and_a_missed_one_is_caught_up(self):
        model = hp.clean(m.home_planning(), FRIDAY)
        line = hp.timeline(model, "sejour", FRIDAY, 2)
        # Never before a baseline: saving the planning sends nothing at once.
        self.assertIsNone(hp.due(line, at(FRIDAY, 21, 40), None))
        self.assertIsNone(hp.due(line, at(FRIDAY, 21, 40), at(FRIDAY, 21, 40)))
        self.assertEqual(hp.due(line, at(FRIDAY, 22, 31), at(FRIDAY, 21, 40)), (at(FRIDAY, 22, 30), "hors_gel"))
        self.assertIsNone(hp.due(line, at(FRIDAY, 22, 45), at(FRIDAY, 22, 30)))
        # Home Assistant stopped from 16 h to 23 h: the 22 h 30 slot is caught up, not the 17 h one.
        self.assertEqual(hp.due(line, at(FRIDAY, 23), at(FRIDAY, 16)), (at(FRIDAY, 22, 30), "hors_gel"))


class TheHouseView(unittest.TestCase):
    def build(self, **changes):
        snap = m.snapshot(home_planning=hp.clean(m.home_planning(**changes.pop("model", {})), FRIDAY), **changes)
        return house.build(snap)

    def test_each_lane_says_who_sets_it(self):
        view = self.build()
        lanes = {l["id"]: l for l in view["planning"]["lignes"]}
        self.assertEqual(lanes["poele"]["source"], "Hestia")
        self.assertEqual(lanes["sejour"]["source"], "Hestia")
        self.assertEqual(lanes["bureau"]["source"], "Scheduler")
        self.assertEqual(view["planning"]["source"], "Hestia et Scheduler")
        pieces = {p["id"]: p for p in view["planning"]["pieces"]}
        self.assertEqual(pieces["bureau"]["scheduler"], ["Planning radiateurs"])
        self.assertEqual(pieces["atelier"]["temperatures"]["confort"], 25.0)     # an air conditioner: it cools
        self.assertIsNone(pieces["sejour"]["temperatures"])                     # Versatile Thermostats: their presets
        self.assertEqual(pieces["sejour"]["niveaux"], ["confort", "eco", "hors_gel", "boost"])
        self.assertEqual(pieces["bureau"]["scheduler_creneaux"]["semaine"][0], ["06:30", "confort"])

    def test_the_stove_set_by_hestia_while_scheduler_still_aims_at_it_is_blocked(self):
        view = self.build()
        lanes = {l["id"]: l for l in view["planning"]["lignes"]}
        self.assertTrue(lanes["poele"]["bloque"])                             # « Planning poêle » is on
        self.assertFalse(lanes["sejour"]["bloque"])
        self.assertIn("Poêle a deux plannings", [t["titre"] for t in view["a_regler"]])
        orders = view["planning"]["ordres"]
        self.assertEqual(orders[0]["heure"], "22 h 30")
        self.assertEqual({(o["texte"], o["statut"]) for o in orders if o["heure"] == "22 h 30"},
                         {("poêle hors gel", "bloque"), ("séjour hors gel", "ombre")})

    def test_a_slot_due_says_what_to_send(self):
        applied = {"sejour": {"a": at(FRIDAY, 17).isoformat()}, "poele": {"a": at(FRIDAY, 17).isoformat()}}
        view = self.build(now=m.NOW.replace(hour=22, minute=31), applied=applied)
        due = {d["piece"]: d for d in view["planning"]["_dus"]}
        self.assertEqual(due["sejour"]["niveau"], "hors_gel")
        self.assertEqual(due["sejour"]["cibles"][0], {"id": "climate.vt_sejour", "vt": True, "preset": "frost", "consigne": 7.0})
        self.assertEqual(due["poele"]["bloque"], "Planning poêle")
        self.assertIn("atelier", view["planning"]["_sans_repere"])             # no baseline yet: none sent

    def test_hestia_lanes_draw_their_day_and_the_week_ahead(self):
        view = self.build(model={"jours": {"2026-11-23": "teletravail"}})
        lanes = {l["id"]: l for l in view["planning"]["lignes"]}
        self.assertEqual(lanes["sejour"]["segments"][1], {"de": 390, "a": 510, "ton": "confort"})
        self.assertEqual(lanes["poele"]["segments"][1]["ton"], "poele")
        self.assertEqual(view["planning"]["jour_type"], {"id": "semaine", "nom": "Semaine"})
        self.assertEqual(view["planning"]["jours"][3]["nom"], "Télétravail")
        self.assertEqual({j["id"]: j["jours"] for j in view["planning"]["journees"]}, {"semaine": 4, "weekend": 2, "teletravail": 1})

    def test_the_tips_cold_morning_and_the_price_of_electricity(self):
        tariff = {"price": 0.25, "period": "hp", "next_change": "2026-11-20T22:00:00", "next_period": "hc"}
        view = self.build(tarif=tariff)
        tips = [t["texte"] for t in view["planning"]["conseils"]]
        self.assertIn("Séjour : confort dès demain 7 h au lieu de 8 h, la nuit sera froide (−1,8 °C dehors).", tips)
        self.assertIn("L’électrique tire 0,6 kW : environ 0,15 € de l’heure (heures pleines). Les heures creuses commencent à 22 h.", tips)

    def test_without_a_planning_hestia_nothing_changes_for_scheduler(self):
        view = house.build(m.snapshot())
        lanes = {l["id"]: l for l in view["planning"]["lignes"]}
        self.assertEqual(lanes["poele"]["source"], "Scheduler")
        self.assertEqual(view["planning"]["source"], "Scheduler")
        self.assertEqual(view["planning"]["_dus"], [])


if __name__ == "__main__":
    unittest.main()
