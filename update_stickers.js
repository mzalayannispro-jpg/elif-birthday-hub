const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const outputFile = path.join(assetsDir, 'assets_list.js');

const foldersToScan = ['tetris', 'mahjong', 'space-invaders', 'sudoku', 'lancer-hache', 'intro'];

// Walk directory recursively
function walkSync(dir, filelist = []) {
    if (!fs.existsSync(dir)) return filelist;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkSync(filepath, filelist);
        } else {
            if (/\.(png|jpe?g|webp|gif)$/i.test(file)) {
                // get path relative to the assets folder, replace backslashes with forward slashes
                const relPath = path.relative(assetsDir, filepath).replace(/\\/g, '/');
                filelist.push(relPath);
            }
        }
    }
    return filelist;
}

let jsContent = `// Fichier généré automatiquement via update_stickers.bat\n\n`;
jsContent += `window.GAME_ASSETS = {\n`;

let allImagesSet = new Set();

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
            
            const files = walkSync(shapeDir);
            tetrisObj[shape] = files.map(f => `"assets/${f}"`);
            files.forEach(f => allImagesSet.add(`"assets/${f}"`));
        });
        
        jsContent += `  "${folder}": {\n`;
        let shapeEntries = [];
        for (let shape in tetrisObj) {
            shapeEntries.push(`    "${shape}": [\n      ${tetrisObj[shape].join(',\n      ')}\n    ]`);
        }
        jsContent += shapeEntries.join(',\n') + `\n  }`;
    } else {
        const files = walkSync(folderPath);
        const relativePaths = files.map(f => `"assets/${f}"`);
        files.forEach(f => allImagesSet.add(`"assets/${f}"`));
        jsContent += `  "${folder}": [\n    ${relativePaths.join(',\n    ')}\n  ]`;
    }
    
    if (index < foldersToScan.length - 1) jsContent += ',\n';
    else jsContent += '\n';
});

jsContent += `};\n\n`;

// Appending all loose assets in the root of the 'assets' directory as well
const rootFiles = fs.readdirSync(assetsDir);
for (const file of rootFiles) {
    const filepath = path.join(assetsDir, file);
    if (!fs.statSync(filepath).isDirectory()) {
         if (/\.(png|jpe?g|webp|gif)$/i.test(file)) {
             allImagesSet.add(`"assets/${file}"`);
         }
    }
}

// Generate the global ALL_COLLAGE_IMGS array and append it
jsContent += `window.ALL_COLLAGE_IMGS = [\n  ${Array.from(allImagesSet).join(',\n  ')}\n];\n`;

fs.writeFileSync(outputFile, jsContent);
console.log('✅ assets_list.js généré avec succès ! (Mode récursif activé) Le site est à jour.');
