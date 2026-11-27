"""The brick's health (1.1.0b6, Frank on 27 November: « mettre en place une sécurité pour contrôler si tout va bien,
mettre des messages sur la carte et envoyer des messages si quelque chose n'est pas cohérent, indisponible »). Plain
Python. On 26 November the stove's front fan stayed unavailable after a restart, and Hestia, reading no fan, said and
did nothing for 14 hours; the day before, the recorder did not keep the pellets' sensor and the house card counted 0 kg.

Each look, five checks, each a subject:
- « indisponible »: an entity the stove is read by (its roles, their spares, its thermostat, its plug) unavailable for
  more than 10 minutes;
- « ventilation »: the fan by Hestia (flamme + 1) still not at the level Hestia asked 15 minutes after its order;
- « sonde »: the room's temperature, as the stove's thermostat reads it, unchanged for 2 hours while the stove burns;
- « enregistrement »: a sensor of Hestia's own the house card counts from, not kept by the recorder;
- « briques »: Hestia Weather or Hestia Énergie installed and in use, but not answering (for more than 10 minutes).

A subject true long enough is a « souci »: one line on the stove's card, and one notice, once (Home Assistant's
notifications, and the phones of the notifier chosen in Réglages). When it is no longer true, the notice leaves Home
Assistant's notifications and the phones get one last message, « réglé ». Nothing else: the checks never make a
gesture. Nothing is sent for a stove copied from another house (a lab): its lines only show.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from .phrases import hour as _hour, plural

DOWN = timedelta(minutes=10)        # an entity unavailable this long, another brick silent this long
FAN_LATE = timedelta(minutes=15)    # the fan not at the level asked this long after Hestia's order
FROZEN = timedelta(hours=2)         # the room's temperature unchanged this long while the stove burns
TITLE = "Hestia Chauffage"
SUBJECTS = ("indisponible", "ventilation", "sonde", "enregistrement", "briques")
RESOLVED = {"indisponible": "Les entités du poêle répondent de nouveau.",
            "ventilation": "La ventilation suit de nouveau ce que Hestia demande.",
            "sonde": "La température de la pièce du poêle bouge de nouveau.",
            "enregistrement": "Le recorder enregistre de nouveau les capteurs de Hestia.",
            "briques": "Les autres briques Hestia répondent de nouveau."}


def hour(at: datetime) -> str:
    """« 22 h 27 » that never breaks at the end of a line of the card."""
    return _hour(at).replace(" ", "\u00a0")


def _iso(value) -> datetime | None:
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None


def _names(items: list[str]) -> str:
    return items[0] if len(items) == 1 else ", ".join(items[:-1]) + " et " + items[-1]


def _down(facts: dict, now: datetime) -> tuple[datetime, str, timedelta] | None:
    rows = [r for r in facts.get("indisponibles") or () if _iso(r.get("depuis")) is not None]
    if not rows:
        return None
    since = min(_iso(r["depuis"]) for r in rows)
    parts = []
    for r in rows:
        name = r.get("nom") or r.get("entite")
        spare = r.get("remplace_par")
        parts.append(f"{name} (Hestia lit {spare} à sa place)" if spare else name)
    verb = plural(len(rows), "ne répond plus", "ne répondent plus")
    return since, f"{_names(parts)} {verb} depuis {hour(since)}.", DOWN


def _fan(facts: dict, now: datetime) -> tuple[datetime, str, timedelta] | None:
    fan = facts.get("ventilation") or {}
    asked, current, at = fan.get("voulu"), fan.get("actuel"), _iso(fan.get("a"))
    if not asked or current is None or at is None or str(current).casefold() == str(asked).casefold():
        return None
    return at, f"La ventilation reste à {current} : Hestia a demandé {asked} à {hour(at)}, le poêle n’a pas suivi.", FAN_LATE


def _probe(facts: dict, mem: dict, now: datetime) -> tuple[datetime, str, timedelta] | None:
    """The probe's last value and since when it has not moved, kept in `mem["sonde_lue"]`."""
    probe = facts.get("sonde") or {}
    value = probe.get("valeur")
    kept = mem.get("sonde_lue") or {}
    if value is None:
        mem.pop("sonde_lue", None)
        return None
    if kept.get("valeur") != value or _iso(kept.get("depuis")) is None:
        mem["sonde_lue"] = {"valeur": value, "depuis": now.isoformat()}
        return None
    if not probe.get("en_chauffe"):
        return None
    since = _iso(kept["depuis"])
    name = probe.get("nom") or "la pièce du poêle"
    return since, (f"La température de {name} n’a pas bougé depuis {hour(since)} alors que le poêle chauffe : "
                   f"sa sonde est peut-être figée."), FROZEN


def _seen(subject: str, text: str | None, mem: dict, now: datetime, delay: timedelta):
    """A trouble with no time of its own (the recorder, the other bricks): it counts from when Hestia first saw it."""
    if not text:
        mem.pop("vu_" + subject, None)
        return None
    first = _iso(mem.get("vu_" + subject)) or now
    mem["vu_" + subject] = first.isoformat()
    return first, text, delay


def _recorder(facts: dict) -> str | None:
    names = facts.get("non_enregistres") or []
    if not names:
        return None
    return (f"Le recorder de Home Assistant n’enregistre pas {_names(names)} : la carte maison les compte moins bien. "
            f"Retirez {plural(len(names), 'ce capteur', 'ces capteurs')} des exclusions du recorder.")


def check(facts: dict, mem: dict | None, now: datetime) -> tuple[list[dict], dict, list[dict]]:
    """(the « soucis » to show, the memory to keep, the notices to send). `facts` is what the coordinator read (see
    the keys above); `mem` the memory of the last look: {subject: {depuis, texte, dit}}, the probe's last value and
    when the recorder's and the bricks' troubles were first seen. Nothing while Home Assistant starts (`pret`)."""
    mem = dict(mem or {})
    if not facts.get("pret", True):
        return [], mem, []
    seen = {"indisponible": _down(facts, now), "ventilation": _fan(facts, now), "sonde": _probe(facts, mem, now),
            "enregistrement": _seen("enregistrement", _recorder(facts), mem, now, timedelta(0)),
            "briques": _seen("briques", " ".join(facts.get("briques") or ()) or None, mem, now, DOWN)}
    quiet = bool(facts.get("copie"))
    shown, orders = [], []
    for subject in SUBJECTS:
        kept = mem.get(subject) or {}
        found = seen[subject]
        if found:
            since, text, delay = found
            if now - since < delay:
                # True, but not for long enough yet: neither a souci nor « réglé » (a restart's minutes).
                continue
            entry = {"depuis": since.isoformat(), "texte": text, "dit": bool(kept.get("dit"))}
            if not entry["dit"] and not quiet:
                entry["dit"] = True
                orders.append({"geste": "notifier", "sujet": "sante_" + subject, "titre": f"{TITLE} : un souci",
                               "texte": text, "actions": [], "persistante": True})
            mem[subject] = entry
            shown.append({"sujet": subject, "texte": text, "depuis": since.isoformat()})
        elif kept:
            mem.pop(subject, None)
            if kept.get("dit") and not quiet:
                orders.append({"geste": "effacer", "sujet": "sante_" + subject})
                orders.append({"geste": "notifier", "sujet": "sante_" + subject + "_regle", "titre": f"{TITLE} : réglé",
                               "texte": RESOLVED[subject], "actions": [], "persistante": False})
    return shown, mem, orders
