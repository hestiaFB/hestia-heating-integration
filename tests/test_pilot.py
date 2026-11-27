"""The stove's pilot (engine/pilot.py and its part of the house view), without Home Assistant: « à l'ombre », and the
« flamme » mode of the 0.5 (Hestia sets the flame, and only that)."""
from __future__ import annotations

from datetime import timedelta
import unittest

import maison_fictive as m
from engine import house, mild, pilot

NOW = m.NOW                                      # Friday 20 November 2026, 21 h 40


def stove(etat="eteint", flamme=None, **more):
    base = {"etat": etat, "flamme_reglee": flamme, "flamme": flamme, "flamme_min": 1, "flamme_max": 5, "fumees": 30.0,
            "alarme": False, "alarme_texte": None, "ecritures": 4, "ecritures_max": 25, "prise_w": 3.0}
    return {**base, **more}


def thermostat(preset="eco", demand=0, room=19.0, target=21.0, slope=0.0, mode="heat", **more):
    return {"preset": preset, "mode": mode, "demande_pct": demand, "temperature": room, "consigne": target,
            "pente": slope, "securite": False, **more}


def seen(stove_now, thermostat_now, **mem):
    """The memory of a pilot that looked one minute ago."""
    return {"etat": stove_now.get("etat"),
            "reglee": stove_now.get("flamme_reglee"), "preset": thermostat_now.get("preset"),
            "mode": thermostat_now.get("mode"), **mem}


HOUSE_C = 17.5                                  # the house, cold enough to start without asking


def safe(at, piece=None, dehors=None, preset="boost"):
    """The stove's thermostat in Versatile Thermostat's safety at `at`: by default its room probe spoke 5 minutes ago,
    its outdoor one 61 minutes before NOW (the station still, as on 25 November 2026)."""
    return thermostat(preset, mode="off", demand=0, target=21.5, securite=True, securite_delai_min=60,
                      sonde_piece_a=(piece or at - timedelta(minutes=5)).isoformat(),
                      sonde_dehors_a=(dehors or NOW - timedelta(minutes=61)).isoformat())


def decide(s, t, mem, now=NOW, house_c=HOUSE_C, over_c=None, outlook=None):
    return pilot.decide(s, t, mem, now, house_c, over_c=over_c, outlook=outlook)


class Flame(unittest.TestCase):
    def test_the_demand_gives_the_flame_with_a_margin(self):
        self.assertEqual([pilot.flame_for(d, None) for d in (0, 20, 45, 64, 65, 85, 100)], [2, 2, 3, 3, 4, 5, 5])
        self.assertEqual(pilot.flame_for(71, 3), 3)        # 3 holds from 38 % to 71 %, like the house's rule
        self.assertEqual(pilot.flame_for(72, 3), 4)
        self.assertEqual(pilot.flame_for(38, 3), 3)
        self.assertEqual(pilot.flame_for(37, 3), 2)
        self.assertEqual(pilot.flame_for(3, 2), 2)
        self.assertEqual(pilot.flame_for(60, 1), 3)        # flame 1 is never held by the margin
        self.assertIsNone(pilot.flame_for(None, 3))

    def test_down_at_once_up_thirty_minutes_after_the_last_change(self):
        s, t = stove("chauffe", 4), thermostat("boost", demand=50)
        decision, mem, events = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"], decision["titre"]), ("flamme", 3, "Flamme 4 → 3"))
        self.assertEqual(events[0]["texte"], "Hestia mettrait la flamme à 3.")
        self.assertFalse(decision["accord"])
        # The stove's flame changed ten minutes ago (by anyone), the demand asks one step more: it waits.
        s = stove("chauffe", 3, flamme_depuis=(NOW - timedelta(minutes=10)).isoformat())
        t = thermostat("boost", demand=80)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 3))
        self.assertIn("Il monterait dans 21 min", decision["texte"])
        # Two steps apart: at once.
        decision, _, _ = decide(s, thermostat("boost", demand=95), seen(s, t))
        self.assertEqual(decision["flamme"], 5)
        # Half an hour after the last change: up.
        s = stove("chauffe", 3, flamme_depuis=(NOW - timedelta(minutes=31)).isoformat())
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual(decision["flamme"], 4)

    def test_it_modulates_while_the_stove_lights(self):
        s, t = stove("allumage", 2), thermostat("boost", demand=100)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("flamme", 5))

    def test_flame_one_before_the_room_passes_its_set_point_and_while_it_is_there(self):
        # 1.0: too hot at 2 °C over the set point (Frank: 0.5 °C was too little), unless Réglages say otherwise.
        s, t = stove("chauffe", 3), thermostat("boost", demand=90, room=22.9, slope=0.8)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual(decision["flamme"], 1)
        self.assertIn("23,1 °C dans 15 min, plus de 2 °C au-dessus", decision["texte"])
        mild = thermostat("boost", demand=90, room=21.4, slope=0.8)
        decision, _, _ = decide(s, mild, seen(s, mild))
        self.assertEqual(decision["flamme"], 5)
        decision, _, _ = decide(s, mild, seen(s, mild), over_c=0.5)
        self.assertEqual(decision["flamme"], 1)
        self.assertIn("21,6 °C dans 15 min, plus de 0,5 °C au-dessus", decision["texte"])
        # A falling slope does not count: the demand's step again.
        decision, _, _ = decide(s, thermostat("boost", demand=60, room=21.4, slope=-2), seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 3))
        # At 1, it stays there while the room is at its set point; under it, back to the demand's step.
        s = stove("chauffe", 1)
        decision, _, _ = decide(s, thermostat("boost", demand=50, room=21.0), seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 1))
        decision, _, _ = decide(s, thermostat("boost", demand=50, room=20.8), seen(s, t))
        self.assertEqual(decision["flamme"], 3)

    def test_flame_one_reads_the_smoothed_temperature_not_a_puff_on_the_probe(self):
        # A puff of hot air from the stove: the live temperature jumps, the slope with it; the smoothed one does not.
        s = stove("chauffe", 5)
        puff = thermostat("boost", demand=95, room=20.3, slope=8.0, target=21.5, temperature_lissee=19.7)
        decision, _, _ = decide(s, puff, seen(s, puff))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 5))
        # The smoothed temperature itself on its way past the set point: flame 1, and the text says it.
        hot = thermostat("boost", demand=95, room=23.4, slope=2.0, target=21.5, temperature_lissee=23.1)
        decision, _, _ = decide(s, hot, seen(s, hot))
        self.assertEqual(decision["flamme"], 1)
        self.assertIn("23,6 °C dans 15 min", decision["texte"])
        # Over 28 °C, the safety reads the live temperature.
        burning = thermostat("boost", demand=95, room=28.5, slope=0.0, target=21.5, temperature_lissee=27.5)
        decision, _, _ = decide(s, burning, seen(s, burning))
        self.assertEqual(decision["action"], "couper")

    def test_it_keeps_four_orders_to_stop_the_stove(self):
        s, t = stove("chauffe", 4, ecritures=21), thermostat("boost", demand=50)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual((decision["action"], decision["flamme"]), ("garder", 4))
        self.assertIn("21 ordres sur 25", decision["texte"])
        # A profile without a daily limit: 20, like the stove's extension.
        s = stove("chauffe", 4, ecritures=16, ecritures_max=None)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertIn("16 ordres sur 20", decision["texte"])

    def test_the_house_moves_the_flame(self):
        s, t = stove("chauffe", 3), thermostat("boost", demand=80)
        _, mem, _ = decide(s, t, seen(s, t))                         # Hestia would raise to 4
        _, _, events = decide(stove("chauffe", 4), t, mem, NOW + timedelta(minutes=1))
        self.assertEqual([(e["texte"], e["accord"]) for e in events], [("La maison a mis la flamme à 4.", True)])
        _, _, events = decide(stove("chauffe", 2), t, mem, NOW + timedelta(minutes=1))
        self.assertEqual([(e["texte"], e["accord"]) for e in events][-1], ("La maison a mis la flamme à 2.", False))


