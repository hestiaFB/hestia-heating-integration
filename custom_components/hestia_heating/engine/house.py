"""The whole house from what the reader found: the sources, the rooms, the stove, the planning, the sentence.

`build()` is the brick's one calculation. It is plain Python on a few dozen entities and runs in well under a
millisecond: the coordinator calls it again on every change of a thermostat, of the stove or of a schedule.
"""
from __future__ import annotations

import re
from dataclasses import replace
from datetime import datetime, timedelta

from . import driver, granules, home_planning, phrases, pilot, planning, sources, stove as stove_engine, stove_says
from .phrases import degrees, hour

# The tone of each room's chip in the panel and the card (the colours of the charte).
STOVE, HEAT, COLD, CALM, ACT, ALERT, OFF = "stove", "heat", "cold", "calm", "act", "alert", "off"
STOVE_LANE = "poele"


def _natural(text: str):
    return [int(t) if t.isdigit() else t.casefold() for t in re.split(r"(\d+)", text or "")]


def outside(hourly: list[dict] | None, now: datetime) -> dict | None:
    """The cold of the night ahead and tomorrow afternoon's warmth, from Hestia Weather's hourly forecast."""
    if not hourly:
        return None
    night_end = (now + timedelta(days=1 if now.hour >= 8 else 0)).replace(hour=8, minute=0, second=0, microsecond=0)
    tomorrow = (now + timedelta(days=1)).date()
    night, afternoon = [], []
    for h in hourly:
        try:
            at = datetime.fromisoformat(h["time"]).astimezone(now.tzinfo)
            t = float(h["temperature"])
        except (KeyError, TypeError, ValueError):
            continue
        if now <= at <= night_end and (at.hour >= 18 or at.hour < 9 or at.date() > now.date()):
            night.append(t)
        if at.date() == tomorrow and 12 <= at.hour <= 18:
            afternoon.append(t)
    if not night and not afternoon:
        return None
    return {"nuit_min": round(min(night), 1) if night else None,
            "demain_max": round(max(afternoon), 1) if afternoon else None}




def _lane_label(tone: str | None, stove_lane: bool) -> str | None:
    # Since 1.0.0b4, the stove's thermostat says its mode like any other (Boost, Confort, Éco, Hors gel): the stove's
    # own state is on its card. `stove_lane` is kept for the callers.
    if tone is None:
        return None
    return planning.LABELS[tone]


def _lane_tone(tone: str, stove_lane: bool) -> str:
    return tone


