"""Stable keys of Hestia Heating (« Hestia Chauffage »)."""
DOMAIN = "hestia_heating"
# The released number, written here and not read from manifest.json: no file is opened when Home Assistant imports the
# module. The panel and the card are cached by their version, so tests/test_version.py checks it follows the manifest.
VERSION = "1.1.0b3"
# What Hestia Heating publishes for the other bricks (docs/technique.md): hass.data[API_KEY], version API_VERSION.
API_KEY = "hestia_heating_api"
API_VERSION = 1
# The one config entry: the home.
HOME_UNIQUE_ID = "hestia_heating_home"
# The settings chosen in the « Chauffage » tab (sources switched off, the stove's thermostat…).
STORE_KEY = "hestia_heating.reglages"
STORE_VERSION = 1
# The last slot of the planning Hestia dealt with, per lane (a slot missed while Home Assistant was stopped is caught up).
PLANNING_STATE_KEY = "hestia_heating.planning_etat"