class StartAndStop(unittest.TestCase):
    def test_every_step_up_to_boost_starts_it(self):
        s = stove()
        decision, mem, events = decide(s, thermostat("boost"), seen(s, thermostat("eco")))
        self.assertEqual(decision["action"], "demarrer")
        self.assertEqual([e["texte"] for e in events], ["Hestia démarrerait le poêle."])
        # Back to frost, then boost again the same day (the evening's boost): it starts again.
        mem["preset"] = "frost"
        mem["demarrage"] = (NOW - timedelta(hours=2)).isoformat()
        decision, _, _ = decide(s, thermostat("boost"), mem)
        self.assertEqual(decision["action"], "demarrer")
        # On to heat while the thermostat is already in boost: it starts too.
        decision, _, _ = decide(s, thermostat("boost"), seen(s, thermostat("boost", mode="off")))
        self.assertEqual(decision["action"], "demarrer")

    def test_no_start_on_first_sight_nor_in_a_warm_house(self):
        decision, _, events = decide(stove(), thermostat("boost"), {})
        self.assertEqual((decision["action"], events), ("attendre", []))
        s = stove()
        decision, _, _ = decide(s, thermostat("boost"), seen(s, thermostat("eco")), house_c=21.0)
        self.assertEqual(decision["action"], "refuser")
        self.assertIn("la maison est à 21 °C pour 21 °C visés", decision["texte"])
        decision, _, _ = decide(s, thermostat("boost"), seen(s, thermostat("eco")), house_c=None)
        self.assertIn("la température de la maison est inconnue", decision["texte"])

    def test_refused_when_the_stove_or_its_room_is_not_safe(self):
        s, before = stove(), seen(stove(), thermostat("eco"))
        for case, text in ((dict(stove=stove(alarme=True, alarme_texte="Pellet")), "en alarme (Pellet)"),
                           (dict(stove=stove("inconnu")), "le poêle ne répond pas"),
                           (dict(room=28.5), "la pièce du poêle est à 28,5 °C"),
                           (dict(mode="off"), "le thermostat est éteint")):
            decision, _, _ = decide(case.get("stove", s), thermostat("boost", room=case.get("room", 19.0),
                                                                     mode=case.get("mode", "heat")), before)
            self.assertEqual(decision["action"], "refuser", text)
            self.assertIn(text, decision["texte"])

    def test_the_mild_season_asks_first(self):
        s = stove()
        decision, mem, events = decide(s, thermostat("boost", room=20.6), seen(s, thermostat("eco", room=20.6)),
                                       house_c=18.4)
        self.assertEqual((decision["action"], decision["titre"]), ("demander", "Démarrer ?"))
        self.assertIn("saison douce", decision["texte"])
        # 1.1.0b8: the room carried to the end of the boost; without an answer, the boost is watched.
        self.assertIn("la pièce du poêle est à 20,6 °C et serait à", decision["texte"])
        self.assertIn("il garderait le boost et surveillerait la pièce", decision["texte"])
        self.assertIsNotNone(mem["veille"])
        self.assertEqual(events[0]["texte"], "Hestia demanderait votre accord pour démarrer le poêle (saison douce).")
        self.assertTrue(mem["saison_douce"])
        # Under 18 °C it no longer asks, and it does not ask again until the house reaches 19 °C.
        _, mem, _ = decide(s, thermostat("frost"), mem, house_c=17.9)
        self.assertFalse(mem["saison_douce"])
        decision, mem, _ = decide(s, thermostat("boost"), mem, house_c=18.6)
        self.assertEqual(decision["action"], "demarrer")
        _, mem, _ = decide(s, thermostat("frost"), mem, house_c=19.0)
        self.assertTrue(mem["saison_douce"])

    def test_the_mild_season_reads_the_room_at_the_end_of_the_boost(self):
        # 27 November, 17 h: the house at 19.5 °C, the stove's room at 21.4 °C for a boost at 21.5 °C until 22 h, a
        # mild evening. Nothing to heat: no start, no question, the boost watched.
        s = stove()
        evening = [{"time": (NOW + timedelta(hours=h)).isoformat(), "temperature": 12.0} for h in range(8)]
        out = {"fin": NOW + timedelta(hours=1), "heures": evening, "dehors_c": 12.0}
        decision, mem, _ = decide(s, thermostat("boost", room=21.4, target=21.5),
                                  seen(s, thermostat("frost", room=21.4)), house_c=19.5, outlook=out)
        self.assertEqual((decision["action"], decision["titre"]), ("refuser", "Pas besoin du poêle"))
        self.assertEqual(mem["veille"]["fin"], out["fin"].isoformat())
        # A room 3 °C under the boost: lit without asking, even in the mild season.
        decision, mem, _ = decide(s, thermostat("boost", room=18.5, target=21.5),
                                  seen(s, thermostat("frost", room=18.5)), house_c=19.5, outlook=out)
        self.assertEqual(decision["action"], "demarrer")

    def test_the_room_s_own_pace(self):
        # A room that lost 1 °C in 2 hours, 10 °C over outside: it loses 5 % of its gap an hour.
        rows = [[(NOW - timedelta(hours=2)).isoformat(), 21.0, 10.5], [NOW.isoformat(), 20.0, 10.5]]
        self.assertAlmostEqual(mild.pace(rows, None), 0.05, places=3)
        # Warming (the sun), too short, or too close to outside: it does not say.
        self.assertIsNone(mild.pace([rows[1], [(NOW + timedelta(hours=2)).isoformat(), 20.5, 10.0]], None))
        self.assertIsNone(mild.pace([rows[0], [(NOW - timedelta(hours=1)).isoformat(), 20.8, 10.5]], None))
        self.assertIsNone(mild.pace([[rows[0][0], 12.0, 11.0], [rows[1][0], 11.5, 11.0]], None))
        # Carried 4 hours at 10 °C outside, k 0.05: 20 → about 18.1.
        self.assertAlmostEqual(mild.carry(20.0, NOW, NOW + timedelta(hours=4),
                                          [{"time": NOW.isoformat(), "temperature": 10.0}], 0.05), 18.15, places=1)
        # The readings: one every 10 minutes, over 3 hours, emptied while the stove burns.
        kept = mild.remember([], NOW, 20.0, 10.0, False)
        kept = mild.remember(kept, NOW + timedelta(minutes=5), 19.9, 10.0, False)
        self.assertEqual(len(kept), 1)
        kept = mild.remember(kept, NOW + timedelta(minutes=10), 19.9, 10.0, False)
        self.assertEqual(len(kept), 2)
        self.assertEqual(mild.remember(kept, NOW, 20.0, 10.0, True), [])
        self.assertEqual(len(mild.remember(kept, NOW + timedelta(hours=3, minutes=5), 19.0, 10.0, False)), 2)

    def test_the_end_of_the_boost_on_the_planning(self):
        day = NOW.replace(tzinfo=None, hour=0, minute=0)
        line = [(day.replace(hour=17), "boost", {}), (day.replace(hour=22), "hors_gel", {})]
        self.assertEqual(mild.boost_end(line, day.replace(hour=17, minute=5), NOW.tzinfo, "boost"),
                         day.replace(hour=22, tzinfo=NOW.tzinfo))
        self.assertIsNone(mild.boost_end(line, day.replace(hour=16), NOW.tzinfo, "boost"))
        self.assertIsNone(mild.boost_end(None, day, NOW.tzinfo, "boost"))

    def test_the_house_starts_it_in_the_same_minute(self):
        before = stove()
        decision, mem, events = decide(stove("allumage", 3), thermostat("boost", demand=50),
                                       seen(before, thermostat("eco")))
        self.assertEqual(decision["action"], "garder")
        self.assertEqual([(e["qui"], e["accord"]) for e in events], [("hestia", None), ("maison", True)])

    def test_frost_stops_it_and_the_house_agrees(self):
        s, t = stove("chauffe", 3), thermostat("frost")
        decision, mem, events = decide(s, t, seen(s, thermostat("boost")))
        self.assertEqual(decision["action"], "arreter")
        self.assertEqual(events[0]["texte"], "Hestia arrêterait le poêle.")
        decision, mem, events = decide(stove("extinction", 3), t, mem, NOW + timedelta(minutes=1))
        self.assertEqual([(e["texte"], e["accord"]) for e in events], [("La maison a éteint le poêle.", True)])
        decision, _, _ = decide(stove("eteint", 3, fumees=45.0, prise_w=2.0), t, mem, NOW + timedelta(minutes=40))
        self.assertIn("Le poêle est éteint, fumées froides, prise au repos.", decision["texte"])

    def test_off_counts_after_thirty_seconds(self):
        s = stove("chauffe", 3)
        decision, mem, _ = decide(s, thermostat("boost", mode="off", demand=50), seen(s, thermostat("boost")))
        self.assertNotEqual(decision["action"], "arreter")
        decision, _, _ = decide(s, thermostat("boost", mode="off", demand=50), mem, NOW + timedelta(seconds=40))
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Le thermostat est éteint.", decision["texte"])

    def test_a_silent_moment_of_the_cloud_is_not_a_start(self):
        t = thermostat("boost", demand=20)
        s = stove("chauffe", 1)
        _, mem, _ = decide(s, t, seen(s, t))
        _, mem, events = decide(stove("inconnu", None), t, mem, NOW + timedelta(minutes=1))
        _, mem, events = decide(s, t, mem, NOW + timedelta(minutes=2))
        self.assertFalse([e for e in events if e["qui"] == "maison"])
        # A stove really off before its silence, then burning: the house started it.
        off = stove("eteint", 1)
        _, mem, _ = decide(off, t, seen(off, t))
        _, mem, _ = decide(stove("inconnu", None), t, mem, NOW + timedelta(minutes=1))
        _, mem, events = decide(stove("allumage", 1), t, mem, NOW + timedelta(minutes=2))
        self.assertEqual([e["texte"] for e in events if e["qui"] == "maison"], ["La maison a démarré le poêle."])

    def test_a_thermostat_restored_off_by_a_restart_is_not_a_switch_off(self):
        s = stove("chauffe", 3)
        # The first look after a restart: nothing seen before (the coordinator drops the old mode and preset).
        mem = {"etat": "chauffe", "reglee": 3}
        decision, mem, _ = decide(s, thermostat("boost", mode="off", demand=50), mem)
        decision, mem, _ = decide(s, thermostat("boost", mode="off", demand=50), mem, NOW + timedelta(minutes=2))
        self.assertNotEqual(decision["action"], "arreter")
        # Back from « unavailable », or from a thermostat without a preset: not a switch-off either.
        for before in (thermostat(None, mode="unavailable"), thermostat(None, mode="heat")):
            decision, mem, _ = decide(s, thermostat("boost", mode="off", demand=50), seen(s, before))
            decision, _, _ = decide(s, thermostat("boost", mode="off", demand=50), mem, NOW + timedelta(seconds=40))
            self.assertNotEqual(decision["action"], "arreter")

    def test_the_outdoor_probe_alone_is_not_a_switch_off(self):
        # 1.0.0b7, 25 November at 13 h 28: the outdoor station still for an hour, Versatile Thermostat in safety switches
        # itself off. The room is still watched: not a stop, the flame at its lowest until it comes back.
        s, boost = stove("chauffe", 5), thermostat("boost", demand=100, target=21.5)
        decision, mem, _ = decide(s, safe(NOW), seen(s, boost))
        decision, mem, _ = decide(s, safe(NOW + timedelta(minutes=5)), mem, NOW + timedelta(minutes=5))
        self.assertEqual((decision["action"], decision["flamme"], decision["securite"]), ("flamme", 1, "dehors"))
        self.assertIn("la sonde dehors ne donne plus de nouvelles. La pièce reste surveillée", decision["texte"])
        self.assertIn("le poêle s’arrête si ça dure 2 h", decision["texte"])
        # The station speaks a moment before the thermostat comes back: still the outdoor probe's safety.
        back = safe(NOW + timedelta(minutes=6), dehors=NOW + timedelta(minutes=6))
        decision, mem, _ = decide(stove("chauffe", 1), back, mem, NOW + timedelta(minutes=6))
        self.assertEqual((decision["action"], decision["securite"]), ("garder", "dehors"))
        # Its way back, on in boost: not a step up, the flame goes on as usual.
        decision, mem, _ = decide(stove("chauffe", 1), boost, mem, NOW + timedelta(minutes=7))
        self.assertIn(decision["action"], ("flamme", "garder"))
        self.assertIsNone(decision["securite"])
        # A real switch-off still counts after 30 seconds.
        off = thermostat("boost", mode="off", demand=0, target=21.5)
        decision, mem, _ = decide(stove("chauffe", 3), off, mem, NOW + timedelta(minutes=10))
        decision, mem, _ = decide(stove("chauffe", 3), off, mem, NOW + timedelta(minutes=10, seconds=40))
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Le thermostat est éteint.", decision["texte"])

    def test_the_rooms_probe_stops_the_stove(self):
        # Frank, 25 November: « si la température intérieure est figée, il vaut mieux mettre en sécurité ».
        s, boost = stove("chauffe", 3), thermostat("boost", demand=60)
        room = safe(NOW, piece=NOW - timedelta(minutes=61), dehors=NOW - timedelta(minutes=2))
        decision, mem, _ = decide(s, room, seen(s, boost))
        self.assertEqual((decision["action"], decision["flamme"], decision["securite"]), ("flamme", 1, "piece"))
        decision, mem, _ = decide(s, room, mem, NOW + timedelta(seconds=40))
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Le thermostat est en sécurité : la sonde de la pièce ne donne plus de nouvelles.",
                      decision["texte"])
        # Both still: the room's probe first.
        both = safe(NOW, piece=NOW - timedelta(minutes=70), dehors=NOW - timedelta(minutes=70))
        _, mem, _ = decide(s, both, seen(s, boost))
        self.assertEqual(mem["securite_sonde"], "piece")

    def test_a_safety_that_does_not_say_which_probe_stops_the_stove(self):
        s, boost = stove("chauffe", 3), thermostat("boost", demand=60)
        blind = thermostat("boost", mode="off", demand=0, securite=True)      # no dates: another thermostat
        decision, mem, _ = decide(s, blind, seen(s, boost))
        decision, mem, _ = decide(s, blind, mem, NOW + timedelta(seconds=40))
        self.assertEqual((decision["action"], decision["securite"]), ("arreter", "inconnue"))
        self.assertIn("sans dire quelle sonde ne donne plus de nouvelles : Hestia l’arrête par prudence",
                      decision["texte"])

    def test_an_outdoor_safety_that_lasts_stops_the_stove(self):
        s, boost = stove("chauffe", 2), thermostat("boost", demand=60, target=21.5)
        _, mem, _ = decide(s, safe(NOW, preset="safety"), seen(s, boost))
        later = NOW + timedelta(minutes=119)
        decision, mem, _ = decide(stove("chauffe", 1), safe(later, preset="safety"), mem, later)
        self.assertEqual(decision["action"], "garder")
        later = NOW + timedelta(minutes=120)
        decision, mem, _ = decide(stove("chauffe", 1), safe(later, preset="safety"), mem, later)
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Le thermostat est en sécurité depuis 2 h : la sonde dehors ne donne plus de nouvelles.",
                      decision["texte"])
        # Stopped, then the thermostat back in boost: no step up, the stove never relights on its own.
        for minutes, state in ((125, "extinction"), (150, "eteint")):
            later = NOW + timedelta(minutes=minutes)
            _, mem, _ = decide(stove(state, 1), safe(later, preset="safety"), mem, later)
        decision, mem, _ = decide(stove("eteint", 1), boost, mem, NOW + timedelta(minutes=151))
        self.assertNotIn(decision["action"], ("demarrer", "demander", "refuser"))
        # The next real step to boost starts it again.
        _, mem, _ = decide(stove("eteint", 1), thermostat("frost"), mem, NOW + timedelta(hours=4))
        decision, mem, _ = decide(stove("eteint", 1), boost, mem, NOW + timedelta(hours=5))
        self.assertEqual(decision["action"], "demarrer")

    def test_the_safety_limit_may_only_be_shortened(self):
        from engine import tuning
        self.assertEqual(tuning.SPEC["securite_max_min"], (120, 15, 120))
        with self.assertRaises(ValueError):
            tuning.clean({"securite_max_min": 180})
        tuning.set_values({"securite_max_min": 30})
        try:
            s, boost = stove("chauffe", 2), thermostat("boost", demand=60)
            _, mem, _ = decide(s, safe(NOW), seen(s, boost))
            later = NOW + timedelta(minutes=30)
            decision, _, _ = decide(s, safe(later), mem, later)
            self.assertEqual(decision["action"], "arreter")
            self.assertIn("depuis 30 min", decision["texte"])
        finally:
            tuning.set_values({})

    def test_a_warm_house_stops_it_after_two_minutes(self):
        s, t = stove("chauffe", 2), thermostat("comfort", demand=20, target=20.0)
        decision, mem, _ = decide(s, t, seen(s, t), house_c=19.5)
        self.assertEqual(decision["action"], "garder")
        decision, _, _ = decide(s, t, mem, NOW + timedelta(minutes=2), house_c=19.5)
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Assez chaud : la maison est à 19,5 °C pour 20 °C visés", decision["texte"])
        # 1 °C under the set point, it keeps heating.
        decision, _, _ = decide(s, t, mem, NOW + timedelta(minutes=2), house_c=18.9)
        self.assertEqual(decision["action"], "garder")

    def test_a_stove_lit_by_hand_in_hors_gel_is_not_stopped(self):
        # 1.0.0b5: the thermostat left in hors gel since the afternoon (the stove off), the stove lit by hand: hors gel
        # stops only the burn it finds, on its step, as the house's own « Arrêt » does; Hestia puts the thermostat in
        # boost (driver.drive). Nor the warm-enough rule: hors gel's 14 °C ask for no heat.
        t = thermostat("frost", demand=0, target=14.0)
        off = stove("eteint", 3)
        _, mem, _ = decide(off, thermostat("boost", target=21.0), seen(off, thermostat("boost", target=21.0)),
                           house_c=20.2)
        _, mem, _ = decide(off, t, mem, NOW + timedelta(minutes=1), house_c=20.2)
        self.assertIsNone(mem.get("gel_vrai"))
        lit = stove("allumage", 3)
        decision, mem, events = decide(lit, t, mem, NOW + timedelta(hours=3), house_c=20.2)
        self.assertNotEqual(decision["action"], "arreter")
        self.assertEqual([e["texte"] for e in events if e["qui"] == "maison"], ["La maison a démarré le poêle."])
        decision, mem, _ = decide(stove("chauffe", 3), t, mem, NOW + timedelta(hours=3, minutes=5), house_c=20.2)
        self.assertNotEqual(decision["action"], "arreter")
        # Then in boost (put there by Hestia): the warm-enough count starts again, from the boost's set point.
        b = thermostat("boost", demand=40, target=21.0)
        decision, mem, _ = decide(stove("chauffe", 3), b, mem, NOW + timedelta(hours=3, minutes=6), house_c=20.2)
        self.assertNotEqual(decision["action"], "arreter")
        # A step back to hors gel while it burns: that one stops it.
        decision, mem, _ = decide(stove("chauffe", 3), t, mem, NOW + timedelta(hours=3, minutes=7), house_c=20.2)
        self.assertEqual(decision["action"], "arreter")
        self.assertIn("Le thermostat est passé hors gel.", decision["texte"])

    def test_the_stop_of_hors_gel_holds_until_the_stove_is_off(self):
        s, t = stove("chauffe", 3), thermostat("frost")
        _, mem, _ = decide(s, t, seen(s, thermostat("boost")))
        # A restart in the middle (the coordinator drops the mode and the preset), the thermostat unavailable a moment:
        # the stop is still wanted.
        mem = {k: v for k, v in mem.items() if k not in ("mode", "preset")}
        _, mem, _ = decide(s, thermostat(None, mode="unavailable"), mem, NOW + timedelta(minutes=1))
        decision, mem, _ = decide(s, t, mem, NOW + timedelta(minutes=2))
        self.assertEqual(decision["action"], "arreter")
        decision, mem, _ = decide(stove("extinction", 3), t, mem, NOW + timedelta(minutes=3))
        decision, mem, _ = decide(stove("eteint", 3), t, mem, NOW + timedelta(minutes=30))
        self.assertIsNone(mem.get("gel_vrai"))


