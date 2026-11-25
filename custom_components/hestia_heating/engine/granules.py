"""The stove's pellets, counted by Hestia (docs/CAHIER-DES-CHARGES.md, « Les granulés »). Plain Python.

- The rate (kg/h) is read on the stove's state, never on its flame alone (some stoves report flame 1 while off):
  lighting has its own rate, burning follows the real flame (the profile gives one rate per flame), a silent stove
  whose plug still draws counts the middle rate, the rest is 0. Orders of magnitude, not measures: one factor scales
  them, learnt on the bags declared in Suivi Stock Pellet (a bag declared = an empty tank, so one whole bag burnt
  since the previous one), kept between 0.7 and 1.6.
- The kilos: the rate added up over time (the rate seen at the last look, for 5 minutes at most: a stop of Home
  Assistant counts nothing rather than a guess), per day and per heating season (from 1 September, or from the month
  Suivi Stock Pellet starts its season, so that both count the same season).
- The fire pot: the kilos burnt since it was last cleaned, from the bags when Suivi Stock Pellet is there (bags
  poured since, minus what is left in the tank), else from Hestia's own count. Past the threshold (15 kg, one bag, by
  default) it must be cleaned: the burning goes on, the next start is blocked (by the full pilot, later).
- Energy: 4.8 kWh per kg × 0.87 efficiency = 4.176 useful kWh per kg. This is what Hestia Énergie must get for the
  stove, never the stove thermostat's energy counter (it counts the time of a switch that drives nothing).
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
import math

from . import tuning
from .phrases import number

# Defaults: since 1.0.0b3 the kWh, the efficiency, the rates and « soon » may be set in Réglages › Avancé.
KWH_PER_KG = round(4.8 * 0.87, 3)
STEP_MAX = timedelta(minutes=5)
HOT_PLUG_W = 60
CORRECTION_MIN, CORRECTION_MAX = 0.7, 1.6
LEARN_MIN_KG = 5.0
FIRE_POT_KG = 15.0
# A bag's weight when nothing gives it (only for the price per kilo).
BAG_KG = 15.0
FIRE_POT_SOON_KG = 4.0
# Rates of a 7 kW stove (kg/h) when its profile gives none: lighting, then flame 1 to 5.
RATES = {"allumage": 1.2, "flammes": [0.55, 0.81, 1.07, 1.34, 1.60]}


def season_of(day: date, start_month: int | None = None) -> str:
    """« 2026-2027 » from 1 September 2026 to 31 August 2027 (or from the month given): the heating season, not the
    calendar year."""
    start = start_month if isinstance(start_month, int) and 1 <= start_month <= 12 else 9
    first = day.year if day.month >= start else day.year - 1
    return f"{first}-{first + 1}"


def bags_of(pellets: dict | None, bag_kg: float | None = None) -> dict | None:
    """What the count is set on, from Suivi Stock Pellet's figures (stove.pellets): the bags declared burnt this
    season and the weight of one (the one given in Réglages first). None without them."""
    count = (pellets or {}).get("consomme_sacs")
    weight = bag_kg or (pellets or {}).get("sac_kg")
    if count is None or not weight:
        return None
    return {"sacs": count, "sac_kg": weight}


def rate(stove: dict, rates: dict | None = None) -> float:
    """kg/h now, from the stove's state: the profile's rates, each replaced by the one set in Réglages › Avancé."""
    rates = tuning.rates(rates or RATES)
    flames = rates.get("flammes") or RATES["flammes"]
    middle = flames[len(flames) // 2]
    state = stove.get("etat")
    if state == "allumage":
        return float(rates.get("allumage", RATES["allumage"]))
    if state in ("chauffe", "nettoyage"):
        flame = stove.get("flamme")
        return float(flames[flame - 1]) if isinstance(flame, int) and 1 <= flame <= len(flames) else float(middle)
    plug = stove.get("prise_w")
    if state == "inconnu" and not stove.get("a_traduire") and plug is not None and plug > tuning.get("prise_brule_w"):
        return float(middle)
    return 0.0


def _floor(value: float, digits: int = 2) -> float:
    step = 10 ** digits
    return math.floor(value * step) / step


def advance(mem: dict | None, stove: dict | None, bags: dict | None, now: datetime, rates: dict | None = None,
            start_month: int | None = None) -> dict:
    """The new memory of the pellets after a look at the stove. `bags`: bags_of(...), or None; `start_month`: the
    month the season starts (Suivi Stock Pellet's), else September."""
    mem = dict(mem or {})
    for key in ("total_kg", "total_brut", "kg_jour", "kg_saison"):
        mem.setdefault(key, 0.0)
    mem.setdefault("correction", 1.0)
    # The rate seen at the last look, for the time since (5 minutes at most), counted in the day of the last look.
    # Never rounded here: a rounding at each look would add up over a season.
    last = _iso(mem.get("a"))
    if last is not None and now > last and mem.get("debit"):
        hours = min(now - last, STEP_MAX).total_seconds() / 3600
        raw = mem["debit"] * hours
        kg = raw * mem["correction"]
        mem["total_brut"] += raw
        mem["total_kg"] += kg
        mem["kg_jour"] += kg
        mem["kg_saison"] += kg
    today, season = now.date().isoformat(), season_of(now.date(), start_month)
    if mem.get("jour") != today:
        mem.update(jour=today, kg_jour=0.0)
    if mem.get("saison") != season:
        mem.update(saison=season, kg_saison=0.0)
    mem["a"] = now.isoformat()
    mem["debit"] = rate(stove, rates) if stove else 0.0
    _learn(mem, bags)
    return mem


def _learn(mem: dict, bags: dict | None) -> None:
    """A bag declared: the tank was empty, so one whole bag burnt since the previous one. The factor between that bag
    and the raw estimate is learnt (between 0.7 and 1.6), if the estimate is worth it (over 5 kg)."""
    count, bag_kg = (bags or {}).get("sacs"), (bags or {}).get("sac_kg")
    if count is None or not bag_kg:
        return
    before = mem.get("sacs")
    if before is None:
        # The first look: the bags declared so far are the reference, the tank's content unknown (taken as full until
        # the next bag, which is not learnt from: the tank was not known empty at the start).
        mem.update(sacs=count, brut_remplissage=mem.get("brut_remplissage", mem["total_brut"]), plein_connu=False)
        return
    if count < before:
        # A new season of Suivi Stock Pellet: its count starts again, the references move with it.
        if mem.get("sacs_nettoyage") is not None:
            mem["sacs_nettoyage"] = mem["sacs_nettoyage"] - before + count
        mem["sacs"] = count
        return
    if count == before + 1:
        estimate = mem["total_brut"] - mem.get("brut_remplissage", mem["total_brut"])
        if mem.get("plein_connu") and estimate > LEARN_MIN_KG:
            mem["correction"] = round(min(CORRECTION_MAX, max(CORRECTION_MIN, bag_kg / estimate)), 3)
            mem["appris_le"] = mem.get("a")
    if count > before:
        # Several bags at once (one forgotten): nothing learnt, but the tank was empty when this one was poured.
        mem.update(brut_remplissage=mem["total_brut"], plein_connu=True)
    mem["sacs"] = count


def _left_in_tank(mem: dict, bag_kg: float) -> float:
    return max(bag_kg - mem["correction"] * (mem["total_brut"] - mem.get("brut_remplissage", mem["total_brut"])), 0.0)


def cleaned(mem: dict, bags: dict | None, now: datetime) -> dict:
    """« J'ai nettoyé » : the fire pot's count starts again from here."""
    mem = dict(mem)
    mem.update(base_nettoyage=_floor(mem.get("total_kg", 0.0)), nettoye_le=now.isoformat())
    bag_kg = (bags or {}).get("sac_kg")
    if mem.get("sacs") is not None and bag_kg:
        mem.update(sacs_nettoyage=mem["sacs"], reste_nettoyage=round(_left_in_tank(mem, bag_kg), 3))
    return mem


def since_cleaning(mem: dict, bags: dict | None) -> float | None:
    """Kilos burnt since the fire pot was last cleaned, or None if it never was (in Hestia): Hestia's own kilos since
    then, or the bags' count when it says more. The bags alone stalled (1.0.1b1): when Hestia's own count passes a
    bag since the last one declared, its guess of the tank is empty (0, never less), and with no new bag declared,
    « bags poured − tank now + tank at the cleaning » stays 0 however long the stove burns. The larger of the two
    errs on the side of cleaning early."""
    if mem.get("nettoye_le") is None:
        return None
    total, base = mem.get("total_kg", 0.0), mem.get("base_nettoyage", 0.0)
    own = total if total < base - 0.5 else max(total - base, 0.0)
    bag_kg = (bags or {}).get("sac_kg")
    if bag_kg and mem.get("sacs") is not None and mem.get("sacs_nettoyage") is not None:
        kg = (bag_kg * (mem["sacs"] - mem["sacs_nettoyage"]) - _left_in_tank(mem, bag_kg)
              + mem.get("reste_nettoyage", 0.0))
        own = max(own, kg)
    return round(max(own, 0.0), 2)


def days_left(mem: dict, burnt: float | None, threshold: float, now: datetime | None) -> float | None:
    """Days until the fire pot is due, at the pace since it was last cleaned (1.0.0b4): None before a day of count or
    a kilo burnt, 0 once it is due."""
    since = _iso(mem.get("nettoye_le"))
    if burnt is None or now is None or since is None:
        return None
    if burnt >= threshold:
        return 0.0
    if since.tzinfo is None and now.tzinfo is not None:
        since = since.replace(tzinfo=now.tzinfo)
    elapsed = (now - since).total_seconds() / 86400
    if elapsed < 1 or burnt < 1:
        return None
    return round((threshold - burnt) / (burnt / elapsed), 1)


def _in_days(days: float) -> str:
    return "moins d’un jour" if days < 1 else "environ 1 jour" if days < 1.5 else f"environ {number(days, 0)} jours"


def view(mem: dict, bags: dict | None, threshold_kg: float | None, bag_price: float | None,
         bag_kg: float | None, now: datetime | None = None) -> dict:
    """What the Poêle page, the entities and Hestia Énergie get."""
    threshold = threshold_kg or FIRE_POT_KG
    burnt = since_cleaning(mem, bags)
    price_kg = bag_price / bag_kg if bag_price and bag_kg else None
    # The rate now, scaled like the kilos it adds.
    rate_now = (mem.get("debit") or 0.0) * mem.get("correction", 1.0)
    out = {
        "debit_kg_h": round(rate_now, 2),
        "kg_jour": round(mem.get("kg_jour", 0.0), 2),
        "kg_saison": round(mem.get("kg_saison", 0.0), 1),
        "saison": mem.get("saison"),
        "total_kg": round(mem.get("total_kg", 0.0), 3),
        "energie_kwh": round(mem.get("total_kg", 0.0) * tuning.kwh_per_kg(), 2),
        "kwh_jour": round(mem.get("kg_jour", 0.0) * tuning.kwh_per_kg(), 1),
        "correction": mem.get("correction", 1.0),
        "prix_kg": None if price_kg is None else round(price_kg, 3),
        "prix_kwh": None if price_kg is None else round(price_kg / tuning.kwh_per_kg(), 3),
        "cout_jour": None if price_kg is None else round(mem.get("kg_jour", 0.0) * price_kg, 2),
        "cout_heure": None if price_kg is None or not rate_now else round(rate_now * price_kg, 2),
        "brasier": {
            "seuil_kg": threshold,
            "kg": burnt,
            "nettoye_le": mem.get("nettoye_le"),
            "a_nettoyer": burnt is not None and burnt >= threshold,
            "bientot": burnt is not None and threshold - tuning.get("brasier_bientot_kg") <= burnt < threshold,
            "par_les_sacs": bool((bags or {}).get("sac_kg") and mem.get("sacs_nettoyage") is not None),
            "jours": days_left(mem, burnt, threshold, now),
        },
    }
    b = out["brasier"]
    pace = "" if not b["jours"] else f", {_in_days(b['jours'])} au rythme depuis le dernier nettoyage"
    if burnt is None:
        b["texte"] = "Pas encore de compte : dites à Hestia quand vous nettoyez le brasier (« J’ai nettoyé »)."
    elif b["a_nettoyer"]:
        b["texte"] = (f"Brasier à nettoyer : {number(burnt, 1)} kg brûlés depuis le dernier nettoyage. La chauffe en cours "
                      "finit ; le prochain démarrage devrait attendre le nettoyage.")
    elif b["bientot"]:
        b["texte"] = f"Encore {number(threshold - burnt, 1)} kg avant le nettoyage du brasier{pace}."
    else:
        b["texte"] = f"{number(burnt, 1)} kg brûlés depuis le dernier nettoyage, sur {number(threshold, 0)}{pace}."
    return out


def _iso(value) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None
