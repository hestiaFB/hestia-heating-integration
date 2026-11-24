"""The whole pilot (0.7): Hestia starts and stops the stove and keeps its safeties, as the house's own automations do.
An option the user switches on (réglage `pilote` = `entier`), off by default; never a stove copied from another house.
Plain Python: it says which gestures to make now, and when to look again; the coordinator makes them through the
stove's profile (`ordres`) and the stove's thermostat (docs/CAHIER-DES-CHARGES.md, « Démarrer », « Arrêter », « Les
sécurités »).

The pilot's decision (pilot.decide) says what the stove needs; this module turns it into sequences that survive the
cloud's delays, one at a time:

- Start (the thermostat stepped up to boost, the stove off): the stove's settings, each only if it changed (its own set
  point, ECO Stop, the ventilation while more than 6 orders are left), 2 s later the order to light; the stove must
  take it within 3 minutes (its command back on), else the stove's integration is reloaded and the order sent again
  20 s later, 3 more minutes; still nothing: « l'ordre d'allumage n'est pas passé ». One start at a time, 3 a day at
  most from Hestia.
- A start refused for a reason that locks (the room over 28 °C, the fire pot to clean, the stove in alarm or silent):
  the thermostat is switched off (the lock), and Hestia says why. The house warm enough: said only, the preset stays.
- The mild season: a question, Oui or Non, 15 minutes to answer (on the phone or the Poêle page). No answer: the
  thermostat goes to hors gel, unless the stove is already on its way (then nothing is cut).
- A stove lit by hand while its thermostat is in hors gel (1.0.0b5): the thermostat goes to boost, and the stove is
  driven from there. Hors gel stops only the burn it finds, on the step to hors gel, as the house's « Arrêt » does.
- Stop (hors gel, the thermostat off, or the house warm enough for 2 minutes, then hors gel): once the stove's state
  is known (2 minutes at most), up to 3 orders 15 s apart, until it is stopping, off or cleaning; checked again 25
  minutes later (its state, its smoke under 60 °C, its plug under 70 W); else the order again, and 30 s later the
  question « Couper la prise ? », cut after 5 minutes without an answer when Réglages allow it.
- Safety (an alarm that lasts 2 minutes, the room over 28 °C while it burns): the thermostat off, then the stop.
- A silent stove for 15 minutes: said, with what its plug draws, and the plug offered; nothing else.
- After a restart of Home Assistant: 3 minutes later, once the stove's state is known, a stove that burns with its
  thermostat off gets its thermostat back on, in boost. Nothing is sent to the stove.
- The front fan (1.0, Réglages « Ventilation »): AUTO, set once before a start (the default); or « flamme + 1 »: at
  its lowest while the smoke is under 110 °C, then the flame + 1 (5 at most), one order at most every 10 minutes and
  only while more than 6 orders are left; nothing is set before a start then.

The simulator (1.0, Réglages, in « Conseil » and « Flamme »): the same sequences « à blanc » (`ctx["blanc"]`), from
their own memory. Nothing is ever sent, not even a notice; the journal says what Hestia would do (« Hestia allumerait
le poêle »), and when the house does not follow within a few minutes (it does not light the stove, or stop it), a line
of the house that disagrees. No answer, no lock, no reload and no plug: the house drives, Hestia only rehearses.
"""
from __future__ import annotations

import copy
from datetime import datetime, timedelta

from . import tuning
from .phrases import degrees, hour, number

BURNING = ("allumage", "chauffe", "nettoyage")
STOPPED = ("extinction", "eteint", "nettoyage")       # what a stop order is waiting for
SETTLE = timedelta(seconds=2)                         # the settings, then the order to light
# The figures below are the defaults: since 1.0.0b3 each one may be set in Réglages › Avancé (engine/tuning.py).
IGNITION = timedelta(minutes=3)                       # the stove must take the order to light
RELOAD_WAIT = timedelta(seconds=20)
STATE_WAIT = timedelta(minutes=2)                     # before a stop, the stove's state known
STOP_EVERY, STOP_TRIES = timedelta(seconds=15), 3
VERIFY = timedelta(minutes=25)                        # the stove's own stop lasts about 20 minutes
RESEND_CHECK = timedelta(seconds=30)
PLUG_ANSWER = timedelta(minutes=5)
QUESTION = timedelta(minutes=15)
RESYNC_AFTER, RESYNC_UNTIL = timedelta(minutes=3), timedelta(minutes=8)
STARTS_A_DAY = 3
SETTINGS_KEPT = 6                                     # the ventilation only with more orders left than this
COLD_SMOKE_C, PLUG_OFF_W, PLUG_HOT_W = 60, 70, 60
HOUSE_STOP = timedelta(minutes=5)                     # the simulator: the house's own stop, after Hestia's would-be one
FAN_HOT_C, FAN_TOP, FAN_EVERY = 110, 5, timedelta(minutes=10)   # « flamme + 1 »: hot smoke, its top, its pace
# « auto »: the stove leads its fan (AUTO set before a start); « flamme »: flamme + 1 by Hestia; « manuel » (1.0.0b3):
# the speed the user chose, never touched by Hestia.
FAN_MODES = ("auto", "flamme", "manuel")
# What a person answers, on the phone (mobile_app_notification_action) or on the Poêle page.
ANSWERS = {"oui": "HESTIA_POELE_OUI", "non": "HESTIA_POELE_NON", "nettoye": "HESTIA_POELE_NETTOYE",
           "couper": "HESTIA_POELE_COUPER", "ignorer": "HESTIA_POELE_IGNORER"}
