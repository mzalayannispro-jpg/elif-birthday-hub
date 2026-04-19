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
    // Filter for removing white background
    function removeWhite(imgEl, threshold=240) {
        const off = document.createElement('canvas');
        off.width = imgEl.naturalWidth || imgEl.width || 100;
        off.height = imgEl.naturalHeight || imgEl.height || 100;
        const octx = off.getContext('2d');
        octx.drawImage(imgEl, 0, 0, off.width, off.height);
        try {
            const data = octx.getImageData(0,0,off.width, off.height);
            for(let i=0; i<data.data.length; i+=4) {
                if(data.data[i]>threshold && data.data[i+1]>threshold && data.data[i+2]>threshold) {
                    data.data[i+3] = 0; // make transparent
                }
            }
            octx.putImageData(data, 0, 0);
            return off;
        } catch(e) { return imgEl; } // fallback
    }

    let cleanAxe = null;
    let cleanTarget = null;

    // Images
    const axeImg = new Image(); 
    axeImg.onload = () => { cleanAxe = removeWhite(axeImg, 220); };
    axeImg.src = 'assets/axe.png';
    
    const targetBoardImg = new Image(); 
    targetBoardImg.onload = () => { cleanTarget = removeWhite(targetBoardImg, 245); };
    targetBoardImg.src = 'assets/wooden_dummy.png';
    
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
        y: canvas.height / 2,
        radius: 170, // clickable wood radius
        faceImg: null,
        angle: 0,
        speed: 0.03
    };
    
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    canvas.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
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
                vy: (Math.random() - 0.5) * 12 + (type === 'blood' ? 2 : 0),
                life: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * (type === 'blood' ? 8 : 5) + 3
            });
        }
    }

    function isHitPerson(dx, dy) {
        // dx, dy respect to target center in unrotated coordinates
        if (dx >= -45 && dx <= 45 && dy >= -105 && dy <= -20) return true; // head/neck
        if (dx >= -50 && dx <= 50 && dy >= -20 && dy <= 120) return true; // body
        if (dx >= -140 && dx <= 140 && dy >= -30 && dy <= 30) return true; // arms
        if (dx >= -80 && dx <= 80 && dy >= 100 && dy <= 160) return true; // legs
        return false;
    }

    function throwAxe() {
        if (gameState !== 'playing') return;
        if (axes.length > 0) return; // Prevent spam
        
        let startX = canvas.width / 2;
        let startY = canvas.height;
        axes.push({ 
            startX: startX, startY: startY,
            targetX: mouseX, targetY: mouseY,
            progress: 0, speed: 0.08,
            w: 50, h: 50, 
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

    function gameOver() {
        if (window.showGlobalGameOver) {
            window.showGlobalGameOver(() => {
                document.getElementById('start-axe-btn').click();
            });
        } else {
            gameState = 'start';
            document.getElementById('axe-start-screen').style.display = 'flex';
            document.querySelector('#axe-start-screen h2').innerText = "GAME OVER";
        }
    }

    function winLevel() {
        gameState = 'start';
        document.getElementById('axe-start-screen').style.display = 'flex';
        document.querySelector('#axe-start-screen h2').innerText = "BRAVO ! TU AS GAGNÉ !";
        document.querySelector('#axe-start-screen p').innerText = "Tu as survécu à la Roue !";
    }

    function update() {
        if (gameState !== 'playing') return;

        target.speed = 0.03 + (lodgedAxes.length * 0.003); // accelerates over time
        target.angle += target.speed;

        if (bleeding > 0) {
            bleeding--;
            if (bleeding % 5 === 0) {
                 createParticles(target.x + (Math.random()-0.5)*30, target.y - 60, 'blood');
            }
        }

        for (let i = axes.length - 1; i >= 0; i--) {
            let axe = axes[i];
            axe.progress += axe.speed;
            axe.rotation += 0.5;

            if (axe.progress < 1) continue;

            let tipX = axe.targetX;
            let tipY = axe.targetY;

            let dx = tipX - target.x;
            let dy = tipY - target.y;
            let dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < target.radius) {
                // Hit board. Calculate backwards local coordinates accounting for wheel rotation!
                let unrotX = dx * Math.cos(-target.angle) - dy * Math.sin(-target.angle);
                let unrotY = dx * Math.sin(-target.angle) + dy * Math.cos(-target.angle);

                axes.splice(i, 1);
                
                if (isHitPerson(unrotX, unrotY)) {
                    bleeding = 60;
                    createParticles(tipX, tipY, 'blood');
                    pickFace();
                    lives--;
                    livesEl.innerText = lives;
                    if (lives <= 0) gameOver();
                } else {
                    let hitAxe = false;
                    for (let la of lodgedAxes) {
                         let adx = la.dx - unrotX; let ady = la.dy - unrotY;
                         if (Math.sqrt(adx*adx + ady*ady) < 35) { hitAxe = true; break; }
                    }
                    if (hitAxe) {
                         lives--;
                         livesEl.innerText = lives;
                         createParticles(tipX, tipY, 'wood');
                         if (lives <= 0) gameOver();
                    } else {
                         score += 10;
                         scoreEl.innerText = score;
                         if (typeof addGlobalScore === 'function') addGlobalScore(10);
                         createParticles(tipX, tipY, 'wood');
                         
                         lodgedAxes.push({ dx: unrotX, dy: unrotY, rotation: axe.rotation - target.angle });
                         
                         if (lodgedAxes.length >= 15) {
                             winLevel();
                         }
                    }
                }
            } else {
                axes.splice(i, 1);
                lives--; // Penalty on miss
                livesEl.innerText = lives;
                if (lives <= 0) gameOver();
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

        // Draw wood Cross
        ctx.fillStyle = '#4A2511';
        let crossW = 340, crossH = 40;
        ctx.fillRect(-crossW/2, -crossH/2, crossW, crossH);
        ctx.fillRect(-crossH/2, -crossW/2, crossH, crossW);
        ctx.strokeStyle = '#2B1408';
        ctx.lineWidth = 4;
        ctx.strokeRect(-crossW/2, -crossH/2, crossW, crossH);
        ctx.strokeRect(-crossH/2, -crossW/2, crossH, crossW);

        // Draw Big Target Background (Wooden Dummy)
        if (targetBoardImg.complete && targetBoardImg.naturalWidth > 0) {
            let imgToDraw = cleanTarget || targetBoardImg;
            // Drawn centered
            ctx.drawImage(imgToDraw, -140, -140, 280, 280);
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.beginPath(); ctx.arc(0, 0, target.radius, 0, Math.PI*2); ctx.fill();
        }

        // Draw the Face (Sticker)
        let faceW = 75;
        let faceH = 85;
        let faceOffsetY = -105; // Tête placée plus haute
        if (target.faceImg && target.faceImg.complete && target.faceImg.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, faceOffsetY, 35, 0, Math.PI*2); 
            ctx.clip(); // Circle clip the face
            if (bleeding > 0) {
                // Red flash tint
                ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                ctx.fillRect(-faceW/2, faceOffsetY - faceH/2, faceW, faceH);
                ctx.globalAlpha = 0.8;
            }
            ctx.drawImage(target.faceImg, -faceW/2, faceOffsetY - faceH/2, faceW, faceH);
            ctx.restore();
        }

        let axeToDraw = cleanAxe || axeImg;
        // Lodged axes
        for(let la of lodgedAxes) {
            ctx.save();
            ctx.translate(la.dx, la.dy);
            ctx.rotate(la.rotation);
            if(axeImg.complete) ctx.drawImage(axeToDraw, -25, -25, 50, 50);
            ctx.restore();
        }

        ctx.restore(); // end target translation

        // Flying axes (with proper trajectory)
        for(let axe of axes) {
            ctx.save();
            let curX = axe.startX + (axe.targetX - axe.startX) * axe.progress;
            let curY = axe.startY + (axe.targetY - axe.startY) * axe.progress;
            
            // Add a little parabolic arc (optional, makes it look thrown)
            let arc = Math.sin(axe.progress * Math.PI) * -50; 
            
            ctx.translate(curX, curY + arc);
            ctx.rotate(axe.rotation);
            
            let scale = 1.0 - (axe.progress * 0.2); 
            ctx.scale(scale, scale);
            
            if (axeImg.complete) ctx.drawImage(axeToDraw, -axe.w/2, -axe.h/2, axe.w, axe.h);
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
        
        // Aim Crosshair (Retro style)
        if (gameState === 'playing') {
            ctx.strokeStyle = '#D4AF37';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 4;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(mouseX - 20, mouseY); ctx.lineTo(mouseX + 20, mouseY);
            ctx.moveTo(mouseX, mouseY - 20); ctx.lineTo(mouseX, mouseY + 20);
            ctx.stroke();
            
            // small center hole
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 3, 0, Math.PI*2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
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
