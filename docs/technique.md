# Hestia Chauffage — fonctionnement technique

Version 1.0.0b9. Ce document décrit ce que la brique lit, ce qu’elle publie et comment elle tient sur un petit matériel. Le pourquoi est dans le [cahier des charges](CAHIER-DES-CHARGES.md).

## Les fichiers

| Fichier | Rôle |
| --- | --- |
| `reader.py` | Tout ce qui touche Home Assistant : registres, états, historique, l’interface d’Hestia Weather. Ne fait que lire. |
| `engine/` | Python pur, testé sans Home Assistant : `sources.py` (un thermostat → une source), `stove.py` (le poêle et les granulés), `planning.py` (Scheduler), `home_planning.py` (les plannings Hestia), `pilot.py` (le pilote du poêle : à l’ombre, ou la flamme), `driver.py` (le pilote entier : démarrage, arrêt, sécurités, depuis la 0.7), `granules.py` (les granulés comptés par Hestia et le brasier, depuis la 0.6), `tuning.py` (les chiffres du poêle, réglables dans Réglages › Avancé, depuis la 1.0.0b3), `house.py` (la maison en une phrase), `phrases.py` (les mots), `profiles.py` (les profils de poêle), `legacy.py` (anciens noms du panneau, lus par le socle). |
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
- **Les granulés** : les capteurs qui portent l’attribut `suivi_stock_pellet_key` (Suivi Stock Pellet). Jours restants = stock ÷ (kilos de la saison ÷ jours d’utilisation). Depuis la 0.6 sont lus aussi les sacs déclarés consommés (`consomme_sacs` de `consomme_kg`), les sacs achetés (`achete_sacs` de `achete_kg`), la dépense (`depense`), le poids d’un sac et le mois où commence la saison (`poids_sac_kg`, `mois_debut_saison` de `stock`) : voir « Les granulés comptés par Hestia ».
- **Le planning** : les interrupteurs de Scheduler (sinon les `switch.schedule_*` qui ont des `timeslots`) qui visent un thermostat. Le premier planning allumé qui s’applique au jour et vise le thermostat donne la journée. « Jours ouvrés » suit le capteur Workday quand il existe, sinon du lundi au vendredi.
- **Le temps** : `hestia_weather_api` version 1 (`places()`, `hourly(lieu)`, `add_listener(lieu, update, brick="hestia_heating")`). Le lieu est celui choisi dans Extensions, sinon le premier. Sans Hestia Weather, le froid à venir n’est pas dit.

Pour les thermostats, la brique n’écrit qu’une chose : le préréglage (ou la consigne) des thermostats d’un planning Hestia « Actif », cochés dans Réglages, onglet Thermostats, « Le planning change son mode » (« Ce que Hestia peut régler » avant la 1.0.0b3 ; `planning_autorises`, vide par défaut ; voir plus bas). Au poêle, seulement ce que le pilote envoie quand il est choisi (« Le pilote du poêle », plus bas). Aucun réglage d’une autre intégration. Des tests le vérifient (`tests/test_coordinator_ha.py`).

## Ce qui est publié

### Les entités

L’identifiant unique est `<entrée>_<clé>` ; l’entity_id est `<plateforme>.hestia_heating_<clé>`. Ces clés ne changent plus.

| Clé | Plateforme | Valeurs |
| --- | --- | --- |
| `maison_etat` | sensor (énumération) | `repos`, `chauffe`, `rafraichit` ; en attributs la phrase (`titre`, `texte`), la température moyenne, les pièces en chauffe, l’électrique et les sources en marche |
| `poele_etat` | sensor (énumération) | `eteint`, `allumage`, `chauffe`, `nettoyage`, `extinction`, `alarme`, `inconnu` ; en attributs le texte du poêle, « à traduire », depuis quand, le profil |
| `poele_flamme` | sensor | la flamme réelle (sinon réglée) ; en attributs la flamme réglée et la demande du thermostat |
| `poele_granules_jours` | sensor (jours) | jours de granulés au rythme de la saison ; en attributs le stock, les sacs, les kilos par jour et de la saison |
| `poele_granules_brules` | sensor (kg, `total_increasing`) | les kilos brûlés comptés par Hestia depuis son installation, jamais remis à zéro (0.6) ; en attributs le débit, les kilos du jour et de la saison, la saison, le facteur appris, le prix du kilo, le coût du jour |
| `poele_energie` | sensor (kWh, énergie, `total_increasing`) | la chaleur utile de ces kilos (× 4,176), à déclarer dans la page Énergie (0.6) ; en attributs les kWh par kg, ceux du jour, le prix du kWh |
| `poele_brasier` | sensor (kg) | les kilos brûlés depuis le dernier nettoyage noté, inconnu tant qu’aucun ne l’a été (0.6) ; en attributs le seuil, la date du nettoyage, « par les sacs », la phrase |
| `poele_alarme` | binary_sensor (problème) | avec le texte du poêle |
| `poele_brasier_a_nettoyer` | binary_sensor (problème) | allumé au-delà du seuil, inconnu tant qu’aucun nettoyage n’a été noté (0.6) |
| `piece_<id de la pièce>_en_chauffe` | binary_sensor (chaleur) | une par pièce, ajoutée quand une pièce apparaît ; en attributs température, consigne, puissance, demande, poêle |

Les entités du poêle n’existent que s’il y a un poêle.

### L’interface pour les autres briques

