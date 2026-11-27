"""The house card's figures (1.1.0b1, Frank: « l'inertie, la performance, le temps de chauffe… à froid égal »), from
the journal's days (engine/journal.py). Pure Python, quick: thirty days of hours.

Each figure is None until enough useful hours are known: never a figure from two hours.
- Inertia: the hours nothing heats (no thermostat, the stove out for 2 hours), how fast the house cools for each degree
  between inside and outside. Said at 15 °C between them, and the time to lose half of its warmth.
- Heating need: the day's heat (kWh of electricity, and the stove's kilos as heat) for each degree-day (18 °C minus
  the day's mean outside): the figure that says whether the house heats better or worse, the cold set apart.
- Warming up: the hours a room heats all along, the minutes it takes to gain 1 °C.
- Heating time: a day's minutes of the stove burning and of the thermostats heating (the rooms added up).
- Set point held: the share of the hours a room is within 0.5 °C of its set point (hors gel and off left out).
- At equal cold: what a day cost (or its heat, without prices) for each degree-day, against the days before.
"""
from __future__ import annotations

import math
from datetime import date, timedelta
from statistics import median

from . import journal

BASE_C = 18.0            # degree-days are counted below this
DJ_MIN = 2.0             # a day colder than this many degree-days only is truly a heated day (« règle du cahier »)
GAP_MIN = 4.0            # inside minus outside: below this, the house's cooling says nothing
INERTIA_HOURS = 6
WARMING_HOURS = 3
FULL_HOUR_MIN = 45.0     # an hour heated this long is a full hour of heating
HELD_WITHIN = 0.5
HELD_FROM_C = 12.0       # a set point below this is hors gel: not a set point to hold
STATS_DAYS = 14
COMPARE_MIN_DAYS = 3
TODAY_MIN_HOURS = 4


def _mean(values) -> float | None:
    known = [v for v in values if v is not None]
    return sum(known) / len(known) if known else None


def inside(day: dict) -> list[float | None]:
    """The house's temperature each hour: the mean of its rooms."""
    rooms = list((day.get("pieces") or {}).values())
    return [_mean([(r.get("t") or [None] * 24)[h] for r in rooms]) for h in range(journal.HOURS)]


