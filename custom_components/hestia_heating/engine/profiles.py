"""Stove profiles: one data file per stove integration (profiles/*.json), no code.

A profile says where each role sits among the stove's entities (by domain and by the end of the entity id, or of its
unique id when the entity was renamed) and how to translate the stove's words into the brick's states. Version 0.1 reads
only; the writing roles (start, flame, quota) are described already for the pilot of 0.4.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

# The stove's states, in the brick's words (the `poele_etat` sensor's options).
STATES = ("eteint", "allumage", "chauffe", "nettoyage", "extinction", "alarme", "inconnu")
# The states in which the stove is burning, or about to: the house counts it as heating.
BURNING = ("allumage", "chauffe", "nettoyage")


@dataclass(frozen=True)
class Profile:
    id: str
    name: str
    integration: str
    roles: dict
    states: dict
    alarm_ok: tuple = ()
    limits: dict = field(default_factory=dict)
    link: str | None = None

    def translate(self, text: str | None) -> tuple[str, bool]:
        """The brick's state for the stove's text, and whether the profile knows it. An unknown text is never guessed:
        « inconnu », and the panel shows the text as it is, marked « à traduire »."""
        if text is None or text in ("unknown", "unavailable", ""):
            return "inconnu", True
        wanted = text.strip().casefold()
        for state, words in self.states.items():
            if any(wanted == w.casefold() for w in words):
                return state, True
        return "inconnu", False

    def alarm(self, text: str | None) -> bool | None:
        """True when the alarm entity says something else than « nothing to report »."""
        if text is None or text in ("unknown", "unavailable", ""):
            return None
        return text.strip().casefold() not in {w.casefold() for w in self.alarm_ok}


def parse(data: dict) -> Profile:
    return Profile(id=data["profil"], name=data.get("nom") or data["profil"], integration=data["integration"],
                   roles=dict(data.get("roles") or {}), states={k: list(v) for k, v in (data.get("etats") or {}).items()},
                   alarm_ok=tuple(data.get("alarme_ok") or ()), limits=dict(data.get("limites") or {}),
                   link=data.get("lien"))


def load_all(folder: Path) -> list[Profile]:
    """Every profile of the folder (blocking: called in the executor at start)."""
    out = []
    for path in sorted(folder.glob("*.json")):
        out.append(parse(json.loads(path.read_text(encoding="utf-8"))))
    return out


def match(profile: Profile, entities: list[dict]) -> dict[str, str]:
    """{role: entity_id} for one stove device's entities ({entity_id, unique_id}).

    A role names a domain and the end of the id (`fin`); without `fin`, the device's main entity of that domain, the one
    with the shortest id (« climate.poele » before « climate.poele_vent_front »)."""
    found: dict[str, str] = {}
    for role, spec in profile.roles.items():
        domain, end = spec.get("domaine"), spec.get("fin")
        same = [e for e in entities if e["entity_id"].split(".", 1)[0] == domain]
        if end:
            hits = [e for e in same if e["entity_id"].endswith(end) or str(e.get("unique_id") or "").endswith(end)]
            # « _power » must not take « _real_power » nor « _eco_stop_power »: the shortest id wins.
            hits.sort(key=lambda e: len(e["entity_id"]))
        else:
            hits = sorted(same, key=lambda e: len(e["entity_id"]))
        if hits:
            found[role] = hits[0]["entity_id"]
    return found