`hass.data["hestia_heating_api"]`, **version 1**. Elle existe dès le démarrage, vide tant que la brique n’est pas prête ou si elle est déchargée. Dans la version 1, une méthode s’ajoute, elle ne se renomme ni ne se retire.

- `version` : `1`.
- `sources()` : une liste, une entrée par source de chaleur ou de froid : `id` (l’entité du thermostat, stable), `nom`, `type` (`radiateur`, `poele`, `clim`, `pac`, `vanne`, `autre`), `piece` (l’id de la pièce Home Assistant), `etat` (`chauffe`, `rafraichit`, `repos`, `arret`, `inconnu`), `puissance_w` (électricité tirée maintenant, `None` pour le poêle), `demande_pct`, `energie_stat` (le compteur d’énergie du thermostat, depuis la 0.2), `granules_stat` (la statistique des kilos de Suivi Stock Pellet, pour le poêle). **Pour le poêle, depuis la 0.6** : `energie_stat` est `sensor.hestia_heating_poele_energie` (jamais le compteur de son thermostat, qui compte le temps d’un interrupteur qui ne commande rien ; `None` sans cette entité) et `granules_stat` est `sensor.hestia_heating_poele_granules_brules` (sinon celle de Suivi Stock Pellet).
- `poele()` (depuis la 0.2) : `nom`, `etat`, `en_feu`, `flamme`, `thermostat` (l’`id` de sa source), `energie_stat` (depuis la 0.6 l’énergie comptée par Hestia, `sensor.hestia_heating_poele_energie` ; avant, le compteur de son thermostat), `granules` (`stock_kg`, `jours`, `kg_par_jour`, `saison_kg`, `stat`) ou `None`, et `conso` (0.6 : `debit_kg_h`, `kg_jour`, `kg_saison`, `saison`, `total_kg`, `energie_kwh`, `kwh_jour`, `prix_kg`, `prix_kwh`, `cout_jour`, et `brasier` : `kg`, `seuil_kg`, `a_nettoyer`). `None` sans poêle.
- `maison()` : `etat`, `titre`, `texte`, `temperature`, `en_chauffe`, `pieces`, `electrique_w`, et `poele` (`etat`, `flamme`) ou `None`. `None` si la brique n’est pas prête.
- `add_listener(update, brick=None)` : `update()` est appelé à chaque changement ; `brick` nomme la brique qui lit (« hestia_energy »). Rend la fonction qui arrête l’écoute.

Unités : °C, W, %. Une valeur absente est `None`, jamais inventée.

### Les commandes WebSocket

| Commande | Réponse |
| --- | --- |
| `hestia_heating/view` | tout ce que montre l’onglet (`version: 1`) |
| `hestia_heating/subscribe` | la vue des cartes, entière une fois puis seulement ce qui change (`changes`, `removed`) ; `reload` quand la brique redémarre. Une seule souscription par tableau de bord (`card/src/stream.ts`) |
| `hestia_heating/day` + `cible` (`poele` ou `piece/<id>`) | les courbes du jour depuis minuit, un point toutes les 5 min au plus, gardées 2 min : pour une pièce `temperature`, `consigne` et `demande` de son thermostat principal. Chaque point est placé à l’heure où il a été écrit (`last_updated`) : la température et la consigne d’un thermostat sont des attributs, et `last_changed` ne bouge qu’avec son état (`heat`) |
| `hestia_heating/day` + `cible` + `heures` (1 à 24) | depuis la 0.8, pour l’horloge des cartes : les dernières heures au lieu du jour depuis minuit, avec `debut_min` (la minute du jour où commence la fenêtre) et `fenetre_min` ; les minutes des points comptent depuis `debut`. Pour le poêle : `flamme` (à 0 quand il ne brûle pas), `temperature` et `demande` de son thermostat, et depuis la 0.8.0b3 sa `consigne` (la carte ne la dessine que lorsqu’il brûle). Depuis la 0.8.0b3 aussi, `energie` : `unite` (`kg` pour le poêle, `kWh` pour une pièce) et `heures`, `[minute du début de l’heure depuis debut, valeur]`, lues dans les statistiques horaires du même compteur que `historique` ; l’heure qui suit la dernière statistique reçoit ce que le compteur a bougé depuis |
| `hestia_heating/historique` + `cible` | depuis la 0.8, pour les tiroirs des cartes : les totaux des 14 derniers jours (`jours`, le plus ancien d’abord, aujourd’hui jusqu’à maintenant) et du mois (`mois`), lus dans les statistiques de Home Assistant et gardés 10 min. Une pièce : les kWh du compteur d’énergie de son thermostat (`unite: kWh`) ; le poêle : les kilos de `sensor.…_poele_granules_brules` (`unite: kg`). `stat` vaut `null` sans compteur. Depuis la 1.0.0b8, avec Hestia Énergie, `energie` : `euros` (par jour, `hc`, `hp`, `base` et `total`, `null` quand une heure qui a consommé n’a pas de prix connu), `prix` (le dernier prix vu de chaque période) et `couleur` (Tempo, celle du jour). Chaque heure des statistiques horaires est comptée au prix que donne `hestia_energy_api.tariff(heure)` (`reader.energy_prices`, `engine/money.py`) ; pour le poêle, ses kilos × les kWh utiles d’un kilo, la même chaleur à l’électricité. La vue des cartes a aussi `prix_energie` (le prix de maintenant) |
| `hestia_heating/gestion_auto` + `actif` | depuis la 0.8, « Gestion auto » de la carte du poêle, « Flamme auto » depuis la 1.0.0b3 : `false` remet le pilote sur « Conseil » et garde son mode (`pilote_auto`) ; `true` le remet dans ce mode (« Flamme » sinon, « Entier » seulement pour un poêle que son profil sait allumer et éteindre). Depuis la 1.0.0b3, quand Hestia allume et éteint le poêle (`pilote` = `entier`), le mode ne change pas : seule la flamme change de main (`flamme_manuelle`). Refusé (`copie`) pour un poêle recopié d’une autre maison. Répond le mode en vigueur |
| `hestia_heating/settings` | les réglages et ce qu’ils peuvent valoir |
| `hestia_heating/set_settings` + `reglages` | enregistre les réglages modifiés (`sources`, `extensions`, `poele_thermostat`, `poele_prise`, `weather_place`, `planning`, `pilote`, `pilote_thermometre`, `planning_autorises`, `pilote_flamme_basse`, et depuis la 0.6 `brasier_kg` de 5 à 60, `granules_prix_sac` de 0,5 à 50 €, `granules_poids_sac` de 5 à 30 kg, vides pour « comme trouvé », et depuis la 0.7 `pilote_notifier` (un service `notify.…`, vide pour aucun), `poele_prise_switch` (un `switch.…`, vide pour « trouvé seul ») et `couper_prise` (oui ou non), et depuis la 0.8 `prix_kwh` de 0,01 à 2 €, vide pour aucun, et depuis la 1.0.0b3 `flamme_manuelle` (oui ou non), `poele_eco_stop` (oui ou non), `avance` (les chiffres du poêle, chacun dans ses bornes), `types` (`climate.…` → `radiateur`, `vanne`, `plancher`, `clim`, `pac`, `poele` ou `autre`), `equipements` (`radiateur`, `poele`, `clim`, `plancher`) et `pilote_ventilation` `manuel`). Un réglage illisible est refusé (`invalid`), avec la raison en mots, et rien n’est enregistré |
| `hestia_heating/brasier_nettoye` | « J’ai nettoyé » : le compteur du brasier repart de zéro, écrit tout de suite. Rien n’est envoyé au poêle (0.6). Avec le pilote entier, c’est aussi la réponse `nettoye` (0.7) |
| `hestia_heating/repondre` + `reponse` | une réponse au pilote entier depuis la page Poêle, comme sur le téléphone : `oui`, `non`, `couper`, `ignorer`, `nettoye` (0.7). Une autre réponse est refusée (`invalid`) |

