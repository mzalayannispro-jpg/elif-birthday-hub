window.initAngryBirds = function(container) {
    container.innerHTML = `
        <div id="angry-game" style="position:relative; width:100%; height:80vh; background:linear-gradient(to bottom, #87CEEB, #E0F6FF); overflow:hidden; border:3px solid var(--gold); border-radius:12px; font-family:'Outfit', sans-serif;">
            
            <!-- Interface -->
            <div style="position:absolute; top:15px; left:20px; z-index:10; display:flex; gap:20px; align-items:center;">
                <div style="color:white; font-size:24px; font-weight:800; text-shadow:2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">
                    SCORE: <span id="ab-pts">0</span>
                </div>
            </div>
            
            <div id="ab-msg" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:gold; font-size:40px; font-weight:800; text-shadow:2px 2px 0 #000; display:none; z-index:20;">
                LEVEL CLEARED!
            </div>

            <!-- Canvas -->
            <canvas id="ab-canvas" style="width:100%; height:100%; display:block; touch-action:none;"></canvas>
            
            <div style="position:absolute; bottom:15px; left:20px; color:white; font-weight:bold; text-shadow:1px 1px 0 #000;">
                Drag the bird back and release to shoot!
            </div>
        </div>
    `;

    const canvas = document.getElementById('ab-canvas');
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
        bird: new Image(),
        enemies: []
    };
    ASSETS.bird.src = 'assets/STK-20241217-WA0053 - Copie.webp'; // Pigeon
    
    // Charger plusieurs stickers pour les ennemis
    const enemyStickers = window.GAME_ASSETS && window.GAME_ASSETS['space-invaders'] ? window.GAME_ASSETS['space-invaders'] : ['assets/OwnSticker_20240322_015407147.png.jpg', 'assets/alien2.webp', 'assets/alien3.webp'];
    for(let i=0; i<3; i++) {
        let img = new Image();
        img.src = enemyStickers[Math.floor(Math.random() * enemyStickers.length)];
        ASSETS.enemies.push(img);
    }

    // ==========================================
    // VARIABLES & PHYSIQUE
    // ==========================================
    let score = 0;
    const gravity = 0.5;
    const friction = 0.8;
    const groundHeight = 100;
    
    let slingshot = { x: 150, y: canvas.height - groundHeight - 120 };
    
    let bird = {
        x: slingshot.x,
        y: slingshot.y,
        radius: 30,
        vx: 0,
        vy: 0,
        isDragging: false,
        isFlying: false,
        hasBounced: false
    };

    let enemies = [];
    let blocks = [];
    let particles = [];
    
    function initLevel() {
        bird.x = slingshot.x;
        bird.y = slingshot.y;
        bird.vx = 0;
        bird.vy = 0;
        bird.isDragging = false;
        bird.isFlying = false;
        bird.hasBounced = false;

        enemies = [];
        blocks = [];

        // Créer une structure (château) plus complexe
        const startX = canvas.width - 350;
        const groundY = canvas.height - groundHeight;

        // Base pillars
        blocks.push({ x: startX, y: groundY - 100, w: 40, h: 100, vx: 0, vy: 0 });
        blocks.push({ x: startX + 100, y: groundY - 100, w: 40, h: 100, vx: 0, vy: 0 });
        blocks.push({ x: startX + 200, y: groundY - 100, w: 40, h: 100, vx: 0, vy: 0 });
        
        // Floor 1
        blocks.push({ x: startX - 20, y: groundY - 140, w: 280, h: 40, vx: 0, vy: 0 }); 
        
        // Floor 2 pillars
        blocks.push({ x: startX + 20, y: groundY - 240, w: 40, h: 100, vx: 0, vy: 0 });
        blocks.push({ x: startX + 140, y: groundY - 240, w: 40, h: 100, vx: 0, vy: 0 });
        
        // Roof
        blocks.push({ x: startX, y: groundY - 280, w: 200, h: 40, vx: 0, vy: 0 }); 

        // Ennemis (Cochons/Méchants) posés sur les blocs
        enemies.push({ x: startX + 50, y: groundY - 140 - 60, radius: 30, vx: 0, vy: 0, dead: false, imgIdx: 0 });
        enemies.push({ x: startX + 150, y: groundY - 140 - 60, radius: 30, vx: 0, vy: 0, dead: false, imgIdx: 1 });
        enemies.push({ x: startX + 80, y: groundY - 280 - 60, radius: 30, vx: 0, vy: 0, dead: false, imgIdx: 2 });
    }

    // ==========================================
    // LOGIQUE PHYSIQUE
    // ==========================================
    function rectIntersectRect(r1, r2) {
        return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);
    }

    function rectIntersect(circle, rect) {
        // Pseudo-collision Cercle/Rectangle (AABB étendu)
        let testX = circle.x;
        let testY = circle.y;
        
        if (circle.x < rect.x) testX = rect.x;
        else if (circle.x > rect.x + rect.w) testX = rect.x + rect.w;
        
        if (circle.y < rect.y) testY = rect.y;
        else if (circle.y > rect.y + rect.h) testY = rect.y + rect.h;
        
        let distX = circle.x - testX;
        let distY = circle.y - testY;
        let distance = Math.sqrt((distX*distX) + (distY*distY));
        
        return distance <= circle.radius;
    }

    function circleIntersect(c1, c2) {
        let dx = c1.x - c2.x;
        let dy = c1.y - c2.y;
        return Math.sqrt(dx*dx + dy*dy) < (c1.radius + c2.radius);
    }

    function update() {
        const groundY = canvas.height - groundHeight;

        if (bird.isFlying) {
            bird.vy += gravity;
            bird.x += bird.vx;
            bird.y += bird.vy;

            // Rebond au sol
            if (bird.y + bird.radius > groundY) {
                bird.y = groundY - bird.radius;
                bird.vy = -bird.vy * 0.5; // Rebond amorti
                bird.vx *= friction;
                bird.hasBounced = true;
            }

            // Arrêt
            if (bird.hasBounced && Math.abs(bird.vx) < 0.5 && Math.abs(bird.vy) < 0.5) {
                // Reset du bird après 2 sec
                setTimeout(() => { if(enemies.some(e=>!e.dead)) { initLevel(); } }, 1500);
                bird.isFlying = false;
                bird.vx = 0; bird.vy = 0;
            }

            // Limites écran
            if (bird.x > canvas.width || bird.x < 0) {
                initLevel();
            }
        }

        // Gravité et chute des blocs et ennemis (Pseudo-Physique Simple)
        for (let b of blocks) {
            b.vy += gravity;
            b.y += b.vy;
            let onGroundOrBlock = false;

            if (b.y + b.h > groundY) {
                b.y = groundY - b.h;
                b.vy = 0;
                onGroundOrBlock = true;
            } else {
                for (let other of blocks) {
                    if (b !== other && rectIntersectRect(b, other)) {
                        if (b.vy >= 0 && b.y + b.h - b.vy <= other.y + 15) { 
                            b.y = other.y - b.h;
                            b.vy = 0;
                            onGroundOrBlock = true;
                        }
                    }
                }
            }
            
            // Collision avec l'oiseau
            if (bird.isFlying && rectIntersect(bird, b)) {
                let impact = Math.abs(bird.vx) + Math.abs(bird.vy);
                b.vx += bird.vx * 0.4;
                b.vy += bird.vy * 0.4;
                bird.vx *= 0.5;
                bird.vy *= 0.5;
                
                if (impact > 8) {
                    // Particules de destruction
                    for(let k=0; k<8; k++) {
                        particles.push({
                            x: b.x + b.w/2, 
                            y: b.y + b.h/2, 
                            vx: (Math.random()-0.5)*15, 
                            vy: (Math.random()-0.5)*15, 
                            life: 25,
                            color: '#8B4513'
                        });
                    }
                }
            }
            
            b.x += b.vx;
            // Amortissement horizontal & collisions latérales
            for (let other of blocks) {
                if (b !== other && rectIntersectRect(b, other)) {
                    let overlapX = (b.x < other.x) ? (b.x + b.w - other.x) : (other.x + other.w - b.x);
                    if (b.x < other.x) { b.x -= overlapX/2; other.x += overlapX/2; }
                    else { b.x += overlapX/2; other.x -= overlapX/2; }
                    let avgVx = (b.vx + other.vx) / 2;
                    b.vx = avgVx * 0.8; other.vx = avgVx * 0.8;
                }
            }
            if(onGroundOrBlock) b.vx *= 0.8;
        }

        // Particules update
        for(let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if(p.life <= 0) particles.splice(i, 1);
        }

        let allDead = true;
        for (let e of enemies) {
            if (e.dead) continue;
            allDead = false;

            e.vy += gravity;
            e.y += e.vy;
            let onGroundOrBlock = false;
            
            if (e.y + e.radius > groundY) {
                e.y = groundY - e.radius;
                e.vy = 0;
                onGroundOrBlock = true;
            } else {
                for (let b of blocks) {
                    if (rectIntersect(e, b)) {
                        if (e.vy >= 0 && e.y < b.y) {
                            e.y = b.y - e.radius;
                            e.vy = 0;
                            onGroundOrBlock = true;
                            e.vx = b.vx; // suit le mouvement du bloc
                        }
                    }
                }
            }
            
            e.x += e.vx;
            if (onGroundOrBlock) e.vx *= 0.8;

            let hitByBird = bird.isFlying && circleIntersect(bird, e);
            let hitByBlock = false;
            for (let b of blocks) {
                if ((Math.abs(b.vx) > 3 || Math.abs(b.vy) > 3) && rectIntersect(e, b)) {
                    hitByBlock = true;
                }
            }

            // Dégâts
            if (hitByBird || hitByBlock) {
                e.dead = true;
                score += 500;
                document.getElementById('ab-pts').textContent = score;
                // Particules ennemi
                for(let k=0; k<15; k++) {
                    particles.push({
                        x: e.x, y: e.y, 
                        vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20, 
                        life: 30, color: '#00FF00'
                    });
                }
            }
        }

        if (allDead && enemies.length > 0) {
            document.getElementById('ab-msg').style.display = 'block';
            if(window.addGlobalScore) window.addGlobalScore(100);
            setTimeout(() => {
                if (window.hideGame) window.hideGame();
            }, 3000);
            enemies = []; // empêche la boucle de boucler
        }
    }

    // ==========================================
    // RENDER
    // ==========================================
    let animId;
    function render() {
        update();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sol
        const groundY = canvas.height - groundHeight;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, groundY, canvas.width, groundHeight);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, groundY, canvas.width, 20);

        // Lance-pierre (Bois)
        ctx.fillStyle = '#5C4033';
        ctx.fillRect(slingshot.x - 10, slingshot.y, 20, groundY - slingshot.y);

        // Élastique (Arrière) et Trajectoire
        if (bird.isDragging) {
            ctx.beginPath();
            ctx.moveTo(slingshot.x - 10, slingshot.y);
            ctx.lineTo(bird.x, bird.y);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#301934';
            ctx.stroke();
            
            // Trajectoire
            ctx.beginPath();
            let simX = bird.x;
            let simY = bird.y;
            let simVX = (slingshot.x - bird.x) * 0.15;
            let simVY = (slingshot.y - bird.y) * 0.15;
            ctx.moveTo(simX, simY);
            for (let i = 0; i < 20; i++) {
                simVY += gravity;
                simX += simVX * 3; // Step 3 frames
                simY += simVY * 3;
                if (simY > groundY) break;
                ctx.lineTo(simX, simY);
            }
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 10]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Blocs
        ctx.fillStyle = '#C19A6B';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        for (let b of blocks) {
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        }

        // Ennemis
        for (let e of enemies) {
            if (e.dead) continue;
            let img = ASSETS.enemies[e.imgIdx];
            if (img && img.complete && img.naturalHeight !== 0) {
                ctx.drawImage(img, e.x - e.radius, e.y - e.radius, e.radius*2, e.radius*2);
            } else {
                ctx.fillStyle = 'green';
                ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();
            }
        }

        // Particules
        for (let p of particles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 30;
            ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Oiseau
        let bImg = ASSETS.bird;
        if (bImg.complete && bImg.naturalHeight !== 0) {
            ctx.drawImage(bImg, bird.x - bird.radius, bird.y - bird.radius, bird.radius*2, bird.radius*2);
        } else {
            ctx.fillStyle = 'red';
            ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI*2); ctx.fill();
        }

        // Élastique (Avant)
        if (bird.isDragging) {
            ctx.beginPath();
            ctx.moveTo(slingshot.x + 10, slingshot.y);
            ctx.lineTo(bird.x, bird.y);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#301934';
            ctx.stroke();
        }

        animId = requestAnimationFrame(render);
    }

    initLevel();
    render();

    // ==========================================
    // CONTROLES SOURIS/TACTILE
    // ==========================================
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function onDown(e) {
        if (bird.isFlying) return;
        const pos = getPos(e);
        const dist = Math.sqrt((pos.x - bird.x)**2 + (pos.y - bird.y)**2);
        if (dist <= bird.radius * 2) {
            bird.isDragging = true;
        }
    }

    function onMove(e) {
        if (!bird.isDragging) return;
        e.preventDefault(); // Empêche le scroll sur mobile
        const pos = getPos(e);
        
        // Limiter la zone de tir (rayon max)
        const maxDrag = 120;
        const dx = pos.x - slingshot.x;
        const dy = pos.y - slingshot.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > maxDrag) {
            bird.x = slingshot.x + (dx / dist) * maxDrag;
            bird.y = slingshot.y + (dy / dist) * maxDrag;
        } else {
            bird.x = pos.x;
            bird.y = pos.y;
        }
    }

    function onUp(e) {
        if (!bird.isDragging) return;
        bird.isDragging = false;
        bird.isFlying = true;
        
        // Calculer la force
        const dx = slingshot.x - bird.x;
        const dy = slingshot.y - bird.y;
        
        bird.vx = dx * 0.15; // Multiplicateur de puissance
        bird.vy = dy * 0.15;
    }

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onUp);

    canvas.addEventListener('touchstart', onDown, {passive: false});
    canvas.addEventListener('touchmove', onMove, {passive: false});
    canvas.addEventListener('touchend', onUp, {passive: false});

    // CLEANUP
    container._cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
    };
};
