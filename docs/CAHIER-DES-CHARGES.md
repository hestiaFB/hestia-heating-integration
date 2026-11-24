# Hestia Chauffage — cahier des charges

Version du 24 novembre 2026 (première version le 20 novembre). Document vivant : il décrit la brique telle qu’elle est.

**Ce que fait la brique** : elle lit et explique le chauffage de la maison (thermostats, poêle à granulés, plannings). Elle a ses propres plannings, « En pause » d’abord, « Actif » quand vous le décidez, et un pilote du poêle, sur « Conseil » au départ (il dit ce qu’il ferait), qui peut en option régler la flamme ou conduire le poêle entier. Elle compte aussi les granulés et le brasier. Le fonctionnement complet du poêle de la maison de référence est la base de la gestion des poêles (« Le poêle : la base de sa gestion », plus bas). Le détail technique (entités, interface, commandes, profils) est dans [technique.md](technique.md) ; l’histoire des versions et les décisions, dans [dev/HISTOIRE.md](dev/HISTOIRE.md).

## Place dans l’écosystème

Hestia Chauffage dit, pour toute la maison, qui chauffe ou rafraîchit, pourquoi, et ce qui vient ensuite. Elle lit et explique d’abord, et ne commande que ce que vous lui confiez : les préréglages d’un planning actif, et en option la flamme ou le poêle entier. Elle est prévue dans `ECOSYSTEME.md` de `hestia-ecosysteme` (« Pilote la chaleur, seul propriétaire des commandes thermiques »).

| Sens | Ce qui circule | Intensité | Aujourd’hui |
| --- | --- | --- | --- |
| Weather → Chauffage | froid et soleil à venir, degrés-jours (`hestia_weather_api` v1, déjà publiée) | forte | lu, affiché (« −3 °C cette nuit ») |
| Chauffage → Énergie | chaque source de chaleur : en marche, puissance, compteurs (`hestia_heating_api` v1) | moyenne | publiée, Énergie ne la lit pas encore |
| Chauffage → Confort | état réel par pièce | moyenne | publiée, Confort continue de lire Versatile Thermostat lui-même |
| Confort → Chauffage | besoins par pièce, fenêtres, propositions de pause (passerelle) | forte | non, plus tard |

Sans les autres briques, elle reste utile : thermostats, poêle et planning sur une même page. Un lien absent est dit (« Hestia Weather non installé »), jamais simulé.

## Ce qu’elle lit

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

La prise mesurée du poêle, si elle existe, sert de témoin hors cloud (le poêle tourne-t-il vraiment ?). La lecture n’écrit rien : pas d’appel de service, pas de réglage changé dans une autre intégration. Ce que Hestia peut commander (un planning actif, le pilote du poêle) est toujours en option, et dit plus bas.

La clim est lue comme un thermostat. Elle est développée sur un thermostat simulé, faute d’une maison de référence qui en ait une.

## Ce qu’elle montre

Un onglet **Chauffage** dans le panneau Hestia-FB (adresse `/hestia/chauffage`) et une carte pour les tableaux de bord, sur le socle commun, comme Weather, Confort et Énergie.

Depuis la 1.0.0b3 (maquette « panneau technique » validée par Frank le 24 novembre), l’onglet est technique et simple : il dit si tout marche et ce que Hestia a fait ; la température de chaque pièce vit sur les cartes.

