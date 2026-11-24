# Hestia Chauffage — intégration

**Le chauffage de la maison, expliqué pièce par pièce.** Hestia Chauffage rassemble ce que vos thermostats savent déjà (Versatile Thermostat d’abord, et tout thermostat de Home Assistant), votre poêle à granulés et votre planning. Elle dit qui chauffe, pourquoi, et ce qui vient ensuite.

Elle ne remplace pas votre thermostat : elle s’appuie sur les intégrations que vous avez déjà.

> **Elle ne commande que ce que vous lui confiez.** Un planning Hestia commence « En pause » : il montre ce qu’il ferait, sans rien envoyer, tant que vous ne l’avez pas mis sur « Actif ». Même actif, il ne règle que les thermostats que vous avez cochés dans Réglages, « Ce que Hestia peut régler » : aucun au départ. Le pilote du poêle est sur « Conseil » au départ : il dit ce qu’il ferait. En option, il peut régler la flamme, et seulement elle. Son simulateur rejoue à blanc la conduite entière du poêle (démarrer, arrêter, tenir les sécurités), sans rien envoyer, à côté de ce que font vos automatisations. Hestia compte aussi les granulés brûlés et dit quand nettoyer le brasier, sans rien envoyer au poêle. Voir [le cahier des charges](docs/CAHIER-DES-CHARGES.md).

## Ce qu’elle montre

Un onglet **Chauffage** dans le panneau Hestia-FB :

- **Accueil** : la maison en une phrase (« Le poêle chauffe, flamme 3. Un radiateur en appoint. »), le froid de la nuit, puis chaque pièce avec sa température, sa consigne, ce qu’elle fait et pourquoi.
- **Poêle** : son état traduit dans vos mots, la flamme demandée et la flamme réelle, sa journée, les fumées, l’alarme, la prise mesurée, les granulés qu’il reste. Les granulés qu’il brûle (maintenant, aujourd’hui, cette saison, en kilos, en chaleur et en euros), calés sur les sacs déclarés dans Suivi Stock Pellet, et le brasier : les kilos depuis le dernier nettoyage, avec un bouton « J’ai nettoyé ». Et son pilote, sur « Conseil » au départ : ce que Hestia ferait (démarrer, quelle flamme, arrêter), à côté de ce que font vos automatisations. En option, Hestia règle la flamme elle-même.
- **Une pièce** : son thermostat, sa journée (température et consigne), ce qui vient ensuite.
- **Planning** : la liste de vos plannings. Un planning, c’est une semaine en couleurs (tous les jours pareils, semaine et week-end, ou jour par jour) et les thermostats qu’il règle, « En pause » ou « Actif ». Les plannings de Scheduler sont lus, et se reprennent dans Hestia en un clic.
- **Réglages** et **Extensions** : ce que la brique a trouvé, le thermostat et la prise du poêle, les thermostats à ne pas lire.

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

La carte d’une pièce a les modes de son thermostat (Hors gel, Éco, Confort, Boost) : c’est vous qui choisissez, la carte les envoie depuis votre navigateur, comme la carte thermostat de Home Assistant. La carte du poêle a trois boutons, Éteindre (ou Allumer), Gestion auto et J’ai nettoyé, envoyés de la même façon ; ils sont grisés sur un poêle recopié d’une autre maison.

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
- **Les boutons Allumer et Éteindre** de la page Poêle.
- **Le poêle conduit en entier** (démarrer, arrêter, tenir les sécurités, à la place de vos automatisations) : il sera proposé une fois essayé dans une vraie maison. Son simulateur, dans Réglages, permet déjà de voir ce qu’il ferait chez vous.
- **D’autres poêles** : un profil par intégration, après Micronova Agua IOT.

## Licence

MIT, voir [LICENSE](LICENSE).
