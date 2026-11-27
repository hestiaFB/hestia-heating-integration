"""The heating's share of the gas and of the electricity (1.1.0b7; Frank, 27 November: « l'énergie c'est le gaz, mais
il peut servir soit à la cuisine, soit à chauffer. Si cela concerne le chauffage, cela doit aller à la brique
chauffage »). Hestia Énergie counts each day's gas and electricity, without saying what they are used for (its
interface v1, `days`); Hestia Chauffage tells the heating in them from the cold. Plain Python.

The same line for both, as Hestia Énergie drew it before (« l'électricité due au froid », its engine/heating.py) and
as Yann drew it for the gas (its PR 23): each day's energy set against the day's cold (the degree-days of Hestia
Weather, base 18 °C). What rises with the cold is the heating; what stays in summer is the rest (the cooking, the hot
water, the fridge…). No figure with fewer than 60 days, 20 of them cold, nor when the cold explains less than half
of the differences from day to day (the home then heats with something else).

- The gas is measured: the heating is what is burnt beyond the gas of a day without cold (read on two weeks of days
  without cold, a summer, else the line's own level), never more than what was burnt. It is read three days
  together: a boiler's gas is often counted the day after it was burnt.
- The electricity: what the cold of the day adds on the line, never more than the day's consumption, and only when
  Hestia does not already measure the radiators (thermostats with an energy counter): measured wins, never both.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

MIN_FIT = 0.5
MIN_DAYS = 60
MIN_COLD_DAYS = 20      # days of more than 2 degree-days
COLD_DAY = 2.0
GAS_SPAN = 3
NO_COLD = 1.0           # a day under this many degree-days needs no heating
MIN_WARM_DAYS = 14


@dataclass(frozen=True)
class Line:
    rest: float          # a day's energy without cold, in kWh
    per_degree: float    # what each degree-day adds, in kWh
    fit: float           # the share of the differences the cold explains, 0 to 1
    days: int

    @property
    def reliable(self) -> bool:
        return self.fit >= MIN_FIT and self.per_degree > 0


def learn(used: dict[date, float], cold: dict[date, float], span: int = 1) -> Line | None:
    """The line through each day's (cold, energy), `span` days in a row read together. None with too few days."""
    if span > 1:
        points, run = [], []
        for day in sorted(d for d in used if cold.get(d) is not None):
            if run and (day - run[-1]).days != 1:
                run = []
            run.append(day)
            if len(run) == span:
                points.append((sum(cold[d] for d in run) / span, sum(used[d] for d in run) / span))
                run = []
    else:
        points = [(cold[d], kwh) for d, kwh in used.items() if cold.get(d) is not None]
    if len(points) * span < MIN_DAYS or sum(1 for x, _ in points if x > COLD_DAY) * span < MIN_COLD_DAYS:
        return None
    n = len(points)
    mx = sum(x for x, _ in points) / n
    my = sum(y for _, y in points) / n
    sxx = sum((x - mx) ** 2 for x, _ in points)
    syy = sum((y - my) ** 2 for _, y in points)
    if sxx == 0 or syy == 0:
        return None
    sxy = sum((x - mx) * (y - my) for x, y in points)
    slope = sxy / sxx
    return Line(rest=my - slope * mx, per_degree=slope, fit=sxy * sxy / (sxx * syy), days=n * span)


def _state(line: Line | None) -> str:
    return "apprend" if line is None else "pret" if line.reliable else "peu_lie"


def _day(value) -> date | None:
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        return None


def split(days: list[dict], cold: dict[date, float], today: date, measured_electricity: bool) -> dict:
    """{"gaz": {...}, "electricite": {...}}, each with its `etat` (« absent », « apprend », « peu_lie », « pret », or for
    the electricity « mesure »: Hestia already counts the radiators) and, when « pret », `jours` {« AAAA-MM-JJ »: the
    heating's kWh}, `par_degre` and `reste_par_jour`. `days`: Hestia Énergie's `days()`; `cold`: each day's
    degree-days."""
    gas: dict[date, float] = {}
    elec: dict[date, float] = {}
    gas_seen = elec_seen = False
    for row in days:
        day = _day(row.get("day"))
        if day is None or day >= today:
            continue
        if row.get("gas_kwh") is not None:
            gas_seen = True
            if row.get("gas_complete"):
                gas[day] = float(row["gas_kwh"])
        if row.get("electricity_kwh") is not None:
            elec_seen = True
            if row.get("electricity_complete"):
                elec[day] = float(row["electricity_kwh"])
    return {"gaz": _gas(gas, cold) if gas_seen else {"etat": "absent"},
            "electricite": {"etat": "mesure"} if measured_electricity else
            _electricity(elec, cold) if elec_seen else {"etat": "absent"}}


def _gas(burnt: dict[date, float], cold: dict[date, float]) -> dict:
    line = learn(burnt, cold, GAS_SPAN)
    out: dict = {"etat": _state(line)}
    if line is None or not line.reliable:
        out["jours_lus"] = sum(1 for d in burnt if d in cold)
        return out
    warm = [kwh for d, kwh in burnt.items() if (c := cold.get(d)) is not None and c <= NO_COLD]
    rest = sum(warm) / len(warm) if len(warm) >= MIN_WARM_DAYS else max(0.0, line.rest)
    out.update(par_degre=round(line.per_degree, 3), reste_par_jour=round(rest, 2), explique=round(line.fit, 2),
               jours={d.isoformat(): round(min(kwh, max(0.0, kwh - rest)), 3) for d, kwh in burnt.items()})
    return out


def _electricity(used: dict[date, float], cold: dict[date, float]) -> dict:
    line = learn(used, cold)
    out: dict = {"etat": _state(line)}
    if line is None or not line.reliable:
        out["jours_lus"] = sum(1 for d in used if d in cold)
        return out
    out.update(par_degre=round(line.per_degree, 3), reste_par_jour=round(max(0.0, line.rest), 2), explique=round(line.fit, 2),
               jours={d.isoformat(): round(min(kwh, line.per_degree * max(0.0, cold[d])), 3)
                      for d, kwh in used.items() if cold.get(d) is not None})
    return out


def heat_of(share: dict, day: str) -> dict:
    """The heating of one day from the gas and from the electricity, as `split` found it: {gaz_kwh, electrique_estime_kwh},
    each None when it is not known for that day."""
    gas = (share.get("gaz") or {}).get("jours") or {}
    elec = (share.get("electricite") or {}).get("jours") or {}
    return {"gaz_kwh": gas.get(day), "electrique_estime_kwh": elec.get(day)}


def over(share: dict, first: date, last: date) -> dict:
    """The heating's kWh of each energy from `first` to `last` (included), and how many days were counted."""
    out = {}
    for key in ("gaz", "electricite"):
        found = (share.get(key) or {}).get("jours") or {}
        days = [v for d, v in found.items() if first.isoformat() <= d <= last.isoformat()]
        out[key] = {"kwh": round(sum(days), 1), "jours": len(days)} if days else None
    return out


def wanted_days(today: date, span: int = 400) -> list[date]:
    first = today - timedelta(days=span)
    return [first + timedelta(days=i) for i in range(span)]