class Safety(unittest.TestCase):
    def test_an_alarm_that_lasts_two_minutes_is_cut(self):
        t = thermostat("boost", demand=50)
        s = stove("chauffe", 3, alarme=True, alarme_texte="Pellet", alarme_depuis=(NOW - timedelta(seconds=30)).isoformat())
        decision, _, _ = decide(s, t, seen(stove("chauffe", 3), t))
        self.assertEqual(decision["action"], "garder")
        self.assertIn("coupe si elle dure 2 minutes", decision["texte"])
        s["alarme_depuis"] = (NOW - timedelta(minutes=2)).isoformat()
        decision, _, events = decide(s, t, seen(stove("chauffe", 3), t))
        self.assertEqual((decision["action"], decision["ton"]), ("couper", "alert"))
        self.assertIn("en alarme (Pellet) depuis 2 minutes", events[0]["texte"])

    def test_a_silent_stove_is_only_said(self):
        t = thermostat("boost", demand=50)
        quiet = stove("inconnu", None, prise_w=180.0)
        decision, mem, _ = decide(quiet, t, seen(stove("chauffe", 3), t))
        self.assertEqual(decision["action"], "attendre")
        decision, _, events = decide(quiet, t, mem, NOW + timedelta(minutes=16))
        self.assertEqual((decision["action"], decision["ton"]), ("alerter", "alert"))
        self.assertIn("Sa prise tire 180 W : il chauffe encore.", decision["texte"])
        self.assertEqual(events[0]["texte"], "Hestia vous préviendrait : le poêle ne répond plus depuis 15 minutes.")

    def test_a_room_over_28_degrees(self):
        s, t = stove("chauffe", 2), thermostat("boost", demand=0, room=28.2)
        decision, _, _ = decide(s, t, seen(s, t))
        self.assertEqual(decision["action"], "couper")
        self.assertIn("La pièce du poêle est à 28,2 °C, au-dessus de 28 °C.", decision["texte"])