def build(snap: dict) -> dict:
    now: datetime = snap["now"]
    off = set(snap.get("disabled") or ())
    # 1. The sources, from every thermostat found and not switched off in Réglages.
    found = [sources.read(c) for c in snap.get("climates") or []]
    srcs = [s for s in found if s["id"] not in off]
    # What each one drives: guessed, unless chosen in Réglages › Thermostats (1.0.0b3).
    kinds = snap.get("types") or {}
    for s in srcs:
        s["type_devine"] = s["type"]
        if kinds.get(s["id"]) in sources.KINDS:
            s["type"] = kinds[s["id"]]
    raw_stove = snap.get("stove")
    stove_entities = set((raw_stove or {}).get("entities") or ())
    chosen = snap.get("stove_thermostat")
    stove_thermostat = None
    if raw_stove:
        stove_thermostat = next((s for s in srcs if s["id"] == chosen), None) if chosen else next(
            (s for s in srcs if sources.is_stove_thermostat(s, stove_entities)), None)
    if stove_thermostat:
        stove_thermostat["type"] = "poele"
        # The stove's thermostat draws no electricity: its « power » is the stove's heat, never counted as watts.
        stove_thermostat["puissance_w"] = None
        if raw_stove and not stove_thermostat.get("piece"):
            stove_thermostat["piece"] = (raw_stove.get("device") or {}).get("room")
    # 2. The stove.
    pellets = stove_engine.pellets(snap.get("pellets"))
    stove = None
    if raw_stove:
        stove = stove_engine.read(raw_stove["profile"], raw_stove.get("device") or {}, raw_stove.get("roles") or {},
                                  stove_thermostat, snap.get("plug"), pellets, raw_stove.get("ecritures_max"))
        if not stove["piece"] and stove_thermostat:
            stove["piece"] = stove_thermostat.get("piece")
    # The pellets, counted by Hestia from the stove's state (0.6): kilos, energy for Hestia Énergie, the fire pot.
    pellet_memory = None
    if stove:
        chosen_g = snap.get("granules_reglages") or {}
        bags = granules.bags_of(pellets, chosen_g.get("poids_sac"))
        pellet_memory = granules.advance(snap.get("granules_memoire"), stove, bags, now, raw_stove["profile"].rates,
                                         (pellets or {}).get("debut_saison"))
        price = chosen_g.get("prix_sac") or (pellets or {}).get("prix_sac")
        stove["conso"] = granules.view(pellet_memory, bags, chosen_g.get("brasier_kg"), price,
                                       chosen_g.get("poids_sac") or (pellets or {}).get("sac_kg") or granules.BAG_KG, now)
        stove["conso"]["prix_source"] = ("reglages" if chosen_g.get("prix_sac") else
                                         "suivi" if (pellets or {}).get("prix_sac") else None)
    burning = bool(stove and stove["en_feu"])
    if stove_thermostat:
        stove_thermostat["etat"] = ("chauffe" if burning else "arret" if stove_thermostat["mode"] == "off"
                                    else "inconnu" if stove and stove["etat"] == "inconnu" else "repos")
    # 3. The planning of each thermostat: its planning Hestia, unless a Scheduler schedule switched on still aims at it
    #    (Hestia then sends it nothing), else Scheduler's.
    for s in srcs:
        s["piece"] = s["piece"] or "thermostat_" + s["id"].split(".", 1)[1]
    model = snap.get("home_planning") or home_planning.default()
    plannings = model.get("plannings") or {}
    schedules: list[planning.Schedule] = list(snap.get("schedules") or [])
    workday = snap.get("workday")
    naive_now = now.replace(tzinfo=None)
    today = naive_now.date()
    in_plan = home_planning.of_thermostat(model)
    aimed_on = {t: sch.name for sch in schedules if sch.on for t in sch.targets}
    home_lines = {key: home_planning.timeline(p, today, 3) for key, p in plannings.items()}
    lines: dict[str, list] = {}
    line_source: dict[str, str] = {}
    for s in srcs:
        key = in_plan.get(s["id"])
        if key is not None and s["id"] not in aimed_on:
            lines[s["id"]], line_source[s["id"]] = home_lines[key], "Hestia"
        else:
            lines[s["id"]] = planning.timeline(schedules, s["id"], today, 2, workday, s["prereglages"])
            if lines[s["id"]]:
                line_source[s["id"]] = "Scheduler"
    # 4. The rooms.
    names = snap.get("room_names") or {}
    rooms: dict[str, dict] = {}
    for s in srcs:
        rooms.setdefault(s["piece"], {"id": s["piece"], "nom": names.get(s["piece"]) or s["nom"], "sources": []})["sources"].append(s)
    if stove and stove["piece"] and stove["piece"] not in rooms:
        rooms[stove["piece"]] = {"id": stove["piece"], "nom": names.get(stove["piece"]) or stove["nom"], "sources": []}
    window_since = snap.get("window_since") or {}
    room_list = []
    for room in rooms.values():
        room_list.append(_room(room, stove if stove and stove["piece"] == room["id"] else None, stove_thermostat, lines,
                               window_since, now))
    room_list.sort(key=lambda r: (not r["poele"], _natural(r["nom"])))
    copies = set(snap.get("copies") or ())
    for r in room_list:
        # A thermostat copied from another Home Assistant (a lab): the card's mode buttons stay greyed out, a press
        # would reach the other house.
        r["recopie"] = r["principal"] in copies
    # 5. The house.
    electric = [s for s in srcs if s["type"] in ("radiateur", "vanne", "pac", "autre") and s["etat"] == "chauffe"]
    cooling = [s for s in srcs if s["etat"] == "rafraichit"]
    heating_rooms = [r for r in room_list if r["etat"] == "chauffe"]
    temps = [r["temperature"] for r in room_list if r["temperature"] is not None]
    weather = outside(snap.get("hourly"), now)
    room_of = {i: r["nom"] for r in room_list for i in r["sources"]}
    upcoming = _upcoming(srcs, stove_thermostat, lines, naive_now, room_of, now.tzinfo)
    house = {
        "etat": "chauffe" if heating_rooms else "rafraichit" if cooling else
                "arret" if srcs and all(s["etat"] == "arret" for s in srcs) else "repos" if srcs else "inconnu",
        "titre": _title(stove, electric, cooling),
        "texte": _text(temps, weather, upcoming, now),
        "temperature": round(sum(temps) / len(temps), 1) if temps else None,
        "en_chauffe": len(heating_rooms),
        "pieces": len(room_list),
        "electrique_w": round(sum(s["puissance_w"] or 0 for s in electric)) if electric else 0,
        "en_marche": [s["id"] for s in srcs if s["etat"] in ("chauffe", "rafraichit")],
    }
    # The stove's pilot: « à l'ombre » (0.4) it only says what Hestia would do, next to what the house does; « flamme »
    # (0.5, switched on by the user) it also gives the flame's order to send; « entier » (0.7, switched on too) it also
    # starts and stops the stove and keeps its safeties (engine/driver.py).
    pilot_state = None
    copies = set(snap.get("copies") or ())
    if stove:
        mode = snap.get("pilote") if snap.get("pilote") in pilot.MODES else "ombre"
        stove["pilote"] = {"mode": mode}
        # Never a stove, nor a stove's thermostat, copied from another Home Assistant (a lab copies the home).
        copy = bool(raw_stove.get("copie")) or bool(stove_thermostat and stove_thermostat["id"] in copies)
        # The card's buttons (0.8): greyed out on a copy; the « flamme au plus bas » switch and the plug's switch,
        # each pressed by the user (Home Assistant's own dialog for the plug).
        stove["copie"] = copy
        boost_on = stove_thermostat and stove_thermostat.get("preset") not in ("frost", None)
        if mode == "entier" and (stove.get("boutons") or {}).get("eteindre") and boost_on:
            # « Par Hestia » (1.0.0b5): « Éteindre » puts the stove's thermostat in hors gel, and Hestia stops the
            # stove from there, with its checks; the thermostat and the stove stay of one mind. « Allumer » stays the
            # stove's own order: Hestia then puts the thermostat in boost (driver.drive).
            stove["boutons"] = {**stove["boutons"], "eteindre": {
                "service": "climate.set_preset_mode", "entity_id": stove_thermostat.get("entite") or stove_thermostat["id"],
                "donnees": {"preset_mode": "frost"}}}
        low_switch, plug_switch = snap.get("flamme_basse"), snap.get("prise_switch")
        stove["flamme_basse"] = {"entity_id": low_switch["entity_id"], "nom": low_switch["nom"],
                                 "on": low_switch["on"]} if low_switch else None
        stove["prise_switch"] = dict(plug_switch) if plug_switch else None
        # Who sets the front fan (Réglages, 1.0.0b3): « auto » the stove, « flamme » Hestia, « manuel » the user.
        stove["ventilation_choix"] = (snap.get("conduite") or {}).get("ventilation") or "auto"
        if mode in ("ombre", "flamme", "entier"):
            # The house's temperature: the sensor chosen in Réglages (the automations' own), else the rooms' average.
            sensor, low = snap.get("house_sensor"), snap.get("flamme_basse")
            house_c = sensor["c"] if sensor else house["temperature"]
            decision, memory, events = pilot.decide(stove, stove_thermostat, snap.get("pilote_memoire"), now, house_c,
                                                    low["nom"] if low and low["on"] else None, snap.get("trop_chaud"))
            stove["pilote"].update(decision)
            stove["pilote"].update(maison_c=house_c, thermometre=sensor["nom"] if sensor else None,
                                   thermometre_lu=sensor is None or sensor["c"] is not None,
                                   flamme_basse=low["nom"] if low else None)
            order, orders, wake = None, [], None
            # « La flamme : Manuel » with « Allumer et éteindre : par Hestia » (1.0.0b3): Hestia lights and stops the
            # stove, the flame stays the user's.
            manual = mode == "entier" and snap.get("flamme_manuelle") is True
            stove["pilote"]["flamme_manuelle"] = manual or mode == "ombre"
            if mode == "flamme" or (mode == "entier" and not manual):
                order, stove["pilote"]["commande"] = pilot.steer(decision, stove, memory, events, now, copy)
            fan = (snap.get("conduite") or {}).get("ventilation")
            if mode != "entier" and fan == "flamme" and snap.get("pret", True):
                # The fan by Hestia (flamme + 1), while the house lights and stops the stove.
                orders, fan_events, wake = driver.fan_only(stove, memory, now, copy)
                events = fan_events + events
            elif mode != "entier":
                memory.pop("ventilation_seule", None)
            if mode == "entier":
                orders, events, stove["pilote"]["conduite"], wake = _drive(snap, decision, stove, stove_thermostat,
                                                                           memory, events, now, copy)
            elif snap.get("simulateur"):
                # The simulator (1.0): « Entier » rehearsed, nothing sent.
                events, stove["pilote"]["simulation"], rehearse_wake = _rehearse(snap, decision, stove, stove_thermostat,
                                                                                 memory, events, now, copy)
                wake = rehearse_wake if wake is None else wake if rehearse_wake is None else min(wake, rehearse_wake)
            else:
                memory.pop("conduite_blanc", None)
            pilot_state = {"memoire": memory, "evenements": events, "ordre": order, "ordres": orders, "reveil": wake}
        # The stove's sentence (1.0), once its pilot has said what it does.
        stove["phrase"] = stove_says.sentence(stove, stove_thermostat, next((r for r in room_list if r.get("poele")), None),
                                              now)
        # Holding back by itself, its own probe at the temperature set in it (1.0.0b9): the Poêle tab says what to do.
        stove["bride"] = stove_says.bridled(stove)
    lanes = _lanes(room_list, srcs, stove_thermostat, lines, naive_now)
    room_names = {r["id"]: r["nom"] for r in room_list}
    plan = _home_planning(plannings, home_lines, srcs, stove_thermostat, room_names, aimed_on, schedules, copies,
                          snap.get("applied") or {}, naive_now, now.tzinfo, set(snap.get("autorises") or ()))
    for lane in lanes:
        ref = lane.pop("_ref")
        lane["source"] = line_source.get(ref)
        lane["bloque"] = ref in in_plan and ref in aimed_on
    used = set(line_source.values())
    essai = any(not plannings[in_plan[i]]["actif"] for i, origin in line_source.items() if origin == "Hestia")
    return {
        "maison": house,
        "pieces": [{k: v for k, v in r.items() if k != "_sources"} for r in room_list],
        "sources": [_public(s) for s in srcs],
        "poele": stove,
        "granules": pellets,
        "dehors": weather,
        "planning": {
            "source": " et ".join(n for n in ("Hestia", "Scheduler") if n in used) or ("Scheduler" if schedules else None),
            "labo": bool(srcs) and all(s["id"] in copies for s in srcs),
            "essai": essai,
            "jour": naive_now.date().isoformat(),
            "jour_nom": phrases.DAYS[naive_now.weekday()],
            "maintenant_min": naive_now.hour * 60 + naive_now.minute,
            "lignes": lanes,
            "prochains": upcoming[:6],
            "hestia": plan["hestia"],
            "thermostats": plan["thermostats"],
            "scheduler": plan["scheduler"],
            "journal": list(snap.get("journal") or [])[-12:],
            "_dus": plan["dus"],
            "_sans_repere": plan["sans_repere"],
        },
        "a_regler": _todo(found, srcs, stove, raw_stove, stove_thermostat, schedules) + plan["a_regler"],
        "_pilote": pilot_state,
        "_granules": pellet_memory,
    }


