"""The house's own planning (« le planning Hestia », 0.3): day types, a standard week, a day changed on its own, and
who sets each lane: Hestia, the extension (Scheduler) or nobody. Plain Python: it says what to send and when; the
coordinator sends it, or not (docs/technique.md, « Le planning Hestia »).

A lane is the stove (its thermostat) or a room (its thermostats, the stove's apart). A day type holds, for each lane,
its slots: [["06:30", "confort"], ...]. A level holds until the next slot; before the day's first slot, the lane keeps
the level of the evening before. A lane with no slot that day keeps its level all day.

What it never decides: to switch a thermostat on or off, to change a thermostat's own settings, to send anything to a
lane that Scheduler sets or that a Scheduler schedule still aims at. Those rules live here and in the coordinator.
"""
from __future__ import annotations

from datetime import date, datetime, time, timedelta

LEVELS = ("confort", "eco", "hors_gel", "boost")
# The level's preset on a Versatile Thermostat (and any thermostat that has presets).
PRESET = {"confort": "comfort", "eco": "eco", "hors_gel": "frost", "boost": "boost"}
WORDS = {"confort": "confort", "eco": "éco", "hors_gel": "hors gel", "boost": "boost"}
# Warmer and warmer: the morning's first step up is the one started earlier on a cold night.
RANK = {"hors_gel": 0, "eco": 1, "confort": 2, "boost": 3}
HESTIA, EXTENSION, NONE = "hestia", "extension", "aucun"
OWNERS = (HESTIA, EXTENSION, NONE)
STOVE = "poele"
WEEK = ("lun", "mar", "mer", "jeu", "ven", "sam", "dim")
MAX_TYPES, MAX_SLOTS, MAX_DAYS_AHEAD, MAX_NAME = 8, 24, 62, 30
# A thermostat without presets gets a set point: the room's, else these (a heater; an air conditioner cools).
HEAT_TEMPERATURES = {"confort": 20.0, "eco": 17.0, "hors_gel": 7.0, "boost": 21.0}
COOL_TEMPERATURES = {"confort": 25.0, "eco": 27.0, "hors_gel": 30.0, "boost": 24.0}
# Started earlier on a cold night: 5 minutes per degree under 10 °C outside, up to the setting (60 min by default),
# for the morning's first step up between 4 h and 10 h only.
ADVANCE_FROM_C, ADVANCE_PER_C, ADVANCE_WINDOW = 10.0, 5, (time(4, 0), time(10, 0))


def default() -> dict:
    return {
        "commande": False,
        "pieces": {},
        "journees": {"semaine": {"nom": "Semaine", "creneaux": {}}, "weekend": {"nom": "Week-end", "creneaux": {}},
                     "teletravail": {"nom": "Télétravail", "creneaux": {}}},
        "semaine": ["semaine"] * 5 + ["weekend"] * 2,
        "feries": "weekend",
        "jours": {},
        "anticipation": {"actif": True, "max_min": 60},
    }


def clock(text) -> time | None:
    """« 06:30 » → 6:30; None when it is not a time of the day."""
    parts = str(text or "").strip().split(":")
    if len(parts) < 2 or not all(p.isdigit() for p in parts[:2]):
        return None
    h, m = int(parts[0]), int(parts[1])
    return time(h, m) if 0 <= h < 24 and 0 <= m < 60 else None


def _slots(raw) -> list[list[str]]:
    out: dict[str, str] = {}
    for item in raw if isinstance(raw, list) else []:
        if not isinstance(item, (list, tuple)) or len(item) != 2:
            raise ValueError("un créneau est une heure et un niveau")
        at, level = clock(item[0]), item[1]
        if at is None or level not in LEVELS:
            raise ValueError(f"créneau illisible : {item!r}")
        out[f"{at.hour:02d}:{at.minute:02d}"] = level
    if len(out) > MAX_SLOTS:
        raise ValueError(f"au plus {MAX_SLOTS} créneaux par pièce et par journée")
    return [[t, out[t]] for t in sorted(out)]


def _temperatures(raw) -> dict | None:
    if raw is None:
        return None
    if not isinstance(raw, dict):
        raise ValueError("températures illisibles")
    out = {}
    for level, value in raw.items():
        if level not in LEVELS:
            continue
        try:
            t = round(float(value) * 2) / 2
        except (TypeError, ValueError):
            raise ValueError(f"température illisible : {value!r}") from None
        if not 5 <= t <= 35:
            raise ValueError("une température va de 5 à 35 °C")
        out[level] = t
    return out or None


