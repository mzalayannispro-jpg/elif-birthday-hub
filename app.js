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
// ── Liste complète de TOUS les stickers statiques (aucun GIF animé) ──────────
window.ALL_COLLAGE_IMGS = [
  "assets/06557c01-4024-47ed-97e3-056edb1b8041.webp",
  "assets/09eb6161-134e-43e3-af95-7c8004c45547.webp",
  "assets/1f6c5518-609c-4db4-ae89-77325c921daf.webp",
  "assets/2576ded6-55a4-4ae3-8a65-b2958364772d.webp",
  "assets/52652cc6-3dcf-46c8-9a6e-12e51c82ade5.webp",
  "assets/82e4f251-83ee-43ac-a13f-ab8f212e5364.webp",
  "assets/8fda3b14-b6ef-41c7-bea0-779166881f0c.webp",
  "assets/9c08de24-fc9a-4106-8483-430a0f546023.webp",
  "assets/alien2.webp","assets/alien3.webp","assets/alien5.webp",
  "assets/baklava.png","assets/real_baklava.png",
  "assets/ec0ac460-aae3-4039-bac7-21eb98d88b09.webp",
  "assets/f0c20484-97a9-4757-90d2-c4a7088b3cfb.webp",
  "assets/ff5b4366-508f-4fe6-8d77-ace79e61ca26.webp",
  "assets/lose.webp","assets/win.webp","assets/player.webp",
  "assets/meme1.jpg","assets/meme2.jpg","assets/meme3.jpg","assets/meme4.jpg",
  "assets/STK-20240102-WA0000.webp","assets/STK-20240506-WA0000.webp","assets/STK-20240506-WA0001.webp",
  "assets/STK-20240608-WA0032.webp",
  "assets/STK-20240625-WA0014 - Copie.webp","assets/STK-20240627-WA0020 - Copie.webp",
  "assets/STK-20240715-WA0000 - Copie.webp","assets/STK-20240715-WA0002 - Copie.webp",
  "assets/STK-20240715-WA0003 - Copie.webp","assets/STK-20240715-WA0004 - Copie.webp",
  "assets/STK-20240715-WA0004.webp","assets/STK-20241108-WA0001.webp",
  "assets/STK-20241126-WA0007 - Copie.webp","assets/STK-20241217-WA0045 - Copie.png",
  "assets/STK-20241217-WA0046 - Copie.webp","assets/STK-20241217-WA0053 - Copie.webp",
  "assets/STK-20250306-WA0000.webp","assets/STK-20250312-WA0004.webp",
  "assets/STK-20250316-WA0023.webp","assets/STK-20250323-WA0004.webp","assets/STK-20250323-WA0005.webp",
  "assets/STK-20250330-WA0006.webp","assets/STK-20250616-WA0002.webp",
  "assets/STK-20250724-WA0004.webp","assets/STK-20250802-WA0009.webp","assets/STK-20250802-WA0010.webp",
  "assets/STK-20250806-WA0031.webp","assets/STK-20250825-WA0004.webp",
  "assets/STK-20251010-WA0030.webp",
  "assets/STK-20251011-WA0033.webp","assets/STK-20251011-WA0034.webp","assets/STK-20251011-WA0036.webp",
  "assets/STK-20251014-WA0001.webp","assets/STK-20251014-WA0046.webp",
  "assets/STK-20251015-WA0017.webp",
  "assets/STK-20251025-WA0002.webp","assets/STK-20251025-WA0003.webp",
  "assets/STK-20251110-WA0000.webp",
  "assets/STK-20251205-WA0021.webp","assets/STK-20251205-WA0027.webp",
  "assets/STK-20251211-WA0036.webp",
  "assets/STK-20251211-WA0040.webp","assets/STK-20251211-WA0044.webp",
  "assets/STK-20251211-WA0049.webp","assets/STK-20251211-WA0052.webp","assets/STK-20251211-WA0053.webp",
  "assets/STK-20251211-WA0054.webp","assets/STK-20251211-WA0056.webp","assets/STK-20251211-WA0057.webp",
  "assets/STK-20251211-WA0058.webp",
  "assets/STK-20251211-WA0062.webp",
  "assets/STK-20251211-WA0065.webp","assets/STK-20251211-WA0069.webp",
  "assets/STK-20251211-WA0070.webp","assets/STK-20251211-WA0071.webp",
  "assets/STK-20251211-WA0073.webp",
  "assets/STK-20251211-WA0080.webp",
  "assets/STK-20251217-WA0000.webp","assets/STK-20251217-WA0031.webp",
  "assets/STK-20251218-WA0031.webp",
  "assets/STK-20260216-WA0001.webp",
  "assets/STK-20260404-WA0012.webp","assets/STK-20260404-WA0013.webp",
  "assets/STK-20260408-WA0021.webp","assets/STK-20260408-WA0024.webp",
  "assets/STK-20260409-WA0010.webp",
  "assets/STK-20260412-WA0003.webp","assets/STK-20260412-WA0004.webp",
  "assets/STK-20260419-WA0004.webp","assets/STK-20260419-WA0005.webp","assets/STK-20260419-WA0006.webp",
  "assets/STK-20260419-WA0007.webp","assets/STK-20260419-WA0008.webp","assets/STK-20260419-WA0009.webp",
  "assets/STK-20260419-WA0010.webp","assets/STK-20260419-WA0014.webp",
  "assets/STK-20260419-WA0018.webp",
  "assets/STK-20260419-WA0022.webp","assets/STK-20260419-WA0025.webp",
  "assets/mahjong/94d92225-07d4-44fa-b633-1b3daa63f094.webp",
  "assets/mahjong/alien4.webp","assets/mahjong/STK-20240506-WA0001.webp",
  "assets/mahjong/STK-20251010-WA0030.webp",
  "assets/mahjong/STK-20251110-WA0000.webp",
  "assets/space-invaders/09eb6161-134e-43e3-af95-7c8004c45547.webp",
  "assets/space-invaders/82e4f251-83ee-43ac-a13f-ab8f212e5364.webp",
  "assets/space-invaders/8fda3b14-b6ef-41c7-bea0-779166881f0c.webp",
  "assets/space-invaders/alien2.webp","assets/space-invaders/f0c20484-97a9-4757-90d2-c4a7088b3cfb.webp",
  "assets/sudoku/51454260-68c0-4744-83da-9203fbfb76e4.webp",
  "assets/sudoku/52652cc6-3dcf-46c8-9a6e-12e51c82ade5.webp",
  "assets/sudoku/a9dcfb00-509c-41dd-891f-8a842927fdcf.webp",
  "assets/sudoku/STK-20240808-WA0039.webp","assets/sudoku/STK-20241217-WA0052 - Copie.webp",
  "assets/sudoku/STK-20241217-WA0054.webp","assets/sudoku/STK-20241217-WA0055.webp","assets/sudoku/win.webp",
  "assets/tetris/I/STK-20241117-WA0004.webp","assets/tetris/I/STK-20241217-WA0049 - Copie.webp",
  "assets/tetris/J/STK-20241217-WA0045 - Copie.png",
  "assets/tetris/L/2576ded6-55a4-4ae3-8a65-b2958364772d.webp","assets/tetris/L/9c08de24-fc9a-4106-8483-430a0f546023.webp",
  "assets/tetris/O/1f6c5518-609c-4db4-ae89-77325c921daf.webp",
  "assets/tetris/O/STK-20241108-WA0002.webp","assets/tetris/O/STK-20241217-WA0048 - Copie.webp",
  "assets/tetris/S/alien3.webp","assets/tetris/Z/STK-20240102-WA0000.webp",
  "assets/lancer-hache/STK-20251011-WA0035.webp","assets/lancer-hache/STK-20260419-WA0011.webp",
  "assets/lancer-hache/STK-20260419-WA0012.webp","assets/lancer-hache/STK-20260419-WA0013.webp",
  "assets/lancer-hache/STK-20260419-WA0023.webp","assets/lancer-hache/STK-20260419-WA0024.webp",
  "assets/lancer-hache/STK-20260419-WA0026.webp",
  // ── assets/intro/ — statiques confirmés (5 animés exclus) ──────────────
  "assets/intro/09eb6161-134e-43e3-af95-7c8004c45547.webp",
  "assets/intro/2576ded6-55a4-4ae3-8a65-b2958364772d.webp",
  "assets/intro/52652cc6-3dcf-46c8-9a6e-12e51c82ade5.webp",
  "assets/intro/82e4f251-83ee-43ac-a13f-ab8f212e5364.webp",
  "assets/intro/94d92225-07d4-44fa-b633-1b3daa63f094.webp",
  "assets/intro/9c08de24-fc9a-4106-8483-430a0f546023.webp",
  "assets/intro/alien2.webp","assets/intro/player.webp",
  "assets/intro/STK-20240627-WA0020 - Copie.webp",
  "assets/intro/STK-20240715-WA0002 - Copie.webp",
  "assets/intro/STK-20240715-WA0004 - Copie.webp",
  "assets/intro/STK-20240715-WA0004.webp",
  "assets/intro/STK-20241108-WA0001.webp",
  "assets/intro/STK-20241126-WA0007 - Copie.webp",
  "assets/intro/STK-20241217-WA0045 - Copie.png",
  "assets/intro/STK-20241217-WA0046 - Copie.webp",
  "assets/intro/STK-20241217-WA0053 - Copie.webp",
  "assets/intro/STK-20250306-WA0000.webp",
  "assets/intro/STK-20250316-WA0023.webp",
  "assets/intro/STK-20250616-WA0002.webp",
  "assets/intro/STK-20251010-WA0030.webp",
  "assets/intro/STK-20251011-WA0034.webp",
  "assets/intro/STK-20251110-WA0000.webp",
  "assets/intro/STK-20260216-WA0001.webp",
  "assets/intro/STK-20260408-WA0021.webp",
  "assets/intro/STK-20260419-WA0004.webp",
  "assets/intro/STK-20260419-WA0006.webp",
  "assets/intro/STK-20260419-WA0007.webp",
  "assets/intro/STK-20260419-WA0018.webp"
];

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Mélange aléatoire (Fisher-Yates) pour maximiser la variété
        const pool = [...window.ALL_COLLAGE_IMGS].sort(() => Math.random() - 0.5);
        if (pool.length === 0) return;

        const collageLayer = document.createElement('div');
        collageLayer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;overflow:hidden;';
        document.body.appendChild(collageLayer);

        // ── Grille ultra-dense 65 px – le fond n'est JAMAIS visible ─────────
        const STEP = 65;
        const vw   = Math.max(window.innerWidth,  screen.width)  + STEP * 3;
        const vh   = Math.max(window.innerHeight, screen.height) + STEP * 3;
        const cols = Math.ceil(vw / STEP) + 2;
        const rows = Math.ceil(vh / STEP) + 2;

        // Crée les éléments img en batch via DocumentFragment (plus rapide)
        const frag = document.createDocumentFragment();
        let idx = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const img = document.createElement('img');
                img.src = pool[idx % pool.length];
                img.loading = 'lazy';   // ne bloque pas le rendu du jeu
                idx++;

                const size = 82 + Math.random() * 36;          // 82–118 px
                const jx   = (Math.random() - 0.5) * STEP * 0.6;
                const jy   = (Math.random() - 0.5) * STEP * 0.6;
                const rot  = (Math.random() - 0.5) * 52;       // –26° à +26°

                img.style.cssText = `
                    position:absolute;
                    left:${c * STEP + jx - STEP}px;
                    top:${r  * STEP + jy - STEP}px;
                    width:${size}px;height:${size}px;
                    object-fit:contain;
                    transform:rotate(${rot}deg);
                    opacity:0.93;
                    filter:drop-shadow(1px 2px 4px rgba(0,0,0,0.7));
                `;
                frag.appendChild(img);
            }
        }
        collageLayer.appendChild(frag);
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
