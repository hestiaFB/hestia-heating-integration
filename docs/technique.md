# Hestia Chauffage — fonctionnement technique

Version 0.4.0b1. Ce document décrit ce que la brique lit, ce qu’elle publie et comment elle tient sur un petit matériel. Le pourquoi est dans le [cahier des charges](CAHIER-DES-CHARGES.md).

## Les fichiers

| Fichier | Rôle |
| --- | --- |
| `reader.py` | Tout ce qui touche Home Assistant : registres, états, historique, l’interface d’Hestia Weather. Ne fait que lire. |
| `engine/` | Python pur, testé sans Home Assistant : `sources.py` (un thermostat → une source), `stove.py` (le poêle et les granulés), `planning.py` (Scheduler), `home_planning.py` (les plannings Hestia), `pilot.py` (le pilote du poêle, à l’ombre), `house.py` (la maison en une phrase), `phrases.py` (les mots), `profiles.py` (les profils de poêle), `legacy.py` (anciens noms du panneau, lus par le socle). |
| `profiles/*.json` | Un profil par intégration de poêle, sans code. |
| `coordinator.py` | Écoute les entités trouvées, recalcule, prévient les abonnés, envoie les changements des plannings Hestia actifs. Garde les réglages (`.storage/hestia_heating.reglages`) et le dernier changement traité de chaque thermostat (`.storage/hestia_heating.planning_etat`). |
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

La brique n’écrit qu’une chose : le préréglage (ou la consigne) des thermostats d’un planning Hestia « Actif » (voir plus bas). Aucun autre appel de service, aucun réglage d’une autre intégration. Des tests le vérifient (`tests/test_coordinator_ha.py`).

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

Depuis la 0.3, la brique a ses propres plannings (`engine/home_planning.py`, Python pur), d’après la maquette « planning simple » validée par Frank le 20 novembre. Ils sont enregistrés entiers avec les réglages (`planning`) :

```
{"plannings": {"p1a2b3": {"nom": "Chambres", "actif": false, "jours": "semaine", "reste": "eco",
                          "plages": [[["17:00", "20:30", "confort"]], [["17:00", "20:30", "confort"]]],
                          "thermostats": ["climate.chambre_1", "climate.chambre_2"]}}}
```

- `jours` : `tous` (une ligne de plages pour tous les jours), `semaine` (deux lignes : du lundi au vendredi, puis samedi et dimanche) ou `chaque` (sept lignes, du lundi au dimanche).
- `plages` : sur chaque ligne, des plages `[début, fin, niveau]`, de `00:00` à `24:00`, 12 au plus par ligne. Niveaux : `confort`, `eco`, `hors_gel`, `boost`. Quand deux plages se chevauchent, celle qui commence le plus tard l’emporte.
- `reste` : le niveau du reste du temps.
- `thermostats` : les thermostats que le planning règle. **Un thermostat suit un seul planning** : le même dans deux plannings est refusé.
- `actif` : `false` par défaut (« En essai » : le planning montre ce qu’il ferait, sans rien envoyer). `true` : « Actif ».
- 20 plannings au plus. Un planning illisible est refusé avec la raison en mots. Le planning à journées types de la première préparation de la 0.3 (jamais publiée) n’est pas repris : il n’a jamais été qu’à l’ombre.

Pour le poêle : son thermostat se met dans un planning comme les autres. Boost l’allume, Hors gel l’éteint (ce sont les automatisations du poêle, ou plus tard le pilote, qui le font). L’éditeur dit combien de fois par semaine le poêle s’allumerait (`starts_per_week()`).

**Le dessin de chaque thermostat** : son planning Hestia ; s’il n’en a pas, ou si un planning Scheduler allumé le vise encore, celui de Scheduler (c’est lui qui le règle vraiment).