def clean(raw, today: date | None) -> dict:
    """The planning as the tab sends it, checked: a ValueError says what is wrong (in French, shown as is). The days
    changed on their own are kept from `today` on (all of them when None)."""
    if not isinstance(raw, dict):
        raise ValueError("planning illisible")
    model = default()
    model["commande"] = bool(raw.get("commande", False))
    types = raw.get("journees") if isinstance(raw.get("journees"), dict) else model["journees"]
    if not types or len(types) > MAX_TYPES:
        raise ValueError(f"de 1 à {MAX_TYPES} journées types")
    model["journees"] = {}
    for key, day in types.items():
        key = str(key)
        if not key.replace("_", "").isalnum() or len(key) > 40 or not isinstance(day, dict):
            raise ValueError(f"journée type illisible : {key!r}")
        name = str(day.get("nom") or "").strip()[:MAX_NAME] or "Journée"
        lanes = day.get("creneaux") if isinstance(day.get("creneaux"), dict) else {}
        model["journees"][key] = {"nom": name, "creneaux": {str(lane): s for lane, raw_slots in lanes.items()
                                                             if (s := _slots(raw_slots))}}
    first = next(iter(model["journees"]))
    week = raw.get("semaine") if isinstance(raw.get("semaine"), list) else model["semaine"]
    if len(week) != 7:
        raise ValueError("la semaine type a 7 jours")
    model["semaine"] = [d if d in model["journees"] else first for d in week]
    holidays = raw.get("feries", model["feries"])
    model["feries"] = holidays if holidays in model["journees"] else None
    days = raw.get("jours") if isinstance(raw.get("jours"), dict) else {}
    model["jours"] = {}
    for text, kind in days.items():
        try:
            day = date.fromisoformat(str(text))
        except ValueError:
            raise ValueError(f"jour illisible : {text!r}") from None
        if (today is None or today <= day <= today + timedelta(days=MAX_DAYS_AHEAD)) and kind in model["journees"]:
            model["jours"][day.isoformat()] = kind
    rooms = raw.get("pieces") if isinstance(raw.get("pieces"), dict) else {}
    for lane, conf in rooms.items():
        if not isinstance(conf, dict):
            continue
        owner = conf.get("source")
        entry = {"source": owner if owner in OWNERS else None, "temperatures": _temperatures(conf.get("temperatures"))}
        model["pieces"][str(lane)] = {k: v for k, v in entry.items() if v is not None}
    advance = raw.get("anticipation") if isinstance(raw.get("anticipation"), dict) else model["anticipation"]
    try:
        minutes = int(advance.get("max_min", 60))
    except (TypeError, ValueError):
        minutes = 60
    model["anticipation"] = {"actif": bool(advance.get("actif", True)), "max_min": max(0, min(120, minutes))}
    return model


def loaded(raw, today: date | None = None) -> dict:
    """The stored planning, as it was saved (or the default): never refused; the days gone by are left out."""
    if not isinstance(raw, dict):
        return default()
    try:
        model = clean(raw, None)
    except ValueError:
        return default()
    if today is not None:
        model["jours"] = {d: k for d, k in model["jours"].items() if d >= today.isoformat()}
    return model


# --- Who sets a lane ------------------------------------------------------------------------------------------------

def owner(model: dict, lane: str, aimed_by_scheduler: bool) -> str:
    """Hestia, the extension or nobody: the choice in Réglages, else the extension when a Scheduler schedule aims at
    the lane (installing changes nothing), else Hestia."""
    chosen = (model.get("pieces") or {}).get(lane, {}).get("source")
    if chosen in OWNERS:
        return chosen
    return EXTENSION if aimed_by_scheduler else HESTIA


def temperatures(model: dict, lane: str, cools: bool) -> dict:
    base = COOL_TEMPERATURES if cools else HEAT_TEMPERATURES
    return {**base, **((model.get("pieces") or {}).get(lane, {}).get("temperatures") or {})}


# --- The days -------------------------------------------------------------------------------------------------------