## Les granulés comptés par Hestia

Depuis la 0.6 (`engine/granules.py`, Python pur, appelé par `house.py` à chaque calcul). Rien n’est envoyé au poêle pour compter.

- **Le débit** (kg/h) se lit sur l’état du poêle, jamais sur sa flamme seule : `allumage` a le sien, `chauffe` et `nettoyage` suivent la flamme réelle (une valeur par flamme, `debits` du profil : Micronova 1,2 à l’allumage, puis 0,55 · 0,81 · 1,07 · 1,34 · 1,60), un poêle `inconnu` (muet, pas « à traduire ») dont la prise tire plus de 60 W compte le palier du milieu, le reste 0.
- **Les kilos** : à chaque calcul, le débit vu au calcul d’avant, pendant le temps écoulé (5 min au plus), multiplié par le facteur appris. Total (jamais remis à zéro), jour, saison (du 1er septembre, ou du mois `mois_debut_saison` de Suivi Stock Pellet). Rien n’est arrondi pendant le compte.
- **Le facteur** se cale sur les sacs : un sac déclaré consommé dans Suivi Stock Pellet, c’est un réservoir vide, donc un sac entier brûlé depuis le précédent. Facteur = poids du sac ÷ kilos estimés (sans facteur) depuis le sac précédent, si l’estimation dépasse 5 kg, borné entre 0,7 et 1,6. Pas au premier sac vu : le réservoir n’était pas connu vide au départ. Plusieurs sacs déclarés d’un coup n’apprennent rien. Une nouvelle saison de Suivi Stock Pellet (son compte qui redescend) déplace les repères sans rien perdre.
- **Le brasier** : « J’ai nettoyé » note l’heure et le total. Avec Suivi Stock Pellet, les kilos depuis le nettoyage = ce qui restait dans le réservoir au nettoyage + les sacs versés depuis − ce qui reste maintenant (un sac moins ce qui est compté depuis le dernier sac versé) ; sinon, le total moins celui du nettoyage. Seuil `brasier_kg` (15 kg par défaut), « bientôt » à 4 kg du seuil.
- **L’énergie** : kilos × 4,176 kWh utiles (4,8 × 0,87). **Le prix** : `granules_prix_sac`, sinon la dépense ÷ les sacs achetés de Suivi Stock Pellet ; ÷ `granules_poids_sac`, sinon `poids_sac_kg`, sinon 15 kg.
- **La mémoire** (`granules` dans `.storage/hestia_heating.planning_etat`) : écrite au plus toutes les 5 min pendant que le poêle brûle, tout de suite quand un sac, le facteur, le nettoyage, le jour ou la saison changent, et quand la brique s’arrête. Au démarrage, le débit d’avant n’est pas repris : le temps où Home Assistant était arrêté ne compte rien.

