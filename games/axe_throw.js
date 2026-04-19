window.initAxeThrow = function(container) {
    if (!container.innerHTML.includes('axe-canvas')) {
        container.innerHTML = `
        <div style="width:95vw; max-width:900px; margin:auto; background:linear-gradient(160deg, #1A0D00, #3B1C00); border:3px solid #D4AF37; border-radius:16px; padding:20px; box-shadow:0 0 40px rgba(212,175,55,0.25); text-align:center; position:relative;">
            <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:24px; letter-spacing:3px;">🪓 UZINAGAZ : L'ÉPREUVE DE LA ROUE</h2>
                <div>
                    <span style="color:#ff4d4d; margin-right:15px; font-weight:bold; font-size:18px;">VIES: <span id="axe-lives">3</span></span>
                    <span style="color:#D4AF37; margin-right:20px; font-weight:bold; font-size:18px;">SCORE: <span id="axe-score">0</span></span>
                    <button onclick="if(window.axeReqId) cancelAnimationFrame(window.axeReqId); hideGame()" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:8px 16px; border-radius:5px; cursor:pointer; font-weight:bold;">← Menu</button>
                </div>
            </header>
            <div style="position:relative; display:inline-block;">
                <canvas id="axe-canvas" width="800" height="600" style="background:#0F0700; border:2px solid #5C3A21; border-radius:8px; cursor:crosshair; box-shadow:inset 0 0 40px rgba(0,0,0,0.8);"></canvas>
                <div id="axe-start-screen" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; border-radius:8px;">
                    <h2 style="color:#D4AF37; font-family:'Cinzel Decorative'; font-size:32px;">BUT : PLANTER LE BOIS !</h2>
                    <p style="color:#ddd; margin-bottom:10px; font-size:18px;">Ne touche surtout pas la personne au centre.</p>
                    <p style="color:#ff4d4d; margin-bottom:30px; font-weight:bold;">Clique ou ESPACE pour lancer.</p>
                    <button id="start-axe-btn" style="background:#8B0000; border:2px solid #D4AF37; color:#fff; padding:15px 30px; font-size:20px; font-family:'Cinzel Decorative'; font-weight:bold; cursor:pointer; border-radius:6px;">JOUER</button>
                </div>
            </div>
        </div>
        `;
    }

    const canvas = document.getElementById('axe-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('axe-score');
    const livesEl = document.getElementById('axe-lives');
    
    let score = 0;
    let lives = 3;
    let gameState = 'start'; // start, playing, gameover
    let axes = []; // flying ones
    let lodgedAxes = []; // lodged in target
    let particles = [];
    let bleeding = 0; // timer
    
    // Images
    const axeImg = new Image(); axeImg.src = 'assets/axe.png';
    const targetBoardImg = new Image(); targetBoardImg.src = 'assets/green_tracksuit.png';
    
    // Explicitly restrict to face stickers
    let faceUrls = [
        'assets/{039CA1E5-BA4D-496F-B625-D9F572C058F9}.png', // Ataturk
        'assets/tetris/82e4f251-83ee-43ac-a13f-ab8f212e5364.webp',
        'assets/tetris/alien2.webp',
        'assets/tetris/f0c20484-97a9-4757-90d2-c4a7088b3cfb.webp',
        'assets/tetris/STK-20240608-WA0032.webp',
        'assets/tetris/09eb6161-134e-43e3-af95-7c8004c45547.webp'
    ];
    const faceImages = faceUrls.map(src => {
        const i = new Image(); i.src = src; return i;
    });

    const WOOD_COLORS = ['#8B5A2B', '#A0522D', '#CD853F', '#D2691E'];
    const BLOOD_COLORS = ['#ff0000', '#cc0000', '#990000', '#660000'];

    // Target properties
    const target = {
        x: canvas.width / 2,
        y: 220,
        radius: 170, // clickable wood radius
        faceImg: null,
        angle: 0,
        dirX: 1,
        speedX: 2.5
    };
    
    let mouseX = canvas.width / 2;
    canvas.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
    };

    function pickFace() {
        target.faceImg = faceImages[Math.floor(Math.random() * faceImages.length)];
    }

    function createParticles(x, y, type) {
        let colors = type === 'wood' ? WOOD_COLORS : BLOOD_COLORS;
        for(let i=0; i<30; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12 + (type === 'blood' ? 2 : 0), // blood falls more
                life: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * (type === 'blood' ? 8 : 5) + 3
            });
        }
    }

    function isHitPerson(dx, dy) {
        // dx, dy respect to target center
        // Roughly mapping the body cross bounds
        if (dx >= -45 && dx <= 45 && dy >= -90 && dy <= -20) return true; // head/neck
        if (dx >= -50 && dx <= 50 && dy >= -20 && dy <= 120) return true; // body
        if (dx >= -140 && dx <= 140 && dy >= -30 && dy <= 30) return true; // arms
        if (dx >= -80 && dx <= 80 && dy >= 100 && dy <= 160) return true; // legs
        return false;
    }

    function throwAxe() {
        if (gameState !== 'playing') return;
        // Limit max flying axes to prevent spam
        if (axes.length > 1) return;
        
        axes.push({ 
            x: mouseX - 25, 
            y: canvas.height - 40, 
            w: 50, h: 50, 
            vy: -20, // faster
            rotation: 0 
        });
    }

    window.axeKeydown = (e) => { if (e.code === 'Space') throwAxe(); };
    document.removeEventListener('keydown', window.oldAxeKeydown);
    window.oldAxeKeydown = window.axeKeydown;
    document.addEventListener('keydown', window.axeKeydown);
    
    // Click on canvas = throw or aim? Just throw from center
    canvas.onmousedown = (e) => { throwAxe(); };

    document.getElementById('start-axe-btn').onclick = () => {
        score = 0; scoreEl.innerText = score;
        lives = 3; livesEl.innerText = lives;
        gameState = 'playing';
        document.getElementById('axe-start-screen').style.display = 'none';
        lodgedAxes = [];
        pickFace();
    };

    function update() {
        if (gameState !== 'playing') return;

        target.x += target.speedX * target.dirX;
        if (target.x > canvas.width - target.radius || target.x < target.radius) {
            target.dirX *= -1;
        }

        if (bleeding > 0) {
            bleeding--;
            // continually add blood if bleeding heavily
            if (bleeding % 5 === 0) {
                 createParticles(target.x + (Math.random()-0.5)*30, target.y - 60, 'blood');
            }
        }

        for (let i = axes.length - 1; i >= 0; i--) {
            let axe = axes[i];
            axe.y += axe.vy;
            axe.rotation += 0.25;

            // Axe tip collision point
            let tipX = axe.x + axe.w/2;
            let tipY = axe.y + axe.h/2; // center of axe sprite

            // Rotate tip coordinates back to check against unrotated board
            // (If we use rotation, we do trig. But target.angle is 0 for now).
            let dx = tipX - target.x;
            let dy = tipY - target.y;
            let dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < target.radius) {
                // Hit the board!
                axes.splice(i, 1);
                
                if (isHitPerson(dx, dy)) {
                    // Ouch! Hit body/face
                    bleeding = 60; // 1 second of heavy bleeding
                    createParticles(tipX, tipY, 'blood');
                    pickFace(); // change face on hit for fun
                    lives--;
                    livesEl.innerText = lives;
                    if (lives <= 0) {
                        gameState = 'start';
                        document.getElementById('axe-start-screen').style.display = 'flex';
                        document.querySelector('#axe-start-screen h2').innerText = "GAME OVER";
                    }
                } else {
                    // Check if hit another axe
                    let hitAxe = false;
                    for (let la of lodgedAxes) {
                         let adx = la.dx - dx; let ady = la.dy - dy;
                         if (Math.sqrt(adx*adx + ady*ady) < 40) { hitAxe = true; break; }
                    }
                    if (hitAxe) {
                         // Hit another axe!
                         lives--;
                         livesEl.innerText = lives;
                         createParticles(tipX, tipY, 'wood');
                         if (lives <= 0) {
                              gameState = 'start';
                              document.getElementById('axe-start-screen').style.display = 'flex';
                              document.querySelector('#axe-start-screen h2').innerText = "GAME OVER";
                         }
                    } else {
                         // Wood!
                         score += 10;
                         scoreEl.innerText = score;
                         if (typeof addGlobalScore === 'function') addGlobalScore(10);
                         createParticles(tipX, tipY, 'wood');
                         // Lodge the axe
                         lodgedAxes.push({ dx, dy, rotation: axe.rotation });
                    }
                }
            } else if (axe.y < -100) {
                // Missed the whole thing
                axes.splice(i, 1);
            }
        }

        for(let i = particles.length - 1; i >= 0; i--) {
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            particles[i].vy += 0.5; // gravity
            particles[i].life -= 0.03;
            if(particles[i].life <= 0) particles.splice(i, 1);
        }
    }

    function draw() {
        ctx.fillStyle = '#0F0700'; ctx.fillRect(0,0,canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(target.x, target.y);
        ctx.rotate(target.angle);

        // Draw Big Target Background
        if (targetBoardImg.complete && targetBoardImg.naturalWidth > 0) {
            // Drawn centered
            ctx.drawImage(targetBoardImg, -200, -200, 400, 400);
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath(); ctx.arc(0, 0, target.radius, 0, Math.PI*2); ctx.fill();
        }

        // Draw the Face (Sticker) on the neck area (approx dy: -80)
        let faceW = 70;
        let faceH = 80;
        if (target.faceImg && target.faceImg.complete && target.faceImg.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, -60, 35, 0, Math.PI*2); 
            ctx.clip(); // Circle clip the face
            if (bleeding > 0) {
                // Red flash tint
                ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                ctx.fillRect(-faceW/2, -60 - faceH/2, faceW, faceH);
                ctx.globalAlpha = 0.8;
            }
            ctx.drawImage(target.faceImg, -faceW/2, -60 - faceH/2, faceW, faceH);
            ctx.restore();
        }

        // Lodged axes
        for(let la of lodgedAxes) {
            ctx.save();
            ctx.translate(la.dx, la.dy);
            ctx.rotate(la.rotation);
            if(axeImg.complete) ctx.drawImage(axeImg, -25, -25, 50, 50);
            ctx.restore();
        }

        ctx.restore(); // end target translation

        // Flying axes
        for(let axe of axes) {
            ctx.save();
            ctx.translate(axe.x + axe.w/2, axe.y + axe.h/2);
            ctx.rotate(axe.rotation);
            if (axeImg.complete) ctx.drawImage(axeImg, -axe.w/2, -axe.h/2, axe.w, axe.h);
            ctx.restore();
        }

        // Particles
        for(let p of particles) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        
        // Aim line
        ctx.strokeStyle = 'rgba(255,100,0,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 15]);
        ctx.beginPath(); ctx.moveTo(mouseX, canvas.height); ctx.lineTo(mouseX, 0); ctx.stroke();
        ctx.setLineDash([]);
    }

    function loop() {
        if (!document.getElementById('axe-canvas')) return; // dom removed
        update();
        draw();
        window.axeReqId = requestAnimationFrame(loop);
    }
    
    if (window.axeReqId) cancelAnimationFrame(window.axeReqId);
    window.axeReqId = requestAnimationFrame(loop);
};
