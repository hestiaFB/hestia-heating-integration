"""The whole house from what the reader found: the sources, the rooms, the stove, the planning, the sentence.

`build()` is the brick's one calculation. It is plain Python on a few dozen entities and runs in well under a
millisecond: the coordinator calls it again on every change of a thermostat, of the stove or of a schedule.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta

from . import phrases, planning, sources, stove as stove_engine
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


def _lane_label(tone: str | None, stove_lane: bool) -> str | None:
    if tone is None:
        return None
    if stove_lane:
        return "en chauffe" if tone in (planning.CONFORT, planning.ECO) else planning.LABELS[tone]
    return planning.LABELS[tone]


def _lane_tone(tone: str, stove_lane: bool) -> str:
    return planning.POELE if stove_lane and tone in (planning.CONFORT, planning.ECO) else tone


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
    # 3. The planning, per thermostat: today and tomorrow.
    schedules: list[planning.Schedule] = list(snap.get("schedules") or [])
    workday = snap.get("workday")
    naive_now = now.replace(tzinfo=None)
    lines = {s["id"]: planning.timeline(schedules, s["id"], naive_now.date(), 2, workday, s["prereglages"]) for s in srcs}
    # 4. The rooms.
    names = snap.get("room_names") or {}
    rooms: dict[str, dict] = {}
    for s in srcs:
        key = s["piece"] or "thermostat_" + s["id"].split(".", 1)[1]
        s["piece"] = key
        rooms.setdefault(key, {"id": key, "nom": names.get(key) or s["nom"], "sources": []})["sources"].append(s)
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
    return {
        "maison": house,
        "pieces": [{k: v for k, v in r.items() if k != "_sources"} for r in room_list],
        "sources": [_public(s) for s in srcs],
        "poele": stove,
        "granules": pellets,
        "dehors": weather,
        "planning": {
            "source": "Scheduler" if schedules else None,
            "jour": naive_now.date().isoformat(),
            "jour_nom": phrases.DAYS[naive_now.weekday()],
            "maintenant_min": naive_now.hour * 60 + naive_now.minute,
            "lignes": lanes,
            "prochains": upcoming[:6],
            "plannings": [{"id": s.id, "nom": s.name, "actif": s.on, "jours": list(s.days), "partiel": s.partial,
                           "cibles": list(s.targets)} for s in schedules],
        },
        "a_regler": _todo(found, srcs, stove, raw_stove, stove_thermostat, schedules),
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
