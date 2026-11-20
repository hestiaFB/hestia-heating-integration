"""The whole house from what the reader found: the sources, the rooms, the stove, the planning, the sentence.

`build()` is the brick's one calculation. It is plain Python on a few dozen entities and runs in well under a
millisecond: the coordinator calls it again on every change of a thermostat, of the stove or of a schedule.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta

from . import home_planning, phrases, pilot, planning, sources, stove as stove_engine
from .phrases import degrees, hour, number

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


WARM = (planning.CONFORT, planning.ECO, planning.BOOST)


def _lane_label(tone: str | None, stove_lane: bool) -> str | None:
    if tone is None:
        return None
    if stove_lane:
        return "en chauffe" if tone in WARM else planning.LABELS[tone]
    return planning.LABELS[tone]


def _lane_tone(tone: str, stove_lane: bool) -> str:
    return planning.POELE if stove_lane and tone in WARM else tone


def build(snap: dict) -> dict:
    now: datetime = snap["now"]
    off = set(snap.get("disabled") or ())
    # 1. The sources, from every thermostat found and not switched off in Réglages.
    found = [sources.read(c) for c in snap.get("climates") or []]
    srcs = [s for s in found if s["id"] not in off]
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
                                  stove_thermostat, snap.get("plug"), pellets)
        if not stove["piece"] and stove_thermostat:
            stove["piece"] = stove_thermostat.get("piece")
    burning = bool(stove and stove["en_feu"])
    if stove_thermostat:
        stove_thermostat["etat"] = ("chauffe" if burning else "arret" if stove_thermostat["mode"] == "off"
                                    else "inconnu" if stove and stove["etat"] == "inconnu" else "repos")
    # The stove's pilot, « à l'ombre » (0.4): what Hestia would do, next to what the house does. It sends nothing.
    pilot_state = None
    if stove:
        mode = snap.get("pilote") if snap.get("pilote") in pilot.MODES else "ombre"
        stove["pilote"] = {"mode": mode}
        if mode == "ombre":
            decision, memory, events = pilot.decide(stove, stove_thermostat, snap.get("pilote_memoire"), now)
            stove["pilote"].update(decision)
            pilot_state = {"memoire": memory, "evenements": events}
    # 3. The planning of each lane (the stove, each room): the house's own where Hestia sets it, else Scheduler's.
    for s in srcs:
        s["piece"] = s["piece"] or "thermostat_" + s["id"].split(".", 1)[1]
    model = snap.get("home_planning") or home_planning.default()
    schedules: list[planning.Schedule] = list(snap.get("schedules") or [])
    workday = snap.get("workday")
    naive_now = now.replace(tzinfo=None)
    today = naive_now.date()
    lane_of = {s["id"]: home_planning.STOVE if stove_thermostat is not None and s["id"] == stove_thermostat["id"]
               else s["piece"] for s in srcs}
    lane_ids: dict[str, list[str]] = {}
    for s in srcs:
        lane_ids.setdefault(lane_of[s["id"]], []).append(s["id"])
    aimed = {t: sch.name for sch in schedules for t in sch.targets}
    aimed_on = {t: sch.name for sch in schedules if sch.on for t in sch.targets}
    owners = {lane: home_planning.owner(model, lane, any(i in aimed for i in ids)) for lane, ids in lane_ids.items()}
    home_lines = {lane: home_planning.timeline(model, lane, today, 3, workday, snap.get("hourly"), now.tzinfo)
                  for lane in lane_ids if owners[lane] == home_planning.HESTIA}
    lines: dict[str, list] = {}
    for s in srcs:
        lane = lane_of[s["id"]]
        if owners[lane] == home_planning.HESTIA:
            lines[s["id"]] = home_lines[lane]
        elif owners[lane] == home_planning.EXTENSION:
            lines[s["id"]] = planning.timeline(schedules, s["id"], today, 2, workday, s["prereglages"])
        else:
            lines[s["id"]] = []
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
    lanes = _lanes(room_list, srcs, stove_thermostat, lines, naive_now)
    lane_names = {r["id"]: r["nom"] for r in room_list} | {home_planning.STOVE: "Poêle"}
    copies = set(snap.get("copies") or ())
    plan = _home_planning(model, srcs, lane_ids, lane_names, owners, aimed, aimed_on, home_lines, schedules, copies,
                          snap, naive_now, workday)
    for lane in lanes:
        key = home_planning.STOVE if lane["id"] == STOVE_LANE else lane["id"]
        lane["source"] = {home_planning.HESTIA: "Hestia", home_planning.EXTENSION: "Scheduler"}.get(owners.get(key))
        lane["bloque"] = bool(owners.get(key) == home_planning.HESTIA and any(i in aimed_on for i in lane_ids.get(key, [])))
    tips = _tips(plan["ordres_avances"], house, snap.get("tarif"), lane_names, naive_now)
    used = {owners[lane] for lane in owners if lines.get(lane_ids[lane][0])}
    return {
        "maison": house,
        "pieces": [{k: v for k, v in r.items() if k != "_sources"} for r in room_list],
        "sources": [_public(s) for s in srcs],
        "poele": stove,
        "granules": pellets,
        "dehors": weather,
        "planning": {
            "source": " et ".join(n for o, n in ((home_planning.HESTIA, "Hestia"), (home_planning.EXTENSION, "Scheduler"))
                                  if o in used) or ("Scheduler" if schedules else None),
            "commande": model.get("commande", False),
            "labo": bool(srcs) and all(s["id"] in copies for s in srcs),
            "jour_type": plan["jour_type"],
            "jours": plan["jours"],
            "journees": plan["journees"],
            "pieces": plan["pieces"],
            "ordres": plan["ordres"],
            "journal": list(snap.get("journal") or [])[-12:],
            "conseils": tips,
            "_dus": plan["dus"],
            "_sans_repere": plan["sans_repere"],
            "jour": naive_now.date().isoformat(),
            "jour_nom": phrases.DAYS[naive_now.weekday()],
            "maintenant_min": naive_now.hour * 60 + naive_now.minute,
            "lignes": lanes,
            "prochains": upcoming[:6],
            "plannings": [{"id": s.id, "nom": s.name, "actif": s.on, "jours": list(s.days), "partiel": s.partial,
                           "cibles": list(s.targets)} for s in schedules],
        },
        "a_regler": _todo(found, srcs, stove, raw_stove, stove_thermostat, schedules) + plan["a_regler"],
        "_pilote": pilot_state,
    }


def _public(s: dict) -> dict:
    """A source as the panel, the card and the other bricks see it (sources() of the interface)."""
    keys = ("id", "nom", "type", "piece", "etat", "mode", "preset", "temperature", "consigne", "demande_pct",
            "puissance_w", "fenetre", "delestage", "securite", "pente", "humidite", "integration", "entite",
            "energie_stat", "granules_stat")
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
    if tone == planning.HORS_GEL or preset == "frost":
        return {"texte": "hors gel", "ton": OFF}
    if tone == planning.ECO or preset == "eco":
        return {"texte": "éco", "ton": COLD}
    return {"texte": "au repos", "ton": CALM}


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
        out.append({"id": STOVE_LANE, "nom": "Poêle", "segments": segs})
    by_id = {s["id"]: s for s in srcs}
    for room in rooms:
        ids = [i for i in room["sources"] if not (stove_thermostat and i == stove_thermostat["id"]) and lines.get(i)]
        if not ids:
            continue
        segs = planning.segments(lines[ids[0]], day)
        if segs:
            out.append({"id": room["id"], "nom": room["nom"], "segments": segs, "thermostat": by_id[ids[0]]["nom"]})
    return out


def _todo(found, srcs, stove, raw_stove, stove_thermostat, schedules) -> list[dict]:
    """What the brick cannot read well and the household can fix: the panel's « À régler »."""
    out = []
    for s in srcs:
        if s["etat"] == "inconnu" and s["type"] != "poele":
            out.append({"titre": f"{s['nom']} ne répond pas", "texte": "Le thermostat est indisponible dans Home Assistant.",
                        "page": "pieces/" + (s["piece"] or "")})
    if stove and stove["a_traduire"] and stove["texte"]:
        out.append({"titre": f"Le poêle dit « {stove['texte']} »",
                    "texte": "Ce mot n’est pas encore dans son profil : il est montré tel quel. Signalez-le pour qu’il soit traduit.",
                    "page": "poele"})
    if raw_stove and stove_thermostat is None:
        out.append({"titre": "Le poêle n’a pas de thermostat",
                    "texte": "Choisissez le Versatile Thermostat qui le pilote : la demande du thermostat sera lue face à sa flamme.",
                    "page": "reglages"})
    if any(s.partial for s in schedules):
        out.append({"titre": "Un planning n’est pas lu en entier",
                    "texte": "Un créneau commence au lever ou au coucher du soleil : Hestia ne le devine pas.",
                    "page": "planning"})
    return out


