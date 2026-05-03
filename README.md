# Elif Birthday Hub 🌙

Un site d'anniversaire personnalisé avec fond de tapis turc 70s kitsch, conçu comme un hub interactif complet contenant plusieurs "Layers" (couches) de jeux et d'expériences. Ce hub sert de portail principal pour célébrer l'anniversaire d'Elif à travers des "private jokes", des stickers personnalisés, et une ambiance unique.

## 🎮 Le Système de Layers (Niveaux de Progression)

Le hub évolue sous forme de "Layers" débloquables grâce au score global accumulé par le joueur sur les différents jeux.

### Layer 1 (Les Classiques) - Débloqué par défaut
- **👾 Space Invaders (Coskun Invaders)** — Défendez la galaxie contre des têtes d'aliens et des stickers personnalisés.
- **🀄 Mahjong Solitaire** — Trouvez les paires de stickers dans une pile de tuiles en 3D.
- **🔢 Sudoku** — Remplissez la grille avec des mots doux et des punchlines au lieu de simples numéros.
- **🧱 Tetris** — Empilement classique de tétrominos (chaque bloc est une image personnelle).
- **🪓 Uzinagaz (Lancer de hache)** — Jeu de précision et de timing sur la Roue de la Mort.

### Layer 2 (Jeux Avancés) - Débloqué à 6000 points
*Cette couche utilise des moteurs de jeu Open Source robustes, intégrés directement dans le site statique Vanilla JS.*
- **🍄 Super Elif (Moteur : Tiny Platformer)** — Jeu de plateforme "Tile-Based" avec collisions AABB parfaites, 6 mondes de plus en plus longs, et un système de power-ups (Baklava) modifiant le sprite et la hitbox.
- **🐦 Angry Stickers (Moteur : Matter.js)** — Jeu de destruction basé sur une physique 2D réaliste (gravité, densité, friction) via `matter.min.js`.
- **🏰 Tower Defense (Moteur : victorqribeiro/towerDefense)** — Jeu de stratégie sur grille avec placement de tourelles (Standard et Sniper) et déclenchement manuel de vagues d'ennemis.

### Layer 3 (Expériences 3D) - Débloqué à 12000 points
- **🔫 Counter Stickers** — *En développement*. Prototype de jeu 3D utilisant des technologies web modernes.
- **🎁 Grand Cadeau** — Récompense finale accessible depuis le tableau de bord une fois le palier atteint.

## ✨ Fonctionnalités Architectures & UI

- **Zéro Framework JS (Vanilla Statique) :** Le projet est 100% statique (HTML/CSS/JS pur), sans npm build, sans React. Compatible directement avec Cloudflare Pages ou GitHub Pages.
- **Système d'Overlay Kitsch :** Message clignotant introductif (affiché une seule fois par session grâce à `sessionStorage`).
- **Asset Manager Dynamique :** Un script `assets_list.js` scanne récursivement les dossiers d'images pour injecter dynamiquement le contenu.
- **Internationalisation (i18n) :** Traduction complète du site à la volée (Anglais 🇬🇧 / Turc 🇹🇷) via `assets/i18n.js`.
- **Score Global Persistant (`localStorage`) :** Toutes les victoires synchronisent un score centralisé.
- **Sauvegarde Cross-Device :** Système de mots de passe cryptés (ex: `ELIF-42000-XYZ`) pour générer un code sur PC et le charger sur iPad.
- **Overlay Global Layer 2 :** Interface UI mutualisée pour les jeux du Layer 2 (Pause, Restart, Score, et D-Pad Mobile tactile) injectée dynamiquement au-dessus des Canvas.

## 🗂️ Structure du Dépôt

```
elif-birthday-hub/
├── index.html          # Structure racine, Modales, Overlay UI et Game Slots
├── style.css           # Thème CSS Kitsch Turc 70s, variables et animations
├── app.js              # State machine, i18n, router de jeux, gestion de sauvegarde
├── assets/             # Images, sprites, fonts et traductions (i18n.js, assets_list.js)
└── games/
    ├── layer1/         # Logique isolée pour les jeux de base (sudoku.js, tetris.js, etc.)
    ├── layer2/         # Moteurs complexes (mario.js, angry_birds.js, tower_defense.js)
    └── layer3/         # Scripts 3D (cs_clone.js)
```

## 🚀 Déploiement & Lancement Rapide

Pour lancer le jeu en local :
1. Ouvrez simplement `index.html` dans un navigateur web.
2. *Alternative recommandée :* Utilisez l'extension VSCode "Live Server" pour éviter les erreurs CORS liées au chargement d'images locales sur certains navigateurs stricts.

Ce site est automatiquement déployé via la branche `main` de GitHub.
