"""The mild season, judged on the need (1.1.0b8; Frank, 27 November: « se baser uniquement sur la température au
moment de la bascule c'est un peu léger », « il faut également penser à la température en fin de planning boost »).
Plain Python.

On 27 November at 17 h the planning put the stove's thermostat in boost (21.5 °C until the evening), the house at
19.5 °C: over the mild season's 18 °C, Hestia asked, nobody saw the question, and the thermostat went back to hors gel.
The stove's room was already at 21.4 °C: there was nothing to heat. So, in the mild season, Hestia now carries the
stove's room to the end of the boost, without the stove, and decides:

- the room would still be near the set point at the end of the boost (« sans_besoin_c » under it, or less): no start,
  said on the card and the phone; Hestia keeps the boost and watches (« veille »): it lights the stove if, later in
  the boost, the room is carried under the set point by « besoin_c » (the evening colder than forecast);
- the room would be « besoin_c » or more under it: the stove is lit, without asking;
- in between: Hestia asks. Without an answer, it watches as above (no longer back to hors gel at once).

The room is carried hour by hour as a house cools: towards the outdoor temperature of each hour (Hestia Weather's
forecast), at the pace the room itself cooled over the last hours while the stove was off (Newton's law: the
room loses each hour a share `k` of its gap with outside). Without enough readings, a share of 4 % an hour (a house
that loses 1 °C in 2 hours with 12 °C outside, 20 °C inside); without the forecast, the outdoor temperature of the
last reading kept, else 8 °C under the room.
"""
from __future__ import annotations

from datetime import datetime, timedelta

K_DEFAULT = 0.04            # the share of its gap with outside a room loses in an hour, without readings
K_LIMITS = (0.01, 0.2)
SAMPLE_EVERY = timedelta(minutes=10)
KEEP = timedelta(hours=3)
LEARN_FROM = timedelta(minutes=90)   # readings over at least this long to read the room's own pace
GAP_MIN_C = 2.0             # the room must be this much over outside to read its pace
NO_FORECAST_GAP_C = 8.0
LAST_START = timedelta(minutes=45)   # in « veille », no start this close to the end of the boost
DEFAULT_SPAN = timedelta(hours=3)    # a boost with no end known (no planning): carried this far


def remember(samples: list | None, now: datetime, room_c: float | None, outdoor_c: float | None,
             burning: bool) -> list:
    """The room's readings while the stove is off, one every 10 minutes over the last 3 hours: [[iso, room, outdoor]].
    A stove that burns empties them: its heat is not the house's pace."""
    if burning or room_c is None:
        return [] if burning else list(samples or [])
    kept = []
    for row in samples or ():
        try:
            at = datetime.fromisoformat(row[0])
        except (TypeError, ValueError, IndexError):
            continue
        if (at.tzinfo is None) == (now.tzinfo is None) and now - at <= KEEP:
            kept.append(row)
    if not kept or now - datetime.fromisoformat(kept[-1][0]) >= SAMPLE_EVERY:
        kept.append([now.isoformat(), round(float(room_c), 2), None if outdoor_c is None else round(float(outdoor_c), 1)])
    return kept


def pace(samples: list | None, fallback_out: float | None) -> float | None:
    """The share `k` the room lost each hour of its gap with outside, read on its readings; None when they do not
    say (too short, too close to outside, or the room warming: the sun, other heating)."""
    rows = [r for r in samples or () if r and len(r) >= 2 and r[1] is not None]
    if len(rows) < 2:
        return None
    first, last = rows[0], rows[-1]
    hours = (datetime.fromisoformat(last[0]) - datetime.fromisoformat(first[0])).total_seconds() / 3600
    if hours < LEARN_FROM.total_seconds() / 3600:
        return None
    outs = [r[2] for r in rows if len(r) > 2 and r[2] is not None]
    out = sum(outs) / len(outs) if outs else fallback_out
    if out is None:
        return None
    room = (first[1] + last[1]) / 2
    if room - out < GAP_MIN_C or last[1] >= first[1]:
        return None
    k = (first[1] - last[1]) / hours / (room - out)
    return max(K_LIMITS[0], min(K_LIMITS[1], k))


def outdoor_now(hourly: list[dict] | None, now: datetime) -> float | None:
    best = None
    for at, t in _hours(hourly, now):
        if at <= now + timedelta(minutes=30):
            best = t
    return best


def _hours(hourly: list[dict] | None, now: datetime) -> list[tuple[datetime, float]]:
    out = []
    for h in hourly or ():
        try:
            at = datetime.fromisoformat(h["time"])
            at = at.astimezone(now.tzinfo) if at.tzinfo and now.tzinfo else at
            out.append((at, float(h["temperature"])))
        except (KeyError, TypeError, ValueError):
            continue
    out.sort(key=lambda x: x[0])
    return out


def carry(room_c: float, now: datetime, end: datetime, hourly: list[dict] | None, k: float | None,
          last_out: float | None = None) -> float:
    """The room at `end` without the stove: hour by hour towards each hour's outdoor temperature."""
    hours = _hours(hourly, now)
    k = K_DEFAULT if k is None else k
    t, at = float(room_c), now
    while at < end:
        step = min(timedelta(hours=1), end - at)
        out = next((c for h, c in reversed(hours) if h <= at + step / 2), None)
        if out is None:
            out = hours[0][1] if hours else last_out if last_out is not None else t - NO_FORECAST_GAP_C
        t -= k * (t - out) * step.total_seconds() / 3600
        at += step
    return round(t, 2)


def judge(target_c: float | None, room_c: float | None, end_c: float | None, need_c: float, fine_c: float) -> str:
    """« allumer » (clearly needed), « sans_besoin » (clearly not), « demander » (in between). The lower of now and
    the end counts: a room already cold needs the stove now. An unknown room: ask, as before."""
    if target_c is None or room_c is None or end_c is None:
        return "demander"
    short = target_c - min(room_c, end_c)
    if short >= need_c:
        return "allumer"
    if short <= fine_c:
        return "sans_besoin"
    return "demander"


def boost_end(line: list | None, naive_now: datetime, tz, boost: str) -> datetime | None:
    """When the planning takes the stove's thermostat out of boost, if it is in boost on the planning now."""
    if not line:
        return None
    current = None
    for at, tone, *_ in line:
        if at <= naive_now:
            current = tone
        elif current == boost and tone != boost:
            return at.replace(tzinfo=tz)
    return None