# What pilot.decide() says Hestia « would » do: in « entier » mode the driver's journal says what it does instead.
WOULD = ("Hestia démarrerait", "Hestia arrêterait", "Hestia couperait", "Hestia ne démarrerait pas",
         "Hestia demanderait", "Hestia vous préviendrait")


def _drive(snap, decision, stove, thermostat, memory, events, now, copy) -> tuple[list, list, dict, float | None]:
    """« Entier » mode: the gestures of the start, the stop and the safeties (engine/driver.py), once Home Assistant
    runs; the journal tells what Hestia does, and the stove's starts and stops it asked for are its own."""
    if not snap.get("pret", True):
        return [], events, {"actif": True, "copie": copy, "texte": "Hestia attend que Home Assistant ait fini de "
                            "démarrer."}, None
    ctx = {**(snap.get("conduite") or {}), "copie": copy, "brasier": (stove.get("conso") or {}).get("brasier")}
    orders, done, status, wake = driver.drive(decision, stove, thermostat, memory, now, ctx)
    sequences = memory.get("conduite") or {}

    def hestia_s(name: str, within: timedelta) -> bool:
        try:
            at = datetime.fromisoformat((sequences.get(name) or {}).get("a") or "")
        except (TypeError, ValueError):
            return False
        return now - at < within

    out = []
    for e in events:
        if e["qui"] == "hestia" and e["texte"].startswith(WOULD):
            continue
        if e["qui"] == "maison" and e["texte"] == "La maison a démarré le poêle." and hestia_s("allumage",
                                                                                            timedelta(minutes=15)):
            e = {"heure": e["heure"], "qui": "hestia", "accord": None,
                 "texte": "Le poêle s’allume, comme Hestia l’a demandé."}
        elif e["qui"] == "maison" and e["texte"] == "La maison a éteint le poêle." and hestia_s("arret",
                                                                                             timedelta(minutes=30)):
            e = {"heure": e["heure"], "qui": "hestia", "accord": None,
                 "texte": "Le poêle s’éteint, comme Hestia l’a demandé."}
        out.append(e)
    return orders, done + out, status, wake


