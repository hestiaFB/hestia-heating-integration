"""The stove's sentence (1.0): what it does now, in one line, as the house's own stove card said it (« Consigne
atteinte, le poêle entretient »). Plain Python, the first true of a list, from the most urgent (docs/CAHIER-DES-CHARGES.md,
« Ce que montre la page Poêle », « La phrase »). The card and the Poêle page only show it.

Its tone gives the colour: « alert » (red) for an alarm, an overheat, a silent stove whose plug still draws, a stove
burning with a window open in its room; « act » (orange) for a fire pot to clean, a silent stove, an order that did not
go through, a start refused or waiting for an answer, the stove's thermostat in its own safety, a stove holding back by
itself (its own probe at the temperature set in it); « stove » while it
burns; « off » otherwise.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from . import tuning
from .phrases import degrees, hour, number

PLUG_HOT_W = 60            # a silent stove whose plug draws more burns without orders
SLOW_C_PER_H = 0.4         # under this, the room « monte lentement »
FAR_H = 5                  # beyond this, the set point is « à plus de 5 h »
BRIDLE_C = 0.5             # its own probe this close to its own set point: the stove holds back by itself
LOCKS = {"brasier": "brasier à nettoyer, « J’ai nettoyé » rallumera son thermostat",
         "surchauffe": "Hestia a éteint son thermostat, la pièce était trop chaude",
         "alarme": "Hestia a éteint son thermostat, le poêle était en alarme",
         "muet": "Hestia a éteint son thermostat, le poêle ne répondait pas"}


def _say(text: str, tone: str) -> dict:
    return {"texte": text, "ton": tone}


def _arrival(t: float | None, target: float | None, slope: float | None, now: datetime) -> str:
    """While it burns: when the stove's room reaches its set point (the gap ÷ the slope)."""
    if t is None or target is None:
        return "En chauffe"
    gap = target - t
    if gap <= 0:
        return "Consigne atteinte, le poêle entretient"
    if slope is None or slope < SLOW_C_PER_H:
        return f"Monte lentement vers {degrees(target)}"
    hours = gap / slope
    if hours > FAR_H:
        return f"Consigne à plus de {FAR_H} h"
    at = now + timedelta(hours=hours)
    at = (at + timedelta(minutes=2, seconds=30)).replace(second=0, microsecond=0)
    at = at.replace(minute=at.minute - at.minute % 5)
    return f"{degrees(target)} vers {hour(at)}"


def bridled(stove: dict) -> bool:
    """The stove holding back by itself (1.0.0b9): it burns lower than the flame it was given because its own probe
    has reached the temperature set in the stove (it then burns at its lowest whatever it is asked, and its ÉCO Stop
    may stop it). Not while its flame is still climbing: its probe is then well under that temperature."""
    real, given = stove.get("flamme"), stove.get("flamme_reglee")
    air, own = stove.get("air"), stove.get("consigne_poele")
    return (stove.get("etat") == "chauffe" and None not in (real, given, air, own) and real < given
            and air >= own - BRIDLE_C)


