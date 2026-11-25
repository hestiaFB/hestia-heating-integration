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
