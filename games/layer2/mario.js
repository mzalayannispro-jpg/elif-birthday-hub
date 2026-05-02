window.initMario = function(container) {
    container.innerHTML = `
        <div id="mario-game" style="position:relative; width:100%; height:80vh; background:linear-gradient(to bottom, #87CEEB, #E0F6FF); overflow:hidden; border:3px solid var(--gold); border-radius:12px; font-family:'Outfit', sans-serif;">
            
            <!-- Interface -->
            <div style="position:absolute; top:15px; left:20px; z-index:10; display:flex; gap:20px; align-items:center;">
                <div style="color:white; font-size:24px; font-weight:800; text-shadow:2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">
                    SCORE: <span id="mario-pts">0</span>
                </div>
                <div id="mario-level-ui" style="color:white; font-size:20px; font-weight:bold; text-shadow:2px 2px 0 #000;">
                    Level 1
                </div>
                <div id="mario-state-ui" style="padding:5px 15px; background:rgba(0,0,0,0.5); border:2px solid gold; border-radius:8px; color:gold; font-weight:bold; display:none;">
                    POWER-UP
                </div>
            </div>

            <!-- Canvas -->
            <canvas id="mario-canvas" style="width:100%; height:100%; display:block;"></canvas>
            
            <!-- Controls Mobiles -->
            <div id="mario-controls" style="position:absolute; bottom:20px; width:100%; display:flex; justify-content:center; gap:15px; padding:0 20px;">
                <div style="display:flex; gap:10px;">
                    <button id="btn-left" style="padding:15px 20px; font-size:24px; border-radius:10px; background:rgba(0,0,0,0.6); color:white; border:2px solid white; touch-action:manipulation;">⬅️</button>
                    <button id="btn-right" style="padding:15px 20px; font-size:24px; border-radius:10px; background:rgba(0,0,0,0.6); color:white; border:2px solid white; touch-action:manipulation;">➡️</button>
                </div>
                <div style="display:flex; gap:10px; margin-left:auto;">
                    <button id="btn-throw" style="padding:15px 20px; font-size:24px; border-radius:10px; background:rgba(200,0,0,0.6); color:white; border:2px solid white; touch-action:manipulation; display:none;">🔥</button>
                    <button id="btn-jump" style="padding:15px 20px; font-size:24px; border-radius:10px; background:rgba(0,0,0,0.6); color:white; border:2px solid white; touch-action:manipulation;">⬆️ JUMP</button>
                </div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('mario-canvas');
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // ==========================================
    // ASSETS
    // ==========================================
    const ASSETS = {
        petit: new Image(),
        base: new Image(),
        fire: new Image(),
        ice: new Image(),
        yoshi: new Image(),
        turtle: new Image(),
        axeThrower: new Image(),
        baklava: new Image(),
        princess: new Image()
    };

    // Chemins (avec les nouveaux stickers fournis)
    ASSETS.petit.src = 'assets/STK-20241217-WA0053 - Copie.webp';
    ASSETS.base.src = 'assets/STK-20240715-WA0003 - Copie.webp';
    ASSETS.fire.src = 'assets/OwnSticker_20251010_235740731.png.jpg';
    ASSETS.ice.src = 'assets/sudoku/a9dcfb00-509c-41dd-891f-8a842927fdcf.webp';
    ASSETS.yoshi.src = 'assets/STK-20240627-WA0020 - dddCopie - Copie.png';
    ASSETS.turtle.src = 'assets/STK-20241108-WA0000.webp';
    ASSETS.axeThrower.src = 'assets/OwnSticker_20240322_015407147.png.jpg';
    ASSETS.baklava.src = 'assets/real_baklava.png';
    ASSETS.princess.src = 'assets/STK-20241029-WA0001 - Copie.webp';

    // ==========================================
    // VARIABLES DE JEU
    // ==========================================
    let score = 0;
    let cameraX = 0;
    let frameCount = 0;
    
    const keys = { left: false, right: false, up: false };

    const LEVELS = [
        { name: "Maroc Sahara Merzouga", bgTop: '#FFB347', bgBottom: '#FFCC33', ground: '#C2B280', groundTop: '#E1C699', pFill: '#C2B280', pStroke: '#A08050', length: 4000 },
        { name: "Valencia Science City", bgTop: '#E0F7FA', bgBottom: '#B2EBF2', ground: '#FFFFFF', groundTop: '#80DEEA', pFill: '#E0F7FA', pStroke: '#00BCD4', length: 4500 },
        { name: "Venice", bgTop: '#87CEEB', bgBottom: '#4FC3F7', ground: '#29B6F6', groundTop: '#0288D1', pFill: '#8D6E63', pStroke: '#5D4037', length: 5000 },
        { name: "Costa Brava", bgTop: '#4DD0E1', bgBottom: '#26C6DA', ground: '#BCAAA4', groundTop: '#81C784', pFill: '#A1887F', pStroke: '#795548', length: 5500 },
        { name: "Barcelona", bgTop: '#FFF59D', bgBottom: '#FFEB3B', ground: '#FFAB91', groundTop: '#FF7043', pFill: '#CE93D8', pStroke: '#AB47BC', length: 6000 },
        { name: "Istanbul", bgTop: '#CE93D8', bgBottom: '#AB47BC', ground: '#3F51B5', groundTop: '#303F9F', pFill: '#1A237E', pStroke: '#FFCA28', length: 7000 }
    ];
    let currentLevel = 0;
    let LEVEL_END_X = 4000;
    let levelFinished = false;
    let princess = { x: LEVEL_END_X, y: 0, width: 100, height: 100 };
    const groundHeight = 100;

    const player = {
        x: 100, y: 0, width: 80, height: 80, vx: 0, vy: 0,
        speed: 7, jumpForce: -15, gravity: 0.6, grounded: false,
        state: 'petit', facingRight: true, invulnerableTimer: 0
    };

    let enemies = []; let projectiles = []; let powerups = []; let platforms = []; let coins = []; let clouds = [];

    function loadLevel(index) {
        if(index >= LEVELS.length) return;
        const lvl = LEVELS[index];
        document.getElementById('mario-level-ui').textContent = "Level " + (index+1) + " - " + lvl.name;
        document.getElementById('mario-game').style.background = `linear-gradient(to bottom, ${lvl.bgTop}, ${lvl.bgBottom})`;
        
        LEVEL_END_X = lvl.length;
        princess.x = LEVEL_END_X - 200;
        cameraX = 0;
        frameCount = 0;
        player.x = 100;
        player.y = 0;
        player.vx = 0;
        player.vy = 0;
        levelFinished = false;
        
        enemies = []; projectiles = []; powerups = []; platforms = []; coins = []; clouds = [];
        
        // Generate Platforms
        for(let x = 300; x < LEVEL_END_X - 800; x += 400 + Math.random()*300) {
            platforms.push({x: x, y: canvas.height - 200 - Math.random()*250, w: 100 + Math.random()*150, h: 20});
        }
        for(let i=0; i<30 + index*5; i++) {
            coins.push({ x: 400 + Math.random() * (LEVEL_END_X-800), y: canvas.height - 150 - Math.random() * 300, radius: 15, collected: false });
        }
        for(let i=0; i<20; i++) {
            clouds.push({ x: Math.random() * LEVEL_END_X, y: 50 + Math.random() * 200, width: 100 + Math.random() * 100, speed: 0.2 + Math.random() * 0.5 });
        }
    }

    // Génération d'ennemis
    function spawnEnemy() {
        const type = Math.random() > 0.3 ? 'turtle' : 'axeThrower';
        enemies.push({
            type: type,
            x: cameraX + canvas.width + 50,
            y: canvas.height - groundHeight - 70,
            width: 70,
            height: 70,
            vx: type === 'turtle' ? -2 : -1,
            vy: 0,
            throwTimer: 0
        });
    }

    // Génération de power-up (Baklava)
    function spawnPowerup() {
        powerups.push({
            x: cameraX + canvas.width + 50,
            y: canvas.height - groundHeight - 150, // en l'air
            width: 50,
            height: 50,
            vx: -3, // rebondit vers Mario
            vy: 0
        });
    }

    // ==========================================
    // LOGIQUE PHYSIQUE
    // ==========================================
    function rectIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.width || 
                 r2.x + r2.width < r1.x || 
                 r2.y > r1.y + r1.height ||
                 r2.y + r2.height < r1.y);
    }

    let nextShootType = 'fire';

    function shoot() {
        if (player.state === 'petit' || player.state === 'base' || player.state === 'yoshi') return;
        
        projectiles.push({
            type: nextShootType, // alternance fire/ice
            x: player.facingRight ? player.x + player.width : player.x - 20,
            y: player.y + player.height / 2 - 10,
            width: 20,
            height: 20,
            vx: player.facingRight ? 10 : -10,
            vy: 0,
            fromPlayer: true
        });

        // Alterne la prochaine munition
        nextShootType = nextShootType === 'fire' ? 'ice' : 'fire';
    }

    // ==========================================
    // BOUCLE PRINCIPALE
    // ==========================================
    let animId;
    function update() {
        frameCount++;

        // 1. Joueur Mouvement
        let activeSpeed = player.state === 'yoshi' ? player.speed * 1.5 : player.speed;
        let activeJump = player.state === 'yoshi' ? player.jumpForce * 1.3 : player.jumpForce;
        let activeGravity = player.state === 'yoshi' ? player.gravity * 0.7 : player.gravity;

        if (keys.left) { player.vx = -activeSpeed; player.facingRight = false; }
        else if (keys.right) { player.vx = activeSpeed; player.facingRight = true; }
        else { player.vx = 0; }

        if (keys.up && player.grounded) {
            player.vy = activeJump;
            player.grounded = false;
        }

        player.vy += activeGravity;
        player.x += player.vx;
        player.y += player.vy;

        // Limites du joueur
        if (player.x < cameraX) player.x = cameraX; // Ne pas reculer hors écran
        
        // Caméra suit le joueur
        if (player.x > cameraX + canvas.width / 3) {
            cameraX = player.x - canvas.width / 3;
        }

        // Plateformes Collision
        let onPlatform = false;
        for(let p of platforms) {
            if (player.vy >= 0 && 
                player.x + player.width > p.x && 
                player.x < p.x + p.w && 
                player.y + player.height >= p.y &&
                player.y + player.height - player.vy <= p.y + 15) {
                
                player.y = p.y - player.height;
                player.vy = 0;
                player.grounded = true;
                onPlatform = true;
            }
        }

        // Sol
        const groundY = canvas.height - groundHeight;
        if (!onPlatform && player.y + player.height > groundY) {
            player.y = groundY - player.height;
            player.vy = 0;
            player.grounded = true;
        }

        // Pièces (Coins)
        for(let c of coins) {
            if(!c.collected) {
                let dx = (player.x + player.width/2) - c.x;
                let dy = (player.y + player.height/2) - c.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < c.radius + player.width/2) {
                    c.collected = true;
                    score += 10;
                    document.getElementById('mario-pts').textContent = score;
                }
            }
        }

        if (player.invulnerableTimer > 0) player.invulnerableTimer--;

        // 2. Spawn d'ennemis (Seulement si on n'est pas trop près de la fin)
        if (frameCount % Math.max(40, 120 - currentLevel * 10) === 0 && cameraX < LEVEL_END_X - 600) { 
            spawnEnemy();
        }

        // 2.5 Spawn de Baklavas
        if (frameCount % 800 === 0 && cameraX < LEVEL_END_X - 600) { 
            spawnPowerup();
        }

        // 2.8 Check Princesse (Fin de niveau)
        princess.y = canvas.height - groundHeight - princess.height;
        if (!levelFinished && player.x > LEVEL_END_X - canvas.width) {
            if (rectIntersect(player, princess)) {
                levelFinished = true;
                score += 250;
                document.getElementById('mario-pts').textContent = score;
                if(window.addGlobalScore) window.addGlobalScore(250);
                triggerWinAnimation();
                return; // Stop update loop
            }
        }

        // 3. Update Ennemis
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            e.x += e.vx;
            
            // Axe Thrower attaque
            if (e.type === 'axeThrower') {
                e.throwTimer++;
                if (e.throwTimer > 100) {
                    e.throwTimer = 0;
                    projectiles.push({
                        type: 'axe',
                        x: e.x,
                        y: e.y,
                        width: 30,
                        height: 30,
                        vx: -5,
                        vy: -8, // Arc parabolique
                        fromPlayer: false
                    });
                }
            }

            // Nettoyage hors écran
            if (e.x < cameraX - 200) {
                enemies.splice(i, 1);
                continue;
            }

            // Collision avec joueur
            if (player.invulnerableTimer === 0 && rectIntersect(player, e)) {
                // Le joueur tombe sur l'ennemi (saut)
                if (player.vy > 0 && player.y + player.height < e.y + e.height / 2) {
                    // Ennemi tué par écrasement
                    enemies.splice(i, 1);
                    player.vy = player.jumpForce * 0.7; // Rebond
                    score += 50;
                    document.getElementById('mario-pts').textContent = score;
                } else {
                    // Dégât reçu
                    if (player.state === 'fire' || player.state === 'ice' || player.state === 'yoshi') {
                        player.state = 'base'; // Perd le power-up
                        player.invulnerableTimer = 60;
                        updateUI();
                    } else if (player.state === 'base') {
                        player.state = 'petit';
                        player.invulnerableTimer = 60;
                        updateUI();
                    } else {
                        // GAME OVER
                        addGlobalScore(score); // Ajoute au vrai score
                        showGlobalGameOver(() => {
                            // Restart callback
                            score = 0;
                            cameraX = 0;
                            player.x = 100;
                            player.y = 0;
                            player.state = 'petit';
                            enemies = [];
                            projectiles = [];
                        });
                        return; // Stop update loop
                    }
                }
            }
        }

        // 3.5 Update Powerups (Baklavas)
        for (let i = powerups.length - 1; i >= 0; i--) {
            let p = powerups[i];
            p.x += p.vx;
            p.vy += player.gravity * 0.6; // Gravité pour rebondir
            p.y += p.vy;

            // Rebond au sol
            const groundYLocal = canvas.height - groundHeight;
            if (p.y + p.height > groundYLocal) {
                p.y = groundYLocal - p.height;
                p.vy = -12; // Rebond vers le haut
            }

            // Nettoyage hors écran
            if (p.x < cameraX - 100) {
                powerups.splice(i, 1);
                continue;
            }

            // Manger le Baklava
            if (rectIntersect(player, p)) {
                powerups.splice(i, 1);
                score += 150;
                document.getElementById('mario-pts').textContent = score;

                // Evolution de Mario
                if (player.state === 'petit') {
                    player.state = 'base';
                } else if (player.state === 'base') {
                    const powers = ['fire', 'ice', 'yoshi'];
                    player.state = powers[Math.floor(Math.random() * powers.length)];
                }
                updateUI();
            }
        }

        // 4. Update Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            p.x += p.vx;
            if (p.type === 'axe') {
                p.vy += 0.4; // Gravité pour la hache
            }
            p.y += p.vy;

            let destroyed = false;

            // Sortie d'écran
            if (p.x < cameraX - 100 || p.x > cameraX + canvas.width + 100 || p.y > canvas.height) {
                destroyed = true;
            }

            // Si c'est un tir du joueur
            if (!destroyed && p.fromPlayer) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    if (rectIntersect(p, enemies[j])) {
                        enemies.splice(j, 1);
                        score += 100;
                        document.getElementById('mario-pts').textContent = score;
                        destroyed = true;
                        break;
                    }
                }
            } 
            else if (!destroyed && !p.fromPlayer) {
                if (player.invulnerableTimer === 0 && rectIntersect(p, player)) {
                    if (player.state === 'fire' || player.state === 'ice' || player.state === 'yoshi') {
                        player.state = 'base';
                        player.invulnerableTimer = 60;
                        updateUI();
                    } else if (player.state === 'base') {
                        player.state = 'petit';
                        player.invulnerableTimer = 60;
                        updateUI();
                    } else {
                        addGlobalScore(score);
                        showGlobalGameOver(() => {
                            score = 0; cameraX = 0; player.x = 100; player.y = 0; player.state = 'petit'; enemies = []; projectiles = [];
                        });
                        return;
                    }
                    destroyed = true;
                }
            }

            if (destroyed) {
                projectiles.splice(i, 1);
            }
        }

        // ==========================================
        // DESSIN (RENDER)
        // ==========================================
        ctx.save();
        ctx.translate(-cameraX, 0);

        // Nuages (Parallax)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let c of clouds) {
            c.x -= c.speed; // Déplacement lent
            if (c.x + c.width < cameraX) c.x = cameraX + canvas.width + 100; // Repop
            if (c.x > cameraX - 200 && c.x < cameraX + canvas.width) {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.width / 2, 0, Math.PI * 2);
                ctx.arc(c.x + c.width * 0.4, c.y - 10, c.width / 2.5, 0, Math.PI * 2);
                ctx.arc(c.x + c.width * 0.8, c.y, c.width / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Sol
        ctx.fillStyle = LEVELS[currentLevel].ground;
        ctx.fillRect(cameraX, groundY, canvas.width, groundHeight);
        ctx.fillStyle = LEVELS[currentLevel].groundTop;
        ctx.fillRect(cameraX, groundY, canvas.width, 20);

        // Plateformes
        ctx.fillStyle = LEVELS[currentLevel].pFill;
        ctx.strokeStyle = LEVELS[currentLevel].pStroke;
        ctx.lineWidth = 3;
        for(let p of platforms) {
            if (p.x + p.w > cameraX && p.x < cameraX + canvas.width) {
                ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.strokeRect(p.x, p.y, p.w, p.h);
            }
        }

        // Pièces
        ctx.fillStyle = 'gold';
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        for(let c of coins) {
            if(!c.collected && c.x + c.radius > cameraX && c.x - c.radius < cameraX + canvas.width) {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.radius, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
                // Inner ring
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.radius - 5, 0, Math.PI*2);
                ctx.stroke();
            }
        }

        // Dessiner le joueur (clignote si invulnérable)
        if (player.invulnerableTimer % 10 < 5) {
            let img = ASSETS[player.state];
            let drawWidth = player.width;
            let drawHeight = player.height;
            if (player.state === 'petit') {
                drawWidth = 50; drawHeight = 50;
            }
            if (img.complete && img.naturalHeight !== 0) {
                ctx.save();
                if (!player.facingRight) {
                    ctx.translate(player.x + drawWidth, player.y + (player.height - drawHeight));
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
                } else {
                    ctx.drawImage(img, player.x, player.y + (player.height - drawHeight), drawWidth, drawHeight);
                }
                ctx.restore();
            } else {
                ctx.fillStyle = player.state === 'fire' ? 'red' : 'blue';
                ctx.fillRect(player.x, player.y + (player.height - drawHeight), drawWidth, drawHeight);
            }
        }

        // Dessiner Ennemis
        for (let e of enemies) {
            let img = ASSETS[e.type];
            if (img.complete && img.naturalHeight !== 0) {
                ctx.drawImage(img, e.x, e.y, e.width, e.height);
            } else {
                ctx.fillStyle = e.type === 'turtle' ? 'green' : 'black';
                ctx.fillRect(e.x, e.y, e.width, e.height);
            }
        }

        // Dessiner Projectiles
        for (let p of projectiles) {
            if (p.type === 'fire') {
                ctx.fillStyle = '#FF4500';
                ctx.beginPath(); ctx.arc(p.x+p.width/2, p.y+p.height/2, p.width/2, 0, Math.PI*2); ctx.fill();
            } else if (p.type === 'ice') {
                ctx.fillStyle = '#00FFFF';
                ctx.beginPath(); ctx.arc(p.x+p.width/2, p.y+p.height/2, p.width/2, 0, Math.PI*2); ctx.fill();
            } else if (p.type === 'axe') {
                ctx.fillStyle = '#666';
                ctx.fillRect(p.x, p.y, p.width, p.height);
            }
        }

        // Dessiner Baklavas
        for (let p of powerups) {
            let img = ASSETS.baklava;
            if (img.complete && img.naturalHeight !== 0) {
                ctx.drawImage(img, p.x, p.y, p.width, p.height);
            } else {
                ctx.fillStyle = 'orange';
                ctx.fillRect(p.x, p.y, p.width, p.height);
            }
        }

        // Dessiner la Princesse à la fin
        if (player.x > LEVEL_END_X - canvas.width) {
            let img = ASSETS.princess;
            if (img.complete && img.naturalHeight !== 0) {
                ctx.drawImage(img, princess.x, princess.y, princess.width, princess.height);
            } else {
                ctx.fillStyle = 'pink';
                ctx.fillRect(princess.x, princess.y, princess.width, princess.height);
            }
        }

        ctx.restore();

        animId = requestAnimationFrame(update);
    }

    function triggerWinAnimation() {
        keys.left = false; keys.right = false; keys.up = false;
        
        let hearts = [];
        for(let i=0; i<30; i++) {
            hearts.push({
                x: princess.x + 40 + (Math.random()-0.5)*100,
                y: princess.y + (Math.random()-0.5)*100,
                vx: (Math.random()-0.5)*4,
                vy: -Math.random()*5 - 2,
                size: Math.random()*20 + 10
            });
        }
        
        let winFrame = 0;
        function winLoop() {
            winFrame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(-cameraX, 0);

            const groundYLocal = canvas.height - groundHeight;
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(cameraX, groundYLocal, canvas.width, groundHeight);
            ctx.fillStyle = '#228B22';
            ctx.fillRect(cameraX, groundYLocal, canvas.width, 20);

            // Joueur & Princesse
            let drawWidth = player.state === 'petit' ? 50 : 80;
            let drawHeight = player.state === 'petit' ? 50 : 80;
            ctx.drawImage(ASSETS[player.state], player.x, player.y + (player.height - drawHeight), drawWidth, drawHeight);
            ctx.drawImage(ASSETS.princess, princess.x, princess.y, princess.width, princess.height);

            // Coeurs
            ctx.fillStyle = 'red';
            for(let h of hearts) {
                h.x += h.vx;
                h.y += h.vy;
                ctx.font = h.size + "px Arial";
                ctx.fillText("❤️", h.x, h.y);
            }

            ctx.restore();

            // Message
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, canvas.height/2 - 60, canvas.width, 120);
            ctx.fillStyle = 'gold';
            ctx.font = 'bold 40px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText("LEVEL CLEARED !", canvas.width/2, canvas.height/2);
            ctx.fillStyle = 'white';
            ctx.font = '20px Outfit';
            ctx.fillText("+250 Points !", canvas.width/2, canvas.height/2 + 40);

            if (winFrame < 180) {
                animId = requestAnimationFrame(winLoop);
            } else {
                currentLevel++;
                if (currentLevel < LEVELS.length) {
                    loadLevel(currentLevel);
                    animId = requestAnimationFrame(update); // Resume game loop
                } else {
                    if(window.addGlobalScore) window.addGlobalScore(1000); // Bonus fin
                    alert(window.t ? window.t("inst.mario_win", "Congratulations! You finished the Super Elif World Tour!") : "Congratulations!");
                    if (window.hideGame) window.hideGame();
                }
            }
        }
        winLoop();
    }

    function updateUI() {
        const throwBtn = document.getElementById('btn-throw');
        const stateUI = document.getElementById('mario-state-ui');
        if (player.state === 'fire' || player.state === 'ice') {
            throwBtn.style.display = 'block';
            throwBtn.textContent = player.state === 'fire' ? '🔥' : '❄️';
            stateUI.style.display = 'block';
            stateUI.textContent = player.state.toUpperCase();
        } else if (player.state === 'yoshi') {
            throwBtn.style.display = 'none';
            stateUI.style.display = 'block';
            stateUI.textContent = "YOSHI !";
        } else {
            throwBtn.style.display = 'none';
            stateUI.style.display = 'none';
        }
    }

    loadLevel(0);
    updateUI();

    // ==========================================
    // CONTROLES
    // ==========================================
    const btnJump = document.getElementById('btn-jump');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnThrow = document.getElementById('btn-throw');

    const evOptions = { passive: false };

    btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); keys.up = true; }, evOptions);
    btnJump.addEventListener('mousedown', (e) => { e.preventDefault(); keys.up = true; });
    btnJump.addEventListener('touchend', (e) => { e.preventDefault(); keys.up = false; }, evOptions);
    btnJump.addEventListener('mouseup', (e) => { e.preventDefault(); keys.up = false; });

    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys.left = true; }, evOptions);
    btnLeft.addEventListener('mousedown', (e) => { e.preventDefault(); keys.left = true; });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys.left = false; }, evOptions);
    btnLeft.addEventListener('mouseup', (e) => { e.preventDefault(); keys.left = false; });
    btnLeft.addEventListener('mouseleave', (e) => { e.preventDefault(); keys.left = false; });

    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys.right = true; }, evOptions);
    btnRight.addEventListener('mousedown', (e) => { e.preventDefault(); keys.right = true; });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys.right = false; }, evOptions);
    btnRight.addEventListener('mouseup', (e) => { e.preventDefault(); keys.right = false; });
    btnRight.addEventListener('mouseleave', (e) => { e.preventDefault(); keys.right = false; });

    btnThrow.addEventListener('touchstart', (e) => { e.preventDefault(); shoot(); }, evOptions);
    btnThrow.addEventListener('mousedown', (e) => { e.preventDefault(); shoot(); });

    const handleKeyDown = (e) => {
        if(e.code === 'Space' || e.code === 'ArrowUp') keys.up = true;
        if(e.code === 'ArrowLeft') keys.left = true;
        if(e.code === 'ArrowRight') keys.right = true;
        if(e.code === 'KeyF') shoot();
    };
    const handleKeyUp = (e) => {
        if(e.code === 'Space' || e.code === 'ArrowUp') keys.up = false;
        if(e.code === 'ArrowLeft') keys.left = false;
        if(e.code === 'ArrowRight') keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // CLEANUP
    window.marioReqId = animId;
    container._cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
};
