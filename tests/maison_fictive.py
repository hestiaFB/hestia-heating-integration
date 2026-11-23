"""A made-up house for the tests: a living room warmed by a pellet stove and a radiator, an office, a guest room
with its window open and a workshop with an air conditioner. Every name and id here is invented."""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
BRICK = ROOT / "custom_components" / "hestia_heating"
sys.path.insert(0, str(BRICK))

from engine import planning, profiles  # noqa: E402

TZ = timezone(timedelta(hours=1))
# A Friday evening of November.
NOW = datetime(2026, 11, 20, 21, 40, tzinfo=TZ)
PROFILE = next(p for p in profiles.load_all(BRICK / "profiles") if p.integration == "aguaiot")


def vt(entity_id, name, room, *, state="heat", action="idle", preset="eco", target=17.0, current=19.0, demand=0,
       watts=None, device_power=1000, window=False, under=(), **extra):
    attributes = {"friendly_name": name, "hvac_modes": ["heat", "off"], "hvac_action": action, "preset_mode": preset,
                  "temperature": target, "current_temperature": current, "power_percent": demand,
                  "power_manager": {"device_power": device_power, "mean_cycle_power": watts},
                  "window_manager": {"window_state": "on" if window else "off"},
                  "vtherm_over_switch": {"underlying_entities": list(under)},
                  "preset_temperatures": {"eco_temp": 17.0, "comfort_temp": 19.0, "boost_temp": 21.0, "frost_temp": 7.0},
                  "preset_modes": ["none", "frost", "eco", "comfort", "boost"],
                  **extra}
    return {"entity_id": entity_id, "state": state, "attributes": attributes, "platform": "versatile_thermostat",
            "name": name, "room": room}


def climates():
    return [
        vt("climate.vt_poele", "Thermostat poêle", "sejour", preset="boost", target=21.0, current=19.8, demand=60,
           action="heating", under=("switch.poele_marche",)),
        vt("climate.vt_sejour", "Radiateur séjour", "sejour", target=17.0, current=19.8),
        vt("climate.vt_bureau", "Radiateur bureau", "bureau", preset="comfort", target=19.0, current=18.2, demand=40,
           watts=600, device_power=1500, action="heating"),
        vt("climate.vt_amis", "Radiateur amis", "amis", preset="eco", target=17.0, current=16.0, window=True),
        {"entity_id": "climate.clim_atelier", "state": "cool", "platform": "clim_demo", "name": "Clim atelier", "room": "atelier",
         "attributes": {"friendly_name": "Clim atelier", "hvac_modes": ["off", "cool"], "hvac_action": "cooling",
                        "temperature": 24.0, "current_temperature": 26.0}},
    ]


def stove(status="On", flame="3", since=NOW - timedelta(hours=3)):
    states = {"etat": ("sensor.poele_status", status), "alarme": ("sensor.poele_alarm", "OK"),
              "fumees": ("sensor.poele_smoke_temperature", "140"), "flamme": ("number.poele_power", flame),
              "flamme_reelle": ("sensor.poele_real_power", flame), "ecritures": ("sensor.poele_eeprom_writes_today", "4"),
              "eco_stop": ("switch.poele_eco_stop", "on")}
    roles = {role: {"entity_id": e, "state": s, "attributes": {}, "last_changed": since} for role, (e, s) in states.items()}
    return {"profile": PROFILE, "device": {"name": "Poêle", "maker": "Micronova", "model": "Essai", "room": "sejour"},
            "roles": roles, "entities": [r["entity_id"] for r in roles.values()] + ["climate.poele", "switch.poele_marche"]}


