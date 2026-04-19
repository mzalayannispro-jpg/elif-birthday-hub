// app.js — Elif Birthday Hub
const SCORE_THRESHOLD = 4000;
const POINTS_PER_WIN = 100;

window.SUDOKU_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['sudoku'] && window.GAME_ASSETS['sudoku'].length > 0 ? window.GAME_ASSETS['sudoku'] : [];
window.NIVEAU_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['mahjong'] && window.GAME_ASSETS['mahjong'].length > 0 ? window.GAME_ASSETS['mahjong'] : ['assets/player.webp'];
window.ALL_SPACE_INVADER_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['space-invaders'] && window.GAME_ASSETS['space-invaders'].length > 0 ? window.GAME_ASSETS['space-invaders'] : ['assets/player.webp'];
window.TETRIS_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['tetris'] && window.GAME_ASSETS['tetris'].length > 0 ? window.GAME_ASSETS['tetris'] : ['assets/player.webp'];
window.HACHE_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['lancer-hache'] && window.GAME_ASSETS['lancer-hache'].length > 0 ? window.GAME_ASSETS['lancer-hache'] : ['assets/player.webp'];
let globalScore = parseInt(localStorage.getItem('elifScore') || '0', 10);

// ============ OVERLAY + MODAL FLOW ============
window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('kitsch-overlay');
    const modal = document.getElementById('personal-modal');
    const mainContent = document.getElementById('main-content');

    // Click anywhere on overlay → show modal
    overlay.addEventListener('click', () => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            modal.classList.add('visible');
        }, 600);
    });

    // Modal close button
    document.getElementById('close-modal').addEventListener('click', () => {
        revealDashboard(modal, mainContent);
    });

    // Modal CTA button
    const ctaBtn = document.getElementById('to-dashboard-btn');
    if (ctaBtn) ctaBtn.addEventListener('click', () => {
        revealDashboard(modal, mainContent);
    });

    updateScoreUI();
});

// ============ DASHBOARD COLLAGE EFFECT ============
document.addEventListener('DOMContentLoaded', () => {
    // Generates a random collage of provided stickers directly on the body
    setTimeout(() => {
        if (!window.GAME_ASSETS) return;
        const allStickers = [];
        for (let key in window.GAME_ASSETS) {
            allStickers.push(...window.GAME_ASSETS[key]);
        }
        if (allStickers.length === 0) return;
        
        const collageLayer = document.createElement('div');
        collageLayer.style.position = 'fixed';
        collageLayer.style.top = '0'; collageLayer.style.left = '0';
        collageLayer.style.width = '100%'; collageLayer.style.height = '100%';
        collageLayer.style.pointerEvents = 'none';
        collageLayer.style.zIndex = '-1'; 
        collageLayer.style.overflow = 'hidden';
        document.body.appendChild(collageLayer);
        
        // Add 20 random stickers
        for (let i = 0; i < 20; i++) {
            const img = document.createElement('img');
            img.src = allStickers[Math.floor(Math.random() * allStickers.length)];
            img.style.position = 'absolute';
            img.style.left = Math.random() * 90 + '%';
            img.style.top = Math.random() * 90 + '%';
            img.style.width = (Math.random() * 80 + 40) + 'px';
            img.style.transform = `rotate(${(Math.random() - 0.5) * 80}deg)`;
            img.style.opacity = '0.9';
            img.style.filter = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))';
            collageLayer.appendChild(img);
        }
    }, 500);
});

function revealDashboard(modal, main) {
    modal.classList.add('fade-out');
    setTimeout(() => {
        modal.style.display = 'none';
        main.classList.remove('hidden');
    }, 500);
}

// ============ GLOBAL SCORE ============
function addGlobalScore(pts) {
    globalScore += pts;
    localStorage.setItem('elifScore', globalScore);
    updateScoreUI();
}

function updateScoreUI() {
    const el = document.getElementById('global-score');
    const inlineEl = document.getElementById('score-inline');

    if (el) el.textContent = globalScore;
    if (inlineEl) inlineEl.textContent = globalScore;
}

// ============ GAME ROUTING ============
window.showGame = function(gameId) {
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('active-game-area').style.display = 'block';
    const slot = document.getElementById('game-slot');
    slot.innerHTML = '';

    if (gameId === 'space-invaders' && window.initSpaceInvaders) window.initSpaceInvaders(slot);
    else if (gameId === 'mahjong' && window.initMahjong) window.initMahjong(slot);
    else if (gameId === 'sudoku' && window.initSudoku) window.initSudoku(slot);
    else if (gameId === 'tetris' && window.initTetris) window.initTetris(slot);
    else if (gameId === 'axe-throw' && window.initAxeThrow) window.initAxeThrow(slot);
};

window.hideGame = function() {
    if (window.siReqId) cancelAnimationFrame(window.siReqId);
    if (window.axeReqId) cancelAnimationFrame(window.axeReqId);
    if (window.tetrisReqId) cancelAnimationFrame(window.tetrisReqId);
    document.getElementById('active-game-area').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
    updateScoreUI();
};

// ============ EASTER EGG ============
window.revealSurprise = function() {
    alert("🛫 PRÉPARE TON SAC ! LA SURPRISE EST EN ROUTE...\n\n[La vidéo de ton cadeau apparaîtra ici]");
};
