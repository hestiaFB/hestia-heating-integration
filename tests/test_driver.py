"""The whole pilot (engine/driver.py, 0.7), without Home Assistant: the start, the stop, the safeties, the mild
season's question, the lock of the fire pot, the restart; and never anything to a stove copied from another house."""
from __future__ import annotations

from datetime import timedelta
import unittest

import maison_fictive as m
from engine import driver, pilot

NOW = m.NOW                                      # Friday 20 November 2026, 21 h 40
COLD, MILD = 17.5, 18.5                          # the house: cold enough to start without asking, or the mild season
SETTINGS = [{"nom": "Consigne interne à 25 °C", "role": "thermostat", "reserve": None, "a_changer": False},
            {"nom": "ECO Stop", "role": "eco_stop", "reserve": None, "a_changer": True},
            {"nom": "Ventilation en AUTO", "role": "ventilation", "reserve": 6, "a_changer": True}]


def stove(etat="eteint", flamme=None, **more):
    base = {"etat": etat, "flamme_reglee": flamme, "flamme": flamme, "flamme_min": 1, "flamme_max": 5, "fumees": 30.0,
            "alarme": False, "alarme_texte": None, "ecritures": 4, "ecritures_max": 25, "prise_w": 3.0,
            "pilotable": True, "allume": etat in ("allumage", "chauffe"), "reglages": SETTINGS}
    return {**base, **more}


HOT = {"fumees": 150.0, "prise_w": 280.0}       # a stove that still burns hard


def thermostat(preset="eco", mode="heat", demand=60, room=19.0, target=21.0, **more):
    return {"preset": preset, "mode": mode, "demande_pct": demand, "temperature": room, "consigne": target,
            "pente": 0.0, "securite": False, **more}


class Pilot:
    """A pilot that looks at the stove again and again, its memory carried from one look to the next."""

    def __init__(self, **ctx):
        self.mem: dict = {}
        self.now = NOW
        self.ctx = {"prise_switch": "switch.prise_du_poele", "couper_prise": True, **ctx}

    def look(self, s, t, after=timedelta(0), house_c=COLD, **ctx):
        self.now += after
        decision, self.mem, _ = pilot.decide(s, t, self.mem, self.now, house_c)
        orders, events, status, wake = driver.drive(decision, s, t, self.mem, self.now, {**self.ctx, **ctx})
        self.decision, self.events, self.status, self.wake = decision, events, status, wake
        return orders

    @property
    def run(self) -> dict:
        return self.mem.get("conduite") or {}


def gestures(orders):
    """The orders in short: « allumer », « thermostat:turn_off », « reglage:eco_stop », « notifier:muet »…"""
    out = []
    for o in orders:
        g = o["geste"]
        out.append(f"thermostat:{o['service']}" if g == "thermostat" else f"reglage:{o['role']}" if g == "reglage"
                   else f"notifier:{o['sujet']}" if g == "notifier" else f"effacer:{o['sujet']}" if g == "effacer"
                   else g)
    return out


def boosted(p: Pilot, s=None, house_c=COLD, **t):
    """The thermostat seen in eco, then stepped up to boost a minute later."""
    s = s or stove()
    p.look(s, thermostat("eco", **t), house_c=house_c)
    return p.look(s, thermostat("boost", **t), timedelta(minutes=1), house_c=house_c)


