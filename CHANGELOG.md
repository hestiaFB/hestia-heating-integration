# Changements

## À venir — 0.3.0b1

Le planning Hestia : Hestia Chauffage a son propre planning, réglé dans l’onglet, et continue de lire Scheduler pour les pièces qui le suivent. Il commence « à l’ombre » : il montre ce qu’il ferait, sans rien envoyer.

### Nouveautés
- **Le planning Hestia** : des journées types (Semaine, Week-end, Télétravail, et les vôtres), une semaine type, et un jour changé à part (« lundi 23 en Télétravail ») sans toucher à la semaine. Un jour férié suit la journée choisie (capteur Jours ouvrés).
- **Une journée type se règle pièce par pièce** : des créneaux (une heure, un niveau), repris de Scheduler en un clic, ou copiés d’une pièce à l’autre.
- **Qui règle chaque pièce**, dans Réglages : Hestia, Scheduler ou personne. Par défaut, une pièce visée par un planning Scheduler reste sur Scheduler : installer la 0.3 ne change rien à ce qui marche déjà.
- **À l’ombre par défaut** : la page Planning dit ce que ferait Hestia, et le journal du jour ce qu’elle aurait fait. Elle n’envoie rien tant que « Le planning commande les thermostats » n’est pas allumé.
- **Plus tôt les matins froids**, avec Hestia Weather : le premier créneau plus chaud du matin commence 5 minutes plus tôt par degré sous 10 °C dehors, une heure au plus (réglable).
- **Bon à savoir** : le matin avancé et pourquoi, et ce que coûte l’électrique en ce moment au prix d’Hestia Énergie, avec l’heure des heures creuses.
- La carte « planning » dit qui règle chaque ligne.

### Ce qu’il envoie, et seulement ça
- Au début de chaque créneau, un préréglage (confort, éco, hors gel, boost), à un Versatile Thermostat, ou une consigne à un autre thermostat.
- Il n’allume ni n’éteint jamais un thermostat, ne change aucun réglage de Versatile Thermostat ni de Scheduler, et ne commande jamais une pièce qu’un planning Scheduler allumé vise encore (« deux plannings », dans À régler). Le poêle lui-même n’est jamais commandé : seulement le préréglage de son thermostat.
- Rien n’est envoyé à l’enregistrement : la journée compte dès le prochain créneau. Un créneau manqué pendant un arrêt de Home Assistant est rattrapé au démarrage, une fois.
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
