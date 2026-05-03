window.initAngryBirds = function(container) {
    console.log("Init Angry Stickers with Matter.js");

    container.innerHTML = `
        <div id="ab-container" style="position:relative; width:100%; height:80vh; min-height:500px; overflow: hidden; background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);">
            <canvas id="ab-canvas" style="display:block; width:100%; height:100%;"></canvas>
        </div>
    `;

    const canvas = document.getElementById('ab-canvas');
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    if (!window.Matter) {
        alert("🚨 Erreur : Moteur physique (Matter.js) introuvable.");
        return;
    }

    // === MODULE ALIASES ===
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Constraint = Matter.Constraint,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint,
          Events = Matter.Events;

    const engine = Engine.create();
    const world = engine.world;

    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: width,
            height: height,
            background: 'transparent',
            wireframes: false, // Required to see sprites and colors
            showAngleIndicator: false
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // === UI ===
    let currentScore = 0;
    const scoreUI = document.getElementById('l2-score');
    if(scoreUI) scoreUI.textContent = `SCORE: ${currentScore}`;

    // Hide mobile controls for Angry Birds (mouse/touch drag is used)
    const mobileUI = document.getElementById('l2-mobile-controls');
    if (mobileUI) mobileUI.style.display = 'none';

    // === ASSETS ===
    const BIRD_IMG = 'assets/STK-20241217-WA0053 - Copie.webp';
    const ENEMY_POOL = window.GAME_ASSETS && window.GAME_ASSETS['space-invaders'] 
                       ? window.GAME_ASSETS['space-invaders'] 
                       : ['assets/OwnSticker_20240322_015407147.png.jpg', 'assets/alien2.webp'];

    // Load an image element to get natural dimensions if needed, or just guess scale.
    // Matter.js needs explicit scale to size sprites accurately.
    const spriteScale = 0.15; // adjust base sticker scale

    // === BODIES ===
    // 1. Ground
    const ground = Bodies.rectangle(width / 2, height - 30, width * 2, 60, { 
        isStatic: true,
        render: { fillStyle: '#2ecc71', strokeStyle: '#27ae60', lineWidth: 4 }
    });

    // 2. Bird & Slingshot
    const anchor = { x: Math.max(150, width * 0.15), y: height - 150 };
    const birdRadius = 20;
    
    let bird = Bodies.circle(anchor.x, anchor.y, birdRadius, {
        restitution: 0.4,
        friction: 0.5,
        density: 0.005,
        render: {
            sprite: { texture: BIRD_IMG, xScale: spriteScale, yScale: spriteScale }
        }
    });

    let sling = Constraint.create({
        pointA: anchor,
        bodyB: bird,
        stiffness: 0.05,
        render: { strokeStyle: '#5c4033', lineWidth: 5 }
    });

    let slingStand = Bodies.rectangle(anchor.x, height - 90, 20, 120, {
        isStatic: true,
        isSensor: true, // Bird passes through the physical stand
        render: { fillStyle: '#8b4513' }
    });

    // 3. Blocks & Enemies
    let enemies = [];
    let blocks = [];
    
    const blockWidth = 40;
    const blockHeight = 40;
    const pyramidX = width * 0.75;
    const pyramidY = height - 60;
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5 - row; col++) {
            let x = pyramidX + (col * blockWidth) - ((5 - row) * blockWidth / 2);
            let y = pyramidY - (row * blockHeight) - (blockHeight / 2);
            
            let block = Bodies.rectangle(x, y, blockWidth, blockHeight, {
                restitution: 0.1,
                render: { fillStyle: '#e67e22', strokeStyle: '#d35400', lineWidth: 2 }
            });
            blocks.push(block);
            
            // Randomly place an enemy
            if (Math.random() > 0.6 && row > 1) {
                let enemyImg = ENEMY_POOL[Math.floor(Math.random() * ENEMY_POOL.length)];
                let enemy = Bodies.circle(x, y - blockHeight, 18, {
                    restitution: 0.3,
                    density: 0.002,
                    label: 'enemy',
                    render: { sprite: { texture: enemyImg, xScale: 0.1, yScale: 0.1 } }
                });
                enemies.push(enemy);
            }
        }
    }
    
    // Ensure at least 1 enemy
    if (enemies.length === 0) {
        let enemyImg = ENEMY_POOL[0];
        let enemy = Bodies.circle(pyramidX, pyramidY - 200, 18, {
            restitution: 0.3,
            density: 0.002,
            label: 'enemy',
            render: { sprite: { texture: enemyImg, xScale: 0.1, yScale: 0.1 } }
        });
        enemies.push(enemy);
    }

    Composite.add(world, [ground, slingStand, bird, sling, ...blocks, ...enemies]);

    // === MOUSE/TOUCH INTERACTION ===
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // === FIRING LOGIC ===
    let isFired = false;
    Events.on(mouseConstraint, 'enddrag', function(e) {
        if (e.body === bird && !isFired) {
            // Calculate distance pulled
            let dist = Math.hypot(bird.position.x - anchor.x, bird.position.y - anchor.y);
            if (dist > 20) {
                isFired = true;
                // Release the constraint slightly after release for a snap effect
                setTimeout(() => {
                    sling.bodyB = null;
                }, 50);
                
                // Allow a reload after a delay if enemies remain
                setTimeout(() => reloadBird(), 4000);
            }
        }
    });

    let birdsRemaining = 3;

    function reloadBird() {
        if (enemies.length === 0) return;
        if (birdsRemaining <= 0) {
            alert("Plus d'oiseaux ! Restarting...");
            if (window.restartL2Game) window.restartL2Game();
            return;
        }

        birdsRemaining--;
        bird = Bodies.circle(anchor.x, anchor.y, birdRadius, {
            restitution: 0.4, friction: 0.5, density: 0.005,
            render: { sprite: { texture: BIRD_IMG, xScale: spriteScale, yScale: spriteScale } }
        });
        sling.bodyB = bird;
        isFired = false;
        Composite.add(world, bird);
    }

    // === GAME LOOP / WIN CHECK ===
    let checkInterval = setInterval(() => {
        // Check for enemies falling off the world or going way off screen
        let activeEnemies = [];
        let destroyed = 0;

        for (let e of enemies) {
            if (e.position.y > height + 100 || e.position.x > width + 500) {
                destroyed++;
                Composite.remove(world, e);
            } else {
                activeEnemies.push(e);
            }
        }

        if (destroyed > 0) {
            currentScore += destroyed * 500;
            if(scoreUI) scoreUI.textContent = `SCORE: ${currentScore}`;
        }
        enemies = activeEnemies;

        // Cleanup off-screen blocks to save performance
        blocks.forEach(b => {
            if (b.position.y > height + 100 || b.position.x > width + 500) {
                Composite.remove(world, b);
            }
        });

        // Win Condition
        if (enemies.length === 0) {
            clearInterval(checkInterval);
            window.addGlobalScore(currentScore + (birdsRemaining * 1000));
            
            setTimeout(() => {
                alert("🎉 NIVEAU TERMINÉ ! Les stickers ont gagné ! 🎉");
                if (window.restartL2Game) window.restartL2Game();
            }, 1000);
        }
    }, 500);

    // === GLOBAL BUTTON HOOKS ===
    window.restartL2Game = function() {
        if (container._cleanup) container._cleanup();
        window.initAngryBirds(document.getElementById('game-slot'));
    };

    window.toggleL2Pause = function() {
        runner.enabled = !runner.enabled;
    };

    // === RESIZE HANDLING ===
    const onResize = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        render.canvas.width = width;
        render.canvas.height = height;
        // Reposition ground
        Matter.Body.setPosition(ground, { x: width / 2, y: height - 30 });
    };
    window.addEventListener('resize', onResize);

    // === CLEANUP LOGIC ===
    container._cleanup = function() {
        clearInterval(checkInterval);
        window.removeEventListener('resize', onResize);
        
        if (mobileUI) mobileUI.style.display = 'flex'; // Reset default
        
        Render.stop(render);
        Runner.stop(runner);
        Engine.clear(engine);
        
        render.canvas.remove();
        render.canvas = null;
        render.context = null;
        render.textures = {};
        
        window.restartL2Game = null;
        window.toggleL2Pause = null;
    };
};
