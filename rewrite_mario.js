const fs = require('fs');

let code = fs.readFileSync('games/layer2/mario.js', 'utf-8');

// 1. Update UI
code = code.replace(
    '<div id="mario-state-ui"',
    '<div id="mario-level-ui" style="color:white; font-size:20px; font-weight:bold; text-shadow:2px 2px 0 #000;"></div>\\n                <div id="mario-state-ui"'
);

// 2. Level Constants and loadLevel function
const state_vars_start = `    // ==========================================
    // VARIABLES DE JEU
    // ==========================================
    let score = 0;
    let cameraX = 0;
    let frameCount = 0;
    
    const keys = { left: false, right: false, up: false };`;

const new_state_vars = state_vars_start + `

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
        document.getElementById('mario-game').style.background = \`linear-gradient(to bottom, \${lvl.bgTop}, \${lvl.bgBottom})\`;
        
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
        
        for(let x = 300; x < LEVEL_END_X - 800; x += 400 + Math.random()*300) {
            platforms.push({x: x, y: 800 - 300 - Math.random()*250, w: 100 + Math.random()*150, h: 20});
        }
        for(let i=0; i<30 + index*5; i++) {
            coins.push({ x: 400 + Math.random() * (LEVEL_END_X-800), y: 800 - 250 - Math.random() * 300, radius: 15, collected: false });
        }
        for(let i=0; i<20; i++) {
            clouds.push({ x: Math.random() * LEVEL_END_X, y: 50 + Math.random() * 200, width: 100 + Math.random() * 100, speed: 0.2 + Math.random() * 0.5 });
        }
    }
`;

// Remove old state
const old_state_start = code.indexOf('    // Fin du niveau');
const old_state_end = code.indexOf('    // Génération d\\'ennemis');

code = code.substring(0, code.indexOf(state_vars_start)) + new_state_vars + code.substring(old_state_end);

// 3. Modify powerup/enemy spawn rates
code = code.replace('frameCount % 200 === 0', 'frameCount % 800 === 0');
code = code.replace('frameCount % 120 === 0', 'frameCount % (120 - currentLevel * 10) === 0');

// 4. Modify Yoshi handling in player update.
const new_player_mov = `        let activeSpeed = player.state === 'yoshi' ? player.speed * 1.5 : player.speed;
        let activeJump = player.state === 'yoshi' ? player.jumpForce * 1.3 : player.jumpForce;
        let activeGravity = player.state === 'yoshi' ? player.gravity * 0.7 : player.gravity;

        if (keys.left) { player.vx = -activeSpeed; player.facingRight = false; }
        else if (keys.right) { player.vx = activeSpeed; player.facingRight = true; }
        else { player.vx = 0; }

        if (keys.up && player.grounded) {
            player.vy = activeJump;`;

code = code.replace(
    /        if \(keys\.left\) \{ player\.vx = -player\.speed;[\s\S]*?if \(keys\.up && player\.grounded\) \{.*?player\.vy = player\.jumpForce;/,
    new_player_mov
);
code = code.replace('player.vy += player.gravity;', 'player.vy += activeGravity;');

// 5. Render logic colors
code = code.replace("ctx.fillStyle = '#87CEEB';", "");
code = code.replace("ctx.fillRect(0, 0, canvas.width, canvas.height);", "");
code = code.replace("ctx.fillStyle = '#8B4513';", "ctx.fillStyle = LEVELS[currentLevel].ground;");
code = code.replace("ctx.fillStyle = '#228B22';", "ctx.fillStyle = LEVELS[currentLevel].groundTop;");
code = code.replace("ctx.strokeStyle = '#D2691E';", "ctx.strokeStyle = LEVELS[currentLevel].pStroke;");
code = code.replace("ctx.fillStyle = '#8B4513';", "ctx.fillStyle = LEVELS[currentLevel].ground;"); // second match if any

code = code.replace(
    "for(let p of platforms) {", 
    "ctx.fillStyle = LEVELS[currentLevel].pFill;\\n        ctx.strokeStyle = LEVELS[currentLevel].pStroke;\\n        for(let p of platforms) {"
);


// 6. Win animation logic
const win_logic_old = `            ctx.fillText("+1000 Points !", canvas.width/2, canvas.height/2 + 40);

            if (winFrame < 180) {
                animId = requestAnimationFrame(winLoop);
            } else {
                if (window.hideGame) window.hideGame();
            }`;
            
const win_logic_new = `            ctx.fillText("+250 Points !", canvas.width/2, canvas.height/2 + 40);

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
            }`;
code = code.replace(win_logic_old, win_logic_new);
code = code.replace('score += 1000;', 'score += 250;');
code = code.replace('"ELIF SAUVÉE !"', '"LEVEL CLEARED !"');


// 7. Initial Call
code = code.replace('updateUI();\\n\\n    // ==========================================', 'loadLevel(0);\\n    updateUI();\\n\\n    // ==========================================');

fs.writeFileSync('games/layer2/mario.js', code, 'utf-8');
console.log("Success");
