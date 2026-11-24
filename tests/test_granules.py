"""The pellets counted by Hestia: the rate read on the stove's state, the kilos, the factor learnt on the bags, the
fire pot (docs/CAHIER-DES-CHARGES.md, « Les granulés »)."""
from datetime import date, timedelta
import unittest

import maison_fictive as m
from engine import granules, house

NOW = m.NOW
RATES = {"allumage": 1.2, "flammes": [0.55, 0.81, 1.07, 1.34, 1.60]}


def burning(flame=3):
    return {"etat": "chauffe", "flamme": flame}


def run(mem, stove, minutes, bags=None, start=NOW, step=1):
    """The coordinator's looks, one each `step` minutes."""
    for i in range(0, minutes + 1, step):
        mem = granules.advance(mem, stove, bags, start + timedelta(minutes=i), RATES)
    return mem


class TheRate(unittest.TestCase):
    def test_read_on_the_stoves_state_never_on_its_flame_alone(self):
        self.assertEqual(granules.rate({"etat": "allumage", "flamme": 1}, RATES), 1.2)
        self.assertEqual(granules.rate(burning(3), RATES), 1.07)
        self.assertEqual(granules.rate(burning(5), RATES), 1.6)
        self.assertEqual(granules.rate({"etat": "nettoyage", "flamme": None}, RATES), 1.07, "flame unknown: the middle")
        # Some stoves report flame 1 while off: off is 0.
        self.assertEqual(granules.rate({"etat": "eteint", "flamme": 1}, RATES), 0.0)
        self.assertEqual(granules.rate({"etat": "extinction", "flamme": 2}, RATES), 0.0)

    def test_a_silent_stove_whose_plug_draws_counts_the_middle(self):
        self.assertEqual(granules.rate({"etat": "inconnu", "prise_w": 80}, RATES), 1.07)
        self.assertEqual(granules.rate({"etat": "inconnu", "prise_w": 30}, RATES), 0.0)
        self.assertEqual(granules.rate({"etat": "inconnu", "prise_w": None}, RATES), 0.0)
        self.assertEqual(granules.rate({"etat": "inconnu", "a_traduire": True, "prise_w": 80}, RATES), 0.0,
                         "a text the profile does not know is not guessed")

    def test_the_profile_gives_the_rates(self):
        self.assertEqual(m.PROFILE.rates["flammes"][0], 0.55)
        self.assertEqual(granules.rate(burning(1), m.PROFILE.rates), 0.55)
        self.assertEqual(granules.rate(burning(2)), 0.81, "without a profile's rates, a 7 kW stove's")


class TheKilos(unittest.TestCase):
    def test_the_rate_is_added_up_over_time(self):
        mem = run(None, burning(5), 60)
        self.assertAlmostEqual(mem["total_kg"], 1.6, places=3)
        self.assertAlmostEqual(mem["kg_jour"], 1.6, places=3)
        self.assertAlmostEqual(mem["kg_saison"], 1.6, places=3)
        self.assertEqual(mem["debit"], 1.6)

    def test_a_stop_of_home_assistant_counts_five_minutes_at_most(self):
        mem = run(None, burning(5), 10)
        mem = granules.advance(mem, burning(5), None, NOW + timedelta(hours=3), RATES)
        self.assertAlmostEqual(mem["total_kg"], 1.6 * 15 / 60, places=3)

    def test_the_rate_counted_is_the_one_seen_at_the_last_look(self):
        mem = run(None, {"etat": "eteint"}, 30)
        mem = run(mem, burning(4), 30, start=NOW + timedelta(minutes=30))
        self.assertAlmostEqual(mem["total_kg"], 1.34 / 2, places=3, msg="the off half hour counts nothing")

    def test_a_new_day_and_a_new_season_start_again(self):
        late = NOW.replace(hour=23, minute=50)
        mem = run(None, burning(5), 20, start=late)
        self.assertEqual(mem["jour"], "2026-11-21")
        self.assertAlmostEqual(mem["kg_jour"], 1.6 * 10 / 60, places=3)
        self.assertAlmostEqual(mem["total_kg"], 1.6 * 20 / 60, places=3)
        self.assertEqual(granules.season_of(date(2026, 9, 15)), "2026-2027")
        self.assertEqual(granules.season_of(date(2026, 9, 15), 10), "2025-2026", "Suivi Stock Pellet starts in October")
        self.assertEqual(granules.season_of(date(2027, 8, 31)), "2026-2027")
        mem = granules.advance({**mem, "saison": "2025-2026"}, burning(5), None, late + timedelta(minutes=21), RATES)
        self.assertEqual((mem["saison"], mem["kg_saison"]), ("2026-2027", 0.0))
        self.assertGreater(mem["total_kg"], 0.5, "the total is never reset")


