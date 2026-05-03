window.initTowerDefense = function(container) {
    console.log("Init Elif Tower Defense - Grid Based");

    container.innerHTML = `
        <div id="td-game" style="position:relative; width:100%; height:80vh; min-height:500px; background:linear-gradient(to bottom, #4CAF50, #81C784); overflow:hidden; border-radius:12px; font-family:'Outfit', sans-serif; cursor:crosshair; user-select: none;">
            
            <!-- Interface -->
            <div style="position:absolute; top:15px; left:20px; z-index:10; display:flex; gap:20px; align-items:center; background:rgba(0,0,0,0.7); padding:10px 20px; border-radius:10px; border:2px solid gold;">
                <div style="color:white; font-size:20px; font-weight:800;">
                    💰 <span id="td-money">200</span>
                </div>
                <div style="color:white; font-size:20px; font-weight:800;">
                    ❤️ <span id="td-lives">20</span>
                </div>
                <div style="color:white; font-size:20px; font-weight:800;">
                    WAVE: <span id="td-wave">1/3</span>
                </div>
                <div style="color:white; font-size:20px; font-weight:800; margin-left:10px;">
                    WORLD <span id="td-world">1</span>
                </div>
            </div>

            <!-- Build Menu / Wave Control -->
            <div style="position:absolute; bottom:15px; left:50%; transform:translateX(-50%); z-index:10; display:flex; gap:10px; background:rgba(0,0,0,0.8); padding:10px; border-radius:10px; border:2px solid #FFD700;">
                <button id="btn-build-1" style="background:#2ecc71; border:2px solid white; color:white; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    Build Normal (100💰)
                </button>
                <button id="btn-build-2" style="background:#e74c3c; border:2px solid white; color:white; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    Build Sniper (150💰)
                </button>
                <button id="btn-start-wave" style="background:#f1c40f; border:2px solid white; color:black; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;">
                    START WAVE 🚀
                </button>
            </div>

            <canvas id="td-canvas" style="display:block; width:100%; height:100%; touch-action:none;"></canvas>
            
        </div>
    `;

    const canvas = document.getElementById('td-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    const onResize = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        if (width === 0) width = window.innerWidth * 0.9;
        if (height === 0) height = window.innerHeight * 0.8;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', onResize);
    onResize();

    // Hide global mobile D-pad since TD uses touch clicks
    const mobileUI = document.getElementById('l2-mobile-controls');
    if (mobileUI) mobileUI.style.display = 'none';

    // === ASSETS ===
    const ASSETS = {
        turretNormal: new Image(),
        turretSniper: new Image(),
        enemyFast: new Image(),
        enemyBoss: new Image()
    };
    ASSETS.turretNormal.src = 'assets/STK-20240715-WA0003 - Copie.webp'; // Normal Elif
    ASSETS.turretSniper.src = 'assets/OwnSticker_20251010_235740731.png.jpg'; // Fire Elif
    ASSETS.enemyFast.src = 'assets/STK-20241108-WA0000.webp'; // Turtle
    ASSETS.enemyBoss.src = 'assets/OwnSticker_20240322_015407147.png.jpg'; // Axe Thrower

    // === GAME STATE ===
    let money = 200;
    let lives = 20;
    let currentWave = 0;
    let currentWorldIndex = 0;
    let isWaveActive = false;
    let score = 0;
    
    const maxWorlds = 6;
    const wavesPerWorld = 3;

    const TILE = 50; // Grid cell size
    let gridCols = Math.floor(width / TILE);
    let gridRows = Math.floor(height / TILE);

    // Map generation: a simple snake path
    let grid = [];
    let path = [];

    function generateMap() {
        gridCols = Math.floor(width / TILE) + 1;
        gridRows = Math.floor(height / TILE) + 1;
        grid = Array(gridRows).fill().map(() => Array(gridCols).fill(0));
        path = [];

        let x = 0;
        let y = 2;
        
        while (x < gridCols) {
            grid[y][x] = 1; // 1 = path
            path.push({cx: x, cy: y});
            
            // Randomly turn
            if (x > 0 && x < gridCols - 2 && x % 4 === 0) {
                let dir = (y < gridRows/2) ? 1 : -1;
                for(let i=0; i<3; i++) {
                    y += dir;
                    if (y >= 0 && y < gridRows) {
                        grid[y][x] = 1;
                        path.push({cx: x, cy: y});
                    } else {
                        y -= dir; break;
                    }
                }
            }
            x++;
        }
    }
    generateMap();

    const turrets = [];
    const enemies = [];
    const projectiles = [];
    
    let spawnTimer = 0;
    let enemiesToSpawn = []; // Queue of enemy objects

    // Update UI Elements
    const uiMoney = document.getElementById('td-money');
    const uiLives = document.getElementById('td-lives');
    const uiWave = document.getElementById('td-wave');
    const uiWorld = document.getElementById('td-world');
    const btnStart = document.getElementById('btn-start-wave');
    
    function updateUI() {
        uiMoney.textContent = money;
        uiLives.textContent = lives;
        uiWave.textContent = \`\${currentWave}/\${wavesPerWorld}\`;
        uiWorld.textContent = currentWorldIndex + 1;
        
        const scoreUI = document.getElementById('l2-score');
        if(scoreUI) scoreUI.textContent = \`SCORE: \${score}\`;
    }

    // === ACTIONS ===
    let selectedBuild = 1; // 1 = Normal, 2 = Sniper
    
    document.getElementById('btn-build-1').onclick = () => selectedBuild = 1;
    document.getElementById('btn-build-2').onclick = () => selectedBuild = 2;

    btnStart.onclick = () => {
        if (isWaveActive) return;
        isWaveActive = true;
        currentWave++;
        updateUI();
        
        // Setup enemies for this wave
        let hpMultiplier = 1 + (currentWorldIndex * 0.5) + (currentWave * 0.2);
        let count = 10 + (currentWorldIndex * 5) + (currentWave * 2);
        
        enemiesToSpawn = [];
        for(let i=0; i<count; i++) {
            let isBoss = (i % 5 === 4);
            enemiesToSpawn.push({
                type: isBoss ? 'boss' : 'fast',
                hp: isBoss ? 50 * hpMultiplier : 15 * hpMultiplier,
                maxHp: isBoss ? 50 * hpMultiplier : 15 * hpMultiplier,
                speed: isBoss ? 1 : 2,
                reward: isBoss ? 15 : 5,
                pathIndex: 0,
                x: path[0].cx * TILE,
                y: path[0].cy * TILE,
                progress: 0
            });
        }
    };

    // Canvas click to build
    canvas.addEventListener('pointerdown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const cx = Math.floor(mouseX / TILE);
        const cy = Math.floor(mouseY / TILE);
        
        if (cx < 0 || cx >= gridCols || cy < 0 || cy >= gridRows) return;
        
        // Cannot build on path or existing turret
        if (grid[cy][cx] !== 0) return;
        
        let cost = selectedBuild === 1 ? 100 : 150;
        if (money >= cost) {
            money -= cost;
            grid[cy][cx] = 2; // 2 = turret
            turrets.push({
                cx: cx,
                cy: cy,
                x: cx * TILE + TILE/2,
                y: cy * TILE + TILE/2,
                type: selectedBuild,
                range: selectedBuild === 1 ? 120 : 200,
                damage: selectedBuild === 1 ? 10 : 30,
                cooldown: selectedBuild === 1 ? 30 : 60,
                timer: 0,
                angle: 0
            });
            updateUI();
        }
    });

    // === MAIN LOOP ===
    let paused = false;
    let reqId;

    function loop() {
        if (!paused) {
            update();
        }
        draw();
        reqId = requestAnimationFrame(loop);
    }

    function update() {
        // Spawn Enemies
        if (isWaveActive && enemiesToSpawn.length > 0) {
            spawnTimer++;
            if (spawnTimer > 40) {
                enemies.push(enemiesToSpawn.shift());
                spawnTimer = 0;
            }
        }

        // Move Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            
            // Find next target node
            let targetNode = path[e.pathIndex];
            let tx = targetNode.cx * TILE;
            let ty = targetNode.cy * TILE;
            
            let dx = tx - e.x;
            let dy = ty - e.y;
            let dist = Math.hypot(dx, dy);
            
            if (dist < e.speed) {
                e.x = tx;
                e.y = ty;
                e.pathIndex++;
                if (e.pathIndex >= path.length) {
                    // Reached end
                    lives--;
                    enemies.splice(i, 1);
                    updateUI();
                    if (lives <= 0) die();
                    continue;
                }
            } else {
                e.x += (dx / dist) * e.speed;
                e.y += (dy / dist) * e.speed;
            }
        }

        // Turret Logic
        turrets.forEach(t => {
            if (t.timer > 0) t.timer--;
            
            // Find target (first enemy in range)
            let target = null;
            let targetDist = t.range;
            
            for (let e of enemies) {
                let d = Math.hypot(e.x - t.x, e.y - t.y);
                if (d < targetDist) {
                    target = e;
                    targetDist = d;
                }
            }
            
            if (target) {
                t.angle = Math.atan2(target.y - t.y, target.x - t.x);
                if (t.timer === 0) {
                    projectiles.push({
                        x: t.x, y: t.y,
                        speed: 8,
                        damage: t.damage,
                        target: target,
                        type: t.type
                    });
                    t.timer = t.cooldown;
                }
            }
        });

        // Projectile Logic
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            if (!enemies.includes(p.target)) {
                // Target died
                projectiles.splice(i, 1);
                continue;
            }
            
            let dx = p.target.x - p.x;
            let dy = p.target.y - p.y;
            let dist = Math.hypot(dx, dy);
            
            if (dist < p.speed) {
                // Hit
                p.target.hp -= p.damage;
                if (p.target.hp <= 0) {
                    money += p.target.reward;
                    score += p.target.reward * 10;
                    updateUI();
                    let idx = enemies.indexOf(p.target);
                    if (idx > -1) enemies.splice(idx, 1);
                }
                projectiles.splice(i, 1);
            } else {
                p.x += (dx / dist) * p.speed;
                p.y += (dy / dist) * p.speed;
            }
        }

        // Check Wave End
        if (isWaveActive && enemiesToSpawn.length === 0 && enemies.length === 0) {
            isWaveActive = false;
            if (currentWave >= wavesPerWorld) {
                // Next World
                currentWorldIndex++;
                if (currentWorldIndex >= maxWorlds) {
                    winGame();
                } else {
                    currentWave = 0;
                    money += 200; // Bonus
                    generateMap();
                    turrets.length = 0;
                    projectiles.length = 0;
                    updateUI();
                    alert(\`🌍 WORLD \${currentWorldIndex + 1} UNLOCKED!\`);
                }
            }
        }
    }

    function die() {
        paused = true;
        alert("💥 BASE DÉTRUITE ! Game Over.");
        if (window.restartL2Game) window.restartL2Game();
    }

    function winGame() {
        paused = true;
        window.addGlobalScore(score + 2000);
        alert("🎉 INCROYABLE ! Tu as défendu tous les mondes !");
        if (window.closeGameLayer) window.closeGameLayer();
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Draw Path
        ctx.fillStyle = 'rgba(255, 204, 153, 0.6)';
        for(let y=0; y<gridRows; y++) {
            for(let x=0; x<gridCols; x++) {
                if (grid[y][x] === 1) {
                    ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
                }
            }
        }

        // Draw Selection Highlighting
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        for(let y=0; y<gridRows; y++) {
            for(let x=0; x<gridCols; x++) {
                ctx.strokeRect(x*TILE, y*TILE, TILE, TILE);
            }
        }

        // Draw Turrets
        turrets.forEach(t => {
            ctx.save();
            ctx.translate(t.x, t.y);
            
            // Draw Range (faintly)
            ctx.beginPath();
            ctx.arc(0, 0, t.range, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();

            // Rotate and draw sprite
            ctx.rotate(t.angle + Math.PI/2);
            let img = t.type === 1 ? ASSETS.turretNormal : ASSETS.turretSniper;
            ctx.drawImage(img, -TILE*0.4, -TILE*0.4, TILE*0.8, TILE*0.8);
            ctx.restore();
        });

        // Draw Enemies
        enemies.forEach(e => {
            let img = e.type === 'fast' ? ASSETS.enemyFast : ASSETS.enemyBoss;
            let s = e.type === 'fast' ? TILE*0.6 : TILE*0.9;
            ctx.drawImage(img, e.x - s/2, e.y - s/2, s, s);

            // Health bar
            ctx.fillStyle = 'red';
            ctx.fillRect(e.x - s/2, e.y - s/2 - 10, s, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(e.x - s/2, e.y - s/2 - 10, s * (e.hp / e.maxHp), 5);
        });

        // Draw Projectiles
        projectiles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.type === 1 ? 4 : 8, 0, Math.PI*2);
            ctx.fillStyle = p.type === 1 ? 'yellow' : 'orange';
            ctx.fill();
        });
    }

    // === GLOBAL HOOKS ===
    window.toggleL2Pause = () => paused = !paused;
    window.restartL2Game = () => {
        if (container._cleanup) container._cleanup();
        window.initTowerDefense(container);
    };

    // === CLEANUP ===
    container._cleanup = function() {
        cancelAnimationFrame(reqId);
        window.removeEventListener('resize', onResize);
        window.toggleL2Pause = null;
        window.restartL2Game = null;
        
        if (mobileUI) mobileUI.style.display = 'flex'; // Reset default
    };

    updateUI();
    reqId = requestAnimationFrame(loop);
};