La vue (`poele.conso`) : `debit_kg_h` (avec le facteur), `kg_jour`, `kg_saison`, `saison`, `total_kg`, `energie_kwh`, `kwh_jour`, `correction`, `prix_kg`, `prix_kwh`, `cout_jour`, `cout_heure`, `prix_source` (`reglages`, `suivi` ou rien), `brasier` (`seuil_kg`, `kg`, `nettoye_le`, `a_nettoyer`, `bientot`, `par_les_sacs`, `texte`, et depuis la 1.0.0b4 `jours` : les jours avant le nettoyage au rythme depuis le dernier, rien avant un jour de compte et un kilo brûlé).

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
- `actif` : `false` par défaut (« En pause » : le planning montre ce qu’il ferait, sans rien envoyer). `true` : « Actif ».
- 20 plannings au plus. Un planning illisible est refusé avec la raison en mots. Le planning à journées types de la première préparation de la 0.3 (jamais publiée) n’est pas repris : il n’a jamais été qu’à l’ombre.

Pour le poêle : son thermostat se met dans un planning comme les autres. Boost l’allume, Hors gel l’éteint (ce sont les automatisations du poêle, ou plus tard le pilote, qui le font). L’éditeur dit combien de fois par semaine le poêle s’allumerait (`starts_per_week()`).

**Le dessin de chaque thermostat** : son planning Hestia ; s’il n’en a pas, ou si un planning Scheduler allumé le vise encore, celui de Scheduler (c’est lui qui le règle vraiment).

**Envoyer** : à chaque calcul (au plus chaque minute), pour chaque thermostat d’un planning, le changement de niveau commencé depuis le dernier traité est « dû » (`due()`). Un changement, c’est le début ou la fin d’une plage. Après un arrêt de Home Assistant, seul le dernier changement manqué est rattrapé. Des plannings enregistrés, ou un thermostat vu pour la première fois, posent un repère : rien n’est envoyé tout de suite. Rien n’est envoyé avant que Home Assistant ait fini de démarrer. Le dernier changement traité de chaque thermostat est gardé dans `.storage/hestia_heating.planning_etat`.

Ce que devient un changement dû, pour chaque thermostat (le journal du jour, 60 lignes au plus, et le journal de Home Assistant pour ce qui part) :

| Statut | Quand |
| --- | --- |
| `bloque` | un planning Scheduler allumé vise encore le thermostat (« suit deux plannings », dans À régler, quand le planning est actif) |
| `recopie` | le thermostat est une copie d’une autre maison (`remote_homeassistant`) : jamais rien envoyé |
| `ombre` | le planning est « En pause » |
| `verrou` | le thermostat n’est pas coché dans Réglages, onglet Thermostats, « Le planning change son mode » (`planning_autorises`, aucun par défaut depuis la 0.4) : rien n’est envoyé, et À régler le dit quand le planning est actif |
| `eteint` | le thermostat est éteint ou absent : il reste éteint |
| `sans_prereglage` | le préréglage n’existe pas sur ce Versatile Thermostat |
| `deja` | il est déjà sur ce préréglage (ou cette consigne) |
| `envoye` | `climate.set_preset_mode` pour un Versatile Thermostat, `climate.set_temperature` pour un autre (confort 20 °C, éco 17, hors gel 7, boost 21 ; une clim : 25, 27, 30, 24), sans attendre la réponse |

**La vue** (`planning` dans `hestia_heating/view`) : `source` (« Hestia », « Scheduler » ou les deux), `labo` (tous les thermostats sont recopiés), `essai` (un dessin vient d’un planning en pause), `lignes` (la journée de chaque pièce et du poêle, avec sa `source` et `bloque` quand deux plannings la visent ; depuis la 1.0.0b4, celle du poêle dit les modes de son thermostat, comme les autres, et plus « poêle en chauffe »), `prochains`, puis pour l’onglet seulement : `hestia` (chaque planning : maintenant, prochain changement, thermostats bloqués par Scheduler, `verrouilles` : ceux qui ne sont pas cochés dans « Ce que Hestia peut régler », allumages du poêle par semaine), `thermostats` (chacun : sa pièce, son planning, Scheduler, `autorise`, ses niveaux possibles, ses consignes s’il n’est pas un Versatile Thermostat), `scheduler` (chaque planning Scheduler, et `reprise` : le même en planning Hestia, pour « Reprendre dans Hestia ») et `journal`. Les cartes ne reçoivent pas ces quatre-là.

## Le pilote du poêle

Depuis la 0.4 (`engine/pilot.py`, Python pur). Le thermostat du poêle décide combien chauffer (sa demande, en %) ; le pilote en tire les gestes du poêle. **Sur « Conseil » (valeur `ombre`), il n’envoie rien** : il calcule à chaque calcul de la maison ce qu’il ferait et le compare à ce que fait la maison, vu de dehors (l’état du poêle et sa flamme réglée). Réglage `pilote` : `ombre` (par défaut), `flamme` (depuis la 0.5, voir plus bas), `entier` (depuis la 0.7, plus bas aussi) ou `eteint`.

