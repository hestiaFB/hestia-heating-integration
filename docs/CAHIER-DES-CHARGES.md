# Hestia Chauffage — cahier des charges

Version du 22 novembre 2026 (première version le 20 novembre). Document vivant : il suit la brique à chaque version.

**Où en est la brique** : la v0.1 (lecture seule) est codée le 20 novembre 2026 et tourne au labo. La 0.2 donne à Hestia Énergie le compteur d’énergie de chaque source et le poêle. La 0.3 ajoute les plannings Hestia, simples, d’après la maquette « planning simple » validée le 20 novembre : une liste de plannings, chacun une semaine en couleurs et les thermostats qu’il règle, « En essai » d’abord. La 0.4 ajoute le pilote du poêle « à l’ombre » : il dit ce qu’il ferait, à côté de ce que font les automatisations de la maison, sans rien envoyer. La 0.5 lui permet, en option, de régler la flamme, et seulement elle. Le 22 novembre, le fonctionnement complet du poêle de la maison d’essai devient la base de la gestion des poêles (« Le poêle : la base de sa gestion », plus bas), avec ce qu’il reste à faire pour le rejoindre. Le détail technique (entités, interface, commandes, profils) est dans [technique.md](technique.md).

## Place dans l’écosystème

Hestia Chauffage dit, pour toute la maison, qui chauffe ou rafraîchit, pourquoi, et ce qui vient ensuite. En v0.1 elle ne commande rien : elle lit et elle explique. Elle est prévue dans `ECOSYSTEME.md` de `hestia-ecosysteme` (« Pilote la chaleur, seul propriétaire des commandes thermiques ») ; le pilote du poêle arrive en 0.4.

| Sens | Ce qui circule | Intensité | En v0.1 |
| --- | --- | --- | --- |
| Weather → Chauffage | froid et soleil à venir, degrés-jours (`hestia_weather_api` v1, déjà publiée) | forte | lu, affiché (« −3 °C cette nuit ») |
| Chauffage → Énergie | chaque source de chaleur : en marche, puissance, compteurs (`hestia_heating_api` v1) | moyenne | publiée, Énergie ne la lit pas encore |
| Chauffage → Confort | état réel par pièce | moyenne | publiée, Confort continue de lire Versatile Thermostat lui-même |
| Confort → Chauffage | besoins par pièce, fenêtres, propositions de pause (passerelle) | forte | non, plus tard |

Sans les autres briques, elle reste utile : thermostats, poêle et planning sur une même page. Un lien absent est dit (« Hestia Weather non installé »), jamais simulé.

## Ce que la v0.1 lit

Tout est trouvé seul, rangé par pièce (les pièces de Home Assistant), et chaque source se coupe d’un interrupteur dans Réglages, comme les extensions des autres briques.

| Source | Reconnue par | Ce qui en est lu |
| --- | --- | --- |
| Versatile Thermostat | sa plateforme `versatile_thermostat` | mode, préréglage, consigne, température, demande (%), puissance, fenêtre, délestage, sécurité, type (radiateur, clim, vanne) |
| Autres thermostats et clims | tout `climate` qui a une température | mode (chaud, froid, auto), consigne, ce qu’il fait ; la clim par ses modes « froid » |
| Le poêle | son intégration + un profil (voir plus bas), ex. `aguaiot` | état traduit (éteint, allumage, chauffe, extinction, nettoyage, alarme), flamme, fumées, alarme |
| Le lien poêle ↔ son thermostat | celui choisi dans Réglages, sinon le Versatile Thermostat qui pilote une entité du poêle, sinon celui dont le nom dit « poêle » | demande du thermostat face à la flamme réelle |
| Les granulés | Suivi Stock Pellet (rôles `suivi_stock_pellet_key`, comme Hestia Énergie) | stock, jours restants, kilos de la saison |
| Le planning existant | Scheduler (entités `switch.schedule_*` qui visent un thermostat) et l’assistant Planning de Home Assistant | prochain changement de chaque pièce et du poêle |
| Le temps | `hestia_weather_api` v1 (`hourly`, `degree_days`) | froid de la nuit et du lendemain |

La prise mesurée du poêle, si elle existe, sert de témoin hors cloud (le poêle tourne-t-il vraiment ?). Rien n’est écrit nulle part : pas d’appel de service, pas de réglage changé dans une autre intégration.

La clim est prévue dès la v0.1. Elle est développée et testée sur un thermostat simulé tant qu’aucune maison d’essai n’en a.

## Ce que la v0.1 montre

Un onglet **Chauffage** dans le panneau Hestia-FB (adresse `/hestia/chauffage`) et une carte pour les tableaux de bord, sur le socle commun, comme Weather, Confort et Énergie.

| Page | Ce qu’on y voit |
| --- | --- |
| Accueil | La maison en une phrase (« Le poêle chauffe, flamme 3. 2 radiateurs en appoint. »), puis une ligne par pièce : température, consigne, en chauffe ou non, fenêtre ouverte, prochain changement du planning |
| Poêle | État traduit, flamme demandée par le thermostat face à la flamme réelle, sa journée (flamme et température de la pièce), fumées, alarme, ordres reçus dans la journée, stock et jours restants, ce que dit la prise. Le nettoyage à venir viendra plus tard |
| Une pièce | Son thermostat, sa journée (courbe température et consigne), pourquoi elle chauffe ou non (préréglage, fenêtre, délestage, sécurité) |
| Planning | En v0.1, la journée lue dans Scheduler. Depuis la 0.3, la liste des plannings Hestia (une semaine en couleurs, ses thermostats, En essai ou Actif), un éditeur par planning, et les plannings de Scheduler, lus et repris en un clic |
| Réglages et Extensions | Les sources trouvées et leurs interrupteurs, le lien poêle ↔ thermostat, le lieu d’Hestia Weather |

La carte a quatre formes (maquette validée le 20 novembre) : la maison, le poêle, une pièce (longue ou courte) et le planning du jour. Avec le socle 1.24, la porte de l’accueil Hestia-FB prend l’icône « maison » par défaut ; son icône et sa couleur propres demandent un petit ajout au socle (1.25), à faire pour la première bêta publique.

## Ce qu’elle publie

