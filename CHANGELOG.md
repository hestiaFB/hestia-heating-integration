# Changements

## 1.0.0b7 — La station dehors figée n’éteint plus le poêle

### Corrections
- **Le poêle n’est plus éteint quand seule la sonde dehors ne donne plus de nouvelles.** Le thermostat du poêle (Versatile Thermostat) se met en sécurité et s’éteint quand une de ses sondes reste muette une heure : Hestia prenait ça pour un vrai arrêt et éteignait le poêle 30 secondes après. Maintenant, pour la sonde dehors seule, la pièce reste surveillée : Hestia garde le poêle à la flamme la plus basse jusqu’au retour du thermostat, et ne l’éteint que si ça dure plus de 2 heures.
- **La sonde de la pièce sans nouvelles arrête toujours le poêle**, comme un thermostat éteint : sans elle, ni la consigne ni la sécurité des 28 °C ne voient plus la pièce. De même quand le thermostat ne dit pas quelle sonde est muette.
- **Le retour du thermostat après sa sécurité ne rallume pas le poêle** : ce n’est pas un passage en Boost. Un poêle arrêté attend le prochain.

### Améliorations
- **La carte et le journal le disent** : « Thermostat en sécurité, la sonde dehors ne répond plus : flamme au plus bas », ou « la sonde de la pièce ne répond plus : arrêt du poêle ».
- **Réglages › Avancé › Les sécurités** : « Sonde dehors sans nouvelles, au plus », 2 heures par défaut, seulement plus court.

## 1.0.0b6 — L’horloge du poêle montre ses paliers en entier, et la carte son brasier

### Améliorations
- **Chaque trait de flamme autour de l’horloge montre son palier en entier** : une flamme 3 a toujours la longueur d’une flamme 3, même si le poêle n’a brûlé que vingt minutes dans l’heure. Les flammes 1 et 2 se voient bien. Les minutes de l’heure restent au centre, au survol.
- **Le brasier se voit sur la carte du poêle**, sans rien ouvrir : le bouton « J’ai nettoyé » dit où il en est (« Brasier 10 % · encore 9 jours », « Brasier à nettoyer ») et se remplit comme lui, vert, puis orange quand le nettoyage approche, rouge quand il est dû. L’appui fait toujours « J’ai nettoyé », avec sa confirmation.
- **La consigne du poêle se lit en marches nettes** sur toutes les heures où son thermostat la demandait (le Boost), et plus seulement par bouts pendant que le poêle brûlait. Le trait est plus épais et passe par-dessus la courbe. Le Hors gel n’est toujours pas dessiné.

### Corrections
- **La ventilation « par Hestia » suit la flamme réglée**, plus la flamme que le poêle affiche : celle-ci baisse un instant quand le poêle module, et chaque baisse coûtait un ordre de ventilation de trop.

## 1.0.0b5 — Le poêle allumé à la main reste allumé

### Corrections
- **Un poêle allumé à la main n’est plus éteint par Hestia** quand « Par Hestia » allume et éteint le poêle. Son thermostat était resté en Hors gel : Hestia arrêtait le poêle aussitôt. Maintenant, Hestia met le thermostat du poêle en Boost et conduit le poêle comme d’habitude : la flamme, puis l’arrêt quand la maison est assez chaude ou quand le thermostat repasse en Hors gel. Cela vaut pour un allumage sur le poêle, depuis son application ou par « Allumer » sur la carte.
- **Hors gel arrête le poêle au moment où le thermostat y passe**, comme une automatisation d’arrêt du poêle, et non plus tant qu’il y reste.

### Améliorations
- **« Éteindre » sur la carte du poêle, avec « Par Hestia »**, passe le thermostat du poêle en Hors gel : Hestia arrête le poêle et vérifie l’arrêt, et le thermostat dit la même chose que le poêle.

## 1.0.0b4 — La carte du poêle dit le mode de son thermostat, et les jours avant le nettoyage

