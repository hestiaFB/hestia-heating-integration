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


def _role(roles: dict, name: str) -> dict:
    return roles.get(name) or {}


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
        "granules": pellets,
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
        "stat": (found.get("consomme_kg") or {}).get("entity_id"),
    }
