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
                    WAVE: <span id="td-wave">1</span>
                </div>
                <div style="color:white; font-size:20px; font-weight:800; margin-left:10px;">
                    WORLD <span id="td-world">1</span>
                </div>
            </div>
            
            <div id="td-msg" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:gold; font-size:40px; font-weight:800; text-shadow:2px 2px 0 #000; display:none; z-index:20; text-align:center;">
                VICTORY!<br><span style="font-size:24px; color:white;">+1500 Points</span>
            </div>

            <div style="position:absolute; bottom:15px; left:20px; color:white; font-weight:bold; text-shadow:1px 1px 0 #000; z-index:10; background:rgba(0,0,0,0.5); padding:5px 15px; border-radius:5px;">
                Click on the grass to build a tower (Cost: 50 💰)
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
    let maxWaves = 18; // 6 worlds * 3 waves
    let scoreEarned = 0;
    
    let isGameOver = false;
    let isVictory = false;
    let isTransitioning = false;

    // WORLDS (Mondes)
    const WORLDS = [
        { name: "Maroc Sahara Merzouga", bgTop: '#FFB347', bgBottom: '#FFCC33', path: [ {x:0,y:100}, {x:200,y:100}, {x:200,y:400}, {x:500,y:400}, {x:500,y:150}, {x:800,y:150}, {x:800,y:500}, {x:1200,y:500} ] },
        { name: "Valencia Science City", bgTop: '#E0F7FA', bgBottom: '#B2EBF2', path: [ {x:0,y:300}, {x:300,y:300}, {x:300,y:100}, {x:700,y:100}, {x:700,y:400}, {x:1000,y:400}, {x:1000,y:500}, {x:1200,y:500} ] },
        { name: "Venice", bgTop: '#87CEEB', bgBottom: '#4FC3F7', path: [ {x:0,y:400}, {x:300,y:400}, {x:300,y:200}, {x:600,y:200}, {x:600,y:500}, {x:900,y:500}, {x:900,y:100}, {x:1200,y:100} ] },
        { name: "Costa Brava", bgTop: '#4DD0E1', bgBottom: '#26C6DA', path: [ {x:0,y:300}, {x:500,y:300}, {x:500,y:500}, {x:200,y:500}, {x:200,y:150}, {x:800,y:150}, {x:800,y:300}, {x:1200,y:300} ] },
        { name: "Barcelona", bgTop: '#FFF59D', bgBottom: '#FFEB3B', path: [ {x:0,y:250}, {x:600,y:250}, {x:600,y:50}, {x:900,y:50}, {x:900,y:450}, {x:400,y:450}, {x:400,y:600}, {x:1200,y:600} ] },
        { name: "Istanbul", bgTop: '#CE93D8', bgBottom: '#AB47BC', path: [ {x:0,y:150}, {x:400,y:150}, {x:400,y:450}, {x:700,y:450}, {x:700,y:200}, {x:1000,y:200}, {x:1000,y:500}, {x:1200,y:500} ] }
    ];

    let currentWorldIndex = 0;
    const TILE_SIZE = 60;
    let pathNodes = JSON.parse(JSON.stringify(WORLDS[0].path));

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
        } else if (enemies.length === 0 && !isGameOver && !isVictory && !isTransitioning) {
            if (wave % 3 === 0 && wave < maxWaves) {
                // CHANGEMENT DE MONDE
                isTransitioning = true;
                currentWorldIndex++;
                let refund = turrets.length * 50;
                money += refund + 300; // Remboursement tours + Bonus de monde
                turrets = [];
                projectiles = [];
                
                document.getElementById('td-msg').innerHTML = `WORLD CLEARED !<br><span style="font-size:24px; color:white;">Traveling to World ${currentWorldIndex + 1}...</span><br><span style="font-size:20px; color:#4CAF50;">Towers sold: +${refund} 💰</span>`;
                document.getElementById('td-msg').style.display = 'block';
                updateUI();
                
                setTimeout(() => {
                    document.getElementById('td-msg').style.display = 'none';
                    pathNodes = JSON.parse(JSON.stringify(WORLDS[currentWorldIndex].path));
                    document.getElementById('td-game').style.background = `linear-gradient(to bottom, ${WORLDS[currentWorldIndex].bgTop}, ${WORLDS[currentWorldIndex].bgBottom})`;
                    document.getElementById('td-world').textContent = (currentWorldIndex + 1);
                    
                    wave++;
                    document.getElementById('td-wave').textContent = wave;
                    enemiesToSpawn = 10 + wave * 5;
                    currentEnemyType = wave % 2 === 0 ? 'enemy2' : 'enemy1';
                    money += 50 + wave * 10;
                    updateUI();
                    isTransitioning = false;
                }, 4000);
            } else if (wave < maxWaves) {
                // VAGUE SUIVANTE DANS LE MEME MONDE
                wave++;
                document.getElementById('td-wave').textContent = wave;
                enemiesToSpawn = 10 + wave * 5;
                currentEnemyType = wave % 2 === 0 ? 'enemy2' : 'enemy1';
                money += 50 + wave * 10;
                updateUI();
            } else {
                // VICTOIRE FINALE
                isVictory = true;
                scoreEarned = 1500;
                if(window.addGlobalScore) window.addGlobalScore(500); // Gros bonus final
                document.getElementById('td-msg').innerHTML = `VICTORY!<br><span style="font-size:24px; color:white;">+500 Points</span>`;
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
        if (isGameOver || isVictory || isTransitioning) return;

        // Ajuster la fin du chemin en fonction de l'écran pour être sûr qu'ils sortent
        if (pathNodes.length > 0) {
            let lastNode = pathNodes[pathNodes.length-1];
            if(lastNode.x === 1200) lastNode.x = canvas.width + 100;
        }

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
                            money = 150; lives = 10; wave = 1; enemies = []; turrets = []; projectiles = []; isGameOver = false; isVictory = false; isTransitioning = false;
                            currentWorldIndex = 0;
                            pathNodes = JSON.parse(JSON.stringify(WORLDS[0].path));
                            document.getElementById('td-game').style.background = `linear-gradient(to bottom, ${WORLDS[0].bgTop}, ${WORLDS[0].bgBottom})`;
                            document.getElementById('td-world').textContent = "1 - " + WORLDS[0].name;
                            updateUI();
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
                        startX: t.x,
                        startY: t.y - 20,
                        x: t.x,
                        y: t.y - 20,
                        target: targetEnemy,
                        speed: 15,
                        damage: 30
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
        // Dessiner le chemin (Route claire bordée)
        ctx.beginPath();
        if(pathNodes.length > 0) {
            ctx.moveTo(pathNodes[0].x, pathNodes[0].y);
            for (let i = 1; i < pathNodes.length; i++) {
                ctx.lineTo(pathNodes[i].x, pathNodes[i].y);
            }
        }
        
        // Bordure sombre
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 44;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#8D6E63';
        ctx.stroke();
        
        // Intérieur clair
        ctx.lineWidth = 36;
        ctx.strokeStyle = '#E3C598';
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

        // Projectiles (Lasers)
        for (let p of projectiles) {
            ctx.beginPath();
            ctx.moveTo(p.startX, p.startY);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            // Laser head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
            ctx.fill();
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