def day_type(model: dict, day: date, workday: bool | None = None) -> str | None:
    """The day type of a date: the day changed on its own, else a public holiday's (the Workday sensor says « not a
    working day » on a weekday), else the standard week's."""
    types = model.get("journees") or {}
    chosen = (model.get("jours") or {}).get(day.isoformat())
    if chosen in types:
        return chosen
    if workday is False and day.weekday() < 5 and model.get("feries") in types:
        return model["feries"]
    kind = (model.get("semaine") or [None] * 7)[day.weekday()]
    return kind if kind in types else None


def advance_minutes(hourly: list[dict] | None, at: datetime, tz, most: int) -> tuple[int, float | None]:
    """How much earlier a morning step up starts: 5 minutes per degree under 10 °C outside at that hour (Hestia
    Weather's forecast), rounded to 5 minutes, up to `most`. (0, None) without a forecast for that hour."""
    if not hourly or most <= 0:
        return 0, None
    best, gap = None, None
    for h in hourly:
        try:
            when = datetime.fromisoformat(h["time"])
            when = (when.astimezone(tz) if when.tzinfo else when).replace(tzinfo=None)
            t = float(h["temperature"])
        except (KeyError, TypeError, ValueError):
            continue
        d = abs((when - at).total_seconds())
        if d <= 3600 and (gap is None or d < gap):
            best, gap = t, d
    if best is None:
        return 0, None
    minutes = int(round(max(0.0, ADVANCE_FROM_C - best) * ADVANCE_PER_C / 5) * 5)
    return min(minutes, most), best


def timeline(model: dict, lane: str, start_day: date, days: int, workday_today: bool | None = None,
             hourly: list[dict] | None = None, tz=None) -> list[tuple[datetime, str, dict]]:
    """[(start, level, {type, avance, prevu, dehors})] for one lane, naive local times, from the evening before
    `start_day` for `days` days. The morning's first step up starts earlier on a cold night (anticipation)."""
    advance = model.get("anticipation") or {}
    most = int(advance.get("max_min", 0)) if advance.get("actif") else 0
    raw: list[tuple[datetime, str, dict]] = []
    for n in range(-1, days):
        day = start_day + timedelta(days=n)
        kind = day_type(model, day, workday_today if n == 0 else None)
        slots = ((model.get("journees") or {}).get(kind) or {}).get("creneaux", {}).get(lane) if kind else None
        for text, level in slots or []:
            at = clock(text)
            if at is not None and level in LEVELS:
                raw.append((datetime.combine(day, at), level, {"type": kind}))
    raw.sort(key=lambda x: x[0])
    merged: list[tuple[datetime, str, dict]] = []
    for item in raw:
        if merged and merged[-1][1] == item[1]:
            continue
        merged.append(item)
    if most and hourly:
        moved_days: set[date] = set()
        for i, (at, level, info) in enumerate(merged):
            if i == 0 or at.date() in moved_days or not ADVANCE_WINDOW[0] <= at.time() <= ADVANCE_WINDOW[1]:
                continue
            if RANK[level] <= RANK[merged[i - 1][1]]:
                continue
            moved_days.add(at.date())
            minutes, outside = advance_minutes(hourly, at, tz, most)
            earliest = merged[i - 1][0] + timedelta(minutes=15)
            new = max(at - timedelta(minutes=minutes), earliest)
            if new < at:
                merged[i] = (new, level, {**info, "avance": int((at - new).total_seconds() // 60), "prevu": at,
                                          "dehors": outside})
    return merged


def due(line: list[tuple[datetime, str, dict]], now: datetime, last: datetime | None) -> tuple[datetime, str] | None:
    """The slot to send now: the one in force, when it started after the last one sent (or after the baseline set when
    the planning was saved or switched on). A slot missed while Home Assistant was stopped is caught up."""
    if last is None:
        return None
    current = None
    for at, level, _ in line:
        if at <= now:
            current = (at, level)
    if current and current[0] > last:
        return current
    return None


def week_ahead(model: dict, start: date, workday_today: bool | None = None, days: int = 7) -> list[dict]:
    """The coming days and their day type, for the strip of the tab."""
    types = model.get("journees") or {}
    out = []
    for n in range(days):
        day = start + timedelta(days=n)
        kind = day_type(model, day, workday_today if n == 0 else None)
        usual = (model.get("semaine") or [None] * 7)[day.weekday()]
        out.append({"date": day.isoformat(), "jour": WEEK[day.weekday()], "num": day.day, "type": kind,
                    "nom": (types.get(kind) or {}).get("nom"), "change": kind != usual})
    return out