Peu d’entités, aux identifiants stables dès la v0.1 (`<entrée>_<clé>`, jamais changés ensuite sauf majeur avec migration), et une interface Python versionnée pour les autres briques.

| Entité | Clé stable | Valeurs |
| --- | --- | --- |
| État de la maison | `maison_etat` | repos, chauffe, rafraîchit ; en attributs : les sources en marche |
| Pièce en chauffe (une par pièce) | `piece_<id de la pièce HA>_en_chauffe` | oui / non |
| État du poêle | `poele_etat` | éteint, allumage, chauffe, extinction, nettoyage, alarme, inconnu |
| Flamme du poêle | `poele_flamme` | 1 à 5 (selon le profil) ; en attribut la flamme demandée par le thermostat |
| Alarme du poêle | `poele_alarme` | oui / non, avec le texte du poêle |
| Granulés | `poele_granules_jours` | jours restants au rythme de la saison |

**`hass.data["hestia_heating_api"]`, version 1 :**

- `sources()` : chaque source de chaleur ou de froid, avec `id` stable, `nom`, `type` (radiateur, poele, clim, pac, autre), `piece`, `etat` (chauffe, rafraichit, repos, arret, inconnu), `puissance_w`, `demande_pct`, et ses compteurs connus (`energie_stat`, `granules_stat`).
- `maison()` : l’état de la maison en une phrase et ses chiffres.
- `add_listener(update, brick="hestia_energy")` : prévenir une brique abonnée, qui apparaît alors « reliée » des deux côtés.

Dans la version 1, une méthode s’ajoute, ne se renomme ni ne se retire. Le contrat sera décrit dans `docs/technique.md`, et la ligne ajoutée au tableau des interfaces d’`ECOSYSTEME.md`.

## Le profil de poêle

Un profil est un fichier de données par intégration, sans code : il dit où trouver chaque rôle sur l’appareil du poêle et comment traduire ses mots. En v0.1 seuls les rôles de lecture servent ; le pilote (0.4 et 0.5) utilise aussi `thermostat`, `flamme` et la limite d’ordres par jour. Les textes ci-dessous ont été relevés sur un poêle Micronova par Agua IOT, en français (« Éteindre » est le poêle éteint), avec les mots anglais du même poêle.

```json
{
  "profil": "micronova_agua_iot",
  "nom": "Micronova Agua IOT",
  "integration": "aguaiot",
  "lien": "https://github.com/vincentwolsink/home_assistant_micronova_agua_iot",
  "roles": {
    "thermostat": {"domaine": "climate", "principal": true},
    "etat": {"domaine": "sensor", "fin": "_status"},
    "alarme": {"domaine": "sensor", "fin": "_alarm"},
    "fumees": {"domaine": "sensor", "fin": "_smoke_temperature"},
    "air": {"domaine": "sensor", "fin": "_air_temperature"},
    "flamme": {"domaine": "number", "fin": "_power", "min": 1, "max": 5},
    "flamme_reelle": {"domaine": "sensor", "fin": "_real_power"},
    "ecritures": {"domaine": "sensor", "fin": "_eeprom_writes_today"},
    "eco_stop": {"domaine": "switch", "fin": "_eco_stop"}
  },
  "etats": {
    "eteint": ["Off", "Éteindre", "Stand-by", "Standby"],
    "allumage": ["Allumage", "Commencez", "En attente de flamme", "Starting", "Ignition", "Waiting for flame"],
    "chauffe": ["On", "Work", "Working"],
    "nettoyage": ["Nettoyage", "Cleaning"],
    "extinction": ["Extinction", "Final cleaning", "Shutdown"],
    "alarme": ["ALARM", "MEM. ALARM", "Alarm"]
  },
  "alarme_ok": ["OK", "0", "None", "Aucune"],
  "limites": {"ecritures_par_jour": 20, "cloud": true}
}
```

Un texte inconnu reste affiché tel quel et marqué « à traduire », jamais deviné. `Stand-by` est rangé avec « éteint » : la page dit « en veille, il repartira seul ».

**Ce que le profil devra dire en plus**, pour la gestion décrite plus bas :

- où lire le plafond d’ordres : l’option de l’intégration (`max_eeprom_writes_per_day` pour Agua IOT), la limite du profil n’étant plus que la valeur par défaut ;
- les débits de granulés par flamme, et celui de l’allumage (kg/h) ;
- les rôles `consigne` (le thermostat interne du poêle, gardé au plus haut) et `ventilation` ;
- que la flamme réelle de ce poêle ne dit rien poêle éteint (elle y vaut 1).

## Le poêle : la base de sa gestion

Écrit le 22 novembre 2026 d’après le fonctionnement complet du poêle de la maison d’essai : un poêle à granulés Micronova de 7 kW, par le cloud Agua IOT, piloté depuis l’automne par des automatisations Home Assistant et un Versatile Thermostat. Ce document de référence reste hors du dépôt, car il contient les entités de la maison. On en garde ici les règles, les chiffres et leurs raisons. C’est la base de la gestion des poêles dans la brique : le pilote de Hestia les reprend une à une, et un autre poêle les reçoit par son profil.

**Presque chaque règle vient d’un incident vécu.** Avant d’en simplifier une, lire sa raison (colonne « Pourquoi »).

### Les principes

Quatre règles de la maison d’essai, dont tout le reste découle :

1. **Le poêle est le chauffage principal, l’électrique est un tampon.** Le kWh utile du poêle coûte 2 à 2,6 fois moins cher.
2. **Le poêle ne se rallume jamais seul.** Une extinction impose un cycle d’environ 20 minutes, et chaque allumage use la bougie d’allumage. Un seul organe envoie l’ordre d’allumage.
3. **Un démarrage automatique par jour, par le planning.** Les suivants sont des gestes de la personne (le bouton Allumer).
4. **Chauffer longtemps, au bon moment** : mieux vaut une flamme basse qui dure que des marches et des arrêts.

Et des règles de conception, valables pour toute la brique :

