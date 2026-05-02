// app.js — Elif Birthday Hub
const SCORE_THRESHOLD = 4000;
const POINTS_PER_WIN = 50;

window.SUDOKU_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['sudoku'] && window.GAME_ASSETS['sudoku'].length > 0 ? window.GAME_ASSETS['sudoku'] : [];
window.NIVEAU_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['mahjong'] && window.GAME_ASSETS['mahjong'].length > 0 ? window.GAME_ASSETS['mahjong'] : ['assets/player.webp'];
window.ALL_SPACE_INVADER_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['space-invaders'] && window.GAME_ASSETS['space-invaders'].length > 0 ? window.GAME_ASSETS['space-invaders'] : ['assets/player.webp'];
window.TETRIS_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['tetris'] && window.GAME_ASSETS['tetris'].length > 0 ? window.GAME_ASSETS['tetris'] : ['assets/player.webp'];
window.HACHE_IMAGES = window.GAME_ASSETS && window.GAME_ASSETS['lancer-hache'] && window.GAME_ASSETS['lancer-hache'].length > 0 ? window.GAME_ASSETS['lancer-hache'] : ['assets/player.webp'];
let globalScore = parseInt(localStorage.getItem('elifScore') || '0', 10);

// ============ SPOTIFY IFRAME ============
// Spotify auto-play is not allowed by browsers, but the user can click Play on the iframe in the UI.

// ============ OVERLAY + MODAL FLOW ============
window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('kitsch-overlay');
    const modal = document.getElementById('personal-modal');
    const mainContent = document.getElementById('main-content');

    if (sessionStorage.getItem('visited') === 'true') {
        if (overlay) overlay.style.display = 'none';
        if (modal) modal.style.display = 'none';
        if (mainContent) mainContent.classList.remove('hidden');
    } else {
        // Click anywhere on overlay → show modal
        if (overlay) overlay.addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (modal) modal.classList.add('visible');
            }, 600);
        });

        // Modal close button
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) closeBtn.addEventListener('click', () => {
            revealDashboard(modal, mainContent);
        });

        // Modal CTA button
        const ctaBtn = document.getElementById('to-dashboard-btn');
        if (ctaBtn) ctaBtn.addEventListener('click', () => {
            revealDashboard(modal, mainContent);
        });
    }

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
        sessionStorage.setItem('visited', 'true');
    }, 500);
}

window.reopenPersonalModal = function() {
    const modal = document.getElementById('personal-modal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.remove('fade-out');
        modal.classList.add('visible');
    }
};

// ============ GLOBAL SCORE ============
function addGlobalScore(pts) {
    const prevScore = globalScore;
    globalScore += pts;
    localStorage.setItem('elifScore', globalScore);
    updateScoreUI();

    // Vérifier si on vient de dépasser 3000 points pour la 1ère fois
    if (prevScore < 3000 && globalScore >= 3000 && !localStorage.getItem('bimShown')) {
        showBimOverlay();
    }
}

