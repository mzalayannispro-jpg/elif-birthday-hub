# 🖼️ Elif Birthday Hub - Master Assets Documentation

*Document technique detailing exhaustif pour l'analyse IA (NotebookLM). Il répertorie la fonction, le format et l'interaction algorithmique de tous les fichiers visuels du projet.*

---

## 🏗️ 1. L'Asset Manager (Le Coeur du Système)
Le projet n'utilise pas d'outils modernes comme Webpack/Vite pour parser les assets.
Pour que le HTML/JS "connaisse" les centaines de stickers ajoutés dans les dossiers, un script d'indexation pré-déploiement est exécuté.
- **Script :** `update_stickers.js` (Node.js).
- **Logique :** Parcours récursif. Il lit `assets/tetris`, `assets/space-invaders`, etc.
- **Output :** Génération du fichier JavaScript `assets/assets_list.js`. Ce fichier associe des variables globales JavaScript (`window.IMAGES_COLLAGE`, `window.IMAGES_SPACE_INVADERS_LVL1`) à des tableaux massifs de strings (chemins relatifs).
- **Sécurité Mémoire :** Les images `.gif` et WebP animés sont explicitement ignorées du pool de Collage global pour préserver le CPU/RAM des appareils mobiles lors de la génération du fond de page en mosaïque.

---

## 🎨 2. Interface Utilisateur (Design System Global)
Les assets statiques gérant le thème "Turkish Kitsch 70s". Résolution native non modifiée.

| Nom du Fichier | Emplacement | Fonction Algorithmique & UI |
|---|---|---|
| `persian_rug_bg.png` | `/assets/` | Propriété CSS `background-image` globale appliquée au `body`. Définit le ton sombre/chaleureux du site. |
| `rug.png` | `/assets/` | Texture appliquée sur les `<button>` et les "Game Cards" (cartes de sélection de jeu) dans l'interface principale du Dashboard. |
| `ornament.png` | `/assets/` | Décoration filigrane dorée injectée entre les sections HTML du Layer 1, Layer 2 et Layer 3. |
| `turkish_bg.png` | `/assets/` | Arrière-plan pour l'écran modal d'Instructions (How to Play) et des Easter Eggs. |
| `win.webp` / `lose.webp` | `/assets/` | Images de Fallback globales gérées par `app.js` lors des modales de victoire ou de défaite des mini-jeux du Layer 1. |

---

## 🕹️ 3. Assets des Jeux Layer 1 (Logique Modulaire)

### A. Tetris (Système Multidossiers)
Les formes (Tétrominos) de Tetris ne sont pas dessinées en Canvas pur, mais "remplies" par des images recadrées (crop).
- **Architecture des assets :** Le script d'asset génère un objet `window.IMAGES_TETRIS` structuré par lettres : `I, J, L, O, S, T, Z`.
- **Rendu :** Lorsqu'une forme `Z` est générée en mémoire, le jeu tire un chemin aléatoire depuis le tableau `window.IMAGES_TETRIS['Z']` et l'applique comme texture de fond CSS à chaque bloc composant la forme.

### B. Coskun Invaders (Space Invaders)
Le jeu est découpé en difficulté croissante (Niveau 1 à 4).
- **Ennemis :** Le dossier `assets/space-invaders/` a des sous-dossiers. Chaque ligne d'aliens invoquée utilise les stickers d'un niveau spécifique, créant des visages de plus en plus drôles ou absurdes à mesure que le niveau avance.
- **Joueur :** Utilisait originellement `player.webp`.

### C. Uzinagaz (Lancer de Hache)
Le jeu nécessite des hitboxes précises (masques de collisions physiques).
- `assets/uzinagaz_body.png` : Le corps en slip tigre. Sa hitbox mathématique en Canvas (X,Y, Largeur, Hauteur) est calculée de façon stricte autour du torse, pour ignorer les bras.
- `assets/lancer-hache/` : Têtes flottantes attachées aux extrémités de la croix en rotation.

