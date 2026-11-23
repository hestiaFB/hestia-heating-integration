"""What Hestia Heating publishes for the other bricks: `hass.data["hestia_heating_api"]`, version 1 (docs/technique.md).

One rule: within version 1, methods are added, never renamed or removed. Every method gives None (or an empty list)
when the data is missing: never an invented value. °C, W, %, aware datetimes in ISO text.
"""
from __future__ import annotations

from homeassistant.helpers import entity_registry as er

from .const import API_VERSION, DOMAIN

SOURCE_KEYS = ("id", "nom", "type", "piece", "etat", "puissance_w", "demande_pct", "energie_stat", "granules_stat")
# The pellets counted by Hestia, as poele()["conso"] gives them (0.6).
CONSO_KEYS = ("debit_kg_h", "kg_jour", "kg_saison", "saison", "total_kg", "energie_kwh", "kwh_jour", "prix_kg",
              "prix_kwh", "cout_jour")


class HestiaHeatingApi:
    version = API_VERSION

    def __init__(self, hass) -> None:
        self.hass = hass
        self.coordinator = None
        self.readers: dict[str, int] = {}
        self._listeners: list = []

    def attach(self, coordinator) -> None:
        self.coordinator = coordinator
        coordinator.add_listener(self._changed)

    def detach(self, coordinator) -> None:
        """The home unloaded: the other bricks get nothing rather than the figures of a brick that no longer runs."""
        if self.coordinator is coordinator:
            self.coordinator = None
            self._changed()

    def _changed(self) -> None:
        for update in list(self._listeners):
            update()

    def add_listener(self, update, brick: str | None = None):
        """Called when what this interface gives changes; `brick` names the reader (« hestia_energy »), shown linked
        on both sides."""
        self._listeners.append(update)
        if brick:
            self.readers[brick] = self.readers.get(brick, 0) + 1

        def remove():
            if update in self._listeners:
                self._listeners.remove(update)
            if brick and self.readers.get(brick):
                self.readers[brick] -= 1
        return remove

    @property
    def _data(self) -> dict:
        data = self.coordinator.data if self.coordinator else {}
        return data if data.get("pret") else {}

    # --- the methods of version 1 -------------------------------------------------------------------------------

    def sources(self) -> list[dict]:
        """Each source of heat or cold: `id` (stable: the thermostat's entity), `nom`, `type` (radiateur, poele, clim,
        pac, vanne, autre), `piece` (the Home Assistant area), `etat` (chauffe, rafraichit, repos, arret, inconnu),
        `puissance_w` (electricity drawn now, None for the stove), `demande_pct`, and the statistics known for its
        energy (`energie_stat`) and its pellets (`granules_stat`). For the stove, since 0.6, both are Hestia's own
        counts (the pellets burnt and their useful energy, sensor.hestia_heating_poele_*), never the stove thermostat's
        energy counter (it counts the time of a switch that drives nothing): None without Hestia's sensor; for the
        pellets, Suivi Stock Pellet's statistic then."""
        data = self._data
        out = [{k: s.get(k) for k in SOURCE_KEYS} for s in data.get("sources") or []]
        stove, pellets = data.get("poele"), data.get("granules")
        if stove:
            energy, burnt = self._own("sensor", "poele_energie"), self._own("sensor", "poele_granules_brules")
            for s in out:
                if s["type"] == "poele":
                    s["energie_stat"] = energy
                    s["granules_stat"] = burnt or (pellets or {}).get("stat") or s["granules_stat"]
        return out

    def _own(self, platform: str, key: str) -> str | None:
        """The entity id of one of this brick's entities (renamed or not), None when it does not exist."""
        c = self.coordinator
        if c is None:
            return None
        return er.async_get(self.hass).async_get_entity_id(platform, DOMAIN, f"{c.entry.entry_id}_{key}")

    def poele(self) -> dict | None:
        """The pellet stove, None without one (added in 0.2): `nom`, `etat`, `en_feu`, `flamme`, `thermostat` (the id of
        its source), `energie_stat` (since 0.6 Hestia's count of the stove's useful energy, the one to declare in the
        Energy page; before, its thermostat's energy counter), `granules` (Suivi Stock Pellet: `stock_kg`, `jours`,
        `kg_par_jour`, `saison_kg`, `stat`, the statistic of the kilos burnt), None without it, and `conso` (0.6, the
        pellets counted by Hestia: `debit_kg_h`, `kg_jour`, `kg_saison`, `saison`, `total_kg`, `energie_kwh`,
        `kwh_jour`, `prix_kg`, `prix_kwh`, `cout_jour`, and `brasier`: `kg` since the last cleaning, `seuil_kg`,
        `a_nettoyer`)."""
        data = self._data
        stove = data.get("poele")
        if not stove:
            return None
        pellets = data.get("granules")
        conso = stove.get("conso")
        fire_pot = (conso or {}).get("brasier") or {}
        return {"nom": stove.get("nom"), "etat": stove.get("etat"), "en_feu": stove.get("en_feu"),
                "flamme": stove.get("flamme"), "thermostat": stove.get("thermostat"),
                "energie_stat": self._own("sensor", "poele_energie"),
                "granules": None if not pellets else {k: pellets.get(k) for k in
                                                      ("stock_kg", "jours", "kg_par_jour", "saison_kg", "stat")},
                "conso": None if not conso else {**{k: conso.get(k) for k in CONSO_KEYS}, "brasier": {
                    k: fire_pot.get(k) for k in ("kg", "seuil_kg", "a_nettoyer")}}}

    def maison(self) -> dict | None:
        """The house in one sentence and its figures: `etat`, `titre`, `texte`, `temperature`, `en_chauffe`, `pieces`,
        `electrique_w`, and the stove's state (`poele`: etat, flamme) when there is one."""
        data = self._data
        if not data:
            return None
        house = dict(data.get("maison") or {})
        stove = data.get("poele")
        house["poele"] = None if not stove else {"etat": stove["etat"], "flamme": stove.get("flamme")}
        return house
