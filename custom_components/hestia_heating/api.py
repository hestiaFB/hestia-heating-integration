"""What Hestia Heating publishes for the other bricks: `hass.data["hestia_heating_api"]`, version 1 (docs/technique.md).

One rule: within version 1, methods are added, never renamed or removed. Every method gives None (or an empty list)
when the data is missing: never an invented value. °C, W, %, aware datetimes in ISO text.
"""
from __future__ import annotations

from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

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

    def cout_chauffage(self, jour=None) -> dict | None:
        """What the heating cost on a day (added in 1.1.0b1, « un seul coût » : Hestia Énergie shows this figure as it
        is, counted once): today so far when `jour` is None, else that day (a date or « 2026-11-25 », the last thirty
        days). `jour`, `electrique_kwh` (the thermostats' counters), `electrique_eur` (at each hour's price of Hestia
        Énergie, else the price of Réglages), `granules_kg` and `granules_eur` (Hestia's count of the stove, at the
        price of its bags), `chauffage_eur` (both), `gagne_eur` (what the pellets saved against the same heat bought
        as electricity), `prix` (« energie », « reglages » or None). A part without a known price is None; None
        without the day. Since 1.1.0b7 (compatible addition): `gaz_kwh` and `gaz_eur`, the heating found in the gas
        Hestia Énergie counts, and `electrique_estime_kwh` and `electrique_estime_eur`, found in its electricity when
        Hestia does not measure the radiators; both against the cold (engine/energy_share.py), counted in
        `chauffage_eur`."""
        c = self.coordinator
        if c is None or not self._data:
            return None
        day = jour.isoformat() if hasattr(jour, "isoformat") else jour
        if day is None:
            today = c.house_journal.today_cost()
            day = (today or {}).get("jour") or dt_util.now().date().isoformat()
            return _with_energies(today, c.energy_share.day(day), day)
        return _with_energies(c.house_journal.day_cost(str(day)), c.energy_share.day(str(day)), str(day))


def _with_energies(base: dict | None, share: dict, day: str) -> dict | None:
    """1.1.0b7: the heating found in the gas and, for a house whose radiators Hestia does not measure, in the
    electricity (engine/energy_share.py), added to the day's cost. `gaz_kwh`, `gaz_eur`, `electrique_estime_kwh`,
    `electrique_estime_eur` (None when unknown); `chauffage_eur` counts them once. A house without any thermostat in
    Home Assistant gets its cost too. None when nothing at all is known of the day."""
    if base is None and share.get("gaz_kwh") is None and share.get("electrique_estime_kwh") is None:
        return None
    out = dict(base or {"jour": day, "electrique_kwh": None, "electrique_eur": None, "granules_kg": None,
                        "granules_eur": None, "chauffage_eur": None, "gagne_eur": None, "prix": None})
    out.update(share)
    extra = [v for v in (share.get("gaz_eur"), share.get("electrique_estime_eur")) if v is not None]
    if extra:
        out["chauffage_eur"] = round((out.get("chauffage_eur") or 0.0) + sum(extra), 2)
    return out
