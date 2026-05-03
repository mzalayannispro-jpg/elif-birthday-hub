# 🖼️ Elif Birthday Hub - Documentation Détaillée des Assets

Ce document dresse l'inventaire complet des images, stickers et ressources graphiques utilisés pour le projet, ainsi que leur intégration dynamique dans l'architecture du site. Le projet contient plusieurs centaines de stickers injectés automatiquement via `assets_list.js`.

---

## 🏗️ L'Asset Manager Dynamique

Afin de ne pas avoir à écrire en dur des centaines de chemins d'images dans le code (et éviter les ralentissements), le projet utilise un script local Node.js (`update_stickers.js`). 
Ce script scanne récursivement les dossiers du répertoire `assets/`, filtre les images, et génère un fichier JSON formaté : `assets/assets_list.js`. Ce fichier crée des tableaux globaux (`window.IMAGES_COLLAGE`, `window.IMAGES_SUDOKU`, etc.) qui sont ensuite exploités par la logique des jeux.

*Note : Les images animées (.gif ou WebP animés) ont été sciemment retirées du pool du background Collage pour optimiser les performances (RAM et CPU) sur les appareils mobiles.*

---

## 🎨 Interface Globale & UI (Statiques)
Ces éléments fondent l'esthétique générale "Kitsch 70s" du Hub.

| Nom de l'image | Emplacement | Utilisation / Rôle |
|---|---|---|
| `persian_rug_bg.png` | `assets/` | Motif répétitif global pour le body HTML. |
| `rug.png` | `assets/` | Texture principale des cartes des jeux et boutons Layer. |
| `ornament.png` | `assets/` | Ornementation dorée séparant les sections du tableau de bord. |
| `turkish_bg.png` | `assets/` | Fond des fenêtres d'information (Instructions, Easter Egg). |
| `win.webp` / `lose.webp` | `assets/` | Écrans génériques de victoire et de Game Over. |
| **Portes Magiques** | `assets/Landing page/` | Stickers clignotants apparaissant lorsque le palier de score est atteint (3k, 6k, 12k). |

---

## 🕹️ Layer 1 : Les Jeux Classiques

### 🧱 Tetris (Tétrominos)
Chaque sous-dossier correspond à une forme géométrique. Le jeu tire aléatoirement une image du sous-dossier correspondant à la forme générée.
- **I, J, L, O, S, T, Z** : Chaque forme possède son propre pool d'images (`assets/tetris/`). Les images sont compressées dynamiquement dans les conteneurs de blocs sans teinte superposée.

### 🀄 Mahjong Solitaire
Les tuiles de Mahjong utilisent des visuels "stickers" en 3D projetée isométrique.
- Pool : `assets/mahjong/`
- Exemple : `ataturk_8bit_1776606444568.png`, `baklava.png`.

### 👾 Coskun Invaders (Space Invaders)
Les ennemis classiques sont remplacés par des rangées de stickers.
- Pool : `assets/space-invaders/` divisé en sous-dossiers (Niveau 1, 2, 3, 4) modifiant l'apparence des vaisseaux aliens.

### 🔢 Sudoku
Le jeu original affichait des numéros. Il a été refondu pour afficher des images "Inside Jokes" pour les cases fixes et un système de punchlines de texte pour la victoire.
- Pool Backgrounds : `assets/sudoku/` (Utilisés en arrière-plan d'interface de la grille).

### 🪓 Uzinagaz (Lancer de Hache)
Un jeu de timing (Roue de la Mort) où le joueur doit lancer des haches.
- `assets/lancer-hache/` : Cibles mouvantes et têtes d'ennemis.
- `assets/uzinagaz_body.png` : Corps du mannequin cible en slip tigre.
- `assets/axe.png` : Le projectile.

---

## ⚙️ Layer 2 : Les Moteurs Open Source (2D Avancé)

Le Layer 2 abandonne les logiques "fait-maison" simples pour exploiter de véritables moteurs de jeux Open Source, personnalisés avec les assets du projet.

### 🍄 Super Elif (Moteur : Tiny Platformer)
Jeu basé sur une grille (Tile Engine) avec de réelles collisions mathématiques (AABB).
| Nom du Rôle | Nom de l'image | Emplacement |
|---|---|---|
| **Joueur (Base)** | `STK-20240715-WA0003...` | `assets/` |
| **Joueur (Petit)** | `STK-20241217-WA0053...` | `assets/` |
| **Ennemis (Patrouille)** | Tortue / Lanceur de Hache | `assets/` |
| **Power-up** | `real_baklava.png` | Fait grandir le personnage. |

### 🐦 Angry Stickers (Moteur : Matter.js)
Jeu de destruction de structures exploitant un vrai moteur de physique (collisions rigides, inertie, contrainte d'élastique).
| Nom du Rôle | Nom de l'image | Logique & Emplacement |
|---|---|---|
| **Oiseau (Projectile)** | `STK-20241217-WA0053...` | Corps sphérique lourd dans Matter.js |
| **Cibles (Ennemis)** | Dynamique (`assets/space-invaders/`) | Corps ronds placés au sein de la pyramide de blocs rectangulaires générée procéduralement. |

### 🏰 Tower Defense (Moteur : Grid TD)
Le jeu de stratégie utilise des tuiles de 50x50 pixels. Le moteur gère les projectiles, le cooldown, et le pathfinding de type "Snake" des ennemis.
| Nom du Rôle | Nom de l'image | Utilisation |
|---|---|---|
| **Tourelle Normale** | `STK-20240715-WA0003...` | Faibles dégâts, cadence rapide. |
| **Tourelle Sniper** | `OwnSticker_20251010...` | Dégâts massifs, portée longue. |
| **Ennemi Rapide** | `STK-20241108-WA0000.webp` | Progression de 2 pixels par frame. |
| **Ennemi Boss** | `OwnSticker_20240322...` | Résistance accrue (Multiplicateur HP x3). |
