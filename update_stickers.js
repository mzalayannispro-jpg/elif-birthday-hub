const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const outputFile = path.join(assetsDir, 'assets_list.js');

const foldersToScan = ['tetris', 'mahjong', 'space-invaders', 'sudoku', 'lancer-hache'];

let jsContent = `// Fichier généré automatiquement via update_stickers.bat\n\n`;
jsContent += `window.GAME_ASSETS = {\n`;

foldersToScan.forEach((folder, index) => {
    const folderPath = path.join(assetsDir, folder);
    let files = [];
    if (fs.existsSync(folderPath)) {
        files = fs.readdirSync(folderPath).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
    } else {
        fs.mkdirSync(folderPath);
    }
    
    const relativePaths = files.map(f => `"assets/${folder}/${f}"`);
    jsContent += `  "${folder}": [\n    ${relativePaths.join(',\n    ')}\n  ]`;
    if (index < foldersToScan.length - 1) jsContent += ',\n';
    else jsContent += '\n';
});

jsContent += `};\n`;

fs.writeFileSync(outputFile, jsContent);
console.log('✅ assets_list.js généré avec succès ! Le site est à jour.');