def sentence(stove: dict, thermostat: dict | None, room: dict | None, now: datetime) -> dict:
    """{texte, ton}. `stove`: the stove's view, with its pilot when there is one (its decision, and « conduite » in the
    whole pilot's mode); `thermostat`: the stove's thermostat (a source); `room`: the stove's room."""
    state = stove.get("etat")
    pilot = stove.get("pilote") or {}
    drive = pilot.get("conduite") or {}
    t = (thermostat or {}).get("temperature")
    target = (thermostat or {}).get("consigne")
    burning = state in ("allumage", "chauffe", "nettoyage")
    if stove.get("alarme") or state == "alarme":
        text = stove.get("alarme_texte")
        return _say(f"En alarme : {text}" if text else "En alarme", "alert")
    if burning and t is not None and t > tuning.get("surchauffe_c"):
        return _say(f"Surchauffe : la pièce est à {degrees(t)}", "alert")
    if state == "inconnu":
        if stove.get("a_traduire"):
            return _say(f"Le poêle dit « {stove.get('texte')} » : un mot à traduire dans son profil", "off")
        plug = stove.get("prise_w")
        if plug is not None and plug > tuning.get("prise_brule_w"):
            return _say(f"Ne répond plus, mais sa prise tire {number(plug, 0)} W : il brûle sans commande", "alert")
        return _say("Ne répond plus", "act")
    if drive.get("injoignable"):
        return _say("L’ordre d’allumage n’est pas passé", "act")
    fire_pot = (stove.get("conso") or {}).get("brasier") or {}
    if fire_pot.get("a_nettoyer"):
        return _say(f"Brasier à nettoyer : {number(fire_pot.get('kg') or 0, 1)} kg brûlés", "act")
    safety = bool((thermostat or {}).get("securite"))
    if burning and safety:
        # The thermostat in its own safety (1.0.0b7): the outdoor probe alone, the flame at its lowest until it is
        # back; the room's probe (or unknown), Hestia stops the stove.
        if pilot.get("securite") == "dehors":
            return _say("Thermostat en sécurité, la sonde dehors ne répond plus : flamme au plus bas", "act")
        if pilot.get("securite") == "piece":
            return _say("Thermostat en sécurité, la sonde de la pièce ne répond plus : arrêt du poêle", "alert")
        return _say("Thermostat en sécurité : une sonde ne répond plus", "act")
    if state == "allumage":
        return _say("Allumage en cours", "stove")
    if state == "extinction":
        return _say("Extinction en cours, comptez vingt minutes", "off")
    if state == "nettoyage":
        return _say("Nettoyage automatique du brasier", "stove")
    if state == "chauffe":
        if (room or {}).get("fenetre"):
            return _say("En chauffe, fenêtre ouverte", "alert")
        if bridled(stove):
            return _say(f"Se bride lui-même en flamme {stove['flamme']} : sa sonde lit {degrees(stove['air'])} pour "
                        f"{degrees(stove['consigne_poele'])} réglés dans le poêle", "act")
        return _say(_arrival(t, target, (thermostat or {}).get("pente"), now), "stove")
    # Off.
    if stove.get("veille"):
        return _say("En veille, il repartira seul", "off")
    if not thermostat:
        return _say("Éteint", "off")
    preset, mode = thermostat.get("preset"), thermostat.get("mode")
    if drive.get("verrou") in LOCKS:
        return _say(f"Éteint : {LOCKS[drive['verrou']]}", "act")
    if mode == "off" and safety:
        return _say("Thermostat en sécurité, une sonde ne répond plus : le poêle ne démarrera pas", "act")
    if mode == "off":
        return _say("Thermostat éteint : le poêle ne démarrera pas", "off")
    if drive.get("question"):
        return _say("Éteint : saison douce, Hestia attend votre accord", "act")
    if preset == "frost":
        return _say("Éteint, en hors gel jusqu’au prochain boost du planning", "off")
    if pilot.get("action") == "refuser":
        reason = (pilot.get("texte") or "").split(", mais ", 1)[-1].rstrip(".")
        return _say(f"Éteint : {reason.replace(' : il éteindrait son thermostat', '')}", "act")
    if preset in (None, "none"):
        return _say("Éteint : consigne réglée à la main, le démarrage n’écoute que le boost", "off")
    if preset == "boost":
        house_c = pilot.get("maison_c")
        if house_c is not None and target is not None and house_c >= target:
            return _say(f"Éteint : la maison est déjà à {degrees(house_c)} pour {degrees(target)}", "off")
        return _say("Éteint : le thermostat est déjà en boost, démarrage au prochain passage en boost", "off")
    if pilot.get("mode") == "entier" and pilot.get("maison_c") is not None and pilot["maison_c"] >= tuning.get("saison_douce_c"):
        return _say("Éteint : saison douce, le prochain démarrage demandera votre accord", "off")
    return _say("Éteint, démarrage au prochain passage en boost", "off")