def _rehearse(snap, decision, stove, thermostat, memory, events, now, copy) -> tuple[list, dict | None, float | None]:
    """The simulator of « Entier » (1.0), in « Conseil » and « Flamme »: the whole pilot's sequences « à blanc », from
    their own memory (`conduite_blanc`). Nothing is ever sent (driver.drive gives no gesture « à blanc »); its journal
    says what Hestia would do, in place of the pilot's own « would » lines, next to what the house does."""
    if not snap.get("pret", True):
        return events, None, None
    base = snap.get("conduite") or {}
    # The fan by Hestia is real outside « Entier » (driver.fan_only): the rehearsal leaves it alone.
    fan = "manuel" if base.get("ventilation") == "flamme" else base.get("ventilation")
    ctx = {"blanc": True, "copie": copy, "brasier": (stove.get("conso") or {}).get("brasier"),
           "ventilation": fan, "ha_depuis": base.get("ha_depuis")}
    shadow = {**memory, "conduite": memory.get("conduite_blanc")}
    _, said, status, wake = driver.drive(decision, stove, thermostat, shadow, now, ctx)
    memory["conduite_blanc"] = shadow["conduite"]
    if not status.get("pilotable") or not thermostat:
        return events, status, None
    return said + [e for e in events if not (e["qui"] == "hestia" and e["texte"].startswith(WOULD))], status, wake


def _public(s: dict) -> dict:
    """A source as the panel, the card and the other bricks see it (sources() of the interface)."""
    keys = ("id", "nom", "type", "piece", "etat", "mode", "preset", "temperature", "consigne", "demande_pct",
            "puissance_w", "fenetre", "delestage", "securite", "pente", "humidite", "integration", "entite",
            "energie_stat", "granules_stat", "vu", "type_devine")
    return {k: s.get(k) for k in keys}


