"""The cards' « Argent » at Hestia Énergie's prices (1.0.0b8): each day's euros, split by the period of its hours.

Pure Python: the coordinator reads the counter's hourly statistics and Hestia Énergie's price of each hour, this module
adds them up. A room's euros are its kWh at each hour's price; the stove's are what the same heat would have cost as
electricity (its kilos × the useful kWh of a kilo), to set against the pellets.

Tempo: Hestia Énergie's interface (v1) gives only today's colour. An hour of another Tempo day has no known price: its
day is left without euros rather than counted at the wrong colour.
"""
from __future__ import annotations

from datetime import datetime, timedelta

# The words of the periods, in the order the cards stack them (the cheapest at the bottom).
PERIODS = ("hc", "hp", "base")
TEMPO_DAY_STARTS = 6


def tempo_day(at: datetime) -> str:
    """The Tempo day an instant belongs to: a Tempo day runs from 6 h to 6 h."""
    return (at - timedelta(hours=TEMPO_DAY_STARTS)).date().isoformat()


def days(rows: list[tuple[datetime, float]], prices: list[dict | None], now: datetime,
         per_unit: float = 1.0) -> dict:
    """{« 2026-11-24 »: {hc, hp, base, total} or None} for the days these hours fall in, and the prices seen.

    `rows`: [(local start of the hour, what the counter moved)]; `prices`: Hestia Énergie's price at each of them
    (`reader.energy_prices`), in the same order; `per_unit`: the kWh of one unit of the counter (1 for kWh, a kilo's
    useful kWh for the stove). A day with an hour that used energy at an unknown price has no euros."""
    out: dict[str, dict | None] = {}
    today_tempo = tempo_day(now)
    for (at, used), price in zip(rows, prices):
        day = at.date().isoformat()
        if day in out and out[day] is None:
            continue
        row = out.setdefault(day, {"hc": 0.0, "hp": 0.0, "base": 0.0, "total": 0.0})
        if not used:
            continue
        known = price is not None and price.get("price") is not None and \
            (price.get("color") is None or tempo_day(at) == today_tempo)
        if not known:
            out[day] = None
            continue
        period = price.get("period") if price.get("period") in PERIODS else "base"
        euros = used * per_unit * price["price"]
        row[period] += euros
        row["total"] += euros
    for day, row in out.items():
        if row is not None:
            out[day] = {k: round(v, 4) for k, v in row.items()}
    return out


def seen(prices: list[dict | None]) -> dict | None:
    """The last price of each period among these hours, and today's Tempo colour: what the card writes under its bars
    (« heures creuses 0,2068 €, heures pleines 0,2700 € »)."""
    known = [p for p in prices if p and p.get("price") is not None]
    if not known:
        return None
    by: dict[str, float] = {}
    for p in known:
        by[p.get("period") if p.get("period") in PERIODS else "base"] = p["price"]
    return {"prix": {k: by[k] for k in PERIODS if k in by}, "couleur": known[-1].get("color")}


def heating_day(hours: list[datetime], kwh: list[float], kg: list[float], prices: list[dict | None] | None,
                now: datetime, kwh_price: float | None, kg_price: float | None, kwh_per_kg: float) -> dict:
    """What a day of heating cost (1.1.0b1, the house card and Hestia Énergie's « un seul coût »): its electricity at
    each hour's price, its pellets at their price, and what the pellets saved against the same heat bought as
    electricity. `prices`: Hestia Énergie's (reader.energy_prices), None without it: then the price of Réglages.
    A part with an hour that used energy at an unknown price is None; with Hestia Énergie, the kWh of each period."""
    today_tempo = tempo_day(now)
    elec = pellets_as_elec = 0.0
    elec_known = saved_known = True
    hc = with_period = 0.0
    for i, at in enumerate(hours):
        used, burnt = kwh[i] if i < len(kwh) else 0.0, kg[i] if i < len(kg) else 0.0
        if prices is None:
            price = kwh_price
        else:
            p = prices[i] if i < len(prices) else None
            ok = p is not None and p.get("price") is not None and (p.get("color") is None or tempo_day(at) == today_tempo)
            price = p["price"] if ok else None
            if p is not None and p.get("period") in ("hc", "hp") and used:
                with_period += used
                hc += used if p["period"] == "hc" else 0.0
        if used:
            if price is None:
                elec_known = False
            else:
                elec += used * price
        if burnt:
            if price is None:
                saved_known = False
            else:
                pellets_as_elec += burnt * kwh_per_kg * price
    total_kg = sum(kg)
    pellets = None if kg_price is None and total_kg else round(total_kg * (kg_price or 0.0), 2)
    out = {"electrique": round(elec, 2) if elec_known else None, "granules": pellets,
           "gagne": round(pellets_as_elec - pellets, 2) if saved_known and pellets is not None and total_kg else None,
           "prix": "energie" if prices is not None else "reglages" if kwh_price is not None else None}
    if with_period:
        out.update(kwh_hc=round(hc, 2), kwh_periode=round(with_period, 2))
    return out