class Start(unittest.TestCase):
    def test_the_settings_then_the_order_to_light_then_it_checks(self):
        p = Pilot()
        orders = boosted(p)
        self.assertEqual(p.decision["action"], "demarrer")
        # Only the settings that changed; the order to light 2 s later.
        self.assertEqual(gestures(orders), ["reglage:eco_stop", "reglage:ventilation"])
        self.assertEqual(p.wake, 2.0)
        self.assertEqual(p.status["texte"], "Hestia prépare l’allumage.")
        orders = p.look(stove(), thermostat("boost"), timedelta(seconds=2))
        self.assertEqual(gestures(orders), ["allumer"])
        self.assertEqual(p.run["demarrages"], 1)
        self.assertEqual(p.events[0]["texte"], "Hestia allume le poêle (le thermostat est passé en boost).")
        self.assertTrue(p.events[0]["envoye"])
        self.assertEqual(p.wake, 180.0)
        # The stove takes it: done, nothing more.
        orders = p.look(stove("allumage", 2, allume=True), thermostat("boost"), timedelta(seconds=40))
        self.assertEqual(orders, [])
        self.assertEqual(p.run["allumage"]["fin"], "ok")
        self.assertIsNone(p.status["sequence"])

    def test_the_ventilation_waits_when_few_orders_are_left(self):
        p = Pilot()
        orders = boosted(p, stove(ecritures=19))       # 25 - 19 = 6 left: the ventilation keeps them
        self.assertEqual(gestures(orders), ["reglage:eco_stop"])

    def test_not_taken_the_integration_is_reloaded_then_the_stove_said_unreachable(self):
        p = Pilot()
        boosted(p)
        p.look(stove(), thermostat("boost"), timedelta(seconds=2))
        orders = p.look(stove(), thermostat("boost"), timedelta(minutes=3))
        self.assertEqual(gestures(orders), ["recharger"])
        self.assertEqual(p.wake, 20.0)
        orders = p.look(stove(), thermostat("boost"), timedelta(seconds=20))
        self.assertEqual(gestures(orders), ["allumer"])
        self.assertEqual(p.run["demarrages"], 1)       # the same start, sent again
        orders = p.look(stove(), thermostat("boost"), timedelta(minutes=3))
        self.assertEqual(gestures(orders), ["notifier:injoignable"])
        self.assertTrue(orders[0]["persistante"])
        self.assertTrue(p.status["injoignable"])
        self.assertEqual(p.status["texte"], "Le dernier ordre d’allumage n’est pas passé.")

    def test_three_starts_a_day_at_most(self):
        p = Pilot()
        for _ in range(3):
            boosted(p)
            p.look(stove(), thermostat("boost"), timedelta(seconds=2))
            p.look(stove("chauffe", 3), thermostat("boost"), timedelta(minutes=1))
            p.look(stove("eteint"), thermostat("eco"), timedelta(minutes=20))
        self.assertEqual(p.run["demarrages"], 3)
        orders = boosted(p)
        self.assertEqual(gestures(orders), ["notifier:refus"])
        self.assertIn("déjà démarré le poêle 3 fois", orders[0]["texte"])
        # The next day, the count starts again.
        p.look(stove(), thermostat("eco"), timedelta(days=1))
        self.assertEqual(p.run["demarrages"], 0)

    def test_a_stove_already_burning_is_not_lit_again(self):
        p = Pilot()
        s = stove("eteint")
        p.look(s, thermostat("eco"))
        # The house's own start in the same moment: the stove lights as the thermostat steps up.
        orders = p.look(stove("allumage", 2), thermostat("boost"), timedelta(minutes=1))
        self.assertNotIn("allumer", gestures(orders))


class Refuse(unittest.TestCase):
    def test_the_fire_pot_full_switches_the_thermostat_off_and_cleaning_switches_it_on(self):
        full = {"a_nettoyer": True, "kg": 16.2, "texte": "Brasier à nettoyer : 16,2 kg brûlés depuis le dernier "
                "nettoyage."}
        p = Pilot()
        s = stove(conso={"brasier": full})
        p.look(s, thermostat("eco"), brasier=full)
        orders = p.look(s, thermostat("boost"), timedelta(minutes=1), brasier=full)
        self.assertEqual(p.decision["action"], "refuser")
        self.assertEqual(gestures(orders), ["thermostat:turn_off", "notifier:nettoyage"])
        self.assertEqual(orders[1]["actions"], ["HESTIA_POELE_NETTOYE"])
        self.assertIn("le brasier est à nettoyer (16,2 kg", orders[1]["texte"])
        self.assertIn("« J’ai nettoyé » le rallumera", orders[1]["texte"])
        self.assertEqual(p.run["verrou"], "brasier")
        # The thermostat off: nothing more is said.
        orders = p.look(s, thermostat("boost", mode="off"), timedelta(minutes=1), brasier=full)
        self.assertEqual(orders, [])
        self.assertIn("brasier à nettoyer", p.status["texte"])
        # « J'ai nettoyé » : hors gel, then on, as the house does.
        orders = p.look(stove(), thermostat("boost", mode="off"), timedelta(minutes=5),
                        reponses={"nettoye": p.now.isoformat()})
        self.assertEqual(gestures(orders), ["effacer:nettoyage", "thermostat:set_preset_mode", "thermostat:turn_on",
                                            "effacer:verrou", "notifier:nettoyage"])
        self.assertEqual(orders[1]["donnees"], {"preset_mode": "frost"})
        self.assertIsNone(p.run["verrou"])

    def test_too_hot_locks_and_the_thermostat_switched_on_by_hand_lifts_it(self):
        p = Pilot()
        orders = boosted(p, room=28.5)
        self.assertEqual(gestures(orders), ["thermostat:turn_off", "notifier:verrou"])
        self.assertEqual(orders[1]["titre"], "Démarrage annulé : pièce trop chaude")
        p.look(stove(), thermostat("boost", mode="off", room=28.5), timedelta(minutes=1))
        orders = p.look(stove(), thermostat("eco", room=22.0), timedelta(minutes=30))
        self.assertEqual(gestures(orders), ["effacer:verrou"])
        self.assertIsNone(p.run["verrou"])

    def test_the_house_warm_enough_is_said_only(self):
        p = Pilot()
        orders = boosted(p, house_c=21.5)
        self.assertEqual(p.decision["action"], "refuser")
        self.assertEqual(gestures(orders), ["notifier:refus"])
        self.assertFalse(orders[0]["persistante"])
        self.assertIsNone(p.run.get("verrou"))
        self.assertFalse(p.events[0]["envoye"])