def _room(room: dict, stove: dict | None, stove_thermostat: dict | None, lines: dict, window_since: dict,
          now: datetime) -> dict:
    srcs = room["sources"]
    stove_src = next((s for s in srcs if stove_thermostat is not None and s["id"] == stove_thermostat["id"]), None)
    others = [s for s in srcs if s is not stove_src]
    main = stove_src or next((s for s in srcs if s["temperature"] is not None), srcs[0] if srcs else None)
    temp = main["temperature"] if main else (stove or {}).get("air")
    target = main["consigne"] if main and main is stove_src else max(
        [s["consigne"] for s in srcs if s["consigne"] is not None and s["etat"] != "arret"], default=None)
    burning = bool(stove and stove["en_feu"])
    heating = [s for s in others if s["etat"] == "chauffe"]
    cooling = [s for s in srcs if s["etat"] == "rafraichit"]
    if burning or heating:
        state = "chauffe"
    elif cooling:
        state = "rafraichit"
    elif srcs and all(s["etat"] == "arret" for s in srcs):
        state = "arret"
    elif srcs and all(s["etat"] == "inconnu" for s in srcs):
        state = "inconnu"
    else:
        state = "repos"
    watts = sum(s["puissance_w"] or 0 for s in heating)
    window = any(s["fenetre"] for s in srcs)
    since = None
    if window:
        sensors = [s.get("fenetre_capteur") for s in srcs if s["fenetre"] and s.get("fenetre_capteur")]
        times = [window_since[e] for e in sensors if e in window_since]
        since = min(times) if times else None
    # What the planning says for the room: its main electric thermostat, else the stove's.
    ref = stove_src if stove_src is not None and lines.get(stove_src["id"]) else next(
        (s for s in others if lines.get(s["id"])), None) or stove_src
    line = lines.get(ref["id"]) if ref else None
    naive = now.replace(tzinfo=None)
    tone, nxt = planning.now_and_next(line, naive) if line else (None, None)
    stove_lane = ref is not None and ref is stove_src
    preset = (main or {}).get("preset")
    badge = _badge(srcs, state, burning, stove, watts, window, tone, preset)
    reason = _reason(srcs, stove_src, others, window, since, tone, nxt, stove_lane, main, now)
    return {
        "id": room["id"],
        "nom": room["nom"],
        "temperature": temp,
        "consigne": target,
        "etat": state,
        "poele": stove is not None,
        "sources": [s["id"] for s in srcs],
        "principal": main["id"] if main else None,
        "type": (main or {}).get("type"),
        "preset": preset,
        # The presets its main thermostat offers (the card's mode buttons), as the thermostat names them.
        "modes": list((main or {}).get("prereglages_dispo") or []),
        "demande_pct": (main or {}).get("demande_pct") if main is not stove_src else (
            heating[0]["demande_pct"] if heating else (main or {}).get("demande_pct")),
        "puissance_w": round(watts) if heating else 0,
        "pente": (main or {}).get("pente"),
        "humidite": (main or {}).get("humidite"),
        "fenetre": window,
        "fenetre_depuis": since.isoformat() if since else None,
        "delestage": any(s["delestage"] for s in srcs),
        "securite": any(s["securite"] for s in srcs),
        "badge": badge,
        "raison": reason,
        "planning": _lane_label(tone, stove_lane),
        "prochain": None if not nxt else {"a": nxt[0].replace(tzinfo=now.tzinfo).isoformat(),
                                          "texte": _lane_label(nxt[1], stove_lane), "ton": _lane_tone(nxt[1], stove_lane)},
        "appoint": next((s["consigne"] for s in others if stove_src and s["consigne"] is not None), None),
    }


# A room's mode in the house's list, with the colours of the room's card (its mode pill).
MODE_BADGES = {"frost": {"texte": "hors gel", "ton": OFF}, "eco": {"texte": "éco", "ton": COLD},
               "comfort": {"texte": "confort", "ton": HEAT}, "boost": {"texte": "boost", "ton": ACT},
               "away": {"texte": "absent", "ton": OFF}, "sleep": {"texte": "nuit", "ton": COLD},
               "home": {"texte": "présent", "ton": HEAT}, "activity": {"texte": "activité", "ton": ACT}}
PLANNING_BADGES = {planning.HORS_GEL: MODE_BADGES["frost"], planning.ECO: MODE_BADGES["eco"],
                   planning.CONFORT: MODE_BADGES["comfort"], planning.BOOST: MODE_BADGES["boost"],
                   planning.ARRET: {"texte": "arrêt", "ton": OFF}}


def _badge(srcs, state, burning, stove, watts, window, tone, preset) -> dict:
    if any(s["securite"] for s in srcs):
        return {"texte": "sécurité", "ton": ALERT}
    if window:
        return {"texte": "fenêtre ouverte", "ton": ACT}
    if any(s["delestage"] for s in srcs):
        return {"texte": "délestage", "ton": ALERT}
    if burning:
        flame = stove.get("flamme")
        return {"texte": f"poêle · flamme {flame}" if flame is not None else "poêle", "ton": STOVE}
    if stove and stove.get("etat") == "alarme":
        return {"texte": "poêle en alarme", "ton": ALERT}
    if state == "chauffe":
        return {"texte": f"chauffe · {phrases.power(watts)}" if watts else "chauffe", "ton": HEAT}
    if state == "rafraichit":
        return {"texte": "rafraîchit", "ton": COLD}
    if state == "arret":
        return {"texte": "arrêt", "ton": OFF}
    if state == "inconnu":
        return {"texte": "ne répond pas", "ton": OFF}
    if stove:
        return {"texte": "poêle", "ton": STOVE}
    # A room that does not heat says its mode, as its card does (1.0.0b8: « au repos » beside a card that says
    # « confort » read as a contradiction): the thermostat's own preset first, else the planning's.
    mode = MODE_BADGES.get(preset) if preset and preset != "none" else None
    return dict(mode or PLANNING_BADGES.get(tone) or {"texte": "au repos", "ton": CALM})


