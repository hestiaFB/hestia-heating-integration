"""The house's journal (1.1.0b1): today filled minute by minute as the house is looked at, the thirty days before read
once each from the recorder and the long-term statistics, and the house card's figures made from them.

Cheap by design (rule 7 of CLAUDE.md): a look adds a few numbers (engine/journal.py); today's kWh, kilos and euros
are read from the hourly statistics every 10 minutes; a past day is read in the recorder's executor, one at a time,
one a minute and a half at most while the journal fills (after a first install), then once a night for yesterday.
Nothing is ever sent: it only reads.
"""
from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta

from homeassistant.core import CoreState, callback
from homeassistant.helpers.event import async_call_later, async_track_time_change, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import reader
from .const import DOMAIN
from .engine import granules, house_stats, journal, money, profiles, tuning

_LOGGER = logging.getLogger(__name__)

JOURNAL_KEY = f"{DOMAIN}.journal"
# Today's open day is written at most this often (a stop of Home Assistant loses at most that), at once at midnight.
SAVE_S = 600
REFRESH = timedelta(minutes=10)
# The journal fills a missing past day this long after Home Assistant started, then one every LEARN_STEP_S.
LEARN_FIRST_S = 180
LEARN_STEP_S = 90
# Yesterday read again from the recorder at this time each night (the statistics of its last hour are written by then).
NIGHT = (3, 10)
SEASON_CACHE_S = 3600
HOUSE_CACHE_S = 60