- **Le thermostat décide combien chauffer, Hestia règle la flamme.** Le poêle n’est qu’un exécutant.
- **Mieux vaut une absence qu’un zéro trompeur.** Un capteur muet ne s’affiche pas « 0 » : il ne s’affiche pas, ou il dit « on ne sait pas ».
- **La page montre l’exception.** Au repos, aucune alerte ; hors saison, ni bilan ni conseil.
- **Une seule définition de chaque chose** : la famille « il brûle » (allumage, chauffe, nettoyage) et l’escalier de flamme sont écrits une fois, et servent au pilote comme à l’affichage.
- **Ce qui dépend du foyer est un réglage avec une valeur par défaut**, jamais une constante (voir « Les réglages »). La physique reste fixe.

### Ce qu’il faut savoir du poêle

| Piège | Ce que Hestia en fait | Pourquoi |
| --- | --- | --- |
| La flamme réelle vaut 1 même poêle éteint | « Il chauffe » se lit sur l’état, jamais sur la flamme. Poêle éteint, la page ne montre jamais « 1 sur 5 » : la flamme visée, en pâle, ou rien | relevé sur le poêle d’essai |
| Les alarmes s’écrivent en majuscules (`ALARM`, `MEM. ALARM`) | le profil les liste telles quelles | une automatisation qui cherchait `alarm` ne se déclenchait jamais |
| Une alarme fantôme juste après l’allumage, environ une minute | une alarme compte quand elle tient 2 minutes (le relevé passe chaque minute : 30 s ne filtreraient rien) | une ancienne alarme renvoyée par le cloud après l’allumage |
| Le cloud a environ une minute de retard | un ordre à la fois ; on attend d’en voir l’effet avant de redécider ; un démarrage en cours n’est jamais relancé parce que le poêle « n’a pas encore l’air allumé » | un double démarrage a reposé la question de saison douce et éteint le poêle 15 min plus tard |
| La mémoire du poêle n’accepte qu’un nombre d’ordres par jour (voir plus bas) | Hestia lit ce plafond, n’envoie jamais un ordre qui ne change rien, et garde une réserve | quota épuisé en fin de matinée, flamme bloquée à 4 pour une demande de 0 % |
| Le cloud peut refuser un ordre sans le dire : les états gardent leurs dernières valeurs, le poêle ne démarre pas | contrôle d’allumage, avec rechargement de l’intégration et seconde tentative | deux allumages refusés ; recharger l’intégration a suffi |
| Au démarrage de Home Assistant, l’intégration du poêle peut ne pas être chargée pendant quelques minutes | tout ce qui agit au démarrage attend que l’état du poêle soit connu | fausse alerte d’extinction sur un poêle « indisponible » |
| Au redémarrage, Versatile Thermostat passe parfois par « éteint », ou restaure « éteint » alors que le poêle brûle ; son préréglage passe par « vide » | une transition depuis « indisponible », « inconnu », « éteint » ou un préréglage vide n’est jamais une demande d’arrêt ; Hestia resynchronise (voir « Démarrer ») | deux heures sans pilotage après un redémarrage, le bouton Éteindre sans effet |

**Le plafond d’ordres** (intégration Agua IOT 2.3 et suivantes) : réglable dans les options de l’intégration (`max_eeprom_writes_per_day`, 20 par défaut), remis à zéro à minuit, heure locale. Les essais ratés comptent ; la flamme, la ventilation et la consigne comptent ; l’ordre d’arrêt ne compte pas. Plafond atteint : plus aucun réglage ne passe avant minuit, sans erreur visible. Hestia lit ce plafond dans les options de l’entrée de l’intégration (le profil ne donne que la valeur par défaut) et le nombre d’ordres du jour sur le compteur de l’intégration. Elle garde 4 ordres de réserve pour pouvoir éteindre et régler le poêle au démarrage suivant (6 avant de régler la ventilation).

### Le montage, à ne pas défaire

- **La consigne interne du poêle est gardée au plus haut (25 °C), et son ECO Stop reste actif.** Le poêle n’atteint jamais sa consigne, donc il ne se met jamais en veille de lui-même : il applique la flamme qu’on lui envoie. Cette consigne est réaffirmée à chaque allumage, seulement si elle a changé (quota).
- **Deux filets indépendants** : ECO Stop côté poêle (il survit à une panne de Home Assistant), la sécurité surchauffe à 28 °C côté Home Assistant.
- **La ventilation est en AUTO**, réglée une fois au démarrage : la régler à chaque variation des fumées vidait le quota. Si AUTO déçoit, l’autre réglage prêt : ventilation = flamme + 1, au plus 5, et au minimum tant que les fumées sont sous 110 °C.

Hestia lit ce montage et le signale s’il change (consigne interne plus basse, ECO Stop coupé). Elle ne le règle qu’au démarrage, le jour où c’est elle qui démarre le poêle.

### Le thermostat pilote

Un Versatile Thermostat dont la sonde est dans la pièce du poêle. Il ne commande pas le poêle : il dit combien chauffer.

- **Sa demande** (`power_percent`, 0 à 100 %) donne la flamme.
- **Son préréglage** : boost = chauffer, hors gel = arrêter. Le planning ne change que le préréglage, jamais le mode.
- **Son état « éteint » est un verrou** : rien ne démarre, et Hestia le dit (« Le poêle n’est pas lancé : son thermostat est éteint »). Rallumer le thermostat suffit : la demande reprend quand il est en chauffe depuis 10 s. C’est aussi ce verrou qui rend les coupures effectives (elles éteignent le thermostat). En début de saison, il faut allumer ce thermostat en mode Chauffe : Hestia le rappelle. *Pourquoi : un thermostat resté éteint depuis l’été a laissé un boost allumer le poêle sans demande à suivre, flamme bloquée à 2.*
- **Sa température lissée** (attribut `ema_temp`, sinon la température) sert à la flamme ; **sa pente** (°C par heure) à l’anticipation et à l’heure d’arrivée ; **sa température en direct** à l’affichage, jamais le dernier point d’une courbe.
- Son interrupteur sous-jacent ne pilote rien (il suit l’état du poêle pour que le thermostat affiche « Chauffe » juste). **Son compteur d’énergie est donc faux pour le poêle** : l’énergie du poêle se calcule sur les kilos de granulés.
- Sa puissance (`device_power`) est une puissance de chaleur : jamais à additionner aux kWh électriques.

### Démarrer