# Kept through a restart of Home Assistant; the sequences under way are not (a question left without its asker is
# dropped, a stop still wanted is started again from the stove's state).
KEPT = ("jour", "demarrages", "verrou", "verrou_off", "brasier_dit")


def kept(memory: dict | None) -> dict:
    return {k: v for k, v in (memory or {}).items() if k in KEPT and v is not None}


def _iso(value) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None


# The simulator's journal: what Hestia does, said in the conditional; the lines that only tell how the stove took an
# order of Hestia are left out (the house's own gestures say it).
WOULD = (("Hestia coupe le poêle", "Hestia couperait le poêle"),
         ("Hestia passe le thermostat", "Hestia passerait le thermostat"),
         ("Hestia vous prévient", "Hestia vous préviendrait"),
         ("Hestia demande votre accord", "Hestia demanderait votre accord"),
         ("Hestia met la ventilation", "Hestia mettrait la ventilation"),
         ("Hestia règle d’abord", "Hestia réglerait d’abord"),
         ("Hestia allume le poêle", "Hestia allumerait le poêle"),
         ("Hestia éteint le thermostat", "Hestia éteindrait le thermostat"),
         ("Hestia éteint le poêle", "Hestia éteindrait le poêle"),
         ("Hestia renvoie l’ordre d’arrêt", "Hestia renverrait l’ordre d’arrêt"),
         ("Pas de démarrage :", "Hestia ne démarrerait pas :"),
         ("Poêle repris en main : son thermostat rallumé", "Hestia reprendrait le poêle en main : son thermostat "
                                                          "rallumé"))


def _would(text: str) -> str | None:
    for now_, then in WOULD:
        if now_ in text:
            return text.replace(now_, then).replace(" attendra ", " attendrait ")
    return None


class _Run:
    """One look: the gestures to make, the events of the journal, when to look again."""

    def __init__(self, now: datetime, blank: bool = False) -> None:
        self.now, self.at, self.blank = now, hour(now), blank
        self.orders: list[dict] = []
        self.events: list[dict] = []
        self.wake: float | None = None

    def again(self, delay: timedelta, since: datetime | None = None) -> None:
        left = (delay - (self.now - since)) if since else delay
        seconds = max(1.0, left.total_seconds())
        self.wake = seconds if self.wake is None else min(self.wake, seconds)

    def thermostat(self, service: str, **data) -> None:
        self.orders.append({"geste": "thermostat", "service": service, "donnees": data})

    def stove(self, gesture: str, **extra) -> None:
        self.orders.append({"geste": gesture, **extra})

    def say(self, subject: str, title: str, text: str, actions: tuple[str, ...] = (), lasting: bool = False) -> None:
        self.orders.append({"geste": "notifier", "sujet": subject, "titre": title, "texte": text,
                            "actions": [ANSWERS[a] for a in actions], "persistante": lasting})

    def clear(self, subject: str) -> None:
        self.orders.append({"geste": "effacer", "sujet": subject})

    def log(self, text: str, sent: bool = True) -> None:
        if self.blank:
            text, sent = _would(text), False
            if text is None:
                return
        self.events.append({"heure": self.at, "qui": "hestia", "texte": text, "accord": None, "envoye": sent})

    def house_did_not(self, text: str) -> None:
        """The simulator: the house did not make the gesture Hestia would have made."""
        self.events.append({"heure": self.at, "qui": "maison", "texte": text, "accord": False})


