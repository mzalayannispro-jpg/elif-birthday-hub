window.initTowerDefense = function(container) {
    container.innerHTML = `
        <div id="td-game" style="position:relative; width:100%; height:80vh; background:linear-gradient(to bottom, #4CAF50, #81C784); overflow:hidden; border:3px solid var(--gold); border-radius:12px; font-family:'Outfit', sans-serif; cursor:crosshair;">
            
            <!-- Interface -->
            <div style="position:absolute; top:15px; left:20px; z-index:10; display:flex; gap:20px; align-items:center; background:rgba(0,0,0,0.5); padding:10px 20px; border-radius:10px; border:2px solid gold;">
                <div style="color:white; font-size:20px; font-weight:800;">
                    💰 <span id="td-money">150</span>
                </div>
                <div style="color:white; font-size:20px; font-weight:800;">
                    ❤️ <span id="td-lives">10</span>
                </div>
                <div style="color:white; font-size:20px; font-weight:800;">
                    VAGUE: <span id="td-wave">1</span>
                </div>
            </div>
            
            <div id="td-msg" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:gold; font-size:40px; font-weight:800; text-shadow:2px 2px 0 #000; display:none; z-index:20; text-align:center;">
                VICTOIRE !<br><span style="font-size:24px; color:white;">+1500 Points</span>
            </div>

            <div style="position:absolute; bottom:15px; left:20px; color:white; font-weight:bold; text-shadow:1px 1px 0 #000; z-index:10; background:rgba(0,0,0,0.5); padding:5px 15px; border-radius:5px;">
                Clique sur l'herbe pour placer une tour (Coût: 50 💰)
            </div>

            <!-- Canvas -->
            <canvas id="td-canvas" style="width:100%; height:100%; display:block; touch-action:none;"></canvas>
            
        </div>
    `;

    const canvas = document.getElementById('td-canvas');
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
        turret: new Image(),
        enemy1: new Image(),
        enemy2: new Image()
    };
    ASSETS.turret.src = 'assets/STK-20240715-WA0003 - Copie.webp'; // Elif (Tour)
    ASSETS.enemy1.src = 'assets/STK-20241108-WA0000.webp'; // Tortue (Lent)
    ASSETS.enemy2.src = 'assets/OwnSticker_20240322_015407147.png.jpg'; // Méchant (Rapide/Fort)

    // ==========================================
    // VARIABLES & ETAT
    // ==========================================
    let money = 150;
    let lives = 10;
    let wave = 1;
    let maxWaves = 5;
    let scoreEarned = 0;
    
    let isGameOver = false;
    let isVictory = false;

    // PATH (Chemin)
    const TILE_SIZE = 60;
    const pathNodes = [
        {x: 0, y: 100},
        {x: 200, y: 100},
        {x: 200, y: 400},
        {x: 500, y: 400},
        {x: 500, y: 150},
        {x: 800, y: 150},
        {x: 800, y: 500},
        {x: 1200, y: 500} // Sortie (adaptatif en fonction de la taille de l'écran)
    ];

    let enemies = [];
    let turrets = [];
    let projectiles = [];
    
    let spawnTimer = 0;
    let enemiesToSpawn = 10;
    let currentEnemyType = 'enemy1';

    // ==========================================
    // LOGIQUE DU JEU
    // ==========================================
    
    function spawnEnemy() {
        if (enemiesToSpawn > 0) {
            enemies.push({
                x: pathNodes[0].x,
                y: pathNodes[0].y,
                type: currentEnemyType,
                hp: currentEnemyType === 'enemy1' ? 50 + wave*10 : 100 + wave*20,
                maxHp: currentEnemyType === 'enemy1' ? 50 + wave*10 : 100 + wave*20,
                speed: currentEnemyType === 'enemy1' ? 1.5 : 2.5,
                targetNode: 1,
                radius: 20
            });
            enemiesToSpawn--;
        } else if (enemies.length === 0 && !isGameOver && !isVictory) {
            // Fin de la vague
            if (wave < maxWaves) {
                wave++;
                document.getElementById('td-wave').textContent = wave;
                enemiesToSpawn = 10 + wave * 5;
                currentEnemyType = wave % 2 === 0 ? 'enemy2' : 'enemy1';
                money += 50 + wave * 10;
                updateUI();
            } else {
                // VICTOIRE
                isVictory = true;
                scoreEarned = 1500;
                if(window.addGlobalScore) window.addGlobalScore(scoreEarned);
                document.getElementById('td-msg').style.display = 'block';
                setTimeout(() => {
                    if (window.hideGame) window.hideGame();
                }, 4000);
            }
        }
    }

    function updateUI() {
        document.getElementById('td-money').textContent = money;
        document.getElementById('td-lives').textContent = lives;
    }

    function dist(x1, y1, x2, y2) {
        return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    }

    function update() {
        if (isGameOver || isVictory) return;

        // Ajuster la fin du chemin en fonction de l'écran
        pathNodes[pathNodes.length-1].x = canvas.width + 100;

        spawnTimer++;
        if (spawnTimer >= 60) {
            spawnEnemy();
            spawnTimer = 0;
        }

        // --- ENNEMIS ---
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            
            if (e.hp <= 0) {
                money += e.type === 'enemy1' ? 10 : 20;
                updateUI();
                enemies.splice(i, 1);
                continue;
            }

            let target = pathNodes[e.targetNode];
            if (!target) {
                // Arrivé à la fin
                lives--;
                updateUI();
                enemies.splice(i, 1);
                
                if (lives <= 0) {
                    isGameOver = true;
                    if(window.showGlobalGameOver) {
                        window.showGlobalGameOver(() => {
                            // Restart
                            money = 150; lives = 10; wave = 1; enemies = []; turrets = []; projectiles = []; isGameOver = false; isVictory = false; updateUI();
                        });
                    }
                }
                continue;
            }

            let dx = target.x - e.x;
            let dy = target.y - e.y;
            let distance = dist(e.x, e.y, target.x, target.y);

            if (distance < e.speed) {
                e.x = target.x;
                e.y = target.y;
                e.targetNode++;
            } else {
                e.x += (dx / distance) * e.speed;
                e.y += (dy / distance) * e.speed;
            }
        }

        // --- TOURELLES ---
        for (let t of turrets) {
            t.cooldown--;
            if (t.cooldown <= 0) {
                // Trouver une cible
                let targetEnemy = null;
                for (let e of enemies) {
                    if (dist(t.x, t.y, e.x, e.y) <= t.range) {
                        targetEnemy = e;
                        break;
                    }
                }
                
                if (targetEnemy) {
                    // Tirer
                    projectiles.push({
                        x: t.x,
                        y: t.y - 20,
                        target: targetEnemy,
                        speed: 10,
                        damage: 25
                    });
                    t.cooldown = 30; // 0.5 seconde à 60fps
                }
            }
        }

        // --- PROJECTILES ---
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            
            if (!enemies.includes(p.target)) {
                projectiles.splice(i, 1);
                continue;
            }

            let dx = p.target.x - p.x;
            let dy = p.target.y - p.y;
            let distance = dist(p.x, p.y, p.target.x, p.target.y);

            if (distance < p.speed) {
                p.target.hp -= p.damage;
                projectiles.splice(i, 1);
            } else {
                p.x += (dx / distance) * p.speed;
                p.y += (dy / distance) * p.speed;
            }
        }
    }

    // ==========================================
    // RENDER
    // ==========================================
    let animId;
    function render() {
        update();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dessiner le chemin
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = TILE_SIZE;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (pathNodes.length > 0) {
            ctx.moveTo(pathNodes[0].x, pathNodes[0].y);
            for (let i = 1; i < pathNodes.length; i++) {
                ctx.lineTo(pathNodes[i].x, pathNodes[i].y);
            }
        }
        ctx.stroke();

        // Dessiner les bordures du chemin (optionnel, pour faire joli)
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = TILE_SIZE + 4;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.beginPath();
        if (pathNodes.length > 0) {
            ctx.moveTo(pathNodes[0].x, pathNodes[0].y);
            for (let i = 1; i < pathNodes.length; i++) {
                ctx.lineTo(pathNodes[i].x, pathNodes[i].y);
            }
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';

        // Tourelles
        for (let t of turrets) {
            // Zone de portée
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.range, 0, Math.PI*2);
            ctx.fill();

            // Image de la tourelle
            if (ASSETS.turret.complete && ASSETS.turret.naturalHeight !== 0) {
                ctx.drawImage(ASSETS.turret, t.x - 30, t.y - 40, 60, 60);
            } else {
                ctx.fillStyle = 'blue';
                ctx.fillRect(t.x - 20, t.y - 20, 40, 40);
            }
        }

        // Ennemis
        for (let e of enemies) {
            let img = e.type === 'enemy1' ? ASSETS.enemy1 : ASSETS.enemy2;
            if (img.complete && img.naturalHeight !== 0) {
                ctx.drawImage(img, e.x - e.radius*1.5, e.y - e.radius*1.5, e.radius*3, e.radius*3);
            } else {
                ctx.fillStyle = e.type === 'enemy1' ? 'green' : 'red';
                ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();
            }

            // Barre de vie
            ctx.fillStyle = 'black';
            ctx.fillRect(e.x - 15, e.y - e.radius - 10, 30, 5);
            ctx.fillStyle = 'red';
            ctx.fillRect(e.x - 15, e.y - e.radius - 10, 30 * (e.hp / e.maxHp), 5);
        }

        // Projectiles
        for (let p of projectiles) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }

        animId = requestAnimationFrame(render);
    }

    render();

    // ==========================================
    // INTERACTIONS
    // ==========================================
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    // Est-ce qu'on clique sur le chemin ?
    function isOnPath(x, y) {
        // Approche simplifiée : on check la distance entre le point et chaque segment
        for (let i = 0; i < pathNodes.length - 1; i++) {
            let p1 = pathNodes[i];
            let p2 = pathNodes[i+1];
            
            let l2 = dist(p1.x, p1.y, p2.x, p2.y)**2;
            if (l2 == 0) continue;
            
            let t = ((x - p1.x) * (p2.x - p1.x) + (y - p1.y) * (p2.y - p1.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            
            let projX = p1.x + t * (p2.x - p1.x);
            let projY = p1.y + t * (p2.y - p1.y);
            
            if (dist(x, y, projX, projY) < TILE_SIZE / 2 + 20) {
                return true;
            }
        }
        return false;
    }

    function onClick(e) {
        if (isGameOver || isVictory) return;
        
        const pos = getPos(e);

        // Vérifier si assez d'argent
        if (money < 50) return;

        // Vérifier qu'on ne place pas sur le chemin
        if (isOnPath(pos.x, pos.y)) return;

        // Vérifier qu'on ne place pas sur une autre tour
        for (let t of turrets) {
            if (dist(pos.x, pos.y, t.x, t.y) < 40) return;
        }

        // Construire
        money -= 50;
        updateUI();
        turrets.push({
            x: pos.x,
            y: pos.y,
            range: 150,
            cooldown: 0
        });
    }

    canvas.addEventListener('click', onClick);

    // CLEANUP
    container._cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
    };
};
