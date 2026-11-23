"""The sensors of the cahier des charges: stable ids `<entry>_<clé>`, values read from the coordinator, never computed
here. A stove sensor exists only with a stove found at start; a value not known is « unknown », never zero."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.const import UnitOfEnergy, UnitOfMass, UnitOfTime

from .engine.granules import KWH_PER_KG
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


def _conso(d: dict) -> dict:
    return _stove(d).get("conso") or {}


def _fire_pot(d: dict) -> dict:
    return _conso(d).get("brasier") or {}


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
    # The pellets counted by Hestia (0.6): kilos burnt and their useful energy, never reset (for the Energy page and
    # Hestia Énergie), and the kilos burnt since the fire pot was last cleaned.
    HeatingSensorDescription(
        key="poele_granules_brules", translation_key="poele_granules_brules", device_class=SensorDeviceClass.WEIGHT,
        state_class=SensorStateClass.TOTAL_INCREASING, native_unit_of_measurement=UnitOfMass.KILOGRAMS,
        suggested_display_precision=1, value=lambda d: _conso(d).get("total_kg"),
        attributes=lambda d: {k: _conso(d).get(k) for k in ("debit_kg_h", "kg_jour", "kg_saison", "saison",
                                                             "correction", "prix_kg", "cout_jour")},
        exists=lambda d: bool(d.get("poele"))),
    HeatingSensorDescription(
        key="poele_energie", translation_key="poele_energie", device_class=SensorDeviceClass.ENERGY,
        state_class=SensorStateClass.TOTAL_INCREASING, native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
        suggested_display_precision=1, value=lambda d: _conso(d).get("energie_kwh"),
        attributes=lambda d: {"kwh_par_kg": KWH_PER_KG, "kwh_jour": _conso(d).get("kwh_jour"),
                              "prix_kwh": _conso(d).get("prix_kwh")},
        exists=lambda d: bool(d.get("poele"))),
    HeatingSensorDescription(
        key="poele_brasier", translation_key="poele_brasier", device_class=SensorDeviceClass.WEIGHT,
        native_unit_of_measurement=UnitOfMass.KILOGRAMS, suggested_display_precision=1,
        value=lambda d: _fire_pot(d).get("kg"),
        attributes=lambda d: {k: _fire_pot(d).get(k) for k in ("seuil_kg", "nettoye_le", "par_les_sacs", "texte")},
        exists=lambda d: bool(d.get("poele"))),
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
