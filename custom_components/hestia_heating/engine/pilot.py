"""The stove's pilot: what Hestia would do with the stove, next to what the house does. Plain Python: it says what to
send, the coordinator sends it, or not (docs/technique.md, « Le pilote du poêle »). « À l'ombre » (0.4) it sends
nothing. « Flamme » (0.5, an option the user switches on) it sets the stove's flame, and only that: starting,
stopping and the safeties stay with the house's own automations. « Entier » (0.7, an option too) it also starts and
stops the stove and keeps its safeties: engine/driver.py turns these decisions into the gestures. Its rules follow the stove automations that already run a real house (start manager, modulation, stop,
stop check, safeties and their watch), so that the two can be compared gesture by gesture.

The thermostat of the stove decides how much to heat (its demand, in %); the pilot turns it into the stove's gestures:

- Start: when the stove's thermostat steps up to boost (or turns on to heat while in boost) and the stove is off. A
  step, not a state: the stove never relights on its own. Refused when the thermostat is off, the stove's room is
  over 28 °C, the fire pot must be cleaned, the stove is in alarm or silent, or the house is already at the
  thermostat's set point. In the mild
  season (the house at 18 °C or more, until it falls under 18 °C; then allowed up to 19 °C) it asks first.
- Flame, in every burning state: the demand gives the flame (85 % → 5, 65 % → 4, 45 % → 3, else 2); the stove's
  current flame holds while it stays within the steps of the demand ± 7 points. Flame 1 when the room, carried 15
  minutes ahead on its rising slope, would pass its set point by 0.5 °C, and it stays at 1 while the room is at its
  set point: on the thermostat's smoothed temperature (`ema_temp`), as the house does. Down at once; up only 30
  minutes after the stove's flame last changed, unless two steps apart. The stove's daily writes keep 4 orders aside,
  to be able to stop it.
- Stop: the thermostat at hors gel (frost), or off for 30 seconds (switched off from a known state with a preset, not
  restored off by a restart), or the house warm enough for 2 minutes (no longer 1 °C under the set point, or not under
  it at all in boost). Checked by the stove's state, its smoke under 60 °C, or its plug under 70 W.
- Safety: an alarm that lasts 2 minutes, or the stove's room over 28 °C while it burns: cut (the thermostat off, then
  the stove). A stove silent for 15 minutes: say so, nothing else.
- A switch chosen in Réglages (« flamme au plus bas », like a switch that forces flame 1) asks for the lowest flame.

In « flamme » mode (`steer()`): one order at a time (number.set_value on the stove's flame, as the house's
modulation does), checked 5 minutes later; again at most every 10 minutes while the flame has not followed; 12 orders
a day at most from Hestia, on top of the 4 the stove's own daily writes keep aside. A flame changed without Hestia
(another automation still sets it), or 3 orders not followed in a day: Hestia lets go of the flame until the next day.
Never a stove copied from another house (a lab).
"""
from __future__ import annotations

from datetime import datetime, timedelta

from .phrases import degrees, hour, number

# The demand's steps, from the highest: (lowest demand, flame).
STEPS = ((85, 5), (65, 4), (45, 3), (0, 2))
MARGIN = 7                      # points of demand around the current step
AHEAD_H, OVER_C = 0.25, 0.5     # flame 1 when the room would pass its set point by 0.5 °C in 15 min
RAISE_EVERY = timedelta(minutes=30)
WRITES_KEPT, WRITES_DEFAULT = 4, 20
HELD = timedelta(minutes=2)     # an alarm, or a house warm enough, counts once it lasts 2 minutes
OFF_HELD = timedelta(seconds=30)
SILENT = timedelta(minutes=15)
START_SHOWN, ASK_SHOWN = timedelta(minutes=10), timedelta(minutes=15)
OVERHEAT_C = 28.0               # the stove's room
GAP_C = 1.0                     # the house must be this much under the set point to keep the stove (any gap in boost)
MILD_ON_C, MILD_OFF_C = 18.0, 19.0
STOP_SMOKE_C, STOP_PLUG_W, HOT_PLUG_W = 60, 70, 60
BURNING = ("allumage", "chauffe", "nettoyage")
MODES = ("ombre", "flamme", "entier", "eteint")
# « Flamme » mode: an order is checked after CONFIRM; one not followed is sent again after RESEND at the earliest;
# GAP between two orders; HESTIA_WRITES orders a day at most; FAILS orders not followed and Hestia lets go for the day.
CONFIRM, RESEND, GAP = timedelta(minutes=5), timedelta(minutes=10), timedelta(minutes=3)
HESTIA_WRITES, FAILS = 12, 3
ACTS = ("demarrer", "demander", "refuser", "flamme", "arreter", "couper", "alerter")
# What a decision looks like on the panel.
TONE = {"demarrer": "stove", "flamme": "stove", "garder": "stove", "arreter": "calm", "couper": "alert",
        "alerter": "alert", "refuser": "act", "demander": "act", "attendre": "off"}