### Améliorations
- **L’horloge de la carte du poêle montre le mode de son thermostat** (Hors gel, Éco, Confort, Boost), comme les autres chauffages, au lieu de « poêle en chauffe ». L’état du poêle reste au centre et dans sa phrase.
- **Les jours avant le nettoyage du brasier**, au rythme depuis le dernier nettoyage, sur la carte du poêle (« brasier dans 3 jours ») et sur la page du poêle. Le compte démarre au premier « J’ai nettoyé » appuyé dans Hestia : la carte le rappelle tant qu’il n’a pas été fait.

### Corrections
- **Un réglage refusé se voit** : la raison, écrite en haut de la page, vient sous les yeux quand vous appuyez sur Enregistrer. Avant, le bouton semblait ne rien faire.

## 1.0.0b3 — Un panneau technique et simple, et le poêle réglé comme sur son application

**L’onglet Chauffage devient technique et simple** : une vue d’ensemble qui dit si tout marche et ce que Hestia a changé aujourd’hui, des Réglages en onglets, et tous les chiffres du poêle dans un écran Avancé. **Le poêle se règle comme sur son application** : la flamme et la ventilation en Automatique ou en Manuel, l’ÉCO Stop expliqué, et l’allumage par Hestia de nouveau au choix. Vos réglages restent comme vous les avez laissés.

### Nouveautés
- **La vue d’ensemble** remplace l’accueil : les thermostats qui répondent, les mesures reçues, les changements faits aujourd’hui ; vos appareils (radiateurs, poêle, clim, stock de granulés, météo, plannings Scheduler) avec leur dernière nouvelle ; ce que Hestia fait pour vous, et ce qu’elle a changé aujourd’hui. La température de chaque pièce reste sur les cartes.
- **La page technique du poêle** (depuis la vue d’ensemble) : chaque entité lue, sa valeur et son âge ; ce que Hestia y a changé aujourd’hui ; le journal du jour ; l’essai à blanc (« comme vos automatisations 11 fois sur 12 ») et la dernière différence ; le brasier.
- **Réglages en onglets** : La maison (ce qui chauffe chez vous, la température de la maison, la météo, le prix du kWh, le téléphone qui reçoit les messages), Thermostats (pour chacun : « Le planning change son mode », ce qui chauffe la pièce, le montrer ou non, ses modes, ce que Hestia y lit) et Poêle à granulés.
- **La flamme : Automatique ou Manuel.** En manuel, la puissance de 1 à 5 et la température réglée dans le poêle partent au poêle dès que vous les touchez, comme depuis son application.
- **La ventilation à trois choix** : automatique par le poêle, automatique par Hestia (au plus bas tant que le poêle est froid, puis un cran au-dessus de la flamme, maintenant aussi quand vos automatisations allument le poêle), ou manuelle avec sa vitesse.
- **L’ÉCO Stop** se règle dans Réglages et sur la carte, avec son délai, et dit ce qu’il fait vraiment : le poêle s’éteint seul seulement si sa propre sonde dépasse la température réglée dans le poêle ; avec la flamme automatique, Hestia règle 25 °C, presque jamais atteints.
- **Allumer et éteindre : par Hestia** est de nouveau proposé, avec la flamme automatique ou manuelle. À choisir après avoir coupé vos automatisations qui allument et éteignent le poêle.
- **Avancé : comment Hestia conduit le poêle** : les paliers de la flamme, sa marge, l’allumage, l’arrêt, les sécurités, les écritures gardées dans la mémoire du poêle, les débits de granulés, l’énergie d’un kilo et le rendement. Chaque chiffre dit sa valeur par défaut, et « Tout remettre par défaut » les rétablit.
- **Ce qui chauffe la pièce** se corrige quand Hestia l’a mal reconnu (radiateur électrique, radiateur à eau, plancher chauffant, clim, pompe à chaleur) : il donne le dessin de sa carte.
- **Un guide en cinq étapes** : ce qui chauffe chez vous, vos thermostats, le poêle, le planning, les prix.
- **La carte du poêle** règle la flamme (Auto ou une puissance), la ventilation (par le poêle, par Hestia, ou une vitesse) et l’ÉCO Stop, dans « Le feu et les réglages ». Son bouton « Gestion auto » devient « Flamme auto ».

