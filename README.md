# Hestia Chauffage — intégration

**Le chauffage de la maison, expliqué pièce par pièce.** Hestia Chauffage rassemble ce que vos thermostats savent déjà (Versatile Thermostat d’abord, et tout thermostat de Home Assistant), votre poêle à granulés et votre planning. Elle dit qui chauffe, pourquoi, et ce qui vient ensuite.

Elle ne remplace pas votre thermostat : elle s’appuie sur les intégrations que vous avez déjà.

> **Elle ne commande que ce que vous lui confiez.** Un planning Hestia commence « En pause » : il montre ce qu’il ferait, sans rien envoyer, tant que vous ne l’avez pas mis sur « Actif ». Même actif, il ne règle que les thermostats pour lesquels vous avez coché « Le planning change son mode » dans Réglages : aucun au départ. Le pilote du poêle est sur « Conseil » au départ : il dit ce qu’il ferait. En option, il règle la flamme (Automatique), la ventilation, ou allume et éteint le poêle (« par Hestia ») ; son essai à blanc rejoue d’abord la conduite entière du poêle, sans rien envoyer, à côté de ce que font vos automatisations. Hestia compte aussi les granulés brûlés et dit quand nettoyer le brasier, sans rien envoyer au poêle. Voir [le cahier des charges](docs/CAHIER-DES-CHARGES.md).

## Ce qu’elle montre

Un onglet **Chauffage** dans le panneau Hestia-FB :

- **Vue d’ensemble** : si tout marche, ce qui est à régler, quatre tuiles (Pièces, Poêle, Planning, Aujourd’hui), ce que Hestia a le droit de faire et ce qu’elle a changé aujourd’hui. La température de chaque pièce est aussi sur les cartes.
- **Pièces** : un tableau de vos pièces, puis une page par pièce avec son planning, ses thermostats (« Hestia change son mode », ce qui chauffe la pièce, la montrer ou non) et ce que Hestia y lit.
- **Poêle** : une page en quatre onglets. Maintenant (chaque entité lue, ce que Hestia y a changé, le journal du jour), Conduite (la flamme et la ventilation en Automatique ou en Manuel, l’ÉCO Stop, qui allume et éteint le poêle), Granulés et brasier (avec « J’ai nettoyé »), Avancé (tous les chiffres du pilote).
- **Planning** : la liste de vos plannings. Un planning, c’est une semaine en couleurs (tous les jours pareils, semaine et week-end, ou jour par jour) et les thermostats qu’il règle, « En pause » ou « Actif ». Les plannings de Scheduler sont lus, et se reprennent dans Hestia en un clic.
- **Réglages** : ce qui vaut pour toute la maison (ce qui chauffe chez vous, sa température, les prix, le téléphone). Un **guide** en cinq étapes passe tout en revue.
- **Extensions** : les intégrations que la brique lit.

Et une **carte** pour vos tableaux de bord, sous quatre formes :

```yaml
type: custom:hestia-heating-card
card: maison      # maison, poele, piece ou planning
# piece: bureau   # pour card: piece, l’id de la pièce Home Assistant
# compacte: true  # le poêle ou une pièce en version compacte (l’horloge en petit, à côté de sa phrase)
# court: true     # une pièce sur une ligne
# tap_action: page  # clic sur une pièce : thermostat (par défaut), page ou none
```

La carte d’une pièce et celle du poêle sont une **horloge de 24 heures** : l’anneau est le planning du jour, heure par heure ; la courbe la température des 20 dernières heures (ses degrés sont écrits juste après l’aiguille), avec la consigne en marches ; un trait par heure hors de l’anneau dit combien ça a chauffé (la demande du thermostat, la flamme du poêle), et les 4 heures à venir montrent en gris la veille ; l’aiguille donne l’heure. Au centre, le dessin du chauffage (radiateur électrique ou à eau, clim ou pompe à chaleur, poêle), la température et ce qui vient ensuite. Une heure survolée ou touchée grossit et donne ses chiffres au centre : température, flamme ou % de chauffe, kilos ou kWh, et leur prix. Dessous, un tiroir : Argent · Conso · Confort pour une pièce, Le feu et les réglages puis Granulés · Argent · Entretien pour le poêle. L’argent demande le prix du kWh (Réglages, « L’électricité ») et, pour le poêle, le prix des sacs.

Sous le nom du poêle, une phrase dit ce qu’il fait, dans la couleur de son état (« Consigne atteinte, le poêle entretient », « 21,5 °C vers 18 h 30 », « Brasier à nettoyer »…) ; la page Poêle commence par elle. Le poêle et une pièce ont aussi une version compacte, environ deux fois moins haute.

La carte d’une pièce a les modes de son thermostat (Hors gel, Éco, Confort, Boost) : c’est vous qui choisissez, la carte les envoie depuis votre navigateur, comme la carte thermostat de Home Assistant. La carte du poêle a trois boutons, Éteindre (ou Allumer), Flamme auto et J’ai nettoyé, et, dans « Le feu et les réglages », la flamme, la ventilation et l’ÉCO Stop, envoyés de la même façon ; ils sont grisés sur un poêle recopié d’une autre maison.

Elle publie aussi quelques entités (l’état de la maison, de chaque pièce et du poêle, la flamme, l’alarme, les jours de granulés, les kilos brûlés, l’énergie du poêle à déclarer dans la page Énergie, le brasier à nettoyer) pour vos automatisations. Le détail est dans [docs/technique.md](docs/technique.md).

## Ce qu’elle lit

- **Vos thermostats** : Versatile Thermostat d’abord (consigne, demande, puissance, fenêtre, délestage), et tout thermostat ou clim de Home Assistant.
- **Votre poêle à granulés**, par un profil : Micronova par Agua IOT pour commencer. Les autres poêles viendront un par un.
- **Suivi Stock Pellet** pour les granulés, **Scheduler** pour les pièces qui le suivent, **Hestia Weather** pour le froid à venir, **Hestia Énergie** pour le prix de l’électricité. Chacun est facultatif.

Tout est trouvé seul et rangé par pièce, d’après les pièces de Home Assistant.

## Installer

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

- **D’autres conseils** : quand le poêle chauffe moins cher que l’électrique.
- **Les boutons Allumer et Éteindre** de la page du poêle.
- **D’autres poêles** : un profil par intégration, après Micronova Agua IOT.

## Licence

MIT, voir [LICENSE](LICENSE).
