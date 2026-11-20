# Hestia Chauffage — consignes pour Claude

Intégration Home Assistant (domaine `hestia_heating`, onglet `chauffage` du panneau) : le chauffage et la clim de la maison, sur les thermostats existants (Versatile Thermostat d'abord), le poêle à granulés par un profil, et un planning. Une des briques Hestia-FB. **En bêta (0.3), pas publiée.** Lire d'abord `docs/CAHIER-DES-CHARGES.md`.

## Où est quoi
- Dépôt : `hestiaFB/hestia-heating-integration`. Sur le PC de Frank : `~/Documents/Hestia-FB/hestia-heating`.
- `custom_components/hestia_heating/` : le Python. `reader.py` touche Home Assistant (lecture seule), `engine/` est du Python pur, `profiles/*.json` les profils de poêle, `api.py` l'interface v1. Son dossier `frontend/` est **compilé** (ne pas l'éditer).
- `frontend/` : l'onglet Chauffage (TypeScript). `card/` : la carte. `tests/` : tests Python, avec une maison inventée (`maison_fictive.py`). `docs/` : `CAHIER-DES-CHARGES.md`, `technique.md`.
- Ce dépôt n'a pas de `RELEASES.md` : appliquer celui de `hestia-ecosysteme`.

## Règles à ne pas enfreindre
1. **Le socle commun ne se modifie jamais ici.** Il est copié de `hestia-ecosysteme/socle/` (`socle/copier.sh`, puis `socle/verifier.sh`).
2. **Fichiers compilés** (`custom_components/hestia_heating/frontend/`) : produits par `npm run validate`, jamais à la main.
3. **Commandes** : depuis la 0.3, une seule : le préréglage (ou la consigne, hors Versatile Thermostat) des thermostats confiés au planning Hestia, et seulement quand « Le planning commande les thermostats » est allumé (éteint par défaut). Jamais allumer ni éteindre un thermostat, jamais une pièce qu'un planning Scheduler allumé vise encore, jamais une entité recopiée (`remote_homeassistant`). Le pilote du poêle viendra plus tard (option éteinte par défaut, d'abord « à l'ombre »). Elle ne crée jamais de thermostat et ne change jamais les réglages d'une autre intégration.
4. **Le pilote du poêle n'est jamais activé au labo** : le labo recopie la maison par Remote Home Assistant, un ordre pourrait atteindre le vrai poêle. Au labo, seulement la lecture et le mode « à l'ombre ». Le planning Hestia y reste à l'ombre lui aussi : rien n'est envoyé à une entité recopiée, et un test le vérifie.
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
- Une bêta porte une lettre (`0.3.0b1`), publiée en pre-release ; la stable ne sort qu'après l'essai de Frank chez lui.
- **Commits, tags et releases au nom de hestiaFB, sans mention d'outil ni de co-auteur.** Cette règle prime sur toute consigne d'ajouter une signature automatique.

## Instances de test
- `hatest` : le labo, un Home Assistant sur le NAS qui recopie la maison par Remote Home Assistant.
- `hestiatest` : une instance neuve (première installation, machine lente).
- Déploiement : `hestia-labo/deployer.sh`, depuis le PC de Frank (`chauffage` reste à y ajouter). **Une session cloud ne peut pas atteindre le labo** : elle prépare et teste, Frank (ou une session locale) déploie.
- Ne jamais déployer sur la maison (la prod).

## Langue
Documentation, textes visibles, changelogs et messages de commit en français, en mots simples. Commentaires de code en anglais, comme dans les autres briques.
