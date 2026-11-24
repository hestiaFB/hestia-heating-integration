# Hestia Chauffage — l’histoire des versions

Ce qui a mené à la brique d’aujourd’hui : les versions, la comparaison avec la maison de référence, le dépôt et les décisions. Le cahier des charges ([../CAHIER-DES-CHARGES.md](../CAHIER-DES-CHARGES.md)) décrit la brique telle qu’elle est ; les nouveautés de chaque version sont dans [CHANGELOG.md](../../CHANGELOG.md).

## Les premières versions, en bref

la v0.1 (lecture seule) est codée le 20 novembre 2026 et tourne au labo. La 0.2 donne à Hestia Énergie le compteur d’énergie de chaque source et le poêle. La 0.3 ajoute les plannings Hestia, simples, d’après la maquette « planning simple » validée le 20 novembre : une liste de plannings, chacun une semaine en couleurs et les thermostats qu’il règle, « En essai » d’abord. La 0.4 ajoute le pilote du poêle « à l’ombre » : il dit ce qu’il ferait, à côté de ce que font les automatisations de la maison, sans rien envoyer. La 0.5 lui permet, en option, de régler la flamme, et seulement elle. La 0.6 compte les granulés et le brasier. La 0.7 ajoute, toujours en option, le pilote entier : Hestia démarre et arrête le poêle et tient ses sécurités, comme les automatisations de la maison. Le 22 novembre, le fonctionnement complet du poêle de la maison de référence devient la base de la gestion des poêles (« Le poêle : la base de sa gestion », plus bas), avec ce qu’il reste à faire pour le rejoindre. Le détail technique (entités, interface, commandes, profils) est dans [technique.md](technique.md).

## Hestia 0.7 face à la maison de référence

Où en est Hestia 0.7 par rapport à ce fonctionnement. Le pilote « à l’ombre » compare ses gestes à ceux de la maison chaque jour ; le pilote entier, en option, les fait.

| Règle | Hestia 0.7 | À faire |
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
| Brasier : blocage du prochain démarrage, thermostat remis en hors gel | pilote entier : thermostat éteint au refus, « J’ai nettoyé » le remet en hors gel et allumé ; à l’ombre, le refus est dit | — |
| Démarrage : réglages seulement s’ils changent, contrôle d’allumage, rechargement | pilote entier : pareil (le poêle a pris l’ordre quand son thermostat interne passe en « chauffe »), 3 démarrages par jour au plus | l’essayer à la maison |
| Arrêt vérifié à 25 min, escalade, prise | pilote entier : pareil, la prise coupée sans réponse si Réglages le permettent | l’essayer à la maison |
| Alarme, thermostat déjà éteint | pilote entier : Hestia lance l’arrêt elle-même | — |
| Reprise après un redémarrage | pilote entier : pareil (rien n’est envoyé au poêle) | — |
| Veille des sécurités | faite à chaque calcul, sur l’état | — |
| Question de saison douce, notifications, boutons | pilote entier : sur le téléphone choisi (Oui, Non, J’ai nettoyé, Couper la prise, Ignorer) et sur la page Poêle ; les plus graves aussi dans les notifications de Home Assistant | — |
| Les boutons Allumer et Éteindre de la page | non | plus tard |
| Gestion automatique (un interrupteur) | le réglage du pilote (à l’ombre, flamme, entier, éteint) | — |
| Montage du poêle (consigne interne, ECO Stop) | ECO Stop lu | lire aussi la consigne interne, et le signaler s’il change |

## La suite

La v0.1 ne commandait rien. Les versions, et la suite proposée :