| Page | Ce qu’on y voit |
| --- | --- |
| Vue d’ensemble | Les thermostats qui répondent, les mesures reçues, les changements faits aujourd’hui ; ce qui est à régler ; vos appareils (par sorte, avec leur dernière nouvelle), ce que Hestia fait pour vous, ce qu’elle a changé aujourd’hui ; le lien vers le guide |
| Le poêle, côté technique (depuis la vue d’ensemble) | Chaque entité lue, sa valeur et son âge ; ce que Hestia y a changé aujourd’hui ; le journal du jour ; l’essai à blanc et la dernière différence ; la question en attente ; le brasier |
| Planning | La liste des plannings Hestia (une semaine en couleurs, ses thermostats, En pause ou Actif), un éditeur par planning, et les plannings de Scheduler, lus et repris en un clic |
| Réglages | Trois onglets : La maison (ce qui chauffe, la température de la maison, la météo, le prix du kWh, le téléphone), Thermostats (pour chacun : le planning change son mode, ce qui chauffe la pièce, le montrer, ses modes, ce qui est lu, sa pièce), Poêle à granulés (son thermostat et sa prise, la flamme, la ventilation, l’ÉCO Stop, allumer et éteindre, les granulés) et son écran Avancé (tous les chiffres du pilote) |
| Le guide | Cinq étapes, une question à la fois : ce qui chauffe, vos thermostats, le poêle, le planning, les prix |
| Extensions, À propos | Les intégrations lues ; les versions |

**Ce qui part au poêle depuis l’onglet ou la carte**, appuyé par l’utilisateur et envoyé depuis son navigateur comme depuis l’application du poêle (jamais à un poêle recopié : grisé) : la puissance et la température réglée dans le poêle en flamme manuelle, la vitesse de la ventilation en manuel, l’ÉCO Stop et son délai. Revenir à la flamme automatique remet la température réglée dans le poêle à celle de Hestia (25 °C) ; revenir à la ventilation « par le poêle » la remet en AUTO. Le reste (Automatique ou Manuel, qui allume) s’enregistre avec les réglages.

La carte a quatre formes (maquette validée le 20 novembre) : la maison, le poêle, une pièce et le planning du jour. Le poêle et une pièce ont deux versions : complète (l’horloge du jour en grand, sa légende) et compacte (l’horloge en petit à côté de sa phrase, environ deux fois moins haute) ; une pièce a aussi sa version sur une ligne. Sous le nom du poêle, sa phrase (voir « Ce que montre la page Poêle »), dans la couleur de son état. Les réglages de la carte sont ceux des autres briques : les formes en tuiles, puis un formulaire (la pièce, la version, le titre, et l’appui dans « Fonctionnalités »). La carte d’une pièce a aussi, depuis le 23 novembre (demande de Frank), les modes de son thermostat en bas (Hors gel, Éco, Confort, Boost, ceux qu’il propose) et un clic qui ouvre le thermostat (au choix dans ses réglages : le thermostat, la page de la pièce, ou rien). Le mode est choisi par l’utilisateur et envoyé depuis son navigateur, comme avec la carte thermostat de Home Assistant : ce n’est pas une commande de Hestia, et jamais vers un thermostat recopié (boutons grisés). Sur l’horloge du poêle (1.0.0b6, demande de Frank), chaque trait d’heure montre le palier de flamme en entier, même pour quelques minutes de feu, et la consigne se dessine en marches sur toutes les heures où le thermostat la demandait (jamais le hors gel). Le bouton « J’ai nettoyé » montre aussi le brasier, rempli comme lui, avec ses jours restants. Depuis la 1.0.0b3, le tiroir « Le feu et les réglages » de la carte du poêle a la flamme (Auto ou une puissance), la ventilation (par le poêle, par Hestia, ou une vitesse) et l’ÉCO Stop avec sa phrase ; son bouton « Gestion auto » devient « Flamme auto ». Avec le socle 1.24, la porte de l’accueil Hestia-FB prend l’icône « maison » par défaut ; son icône et sa couleur propres demandent un petit ajout au socle (1.25), à faire avant la 1.0.0.

## Ce qu’elle publie

Peu d’entités, aux identifiants stables (`<entrée>_<clé>`, jamais changés ensuite sauf majeur avec migration), et une interface Python versionnée pour les autres briques.

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

Dans la version 1, une méthode s’ajoute, ne se renomme ni ne se retire. Le contrat est décrit dans [technique.md](technique.md) ; la ligne reste à ajouter au tableau des interfaces d’`ECOSYSTEME.md`.

## Le profil de poêle

