// sudoku.js
window.initSudoku = function(container) {
    // Generate a punchline and a sticker
    let punchline = "Remplis les cases, babylovebutterfly !";
    if (globalData.assets && globalData.assets.punchlines && globalData.assets.punchlines.length > 0) {
        punchline = globalData.assets.punchlines[Math.floor(Math.random() * globalData.assets.punchlines.length)];
    }
    
    let stickerSrc = "win.webp"; // fallback
    if (globalData.assets && globalData.assets.allStickers && globalData.assets.allStickers.length > 0) {
        stickerSrc = globalData.assets.allStickers[Math.floor(Math.random() * globalData.assets.allStickers.length)];
    }

    container.innerHTML = `
        <div class="landing-content" style="max-width:800px; width:90%;">
            <header style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
                <h2>SUDOKU INFINI</h2>
                <div>
                    <button class="back-btn" onclick="initSudoku(document.getElementById('module-sudoku'))">Nouveau</button>
                    <button class="back-btn" onclick="showLandingPage()">Quitter</button>
                </div>
            </header>
            
            <div style="display:flex; align-items:center; gap:20px; background:rgba(255,255,255,0.1); padding:15px; border-radius:10px; margin-bottom: 20px;">
                <img src="${stickerSrc}" style="width:80px; border-radius:10px;" alt="sticker">
                <p style="font-size:22px; font-style:italic; font-weight:500; color:#fbbf24;">" ${punchline} "</p>
            </div>

            <div id="sudoku-board" class="sudoku-grid"></div>
            
            <button id="verify-sudoku-btn" class="game-btn" style="margin-top:20px;">Vérifier</button>
        </div>
    `;

    const boardEl = document.getElementById('sudoku-board');
    
    // Very basic Sudoku Generator
    // 1. Create a solved board.
    // 2. Remove K elements.
    const board = Array.from({length: 9}, () => Array(9).fill(0));
    
    function isValid(grid, r, c, k) {
        for (let i = 0; i < 9; i++) {
            if (grid[r][i] === k || grid[i][c] === k) return false;
            let rm = 3 * Math.floor(r / 3) + Math.floor(i / 3);
            let cm = 3 * Math.floor(c / 3) + i % 3;
            if (grid[rm][cm] === k) return false;
        }
        return true;
    }
    
    function solveGrid(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    // Try random order for variations!
                    let nums = [1,2,3,4,5,6,7,8,9];
                    nums.sort(() => Math.random() - 0.5);
                    for (let n of nums) {
                        if (isValid(grid, r, c, n)) {
                            grid[r][c] = n;
                            if (solveGrid(grid)) return true;
                            grid[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solveGrid(board);
    
    // Create puzzle by removing elements
    const puzzle = JSON.parse(JSON.stringify(board));
    let toRemove = 30; // Medium difficulty
    while (toRemove > 0) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            toRemove--;
        }
    }

    // Render Grid
    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = 'repeat(9, 40px)';
    boardEl.style.gap = '2px';
    boardEl.style.background = '#fff';
    boardEl.style.padding = '4px';
    boardEl.style.width = 'max-content';
    boardEl.style.margin = '0 auto';

    for(let r=0; r<9; r++) {
        for(let c=0; c<9; c++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.className = 'sudoku-cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            cell.style.width = '40px';
            cell.style.height = '40px';
            cell.style.textAlign = 'center';
            cell.style.fontSize = '20px';
            cell.style.fontWeight = 'bold';
            cell.style.border = 'none';
            cell.style.background = '#f1f5f9';
            cell.style.color = '#000';
            
            if (c === 2 || c === 5) cell.style.marginRight = '4px';
            if (r === 2 || r === 5) cell.style.marginBottom = '4px';

            if (puzzle[r][c] !== 0) {
                cell.value = puzzle[r][c];
                cell.readOnly = true;
                cell.style.background = '#e2e8f0';
                cell.style.color = '#334155';
            } else {
                // Ensure only numbers are typed
                cell.addEventListener('input', (e) => {
                    const val = e.target.value;
                    if (!/^[1-9]$/.test(val)) e.target.value = '';
                });
            }
            boardEl.appendChild(cell);
        }
    }

    // Checking logic
    document.getElementById('verify-sudoku-btn').onclick = () => {
        let isCorrect = true;
        let isComplete = true;
        const inputs = boardEl.querySelectorAll('input');
        
        inputs.forEach(input => {
            const r = input.dataset.r;
            const c = input.dataset.c;
            const val = parseInt(input.value);
            
            if (isNaN(val)) {
                isComplete = false;
                input.style.background = '#fca5a5'; // Light red empty
            } else if (val !== board[r][c]) {
                isCorrect = false;
                input.style.background = '#fef08a'; // Yellow wrong
            } else {
                if (!input.readOnly) input.style.background = '#bbf7d0'; // Green correct
            }
        });

        if (isCorrect && isComplete) {
            alert("🎉 SUDOKU RÉSOLU ! +100 points");
            addGlobalScore(POINTS_PER_WIN);
            showLandingPage();
        } else {
            // Just let them keep playing
        }
    };
};