def outside_mean(day: dict, hours: int = journal.HOURS) -> float | None:
    seen = [v for v in (day.get("dehors") or [])[:hours] if v is not None]
    return sum(seen) / len(seen) if len(seen) >= max(3, hours * 2 // 3) else None


def degree_days(day: dict, hours: int = journal.HOURS) -> float | None:
    """The day's degree-days (18 °C minus its mean outside), for the first `hours` of it (today: so far)."""
    out = outside_mean(day, hours)
    return None if out is None else round(max(0.0, BASE_C - out) * hours / journal.HOURS, 2)


def heat_kwh(day: dict, kwh_per_kg: float) -> float | None:
    """The day's heat: its electricity, and its pellets as the heat they give."""
    kwh, kg = day.get("kwh"), day.get("kg")
    if kwh is None and kg is None:
        return None
    return round((kwh or 0.0) + (kg or 0.0) * kwh_per_kg, 2)


def cost(day: dict) -> float | None:
    """The day's euros: electricity and pellets, None when one of them has no price."""
    money = day.get("argent") or {}
    elec, pellets = money.get("electrique"), money.get("granules")
    if (day.get("kwh") and elec is None) or (day.get("kg") and pellets is None):
        return None
    if elec is None and pellets is None:
        return None
    return round((elec or 0.0) + (pellets or 0.0), 2)


def _heating(day: dict) -> list[bool]:
    """Each hour: something heated in it (a thermostat, the stove)."""
    rooms = list((day.get("pieces") or {}).values())
    stove = day.get("poele_min") or [0.0] * 24
    return [stove[h] > 0 or any((r.get("min") or [0] * 24)[h] > 0 for r in rooms) for h in range(journal.HOURS)]


def inertia(days: list[dict]) -> dict | None:
    """How fast the house cools when nothing heats, for each degree between inside and outside."""
    rates = []
    for day in days:
        t, out, heats = inside(day), day.get("dehors") or [None] * 24, _heating(day)
        stove = day.get("poele_min") or [0.0] * 24
        for h in range(2, journal.HOURS - 1):
            if heats[h] or heats[h + 1] or stove[h - 1] > 0 or stove[h - 2] > 0:
                continue
            if t[h] is None or t[h + 1] is None or out[h] is None or t[h] - out[h] < GAP_MIN:
                continue
            rates.append((t[h] - t[h + 1]) / (t[h] - out[h]))
    if len(rates) < INERTIA_HOURS:
        return None
    k = median(rates)
    if k <= 0:
        return None
    return {"par_degre": round(k, 4), "a_15": round(k * 15, 2), "demi_vie_h": round(math.log(2) / k),
            "heures": len(rates)}


def need(days: list[dict], kwh_per_kg: float) -> dict | None:
    """kWh of heat for each degree-day, the last 14 days and the 14 before."""
    def ratio(part):
        heat = dj = 0.0
        n = 0
        for d in part:
            q, g = heat_kwh(d, kwh_per_kg), degree_days(d)
            if q is None or g is None or g < DJ_MIN or q <= 0:
                continue
            heat, dj, n = heat + q, dj + g, n + 1
        return (round(heat / dj, 2), n) if n >= COMPARE_MIN_DAYS and dj else (None, n)
    now, n = ratio(days[-STATS_DAYS:])
    if now is None:
        return None
    before, _ = ratio(days[-2 * STATS_DAYS:-STATS_DAYS])
    return {"kwh_dj": now, "avant": before, "jours": n}


def warming(days: list[dict], names: dict[str, str], stove_room: str | None) -> list[dict]:
    """Each room's minutes to gain 1 °C when it heats a whole hour, the quickest first."""
    out = []
    for rid, name in names.items():
        minutes = []
        for day in days:
            room = (day.get("pieces") or {}).get(rid)
            if not room:
                continue
            heat = day.get("poele_min") if rid == stove_room else room.get("min")
            t = room.get("t") or []
            for h in range(journal.HOURS - 1):
                if (heat or [0] * 24)[h] < FULL_HOUR_MIN or t[h] is None or t[h + 1] is None:
                    continue
                rise = t[h + 1] - t[h]
                if rise > 0.05:
                    minutes.append(60 / rise)
        if len(minutes) >= WARMING_HOURS:
            out.append({"id": rid, "nom": name, "min_par_degre": round(median(minutes)), "poele": rid == stove_room})
    return sorted(out, key=lambda r: r["min_par_degre"])


def heating_time(days: list[dict], stove_room: str | None) -> dict | None:
    """A day's minutes of heating, on average: the stove burning, and the thermostats heating (rooms added up)."""
    stove, others, n = 0.0, 0.0, 0
    for day in days:
        if journal.known_hours(day) < 18:
            continue
        n += 1
        stove += sum(day.get("poele_min") or [])
        others += sum(sum(r.get("min") or []) for rid, r in (day.get("pieces") or {}).items() if rid != stove_room)
    if n < COMPARE_MIN_DAYS:
        return None
    return {"poele_min": round(stove / n), "autres_min": round(others / n), "jours": n}


def held(days: list[dict], stove_room: str | None = None) -> dict | None:
    """The share of the hours each room is within half a degree of its set point (or above it)."""
    total = good = 0
    rooms: dict[str, list[int]] = {}
    for day in days:
        for rid, r in (day.get("pieces") or {}).items():
            for t, c in zip(r.get("t") or [], r.get("c") or []):
                if t is None or c is None or c < HELD_FROM_C:
                    continue
                ok = t >= c - HELD_WITHIN
                total, good = total + 1, good + ok
                pair = rooms.setdefault(rid, [0, 0])
                pair[0] += ok
                pair[1] += 1
    if total < 24:
        return None
    return {"pct": round(100 * good / total), "pieces": {rid: round(100 * g / n) for rid, (g, n) in rooms.items() if n >= 12}}


def at_equal_cold(days: list[dict], today: dict, hours_today: int, kwh_per_kg: float) -> dict | None:
    """Today so far, yesterday and the week before, each for one degree-day: in euros when every one of them has its
    price, else in kWh of heat. Today against yesterday and against the week; yesterday's cold against today's."""
    past = [d for d in days if d["jour"] < today["jour"]]
    use_money = all(cost(d) is not None for d in [today] + past[-8:] if d.get("kwh") or d.get("kg"))

    def value(d, hours=journal.HOURS):
        v = cost(d) if use_money else heat_kwh(d, kwh_per_kg)
        g = degree_days(d, hours)
        return None if v is None or g is None or g < DJ_MIN * hours / journal.HOURS or v <= 0 else (v, g)

    now = value(today, hours_today) if hours_today >= TODAY_MIN_HOURS else None
    yesterday = value(past[-1]) if past and past[-1]["jour"] == _day_before(today["jour"]) else None
    week = [x for x in (value(d) for d in past[-8:-1]) if x]
    week_ratio = sum(v for v, _ in week) / sum(g for _, g in week) if len(week) >= COMPARE_MIN_DAYS else None
    if now is None and yesterday is None:
        return None

    def pct(a, b):
        return None if a is None or not b else round(100 * (a / b - 1))
    today_ratio = now[0] / now[1] if now else None
    y_ratio = yesterday[0] / yesterday[1] if yesterday else None
    out_today, out_y = outside_mean(today, max(hours_today, 1)), outside_mean(past[-1]) if past else None
    return {"base": "eur" if use_money else "kwh",
            "aujourdhui": None if today_ratio is None else round(today_ratio, 3),
            "hier": None if y_ratio is None else round(y_ratio, 3),
            "semaine": None if week_ratio is None else round(week_ratio, 3),
            "vs_hier": pct(today_ratio, y_ratio), "vs_semaine": pct(today_ratio, week_ratio),
            "hier_vs_semaine": pct(y_ratio, week_ratio),
            "dehors_vs_hier": None if out_today is None or out_y is None else round(out_today - out_y, 1)}


def _day_before(day: str) -> str:
    return (date.fromisoformat(day) - timedelta(days=1)).isoformat()


def off_peak(days: list[dict]) -> dict | None:
    """The share of the electricity used in off-peak hours (with Hestia Énergie's periods), the last 14 days."""
    hc = known = 0.0
    for d in days[-STATS_DAYS:]:
        money = d.get("argent") or {}
        if money.get("kwh_periode"):
            known += money["kwh_periode"]
            hc += money.get("kwh_hc") or 0.0
    if known < 1:
        return None
    return {"pct": round(100 * hc / known), "kwh": round(known, 1)}


def season(stove_kwh: float | None, electric_kwh: float | None, name: str | None,
           gas_kwh: float | None = None) -> dict | None:
    """Each energy's share of the season's heat: the stove, the electricity, and since 1.1.0b7 the gas (the heating
    found in it against the cold)."""
    if stove_kwh is None and electric_kwh is None and gas_kwh is None:
        return None
    total = (stove_kwh or 0.0) + (electric_kwh or 0.0) + (gas_kwh or 0.0)
    if total < 1:
        return None
    return {"pct_poele": round(100 * (stove_kwh or 0.0) / total), "poele_kwh": round(stove_kwh or 0.0),
            "electrique_kwh": round(electric_kwh or 0.0), "saison": name,
            "pct_gaz": round(100 * (gas_kwh or 0.0) / total), "gaz_kwh": round(gas_kwh or 0.0)}


def month(days: list[dict], kwh_per_kg: float) -> list[dict]:
    """The last thirty days for the card's bars: electricity and pellets (euros, else kWh and kilos), the cold."""
    out = []
    for d in days[-30:]:
        money = d.get("argent") or {}
        out.append({"jour": d["jour"], "kwh": d.get("kwh"), "kg": d.get("kg"),
                    "eur_elec": money.get("electrique"), "eur_gran": money.get("granules"),
                    "chaleur_kwh": heat_kwh(d, kwh_per_kg), "dehors": None if (o := outside_mean(d)) is None else round(o, 1),
                    "dj": degree_days(d)})
    return out