Un profil est un fichier de données par intégration, sans code : il dit où trouver chaque rôle sur l’appareil du poêle et comment traduire ses mots. La lecture se sert des rôles de lecture ; le pilote utilise aussi `thermostat`, `flamme` et la limite d’ordres par jour ; le pilote entier, le rôle `ventilation` et les `ordres`. Les textes ci-dessous ont été relevés sur un poêle Micronova par Agua IOT, en français (« Éteindre » est le poêle éteint), avec les mots anglais du même poêle.

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
    "eco_stop": {"domaine": "switch", "fin": "_eco_stop"},
    "ventilation": {"domaine": "climate", "fin": "_vent_front"}
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
  "limites": {"ecritures_par_jour": 20, "option_ecritures": "max_eeprom_writes_per_day", "cloud": true},
  "debits": {"allumage": 1.2, "flammes": [0.55, 0.81, 1.07, 1.34, 1.60]},
  "ordres": {
    "allumer": {"role": "thermostat", "service": "climate.set_hvac_mode", "donnees": {"hvac_mode": "heat"}},
    "eteindre": {"role": "thermostat", "service": "climate.set_hvac_mode", "donnees": {"hvac_mode": "off"}},
    "allume_si": {"role": "thermostat", "etat": "heat"},
    "recharger": true,
    "reglages": [
      {"nom": "Consigne interne à 25 °C", "role": "thermostat", "attribut": "temperature", "valeur": 25,
       "service": "climate.set_temperature", "donnees": {"temperature": 25}},
      {"nom": "ECO Stop", "role": "eco_stop", "valeur": "on", "service": "switch.turn_on"},
      {"nom": "Ventilation en AUTO", "role": "ventilation", "attribut": "fan_mode", "valeur": "AUTO",
       "service": "climate.set_fan_mode", "donnees": {"fan_mode": "AUTO"}, "reserve": 6}
    ]
  }
}
```

`ordres` (0.7) dit comment le pilote entier parle au poêle : le service qui l’allume et celui qui l’éteint, ce qui dit qu’il a pris l’ordre d’allumage (ici, le thermostat interne du poêle en « chauffe »), si son intégration peut être rechargée, et les réglages envoyés avant un démarrage, chacun seulement s’il a changé (`reserve` : seulement s’il reste plus d’ordres que ce nombre). Un profil sans `ordres` ne peut pas être conduit entier : Hestia le dit et n’envoie rien.

Un texte inconnu reste affiché tel quel et marqué « à traduire », jamais deviné. `Stand-by` est rangé avec « éteint » : la page dit « en veille, il repartira seul ».

Depuis la 0.5, le profil dit où lire le plafond d’ordres (`option_ecritures`) ; depuis la 0.6, les débits de granulés (`debits`) ; depuis la 0.7, comment allumer et éteindre le poêle (`ordres`). La flamme réelle n’est lue que poêle en feu : sur ce poêle, elle vaut 1 poêle éteint.

## Le poêle : la base de sa gestion

Écrit le 22 novembre 2026 d’après le fonctionnement complet du poêle de la maison de référence : un poêle à granulés Micronova de 7 kW, par le cloud Agua IOT, piloté depuis l’automne par des automatisations Home Assistant et un Versatile Thermostat. Ce document de référence reste hors du dépôt, car il contient les entités de la maison. On en garde ici les règles, les chiffres et leurs raisons. C’est la base de la gestion des poêles dans la brique : le pilote de Hestia les reprend une à une, et un autre poêle les reçoit par son profil.

**Presque chaque règle vient d’un incident vécu.** Avant d’en simplifier une, lire sa raison (colonne « Pourquoi »).

### Les principes

Quatre règles de la maison de référence, dont tout le reste découle :

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

**Le plafond d’ordres** (intégration Agua IOT 2.3 et suivantes) : réglable dans les options de l’intégration (`max_eeprom_writes_per_day`, 20 par défaut), remis à zéro à minuit, heure locale. Les tentatives ratées comptent ; la flamme, la ventilation et la consigne comptent ; l’ordre d’arrêt ne compte pas. Plafond atteint : plus aucun réglage ne passe avant minuit, sans erreur visible. Hestia lit ce plafond dans les options de l’entrée de l’intégration (le profil ne donne que la valeur par défaut) et le nombre d’ordres du jour sur le compteur de l’intégration. Elle garde 4 ordres de réserve pour pouvoir éteindre et régler le poêle au démarrage suivant (6 avant de régler la ventilation).

### Le montage, à ne pas défaire

- **La consigne interne du poêle est gardée au plus haut (25 °C), et son ECO Stop reste actif.** Le poêle n’atteint jamais sa consigne, donc il ne se met jamais en veille de lui-même : il applique la flamme qu’on lui envoie. Cette consigne est réaffirmée à chaque allumage, seulement si elle a changé (quota).
- **Deux filets indépendants** : ECO Stop côté poêle (il survit à une panne de Home Assistant), la sécurité surchauffe à 28 °C côté Home Assistant.
- **La ventilation est en AUTO**, réglée une fois au démarrage : la régler à chaque variation des fumées vidait le quota. L’autre choix, dans Réglages (mode Entier et son simulateur) : **flamme + 1**, au plus 5, et au plus bas tant que les fumées sont sous 110 °C. Chaque changement coûte alors un ordre : au plus un toutes les 10 minutes, et seulement s’il en reste plus de 6 ; rien n’est réglé avant le démarrage.

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
| la maison est assez chaude | refuse et le dit ; le préréglage reste boost : le poêle partira au prochain passage en boost |
| sinon | démarre |

*Corrigé le 22 novembre* : l’ancienne ligne disait « le poêle partira dès que l’écart se creusera ». Rien dans la maison de référence ne relance le démarrage quand l’écart se creuse, et c’est voulu (le poêle ne se rallume jamais seul) : seul un nouveau passage en boost le relance. Hestia fait de même.

**Hestia ne démarre pas le poêle plus de 3 fois par jour** (une garde de Hestia : au-delà, c’est un geste de la personne). Un démarrage refusé, une question et ses réponses, chaque ordre et son résultat sont écrits dans le journal du jour.

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
- **La pièce trop chaude, avec anticipation** : sur la température **lissée** `t` de la pièce, prolongée de 15 minutes sur sa pente quand elle monte (`t + max(pente, 0) × 0,25`), au-dessus de la consigne + 2 °C (réglable dans Réglages, « Pièce trop chaude », de 0,5 à 5 °C) ; ou la flamme déjà à 1 et `t` à la consigne ou au-dessus. Retour au palier normal sous la consigne. *Pourquoi : une pièce montée de plus de 3 °C en 35 minutes en flamme 3 ; et la température lissée, parce qu’une bouffée d’air chaud sur la sonde avait fait passer la flamme à 1 pendant 4 minutes, deux ordres perdus.*
- **Baisser tout de suite, monter au plus une fois par demi-heure** après le dernier changement de flamme (par qui que ce soit), sauf deux paliers d’écart ou la flamme au plus bas choisie.
- **Rien à changer, rien envoyé** : la demande bouge à chaque calcul, un ordre qui redonne la même flamme vide le quota.
- **Réserve** : avec 4 ordres ou moins sous le plafond, la flamme ne change plus.

L’escalier est **une seule fonction**, appelée par le pilote et par l’affichage (« la flamme devrait être à X ») : dans la maison de référence, sa copie pour l’affichage a pris du retard sur celle qui agit.

### Arrêter

**Déclenché** par :

- le préréglage qui passe en hors gel ;
- le thermostat éteint **depuis 30 s**, et seulement s’il était avant dans un état connu, avec un préréglage (pas un retour de redémarrage) ;
- la maison assez chaude depuis 2 minutes (le préréglage passe alors en hors gel).

Un thermostat **déjà** éteint ne déclenche rien : les sécurités et le bouton Éteindre lancent alors l’arrêt eux-mêmes.

Un thermostat **déjà** en hors gel non plus (1.0.0b5) : hors gel arrête la chauffe qu’il trouve en y passant, pas un poêle allumé ensuite. **Un poêle allumé à la main** (sur le poêle, son application ou « Allumer » sur la carte), son thermostat en hors gel, est gardé : Hestia passe le thermostat en boost, une fois par allumage, et conduit le poêle de là (la flamme, la maison assez chaude, un passage en hors gel). Jamais pendant un arrêt de Hestia, ni le thermostat éteint (un verrou). *Pourquoi : le 24 novembre, le poêle allumé à la main après un redémarrage a été arrêté au bout de 14 secondes, son thermostat resté en hors gel ; l’automatisation « Arrêt » de la maison ne réagissait qu’au passage.*

**Séquence** :

1. Attendre que l’état du poêle soit connu (2 minutes au plus).
2. Jusqu’à 3 ordres d’arrêt, 15 s entre deux, jusqu’à ce que le poêle soit en extinction, éteint, en veille ou en nettoyage. Sinon, prévenir (« Ordre d’extinction non confirmé, vérification dans 25 minutes »).
3. **La vérification, 25 minutes après** (le cycle d’extinction dure 20 minutes : 10 criaient au loup), si le préréglage est toujours hors gel, du plus sûr au moins sûr : en extinction ou en nettoyage, c’est normal ; éteint ou en veille, c’est fait ; état connu et fumées sous 60 °C, c’est fait ; prise sous 70 W, c’est fait.
4. Sinon : prévenir et renvoyer l’arrêt. 30 s plus tard, prise sous 70 W ou poêle éteint : confirmé. Sinon, une alerte « Le poêle chauffe toujours. Couper la prise ? » avec Couper et Ignorer. **Sans réponse en 5 minutes, la prise est coupée** (le choix de la maison de référence, un réglage chez Hestia).

Couper la prise en pleine chauffe arrête aussi l’extracteur qui refroidit le poêle : c’est un dernier recours. La page n’offre jamais la prise en bascule : elle ouvre sa fiche. Le bouton « Couper la prise » d’une alerte, d’où qu’elle vienne, coupe la prise et le confirme.

### Les sécurités

| Quoi | Délai | Effet |
| --- | --- | --- |
| Alarme (l’état, ou le texte d’alarme autre que OK) | 2 min | éteint le thermostat (et lance l’arrêt lui-même s’il l’était déjà), prévient avec le texte de l’alarme |
| Pièce du poêle au-dessus de 28 °C | aucun | pareil |
| Poêle muet | 15 min | prévient seulement, avec la prise : au-dessus de 60 W, « il chauffe encore et ne reçoit plus d’ordre » ; sinon « physiquement à l’arrêt ». Propose de couper la prise |
| Brasier à nettoyer | aucun | prévient : la chauffe en cours finit, le prochain démarrage est bloqué |
| Maison assez chaude | 2 min | hors gel, donc arrêt |

- **Un poêle muet ne coupe pas le thermostat** (le choix de la maison de référence) : les ordres ne passent plus, couper ne ferait qu’arrêter la modulation et perdre la trace. Le seul levier qui marche encore est la prise.
- **Les 2 minutes de la maison assez chaude** : au redémarrage de Home Assistant, la condition s’est éteinte 14 secondes, le temps que ses sondes reviennent ; sans délai, le poêle passait en hors gel en pleine chauffe.
- **La veille** : dans la maison de référence, les sécurités partent sur un changement d’état, qui peut être manqué (un redémarrage, un rechargement) ; une veille repasse toutes les 2 minutes et au démarrage. Hestia décide sur l’état à chaque calcul, pas sur les changements : la veille est faite à chaque calcul.

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

**Le nettoyage du brasier** : seuil réglable, **15 kg** par défaut (un sac). Le brasier était déjà sale à 18 kg. Les kilos depuis le dernier nettoyage se calent sur les sacs déclarés dans Suivi Stock Pellet : un sac déclaré, c’est un réservoir vide, donc un sac entier brûlé depuis le remplissage précédent. La correction apprise (sac ÷ estimation) est bornée entre 0,7 et 1,6 ; l’estimation seule comptait 30 % trop bas. Hestia n’apprend pas du premier sac qu’elle voit : elle ne sait pas si le réservoir était vide quand elle a commencé à compter. « J’ai nettoyé » remet le compteur à zéro (arrondi vers le bas, avec une marge de 0,5 kg), et remet le thermostat en hors gel et allumé, ce qui lève le verrou. **Le nettoyage bloque le prochain démarrage, jamais la chauffe en cours.** Avec le pilote entier (0.7), un démarrage refusé pour le brasier éteint le thermostat, et « J’ai nettoyé », sur la page Poêle ou le téléphone, le remet en hors gel et allumé. En « Conseil » ou en « Flamme », « J’ai nettoyé » ne fait que remettre le compteur à zéro, et le refus n’est que dit.

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
- **La phrase**, sur la page et sur la carte du poêle, première vraie : l’alarme ; la surchauffe ; « ne répond plus mais la prise mesure N W » ; « ne répond plus » ; « l’ordre d’allumage n’est pas passé » ; « brasier à nettoyer : X kg brûlés » ; allumage en cours ; « extinction en cours, comptez vingt minutes » ; nettoyage automatique du brasier ; chauffe avec un ouvrant ouvert ; en chauffe, selon l’arrivée (« consigne atteinte, le poêle entretient », « monte lentement », « consigne à plus de 5 h », ou l’heure : « 21,5 °C vers 18 h 20 ») ; « en veille, il repartira seul » ; « thermostat éteint : le poêle ne démarrera pas » ; « éteint, en hors gel jusqu’au prochain boost du planning » ; « éteint : » et la raison du blocage ; sinon « éteint, démarrage au prochain passage en boost ». *Pourquoi « jusqu’au prochain boost » : l’ancien texte « la relance est manuelle » a fait éteindre le thermostat pour rien.*
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

## Les pièces, le planning et le bilan : ce que la maison de référence apprend

- **Une pièce chauffe** quand son thermostat chauffe **ou** que sa puissance moyenne du cycle est au-dessus de zéro : `hvac_action` seul disait « poêle seul » au-dessus de « électrique 3 % ».
- **L’ouvrant** se lit dans le Versatile Thermostat, à chaque fois, jamais recopié : une pièce recâblée suit seule. Une chauffe avec l’ouvrant ouvert est urgente ; l’ouvrant ouvert sans chauffe est une info. L’ouvrant de la pièce du poêle n’est pas suivi par son thermostat : Hestia alerte, elle ne coupe pas (point ouvert n° 5).
- **Pas de consigne affichée pour un thermostat éteint** (« 20,3 → 18 » laissait croire que la pièce visait 18 °C alors que le poêle la chauffait). Pas de jauge de demande si elle est inconnue. Seuls les préréglages que le thermostat propose ; « manuel » n’est jamais un bouton. Les boutons − et + suivent le pas du thermostat (au moins 0,5 °C), dans ses bornes.
- **Une pièce à 100 % qui ne monte pas** (pente sous 0,2 °C par heure) : « consigne hors d’atteinte ». La sécurité du Versatile Thermostat déclenchée : urgent.
- **Les sèche-serviettes** sont dans le planning, **jamais dans le bilan** : ils sèchent du linge, le poêle ne peut pas les remplacer. Un sèche-serviettes oublié une douzaine de jours avait faussé le bilan et trois conseils. Allumé depuis plus de 24 h : « oublié ? ».
- **La maison en une phrase** : poêle et appoint, poêle seul, électrique, à l’arrêt. Au-delà d’une puissance électrique simultanée (un réglage), une info, **pas un délestage** : c’est le planning qui évite les simultanéités.
- **Scheduler** : les jours comptent depuis lundi ; sans capteur de jours ouvrés, « semaine » veut dire lundi à vendredi, jours fériés compris ; une fin avant le début vaut minuit ; deux créneaux accolés de même action n’en font qu’un. Deux plannings armés sur la même pièce : urgent, le dernier déclenché gagne et rien ne le montre. Une pièce sans planning garde le préréglage de la veille. La couleur d’un créneau monte avec la consigne, et son infobulle donne la consigne réelle de cette pièce (le même boost ne vaut pas la même chose au radiateur de secours et au poêle).
- **Le bilan en euros** revient à Hestia Énergie, qui lit Chauffage. Les règles à lui transmettre : l’énergie du poêle sur les kilos, jamais sur le thermostat ; la référence « à froid égal » sur les seuls jours vraiment chauffés (sinon le premier jour de chauffe est « 645 % plus cher ») ; les conseils qui dépendent du froid se taisent hors saison ; le bilan disparaît plutôt que d’aligner des zéros ; le vert est réservé au gain.
- **Les courbes** : 24 h au quart d’heure ; pas de relevé au démarrage de Home Assistant (un point vide couperait tout) ; un trou de 30 minutes au plus est enjambé ; une amplitude d’au moins 1,5 °C (sinon une pièce stable dessine des dents de scie) ; la température est adoucie, **la consigne jamais** ; moins de 3 points : « courbe en construction ».

## Les réglages

Ce qui dépend du foyer, avec sa valeur par défaut. Depuis la 1.0.0b3, tous les chiffres du pilote sont dans Réglages › Poêle à granulés › Avancé (`engine/tuning.py`, leurs bornes y sont) : ce qui était « fixe » ci-dessous l’est seulement par défaut.

| Réglage | Par défaut | Où |
| --- | --- | --- |
| La flamme : Automatique ou Manuel | Automatique en mode Flamme | Poêle à granulés (réglages `pilote` et `flamme_manuelle`) |
| Allumer et éteindre : par vos automatisations, ou par Hestia | par vos automatisations | Poêle à granulés (`pilote` = `entier`) |
| La ventilation : par le poêle, par Hestia (flamme + 1), Manuel | par le poêle | Poêle à granulés (`pilote_ventilation`) |
| ÉCO Stop voulu avant un allumage | activé | Poêle à granulés (`poele_eco_stop`) |
| Température réglée dans le poêle | 25 °C | Avancé (`consigne_poele`) |
| Ce qui chauffe chez vous | ce qui est trouvé | La maison (`equipements`) |
| Ce qui chauffe une pièce | reconnu seul | Thermostats (`types`) |

L’histoire de chaque réglage :

| Réglage | Par défaut | Depuis |
| --- | --- | --- |
| Thermostat pilote du poêle | à choisir (trouvé seul quand c’est possible) | 0.1 |
| Température de la maison | la moyenne des pièces chauffées, ou un capteur choisi | 0.4 |
| Le pilote : Conseil, Flamme, Entier (proposé de nouveau une fois essayé dans une vraie maison), Éteint | Conseil | 0.4, 0.5, 0.7 |
| Flamme au plus bas (un interrupteur) | aucun | 0.5 |
| Paliers de flamme | 45 · 65 · 85 % | 0.4, fixe |
| Marge de flamme | 7 points | 0.4, fixe |
| Flamme minimale de croisière | 2 | 0.4, fixe |
| Pièce trop chaude | consigne + 2 °C, prévue à 15 min | 0.4 ; Réglages depuis la 1.0 (0,5 à 5 °C) |
| Délai entre deux hausses de flamme | 30 min | 0.4, fixe |
| Réserve d’ordres | 4 (6 avant la ventilation) | 0.4, fixe |
| Plafond d’ordres du poêle | lu dans les options de son intégration | 0.5, lu (sinon celui du profil) |
| Écart d’hystérésis hors boost | 1,0 °C | 0.4, fixe |
| Saison douce | permis sous 18 °C, demande au-dessus de 19 °C | 0.4, fixe |
| Délai de réponse en saison douce | 15 min | 0.4, fixe |
| Sécurité surchauffe | 28 °C | 0.4, fixe |
| Vérification d’arrêt | 25 min | 0.7, fixe |
| Ventilation (mode Entier) | AUTO, une fois avant le démarrage ; ou flamme + 1 | 1.0, Réglages |
| Simulateur du mode Entier (en Conseil et en Flamme) | non | 1.0, Réglages |
| Couper la prise sans réponse | oui, après 5 min | 0.7, Réglages |
| Interrupteur de la prise | trouvé seul (l’appareil de la prise mesurée, ou son nom) | 0.7, Réglages |
| Démarrages de Hestia par jour | 3 | 0.7, fixe |
| Prix et poids du sac | à saisir (lus dans Suivi Stock Pellet s’il est là) | 0.6, Réglages |
| Seuil de nettoyage du brasier | 15 kg | 0.6, Réglages |
| Débits par flamme | ceux du profil, puis appris sur les sacs | 0.6 : le profil, et le facteur appris |
| Puissance électrique simultanée | selon l’abonnement | à faire |
| Destinataire des notifications | aucun (seulement les notifications de Home Assistant et la page Poêle) | 0.7, Réglages |

« Fixe » : une constante du pilote aujourd’hui, à ouvrir en réglage quand un deuxième foyer en aura besoin. Les constantes qui restent fixes : 4,8 kWh par kg, rendement 0,87, base des degrés-jours 18 °C, fumées froides sous 60 °C, prise en veille sous 70 W, prise active au-dessus de 60 W, alarme tenue 2 minutes.

## Les choix faits

Les questions laissées ouvertes par la maison de référence, tranchées par Frank pour la 1.0.0 (24 novembre 2026).

1. **Le plancher de flamme reste à 2.** La flamme 1 ne sert qu’à la pièce trop chaude, et seulement à la consigne + 2 °C (au lieu de + 0,5 °C), un écart réglable : la flamme 1 encrasse plus par kilo, elle doit rester rare.
2. **Le boost reste tel quel.** Le poêle chauffe d’abord le salon ; les autres pièces en profitent par l’inertie de la maison. La pièce du poêle peut finir plus chaude que les chambres : c’est voulu.
3. **La ventilation : les deux, au choix.** AUTO par défaut ; flamme + 1 dans Réglages, facile à changer (voir « Le montage »).
4. **L’ouvrant de la pièce du poêle : prévenir seulement.** Baisser la flamme à chaque ouverture coûterait des ordres du quota ; la carte et la page le disent en rouge (« En chauffe, fenêtre ouverte »).
5. **Les seuils TPI du thermostat du poêle** et **« éteint » restauré par Versatile Thermostat au redémarrage** : des réglages de Versatile Thermostat, hors de Hestia. Hestia corrige l’effet (la reprise après un redémarrage), pas la cause.
6. **La saison des compteurs** : du 1er septembre au 31 août, ou du mois où Suivi Stock Pellet commence la sienne (depuis la 0.6).
7. **Le conseil « allumer le poêle »** et le prix du granulé face à l’électricité : le bilan revient à Hestia Énergie, qui lit Chauffage.
8. **Le démarrage anticipé** : pas d’heure calculée ; la page montre le prochain changement du planning.
9. **Le plafond d’ordres** : lu à la source, dans les options de l’intégration du poêle (depuis la 0.5).
10. **Le mode Entier** n’était plus proposé dans Réglages (sauf à un poêle déjà réglé dessus) tant qu’il n’avait pas été essayé dans une vraie maison. Depuis la 1.0.0b3 (maquette validée par Frank le 24 novembre), il revient sous le nom « Allumer et éteindre : par Hestia », avec la flamme automatique ou manuelle. Son **simulateur** (Réglages, en Conseil et en Flamme) rejoue ses démarrages, ses arrêts et ses sécurités sans rien envoyer : le journal les dit au conditionnel (« Hestia allumerait le poêle »), et note un désaccord quand la maison n’allume pas ou n’éteint pas le poêle dans les minutes qui suivent. La 1.0.0 stable attend une semaine d’accord de ce simulateur dans la maison de référence.

## La suite

- Les boutons Allumer et Éteindre de la page technique du poêle (la carte du poêle les a déjà).
- Les autres profils de poêle (Palazzetti, Fumis, Rika, Edilkamin, MCZ…), un par un.
- Hestia Énergie qui lit Chauffage pour le bilan en euros.
- L’onglet et les cartes en anglais.