**Déclenché** par le passage du préréglage en boost, ou par le thermostat en chauffe depuis 10 s avec le préréglage boost (la reprise après le verrou). **Conditions** : la gestion automatique du poêle est allumée, le préréglage est boost, le poêle est éteint. **Un seul démarrage à la fois** : un second déclenchement pendant un démarrage en cours (jusqu’à environ 7 min avec la relance) est ignoré, c’est voulu.

Puis la première raison vraie :

| Cas | Ce que fait Hestia |
| --- | --- |
| thermostat éteint | rien, et le dit |
| pièce du poêle au-dessus de 28 °C | éteint le thermostat, prévient |
| brasier à nettoyer | éteint le thermostat, prévient, avec le bouton « J’ai nettoyé » |
| poêle muet ou en alarme | éteint le thermostat, prévient, avec l’état et l’alarme |
| la maison est assez chaude | refuse et le dit ; le préréglage reste boost : le poêle partira dès que l’écart se creusera |
| sinon | démarre |

**La maison a besoin du poêle** quand, avec `c` la température de la maison et `t` la consigne du thermostat du poêle : `t − c > 1 °C`, ou, en boost, `c < t`. La température de la maison est la moyenne des sondes choisies (par défaut les pièces chauffées ; une pièce non chauffée et fermée n’y est pas). En boost, le poêle continue tant que cette moyenne est sous la consigne : il chauffe la maison **par sa pièce**, qui peut monter bien au-dessus de la sienne (point ouvert n° 2).

**Saison douce** : la maison sous 18 °C, le démarrage est permis ; au-dessus de 19 °C, il demande d’abord ; entre les deux, l’état d’avant. La question a deux réponses, Oui et Non, et 15 minutes pour répondre. Non, le préréglage qui quitte boost ou le thermostat éteint valent « non ». Sans réponse : hors gel, **sauf si le poêle est déjà en route : alors rien n’est coupé**. Une question restée orpheline (Home Assistant redémarré pendant l’attente) est effacée.

**Allumer** :

1. Les réglages du poêle, chacun envoyé seulement s’il a changé : consigne interne, ECO Stop, ventilation AUTO (seulement s’il reste plus de 6 ordres).
2. 2 s plus tard, l’ordre d’allumage.
3. **Contrôle d’allumage** : le poêle doit passer en marche dans les 3 minutes. Sinon : recharger l’intégration du poêle, attendre 20 s, renvoyer l’ordre, attendre encore 3 minutes. Toujours rien : « l’ordre d’allumage n’est pas passé », en alerte sur la page et en notification. Le prochain succès l’efface.

**Après un redémarrage de Home Assistant** : 3 minutes après, une fois l’état du poêle connu (5 minutes au plus), si le poêle brûle et que son thermostat est éteint, Hestia remet le thermostat en chauffe et en boost, et le dit (« Poêle repris en main »). Aucun ordre n’est envoyé au poêle.

### La flamme

Dans tous les états où le poêle brûle (allumage, chauffe, nettoyage), sauf alarme ou surchauffe :

- **L’escalier** : demande ≥ 85 % → 5, ≥ 65 % → 4, ≥ 45 % → 3, sinon 2. La flamme du poêle tient tant qu’elle reste entre le palier de la demande − 7 points et celui de la demande + 7 points. *Pourquoi : cinq paliers et une marge, pour ne pas osciller autour d’un seuil.*
- **Plancher normal : 2.** Un poêle qui brûle longtemps en flamme 1 a trop d’air, brûle moins bien et encrasse plus par kilo. La flamme 1 est réservée au choix de la personne (« flamme au plus bas ») et à la pièce trop chaude.
- **La pièce trop chaude, avec anticipation** : sur la température **lissée** `t` de la pièce, prolongée de 15 minutes sur sa pente quand elle monte (`t + max(pente, 0) × 0,25`), au-dessus de la consigne + 0,5 °C ; ou la flamme déjà à 1 et `t` à la consigne ou au-dessus. Retour au palier normal sous la consigne. *Pourquoi : une pièce montée de plus de 3 °C en 35 minutes en flamme 3 ; et la température lissée, parce qu’une bouffée d’air chaud sur la sonde avait fait passer la flamme à 1 pendant 4 minutes, deux ordres perdus.*
- **Baisser tout de suite, monter au plus une fois par demi-heure** après le dernier changement de flamme (par qui que ce soit), sauf deux paliers d’écart ou la flamme au plus bas choisie.
- **Rien à changer, rien envoyé** : la demande bouge à chaque calcul, un ordre qui redonne la même flamme vide le quota.
- **Réserve** : avec 4 ordres ou moins sous le plafond, la flamme ne change plus.

L’escalier est **une seule fonction**, appelée par le pilote et par l’affichage (« la flamme devrait être à X ») : dans la maison d’essai, sa copie pour l’affichage a pris du retard sur celle qui agit.

### Arrêter

**Déclenché** par :

- le préréglage qui passe en hors gel ;
- le thermostat éteint **depuis 30 s**, et seulement s’il était avant dans un état connu, avec un préréglage (pas un retour de redémarrage) ;
- la maison assez chaude depuis 2 minutes (le préréglage passe alors en hors gel).

Un thermostat **déjà** éteint ne déclenche rien : les sécurités et le bouton Éteindre lancent alors l’arrêt eux-mêmes.

**Séquence** :

1. Attendre que l’état du poêle soit connu (2 minutes au plus).
2. Jusqu’à 3 ordres d’arrêt, 15 s entre deux, jusqu’à ce que le poêle soit en extinction, éteint, en veille ou en nettoyage. Sinon, prévenir (« Ordre d’extinction non confirmé, vérification dans 25 minutes »).
3. **La vérification, 25 minutes après** (le cycle d’extinction dure 20 minutes : 10 criaient au loup), si le préréglage est toujours hors gel, du plus sûr au moins sûr : en extinction ou en nettoyage, c’est normal ; éteint ou en veille, c’est fait ; état connu et fumées sous 60 °C, c’est fait ; prise sous 70 W, c’est fait.
4. Sinon : prévenir et renvoyer l’arrêt. 30 s plus tard, prise sous 70 W ou poêle éteint : confirmé. Sinon, une alerte « Le poêle chauffe toujours. Couper la prise ? » avec Couper et Ignorer. **Sans réponse en 5 minutes, la prise est coupée** (le choix de la maison d’essai, un réglage chez Hestia).

