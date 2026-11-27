"""The stove's figures (1.0.0b3, Réglages › Poêle à granulés › Avancé): every threshold, delay and count the pilot and
the driver use, with its default and its bounds. Plain Python. The coordinator gives the values saved in Réglages
(`set_values`); the engine reads them at the time it decides (`get`), so a change applies at the next look. A figure
never set is its default: a house that changes nothing behaves as before.

One Home Assistant has one Hestia Chauffage: one set of figures, kept here."""
from __future__ import annotations

from datetime import timedelta

# key: (default, lowest, highest). A default of None is the stove's profile's own figure (its pellets per hour).
# The limits the brick promises (CLAUDE.md, rule 3: 12 flame orders and 3 starts a day, 3 failures, one fan order every
# 10 minutes) and the safeties (the reserves of writes, the overheating, the alarm, the thermostat in its own safety)
# may only be made stricter.
SPEC: dict[str, tuple[float | None, float, float]] = {
    # The flame, automatic: the thermostat's demand (%) from which the flame is 5, 4, 3 (else 2).
    "palier_5": (85, 50, 100),
    "palier_4": (65, 30, 95),
    "palier_3": (45, 10, 90),
    "marge": (7, 0, 20),                  # points of demand around the current step
    "monter_min": (30, 5, 120),           # the flame goes up at most every this many minutes
    "avance_min": (15, 5, 60),            # the room carried this far ahead to see it pass its set point
    "ventil_fumees_c": (110, 60, 200),    # the fan by Hestia: at its lowest while the smoke is under this
    "ventil_rythme_min": (10, 10, 60),     # the fan by Hestia: one change at most every this many minutes
    # The changes written into the stove (its memory allows so many a day).
    "garde": (4, 4, 10),                  # kept to be able to stop it: the flame stops there
    "garde_ventil": (6, 6, 15),           # kept before the fan: the fan by Hestia stops there
    "flamme_max_jour": (12, 1, 12),       # flame orders from Hestia a day
    "verif_min": (5, 2, 15),              # each flame order checked after this
    "echecs": (3, 1, 3),                 # orders not followed in a day before Hestia lets go of the flame
    # Lighting (« Allumer et éteindre : par Hestia »).
    "saison_douce_c": (18, 14, 22),       # the house at this or more: the mild season, judged on the need (1.1.0b8)
    "douce_besoin_c": (1.5, 0.5, 4),      # the stove's room this far under its set point at the end of the boost: lit
    "douce_sans_besoin_c": (0.5, 0, 2),   # this close to it, or closer: not lit (Hestia watches); between: it asks
    "reponse_min": (15, 5, 60),           # the answer waited this long
    "allumage_verif_min": (3, 1, 10),     # the order to light checked after this
    "recharge_s": (20, 5, 120),           # after reloading the stove's integration
    "demarrages_max": (3, 1, 3),          # starts by Hestia a day
    # The temperature set in the stove itself, sent before a start (Réglages › Poêle à granulés, beside the ÉCO Stop,
    # since 1.0.0b9): high enough that its own probe (near the stove, warmer than the room) does not reach it while it
    # heats, else the stove holds back at its lowest flame by itself; low enough to stay its own safety (25 before
    # 1.0.0b9: reached in 40 minutes at flame 5 in a house, the room at 21 °C).
    "consigne_poele": (28, 15, 35),
    # Stopping.
    "arret_ecart_c": (1, 0.2, 3),         # the house no more than this under the set point: warm enough
    "chaud_min": (2, 1, 30),              # warm enough for this long
    "arret_ordres": (3, 1, 5),            # stop orders, 15 s apart
    "arret_verif_min": (25, 10, 60),      # the stop checked after this
    "fumees_froides_c": (60, 30, 100),    # the stove is out with its smoke under this
    "prise_repos_w": (70, 10, 200),       # or its plug under this
    "prise_reponse_min": (5, 1, 30),      # « Couper la prise ? » waits this long
    # Safeties.
    "surchauffe_c": (28, 22, 28),         # the stove's room over this while it burns: cut
    "alarme_min": (2, 1, 2),             # an alarm counts once it lasts this long
    "muet_min": (15, 5, 60),              # a silent stove said after this
    "prise_brule_w": (60, 10, 200),       # a silent stove whose plug draws more still burns
    "securite_max_min": (120, 15, 120),   # the stove's thermostat in safety for its outdoor probe: stopped after this
    # Counting the pellets.
    "debit_allumage": (None, 0.1, 5),     # kg/h while lighting (None: the profile's)
    "debit_1": (None, 0.1, 5),
    "debit_2": (None, 0.1, 5),
    "debit_3": (None, 0.1, 5),
    "debit_4": (None, 0.1, 5),
    "debit_5": (None, 0.1, 5),
    "kwh_kg": (4.8, 3, 6),                # kWh in a kilo of pellets
    "rendement": (87, 50, 100),           # % of it that heats the house
    "brasier_bientot_kg": (4, 1, 15),     # the fire pot said « soon » this many kilos before its threshold
}