function updateScoreUI() {
    const el = document.getElementById('global-score');
    const inlineEl = document.getElementById('score-inline');

    if (el) el.textContent = globalScore;
    if (inlineEl) inlineEl.textContent = globalScore;

    const magicDoor = document.getElementById('magic-door-container');
    const layer2 = document.getElementById('layer-2-container');
    const layer3 = document.getElementById('layer-3-container');
    const giftsContainer = document.getElementById('gifts-container');
    
    // Reset visibility if score drops or on load
    if (layer2) layer2.classList.add('hidden');
    if (layer3) layer3.classList.add('hidden');
    if (giftsContainer) giftsContainer.classList.add('hidden');
    if (magicDoor) magicDoor.classList.add('hidden');

    if (magicDoor) {
        const doorText = magicDoor.querySelector('.door-text');
        
        if (globalScore >= 3000 && globalScore < 6000) {
            magicDoor.classList.remove('hidden');
            if(doorText) doorText.textContent = window.t('door.magic');
        } else if (globalScore >= 6000) {
            if (localStorage.getItem('layer2Unlocked') === 'true') {
                const layer2 = document.getElementById('layer-2-container');
                if (layer2) layer2.classList.remove('hidden');
                const giftsContainer = document.getElementById('gifts-container');
                if (giftsContainer) giftsContainer.classList.remove('hidden');
                
                if (!document.getElementById('gift-1')) {
                    const giftsList = document.getElementById('gifts-list');
                    if (giftsList) {
                        const giftBtn = document.createElement('button');
                        giftBtn.id = 'gift-1';
                        giftBtn.className = 'game-card-btn';
                        giftBtn.onclick = () => window.open("assets/easter egg/cnab-surprise.html", "_blank");
                        giftBtn.innerHTML = `
                            <span class="btn-icon">🎁</span>
                            <span class="btn-label" data-i18n="gift1.title">${window.t('gift1.title')}</span>
                            <span class="btn-sub" data-i18n="gift1.sub">${window.t('gift1.sub')}</span>
                        `;
                        giftsList.appendChild(giftBtn);
                    }
                }

                // Logique pour le Layer 3
                if (globalScore >= 9000 && globalScore < 12000) {
                    magicDoor.classList.remove('hidden');
                    if(doorText) doorText.textContent = window.t('door.magic3');
                } else if (globalScore >= 12000) {
                    if (localStorage.getItem('layer3Unlocked') === 'true') {
                        magicDoor.classList.add('hidden');
                        const layer3 = document.getElementById('layer-3-container');
                        if (layer3) layer3.classList.remove('hidden');
                        // Affichage du cadeau 2 si besoin
                        if (!document.getElementById('gift-2')) {
                            const giftsList = document.getElementById('gifts-list');
                            if (giftsList) {
                                const giftBtn = document.createElement('button');
                                giftBtn.id = 'gift-2';
                                giftBtn.className = 'game-card-btn';
                                giftBtn.onclick = () => alert("Second surprise coming soon!");
                                giftBtn.innerHTML = `
                                    <span class="btn-icon">🎁</span>
                                    <span class="btn-label" data-i18n="gift2.title">${window.t('gift2.title')}</span>
                                    <span class="btn-sub" data-i18n="gift2.sub">${window.t('gift2.sub')}</span>
                                `;
                                giftsList.appendChild(giftBtn);
                            }
                        }
                    } else {
                        magicDoor.classList.remove('hidden');
                        if(doorText) doorText.textContent = window.t('door.open3');
                    }
                } else {
                    magicDoor.classList.add('hidden');
                }

            } else {
                magicDoor.classList.remove('hidden');
                if(doorText) doorText.textContent = window.t('door.open2');
            }
        } else {
            magicDoor.classList.add('hidden');
        }
    }
}

// ============ SAUVEGARDE (TABLETTE) ============
window.generateSaveCode = function() {
    // Check if translation exists, else fallback
    const code = btoa("ELIF-" + (window.globalScore * 7) + "-XYZ");
    alert((window.t('alert.save_code')) + "\n\n" + code);
};

window.loadSaveCode = function() {
    const input = prompt(window.t('alert.load_code'));
    if (!input) return;
    try {
        const decoded = atob(input);
        if (decoded.startsWith("ELIF-") && decoded.endsWith("-XYZ")) {
            const numStr = decoded.replace("ELIF-", "").replace("-XYZ", "");
            const score = parseInt(numStr, 10) / 7;
            if (!isNaN(score)) {
                window.globalScore = score;
                localStorage.setItem('elifScore', score);
                
                // Débloquer selon le score
                if (score >= 6000) localStorage.setItem('layer2Unlocked', 'true');
                if (score >= 12000) localStorage.setItem('layer3Unlocked', 'true');
                if (score >= 3000) localStorage.setItem('bimShown', 'true');

                updateScoreUI();
                alert("Score Loaded: " + score);
                return;
            }
        }
        alert(window.t('alert.invalid_code'));
    } catch(e) {
        alert(window.t('alert.invalid_code'));
    }
};

// ============ PORTE MAGIQUE ============
window.showBimOverlay = function() {
    const overlay = document.getElementById('bim-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        localStorage.setItem('bimShown', 'true');
    }
};

