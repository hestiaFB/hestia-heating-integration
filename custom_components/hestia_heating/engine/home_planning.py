"""The house's own plannings (« le planning Hestia », 0.3): simple ones, after the mock-up validated by Frank on 20 Nov.
2026. Plain Python: it says what to send and when; the coordinator sends it, or not (docs/technique.md, « Le planning
Hestia »).

A planning has a name, a week, the level « the rest of the time » and the thermostats it sets. Its week is one row of
time ranges for every day (« tous »), two rows for Monday to Friday and the week-end (« semaine »), or seven rows
(« chaque »). A range is [start, end, level], « 06:30 » to « 08:30 » or « 24:00 ». Where two ranges overlap, the one
that starts later wins. A thermostat follows one planning at most. « En essai » (actif false), the planning shows what
it would do and sends nothing; « Actif », Hestia sets its thermostats at each change.

What it never decides: to switch a thermostat on or off, to change a thermostat's own settings, to send anything to a
thermostat that a Scheduler schedule switched on still aims at. Those rules live here and in the coordinator.
"""
from __future__ import annotations

from datetime import date, datetime, time, timedelta

LEVELS = ("confort", "eco", "hors_gel", "boost")
# The level's preset on a Versatile Thermostat (and any thermostat that has presets).
PRESET = {"confort": "comfort", "eco": "eco", "hors_gel": "frost", "boost": "boost"}
WORDS = {"confort": "confort", "eco": "éco", "hors_gel": "hors gel", "boost": "boost"}
# The week of a planning: the same every day, Monday to Friday and the week-end, or day by day.
ROWS = {"tous": 1, "semaine": 2, "chaque": 7}
MAX_PLANNINGS, MAX_RANGES, MAX_NAME = 20, 12, 30
DAY = 1440
# A thermostat without presets gets a set point (a heater; an air conditioner cools).
HEAT_TEMPERATURES = {"confort": 20.0, "eco": 17.0, "hors_gel": 7.0, "boost": 21.0}
COOL_TEMPERATURES = {"confort": 25.0, "eco": 27.0, "hors_gel": 30.0, "boost": 24.0}


def default() -> dict:
    return {"plannings": {}}


def minutes(text, end: bool = False) -> int | None:
    """« 06:30 » → 390; « 24:00 » (and « 00:00 » for an end) → 1440; None when it is not a time of the day."""
    parts = str(text or "").strip().split(":")
    if len(parts) < 2 or not all(p.isdigit() for p in parts[:2]):
        return None
    h, m = int(parts[0]), int(parts[1])
    if end and (h, m) in ((24, 0), (0, 0)):
        return DAY
    return h * 60 + m if 0 <= h < 24 and 0 <= m < 60 else None


def clock(m: int) -> str:
    return "24:00" if m >= DAY else f"{m // 60:02d}:{m % 60:02d}"


def _ranges(raw) -> list[list[str]]:
    out = []
    for item in raw if isinstance(raw, list) else []:
        if not isinstance(item, (list, tuple)) or len(item) != 3:
            raise ValueError("une plage a un début, une fin et un niveau")
        start, end, level = minutes(item[0]), minutes(item[1], end=True), item[2]
        if start is None or end is None or level not in LEVELS:
            raise ValueError(f"plage illisible : {list(item)!r}")
        if end <= start:
            raise ValueError(f"une plage finit après son début : {clock(start)} à {clock(end)}")
        out.append([clock(start), clock(end), level])
    if len(out) > MAX_RANGES:
        raise ValueError(f"au plus {MAX_RANGES} plages par ligne")
    return sorted(out, key=lambda r: (minutes(r[0]), minutes(r[1], end=True)))


def _planning(key: str, raw) -> dict:
    if not isinstance(raw, dict):
        raise ValueError(f"planning illisible : {key!r}")
    name = str(raw.get("nom") or "").strip()[:MAX_NAME] or "Planning"
    week = raw.get("jours") if raw.get("jours") in ROWS else "tous"
    rows = raw.get("plages") if isinstance(raw.get("plages"), list) else []
    if len(rows) != ROWS[week]:
        raise ValueError(f"« {name} » : {ROWS[week]} ligne{'s' if ROWS[week] > 1 else ''} de plages attendue{'s' if ROWS[week] > 1 else ''}")
    rest = raw.get("reste") if raw.get("reste") in LEVELS else "eco"
    thermostats = []
    for t in raw.get("thermostats") or []:
        t = str(t)
        if not t.startswith("climate.") or t in thermostats:
            continue
        thermostats.append(t)
    return {"nom": name, "actif": bool(raw.get("actif", False)), "jours": week, "reste": rest,
            "plages": [_ranges(r) for r in rows], "thermostats": thermostats}


