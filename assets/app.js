// app.js
let globalData = {
    assets: null,
    score: 0,
    gamesWon: 0
};

// Check Easter Egg Threshold
const GAMES_THRESHOLD = 40; 
const POINTS_PER_WIN = 100;
const THRESHOLD_SCORE = GAMES_THRESHOLD * POINTS_PER_WIN;

async function initApp() {
    try {
        const response = await fetch('assets.json');
        globalData.assets = await response.json();
    } catch (e) {
        console.error("Failed to load assets.json. Did you run update.bat?", e);
        globalData.assets = { levels: {}, landingPage: [], punchlines: [], allStickers: [] };
    }

    loadSave();
    updateGlobalUI();
    showLandingPage();
}

function addGlobalScore(points) {
    globalData.score += points;
    globalData.gamesWon += 1;
    saveProgress();
    updateGlobalUI();
}

function saveProgress() {
    localStorage.setItem('elifBirthdayScore', globalData.score);
    localStorage.setItem('elifBirthdayWins', globalData.gamesWon);
}

function loadSave() {
    const savedScore = localStorage.getItem('elifBirthdayScore');
    const savedWins = localStorage.getItem('elifBirthdayWins');
    if (savedScore) globalData.score = parseInt(savedScore, 10);
    if (savedWins) globalData.gamesWon = parseInt(savedWins, 10);
}

function updateGlobalUI() {
    const scoreEl = document.getElementById('global-score');
    if (scoreEl) scoreEl.innerText = globalData.score;
    
    // Easter Egg Check
    const mysteryBox = document.getElementById('mystery-box');
    const mysteryBtn = document.getElementById('mystery-btn');
    const mysteryMsg = document.getElementById('mystery-msg');
    
    if (mysteryBox && mysteryMsg && mysteryBtn) {
        if (globalData.score >= THRESHOLD_SCORE) {
            mysteryBox.classList.add('unlocked');
            mysteryMsg.innerText = "LA SURPRISE EST DÉBLOQUÉE !";
            mysteryBtn.disabled = false;
        } else {
            const pointsNeeded = THRESHOLD_SCORE - globalData.score;
            mysteryMsg.innerText = `Mystère verrouillé... Il manque ${pointsNeeded} points (Jouez encore environ ${Math.ceil(pointsNeeded/POINTS_PER_WIN)} parties) !`;
            mysteryBtn.disabled = true;
        }
    }
}

// Navigation
function hideAllModules() {
    document.querySelectorAll('.module-container').forEach(el => {
        el.style.display = 'none';
        el.innerHTML = ''; 
    });
}

window.showLandingPage = function() {
    hideAllModules();
    const container = document.getElementById('module-landing');
    container.style.display = 'flex';
    if(window.renderLandingPage) window.renderLandingPage(container);
}

window.startSpaceInvaders = function() {
    hideAllModules();
    const container = document.getElementById('module-space-invaders');
    container.style.display = 'flex';
    if(window.initSpaceInvaders) window.initSpaceInvaders(container);
}

window.startMahjong = function() {
    hideAllModules();
    const container = document.getElementById('module-mahjong');
    container.style.display = 'flex';
    if(window.initMahjong) window.initMahjong(container);
}

window.startSudoku = function() {
    hideAllModules();
    const container = document.getElementById('module-sudoku');
    container.style.display = 'flex';
    if(window.initSudoku) window.initSudoku(container);
}

// Video trigger
window.playEasterEggVideo = function() {
    hideAllModules();
    const container = document.getElementById('module-easter-egg');
    container.style.display = 'flex';
    container.innerHTML = `
        <div class="video-container" style="text-align: center; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 20px;">
            <h2>🛫 PRÉPARE TES VALISES BABYLOVEBUTTERFLY ! 🛬</h2>
            <!-- Placeholder pour la future vidéo ! -->
            <div class="vid-placeholder">
                <p style="font-size: 24px; color: gold;">[Votre Vidéo de Voyage Sera Placée Ici]</p>
                <!-- <video src="voyage.mp4" controls autoplay></video> -->
            </div>
            <button onclick="showLandingPage()" class="back-btn" style="margin-top: 20px;">Retour au Menu</button>
        </div>
    `;
}

// Global listen
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
