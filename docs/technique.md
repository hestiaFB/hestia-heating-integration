# Hestia Chauffage — fonctionnement technique

Version 0.4.0b1. Ce document décrit ce que la brique lit, ce qu’elle publie et comment elle tient sur un petit matériel. Le pourquoi est dans le [cahier des charges](CAHIER-DES-CHARGES.md).

## Les fichiers

| Fichier | Rôle |
| --- | --- |
| `reader.py` | Tout ce qui touche Home Assistant : registres, états, historique, l’interface d’Hestia Weather. Ne fait que lire. |
| `engine/` | Python pur, testé sans Home Assistant : `sources.py` (un thermostat → une source), `stove.py` (le poêle et les granulés), `planning.py` (Scheduler), `home_planning.py` (le planning Hestia), `pilot.py` (le pilote du poêle, à l’ombre), `house.py` (la maison en une phrase), `phrases.py` (les mots), `profiles.py` (les profils de poêle), `legacy.py` (anciens noms du panneau, lus par le socle). |
| `profiles/*.json` | Un profil par intégration de poêle, sans code. |
| `coordinator.py` | Écoute les entités trouvées, recalcule, prévient les abonnés, envoie les créneaux du planning Hestia quand il commande. Garde les réglages (`.storage/hestia_heating.reglages`) et le dernier créneau traité de chaque ligne (`.storage/hestia_heating.planning_etat`). |
| `api.py` | L’interface pour les autres briques, `hass.data["hestia_heating_api"]`. |
| `websocket.py` | Les commandes du panneau et de la carte. |
| `sensor.py`, `binary_sensor.py` | Les quelques entités publiées. |
| `panel.py` | L’onglet « Chauffage » du panneau Hestia-FB et la carte, par le socle. |
| `socle.py`, `recorder_history.py`, `domain_migration.py` | Copies du socle commun (`hestia-ecosysteme/socle/`), jamais modifiées ici. |

## Ce qui est lu

`discover()` parcourt les registres au démarrage, puis 5 s après chaque changement d’entité, d’appareil ou de pièce. `snapshot()` lit ensuite seulement les états de ce qui a été trouvé.

- **Les thermostats** : tout `climate` de Versatile Thermostat, et tout autre `climate` qui donne une température. Sont écartés : les climates pilotés par un Versatile Thermostat (comptés une fois, par lui), ceux de l’intégration du poêle, les entités désactivées. La pièce est celle de l’entité, sinon celle de son appareil.
- **Un Versatile Thermostat recopié** (par Remote Home Assistant, comme au labo) n’a plus la plateforme de Versatile Thermostat : il est reconnu à ses attributs (`vtherm_over_switch`…). Sans pièce, chaque thermostat est sa propre pièce, à son nom.
- **Le type** : `pac` s’il chauffe et refroidit, `clim` s’il ne fait que refroidir, `vanne` pour un Versatile Thermostat sur vanne, sinon `radiateur` (ou `autre`).
- **Le poêle** : le premier appareil d’une intégration qui a un profil, dont les entités donnent au moins le rôle `etat`. Chaque rôle est trouvé par son domaine et la fin de son identifiant ; à égalité, l’identifiant le plus court gagne (`_power` ne prend pas `_real_power`).
- **Un poêle recopié**, sans son appareil : reconnu aux identifiants de ses entités, quand un même début porte l’état, la flamme et les fumées ou l’alarme du profil (`sensor.poele_status`, `number.poele_power`, `sensor.poele_smoke_temperature`). Ses climates (ceux dont l’identifiant commence ainsi) ne comptent pas comme des thermostats de la maison.
- **Le compteur d’énergie** de chaque thermostat (kWh, gardé en statistique) : un capteur d’énergie de son appareil, sinon celui dont l’identifiant commence comme le sien (`sensor.vt_bureau_energy`) ; le plus court gagne.
- **Son thermostat** : celui choisi dans Réglages, sinon le Versatile Thermostat dont une entité pilotée appartient au poêle, sinon celui dont le nom dit « poêle ». Son type devient `poele` et sa puissance électrique `None` : le poêle ne compte jamais comme de l’électrique.
- **La prise** : celle choisie dans Réglages, sinon un capteur de puissance dont le nom dit « poêle », une prise d’abord (« prise », « plug »…). Sont écartés les capteurs de l’appareil du poêle et ceux d’un thermostat (`sensor.thermostat_poele_mean_power_cycle`). Au-delà de 15 W, le poêle « tourne ».
- **Les granulés** : les capteurs qui portent l’attribut `suivi_stock_pellet_key` (Suivi Stock Pellet). Jours restants = stock ÷ (kilos de la saison ÷ jours d’utilisation).
- **Le planning** : les interrupteurs de Scheduler (sinon les `switch.schedule_*` qui ont des `timeslots`) qui visent un thermostat. Le premier planning allumé qui s’applique au jour et vise le thermostat donne la journée. « Jours ouvrés » suit le capteur Workday quand il existe, sinon du lundi au vendredi.
- **Le temps** : `hestia_weather_api` version 1 (`places()`, `hourly(lieu)`, `add_listener(lieu, update, brick="hestia_heating")`). Le lieu est celui choisi dans Extensions, sinon le premier. Sans Hestia Weather, le froid à venir n’est pas dit.