def drive(decision: dict, stove: dict, thermostat: dict | None, pilot_mem: dict, now: datetime, ctx: dict) \
        -> tuple[list[dict], list[dict], dict, float | None]:
    """(the gestures to make now, the journal's events, what the Poêle page says, in how many seconds to look again).
    `pilot_mem`: the memory pilot.decide() returned (its « conduite » is this module's); `ctx`: `copie` (a stove
    copied from another house: nothing is ever sent), `reponses` ({answer: iso} since the last look), `brasier` (the
    fire pot's view), `prise_switch` (the plug's switch, or None), `couper_prise` (Réglages: cut the plug without an
    answer), `ha_depuis` (since when Home Assistant runs, None when it was already running), `ventilation` (Réglages:
    « auto » or « flamme », for flamme + 1)."""
    blank = bool(ctx.get("blanc"))
    run = _Run(now, blank)
    # A copy: the view may be built twice from the same memory in one look (the planning's orders), and only the last
    # one's gestures are made.
    mem = copy.deepcopy(pilot_mem.get("conduite") or {})
    pilot_mem["conduite"] = mem
    today = now.date().isoformat()
    if mem.get("jour") != today:
        mem.update(jour=today, demarrages=0)
    status = {"actif": not blank, "blanc": blank, "copie": bool(ctx.get("copie")),
              "demarrages": mem.get("demarrages", 0), "max_demarrages": int(tuning.get("demarrages_max")),
              "pilotable": bool(stove.get("pilotable"))}
    # The simulator sends nothing: it may rehearse on a copy (a lab).
    if (ctx.get("copie") and not blank) or not thermostat or not stove.get("pilotable"):
        status["texte"] = ("Ce poêle est recopié d’une autre maison : Hestia ne lui envoie rien." if ctx.get("copie")
                           else "Le pilote suit le thermostat du poêle : choisissez-le dans Réglages." if not thermostat
                           else "Le profil de ce poêle ne dit pas encore comment l’allumer et l’éteindre.")
        return [], [], status, None
    answers = {} if blank else {k: _iso(v) for k, v in (ctx.get("reponses") or {}).items() if k in ANSWERS}
    state = stove.get("etat")
    action = decision.get("action")
    preset, mode = thermostat.get("preset"), thermostat.get("mode")
    fresh = now.isoformat()

    _resync(run, mem, stove, thermostat, ctx)
    _cleaned(run, mem, thermostat, answers)
    # A lock is lifted when the thermostat, seen off since, is on again (switched on by hand).
    if mem.get("verrou"):
        if mode == "off":
            mem["verrou_off"] = True
        elif mem.get("verrou_off"):
            mem.update(verrou=None, verrou_off=None)
            run.clear("verrou")
            run.log("Le thermostat du poêle est rallumé : Hestia lève son verrou.", sent=False)
    # A stove lit without Hestia while its thermostat is in hors gel (1.0.0b5): Hestia puts the thermostat in boost,
    # then drives the stove from there (its flame, the house warm enough, a step to hors gel). Once for each lighting;
    # never while Hestia stops the stove or its thermostat is off (a lock).
    halting = bool(mem.get("arret") and not mem["arret"].get("fin"))
    if (state in BURNING and preset == "frost" and mode != "off" and action not in ("arreter", "couper")
            and not halting and not mem.get("adopte")):
        mem["adopte"] = fresh
        run.thermostat("set_preset_mode", preset_mode="boost")
        run.log("Le poêle a été allumé sans Hestia : Hestia passe le thermostat du poêle en boost pour le conduire.")
    elif state not in BURNING and state != "inconnu":
        mem["adopte"] = None
    # 1. Safety and stop, on the decision's change (the house's automations stop on a change, not on a state).
    before = mem.get("voulu")
    mem["voulu"] = action
    if action == "couper" and before != "couper":
        cut = (decision.get("texte") or "").split(" Le pilote ", 1)[0]
        if mode != "off":
            run.thermostat("turn_off")
        run.say("alarme", "Poêle coupé", cut + " Hestia a éteint son thermostat et arrête le poêle.", lasting=True)
        run.log(f"Hestia coupe le poêle : {_lower(cut)}")
        _stop_begin(mem, now)
    elif action == "arreter" and before not in ("arreter", "couper"):
        if preset != "frost" and mode != "off":
            # The house warm enough: hors gel, as the house's own rule does; the stop follows.
            run.thermostat("set_preset_mode", preset_mode="frost")
            run.log("Hestia passe le thermostat du poêle hors gel : la maison est assez chaude.")
        _stop_begin(mem, now)
    _stop(run, mem, stove, thermostat, decision, ctx, answers)
    # 2. A silent stove: said once, with its plug.
    if action == "alerter" and not mem.get("muet_dit"):
        mem["muet_dit"] = True
        plug = stove.get("prise_w")
        tail = ("" if plug is None else f" Sa prise tire {number(plug, 0)} W : il chauffe encore et ne reçoit plus "
                "d’ordre." if plug > tuning.get("prise_brule_w") else " Sa prise est au repos : il est à l’arrêt.")
        silent_min = number(tuning.get("muet_min"), 0)
        run.say("muet", "Poêle injoignable", f"Le poêle ne répond plus depuis {silent_min} minutes." + tail,
                ("couper",) if ctx.get("prise_switch") else (), lasting=True)
        run.log(f"Le poêle ne répond plus depuis {silent_min} minutes : Hestia vous prévient." + tail, sent=False)
    elif state != "inconnu" and mem.get("muet_dit"):
        mem["muet_dit"] = None
        run.clear("muet")
    stopping = bool(mem.get("arret") and not mem["arret"].get("fin"))
    if answers.get("couper") and mem.get("muet_dit") and ctx.get("prise_switch") and not stopping:
        # « Couper la prise » on the silent stove's notice: the person chose it.
        run.stove("prise", on=False)
        run.log("Vous avez demandé de couper la prise du poêle injoignable : Hestia la coupe.")
    # 4. Start, refuse, or ask: on the thermostat's step up only (pilot.decide marks it with this look's time).
    if action == "demarrer" and pilot_mem.get("demarrage") == fresh:
        _start_begin(run, mem, now, "le thermostat est passé en boost")
    elif action == "refuser" and (pilot_mem.get("refus") or {}).get("a") == fresh:
        _refuse(run, mem, decision, mode)
    elif action == "demander" and pilot_mem.get("demande") == fresh and not mem.get("question"):
        # The simulator only says it: the person answers the house's own question, not Hestia's.
        mem["question"] = None if blank else {"a": fresh, "sujet": "saison"}
        run.say("saison", "Saison douce : allumer le poêle ?", decision.get("texte") or "", ("oui", "non"), lasting=True)
        run.log("Hestia demande votre accord pour démarrer le poêle (saison douce).", sent=False)
    _question(run, mem, stove, thermostat, answers)
    fan = ctx.get("ventilation") if ctx.get("ventilation") in FAN_MODES else "auto"
    # The fan's AUTO goes before a start only when the stove leads it; the ÉCO Stop and the stove's own set point as
    # chosen in Réglages (ctx « reglages_poele »).
    _start(run, mem, stove, thermostat, skip=("ventilation",) if fan != "auto" else ())
    _fan(run, mem, stove, fan)
    # 3. The fire pot full: said once (the burning goes on, the next start waits for « J'ai nettoyé »).
    fire_pot = ctx.get("brasier") or {}
    if fire_pot.get("a_nettoyer") and not mem.get("brasier_dit"):
        mem["brasier_dit"] = True
        run.say("nettoyage", "Brasier à nettoyer", fire_pot.get("texte") or "", ("nettoye",))
        run.log("Brasier à nettoyer : Hestia vous prévient ; le prochain démarrage attendra « J’ai nettoyé ».",
                sent=False)
    elif not fire_pot.get("a_nettoyer"):
        mem["brasier_dit"] = None
    status.update(_status(mem, stove, now, blank))
    status["demarrages"] = mem.get("demarrages", 0)
    return ([] if blank else run.orders), run.events, status, run.wake


