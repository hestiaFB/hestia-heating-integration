"""The stove's sentence (engine/stove_says.py, 1.0): every state says something, the most urgent first."""
from __future__ import annotations

import unittest
from datetime import datetime

import maison_fictive  # noqa: F401  (puts the brick on the path)
from engine.stove_says import sentence

NOW = datetime(2026, 11, 24, 17, 0)


def stove(etat="chauffe", **extra):
    return {"etat": etat, "alarme": False, "a_traduire": False, "texte": None, "prise_w": None, "veille": False,
            "conso": None, "pilote": None, **extra}


def thermostat(t=20.0, target=21.5, slope=1.0, preset="boost", mode="heat"):
    return {"temperature": t, "consigne": target, "pente": slope, "preset": preset, "mode": mode}


def say(s, th=None, room=None):
    return sentence(s, thermostat() if th is None else th, room, NOW)


class WhileItBurns(unittest.TestCase):
    def test_the_set_point_reached_the_stove_keeps_it(self):
        self.assertEqual(say(stove(), thermostat(t=21.6)), {"texte": "Consigne atteinte, le poêle entretient",
                                                           "ton": "stove"})

    def test_the_hour_it_reaches_its_set_point(self):
        # 1,5 °C to go at 1 °C an hour: 18 h 30.
        self.assertEqual(say(stove(), thermostat(t=20.0, slope=1.0))["texte"], "21,5 °C vers 18 h 30")
        # Slow, or too far.
        self.assertEqual(say(stove(), thermostat(slope=0.2))["texte"], "Monte lentement vers 21,5 °C")
        self.assertEqual(say(stove(), thermostat(t=18.0, slope=0.5))["texte"], "Consigne à plus de 5 h")
        self.assertEqual(say(stove(), thermostat(t=None))["texte"], "En chauffe")

    def test_its_thermostat_in_its_own_safety(self):
        # 1.0.0b7: a probe without news, Versatile Thermostat switches itself off; Hestia keeps the flame at its lowest.
        th = {**thermostat(mode="off"), "securite": True}
        self.assertEqual(say(stove(pilote={"securite": "dehors"}), th),
                         {"texte": "Thermostat en sécurité, la sonde dehors ne répond plus : flamme au plus bas",
                          "ton": "act"})
        self.assertEqual(say(stove(pilote={"securite": "piece"}), th),
                         {"texte": "Thermostat en sécurité, la sonde de la pièce ne répond plus : arrêt du poêle",
                          "ton": "alert"})
        self.assertEqual(say(stove(), th), {"texte": "Thermostat en sécurité : une sonde ne répond plus", "ton": "act"})
        self.assertEqual(say(stove("eteint"), th), {"texte": "Thermostat en sécurité, une sonde ne répond plus : le "
                                                              "poêle ne démarrera pas", "ton": "act"})

    def test_a_window_open_in_its_room(self):
        self.assertEqual(say(stove(), room={"fenetre": True}), {"texte": "En chauffe, fenêtre ouverte", "ton": "alert"})

    def test_lighting_cleaning_stopping(self):
        self.assertEqual(say(stove("allumage"))["texte"], "Allumage en cours")
        self.assertEqual(say(stove("nettoyage"))["texte"], "Nettoyage automatique du brasier")
        self.assertEqual(say(stove("extinction")), {"texte": "Extinction en cours, comptez vingt minutes", "ton": "off"})


class Urgent(unittest.TestCase):
    def test_alarm_then_overheat_first(self):
        self.assertEqual(say(stove("alarme", alarme=True, alarme_texte="Sonde fumées")),
                         {"texte": "En alarme : Sonde fumées", "ton": "alert"})
        self.assertEqual(say(stove(), thermostat(t=28.4))["texte"], "Surchauffe : la pièce est à 28,4 °C")

    def test_a_silent_stove_and_its_plug(self):
        self.assertEqual(say(stove("inconnu", prise_w=420)),
                         {"texte": "Ne répond plus, mais sa prise tire 420 W : il brûle sans commande", "ton": "alert"})
        self.assertEqual(say(stove("inconnu", prise_w=3)), {"texte": "Ne répond plus", "ton": "act"})
        self.assertIn("« Ciao »", say(stove("inconnu", a_traduire=True, texte="Ciao"))["texte"])

    def test_the_fire_pot_and_a_start_that_did_not_go_through(self):
        pot = {"brasier": {"a_nettoyer": True, "kg": 16.24}}
        self.assertEqual(say(stove(conso=pot)), {"texte": "Brasier à nettoyer : 16,2 kg brûlés", "ton": "act"})
        drive = {"mode": "entier", "conduite": {"injoignable": True}}
        self.assertEqual(say(stove("eteint", pilote=drive))["texte"], "L’ordre d’allumage n’est pas passé")


class WhileItIsOff(unittest.TestCase):
    def test_standby_starts_again_by_itself(self):
        self.assertEqual(say(stove("eteint", veille=True))["texte"], "En veille, il repartira seul")

    def test_why_it_does_not_start(self):
        off = stove("eteint")
        self.assertEqual(say(off, thermostat(mode="off"))["texte"], "Thermostat éteint : le poêle ne démarrera pas")
        self.assertEqual(say(off, thermostat(preset="frost"))["texte"],
                         "Éteint, en hors gel jusqu’au prochain boost du planning")
        self.assertEqual(say(off, thermostat(preset="none"))["texte"],
                         "Éteint : consigne réglée à la main, le démarrage n’écoute que le boost")
        self.assertEqual(say(off, thermostat(preset="eco"))["texte"], "Éteint, démarrage au prochain passage en boost")
        self.assertEqual(say(off, {})["texte"], "Éteint")

    def test_already_in_boost(self):
        warm = stove("eteint", pilote={"mode": "ombre", "maison_c": 21.8})
        self.assertEqual(say(warm)["texte"], "Éteint : la maison est déjà à 21,8 °C pour 21,5 °C")
        cold = stove("eteint", pilote={"mode": "ombre", "maison_c": 19.0})
        self.assertEqual(say(cold)["texte"], "Éteint : le thermostat est déjà en boost, démarrage au prochain passage "
                                             "en boost")

    def test_the_pilot_says_why(self):
        refused = stove("eteint", pilote={"mode": "ombre", "action": "refuser", "texte": "Le thermostat est passé en "
                                          "boost, mais le thermostat est éteint."})
        self.assertEqual(say(refused, thermostat(preset="eco")), {"texte": "Éteint : le thermostat est éteint", "ton": "act"})
        locked = stove("eteint", pilote={"mode": "entier", "conduite": {"verrou": "surchauffe"}})
        self.assertEqual(say(locked, thermostat(mode="off"))["texte"],
                         "Éteint : Hestia a éteint son thermostat, la pièce était trop chaude")
        asking = stove("eteint", pilote={"mode": "entier", "conduite": {"question": {"sujet": "saison"}}})
        self.assertEqual(say(asking)["texte"], "Éteint : saison douce, Hestia attend votre accord")
        mild = stove("eteint", pilote={"mode": "entier", "maison_c": 18.5})
        self.assertEqual(say(mild, thermostat(preset="eco"))["texte"],
                         "Éteint : saison douce, le prochain démarrage demandera votre accord")


if __name__ == "__main__":
    unittest.main()
