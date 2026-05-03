window.initMario = function(container) {
    console.log("Init Super Elif Tile Engine");

    container.innerHTML = `
        <div id="mario-game" style="position:relative; width:100%; height:80vh; min-height:500px; background:linear-gradient(to bottom, #87CEEB, #E0F6FF); overflow:hidden; border-radius:12px; font-family:'Outfit', sans-serif;">
            <canvas id="mario-canvas" style="display:block; width:100%; height:100%;"></canvas>
        </div>
    `;

    const canvas = document.getElementById('mario-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    const onResize = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        if (width === 0 || height === 0) {
            width = window.innerWidth * 0.9;
            height = window.innerHeight * 0.8;
        }
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', onResize);
    onResize();

    // Hide mobile controls for Angry Birds (mouse/touch drag is used)
    const mobileUI = document.getElementById('l2-mobile-controls');
    if (mobileUI) mobileUI.style.display = 'flex';

    // === ASSETS ===
    const ASSETS = {
        petit: new Image(),
        base: new Image(),
        fire: new Image(),
        turtle: new Image(),
        axeThrower: new Image(),
        baklava: new Image(),
        princess: new Image()
    };

    ASSETS.petit.src = 'assets/STK-20241217-WA0053 - Copie.webp';
    ASSETS.base.src = 'assets/STK-20240715-WA0003 - Copie.webp';
    ASSETS.fire.src = 'assets/OwnSticker_20251010_235740731.png.jpg';
    ASSETS.turtle.src = 'assets/STK-20241108-WA0000.webp';
    ASSETS.axeThrower.src = 'assets/OwnSticker_20240322_015407147.png.jpg';
    ASSETS.baklava.src = 'assets/real_baklava.png';
    ASSETS.princess.src = 'assets/OwnSticker_20240417_210104701.png.jpg'; // Magic door as goal

    // === TILE ENGINE CONFIG ===
    const TILE = 50;
    const METER = TILE;
    const GRAVITY = METER * 9.8 * 6;
    const MAXDX = METER * 15;
    const MAXDY = METER * 60;
    const ACCEL = MAXDX * 2;
    const FRICTION = MAXDX * 6;
    const JUMP = METER * 1500;
    
    let dt = 1/60;

    let score = 0;
    let currentLevelIndex = 0;
    
    const scoreUI = document.getElementById('l2-score');
    if(scoreUI) scoreUI.textContent = `SCORE: ${score}`;

    let player, enemies, powerups, cells, mapWidth, mapHeight, cameraX;
    
    // Generates a simple level map
    // 0: empty, 1: floor/block, 2: enemy1, 3: enemy2, 4: baklava, 5: goal
    function generateMap(lengthInTiles) {
        let rows = 12; // 600px height roughly
        let map = [];
        for(let y=0; y<rows; y++) {
            let row = new Array(lengthInTiles).fill(0);
            map.push(row);
        }
        
        // Floor
        for(let x=0; x<lengthInTiles; x++) {
            if (x > 3 && x < lengthInTiles - 3 && Math.random() < 0.1) continue; // Holes
            map[rows-1][x] = 1;
            map[rows-2][x] = 1;
        }

        // Platforms & Entities
        for(let x=5; x<lengthInTiles - 5; x++) {
            if (Math.random() < 0.2) {
                let y = rows - 4 - Math.floor(Math.random() * 3);
                map[y][x] = 1;
                map[y][x+1] = 1;
                map[y][x+2] = 1;
                
                if (Math.random() < 0.3) map[y-1][x+1] = 4; // Baklava
                if (Math.random() < 0.4) map[y-1][x] = (Math.random() > 0.5) ? 2 : 3; // Enemy
                
                x += 3;
            }
        }
        
        // Left wall, right wall
        for(let y=0; y<rows; y++) {
            map[y][0] = 1;
            map[y][lengthInTiles-1] = 1;
        }

        // Goal
        map[rows-3][lengthInTiles-3] = 5;
        
        return map;
    }

    function setupLevel(lvlIndex) {
        const lengths = [40, 60, 80, 100, 120, 150];
        if (lvlIndex >= lengths.length) {
            alert("✨ INCROYABLE ! Tu as terminé SUPER ELIF ! ✨");
            window.addGlobalScore(score + 5000);
            if (window.closeGameLayer) window.closeGameLayer();
            return;
        }
        
        let rawMap = generateMap(lengths[lvlIndex]);
        mapHeight = rawMap.length;
        mapWidth = rawMap[0].length;
        cells = new Array(mapHeight * mapWidth).fill(0);
        
        enemies = [];
        powerups = [];
        
        for(let y=0; y<mapHeight; y++) {
            for(let x=0; x<mapWidth; x++) {
                let val = rawMap[y][x];
                let tx = x * TILE;
                let ty = y * TILE;
                if (val === 1) cells[y * mapWidth + x] = 1;
                else if (val === 2) enemies.push({ x: tx, y: ty, dx: -MAXDX*0.3, dy: 0, w: TILE*0.8, h: TILE*0.8, type: 'turtle', dead: false });
                else if (val === 3) enemies.push({ x: tx, y: ty, dx: -MAXDX*0.4, dy: 0, w: TILE*0.8, h: TILE*0.8, type: 'axeThrower', dead: false });
                else if (val === 4) powerups.push({ x: tx, y: ty, w: TILE*0.8, h: TILE*0.8, collected: false });
                else if (val === 5) powerups.push({ x: tx, y: ty - TILE, w: TILE*2, h: TILE*2, type: 'goal', collected: false });
            }
        }
        
        player = {
            x: TILE * 2, y: TILE * 2, w: TILE*0.8, h: TILE*0.8,
            dx: 0, dy: 0, falling: true, jumping: false, state: 'petit'
        };
        
        cameraX = 0;
    }

    setupLevel(currentLevelIndex);

    // === CONTROLS ===
    let left = false, right = false, jump = false;
    
    // Keyboard
    const onKey = (e, state) => {
        if (e.code === 'ArrowLeft') left = state;
        if (e.code === 'ArrowRight') right = state;
        if (e.code === 'Space' || e.code === 'ArrowUp') jump = state;
    };
    document.addEventListener('keydown', (e) => onKey(e, true));
    document.addEventListener('keyup', (e) => onKey(e, false));

    // Mobile Overlay
    const btnLeft = document.getElementById('d-pad-left');
    const btnRight = document.getElementById('d-pad-right');
    const btnJump = document.getElementById('d-pad-jump');

    if (btnLeft) {
        btnLeft.onpointerdown = () => left = true;
        btnLeft.onpointerup = () => left = false;
        btnLeft.onpointerout = () => left = false;
    }
    if (btnRight) {
        btnRight.onpointerdown = () => right = true;
        btnRight.onpointerup = () => right = false;
        btnRight.onpointerout = () => right = false;
    }
    if (btnJump) {
        btnJump.onpointerdown = () => jump = true;
        btnJump.onpointerup = () => jump = false;
        btnJump.onpointerout = () => jump = false;
    }

    // === PHYSICS HELPERS ===
    function t2p(t) { return t * TILE; }
    function p2t(p) { return Math.floor(p / TILE); }
    function cell(x, y) { return tcell(p2t(x), p2t(y)); }
    function tcell(tx, ty) {
        if (tx < 0 || tx >= mapWidth || ty < 0 || ty >= mapHeight) return 1; // Walls outside
        return cells[ty * mapWidth + tx];
    }
    
    function overlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(((x1 + w1 - 1) < x2) ||
                 ((x2 + w2 - 1) < x1) ||
                 ((y1 + h1 - 1) < y2) ||
                 ((y2 + h2 - 1) < y1));
    }

    function updateEntity(entity) {
        let wasleft    = entity.dx < 0;
        let wasright   = entity.dx > 0;
        let falling    = entity.falling;
        let friction   = entity.friction || FRICTION;
        let accel      = entity.accel || ACCEL;

        entity.ddx = 0;
        entity.ddy = GRAVITY;

        if (entity.isPlayer) {
            if (left)  entity.ddx = entity.ddx - accel;
            else if (wasleft)  entity.ddx = entity.ddx + friction;

            if (right) entity.ddx = entity.ddx + accel;
            else if (wasright) entity.ddx = entity.ddx - friction;

            if (jump && !entity.jumping && !falling) {
                entity.ddy = entity.ddy - JUMP;
                entity.jumping = true;
            }
        }

        entity.x  = entity.x  + (dt * entity.dx);
        entity.y  = entity.y  + (dt * entity.dy);
        entity.dx = Math.min(MAXDX, Math.max(-MAXDX, entity.dx + (dt * entity.ddx)));
        entity.dy = Math.min(MAXDY, Math.max(-MAXDY, entity.dy + (dt * entity.ddy)));

        if ((wasleft  && (entity.dx > 0)) || (wasright && (entity.dx < 0))) {
            entity.dx = 0; // clamp at zero to prevent friction from making us jiggle side to side
        }

        let tx = p2t(entity.x);
        let ty = p2t(entity.y);
        let nx = entity.x % TILE;
        let ny = entity.y % TILE;

        let cell_curr = cell(entity.x, entity.y);
        let cell_right = cell(entity.x + entity.w, entity.y);
        let cell_down = cell(entity.x, entity.y + entity.h);
        let cell_diag = cell(entity.x + entity.w, entity.y + entity.h);

        // Y collisions
        if (entity.dy > 0) {
            if ((cell_down && !cell_curr) || (cell_diag && !cell_right && nx)) {
                entity.y = t2p(ty);
                entity.dy = 0;
                entity.falling = false;
                entity.jumping = false;
                ny = 0;
            }
        } else if (entity.dy < 0) {
            if ((cell_curr && !cell_down) || (cell_right && !cell_diag && nx)) {
                entity.y = t2p(ty + 1);
                entity.dy = 0;
                cell_curr = cell_down;
                cell_right = cell_diag;
                ny = 0;
            }
        }

        // X collisions
        if (entity.dx > 0) {
            if ((cell_right && !cell_curr) || (cell_diag && !cell_down && ny)) {
                entity.x = t2p(tx);
                entity.dx = 0;
                if (!entity.isPlayer) entity.dx = -MAXDX*0.3; // bounce enemy
            }
        } else if (entity.dx < 0) {
            if ((cell_curr && !cell_right) || (cell_down && !cell_diag && ny)) {
                entity.x = t2p(tx + 1);
                entity.dx = 0;
                if (!entity.isPlayer) entity.dx = MAXDX*0.3; // bounce enemy
            }
        }

        entity.falling = ! (cell_down || (nx && cell_diag));
    }

    // === MAIN LOOP ===
    let paused = false;
    let reqId;

    function loop() {
        if (!paused) {
            // Update Player
            player.isPlayer = true;
            updateEntity(player);

            // Bounds check player death
            if (player.y > (mapHeight * TILE) + TILE) {
                die();
            }

            // Camera follow
            let expectedHeight = mapHeight * TILE;
            let logicalWidth = width / (height / expectedHeight);
            cameraX = Math.max(0, player.x - logicalWidth/3);

            // Update Enemies
            for(let e of enemies) {
                if (e.dead) continue;
                updateEntity(e);
                
                // Collisions player/enemy
                if (overlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
                    if (player.dy > 0 && player.y + player.h < e.y + e.h/2) {
                        e.dead = true;
                        player.dy = -JUMP/2; // bounce
                        score += 100;
                    } else {
                        die();
                    }
                }
            }

            // Update Powerups & Goal
            for(let p of powerups) {
                if (p.collected) continue;
                if (overlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
                    p.collected = true;
                    if (p.type === 'goal') {
                        score += 1000;
                        currentLevelIndex++;
                        setupLevel(currentLevelIndex);
                    } else {
                        score += 200;
                        player.state = 'base';
                        player.w = TILE; player.h = TILE; // grow
                        player.y -= (TILE - TILE*0.8);
                    }
                }
            }
            if(scoreUI) scoreUI.textContent = `SCORE: ${score}`;
        }

        draw();
        reqId = requestAnimationFrame(loop);
    }

    function die() {
        if (player.state !== 'petit') {
            player.state = 'petit';
            player.w = TILE*0.8; player.h = TILE*0.8;
            player.dy = -JUMP/2; // small bounce
        } else {
            alert("Oups ! Tu es tombé !");
            setupLevel(currentLevelIndex); // restart level
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        
        // Scale the game to fit the canvas height if it's smaller or larger than the map
        let expectedHeight = mapHeight * TILE;
        let scale = height / expectedHeight;
        ctx.scale(scale, scale);

        ctx.translate(-cameraX, 0);

        // Draw Map
        ctx.fillStyle = '#b5651d';
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        for(let y=0; y<mapHeight; y++) {
            for(let x=0; x<mapWidth; x++) {
                if (cells[y * mapWidth + x]) {
                    ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
                    ctx.strokeRect(x*TILE, y*TILE, TILE, TILE);
                }
            }
        }

        // Draw Powerups
        for(let p of powerups) {
            if (p.collected) continue;
            let img = p.type === 'goal' ? ASSETS.princess : ASSETS.baklava;
            ctx.drawImage(img, p.x, p.y, p.w, p.h);
        }

        // Draw Enemies
        for(let e of enemies) {
            if (e.dead) continue;
            let img = e.type === 'turtle' ? ASSETS.turtle : ASSETS.axeThrower;
            ctx.drawImage(img, e.x, e.y, e.w, e.h);
        }

        // Draw Player
        let pImg = ASSETS[player.state] || ASSETS.petit;
        ctx.drawImage(pImg, player.x, player.y, player.w, player.h);

        ctx.restore();
    }

    // === GLOBAL HOOKS ===
    window.toggleL2Pause = () => paused = !paused;
    window.restartL2Game = () => setupLevel(currentLevelIndex);

    // === CLEANUP ===
    container._cleanup = function() {
        cancelAnimationFrame(reqId);
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKey);
        window.removeEventListener('resize', onResize);
        window.toggleL2Pause = null;
        window.restartL2Game = null;
    };

    reqId = requestAnimationFrame(loop);
};