def _lower(text: str | None) -> str:
    text = text or ""
    return text[:1].lower() + text[1:]


# --- the front fan -------------------------------------------------------------------------------------------------

def fan_only(stove: dict, pilot_mem: dict, now: datetime, copy_of: bool) -> tuple[list[dict], list[dict], float | None]:
    """The fan « Automatique, par Hestia » (flamme + 1) while Hestia does not light and stop the stove (1.0.0b3): the
    same rule as in « Entier », from its own memory (`ventilation_seule`). Nothing for a stove copied from another
    house. (the gestures, the journal's events, in how many seconds to look again)."""
    if copy_of:
        pilot_mem.pop("ventilation_seule", None)
        return [], [], None
    run = _Run(now)
    holder = {"ventilation": copy.deepcopy(pilot_mem.get("ventilation_seule"))}
    _fan(run, holder, stove, "flamme")
    pilot_mem["ventilation_seule"] = holder.get("ventilation")
    return run.orders, run.events, run.wake


def _fan(run: _Run, mem: dict, stove: dict, fan: str) -> None:
    """« Flamme + 1 » (1.0): while the stove lights or burns, its front fan at its lowest until the smoke reaches 110 °C
    (then it stays warm until the stove stops), then at the flame + 1, 5 at most. One order at most every 10 minutes,
    and only while more than 6 of the day's orders are left: the start and the stop come first."""
    seq = mem.get("ventilation") or {}
    levels = stove.get("ventilation_niveaux") or []
    state = stove.get("etat")
    if fan != "flamme" or not levels or state not in ("allumage", "chauffe"):
        if state not in BURNING:
            mem["ventilation"] = None
        return
    smoke, flame = stove.get("fumees"), stove.get("flamme")
    warm = bool(seq.get("chaud")) or (state == "chauffe" and smoke is not None and smoke >= tuning.get("ventil_fumees_c"))
    seq["chaud"] = warm
    mem["ventilation"] = seq
    if warm and flame is not None:
        top = min(int(flame) + 1, FAN_TOP)
        want = max((x for x in levels if int(x) <= top), key=int, default=levels[0])
        why = f"flamme {int(flame)} + 1"
    else:
        want, why = levels[0], f"au plus bas tant que les fumées sont sous {degrees(tuning.get('ventil_fumees_c'))}"
    current = stove.get("ventilation")
    if current is None or str(current).casefold() == want.casefold() or (run.blank and seq.get("voulu") == want):
        return
    last = _iso(seq.get("a"))
    every = tuning.minutes("ventil_rythme_min")
    if last and run.now - last < every:
        run.again(every, last)
        return
    writes, cap = stove.get("ecritures"), stove.get("ecritures_max")
    if writes is not None and cap and cap - writes <= tuning.get("garde_ventil"):
        return
    seq.update(a=run.now.isoformat(), voulu=want)
    run.stove("ventilation", valeur=want)
    run.log(f"Hestia met la ventilation à {want} : {why}.")


# --- start ---------------------------------------------------------------------------------------------------------

def _start_begin(run: _Run, mem: dict, now: datetime, why: str) -> None:
    if mem.get("allumage") and not mem["allumage"].get("fin"):
        return  # one start at a time: a second step up during a start is ignored, on purpose
    most = int(tuning.get("demarrages_max"))
    if mem.get("demarrages", 0) >= most:
        run.say("refus", "Pas de démarrage", f"Hestia a déjà démarré le poêle {most} fois aujourd’hui : "
                "allumez-le vous-même si vous le voulez.")
        run.log(f"Pas de démarrage : déjà {most} aujourd’hui.", sent=False)
        return
    mem["allumage"] = {"a": now.isoformat(), "phase": "reglages", "essai": 1, "pourquoi": why}
    mem["arret"] = None