class HouseJournal:
    def __init__(self, coordinator) -> None:
        self.c = coordinator
        self.hass = coordinator.hass
        self.store = Store(self.hass, 1, JOURNAL_KEY)
        self.days: dict[str, dict] = {}
        self.today: dict | None = None
        self.season_kwh: dict = {}
        self._saved = 0.0
        self._unsubs: list = []
        self._learning = None
        self._busy = False
        self._cache: tuple[float, dict] | None = None

    # --- life ----------------------------------------------------------------------------------------------------

    async def async_load(self) -> None:
        stored = await self.store.async_load() or {}
        self.days = {d["jour"]: d for d in stored.get("jours") or [] if isinstance(d, dict) and d.get("jour")}
        today = stored.get("aujourdhui")
        self.today = today if isinstance(today, dict) and today.get("ouvert") else None
        # The look before the stop is not carried over it: the time Home Assistant was stopped counts nothing.
        if self.today:
            self.today.pop("etat", None)

    def start(self) -> None:
        hass = self.hass
        self._unsubs.append(async_track_time_interval(hass, self._refresh, REFRESH))
        self._unsubs.append(async_track_time_change(hass, self._night, hour=NIGHT[0], minute=NIGHT[1], second=0))
        self._schedule(LEARN_FIRST_S)
        self._unsubs.append(async_call_later(hass, 20, self._refresh))

    async def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._learning:
            self._learning()
            self._learning = None
        await self.store.async_save(self._stored())

    def _stored(self) -> dict:
        keep = sorted(self.days)[-journal.KEEP_DAYS:]
        return {"jours": [self.days[d] for d in keep], "aujourdhui": self.today}

    def _save(self, now: bool = False) -> None:
        if now or time.monotonic() - self._saved >= SAVE_S:
            self._saved = time.monotonic()
            self.store.async_delay_save(self._stored, 5)

    # --- today, look by look ---------------------------------------------------------------------------------------

    def observe(self, view: dict, now: datetime, hourly: list[dict] | None, climates: list[dict]) -> None:
        """Count the last minutes in today's day, as the house was at the last look."""
        day = now.date().isoformat()
        if self.today is None or self.today.get("jour") != day:
            if self.today is not None:
                closed = journal.close(self.today)
                if journal.known_hours(closed) and closed["jour"] not in self.days:
                    self.days[closed["jour"]] = closed
                self._cache = None
            self.today = journal.open_day(day)
            self._save(now=True)
        stove = view.get("poele") or {}
        stove_id = stove.get("thermostat")
        source_state = {s["id"]: s["etat"] for s in view.get("sources") or []}
        rooms = [{"id": r["id"], "t": r.get("temperature"),
                  "c": r.get("consigne") if r.get("etat") != "arret" else None,
                  "chauffe": any(source_state.get(i) == "chauffe" for i in r.get("sources") or [] if i != stove_id)}
                 for r in view.get("pieces") or []]
        journal.observe(self.today, now, rooms, outdoor_now(climates, hourly, now), bool(stove.get("en_feu")))
        self._save()

    # --- today's kWh, kilos and euros, from the hourly statistics -------------------------------------------------

    def _counters(self) -> list[str]:
        stove_id = (self.c.data.get("poele") or {}).get("thermostat")
        disabled = {k for k, v in (self.c.settings.get("sources") or {}).items() if v is False}
        return sorted({c["energie"] for c in self.c.found.climates
                       if c.get("energie") and c["entity_id"] != stove_id and c["entity_id"] not in disabled})

    def _prices(self) -> tuple[float | None, float | None]:
        conso = (self.c.data.get("poele") or {}).get("conso") or {}
        return self.c.settings.get("prix_kwh"), conso.get("prix_kg")

    async def _hours(self, start: datetime, end: datetime, live: bool) -> tuple[list[datetime], list[float], list[float]]:
        """The kWh of the thermostats' counters and the stove's kilos, each hour from `start` to `end`."""
        hours = []
        at = start
        while at < end and len(hours) < 25:
            hours.append(at)
            at = (at + timedelta(hours=1, minutes=5)).replace(minute=0, second=0, microsecond=0)
        index = {h.replace(minute=0, second=0, microsecond=0): i for i, h in enumerate(hours)}

        async def add(stat, unit, into):
            rows = await (reader.hourly_totals(self.hass, stat, unit, start, end) if live else
                          reader.hourly_rows(self.hass, stat, unit, start, end))
            for when, value in rows:
                i = index.get(when.replace(minute=0, second=0, microsecond=0))
                if i is not None:
                    into[i] += value
        kwh, kg = [0.0] * len(hours), [0.0] * len(hours)
        for stat in self._counters():
            await add(stat, "kWh", kwh)
        pellets = self.c._own_entity("sensor", "poele_granules_brules") if self.c.data.get("poele") else None
        if pellets:
            await add(pellets, "kg", kg)
        return hours, kwh, kg

    def _money_of(self, hours, kwh, kg, now) -> dict:
        kwh_price, kg_price = self._prices()
        prices = reader.energy_prices(self.hass, hours)
        return money.heating_day(hours, kwh, kg, prices, now, kwh_price, kg_price, tuning.kwh_per_kg())

    @callback
    def _refresh(self, _now=None) -> None:
        if self.hass.state is CoreState.running or self.c.data.get("pret"):
            self.hass.async_create_background_task(self.async_refresh(), "hestia_heating journal today")

    async def async_refresh(self) -> None:
        if self.today is None:
            return
        now = dt_util.now()
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        hours, kwh, kg = await self._hours(midnight, now, live=True)
        if self.today is None or self.today.get("jour") != now.date().isoformat():
            return
        self.today.update(kwh=round(sum(kwh), 3), kg=round(sum(kg), 3), argent=self._money_of(hours, kwh, kg, now),
                          kwh_h=[round(v, 3) for v in kwh], kg_h=[round(v, 3) for v in kg])
        await self._season(now)
        self._cache = None
        self.c._notify()

    async def _season(self, now: datetime) -> None:
        """The electricity of the heating season so far (the stove's share of it), read once an hour."""
        if self.season_kwh and time.monotonic() - self.season_kwh.get("lu", 0) < SEASON_CACHE_S:
            return
        name = granules.season_of(now.date())
        start = now.replace(year=int(name[:4]), month=9, day=1, hour=0, minute=0, second=0, microsecond=0)
        total, known = 0.0, False
        for stat in self._counters():
            days = await reader.daily_totals(self.hass, stat, "kWh", start, now)
            if days:
                known = True
                total += sum(days.values())
        self.season_kwh = {"lu": time.monotonic(), "saison": name, "kwh": round(total, 1) if known else None}

    # --- the days before, read once from the recorder -------------------------------------------------------------

    def _schedule(self, seconds: float) -> None:
        if self._learning:
            self._learning()
        self._learning = async_call_later(self.hass, seconds, self._learn)

    @callback
    def _learn(self, _now=None) -> None:
        self._learning = None
        if self.hass.state is not CoreState.running:
            self._schedule(LEARN_FIRST_S)
            return
        missing = self._missing(dt_util.now())
        if missing:
            self.hass.async_create_background_task(self._learn_day(missing), "hestia_heating journal day")

    @callback
    def _night(self, _now=None) -> None:
        # Yesterday, as the recorder kept it: the minutes Home Assistant was stopped are in it.
        yesterday = (dt_util.now() - timedelta(days=1)).date().isoformat()
        if yesterday in self.days and self.days[yesterday].get("source") != "historique":
            self.days[yesterday]["relire"] = True
        self._schedule(1)

    def _missing(self, now: datetime) -> str | None:
        """The most recent past day of the last thirty that the journal does not hold (or holds only from looks)."""
        for n in range(1, journal.KEEP_DAYS):
            day = (now - timedelta(days=n)).date().isoformat()
            held = self.days.get(day)
            if held is None or held.get("relire"):
                return day
        return None

    async def _learn_day(self, day: str) -> None:
        if self._busy:
            return
        self._busy = True
        try:
            record = await self._read_day(day)
        except Exception:  # noqa: BLE001 - a strange day never stops the brick: it is left empty
            _LOGGER.exception("Hestia Chauffage n'a pas pu relire le %s", day)
            record = {"jour": day, "vide": True}
        finally:
            self._busy = False
        held = self.days.get(day)
        if held is not None and journal.known_hours(record) < journal.known_hours(held):
            # The looks saw more of the day than the recorder kept (it keeps 10 days): the looks stay, with the money.
            held.pop("relire", None)
            held.update({k: record[k] for k in ("kwh", "kg", "argent") if k in record})
        else:
            self.days[day] = record
        self._cache = None
        self._save(now=True)
        if self._missing(dt_util.now()):
            self._schedule(LEARN_STEP_S)

    async def _read_day(self, day: str) -> dict:
        tz = dt_util.get_default_time_zone()
        start = datetime.fromisoformat(day).replace(tzinfo=tz)
        end = (start + timedelta(days=1, hours=2)).replace(hour=0)
        view = self.c.data
        stove = view.get("poele") or {}
        stove_id = stove.get("thermostat")
        rooms = {r["id"]: [i for i in r.get("sources") or []] for r in view.get("pieces") or []}
        climates = sorted({i for ids in rooms.values() for i in ids})
        state_entity = (stove.get("entites") or {}).get("etat")
        values, words = await reader.past_day(self.hass, start, end, climates, [state_entity] if state_entity else [])
        parts = {}
        for rid, ids in rooms.items():
            parts[rid] = []
            for i in ids:
                points = values.get(i) or []
                if i == stove_id:
                    # The stove's thermostat drives the stove: its « heating » is the stove's, counted from its state.
                    points = [(at, {**v, "chauffe": False}) for at, v in points]
                if points:
                    parts[rid].append(journal.hours_of(points, start, end))
        burning = None
        if state_entity and words.get(state_entity):
            profile = next((p for p in self.c.profiles if p.id == stove.get("profil")), None)
            if profile is not None:
                states = [(at, profile.translate(text)[0] in profiles.BURNING) for at, text in words[state_entity]]
                burning = journal.burning_minutes(states, start, end)
        record = journal.from_history(day, {k: v for k, v in parts.items() if v}, burning)
        hours, kwh, kg = await self._hours(start, end, live=False)
        if any(kwh) or any(kg):
            record.update(kwh=round(sum(kwh), 3), kg=round(sum(kg), 3),
                          argent=self._money_of(hours, kwh, kg, dt_util.now()))
        if not journal.known_hours(record) and not record.get("kwh") and not record.get("kg"):
            return {"jour": day, "vide": True}
        return record

    # --- the house card's figures --------------------------------------------------------------------------------

    def today_cost(self) -> dict | None:
        """Today's heating so far, as Hestia Énergie takes it (interface v1, `cout_chauffage`)."""
        t = self.today
        if not t or "argent" not in t:
            return None
        return cost_of(t)

    def day_cost(self, day: str) -> dict | None:
        if self.today and self.today.get("jour") == day:
            return self.today_cost()
        d = self.days.get(day)
        return cost_of(d) if d and not d.get("vide") and ("kwh" in d or "kg" in d) else None

    def house(self) -> dict:
        """What the house card shows beyond the view: today's money and heating, the comparisons, the house's figures
        over 14 days, the season and the thirty days. Kept a minute."""
        if self._cache and time.monotonic() - self._cache[0] < HOUSE_CACHE_S:
            return self._cache[1]
        now = dt_util.now()
        view = self.c.data
        kwh_kg = tuning.kwh_per_kg()
        today = journal.close(self.today) if self.today else journal.close(journal.open_day(now.date().isoformat()))
        for key in ("kwh", "kg", "argent"):
            if self.today and key in self.today:
                today[key] = self.today[key]
        past = [self.days[d] for d in sorted(self.days) if d < today["jour"] and not self.days[d].get("vide")]
        recent = past[-house_stats.STATS_DAYS:]
        rooms = {r["id"]: r["nom"] for r in view.get("pieces") or []}
        stove_room = next((r["id"] for r in view.get("pieces") or [] if r.get("poele")), None)
        stove = view.get("poele") or {}
        conso = stove.get("conso") or {}
        stove_kwh = None if conso.get("kg_saison") is None else conso["kg_saison"] * kwh_kg
        stove_now_kw = round((conso.get("debit_kg_h") or 0.0) * kwh_kg, 2) if stove.get("en_feu") else 0.0
        electric_kw = round((view.get("maison") or {}).get("electrique_w", 0) / 1000, 2)
        price_now = view.get("prix_energie") or ({"kwh": view.get("prix_kwh"), "periode": None, "couleur": None}
                                                 if view.get("prix_kwh") is not None else None)
        kg_price = conso.get("prix_kg")
        per_hour = None
        if price_now and price_now.get("kwh") is not None and (not stove.get("en_feu") or kg_price is not None):
            per_hour = round(electric_kw * price_now["kwh"] +
                             ((conso.get("debit_kg_h") or 0.0) * (kg_price or 0.0) if stove.get("en_feu") else 0.0), 2)
        set_points = [r["consigne"] for r in view.get("pieces") or []
                      if r.get("consigne") is not None and r.get("etat") != "arret" and r["consigne"] >= house_stats.HELD_FROM_C]
        hours_today = now.hour + (1 if now.minute >= 30 else 0)
        minutes_today = {rid: round(sum(r.get("min") or [])) for rid, r in (today.get("pieces") or {}).items()}
        if stove_room:
            minutes_today[stove_room] = max(minutes_today.get(stove_room, 0), round(sum(today.get("poele_min") or [])))
        out = {
            "maintenant": {"cout_h": per_hour, "periode": (price_now or {}).get("periode"),
                           "couleur": (price_now or {}).get("couleur"), "poele_kw": stove_now_kw,
                           "electrique_kw": electric_kw, "dehors": outdoor_now(self._climates(), None, now),
                           "consigne_moyenne": round(sum(set_points) / len(set_points), 1) if set_points else None},
            "aujourdhui": {"jusqua": now.strftime("%H:%M"), "kwh": today.get("kwh"), "kg": today.get("kg"),
                           "argent": today.get("argent"),
                           "poele_min": round(sum(today.get("poele_min") or [])),
                           "autres_min": sum(v for k, v in minutes_today.items() if k != stove_room),
                           "pieces": minutes_today},
            "froid_egal": house_stats.at_equal_cold(past, today, hours_today, kwh_kg),
            "maison": {"inertie": house_stats.inertia(recent), "besoin": house_stats.need(past, kwh_kg),
                       "montee": house_stats.warming(recent, rooms, stove_room),
                       "temps": house_stats.heating_time(recent, stove_room),
                       "tenue": house_stats.held(recent, stove_room),
                       "creuses": house_stats.off_peak(past),
                       "saison": house_stats.season(stove_kwh, self.season_kwh.get("kwh"), self.season_kwh.get("saison")
                                                    or conso.get("saison")),
                       "jours": len(recent)},
            "jours": house_stats.month(past + [today], kwh_kg),
            "apprend": self._missing(now) is not None,
        }
        self._cache = (time.monotonic(), out)
        return out

    def _climates(self) -> list[dict]:
        return [{"attributes": (s.attributes if (s := self.hass.states.get(c["entity_id"])) else {})}
                for c in self.c.found.climates]