Couper la prise en pleine chauffe arrête aussi l’extracteur qui refroidit le poêle : c’est un dernier recours. La page n’offre jamais la prise en bascule : elle ouvre sa fiche. Le bouton « Couper la prise » d’une alerte, d’où qu’elle vienne, coupe la prise et le confirme.

### Les sécurités

| Quoi | Délai | Effet |
| --- | --- | --- |
| Alarme (l’état, ou le texte d’alarme autre que OK) | 2 min | éteint le thermostat (et lance l’arrêt lui-même s’il l’était déjà), prévient avec le texte de l’alarme |
| Pièce du poêle au-dessus de 28 °C | aucun | pareil |
| Poêle muet | 15 min | prévient seulement, avec la prise : au-dessus de 60 W, « il chauffe encore et ne reçoit plus d’ordre » ; sinon « physiquement à l’arrêt ». Propose de couper la prise |
| Brasier à nettoyer | aucun | prévient : la chauffe en cours finit, le prochain démarrage est bloqué |
| Maison assez chaude | 2 min | hors gel, donc arrêt |

- **Un poêle muet ne coupe pas le thermostat** (le choix de la maison d’essai) : les ordres ne passent plus, couper ne ferait qu’arrêter la modulation et perdre la trace. Le seul levier qui marche encore est la prise.
- **Les 2 minutes de la maison assez chaude** : au redémarrage de Home Assistant, la condition s’est éteinte 14 secondes, le temps que ses sondes reviennent ; sans délai, le poêle passait en hors gel en pleine chauffe.
- **La veille** : dans la maison d’essai, les sécurités partent sur un changement d’état, qui peut être manqué (un redémarrage, un rechargement) ; une veille repasse toutes les 2 minutes et au démarrage. Hestia décide sur l’état à chaque calcul, pas sur les changements : la veille est faite à chaque calcul.

### Les granulés

**Le débit estimé**, lu sur l’état, jamais sur la flamme seule :

| État | Débit (kg/h, poêle de 7 kW) |
| --- | --- |
| allumage | 1,2 |
| chauffe, nettoyage | selon la flamme réelle : 1 → 0,55 · 2 → 0,81 · 3 → 1,07 · 4 → 1,34 · 5 → 1,60 |
| muet, prise au-dessus de 60 W | 1,07 (le palier du milieu) |
| le reste | 0 |

Ce sont des ordres de grandeur, pas des mesures : la forme est bonne, l’échelle se règle d’un seul facteur, appris sur les sacs. Muet et prise à zéro : rien n’est compté. On sous-estime plutôt que d’inventer. Les débits vont dans le profil ; le facteur est appris.

**Les kilos** : le débit intégré dans le temps, puis par jour et par saison. La saison va du 1er septembre au 31 août, ou part du mois où Suivi Stock Pellet commence la sienne, pour que les deux comptent la même saison (une saison au 1er janvier couperait l’hiver en deux). Un arrêt de Home Assistant ne compte rien : plutôt rien qu’une supposition.

**Le nettoyage du brasier** : seuil réglable, **15 kg** par défaut (un sac). Le brasier était déjà sale à 18 kg. Les kilos depuis le dernier nettoyage se calent sur les sacs déclarés dans Suivi Stock Pellet : un sac déclaré, c’est un réservoir vide, donc un sac entier brûlé depuis le remplissage précédent. La correction apprise (sac ÷ estimation) est bornée entre 0,7 et 1,6 ; l’estimation seule comptait 30 % trop bas. Hestia n’apprend pas du premier sac qu’elle voit : elle ne sait pas si le réservoir était vide quand elle a commencé à compter. « J’ai nettoyé » remet le compteur à zéro (arrondi vers le bas, avec une marge de 0,5 kg), et remet le thermostat en hors gel et allumé, ce qui lève le verrou. **Le nettoyage bloque le prochain démarrage, jamais la chauffe en cours.** Dans Hestia 0.6, « J’ai nettoyé » ne fait que remettre le compteur à zéro : le blocage du démarrage et le thermostat viendront avec le pilote entier.

**L’énergie et le prix** :

```
kWh utiles par kg  = 4,8 (pouvoir calorifique) × 0,87 (rendement) = 4,176
prix du kg         = prix du sac ÷ poids du sac
prix du kWh utile  = prix du kg ÷ 4,176
énergie du poêle   = kilos × 4,176          ← c’est elle qu’Énergie doit recevoir
```

Le prix ne vit qu’à un seul endroit (le sac et son poids). Un prix « sans rendement » est environ 20 % trop bas. Suivi Stock Pellet compte 4,6 kWh par kg, sans rendement : son énergie est la chaleur du granulé, pas celle qui entre dans la maison. Sans prix saisi dans Hestia, le prix du sac est la dépense de la saison ÷ les sacs achetés, lus dans Suivi Stock Pellet.

### Ce que montre la page Poêle

Toute la logique d’affichage vit dans le calcul, la page ne fait que la mettre en forme.