def _start(run: _Run, mem: dict, stove: dict, thermostat: dict, skip: tuple = ()) -> None:
    seq = mem.get("allumage")
    if not seq or seq.get("fin"):
        return
    now = run.now
    since = _iso(seq.get("depuis")) or _iso(seq["a"])
    if seq["phase"] == "reglages":
        if stove.get("etat") in BURNING:
            seq.update(fin="deja", depuis=now.isoformat())
            run.log("Le poêle est déjà en route : rien à allumer.", sent=False)
            return
        writes, cap = stove.get("ecritures"), stove.get("ecritures_max")
        left = None if writes is None or not cap else cap - writes
        names = []
        for s in stove.get("reglages") or ():
            if s["role"] in skip:
                continue
            if s.get("a_changer") and (not s.get("reserve") or left is None or left > s["reserve"]):
                run.stove("reglage", role=s["role"], nom=s["nom"])
                names.append(s["nom"])
        if run.blank and names:
            run.log(f"Hestia règle d’abord : {', '.join(names)}.")
        seq.update(phase="ordre", depuis=now.isoformat())
        run.again(SETTLE)
        return
    if seq["phase"] == "ordre":
        if now - since < SETTLE:
            run.again(SETTLE, since)
            return
        run.stove("allumer")
        mem["demarrages"] = mem.get("demarrages", 0) + 1
        run.log(f"Hestia allume le poêle ({seq.get('pourquoi')}).")
        seq.update(phase="controle", depuis=now.isoformat())
        run.again(tuning.minutes("allumage_verif_min"))
        return
    if seq["phase"] == "controle":
        if stove.get("allume") or stove.get("etat") in BURNING:
            seq.update(fin="ok", depuis=now.isoformat())
            if seq.get("essai", 1) > 1 or mem.get("injoignable"):
                mem["injoignable"] = None
                run.clear("injoignable")
            run.log("Le poêle a pris l’ordre d’allumage.", sent=False)
            return
        if now - since < tuning.minutes("allumage_verif_min"):
            run.again(tuning.minutes("allumage_verif_min"), since)
            return
        if run.blank:
            # The simulator: the house did not light it; Hestia would have reloaded the stove's integration.
            seq.update(fin="maison", depuis=now.isoformat())
            run.house_did_not(f"La maison n’a pas allumé le poêle dans les {number(tuning.get('allumage_verif_min'), 0)} minutes.")
            return
        if seq.get("essai", 1) == 1:
            run.stove("recharger")
            run.log(f"Le poêle n’a pas pris l’ordre en {number(tuning.get('allumage_verif_min'), 0)} minutes : Hestia recharge son intégration et réessaie.")
            seq.update(phase="relance", essai=2, depuis=now.isoformat())
            run.again(tuning.seconds("recharge_s"))
            return
        seq.update(fin="rate", depuis=now.isoformat())
        mem["injoignable"] = True
        run.say("injoignable", "Le poêle ne répond pas", "L’ordre d’allumage n’est pas passé, même après avoir rechargé "
                "son intégration. Vérifiez le poêle et sa connexion.", lasting=True)
        run.log("L’ordre d’allumage n’est pas passé.", sent=False)
        return
    if seq["phase"] == "relance":
        if now - since < tuning.seconds("recharge_s"):
            run.again(tuning.seconds("recharge_s"), since)
            return
        run.stove("allumer")
        run.log("Hestia renvoie l’ordre d’allumage.")
        seq.update(phase="controle", depuis=now.isoformat())
        run.again(tuning.minutes("allumage_verif_min"))


def _reason(decision: dict) -> str:
    """The reason of a refusal, from the decision's text, said in the present (« le brasier est à nettoyer »)."""
    text = (decision.get("texte") or "").split(", mais ", 1)[-1].rstrip(".")
    return text.replace(" : il éteindrait son thermostat", "")


def _refuse(run: _Run, mem: dict, decision: dict, mode: str | None) -> None:
    """A start refused: the thermostat off when the reason must lock (too hot, the fire pot, an alarm, silence), as
    the house's start manager does; the house warm enough, or the thermostat off: said only."""
    text, reason = decision.get("texte") or "", _reason(decision)
    lock = next((key for key, words in (("brasier", "brasier"), ("surchauffe", "au-dessus de"), ("alarme", "en alarme"),
                                         ("muet", "ne répond pas")) if words in text), None)
    title = {"brasier": "Démarrage annulé : brasier à nettoyer", "surchauffe": "Démarrage annulé : pièce trop chaude",
             "alarme": "Démarrage annulé : poêle en alarme", "muet": "Démarrage annulé : poêle injoignable"}.get(
                 lock, "Poêle non lancé" if "thermostat est éteint" in text else "Pas de démarrage")
    said = f"Le thermostat est passé en boost, mais {reason}."
    if lock and mode != "off":
        run.thermostat("turn_off")
        # The simulator keeps no lock: the thermostat stays as the house leaves it.
        mem.update(verrou=None if run.blank else lock, verrou_off=None)
        said += (" Hestia a éteint le thermostat du poêle : « J’ai nettoyé » le rallumera." if lock == "brasier"
                 else " Hestia a éteint le thermostat du poêle : rallumez-le quand ce sera réglé.")
        run.log(f"Hestia éteint le thermostat du poêle : {reason}.")
    else:
        run.log(f"Pas de démarrage : {reason}.", sent=False)
    if lock == "brasier":
        # The fire pot's own notice, more complete: it takes its place (the same tag on the phone).
        mem["brasier_dit"] = True
    run.say("nettoyage" if lock == "brasier" else "verrou" if lock else "refus", title, said,
            ("nettoye",) if lock == "brasier" else (), lasting=bool(lock))