class MildSeason(unittest.TestCase):
    def ask(self) -> Pilot:
        p = Pilot()
        orders = boosted(p, house_c=MILD)
        self.assertEqual(p.decision["action"], "demander")
        self.assertEqual(gestures(orders), ["notifier:saison"])
        self.assertEqual(orders[0]["actions"], ["HESTIA_POELE_OUI", "HESTIA_POELE_NON"])
        self.assertEqual(p.status["question"]["reponses"], ["oui", "non"])
        self.assertEqual(p.status["question"]["reste_min"], 15)
        return p

    def test_yes_starts(self):
        p = self.ask()
        orders = p.look(stove(), thermostat("boost"), timedelta(minutes=2), house_c=MILD,
                        reponses={"oui": p.now.isoformat()})
        self.assertEqual(gestures(orders), ["effacer:saison", "reglage:eco_stop", "reglage:ventilation"])
        orders = p.look(stove(), thermostat("boost"), timedelta(seconds=2), house_c=MILD)
        self.assertEqual(gestures(orders), ["allumer"])
        self.assertIn("vous avez dit oui", p.events[0]["texte"])

    def test_no_puts_the_thermostat_back_to_hors_gel(self):
        p = self.ask()
        orders = p.look(stove(), thermostat("boost"), timedelta(minutes=2), house_c=MILD,
                        reponses={"non": p.now.isoformat()})
        self.assertEqual(gestures(orders), ["effacer:saison", "thermostat:set_preset_mode"])
        self.assertEqual(orders[1]["donnees"], {"preset_mode": "frost"})

    def test_no_answer_hors_gel_unless_the_stove_is_already_on_its_way(self):
        p = self.ask()
        orders = p.look(stove(), thermostat("boost"), timedelta(minutes=15), house_c=MILD)
        self.assertEqual(gestures(orders), ["effacer:saison", "thermostat:set_preset_mode"])
        p = self.ask()
        orders = p.look(stove("allumage", 2), thermostat("boost"), timedelta(minutes=15), house_c=MILD)
        self.assertEqual(gestures(orders), ["effacer:saison"])

    def test_the_thermostat_leaving_boost_is_a_no_without_order(self):
        p = self.ask()
        orders = p.look(stove(), thermostat("eco"), timedelta(minutes=3), house_c=MILD)
        self.assertEqual(gestures(orders), ["effacer:saison"])