def pellets():
    """Suivi Stock Pellet as it shows itself: 6 bags declared burnt, 16 bought for 88 €, a season from October."""
    return {"stock": {"entity_id": "sensor.granules_stock", "state": "150",
                      "attributes": {"poids_sac_kg": 15, "stock_sacs": 10, "saison": "2026-2027", "mois_debut_saison": 10}},
            "consomme_kg": {"entity_id": "sensor.granules_saison", "state": "90", "attributes": {"consomme_sacs": 6.0}},
            "achete_kg": {"entity_id": "sensor.granules_achetes", "state": "240", "attributes": {"achete_sacs": 16.0}},
            "depense": {"entity_id": "sensor.granules_depense", "state": "88", "attributes": {}},
            "jours_utilisation": {"entity_id": "sensor.granules_jours", "state": "30", "attributes": {}}}


def schedules():
    """Scheduler as Home Assistant shows it: eco at night, comfort in the evening, the stove's thermostat in boost."""
    def switch(entity_id, name, targets, slots, days=("daily",), on=True):
        attrs = {"entities": list(targets), "weekdays": list(days),
                 "timeslots": [s[0] for s in slots], "actions": [s[1] for s in slots]}
        return planning.parse(entity_id, name, "on" if on else "off", attrs)

    def preset(p):
        return {"service": "climate.set_preset_mode", "data": {"preset_mode": p}}

    return [
        switch("switch.schedule_chambres", "Planning radiateurs", ["climate.vt_bureau", "climate.vt_amis"],
               [("06:30:00 - 08:00:00", preset("comfort")), ("08:00:00 - 17:30:00", preset("eco")),
                ("17:30:00 - 22:30:00", preset("comfort")), ("22:30:00 - 06:30:00", preset("eco"))]),
        switch("switch.schedule_poele", "Planning poêle", ["climate.vt_poele"],
               [("07:00:00 - 09:00:00", preset("boost")), ("09:00:00 - 18:00:00", preset("frost")),
                ("18:00:00 - 23:00:00", preset("boost")), ("23:00:00 - 07:00:00", preset("frost"))]),
    ]


def hourly(start=NOW, low=-3.0):
    """Hestia Weather's hours: cold tonight, milder tomorrow afternoon."""
    out = []
    for h in range(0, 24):
        at = start.replace(minute=0) + timedelta(hours=h + 1)
        temperature = low + abs(at.hour - 6) * (0.2 if at.hour < 6 else 0.6)
        out.append({"time": at.isoformat(), "temperature": round(temperature, 1)})
    return out


def snapshot(**changes):
    snap = {"now": NOW, "climates": climates(), "stove": stove(), "plug": {"entity_id": "sensor.prise_du_poele_puissance", "w": 42.0},
            "pellets": pellets(), "schedules": schedules(), "workday": True, "hourly": hourly(),
            "room_names": {"sejour": "Séjour", "bureau": "Bureau", "amis": "Chambre d’amis", "atelier": "Atelier"}}
    snap.update(changes)
    return snap


TODAY: date = NOW.date()


def home_planning(**changes):
    """The house's own plannings: the stove and the séjour in trial, the workshop's air conditioner active. The bureau
    and the guest room stay on Scheduler."""
    plannings = {
        "poele": {"nom": "Poêle", "actif": False, "jours": "semaine", "reste": "hors_gel",
                  "plages": [[["06:30", "08:30", "boost"], ["17:00", "22:30", "boost"]], [["09:00", "21:00", "boost"]]],
                  "thermostats": ["climate.vt_poele"]},
        "sejour": {"nom": "Séjour", "actif": False, "jours": "semaine", "reste": "hors_gel",
                   "plages": [[["06:30", "08:30", "confort"], ["17:00", "22:30", "confort"]], [["08:00", "23:00", "confort"]]],
                   "thermostats": ["climate.vt_sejour"]},
        "atelier": {"nom": "Atelier", "actif": True, "jours": "tous", "reste": "eco",
                    "plages": [[["09:00", "18:00", "confort"]]], "thermostats": ["climate.clim_atelier"]},
    }
    plannings.update(changes)
    return {"plannings": plannings}
