// app.js — Elif Birthday Hub
const SCORE_THRESHOLD = 4000;
const POINTS_PER_WIN = 100;

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

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    updateScoreUI();
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
    const palierEl = document.getElementById('palier-info');
    const fill = document.getElementById('mystery-progress-fill');
    const hint = document.getElementById('mystery-hint');
    const sealed = document.getElementById('mystery-sealed');
    const unlocked = document.getElementById('mystery-unlocked');

    if (el) el.textContent = globalScore;
    if (inlineEl) inlineEl.textContent = globalScore;

    const pct = Math.min(100, (globalScore / SCORE_THRESHOLD) * 100);
    if (fill) fill.style.width = pct + '%';
    if (hint) hint.textContent = `${globalScore} / ${SCORE_THRESHOLD} pts`;

    if (globalScore >= SCORE_THRESHOLD) {
        if (sealed) sealed.style.display = 'none';
        if (unlocked) unlocked.style.display = 'block';
        if (palierEl) palierEl.textContent = '🎉 SURPRISE DÉBLOQUÉE !';
    } else {
        const remaining = SCORE_THRESHOLD - globalScore;
        if (palierEl) palierEl.textContent = `${remaining} pts pour débloquer la surprise`;
    }
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
};

window.hideGame = function() {
    if (window.siReqId) cancelAnimationFrame(window.siReqId);
    document.getElementById('active-game-area').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
    updateScoreUI();
};

// ============ EASTER EGG ============
window.revealSurprise = function() {
    alert("🛫 PRÉPARE TON SAC ! LA SURPRISE EST EN ROUTE...\n\n[La vidéo de ton cadeau apparaîtra ici]");
};
