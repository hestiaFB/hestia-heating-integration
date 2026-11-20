"""The stove's pilot « à l'ombre » (0.4): what Hestia would do with the stove, next to what the house does. Plain
Python, and it sends nothing: the coordinator only keeps its memory and its journal (docs/technique.md, « Le pilote du
poêle »).

The thermostat of the stove decides how much to heat (its demand, in %); the pilot turns it into the stove's gestures:

- Start: when the stove's thermostat steps up to boost and the stove is off. A step, not a state: the stove never
  relights on its own. Refused when the thermostat is off or in safety, the stove in alarm, the room already warm (its
  set point + 0.5 °C), or the day's one automatic start already made.
- Flame: the demand gives the flame (85 % → 5, 65 % → 4, 45 % → 3, else 2), with 7 points of margin around the
  current step so as not to swing. Flame 1 when the room, carried 15 minutes ahead on its slope, would pass its set
  point by 0.5 °C. Down at once, up at most every 30 minutes (unless two steps behind). The stove's daily writes keep
  4 orders aside, to be able to stop it.
- Stop: the thermostat at hors gel (frost) or off while the stove burns. Confirmed when the stove says off, its smoke
  is under 60 °C and its plug under 70 W.
- Safety, while it burns: an alarm, a stove silent 15 minutes, a thermostat in safety, a room 2 °C above its set
  point: cut.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from .phrases import degrees, hour, number

# The demand's steps, from the highest: (lowest demand, flame).
STEPS = ((85, 5), (65, 4), (45, 3), (0, 2))
MARGIN = 7                      # points of demand around the current step
AHEAD_MIN, OVER_C = 15, 0.5     # flame 1 when the room would pass its set point by 0.5 °C in 15 min
WARM_C = 0.5                    # no start when the room is already this much above its set point
HOT_C = 2.0                     # cut when the room is this much above its set point while the stove burns
RAISE_EVERY = timedelta(minutes=30)
WRITES_KEPT = 4
SILENT = timedelta(minutes=15)
START_SHOWN = timedelta(minutes=10)
STOP_SMOKE_C, STOP_PLUG_W = 60, 70
BURNING = ("allumage", "chauffe", "nettoyage")
MODES = ("ombre", "eteint")
# What a decision looks like on the panel.
TONE = {"demarrer": "stove", "flamme": "stove", "garder": "stove", "arreter": "calm", "couper": "alert",
        "refuser": "act", "attendre": "off"}


def _step(demand: float) -> int:
    return next(flame for low, flame in STEPS if demand >= low)


def _bounds(flame: int) -> tuple[float, float]:
    """The demand that keeps a flame: its step's band, widened by the margin."""
    low = next((lo for lo, f in STEPS if f == flame), 0)
    high = next((lo for lo, f in reversed(STEPS) if f == flame + 1), 101)
    return low - MARGIN, high + MARGIN


def flame_for(demand: float | None, current: int | None) -> int | None:
    """The flame the demand asks for, kept at `current` while the demand stays within its band ± 7 points."""
    if demand is None:
        return None
    if current is not None and 2 <= current <= 5:
        low, high = _bounds(current)
        if low <= demand < high:
            return current
    return _step(demand)


def _iso(value) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None


