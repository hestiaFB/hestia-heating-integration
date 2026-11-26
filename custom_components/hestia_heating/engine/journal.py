"""The house's journal, hour by hour (1.1.0b1, the house card's figures): what each room was at, its set point, how
long it heated, the cold outside, the stove's burning minutes, the kWh and kilos used and what they cost.

Pure Python. Today's day is filled as the house is looked at (`observe`, each minute); a past day is read once from
the recorder and the long-term statistics, at night or when the journal starts (coordinator). A day open is kept as
sums and minutes; a closed day as one mean an hour (`close`), rounded, so that thirty days stay small.
"""
from __future__ import annotations

from datetime import datetime, timedelta

HOURS = 24
# A look that comes after a gap longer than this counts only this long: Home Assistant stopped in between.
STEP_MAX_MIN = 5.0
KEEP_DAYS = 31


def open_day(day: str) -> dict:
    """An empty day being filled: sums and minutes for each hour."""
    return {"jour": day, "ouvert": True, "pieces": {}, "dehors": [[0.0, 0.0] for _ in range(HOURS)],
            "poele_min": [0.0] * HOURS, "vu_min": [0.0] * HOURS, "a": None}


def _room(day: dict, room_id: str) -> dict:
    return day["pieces"].setdefault(room_id, {"t": [[0.0, 0.0] for _ in range(HOURS)],
                                              "c": [[0.0, 0.0] for _ in range(HOURS)], "min": [0.0] * HOURS})


def _add(pair: list, value: float | None, minutes: float) -> None:
    if value is not None and minutes > 0:
        pair[0] += value * minutes
        pair[1] += minutes


def observe(day: dict, now: datetime, rooms: list[dict], outdoor: float | None, burning: bool) -> dict:
    """Count the time since the last look in its hour, as the house was at that look: each room's temperature, set
    point and heating (`rooms`: [{id, t, c, chauffe}]), the cold outside, the stove burning. The day's last look is
    kept in the day (`etat`), so that the next one counts what it saw."""
    last = day.get("a")
    seen = day.get("etat")
    if last and seen:
        try:
            before = datetime.fromisoformat(last)
        except ValueError:
            before = None
        if before is not None and before.date().isoformat() == day["jour"] and now > before:
            minutes = min((now - before).total_seconds() / 60, STEP_MAX_MIN)
            hour = before.hour
            day["vu_min"][hour] += minutes
            _add(day["dehors"][hour], seen.get("dehors"), minutes)
            if seen.get("poele"):
                day["poele_min"][hour] += minutes
            for r in seen.get("pieces") or []:
                room = _room(day, r["id"])
                _add(room["t"][hour], r.get("t"), minutes)
                _add(room["c"][hour], r.get("c"), minutes)
                if r.get("chauffe"):
                    room["min"][hour] += minutes
    day["a"] = now.isoformat()
    day["etat"] = {"dehors": outdoor, "poele": bool(burning),
                   "pieces": [{"id": r["id"], "t": r.get("t"), "c": r.get("c"), "chauffe": bool(r.get("chauffe"))}
                              for r in rooms]}
    return day


def _mean(pair) -> float | None:
    return round(pair[0] / pair[1], 2) if pair and pair[1] else None


def close(day: dict) -> dict:
    """A day as it is kept: one mean an hour (None where nothing was seen), the minutes rounded."""
    if not day.get("ouvert"):
        return day
    out = {"jour": day["jour"], "dehors": [_mean(p) for p in day["dehors"]],
           "poele_min": [round(m, 1) for m in day["poele_min"]],
           "pieces": {rid: {"t": [_mean(p) for p in r["t"]], "c": [_mean(p) for p in r["c"]],
                            "min": [round(m, 1) for m in r["min"]]} for rid, r in day["pieces"].items()}}
    for key in ("kwh", "kg", "argent", "source"):
        if key in day:
            out[key] = day[key]
    return out


def hours_of(points: list[tuple[datetime, dict]], start: datetime, end: datetime) -> dict:
    """A thermostat's day from its recorded states: [(when, {t, c, chauffe, dehors})], the state before `start` first.
    Each state holds until the next one; minutes counted in the hour they fall in."""
    out = {"t": [[0.0, 0.0] for _ in range(HOURS)], "c": [[0.0, 0.0] for _ in range(HOURS)],
           "min": [0.0] * HOURS, "dehors": [[0.0, 0.0] for _ in range(HOURS)]}
    for i, (at, values) in enumerate(points):
        begin = max(at, start)
        stop = min(points[i + 1][0], end) if i + 1 < len(points) else end
        while begin < stop:
            piece = min(stop, _next_hour(begin))
            minutes = (piece - begin).total_seconds() / 60
            h = begin.hour
            _add(out["t"][h], values.get("t"), minutes)
            _add(out["c"][h], values.get("c"), minutes)
            _add(out["dehors"][h], values.get("dehors"), minutes)
            if values.get("chauffe"):
                out["min"][h] += minutes
            begin = piece
    return out


def _next_hour(at: datetime) -> datetime:
    return at.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)


def burning_minutes(points: list[tuple[datetime, bool]], start: datetime, end: datetime) -> list[float]:
    """The stove's burning minutes in each hour, from its states [(when, burning)]."""
    out = [0.0] * HOURS
    for i, (at, burning) in enumerate(points):
        if not burning:
            continue
        begin = max(at, start)
        stop = min(points[i + 1][0], end) if i + 1 < len(points) else end
        while begin < stop:
            piece = min(stop, _next_hour(begin))
            out[begin.hour] += (piece - begin).total_seconds() / 60
            begin = piece
    return out


def from_history(day: str, rooms: dict[str, list[dict]], stove: list[float] | None) -> dict:
    """A past day read from the recorder: `rooms` {room id: [hours_of() of each of its thermostats]} (the first one
    with a temperature is the room's), `stove` its burning minutes. The cold outside: the mean of the thermostats that
    know it."""
    day = open_day(day)
    for rid, parts in rooms.items():
        room = _room(day, rid)
        main = next((p for p in parts if any(w for _, w in p["t"])), parts[0] if parts else None)
        if main is None:
            continue
        room["t"], room["c"] = main["t"], main["c"]
        for h in range(HOURS):
            # A room heats while any of its thermostats does.
            room["min"][h] = round(min(60.0, max((p["min"][h] for p in parts), default=0.0)), 1)
        for p in parts:
            for h in range(HOURS):
                day["dehors"][h][0] += p["dehors"][h][0]
                day["dehors"][h][1] += p["dehors"][h][1]
    if stove:
        day["poele_min"] = [round(m, 1) for m in stove]
    day["source"] = "historique"
    return close(day)


def known_hours(day: dict) -> int:
    """How many hours of a closed day have a temperature in some room: a day nothing was seen in is worth nothing."""
    return sum(1 for h in range(HOURS) if any((r.get("t") or [None] * HOURS)[h] is not None
                                             for r in (day.get("pieces") or {}).values()))