- **Le prix de l’électricité** : `hestia_energy_api` version 1 (`tariff()` : prix, période, prochain changement), quand Hestia Énergie est installée et utilisée. Sans elle, le coût n’est pas dit.

La brique n’écrit qu’une chose : le préréglage (ou la consigne) des thermostats confiés au planning Hestia, et seulement quand il commande (voir plus bas). Aucun autre appel de service, aucun réglage d’une autre intégration. Des tests le vérifient (`tests/test_coordinator_ha.py`).

## Ce qui est publié

### Les entités

L’identifiant unique est `<entrée>_<clé>` ; l’entity_id est `<plateforme>.hestia_heating_<clé>`. Ces clés ne changent plus.

| Clé | Plateforme | Valeurs |
| --- | --- | --- |
| `maison_etat` | sensor (énumération) | `repos`, `chauffe`, `rafraichit` ; en attributs la phrase (`titre`, `texte`), la température moyenne, les pièces en chauffe, l’électrique et les sources en marche |
| `poele_etat` | sensor (énumération) | `eteint`, `allumage`, `chauffe`, `nettoyage`, `extinction`, `alarme`, `inconnu` ; en attributs le texte du poêle, « à traduire », depuis quand, le profil |
| `poele_flamme` | sensor | la flamme réelle (sinon réglée) ; en attributs la flamme réglée et la demande du thermostat |
| `poele_granules_jours` | sensor (jours) | jours de granulés au rythme de la saison ; en attributs le stock, les sacs, les kilos par jour et de la saison |
| `poele_alarme` | binary_sensor (problème) | avec le texte du poêle |
| `piece_<id de la pièce>_en_chauffe` | binary_sensor (chaleur) | une par pièce, ajoutée quand une pièce apparaît ; en attributs température, consigne, puissance, demande, poêle |

Les entités du poêle n’existent que s’il y a un poêle.

### L’interface pour les autres briques

`hass.data["hestia_heating_api"]`, **version 1**. Elle existe dès le démarrage, vide tant que la brique n’est pas prête ou si elle est déchargée. Dans la version 1, une méthode s’ajoute, elle ne se renomme ni ne se retire.

- `version` : `1`.
- `sources()` : une liste, une entrée par source de chaleur ou de froid : `id` (l’entité du thermostat, stable), `nom`, `type` (`radiateur`, `poele`, `clim`, `pac`, `vanne`, `autre`), `piece` (l’id de la pièce Home Assistant), `etat` (`chauffe`, `rafraichit`, `repos`, `arret`, `inconnu`), `puissance_w` (électricité tirée maintenant, `None` pour le poêle), `demande_pct`, `energie_stat` (le compteur d’énergie du thermostat, depuis la 0.2), `granules_stat` (la statistique des kilos de Suivi Stock Pellet, pour le poêle).
- `poele()` (depuis la 0.2) : `nom`, `etat`, `en_feu`, `flamme`, `thermostat` (l’`id` de sa source), `energie_stat` (le compteur de son thermostat, souvent déclaré en « gaz » dans la page Énergie) et `granules` (`stock_kg`, `jours`, `kg_par_jour`, `saison_kg`, `stat`) ou `None`. `None` sans poêle.
- `maison()` : `etat`, `titre`, `texte`, `temperature`, `en_chauffe`, `pieces`, `electrique_w`, et `poele` (`etat`, `flamme`) ou `None`. `None` si la brique n’est pas prête.
- `add_listener(update, brick=None)` : `update()` est appelé à chaque changement ; `brick` nomme la brique qui lit (« hestia_energy »). Rend la fonction qui arrête l’écoute.

Unités : °C, W, %. Une valeur absente est `None`, jamais inventée.

### Les commandes WebSocket