def decide(stove: dict, thermostat: dict | None, memory: dict | None, now: datetime) -> tuple[dict, dict, list[dict]]:
    """(the decision, the new memory, the day's events: what Hestia would do and what the house did)."""
    mem = dict(memory or {})
    today = now.date().isoformat()
    if mem.get("jour") != today:
        mem.update(jour=today, demarrages=0)
    events: list[dict] = []
    at = hour(now)
    state, flame_set = stove.get("etat"), stove.get("flamme_reglee")
    burning = state in BURNING
    lo, hi = stove.get("flamme_min") or 1, stove.get("flamme_max") or 5

    # What the house did since the last look: the stove's state and its flame, seen from outside.
    before_state, before_flame = mem.get("etat"), mem.get("reglee")
    house_did = None
    if before_state == "eteint" and burning:
        house_did = "demarre"
    elif before_state in BURNING and state in ("extinction", "eteint"):
        house_did = "eteint"
    elif before_flame is not None and flame_set is not None and flame_set != before_flame and burning:
        house_did = "flamme"
    # A stove that goes silent while it burns: cut after 15 minutes.
    silent_since = None
    if state == "inconnu":
        silent_since = _iso(mem.get("muet")) or (now if before_state in BURNING else None)
    mem.update(etat=state, reglee=flame_set, muet=silent_since.isoformat() if silent_since else None)
    if not burning:
        mem.update(cible=None, hausse=None)

    if not thermostat:
        decision = _decision("attendre", "Pas de thermostat",
                             "Le pilote suit le thermostat du poêle : choisissez-le dans Réglages.", None, stove)
        return decision, mem, events

    preset, mode = thermostat.get("preset"), thermostat.get("mode")
    demand, room, target_c, slope = (thermostat.get("demande_pct"), thermostat.get("temperature"),
                                     thermostat.get("consigne"), thermostat.get("pente"))
    before_preset = mem.get("preset")
    mem["preset"] = preset
    wants_off = preset == "frost" or mode == "off"
    over = room - target_c if room is not None and target_c is not None else None
    writes, writes_max = stove.get("ecritures"), stove.get("ecritures_max")
    left = writes_max - writes if writes is not None and writes_max else None

    # The step up to boost, the stove off (or just lit by the house in the same moment): would Hestia start it?
    start = None
    if before_preset is not None and before_preset != "boost" and preset == "boost" and (
            state == "eteint" or (burning and before_state == "eteint")):
        refusal = None
        if mode == "off":
            refusal = "le thermostat est éteint"
        elif stove.get("alarme"):
            refusal = "le poêle est en alarme"
        elif thermostat.get("securite"):
            refusal = "le thermostat est en sécurité"
        elif over is not None and over >= WARM_C:
            refusal = f"la pièce est déjà à {degrees(room)} pour {degrees(target_c)} visés"
        elif mem.get("demarrages", 0) >= 1:
            refusal = "il a déjà démarré une fois aujourd’hui : le poêle ne se rallume pas seul"
        if refusal:
            start = _decision("refuser", "Pas de démarrage", f"Le thermostat est passé en boost, mais {refusal}.",
                              None, stove)
            mem["refus"] = {"a": now.isoformat(), "texte": start["texte"]}
        else:
            mem["demarrages"] = mem.get("demarrages", 0) + 1
            mem["demarrage"] = now.isoformat()
            start = _decision("demarrer", "Démarrer le poêle", f"Le thermostat est passé en boost à {at}, le poêle "
                              "est éteint : le pilote l’allumerait.", None, stove)
    asked, refused = _iso(mem.get("demarrage")), mem.get("refus") or {}

    # 1. Safety first, while the stove burns.
    cut = None
    if burning or state == "inconnu":
        if stove.get("alarme"):
            cut = f"Le poêle est en alarme ({stove.get('alarme_texte') or 'alarme'})."
        elif silent_since is not None and now - silent_since >= SILENT:
            cut = "Le poêle ne répond plus depuis 15 minutes."
        elif thermostat.get("securite") and burning:
            cut = "Son thermostat est en sécurité : sa sonde ne répond plus."
        elif over is not None and over >= HOT_C and burning:
            cut = f"Surchauffe : la pièce est à {degrees(room)}, {number(over)} °C au-dessus de sa consigne."
    if cut:
        decision = _decision("couper", "Couper le poêle", cut, None, stove)
    # 2. Stop: the thermostat says hors gel, or is off.
    elif burning and wants_off:
        why = "Le thermostat est passé hors gel." if preset == "frost" else "Le thermostat est éteint."
        decision = _decision("arreter", "Arrêter le poêle", why + " Le pilote l’éteindrait (3 essais au plus), puis "
                             "vérifierait l’arrêt par l’état, les fumées et la prise.", None, stove)
    # 3. Start, on the step up to boost only (shown ten minutes, while the stove lights).
    elif start and not burning:
        decision = start
    elif state == "eteint" and asked and now - asked < START_SHOWN:
        decision = _decision("demarrer", "Démarrer le poêle",
                             f"Démarrage demandé à {hour(asked)} : le poêle devrait s’allumer.", None, stove)
    elif state == "eteint" and _iso(refused.get("a")) and now - _iso(refused["a"]) < START_SHOWN:
        decision = _decision("refuser", "Pas de démarrage", refused.get("texte") or "", None, stove)
    # 4. The flame, once the stove heats.
    elif state == "chauffe":
        decision = _flame(stove, mem, now, demand, room, target_c, slope, flame_set, left, lo, hi)
    elif state in ("allumage", "nettoyage"):
        decision = _decision("attendre", "Allumage" if state == "allumage" else "Nettoyage",
                             "Le pilote règle la flamme une fois le poêle en chauffe.", None, stove)
    else:
        decision = _rest(stove, state, preset, wants_off, mem)

    # 5. The journal: a new gesture of Hestia, a gesture of the house, and whether they agree.
    before = mem.get("dernier") or ""
    if start and burning:
        events.append({"heure": at, "qui": "hestia", "texte": _would(start), "accord": None})
    if house_did:
        events.append(_house_event(house_did, at, flame_set, decision, before, asked, now))
    key = f"{decision['action']}:{decision.get('flamme')}"
    if decision["action"] in ("demarrer", "refuser", "flamme", "arreter", "couper") and key != before:
        events.insert(0, {"heure": at, "qui": "hestia", "texte": _would(decision), "accord": None})
    mem["dernier"] = key
    return decision, mem, events


