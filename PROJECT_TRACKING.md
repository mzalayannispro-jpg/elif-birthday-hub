# 🌙 Elif Birthday Hub - Master Project Tracking & Technical Narrative

*Document conçu spécifiquement pour l'ingestion par des IA d'analyse (ex: NotebookLM). Ce fichier contient l'historique exhaustif, conversationnel et technique de la création de l'Elif Birthday Hub.*

---

## 📖 1. Genèse du Projet et Vision Esthétique (19 Avril 2026)

Le projet "Anniversaire Copine" a débuté avec l'objectif de créer un espace virtuel unique, surprenant et rempli de clins d'œil intimes ("inside jokes") pour l'anniversaire d'Elif. 

### Choix Directionnels :
1. **Le Thème "Turkish 70s Kitsch" :** Au lieu d'un design moderne asceptisé, le hub devait être volontairement kitsch, chaleureux et rétro. Cela s'est traduit par l'utilisation de tapis persans en fond d'écran (`persian_rug_bg.png`), de couleurs saturées (or, rouge bordeaux, sarcelle/teal), de polices d'écriture comme *Cinzel Decorative* (pour le côté dramatique) et *Outfit* (pour la lisibilité), ainsi que de bordures dorées épaisses (`border: 3px solid var(--gold)`).
2. **L'Approche Vanilla Statique :** Décision technique fondamentale de ne pas utiliser de framework (ni React, ni Next.js, ni bundler type Webpack). Le projet devait rester un simple dossier de fichiers HTML/CSS/JS pouvant être hébergé facilement et gratuitement (via GitHub Pages ou Cloudflare Pages), garantissant une exécution immédiate sans temps de compilation.
3. **Le Concept des Stickers :** Remplacer les assets classiques des jeux vidéos par des "stickers" personnels (photos détourées, mèmes, visages). Pour ce faire, nous avons dû concevoir un système capable de charger dynamiquement des centaines d'images sans les lister manuellement dans le code.

---

## 🏗️ 2. Architecture et Outils Créés (Avril 2026)

### L'Asset Manager (`update_stickers.js`)
Pour gérer les centaines de stickers sans saturer le fichier `app.js` de variables en dur, nous avons créé un script Node.js. 
- **Comment il fonctionne :** Il utilise la bibliothèque native `fs` (File System) pour parcourir récursivement les répertoires dans `/assets`. Il identifie les dossiers (`/tetris`, `/space-invaders`, `/sudoku`) et génère un fichier `/assets/assets_list.js`. 
- **Résultat :** Ce fichier JSON expose des variables globales comme `window.IMAGES_COLLAGE` qui sont ensuite consommées par les jeux. 
- **Optimisation Critique :** Le 20 avril, nous avons réalisé que le chargement de GIFs ou de WebP animés en fond d'écran faisait s'effondrer la RAM des téléphones portables. Le script a été modifié pour filtrer et exclure systématiquement les images animées du "Collage" en arrière-plan.

### La State Machine UI (`app.js`)
Le routage du projet ne fonctionne pas par changement de pages HTML. Tout se passe dans `index.html`.
- **Mécanisme :** `app.js` agit comme un routeur primitif. La fonction `showGame(gameId)` vide le conteneur `<div id="game-slot">`, masque le dashboard (`display: none`), et exécute la fonction d'initialisation du jeu ciblé (ex: `window.initMario(slot)`).
- **Cleanup :** Pour éviter les fuites de mémoire (Memory Leaks), chaque jeu doit attacher une fonction `container._cleanup = function() { ... }` avant de fermer, supprimant ainsi les `requestAnimationFrame` et les `EventListeners`.

---

## 🎮 3. Phase 1 : Les Jeux Classiques "Layer 1" (19 - 25 Avril)

1. **Space Invaders (Coskun Invaders) :** 
   - Modification d'un moteur de grille pour accepter des stickers à la place des vaisseaux.
   - *Bug Résolu :* Problème de contrôles tactiles sur iPad. Résolu en attachant des écouteurs `touchstart`/`touchend` qui simulent la pression des flèches gauche/droite.