### Améliorations
- Le menu de l’onglet : Vue d’ensemble, Planning, Réglages, Extensions, À propos. Les pages d’une pièce disparaissent : les cartes les remplacent.
- Avant un allumage par Hestia, la température réglée dans le poêle et l’ÉCO Stop sont ceux choisis dans Réglages (25 °C et activé par défaut, comme avant).

## 1.0.0b2 — Le poêle dit ce qu’il fait, et le mode Entier s’essaie à blanc

**Le poêle dit en une phrase ce qu’il fait**, sur sa carte et sur la page Poêle. **Le mode Entier a son simulateur** : il rejoue les démarrages et les arrêts sans rien envoyer, à côté de ce que font vos automatisations.

### Nouveautés
- **La phrase du poêle**, sous son nom, dans la couleur de son état : « Consigne atteinte, le poêle entretient », « 21,5 °C vers 18 h 30 », « Brasier à nettoyer : 16,2 kg brûlés », « En chauffe, fenêtre ouverte », « Éteint, en hors gel jusqu’au prochain boost du planning »… Un message pour chaque état, du plus urgent (alarme, surchauffe, poêle qui ne répond plus) au plus calme. Les poêles en veille (« Stand-by ») sont reconnus : « En veille, il repartira seul ».
- **Le simulateur du mode Entier** (Réglages, « Simulateur du mode Entier », en Conseil et en Flamme) : Hestia fait comme si elle conduisait le poêle, sans rien lui envoyer, pas même une notification. Le journal du jour le dit au conditionnel (« Hestia allumerait le poêle », « Hestia éteindrait le poêle »), et note un désaccord quand la maison n’allume pas ou n’éteint pas le poêle dans les minutes qui suivent. La page Poêle montre ce que le mode Entier ferait en ce moment.
- **La ventilation au choix** pour le mode Entier (et son simulateur) : AUTO, réglée une fois avant chaque démarrage, comme avant ; ou **Flamme + 1** : au plus bas tant que les fumées sont sous 110 °C, puis la flamme + 1, 5 au plus. Chaque changement coûte un ordre du jour : au plus un toutes les 10 minutes, et seulement s’il en reste plus de 6.
- **Les cartes Poêle et Pièce en version compacte** : l’horloge en petit, à côté de sa phrase, sans légende. Environ deux fois moins hautes.

### Améliorations
- **La pièce trop chaude** : la flamme ne passe à 1 que si la pièce du poêle dépasserait sa consigne de 2 °C dans 15 minutes (avant : 0,5 °C). L’écart se règle dans Réglages, « Pièce trop chaude ». La flamme 1 encrasse plus : elle reste rare.
- **Les réglages de la carte** ressemblent à ceux de Weather, Confort et Énergie : les formes en tuiles, puis la pièce, la version, le titre, et l’appui sur la carte dans « Fonctionnalités ».
- Le cahier des charges n’a plus de points « à trancher » : ils deviennent « Les choix faits ».

### Corrections
- Réglages enregistre bien « Pièce trop chaude ».

## 1.0.0b1 — La version de production

**Hestia Chauffage ne parle plus d’essai.** Seuls les mots changent : vos réglages, vos plannings et le pilote du poêle restent comme vous les avez laissés.

