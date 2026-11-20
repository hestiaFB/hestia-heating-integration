"""What Hestia Heating publishes for the other bricks: `hass.data["hestia_heating_api"]`, version 1 (docs/technique.md).

One rule: within version 1, methods are added, never renamed or removed. Every method gives None (or an empty list)
when the data is missing: never an invented value. °C, W, %, aware datetimes in ISO text.
"""
from __future__ import annotations

from .const import API_VERSION

SOURCE_KEYS = ("id", "nom", "type", "piece", "etat", "puissance_w", "demande_pct", "energie_stat", "granules_stat")


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
        energy (`energie_stat`) and its pellets (`granules_stat`)."""
        data = self._data
        out = [{k: s.get(k) for k in SOURCE_KEYS} for s in data.get("sources") or []]
        stove, pellets = data.get("poele"), data.get("granules")
        if stove and pellets and pellets.get("stat"):
            for s in out:
                if s["type"] == "poele":
                    s["granules_stat"] = pellets["stat"]
        return out

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