class LowFlameSwitch(unittest.TestCase):
    def test_the_switch_asks_for_the_lowest_flame(self):
        s, t = stove("chauffe", 3), thermostat("boost", demand=70)
        decision, _, _ = pilot.decide(s, t, seen(s, t), NOW, HOUSE_C, "Flamme au plus bas")
        self.assertEqual((decision["action"], decision["flamme"]), ("flamme", 1))
        self.assertIn("« Flamme au plus bas » demande la flamme au plus bas.", decision["texte"])


FLAME = "number.poele_power"


def burning(flamme, **more):
    return stove("chauffe", flamme, entites={"flamme": FLAME}, **more)


def steer(s, t, mem, now=NOW, copy=False):
    decision, mem, events = decide(s, t, mem, now)
    order, status = pilot.steer(decision, s, mem, events, now, copy)
    return order, status, mem, events, decision


class FlameMode(unittest.TestCase):
    """« Flamme » (0.5): Hestia sets the flame itself, one order at a time, and lets go when someone else sets it."""

    def test_it_sends_the_flame_once_then_checks_it(self):
        s, t = burning(4), thermostat("boost", demand=50)
        order, status, mem, events, _ = steer(s, t, seen(s, t))
        self.assertEqual(order, {"entity_id": FLAME, "valeur": 3})
        self.assertEqual((status["envois"], status["attente"]), (1, 3))
        self.assertEqual([e["texte"] for e in events], ["Hestia met la flamme à 3."])
        # A minute later the stove has not answered yet: nothing is sent again.
        order, status, mem, events, _ = steer(s, t, mem, NOW + timedelta(minutes=1))
        self.assertIsNone(order)
        self.assertEqual(status["attente"], 3)
        # Two minutes later the flame followed: Hestia's own change is not the house's.
        s = burning(3)
        order, status, mem, events, _ = steer(s, t, mem, NOW + timedelta(minutes=2))
        self.assertIsNone(order)
        self.assertEqual([(e["qui"], e["texte"]) for e in events],
                         [("hestia", "La flamme est passée à 3, comme Hestia l’a demandé.")])
        self.assertIsNone(status["attente"])
        self.assertIsNone(mem["lache"])

    def test_an_order_not_followed_is_sent_again_after_ten_minutes(self):
        s, t = burning(4), thermostat("boost", demand=50)
        _, _, mem, _, _ = steer(s, t, seen(s, t))
        order, _, mem, events, _ = steer(s, t, mem, NOW + timedelta(minutes=5))
        self.assertIsNone(order)
        self.assertEqual(events[-1]["texte"], "Le poêle n’a pas suivi : sa flamme est à 4, pas à 3.")
        self.assertEqual(mem["echecs"], 1)
        self.assertIsNone(steer(s, t, mem, NOW + timedelta(minutes=9))[0])
        order, status, mem, _, _ = steer(s, t, mem, NOW + timedelta(minutes=10))
        self.assertEqual(order["valeur"], 3)
        self.assertEqual(status["envois"], 2)

    def test_three_orders_not_followed_and_it_lets_go_for_the_day(self):
        s, t = burning(4), thermostat("boost", demand=50)
        mem = seen(s, t)
        for minutes in (0, 10, 20):
            order, _, mem, _, _ = steer(s, t, mem, NOW + timedelta(minutes=minutes))
            self.assertIsNotNone(order)
            _, _, mem, _, _ = steer(s, t, mem, NOW + timedelta(minutes=minutes + 5))
        self.assertIn("n’a pas suivi 3 ordres", mem["lache"])
        self.assertIsNone(steer(s, t, mem, NOW + timedelta(minutes=40))[0])
        # The next day, it starts again.
        order, status, mem, _, _ = steer(s, t, mem, NOW + timedelta(hours=3))
        self.assertEqual(order["valeur"], 3)
        self.assertIsNone(status["lache"])

    def test_a_flame_changed_without_hestia_and_it_lets_go(self):
        s, t = burning(3), thermostat("boost", demand=50)
        mem = seen(s, t)
        s = burning(4)                                  # another automation still sets the flame
        order, status, mem, events, _ = steer(s, t, mem)
        self.assertIsNone(order, "the demand asks for 3, but Hestia lets go")
        self.assertIn("sans Hestia : une autre automatisation la règle encore", status["lache"])
        self.assertEqual([(e["qui"], e["accord"]) for e in events], [("maison", False)])
        self.assertIsNone(steer(s, t, mem, NOW + timedelta(minutes=15))[0])

    def test_never_a_copied_stove_nor_more_than_twelve_orders(self):
        s, t = burning(4), thermostat("boost", demand=50)
        order, status, _, _, _ = steer(s, t, seen(s, t), copy=True)
        self.assertIsNone(order)
        self.assertTrue(status["copie"])
        mem = seen(s, t, envois_jour=NOW.date().isoformat(), envois=12, echecs=0)
        order, status, _, _, _ = steer(s, t, mem)
        self.assertIsNone(order)
        self.assertIn("12 ordres de Hestia aujourd’hui", status["texte"])

    def test_only_the_flame_never_start_nor_stop(self):
        s, t = stove("eteint", entites={"flamme": FLAME}), thermostat("eco")
        mem = seen(s, t)
        t = thermostat("boost")
        order, _, _, _, decision = steer(s, t, mem)
        self.assertEqual(decision["action"], "demarrer")
        self.assertIsNone(order, "starting stays with the house")
        s, t = burning(3), thermostat("frost")
        order, _, _, _, decision = steer(s, t, seen(s, thermostat("boost")))
        self.assertEqual(decision["action"], "arreter")
        self.assertIsNone(order, "stopping stays with the house")


