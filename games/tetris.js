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
            
            <div id="tetris-wrapper" style="position:relative; display:inline-block; width:100%;">
                <canvas id="tetris-canvas" width="400" height="800" style="background:rgba(0,0,0,0.8); border:2px solid #D4AF37; box-shadow:0 0 15px rgba(0,0,0,0.8); width:100%; max-width:400px; max-height:80vh;"></canvas>
                
                <div id="tetris-start-screen" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <h2 style="color:#D4AF37; font-family:'Cinzel Decorative';" data-i18n="game.ready">PRÊT ?</h2>
                    <p style="color:#ddd; margin-bottom:20px; font-size:14px; line-height:1.6;" data-i18n="tetris.controls">⬅️ ➡️ : Bouger<br>⬆️ : Tourner<br>⬇️ : Accélérer<br>Espace : Chute libre</p>
                    <button id="start-tetris-btn" style="background:#D4AF37; border:none; color:#1A1A3A; padding:10px 20px; font-family:'Cinzel Decorative'; font-weight:bold; cursor:pointer; border-radius:6px;" data-i18n="tetris.play">JOUER</button>
                </div>
                
                <div id="tetris-gameover" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(139,0,0,0.8); flex-direction:column; justify-content:center; align-items:center;">
                    <h2 style="color:#FFF;" data-i18n="tetris.gameover">GAME OVER</h2>
                    <button onclick="initTetris(document.getElementById('game-slot'))" style="background:#FFF; color:#8B0000; border:none; padding:10px 20px; font-weight:bold; cursor:pointer; border-radius:6px; margin-top:10px;" data-i18n="game.replay">Rejouer</button>
                </div>
            </div>

            <!-- Touch controls for tablet/mobile -->
            <div id="tetris-touch-btns" style="display:flex; justify-content:center; gap:10px; margin-top:12px; touch-action:manipulation;">
                <button ontouchstart="if(piece)piece.moveLeft()" onclick="if(piece)piece.moveLeft()" style="background:rgba(212,175,55,0.15); border:1px solid #D4AF37; color:#D4AF37; width:60px; height:50px; border-radius:8px; font-size:22px; cursor:pointer; touch-action:manipulation;">⬅️</button>
                <button ontouchstart="if(piece)piece.rotate()" onclick="if(piece)piece.rotate()" style="background:rgba(212,175,55,0.15); border:1px solid #D4AF37; color:#D4AF37; width:60px; height:50px; border-radius:8px; font-size:22px; cursor:pointer; touch-action:manipulation;">🔄</button>
                <button ontouchstart="if(piece){while(!piece.collision(0,1,piece.activeTetromino))piece.y++;piece.moveDown();}" onclick="if(piece){while(!piece.collision(0,1,piece.activeTetromino))piece.y++;piece.moveDown();}" style="background:rgba(212,175,55,0.15); border:1px solid #D4AF37; color:#D4AF37; width:60px; height:50px; border-radius:8px; font-size:22px; cursor:pointer; touch-action:manipulation;">⬇️</button>
                <button ontouchstart="if(piece)piece.moveRight()" onclick="if(piece)piece.moveRight()" style="background:rgba(212,175,55,0.15); border:1px solid #D4AF37; color:#D4AF37; width:60px; height:50px; border-radius:8px; font-size:22px; cursor:pointer; touch-action:manipulation;">➡️</button>
            </div>
        </div>
        `;
        if(window.setLanguage) window.setLanguage(window.currentLang);
    }

    const cvs = document.getElementById('tetris-canvas');
    const ctx = cvs.getContext('2d');
    const scoreEl = document.getElementById('tetris-score');
    
    const ROW = 20;
    const COL = 10;
    const SQ = 40; // 400 / 10
    const VACANT = "transparent";
    
    const SHAPE_NAMES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const shapeImages = {};
    
    SHAPE_NAMES.forEach(shape => {
        shapeImages[shape] = [];
        if (window.GAME_ASSETS && window.GAME_ASSETS['tetris'] && window.GAME_ASSETS['tetris'][shape]) {
            window.GAME_ASSETS['tetris'][shape].forEach(url => {
                let img = new Image();
                img.src = url;
                shapeImages[shape].push(img);
            });
        }
    });

    let board = [];
    for(let r = 0; r < ROW; r++){ board[r] = []; for(let c = 0; c < COL; c++){ board[r][c] = { color: VACANT, img: null }; } }

    function drawSquare(x, y, cell) {
        if (cell.color === VACANT) return;
        // Image rendering is handled in fill() as a single drawImage over the bounding box.
        // drawSquare only handles solid color fallback for locked board cells without images.
        if (!cell.img) {
            ctx.fillStyle = cell.color;
            ctx.fillRect(x*SQ, y*SQ, SQ, SQ);
        }
    }

    function drawBoard() {
        ctx.clearRect(0,0,cvs.width,cvs.height);

        // Grid
        ctx.strokeStyle = "rgba(212,175,55,0.1)";
        ctx.lineWidth = 1;
        for(let r = 0; r <= ROW; r++) { ctx.beginPath(); ctx.moveTo(0, r*SQ); ctx.lineTo(cvs.width, r*SQ); ctx.stroke(); }
        for(let c = 0; c <= COL; c++) { ctx.beginPath(); ctx.moveTo(c*SQ, 0); ctx.lineTo(c*SQ, cvs.height); ctx.stroke(); }

        // Pass 1 : solid color fill for cells without a sticker image
        for(let r = 0; r < ROW; r++){
            for(let c = 0; c < COL; c++){
                let cell = board[r][c];
                if(cell.color !== VACANT && !cell.img) {
                    ctx.fillStyle = cell.color;
                    ctx.fillRect(c*SQ, r*SQ, SQ, SQ);
                }
            }
        }

        // Pass 2 : sticker images for locked pieces (one drawImage per pieceId)
        const drawnIds = new Set();
        for(let r = 0; r < ROW; r++) {
            for(let c = 0; c < COL; c++) {
                let cell = board[r][c];
                if(cell.color === VACANT || !cell.img || !cell.pieceId) continue;
                if(drawnIds.has(cell.pieceId)) continue;
                drawnIds.add(cell.pieceId);

                // Find bounding box of all cells sharing this pieceId
                let minR = ROW, maxR = 0, minC = COL, maxC = 0;
                for(let rr = 0; rr < ROW; rr++) {
                    for(let cc = 0; cc < COL; cc++) {
                        if(board[rr][cc].pieceId === cell.pieceId) {
                            if(rr < minR) minR = rr; if(rr > maxR) maxR = rr;
                            if(cc < minC) minC = cc; if(cc > maxC) maxC = cc;
                        }
                    }
                }

                if(cell.img.complete && cell.img.naturalWidth > 0) {
                    ctx.save();
                    ctx.beginPath();
                    for(let rr = 0; rr < ROW; rr++) {
                        for(let cc = 0; cc < COL; cc++) {
                            if(board[rr][cc].pieceId === cell.pieceId)
                                ctx.rect(cc*SQ, rr*SQ, SQ, SQ);
                        }
                    }
                    ctx.clip();
                    ctx.drawImage(cell.img, minC*SQ, minR*SQ, (maxC-minC+1)*SQ, (maxR-minR+1)*SQ);
                    ctx.restore();
                }
            }
        }

        // Pass 3 : colored outline around each locked piece
        ctx.lineWidth = 3;
        for(let r = 0; r < ROW; r++) {
            for(let c = 0; c < COL; c++) {
                let cell = board[r][c];
                if(cell.color !== VACANT && cell.pieceId) {
                    ctx.strokeStyle = cell.color;
                    let rx = c*SQ; let ry = r*SQ;
                    ctx.beginPath();
                    if(r===0 || (board[r-1] && board[r-1][c].pieceId !== cell.pieceId)) { ctx.moveTo(rx, ry); ctx.lineTo(rx+SQ, ry); }
                    if(r===ROW-1 || (board[r+1] && board[r+1][c].pieceId !== cell.pieceId)) { ctx.moveTo(rx, ry+SQ); ctx.lineTo(rx+SQ, ry+SQ); }
                    if(c===0 || board[r][c-1]?.pieceId !== cell.pieceId) { ctx.moveTo(rx, ry); ctx.lineTo(rx, ry+SQ); }
                    if(c===COL-1 || board[r][c+1]?.pieceId !== cell.pieceId) { ctx.moveTo(rx+SQ, ry); ctx.lineTo(rx+SQ, ry+SQ); }
                    ctx.stroke();
                }
            }
        }
    }
    
    function renderAll() {
        drawBoard();
        if(piece) {
            piece.drawGhost();
            piece.draw();
        }
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
        let shapeName = SHAPE_NAMES[r];
        let imgArray = shapeImages[shapeName];
        let img = null;
        if (imgArray && imgArray.length > 0) {
            img = imgArray[Math.floor(Math.random() * imgArray.length)];
        }
        
        let neonColors = ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF3300', '#00FF99', '#9D00FF'];
        let rc = neonColors[Math.floor(Math.random() * neonColors.length)];
        return new Piece(PIECES[r], rc, img);
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
        let bounds = this.getBounds();

        if (this.img && this.img.complete && this.img.naturalWidth > 0) {
            // Sticker mode: stretch image over the piece bounding box, clip to active cells only
            ctx.save();
            ctx.beginPath();
            for(let r = 0; r < this.activeTetromino.length; r++) {
                for(let c = 0; c < this.activeTetromino.length; c++) {
                    if(this.activeTetromino[r][c])
                        ctx.rect((this.x+c)*SQ, (this.y+r)*SQ, SQ, SQ);
                }
            }
            ctx.clip();
            ctx.drawImage(
                this.img,
                (this.x + bounds.minC) * SQ, (this.y + bounds.minR) * SQ,
                bounds.wCells * SQ, bounds.hCells * SQ
            );
            ctx.restore();
        } else {
            // Fallback: solid color fill
            for(let r = 0; r < this.activeTetromino.length; r++) {
                for(let c = 0; c < this.activeTetromino.length; c++) {
                    if(this.activeTetromino[r][c]) {
                        ctx.fillStyle = color;
                        ctx.fillRect((this.x+c)*SQ, (this.y+r)*SQ, SQ, SQ);
                    }
                }
            }
        }
    }

    Piece.prototype.draw = function() { 
        this.fill(this.color); 
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        for(let r = 0; r < this.activeTetromino.length; r++) {
            for(let c = 0; c < this.activeTetromino.length; c++) {
                if(this.activeTetromino[r][c]) {
                    let rx = (this.x + c)*SQ; let ry = (this.y + r)*SQ;
                    ctx.beginPath();
                    if(r===0 || !this.activeTetromino[r-1] || !this.activeTetromino[r-1][c]) { ctx.moveTo(rx, ry); ctx.lineTo(rx+SQ, ry); }
                    if(r===this.activeTetromino.length-1 || !this.activeTetromino[r+1] || !this.activeTetromino[r+1][c]) { ctx.moveTo(rx, ry+SQ); ctx.lineTo(rx+SQ, ry+SQ); }
                    if(c===0 || !this.activeTetromino[r][c-1]) { ctx.moveTo(rx, ry); ctx.lineTo(rx, ry+SQ); }
                    if(c===this.activeTetromino.length-1 || !this.activeTetromino[r][c+1]) { ctx.moveTo(rx+SQ, ry); ctx.lineTo(rx+SQ, ry+SQ); }
                    ctx.stroke();
                }
            }
        }
    }
    
    Piece.prototype.drawGhost = function() {
        let ghostY = this.y;
        while(!this.collision(0, ghostY - this.y + 1, this.activeTetromino)) ghostY++;
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "white";
        for(let r = 0; r < this.activeTetromino.length; r++) {
            for(let c = 0; c < this.activeTetromino.length; c++) {
                if(this.activeTetromino[r][c]) {
                    ctx.fillRect((this.x + c)*SQ, (ghostY + r)*SQ, SQ, SQ);
                }
            }
        }
        ctx.globalAlpha = 1.0;
    }

    Piece.prototype.moveDown = function() {
        if(!this.collision(0,1,this.activeTetromino)) {
            this.y++; renderAll();
        } else {
            this.lock();
            piece = randomPiece();
            renderAll();
        }
    }

    Piece.prototype.moveRight = function() {
        if(!this.collision(1,0,this.activeTetromino)){ this.x++; renderAll(); }
    }
    Piece.prototype.moveLeft = function() {
        if(!this.collision(-1,0,this.activeTetromino)){ this.x--; renderAll(); }
    }

    Piece.prototype.rotate = function() {
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
        let kick = 0;
        if(this.collision(0,0,nextPattern)){
            // Wall Kicks
            const tests = [1, -1, 2, -2];
            for (let i = 0; i < tests.length; i++) {
                if(!this.collision(tests[i],0,nextPattern)) { kick = tests[i]; break; }
            }
        }
        if(!this.collision(kick,0,nextPattern)){
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.tetrominoN];
            renderAll();
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
        let bounds = this.getBounds();
        let pieceId = Date.now() + Math.random();
        for(let r = 0; r < this.activeTetromino.length; r++) {
            for(let c = 0; c < this.activeTetromino.length; c++) {
                if(!this.activeTetromino[r][c]) continue;
                if(this.y + r < 0) {
                    gameOver = true;
                    window.tetrisReqId = null;
                    if (window.showGlobalGameOver) {
                        window.showGlobalGameOver(() => {
                            // Reset the board completely
                            for(let _r = 0; _r < ROW; _r++) {
                                for(let _c = 0; _c < COL; _c++) {
                                    board[_r][_c] = { color: VACANT, img: null };
                                }
                            }
                            score = 0;
                            scoreEl.innerText = score;
                            document.getElementById('start-tetris-btn').click();
                        });
                    } else {
                        document.getElementById('tetris-gameover').style.display = 'flex';
                    }
                    return;
                }
                board[this.y+r][this.x+c] = {
                    color: this.color,
                    img: this.img,   // stored so drawBoard can render the sticker when locked
                    pieceId: pieceId
                };
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
        renderAll();
        loop();
    };

    window.tetrisKeydown = (e) => {
        if (!gameOver && document.getElementById('tetris-canvas')) {
            if (e.code === 'ArrowLeft') piece.moveLeft();
            else if (e.code === 'ArrowRight') piece.moveRight();
            else if (e.code === 'ArrowUp') piece.rotate();
            else if (e.code === 'ArrowDown') { piece.moveDown(); dropStart = Date.now(); }
            else if (e.code === 'Space') { 
                while(!piece.collision(0,1,piece.activeTetromino)) piece.y++;
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