Ses règles reprennent celles des automatisations qui pilotent déjà un vrai poêle (démarrage, modulation, arrêt, vérification de l’arrêt, sécurités et leur veille), pour que les deux se comparent geste par geste. La « température de la maison » est celle du capteur choisi dans Réglages (`pilote_thermometre`, un `sensor` de température : prendre celui que lisent les automatisations du poêle), sinon la moyenne des pièces que Hestia voit (`maison.temperature`). Un capteur choisi qui ne donne rien compte comme une maison assez chaude : pas de démarrage sur une supposition, comme les automatisations. Réglages propose les capteurs de température, ceux dont le nom dit la maison ou une moyenne d’abord, jamais ceux du poêle.

« Flamme au plus bas » (`pilote_flamme_basse`, un `input_boolean`, aucun par défaut) : quand il est allumé, la flamme du pilote est 1, comme une automatisation qui force la flamme 1. Réglages propose les `input_boolean`, ceux dont le nom parle de flamme d’abord.

| Geste | Règle |
| --- | --- |
| Démarrer | Au passage du thermostat en boost, ou en chauffe s’il est déjà en boost (un passage, pas un état : le poêle ne se rallume jamais de lui-même), le poêle éteint. Refusé si le thermostat est éteint, la pièce du poêle au-dessus de 28 °C, le poêle en alarme ou muet, ou la maison déjà à la consigne. En saison douce, il demande d’abord (15 min pour répondre, sinon hors gel) : la maison à 18 °C ou plus ; une fois passée sous 18 °C, il démarre sans demander jusqu’à 19 °C. Autant de démarrages par jour que de passages en boost. |
| Flamme | Dans tous les états où le poêle brûle (allumage, chauffe, nettoyage), sauf alarme. Palier de la demande : 85 % → 5, 65 % → 4, 45 % → 3, sinon 2. La flamme réglée du poêle tient tant qu’elle reste entre le palier de la demande − 7 points et celui de la demande + 7 points (le 3 tient de 38 % à 71 %). Flamme 1 si la pièce, prolongée 15 min sur sa pente quand elle monte, dépasse sa consigne de 0,5 °C ; elle reste à 1 tant que la pièce est à sa consigne. La pièce se lit ici sur la température lissée du thermostat (`ema_temp` de Versatile Thermostat, sinon sa température) : une bouffée d’air chaud sur la sonde ne fait pas passer la flamme à 1. La sécurité des 28 °C lit la température en direct. Baisse tout de suite ; hausse seulement 30 min après le dernier changement de la flamme du poêle (par qui que ce soit), sauf deux paliers d’écart. Avec 4 ordres ou moins restants sur la limite du jour (celle du profil, 20 pour Micronova, comme le quota que suit la maison), la flamme ne change plus. |
| Arrêter | Pendant que le poêle brûle : le thermostat passe hors gel (un passage, pendant la chauffe : `gel_vrai` dans la mémoire du pilote, gardé jusqu’au poêle éteint, depuis la 1.0.0b5), ou reste éteint 30 s (éteint depuis un état connu avec un préréglage : pas remis sur « éteint » par un redémarrage ; depuis la 1.0.0b7, pas éteint par sa sécurité pour la sonde dehors seule, voir plus bas), ou la maison est assez chaude depuis 2 min (à 1 °C ou moins de la consigne ; en boost, à la consigne). L’arrêt se vérifie par l’état du poêle, ses fumées sous 60 °C (état connu) ou sa prise sous 70 W. |
| Couper | Une alarme du poêle qui dure 2 min (son état ou son texte d’alarme), tant que le poêle brûle ou que son thermostat n’est pas éteint ; la pièce du poêle au-dessus de 28 °C pendant qu’il brûle. Couper, c’est éteindre son thermostat, puis le poêle. |
| Prévenir | Le poêle muet 15 min (son état indisponible) : il le dit, avec ce que tire sa prise (au-dessus de 60 W, il chauffe encore). Il ne coupe pas. |

La vue (`poele.pilote`) : `mode`, `action` (`demarrer`, `demander`, `refuser`, `flamme`, `garder`, `arreter`, `couper`, `alerter`, `attendre`), `titre`, `texte`, `ton`, `flamme`, `maison` (ce que fait la maison), `accord`, `journal` (les 20 derniers gestes du jour, de Hestia et de la maison, chacun avec `accord` pour la maison), `accord_jour` (`oui`, `sur`), `accord_semaine` (`oui`, `sur`, `depuis`, et `ecarts` : les 5 derniers gestes de la maison que Hestia n’aurait pas faits, chacun avec ce que Hestia disait juste avant), `maison_c`, `thermometre` (le nom du capteur choisi, sinon rien), `thermometre_lu` et `flamme_basse` (le nom de l’interrupteur « flamme au plus bas », sinon rien). Les cartes ne reçoivent ni le journal ni le bilan de la semaine. Le poêle ne donne sa `flamme` que s’il brûle (certains poêles donnent une flamme réelle de 1 éteints), et sa courbe du jour la met à 0 quand il ne brûle pas. Il donne aussi `flamme_depuis` et `alarme_depuis` (le dernier changement de sa flamme, le début de son alarme). La mémoire du pilote (dernier état vu, saison douce, depuis quand dure une alarme, un silence, un thermostat éteint ou une maison assez chaude) est gardée avec celle du planning (`.storage/hestia_heating.planning_etat`), avec le journal des 7 derniers jours (`journal_pilote`, 500 gestes au plus) : un redémarrage de Home Assistant ne perd rien, et plusieurs jours se comparent d’un coup.

### Le mode « Flamme » (0.5)

