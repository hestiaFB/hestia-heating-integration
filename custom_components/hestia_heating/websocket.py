"""The websocket commands of the tab and the card. Read only and quick: everything is in the coordinator already
(socle rule: under 0.25 s a command); the day's curves come from the recorder's executor, kept two minutes."""
from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import callback

from .const import DOMAIN

VIEW_VERSION = 1
# What the cards read: the extensions, the schedules' details and the « à régler » stay out of their view.
CARD_KEYS = ("pret", "version", "maison", "pieces", "poele", "granules", "dehors", "planning", "prix_kwh")
SETTING_KEYS = ("sources", "extensions", "poele_thermostat", "poele_prise", "weather_place", "planning", "pilote",
                "pilote_thermometre", "planning_autorises", "pilote_flamme_basse", "brasier_kg", "granules_prix_sac",
                "granules_poids_sac", "pilote_notifier", "poele_prise_switch", "couper_prise", "prix_kwh")
# The notify services that are not a phone or a group of phones.
NOT_PHONES = ("send_message", "persistent_notification")
# The planning's parts only the tab needs (the plannings, the editor, Scheduler, the journal).
PLANNING_TAB_ONLY = ("hestia", "thermostats", "scheduler", "journal")


def _coordinator(hass):
    entry = next((e for e in hass.config_entries.async_entries(DOMAIN) if getattr(e, "runtime_data", None)), None)
    return entry.runtime_data if entry else None


def async_setup_websocket(hass) -> None:
    for command in (ws_view, ws_subscribe, ws_day, ws_history, ws_settings, ws_set_settings, ws_fire_pot_cleaned,
                    ws_answer, ws_auto):
        websocket_api.async_register_command(hass, command)


def card_view(data: dict) -> dict:
    view = {k: data[k] for k in CARD_KEYS if k in data}
    if view.get("planning"):
        view["planning"] = {k: v for k, v in view["planning"].items() if k not in PLANNING_TAB_ONLY}
    if (view.get("poele") or {}).get("pilote"):
        # The pilot's journal is the tab's: the cards say only what Hestia would do now.
        view["poele"] = {**view["poele"], "pilote": {k: v for k, v in view["poele"]["pilote"].items()
                                                     if k not in ("journal", "accord_semaine")}}
    return view


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/view"})
@callback
def ws_view(hass, connection, msg):
    """Everything the tab shows."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    connection.send_result(msg["id"], {"version": VIEW_VERSION, **c.data, "calcul_ms": c.last_build_ms})


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    """The cards' view, shared by every card of a dashboard (card/src/stream.ts): whole once, then only its parts that
    changed. When the brick stops (reloaded), `reload`: the cards follow the new one a moment later."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    sent: dict = {}

    @callback
    def send() -> None:
        view = card_view(c.data)
        before = sent.get("view")
        if before is not None:
            changed = {k: v for k, v in view.items() if before.get(k) != v}
            removed = [k for k in before if k not in view]
            if not changed and not removed:
                return
            sent["view"] = view
            connection.send_message(websocket_api.event_message(msg["id"], {"version": VIEW_VERSION, "changes": changed,
                                                                            "removed": removed}))
        else:
            sent["view"] = view
            connection.send_message(websocket_api.event_message(msg["id"], {"version": VIEW_VERSION, "view": view}))

    @callback
    def stopped() -> None:
        connection.send_message(websocket_api.event_message(msg["id"], {"version": VIEW_VERSION, "reload": True}))

    remove_view, remove_stop = c.add_listener(send), c.add_stop_listener(stopped)

    @callback
    def unsubscribe() -> None:
        remove_view()
        remove_stop()

    connection.subscriptions[msg["id"]] = unsubscribe
    connection.send_result(msg["id"])
    send()


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/day", vol.Required("cible"): str,
                                  vol.Optional("heures"): vol.All(int, vol.Range(min=1, max=24))})