**Envoyer** : à chaque calcul (au plus chaque minute), pour chaque thermostat d’un planning, le changement de niveau commencé depuis le dernier traité est « dû » (`due()`). Un changement, c’est le début ou la fin d’une plage. Après un arrêt de Home Assistant, seul le dernier changement manqué est rattrapé. Des plannings enregistrés, ou un thermostat vu pour la première fois, posent un repère : rien n’est envoyé tout de suite. Rien n’est envoyé avant que Home Assistant ait fini de démarrer. Le dernier changement traité de chaque thermostat est gardé dans `.storage/hestia_heating.planning_etat`.

Ce que devient un changement dû, pour chaque thermostat (le journal du jour, 60 lignes au plus, et le journal de Home Assistant pour ce qui part) :

| Statut | Quand |
| --- | --- |
| `bloque` | un planning Scheduler allumé vise encore le thermostat (« suit deux plannings », dans À régler, quand le planning est actif) |
| `recopie` | le thermostat est une copie d’une autre maison (`remote_homeassistant`) : jamais rien envoyé |
| `ombre` | le planning est « En essai » |
| `eteint` | le thermostat est éteint ou absent : il reste éteint |
| `sans_prereglage` | le préréglage n’existe pas sur ce Versatile Thermostat |
| `deja` | il est déjà sur ce préréglage (ou cette consigne) |
| `envoye` | `climate.set_preset_mode` pour un Versatile Thermostat, `climate.set_temperature` pour un autre (confort 20 °C, éco 17, hors gel 7, boost 21 ; une clim : 25, 27, 30, 24), sans attendre la réponse |

**La vue** (`planning` dans `hestia_heating/view`) : `source` (« Hestia », « Scheduler » ou les deux), `labo` (tous les thermostats sont recopiés), `essai` (un dessin vient d’un planning en essai), `lignes` (la journée de chaque pièce et du poêle, avec sa `source` et `bloque` quand deux plannings la visent), `prochains`, puis pour l’onglet seulement : `hestia` (chaque planning : maintenant, prochain changement, thermostats bloqués par Scheduler, allumages du poêle par semaine), `thermostats` (chacun : sa pièce, son planning, Scheduler, ses niveaux possibles, ses consignes s’il n’est pas un Versatile Thermostat), `scheduler` (chaque planning Scheduler, et `reprise` : le même en planning Hestia, pour « Reprendre dans Hestia ») et `journal`. Les cartes ne reçoivent pas ces quatre-là.

## Le pilote du poêle, à l’ombre

Depuis la 0.4 (`engine/pilot.py`, Python pur). Le thermostat du poêle décide combien chauffer (sa demande, en %) ; le pilote en tire les gestes du poêle. **À l’ombre, il n’envoie rien** : il calcule à chaque calcul de la maison ce qu’il ferait et le compare à ce que fait la maison, vu de dehors (l’état du poêle et sa flamme réglée). Réglage `pilote` : `ombre` (par défaut) ou `eteint`.

Ses règles reprennent celles des automatisations qui pilotent déjà un vrai poêle (démarrage, modulation, arrêt, vérification de l’arrêt, sécurités et leur veille), pour que les deux se comparent geste par geste. La « température de la maison » est celle du capteur choisi dans Réglages (`pilote_thermometre`, un `sensor` de température : prendre celui que lisent les automatisations du poêle), sinon la moyenne des pièces que Hestia voit (`maison.temperature`). Un capteur choisi qui ne donne rien compte comme une maison assez chaude : pas de démarrage sur une supposition, comme les automatisations. Réglages propose les capteurs de température, ceux dont le nom dit la maison ou une moyenne d’abord, jamais ceux du poêle.

