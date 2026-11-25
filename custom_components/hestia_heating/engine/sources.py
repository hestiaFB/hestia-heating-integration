"""Each source of heat or cold, read from its thermostat: what it is, what it does, why.

A source is a `climate` with a room temperature: a Versatile Thermostat first (its attributes say the demand, the
power, the window, the load shedding, the safety mode), else any thermostat or air conditioner. The stove's thermostat
is the Versatile Thermostat whose switch drives the stove: its power is the stove's, never counted as electricity.
"""
from __future__ import annotations

import re

VT = "versatile_thermostat"
# A stove named in an entity, a device or a thermostat (« thermostat_poele », « Poêle du salon », « Pellet stove »).
STOVE_NAME = re.compile(r"po[eê]le|pellet|granul|stove|kachel|ofen", re.I)
PLUG_NAME = re.compile(r"prise|plug|socket|outlet|steckdose", re.I)
# The states of a source (the `etat` of `sources()` in the interface for the other bricks).
STATES = ("chauffe", "rafraichit", "repos", "arret", "inconnu")
# Presets as Versatile Thermostat names them, and the brick's words for them.
PRESETS = {"comfort": "confort", "boost": "boost", "eco": "éco", "frost": "hors gel", "away": "absence",
           "activity": "activité", "none": None, "sleep": "nuit", "home": "présence"}


def _number(value) -> float | None:
    try:
        return None if value is None or isinstance(value, bool) else float(value)
    except (TypeError, ValueError):
        return None


def _vt_part(attrs: dict, key: str) -> dict:
    part = attrs.get(key)
    return part if isinstance(part, dict) else {}


# A Versatile Thermostat seen without its platform (copied by Remote Home Assistant, as in a lab) still says what it is.
VT_ATTRIBUTES = ("vtherm_over_switch", "vtherm_over_climate", "vtherm_over_valve")


def is_vt(platform: str | None, attrs: dict) -> bool:
    """A Versatile Thermostat, by its platform or, when the platform is another one (a copy), by its own attributes."""
    return platform == VT or any(k in attrs for k in VT_ATTRIBUTES) or (
        isinstance(attrs.get("specific_states"), dict) and isinstance(attrs.get("preset_temperatures"), dict))


# What a thermostat may be said to drive in Réglages (1.0.0b3), when the guess is wrong: « plancher » for a floor or
# radiators fed with water.
KINDS = ("radiateur", "clim", "pac", "vanne", "plancher", "autre")


def kind(platform: str | None, attrs: dict) -> str:
    """« radiateur », « clim », « pac » (heats and cools), « vanne » or « autre »."""
    modes = [str(m) for m in attrs.get("hvac_modes") or []]
    heats, cools = any(m in ("heat", "heat_cool", "auto") for m in modes), "cool" in modes
    if heats and cools:
        return "pac"
    if cools:
        return "clim"
    if is_vt(platform, attrs):
        vt_type = _vt_part(attrs, "configuration").get("type")
        if vt_type == "over_valve" or attrs.get("is_over_valve"):
            return "vanne"
        return "radiateur"
    return "radiateur" if heats else "autre"


def underlying(attrs: dict) -> list[str]:
    """The entities a Versatile Thermostat drives (its switches, its climates, its valves)."""
    out: list[str] = []
    for key in ("vtherm_over_switch", "vtherm_over_climate", "vtherm_over_valve"):
        out += [str(e) for e in _vt_part(attrs, key).get("underlying_entities") or []]
    out += [str(e) for e in attrs.get("underlying_entities") or [] if str(e) not in out]
    return out


def state_of(state: str, attrs: dict) -> str:
    if state in ("unavailable", "unknown", None):
        return "inconnu"
    if state == "off":
        return "arret"
    action = attrs.get("hvac_action")
    if action in ("heating", "preheating"):
        return "chauffe"
    if action in ("cooling", "drying"):
        return "rafraichit"
    if action in ("idle", "off", "fan"):
        return "repos"
    # A thermostat that does not say what it does: its demand decides.
    demand = _number(attrs.get("power_percent"))
    if demand is not None:
        return "chauffe" if demand > 0 else "repos"
    return "repos"