def _step(demand: float) -> int:
    return next((flame for low, flame in STEPS if demand >= low), STEPS[-1][1])


def flame_for(demand: float | None, current: int | None) -> int | None:
    """The flame the demand asks for, kept at `current` while the steps of the demand ± 7 points surround it."""
    if demand is None:
        return None
    if current is not None and 2 <= current <= 5 and _step(demand - MARGIN) <= current <= _step(demand + MARGIN):
        return current
    return _step(demand)


def _iso(value) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None


def _held(mem: dict, key: str, active: bool, since: str | None, now: datetime) -> datetime | None:
    """Since when a condition holds: the entity's own change when known, else the first look that saw it."""
    if not active:
        mem[key] = None
        return None
    start = _iso(since) or _iso(mem.get(key)) or now
    mem[key] = start.isoformat()
    return start


def warm_enough(house_c: float | None, target_c: float | None, preset: str | None) -> bool:
    """The house no longer needs the stove: not 1 °C under the set point (not under it at all in boost). An unknown
    house temperature counts as warm, like the house's own rule: no stove on a guess."""
    if house_c is None or target_c is None:
        return True
    return not (target_c - house_c > GAP_C or (preset == "boost" and target_c > house_c))


def decide(stove: dict, thermostat: dict | None, memory: dict | None, now: datetime,
           house_c: float | None = None, low: str | None = None) -> tuple[dict, dict, list[dict]]:
    """(the decision, the new memory, the day's events: what Hestia would do and what the house did). `house_c`: the
    house's temperature (the sensor chosen in Réglages, else the average of its rooms). `low`: the name of the switch
    that asks for the lowest flame, when it is on."""
    mem = {k: v for k, v in (memory or {}).items() if k not in ("jour", "demarrages", "cible", "hausse")}
    events: list[dict] = []
    at = hour(now)
    state, flame_set = stove.get("etat"), stove.get("flamme_reglee")
    burning = state in BURNING
    lo, hi = stove.get("flamme_min") or 1, stove.get("flamme_max") or 5

    # What the house did since the last look: the stove's state and its flame, seen from outside.
    before_state, before_flame = mem.get("etat"), mem.get("reglee")
    # A silent moment (the cloud) is not a change of the stove: compare with the last state it said.
    known_before = mem.get("etat_connu", before_state) if before_state == "inconnu" else before_state
    house_did = None
    if known_before in ("eteint", "alarme") and burning:
        house_did = "demarre"
    elif known_before in BURNING and state in ("extinction", "eteint"):
        house_did = "eteint"
    elif before_flame is not None and flame_set is not None and flame_set != before_flame and burning:
        house_did = "flamme"
    if before_flame is not None and flame_set is not None and flame_set != before_flame:
        mem["reglee_a"] = now.isoformat()
    mem.update(etat=state, reglee=flame_set)
    if state != "inconnu":
        mem["etat_connu"] = state
    flame_since = _iso(stove.get("flamme_depuis")) or _iso(mem.get("reglee_a"))
    alarm = bool(stove.get("alarme")) or state == "alarme"
    alarm_since = _held(mem, "alarme_a", alarm, stove.get("alarme_depuis"), now)
    silent = state == "inconnu" and not stove.get("a_traduire")
    silent_since = _held(mem, "muet", silent, stove.get("depuis"), now)

    if not thermostat:
        decision = _decision("attendre", "Pas de thermostat",
                             "Le pilote suit le thermostat du poêle : choisissez-le dans Réglages.", None, stove)
        return decision, mem, events

    preset, mode = thermostat.get("preset"), thermostat.get("mode")
    demand, room, target_c, slope = (thermostat.get("demande_pct"), thermostat.get("temperature"),
                                     thermostat.get("consigne"), thermostat.get("pente"))
    # The flame reads the smoothed temperature (a puff of hot air on the probe once cost two orders); the overheat
    # safety reads the live one.
    smooth = thermostat.get("temperature_lissee")
    smooth = room if smooth is None else smooth
    before_preset, before_mode = mem.get("preset"), mem.get("mode")
    mem.update(preset=preset, mode=mode)
    # A real switch-off only: from a known state with a preset, not the way back from a restart or a reload.
    if mode == "off" and before_mode != "off":
        mem["arret_vrai"] = before_mode not in (None, "unavailable", "unknown") and before_preset is not None
    elif mode != "off":
        mem["arret_vrai"] = None
    off_since = _held(mem, "arret_a", mode == "off" and bool(mem.get("arret_vrai")), None, now)
    wants_off = preset == "frost" or bool(off_since and now - off_since >= OFF_HELD)
    overheat = room is not None and room > OVERHEAT_C
    # The fire pot, counted by Hestia (engine/granules.py): full, the next start waits for « J'ai nettoyé ».
    fire_pot = (stove.get("conso") or {}).get("brasier") or {}
    warm = warm_enough(house_c, target_c, preset)
    warm_since = _held(mem, "assez_chaud", warm, None, now)
    mild = not (house_c is not None and house_c < (MILD_OFF_C if not mem.get("saison_douce", True) else MILD_ON_C))
    mem["saison_douce"] = mild
    house_text = (f"la maison est à {degrees(house_c)}" if house_c is not None
                  else "la température de la maison est inconnue")

    # The step up to boost (or on to heat, in boost), the stove off or lit by the house in the same moment.
    start = None
    stepped = (before_preset is not None and before_preset != "boost" and preset == "boost") or (
        before_mode is not None and before_mode != "heat" and mode == "heat" and preset == "boost")
    if stepped and state != "extinction" and (not burning or before_state in ("eteint", "inconnu", "alarme")):
        refusal = None
        if mode == "off":
            refusal = "le thermostat est éteint"
        elif overheat:
            refusal = (f"la pièce du poêle est à {degrees(room)}, au-dessus de {degrees(OVERHEAT_C)} : il éteindrait "
                       "son thermostat")
        elif fire_pot.get("a_nettoyer"):
            refusal = (f"le brasier est à nettoyer ({number(fire_pot.get('kg') or 0, 1)} kg brûlés depuis le dernier "
                       "nettoyage) : il éteindrait son thermostat")
        elif alarm:
            refusal = (f"le poêle est en alarme ({stove.get('alarme_texte') or 'alarme'}) : il éteindrait son "
                       "thermostat")
        elif silent:
            refusal = "le poêle ne répond pas : il éteindrait son thermostat"
        elif warm:
            refusal = f"{house_text} pour {degrees(target_c)} visés"
        if refusal:
            start = _decision("refuser", "Pas de démarrage", f"Le thermostat est passé en boost, mais {refusal}.",
                              None, stove)
            mem.update(refus={"a": now.isoformat(), "texte": start["texte"]}, demarrage=None, demande=None)
        elif mild:
            start = _decision("demander", "Démarrer ?", f"Le thermostat est passé en boost à {at}, mais {house_text} "
                              "(saison douce, 18 °C ou plus). Le pilote vous demanderait d’abord votre accord ; sans "
                              "réponse en 15 min, il remettrait le thermostat hors gel, sauf si le poêle est déjà "
                              "en route : alors il ne couperait rien.", None, stove)
            mem.update(demande=now.isoformat(), demarrage=None, refus=None)
        else:
            start = _decision("demarrer", "Démarrer le poêle", f"Le thermostat est passé en boost à {at}, le poêle "
                              "est éteint : le pilote l’allumerait.", None, stove)
            mem.update(demarrage=now.isoformat(), demande=None, refus=None)
    asked, confirm, refused = _iso(mem.get("demarrage")), _iso(mem.get("demande")), mem.get("refus") or {}

    # 1. Safety: an alarm that lasts, a room too hot while the stove burns.
    cut = None
    if alarm and alarm_since and now - alarm_since >= HELD and (burning or mode != "off"):
        cut = f"Le poêle est en alarme ({stove.get('alarme_texte') or 'alarme'}) depuis 2 minutes."
    elif overheat and burning:
        cut = f"La pièce du poêle est à {degrees(room)}, au-dessus de {degrees(OVERHEAT_C)}."
    if cut:
        decision = _decision("couper", "Couper le poêle", cut + " Le pilote éteindrait son thermostat, puis le poêle.",
                             None, stove)
    # 2. A silent stove: say so (its plug tells whether it still heats).
    elif silent and silent_since and now - silent_since >= SILENT:
        plug = stove.get("prise_w")
        tail = ("" if plug is None else f" Sa prise tire {number(plug, 0)} W : il chauffe encore." if plug > HOT_PLUG_W
                else " Sa prise est au repos.")
        decision = _decision("alerter", "Poêle injoignable", "Le poêle ne répond plus depuis 15 minutes : le pilote "
                             "vous préviendrait." + tail, None, stove)
    # 3. Stop: the thermostat says hors gel or is off, or the house is warm enough. A stove that burnt at the last word
    #    it said counts as burning (the house's stop waits 2 minutes for its state, then sends anyway).
    elif (burning or (silent and known_before in BURNING)) and (
            wants_off or (warm and warm_since and now - warm_since >= HELD)):
        why = ("Le thermostat est passé hors gel." if preset == "frost" else "Le thermostat est éteint." if wants_off
               else f"Assez chaud : {house_text} pour {degrees(target_c)} visés. Le pilote passerait le thermostat "
                    "hors gel.")
        decision = _decision("arreter", "Arrêter le poêle", why + " Il éteindrait le poêle (3 tentatives au plus), puis "
                             "vérifierait l’arrêt : son état, ses fumées sous 60 °C ou sa prise sous 70 W.", None, stove)
    # 4. Start, on the step up only (shown a few minutes, while the stove lights).
    elif start and not burning:
        decision = start
    elif not burning and asked and now - asked < START_SHOWN:
        decision = _decision("demarrer", "Démarrer le poêle",
                             f"Démarrage demandé à {hour(asked)} : le poêle devrait s’allumer.", None, stove)
    elif not burning and confirm and now - confirm < ASK_SHOWN and preset == "boost":
        decision = _decision("demander", "Démarrer ?", "Saison douce : le pilote attendrait votre accord, demandé à "
                             f"{hour(confirm)}.", None, stove)
    elif not burning and _iso(refused.get("a")) and now - _iso(refused["a"]) < START_SHOWN:
        decision = _decision("refuser", "Pas de démarrage", refused.get("texte") or "", None, stove)
    # 5. The flame, in every burning state, unless the stove reports an alarm.
    elif burning and alarm:
        decision = _decision("garder", f"Flamme {flame_set}" if flame_set else "Flamme",
                             f"Le poêle signale une alarme ({stove.get('alarme_texte') or 'alarme'}) : le pilote ne "
                             "touche plus à la flamme, et coupe si elle dure 2 minutes.", flame_set, stove)
    elif burning:
        decision = _flame(stove, now, demand, smooth, target_c, slope, flame_set, flame_since, lo, hi, low)
    else:
        decision = _rest(stove, state, preset, wants_off, silent)

    # 6. The journal: a new gesture of Hestia, a gesture of the house, and whether they agree.
    before = mem.get("dernier") or ""
    if start and burning:
        events.append({"heure": at, "qui": "hestia", "texte": _would(start), "accord": None})
    if house_did:
        events.append(_house_event(house_did, at, flame_set, decision, before, asked, confirm, now))
    key = f"{decision['action']}:{decision.get('flamme')}"
    if decision["action"] in ACTS and key != before:
        events.insert(0, {"heure": at, "qui": "hestia", "texte": _would(decision), "accord": None})
    mem["dernier"] = key
    return decision, mem, events


