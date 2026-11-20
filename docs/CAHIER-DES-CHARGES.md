# Hestia Chauffage — cahier des charges v0.1

Version du 20 novembre 2026. Document vivant : il suit la brique à chaque version.

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
| Le lien poêle ↔ son thermostat | le Versatile Thermostat dont l’interrupteur piloté est celui du poêle, sinon choisi une fois dans Réglages | demande du thermostat face à la flamme réelle |
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
| Poêle | État traduit, flamme demandée par le thermostat face à la flamme réelle, fumées, alarme, stock et jours restants, nettoyage à venir, ce que dit la prise |
| Une pièce | Son thermostat, sa journée (courbe température et consigne), pourquoi elle chauffe ou non (préréglage, fenêtre, délestage, sécurité) |
| Planning | La semaine lue dans Scheduler, pièce par pièce et pour le poêle. En lecture seule en v0.1 : c’est là que viendra le planning maison |
| Réglages et Extensions | Les sources trouvées et leurs interrupteurs, le lien poêle ↔ thermostat, le lieu d’Hestia Weather |

La carte reprend l’Accueil (la maison, ou une pièce, ou le poêle). Avec le socle 1.24, la porte de l’accueil Hestia-FB prend l’icône « maison » par défaut ; son icône et sa couleur propres demandent un petit ajout au socle (1.25), à faire pour la première bêta publique.

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

Un profil est un fichier de données par intégration, sans code : il dit où trouver chaque rôle sur l’appareil du poêle et comment traduire ses mots. En v0.1 seuls les rôles de lecture servent ; ceux d’écriture (allumer, flamme, quota) sont déjà décrits pour le pilote de la 0.4. Les textes ci-dessous ont été relevés sur un poêle Micronova par Agua IOT, en français.

```json
{
  "profil": "micronova_agua_iot",
  "integration": "aguaiot",
  "roles": {
    "thermostat": {"domaine": "climate", "principal": true},
    "etat": {"domaine": "sensor", "fin": "_status"},
    "alarme": {"domaine": "sensor", "fin": "_alarm"},
    "fumees": {"domaine": "sensor", "fin": "_smoke_temperature"},
    "flamme": {"domaine": "number", "fin": "_power", "min": 1, "max": 5},
    "eco_stop": {"domaine": "switch", "fin": "_eco_stop"}
  },
  "etats": {
    "eteint": ["Off", "Stand-by"],
    "allumage": ["Allumage", "Commencez", "En attente de flamme"],
    "chauffe": ["On"],
    "nettoyage": ["Nettoyage"],
    "extinction": ["Extinction", "Éteindre"],
    "alarme": ["ALARM", "MEM. ALARM"]
  },
  "limites": {"ecritures_par_jour": 25, "cloud": true}
}
```

Un texte inconnu reste affiché tel quel et marqué « à traduire », jamais deviné. Les mots anglais du même poêle (Starting, Cleaning…) s’ajoutent aux listes.

## Hors v0.1

Aucune commande (ni poêle, ni thermostat, ni clim), pas de planning actif, pas de conseil chiffré en euros, pas de passerelle avec Confort. La suite :

1. **0.1** — la brique en lecture seule (ce document).
2. **0.2** — l’interface vers Énergie, puis Énergie l’affiche à la place de sa devinette par une source « gaz ».
3. **0.3** — le planning maison et les conseils, avec le froid d’Hestia Weather et les prix d’Énergie. Le planning tourne d’abord à côté de Scheduler, puis à sa place.
4. **0.4** — le pilote de poêle « à l’ombre » : il calcule ce qu’il ferait (démarrer, flamme 3, refuser pour surchauffe…) et l’affiche à côté de ce que font les automatisations de la maison, sans rien envoyer.
5. **0.5** — le pilote actif, profil Micronova : démarrage sûr, flamme selon la demande, arrêt vérifié, quota d’écritures, sécurités, retour arrière en un clic.
6. Les autres profils (Palazzetti, Fumis, Rika, Edilkamin, MCZ…), un par un, avec des testeurs.

## Le dépôt, les tests, le labo

**Le dépôt**, sur le modèle d’Énergie :

- `custom_components/hestia_heating/` : `__init__.py`, `config_flow.py`, `coordinator.py`, `reader.py` (tout ce qui touche Home Assistant), `engine/` (Python pur, testé sans Home Assistant), `profiles/*.json`, `api.py`, `websocket.py`, `sensor.py`, `binary_sensor.py`, les copies du socle ; `frontend/` compilé.
- `frontend/` (le panneau), `card/` (la carte), `tests/`, `docs/` (ce cahier, `technique.md`), `CLAUDE.md`, `README.md`, `hacs.json`, la CI (tests, hassfest, HACS, fichiers compilés à jour).
- Version `0.1.0b1`. Commits au nom de hestiaFB.

**Vitesse** : la brique écoute seulement les entités qu’elle a trouvées, recalcule la pièce qui a changé, et répond au panneau en moins de 0,25 s au labo. Aucun calcul sur l’historique en v0.1, sauf la courbe d’une pièce à la demande.

**Au labo** : la v0.1 ne commande rien, donc elle peut tourner au labo sans risque pour un vrai poêle. Il faut ajouter `chauffage` à `hestia-labo/deployer.sh`, puis mesurer le panneau avec `mesurer-hub.py`. Un seul déploiement à la fois.

## Décisions prises le 20 novembre 2026

- Nom : Hestia Chauffage, domaine `hestia_heating`, onglet `chauffage`.
- La brique pilotera le poêle, en option éteinte par défaut, après une phase « à l’ombre ».
- La clim fait partie de la v0.1 (testée sur un thermostat simulé).
- Le planning maison est la plus-value de la brique.
- Hestia Énergie ne change pas d’ici là.
- Une maquette de l’Accueil et de la page Poêle avant le code.