| Commande | Réponse |
| --- | --- |
| `hestia_heating/view` | tout ce que montre l’onglet (`version: 1`) |
| `hestia_heating/subscribe` | la vue des cartes, entière une fois puis seulement ce qui change (`changes`, `removed`) ; `reload` quand la brique redémarre. Une seule souscription par tableau de bord (`card/src/stream.ts`) |
| `hestia_heating/day` + `cible` (`poele` ou `piece/<id>`) | les courbes du jour depuis minuit, un point toutes les 5 min au plus, gardées 2 min |
| `hestia_heating/settings` | les réglages et ce qu’ils peuvent valoir |
| `hestia_heating/set_settings` + `reglages` | enregistre les réglages modifiés (`sources`, `extensions`, `poele_thermostat`, `poele_prise`, `weather_place`, `planning`, `pilote`). Un planning illisible est refusé (`invalid`), avec la raison en mots, et rien n’est enregistré |

## Le planning Hestia

Depuis la 0.3, la brique a son propre planning (`engine/home_planning.py`, Python pur). Il est enregistré entier avec les réglages (`planning`) :

- `journees` : les journées types (8 au plus), chacune un `nom` et ses `creneaux` par ligne : `{"sejour": [["06:30", "confort"], ["22:30", "hors_gel"]]}`. Une **ligne** est une pièce (ses thermostats) ou le poêle (`poele` : son thermostat, à part de la pièce). Niveaux : `confort`, `eco`, `hors_gel`, `boost`. Un niveau tient jusqu’au créneau suivant ; avant le premier créneau du jour, la ligne garde le niveau de la veille au soir.
- `semaine` : la journée type de chaque jour, du lundi au dimanche. `feries` : celle d’un jour férié (le capteur Workday dit « pas un jour ouvré » un jour de semaine), ou rien. `jours` : un jour changé à part, `{"2026-11-23": "teletravail"}`, gardé jusqu’à ce jour et 62 jours d’avance au plus.
- `pieces` : pour chaque ligne, qui la règle (`source` : `hestia`, `extension` pour Scheduler, `aucun`) et, pour un thermostat qui n’est pas un Versatile Thermostat, ses consignes (`temperatures`). Sans choix, une ligne visée par un planning Scheduler reste sur Scheduler, les autres sont sur Hestia : installer la 0.3 ne change rien à ce qui marche.
- `anticipation` : `actif` et `max_min` (60 par défaut, 120 au plus). Le premier créneau plus chaud du matin (entre 4 h et 10 h) commence 5 min plus tôt par degré sous 10 °C dehors à son heure (Hestia Weather), arrondi à 5 min, au plus `max_min`, et jamais moins de 15 min après le créneau d’avant.
- `commande` : `false` par défaut (« à l’ombre »).

**Envoyer** : à chaque calcul (au plus chaque minute), pour chaque ligne sur Hestia, le créneau commencé depuis le dernier traité est « dû » (`due()`). Après un arrêt de Home Assistant, seul le dernier créneau manqué est rattrapé. Un planning enregistré, ou une ligne vue pour la première fois, pose un repère : rien n’est envoyé tout de suite. Rien n’est envoyé avant que Home Assistant ait fini de démarrer.

Ce que devient un créneau dû (le journal du jour, 60 lignes au plus, et le journal de Home Assistant pour ce qui part) :

| Statut | Quand |
| --- | --- |
| `bloque` | un planning Scheduler allumé vise encore la ligne (« deux plannings », dans À régler) |
| `recopie` | le thermostat est une copie d’une autre maison (`remote_homeassistant`) : jamais rien envoyé |
| `ombre` | le planning ne commande pas |
| `eteint` | le thermostat est éteint ou absent : il reste éteint |
| `sans_prereglage` | le préréglage n’existe pas sur ce Versatile Thermostat |
| `deja` | il est déjà sur ce préréglage (ou cette consigne) |
| `envoye` | `climate.set_preset_mode` pour un Versatile Thermostat, `climate.set_temperature` pour un autre, sans attendre la réponse |

**La vue** (`planning` dans `hestia_heating/view`) ajoute : `commande`, `labo` (tous les thermostats sont recopiés), `jour_type`, `jours` (les 7 prochains jours et leur journée type), `journees`, `pieces` (chaque ligne : qui la règle, ses thermostats, ses niveaux possibles, les créneaux de Scheduler à reprendre), `ordres` (les 24 prochaines heures et leur statut), `journal`, `conseils`. Chaque ligne du dessin dit sa `source` (« Hestia », « Scheduler ») et si elle est `bloque`. Les cartes ne reçoivent pas `pieces`, `journal`, `journees`, `jours` ni `plannings`.

**Les conseils** : un matin avancé (« Séjour : confort dès demain 7 h au lieu de 8 h, la nuit sera froide (−1,8 °C dehors). ») et, avec Hestia Énergie, le coût de l’électrique en ce moment (« L’électrique tire 0,6 kW : environ 0,15 € de l’heure (heures pleines). Les heures creuses commencent à 22 h. »).