def _flame(stove, mem, now, demand, room, target_c, slope, flame_set, left, lo, hi) -> dict:
    current = mem.get("cible") if mem.get("cible") is not None else flame_set
    projected = room + (slope or 0) * AHEAD_MIN / 60 if room is not None else None
    if projected is not None and target_c is not None and projected > target_c + OVER_C:
        wanted, why = lo, (f"La pièce serait à {degrees(projected)} dans 15 min, plus de 0,5 °C au-dessus de sa "
                           f"consigne ({degrees(target_c)}) : flamme au plus bas.")
    elif demand is None:
        return _decision("garder", f"Flamme {flame_set}" if flame_set else "Flamme", "Le thermostat ne donne pas sa "
                         "demande : le pilote garde la flamme.", flame_set, stove)
    else:
        step = flame_for(demand, current if current != lo else None)
        wanted, why = step, f"Le thermostat demande {number(demand, 0)} % : palier {step}."
    wanted = max(lo, min(hi, wanted))
    raised = _iso(mem.get("hausse"))
    if current is not None and wanted > current and wanted - current < 2 and raised and now - raised < RAISE_EVERY:
        wait = int((RAISE_EVERY - (now - raised)).total_seconds() // 60) + 1
        wanted, why = current, why + f" Il monterait dans {wait} min : au plus une hausse par demi-heure."
    if flame_set is not None and wanted != flame_set and left is not None and left <= WRITES_KEPT:
        wanted, why = flame_set, why + f" Plus que {left} ordres aujourd’hui : il les garde pour pouvoir l’éteindre."
    if current is not None and wanted > current:
        mem["hausse"] = now.isoformat()
    mem["cible"] = wanted
    action = "garder" if wanted == flame_set else "flamme"
    title = f"Flamme {wanted}" if action == "garder" else f"Flamme {flame_set} → {wanted}" if flame_set else f"Flamme {wanted}"
    return _decision(action, title, why, wanted, stove)


def _rest(stove, state, preset, wants_off, mem) -> dict:
    """The stove off (or stopping), nothing to do: say what would start it."""
    if state == "extinction":
        return _decision("attendre", "Extinction", "Le poêle s’éteint.", None, stove)
    if state == "eteint" and _stopped(stove):
        text = "Arrêt confirmé : fumées froides" + (", prise au repos." if stove.get("prise_w") is not None else ".")
    elif state == "eteint":
        text = "Le poêle est éteint."
    elif state == "alarme":
        return _decision("attendre", "En alarme", "Le poêle est en alarme : aucun démarrage tant qu’elle dure.", None, stove)
    else:
        return _decision("attendre", "Poêle muet", "Le poêle ne dit pas son état : le pilote attend.", None, stove)
    if preset == "boost" and not wants_off:
        text += (" Il ne se rallume pas seul : il attend le prochain passage du thermostat en boost."
                 if mem.get("demarrages") else " Le thermostat est déjà en boost : le pilote attend son prochain passage en boost.")
    else:
        text += " Il démarrerait au prochain passage du thermostat en boost."
    return _decision("attendre", "Rien à faire", text, None, stove)


def _stopped(stove) -> bool:
    smoke, plug = stove.get("fumees"), stove.get("prise_w")
    return (smoke is None or smoke < STOP_SMOKE_C) and (plug is None or plug < STOP_PLUG_W)


def _decision(action: str, title: str, text: str, flame: int | None, stove: dict) -> dict:
    burning = stove.get("etat") in BURNING
    house = (f"flamme {stove['flamme_reglee']}" if burning and stove.get("flamme_reglee") is not None
             else {"eteint": "éteint", "allumage": "allumage", "chauffe": "en chauffe", "extinction": "extinction",
                   "nettoyage": "nettoyage", "alarme": "en alarme"}.get(stove.get("etat"), "état inconnu"))
    if action in ("flamme", "garder"):
        agree = flame == stove.get("flamme_reglee")
    elif action in ("arreter", "couper"):
        agree = not burning
    elif action == "demarrer":
        agree = burning
    else:
        agree = None if stove.get("etat") in ("inconnu", None) else (not burning or action == "attendre")
    return {"action": action, "titre": title, "texte": text, "ton": TONE[action], "flamme": flame, "maison": house,
            "accord": agree}


def _would(decision: dict) -> str:
    action = decision["action"]
    if action == "flamme":
        return f"Hestia mettrait la flamme à {decision['flamme']}."
    if action == "demarrer":
        return "Hestia démarrerait le poêle."
    if action == "arreter":
        return "Hestia arrêterait le poêle."
    if action == "couper":
        return f"Hestia couperait le poêle : {decision['texte'][0].lower()}{decision['texte'][1:]}"
    return f"Hestia ne démarrerait pas : {decision['texte'].split(', mais ', 1)[-1]}"


def _house_event(did: str, at: str, flame_set, decision: dict, before: str, asked, now: datetime) -> dict:
    """What the house did, and whether Hestia would have done the same."""
    if did == "demarre":
        return {"heure": at, "qui": "maison", "texte": "La maison a démarré le poêle.",
                "accord": bool(asked and now - asked < START_SHOWN)}
    if did == "eteint":
        agree = decision["action"] in ("arreter", "couper") or before.startswith(("arreter", "couper"))
        return {"heure": at, "qui": "maison", "texte": "La maison a éteint le poêle.", "accord": agree}
    target = decision.get("flamme")
    return {"heure": at, "qui": "maison", "texte": f"La maison a mis la flamme à {flame_set}.",
            "accord": None if target is None else target == flame_set}
