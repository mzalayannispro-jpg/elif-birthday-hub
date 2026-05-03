# 🌙 Elif Birthday Hub - Development & Project Tracking

Bienvenue dans le document de suivi ultra-détaillé du projet **Elif Birthday Hub**. Ce fichier retrace l'historique exhaustif des décisions architecturales, des implémentations techniques, des bugs complexes résolus, et des tâches accomplies depuis le tout début du projet (initié vers le **19 Avril 2026**).

---

## 📋 TASK LIST : Historique Complet

### Phase 1 : Fondation & Esthétique 🎨 (Avril 2026)
- `[x]` **Thème Kitsch Turc 70s :** Création du design system dans `style.css` (Tapis persans, Couleurs Or, Rouge Sang, Teal Turc).
- `[x]` **Structure Core :** `index.html` et `app.js` pour gérer le routage dynamique des div (sans rechargement de page).
- `[x]` **Asset Manager :** Script Node.js récursif `update_stickers.js` générant `assets_list.js` pour charger dynamiquement les dossiers de stickers.
- `[x]` **Internationalisation (i18n) :** Système linguistique via `data-i18n` (Anglais 🇬🇧 / Turc 🇹🇷).

### Phase 2 : Layer 1 - Les Jeux Classiques 🕹️
- `[x]` **Coskun Invaders (Space Invaders) :** Ennemis remplacés par les stickers.
- `[x]` **Mahjong Solitaire :** Tuiles texturées en 3D avec les assets personnels.
- `[x]` **Sudoku Punchlines :** Grille remplie de blagues privées au lieu de chiffres.
- `[x]` **Tetris :** Tuiles de différentes formes (T, L, Z) générées dynamiquement.
- `[x]` **Uzinagaz (Lancer de hache) :** Jeu de timing sur la Roue de la Mort.

### Phase 3 : Système de Progression & Sauvegarde 💾
- `[x]` **Score Global (`localStorage`) :** Score synchronisé entre toutes les instances de jeux via `window.addGlobalScore`.
- `[x]` **Sauvegarde Multi-Supports (Cross-Device) :** Génération de mots de passe (ex: `ELIF-84000-XYZ`) pour transférer la partie PC vers la Tablette.
- `[x]` **La Porte Magique :** Verrous conditionnels (3000 pts = Annonce, 6000 pts = Layer 2).

### Phase 4 : Layer 2 - Refonte Moteurs Open Source ⚙️ (Début Mai 2026)
- `[x]` **Architecture UI Globale :** Implémentation du `<div id="layer2-ui-overlay">` pour centraliser le D-Pad Mobile, le bouton Pause, et Restart en-dehors du code de chaque jeu.
- `[x]` **Super Elif (Tile-Based Platformer) :** Abandon du vieux code physique pour un clone de `tiny-platformer`.
- `[x]` **Angry Stickers (Matter.js) :** Refonte intégrale avec un vrai lance-pierre (Constraint) et des pyramides de blocs (Bodies) avec gravité physique.
- `[x]` **Tower Defense (Grid-Based) :** Remplacement de la carte libre par une grille matricielle de chemin, avec bouton manuel "Start Wave".

### Phase 5 : Layer 3 - Expériences 3D 🧊 (En cours)
- `[x]` **Structure d'Unlock :** Porte magique niveau 3 cliquable à 12000 points.
- `[/]` **Counter Stickers :** Base du moteur 3D web. *(En construction)*

---

## 🛠️ WALKTHROUGH TECHNIQUE : Problèmes, Correctifs et Décisions

Ce Walkthrough consigne la résolution des bugs techniques les plus complexes du projet, permettant de garder une trace des décisions d'ingénierie.

### 1. La Combinaison Mortelle de "Super Elif" (Bug du 03 Mai 2026)
* **Symptôme observé :** "Le jeu Mario apparaît, je tombe à travers le vide et le message 'Oups tu es tombé' s'affiche instantanément."
* **Investigation :** Le problème était composé de 3 bugs superposés formant une "tempête parfaite" :
  1. **Bug CSS Container :** Le jeu était généré avec `height: 100%`. Comme son parent `<div id="game-slot">` n'avait aucune hauteur définie, le Canvas s'écrasait à 0px de haut. Le sol n'était donc jamais affiché sur l'écran ! *(Correction: Remplacement par `height: 80vh; min-height: 500px;`)*
  2. **Bug de Tunneling (Physique) :** Avec le nouveau moteur Tiny Platformer, la gravité (`GRAVITY`) accumulait une vitesse de chute si élevée que le joueur traversait les 50 pixels du sol en une seule frame (1/60ème de seconde). Le code de collision ne testait que la position finale, qui se retrouvait sous le sol. *(Correction: Plafonnement strict de `MAXDY` à 30 pixels par frame)*
  3. **Bug du Spawn Ennemi :** Par hasard algorithmique, le premier ennemi généré tombait de sa plateforme, glissait vers la gauche, et touchait le point de chute exact du joueur à la milliseconde précise où celui-ci atterrissait, déclenchant le Game Over sans raison apparente. *(Correction: Décalage forcé de la zone de création des monstres à `x=10` blocs)*

### 2. Isolation des Boutons Mobiles (Layer 2)
* **Contexte :** Chaque jeu du Layer 2 avait besoin d'un D-Pad, d'un bouton de saut/tir, et d'un bouton "Pause".
* **Décision Technique :** Au lieu de polluer `mario.js`, `angry_birds.js` et `tower_defense.js` avec du code d'interface HTML et des EventListeners tactiles, j'ai créé un unique `l2-mobile-controls` dans `index.html`. 
* Ce D-pad modifie directement des variables globales de touches simulées. Ainsi, `mario.js` intercepte simplement `left`, `right`, et `jump` sans se soucier de savoir s'ils proviennent du clavier ou de l'écran tactile. De plus, `app.js` est chargé d'afficher ou masquer ce D-Pad uniquement lors de la fonction `showGame()`.

### 3. Spam des Modales d'Accueil et Navigation Vidéo
* **Contexte :** En quittant l'Easter Egg vidéo (`cnab-surprise.html`), l'utilisateur perdait la musique Spotify et devait se retaper l'intro d'anniversaire.
* **Correction :** 
  - La vidéo de surprise s'ouvre maintenant dans un nouvel onglet (`_blank`), gardant le hub et la musique vivants en fond.
  - L'intro kitsch est bloquée par un `sessionStorage.getItem('visited')`. Si la variable est présente, on saute directement au tableau de bord.
  - Pour compenser la disparition de la lettre d'amour initiale, un bouton "💌 Message" a été ajouté au Header global.

### 4. Leak de Mémoire "Matter.js"
* **Contexte :** Passer de Angry Stickers à Super Elif provoquait des ralentissements du navigateur à cause de l'accumulation d'événements.
* **Correction :** Création d'un standard de nettoyage via `container._cleanup()`. Lorsque `app.js` ferme un jeu, il vérifie si cette fonction existe. Pour Matter.js, elle exécute `Render.stop`, `Runner.stop`, `Engine.clear` et détruit les écouteurs de clics pour vider la RAM.
