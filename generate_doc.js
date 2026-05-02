const fs = require('fs');
const path = require('path');

// Execute the assets_list.js logic in memory
const assetsListContent = fs.readFileSync(path.join(__dirname, 'assets', 'assets_list.js'), 'utf8');
let GAME_ASSETS = {};
eval(assetsListContent.replace('window.GAME_ASSETS', 'GAME_ASSETS').replace('window.ALL_COLLAGE_IMGS = [', 'var ALL_COLLAGE_IMGS = ['));

let md = `# 🖼️ Elif Birthday Hub - Documentation Détaillée des Assets

Ce document liste **chaque image individuelle**, son emplacement exact et le rôle qu'elle joue dans l'interface et les jeux.

`;

function appendCategory(title, description, imageArray) {
    if (!imageArray || imageArray.length === 0) return;
    md += `## ${title}\n`;
    md += `${description}\n\n`;
    md += `| Nom de l'image | Emplacement Exact | Utilisation |\n`;
    md += `|---|---|---|\n`;
    imageArray.forEach(p => {
        const parts = p.split('/');
        const filename = parts[parts.length - 1];
        md += `| \`${filename}\` | \`${p}\` | Utilisé dans ${title.split(' ')[0]} |\n`;
    });
    md += `\n`;
}

// Tetris
md += `## 🧱 Tetris (Tétrominos)\n`;
md += `Chaque image remplit un bloc d'une forme géométrique spécifique.\n\n`;
md += `| Forme | Nom de l'image | Emplacement Exact |\n`;
md += `|---|---|---|\n`;
for (const [shape, arr] of Object.entries(GAME_ASSETS['tetris'] || {})) {
    arr.forEach(p => {
        const parts = p.split('/');
        const filename = parts[parts.length - 1];
        md += `| **${shape}** | \`${filename}\` | \`${p}\` |\n`;
    });
}
md += `\n`;

appendCategory('🀄 Mahjong', 'Images utilisées comme faces pour les tuiles du jeu.', GAME_ASSETS['mahjong']);
appendCategory('👾 Space Invaders', 'Stickers servant d\'ennemis descendant vers le joueur. (La difficulté détermine le sous-dossier).', GAME_ASSETS['space-invaders']);
appendCategory('🔢 Sudoku', 'Images de victoire ou arrière-plans pour les grilles.', GAME_ASSETS['sudoku']);
appendCategory('🪓 Lancer de Hache (Uzinagaz)', 'Cibles à atteindre avec la hache.', GAME_ASSETS['lancer-hache']);
appendCategory('🌟 Intro (Collage Dashboard)', 'Stickers flottants apparaissant en fond d\'écran sur le Hub principal.', GAME_ASSETS['intro']);

// Add static UI assets
md += `## 🎨 Interface Globale & UI (Statiques)\n`;
md += `Éléments fixes d'arrière-plan ou de sprites de jeu.\n\n`;
md += `| Nom de l'image | Emplacement Exact | Utilisation |\n`;
md += `|---|---|---|\n`;

const staticUI = [
    { file: "rug.png", path: "assets/rug.png", use: "Fond de l'overlay kitsch et boutons de Layer" },
    { file: "persian_rug_bg.png", path: "assets/persian_rug_bg.png", use: "Arrière-plan global du site (body HTML)" },
    { file: "persian_rug_collage.png", path: "assets/persian_rug_collage.png", use: "Fond du hub principal" },
    { file: "carpet.png", path: "assets/carpet.png", use: "Texture alternative de tapis" },
    { file: "turkish_bg.png", path: "assets/turkish_bg.png", use: "Texture pour l'intérieur de certaines modales" },
    { file: "ornament.png", path: "assets/ornament.png", use: "Ornementation UI" },
    { file: "player.webp", path: "assets/player.webp", use: "Sprite générique du joueur ou fallback" },
    { file: "axe.png", path: "assets/axe.png", use: "Projectile (hache) pour le jeu Uzinagaz" },
    { file: "uzinagaz_body.png", path: "assets/uzinagaz_body.png", use: "Corps du mannequin pour Uzinagaz" },
    { file: "wooden_dummy.png", path: "assets/wooden_dummy.png", use: "Décor de fond pour Uzinagaz" },
    { file: "green_tracksuit.png", path: "assets/green_tracksuit.png", use: "Sprite d'Elif (joueur) pour le jeu de plateforme Super Elif" },
    { file: "real_baklava.png", path: "assets/real_baklava.png", use: "Power-up 'Champignon' pour Super Elif" },
    { file: "win.webp", path: "assets/win.webp", use: "Écran de victoire générique" },
    { file: "lose.webp", path: "assets/lose.webp", use: "Écran de défaite générique" },
];

staticUI.forEach(s => {
    md += `| \`${s.file}\` | \`${s.path}\` | ${s.use} |\n`;
});
md += `\n`;

fs.writeFileSync(path.join(__dirname, 'ASSETS_DOCUMENTATION.md'), md, 'utf8');
console.log('Documentation generated successfully.');
