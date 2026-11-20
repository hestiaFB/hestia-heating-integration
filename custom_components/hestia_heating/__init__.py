"""Hestia Heating (« Hestia Chauffage »): the heating and cooling of the house, read from the thermostats already
there (Versatile Thermostat first), the pellet stove through its profile, and the planning. Version 0.1 commands
nothing: no service call, no setting changed in another integration."""
from homeassistant.const import Platform
from homeassistant.helpers import config_validation as cv

from .api import HestiaHeatingApi
from .const import API_KEY, DOMAIN
from .coordinator import HeatingCoordinator
from .panel import CARD_URL, async_setup_panel
from .socle import async_remove_card
from .websocket import async_setup_websocket

PLATFORMS = [Platform.SENSOR, Platform.BINARY_SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass, config):
    # What Hestia Heating publishes for the other bricks: there from the start, empty until ready.
    hass.data.setdefault(API_KEY, HestiaHeatingApi(hass))
    async_setup_websocket(hass)
    await async_setup_panel(hass)
    return True


async def async_setup_entry(hass, entry):
    await async_setup_panel(hass)
    coordinator = HeatingCoordinator(hass, entry)
    await coordinator.async_prepare()
    entry.runtime_data = coordinator
    hass.data.setdefault(API_KEY, HestiaHeatingApi(hass)).attach(coordinator)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await coordinator.async_start()
    return True


async def async_unload_entry(hass, entry):
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded and getattr(entry, "runtime_data", None):
        api = hass.data.get(API_KEY)
        if api is not None:
            api.detach(entry.runtime_data)
        await entry.runtime_data.async_stop()
    return unloaded


async def async_remove_entry(hass, entry):
    """The home removed: the card's dashboard resource goes with it."""
    await async_remove_card(hass, CARD_URL)
