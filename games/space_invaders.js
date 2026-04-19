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
                    <h2>INCOMING THREAT</h2>
                    <p>Use Left/Right arrows to move. Space to shoot.</p>
                    <button id="start-btn">ENGAGE</button>
                </div>
                
                <div id="game-over-screen" class="screen">
                    <img id="lose-img" alt="Defeat" style="max-height:180px; border-radius:12px; margin-bottom: 20px; box-shadow: 0 0 20px rgba(255,0,0,0.5);">
                    <h2>MISSION FAILED</h2>
                    <p>Final Score: <span id="final-score">0</span></p>
                    <button id="restart-btn">TRY AGAIN</button>
                    <button style="margin-top:20px; background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:10px 20px; border-radius:6px; cursor:pointer;" onclick="if(window.siReqId) cancelAnimationFrame(window.siReqId); hideGame();">RETOUR MENU</button>
                </div>
                
                <div id="victory-screen" class="screen">
                    <img id="win-img" alt="Victory" style="max-height:180px; border-radius:12px; margin-bottom: 20px; box-shadow: 0 0 20px rgba(0,255,0,0.5);">
                    <h2 style="font-size:30px; text-align:center;">You Won (my heart babylovebutterfly) 🌹</h2>
                    <p>Final Score: <span id="victory-score">0</span></p>
                    <button id="next-level-btn">NEXT SECTOR</button>
                    <button style="margin-top:20px; background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:10px 20px; border-radius:6px; cursor:pointer;" onclick="if(window.siReqId) cancelAnimationFrame(window.siReqId); hideGame();">RETOUR MENU</button>
                </div>
            </div>
            <canvas id="gameCanvas"></canvas>
        </div>
        `;
    }

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let gameState = 'start'; // start, playing, gameover, victory
    let score = 0;
    let lives = 5;
    let level = 1;

    const playerImg = new Image();
    playerImg.src = 'assets/player.webp';
    const realBaklavaImg = new Image();
    realBaklavaImg.src = 'assets/real_baklava.png';
    const winImg = new Image(); winImg.src = 'assets/win.webp';
    const loseImg = new Image(); loseImg.src = 'assets/lose.webp';

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
        let alienSpeedX = 1.0 + (level * 0.3);
        
        const currentRows = 5 + Math.floor(level / 3);
        const gridWidth = (alienCols * alienWidth) + ((alienCols - 1) * alienPadding);
        const startX = (canvas.width - gridWidth) / 2;

        // Fetch stickers for current level (cap at level 4, beyond that use all stickers)
        // Simple fallback stickers from assets pool
        const stickerPaths = [
            'assets/player.webp', 'assets/win.webp', 'assets/lose.webp', 'assets/baklava.png'
        ];
        potentialImages = stickerPaths;

        for (let r = 0; r < currentRows; r++) {
            for (let c = 0; c < alienCols; c++) {
                // 100% random sticker per alien!
                const randomImgPath = potentialImages[Math.floor(Math.random() * potentialImages.length)];
                const img = new Image();
                img.src = randomImgPath;
                
                aliens.push({
                    x: startX + c * (alienWidth + alienPadding),
                    y: 80 + r * (alienHeight + alienPadding),
                    width: alienWidth,
                    height: alienHeight,
                    status: 1,
                    vx: alienSpeedX,
                    img: img,
                    offsetY: 0,
                    baseY: 80 + r * (alienHeight + alienPadding)
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
            bullets.push({
                x: player.x + player.width / 2 - 3,
                y: player.y - 10,
                width: 6, height: 20, speed: 12,
                color: (now < rapidFireTimer) ? '#fbbf24' : '#4ade80'
            });
            lastShot = now;
            createExplosion(player.x + player.width/2, player.y, (now < rapidFireTimer) ? '#fbbf24' : '#4ade80', 3);
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
                    showScreen(gameOverScreen);
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
            const livingAliens = aliens.filter(a => a.status === 1);
            if (livingAliens.length > 0) {
                const shooter = livingAliens[Math.floor(Math.random() * livingAliens.length)];
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
        let hitEdge = false;
        let anyAlive = false;
        const time = Date.now() / 300;

        for (let i = 0; i < aliens.length; i++) {
            if (aliens[i].status === 1) {
                anyAlive = true;
                aliens[i].x += aliens[i].vx * alienDirX;
                aliens[i].offsetY = Math.sin(time + i * 0.1) * 5;

                if (aliens[i].x + aliens[i].width >= canvas.width - 20 || aliens[i].x <= 20) hitEdge = true;
                
                if (
                    aliens[i].y + aliens[i].height + aliens[i].offsetY > player.y &&
                    aliens[i].x < player.x + player.width &&
                    aliens[i].x + aliens[i].width > player.x
                ) {
                     gameState = 'gameover';
                     showScreen(gameOverScreen);
                     finalScoreEl.innerText = score;
                     return;
                }
                
                if (aliens[i].y > canvas.height - 100) {
                     gameState = 'gameover';
                     showScreen(gameOverScreen);
                     finalScoreEl.innerText = score;
                     return;
                }
            }
        }

        if (hitEdge) {
            alienDirX *= -1;
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].status === 1) {
                    aliens[i].baseY += 40; 
                    aliens[i].y = aliens[i].baseY;
                    aliens[i].vx += 0.1;
                }
            }
        }

        if (!anyAlive) {
            gameState = 'victory';
            showScreen(victoryScreen);
            victoryScoreEl.innerText = score;
            // WIN EVENT: GRANT GLOBAL POINTS
            if (typeof addGlobalScore === 'function') {
                addGlobalScore(100); 
            }
        }
    }

    function detectCollisions() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = 0; j < aliens.length; j++) {
                const a = aliens[j];
                const b = bullets[i];
                
                if (a.status === 1 && b) {
                    const drawY = a.y + a.offsetY;
                    if (
                        b.x < a.x + a.width && b.x + b.width > a.x &&
                        b.y < drawY + a.height && b.y + b.height > drawY
                    ) {
                        a.status = 0;
                        bullets.splice(i, 1);
                        score += 10 * level;
                        updateUI();
                        createExplosion(a.x + a.width/2, drawY + a.height/2, '#c084fc');
                        
                        if (Math.random() < 0.15) {
                            bonuses.push({
                                x: a.x + a.width/2 - 15, y: drawY + a.height,
                                width: 30, height: 30, speed: 3 + (level * 0.2)
                            });
                        }
                        break;
                    }
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
        for (let i = 0; i < aliens.length; i++) {
             if (aliens[i].status === 1) {
                 const a = aliens[i];
                 const drawY = a.y + a.offsetY;
                 
                 ctx.shadowBlur = 15;
                 ctx.shadowColor = 'rgba(255,255,255,0.2)';
                 
                 if (a.img.complete && a.img.naturalWidth > 0) {
                     ctx.drawImage(a.img, a.x, drawY, a.width, a.height);
                 } else {
                     ctx.fillStyle = '#c084fc';
                     ctx.beginPath();
                     ctx.roundRect(a.x, drawY, a.width, a.height, 8);
                     ctx.fill();
                 }
                 ctx.shadowBlur = 0;
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
                rapidFireTimer = Date.now() + 5000;
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
            if (realBaklavaImg.complete && realBaklavaImg.naturalWidth > 0) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
                ctx.drawImage(realBaklavaImg, b.x, b.y, b.width, b.height);
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
            ctx.fillStyle = 'rgba(5, 5, 16, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
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