class Stop(unittest.TestCase):
    def burning(self, **ctx) -> Pilot:
        p = Pilot(**ctx)
        p.look(stove("chauffe", 3, **HOT), thermostat("boost"))
        return p

    def test_hors_gel_stops_the_stove_and_checks_25_minutes_later(self):
        p = self.burning()
        orders = p.look(stove("chauffe", 3, **HOT), thermostat("frost"), timedelta(minutes=1))
        self.assertEqual(p.decision["action"], "arreter")
        self.assertEqual(gestures(orders), ["eteindre"])
        self.assertEqual(p.wake, 15.0)
        orders = p.look(stove("extinction", **HOT), thermostat("frost"), timedelta(seconds=15))
        self.assertEqual(orders, [])
        self.assertEqual(p.run["arret"]["phase"], "verif")
        self.assertIn("vérification à 22 h 06", p.status["texte"])
        orders = p.look(stove("eteint", fumees=55.0, prise_w=4.0), thermostat("frost"), timedelta(minutes=25))
        self.assertEqual(orders, [])
        self.assertEqual(p.run["arret"]["fin"], "ok")
        self.assertIn("Arrêt vérifié : il est éteint.", p.events[0]["texte"])

    def test_three_orders_then_again_then_the_plug(self):
        p = self.burning()
        hot = stove("chauffe", 3, **HOT)
        sent = [gestures(p.look(hot, thermostat("frost"), timedelta(minutes=1)))]
        sent += [gestures(p.look(hot, thermostat("frost"), timedelta(seconds=15))) for _ in range(3)]
        self.assertEqual(sent, [["eteindre"], ["eteindre"], ["eteindre"], ["notifier:arret"]])
        orders = p.look(hot, thermostat("frost"), timedelta(minutes=25))
        self.assertEqual(gestures(orders), ["notifier:arret", "eteindre"])
        orders = p.look(hot, thermostat("frost"), timedelta(seconds=30))
        self.assertEqual(gestures(orders), ["notifier:alerte"])
        self.assertEqual(orders[0]["actions"], ["HESTIA_POELE_COUPER", "HESTIA_POELE_IGNORER"])
        self.assertEqual(p.status["question"]["reponses"], ["couper", "ignorer"])
        orders = p.look(hot, thermostat("frost"), timedelta(minutes=5))
        self.assertEqual(gestures(orders), ["prise", "notifier:alerte"])
        self.assertEqual(orders[0]["on"], False)
        self.assertEqual(p.run["arret"]["fin"], "prise")

    def test_the_plug_is_not_cut_without_an_answer_when_reglages_say_so(self):
        p = self.burning(couper_prise=False)
        hot = stove("chauffe", 3, **HOT)
        p.look(hot, thermostat("frost"), timedelta(minutes=1))
        for _ in range(3):
            p.look(hot, thermostat("frost"), timedelta(seconds=15))
        p.look(hot, thermostat("frost"), timedelta(minutes=25))
        orders = p.look(hot, thermostat("frost"), timedelta(seconds=30))
        self.assertIn("Hestia ne fait rien", orders[0]["texte"])
        orders = p.look(hot, thermostat("frost"), timedelta(minutes=5))
        self.assertEqual(orders, [])
        # « Ignorer » or « Couper » still work, answered in time.
        p = self.burning(couper_prise=False)
        p.look(hot, thermostat("frost"), timedelta(minutes=1))
        for _ in range(3):
            p.look(hot, thermostat("frost"), timedelta(seconds=15))
        p.look(hot, thermostat("frost"), timedelta(minutes=25))
        p.look(hot, thermostat("frost"), timedelta(seconds=30))
        orders = p.look(hot, thermostat("frost"), timedelta(minutes=1), reponses={"couper": p.now.isoformat()})
        self.assertEqual(gestures(orders), ["prise", "notifier:alerte"])

    def test_the_stop_waits_for_the_stove_to_say_its_state(self):
        p = self.burning()
        orders = p.look(stove("inconnu", **HOT), thermostat("frost"), timedelta(minutes=1))
        self.assertEqual(orders, [])
        self.assertEqual(p.wake, 120.0)
        orders = p.look(stove("inconnu", **HOT), thermostat("frost"), timedelta(minutes=2))
        self.assertEqual(gestures(orders), ["eteindre"])

    def test_the_house_warm_enough_puts_hors_gel_then_stops(self):
        p = Pilot()
        hot = stove("chauffe", 3, **HOT)
        p.look(hot, thermostat("boost"), house_c=21.5)
        orders = p.look(hot, thermostat("boost"), timedelta(minutes=2), house_c=21.5)
        self.assertEqual(gestures(orders), ["thermostat:set_preset_mode", "eteindre"])
        self.assertEqual(orders[0]["donnees"], {"preset_mode": "frost"})

    def test_a_stop_given_up_when_the_thermostat_asks_again(self):
        p = self.burning()
        hot = stove("chauffe", 3, **HOT)
        self.assertEqual(gestures(p.look(hot, thermostat("frost"), timedelta(minutes=1))), ["eteindre"])
        orders = p.look(hot, thermostat("boost"), timedelta(seconds=10))
        self.assertEqual(orders, [])
        self.assertEqual(p.run["arret"]["fin"], "annule")