def _flame(stove, now, demand, room, target_c, slope, flame_set, flame_since, lo, hi, low=None) -> dict:
    """The flame, from the stove's current one: the house's modulation, step by step."""
    current = flame_set
    hot, why = False, ""
    if low:
        hot, why = True, f"« {low} » demande la flamme au plus bas."
    elif room is not None and room > 0 and target_c is not None:
        projected = room + max(slope or 0, 0) * AHEAD_H
        if projected > target_c + OVER_C:
            hot, why = True, (f"La pièce serait à {degrees(projected)} dans 15 min, plus de 0,5 °C au-dessus de sa "
                              f"consigne ({degrees(target_c)}) : flamme au plus bas.")
        elif current == lo and room >= target_c:
            hot, why = True, (f"La pièce est à {degrees(room)}, à sa consigne ({degrees(target_c)}) ou au-dessus : "
                              "la flamme reste au plus bas.")
    if hot:
        wanted = lo
    elif demand is None:
        return _decision("garder", f"Flamme {flame_set}" if flame_set else "Flamme", "Le thermostat ne donne pas sa "
                         "demande : le pilote garde la flamme.", flame_set, stove)
    else:
        wanted = flame_for(demand, current)
        why = f"Le thermostat demande {number(demand, 0)} % : palier {wanted}."
    wanted = max(lo, min(hi, wanted))
    if (current is not None and wanted > current and wanted - current < 2 and flame_since
            and now - flame_since < RAISE_EVERY):
        wait = int((RAISE_EVERY - (now - flame_since)).total_seconds() // 60) + 1
        wanted, why = current, why + f" Il monterait dans {wait} min : au plus une hausse par demi-heure."
    writes, cap = stove.get("ecritures"), stove.get("ecritures_max") or WRITES_DEFAULT
    if current is not None and wanted != current and writes is not None and writes >= cap - WRITES_KEPT:
        wanted, why = current, why + (f" {writes} ordres sur {cap} aujourd’hui : il garde les derniers pour pouvoir "
                                      "l’éteindre.")
    action = "garder" if wanted == flame_set else "flamme"
    title = f"Flamme {wanted}" if action == "garder" else f"Flamme {flame_set} → {wanted}" if flame_set else f"Flamme {wanted}"
    return _decision(action, title, why, wanted, stove)


def _rest(stove, state, preset, wants_off, silent) -> dict:
    """The stove off (or stopping), nothing to do: say what would start it."""
    if state == "extinction":
        return _decision("attendre", "Extinction", "Le poêle s’éteint.", None, stove)
    if state == "alarme":
        return _decision("attendre", "En alarme", "Le poêle est en alarme : aucun démarrage tant qu’elle dure.", None, stove)
    if silent:
        return _decision("attendre", "Poêle muet", "Le poêle ne dit pas son état : le pilote attend, et vous "
                         "préviendrait au bout de 15 minutes.", None, stove)
    if state != "eteint":
        return _decision("attendre", "État à traduire", "Le profil du poêle ne connaît pas ce mot : le pilote "
                         "attend.", None, stove)
    smoke, plug = stove.get("fumees"), stove.get("prise_w")
    text = "Le poêle est éteint"
    if smoke is not None and smoke >= STOP_SMOKE_C:
        text += f", ses fumées encore à {degrees(smoke)} : il refroidit"
    else:
        text += ", fumées froides" if smoke is not None else ""
        text += ", prise au repos" if plug is not None and plug < STOP_PLUG_W else ""
    text += "."
    if preset == "boost" and not wants_off:
        text += " Le thermostat est déjà en boost : le pilote attend son prochain passage en boost."
    else:
        text += " Il démarrerait au prochain passage du thermostat en boost."
    return _decision("attendre", "Rien à faire", text, None, stove)


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
    elif action in ("alerter", "demander"):
        agree = None
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
    if action == "demander":
        return "Hestia demanderait votre accord pour démarrer le poêle (saison douce)."
    if action == "arreter":
        return "Hestia arrêterait le poêle."
    if action == "alerter":
        return "Hestia vous préviendrait : le poêle ne répond plus depuis 15 minutes."
    if action == "couper":
        return f"Hestia couperait le poêle : {decision['texte'][0].lower()}{decision['texte'][1:]}"
    return f"Hestia ne démarrerait pas : {decision['texte'].split(', mais ', 1)[-1]}"


def _house_event(did: str, at: str, flame_set, decision: dict, before: str, asked, confirm, now: datetime) -> dict:
    """What the house did, and whether Hestia would have done the same."""
    if did == "demarre":
        agree = (True if asked and now - asked < START_SHOWN
                 else None if confirm and now - confirm < ASK_SHOWN else False)
        return {"heure": at, "qui": "maison", "texte": "La maison a démarré le poêle.", "accord": agree}
    if did == "eteint":
        agree = decision["action"] in ("arreter", "couper") or before.startswith(("arreter", "couper"))
        return {"heure": at, "qui": "maison", "texte": "La maison a éteint le poêle.", "accord": agree}
    # The flame Hestia wanted at the last look, before the house moved it; else the one it wants now.
    kind, _, wanted = before.partition(":")
    target = int(wanted) if kind in ("flamme", "garder") and wanted.isdigit() else decision.get("flamme")
    return {"heure": at, "qui": "maison", "texte": f"La maison a mis la flamme à {flame_set}.",
            "accord": None if target is None else target == flame_set}


def steer(decision: dict, stove: dict, mem: dict, events: list[dict], now: datetime, copy: bool) -> tuple[dict | None, dict]:
    """« Flamme » mode: the order to send now ({entity_id, valeur}) or None, and what the panel says of it. `mem` (the
    memory decide() returned) and `events` are updated: an order sent, followed or not, a flame changed without
    Hestia. Only the flame: starting, stopping and the safeties stay with the house."""
    at, today = hour(now), now.date().isoformat()
    if mem.get("envois_jour") != today:
        mem.update(envois_jour=today, envois=0, echecs=0, lache=None)
    flame_set, entity = stove.get("flamme_reglee"), (stove.get("entites") or {}).get("flamme")
    sent = dict(mem.get("envoi") or {})
    sent_at = _iso(sent.get("a"))
    ours = bool(sent_at and sent.get("valeur") == flame_set and now - sent_at < RESEND)
    # The flame changed: by Hestia's order, or by someone else (another automation still sets it).
    if mem.get("reglee_a") == now.isoformat() and stove.get("etat") in BURNING:
        for e in [e for e in events if e["qui"] == "maison" and e["texte"].startswith("La maison a mis la flamme")]:
            events.remove(e)
        if ours:
            sent["fin"] = "suivi"
            events.append({"heure": at, "qui": "hestia", "texte": f"La flamme est passée à {flame_set}, comme Hestia "
                           "l’a demandé.", "accord": None})
        elif not mem.get("lache"):
            mem["lache"] = (f"La flamme est passée à {flame_set} à {at} sans Hestia : une autre automatisation la règle "
                            "encore. Hestia ne touche plus à la flamme jusqu’à demain ; coupez votre automatisation de "
                            "modulation.")
            events.append({"heure": at, "qui": "maison", "texte": f"La flamme est passée à {flame_set} sans Hestia : "
                           "Hestia la laisse jusqu’à demain.", "accord": False})
    # An order not followed after 5 minutes.
    if sent_at and not sent.get("fin") and now - sent_at >= CONFIRM:
        sent["fin"] = "rate"
        mem["echecs"] = mem.get("echecs", 0) + 1
        events.append({"heure": at, "qui": "hestia", "texte": f"Le poêle n’a pas suivi : sa flamme est à "
                       f"{flame_set if flame_set is not None else '?'}, pas à {sent.get('valeur')}.", "accord": None})
        if mem["echecs"] >= FAILS and not mem.get("lache"):
            mem["lache"] = (f"Le poêle n’a pas suivi {FAILS} ordres aujourd’hui : Hestia ne touche plus à la flamme "
                            "jusqu’à demain.")
    mem["envoi"] = sent or None
    # In this mode Hestia does what it would have done: its « would » lines give way to what it sends.
    for e in [e for e in events if e["qui"] == "hestia" and e["texte"].startswith("Hestia mettrait la flamme")]:
        events.remove(e)
    status = {"envois": mem.get("envois", 0), "max": HESTIA_WRITES, "lache": mem.get("lache"), "copie": copy,
              "attente": sent.get("valeur") if sent_at and not sent.get("fin") else None}
    target = decision.get("flamme")
    if copy or not entity or mem.get("lache") or decision["action"] != "flamme" or target is None:
        return None, status
    if sent_at and (not sent.get("fin") or now - sent_at < GAP
                    or (sent.get("fin") == "rate" and sent.get("valeur") == target and now - sent_at < RESEND)):
        return None, status
    if mem.get("envois", 0) >= HESTIA_WRITES:
        status["texte"] = f"{HESTIA_WRITES} ordres de Hestia aujourd’hui : elle n’en envoie plus jusqu’à demain."
        return None, status
    mem["envoi"] = {"a": now.isoformat(), "valeur": target}
    mem["envois"] = mem.get("envois", 0) + 1
    events.insert(0, {"heure": at, "qui": "hestia", "texte": f"Hestia met la flamme à {target}.", "accord": None,
                      "envoye": True})
    status.update(envois=mem["envois"], attente=target)
    return {"entity_id": entity, "valeur": target}, status