- **La couleur**, première vraie : rouge pour une alarme, une surchauffe, un poêle muet dont la prise tire plus de 60 W (« il brûle sans commande »), ou une chauffe avec un ouvrant ouvert dans sa pièce ; orange pour un brasier à nettoyer, un poêle muet, un ordre refusé ; bleu en chauffe ; gris sinon.
- **La phrase**, première vraie : l’alarme ; la surchauffe ; « ne répond plus mais la prise mesure N W » ; « ne répond plus » ; « l’ordre d’allumage n’est pas passé » ; « brasier à nettoyer : X kg brûlés » ; allumage en cours ; « extinction en cours, comptez vingt minutes » ; nettoyage automatique du brasier ; chauffe avec un ouvrant ouvert ; en chauffe, selon l’arrivée (« consigne atteinte, le poêle entretient », « monte lentement », « consigne à plus de 5 h », ou l’heure : « 21,5 °C vers 18 h 20 ») ; « en veille, il repartira seul » ; « thermostat éteint : le poêle ne démarrera pas » ; « éteint, en hors gel jusqu’au prochain boost du planning » ; « éteint : » et la raison du blocage ; sinon « éteint, démarrage au prochain passage en boost ». *Pourquoi « jusqu’au prochain boost » : l’ancien texte « la relance est manuelle » a fait éteindre le thermostat pour rien.*
- **Pourquoi il ne démarre pas**, quand il est éteint : une question attend ; la gestion automatique est coupée ; l’alarme ; la surchauffe ; le brasier ; le poêle ne répond pas ; l’ordre d’allumage n’est pas passé ; le thermostat est éteint ; une consigne réglée à la main (le démarrage n’écoute que le boost) ; le thermostat en hors gel ; la maison déjà à X °C pour Y °C ; la saison douce demandera.
- **Les alertes**, en trois niveaux (urgent, à faire, pour info), **jamais réduites à une seule** : deux blocages sont deux choses à savoir. Dont le quota : atteint (urgent, « réglez le poêle depuis l’appli du fabricant ») ou presque (à faire).
- **La flamme bloquée** : une ligne seulement pour l’anomalie durable (le poêle brûle, le quota est dans sa réserve, la flamme n’est pas celle visée). Un écart passager est voulu (marge, demi-heure) et ne se signale pas.
- **L’heure d’arrivée** : `écart ÷ pente`. Rien si le poêle ne chauffe pas ; « atteinte » sous zéro ; « trop lente » sous 0,4 °C par heure ; « lointaine » au-delà de 5 heures ; sinon l’heure.
- **La jauge** : en chauffe, la flamme réelle ; éteint, la flamme visée en pâle, jamais « 1 sur 5 ». **Pas de fumées quand le poêle est muet** (le capteur retombe à 0, qui se lirait comme une mesure). Le débit reste, c’est une estimation assumée.
- **Un seul bouton d’action à la fois** : Non et « Oui, chauffer » pendant une question ; Éteindre si le poêle brûle, s’allume ou s’éteint ; sinon Allumer. Et « J’ai nettoyé » quand des kilos ont brûlé depuis le dernier nettoyage. La gestion automatique et la flamme au plus bas sont des bascules ; la prise et la ventilation, pilotées par ailleurs, ouvrent leur fiche.
- **Le radiateur de secours de la pièce du poêle** : quand un radiateur électrique partage la pièce et le planning du poêle avec un boost plus bas que son confort, c’est voulu (il ne prend le relais que si le poêle ne suffit pas). La page le dit en clair (par exemple « poêle 21,5 °C · relais électrique à 18 °C ») et ne le signale jamais comme une erreur.

### Les gestes et les notifications

- **Allumer** : le thermostat en chauffe, puis en boost ; déjà en boost, relancer le démarrage. Ne contourne aucune sécurité : la saison douce demande toujours.
- **Éteindre** : le préréglage hors gel. Si le poêle brûle encore et que l’arrêt ne tourne pas (thermostat déjà éteint), lancer l’arrêt directement. *Pourquoi : trois appuis sur Éteindre n’avaient rien envoyé, le thermostat restauré éteint.*
- **Oui** et **Non**, seulement quand une question attend. Sans Non, il faudrait attendre 15 minutes, la page en alerte tout ce temps.
- **Les notifications** vont au destinataire choisi dans Réglages, avec une étiquette par sujet (une nouvelle remplace l’ancienne) : thermostat éteint, saison douce, refus, ordre d’allumage refusé, alarme, surchauffe, poêle muet, brasier, arrêt non confirmé, prise coupée, coupure de rattrapage, reprise après un redémarrage. Les plus graves restent aussi dans les notifications de Home Assistant. Leurs boutons : Oui, Non, J’ai nettoyé, Couper la prise, Ignorer.

## Les pièces, le planning et le bilan : ce que la maison d’essai apprend

- **Une pièce chauffe** quand son thermostat chauffe **ou** que sa puissance moyenne du cycle est au-dessus de zéro : `hvac_action` seul disait « poêle seul » au-dessus de « électrique 3 % ».
- **L’ouvrant** se lit dans le Versatile Thermostat, à chaque fois, jamais recopié : une pièce recâblée suit seule. Une chauffe avec l’ouvrant ouvert est urgente ; l’ouvrant ouvert sans chauffe est une info. L’ouvrant de la pièce du poêle n’est pas suivi par son thermostat : Hestia alerte, elle ne coupe pas (point ouvert n° 6).
- **Pas de consigne affichée pour un thermostat éteint** (« 20,3 → 18 » laissait croire que la pièce visait 18 °C alors que le poêle la chauffait). Pas de jauge de demande si elle est inconnue. Seuls les préréglages que le thermostat propose ; « manuel » n’est jamais un bouton. Les boutons − et + suivent le pas du thermostat (au moins 0,5 °C), dans ses bornes.
- **Une pièce à 100 % qui ne monte pas** (pente sous 0,2 °C par heure) : « consigne hors d’atteinte ». La sécurité du Versatile Thermostat déclenchée : urgent.
- **Les sèche-serviettes** sont dans le planning, **jamais dans le bilan** : ils sèchent du linge, le poêle ne peut pas les remplacer. Un sèche-serviettes oublié une douzaine de jours avait faussé le bilan et trois conseils. Allumé depuis plus de 24 h : « oublié ? ».
- **La maison en une phrase** : poêle et appoint, poêle seul, électrique, à l’arrêt. Au-delà d’une puissance électrique simultanée (un réglage), une info, **pas un délestage** : c’est le planning qui évite les simultanéités.
- **Scheduler** : les jours comptent depuis lundi ; sans capteur de jours ouvrés, « semaine » veut dire lundi à vendredi, jours fériés compris ; une fin avant le début vaut minuit ; deux créneaux accolés de même action n’en font qu’un. Deux plannings armés sur la même pièce : urgent, le dernier déclenché gagne et rien ne le montre. Une pièce sans planning garde le préréglage de la veille. La couleur d’un créneau monte avec la consigne, et son infobulle donne la consigne réelle de cette pièce (le même boost ne vaut pas la même chose au radiateur de secours et au poêle).
- **Le bilan en euros** revient à Hestia Énergie, qui lit Chauffage. Les règles à lui transmettre : l’énergie du poêle sur les kilos, jamais sur le thermostat ; la référence « à froid égal » sur les seuls jours vraiment chauffés (sinon le premier jour de chauffe est « 645 % plus cher ») ; les conseils qui dépendent du froid se taisent hors saison ; le bilan disparaît plutôt que d’aligner des zéros ; le vert est réservé au gain.
- **Les courbes** : 24 h au quart d’heure ; pas de relevé au démarrage de Home Assistant (un point vide couperait tout) ; un trou de 30 minutes au plus est enjambé ; une amplitude d’au moins 1,5 °C (sinon une pièce stable dessine des dents de scie) ; la température est adoucie, **la consigne jamais** ; moins de 3 points : « courbe en construction ».

