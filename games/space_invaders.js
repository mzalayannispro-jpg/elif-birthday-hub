window.initSpaceInvaders = function(container) {
    if (!container.innerHTML.includes('gameCanvas')) {
        container.innerHTML = `
        <div id="game-container" style="width:800px; height:650px;">
            <div id="ui-layer">
                <header style="padding:10px 20px; display:flex; justify-content:space-between; z-index:10; pointer-events:all;">
                    <div style="color:#D4AF37; font-weight:700;">VIES: <span id="si-lives">5</span> | SCORE: <span id="si-score">0</span></div>
                    <button style="padding:5px 15px; font-size:13px; margin:0; background:transparent; border:1px solid #D4AF37; color:#D4AF37; border-radius:5px; cursor:pointer;" onclick="if(window.siReqId) cancelAnimationFrame(window.siReqId); hideGame();">Quitter ✕</button>
                </header>
                
                <div id="start-screen" class="screen active">
                    <h2 data-i18n="si.threat">INCOMING THREAT</h2>
                    <p data-i18n="si.controls">Use Left/Right arrows to move. Space to shoot.</p>
                    <button id="start-btn" data-i18n="si.engage">ENGAGE</button>
                </div>
                
                <div id="game-over-screen" class="screen">
                    <img id="lose-img" alt="Defeat" style="max-height:180px; border-radius:12px; margin-bottom: 20px; box-shadow: 0 0 20px rgba(255,0,0,0.5);">
                    <h2 data-i18n="si.failed">MISSION FAILED</h2>
                    <p><span data-i18n="si.final">Final Score: </span><span id="final-score">0</span></p>
                    <button id="restart-btn" data-i18n="si.try">TRY AGAIN</button>
                    <button style="margin-top:20px; background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:10px 20px; border-radius:6px; cursor:pointer;" onclick="if(window.siReqId) cancelAnimationFrame(window.siReqId); hideGame();" data-i18n="si.menu">RETOUR MENU</button>
                </div>
                
                <div id="victory-screen" class="screen">
                    <img id="win-img" alt="Victory" style="max-height:180px; border-radius:12px; margin-bottom: 20px; box-shadow: 0 0 20px rgba(0,255,0,0.5);">
                    <h2 style="font-size:30px; text-align:center;" data-i18n="si.won">You Won (my heart babylovebutterfly) 🌹</h2>
                    <p><span data-i18n="si.final">Final Score: </span><span id="victory-score">0</span></p>
                    <button id="next-level-btn" data-i18n="si.next">NEXT SECTOR</button>
                    <button style="margin-top:20px; background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:10px 20px; border-radius:6px; cursor:pointer;" onclick="if(window.siReqId) cancelAnimationFrame(window.siReqId); hideGame();" data-i18n="si.menu">RETOUR MENU</button>
                </div>
            </div>
            <canvas id="gameCanvas"></canvas>
        </div>
        `;
        if(window.setLanguage) window.setLanguage(window.currentLang);
    }

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let gameState = 'start'; // start, playing, gameover, victory
    let score = 0;
    let lives = 5;
    let level = 1;

    const playerImg = new Image(); playerImg.src = 'assets/player.webp';
    const realBaklavaImg = new Image(); realBaklavaImg.src = 'assets/real_baklava.png';
    const flagImg = new Image(); flagImg.src = 'assets/turkish_flag_8bit_1776606457543.png';
    const ataturkImg = new Image(); ataturkImg.src = 'assets/{039CA1E5-BA4D-496F-B625-D9F572C058F9}.png';
    const bgSofiaImg = new Image(); bgSofiaImg.src = 'assets/hagia_sophia_8bit_1776606429857.png';
    const winImg = new Image(); winImg.src = 'assets/win.webp';
    const loseImg = new Image(); loseImg.src = 'assets/lose.webp';
    
    // Boss images
    const bossImg1 = new Image(); bossImg1.src = 'assets/{E17D989C-5A4D-46FE-BBCB-849FF254697F}.png';
    const bossImg2 = new Image(); bossImg2.src = 'assets/{347EE3DB-A94C-453B-B8D7-D6DD5BFDEDED}.png';

    const scoreEl = document.getElementById('si-score');
    const livesEl = document.getElementById('si-lives');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const victoryScreen = document.getElementById('victory-screen');
    const finalScoreEl = document.getElementById('final-score');
    const victoryScoreEl = document.getElementById('victory-score');
    // Set image srcs that are now injected as empty img tags
    const loseImgEl = document.getElementById('lose-img');
    const winImgEl = document.getElementById('win-img');
    if (loseImgEl) loseImgEl.src = 'assets/lose.webp';
    if (winImgEl) winImgEl.src = 'assets/win.webp';

    const player = {
        x: canvas.width / 2 - 35, y: canvas.height - 90,
        width: 70, height: 70, speed: 9, color: '#4ade80'
    };

    let bullets = [];
    let alienBullets = [];
    let aliens = [];
    let particles = [];
    let stars = [];
    let bonuses = [];
    let rapidFireTimer = 0;
    let doubleGunTimer = 0;

    for(let i=0; i<50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 3 + 1
        });
    }

    const alienCols = 8;
    const alienWidth = 45;
    const alienHeight = 35;
    const alienPadding = 25;
    let alienDirX = 1;
    let lastAlienShot = 0;
    const baseAlienShotFreq = 3000;

    const keys = { ArrowLeft: false, ArrowRight: false, Space: false };
    let lastShot = 0;

    // Remove old listeners to avoid duplicates
    if(window.siKeydown) document.removeEventListener('keydown', window.siKeydown);
    if(window.siKeyup) document.removeEventListener('keyup', window.siKeyup);

    window.siKeydown = (e) => {
        if(document.getElementById('gameCanvas') && gameState === 'playing') {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = true;
            if (e.code === 'Space') keys.Space = true;
        }
    };
    window.siKeyup = (e) => {
        if(document.getElementById('gameCanvas')) {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = false;
            if (e.code === 'Space') keys.Space = false;
        }
    };

    document.addEventListener('keydown', window.siKeydown);
    document.addEventListener('keyup', window.siKeyup);

    function initAliens() {
        aliens = [];
        alienDirX = 1;
        
        const currentRows = Math.min(4 + Math.floor(level / 2), 6);
        const stickerPaths = [
            'assets/player.webp', 'assets/win.webp', 'assets/lose.webp', 'assets/baklava.png'
        ];
        potentialImages = window.ALL_SPACE_INVADER_IMAGES || stickerPaths;

        // Create Boss!
        aliens.push({
            isBoss: true,
            health: 3 + level * 2,
            maxHealth: 3 + level * 2,
            x: canvas.width / 2 - 50,
            y: 40,
            width: 100, height: 100,
            img: null
        });

        for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < alienCols; c++) {
                const imgObj = new Image();
                imgObj.src = potentialImages[Math.floor(Math.random() * potentialImages.length)];
                aliens.push({
                    health: 1,
                    x: c * (alienWidth + alienPadding) + 50,
                    y: r * (alienHeight + alienPadding) + 150, // shifted down for boss
                    width: alienWidth,
                    height: alienHeight,
                    img: imgObj
                });
            }
        }
    }

    function resetGame(fullReset = true) {
        if (fullReset) {
            score = 0;
            lives = 5;
            level = 1;
        }
        player.x = canvas.width / 2 - player.width / 2;
        bullets = [];
        alienBullets = [];
        particles = [];
        bonuses = [];
        rapidFireTimer = 0;
        doubleGunTimer = 0;
        updateUI();
        initAliens();
    }

    function createExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
                radius: Math.random() * 4 + 1,
                color: color, alpha: 1, decay: Math.random() * 0.03 + 0.015
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function updateStars() {
        for(let i=0; i<stars.length; i++) {
            stars[i].y += stars[i].speed;
            if(stars[i].y > canvas.height) {
                stars[i].y = 0;
                stars[i].x = Math.random() * canvas.width;
            }
        }
    }

    function drawStars() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for(let i=0; i<stars.length; i++) {
            ctx.beginPath();
            ctx.arc(stars[i].x, stars[i].y, stars[i].size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function movePlayer() {
        if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
        if (keys.ArrowRight && player.x + player.width < canvas.width) player.x += player.speed;
    }

    function shootBullet() {
        const now = Date.now();
        const cooldown = (now < rapidFireTimer) ? 50 : 150;
        
        if (keys.Space && now - lastShot > cooldown) {
            const color = (now < rapidFireTimer) ? '#fbbf24' : '#4ade80';
            if (now < doubleGunTimer) {
                bullets.push({x: player.x, y: player.y - 10, width: 6, height: 20, speed: 12, color: color});
                bullets.push({x: player.x + player.width - 6, y: player.y - 10, width: 6, height: 20, speed: 12, color: color});
            } else {
                bullets.push({x: player.x + player.width / 2 - 3, y: player.y - 10, width: 6, height: 20, speed: 12, color: color});
            }
            lastShot = now;
            createExplosion(player.x + player.width/2, player.y, color, 3);
        }
    }

    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bullets[i].speed;
            if (bullets[i].y < -20) bullets.splice(i, 1);
        }
    }

    function updateAlienBullets() {
        for (let i = alienBullets.length - 1; i >= 0; i--) {
            alienBullets[i].y += alienBullets[i].speed;
            const b = alienBullets[i];
            
            if (
                b.x < player.x + player.width && b.x + b.width > player.x &&
                b.y < player.y + player.height && b.y + b.height > player.y
            ) {
                createExplosion(player.x + player.width/2, player.y + player.height/2, '#4ade80', 30);
                alienBullets.splice(i, 1);
                lives--;
                updateUI();
                
                if (lives <= 0) {
                    gameState = 'gameover';
                    if (window.showGlobalGameOver) {
                        window.showGlobalGameOver(() => document.getElementById('restart-btn').click());
                    } else {
                        showScreen(gameOverScreen);
                    }
                    finalScoreEl.innerText = score;
                }
                continue;
            }
            if (b.y > canvas.height) alienBullets.splice(i, 1);
        }
    }

    function manageAlienShooting() {
        const now = Date.now();
        let currentFreq = Math.max(400, baseAlienShotFreq - (level * 200));
        
        if (now - lastAlienShot > currentFreq) {
            const shooter = aliens[Math.floor(Math.random() * aliens.length)];
            if (shooter) {
                alienBullets.push({
                    x: shooter.x + shooter.width / 2 - 3,
                    y: shooter.y + shooter.height,
                    width: 6, height: 15, speed: 3.5 + (level * 0.3), color: '#f43f5e'
                });
                lastAlienShot = now;
            }
        }
    }

    function moveAliens() {
        const time = Date.now() / 300;
        let anyAlive = aliens.length > 0;

        for (let i = 0; i < aliens.length; i++) {
            const a = aliens[i];
            a.x += (1.0 + (level * 0.1)) * alienDirX;
            
            if (a.x + a.width >= canvas.width - 20 || a.x <= 20) {
                alienDirX *= -1;
                for (let j = 0; j < aliens.length; j++) aliens[j].y += 20;
                break;
            }
            
            if (a.y + a.height > player.y) {
                 gameState = 'gameover';
                 if (window.showGlobalGameOver) {
                     window.showGlobalGameOver(() => document.getElementById('restart-btn').click());
                 } else {
                     showScreen(gameOverScreen);
                 }
                 finalScoreEl.innerText = score;
                 return;
            }
        }

        if (!anyAlive) {
            gameState = 'victory';
            showScreen(victoryScreen);
            victoryScoreEl.innerText = score;
        }
    }

    function detectCollisions() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            let collision = false;
            for (let j = aliens.length - 1; j >= 0; j--) {
                const a = aliens[j];
                const b = bullets[i];
                const drawY = a.y + Math.sin((Date.now() + a.x) * 0.003) * 10;
                
                if (b.x < a.x + a.width && b.x + b.width > a.x && b.y < drawY + a.height && b.y + b.height > drawY) {
                    a.health--;
                    if (a.health <= 0) {
                        score += a.isBoss ? 500 : 10;
                        createExplosion(a.x + a.width/2, drawY + a.height/2, a.isBoss ? '#ef4444' : '#c084fc');
                        
                        if (!a.isBoss && Math.random() < 0.15) {
                            const bType = Math.floor(Math.random() * 3);
                            bonuses.push({
                                type: bType,
                                x: a.x + a.width/2 - 15, y: drawY + a.height,
                                width: 30, height: 30, speed: 3 + (level * 0.2)
                            });
                        }
                        aliens.splice(j, 1);
                    } else {
                        createExplosion(b.x, b.y, '#fbbf24', 2);
                    }
                    
                    bullets.splice(i, 1);
                    collision = true;
                    updateUI();
                    break;
                }
            }
        }
    }

    function drawPlayer() {
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
        if (playerImg.complete && playerImg.naturalWidth > 0) {
            ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2, player.y);
            ctx.lineTo(player.x + player.width, player.y + player.height);
            ctx.lineTo(player.x, player.y + player.height);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    function drawAliens() {
        const now = Date.now();
        const animBossImg = Math.floor(now / 500) % 2 === 0 ? bossImg1 : bossImg2;
        
        for (const a of aliens) {
            const drawY = a.y + Math.sin((now + a.x) * 0.003) * 10;
            if (a.isBoss) {
                 if (animBossImg.complete && animBossImg.naturalWidth > 0) {
                     ctx.drawImage(animBossImg, a.x, drawY, a.width, a.height);
                 } else {
                     ctx.fillStyle = '#ef4444'; ctx.fillRect(a.x, drawY, a.width, a.height);
                 }
                 // Health bar
                 ctx.fillStyle = '#ef4444';
                 ctx.fillRect(a.x, drawY - 10, a.width * (a.health / a.maxHealth), 5);
            } else {
                if (a.img && a.img.complete && a.img.naturalWidth > 0) {
                    ctx.drawImage(a.img, a.x, drawY, a.width, a.height);
                } else {
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(a.x, drawY, a.width, a.height);
                }
            }
        }
    }

    function drawBullets() {
        ctx.shadowBlur = 15;
        for (let i = 0; i < bullets.length; i++) {
            ctx.shadowColor = bullets[i].color;
            ctx.fillStyle = bullets[i].color;
            ctx.beginPath();
            ctx.roundRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height, 3);
            ctx.fill();
        }
        ctx.shadowColor = '#f43f5e';
        ctx.fillStyle = '#f43f5e';
        for (let i = 0; i < alienBullets.length; i++) {
            ctx.beginPath();
            ctx.roundRect(alienBullets[i].x, alienBullets[i].y, alienBullets[i].width, alienBullets[i].height, 3);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    function drawParticles() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }

    function updateUI() {
        if(scoreEl) scoreEl.innerText = score;
        if(livesEl) livesEl.innerText = lives;
    }

    function updateBonuses() {
        for (let i = bonuses.length - 1; i >= 0; i--) {
            const b = bonuses[i];
            b.y += b.speed;
            
            if (b.x < player.x + player.width && b.x + b.width > player.x && b.y < player.y + player.height && b.y + b.height > player.y) {
                if (b.type === 0) rapidFireTimer = Date.now() + 5000;
                else if (b.type === 1) lives++;
                else if (b.type === 2) doubleGunTimer = Date.now() + 5000;
                
                bonuses.splice(i, 1);
                score += 50;
                updateUI();
                continue;
            }
            if (b.y > canvas.height) bonuses.splice(i, 1);
        }
    }

    function drawBonuses() {
        for (const b of bonuses) {
            const dropImg = b.type === 0 ? realBaklavaImg : b.type === 1 ? flagImg : ataturkImg;
            const dropColor = b.type === 0 ? 'rgba(251, 191, 36, 0.8)' : b.type === 1 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';
            if (dropImg.complete && dropImg.naturalWidth > 0) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = dropColor;
                ctx.drawImage(dropImg, b.x, b.y, b.width, b.height);
                ctx.shadowBlur = 0;
            } else {
                 ctx.fillStyle = '#fbbf24';
                 ctx.fillRect(b.x, b.y, b.width, b.height);
            }
        }
    }

    function showScreen(screen) {
        document.querySelectorAll('#game-container .screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function gameLoop() {
        // Stop looping if we're not displaying it anymore
        if(!document.getElementById('gameCanvas')) return;
        
        if (gameState === 'playing') {
            if (bgSofiaImg.complete && bgSofiaImg.naturalWidth > 0) {
                ctx.globalAlpha = 0.5;
                ctx.drawImage(bgSofiaImg, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1.0;
                ctx.fillStyle = 'rgba(5, 5, 16, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = 'rgba(5, 5, 16, 0.6)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            updateStars(); drawStars();
            movePlayer(); shootBullet(); updateBullets();
            moveAliens(); manageAlienShooting(); updateAlienBullets();
            updateBonuses(); detectCollisions(); updateParticles();

            drawPlayer(); drawAliens(); drawBullets(); drawBonuses(); drawParticles();
        } else {
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            updateStars(); drawStars();
            
            if (gameState !== 'start') drawPlayer();
        }

        window.siReqId = requestAnimationFrame(gameLoop);
    }

    document.getElementById('start-btn').onclick = () => {
        resetGame(true);
        gameState = 'playing';
        document.querySelectorAll('#game-container .screen').forEach(s => s.classList.remove('active'));
    };

    document.getElementById('restart-btn').onclick = () => {
        resetGame(true);
        gameState = 'playing';
        document.querySelectorAll('#game-container .screen').forEach(s => s.classList.remove('active'));
    };

    document.getElementById('next-level-btn').onclick = () => {
        level++;
        resetGame(false); 
        gameState = 'playing';
        document.querySelectorAll('#game-container .screen').forEach(s => s.classList.remove('active'));
    };

    // Cancel old frame if exists
    if(window.siReqId) cancelAnimationFrame(window.siReqId);
    
    // Start background loop
    window.siReqId = requestAnimationFrame(gameLoop);
};
