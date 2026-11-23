"""The stove's alarm, and one « en chauffe » per room (`piece_<id de la pièce>_en_chauffe`): a room that appears later
gets its sensor then, without a restart; a room that goes away keeps its sensor, unavailable."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity, BinarySensorEntityDescription
from homeassistant.core import callback

from .entity import HeatingEntity


@dataclass(frozen=True, kw_only=True)
class HeatingBinaryDescription(BinarySensorEntityDescription):
    value: Callable[[dict], bool | None]
    attributes: Callable[[dict], dict] = lambda d: {}
    exists: Callable[[dict], bool] = lambda d: True


ALARM = HeatingBinaryDescription(
    key="poele_alarme", translation_key="poele_alarme", device_class=BinarySensorDeviceClass.PROBLEM,
    value=lambda d: (d.get("poele") or {}).get("alarme"),
    attributes=lambda d: {"texte_du_poele": (d.get("poele") or {}).get("alarme_texte")},
    exists=lambda d: bool(d.get("poele")))


def _fire_pot(d: dict) -> dict:
    return ((d.get("poele") or {}).get("conso") or {}).get("brasier") or {}


# The fire pot to clean (0.6): on past its threshold, unknown until Hestia was told of a cleaning.
FIRE_POT = HeatingBinaryDescription(
    key="poele_brasier_a_nettoyer", translation_key="poele_brasier_a_nettoyer", device_class=BinarySensorDeviceClass.PROBLEM,
    value=lambda d: None if _fire_pot(d).get("kg") is None else bool(_fire_pot(d).get("a_nettoyer")),
    attributes=lambda d: {"kg": _fire_pot(d).get("kg"), "seuil_kg": _fire_pot(d).get("seuil_kg"),
                          "texte": _fire_pot(d).get("texte")},
    exists=lambda d: bool(d.get("poele")))


def _room(d: dict, room_id: str) -> dict | None:
    return next((r for r in d.get("pieces") or [] if r["id"] == room_id), None)


def room_description(room_id: str) -> HeatingBinaryDescription:
    return HeatingBinaryDescription(
        key=f"piece_{room_id}_en_chauffe", translation_key="piece_en_chauffe", device_class=BinarySensorDeviceClass.HEAT,
        value=lambda d: None if (r := _room(d, room_id)) is None or r["etat"] == "inconnu" else r["etat"] == "chauffe",
        attributes=lambda d: {} if (r := _room(d, room_id)) is None else {
            "temperature": r["temperature"], "consigne": r["consigne"], "puissance_w": r["puissance_w"],
            "demande_pct": r["demande_pct"], "poele": r["poele"], "sources": r["sources"]})


async def async_setup_entry(hass, entry, async_add_entities):
    coordinator = entry.runtime_data
    known: set[str] = set()

    def new_rooms() -> list:
        out = []
        for room in coordinator.data.get("pieces") or []:
            if room["id"] not in known:
                known.add(room["id"])
                out.append(HeatingRoom(coordinator, room_description(room["id"]), room["nom"]))
        return out

    entities = [HeatingBinary(coordinator, d) for d in (ALARM, FIRE_POT) if d.exists(coordinator.data)]
    async_add_entities(entities + new_rooms())

    @callback
    def added() -> None:
        rooms = new_rooms()
        if rooms:
            async_add_entities(rooms)
    entry.async_on_unload(coordinator.add_listener(added))


class HeatingBinary(HeatingEntity, BinarySensorEntity):
    entity_description: HeatingBinaryDescription
    platform_domain = "binary_sensor"

    @property
    def is_on(self):
        return self.entity_description.value(self.coordinator.data)

    @property
    def extra_state_attributes(self):
        return self.entity_description.attributes(self.coordinator.data)


class HeatingRoom(HeatingBinary):
    def __init__(self, coordinator, description, room_name: str) -> None:
        super().__init__(coordinator, description)
        self._attr_translation_placeholders = {"piece": room_name}

    @property
    def available(self) -> bool:
        return super().available and _room(self.coordinator.data, self.entity_description.key[6:-11]) is not None
