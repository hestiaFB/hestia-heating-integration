# Changements

## À venir — 0.4.0b1

Le pilote du poêle, « à l’ombre » : Hestia dit ce qu’elle ferait du poêle, à côté de ce que font vos automatisations. Elle ne le commande pas.

### Nouveautés
- **Le pilote, à l’ombre**, sur la page Poêle : « Hestia ferait » (démarrer, flamme 3, arrêter, couper, ou rien) et pourquoi, face à « La maison fait », avec « d’accord » ou « autrement ».
- **Le journal du pilote** : ce que Hestia aurait fait, ce que la maison a fait, et combien de fois elles étaient d’accord, aujourd’hui et depuis une semaine (« d’accord 46 fois sur 48 »), avec les derniers écarts. Il est gardé 7 jours, même après un redémarrage.
- **Ses règles**, en clair, les mêmes que celles des automatisations qui pilotent déjà un poêle : démarrage à chaque passage du thermostat en boost (jamais de lui-même), avec une question d’abord en saison douce ; flamme selon la demande du thermostat, avec 7 points de marge autour de la flamme du poêle ; flamme 1 avant que la pièce dépasse sa consigne ; 4 ordres du jour gardés pour pouvoir éteindre ; arrêt quand la maison est assez chaude, arrêt vérifié ; coupure sur une alarme qui dure 2 minutes ou une pièce au-dessus de 28 °C ; un poêle muet 15 minutes est seulement signalé.
- Dans Réglages, « Le pilote de Hestia » : à l’ombre (par défaut) ou éteint.
- **Un verrou, dans Réglages : « Ce que Hestia peut régler »**. Un planning actif n’envoie qu’aux thermostats cochés là, et à aucun autre. Aucun n’est coché au départ : pour un essai, cochez seulement vos thermostats d’essai. Un thermostat d’un planning actif qui n’est pas coché est signalé dans À régler.
- Dans Réglages, « La température de la maison » : le capteur que lisent vos automatisations du poêle, ou la moyenne des pièces (par défaut). Le pilote la compare à la consigne pour savoir si la maison est assez chaude.

### Ce qui ne change pas
- Le pilote n’envoie rien au poêle ni à son thermostat. Un pilote qui commande viendra ensuite, en option, éteint par défaut, et jamais au labo.

## 0.3.0b1

Les plannings Hestia : des plannings simples, réglés dans l’onglet, et Scheduler toujours lu pour les thermostats qui le suivent. Chaque planning commence « En essai » : il montre ce qu’il ferait, sans rien envoyer.

### Nouveautés
- **La page Planning** : la liste de vos plannings, chacun avec sa semaine en couleurs, ses thermostats, ce qu’il fait maintenant et son prochain changement.
- **Créer un planning** : un nom, la semaine (tous les jours pareils, semaine et week-end, ou jour par jour), des plages (de 6 h 30 à 8 h 30 en confort…) et le niveau du reste du temps. On touche une plage pour changer ses heures ou son niveau.
- **Les thermostats de ce planning**, à cocher : un thermostat suit un seul planning. Le thermostat du poêle aussi : Boost l’allume, Hors gel l’éteint, et l’éditeur dit combien de fois par semaine il s’allumerait.
- **En essai ou Actif**, pour chaque planning. En essai, rien n’est envoyé : la page dit ce que ferait Hestia, et « Ce qu’a fait Hestia aujourd’hui » ce qu’elle aurait fait.
- **Reprendre dans Hestia** : un planning de Scheduler recopié en planning Hestia, en un clic.
- La carte « planning » dit qui règle chaque ligne (Hestia ou Scheduler), et quand un planning est en essai.

### Ce qu’il envoie, et seulement ça
- Quand une plage commence ou finit, un préréglage (confort, éco, hors gel, boost) à chaque Versatile Thermostat d’un planning actif, ou une consigne à un autre thermostat.
- Il n’allume ni n’éteint jamais un thermostat, ne change aucun réglage de Versatile Thermostat ni de Scheduler, et ne commande jamais un thermostat qu’un planning Scheduler allumé vise encore (« suit deux plannings », dans À régler). Le poêle lui-même n’est jamais commandé : seulement le préréglage de son thermostat.
- Rien n’est envoyé à l’enregistrement : le planning compte dès le prochain changement. Un changement manqué pendant un arrêt de Home Assistant est rattrapé au démarrage, une fois.
- Rien n’est jamais envoyé à un thermostat recopié d’une autre maison (Remote Home Assistant, comme au labo).

## 0.2.0b1

Hestia Énergie peut lire le vrai chauffage, au lieu de deviner le poêle par une source « gaz ». Toujours en lecture seule.

### Nouveautés
- L’interface `hestia_heating_api` donne le **compteur d’énergie** de chaque thermostat (`energie_stat`), trouvé sur son appareil ou par son nom (un thermostat recopié aussi).
- Elle donne aussi **le poêle** (`poele()`) : son état, sa flamme, son thermostat, son compteur d’énergie et ses granulés (Suivi Stock Pellet). C’est un ajout : la version 1 de l’interface ne change pas.
- **Hestia Énergie** apparaît dans Extensions, liée quand elle lit Chauffage.

## 0.1.0b1

Première bêta, en lecture seule : Hestia Chauffage lit et explique, elle ne commande rien.

### Nouveautés
- L’onglet **Chauffage** du panneau Hestia-FB : la maison en une phrase, chaque pièce, le poêle, le planning du jour, les réglages et les extensions.
- La **carte** pour les tableaux de bord : la maison, le poêle, une pièce (longue ou courte), le planning du jour.
- Les thermostats lus seuls : Versatile Thermostat et tout thermostat ou clim de Home Assistant, rangés par pièce.
- Le **poêle à granulés** par un profil : Micronova par Agua IOT, ses mots traduits (un mot inconnu est montré tel quel, jamais deviné), son thermostat et sa prise trouvés seuls ou choisis dans Réglages.
- Les **granulés** de Suivi Stock Pellet : le stock et les jours qu’il reste au rythme de la saison.
- Le **planning** lu dans Scheduler, sans rien y changer, et le froid à venir d’Hestia Weather.
- Quelques entités pour les automatisations, et l’interface `hestia_heating_api` (version 1) pour les autres briques.