1. **0.1** — la brique en lecture seule.
2. **0.2** — l’interface vers Énergie, puis Énergie l’affiche à la place de sa devinette par une source « gaz ».
3. **0.3** — les plannings maison, simples : une semaine en couleurs (tous les jours pareils, semaine et week-end, ou jour par jour), des plages, le niveau du reste du temps, et les thermostats cochés. Un thermostat suit un seul planning. Scheduler reste lu, et un de ses plannings se reprend dans Hestia en un clic. Chaque planning commence « En essai » et n’envoie, une fois « Actif », que des préréglages, jamais un allumage ou un arrêt (détail dans [technique.md](technique.md#le-planning-hestia)). Les matins froids et le prix de l’électricité, prévus d’abord, sont laissés de côté pour rester simple.
4. **0.4** — le pilote de poêle « à l’ombre » : il calcule ce qu’il ferait (démarrer, flamme 3, refuser pour surchauffe…) et l’affiche à côté de ce que font les automatisations de la maison, sans rien envoyer.
5. **0.5** — le pilote règle la flamme, en option (Réglages, « Flamme ») : la flamme selon la demande du thermostat, un ordre à la fois, vérifié 5 min après, 12 ordres par jour au plus, et jamais dans la réserve de 4 sous le plafond de l’extension. Le démarrage, l’arrêt et les sécurités restent aux automatisations de la maison. Si la flamme change sans Hestia, ou si le poêle ne suit pas trois fois, Hestia la laisse jusqu’au lendemain. Revenir « À l’ombre » est le retour arrière en un clic. Jamais au labo.
6. **Avant d’essayer « Flamme » à la maison** — fait le 22 novembre : la température lissée, le plafond d’ordres lu dans l’extension, jamais « 1 sur 5 » poêle éteint, l’exception de la saison douce, et pas de faux écart après un redémarrage.
7. **0.6** — les granulés : débit, kilos, nettoyage du brasier (compteur, seuil, calage sur les sacs, « J’ai nettoyé »), énergie et prix ; l’énergie du poêle donnée à Hestia Énergie sur les kilos. Rien n’est envoyé au poêle pour ça.
8. **0.7** — le pilote entier, profil Micronova, en option (Réglages, « Entier ») : le démarrage et ses cas, le contrôle d’allumage, l’arrêt vérifié et son escalade, les sécurités, la reprise après un redémarrage, les questions et les notifications. Il faut d’abord couper toutes les automatisations du poêle de la maison : deux pilotes en même temps se contrediraient. Revenir « À l’ombre » est le retour arrière en un clic. Jamais au labo : rien n’est envoyé à un poêle ou à un thermostat recopié, ni ordre ni notification.
9. **1.0** — la version de production (1.0.0b1, b2), puis le panneau technique (1.0.0b3) : le poêle réglé comme sur son application, « Entier » de retour sous « Par Hestia », les chiffres réglables.
10. Ensuite : les boutons Allumer et Éteindre de la page Poêle.
11. Les autres profils (Palazzetti, Fumis, Rika, Edilkamin, MCZ…), un par un, avec des testeurs.

## Le dépôt, les tests, le labo

**Le dépôt**, sur le modèle d’Énergie :

- `custom_components/hestia_heating/` : `__init__.py`, `config_flow.py`, `coordinator.py`, `reader.py` (tout ce qui touche Home Assistant), `engine/` (Python pur, testé sans Home Assistant), `profiles/*.json`, `api.py`, `websocket.py`, `sensor.py`, `binary_sensor.py`, `panel.py`, les copies du socle ; `frontend/` compilé.
- `frontend/` (le panneau), `card/` (la carte), `tests/` (avec une maison inventée, `maison_fictive.py`), `docs/` (ce cahier, `technique.md`), `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `hacs.json`, la CI (tests, hassfest, HACS, fichiers compilés à jour).
- Version `0.1.0b1`. Commits au nom de hestiaFB.

**Vitesse** : la brique écoute seulement les entités qu’elle a trouvées, recalcule la pièce qui a changé, et répond au panneau en moins de 0,25 s au labo. Aucun calcul sur l’historique en v0.1, sauf la courbe d’une pièce à la demande.

**Au labo** : la v0.1 ne commande rien, donc elle peut tourner au labo sans risque pour un vrai poêle. Il faut ajouter `chauffage` à `hestia-labo/deployer.sh`, puis mesurer le panneau avec `mesurer-hub.py`. Un seul déploiement à la fois.

## Décisions prises

Le 24 novembre 2026 :

- 1.0.0b1 et 1.0.0b2 : la version de production (sans mots d’essai), la phrase du poêle, le simulateur du mode Entier, la ventilation au choix, les cartes compactes.
- Frank veut un panneau technique et simple, pensé pour tous les foyers. La maquette « panneau technique » est validée le soir : une Vue d’ensemble (est-ce que tout marche, ce que Hestia fait, ce qu’elle a changé aujourd’hui), la page technique du poêle, le Planning gardé tel quel, Réglages en onglets (La maison, Thermostats, Poêle à granulés et son « Avancé »), un guide en cinq étapes. Les pages des pièces quittent le panneau : leurs températures sont sur les cartes.
- Le poêle se règle comme sur son application : la flamme Automatique ou Manuel, la ventilation par le poêle, par Hestia ou à la main, l’ÉCO Stop expliqué (activé, le poêle s’éteint seul une fois sa propre température atteinte). Ces boutons vont tout de suite au poêle : c’est l’utilisateur qui appuie.
- « Entier » revient dans Réglages, sous les mots « Qui allume et éteint le poêle : Par Hestia », avec la flamme qui peut rester à la main.
- Tous les chiffres du pilote deviennent réglables (Avancé), avec leurs valeurs par défaut d’avant.
- Codé en 1.0.0b3.

Le 22 novembre 2026 :

- Le fonctionnement du poêle de la maison de référence, écrit par Frank, est la base de la gestion des poêles dans la brique. Ses règles, leurs chiffres et leurs raisons sont repris plus haut, sans les données de la maison.
- Frank : « allons-y » pour les granulés et le brasier (0.6), puis le pilote entier (0.7 : le démarrage et l’arrêt complets), en option éteinte par défaut.

Le 20 novembre 2026 :

- Nom : Hestia Chauffage, domaine `hestia_heating`, onglet `chauffage`.
- La brique pilotera le poêle, en option éteinte par défaut, après une phase « à l’ombre ».
- La clim fait partie de la v0.1 (testée sur un thermostat simulé).
- Le planning maison est la plus-value de la brique.
- Hestia Énergie ne change pas d’ici là.
- Une maquette de l’Accueil et de la page Poêle avant le code.
