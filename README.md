# Hestia Chauffage — intégration

**Le chauffage de la maison, expliqué pièce par pièce.** Hestia Chauffage rassemble ce que vos thermostats savent déjà (Versatile Thermostat d’abord, et tout thermostat de Home Assistant), votre poêle à granulés et votre planning. Elle dit qui chauffe, pourquoi, et ce qui vient ensuite.

Elle ne remplace pas votre thermostat : elle s’appuie sur les intégrations que vous avez déjà.

> **En préparation.** Rien à installer pour l’instant. La première bêta (0.1) sera en lecture seule : elle lit et explique, elle ne commande rien. Voir [le cahier des charges](docs/CAHIER-DES-CHARGES.md).

## Une brique Hestia-FB

Hestia Chauffage rejoint [Hestia Weather](https://github.com/hestiaFB/hestia-weather-integration), [Hestia Confort](https://github.com/hestiaFB/hestia-comfort-integration) et [Hestia Énergie](https://github.com/hestiaFB/hestia-energy-integration) dans le panneau « Hestia-FB » de Home Assistant. Chaque brique reste utile seule ; reliées, elles se parlent :

- Hestia Weather lui donne le froid à venir, pour démarrer plus tôt ou pas du tout.
- Hestia Énergie affiche ce que coûte chaque source de chaleur.
- Hestia Confort lit l’état réel du chauffage de chaque pièce.

## Ce qui viendra ensuite

- **Un planning maison**, pièce par pièce et pour le poêle, qui tient compte du temps prévu.
- **Des conseils** : quand le poêle chauffe moins cher que l’électrique, quand nettoyer le brasier, combien de jours de granulés il reste.
- **Un pilote de poêle à granulés**, en option : le thermostat décide combien chauffer, Hestia Chauffage règle la flamme, avec un démarrage et un arrêt sûrs. Un profil par intégration de poêle (Micronova Agua IOT en premier).

## Licence

MIT, voir [LICENSE](LICENSE).