## Les réglages

Ce qui dépend du foyer, avec sa valeur par défaut. | Réglage | Par défaut | Depuis |
| --- | --- | --- |
| Thermostat pilote du poêle | à choisir (trouvé seul quand c’est possible) | 0.1 |
| Température de la maison | la moyenne des pièces chauffées, ou un capteur choisi | 0.4 |
| Le pilote : à l’ombre, flamme, éteint | à l’ombre | 0.4, 0.5 |
| Flamme au plus bas (un interrupteur) | aucun | 0.5 |
| Paliers de flamme | 45 · 65 · 85 % | 0.4, fixe |
| Marge de flamme | 7 points | 0.4, fixe |
| Flamme minimale de croisière | 2 | 0.4, fixe |
| Pièce trop chaude | consigne + 0,5 °C, prévue à 15 min | 0.4, fixe |
| Délai entre deux hausses de flamme | 30 min | 0.4, fixe |
| Réserve d’ordres | 4 (6 avant la ventilation) | 0.4, fixe |
| Plafond d’ordres du poêle | lu dans les options de son intégration | 0.5, lu (sinon celui du profil) |
| Écart d’hystérésis hors boost | 1,0 °C | 0.4, fixe |
| Saison douce | permis sous 18 °C, demande au-dessus de 19 °C | 0.4, fixe |
| Délai de réponse en saison douce | 15 min | 0.4, fixe |
| Sécurité surchauffe | 28 °C | 0.4, fixe |
| Vérification d’arrêt | 25 min | à faire |
| Couper la prise sans réponse | oui, après 5 min | à faire |
| Prix et poids du sac | à saisir (lus dans Suivi Stock Pellet s’il est là) | 0.6, Réglages |
| Seuil de nettoyage du brasier | 15 kg | 0.6, Réglages |
| Débits par flamme | ceux du profil, puis appris sur les sacs | 0.6 : le profil, et le facteur appris |
| Puissance électrique simultanée | selon l’abonnement | à faire |
| Destinataire des notifications | à choisir | à faire |

« Fixe » : une constante du pilote aujourd’hui, à ouvrir en réglage quand un deuxième foyer en aura besoin. Les constantes qui restent fixes : 4,8 kWh par kg, rendement 0,87, base des degrés-jours 18 °C, fumées froides sous 60 °C, prise en veille sous 70 W, prise active au-dessus de 60 W, alarme tenue 2 minutes.

## Hestia face à la maison d’essai

Où en est Hestia 0.6 par rapport à ce fonctionnement. Le pilote « à l’ombre » compare déjà ses gestes à ceux de la maison chaque jour.

| Règle | Hestia 0.6 | À faire |
| --- | --- | --- |
| Escalier, marge de 7 points, hausse par demi-heure, réserve de 4, flamme au plus bas | pareil, en une seule fonction | — |
| Pièce trop chaude, sur la température **lissée** | pareil depuis le 22 novembre (`ema_temp`) ; la sécurité des 28 °C lit la température en direct | — |
| Plafond d’ordres lu dans les options de l’intégration | lu dans l’entrée de l’extension (`max_eeprom_writes_per_day`), sinon 20 | — |
| Jamais « 1 sur 5 » poêle éteint | pas de flamme poêle éteint, seulement la flamme réglée en pâle ; courbe à 0 | — |
| Débit, kilos, énergie et prix des granulés | pareil depuis la 0.6 : débit par état et flamme, facteur appris sur les sacs, saison | — |
| Énergie du poêle sur les kilos | depuis la 0.6, l’interface donne à Énergie l’énergie comptée par Hestia, jamais le compteur du thermostat | Énergie : la lire (son fil) |
| Saison douce sans réponse, poêle déjà en route : rien coupé | pareil | — |
| Arrêt après 30 s d’« éteint », pas au retour d’un redémarrage | pareil ; un poêle relu au redémarrage n’est pas non plus un démarrage | — |
| Brasier : compteur, seuil, « J’ai nettoyé » | pareil depuis la 0.6 (sur les sacs, sinon sur les kilos de Hestia) | — |
| Brasier : blocage du prochain démarrage, thermostat remis en hors gel | non | avec le pilote entier |
| Démarrage : réglages seulement s’ils changent, contrôle d’allumage, rechargement | dit à l’ombre, sans contrôle | avec le pilote entier |
| Arrêt vérifié à 25 min, escalade, prise | dit à l’ombre (« 3 essais, puis vérifier ») | avec le pilote entier |
| Reprise après un redémarrage | non | avec le pilote entier |
| Veille des sécurités | faite à chaque calcul, sur l’état | — |
| Question de saison douce, notifications, boutons | dits à l’ombre | avec le pilote entier |
| Gestion automatique (un interrupteur) | le réglage du pilote (à l’ombre, flamme, éteint) | — |
| Montage du poêle (consigne interne, ECO Stop) | ECO Stop lu | lire aussi la consigne interne, et le signaler s’il change |

## Points ouverts

À trancher avec Frank avant de les figer dans Hestia.

