"""The heating's share of the gas and of the electricity, read from Hestia Énergie and Hestia Weather (1.1.0b7).

Hestia Énergie gives each whole day's gas and electricity (interface v1, `days`), Hestia Weather each day's cold
(`degree_days`); engine/energy_share.py tells the heating in them. Only their interfaces are read, never their
settings (rule 5 of CLAUDE.md). Cheap (rule 7): read once an hour; the past days' cold is kept on disk and asked of
Hestia Weather once, a few days at a time, the loop breathing between them. Nothing is ever sent.
"""
from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime, timedelta

from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import reader
from .const import DOMAIN
from .engine import energy_share

_LOGGER = logging.getLogger(__name__)

COLD_KEY = f"{DOMAIN}.froid"
REFRESH = timedelta(hours=1)
FIRST_S = 240           # after Home Assistant started: the other bricks have read their own data by then
SPAN_DAYS = 400         # Hestia Énergie gives at most 400 days


class EnergyShare:
    def __init__(self, coordinator) -> None:
        self.c = coordinator
        self.hass = coordinator.hass
        self.store = Store(self.hass, 1, COLD_KEY)
        self.cold: dict[date, float] = {}
        self._place: str | None = None
        self._asked: dict[date, date] = {}
        self.share: dict = {"etat": "attend"}
        self._unsubs: list = []
        self._busy = False

    async def async_load(self) -> None:
        stored = await self.store.async_load() or {}
        self._place = stored.get("lieu")
        for key, value in (stored.get("jours") or {}).items():
            try:
                self.cold[date.fromisoformat(key)] = float(value)
            except (TypeError, ValueError):
                continue

    def start(self) -> None:
        self._unsubs.append(async_track_time_interval(self.hass, self._refresh, REFRESH))
        self._unsubs.append(async_call_later(self.hass, FIRST_S, self._refresh))

    async def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()

    async def _refresh(self, _now=None) -> None:
        if self._busy:
            return
        self._busy = True
        try:
            await self.async_update(dt_util.now())
        except Exception:  # noqa: BLE001 - another brick's trouble never stops this one
            _LOGGER.exception("Hestia Chauffage n'a pas pu lire le gaz et l'électricité de Hestia Énergie")
        finally:
            self._busy = False

    async def async_update(self, now: datetime) -> None:
        api = self.hass.data.get(reader.ENERGY_API)
        if api is None or getattr(api, "version", None) != reader.ENERGY_API_VERSION or not hasattr(api, "days"):
            self.share = {"etat": "sans_energie"}
            return
        today = now.date()
        rows = api.days(today - timedelta(days=SPAN_DAYS), today - timedelta(days=1)) or []
        if not rows:
            self.share = {"etat": "sans_donnees"}
            return
        weather = self.c.weather or {}
        if weather.get("etat") != "oui":
            self.share = {"etat": "sans_meteo"}
            return
        await self._read_cold(weather.get("lieu"), [d for r in rows if (d := energy_share._day(r.get("day")))], today)
        measured = any(c.get("energie") for c in self.c.found.climates
                       if c["entity_id"] != (self.c.data.get("poele") or {}).get("thermostat"))
        self.share = {"etat": "pret", **energy_share.split(rows, self.cold, today, measured),
                      "prix_gaz": _gas_price(api), "lu": now.isoformat()}

    async def _read_cold(self, place: str | None, days: list[date], today: date) -> None:
        """The cold of each day Hestia Énergie counted, kept on disk; a day Hestia Weather could not give is asked
        again the next day, not every hour."""
        api = reader.weather_api(self.hass)
        if api is None or not place or not hasattr(api, "degree_days"):
            return
        if place != self._place:
            self.cold.clear()
            self._asked.clear()
            self._place = place
        missing = [d for d in days if d not in self.cold and self._asked.get(d) != today]
        found = False
        for n, day in enumerate(missing):
            if n % 10 == 9:
                await asyncio.sleep(0)
            try:
                got = await api.degree_days(day, place)
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("Degree-days of %s unavailable: %s", day, err)
                got = None
            if got and got.get("heating") is not None:
                self.cold[day] = float(got["heating"])
                found = True
            else:
                self._asked[day] = today
        if found:
            keep = today - timedelta(days=SPAN_DAYS + 7)
            self.store.async_delay_save(lambda: {"lieu": self._place, "jours": {
                d.isoformat(): v for d, v in self.cold.items() if d >= keep}}, 10)

    # --- what the others read -------------------------------------------------------------------------------------

    def day(self, day: str) -> dict:
        """One day's heating from the gas and the electricity (kWh, and euros when a price is known)."""
        heat = energy_share.heat_of(self.share, day)
        out = {"gaz_kwh": heat["gaz_kwh"], "gaz_eur": None,
               "electrique_estime_kwh": heat["electrique_estime_kwh"], "electrique_estime_eur": None}
        price = self.share.get("prix_gaz")
        if heat["gaz_kwh"] is not None and price is not None:
            out["gaz_eur"] = round(heat["gaz_kwh"] * price, 2)
        if heat["electrique_estime_kwh"] is not None:
            out["electrique_estime_eur"] = self._electricity_eur(heat["electrique_estime_kwh"], day)
        return out

    def _electricity_eur(self, kwh: float, day: str) -> float | None:
        api = self.hass.data.get(reader.ENERGY_API)
        try:
            at = datetime.combine(date.fromisoformat(day), datetime.min.time(), dt_util.get_default_time_zone()) \
                + timedelta(hours=12)
            if api is not None and hasattr(api, "cost"):
                eur = api.cost(kwh, at)
                if eur is not None:
                    return round(eur, 2)
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Hestia Énergie's cost unavailable: %s", err)
        price = self.c.settings.get("prix_kwh")
        return None if price is None else round(kwh * price, 2)

    def summary(self, today: date, season_start: date) -> dict | None:
        """The house card's lines: each energy's state, its heating over the last 7 days and since the season's
        start."""
        if self.share.get("etat") != "pret":
            return None
        yesterday = today - timedelta(days=1)
        week = energy_share.over(self.share, today - timedelta(days=7), yesterday)
        season = energy_share.over(self.share, season_start, yesterday)
        out = {}
        for key in ("gaz", "electricite"):
            part = self.share.get(key) or {}
            out[key] = {"etat": part.get("etat"), "semaine": week[key], "saison": season[key],
                        "explique_pct": None if part.get("explique") is None else round(part["explique"] * 100)}
        return out


def _gas_price(api) -> float | None:
    """The price of a kWh of gas, when Hestia Énergie gives one (a later addition to its interface); else None: the gas
    is then said in kWh only, never as free."""
    reader_ = getattr(api, "gas_price", None)
    if reader_ is None:
        return None
    try:
        value = reader_()
        return float(value) if value is not None else None
    except Exception:  # noqa: BLE001
        return None
