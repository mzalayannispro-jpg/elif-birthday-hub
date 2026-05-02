# 🖼️ Elif Birthday Hub - Documentation des Assets

Ce document dresse l'inventaire complet des images utilisées dans le projet, en expliquant **pourquoi** elles sont là, dans **quel jeu** elles apparaissent, et pour **quel élément visuel** précis.

Grâce au script Node.js d'auto-génération (`update_assets.js`), toutes les images placées dans ces sous-dossiers sont automatiquement détectées, recensées dans `assets/assets_list.js`, et injectées aléatoirement et dynamiquement dans le code front-end des jeux.

---

## 🕹️ Actifs par Jeu (Layer 1)

### 👾 Space Invaders (`assets/space-invaders/`)
- **Utilisation :** Sprites des ennemis (les "invaders").
- **Élément :** Les vaisseaux extra-terrestres qui descendent vers le joueur.
- **Détails :** 
  - Les dossiers `Niveau 1` à `Niveau 4` contiennent les stickers WhatsApp personnels (ex: `STK-...webp`, `alien2.webp`).
  - Au lieu de tirer sur de simples pixels, le joueur tire sur des photos et stickers hilarants d'Elif ou de son entourage. Le moteur piochera des images différentes selon la difficulté du niveau.

### 🀄 Mahjong (`assets/mahjong/`)
- **Utilisation :** Faces des tuiles du plateau.
- **Élément :** Les blocs 3D cliquables.
- **Détails :** 
  - Contient `STK-...webp`, `ataturk_8bit...png`, `meme3.jpg`, `baklava.png`.
  - Le moteur de jeu sélectionne dynamiquement des paires d'images issues de ce dossier pour générer un plateau unique à chaque partie.

### 🔢 Sudoku (`assets/sudoku/`)
- **Utilisation :** Récompenses ou thématiques visuelles du Sudoku.
- **Élément :** Fond de grille ou écrans de victoire.
- **Détails :** 
  - Contient `win.webp` (affiché lors d'une victoire) et d'autres images ou stickers personnels. Bien que le Sudoku utilise actuellement des "Punchlines" textuelles (grâce au fichier `Hr Punchlines.txt`), ces assets peuvent être utilisés en fond de case ou pour un futur mode "Picture Sudoku".

### 🧱 Tetris (`assets/tetris/`)
- **Utilisation :** Textures des pièces de Tetris (Tétrominos).
- **Élément :** L'intérieur de chaque bloc qui tombe.
- **Détails :** 
  - Le dossier est divisé en sous-dossiers correspondant aux formes de Tetris (`I`, `J`, `L`, `O`, `S`, `T`, `Z`).
  - Chaque pièce géométrique est remplie avec un sticker aléatoire issu de son dossier respectif (ex: `real_baklava.png`, `meme2.jpg`), rendant la grille de Tetris chaotique, drôle et ultra-personnalisée.

### 🪓 Uzinagaz / Lancer de Hache (`assets/lancer-hache/`)
- **Utilisation :** Cibles, décor et projectiles du jeu de timing.
- **Élément :** Les objets qui bougent à l'écran et la hache du joueur.
- **Détails :** 
  - Les stickers (ex: `STK-...webp`) servent de cibles mouvantes ou de "visages" à atteindre.
  - `axe.png` : Le sprite du projectile (la hache).
  - `uzinagaz_body.png` et `wooden_dummy.png` : Les éléments de décor / le corps du mannequin d'entraînement sur lequel on lance.

---

## 🖼️ Interface Globale (Hub & Dashboard)

### 🌟 Collage d'Introduction (`assets/intro/`)
- **Utilisation :** Animation d'arrière-plan du Dashboard.
- **Élément :** La div `#dashboard-collage`.
- **Détails :** 
  - C'est une collection massive de plus de 50 stickers (`STK-...webp`, `turkish_flag_8bit.png`, etc.).
  - Le script `app.js` pioche aléatoirement dans ce dossier (via `assets_list.js`) pour instancier des images flottantes (qui tournent et rebondissent) en fond d'écran sur le menu principal, créant un effet "abondance" voulu pour le thème Kitsch.

### 🎨 Thème Kitsch Turc & UI
- **`rug.png` / `persian_rug_bg.png` / `persian_rug_collage.png` / `carpet.png`**
  - **Utilisation :** Arrière-plans principaux de l'application.
  - **Élément :** Le `body` HTML, l'overlay d'entrée, et en texture de fond "semi-transparente" pour les boutons géants des jeux (Layer 1 et 2). Essentiel pour la direction artistique "Kitsch des années 70".
- **`turkish_bg.png` / `ornament.png`**
  - **Utilisation :** Décorations des bordures et modales.
  - **Élément :** Agrémente la bordure de la modale du message personnel d'anniversaire (`#personal-modal`) et les pop-ups de statut.

---

## 🍄 Layer 2 (Jeux Avancés - Plateforme)

- **`green_tracksuit.png`**
  - **Utilisation :** Sprite principal du joueur dans le jeu **Super Elif** (le clone de Mario).
  - **Élément :** Le personnage contrôlable par les flèches directionnelles.
  - **Détails :** Remplace le sprite classique de Mario pour donner une identité "Elif" unique au personnage lorsqu'il court ou saute.

- **`real_baklava.png`**
  - **Utilisation :** Power-up dans **Super Elif**.
  - **Élément :** L'objet sortant des blocs mystères.
  - **Détails :** Il remplace le traditionnel "Champignon rouge" de Mario. Ramasser le Baklava transforme le personnage (le fait grandir) et lui octroie des points bonus.

---

## 🎵 Assets Techniques & Audios
- **`Özdemir Erdoğan - Gurbet.mp3`**
  - **Utilisation :** Fichier audio musical de secours.
  - **Détails :** Historiquement utilisé comme musique de fond locale. Il a été remplacé par l'iframe Spotify (plus robuste et proposant une playlist complète), mais l'asset est conservé comme "fallback" si besoin de jouer l'audio sans connexion internet externe.

- **`Hr Punchlines.txt`**
  - **Utilisation :** Fichier source de données textuelles brutes.
  - **Détails :** Contient la longue liste des blagues, anecdotes, et "inside jokes" qui sont parsées et injectées dynamiquement dans la grille du jeu Sudoku pour remplacer les simples chiffres.