class TheHouseView(unittest.TestCase):
    def test_the_stove_says_what_hestia_would_do(self):
        view = house.build(m.snapshot())
        p = view["poele"]["pilote"]
        self.assertEqual((p["mode"], p["action"], p["flamme"], p["maison"]), ("ombre", "garder", 3, "flamme 3"))
        self.assertTrue(p["accord"])
        self.assertEqual(view["_pilote"]["evenements"], [])

    def test_in_flame_mode_the_view_gives_the_order(self):
        cl = m.climates(); cl[0]["attributes"]["power_percent"] = 50
        snap = m.snapshot(climates=cl, pilote="flamme",
                          pilote_memoire={"etat": "chauffe", "reglee": 3, "preset": "boost", "mode": "heat"})
        snap["stove"]["copie"] = False
        view = house.build(snap)
        self.assertEqual(view["poele"]["pilote"]["mode"], "flamme")
        self.assertEqual(view["poele"]["pilote"]["commande"]["envois"], 0)
        self.assertIn("ordre", view["_pilote"])

    def test_in_whole_mode_the_view_gives_the_gestures_once_home_assistant_runs(self):
        cl = m.climates()
        cl[0]["attributes"]["preset_mode"] = "frost"
        snap = m.snapshot(climates=cl, pilote="entier",
                          pilote_memoire={"etat": "chauffe", "reglee": 3, "preset": "boost", "mode": "heat"})
        snap["stove"]["roles"]["thermostat"] = {"entity_id": "climate.poele", "state": "heat",
                                                "attributes": {"temperature": 25}}
        view = house.build(snap)
        p = view["poele"]["pilote"]
        self.assertEqual((p["mode"], p["action"]), ("entier", "arreter"))
        self.assertTrue(view["poele"]["pilotable"])
        self.assertEqual([o["geste"] for o in view["_pilote"]["ordres"]], ["eteindre"])
        self.assertEqual(view["_pilote"]["reveil"], 15.0)
        said = [e["texte"] for e in view["_pilote"]["evenements"]]
        self.assertIn("Hestia éteint le poêle.", said)
        self.assertNotIn("Hestia arrêterait le poêle.", said, "in whole mode the journal says what Hestia does")
        self.assertEqual(p["conduite"]["sequence"], "arret")
        # While Home Assistant starts: nothing yet.
        view = house.build({**snap, "pret": False})
        self.assertEqual(view["_pilote"]["ordres"], [])
        self.assertIn("ait fini de démarrer", view["poele"]["pilote"]["conduite"]["texte"])
        # A stove's thermostat copied from another house: nothing either.
        view = house.build({**snap, "copies": ["climate.vt_poele"]})
        self.assertEqual(view["_pilote"]["ordres"], [])
        self.assertTrue(view["poele"]["pilote"]["conduite"]["copie"])
        # In the shade and in flame mode, never a gesture of the whole pilot.
        for mode in ("ombre", "flamme"):
            view = house.build({**snap, "pilote": mode})
            self.assertEqual(view["_pilote"]["ordres"], [])
            self.assertNotIn("conduite", view["poele"]["pilote"])

    def test_the_simulator_rehearses_the_whole_pilot_in_conseil_and_flamme(self):
        """1.0: « Entier » à blanc, nothing sent, its journal in the conditional in place of the pilot's own."""
        cl = m.climates()
        cl[0]["attributes"]["preset_mode"] = "frost"
        snap = m.snapshot(climates=cl, pilote="ombre", simulateur=True,
                          pilote_memoire={"etat": "chauffe", "reglee": 3, "preset": "boost", "mode": "heat"})
        snap["stove"]["roles"]["thermostat"] = {"entity_id": "climate.poele", "state": "heat",
                                                "attributes": {"temperature": 25}}
        for mode in ("ombre", "flamme", "ombre"):
            view = house.build({**snap, "pilote": mode, "copies": ["climate.vt_poele"] if mode == "ombre" else []})
            p = view["poele"]["pilote"]
            self.assertEqual(view["_pilote"]["ordres"], [])
            self.assertNotIn("conduite", p)
            self.assertEqual((p["simulation"]["blanc"], p["simulation"]["sequence"]), (True, "arret"))
            said = [e["texte"] for e in view["_pilote"]["evenements"]]
            self.assertIn("Hestia éteindrait le poêle.", said)
            self.assertNotIn("Hestia arrêterait le poêle.", said)
            self.assertEqual(view["_pilote"]["reveil"], 300.0)        # the house's own stop, 5 minutes at most
            self.assertIn("conduite_blanc", view["_pilote"]["memoire"])
        # Switched off: the pilot's own lines again, and its memory let go.
        view = house.build(snap | {"simulateur": False})
        self.assertNotIn("simulation", view["poele"]["pilote"])
        self.assertIn("Hestia arrêterait le poêle.", [e["texte"] for e in view["_pilote"]["evenements"]])
        self.assertNotIn("conduite_blanc", view["_pilote"]["memoire"])

    def test_switched_off_it_says_nothing(self):
        view = house.build(m.snapshot(pilote="eteint"))
        self.assertEqual(view["poele"]["pilote"], {"mode": "eteint"})
        self.assertIsNone(view["_pilote"])


if __name__ == "__main__":
    unittest.main()