### Améliorations
- Un planning qui montre ce qu’il ferait, sans rien envoyer, est maintenant « En pause » (avant : « En essai »). « Actif » ne change pas.
- Le pilote du poêle qui dit ce qu’il ferait, sans rien commander, s’appelle « Conseil » (avant : « À l’ombre »). Flamme, Entier et Éteint ne changent pas.
- Un thermostat ou un poêle recopié d’une autre maison (Remote Home Assistant) porte la note « Recopié » (avant : « Labo »).
- Le mode « Entier » du pilote (Hestia allume et éteint le poêle) n’est plus proposé dans Réglages : il reviendra une fois essayé dans une vraie maison. Un poêle déjà réglé sur « Entier » le garde.
- Le README et le cahier des charges décrivent la brique telle qu’elle est ; l’histoire des versions et les décisions passent dans `docs/dev/HISTOIRE.md`.

## 0.8.0b3 — La roue au survol

**L’horloge des cartes Pièce et Poêle se lit heure par heure**, comme la roue d’Hestia Énergie.

### Nouveautés
- **Passez la souris sur une heure, ou touchez-la** : elle grossit, les autres s’effacent, et ses chiffres viennent au centre. La température moyenne de l’heure, la flamme du poêle (et combien de minutes il a brûlé) ou le % de chauffe du radiateur, les kilos de granulés ou les kWh de l’heure, et ce qu’ils ont coûté. Un deuxième appui sur l’heure, ou un appui au centre, la relâche. Au clavier aussi : Tab, les flèches, Entrée, Échap.
- **Une heure, un trait**, hors de l’anneau : plus il est long et orangé, plus ça a chauffé (la flamme pour le poêle, le % de chauffe pour un radiateur).
- **Les 4 heures à venir**, juste après l’aiguille : le planning prévu, et en gris ce qui s’est passé hier à la même heure.

### Améliorations
- L’anneau du planning est découpé en 24 heures : elles se comptent d’un coup d’œil.
- La consigne suit le planning en marches (éco, confort, poêle en chauffe) au lieu d’un cercle fixe. Celle du poêle n’est dessinée que lorsqu’il brûle.
- La courbe a un dégradé qui part du centre ; ses degrés restent écrits juste après l’aiguille.
- Sur la carte d’une pièce, un appui hors des heures ouvre toujours le thermostat (ou la page de la pièce, selon le réglage « Clic sur la carte »).

## 0.8.0b2 — Une horloge plus facile à lire

### Corrections
- **Carte du poêle** : poêle éteint, la courbe du salon semblait tourner autour de 14 °C. Ce 14 °C était la consigne hors gel du thermostat du poêle, et c’était le seul chiffre de l’horloge. La consigne du poêle n’est plus montrée que lorsqu’il brûle.
- Sur les deux cartes, une consigne bien plus basse que toute la courbe (3 °C ou plus, un hors gel par exemple) n’écrase plus la courbe vers le centre.

### Améliorations
- **L’échelle de la courbe est écrite** : des cercles en pointillés aux degrés ronds, avec leur valeur (18°, 20°, 22°…), écrite dans l’espace libre juste après l’aiguille. La consigne a son cercle en tirets et sa valeur en couleur, et la légende dit « consigne ».
- **Des repères plus marqués** : une petite encoche à chaque heure sur l’anneau, une plus grande à 0 h, 6 h, 12 h et 18 h, des heures écrites plus gros, et un point au bout de la courbe pour la température de maintenant.
- En thème clair, la courbe et la consigne sont d’un orange plus soutenu, pour se lire aussi bien qu’en thème sombre.

## 0.8.0b1 — Les cartes en horloge

**La carte d’une pièce et la carte du poêle deviennent une horloge de 24 heures**, avec le dessin de votre chauffage au centre et un tiroir dessous. Les cartes Maison, Planning et la pièce sur une ligne ne changent pas.

