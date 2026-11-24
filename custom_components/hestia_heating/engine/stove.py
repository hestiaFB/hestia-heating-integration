"""The pellet stove, read through its profile: its state in the brick's words, its flame, its smoke, its alarm, the
writes its memory accepts each day, the plug that says whether it really runs, and the pellets left."""
from __future__ import annotations

from datetime import datetime

from .profiles import BURNING, Profile

# The plug of a stove that draws this much runs (fans, auger, ignition); stopped it draws next to nothing.
PLUG_RUNNING_W = 15


def _number(value) -> float | None:
    try:
        return None if value in (None, "unknown", "unavailable", "") else float(value)
    except (TypeError, ValueError):
        return None


def _role(roles: dict, name: str | None) -> dict:
    return (roles.get(name) if name else None) or {}


def _same(current, wanted) -> bool:
    try:
        return abs(float(current) - float(wanted)) < 0.05
    except (TypeError, ValueError):
        return str(current).casefold() == str(wanted).casefold()


def _fan(role: dict) -> str | None:
    mode = (role.get("attributes") or {}).get("fan_mode") if role.get("entity_id") else None
    return None if mode in (None, "unknown", "unavailable", "") else str(mode)


def _fan_levels(role: dict) -> list[str]:
    """The front fan's numbered modes (« 1 » to « 5 »), lowest first, for « flamme + 1 » (1.0); AUTO and OFF left out."""
    modes = (role.get("attributes") or {}).get("fan_modes") if role.get("entity_id") else None
    levels = [str(m) for m in modes or () if str(m).strip().isdigit() and int(str(m)) > 0]
    return sorted(levels, key=lambda m: int(m))


def _orders(profile: Profile, roles: dict) -> dict:
    """What the whole pilot (0.7) needs to know of the stove: whether it can be lit and stopped (the profile says how,
    and the entities are there), whether it took the order to light, and its settings to set before a start, each
    with whether it must change (only a known value that differs: an unavailable stove is not written to)."""
    orders = profile.orders or {}
    can = all(_role(roles, (orders.get(g) or {}).get("role")).get("entity_id") for g in ("allumer", "eteindre"))
    lit_spec = orders.get("allume_si") or {}
    lit_role = _role(roles, lit_spec.get("role"))
    lit_state = lit_role.get("state")
    lit = None if lit_state in (None, "unknown", "unavailable") or not lit_spec else lit_state == lit_spec.get("etat")
    settings = []
    for s in orders.get("reglages") or ():
        r = _role(roles, s.get("role"))
        if not r.get("entity_id"):
            continue
        current = (r.get("attributes") or {}).get(s["attribut"]) if s.get("attribut") else r.get("state")
        known = current not in (None, "unknown", "unavailable") and r.get("state") not in ("unknown", "unavailable")
        settings.append({"nom": s.get("nom") or s["role"], "role": s["role"], "reserve": s.get("reserve"),
                         "a_changer": known and not _same(current, s.get("valeur"))})
    return {"pilotable": bool(orders) and can, "allume": lit, "reglages": settings,
            "rechargeable": bool(orders.get("recharger")), "boutons": _buttons(orders, roles)}


def _buttons(orders: dict, roles: dict) -> dict:
    """The card's « Allumer » and « Éteindre » (0.8): the profile's own orders, each a service, its entity and its
    data. A press is the user's, sent from the browser like the room's mode buttons, never by Hestia; the card greys
    them out for a stove copied from another house."""
    out = {}
    for gesture in ("allumer", "eteindre"):
        spec = orders.get(gesture) or {}
        entity = _role(roles, spec.get("role")).get("entity_id")
        if entity and "." in str(spec.get("service") or ""):
            out[gesture] = {"service": spec["service"], "entity_id": entity, "donnees": dict(spec.get("donnees") or {})}
    return out


