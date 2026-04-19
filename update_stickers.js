const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const outputFile = path.join(assetsDir, 'assets_list.js');

const foldersToScan = ['tetris', 'mahjong', 'space-invaders', 'sudoku', 'lancer-hache'];

let jsContent = `// Fichier généré automatiquement via update_stickers.bat\n\n`;
jsContent += `window.GAME_ASSETS = {\n`;

foldersToScan.forEach((folder, index) => {
    const folderPath = path.join(assetsDir, folder);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
    
    if (folder === 'tetris') {
        const shapes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        let tetrisObj = {};
        
        shapes.forEach(shape => {
            const shapeDir = path.join(folderPath, shape);
            if (!fs.existsSync(shapeDir)) fs.mkdirSync(shapeDir);
            
            const files = fs.readdirSync(shapeDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
            tetrisObj[shape] = files.map(f => `"assets/tetris/${shape}/${f}"`);
        });
        
        jsContent += `  "${folder}": {\n`;
        let shapeEntries = [];
        for (let shape in tetrisObj) {
            shapeEntries.push(`    "${shape}": [\n      ${tetrisObj[shape].join(',\n      ')}\n    ]`);
        }
        jsContent += shapeEntries.join(',\n') + `\n  }`;
    } else {
        const files = fs.readdirSync(folderPath).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
        const relativePaths = files.map(f => `"assets/${folder}/${f}"`);
        jsContent += `  "${folder}": [\n    ${relativePaths.join(',\n    ')}\n  ]`;
    }
    
    if (index < foldersToScan.length - 1) jsContent += ',\n';
    else jsContent += '\n';
});

jsContent += `};\n`;

fs.writeFileSync(outputFile, jsContent);
console.log('✅ assets_list.js généré avec succès ! Le site est à jour.');
