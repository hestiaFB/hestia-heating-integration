"""Bundled tab and Lovelace card: one installation, nothing to declare by hand.

The brick lives in the shared « Hestia-FB » panel (socle, see socle.py), as the « Chauffage » tab.
"""
import hashlib
from pathlib import Path

from aiohttp import web
from homeassistant.components.http import HomeAssistantView, StaticPathConfig

from .const import DOMAIN, VERSION
from .socle import async_register_brick, async_register_card

ASSETS = "/hestia_heating-assets"
CARD_FILE = "hestia-heating-card.js"
CARD_URL = f"{ASSETS}/{CARD_FILE}"
# The tab's menu (socle 1.20): [path, label, icon]. A room's page (pieces/<id>) opens from the home page.
MENU = [["", "Accueil", "home"], ["poele", "Poêle", "heating"], ["planning", "Planning", "review"],
        ["reglages", "Réglages", "settings"], ["extensions", "Extensions", "extensions"], ["a-propos", "À propos", "info"]]
MENU_NO_STOVE = [item for item in MENU if item[0] != "poele"]


class _LiveCardView(HomeAssistantView):
    """A beta's card at its usual address, always checked again by the browser: a beta is rebuilt often."""
    url = CARD_URL
    name = "hestia_heating:live_card"
    requires_auth = False

    async def get(self, request):
        return web.FileResponse(Path(__file__).parent / "frontend" / CARD_FILE, headers={"Cache-Control": "no-cache"})


def _fingerprint(path):
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()[:8]
    except OSError:
        return None


async def async_setup_panel(hass):
    if not hass.http or not hasattr(hass.http, "async_register_static_paths"):
        return  # Isolated tests and headless setups have no frontend.
    if not hass.data.get(DOMAIN + "_panel_asset"):
        beta = "b" in VERSION
        if beta:
            hass.http.register_view(_LiveCardView())
        await hass.http.async_register_static_paths([StaticPathConfig(ASSETS, str(Path(__file__).parent / "frontend"), not beta)])
        stamp = None if beta else await hass.async_add_executor_job(_fingerprint, Path(__file__).parent / "frontend" / CARD_FILE)
        await async_register_card(hass, CARD_URL, f"{VERSION}-{stamp}" if stamp else f"{VERSION}-dev" if beta else VERSION)
        hass.data[DOMAIN + "_panel_asset"] = True
    await async_register_brick(hass, {
        "domain": DOMAIN, "name": "Hestia Chauffage", "slug": "chauffage", "tab": "Chauffage", "version": VERSION,
        "icon": "mdi:radiator", "navigation": 3, "menu": MENU,
        "module_url": f"{ASSETS}/panel.js?v={VERSION}", "element": "hestia-heating-setup", "status": heating_status,
    }, f"{ASSETS}/hestia-socle.js?v={VERSION}")


async def heating_status(hass, lang=None):
    """What the Hestia-FB home page says about Hestia Heating, from its own state only."""
    from .socle import KEY as SOCLE_KEY
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        return {"level": "action", "summary": "Pas encore activée.", "details": [], "links": []}
    coordinator = getattr(entries[0], "runtime_data", None)
    data = coordinator.data if coordinator else {}
    brick = hass.data.get(SOCLE_KEY, {}).get("bricks", {}).get(DOMAIN)
    if brick is not None and coordinator is not None and data.get("pret"):
        brick["menu"] = MENU if data.get("poele") else MENU_NO_STOVE
    if not data.get("pret"):
        return {"level": "unknown", "summary": "Lecture des thermostats en cours.", "details": [], "links": []}
    house = data.get("maison") or {}
    if not house.get("pieces"):
        return {"level": "action", "summary": "Aucun thermostat trouvé.",
                "details": ["Hestia Chauffage lit Versatile Thermostat et les thermostats de Home Assistant."], "links": []}
    n, total = house.get("en_chauffe") or 0, house["pieces"]
    summary = f"{n} pièce{'s' if n > 1 else ''} en chauffe sur {total}." if n else f"{total} pièce{'s' if total > 1 else ''} suivie{'s' if total > 1 else ''}, rien ne chauffe."
    todo = data.get("a_regler") or []
    details = [house.get("titre")] if house.get("titre") and n else []
    details += [t["titre"] for t in todo[:2]]
    return {"level": "action" if todo else "ok", "summary": summary, "details": details, "links": []}