@websocket_api.async_response
async def ws_day(hass, connection, msg):
    """Today's curves of a room (`piece/<id>`) or of the stove (`poele`); with `heures`, the last hours (the cards'
    clock, 0.8)."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    connection.send_result(msg["id"], await c.async_day(msg["cible"], msg.get("heures")))


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/historique", vol.Required("cible"): str})
@websocket_api.async_response
async def ws_history(hass, connection, msg):
    """The last 14 days' totals of a room (`piece/<id>`, kWh) or of the stove (`poele`, kilos of pellets), for the
    cards' drawers (0.8)."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    connection.send_result(msg["id"], await c.async_history(msg["cible"]))


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/settings"})
@callback
def ws_settings(hass, connection, msg):
    """The settings and what they can be set to: the thermostats that could drive the stove, the power sensors that
    could be its plug, Hestia Weather's places."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    found = c.found
    thermostats = [{"id": s["id"], "nom": s["nom"], "piece": s["piece"]} for s in c.data.get("sources") or []]
    disabled = [{"id": k, "nom": (c.hass.states.get(k).attributes.get("friendly_name") if c.hass.states.get(k) else k)}
                for k, v in (c.settings.get("sources") or {}).items() if v is False]
    connection.send_result(msg["id"], {
        "reglages": {**{k: c.settings.get(k) for k in SETTING_KEYS}, "planning": c.model},
        "trouve": {
            "thermostats": thermostats,
            "coupes": disabled,
            "poele": bool(found.stove),
            "poele_thermostat": (c.data.get("poele") or {}).get("thermostat"),
            "prises": [{"id": p["entity_id"], "nom": p["nom"], "poele": p["poele"]} for p in found.plugs],
            "prise": found.plug,
            "thermometres": [{"id": t["entity_id"], "nom": t["nom"], "maison": t["maison"]} for t in found.thermometers],
            "interrupteurs": [{"id": t["entity_id"], "nom": t["nom"]} for t in found.switches],
            "notifieurs": sorted(f"notify.{name}" for name in c.hass.services.async_services().get("notify", {})
                                 if name not in NOT_PHONES),
            "coupures": [{"id": s["entity_id"], "nom": s["nom"], "poele": s["poele"]} for s in found.plug_switches],
            "coupure": found.plug_switch,
            "pilotable": bool((c.data.get("poele") or {}).get("pilotable")),
            "poele_copie": bool((found.stove or {}).get("copie")),
            "meteo": {k: c.weather.get(k) for k in ("etat", "lieu", "nom", "lieux")},
        },
    })


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/set_settings", vol.Required("reglages"): dict})
@websocket_api.async_response
async def ws_set_settings(hass, connection, msg):
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    changes = {k: v for k, v in msg["reglages"].items() if k in SETTING_KEYS}
    try:
        await c.async_set_settings(changes)
    except ValueError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/brasier_nettoye"})
@websocket_api.async_response
async def ws_fire_pot_cleaned(hass, connection, msg):
    """« J'ai nettoyé » : the fire pot's count starts again. Writes nothing to the stove."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    if not c.data.get("poele"):
        connection.send_error(msg["id"], "no_stove", "Pas de poêle trouvé.")
        return
    await c.async_fire_pot_cleaned()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/gestion_auto", vol.Required("actif"): bool})
@websocket_api.async_response
async def ws_auto(hass, connection, msg):
    """The stove card's « Gestion auto » (0.8): on, the pilot acts again in the mode it had; off, it only looks."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    if not c.data.get("poele"):
        connection.send_error(msg["id"], "no_stove", "Pas de poêle trouvé.")
        return
    if msg["actif"] and c.data["poele"].get("copie"):
        connection.send_error(msg["id"], "copie", "Poêle recopié d'une autre maison : la gestion auto reste coupée.")
        return
    connection.send_result(msg["id"], {"pilote": await c.async_auto(msg["actif"])})


@websocket_api.websocket_command({vol.Required("type"): "hestia_heating/repondre", vol.Required("reponse"): str})
@websocket_api.async_response
async def ws_answer(hass, connection, msg):
    """An answer to the whole pilot from the Poêle page (Oui, Non, Couper la prise, Ignorer, J'ai nettoyé), as on the
    phone."""
    c = _coordinator(hass)
    if c is None:
        connection.send_error(msg["id"], "not_ready", "Hestia Chauffage n'est pas activée.")
        return
    try:
        await c.async_answer(msg["reponse"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"], {"ok": True})