Réglage `pilote` = `flamme`. Le pilote décide comme sur « Conseil » ; **Hestia n’envoie que la flamme** (`pilot.steer()`, appelé par `house.py`, l’ordre envoyé par le coordinateur) :

- l’ordre : `number.set_value` sur l’entité du rôle `flamme` du profil, avec la flamme du pilote, sans attendre la réponse. Rien d’autre : le démarrage, l’arrêt, la coupure et le thermostat du poêle restent aux automatisations de la maison (« Hestia fait » les dit, et précise que ce geste leur reste) ;
- un ordre à la fois : il est vérifié 5 min après (la flamme réglée du poêle doit être celle demandée). La même flamme n’est renvoyée qu’après 10 min, et deux ordres sont espacés d’au moins 3 min ;
- 12 ordres de Hestia par jour au plus, en plus de la réserve de 4 ordres du profil pour éteindre ;
- **Hestia lâche la flamme jusqu’au lendemain** (`lache`, en note sur la page Poêle) si la flamme du poêle change sans elle (une autre automatisation la règle encore : il faut éteindre la sienne) ou si le poêle ne suit pas 3 ordres ;
- jamais à un poêle recopié : un poêle sans appareil, ou dont une entité vient de `remote_homeassistant` (`poele.copie`), ne reçoit rien, même réglé sur « Flamme » (le labo) ;
- revenir à « Conseil » dans Réglages arrête tout de suite les ordres.

La vue ajoute `poele.pilote.commande` : `envois`, `max`, `attente` (la flamme demandée, en attente de vérification), `lache`, `copie`, et `texte`. Les ordres, leur vérification et les lâchers vont au journal du pilote. La mémoire de la flamme (`envoi`, `envois_jour`, `echecs`, `lache`) est gardée avec celle du pilote.

### Le pilote entier (0.7)

Réglage `pilote` = `entier`. La 1.0.0b1 l’avait retiré de Réglages ; depuis la 1.0.0b3, il y revient sous les mots « Qui allume et éteint le poêle : Par Hestia » (onglet Poêle à granulés), grisé pour un poêle recopié ou dont le profil n’a pas d’`ordres`. Avec « La flamme : Manuel » (`flamme_manuelle`), Hestia allume et éteint le poêle sans toucher à sa flamme. Hestia règle la flamme comme en mode « Flamme », et fait aussi ce que font les automatisations du poêle de la maison de référence : démarrer, arrêter, tenir les sécurités, reprendre la main après un redémarrage (cahier des charges, « Démarrer », « Arrêter », « Les sécurités »). Il faut d’abord couper ces automatisations : deux pilotes en même temps se contrediraient.

**Le thermostat du poêle en sécurité (1.0.0b7)** : `sources.read()` lit dans les attributs de Versatile Thermostat `safety_manager.safety_state` (« on »), `safety_manager.safety_delay_min` (`securite_delai_min`), `specific_states.last_temperature_datetime` (`sonde_piece_a`) et `specific_states.last_ext_temperature_datetime` (`sonde_dehors_a`). `pilot._stale_probe()` en tire la sonde muette depuis au moins le délai : `piece` d’abord, sinon `dehors`, sinon rien. La mémoire du pilote garde la sonde de l’épisode (`securite_sonde` : `dehors`, `piece`, `inconnue`), car la sonde peut reparler un instant avant que le thermostat ne sorte de sa sécurité (au cycle suivant). `dehors` : l’arrêt de 30 s ne compte pas, la flamme va au plus bas, l’arrêt vient après `securite_max_min` (120 min par défaut, de 15 à 120, Réglages › Avancé), compté depuis le début de la sécurité (`securite_a`). `piece` et `inconnue` : l’arrêt de 30 s, comme avant. Le retour du thermostat (sécurité vue il y a 2 min au plus, `securite_vue`) n’est pas un passage en boost. La décision porte `securite`, que lit la phrase du poêle ; `driver.drive()` le dit une fois par sonde dans le journal (`conduite.securite`).

**Le poêle qui se bride lui-même (1.0.0b9)** : `stove_says.bridled()` est vrai quand le poêle est en chauffe, sa flamme réelle (`flamme`) plus basse que la flamme réglée (`flamme_reglee`), et sa propre sonde (`air`) à moins de 0,5 °C de la température réglée dans le poêle (`consigne_poele`) : un poêle Micronova brûle alors au plus bas, quelle que soit la flamme demandée, et repart quand sa sonde redescend. La vue du poêle porte `bride` ; la phrase du poêle le dit, et la page Réglages du poêle conseille de monter `consigne_poele`. Le pilote ne change rien à ses ordres : la flamme réglée reste celle qu’il envoie, et le poêle la reprend seul.

`pilot.decide()` dit ce qu’il faut (le passage en boost, l’arrêt, la coupure…) ; `driver.drive()` (Python pur, appelé par `house.py`) en fait des séquences qui survivent aux retards du cloud, une à la fois, et rend les gestes à faire maintenant et dans combien de secondes regarder de nouveau. Le coordinateur fait les gestes dans l’ordre, dans une seule tâche (30 s au plus chacun), et se rappelle à l’heure demandée (`async_call_later`, sous la minute ; au-delà, la minuterie d’une minute suffit).

