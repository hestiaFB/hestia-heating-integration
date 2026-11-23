# Changements

## À venir — 0.7.0b1

Le pilote du poêle peut le conduire entier, en option : démarrer, arrêter, tenir les sécurités. Il reste « à l’ombre » tant que vous ne l’avez pas choisi.

### Nouveautés
- **Dans Réglages, « Le pilote de Hestia » a un quatrième choix : « Entier »**. Hestia fait alors ce que font vos automatisations du poêle : elle le démarre au passage de son thermostat en boost, règle sa flamme, l’arrête en hors gel, vérifie l’arrêt, et tient les sécurités. Coupez d’abord vos automatisations du poêle : deux pilotes en même temps se contrediraient.
- **Le démarrage** : les réglages du poêle qui ont changé (consigne interne à 25 °C, ECO Stop, ventilation en AUTO s’il reste assez d’ordres), puis l’ordre d’allumage. Pas pris en 3 minutes : Hestia recharge l’intégration du poêle et renvoie l’ordre ; toujours rien, elle vous prévient. 3 démarrages par jour au plus.
- **Les refus qui verrouillent** : la pièce trop chaude, le brasier à nettoyer, une alarme ou un poêle muet éteignent le thermostat du poêle, comme le fait la maison. « J’ai nettoyé » le rallume, en hors gel, pour le brasier.
- **L’arrêt vérifié** : jusqu’à 3 ordres, puis une vérification 25 minutes après (l’état, les fumées sous 60 °C, la prise sous 70 W). Le poêle chauffe encore : l’ordre de nouveau, puis « Couper la prise ? », coupée sans réponse en 5 minutes si Réglages le permettent.
- **La saison douce** : Hestia vous demande avant d’allumer, Oui ou Non, sur le téléphone et sur la page Poêle. Sans réponse en 15 minutes, le thermostat repasse hors gel, sauf si le poêle est déjà en route.
- **Après un redémarrage de Home Assistant** : un poêle qui brûle avec son thermostat éteint retrouve son thermostat, en boost.
- **Dans Réglages** : le service de vos téléphones pour les notifications (avec leurs boutons), l’interrupteur de la prise du poêle (trouvé seul quand c’est possible), et « Couper la prise sans réponse ».

### Ce qui change
- À l’ombre aussi, le pilote refuse un démarrage quand le brasier est à nettoyer.
- Un arrêt demandé pendant que le poêle ne dit plus son état attend 2 minutes qu’il le dise, puis l’envoie quand même, comme la maison.

### Ce qui ne change pas
- Au labo, rien n’est jamais envoyé : ni ordre, ni notification, à un poêle ou un thermostat recopié d’une autre maison.
- « À l’ombre » reste le choix de départ, et le retour arrière en un clic.

## 0.6.0b1

Hestia compte les granulés du poêle et dit quand nettoyer le brasier. Elle n’envoie rien au poêle pour ça.

### Nouveautés
- **Sur la page Poêle, « Granulés »** : ce que le poêle brûle en ce moment (kg/h), aujourd’hui et cette saison, en kilos, en chaleur (kWh) et en euros. Le débit se lit sur l’état du poêle et sa flamme, jamais sur la flamme seule.
- **Le calage sur vos sacs** : à chaque sac déclaré dans Suivi Stock Pellet (un réservoir vide), Hestia ajuste ses débits sur le poids réel du sac, entre 0,7 et 1,6 fois. Pas au premier sac qu’elle voit.
- **« Le brasier »** : les kilos brûlés depuis le dernier nettoyage, sur 15 kg par défaut, avec « bientôt » à 4 kg du seuil, et un bouton « J’ai nettoyé » qui demande une confirmation. Avec Suivi Stock Pellet, le compte se fait sur les sacs versés.
- **Quatre entités** : `sensor.hestia_heating_poele_granules_brules` (kg), `sensor.hestia_heating_poele_energie` (kWh, à déclarer dans la page Énergie de Home Assistant), `sensor.hestia_heating_poele_brasier` (kg depuis le nettoyage) et `binary_sensor.hestia_heating_poele_brasier_a_nettoyer`.
- **Dans Réglages, « Les granulés »** : le seuil du brasier, le prix et le poids d’un sac. Laissés vides, ils viennent de Suivi Stock Pellet (le prix : la dépense ÷ les sacs achetés).

### Ce qui change
- Pour Hestia Énergie, l’énergie du poêle est maintenant celle comptée par Hestia sur les kilos (4,176 kWh utiles par kg), jamais le compteur de son thermostat, qui ne mesure que le temps d’un interrupteur.
- La saison des granulés va du 1er septembre au 31 août, ou commence le mois où Suivi Stock Pellet commence la sienne.

### Ce qui ne change pas
- Rien n’est envoyé au poêle pour compter. « J’ai nettoyé » remet seulement le compteur à zéro : le blocage du prochain démarrage viendra avec le pilote entier.
- Un arrêt de Home Assistant ne compte rien : plutôt rien qu’une supposition.

## 0.5.0b1

Le pilote du poêle peut régler la flamme, en option. Il reste « à l’ombre » tant que vous ne l’avez pas choisi.