### Nouveautés
- **L’horloge du jour**, minuit en haut. L’anneau montre le planning de la journée. La courbe montre la température des 20 dernières heures : plus elle s’éloigne du centre, plus il fait chaud. Les petits traits à l’intérieur montrent la chauffe (la demande du thermostat, ou la flamme du poêle). L’aiguille montre l’heure. Au centre : un radiateur électrique, un radiateur à eau, une clim ou une pompe à chaleur, ou le poêle, avec la température et ce qui vient ensuite.
- **La carte d’une pièce** : un témoin « Chauffe 21 % » ou « Ne chauffe pas », le mode du thermostat, un bouton vers la page de la pièce, et le tiroir **Argent · Conso · Confort** : ce que coûte la pièce aujourd’hui, sur 7 jours et sur le mois, ses kWh, son temps de chauffe du jour, l’humidité et la consigne.
- **La carte du poêle** : « Gestion auto » ou « À la main », la flamme, ce que fait Hestia, et trois boutons : **Éteindre** (ou **Allumer**), **Gestion auto** et **J’ai nettoyé**. Éteindre, Allumer et J’ai nettoyé demandent de confirmer.
- Le tiroir **Le feu et les réglages**, ouvert : la pièce et sa consigne, les fumées, les granulés de l’heure et leur prix, la flamme réduite, la ventilation, la prise, le planning et le radiateur d’appoint.
- Le tiroir **Granulés · Argent · Entretien**, fermé : jusqu’à quand durent les granulés et les 14 derniers jours ; ce que coûte le poêle face à la même chaleur à l’électricité (aujourd’hui, 7 jours, la saison) ; le brasier, l’alarme et la prise.
- **Dans Réglages, « L’électricité »** : le prix du kWh, pour l’argent des cartes. Sans lui, les cartes disent où le donner.

### Améliorations
- Les cartes lisent les 24 dernières heures et les totaux des 14 derniers jours dans l’historique de Home Assistant : les kWh du compteur d’énergie du thermostat, les kilos de granulés comptés par Hestia.
- « Gestion auto » remet le pilote dans le mode choisi dans Réglages (« Flamme » ou « Entier »), et le coupe en le laissant « à l’ombre ».

### Ce qui protège la maison
- Les boutons des cartes sont vos propres appuis, envoyés depuis votre navigateur, comme les cartes de Home Assistant.
- Sur un poêle recopié d’une autre maison (au labo), Éteindre, Allumer, Gestion auto, la flamme réduite, la ventilation et la prise sont grisés : rien n’est envoyé. « Gestion auto » ne s’y met jamais en marche, même demandé par un autre chemin.
- La ventilation et la prise ouvrent la fenêtre de Home Assistant : la carte ne les change pas toute seule.

## 0.7.0b1 — Première bêta : le chauffage de la maison, le poêle et vos plannings

**Hestia Chauffage explique le chauffage de la maison, pièce par pièce, suit le poêle à granulés, et a ses propres plannings.**
**Au départ, elle ne commande rien** : les plannings commencent « En essai », le pilote du poêle est « à l’ombre », et aucun thermostat n’est coché dans « Ce que Hestia peut régler ».

C’est la première bêta publiée. Les versions 0.1 à 0.6, plus bas, n’ont jamais été publiées seules : elle les réunit toutes.