| Geste | Service |
| --- | --- |
| `thermostat` | `climate.<service>` sur le thermostat du poêle (le Versatile Thermostat) : `turn_off` (un verrou), `turn_on`, `set_preset_mode` (hors gel, boost ; boost aussi pour un poêle allumé à la main, son thermostat en hors gel, depuis la 1.0.0b5), `set_hvac_mode` (chauffe, à la reprise) |
| `allumer`, `eteindre` | ceux des `ordres` du profil (Micronova : `climate.set_hvac_mode` `heat` ou `off` sur son thermostat interne). Sur la carte du poêle, avec « Par Hestia » et son thermostat hors du hors gel, « Éteindre » passe ce thermostat en hors gel (`climate.set_preset_mode`, 1.0.0b5) : Hestia fait l’arrêt et le vérifie |
| `reglage` | un réglage des `ordres` du profil avant un démarrage, seulement s’il a changé (`poele.reglages[].a_changer`) |
| `recharger` | `homeassistant.reload_config_entry` sur l’entrée de l’intégration du poêle |
| `prise` | `switch.turn_off` sur l’interrupteur de la prise (`poele_prise_switch`, sinon celui de l’appareil de la prise mesurée, sinon celui qui porte son nom) |
| `notifier` | `persistent_notification.create` quand elle dure, et le service `pilote_notifier` avec `data.tag` = `hestia_poele_<sujet>` et ses boutons (`data.actions`) |
| `effacer` | `persistent_notification.dismiss`, et `clear_notification` au téléphone quand elle avait des boutons |

Les boutons du téléphone arrivent par l’événement `mobile_app_notification_action` : `HESTIA_POELE_OUI`, `HESTIA_POELE_NON`, `HESTIA_POELE_NETTOYE`, `HESTIA_POELE_COUPER`, `HESTIA_POELE_IGNORER`. La page Poêle a les mêmes (`hestia_heating/repondre`). Une réponse vaut pour le calcul suivant seulement.

**Jamais** : rien tant que Home Assistant démarre ; rien à un poêle recopié, ni à un poêle dont le thermostat est recopié (`remote_homeassistant`), ni ordre ni notification (le labo) ; rien si le profil n’a pas d’`ordres` (`poele.pilotable`) ; jamais plus de 3 démarrages par jour ; chaque geste vers une entité est revérifié juste avant l’envoi (entité présente, pas recopiée).

La vue ajoute `poele.pilote.conduite` : `actif`, `copie`, `pilotable`, `demarrages`, `max_demarrages`, `sequence` (`allumage`, `arret` ou rien), `texte`, `question` (`sujet`, `texte`, `reste_min`, `reponses`) ou rien, `verrou` (`brasier`, `surchauffe`, `alarme`, `muet`) et `injoignable`. Le poêle donne `pilotable`, `allume` (son thermostat interne en chauffe) et `reglages`. Le journal dit ce que Hestia fait, plus ce qu’elle ferait ; un démarrage ou un arrêt qu’elle a demandé y est le sien (« Le poêle s’allume, comme Hestia l’a demandé »). La mémoire du pilote entier (`conduite`) est gardée avec celle du pilote ; seuls le compte des démarrages du jour et le verrou passent un redémarrage, les séquences en cours repartent de l’état du poêle.

## Les réglages du panneau technique (1.0.0b3)

### Ce que l’utilisateur envoie lui-même

Dans Réglages (onglet Poêle à granulés) et dans le tiroir de la carte du poêle, certains boutons vont tout de suite au poêle, depuis le navigateur, comme depuis son application. Ce ne sont pas des commandes de Hestia : c’est l’utilisateur qui appuie. Ils sont grisés pour un poêle recopié (`copie`).

| Bouton | Service |
| --- | --- |
| La flamme, en Manuel (1 à 5) | `number.set_value` sur l’entité du rôle `flamme` |
| La température réglée dans le poêle | `climate.set_temperature` sur l’entité du rôle `thermostat` (son thermostat interne) |
| La vitesse de la ventilation, en Manuel | `climate.set_fan_mode` sur l’entité du rôle `ventilation` |
| ÉCO Stop | `switch.turn_on` ou `turn_off` sur l’entité du rôle `eco_stop`, et le réglage `poele_eco_stop` |
| Délai de l’ÉCO Stop | `number.set_value` sur l’entité du rôle `eco_stop_delai` |

Après un enregistrement, la flamme remise en Automatique remet la température du poêle à `consigne_poele` (30 °C par défaut depuis la 1.0.0b9, 25 °C avant) et la ventilation remise en « par le poêle » repasse en `AUTO`.

### La flamme et l’allumage

| La flamme | Qui allume et éteint | `pilote` | `flamme_manuelle` |
| --- | --- | --- | --- |
| Automatique | vos automatisations | `flamme` | — |
| Manuel | vos automatisations | `ombre` | — |
| Automatique | Hestia | `entier` | `false` |
| Manuel | Hestia | `entier` | `true` |

`flamme_manuelle` vaut seulement en `entier` : la séquence du poêle tourne, `pilot.steer()` n’est pas appelé. La vue le dit (`poele.pilote.flamme_manuelle`, vrai aussi en `ombre`).

### La ventilation par Hestia, hors Entier

