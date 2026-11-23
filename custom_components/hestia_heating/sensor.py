"""The sensors of the cahier des charges: stable ids `<entry>_<clé>`, values read from the coordinator, never computed
here. A stove sensor exists only with a stove found at start; a value not known is « unknown », never zero."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.const import UnitOfTime

from .engine.profiles import STATES as STOVE_STATES
from .entity import HeatingEntity


@dataclass(frozen=True, kw_only=True)
class HeatingSensorDescription(SensorEntityDescription):
    value: Callable[[dict], object]
    attributes: Callable[[dict], dict] = lambda d: {}
    exists: Callable[[dict], bool] = lambda d: True


def _house(d: dict) -> dict:
    return d.get("maison") or {}


def _stove(d: dict) -> dict:
    return d.get("poele") or {}


SENSORS = (
    HeatingSensorDescription(
        key="maison_etat", translation_key="maison_etat", device_class=SensorDeviceClass.ENUM,
        options=["chauffe", "rafraichit", "repos", "arret", "inconnu"], value=lambda d: _house(d).get("etat"),
        attributes=lambda d: {"titre": _house(d).get("titre"), "texte": _house(d).get("texte"),
                              "temperature": _house(d).get("temperature"), "en_chauffe": _house(d).get("en_chauffe"),
                              "pieces": _house(d).get("pieces"), "electrique_w": _house(d).get("electrique_w"),
                              "en_marche": _house(d).get("en_marche")}),
    HeatingSensorDescription(
        key="poele_etat", translation_key="poele_etat", device_class=SensorDeviceClass.ENUM, options=list(STOVE_STATES),
        value=lambda d: _stove(d).get("etat"),
        attributes=lambda d: {"texte_du_poele": _stove(d).get("texte"), "a_traduire": _stove(d).get("a_traduire"),
                              "depuis": _stove(d).get("depuis"), "profil": _stove(d).get("profil")},
        exists=lambda d: bool(d.get("poele"))),
    HeatingSensorDescription(
        key="poele_flamme", translation_key="poele_flamme", state_class=SensorStateClass.MEASUREMENT,
        value=lambda d: _stove(d).get("flamme"),
        attributes=lambda d: {"flamme_reglee": _stove(d).get("flamme_reglee"), "max": _stove(d).get("flamme_max"),
                              "demande_thermostat": _stove(d).get("demande_pct")},
        exists=lambda d: bool(d.get("poele"))),
    HeatingSensorDescription(
        key="poele_granules_jours", translation_key="poele_granules_jours", native_unit_of_measurement=UnitOfTime.DAYS,
        value=lambda d: (d.get("granules") or {}).get("jours"),
        attributes=lambda d: {k: (d.get("granules") or {}).get(k) for k in ("stock_kg", "stock_sacs", "kg_par_jour", "saison_kg")},
        exists=lambda d: bool(d.get("granules"))),
)


async def async_setup_entry(hass, entry, async_add_entities):
    coordinator = entry.runtime_data
    async_add_entities(HeatingSensor(coordinator, d) for d in SENSORS if d.exists(coordinator.data))


class HeatingSensor(HeatingEntity, SensorEntity):
    entity_description: HeatingSensorDescription

    @property
    def native_value(self):
        return self.entity_description.value(self.coordinator.data)

    @property
    def extra_state_attributes(self):
        return self.entity_description.attributes(self.coordinator.data)