### Nouveautés
- **L’onglet Chauffage** du panneau Hestia-FB : la maison en une phrase, chaque pièce (sa température, sa consigne, pourquoi elle chauffe ou non), le poêle, le planning, les réglages et les extensions trouvées.
- **Une carte** pour vos tableaux de bord, sous quatre formes : la maison, le poêle, une pièce (longue ou courte) et le planning du jour. La carte d’une pièce a les modes de son thermostat (Hors gel, Éco, Confort, Boost), sa courbe du jour, et un clic ouvre son thermostat.
- **Vos thermostats** : Versatile Thermostat d’abord, et tout thermostat ou clim de Home Assistant. Hestia ne crée aucun thermostat.
- **Vos plannings** : chacun est une semaine en couleurs et les thermostats qu’il règle. « En essai », il montre ce qu’il ferait. « Actif », il règle le préréglage, et seulement des thermostats cochés dans Réglages. Les plannings de Scheduler sont lus, et se reprennent dans Hestia en un clic.
- **Le poêle à granulés** (Micronova par Agua IOT) : son état, sa flamme, ses fumées, sa prise, ses ordres du jour et sa journée.
- **Le pilote du poêle, à l’ombre** : ce que Hestia ferait, face à ce que font vos automatisations, avec un journal de 7 jours. En option, il règle la flamme seulement (« Flamme »), ou conduit le poêle entier (« Entier ») à la place de vos automatisations.
- **Les granulés et le brasier** : ce que brûle le poêle, en kilos, en chaleur et en euros, calé sur vos sacs, et quand nettoyer le brasier.
- **Pour Hestia Énergie** : le chauffage de chaque thermostat et l’énergie du poêle, prêts à être lus.
- Quelques entités pour vos automatisations : l’état de la maison, de chaque pièce et du poêle, la flamme, l’alarme, les granulés, le brasier.

### Le pilote entier, nouveau dans cette version
- **Dans Réglages, « Le pilote de Hestia » a un quatrième choix : « Entier »**. Hestia fait alors ce que font vos automatisations du poêle : elle le démarre au passage de son thermostat en boost, règle sa flamme, l’arrête en hors gel, vérifie l’arrêt, et tient les sécurités. Coupez d’abord vos automatisations du poêle : deux pilotes en même temps se contrediraient.
- **Le démarrage** : les réglages du poêle qui ont changé (consigne interne à 25 °C, ECO Stop, ventilation en AUTO s’il reste assez d’ordres), puis l’ordre d’allumage. Pas pris en 3 minutes : Hestia recharge l’intégration du poêle et renvoie l’ordre ; toujours rien, elle vous prévient. 3 démarrages par jour au plus.
- **Les refus qui verrouillent** : la pièce trop chaude, le brasier à nettoyer, une alarme ou un poêle muet éteignent le thermostat du poêle, comme le fait la maison. « J’ai nettoyé » le rallume, en hors gel, pour le brasier.
- **L’arrêt vérifié** : jusqu’à 3 ordres, puis une vérification 25 minutes après (l’état, les fumées sous 60 °C, la prise sous 70 W). Le poêle chauffe encore : l’ordre de nouveau, puis « Couper la prise ? », coupée sans réponse en 5 minutes si Réglages le permettent.
- **La saison douce** : Hestia vous demande avant d’allumer, Oui ou Non, sur le téléphone et sur la page Poêle. Sans réponse en 15 minutes, le thermostat repasse hors gel, sauf si le poêle est déjà en route.
- **Après un redémarrage de Home Assistant** : un poêle qui brûle avec son thermostat éteint retrouve son thermostat, en boost.
- **Dans Réglages** : le service de vos téléphones pour les notifications (avec leurs boutons), l’interrupteur de la prise du poêle (trouvé seul quand c’est possible), et « Couper la prise sans réponse ».
- À l’ombre aussi, le pilote refuse un démarrage quand le brasier est à nettoyer.
- Un arrêt demandé pendant que le poêle ne dit plus son état attend 2 minutes qu’il le dise, puis l’envoie quand même, comme la maison.

### Ce qui protège la maison
- Au labo, rien n’est jamais envoyé : ni ordre, ni notification, à un poêle ou un thermostat recopié d’une autre maison.
- « À l’ombre » reste le choix de départ, et le retour arrière en un clic.
- Hestia n’allume ni n’éteint jamais un thermostat de pièce, et ne touche jamais un thermostat qu’un planning Scheduler allumé règle encore.

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
- La demande du thermostat n’est montrée (carte et page de la pièce) que quand il demande à chauffer : à 0 %, il reste la phrase seule (« Chauffage en pause », « Éco jusqu’à 20 h 30, puis confort »).

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