class Safety(unittest.TestCase):
    def test_an_alarm_that_lasts_switches_the_thermostat_off_then_stops(self):
        p = Pilot()
        alarm = stove("chauffe", 3, alarme=True, alarme_texte="Dépression",
                      alarme_depuis=(NOW - timedelta(minutes=3)).isoformat(), **HOT)
        orders = p.look(alarm, thermostat("boost"))
        self.assertEqual(p.decision["action"], "couper")
        self.assertEqual(gestures(orders), ["thermostat:turn_off", "notifier:alarme", "eteindre"])
        self.assertEqual(orders[1]["texte"], "Le poêle est en alarme (Dépression) depuis 2 minutes. Hestia a éteint "
                         "son thermostat et arrête le poêle.")
        self.assertTrue(orders[1]["persistante"])
        # Not again at the next look.
        orders = p.look(alarm, thermostat("boost", mode="off"), timedelta(seconds=15))
        self.assertEqual(gestures(orders), ["eteindre"])

    def test_a_silent_stove_is_said_once_with_its_plug(self):
        p = Pilot()
        silent = stove("inconnu", prise_w=240.0, depuis=(NOW - timedelta(minutes=16)).isoformat())
        orders = p.look(silent, thermostat("boost"))
        self.assertEqual(gestures(orders), ["notifier:muet"])
        self.assertIn("Sa prise tire 240 W", orders[0]["texte"])
        self.assertEqual(orders[0]["actions"], ["HESTIA_POELE_COUPER"])
        self.assertEqual(p.look(silent, thermostat("boost"), timedelta(minutes=1)), [])
        # The person chose to cut the plug.
        orders = p.look(silent, thermostat("boost"), timedelta(minutes=1), reponses={"couper": p.now.isoformat()})
        self.assertEqual(gestures(orders), ["prise"])
        # Back: the notice goes.
        orders = p.look(stove("chauffe", 3), thermostat("boost"), timedelta(minutes=1))
        self.assertEqual(gestures(orders), ["effacer:muet"])

    def test_the_fire_pot_full_while_it_burns_is_said_once(self):
        full = {"a_nettoyer": True, "kg": 15.1, "texte": "Brasier à nettoyer."}
        p = Pilot()
        orders = p.look(stove("chauffe", 3), thermostat("boost"), brasier=full)
        self.assertEqual(gestures(orders), ["notifier:nettoyage"])
        self.assertEqual(p.look(stove("chauffe", 3), thermostat("boost"), timedelta(minutes=1), brasier=full), [])


class Restart(unittest.TestCase):
    def test_a_stove_burning_with_its_thermostat_off_gets_it_back_in_boost(self):
        p = Pilot(ha_depuis=NOW.isoformat())
        burning = stove("chauffe", 3)
        self.assertEqual(p.look(burning, thermostat("boost", mode="off")), [])
        self.assertEqual(p.wake, 180.0)
        orders = p.look(burning, thermostat("boost", mode="off"), timedelta(minutes=3))
        self.assertEqual(gestures(orders), ["thermostat:set_hvac_mode", "thermostat:set_preset_mode",
                                            "notifier:reprise"])
        self.assertEqual([o.get("donnees") for o in orders[:2]], [{"hvac_mode": "heat"}, {"preset_mode": "boost"}])
        # Once only; and its thermostat back on is not a start.
        orders = p.look(burning, thermostat("boost"), timedelta(minutes=1))
        self.assertEqual(orders, [])
        self.assertNotIn("allumer", gestures(orders))

    def test_the_stove_off_after_a_restart_is_left_alone(self):
        p = Pilot(ha_depuis=NOW.isoformat())
        orders = p.look(stove(), thermostat("boost", mode="off"), timedelta(minutes=4))
        self.assertEqual(orders, [])

    def test_only_the_day_count_and_the_lock_go_through_a_restart(self):
        p = Pilot()
        boosted(p, room=28.5)
        kept = driver.kept(p.run)
        self.assertEqual(set(kept), {"jour", "demarrages", "verrou"})
        self.assertEqual(kept["verrou"], "surchauffe")