def _question(run: _Run, mem: dict, stove: dict, thermostat: dict, answers: dict) -> None:
    """The mild season's question: Oui starts, Non (or the preset leaving boost, or the thermostat off) does not; no
    answer in 15 minutes: hors gel, unless the stove is already on its way."""
    q = mem.get("question")
    if not q or q.get("sujet") != "saison":
        return
    asked = _iso(q["a"])
    left = thermostat.get("preset") != "boost" or thermostat.get("mode") == "off"
    if answers.get("oui") and not left and not answers.get("non"):
        mem["question"] = None
        run.clear("saison")
        run.log("Vous avez dit oui.", sent=False)
        _start_begin(run, mem, run.now, "vous avez dit oui")
        return
    if left:
        mem["question"] = None
        run.clear("saison")
        run.log("Pas de démarrage : le thermostat a quitté le boost.", sent=False)
        return
    if answers.get("non"):
        mem["question"] = None
        run.clear("saison")
        run.thermostat("set_preset_mode", preset_mode="frost")
        run.log("Vous avez dit non : Hestia remet le thermostat du poêle hors gel.")
        return
    if run.now - asked < tuning.minutes("reponse_min"):
        run.again(tuning.minutes("reponse_min"), asked)
        return
    mem["question"] = None
    run.clear("saison")
    if stove.get("etat") in BURNING or stove.get("allume"):
        run.log("Pas de réponse, mais le poêle est déjà en route : Hestia ne coupe rien.", sent=False)
        return
    run.thermostat("set_preset_mode", preset_mode="frost")
    run.log(f"Pas de réponse en {number(tuning.get('reponse_min'), 0)} minutes : Hestia remet le thermostat du "
            "poêle hors gel.")


# --- stop ----------------------------------------------------------------------------------------------------------

def _stop_begin(mem: dict, now: datetime) -> None:
    if mem.get("arret") and not mem["arret"].get("fin"):
        return
    mem["arret"] = {"a": now.isoformat(), "phase": "attente", "essais": 0}
    if mem.get("allumage") and not mem["allumage"].get("fin"):
        mem["allumage"].update(fin="annule", depuis=now.isoformat())


def _wanted_off(decision: dict, thermostat: dict) -> bool:
    return (decision.get("action") in ("arreter", "couper") or thermostat.get("preset") == "frost"
            or thermostat.get("mode") == "off")


