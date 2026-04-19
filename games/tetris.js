window.initTetris = function(container) {
    if (!container.innerHTML.includes('tetris-canvas')) {
        container.innerHTML = `
        <div style="width:90vw; max-width:500px; margin:auto; background:linear-gradient(160deg, #0A0A1F, #1A1A3A); border:3px solid #D4AF37; border-radius:16px; padding:20px; box-shadow:0 0 40px rgba(212,175,55,0.25); text-align:center;">
            <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:20px; letter-spacing:3px;">🧱 TETRIS</h2>
                <div>
                    <span style="color:#D4AF37; margin-right:15px; font-weight:bold;">SCORE: <span id="tetris-score">0</span></span>
                    <button onclick="if(window.tetrisReqId) cancelAnimationFrame(window.tetrisReqId); hideGame()" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer;">← Menu</button>
                </div>
            </header>
            
            <div id="tetris-wrapper" style="position:relative; display:inline-block;">
                <canvas id="tetris-canvas" width="300" height="600" style="background:rgba(0,0,0,0.8); border:2px solid #D4AF37; box-shadow:0 0 15px rgba(0,0,0,0.8);"></canvas>
                
                <div id="tetris-start-screen" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <h2 style="color:#D4AF37; font-family:'Cinzel Decorative';">PRÊT ?</h2>
                    <p style="color:#ddd; margin-bottom:20px; font-size:14px; line-height:1.6;">⬅️ ➡️ : Bouger<br>⬆️ : Tourner<br>⬇️ : Accélérer<br>Espace : Chute libre</p>
                    <button id="start-tetris-btn" style="background:#D4AF37; border:none; color:#1A1A3A; padding:10px 20px; font-family:'Cinzel Decorative'; font-weight:bold; cursor:pointer; border-radius:6px;">JOUER</button>
                </div>
                
                <div id="tetris-gameover" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(139,0,0,0.8); flex-direction:column; justify-content:center; align-items:center;">
                    <h2 style="color:#FFF;">GAME OVER</h2>
                    <button onclick="initTetris(document.getElementById('game-slot'))" style="background:#FFF; color:#8B0000; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; margin-top:10px;">Rejouer</button>
                </div>
            </div>
        </div>
        `;
    }

    const cvs = document.getElementById('tetris-canvas');
    const ctx = cvs.getContext('2d');
    const scoreEl = document.getElementById('tetris-score');
    
    const ROW = 20;
    const COL = 10;
    const SQ = 30; // 300 / 10
    const VACANT = "transparent";
    
    // Load images
    const tetrisImagesUrls = window.TETRIS_IMAGES && window.TETRIS_IMAGES.length > 0 ? window.TETRIS_IMAGES : ['assets/player.webp'];
    const loadedImages = tetrisImagesUrls.map(url => { const i = new Image(); i.src = url; return i; });

    let board = [];
    for(let r = 0; r < ROW; r++){ board[r] = []; for(let c = 0; c < COL; c++){ board[r][c] = { color: VACANT, img: null }; } }

    function drawSquare(x, y, cell) {
        if (cell.color === VACANT) {
            ctx.clearRect(x*SQ, y*SQ, SQ, SQ);
        } else if (cell.img && cell.img.complete && cell.img.naturalWidth > 0) {
            ctx.drawImage(cell.img, x*SQ, y*SQ, SQ, SQ);
            ctx.strokeStyle = "rgba(0,0,0,0.8)";
            ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
        } else {
            ctx.fillStyle = cell.color;
            ctx.fillRect(x*SQ, y*SQ, SQ, SQ);
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
        }
    }

    function drawBoard() {
        ctx.clearRect(0,0,cvs.width,cvs.height);
        for(let r = 0; r < ROW; r++){ for(let c = 0; c < COL; c++){ drawSquare(c, r, board[r][c]); } }
        
        ctx.strokeStyle = "rgba(212,175,55,0.1)";
        for(let r = 0; r <= ROW; r++) { ctx.beginPath(); ctx.moveTo(0, r*SQ); ctx.lineTo(cvs.width, r*SQ); ctx.stroke(); }
        for(let c = 0; c <= COL; c++) { ctx.beginPath(); ctx.moveTo(c*SQ, 0); ctx.lineTo(c*SQ, cvs.height); ctx.stroke(); }
    }

    // Pieces shapes [I, J, L, O, S, T, Z]
    const PIECES = [
        [[[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]]], // I
        [[[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 1], [0, 1, 0], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 0], [1, 1, 0]]], // J
        [[[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 0], [0, 1, 1]], [[0, 0, 0], [1, 1, 1], [1, 0, 0]], [[1, 1, 0], [0, 1, 0], [0, 1, 0]]], // L
        [[[1, 1], [1, 1]], [[1, 1], [1, 1]], [[1, 1], [1, 1]], [[1, 1], [1, 1]]], // O
        [[[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 0, 1]], [[0, 0, 0], [0, 1, 1], [1, 1, 0]], [[1, 0, 0], [1, 1, 0], [0, 1, 0]]], // S
        [[[0, 1, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 1, 0]], [[0, 1, 0], [1, 1, 0], [0, 1, 0]]], // T
        [[[1, 1, 0], [0, 1, 1], [0, 0, 0]], [[0, 0, 1], [0, 1, 1], [0, 1, 0]], [[0, 0, 0], [1, 1, 0], [0, 1, 1]], [[0, 1, 0], [1, 1, 0], [1, 0, 0]]]  // Z
    ];

    let piece;
    let dropStart = Date.now();
    let gameOver = true;
    let score = 0;

    function randomPiece() {
        let r = Math.floor(Math.random() * PIECES.length);
        let img = loadedImages[Math.floor(Math.random() * loadedImages.length)];
        return new Piece(PIECES[r], "solid", img);
    }

    function Piece(tetromino, color, img) {
        this.tetromino = tetromino;
        this.color = color;
        this.img = img;
        this.tetrominoN = 0;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.x = 3; this.y = -2;
    }

    Piece.prototype.getBounds = function() {
        let minR = 4, maxR = -1, minC = 4, maxC = -1;
        for(let r=0; r<this.activeTetromino.length; r++){
            for(let c=0; c<this.activeTetromino.length; c++){
                if(this.activeTetromino[r][c]){
                    if(r < minR) minR = r;
                    if(r > maxR) maxR = r;
                    if(c < minC) minC = c;
                    if(c > maxC) maxC = c;
                }
            }
        }
        return {minR, maxR, minC, maxC, wCells: maxC - minC + 1, hCells: maxR - minR + 1};
    }

    Piece.prototype.fill = function(color) {
        for(let r = 0; r < this.activeTetromino.length; r++) {
            for(let c = 0; c < this.activeTetromino.length; c++) {
                if(this.activeTetromino[r][c]) {
                    drawSquare(this.x + c, this.y + r, {color: color, img: this.img});
                }
            }
        }
    }

    Piece.prototype.draw = function() { this.fill(this.color); }
    Piece.prototype.unDraw = function() { this.fill(VACANT); }

    Piece.prototype.moveDown = function() {
        if(!this.collision(0,1,this.activeTetromino)) {
            this.unDraw(); this.y++; this.draw();
        } else {
            this.lock();
            piece = randomPiece();
        }
    }

    Piece.prototype.moveRight = function() {
        if(!this.collision(1,0,this.activeTetromino)){ this.unDraw(); this.x++; this.draw(); }
    }
    Piece.prototype.moveLeft = function() {
        if(!this.collision(-1,0,this.activeTetromino)){ this.unDraw(); this.x--; this.draw(); }
    }

    Piece.prototype.rotate = function() {
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
        let kick = 0;
        if(this.collision(0,0,nextPattern)){
            if(this.x > COL/2) kick = -1; else kick = 1;
        }
        if(!this.collision(kick,0,nextPattern)){
            this.unDraw();
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
    }

    Piece.prototype.collision = function(x,y,piecePattern) {
        for(let r = 0; r < piecePattern.length; r++) {
            for(let c = 0; c < piecePattern.length; c++) {
                if(!piecePattern[r][c]) continue;
                let newX = this.x + c + x;
                let newY = this.y + r + y;
                if(newX < 0 || newX >= COL || newY >= ROW) return true;
                if(newY < 0) continue;
                if(board[newY][newX].color !== VACANT) return true;
            }
        }
        return false;
    }

    Piece.prototype.lock = function() {
        for(let r = 0; r < this.activeTetromino.length; r++) {
            for(let c = 0; c < this.activeTetromino.length; c++) {
                if(!this.activeTetromino[r][c]) continue;
                if(this.y + r < 0) {
                    gameOver = true;
                    document.getElementById('tetris-gameover').style.display = 'flex';
                    window.tetrisReqId = null;
                    return;
                }
                board[this.y+r][this.x+c] = {color: this.color, img: this.img};
            }
        }
        
        // Check for full rows
        let linesCleared = 0;
        for(let r = 0; r < ROW; r++) {
            let isRowFull = true;
            for(let c = 0; c < COL; c++) {
                isRowFull = isRowFull && (board[r][c].color !== VACANT);
            }
            if(isRowFull) {
                // move down previous rows
                for(let y = r; y > 1; y--) {
                    for(let c = 0; c < COL; c++) board[y][c] = board[y-1][c];
                }
                for(let c = 0; c < COL; c++) board[0][c] = {color: VACANT, img: null};
                linesCleared++;
            }
        }
        
        if (linesCleared > 0) {
            score += linesCleared * 100;
            scoreEl.innerText = score;
            if (typeof addGlobalScore === 'function') addGlobalScore(linesCleared * 100);
        }
        drawBoard();
    }

    document.getElementById('start-tetris-btn').onclick = () => {
        gameOver = false;
        piece = randomPiece();
        document.getElementById('tetris-start-screen').style.display = 'none';
        dropStart = Date.now();
        loop();
    };

    window.tetrisKeydown = (e) => {
        if (!gameOver && document.getElementById('tetris-canvas')) {
            if (e.code === 'ArrowLeft') piece.moveLeft();
            else if (e.code === 'ArrowRight') piece.moveRight();
            else if (e.code === 'ArrowUp') piece.rotate();
            else if (e.code === 'ArrowDown') { piece.moveDown(); dropStart = Date.now(); }
            else if (e.code === 'Space') { 
                while(!piece.collision(0,1,piece.activeTetromino)) piece.moveDown();
                piece.moveDown(); // to lock it
                dropStart = Date.now();
            }
            if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') e.preventDefault();
        }
    };
    
    // Cleanup old event to prevent multi triggers
    document.removeEventListener('keydown', window.oldTetrisKeydown);
    window.oldTetrisKeydown = window.tetrisKeydown;
    document.addEventListener('keydown', window.tetrisKeydown);

    function loop() {
        if (gameOver || !document.getElementById('tetris-canvas')) return;
        let now = Date.now();
        let delta = now - dropStart;
        
        let speed = Math.max(100, 1000 - (score)); // speeds up as score increases
        if(delta > speed) {
            piece.moveDown();
            dropStart = Date.now();
        }
        window.tetrisReqId = requestAnimationFrame(loop);
    }
    
    drawBoard();
};