2. **Mahjong Solitaire :**
   - Remplacement des symboles asiatiques par des tuiles en 3D projetant des photos d'Atatürk et d'Elif.
   - *Bug Résolu :* Les tuiles se chevauchaient mal. La logique CSS `z-index` a été recalibrée mathématiquement en fonction de la couche (`layer`) et de la ligne (`row`).
3. **Sudoku "Punchlines" :**
   - Élimination complète de tous les textes par défaut en français et remplacement par des tableaux de citations privées, affichées lors de la victoire.
4. **Uzinagaz (Lanceur de Hache) :**
   - Création de la "Roue de la Mort" où le joueur doit lancer une hache `axe.png` sur le corps d'un mannequin en slip kangourou. Mouvement de pendule implémenté via des courbes de Lissajous.

---

## 🔑 4. La Progression et la Persistance (26 - 30 Avril)

### Le Score Global
Chaque action réussie dans un jeu déclenche `window.addGlobalScore(points)`. Le score est immédiatement sauvegardé dans le `localStorage` du navigateur du joueur.

### Le Sauvetage Cross-Device (Save/Load)
Puisque le site n'a pas de base de données (backend), la progression devait quand même être transférable d'un PC à un iPad.
- **Logique de Chiffrement :** Le bouton "Save" multiplie le score par `7` et l'encapsule dans une chaîne : `ELIF-[Score*7]-[HashAléatoire]`.
- **Logique de Déchiffrement :** Le bouton "Load" parse cette chaîne via regex, divise par `7`, et si le résultat est un nombre entier cohérent, écrase le `localStorage` avec le nouveau score.

### L'Évolution par Palier (Les Portes Magiques)
- **3000 points :** L'UI réagit. Une animation avec le sticker `OwnSticker_20240417_210104701.png.jpg` clignote pour teaser la "Magic Door".
- **6000 points :** Déblocage officiel du **Layer 2**. Apparition de 3 nouveaux jeux et de la page vidéo surprise (`cnab-surprise.html`).

---

## ⚙️ 5. Phase 2 : Le Refactoring Majeur "Layer 2" (Début Mai 2026)

Le 2 et 3 mai 2026, décision radicale d'abandonner les moteurs physiques "maisons" obsolètes du Layer 2 pour des standards open source, tout en préservant le code statique.

### L'UI Mobile Unifiée (Overlay Global)
Au lieu d'écrire des boutons de contrôles tactiles dans les 3 fichiers JavaScript des jeux du Layer 2, un `<div id="layer2-ui-overlay">` a été injecté directement dans `index.html`. Ce contrôleur global "flotte" au-dessus du jeu actif et modifie des variables d'état globales (`left`, `right`, `jump`). C'est le triomphe de la séparation des préoccupations (Separation of Concerns).

### Moteur 1 : Angry Stickers (Matter.js)
- **Le Changement :** Intégration de `matter.min.js` (V0.19.0) via CDN.
- **L'Implémentation :** Création d'une `MouseConstraint` pour simuler le lance-pierre (élastique de tension). Génération procédurale d'une pyramide de `Bodies.rectangle` (blocs) contenant les ennemis. 
- **Tuning :** La densité (`density`) des ennemis a été augmentée pour qu'ils soient satisfaisants à écraser.

### Moteur 2 : Tower Defense (Grid TD)
- **Le Changement :** Implémentation basée sur l'algorithme `victorqribeiro/towerDefense`.
- **L'Implémentation :** La carte n'est plus aléatoire. Elle est dessinée via une matrice bidimensionnelle (0 = zone constructible, 1 = chemin). 
- **Ajout Majeur :** Ajout d'une interface de construction permettant au joueur de choisir entre dépenser 100💰 pour une tour normale ou 150💰 pour un Sniper. Le bouton manuel "Start Wave" donne le contrôle du rythme au joueur.

