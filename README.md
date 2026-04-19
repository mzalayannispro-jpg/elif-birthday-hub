# Elif Birthday Hub 🌙

Un site d'anniversaire personnalisé avec fond de tapis turc 70s kitsch pour ma chérie.

## 🎮 Les Jeux

- **👾 Space Invaders** — version personnalisée avec vos photos comme personnages
- **🀄 Mahjong Solitaire** — trouvez les paires de stickers
- **🔢 Sudoku** — générateur infini avec des petites phrases d'amour

## ✨ Fonctionnalités

- Overlay d'entrée kitsch avec texte clignotant en turc
- Message personnel personnalisable dans la modal
- Fond de tapis turc 70s psychédélique avec Hagia Sophia, nazar boncuğu, baklavas, tulipes...
- **Score global persistant** — chaque partie gagnée contribue à débloquer la surprise
- **Easter Egg** à 4000 pts — une surprise spéciale se révèle !
- Onglet Souvenirs avec cadres polaroid pour vos photos

## 🗂️ Structure

```
anniversaire-copine/
├── index.html          # Structure principale
├── style.css           # Thème kitsch turc 70s
├── app.js              # Navigation + score global
├── assets/
│   ├── turkish_bg.png  # Fond tapis turc (généré)
│   ├── rug.png         # Fond alternatif
│   ├── meme1-4.jpg     # Vos photos (à remplacer !)
│   ├── player.webp     # Personnage joueur
│   ├── win.webp        # Image victoire
│   └── lose.webp       # Image défaite
└── games/
    ├── space_invaders.js
    ├── mahjong.js
    └── sudoku.js
```

## 📸 À Personnaliser

1. Remplacez `assets/meme1.jpg` à `meme4.jpg` par vos vraies photos
2. Éditez le message dans `index.html` (ligne ~32, dans la `<div class="modal-content">`)
3. Ajoutez vos photos dans les polaroids (section Souvenirs)
4. Remplacez le placeholder de la vidéo surprise dans `app.js` (fonction `revealSurprise`)

## 🚀 Déploiement

Ce site est 100% statique — compatible avec Cloudflare Pages, GitHub Pages, ou tout CDN.
