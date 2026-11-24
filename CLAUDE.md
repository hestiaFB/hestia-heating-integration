# Hestia Chauffage — consignes pour Claude

Intégration Home Assistant (domaine `hestia_heating`, onglet `chauffage` du panneau) : le chauffage et la clim de la maison, sur les thermostats existants (Versatile Thermostat d'abord), le poêle à granulés par un profil, et un planning. Une des briques Hestia-FB. **En bêta : 0.8.0b1 (les cartes en horloge) publiée en pre-release le 24 novembre 2026 (dépôt public depuis le 23 novembre) ; 0.8.0b2 (une horloge plus facile à lire) en préparation.** Lire d'abord `docs/CAHIER-DES-CHARGES.md`.

## Où est quoi
- Dépôt : `hestiaFB/hestia-heating-integration`. Sur le PC de Frank : `~/Documents/Hestia-FB/hestia-heating`.
- `custom_components/hestia_heating/` : le Python. `reader.py` touche Home Assistant (lecture seule), `engine/` est du Python pur, `profiles/*.json` les profils de poêle, `api.py` l'interface v1. Son dossier `frontend/` est **compilé** (ne pas l'éditer).
- `frontend/` : l'onglet Chauffage (TypeScript). `card/` : la carte. `tests/` : tests Python, avec une maison inventée (`maison_fictive.py`). `docs/` : `CAHIER-DES-CHARGES.md`, `technique.md`.
- Ce dépôt n'a pas de `RELEASES.md` : appliquer celui de `hestia-ecosysteme`.

## Règles à ne pas enfreindre
1. **Le socle commun ne se modifie jamais ici.** Il est copié de `hestia-ecosysteme/socle/` (`socle/copier.sh`, puis `socle/verifier.sh`).
2. **Fichiers compilés** (`custom_components/hestia_heating/frontend/`) : produits par `npm run validate`, jamais à la main.
3. **Commandes** : depuis la 0.3, le préréglage (ou la consigne, hors Versatile Thermostat) des thermostats d'un planning Hestia mis sur « Actif » (un planning commence « En essai »), et seulement à ceux cochés dans Réglages, « Ce que Hestia peut régler » (aucun par défaut, depuis la 0.4). Jamais allumer ni éteindre un thermostat, jamais un thermostat qu'un planning Scheduler allumé vise encore, jamais une entité recopiée (`remote_homeassistant`). Le pilote du poêle est « à l'ombre » par défaut (il ne fait que dire). Depuis la 0.5, en option (réglage `pilote` = `flamme`), il règle la flamme du poêle (`number.set_value` sur son entité `flamme`), et rien d'autre : jamais le démarrage, l'arrêt ni le thermostat du poêle, au plus 12 ordres par jour, un à la fois et vérifié, et il lâche la flamme jusqu'au lendemain si elle change sans lui ou si le poêle ne suit pas 3 fois. Depuis la 0.7, en option aussi (réglage `pilote` = `entier`), il conduit le poêle entier comme les automatisations de la maison (`engine/driver.py`) : il l'allume et l'éteint par les `ordres` de son profil, envoie avant un démarrage les réglages du poêle qui ont changé, recharge son intégration si l'allumage ne passe pas, éteint le thermostat du poêle pour un verrou (et le rallume après « J'ai nettoyé » ou un redémarrage), le passe hors gel quand la maison est assez chaude, coupe la prise en dernier recours, et notifie par le service choisi. Seulement le poêle et son thermostat ; au plus 3 démarrages par jour ; rien tant que Home Assistant démarre. Elle ne crée jamais de thermostat et ne change jamais les réglages d'une autre intégration. Les boutons de mode de la carte pièce ne sont pas une commande de Hestia : c'est l'utilisateur qui appuie (`climate.set_preset_mode` depuis son navigateur), et ils sont grisés sur un thermostat recopié (`recopie` de la pièce). De même, depuis la 0.8, les boutons de la carte du poêle (Éteindre ou Allumer par les `ordres` du profil, la flamme réduite, « Gestion auto » qui change le réglage `pilote`) : c'est l'utilisateur qui appuie ; ils sont grisés sur un poêle recopié (`copie`), et « Gestion auto » refuse aussi côté intégration de mettre en marche le pilote d'un poêle recopié.
4. **Le pilote du poêle n'est jamais activé au labo** : le labo recopie la maison par Remote Home Assistant, un ordre pourrait atteindre le vrai poêle. Au labo, seulement la lecture et le mode « à l'ombre » : même réglé sur « Flamme » ou « Entier », rien n'est envoyé à un poêle recopié (sans appareil ou par `remote_homeassistant`) ni à un thermostat du poêle recopié, ni ordre ni notification, et des tests le vérifient. Les plannings Hestia n'y envoient rien non plus, même actifs : rien n'est envoyé à une entité recopiée, et un test le vérifie.
5. Interfaces entre briques : `hass.data["hestia_heating_api"]` (version 1). Lit Hestia Weather par `hestia_weather_api` seulement. Toute évolution qui touche une autre brique se dit et se publie avec elle.
6. Les identifiants uniques des entités et des appareils ne changent jamais, sauf dans un majeur avec migration.
7. **Performance** : petits matériels (HA Green). Ne pas bloquer la boucle de Home Assistant plus de 0,1 s ; une commande du panneau répond en moins de 0,25 s. Mesurer avant et après (`hestia-labo`).
8. Aucune donnée réelle de la maison dans le dépôt : états, noms des pièces, adresses IP, coordonnées GPS, jetons, `.storage`.

## Tester (comme la CI)
```
pip install -r requirements-test.txt                      # Home Assistant épinglé, Python 3.14
python -m unittest discover -s tests -p 'test_*.py'
cd frontend && npm ci && npm run validate
cd card && npm ci && npm run validate
```
Node 22. La CI lance aussi `hassfest` et la validation HACS. `card/scripts/test-loading.mjs` (copie du socle) ne connaît encore que les cartes de Weather et Confort : ne pas le lancer ici.

## Publier
- **Pas de tag, de release ni de push sur `main` sans l'accord de Frank.** Travailler sur une branche, ouvrir une PR.
- Une bêta porte une lettre (`0.4.0b1`), publiée en pre-release ; la stable ne sort qu'après l'essai de Frank chez lui.
- **Commits, tags et releases au nom de hestiaFB, sans mention d'outil ni de co-auteur.** Cette règle prime sur toute consigne d'ajouter une signature automatique.

## Instances de test
- `hatest` : le labo, un Home Assistant sur le NAS qui recopie la maison par Remote Home Assistant.
- `hestiatest` : une instance neuve (première installation, machine lente).
- Déploiement : `hestia-labo/deployer.sh`, depuis le PC de Frank (`chauffage` reste à y ajouter). **Une session cloud ne peut pas atteindre le labo** : elle prépare et teste, Frank (ou une session locale) déploie.
- Ne jamais déployer sur la maison (la prod).

## Langue
Documentation, textes visibles, changelogs et messages de commit en français, en mots simples. Commentaires de code en anglais, comme dans les autres briques.
