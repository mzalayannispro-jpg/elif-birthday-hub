window.initAxeThrow = function(container) {
    if (!container.innerHTML.includes('axe-canvas')) {
        container.innerHTML = `
        <div style="width:95vw; max-width:900px; margin:auto; background:linear-gradient(160deg, #1A0D00, #3B1C00); border:3px solid #D4AF37; border-radius:16px; padding:20px; box-shadow:0 0 40px rgba(212,175,55,0.25); text-align:center; position:relative;">
            <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:24px; letter-spacing:3px;" data-i18n="game.axe">🪓 UZINAGAZ</h2>
                <div>
                    <span style="color:#ff4d4d; margin-right:15px; font-weight:bold; font-size:18px;"><span data-i18n="si.lives">LIVES: </span><span id="axe-lives">3</span></span>
                    <span style="color:#D4AF37; margin-right:20px; font-weight:bold; font-size:18px;">SCORE: <span id="axe-score">0</span></span>
                    <button onclick="if(window.axeReqId) cancelAnimationFrame(window.axeReqId); hideGame()" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:8px 16px; border-radius:5px; cursor:pointer; font-weight:bold;" data-i18n="game.back">← Menu</button>
                </div>
            </header>
            <div style="position:relative; display:inline-block;">
                <canvas id="axe-canvas" width="800" height="600" style="background:#0F0700; border:2px solid #5C3A21; border-radius:8px; cursor:crosshair; box-shadow:inset 0 0 40px rgba(0,0,0,0.8);"></canvas>
                <div id="axe-start-screen" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; border-radius:8px;">
                    <h2 style="color:#D4AF37; font-family:'Cinzel Decorative'; font-size:32px;" data-i18n="axe.goal">BUT : PLANTER LE BOIS !</h2>
                    <p style="color:#ddd; margin-bottom:10px; font-size:18px;" data-i18n="axe.warn">Ne touche surtout pas la personne au centre.</p>
                    <p style="color:#ff4d4d; margin-bottom:30px; font-weight:bold;" data-i18n="axe.click">Clique ou ESPACE pour lancer.</p>
                    <button id="start-axe-btn" style="background:#8B0000; border:2px solid #D4AF37; color:#fff; padding:15px 30px; font-size:20px; font-family:'Cinzel Decorative'; font-weight:bold; cursor:pointer; border-radius:6px;" data-i18n="tetris.play">JOUER</button>
                </div>
            </div>
        </div>
        `;
        if(window.setLanguage) window.setLanguage(window.currentLang);
    }

    const canvas = document.getElementById('axe-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('axe-score');
    const livesEl = document.getElementById('axe-lives');
    
    let score = 0;
    let lives = 3;
    let bleeding = 0;
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
    
    // Explicitly restrict to face stickers from lancer-hache folder
    let faceUrls = window.GAME_ASSETS && window.GAME_ASSETS['lancer-hache'] && window.GAME_ASSETS['lancer-hache'].length > 0
        ? window.GAME_ASSETS['lancer-hache']
        : [
            'assets/{039CA1E5-BA4D-496F-B625-D9F572C058F9}.png',
            'assets/alien2.webp',
            'assets/player.webp'
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

    function updateAim(clientX, clientY) {
        let rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        mouseX = (clientX - rect.left) * scaleX;
        mouseY = (clientY - rect.top)  * scaleY;
    }

    canvas.onmousemove = (e) => updateAim(e.clientX, e.clientY);

    // Touch: move finger = aim, lift finger = throw
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length > 0) updateAim(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length > 0) updateAim(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        throwAxe();
    }, { passive: false });

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
        // Hitboxes match drawn character proportions (coordonnées locales, centre roue = 0,0)
        if (dx*dx + (dy+112)*(dy+112) < 42*42) return true;               // Tête (cercle)
        if (dx >= -40 && dx <= 40 && dy >= -72 && dy <= 86) return true;  // Cou + Torse
        if (dx >= -130 && dx <= -38 && dy >= -38 && dy <= -8) return true; // Bras gauche
        if (dx >= 38 && dx <= 130 && dy >= -38 && dy <= -8) return true;   // Bras droit
        if (dx >= -38 && dx <= -8 && dy >= 86 && dy <= 157) return true;   // Jambe gauche
        if (dx >= 8 && dx <= 38 && dy >= 86 && dy <= 157) return true;     // Jambe droite
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
            document.querySelector('#axe-start-screen h2').innerText = window.t('tetris.gameover');
            document.querySelector('#axe-start-screen p').innerText = "";
        }
    }

    function winLevel() {
        gameState = 'start';
        document.getElementById('axe-start-screen').style.display = 'flex';
        document.querySelector('#axe-start-screen h2').innerText = window.t('axe.win');
        document.querySelector('#axe-start-screen p').innerText = window.t('axe.survived');
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
                         if (typeof addGlobalScore === 'function') addGlobalScore(2);
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
        ctx.fillStyle = '#5C2E0A';
        let crossW = 340, crossH = 40;
        ctx.fillRect(-crossW/2, -crossH/2, crossW, crossH);
        ctx.fillRect(-crossH/2, -crossW/2, crossH, crossW);

        // Outer glow (large soft stroke)
        ctx.strokeStyle = 'rgba(255, 180, 60, 0.35)';
        ctx.lineWidth = 14;
        ctx.strokeRect(-crossW/2, -crossH/2, crossW, crossH);
        ctx.strokeRect(-crossH/2, -crossW/2, crossH, crossW);

        // Inner bright border (sharp, clearly visible)
        ctx.strokeStyle = '#D4881A';
        ctx.lineWidth = 3;
        ctx.strokeRect(-crossW/2, -crossH/2, crossW, crossH);
        ctx.strokeRect(-crossH/2, -crossW/2, crossH, crossW);

        // Wood grain lines for texture
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1.5;
        for (let gx = -crossW/2 + 25; gx < crossW/2; gx += 30) {
            ctx.beginPath(); ctx.moveTo(gx, -crossH/2); ctx.lineTo(gx, crossH/2); ctx.stroke();
        }
        for (let gy = -crossW/2 + 25; gy < crossW/2; gy += 30) {
            ctx.beginPath(); ctx.moveTo(-crossH/2, gy); ctx.lineTo(crossH/2, gy); ctx.stroke();
        }

        // ── Corps humain ligoté sur la roue ────────────────────────────────
        const SK = '#F4C082', SD = '#C4834A'; // skin / shadow

        // Bras gauche (horizontal, attaché à la barre)
        ctx.fillStyle = SK;
        ctx.beginPath(); ctx.roundRect(-130, -38, 92, 28, 10); ctx.fill();
        ctx.strokeStyle = SD; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(-130, -38, 92, 28, 10); ctx.stroke();

        // Bras droit
        ctx.fillStyle = SK;
        ctx.beginPath(); ctx.roundRect(38, -38, 92, 28, 10); ctx.fill();
        ctx.strokeStyle = SD;
        ctx.beginPath(); ctx.roundRect(38, -38, 92, 28, 10); ctx.stroke();

        // Torse
        ctx.fillStyle = SK;
        ctx.beginPath(); ctx.roundRect(-40, -72, 80, 160, 12); ctx.fill();
        ctx.strokeStyle = SD; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(-40, -72, 80, 160, 12); ctx.stroke();

        // Pectoraux
        ctx.strokeStyle = SD; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-18, -38, 14, 0.3, Math.PI - 0.3); ctx.stroke();
        ctx.beginPath(); ctx.arc(18, -38, 14, 0.3, Math.PI - 0.3); ctx.stroke();

        // Abdos
        ctx.lineWidth = 1.5;
        [-5, 18, 41].forEach(ay => {
            ctx.beginPath(); ctx.moveTo(-18, ay); ctx.lineTo(18, ay); ctx.stroke();
        });
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 52); ctx.stroke(); // ligne médiane

        // Slip panthère/tigré (waist region)
        ctx.save();
        ctx.beginPath(); ctx.roundRect(-40, 50, 80, 42, 6); ctx.clip();
        ctx.fillStyle = '#F5A30A'; ctx.fillRect(-40, 50, 80, 42);         // fond orange
        ctx.fillStyle = 'rgba(8, 3, 0, 0.72)';                           // rayures noires
        [-28, -14, 0, 14, 28].forEach(sx => {
            ctx.save();
            ctx.translate(sx + 20, 71);
            ctx.rotate(0.42);
            ctx.fillRect(-3, -26, 7, 52);
            ctx.restore();
        });
        ctx.fillStyle = '#7A3E00'; ctx.fillRect(-40, 50, 80, 7);          // ceinture
        ctx.restore();

        // Jambe gauche
        ctx.fillStyle = SK;
        ctx.beginPath(); ctx.roundRect(-38, 86, 30, 70, 10); ctx.fill();
        ctx.strokeStyle = SD; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(-38, 86, 30, 70, 10); ctx.stroke();

        // Jambe droite
        ctx.fillStyle = SK;
        ctx.beginPath(); ctx.roundRect(8, 86, 30, 70, 10); ctx.fill();
        ctx.strokeStyle = SD;
        ctx.beginPath(); ctx.roundRect(8, 86, 30, 70, 10); ctx.stroke();

        // Cou
        ctx.fillStyle = SK;
        ctx.beginPath(); ctx.roundRect(-13, -82, 26, 16, 5); ctx.fill();

        // Tête (cercle de base recouverte par le sticker)
        ctx.beginPath(); ctx.arc(0, -112, 40, 0, Math.PI * 2);
        ctx.fillStyle = SK; ctx.fill();
        ctx.strokeStyle = SD; ctx.lineWidth = 2; ctx.stroke();

        // Cordes — poignets liés à la barre horizontale
        ctx.strokeStyle = '#9B7B2A'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-130, -38); ctx.lineTo(-130, -8); ctx.stroke();
        ctx.beginPath(); ctx.arc(-130, -23, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#6B4E10'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(130, -38); ctx.lineTo(130, -8); ctx.stroke();
        ctx.beginPath(); ctx.arc(130, -23, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#6B4E10'; ctx.fill();

        // Cordes — chevilles liées à la barre verticale
        ctx.beginPath(); ctx.moveTo(-38, 157); ctx.lineTo(-8, 157); ctx.stroke();
        ctx.beginPath(); ctx.arc(-23, 157, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#6B4E10'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(8, 157); ctx.lineTo(38, 157); ctx.stroke();
        ctx.beginPath(); ctx.arc(23, 157, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#6B4E10'; ctx.fill();

        // Sticker visage clipé sur la tête
        if (target.faceImg && target.faceImg.complete && target.faceImg.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath(); ctx.arc(0, -112, 38, 0, Math.PI * 2); ctx.clip();
            if (bleeding > 0) {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.55)';
                ctx.fill();
                ctx.globalAlpha = 0.72;
            }
            ctx.drawImage(target.faceImg, -38, -150, 76, 76);
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