def read(profile: Profile, device: dict, roles: dict, thermostat: dict | None = None, plug: dict | None = None,
         pellets: dict | None = None, writes_cap: int | None = None) -> dict:
    """`roles`: {role: {entity_id, state, attributes, last_changed}} as found by the profile; `thermostat`: the source
    read from the stove's thermostat (sources.read); `plug`: {entity_id, w}; `pellets`: pellets(...) below;
    `writes_cap`: the daily orders the stove integration lets through, read in its options (else the profile's)."""
    status = _role(roles, "etat")
    text = status.get("state")
    state, known = profile.translate(text)
    alarm_text = _role(roles, "alarme").get("state")
    alarm = profile.alarm(alarm_text)
    # Since when the stove is in alarm: its state's change, or its alarm text's (the pilot waits 2 minutes).
    alarm_since = [r.get("last_changed") for r, on in ((status, state == "alarme"), (_role(roles, "alarme"), alarm))
                   if on and isinstance(r.get("last_changed"), datetime)]
    if state == "alarme":
        alarm = True
    flame_spec = profile.roles.get("flamme") or {}
    set_flame = _number(_role(roles, "flamme").get("state"))
    real_flame = _number(_role(roles, "flamme_reelle").get("state"))
    writes = _number(_role(roles, "ecritures").get("state"))
    eco = _role(roles, "eco_stop").get("state")
    plug_w = (plug or {}).get("w")
    since = status.get("last_changed")
    flame_since = _role(roles, "flamme").get("last_changed")
    return {
        "nom": device.get("name") or profile.name,
        "fabricant": device.get("maker"),
        "modele": device.get("model"),
        "piece": device.get("room"),
        "profil": profile.id,
        "profil_nom": profile.name,
        "cloud": bool(profile.limits.get("cloud")),
        "etat": state,
        "texte": text if text not in (None, "unknown", "unavailable") else None,
        "a_traduire": not known,
        "en_feu": state in BURNING,
        # On standby (ECO Stop): off for the brick, but it starts again by itself (1.0, the stove's sentence).
        "veille": state == "eteint" and bool(text) and text.strip().casefold() in {w.casefold() for w in profile.standby},
        "depuis": since.isoformat() if isinstance(since, datetime) else None,
        # Some stoves report a real flame of 1 while off: the flame is only said while the stove burns.
        "flamme": None if state not in BURNING else int(real_flame) if real_flame is not None else (
            int(set_flame) if set_flame is not None else None),
        "flamme_reglee": None if set_flame is None else int(set_flame),
        "flamme_depuis": flame_since.isoformat() if isinstance(flame_since, datetime) else None,
        "flamme_min": int(flame_spec.get("min", 1)),
        "flamme_max": int(flame_spec.get("max", 5)),
        "fumees": _number(_role(roles, "fumees").get("state")),
        "air": _number(_role(roles, "air").get("state")),
        "alarme": alarm,
        "alarme_texte": None if alarm_text in (None, "unknown", "unavailable") else alarm_text,
        "alarme_depuis": min(alarm_since).isoformat() if alarm_since else None,
        "eco_stop": None if eco in (None, "unknown", "unavailable") else eco == "on",
        "ecritures": None if writes is None else int(writes),
        "ecritures_max": writes_cap or profile.limits.get("ecritures_par_jour"),
        "ecritures_lues": writes_cap is not None,
        "thermostat": (thermostat or {}).get("entite"),
        "thermostat_nom": (thermostat or {}).get("nom"),
        "demande_pct": (thermostat or {}).get("demande_pct"),
        "consigne": (thermostat or {}).get("consigne"),
        "preset": (thermostat or {}).get("preset"),
        "prise": (plug or {}).get("entity_id"),
        "prise_w": plug_w,
        "prise_tourne": None if plug_w is None else plug_w >= PLUG_RUNNING_W,
        "entites": {role: r.get("entity_id") for role, r in roles.items() if r.get("entity_id")},
        # The front fan's mode (« AUTO », « 3 »), for the card's « Ventilation » (0.8).
        "ventilation": _fan(_role(roles, "ventilation")),
        "ventilation_niveaux": _fan_levels(_role(roles, "ventilation")),
        "granules": pellets,
        **_orders(profile, roles),
    }


def pellets(found: dict | None) -> dict | None:
    """Suivi Stock Pellet's figures ({role: state dict}, by `suivi_stock_pellet_key`): the stock, the bag, the season,
    and the days left at the season's pace (kilos burnt per day the stove was used)."""
    if not found or "stock" not in found and "consomme_kg" not in found:
        return None

    def value(role):
        return _number((found.get(role) or {}).get("state"))

    stock = found.get("stock") or {}
    attrs = stock.get("attributes") or {}
    stock_kg, season_kg, days_used = value("stock"), value("consomme_kg"), value("jours_utilisation")
    bag_kg = _number(attrs.get("poids_sac_kg"))
    pace = season_kg / days_used if season_kg and days_used else None
    burnt_attrs = (found.get("consomme_kg") or {}).get("attributes") or {}
    bought_attrs = (found.get("achete_kg") or {}).get("attributes") or {}
    spent, bought = value("depense"), _number(bought_attrs.get("achete_sacs"))
    start_month = _number(attrs.get("mois_debut_saison"))
    return {
        "stock_kg": stock_kg,
        "stock_sacs": _number(attrs.get("stock_sacs")) if attrs.get("stock_sacs") is not None else (
            None if stock_kg is None or not bag_kg else round(stock_kg / bag_kg, 1)),
        "sac_kg": bag_kg,
        "saison_kg": season_kg,
        "saison": attrs.get("saison"),
        "jours_utilisation": None if days_used is None else int(days_used),
        "kg_par_jour": None if pace is None else round(pace, 1),
        "jours": None if pace is None or stock_kg is None else int(stock_kg // pace),
        "depense": value("depense"),
        # The bags declared burnt this season (one declared when the tank is empty) and the price of one bag, from
        # what was spent on the bags bought: Hestia's pellet count is set on them (engine/granules.py).
        "consomme_sacs": _number(burnt_attrs.get("consomme_sacs")),
        "achete_sacs": bought,
        "prix_sac": round(spent / bought, 2) if spent and bought else None,
        "debut_saison": int(start_month) if start_month and 1 <= start_month <= 12 else None,
        "stat": (found.get("consomme_kg") or {}).get("entity_id"),
    }