class TheBags(unittest.TestCase):
    """A bag declared in Suivi Stock Pellet: the tank was empty, one whole bag burnt since the previous one."""

    def test_the_factor_is_learnt_from_the_second_bag(self):
        mem = run(None, burning(5), 1, bags={"sacs": 6, "sac_kg": 15})
        self.assertFalse(mem["plein_connu"])
        mem = run(mem, burning(5), 300, bags={"sacs": 6, "sac_kg": 15})          # 8 kg by the rates
        mem = granules.advance(mem, burning(5), {"sacs": 7, "sac_kg": 15}, NOW + timedelta(minutes=302), RATES)
        self.assertEqual(mem["correction"], 1.0, "the tank was not known empty at the first look: nothing learnt")
        self.assertTrue(mem["plein_connu"])
        start = NOW + timedelta(minutes=302)
        mem = run(mem, burning(5), 375, bags={"sacs": 7, "sac_kg": 15}, start=start)   # 10 kg raw
        mem = granules.advance(mem, burning(5), {"sacs": 8, "sac_kg": 15}, start + timedelta(minutes=376), RATES)
        self.assertAlmostEqual(mem["correction"], 1.5, places=2, msg="one bag of 15 kg for 10 kg counted")
        before = mem["total_kg"]
        mem = run(mem, burning(5), 60, bags={"sacs": 8, "sac_kg": 15}, start=start + timedelta(minutes=376))
        self.assertAlmostEqual(mem["total_kg"] - before, 1.6 * mem["correction"], places=3, msg="the new kilos are scaled")

    def test_the_factor_stays_between_0_7_and_1_6(self):
        mem = {"total_brut": 100.0, "brut_remplissage": 90.0, "sacs": 3, "plein_connu": True, "a": NOW.isoformat()}
        mem = granules.advance(mem, None, {"sacs": 4, "sac_kg": 30}, NOW, RATES)
        self.assertEqual(mem["correction"], 1.6)
        mem = granules.advance({**mem, "brut_remplissage": 50.0}, None, {"sacs": 5, "sac_kg": 15}, NOW, RATES)
        self.assertEqual(mem["correction"], 0.7)

    def test_too_little_counted_or_several_bags_teach_nothing(self):
        mem = {"total_brut": 10.0, "brut_remplissage": 7.0, "sacs": 3, "plein_connu": True, "correction": 1.2}
        mem = granules.advance(mem, None, {"sacs": 4, "sac_kg": 15}, NOW, RATES)
        self.assertEqual(mem["correction"], 1.2, "3 kg counted: not worth learning from")
        mem = granules.advance({**mem, "total_brut": 30.0}, None, {"sacs": 6, "sac_kg": 15}, NOW, RATES)
        self.assertEqual((mem["correction"], mem["brut_remplissage"]), (1.2, 30.0))

    def test_bags_come_from_suivi_stock_pellet(self):
        pellets = house.stove_engine.pellets(m.pellets())
        self.assertEqual((pellets["consomme_sacs"], pellets["prix_sac"], pellets["debut_saison"]), (6.0, 5.5, 10))
        self.assertEqual(granules.bags_of(pellets), {"sacs": 6.0, "sac_kg": 15})
        self.assertEqual(granules.bags_of(pellets, 20), {"sacs": 6.0, "sac_kg": 20}, "the weight given in Réglages")
        self.assertIsNone(granules.bags_of(None))
        self.assertIsNone(granules.bags_of({"consomme_sacs": None, "sac_kg": 15}))


