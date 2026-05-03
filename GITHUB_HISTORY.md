# 📜 Historique GitHub du Projet (Elif Multiverse)

Ce document retrace l'intégralité de notre travail, des bugs rencontrés et des résolutions poussées sur le dépôt GitHub `main`, de la création du projet jusqu'à aujourd'hui.

---

## 🛠️ Mai 2026 : Phase 2 & Polissage des Moteurs Avancés

### 03 Mai 2026 - Correctifs Critiques de Physique et Rendu (Layer 2)
* **fix: resolve tunneling and spawn collision in mario (407c029)**
  - *Symptôme :* "Le jeu apparaît, je tombe et je meurs instantanément."
  - *Cause 1 (Tunneling) :* La constante `MAXDY` (vitesse de chute max) était si grande que le joueur "sautait" par-dessus la grille du sol (Collision `cell_curr` évaluée vraie trop tard).
  - *Solution 1 :* Réduction de `MAXDY` de `METER * 60` à `METER * 30`.
  - *Cause 2 (Spawn Collision) :* Les ennemis apparaissaient trop près du point de chute initial du joueur (x=2), le tuant en plein vol.
  - *Solution 2 :* Décalage de la génération des plateformes à `x=10`.
* **fix: set fixed height 80vh for layer 2 game containers (5ea6660)**
  - *Symptôme :* Le jeu s'affichait comme une fine bande horizontale quasi invisible.
  - *Cause :* Le conteneur HTML global `game-slot` dépendait du contenu (`height: 100%` en cascade renvoyait 0px).
  - *Solution :* Passage à `height: 80vh; min-height: 500px;` pour forcer l'expansion du conteneur et corriger le calcul de hauteur de caméra.
* **fix: adjust mario camera scaling and death bounds (78d0f2f)**
  - Correction de l'échelle (`ctx.scale`) pour forcer l'affichage entier de la carte (600px) indépendamment de la résolution de l'écran.
* **feat: complete rewrite of layer 2 games using open source engines (ffafa9d)**
  - **Mario :** Remplacement de la physique flottante par une grille physique Tile-Based stricte.
  - **Angry Birds :** Implémentation du moteur professionnel `Matter.js` pour une physique vectorielle rigide (Slingshot + Blocs destructibles).
  - **Tower Defense :** Passage d'un code spaghetti à une structure `victorqribeiro/towerDefense` (grille matricielle, vagues manuelles).

### 02 Mai 2026 - Stabilisation et Audit Moteurs de Jeux (Layer 2)
* **fix: layer 2 games appearing empty (607fbcb)** - Résolution du cache et `display: flex`.
* **feat: ajout du systeme multi-niveaux et animation porte magique (196423d)**
* **fix: UI navigation state (7e28f41)** - Empêcher la modale d'intro de réapparaître au retour de la vidéo Easter Egg.
* **feat: bouton Message (4d30241)** - Possibilité de rouvrir la lettre d'amour sans recharger le site.

## 🚀 Avril 2026 : Phase 1 - Fondation du Projet "Anniversaire Copine"

### 25-27 Avril 2026 - Sauvegarde, Easter Eggs et Polishing Kitsch
* **feat: Add Magic Door, Save Code system, and Spotify integration (39602a7)**
  - Création du système de sauvegarde multi-devices par code généré (chiffrement par score `ELIF-SCORE-XYZ`).
* **feat(i18n): update modal text with personal letter (8472d24)**
* **fix(sudoku): remove all auto-generated French quotes (bdadb2c)**
  - Remplacement intégral des textes par défaut par des punchlines privées ("inside jokes").
* **fix(assets): rewrite update_stickers.js (5840563)**
  - Scannage récursif pour générer dynamiquement `assets_list.js`, permettant un scaling facile du nombre d'images.

### 19-22 Avril 2026 - Création du Layer 1 (Jeux Classiques)
* **feat: rename -> Askam Invaders + KillorNot (3c0b74c)**
* **perf: collage - 190 static imgs hardcoded, no GIFs (2ce92f4)**
  - Exclusion des WebP animés pour éviter les crashs de RAM sur mobile. Rendu via `DocumentFragment`.
* **feat: Uzinagaz (Lancer de Hache) (489d637)**
  - Intégration de la "Roue de la Mort" avec le sprite du corps humain en slip kangourou.
* **feat: Tetris ghost piece, Wall Kicks, strict outer contours (b28cbd2)**
* **19 Avril 2026 (c84cf07)** - 🌙 Initial commit - Elif Birthday Hub (Turkish Kitsch 70s theme)