1. **Plancher de flamme à 2, ou flamme 1 ?** La flamme 1 « pièce trop chaude » peut durer longtemps en boost, alors que la flamme 1 encrasse plus par kilo. Suivre les kilos par nettoyage pour décider.
2. **Le boost chauffe la maison par la pièce du poêle.** Il continue tant que la moyenne de la maison est sous la consigne : la pièce du poêle peut finir plusieurs degrés au-dessus des chambres. Pistes : sortir la pièce du poêle de la moyenne, plafonner sa pièce (veille du poêle à consigne + 2 °C), ou une consigne de maison distincte.
3. **La ventilation** : AUTO depuis la mi-novembre ; « flamme + 1 » attend l’avis de Frank.
4. **Les seuils TPI du thermostat du poêle** (1 et 0,1, au lieu de 0 et 0 conseillés) écrêtent peut-être la demande. Pas prouvé : des demandes intermédiaires sont vues.
5. **L’ouvrant de la pièce du poêle** : alerter (aujourd’hui) ou baisser la flamme à 1 à l’ouverture ?
6. ~~**La saison des compteurs**~~ : tranché dans la 0.6, du 1er septembre au 31 août, ou du mois où Suivi Stock Pellet commence la sienne.
7. **Le conseil « allumer le poêle »** part même hors saison, ou quand la température dehors est inconnue ; rien ne traite un granulé plus cher que l’électricité.
8. **L’anticipation du démarrage** est reportée : montrer le prochain changement de préréglage du planning, pas une heure calculée.
9. **Le plafond d’ordres de la maison d’essai** : le document de la maison et son capteur de quota ne donnent pas le même plafond. Hestia le lira à la source, dans les options de l’intégration.
10. **Pourquoi Versatile Thermostat restaure parfois « éteint » au redémarrage** : inconnu. La reprise corrige l’effet, pas la cause.

## La suite

La v0.1 ne commandait rien. Les versions, et la suite proposée :

1. **0.1** — la brique en lecture seule.
2. **0.2** — l’interface vers Énergie, puis Énergie l’affiche à la place de sa devinette par une source « gaz ».
3. **0.3** — les plannings maison, simples : une semaine en couleurs (tous les jours pareils, semaine et week-end, ou jour par jour), des plages, le niveau du reste du temps, et les thermostats cochés. Un thermostat suit un seul planning. Scheduler reste lu, et un de ses plannings se reprend dans Hestia en un clic. Chaque planning commence « En essai » et n’envoie, une fois « Actif », que des préréglages, jamais un allumage ou un arrêt (détail dans [technique.md](technique.md#le-planning-hestia)). Les matins froids et le prix de l’électricité, prévus d’abord, sont laissés de côté pour rester simple.
4. **0.4** — le pilote de poêle « à l’ombre » : il calcule ce qu’il ferait (démarrer, flamme 3, refuser pour surchauffe…) et l’affiche à côté de ce que font les automatisations de la maison, sans rien envoyer.
5. **0.5** — le pilote règle la flamme, en option (Réglages, « Flamme ») : la flamme selon la demande du thermostat, un ordre à la fois, vérifié 5 min après, 12 ordres par jour au plus, et jamais dans la réserve de 4 sous le plafond de l’extension. Le démarrage, l’arrêt et les sécurités restent aux automatisations de la maison. Si la flamme change sans Hestia, ou si le poêle ne suit pas trois fois, Hestia la laisse jusqu’au lendemain. Revenir « À l’ombre » est le retour arrière en un clic. Jamais au labo.
6. **Avant d’essayer « Flamme » à la maison** — fait le 22 novembre : la température lissée, le plafond d’ordres lu dans l’extension, jamais « 1 sur 5 » poêle éteint, l’exception de la saison douce, et pas de faux écart après un redémarrage.
7. **0.6** — les granulés : débit, kilos, nettoyage du brasier (compteur, seuil, calage sur les sacs, « J’ai nettoyé »), énergie et prix ; l’énergie du poêle donnée à Hestia Énergie sur les kilos. Rien n’est envoyé au poêle pour ça.
8. **Proposé ensuite : le pilote entier**, profil Micronova, toujours en option : le démarrage et ses cas, le contrôle d’allumage, l’arrêt vérifié et son escalade, les sécurités, la reprise après un redémarrage, les questions et les notifications. D’abord à l’ombre face à la maison d’essai, puis à la maison, jamais au labo.
9. Les autres profils (Palazzetti, Fumis, Rika, Edilkamin, MCZ…), un par un, avec des testeurs.

## Le dépôt, les tests, le labo

**Le dépôt**, sur le modèle d’Énergie :

- `custom_components/hestia_heating/` : `__init__.py`, `config_flow.py`, `coordinator.py`, `reader.py` (tout ce qui touche Home Assistant), `engine/` (Python pur, testé sans Home Assistant), `profiles/*.json`, `api.py`, `websocket.py`, `sensor.py`, `binary_sensor.py`, `panel.py`, les copies du socle ; `frontend/` compilé.
- `frontend/` (le panneau), `card/` (la carte), `tests/` (avec une maison inventée, `maison_fictive.py`), `docs/` (ce cahier, `technique.md`), `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `hacs.json`, la CI (tests, hassfest, HACS, fichiers compilés à jour).
- Version `0.1.0b1`. Commits au nom de hestiaFB.

**Vitesse** : la brique écoute seulement les entités qu’elle a trouvées, recalcule la pièce qui a changé, et répond au panneau en moins de 0,25 s au labo. Aucun calcul sur l’historique en v0.1, sauf la courbe d’une pièce à la demande.

**Au labo** : la v0.1 ne commande rien, donc elle peut tourner au labo sans risque pour un vrai poêle. Il faut ajouter `chauffage` à `hestia-labo/deployer.sh`, puis mesurer le panneau avec `mesurer-hub.py`. Un seul déploiement à la fois.

## Décisions prises

Le 22 novembre 2026 :

- Le fonctionnement du poêle de la maison d’essai, écrit par Frank, est la base de la gestion des poêles dans la brique. Ses règles, leurs chiffres et leurs raisons sont repris plus haut, sans les données de la maison.
- Frank : « allons-y » pour les granulés et le brasier (0.6), puis le pilote entier, en option éteinte par défaut.

Le 20 novembre 2026 :

- Nom : Hestia Chauffage, domaine `hestia_heating`, onglet `chauffage`.
- La brique pilotera le poêle, en option éteinte par défaut, après une phase « à l’ombre ».
- La clim fait partie de la v0.1 (testée sur un thermostat simulé).
- Le planning maison est la plus-value de la brique.
- Hestia Énergie ne change pas d’ici là.
- Une maquette de l’Accueil et de la page Poêle avant le code.