class TheFirePot(unittest.TestCase):
    def test_never_cleaned_in_hestia_there_is_no_count(self):
        v = granules.view(run(None, burning(3), 10), None, None, None, None)
        self.assertIsNone(v["brasier"]["kg"])
        self.assertFalse(v["brasier"]["a_nettoyer"])
        self.assertIn("J’ai nettoyé", v["brasier"]["texte"])

    def test_counted_from_hestias_kilos_without_bags(self):
        mem = granules.cleaned(run(None, burning(5), 10), None, NOW)
        mem = run(mem, burning(5), 60 * 7, start=NOW + timedelta(minutes=11))     # 11.2 kg
        v = granules.view(mem, None, None, 5.5, 15)["brasier"]
        self.assertAlmostEqual(v["kg"], 11.2, places=1)
        self.assertTrue(v["bientot"])
        self.assertFalse(v["a_nettoyer"])
        self.assertEqual(v["texte"], "Encore 3,8 kg avant le nettoyage du brasier.")
        mem = run(mem, burning(5), 150, start=NOW + timedelta(minutes=11 + 421))  # + 4 kg
        v = granules.view(mem, None, None, 5.5, 15)["brasier"]
        self.assertTrue(v["a_nettoyer"])
        self.assertAlmostEqual(v["kg"], 15.3, delta=0.05)
        self.assertTrue(v["texte"].startswith("Brasier à nettoyer : 15,3 kg brûlés depuis le dernier nettoyage."))
        twenty = granules.view(mem, None, 20, None, None)["brasier"]
        self.assertFalse(twenty["a_nettoyer"] or twenty["bientot"], "a threshold of 20 kg")
        self.assertEqual(twenty["texte"], "15,3 kg brûlés depuis le dernier nettoyage, sur 20.")

    def test_the_days_left_at_the_pace_since_the_cleaning(self):
        """1.0.0b4: the card says the days before the cleaning, at the pace since the last one."""
        mem = granules.cleaned(run(None, burning(5), 10), None, NOW)
        mem = run(mem, burning(5), 60 * 4, start=NOW + timedelta(minutes=11), step=5)           # 6.4 kg in 4 h
        self.assertIsNone(granules.view(mem, None, None, None, None, NOW + timedelta(hours=5))["brasier"]["jours"],
                          "less than a day of count: no pace yet")
        v = granules.view(mem, None, None, None, None, NOW + timedelta(days=2))["brasier"]
        self.assertAlmostEqual(v["jours"], 2.7, places=1)                                     # 8.6 kg at 3.2 kg a day
        self.assertEqual(v["texte"], "6,4 kg brûlés depuis le dernier nettoyage, sur 15, environ 3 jours au rythme "
                                     "depuis le dernier nettoyage.")
        self.assertIsNone(granules.view(mem, None, None, None, None)["brasier"]["jours"], "no time given")
        self.assertIsNone(granules.view(run(None, burning(3), 10), None, None, None, None, NOW)["brasier"]["jours"])

    def test_counted_from_the_bags_when_suivi_stock_pellet_is_there(self):
        bags = {"sacs": 6, "sac_kg": 15}
        mem = run(None, burning(5), 1, bags=bags)
        mem = granules.advance(mem, burning(5), {"sacs": 7, "sac_kg": 15}, NOW + timedelta(minutes=2), RATES)
        mem = run(mem, burning(5), 150, bags={"sacs": 7, "sac_kg": 15}, start=NOW + timedelta(minutes=3))  # 4 kg out
        mem = granules.cleaned(mem, {"sacs": 7, "sac_kg": 15}, NOW + timedelta(minutes=153))
        self.assertAlmostEqual(mem["reste_nettoyage"], 11.0, places=1)
        # Two bags later, 6 kg left in the tank: 11 + 15 + 15 − 6 = 35 kg burnt since the cleaning.
        mem.update(sacs=9, brut_remplissage=mem["total_brut"] - 9.0)
        bags = {"sacs": 9, "sac_kg": 15}
        self.assertAlmostEqual(granules.since_cleaning(mem, bags), 35.0, places=1)
        v = granules.view(mem, bags, None, None, None)["brasier"]
        self.assertTrue(v["par_les_sacs"] and v["a_nettoyer"])

    def test_a_new_season_of_suivi_stock_pellet_keeps_the_fire_pots_count(self):
        mem = {"sacs": 30, "sacs_nettoyage": 28, "nettoye_le": NOW.isoformat(), "total_brut": 5.0,
               "brut_remplissage": 5.0, "reste_nettoyage": 3.0, "correction": 1.0}
        before = granules.since_cleaning(mem, {"sacs": 30, "sac_kg": 15})
        mem = granules.advance(mem, None, {"sacs": 0, "sac_kg": 15}, NOW, RATES)
        self.assertEqual((mem["sacs"], mem["sacs_nettoyage"]), (0, -2))
        self.assertEqual(granules.since_cleaning(mem, {"sacs": 0, "sac_kg": 15}), before)


class WhatIsShown(unittest.TestCase):
    def test_energy_price_and_cost(self):
        mem = run(None, burning(5), 60)
        v = granules.view(mem, None, None, 5.5, 15)
        self.assertEqual(granules.KWH_PER_KG, 4.176)
        self.assertEqual(v["energie_kwh"], round(1.6 * 4.176, 2))
        self.assertEqual(v["prix_kg"], 0.367)
        self.assertEqual(v["prix_kwh"], 0.088)
        self.assertEqual(v["cout_heure"], 0.59)
        self.assertEqual(v["cout_jour"], 0.59)
        self.assertIsNone(granules.view(mem, None, None, None, 15)["prix_kg"], "no price: none invented")

    def test_the_house_gives_the_stove_its_count(self):
        snap = m.snapshot(granules_memoire=run(None, burning(3), 30, start=NOW - timedelta(minutes=30)))
        view = house.build(snap)
        conso = view["poele"]["conso"]
        self.assertEqual(conso["debit_kg_h"], 1.07)
        self.assertAlmostEqual(conso["total_kg"], 1.07 / 2, places=2)
        self.assertEqual((conso["prix_kg"], conso["prix_source"]), (0.367, "suivi"))
        self.assertEqual(view["_granules"]["sacs"], 6.0)
        self.assertEqual(view["_granules"]["saison"], "2026-2027")
        chosen = house.build(m.snapshot(granules_reglages={"prix_sac": 6.0, "brasier_kg": 20}))["poele"]["conso"]
        self.assertEqual((chosen["prix_kg"], chosen["prix_source"], chosen["brasier"]["seuil_kg"]), (0.4, "reglages", 20))
        self.assertNotIn("conso", house.build(m.snapshot(stove=None))["poele"] or {})


if __name__ == "__main__":
    unittest.main()
