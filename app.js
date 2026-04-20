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
    setTimeout(() => {
        if (!window.GAME_ASSETS) return;
        const allStickers = [];
        for (let key in window.GAME_ASSETS) {
            const val = window.GAME_ASSETS[key];
            if (Array.isArray(val)) {
                allStickers.push(...val);
            } else if (val && typeof val === 'object') {
                // Nested object (e.g. tetris: { I: [], J: [], ... })
                for (let subKey in val) {
                    if (Array.isArray(val[subKey])) allStickers.push(...val[subKey]);
                }
            }
        }
        if (allStickers.length === 0) return;
        
        // Remove duplicates
        const uniqueStickers = [...new Set(allStickers)];
        
        const collageLayer = document.createElement('div');
        collageLayer.style.position = 'fixed';
        collageLayer.style.top = '0'; collageLayer.style.left = '0';
        collageLayer.style.width = '100%'; collageLayer.style.height = '100%';
        collageLayer.style.pointerEvents = 'none';
        collageLayer.style.zIndex = '-1'; 
        collageLayer.style.overflow = 'hidden';
        document.body.appendChild(collageLayer);
        
        // Add 25 random stickers floating in the background
        for (let i = 0; i < 25; i++) {
            const img = document.createElement('img');
            img.src = uniqueStickers[Math.floor(Math.random() * uniqueStickers.length)];
            img.style.position = 'absolute';
            img.style.left = Math.random() * 95 + '%';
            img.style.top = Math.random() * 95 + '%';
            img.style.width = (Math.random() * 100 + 40) + 'px'; // 40px to 140px
            img.style.transform = `rotate(${(Math.random() - 0.5) * 80}deg)`;
            img.style.opacity = '0.9';
            img.style.objectFit = 'contain';
            img.style.filter = 'drop-shadow(4px 4px 6px rgba(0,0,0,0.8))';
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
    alert(window.t('surprise.msg'));
};

// ============ GLOBAL GAME OVER ============
window.showGlobalGameOver = function(restartCallback) {
    const overlay = document.getElementById('global-game-over');
    const sticker = document.getElementById('game-over-sticker');
    const replayBtn = document.getElementById('game-over-replay-btn');
    
    // Check if the HTML exists
    if (!overlay) return;

    replayBtn.classList.add('hidden');
    overlay.classList.remove('hidden');
    
    sticker.style.transform = 'scale(0.1)';
    setTimeout(() => { sticker.style.transform = 'scale(1)'; }, 50);
    
    setTimeout(() => {
        replayBtn.classList.remove('hidden');
        replayBtn.onclick = () => {
            overlay.classList.add('hidden');
            if (restartCallback) restartCallback();
        };
    }, 2000); // 2 secondes
};
