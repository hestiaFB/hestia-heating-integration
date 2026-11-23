# Hestia Chauffage — intégration

**Le chauffage de la maison, expliqué pièce par pièce.** Hestia Chauffage rassemble ce que vos thermostats savent déjà (Versatile Thermostat d’abord, et tout thermostat de Home Assistant), votre poêle à granulés et votre planning. Elle dit qui chauffe, pourquoi, et ce qui vient ensuite.

Elle ne remplace pas votre thermostat : elle s’appuie sur les intégrations que vous avez déjà.

> **Bêta 0.4, en préparation.** Elle lit et explique, et elle a ses propres plannings. Un planning commence « En essai » : il montre ce qu’il ferait, sans rien envoyer, tant que vous ne l’avez pas mis sur « Actif ». Même actif, il ne règle que les thermostats que vous avez cochés dans Réglages, « Ce que Hestia peut régler » : aucun au départ. Le poêle lui-même n’est jamais commandé. Voir [le cahier des charges](docs/CAHIER-DES-CHARGES.md).

## Ce que montre la version 0.4

Un onglet **Chauffage** dans le panneau Hestia-FB :

- **Accueil** : la maison en une phrase (« Le poêle chauffe, flamme 3. Un radiateur en appoint. »), le froid de la nuit, puis chaque pièce avec sa température, sa consigne, ce qu’elle fait et pourquoi.
- **Poêle** : son état traduit dans vos mots, la flamme demandée et la flamme réelle, sa journée, les fumées, l’alarme, la prise mesurée, les granulés qu’il reste. Et son pilote « à l’ombre » : ce que Hestia ferait (démarrer, quelle flamme, arrêter), à côté de ce que font vos automatisations.
- **Une pièce** : son thermostat, sa journée (température et consigne), ce qui vient ensuite.
- **Planning** : la liste de vos plannings. Un planning, c’est une semaine en couleurs (tous les jours pareils, semaine et week-end, ou jour par jour) et les thermostats qu’il règle, « En essai » ou « Actif ». Les plannings de Scheduler sont lus, et se reprennent dans Hestia en un clic.
- **Réglages** et **Extensions** : ce que la brique a trouvé, le thermostat et la prise du poêle, les thermostats à ne pas lire.

Et une **carte** pour vos tableaux de bord, sous quatre formes :

```yaml
type: custom:hestia-heating-card
card: maison      # maison, poele, piece ou planning
# piece: bureau   # pour card: piece, l’id de la pièce Home Assistant
# court: true     # une pièce sur une ligne
# tap_action: page  # clic sur une pièce : thermostat (par défaut), page ou none
```

La carte d’une pièce a les modes de son thermostat (Hors gel, Éco, Confort, Boost) : c’est vous qui choisissez, la carte les envoie depuis votre navigateur, comme la carte thermostat de Home Assistant.

Elle publie aussi quelques entités (l’état de la maison, de chaque pièce et du poêle, la flamme, l’alarme, les jours de granulés) pour vos automatisations. Le détail est dans [docs/technique.md](docs/technique.md).

## Ce qu’elle lit

- **Vos thermostats** : Versatile Thermostat d’abord (consigne, demande, puissance, fenêtre, délestage), et tout thermostat ou clim de Home Assistant.
- **Votre poêle à granulés**, par un profil : Micronova par Agua IOT pour commencer. Les autres poêles viendront un par un, avec des testeurs.
- **Suivi Stock Pellet** pour les granulés, **Scheduler** pour les pièces qui le suivent, **Hestia Weather** pour le froid à venir, **Hestia Énergie** pour le prix de l’électricité. Chacun est facultatif.

Tout est trouvé seul et rangé par pièce, d’après les pièces de Home Assistant.

## Installer (bêta)

1. Dans HACS, ajoutez ce dépôt comme dépôt personnalisé (catégorie Intégration), puis installez **Hestia Heating**.
2. Redémarrez Home Assistant.
3. Paramètres → Appareils et services → Ajouter une intégration → **Hestia Heating**.

L’onglet Chauffage apparaît dans le panneau Hestia-FB.

## Une brique Hestia-FB

Hestia Chauffage rejoint [Hestia Weather](https://github.com/hestiaFB/hestia-weather-integration), [Hestia Confort](https://github.com/hestiaFB/hestia-comfort-integration) et [Hestia Énergie](https://github.com/hestiaFB/hestia-energy-integration) dans le panneau « Hestia-FB » de Home Assistant. Chaque brique reste utile seule ; reliées, elles se parlent :

- Hestia Weather lui donne le froid à venir, pour démarrer plus tôt ou pas du tout.
- Hestia Énergie affiche ce que coûte chaque source de chaleur.
- Hestia Confort lit l’état réel du chauffage de chaque pièce.

## Ce qui viendra ensuite

- **D’autres conseils** : quand le poêle chauffe moins cher que l’électrique, quand nettoyer le brasier.
- **Le pilote du poêle qui commande**, en option, éteint par défaut : le thermostat décide combien chauffer, Hestia Chauffage règle la flamme, avec un démarrage et un arrêt sûrs. Un profil par intégration de poêle (Micronova Agua IOT en premier).

## Licence

MIT, voir [LICENSE](LICENSE).