def _reason(srcs, stove_src, others, window, since, tone, nxt, stove_lane, main, now) -> str | None:
    """The room's line under its name: why it heats or not, and until when."""
    if window:
        lasted = phrases.minutes_since(since, now)
        return f"Chauffage en pause depuis {lasted}" if lasted else "Chauffage en pause"
    if any(s["securite"] for s in srcs):
        return "Le thermostat est en sécurité : sa sonde ne répond plus"
    if any(s["delestage"] for s in srcs):
        return "Coupé un moment pour ne pas dépasser la puissance du compteur"
    if stove_src is not None:
        backup = next((s["consigne"] for s in others if s["consigne"] is not None and s["etat"] != "arret"), None)
        parts = []
        if backup is not None:
            parts.append(f"Électrique en appoint seulement sous {degrees(backup)}")
        if nxt:
            parts.append(f"{phrases.when(nxt[0], now.replace(tzinfo=None))} {_lane_label(nxt[1], stove_lane)}")
        return " · ".join(parts) or None
    if tone and nxt:
        label = _lane_label(tone, stove_lane)
        then = _lane_label(nxt[1], stove_lane)
        naive = now.replace(tzinfo=None)
        if nxt[0].date() == naive.date():
            return f"{label.capitalize()} jusqu’à {hour(nxt[0])}, puis {then}"
        return f"{label.capitalize()}, {then} {phrases.when(nxt[0], naive)}"
    if main and main.get("preset"):
        label = sources.PRESETS.get(main["preset"], main["preset"]) or main["preset"]
        return f"{label.capitalize()}, consigne {degrees(main['consigne'])}" if main.get("consigne") is not None else label.capitalize()
    if main and main.get("consigne") is not None:
        return f"Consigne {degrees(main['consigne'])}"
    return None


def _title(stove: dict | None, electric: list, cooling: list) -> str:
    n = len(electric)
    radiators = phrases.count(n, "radiateur")
    m = len(cooling)
    cold = "" if not m else f"La clim rafraîchit {'une pièce' if m == 1 else f'{m} pièces'}."
    if stove and stove["etat"] in ("chauffe", "allumage", "nettoyage", "extinction", "alarme"):
        head = {"chauffe": "Le poêle chauffe" + (f", flamme {stove['flamme']}" if stove.get("flamme") else ""),
                "allumage": "Le poêle s’allume", "nettoyage": "Le poêle se nettoie",
                "extinction": "Le poêle s’éteint", "alarme": "Le poêle est en alarme"}[stove["etat"]] + "."
        if n:
            head += f" {radiators} en appoint." if stove["en_feu"] else f" {radiators} {phrases.plural(n, 'chauffe', 'chauffent')}."
    elif n:
        head = f"{radiators} {phrases.plural(n, 'chauffe', 'chauffent')}."
    elif m:
        return cold
    else:
        return "Rien ne chauffe en ce moment."
    return f"{head} {cold}".strip()


def _text(temps, weather, upcoming, now) -> str:
    parts = []
    if temps:
        parts.append(f"La maison est à {degrees(round(sum(temps) / len(temps), 1))}.")
    if weather and weather.get("nuit_min") is not None:
        parts.append(f"Cette nuit {degrees(weather['nuit_min'])} dehors.")
    if upcoming:
        first = upcoming[0]
        at = datetime.fromisoformat(first["a"])
        parts.append(f"Prochain changement {('à ' if at.date() == now.date() else '')}{phrases.when(at, now.replace(tzinfo=None))} : {first['texte']}.")
    return " ".join(parts)


def _in_sentence(name: str) -> str:
    """« Salon » → « salon » inside a sentence; « SdB » or « Chambre de Léa » keep their capitals where they matter."""
    return name[0].lower() + name[1:] if len(name) > 1 and name[0].isupper() and name[1].islower() else name


def _upcoming(srcs, stove_thermostat, lines, naive_now, room_of, tz) -> list[dict]:
    """The next changes of the planning, the same moment said once: « 22 h 30 : poêle et salon hors gel »."""
    by_time: dict[datetime, list[tuple[str, str]]] = {}
    for s in srcs:
        line = lines.get(s["id"])
        if not line:
            continue
        stove_lane = stove_thermostat is not None and s["id"] == stove_thermostat["id"]
        _, nxt = planning.now_and_next(line, naive_now)
        if nxt:
            who = "poêle" if stove_lane else _in_sentence(room_of.get(s["id"]) or s["nom"])
            by_time.setdefault(nxt[0], []).append((who, _lane_label(nxt[1], stove_lane)))
    out = []
    for at in sorted(by_time):
        whats: dict[str, list[str]] = {}
        for who, what in by_time[at]:
            whats.setdefault(what, []).append(who)
        text = " · ".join(f"{_join(sorted(set(w), key=lambda x: (x != 'poêle', _natural(x))))} {what}"
                          for what, w in whats.items())
        out.append({"a": at.replace(tzinfo=tz).isoformat(), "heure": phrases.when(at, naive_now), "texte": text})
    return out


