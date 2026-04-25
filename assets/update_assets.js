const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const outputJsonPath = path.join(rootDir, 'assets.json');

const directories = [
    'Niveau 1',
    'Niveau 2',
    'Niveau 3',
    'Niveau 4',
    'Landing page'
];

const punchlinesFile = path.join(rootDir, 'Hr Punchlines.txt');

const assets = {
    levels: {},
    landingPage: [],
    punchlines: []
};

// Ensure directories exist, then read them
directories.forEach(dirName => {
    const dirPath = path.join(rootDir, dirName);
    let files = [];
    
    if (fs.existsSync(dirPath)) {
        try {
            files = fs.readdirSync(dirPath).filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
            });
        } catch (e) {
            console.error(`Error reading directory ${dirName}:`, e);
        }
    } else {
        // Create if missing to avoid future errors
        fs.mkdirSync(dirPath);
    }

    if (dirName.startsWith('Niveau')) {
        const levelNum = dirName.replace(/\D/g, ''); // Extract number
        assets.levels[levelNum] = files.map(f => `${dirName}/${f}`);
    } else if (dirName === 'Landing page') {
        assets.landingPage = files.map(f => `${dirName}/${f}`);
    }
});

// For Mahjong and wildcard fallbacks, collect everything!
assets.allStickers = [
    ...Object.values(assets.levels).flat(),
    ...assets.landingPage
];

// If allStickers is somehow empty, grab from generic stickers/ folder just in case
const stickersFallbackPath = path.join(rootDir, 'stickers');
if (fs.existsSync(stickersFallbackPath) && assets.allStickers.length === 0) {
    let files = fs.readdirSync(stickersFallbackPath).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
    });
    assets.allStickers = files.map(f => `stickers/${f}`);
    // Distribute into levels as fallback just to make things work for now
    assets.levels['1'] = assets.allStickers.slice(0, Math.ceil(assets.allStickers.length/4));
}

// Read Punchlines
if (fs.existsSync(punchlinesFile)) {
    try {
        const content = fs.readFileSync(punchlinesFile, 'utf8');
        const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        assets.punchlines = lines;
    } catch (e) {
        console.error('Error reading Hr Punchlines.txt:', e);
    }
} else {
    fs.writeFileSync(punchlinesFile, '');
}

fs.writeFileSync(outputJsonPath, JSON.stringify(assets, null, 2));
console.log('✅ assets.json successfully updated!');
