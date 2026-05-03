# Elif Birthday Hub 🌙
*Document d'architecture global.*

Un portail d'anniversaire hautement interactif, conçu en "Vanilla Web" (HTML/CSS/JS purs sans processus de build), fusionnant une esthétique rétro (Kitsch Turc 70s, Tapis persans) avec une architecture de jeu vidéo à progression multi-couches (Layers).

## 🧱 Philosophie du Code
L'idée maîtresse du code source est la **Légèreté Statique**. Il n'y a pas de base de données, pas de serveur Node en production, pas de bundlers (Webpack/Vite). Le site peut être lu directement depuis un dossier local en double-cliquant sur `index.html`.
- Le stockage s'appuie entièrement sur `localStorage`.
- Les scores et variables globales sont attachés à l'objet `window` (ex: `window.globalScore`).
- La manipulation du DOM (Document Object Model) se fait en natif (`document.getElementById`).

## 🗺️ Topologie des Layers (Le Chemin Critique)

Le concept psychologique du Hub est la découverte progressive. L'utilisateur commence avec des jeux simples et débloque des moteurs physiques complexes en accumulant du score.

### 🟢 Layer 1 : "L'Arcade de Base" (Score requis : 0)
Jeux basés sur des logiques algorithmiques simples.
1. **Coskun Invaders :** Modification du classique `Space Invaders`. Détection de collisions rectangle contre rectangle. Utilisation de Canvas 2D.
2. **Mahjong Solitaire :** Logique de paires et de profondeur Z (les tuiles masquées sont grisées). Algorithme de génération de pyramide.
3. **Sudoku :** Modèle MVC simple. Grille fixe, substitution des valeurs par des images (`assets_list.js`) et des punchlines (jokes).
4. **Tetris :** Moteur de pièces tournantes. Logique de "Wall Kicks" (décalage de la pièce si la rotation touche un mur). Ghost piece implémentée.
5. **Uzinagaz :** Logique temporelle (Timing). Hitbox rotative basée sur des fonctions trigonométriques complexes (Lissajous) pour le balancier du mannequin.

### 🟡 Layer 2 : "Les Moteurs Tiers" (Score requis : 6000)
À partir de ce palier, le code "artisanal" laisse place à des solutions Open Source professionnelles.
1. **Super Elif :** Utilise un système de Tilemap (grille). Le monde est un simple tableau d'entiers (1 = mur, 2 = ennemi). La physique utilise le concept de `AABB` (Axis-Aligned Bounding Box) pour gérer les collisions X et Y indépendamment.
2. **Angry Stickers :** Intégration de la bibliothèque externe `Matter.js`. Le jeu crée une instance d'un "World", injecte la gravité vectorielle, des "Constraint" (pour le lance-pierre) et des "Bodies" (pour les objets). La difficulté vient du nettoyage (`Engine.clear`) pour éviter les Memory Leaks en repassant au menu.
3. **Tower Defense :** Logique de `Pathfinding` figé. Les tours ont une "Range" (calcul radial de distance via le théorème de Pythagore par rapport aux ennemis) et instancient des projectiles qui suivent des vecteurs de vitesse.

### 🔴 Layer 3 : "L'Expérimentation" (Score requis : 12000)
- Destiné à héberger des expériences WebGL / 3D ou des cadeaux vidéo finaux. Le routage bloque tout accès à ces div tant que `localStorage.getItem('layer3Unlocked')` n'est pas activé.

## 🗃️ Indexation Dynamique des Ressources
Le composant le plus vital du projet est le script de pré-déploiement : **`update_stickers.js`**.
Étant donné la nature "Vanilla" du projet, il était impossible de lire dynamiquement les dossiers côté client (le navigateur n'ayant pas accès au file system local de l'utilisateur). 
Ce script Node doit être exécuté avant chaque déploiement. Il lit le dossier `/assets` et écrit en dur une constante JavaScript dans `assets_list.js`. Les jeux se nourrissent de ces tableaux pour piocher aléatoirement les skins des ennemis ou les textures du background collage.

## 🔐 Algorithmique de la Sauvegarde (Cross-Device)
Pour contourner l'absence de base de données backend :
- **SAVE :** L'utilisateur clique sur Sauvegarder. `app.js` prend le score (ex: 6000), le multiplie par une constante secrète `7` (soit 42000). Il génère une chaîne préfixée `ELIF-42000-[HashAléatoire]`. L'utilisateur la note.
- **LOAD :** L'utilisateur ouvre son iPad, tape le code. L'algorithme extrait la portion numérique via Expression Régulière (`/ELIF-(\d+)-/`), divise par `7`. Si `(42000 / 7) % 1 === 0` (c'est un entier), le code est valide. Le `localStorage` est réécrit avec `6000`. L'interface recharge les portes magiques.

## 🎨 Système UI Kitsch et State Machine
L'interface n'utilise qu'une seule page HTML. Les sections (Layer 1, Layer 2) sont des `<section>` qui reçoivent la classe `.hidden` (`display: none`) selon l'état.
Lorsqu'un jeu est lancé :
1. `#active-game-area` passe en `display: flex`.
2. `#game-slot` reçoit le code HTML du jeu (Canvas).
3. `#layer2-ui-overlay` est éventuellement activé par-dessus pour fournir le D-Pad tactile.
4. L'initialisation du Canvas écoute l'événement natif `window.resize` pour adapter ses proportions.
5. La fermeture (via la flèche retour) détruit le contenu de `#game-slot` et ré-affiche les menus.

*Dépôt GitHub synchronisé et utilisé comme Single Source of Truth.*