def _join(names: list[str]) -> str:
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " et " + names[-1]


def _lanes(rooms, srcs, stove_thermostat, lines, naive_now) -> list[dict]:
    day = naive_now.date()
    out = []
    if stove_thermostat and lines.get(stove_thermostat["id"]):
        segs = planning.segments(lines[stove_thermostat["id"]], day)
        for seg in segs:
            seg["ton"] = _lane_tone(seg["ton"], True)
        out.append({"id": STOVE_LANE, "nom": "Poêle", "segments": segs, "_ref": stove_thermostat["id"]})
    by_id = {s["id"]: s for s in srcs}
    for room in rooms:
        ids = [i for i in room["sources"] if not (stove_thermostat and i == stove_thermostat["id"]) and lines.get(i)]
        if not ids:
            continue
        segs = planning.segments(lines[ids[0]], day)
        if segs:
            out.append({"id": room["id"], "nom": room["nom"], "segments": segs, "thermostat": by_id[ids[0]]["nom"],
                        "_ref": ids[0]})
    return out


def _todo(found, srcs, stove, raw_stove, stove_thermostat, schedules) -> list[dict]:
    """What the brick cannot read well and the household can fix: the panel's « À régler »."""
    out = []
    for s in srcs:
        if s["etat"] == "inconnu" and s["type"] != "poele":
            out.append({"titre": f"{s['nom']} ne répond pas", "texte": "Le thermostat est indisponible dans Home Assistant.",
                        "page": f"pieces/{s['id']}"})
    if stove and stove["a_traduire"] and stove["texte"]:
        out.append({"titre": f"Le poêle dit « {stove['texte']} »",
                    "texte": "Ce mot n’est pas encore dans son profil : il est montré tel quel. Signalez-le pour qu’il soit traduit.",
                    "page": "poele"})
    if raw_stove and stove_thermostat is None:
        out.append({"titre": "Le poêle n’a pas de thermostat",
                    "texte": "Choisissez le Versatile Thermostat qui le pilote : la demande du thermostat sera lue face à sa flamme.",
                    "page": "poele/conduite"})
    if any(s.partial for s in schedules):
        out.append({"titre": "Un planning n’est pas lu en entier",
                    "texte": "Un créneau commence au lever ou au coucher du soleil : Hestia ne le devine pas.",
                    "page": "planning"})
    return out


# --- The plannings Hestia (0.3) ------------------------------------------------------------------------------------

LEVEL_OF_TONE = {planning.CONFORT: "confort", planning.ECO: "eco", planning.HORS_GEL: "hors_gel",
                 planning.BOOST: "boost", planning.ARRET: "hors_gel"}
STOVE_WORDS = {"boost": "boost, poêle allumé", "hors_gel": "hors gel, poêle éteint"}


def _at(at: datetime, now: datetime) -> str:
    """« à 22 h 30 », « demain à 8 h », « samedi à 9 h »."""
    days = (at.date() - now.date()).days
    return f"à {hour(at)}" if days <= 0 else f"demain à {hour(at)}" if days == 1 else f"{phrases.DAYS[at.weekday()]} à {hour(at)}"


def _takeover(schedule: planning.Schedule, by_id: dict, today) -> dict | None:
    """A Scheduler schedule as a planning Hestia, to start from it (« Reprendre dans Hestia »): its week read as
    Hestia reads it, whether it is switched on or not."""
    targets = [t for t in schedule.targets if t in by_id]
    if not targets or not schedule.slots:
        return None
    monday = today - timedelta(days=today.weekday())
    line = planning.timeline([replace(schedule, on=True)], targets[0], monday - timedelta(days=7), 14, None,
                             by_id[targets[0]]["prereglages"])
    week = [[(seg["de"], seg["a"], LEVEL_OF_TONE.get(seg["ton"], "eco"))
             for seg in planning.segments(line, monday + timedelta(days=n))] for n in range(7)]
    if not any(week):
        return None
    return {"nom": schedule.name[:home_planning.MAX_NAME], "actif": False, **home_planning.from_segments(week),
            "thermostats": targets}