class Fan(unittest.TestCase):
    """1.0, Réglages « Ventilation »: AUTO before each start (the default), or « flamme + 1 »."""
    LEVELS = {"ventilation_niveaux": ["1", "2", "3", "4", "5"]}

    def fans(self, orders):
        return [o["valeur"] for o in orders if o["geste"] == "ventilation"]

    def test_flame_plus_one_sets_nothing_before_a_start(self):
        p = Pilot(ventilation="flamme")
        self.assertEqual(gestures(boosted(p, stove(**self.LEVELS))), ["reglage:eco_stop"])

    def test_lowest_while_the_smoke_is_cold_then_the_flame_plus_one(self):
        p = Pilot(ventilation="flamme")
        boost = thermostat("boost")
        p.look(stove(**self.LEVELS), thermostat("eco"))
        # Lighting, the fan in AUTO: at its lowest.
        orders = p.look(stove("allumage", ventilation="AUTO", **self.LEVELS), boost, timedelta(minutes=1))
        self.assertEqual(self.fans(orders), ["1"])
        self.assertIn("Hestia met la ventilation à 1 : au plus bas tant que les fumées sont sous 110 °C.",
                      [e["texte"] for e in p.events])
        # Burning, the smoke at 150 °C, flame 3: 4, but not within 10 minutes of the last order.
        hot = stove("chauffe", 3, ventilation="1", **HOT, **self.LEVELS)
        self.assertEqual(self.fans(p.look(hot, boost, timedelta(minutes=4))), [])
        self.assertEqual(p.wake, 360.0)
        self.assertEqual(self.fans(p.look(hot, boost, timedelta(minutes=6))), ["4"])
        # Flame 5: 5 at most; the smoke cooling under 110 °C later does not bring it down to the lowest.
        top = stove("chauffe", 5, ventilation="4", **HOT, **self.LEVELS)
        self.assertEqual(self.fans(p.look(top, boost, timedelta(minutes=10))), ["5"])
        cooler = stove("chauffe", 1, ventilation="5", fumees=95.0, prise_w=120.0, **self.LEVELS)
        self.assertEqual(self.fans(p.look(cooler, boost, timedelta(minutes=10))), ["2"])
        # Stopped: nothing more, and the next burn starts at the lowest again.
        p.look(stove("extinction", ventilation="2", **self.LEVELS), boost, timedelta(minutes=10))
        self.assertIsNone(p.run.get("ventilation"))

    def test_the_fan_already_right_or_few_orders_left_nothing_is_sent(self):
        p = Pilot(ventilation="flamme")
        boost = thermostat("boost")
        p.look(stove(**self.LEVELS), thermostat("eco"))
        self.assertEqual(self.fans(p.look(stove("allumage", ventilation="1", **self.LEVELS), boost,
                                          timedelta(minutes=1))), [])
        few = stove("chauffe", 3, ventilation="1", ecritures=19, **HOT, **self.LEVELS)   # 6 left
        self.assertEqual(self.fans(p.look(few, boost, timedelta(minutes=20))), [])

    def test_auto_or_a_fan_without_levels_is_left_alone(self):
        for ctx, more in (({}, self.LEVELS), ({"ventilation": "flamme"}, {})):
            p = Pilot(**ctx)
            p.look(stove(), thermostat("eco"))
            orders = p.look(stove("chauffe", 3, ventilation="AUTO", **HOT, **more), thermostat("boost"),
                            timedelta(minutes=1))
            self.assertEqual(self.fans(orders), [])


class Never(unittest.TestCase):
    def test_nothing_to_a_stove_copied_from_another_house(self):
        p = Pilot(copie=True)
        everything = []
        everything += boosted(p)
        everything += p.look(stove("chauffe", 3, **HOT), thermostat("frost"), timedelta(minutes=1))
        everything += p.look(stove("chauffe", 3, alarme=True, alarme_depuis=NOW.isoformat()), thermostat("boost"),
                             timedelta(minutes=5))
        self.assertEqual(everything, [])
        self.assertEqual(p.status["texte"], "Ce poêle est recopié d’une autre maison : Hestia ne lui envoie rien.")
        self.assertEqual(p.run, {"jour": NOW.date().isoformat(), "demarrages": 0})

    def test_nothing_without_a_thermostat_or_a_profile_that_says_how(self):
        p = Pilot()
        self.assertEqual(boosted(p, stove(pilotable=False)), [])
        self.assertIn("ne dit pas encore comment", p.status["texte"])
        decision, mem, _ = pilot.decide(stove(), None, {}, NOW, COLD)
        orders, _, status, _ = driver.drive(decision, stove(), None, mem, NOW, {})
        self.assertEqual(orders, [])

    def test_the_memory_given_is_not_changed(self):
        """The view can be built twice in one look: the second build starts from the same memory."""
        p = Pilot()
        p.look(stove(), thermostat("eco"))
        before = dict(p.mem)
        decision, mem, _ = pilot.decide(stove(), thermostat("boost"), before, NOW + timedelta(minutes=1), COLD)
        frozen = repr(mem.get("conduite"))
        driver.drive(decision, stove(), thermostat("boost"), dict(mem), NOW + timedelta(minutes=1), {})
        self.assertEqual(repr(mem.get("conduite")), frozen)


if __name__ == "__main__":
    unittest.main()