# --- The house's own planning (0.3) ---------------------------------------------------------------------------------

LEVEL_OF_TONE = {planning.CONFORT: "confort", planning.ECO: "eco", planning.HORS_GEL: "hors_gel",
                 planning.BOOST: "boost", planning.ARRET: "hors_gel"}
# What became of a slot of the planning Hestia: sent, or why not.
SHADOW, BLOCKED, COPY, PLANNED = "ombre", "bloque", "recopie", "prevu"


def _scheduler_slots(schedules, thermostat: dict, day) -> list[list[str]]:
    """A Scheduler day of one thermostat as the planning Hestia writes it, to start from it (« Reprendre »)."""
    line = planning.timeline(schedules, thermostat["id"], day, 1, None, thermostat["prereglages"])
    return [[f"{at.hour:02d}:{at.minute:02d}", LEVEL_OF_TONE.get(t, "eco")] for at, t, _ in line if at.date() == day]


def _home_planning(model, srcs, lane_ids, names, owners, aimed, aimed_on, home_lines, schedules, copies, snap,
                   naive_now, workday) -> dict:
    by_id = {s["id"]: s for s in srcs}
    today = naive_now.date()
    monday = today + timedelta(days=(7 - today.weekday()) % 7)
    saturday = today + timedelta(days=(5 - today.weekday()) % 7)
    applied = snap.get("applied") or {}
    order = sorted(lane_ids, key=lambda k: (k != home_planning.STOVE, _natural(names.get(k, k))))
    lanes, dus, waiting, todo, ahead, advanced = [], [], [], [], [], []
    for lane in order:
        ids = lane_ids[lane]
        thermostats = [by_id[i] for i in ids]
        owner = owners[lane]
        cools = all(t["type"] == "clim" for t in thermostats)
        vt = all(t["vt"] for t in thermostats)
        usable = [lv for lv in home_planning.LEVELS
                  if all(not t["vt"] or home_planning.PRESET[lv] in (t["prereglages_dispo"] or ()) for t in thermostats)]
        blocked = next((aimed_on[i] for i in ids if i in aimed_on), None) if owner == home_planning.HESTIA else None
        copied = all(i in copies for i in ids)
        temps = home_planning.temperatures(model, lane, cools)
        lanes.append({
            "id": lane, "nom": names.get(lane, lane), "source": owner,
            "choisi": (model.get("pieces") or {}).get(lane, {}).get("source") in home_planning.OWNERS,
            "thermostats": [t["nom"] for t in thermostats], "vt": vt, "froid": cools, "recopie": copied,
            "niveaux": usable or list(home_planning.LEVELS),
            "prereglages": {lv: (thermostats[0]["prereglages"] or {}).get(home_planning.PRESET[lv]) for lv in home_planning.LEVELS} if vt else None,
            "temperatures": None if vt else temps,
            "scheduler": sorted({aimed[i] for i in ids if i in aimed}),
            "scheduler_actif": next((aimed_on[i] for i in ids if i in aimed_on), None),
            "scheduler_creneaux": {"semaine": _scheduler_slots(schedules, thermostats[0], monday),
                                   "weekend": _scheduler_slots(schedules, thermostats[0], saturday)} if ids else None,
        })
        if owner != home_planning.HESTIA:
            continue
        if blocked:
            stove_lane = lane == home_planning.STOVE
            todo.append({"titre": f"{names.get(lane, lane)} a deux plannings",
                         "texte": f"{'Il' if stove_lane else 'Elle'} est sur Hestia, mais « {blocked} » est encore allumé : "
                                  f"Hestia ne {'le' if stove_lane else 'la'} commande pas tant qu’il l’est. Coupez-le dans "
                                  f"Scheduler, ou remettez {'le poêle' if stove_lane else 'la pièce'} sur Scheduler dans Réglages.",
                         "page": "reglages"})
        status = BLOCKED if blocked else COPY if copied else PLANNED if model.get("commande") else SHADOW
        line = home_lines.get(lane) or []
        for at, level, info in line:
            if naive_now < at <= naive_now + timedelta(hours=24):
                ahead.append((at, lane, level, status))
                if info.get("avance"):
                    advanced.append((lane, at, level, info))
        last = (applied.get(lane) or {}).get("a")
        if not last:
            waiting.append(lane)
            continue
        try:
            last_at = datetime.fromisoformat(last)
        except ValueError:
            waiting.append(lane)
            continue
        slot = home_planning.due(line, naive_now, last_at)
        if slot:
            targets = [{"id": t["id"], "vt": t["vt"], "preset": home_planning.PRESET[slot[1]],
                        "consigne": temps[slot[1]]} for t in thermostats]
            dus.append({"piece": lane, "nom": names.get(lane, lane), "a": slot[0].isoformat(), "niveau": slot[1],
                        "bloque": blocked, "recopie": copied, "cibles": targets})
    # The coming orders, the same moment and fate said once: « 22 h 30 · poêle et salon hors gel ».
    grouped: dict[tuple, dict[str, list[str]]] = {}
    for at, lane, level, status in sorted(ahead, key=lambda x: x[0]):
        who = "poêle" if lane == home_planning.STOVE else _in_sentence(names.get(lane, lane))
        word = ("en chauffe" if level != "hors_gel" else "hors gel") if lane == home_planning.STOVE else home_planning.WORDS[level]
        grouped.setdefault((at, status), {}).setdefault(word, []).append(who)
    orders = [{"a": at.replace(tzinfo=snap["now"].tzinfo).isoformat(), "heure": phrases.when(at, naive_now), "statut": status,
               "texte": " · ".join(f"{_join(w)} {word}" for word, w in words.items())}
              for (at, status), words in grouped.items()][:8]
    kind = home_planning.day_type(model, today, workday)
    types = model.get("journees") or {}
    week = home_planning.week_ahead(model, today, workday)
    day_types = [{"id": k, "nom": t["nom"], "jours": sum(1 for d in week if d["type"] == k),
                  "pieces": sum(1 for slots in (t.get("creneaux") or {}).values() if slots)} for k, t in types.items()]
    return {"jour_type": {"id": kind, "nom": (types.get(kind) or {}).get("nom")}, "jours": week, "journees": day_types,
            "pieces": lanes, "ordres": orders, "ordres_avances": advanced, "dus": dus, "sans_repere": waiting,
            "a_regler": todo}