## Le pilote du poêle, à l’ombre

Depuis la 0.4 (`engine/pilot.py`, Python pur). Le thermostat du poêle décide combien chauffer (sa demande, en %) ; le pilote en tire les gestes du poêle. **À l’ombre, il n’envoie rien** : il calcule à chaque calcul de la maison ce qu’il ferait et le compare à ce que fait la maison, vu de dehors (l’état du poêle et sa flamme réglée). Réglage `pilote` : `ombre` (par défaut) ou `eteint`.

| Geste | Règle |
| --- | --- |
| Démarrer | Au passage du thermostat en boost (un passage, pas un état : le poêle ne se rallume jamais de lui-même), le poêle éteint. Refusé si le thermostat est éteint ou en sécurité, le poêle en alarme, la pièce déjà à sa consigne + 0,5 °C, ou s’il a déjà démarré une fois ce jour-là. |
| Flamme | Palier de la demande : 85 % → 5, 65 % → 4, 45 % → 3, sinon 2. Le palier en cours tient tant que la demande reste dans sa plage élargie de 7 points (le 3 tient de 38 % à 72 %). Flamme 1 si la pièce, prolongée 15 min sur sa pente, dépasse sa consigne de 0,5 °C. Baisse tout de suite, hausse au plus toutes les 30 min (sauf deux paliers d’écart). Avec 4 ordres ou moins restants sur la limite du jour du profil, la flamme ne change plus. |
| Arrêter | Le thermostat passe hors gel ou s’éteint pendant que le poêle brûle. L’arrêt est confirmé quand le poêle dit éteint, ses fumées sous 60 °C et sa prise sous 70 W. |
| Couper | Pendant qu’il brûle : alarme, poêle muet 15 min (son état inconnu), thermostat en sécurité, pièce 2 °C au-dessus de sa consigne. |

La vue (`poele.pilote`) : `mode`, `action` (`demarrer`, `refuser`, `flamme`, `garder`, `arreter`, `couper`, `attendre`), `titre`, `texte`, `ton`, `flamme`, `maison` (ce que fait la maison), `accord`, `journal` (les 20 derniers gestes du jour, de Hestia et de la maison, chacun avec `accord` pour la maison) et `accord_jour` (`oui`, `sur`). Les cartes ne reçoivent pas le journal. La mémoire du pilote (démarrages du jour, dernière hausse, dernier état vu) est gardée avec celle du planning (`.storage/hestia_heating.planning_etat`).

## Le profil de poêle

Un fichier JSON par intégration (`profiles/micronova_agua_iot.json`) :

- `profil`, `nom`, `integration`, `lien` ;
- `roles` : pour chaque rôle, `domaine` et `fin` de l’identifiant (sans `fin` : l’entité principale du domaine). Rôles lus en 0.1 : `etat`, `alarme`, `fumees`, `air`, `flamme` (avec `min` et `max`), `flamme_reelle`, `ecritures`, `eco_stop`, `thermostat` ;
- `etats` : les mots du poêle pour chaque état de la brique. Un mot inconnu donne `inconnu`, reste affiché et est marqué « à traduire » ;
- `alarme_ok` : les textes d’alarme qui veulent dire « pas d’alarme » ;
- `limites` : `ecritures_par_jour` (la mémoire du poêle), `cloud`.

Ajouter un poêle, c’est ajouter un fichier : aucun code.

## Vitesse

- La brique écoute seulement les entités trouvées. Un changement est regroupé 1 s avant le recalcul ; un changement des registres, 5 s.
- Le recalcul de toute la maison prend moins d’une milliseconde sur une maison de 6 thermostats (mesuré hors labo, sur la machine de développement) ; il est mesuré à chaque fois (`calcul_ms`, affiché dans À propos).
- Les commandes du panneau répondent avec ce qui est déjà calculé. Seules les courbes du jour lisent l’historique, dans l’exécuteur du Recorder, gardées 2 min.
- Une minuterie d’une minute fait avancer « maintenant » dans le planning et envoie les créneaux dus. Le planning Hestia se calcule sur 3 jours par ligne, dans le même calcul.

À mesurer au labo avant la bêta publique : `hestia-labo/mesurer-hub.py` sur l’onglet Chauffage.

## Tests

```
pip install -r requirements-test.txt                      # Home Assistant épinglé, Python 3.14
python -m unittest discover -s tests -p 'test_*.py'
cd frontend && npm ci && npm run validate
cd card && npm ci && npm run validate
```

Les tests utilisent une maison inventée (`tests/maison_fictive.py`) : aucune donnée réelle dans le dépôt. `tests/test_coordinator_ha.py` la monte dans un vrai Home Assistant en mémoire.
