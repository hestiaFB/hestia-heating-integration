"""Stove profiles: one data file per stove integration (profiles/*.json), no code.

A profile says where each role sits among the stove's entities (by domain and by the end of the entity id, or of its
unique id when the entity was renamed) and how to translate the stove's words into the brick's states. Since 0.7 it
also says how the whole pilot speaks to the stove (`ordres`): the service that lights it and the one that stops it,
what says it took the order, whether its integration can be reloaded, and the settings set before each start.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field, replace
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
    # Pellets burnt per hour: {"allumage": kg/h, "flammes": [kg/h at flame 1, 2…]} (orders of magnitude, scaled by a
    # factor learnt on the bags).
    rates: dict = field(default_factory=dict)
    # How the whole pilot speaks to the stove (0.7): {"allumer": {role, service, donnees}, "eteindre": {…},
    # "allume_si": {role, etat}, "recharger": bool, "reglages": [{nom, role, attribut?, valeur, service, donnees?,
    # reserve?}]}. Empty: the stove cannot be driven whole.
    orders: dict = field(default_factory=dict)
    # The stove's words for its standby (ECO Stop: it waits, warm enough, and starts again by itself), among those of
    # « eteint » (1.0): only the stove's sentence tells them apart.
    standby: tuple = ()

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
                   link=data.get("lien"), rates=dict(data.get("debits") or {}), orders=dict(data.get("ordres") or {}),
                   standby=tuple(data.get("veille") or ()))


def load_all(folder: Path) -> list[Profile]:
    """Every profile of the folder (blocking: called in the executor at start)."""
    out = []
    for path in sorted(folder.glob("*.json")):
        out.append(parse(json.loads(path.read_text(encoding="utf-8"))))
    return out


def match(profile: Profile, entities: list[dict], alive=None) -> dict[str, str]:
    """{role: entity_id} for one stove device's entities ({entity_id, unique_id}).

    A role names a domain and the end of the id (`fin`); without `fin`, the device's main entity of that domain, the one
    with the shortest id (« climate.poele » before « climate.poele_vent_front »). `fin` may also be a list of ends, the
    preferred first (1.1.0b5): with `alive` (entity_id -> bool), the first end whose entity answers wins, so that a fan
    the stove's integration stopped giving (on 26 November `_vent_front` stayed unavailable after a restart, while
    `_vent_main` answered) does not leave the role on a dead entity."""
    found: dict[str, str] = {}
    for role, spec in profile.roles.items():
        domain, ends = spec.get("domaine"), spec.get("fin")
        same = [e for e in entities if e["entity_id"].split(".", 1)[0] == domain]
        if ends:
            choices = []
            for end in ([ends] if isinstance(ends, str) else list(ends)):
                hits = [e for e in same if e["entity_id"].endswith(end) or str(e.get("unique_id") or "").endswith(end)]
                # « _power » must not take « _real_power » nor « _eco_stop_power »: the shortest id wins.
                hits.sort(key=lambda e: len(e["entity_id"]))
                if hits:
                    choices.append(hits[0]["entity_id"])
            if choices:
                found[role] = next((c for c in choices if alive(c)), choices[0]) if alive else choices[0]
        else:
            hits = sorted(same, key=lambda e: len(e["entity_id"]))
            if hits:
                found[role] = hits[0]["entity_id"]
    return found


def spares(profile: Profile, entities: list[dict]) -> dict[str, list[str]]:
    """{role: [entity_id, …]} for the roles whose `fin` is a list and that more than one end finds, the preferred
    first (1.1.0b5): the role then goes to the first of them that answers, at each reading (`reader.pick_alive`)."""
    out: dict[str, list[str]] = {}
    for role, spec in profile.roles.items():
        ends = spec.get("fin")
        if not isinstance(ends, list) or len(ends) < 2:
            continue
        found = [match(replace(profile, roles={role: {**spec, "fin": end}}), entities).get(role) for end in ends]
        ids = [i for i in found if i]
        if len(ids) > 1:
            out[role] = list(dict.fromkeys(ids))
    return out