def clean(raw) -> dict:
    """The plannings as the tab sends them, checked: a ValueError says what is wrong (in French, shown as is)."""
    if not isinstance(raw, dict):
        raise ValueError("planning illisible")
    plannings = raw.get("plannings") if isinstance(raw.get("plannings"), dict) else {}
    if len(plannings) > MAX_PLANNINGS:
        raise ValueError(f"au plus {MAX_PLANNINGS} plannings")
    model = default()
    owner: dict[str, str] = {}
    for key, conf in plannings.items():
        key = str(key)
        if not key.replace("_", "").isalnum() or len(key) > 40:
            raise ValueError(f"planning illisible : {key!r}")
        p = _planning(key, conf)
        for t in p["thermostats"]:
            if t in owner:
                raise ValueError(f"un thermostat suit un seul planning : {t} est dans « {owner[t]} » et « {p['nom']} »")
            owner[t] = p["nom"]
        model["plannings"][key] = p
    return model


def loaded(raw) -> dict:
    """The stored plannings, as they were saved (or none): never refused. A planning of the first 0.3 beta (day
    types) is not carried over: it was never more than a test, always in the shade."""
    if not isinstance(raw, dict) or "plannings" not in raw:
        return default()
    try:
        return clean(raw)
    except ValueError:
        return default()


def of_thermostat(model: dict) -> dict[str, str]:
    """{thermostat: planning id}."""
    return {t: key for key, p in (model.get("plannings") or {}).items() for t in p.get("thermostats") or ()}


# --- The days -------------------------------------------------------------------------------------------------------

def row_of(p: dict, weekday: int) -> list[list[str]]:
    """The ranges of a day of the week (Monday 0)."""
    rows = p.get("plages") or [[]]
    week = p.get("jours")
    if week == "chaque" and len(rows) == 7:
        return rows[weekday]
    if week == "semaine" and len(rows) == 2:
        return rows[0 if weekday < 5 else 1]
    return rows[0]


def day_segments(ranges: list[list[str]], rest: str) -> list[tuple[int, int, str]]:
    """The whole day as [(from, to, level)] in minutes, 0 to 1440: each moment takes the range that started last
    among those covering it, else the level of the rest of the time. Two neighbours of one level are one."""
    spans = []
    for i, r in enumerate(ranges):
        start, end = minutes(r[0]), minutes(r[1], end=True)
        if start is not None and end is not None and end > start and r[2] in LEVELS:
            spans.append((start, end, r[2], i))
    cuts = sorted({0, DAY, *(s for s, *_ in spans), *(e for _, e, *_ in spans)})
    out: list[tuple[int, int, str]] = []
    for a, b in zip(cuts, cuts[1:]):
        covering = [s for s in spans if s[0] <= a < s[1]]
        level = max(covering, key=lambda s: (s[0], s[3]))[2] if covering else rest
        if out and out[-1][2] == level:
            out[-1] = (out[-1][0], b, level)
        else:
            out.append((a, b, level))
    return out


def timeline(p: dict, start_day: date, days: int) -> list[tuple[datetime, str, dict]]:
    """[(start, level, {})] for one planning, naive local times, from the day before `start_day` for `days` days, each
    change once (the shape of the Scheduler's timelines, engine/planning.py)."""
    out: list[tuple[datetime, str, dict]] = []
    for n in range(-1, days):
        day = start_day + timedelta(days=n)
        for a, _, level in day_segments(row_of(p, day.weekday()), p.get("reste") or "eco"):
            if out and out[-1][1] == level:
                continue
            out.append((datetime.combine(day, time(0)) + timedelta(minutes=a), level, {}))
    return out


def due(line: list[tuple[datetime, str, dict]], now: datetime, last: datetime | None) -> tuple[datetime, str] | None:
    """The change to send now: the one in force, when it started after the last one sent (or after the baseline set
    when the plannings were saved). A change missed while Home Assistant was stopped is caught up."""
    if last is None:
        return None
    current = None
    for at, level, _ in line:
        if at <= now:
            current = (at, level)
    if current and current[0] > last:
        return current
    return None


def starts_per_week(p: dict) -> int:
    """How many times a week the level steps up to boost: for the stove's thermostat, how many times it would light."""
    week = [day_segments(row_of(p, d), p.get("reste") or "eco") for d in range(7)]
    levels = [s[2] for day in week for s in day]
    if len(set(levels)) == 1:
        return 0
    return sum(1 for i, lv in enumerate(levels) if lv == "boost" and levels[i - 1] != "boost")


def from_segments(week: list[list[tuple[int, int, str]]]) -> dict:
    """A week drawn elsewhere (a Scheduler schedule), as a planning's week: the most frequent level becomes « the rest
    of the time », the others its ranges; the same every day, week and week-end, or day by day."""
    total: dict[str, int] = {}
    for day in week:
        for a, b, level in day:
            total[level] = total.get(level, 0) + b - a
    rest = max(total, key=lambda k: (total[k], k == "eco")) if total else "eco"
    rows = [[[clock(a), clock(b), level] for a, b, level in day if level != rest] for day in week]
    if all(r == rows[0] for r in rows):
        return {"jours": "tous", "reste": rest, "plages": [rows[0]]}
    if all(r == rows[0] for r in rows[:5]) and rows[5] == rows[6]:
        return {"jours": "semaine", "reste": rest, "plages": [rows[0], rows[5]]}
    return {"jours": "chaque", "reste": rest, "plages": rows}