`pilote_ventilation` : `auto` (le poêle la règle, `AUTO` envoyé avant un démarrage par Hestia), `flamme` (Hestia, « flamme + 1 »), `manuel` (la vitesse choisie, jamais touchée). Depuis la 1.0.0b3, `flamme` vaut aussi quand les automatisations allument et éteignent le poêle : `driver.fan_only()` applique la même règle que dans Entier (au plus bas tant que les fumées sont sous 110 °C, puis la flamme + 1, 5 au plus ; depuis la 1.0.0b6, la flamme réglée, pas celle que le poêle affiche), avec sa propre mémoire (`ventilation_seule`). **C’est un ordre de Hestia** : au plus un toutes les 10 min, jamais dans la réserve de 6 écritures du jour, jamais tant que Home Assistant démarre, jamais à un poêle recopié (le labo). Le simulateur d’Entier laisse alors la ventilation de côté.

### Les chiffres du poêle (`engine/tuning.py`)

Réglages › Poêle à granulés › Avancé. Chaque seuil, délai et compte du pilote et de la séquence a sa valeur par défaut et ses bornes (`SPEC`, 40 chiffres : paliers de la flamme, marge, rythmes, réserves d’écritures, ordres par jour, saison douce, attente des réponses, contrôles d’allumage et d’arrêt, fumées froides, prise au repos, surchauffe, alarme, poêle muet, débits, énergie d’un kilo, rendement, brasier « bientôt »). Ils sont enregistrés dans `avance` (seulement ceux qui diffèrent), vérifiés à l’enregistrement (`tuning.clean`, refus en mots), et lus par le moteur au moment où il décide (`tuning.get`) : un changement vaut au calcul suivant. Un chiffre jamais réglé reste à sa valeur par défaut, et une maison qui ne change rien se comporte comme avant. Des chiffres enregistrés qui sortent des bornes d’une version plus récente reprennent tous leurs valeurs par défaut, avec un avertissement dans le journal.

`tuning.stove_setting()` ajuste deux réglages des `ordres` envoyés avant un démarrage par Hestia : la température du thermostat interne du poêle (`consigne_poele`) et l’ÉCO Stop (`poele_eco_stop`).

### Ce que la vue ajoute

- `changements` : ce que Hestia a changé aujourd’hui, compté (`modes`, `flamme`, `allumer`, `eteindre`, `ventilation`, `autres`, `total`), seulement les gestes envoyés ;
- pour chaque source, `vu` (son dernier changement) et `type_devine` (le type deviné ; `type` suit le choix de Réglages › Thermostats, `types`) ;
- pour le poêle : `lues` (chaque entité lue, `role`, `entite`, `valeur`, `unite`, `vu`), `ventilation_choix`, `debits` (ceux du profil), `consigne_poele`, `eco_stop_delai`, et `pilote.flamme_manuelle`.

## Le profil de poêle

Un fichier JSON par intégration (`profiles/micronova_agua_iot.json`) :

- `profil`, `nom`, `integration`, `lien` ;
- `roles` : pour chaque rôle, `domaine` et `fin` de l’identifiant (sans `fin` : l’entité principale du domaine). Rôles lus en 0.1 : `etat`, `alarme`, `fumees`, `air`, `flamme` (avec `min` et `max`), `flamme_reelle`, `ecritures`, `eco_stop`, `thermostat` ; depuis la 0.7, `ventilation` ;
- `etats` : les mots du poêle pour chaque état de la brique. Un mot inconnu donne `inconnu`, reste affiché et est marqué « à traduire » ;
- `alarme_ok` : les textes d’alarme qui veulent dire « pas d’alarme » ;
- `limites` : `ecritures_par_jour` (la valeur par défaut de l’extension du poêle), `option_ecritures` (l’option de l’extension qui donne le vrai plafond, lue dans son entrée : `max_eeprom_writes_per_day` pour Agua IOT ; le poêle donne alors `ecritures_lues`), `cloud`.

- `debits` (0.6) : les kilos par heure à l’allumage et pour chaque flamme ;
- `ordres` (0.7) : `allumer` et `eteindre` (`role`, `service`, `donnees`), `allume_si` (`role`, `etat` : ce qui dit que le poêle a pris l’ordre d’allumage), `recharger` (oui si l’intégration peut être rechargée), `reglages` (`nom`, `role`, `attribut` ou l’état, `valeur`, `service`, `donnees`, `reserve`).

Ajouter un poêle, c’est ajouter un fichier : aucun code.

## Vitesse

- La brique écoute seulement les entités trouvées. Un changement est regroupé 1 s avant le recalcul ; un changement des registres, 5 s.
- Le recalcul de toute la maison prend moins d’une milliseconde sur une maison de 6 thermostats (mesuré hors labo, sur la machine de développement) ; il est mesuré à chaque fois (`calcul_ms`, affiché dans À propos).
- Les commandes du panneau répondent avec ce qui est déjà calculé. Seules les courbes du jour lisent l’historique, dans l’exécuteur du Recorder, gardées 2 min.
- Une minuterie d’une minute fait avancer « maintenant » dans le planning et envoie les changements dus. Chaque planning Hestia se calcule sur 4 jours (la veille et les 3 suivants), dans le même calcul.

À mesurer au labo avant la 1.0.0 : `hestia-labo/mesurer-hub.py` sur l’onglet Chauffage.

## Tests

```
pip install -r requirements-test.txt                      # Home Assistant épinglé, Python 3.14
python -m unittest discover -s tests -p 'test_*.py'
cd frontend && npm ci && npm run validate
cd card && npm ci && npm run validate
```

Les tests utilisent une maison inventée (`tests/maison_fictive.py`) : aucune donnée réelle dans le dépôt. `tests/test_coordinator_ha.py` la monte dans un vrai Home Assistant en mémoire.