def _home_planning(plannings, home_lines, srcs, stove_thermostat, room_names, aimed_on, schedules, copies, applied,
                   naive_now, tz, allowed: set[str]) -> dict:
    """The plannings Hestia, the thermostats they may tick, Scheduler's, and the changes due. `allowed`: the thermostats
    ticked in Réglages, « Ce que Hestia peut régler » (none at first): an « Actif » planning sends only to them."""
    by_id = {s["id"]: s for s in srcs}
    stove_id = stove_thermostat["id"] if stove_thermostat else None
    in_plan = {t: key for key, p in plannings.items() for t in p["thermostats"]}
    aimed: dict[str, list[str]] = {}
    for sch in schedules:
        for t in sch.targets:
            aimed.setdefault(t, []).append(sch.name)
    # Every thermostat read, for the editor's ticks: the stove's first, then by room.
    thermostats = []
    for s in sorted(srcs, key=lambda x: (x["id"] != stove_id, _natural(room_names.get(x["piece"], x["piece"])), _natural(x["nom"]))):
        cools = s["type"] == "clim"
        thermostats.append({
            "id": s["id"], "nom": s["nom"], "piece": room_names.get(s["piece"]), "poele": s["id"] == stove_id,
            "vt": s["vt"], "froid": cools, "recopie": s["id"] in copies, "autorise": s["id"] in allowed,
            "planning": in_plan.get(s["id"]),
            "scheduler": aimed.get(s["id"], []), "scheduler_actif": aimed_on.get(s["id"]),
            "niveaux": [lv for lv in home_planning.LEVELS if not s["vt"] or home_planning.PRESET[lv] in (s["prereglages_dispo"] or ())],
            "consignes": None if s["vt"] else dict(home_planning.COOL_TEMPERATURES if cools else home_planning.HEAT_TEMPERATURES),
        })
    out, dus, waiting, todo = [], {}, [], []
    for key, p in plannings.items():
        line = home_lines[key]
        current, nxt = planning.now_and_next(line, naive_now)
        stove = stove_id in p["thermostats"]
        words = STOVE_WORDS if stove else {}
        out.append({
            "id": key, "nom": p["nom"], "actif": p["actif"], "poele": stove,
            "thermostats": [{"id": t, "nom": by_id[t]["nom"] if t in by_id else t, "lu": t in by_id} for t in p["thermostats"]],
            "maintenant": words.get(current) or home_planning.WORDS.get(current),
            "prochain": {"a": nxt[0].replace(tzinfo=tz).isoformat(),
                         "texte": f"{home_planning.WORDS[nxt[1]].capitalize()} {_at(nxt[0], naive_now)}"} if nxt else None,
            "allumages": home_planning.starts_per_week(p) if stove else None,
            "bloques": [{"id": t, "nom": by_id[t]["nom"], "scheduler": aimed_on[t]} for t in p["thermostats"]
                        if t in by_id and t in aimed_on],
            "recopie": bool(p["thermostats"]) and all(t in copies for t in p["thermostats"] if t in by_id),
            "verrouilles": [{"id": t, "nom": by_id[t]["nom"]} for t in p["thermostats"]
                            if t in by_id and t not in allowed and t not in copies],
        })
        for t in p["thermostats"]:
            s = by_id.get(t)
            if s is None:
                continue                      # not read: switched off in Réglages, or gone from Home Assistant
            if p["actif"] and t in aimed_on:
                todo.append({"titre": f"{s['nom']} suit deux plannings",
                             "texte": f"Il est dans « {p['nom']} », mais « {aimed_on[t]} » est encore allumé dans "
                                      f"Scheduler : Hestia ne le règle pas tant qu’il l’est. Coupez « {aimed_on[t]} » "
                                      "dans Scheduler, ou retirez ce thermostat du planning.",
                             "page": f"planning/{key}"})
            elif p["actif"] and t not in allowed and t not in copies:
                todo.append({"titre": f"Hestia n’a pas le droit de régler {s['nom']}",
                             "texte": f"Il est dans « {p['nom']} », qui est actif, mais « Hestia change son mode » est "
                                      "coupé sur la page de sa pièce : Hestia ne lui envoie rien. Allumez-le, ou remettez "
                                      "le planning en pause.",
                             "page": f"pieces/{t}"})
            try:
                last = datetime.fromisoformat((applied.get(t) or {}).get("a") or "")
            except ValueError:
                waiting.append(t)
                continue
            slot = home_planning.due(line, naive_now, last)
            if not slot:
                continue
            temps = home_planning.COOL_TEMPERATURES if s["type"] == "clim" else home_planning.HEAT_TEMPERATURES
            order = dus.setdefault((key, slot[0]), {"planning": key, "nom": p["nom"], "actif": p["actif"],
                                                    "a": slot[0].isoformat(), "niveau": slot[1], "cibles": []})
            order["cibles"].append({"id": t, "nom": s["nom"], "vt": s["vt"], "preset": home_planning.PRESET[slot[1]],
                                    "consigne": temps[slot[1]], "bloque": aimed_on.get(t), "recopie": t in copies,
                                    "autorise": t in allowed})
    today = naive_now.date()
    scheduler = [{"id": sch.id, "nom": sch.name, "actif": sch.on, "jours": list(sch.days), "partiel": sch.partial,
                  "cibles": [by_id[t]["nom"] if t in by_id else t for t in sch.targets],
                  "reprise": _takeover(sch, by_id, today)} for sch in schedules]
    return {"hestia": out, "thermostats": thermostats, "scheduler": scheduler, "dus": list(dus.values()),
            "sans_repere": waiting, "a_regler": todo}