def _stop(run: _Run, mem: dict, stove: dict, thermostat: dict, decision: dict, ctx: dict, answers: dict) -> None:
    seq = mem.get("arret")
    if not seq or seq.get("fin"):
        return
    now, state = run.now, stove.get("etat")
    since = _iso(seq.get("depuis")) or _iso(seq["a"])
    if not _wanted_off(decision, thermostat) and seq["phase"] in ("attente", "ordres"):
        seq.update(fin="annule", depuis=now.isoformat())
        run.log("Arrêt abandonné : le thermostat redemande de la chaleur.", sent=False)
        return
    if seq["phase"] == "attente":
        if state == "inconnu" and now - since < STATE_WAIT:
            run.again(STATE_WAIT, since)
            return
        seq.update(phase="ordres", depuis=(now - STOP_EVERY).isoformat())
        since = _iso(seq["depuis"])
    if seq["phase"] == "ordres":
        if state in STOPPED and seq["essais"]:
            _verify_later(run, seq, f"Le poêle a pris l’ordre d’arrêt : il s’éteint. Hestia vérifie dans {_verify_min()} minutes.")
            return
        if state in STOPPED and not seq["essais"]:
            seq.update(phase="verif", depuis=now.isoformat())
            run.again(tuning.minutes("arret_verif_min"))
            return
        if run.blank and seq["essais"]:
            # The simulator: the house's own stop is waited for, never a second order.
            if now - since < HOUSE_STOP:
                run.again(HOUSE_STOP, since)
                return
            seq.update(fin="maison", depuis=now.isoformat())
            run.house_did_not("La maison n’a pas éteint le poêle dans les 5 minutes.")
            return
        if now - since < STOP_EVERY:
            run.again(STOP_EVERY, since)
            return
        tries = int(tuning.get("arret_ordres"))
        if seq["essais"] >= tries:
            run.say("arret", "Ordre d’extinction non confirmé", f"Le poêle n’a pas confirmé son arrêt après {tries} "
                    f"ordres. Hestia vérifie dans {_verify_min()} minutes.")
            _verify_later(run, seq, f"Ordre d’extinction non confirmé : vérification dans {_verify_min()} minutes.")
            return
        seq["essais"] += 1
        seq["depuis"] = now.isoformat()
        run.stove("eteindre")
        run.log("Hestia éteint le poêle." if seq["essais"] == 1 else f"Hestia renvoie l’ordre d’arrêt ({seq['essais']}/{tries}).")
        run.again(HOUSE_STOP if run.blank else STOP_EVERY)
        return
    if seq["phase"] == "verif":
        if now - since < tuning.minutes("arret_verif_min"):
            run.again(tuning.minutes("arret_verif_min"), since)
            return
        if not _wanted_off(decision, thermostat):
            seq.update(fin="annule", depuis=now.isoformat())
            return
        done = _stopped(stove)
        if done:
            seq.update(fin="ok", depuis=now.isoformat())
            run.log(f"Arrêt vérifié : {done}.", sent=False)
            return
        run.say("arret", "Le poêle chauffe encore", f"{_verify_min()} minutes après l’ordre d’arrêt, le poêle chauffe "
                "encore. Hestia renvoie l’ordre.")
        run.stove("eteindre")
        run.log(f"Le poêle chauffe encore {_verify_min()} minutes après : Hestia renvoie l’ordre d’arrêt.")
        if run.blank:
            seq.update(fin="encore", depuis=now.isoformat())
            return
        seq.update(phase="renvoi", depuis=now.isoformat())
        run.again(RESEND_CHECK)
        return
    if seq["phase"] == "renvoi":
        if now - since < RESEND_CHECK:
            run.again(RESEND_CHECK, since)
            return
        plug = stove.get("prise_w")
        if (plug is not None and plug < tuning.get("prise_repos_w")) or state in ("extinction", "eteint"):
            seq.update(fin="ok", depuis=now.isoformat())
            run.say("arret", "Poêle arrêté", "Le poêle a pris l’ordre d’arrêt.")
            run.log("Le poêle a pris le second ordre d’arrêt.", sent=False)
            return
        if not ctx.get("prise_switch"):
            seq.update(fin="rate", depuis=now.isoformat())
            run.say("alerte", "Le poêle chauffe toujours", "Il ne prend pas l’ordre d’arrêt. Coupez-le vous-même.",
                    lasting=True)
            run.log("Le poêle ne prend pas l’ordre d’arrêt, et Hestia ne connaît pas sa prise.", sent=False)
            return
        run.say("alerte", "Alerte : le poêle chauffe toujours", "Il ne prend pas l’ordre d’arrêt. Couper la prise ? Sans "
                f"réponse en {number(tuning.get('prise_reponse_min'), 0)} minutes, " + ("Hestia la coupe." if ctx.get("couper_prise") else "Hestia ne fait rien."),
                ("couper", "ignorer"), lasting=True)
        seq.update(phase="prise", depuis=now.isoformat())
        run.again(tuning.minutes("prise_reponse_min"))
        return
    if seq["phase"] == "prise":
        if answers.get("ignorer"):
            seq.update(fin="ignore", depuis=now.isoformat())
            run.clear("alerte")
            run.log("Vous avez choisi de ne pas couper la prise.", sent=False)
            return
        if not answers.get("couper") and now - since < tuning.minutes("prise_reponse_min"):
            run.again(tuning.minutes("prise_reponse_min"), since)
            return
        if not answers.get("couper") and not ctx.get("couper_prise"):
            seq.update(fin="rate", depuis=now.isoformat())
            run.log("Pas de réponse : Hestia ne coupe pas la prise (Réglages).", sent=False)
            return
        run.stove("prise", on=False)
        run.say("alerte", "Prise du poêle coupée", "Hestia a coupé la prise du poêle : il ne prenait pas l’ordre "
                "d’arrêt.", lasting=True)
        run.log("Hestia coupe la prise du poêle.")
        seq.update(fin="prise", depuis=now.isoformat())


def _verify_later(run: _Run, seq: dict, text: str) -> None:
    seq.update(phase="verif", depuis=run.now.isoformat())
    run.log(text, sent=False)
    run.again(tuning.minutes("arret_verif_min"))


def _verify_min() -> str:
    return number(tuning.get("arret_verif_min"), 0)


def _stopped(stove: dict) -> str | None:
    """Why the stove counts as stopped, from the surest to the least sure, or None."""
    state, smoke, plug = stove.get("etat"), stove.get("fumees"), stove.get("prise_w")
    if state in ("extinction", "nettoyage"):
        return "il finit son cycle d’extinction"
    if state == "eteint":
        return "il est éteint"
    if state not in ("inconnu", None) and smoke is not None and smoke < tuning.get("fumees_froides_c"):
        return f"ses fumées sont à {degrees(smoke)}"
    if plug is not None and plug < tuning.get("prise_repos_w"):
        return f"sa prise tire {number(plug, 0)} W"
    return None


# --- after a restart, and « J'ai nettoyé » -------------------------------------------------------------------------