### Moteur 3 : Super Elif (Tiny Platformer)
- **Le Changement :** Remplacement de la physique flottante chaotique par une grille AABB (Axis-Aligned Bounding Box) inspirée de `tiny-platformer`. Le sol, les murs et les trous sont parfaitement alignés sur une grille mathématique de 50x50 pixels.

---

## 🐛 6. Post-Mortem Technique : La Tempête Parfaite du 3 Mai 2026

Le bug le plus complexe du projet a eu lieu sur le jeu Mario (Super Elif) le 3 mai, entraînant un Game Over instantané dès l'ouverture du jeu, caractérisé par le message *"Oups ! Tu es tombé !"*.

**Analyse complète pour NotebookLM :** Ce crash n'était pas dû à une seule erreur, mais à la conjonction parfaite de 3 failles distinctes s'activant exactement à la même milliseconde.

1. **Le Bug CSS du Conteneur (La Ligne de Vie Écrasée) :**
   Le canvas du jeu avait la propriété `height: 100%`. Or, le composant parent injecté via `app.js` (`#game-slot`) n'avait pas de hauteur explicite définie. Le navigateur interprétait donc cette hauteur comme `0px`. Le jeu pensait que l'écran s'arrêtait à `y=0`, et exécutait la mort du personnage car le sol généré à `y=500` était techniquement en dehors des limites d'affichage.
   *Correctif : Forçage du CSS via `height: 80vh; min-height: 500px;`.*

2. **Le Phénomène de Tunneling (Bullet Through Paper) :**
   Même après avoir affiché le sol, le personnage passait toujours au travers. Dans le code physique de la boucle `loop()`, la gravité accélérait le personnage jusqu'à une limite `MAXDY` (définie à `METER * 60 = 3000 pixels/seconde`). À 60 frames par seconde, cela signifiait que le personnage parcourait 50 pixels *par frame*.
   La grille du sol faisant exactement 50 pixels d'épaisseur, à la frame N, le joueur était 1 pixel au-dessus du sol. À la frame N+1, il était 49 pixels *en-dessous* du sol. Le calcul de collision `cell_curr` testait la position exacte et retournait "vide", car l'impact avec la surface avait eu lieu *entre* les deux frames.
   *Correctif : Division par deux de la constante de vitesse terminale (`MAXDY = METER * 30`), empêchant le saut inter-spatial.*

3. **L'Assassinat Aléatoire au Spawn :**
   Même avec le sol solide, le joueur mourait encore 1 fois sur 10. Pourquoi ? L'algorithme de génération de carte générait aléatoirement des plateformes (et des ennemis) à partir de la coordonnée `x=5`. L'ennemi tombait sur le sol et marchait vers la gauche. Avec la nouvelle vitesse de chute du joueur, le joueur atterrissait sur le sol au bout de 0.63 secondes. Il se trouve que la distance entre `x=5` et le joueur à `x=2`, divisée par la vitesse de déplacement de l'ennemi (`MAXDX * 0.3`), donnait exactement... 0.60 secondes ! 
   L'ennemi s'incrustait dans la hitbox du joueur à la milliseconde de l'impact avec le sol. Comme le joueur touchait le sol et perdait sa vélocité de chute (`player.dy = 0`), l'algorithme "Est-ce qu'on saute sur la tête du monstre ?" s'annulait, donnant la victoire au monstre.
   *Correctif : Les plateformes et monstres sont désormais interdits d'apparition avant `x=10`.*

---

## 🔮 7. Phase Actuelle et Futur (Layer 3)

Le projet a désormais une architecture propre et résiliente, prête pour la couche expérimentale :
- Les fondations du système `cnab-surprise.html` (qui ne coupe plus Spotify grâce à l'usage ciblé de `window.open` et `window.close`) fonctionnent parfaitement.
- Prochaine étape : Implémenter le moteur 3D web pour "Counter Stickers".