def cost_of(day: dict) -> dict:
    money_ = day.get("argent") or {}
    total = house_stats.cost(day)
    return {"jour": day["jour"], "electrique_kwh": day.get("kwh"), "electrique_eur": money_.get("electrique"),
            "granules_kg": day.get("kg"), "granules_eur": money_.get("granules"), "chauffage_eur": total,
            "gagne_eur": money_.get("gagne"), "prix": money_.get("prix")}


def outdoor_now(climates: list[dict], hourly: list[dict] | None, now: datetime) -> float | None:
    """The cold outside now: what the thermostats know of it (Versatile Thermostat's outdoor probe), else Hestia
    Weather's hour."""
    seen = []
    for c in climates:
        attrs = c.get("attributes") or {}
        specific = attrs.get("specific_states") if isinstance(attrs.get("specific_states"), dict) else {}
        value = specific.get("ext_current_temperature", attrs.get("ext_current_temperature"))
        try:
            if value is not None:
                seen.append(float(value))
        except (TypeError, ValueError):
            pass
    if seen:
        return round(sum(seen) / len(seen), 1)
    for h in hourly or []:
        try:
            at = datetime.fromisoformat(h["time"]).astimezone(now.tzinfo)
            if at <= now < at + timedelta(hours=1):
                return round(float(h["temperature"]), 1)
        except (KeyError, TypeError, ValueError):
            continue
    return None