def _resync(run: _Run, mem: dict, stove: dict, thermostat: dict, ctx: dict) -> None:
    """3 minutes after Home Assistant started, once the stove's state is known: a stove that burns while its
    thermostat is off (restored off by the restart) gets its thermostat back, in boost. Nothing to the stove."""
    started = _iso(ctx.get("ha_depuis"))
    if started is None or mem.get("reprise"):
        return
    elapsed = run.now - started
    if elapsed < RESYNC_AFTER:
        run.again(RESYNC_AFTER, started)
        return
    if stove.get("etat") == "inconnu" and elapsed < RESYNC_UNTIL:
        run.again(timedelta(seconds=30))
        return
    mem["reprise"] = True
    if stove.get("etat") in BURNING and thermostat.get("mode") == "off":
        run.thermostat("set_hvac_mode", hvac_mode="heat")
        run.thermostat("set_preset_mode", preset_mode="boost")
        run.say("reprise", "Poêle repris en main", "Après le redémarrage de Home Assistant, le poêle brûlait avec son "
                "thermostat éteint : Hestia a rallumé le thermostat, en boost.")
        run.log("Poêle repris en main : son thermostat rallumé en boost après le redémarrage.")


def _cleaned(run: _Run, mem: dict, thermostat: dict, answers: dict) -> None:
    """« J'ai nettoyé » : the lock of the fire pot is lifted (the thermostat on again, in hors gel)."""
    if not answers.get("nettoye"):
        return
    run.clear("nettoyage")
    if mem.get("verrou") == "brasier":
        mem.update(verrou=None, verrou_off=None)
        run.thermostat("set_preset_mode", preset_mode="frost")
        run.thermostat("turn_on")
        run.clear("verrou")
        run.say("nettoyage", "Poêle prêt", "Brasier nettoyé : le thermostat du poêle est rallumé, en hors gel. Le poêle "
                "démarrera au prochain boost.")
        run.log("Brasier nettoyé : Hestia rallume le thermostat du poêle, en hors gel.")


# --- what the page says --------------------------------------------------------------------------------------------

def _status(mem: dict, stove: dict, now: datetime, blank: bool = False) -> dict:
    start, stop, q = mem.get("allumage") or {}, mem.get("arret") or {}, mem.get("question")
    if blank:
        # The simulator: what Hestia would be doing now, if anything.
        out = {"question": None, "sequence": None, "texte": None, "verrou": None, "injoignable": False}
        if start and not start.get("fin"):
            out.update(sequence="allumage", texte="Hestia allumerait le poêle maintenant : la maison le fait-elle "
                                                  "aussi ?")
        elif stop and not stop.get("fin"):
            since = _iso(stop.get("depuis")) or _iso(stop.get("a")) or now
            out.update(sequence="arret", texte=f"Hestia vérifierait l’arrêt à {hour(since + tuning.minutes("arret_verif_min"))}."
                       if stop.get("phase") == "verif" else "Hestia éteindrait le poêle maintenant : la maison le "
                       "fait-elle aussi ?")
        return out
    out: dict = {"question": None, "sequence": None, "texte": None, "verrou": mem.get("verrou"),
                 "injoignable": bool(mem.get("injoignable"))}
    if q:
        left = max(0, int((tuning.minutes("reponse_min") - (now - _iso(q["a"]))).total_seconds() // 60))
        out["question"] = {"sujet": q["sujet"], "texte": "Saison douce : allumer le poêle ?",
                           "reste_min": left, "reponses": ["oui", "non"]}
        out["texte"] = f"Saison douce : Hestia attend votre accord pour allumer le poêle, encore {left} min."
    if stop.get("phase") == "prise" and not stop.get("fin"):
        out["question"] = {"sujet": "prise", "texte": "Le poêle chauffe toujours : couper sa prise ?",
                           "reponses": ["couper", "ignorer"]}
    if start and not start.get("fin"):
        out["sequence"] = "allumage"
        out["texte"] = {"reglages": "Hestia prépare l’allumage.", "ordre": "Hestia prépare l’allumage.",
                        "controle": f"Allumage envoyé : Hestia vérifie que le poêle le prend ({number(tuning.get('allumage_verif_min'), 0)} minutes).",
                        "relance": "Intégration du poêle rechargée : Hestia renvoie l’ordre."}.get(start["phase"])
    elif stop and not stop.get("fin"):
        out["sequence"] = "arret"
        since = _iso(stop.get("depuis")) or _iso(stop.get("a")) or now
        out["texte"] = {"attente": "Hestia attend que le poêle dise son état pour l’éteindre.",
                        "ordres": f"Hestia éteint le poêle ({stop.get('essais', 0)}/3).",
                        "verif": f"Arrêt en cours : vérification à {hour(since + tuning.minutes("arret_verif_min"))}.",
                        "renvoi": "Le poêle chauffait encore : ordre d’arrêt renvoyé.",
                        "prise": "Le poêle chauffe toujours : couper sa prise ?"}.get(stop["phase"])
    elif mem.get("injoignable"):
        out["texte"] = "Le dernier ordre d’allumage n’est pas passé."
    elif mem.get("verrou"):
        out["texte"] = {"brasier": "Thermostat éteint par Hestia : brasier à nettoyer (« J’ai nettoyé » le rallume).",
                        "surchauffe": "Thermostat éteint par Hestia : la pièce était trop chaude.",
                        "alarme": "Thermostat éteint par Hestia : le poêle était en alarme.",
                        "muet": "Thermostat éteint par Hestia : le poêle ne répondait pas."}.get(mem["verrou"])
    return out
