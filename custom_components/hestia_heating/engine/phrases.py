"""The words of Hestia Heating, in French and in plain words: numbers with a comma, times as « 6 h 30 »."""
from __future__ import annotations

from datetime import datetime

MONTHS = ("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre",
          "décembre")
DAYS = ("lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche")
NUMBERS = {1: "Un", 2: "Deux", 3: "Trois", 4: "Quatre", 5: "Cinq", 6: "Six", 7: "Sept", 8: "Huit", 9: "Neuf", 10: "Dix"}


def number(value: float | None, digits: int = 1) -> str:
    """« 19,6 », « −2 », « 0,8 »: the French comma, a true minus sign, no useless zero."""
    if value is None:
        return "—"
    text = f"{value:.{digits}f}"
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    if text in ("-0", ""):
        text = "0"
    return text.replace("-", "−").replace(".", ",")


def degrees(value: float | None) -> str:
    return f"{number(value)} °C"


def hour(at: datetime) -> str:
    """« 6 h 30 », « 22 h » (local time: `at` is already local)."""
    return f"{at.hour} h {at.minute:02d}" if at.minute else f"{at.hour} h"


def when(at: datetime, now: datetime) -> str:
    """« 22 h 30 » today, « demain 6 h 30 », « samedi 9 h » within the week."""
    days = (at.date() - now.date()).days
    if days <= 0:
        return hour(at)
    if days == 1:
        return f"demain {hour(at)}"
    return f"{DAYS[at.weekday()]} {hour(at)}"


def plural(n: int, one: str, many: str | None = None) -> str:
    return one if n == 1 else (many or one + "s")


def count(n: int, one: str, many: str | None = None) -> str:
    """« Un radiateur », « Deux radiateurs », « 12 radiateurs »: a sentence's opening count."""
    word = NUMBERS.get(n, str(n))
    if n == 1 and one.startswith(("pièce", "clim", "pompe", "vanne")):
        word = "Une"
    return f"{word} {plural(n, one, many)}"


def power(watts: float | None) -> str:
    """« 0,8 kW » from 800 W, « 450 W » under half a kilowatt."""
    if watts is None:
        return "—"
    if watts >= 500:
        return f"{number(watts / 1000)} kW"
    return f"{number(watts, 0)} W"


def minutes_since(since: datetime | None, now: datetime) -> str | None:
    """« 12 min », « 2 h 05 », « 3 j »: how long a state has lasted."""
    if since is None:
        return None
    seconds = max(0, int((now - since).total_seconds()))
    if seconds < 3600:
        return f"{max(1, seconds // 60)} min"
    if seconds < 86400:
        return f"{seconds // 3600} h {seconds % 3600 // 60:02d}"
    return f"{seconds // 86400} j"