| Geste | Règle |
| --- | --- |
| Démarrer | Au passage du thermostat en boost, ou en chauffe s’il est déjà en boost (un passage, pas un état : le poêle ne se rallume jamais de lui-même), le poêle éteint. Refusé si le thermostat est éteint, la pièce du poêle au-dessus de 28 °C, le poêle en alarme ou muet, ou la maison déjà à la consigne. En saison douce, il demande d’abord (15 min pour répondre, sinon hors gel) : la maison à 18 °C ou plus ; une fois passée sous 18 °C, il démarre sans demander jusqu’à 19 °C. Autant de démarrages par jour que de passages en boost. |
| Flamme | Dans tous les états où le poêle brûle (allumage, chauffe, nettoyage), sauf alarme. Palier de la demande : 85 % → 5, 65 % → 4, 45 % → 3, sinon 2. La flamme réglée du poêle tient tant qu’elle reste entre le palier de la demande − 7 points et celui de la demande + 7 points (le 3 tient de 38 % à 71 %). Flamme 1 si la pièce, prolongée 15 min sur sa pente quand elle monte, dépasse sa consigne de 0,5 °C ; elle reste à 1 tant que la pièce est à sa consigne. Baisse tout de suite ; hausse seulement 30 min après le dernier changement de la flamme du poêle (par qui que ce soit), sauf deux paliers d’écart. Avec 4 ordres ou moins restants sur la limite du jour (celle du profil, sinon 20), la flamme ne change plus. |
| Arrêter | Pendant que le poêle brûle : le thermostat passe hors gel, ou reste éteint 30 s, ou la maison est assez chaude depuis 2 min (à 1 °C ou moins de la consigne ; en boost, à la consigne). L’arrêt se vérifie par l’état du poêle, ses fumées sous 60 °C (état connu) ou sa prise sous 70 W. |
| Couper | Une alarme du poêle qui dure 2 min (son état ou son texte d’alarme), tant que le poêle brûle ou que son thermostat n’est pas éteint ; la pièce du poêle au-dessus de 28 °C pendant qu’il brûle. Couper, c’est éteindre son thermostat, puis le poêle. |
| Prévenir | Le poêle muet 15 min (son état indisponible) : il le dit, avec ce que tire sa prise (au-dessus de 60 W, il chauffe encore). Il ne coupe pas. |

La vue (`poele.pilote`) : `mode`, `action` (`demarrer`, `demander`, `refuser`, `flamme`, `garder`, `arreter`, `couper`, `alerter`, `attendre`), `titre`, `texte`, `ton`, `flamme`, `maison` (ce que fait la maison), `accord`, `journal` (les 20 derniers gestes du jour, de Hestia et de la maison, chacun avec `accord` pour la maison), `accord_jour` (`oui`, `sur`), `accord_semaine` (`oui`, `sur`, `depuis`, et `ecarts` : les 5 derniers gestes de la maison que Hestia n’aurait pas faits, chacun avec ce que Hestia disait juste avant), `maison_c`, `thermometre` (le nom du capteur choisi, sinon rien) et `thermometre_lu`. Les cartes ne reçoivent ni le journal ni le bilan de la semaine. Le poêle donne aussi `flamme_depuis` et `alarme_depuis` (le dernier changement de sa flamme, le début de son alarme). La mémoire du pilote (dernier état vu, saison douce, depuis quand dure une alarme, un silence, un thermostat éteint ou une maison assez chaude) est gardée avec celle du planning (`.storage/hestia_heating.planning_etat`), avec le journal des 7 derniers jours (`journal_pilote`, 500 gestes au plus) : un redémarrage de Home Assistant ne perd rien, et plusieurs jours se comparent d’un coup.

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
- Une minuterie d’une minute fait avancer « maintenant » dans le planning et envoie les changements dus. Chaque planning Hestia se calcule sur 4 jours (la veille et les 3 suivants), dans le même calcul.

À mesurer au labo avant la bêta publique : `hestia-labo/mesurer-hub.py` sur l’onglet Chauffage.

## Tests

```
pip install -r requirements-test.txt                      # Home Assistant épinglé, Python 3.14
python -m unittest discover -s tests -p 'test_*.py'
cd frontend && npm ci && npm run validate
cd card && npm ci && npm run validate
```

Les tests utilisent une maison inventée (`tests/maison_fictive.py`) : aucune donnée réelle dans le dépôt. `tests/test_coordinator_ha.py` la monte dans un vrai Home Assistant en mémoire.
