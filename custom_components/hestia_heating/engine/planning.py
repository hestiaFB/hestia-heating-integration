"""The existing planning, read from Scheduler (one `switch.schedule_*` per schedule): in version 0.1 the brick only
reads it, to say what comes next in each room and to draw the day.

A schedule has days (`weekdays`: daily, workday, weekend, mon…sun), time slots (« 06:00:00 - 07:30:00 »), the
thermostats it aims at (`entities`) and one action per slot (« climate.set_preset_mode » with « boost »…). A slot that
starts at sunrise or sunset is left out: the brick says it cannot read it rather than guess.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta

DAY_NAMES = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
# The tone of a slot, for each room: what the panel and the card colour.
CONFORT, ECO, HORS_GEL, ARRET, POELE = "confort", "eco", "hors_gel", "arret", "poele"
LABELS = {CONFORT: "confort", ECO: "éco", HORS_GEL: "hors gel", ARRET: "arrêt", POELE: "poêle en chauffe"}


@dataclass(frozen=True)
class Slot:
    start: time
    end: time | None
    action: dict


@dataclass(frozen=True)
class Schedule:
    id: str
    name: str
    on: bool
    days: tuple[str, ...]
    slots: tuple[Slot, ...]
    targets: tuple[str, ...]
    partial: bool          # a slot could not be read (sunrise, sunset…)


def _clock(text: str) -> time | None:
    text = text.strip()
    parts = text.split(":")
    if len(parts) < 2 or not all(p.isdigit() for p in parts):
        return None
    h, m = int(parts[0]), int(parts[1])
    s = int(parts[2]) if len(parts) > 2 else 0
    if h == 24 and m == 0:
        return time(0, 0)
    return time(h, m, s) if 0 <= h < 24 and 0 <= m < 60 and 0 <= s < 60 else None


def parse(entity_id: str, name: str, state: str, attrs: dict) -> Schedule | None:
    """One Scheduler switch; None when it aims at no thermostat."""
    targets = tuple(str(e) for e in attrs.get("entities") or [] if str(e).startswith("climate."))
    if not targets:
        return None
    actions = list(attrs.get("actions") or [])
    slots, partial = [], False
    for i, text in enumerate(attrs.get("timeslots") or []):
        start_text, _, end_text = str(text).partition(" - ")
        start, end = _clock(start_text), _clock(end_text) if end_text else None
        if start is None or (end_text and end is None):
            partial = True
            continue
        action = actions[i] if i < len(actions) else (actions[-1] if len(actions) == 1 else None)
        if isinstance(action, dict):
            slots.append(Slot(start, end, action))
    days = tuple(str(d) for d in attrs.get("weekdays") or ["daily"])
    return Schedule(entity_id, name, state == "on", days, tuple(slots), targets, partial)


def applies(schedule: Schedule, day: date, workday: bool | None = None) -> bool:
    """Whether the schedule runs that day. « workday » follows the Workday sensor for today when there is one, else
    Monday to Friday."""
    weekday = day.weekday()
    is_workday = workday if workday is not None else weekday < 5
    for d in schedule.days:
        if d == "daily" or DAY_NAMES[weekday] == d:
            return True
        if d == "workday" and is_workday or d == "weekend" and not is_workday:
            return True
    return False


def tone(action: dict, presets: dict | None = None) -> str | None:
    """What a slot's action does to a room, in the brick's words; None when it is not about heat."""
    service = str(action.get("service") or action.get("action") or "")
    data = action.get("data") or action.get("service_data") or {}
    if service.endswith("set_preset_mode"):
        preset = str(data.get("preset_mode") or "")
        if preset in ("comfort", "boost", "activity", "home"):
            return CONFORT
        if preset in ("eco", "sleep"):
            return ECO
        if preset in ("frost", "away"):
            return HORS_GEL
        return None
    if service.endswith("set_hvac_mode"):
        mode = str(data.get("hvac_mode") or "")
        return ARRET if mode == "off" else CONFORT if mode else None
    if service.endswith("turn_off"):
        return ARRET
    if service.endswith("turn_on"):
        return CONFORT
    if service.endswith("set_temperature"):
        try:
            wanted = float(data.get("temperature"))
        except (TypeError, ValueError):
            return None
        presets = presets or {}
        comfort, eco = presets.get("comfort", 19.0), presets.get("eco", 17.0)
        return CONFORT if wanted >= comfort - 0.25 else ECO if wanted >= eco - 0.25 else HORS_GEL
    return None


def timeline(schedules: list[Schedule], target: str, start_day: date, days: int, workday_today: bool | None,
             presets: dict | None = None) -> list[tuple[datetime, str, str]]:
    """[(start, tone, schedule id)] for one thermostat, from midnight of `start_day` for `days` days (naive local
    times), in order. The first schedule switched on that runs a day and aims at the thermostat gives that day."""
    out: list[tuple[datetime, str, str]] = []
    for n in range(days):
        day = start_day + timedelta(days=n)
        workday = workday_today if n == 0 else None
        for s in schedules:
            if not s.on or target not in s.targets or not applies(s, day, workday):
                continue
            for slot in s.slots:
                t = tone(slot.action, presets)
                if t is not None:
                    out.append((datetime.combine(day, slot.start), t, s.id))
            break
    out.sort(key=lambda x: x[0])
    # Two slots in a row with the same tone are one.
    merged: list[tuple[datetime, str, str]] = []
    for item in out:
        if merged and merged[-1][1] == item[1]:
            continue
        merged.append(item)
    return merged


def now_and_next(line: list[tuple[datetime, str, str]], now: datetime) -> tuple[str | None, tuple[datetime, str] | None]:
    """The tone in force at `now` and the next change (its time and tone)."""
    current, following = None, None
    for at, t, _ in line:
        if at <= now:
            current = t
        elif following is None and t != current:
            following = (at, t)
    return current, following


def segments(line: list[tuple[datetime, str, str]], day: date) -> list[dict]:
    """The day as segments for a lane: [{"de": minute, "a": minute, "ton": …}] from 0 to 1440."""
    begin = datetime.combine(day, time(0, 0))
    before = [x for x in line if x[0] <= begin]
    inside = [x for x in line if begin < x[0] < begin + timedelta(days=1)]
    current = before[-1][1] if before else None
    if current is None and inside and not before:
        # The first slot of the day starts later: the night before keeps the day's last tone (a schedule loops).
        current = [x for x in line if x[0].date() == day][-1][1]
    out, cursor = [], 0
    for at, t, _ in inside:
        minute = int((at - begin).total_seconds() // 60)
        if minute > cursor and current is not None:
            out.append({"de": cursor, "a": minute, "ton": current})
        cursor, current = minute, t
    if current is not None and cursor < 1440:
        out.append({"de": cursor, "a": 1440, "ton": current})
    return out