### D. Mahjong Solitaire & Sudoku
- **Mahjong :** Utilise `assets/mahjong/`. La texture isométrique de la tuile en 3D est combinée avec le sticker via CSS Grid ou position absolue.
- **Sudoku :** `assets/sudoku/` héberge les fonds d'écrans pour rendre la grille mathématique plus esthétique.

---

## ⚙️ 4. Assets des Moteurs Open Source (Layer 2)

Le Layer 2 abandonne la manipulation DOM pure pour des Canvas complexes. L'intégration des assets nécessite des ajustements mathématiques cruciaux.

### A. Super Elif (Le Tile Engine)
Basé sur une grille de blocs 50x50 pixels (`TILE = 50`).
- **Texture Sol/Mur :** Le Canvas utilise `ctx.fillRect()` avec des couleurs hexadécimales (Marron `#b5651d`, Stroke `#8b4513`) pour générer le terrain sans charger d'images lourdes, simulant un look rétro 8-bit.
- **Le Joueur :** `assets/STK-20240715-WA0003 - Copie.webp` et sa version "Petit".
  - *Ingénierie de la Hitbox :* Pour éviter que la transparence de l'image (les coins arrondis du visage) ne provoque des accrochages avec les murs, la largeur et hauteur physique (`w`, `h`) sont définies à `TILE * 0.8` (40px). L'image est dessinée en la centrant avec un offset (`ctx.drawImage(img, x, y, w, h)`).
- **Le Power-Up (Champignon) :** `assets/real_baklava.png`. Lorsqu'Elif touche le Baklava, la hitbox passe de `TILE * 0.8` à `TILE`, et l'image change.

### B. Angry Stickers (Le Moteur Physique Matter.js)
Le moteur gère la friction, la masse, et les inerties de façon vectorielle.
- **Le Projectile :** Créé via `Bodies.circle()`. L'image (`STK-20241217-WA0053...`) est injectée dans les propriétés `render.sprite.texture` du moteur Matter.js.
  - *Scale Correction :* Matter.js nécessite de redimensionner le sprite. Un calcul mathématique `scale = RayonDésiré / LargeurNativeImage` est exécuté lors de l'instanciation de l'oiseau pour qu'il s'emboîte parfaitement dans le cercle de collision.
- **Les Cibles :** Issues de `window.IMAGES_SPACE_INVADERS`. Générées sous forme de Body ronds, nichées dans des `Bodies.rectangle` (blocs de construction de la pyramide).

### C. Elif Tower Defense (Grid TD)
- **Rendu Matrice :** Le chemin ennemi (le sable) est tracé via une couleur transparente `rgba(255, 204, 153, 0.6)` parcourant une grille logique générée procéduralement.
- **Tourelle Normale :** `STK-20240715-WA0003...`. Le Canvas opère une rotation géométrique (`ctx.rotate(angle)`) calculée via l'`atan2` (Arc Tangente) entre les coordonnées de la tour et de l'ennemi.
- **Tourelle Sniper :** `OwnSticker_20251010_235740731.png.jpg` (Tour à forts dégâts, avec visuel d'Elif crachant du feu).

---

## ✨ 5. Overlays Globaux et Récompenses d'Étape (Layer 2 & 3)

Pour dynamiser le Hub, des stickers massifs apparaissent au milieu de l'écran lors d'événements clés.
- **La Porte Magique (6000 Points) :** Déclenchée via manipulation du DOM par `app.js`. Les stickers `OwnSticker_20240417_210104701.png.jpg` et `9c08de24-fc9a-4106-8483-430a0f546023.webp` jaillissent des côtés avec une animation CSS `@keyframes slide-in`.
- **Le Grand Cadeau (12000 Points) :** L'overlay `grand-gift-overlay` affiche les assets finaux `STK-20251113-WA0023.webp` pour célébrer l'accès au Layer 3 expérimental.
