// app.js — Elif Birthday Hub
const SCORE_THRESHOLD = 4000;
const POINTS_PER_WIN = 100;

window.SUDOKU_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['sudoku'] && window.GAME_ASSETS['sudoku'].length > 0 ? window.GAME_ASSETS['sudoku'] : [];
window.NIVEAU_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['mahjong'] && window.GAME_ASSETS['mahjong'].length > 0 ? window.GAME_ASSETS['mahjong'] : ['assets/player.webp'];
window.ALL_SPACE_INVADER_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['space-invaders'] && window.GAME_ASSETS['space-invaders'].length > 0 ? window.GAME_ASSETS['space-invaders'] : ['assets/player.webp'];
window.TETRIS_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['tetris'] && window.GAME_ASSETS['tetris'].length > 0 ? window.GAME_ASSETS['tetris'] : ['assets/player.webp'];
window.HACHE_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['lancer-hache'] && window.GAME_ASSETS['lancer-hache'].length > 0 ? window.GAME_ASSETS['lancer-hache'] : ['assets/player.webp'];
let globalScore = parseInt(localStorage.getItem('elifScore') || '0', 10);

// ============ BACKGROUND MUSIC ============
const bgMusic = new Audio('assets/Özdemir Erdoğan - Gurbet.mp3');
bgMusic.addEventListener('timeupdate', () => {
    // Loop the first 22 seconds
    if (bgMusic.currentTime >= 22) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log("Audio loop error:", e));
    }
});

// ============ OVERLAY + MODAL FLOW ============
window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('kitsch-overlay');
    const modal = document.getElementById('personal-modal');
    const mainContent = document.getElementById('main-content');

    // Click anywhere on overlay → show modal & start music
    overlay.addEventListener('click', () => {
        bgMusic.play().catch(e => console.log("Audio play error:", e));
        
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
// ── Liste dynamiquement chargée (dossier intro = stickers statiques) ──────────
// (window.GAME_ASSETS['intro'] est défini dans assets/assets_list.js)

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Mélange aléatoire (Fisher-Yates) pour maximiser la variété
        const pool = [...window.GAME_ASSETS['intro']].sort(() => Math.random() - 0.5);
        if (pool.length === 0) return;

        const collageLayer = document.createElement('div');
        collageLayer.id = 'dashboard-collage';
        collageLayer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;overflow:hidden;';
        document.body.appendChild(collageLayer);

        // ── Grille ultra-dense 65 px – le fond n'est JAMAIS visible ─────────
        const STEP = 65;
        const vw   = Math.max(window.innerWidth,  screen.width)  + STEP * 3;
        const vh   = Math.max(window.innerHeight, screen.height) + STEP * 3;
        const cols = Math.ceil(vw / STEP) + 2;
        const rows = Math.ceil(vh / STEP) + 2;

        // Crée les éléments canvas en batch via DocumentFragment pour figer les animations
        const frag = document.createDocumentFragment();
        let idx = 0;
        
        // Précharger les images pour extraire la première frame via canvas
        const loadedImages = {};
        const loadPromises = pool.map(src => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => {
                    loadedImages[src] = img;
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = src;
            });
        });

        Promise.all(loadPromises).then(() => {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const src = pool[idx % pool.length];
                    idx++;
                    const sourceImg = loadedImages[src];
                    if (!sourceImg) continue;

                    // Utilisation d'un canvas pour "geler" l'image sur sa première frame
                    const canvas = document.createElement('canvas');
                    canvas.width = sourceImg.naturalWidth || 100;
                    canvas.height = sourceImg.naturalHeight || 100;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

                    const size = 82 + Math.random() * 36;          // 82–118 px
                    const jx   = (Math.random() - 0.5) * STEP * 0.6;
                    const jy   = (Math.random() - 0.5) * STEP * 0.6;
                    const rot  = (Math.random() - 0.5) * 52;       // –26° à +26°

                    canvas.style.cssText = `
                        position:absolute;
                        left:${c * STEP + jx - STEP}px;
                        top:${r  * STEP + jy - STEP}px;
                        width:${size}px;height:${size}px;
                        object-fit:contain;
                        transform:rotate(${rot}deg);
                        opacity:0.93;
                        filter:drop-shadow(1px 2px 4px rgba(0,0,0,0.7));
                    `;
                    frag.appendChild(canvas);
                }
            }
            collageLayer.appendChild(frag);
        });
    }, 300);
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
    const dashCollage = document.getElementById('dashboard-collage');
    if (dashCollage) dashCollage.style.display = 'none';
    document.getElementById('active-game-area').style.display = 'block';
    
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    }

    const slot = document.getElementById('game-slot');
    slot.innerHTML = '';

    if (gameId === 'space-invaders' && window.initSpaceInvaders) window.initSpaceInvaders(slot);
    else if (gameId === 'mahjong' && window.initMahjong) window.initMahjong(slot);
    else if (gameId === 'sudoku' && window.initSudoku) window.initSudoku(slot);
    else if (gameId === 'tetris' && window.initTetris) window.initTetris(slot);
    else if (gameId === 'axe-throw' && window.initAxeThrow) window.initAxeThrow(slot);
};

window.hideGame = function() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }
    if (window.siReqId) cancelAnimationFrame(window.siReqId);
    if (window.axeReqId) cancelAnimationFrame(window.axeReqId);
    if (window.tetrisReqId) cancelAnimationFrame(window.tetrisReqId);
    document.getElementById('active-game-area').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
    const dashCollage = document.getElementById('dashboard-collage');
    if (dashCollage) dashCollage.style.display = 'block';
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