window.closeBimOverlay = function() {
    const overlay = document.getElementById('bim-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
};

window.handleMagicDoor = function() {
    if (globalScore >= 6000 && localStorage.getItem('layer2Unlocked') !== 'true') {
        unlockLayer2();
    } else if (globalScore >= 12000 && localStorage.getItem('layer3Unlocked') !== 'true') {
        unlockLayer3();
    } else if (globalScore < 6000) {
        alert(window.t('alert.door_locked'));
    } else if (globalScore < 12000) {
        alert(window.t('alert.l3_locked'));
    }
};

window.unlockLayer3 = function() {
    const magicDoor = document.getElementById('magic-door-container');
    if (magicDoor) magicDoor.classList.add('door-opening');
    
    setTimeout(() => {
        const layer3 = document.getElementById('layer-3-container');
        if (layer3) {
            layer3.classList.remove('hidden');
            layer3.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (magicDoor) {
            magicDoor.classList.add('hidden');
            magicDoor.classList.remove('door-opening');
        }

        localStorage.setItem('layer3Unlocked', 'true');
        updateScoreUI(); // Pour faire apparaître le bouton du cadeau
        
        alert(window.t('alert.l3_unlocked'));
    }, 1500);
};

window.unlockLayer2 = function() {
    const magicDoor = document.getElementById('magic-door-container');
    if (magicDoor) magicDoor.classList.add('door-opening');

    setTimeout(() => {
        const giftsContainer = document.getElementById('gifts-container');
        const giftsList = document.getElementById('gifts-list');
        if (giftsContainer) giftsContainer.classList.remove('hidden');
        
        if (!document.getElementById('gift-1')) {
            const giftBtn = document.createElement('button');
            giftBtn.id = 'gift-1';
            giftBtn.className = 'game-card-btn';
            giftBtn.onclick = () => window.open("assets/easter egg/cnab-surprise.html", "_blank");
            giftBtn.innerHTML = `
                <span class="btn-icon">🎁</span>
                <span class="btn-label">VIDÉO SURPRISE</span>
                <span class="btn-sub">Ton premier cadeau !</span>
            `;
            if (giftsList) giftsList.appendChild(giftBtn);
        }

        const layer2 = document.getElementById('layer-2-container');
        if (layer2) {
            layer2.classList.remove('hidden');
            layer2.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (magicDoor) {
            magicDoor.classList.add('hidden');
            magicDoor.classList.remove('door-opening');
        }

        localStorage.setItem('layer2Unlocked', 'true');
        
        alert("✨ INCREDIBLE! You unlocked LAYER 2 and your first GIFT! ✨\n\nLook above the games!");
    }, 1500);
};

// ============ GAME ROUTING ============
window.showGame = function(gameId) {
    try {
        console.log("showGame called with:", gameId);
        document.getElementById('game-menu').style.display = 'none';
        const dashCollage = document.getElementById('dashboard-collage');
        if (dashCollage) dashCollage.style.display = 'none';
        document.getElementById('active-game-area').style.display = 'flex';
        
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }

        const slot = document.getElementById('game-slot');
        slot.innerHTML = '';
        
        const overlay = document.getElementById('game-instructions-overlay');
        const textElem = document.getElementById('game-instructions-text');
        const startBtn = document.getElementById('start-game-btn');
        
        const instMap = {
            'space-invaders': 'inst.si',
            'mahjong': 'inst.mj',
            'sudoku': 'inst.sdk',
            'tetris': 'inst.tetris',
            'axe-throw': 'inst.axe',
            'mario': 'inst.mario',
            'angry-birds': 'inst.ab',
            'tower-defense': 'inst.td'
        };
        
        textElem.innerHTML = window.t(instMap[gameId] || 'inst.title');
        
        // Show the instruction overlay and hide it when PLAY is clicked
        if (overlay) {
            overlay.style.display = 'flex';
            startBtn.onclick = () => {
                overlay.style.display = 'none';
                launchGameModule(gameId, slot);
            };
        } else {
            // Fallback if overlay doesn't exist
            launchGameModule(gameId, slot);
        }

    } catch(err) {
        alert(window.t('alert.crit_err') + err.message);
        window.hideGame();
    }
};

function launchGameModule(gameId, slot) {
    if (gameId === 'space-invaders' && window.initSpaceInvaders) window.initSpaceInvaders(slot);
    else if (gameId === 'mahjong' && window.initMahjong) window.initMahjong(slot);
    else if (gameId === 'sudoku' && window.initSudoku) window.initSudoku(slot);
    else if (gameId === 'tetris' && window.initTetris) window.initTetris(slot);
    else if (gameId === 'axe-throw' && window.initAxeThrow) window.initAxeThrow(slot);
    else if (gameId === 'mario' && window.initMario) window.initMario(slot);
    else if (gameId === 'angry-birds' && window.initAngryBirds) window.initAngryBirds(slot);
    else if (gameId === 'tower-defense' && window.initTowerDefense) window.initTowerDefense(slot);
    else {
        alert(window.tReplace ? window.tReplace('alert.module_err', {game: gameId}) : "Module Error");
        window.hideGame();
    }
}

window.hideGame = function() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }
    if (window.siReqId) cancelAnimationFrame(window.siReqId);
    if (window.axeReqId) cancelAnimationFrame(window.axeReqId);
    if (window.tetrisReqId) cancelAnimationFrame(window.tetrisReqId);
    if (window.marioReqId) cancelAnimationFrame(window.marioReqId);
    
    const slot = document.getElementById('game-slot');
    if (slot && slot._cleanup) {
        slot._cleanup();
        slot._cleanup = null;
    }

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