def read(climate: dict) -> dict:
    """One source from one thermostat as the reader hands it ({entity_id, state, attributes, platform, name, room…})."""
    attrs = climate.get("attributes") or {}
    platform = climate.get("platform")
    vt = is_vt(platform, attrs)
    power = _vt_part(attrs, "power_manager")
    window = _vt_part(attrs, "window_manager")
    safety = _vt_part(attrs, "safety_manager")
    specific = _vt_part(attrs, "specific_states")
    presets = _vt_part(attrs, "preset_temperatures")
    demand = _number(attrs.get("power_percent"))
    if demand is None:
        demand = _number(attrs.get("on_percent"))
        demand = None if demand is None else demand * 100
    watts = _number(power.get("mean_cycle_power"))
    if watts is None and _number(power.get("device_power")) is not None and _number(attrs.get("on_percent")) is not None:
        watts = _number(power.get("device_power")) * _number(attrs.get("on_percent"))
    state = state_of(climate.get("state"), attrs)
    return {
        "id": climate["entity_id"],
        "entite": climate["entity_id"],
        "nom": climate.get("name") or attrs.get("friendly_name") or climate["entity_id"],
        "integration": platform,
        "type": kind(platform, attrs),
        "piece": climate.get("room"),
        "etat": state,
        "mode": climate.get("state"),
        "action": attrs.get("hvac_action"),
        "preset": attrs.get("preset_mode") if attrs.get("preset_mode") not in (None, "none") else None,
        "temperature": _number(attrs.get("current_temperature")),
        "consigne": _number(attrs.get("temperature")),
        "consigne_haute": _number(attrs.get("target_temp_high")),
        "humidite": _number(attrs.get("current_humidity")),
        "demande_pct": None if demand is None else round(max(0.0, min(100.0, demand))),
        "puissance_w": None if watts is None else round(watts),
        "puissance_max_w": _number(power.get("device_power")),
        "fenetre": window.get("window_state") == "on" or window.get("window_auto_state") == "on",
        "fenetre_capteur": window.get("window_sensor_entity_id"),
        "delestage": power.get("overpowering_state") == "on" or attrs.get("overpowering_state") == "on",
        "securite": safety.get("safety_state") == "on" or attrs.get("security_state") is True,
        # Which probe a safety is about (1.0.0b7, the stove's thermostat): Versatile Thermostat's delay and the last
        # time each of its probes spoke, the room's and the outdoor one.
        "securite_delai_min": _number(safety.get("safety_delay_min")),
        "sonde_piece_a": specific.get("last_temperature_datetime", attrs.get("last_temperature_datetime")),
        "sonde_dehors_a": specific.get("last_ext_temperature_datetime", attrs.get("last_ext_temperature_datetime")),
        "pente": _number(specific.get("temperature_slope", attrs.get("temperature_slope"))),
        # Versatile Thermostat's smoothed temperature: a puff of hot air on the probe does not move it.
        "temperature_lissee": _number(specific.get("ema_temp", attrs.get("ema_temp"))),
        "raison_arret": specific.get("hvac_off_reason"),
        "prereglages": {k.removesuffix("_temp"): _number(v) for k, v in presets.items()
                        if k.endswith("_temp") and "_away" not in k and _number(v) is not None},
        "sous_jacents": underlying(attrs) if vt else [],
        "prereglages_dispo": [str(m) for m in attrs.get("preset_modes") or [] if m not in (None, "none")],
        "vt": vt,
        "energie_stat": climate.get("energie"),
        "granules_stat": None,
        "vu": climate.get("vu"),
    }


def is_stove_thermostat(source: dict, stove_entities: set[str], plug_switch: str | None = None) -> bool:
    """The stove's thermostat: a Versatile Thermostat that drives one of the stove's own entities (its switch or its
    climate), else one named after a stove. The setting in Réglages passes before both."""
    if not source.get("vt"):
        return False
    if any(e in stove_entities for e in source.get("sous_jacents") or []):
        return True
    return bool(STOVE_NAME.search(f"{source['entite']} {source['nom']}"))