def _tips(advanced, house, tariff, names, naive_now) -> list[dict]:
    """A few plain sentences under the planning: a lane started earlier on a cold night, what the electric heating
    costs right now at Hestia Énergie's price."""
    out = []
    by_time: dict[datetime, list] = {}
    for lane, at, level, info in advanced:
        by_time.setdefault(at, []).append((lane, level, info))
    for at in sorted(by_time)[:2]:
        items = by_time[at]
        info = items[0][2]
        who = _join(["poêle" if lane == home_planning.STOVE else _in_sentence(names.get(lane, lane)) for lane, _, _ in items])
        level = items[0][1]
        word = "en chauffe" if all(lane == home_planning.STOVE for lane, _, _ in items) else home_planning.WORDS[level]
        cold = f" ({degrees(info['dehors'])} dehors)" if info.get("dehors") is not None else ""
        out.append({"texte": f"{who[:1].upper()}{who[1:]} : {word} dès {phrases.when(at, naive_now)} au lieu de "
                             f"{phrases.hour(info['prevu'])}, la nuit sera froide{cold}.", "ton": COLD})
    price = (tariff or {}).get("price")
    watts = house.get("electrique_w") or 0
    if price is not None and watts > 0:
        euros = watts / 1000 * price
        period = {"hp": "heures pleines", "hc": "heures creuses"}.get((tariff or {}).get("period"))
        text = f"L’électrique tire {phrases.power(watts)} : environ {number(euros, 2)} € de l’heure{f' ({period})' if period else ''}."
        change, following = (tariff or {}).get("next_change"), (tariff or {}).get("next_period")
        if (tariff or {}).get("period") == "hp" and following == "hc" and change:
            try:
                at = datetime.fromisoformat(change).replace(tzinfo=None)   # local time, as the reader gives it
                text += f" Les heures creuses commencent {('à ' if at.date() == naive_now.date() else '')}{phrases.when(at, naive_now)}."
            except ValueError:
                pass
        out.append({"texte": text, "ton": HEAT})
    return out