# What each figure is called when a value is refused (Réglages says why).
WORDS = {
    "palier_5": "flamme 5 dès", "palier_4": "flamme 4 dès", "palier_3": "flamme 3 dès", "marge": "marge entre paliers",
    "monter_min": "monter la flamme au plus toutes les", "avance_min": "regarder la pièce en avance de",
    "ventil_fumees_c": "ventilation au plus bas sous", "ventil_rythme_min": "changer la ventilation au plus toutes les",
    "garde": "gardés pour l’éteindre", "garde_ventil": "gardés avant la ventilation",
    "flamme_max_jour": "changements de flamme par jour", "verif_min": "vérifier chaque changement après",
    "echecs": "rendre la main après", "saison_douce_c": "saison douce à partir de",
    "douce_besoin_c": "allumer sans demander sous la consigne de",
    "douce_sans_besoin_c": "pas besoin du poêle à moins de",
    "reponse_min": "attendre votre réponse", "allumage_verif_min": "vérifier l’allumage après",
    "recharge_s": "attendre après le rechargement", "demarrages_max": "allumages par jour",
    "consigne_poele": "température réglée dans le poêle", "arret_ecart_c": "éteindre à moins de",
    "chaud_min": "maison assez chaude depuis", "arret_ordres": "ordres d’arrêt",
    "arret_verif_min": "vérifier l’arrêt après", "fumees_froides_c": "fumées froides sous",
    "prise_repos_w": "prise au repos sous", "prise_reponse_min": "attendre avant de couper la prise",
    "surchauffe_c": "couper au-dessus de", "alarme_min": "une alarme compte après", "muet_min": "poêle muet après",
    "prise_brule_w": "il brûle encore au-dessus de", "securite_max_min": "sonde dehors sans nouvelles, au plus",
    "debit_allumage": "débit à l’allumage",
    "debit_1": "débit en flamme 1", "debit_2": "débit en flamme 2", "debit_3": "débit en flamme 3",
    "debit_4": "débit en flamme 4", "debit_5": "débit en flamme 5", "kwh_kg": "énergie d’un kilo",
    "rendement": "rendement du poêle", "brasier_bientot_kg": "prévenir du brasier",
}

_values: dict[str, float] = {}
# The stove's ÉCO Stop as chosen in Réglages (1.0.0b3): set again before a start by « Par Hestia », like its set point.
_eco_stop = True


def get(key: str) -> float | None:
    """The figure in force: the one saved in Réglages, else its default."""
    return _values.get(key, SPEC[key][0])


def minutes(key: str) -> timedelta:
    return timedelta(minutes=float(get(key)))


def seconds(key: str) -> timedelta:
    return timedelta(seconds=float(get(key)))


def set_values(values: dict | None, eco_stop: bool | None = True) -> None:
    """The figures saved in Réglages (already checked by `clean`); anything else is ignored. `eco_stop`: whether the
    stove's own ÉCO Stop is wanted on (Réglages, « La flamme et la ventilation »)."""
    global _values, _eco_stop
    _values = {k: v for k, v in (values or {}).items() if k in SPEC and isinstance(v, (int, float))
               and not isinstance(v, bool)}
    _eco_stop = eco_stop is not False


def stove_setting(spec: dict) -> dict:
    """One of the profile's settings sent before a start, as Réglages want it: the stove's own set point
    (« Température réglée dans le poêle ») and its ÉCO Stop. Its `valeur`, its `donnees` and its `service`."""
    out = dict(spec)
    if spec.get("role") == "thermostat" and spec.get("attribut") == "temperature":
        value = get("consigne_poele")
        out["valeur"] = value
        out["donnees"] = {**(spec.get("donnees") or {}), "temperature": value}
        if value != spec.get("valeur"):
            out["nom"] = f"Consigne interne à {_num(value)} °C"
    elif spec.get("role") == "eco_stop":
        out["valeur"] = "on" if _eco_stop else "off"
        out["service"] = "switch.turn_on" if _eco_stop else "switch.turn_off"
        if not _eco_stop:
            out["nom"] = "ECO Stop coupé"
    return out


def clean(values) -> dict:
    """The figures as they may be saved: a dict of known keys, each a number within its bounds (None or absent: the
    default). Raises ValueError in French, naming the figure, otherwise."""
    if values is None:
        return {}
    if not isinstance(values, dict):
        raise ValueError("réglages avancés illisibles")
    out: dict[str, float] = {}
    for key, value in values.items():
        if key not in SPEC:
            raise ValueError(f"réglage avancé inconnu : {key}")
        if value is None:
            continue
        low, high = SPEC[key][1], SPEC[key][2]
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not low <= value <= high:
            raise ValueError(f"{WORDS[key]} : entre {_num(low)} et {_num(high)}, ou vide")
        out[key] = value
    steps = [out.get(k, SPEC[k][0]) for k in ("palier_5", "palier_4", "palier_3")]
    if not steps[0] > steps[1] > steps[2]:
        raise ValueError("les paliers de la flamme doivent descendre : flamme 5, puis 4, puis 3")
    return out


def steps() -> tuple[tuple[float, int], ...]:
    """The demand's steps, from the highest: (lowest demand, flame)."""
    return ((get("palier_5"), 5), (get("palier_4"), 4), (get("palier_3"), 3), (0, 2))


def rates(profile_rates: dict | None) -> dict:
    """The pellets burnt per hour: the profile's, each replaced by the one set in Réglages."""
    base = dict(profile_rates or {})
    flames = list(base.get("flammes") or [])
    for i in range(5):
        value = _values.get(f"debit_{i + 1}")
        if value is not None:
            while len(flames) <= i:
                flames.append(flames[-1] if flames else value)
            flames[i] = value
    out = {**base}
    if flames:
        out["flammes"] = flames
    if _values.get("debit_allumage") is not None:
        out["allumage"] = _values["debit_allumage"]
    return out


def kwh_per_kg() -> float:
    """The heat of a kilo of pellets that warms the house."""
    return round(float(get("kwh_kg")) * float(get("rendement")) / 100, 3)


def defaults() -> dict:
    """{key: [default, lowest, highest]}, for Réglages."""
    return {k: [v[0], v[1], v[2]] for k, v in SPEC.items()}


def _num(value: float) -> str:
    return (f"{value:g}").replace(".", ",")
