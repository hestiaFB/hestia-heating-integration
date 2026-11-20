"""What every Hestia Heating entity shares: its device (« Hestia Chauffage »), its stable id, its updates."""
from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN, VERSION


class HeatingEntity(Entity):
    """Entity ids are the brick's domain and the key (« sensor.hestia_heating_maison_etat »), like Hestia Weather's
    (« sensor.hestia_weather_alerte »): the same in every language, so automations and other bricks can rely on them."""
    _attr_has_entity_name = True
    platform_domain = "sensor"
    _attr_should_poll = False

    def __init__(self, coordinator, description) -> None:
        self.coordinator = coordinator
        self.entity_description = description
        entry = coordinator.entry
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self.entity_id = f"{self.platform_domain}.{DOMAIN}_{description.key}"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, entry.entry_id)}, name="Hestia Chauffage",
                                            manufacturer="Hestia-FB", model="Hestia Chauffage", sw_version=VERSION,
                                            entry_type=DeviceEntryType.SERVICE)

    @property
    def available(self) -> bool:
        return bool(self.coordinator.data.get("pret"))

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.coordinator.add_listener(self.async_write_ha_state))
