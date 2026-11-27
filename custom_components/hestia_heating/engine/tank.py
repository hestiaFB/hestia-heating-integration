"""The pellets' tank empty, seen from the smoke (1.1.0b9; Frank, 27 November: « le réservoir est vide, il n'y a pas
de capteur, et le poêle se met en arrêt tout seul au bout d'un moment », « c'est valable pour mon poêle mais pas
forcément pour tous les poêles »). Plain Python.

On 27 November the stove burnt on at flame 1, its status « On », no alarm, its tank empty: its smoke, 115 to 125 °C
at flame 1 on the days before, fell under 115 °C at 19 h 03, to 100 °C at 19 h 17, then from 96 °C at 19 h 37 to 76 °C
at 19 h 55, the flame never changed; its plug lost 30 W at 19 h 47 (the fan stopping on a cold smoke).

No figure is the same from one stove to another: Hestia learns each stove's own smoke at each flame, while the flame
holds and nothing is in doubt (a running mean, from the stove's own readings), and says nothing for a flame it has not
learnt yet. Then, the stove in « chauffe », the flame unchanged for `reservoir_stable_min` minutes:

- the smoke `reservoir_ecart_c` under its usual level at this flame, or fallen by `reservoir_chute_c` in 10 minutes
  and already half of it down: « Réservoir vide ? »;
- the doubt stays while the stove stops by itself (it said nothing), and goes when the stove burns again with its
  smoke back near its usual level (the tank filled).

`reservoir_ecart_c` at 0: never (a stove whose smoke says nothing of this). The pellets are not counted while in doubt.
"""
from __future__ import annotations

from datetime import datetime, timedelta

from . import tuning
from .phrases import degrees, hour

READ_EVERY = timedelta(minutes=1)
KEEP = timedelta(minutes=15)
DROP_OVER = timedelta(minutes=10)
LEARN_EVERY = timedelta(minutes=5)
LEARNT = 6              # readings, 5 minutes apart: half an hour of a steady flame before a flame's level counts
MEAN_OVER = 30          # the running mean weighs the last 30 readings or so


def _iso(value) -> datetime | None:
    try:
        return datetime.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None


def watch(memory: dict | None, stove: dict | None, now: datetime) -> tuple[dict, dict | None]:
    """(the new memory, the doubt or None): {"depuis", "texte", "fumees", "normal", "flamme"}."""
    mem = dict(memory or {})
    norms = {k: dict(v) for k, v in (mem.get("normes") or {}).items()}
    mem["normes"] = norms
    gap = tuning.get("reservoir_ecart_c")
    doubt = mem.get("doute") or None
    if not stove or not gap:
        mem["doute"] = None
        return mem, None
    state, flame, smoke = stove.get("etat"), stove.get("flamme"), stove.get("fumees")
    if state != "chauffe" or not isinstance(flame, int) or smoke is None:
        # Not burning steadily: no reading; a doubt stays while the stove stops by itself.
        mem.update(flamme=None, flamme_a=None, releves=[])
        if doubt and state not in ("eteint", "extinction", "alarme", "inconnu", "allumage", "nettoyage"):
            doubt = None
        mem["doute"] = doubt
        return mem, _shown(doubt, stove)
    if mem.get("flamme") != flame:
        mem.update(flamme=flame, flamme_a=now.isoformat(), releves=[])
    since = _iso(mem.get("flamme_a")) or now
    rows = [r for r in mem.get("releves") or () if _iso(r[0]) and now - _iso(r[0]) <= KEEP]
    if not rows or now - _iso(rows[-1][0]) >= READ_EVERY:
        rows.append([now.isoformat(), round(float(smoke), 1)])
    mem["releves"] = rows
    steady = now - since >= tuning.minutes("reservoir_stable_min")
    norm = norms.get(str(flame))
    known = bool(norm and norm.get("n", 0) >= LEARNT)
    if doubt:
        # Back near its usual level: the tank was filled (or it was not empty).
        level = (doubt.get("normal") if not known else norm["c"]) or 0
        if smoke >= level - gap / 3:
            doubt = None
    elif steady and known:
        recent = [r[1] for r in rows if now - _iso(r[0]) <= DROP_OVER]
        fell = (max(recent) - smoke) if recent else 0
        if smoke <= norm["c"] - gap or (fell >= tuning.get("reservoir_chute_c") and smoke <= norm["c"] - gap / 2):
            doubt = {"depuis": now.isoformat(), "flamme": flame, "normal": round(norm["c"], 1)}
    if doubt:
        doubt = {**doubt, "fumees": round(float(smoke), 1)}
    elif steady and _settled(rows, gap) and (not known or -gap / 4 <= smoke - norm["c"] <= gap / 2):
        # Learn the flame's level: only while nothing is in doubt, the smoke settled (no more than half the gap between
        # its readings of the last 15 minutes: a tank that empties while Hestia learns is not learnt), and near what
        # it knows (a quarter of the gap under it at most: a slow fall is not learnt either).
        learnt_at = _iso((norm or {}).get("a"))
        if learnt_at is None or now - learnt_at >= LEARN_EVERY:
            n = (norm or {}).get("n", 0)
            c = float(smoke) if not norm else norm["c"] + (float(smoke) - norm["c"]) / min(n + 1, MEAN_OVER)
            norms[str(flame)] = {"c": round(c, 2), "n": n + 1, "a": now.isoformat()}
    mem["doute"] = doubt
    return mem, _shown(doubt, stove)


def _settled(rows: list, gap: float) -> bool:
    values = [r[1] for r in rows]
    return len(values) >= 2 and max(values) - min(values) <= gap / 2


def _shown(doubt: dict | None, stove: dict) -> dict | None:
    if not doubt:
        return None
    since = _iso(doubt.get("depuis"))
    smoke, normal = doubt.get("fumees"), doubt.get("normal")
    if stove.get("etat") == "chauffe":
        text = (f"Les fumées du poêle sont à {degrees(smoke)}, alors qu’elles sont d’habitude vers {degrees(normal)} "
                f"en flamme {doubt.get('flamme')}, et la flamme n’a pas changé : son réservoir de granulés est "
                "peut-être vide.")
        plug = stove.get("prise_w")
        if plug is not None:
            text += f" Sa prise tire {round(plug)} W."
    else:
        text = (f"Le poêle s’est arrêté après des fumées tombées à {degrees(smoke)} (d’habitude vers "
                f"{degrees(normal)}) depuis {hour(since) if since else 'tout à l’heure'} : son réservoir de granulés "
                "est peut-être vide.")
    return {"depuis": doubt.get("depuis"), "texte": text}