### Nouveautés
- **Dans Réglages, « Le pilote de Hestia » a un troisième choix : « Flamme »**. Hestia règle alors la flamme du poêle selon la demande de son thermostat, avec les mêmes règles qu’à l’ombre. Seulement la flamme : le démarrage, l’arrêt et les sécurités restent à vos automatisations.
- Sur la page Poêle, « Hestia fait » et « Ordres de Hestia aujourd’hui » (par exemple 4 sur 12), avec la flamme demandée en attente de vérification. Le journal dit chaque ordre et s’il a été suivi.
- **Hestia est prudente** : un ordre à la fois, vérifié 5 minutes après, la même flamme renvoyée au plus toutes les 10 minutes, 12 ordres par jour au plus. Si la flamme change sans elle (une autre automatisation la règle encore), ou si le poêle ne suit pas 3 fois, elle laisse la flamme jusqu’au lendemain et le dit en haut de la page Poêle.
- Dans Réglages, « Flamme au plus bas » : un interrupteur (`input_boolean`) qui, allumé, demande la flamme 1, comme le font déjà certaines automatisations. Le pilote en tient compte, à l’ombre aussi.

### Ce qui change
- Le nombre d’ordres que l’extension du poêle laisse passer chaque jour est lu dans ses options (Agua IOT : `max_eeprom_writes_per_day`). Sans cette option, le profil Micronova compte 20 (25 avant), la valeur par défaut de l’extension.

### Corrections
- Poêle éteint, la page et la carte n’affichent plus « Flamme 1 » : certains poêles donnent une flamme réelle de 1 même éteints. La courbe du jour met la flamme à 0 quand le poêle ne brûle pas.
- Le pilote ne prend plus un thermostat remis sur « éteint » par un redémarrage de Home Assistant pour une demande d’arrêt, ni un poêle relu au redémarrage pour un démarrage. Ce faux écart pouvait apparaître dans le bilan.
- En saison douce, le pilote dit qu’il ne couperait rien, sans réponse, à un poêle déjà en route.

### Ce qui ne change pas
- Par défaut, le pilote est « à l’ombre » : il n’envoie rien. Revenir « À l’ombre » arrête les ordres tout de suite.
- Jamais d’ordre à un poêle recopié d’une autre maison (le labo), même réglé sur « Flamme ».
- Avant de choisir « Flamme », éteignez votre automatisation qui règle déjà la flamme : sinon Hestia la voit faire et s’arrête pour la journée.

## 0.4.0b1

Le pilote du poêle, « à l’ombre » : Hestia dit ce qu’elle ferait du poêle, à côté de ce que font vos automatisations. Elle ne le commande pas.

### Nouveautés
- **Le pilote, à l’ombre**, sur la page Poêle : « Hestia ferait » (démarrer, flamme 3, arrêter, couper, ou rien) et pourquoi, face à « La maison fait », avec « d’accord » ou « autrement ».
- **Le journal du pilote** : ce que Hestia aurait fait, ce que la maison a fait, et combien de fois elles étaient d’accord, aujourd’hui et depuis une semaine (« d’accord 46 fois sur 48 »), avec les derniers écarts. Il est gardé 7 jours, même après un redémarrage.
- **Ses règles**, en clair, les mêmes que celles des automatisations qui pilotent déjà un poêle : démarrage à chaque passage du thermostat en boost (jamais de lui-même), avec une question d’abord en saison douce ; flamme selon la demande du thermostat, avec 7 points de marge autour de la flamme du poêle ; flamme 1 avant que la pièce dépasse sa consigne, sur sa température lissée (une bouffée d’air chaud sur la sonde ne compte pas) ; 4 ordres du jour gardés pour pouvoir éteindre ; arrêt quand la maison est assez chaude, arrêt vérifié ; coupure sur une alarme qui dure 2 minutes ou une pièce au-dessus de 28 °C ; un poêle muet 15 minutes est seulement signalé.
- Dans Réglages, « Le pilote de Hestia » : à l’ombre (par défaut) ou éteint.
- **Un verrou, dans Réglages : « Ce que Hestia peut régler »**. Un planning actif n’envoie qu’aux thermostats cochés là, et à aucun autre. Aucun n’est coché au départ : pour un essai, cochez seulement vos thermostats d’essai. Un thermostat d’un planning actif qui n’est pas coché est signalé dans À régler.
- Dans Réglages, « La température de la maison » : le capteur que lisent vos automatisations du poêle, ou la moyenne des pièces (par défaut). Le pilote la compare à la consigne pour savoir si la maison est assez chaude.
- **La carte d’une pièce a ses modes** : Hors gel, Éco, Confort, Boost (ceux que propose son thermostat), en bas de la carte, comme la carte thermostat de Home Assistant. C’est vous qui choisissez : la carte envoie le mode au thermostat depuis votre navigateur. Sur un thermostat recopié d’une autre maison (le labo), les boutons sont grisés.
- **Un clic sur la carte d’une pièce ouvre son thermostat** (la fenêtre de Home Assistant). Dans les réglages de la carte, « Clic sur la carte » : ouvrir le thermostat, ouvrir la page de la pièce dans l’onglet Chauffage, ou rien. Le « i » ouvre toujours la page de la pièce.
- La courbe du jour d’une pièce montre aussi, en bas, quand son thermostat a chauffé.

### Corrections
- **Les courbes du jour restaient vides** (carte et onglet) : la température et la consigne d’un thermostat tombaient toutes à minuit, ou au dernier changement de mode. Elles sont maintenant placées à l’heure où elles ont été lues.

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
