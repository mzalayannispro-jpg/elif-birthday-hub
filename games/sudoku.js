window.initSudoku = function(container) {
    const punchlines = [
        "Remplis bien tes cases, mon amour 💛",
        "Tu es plus forte que ce Sudoku !",
        "Chaque chiffre que tu mets = un bisou 🌹",
        "Mon cœur a plus de niveaux que ce puzzle 🧿",
        "İyi ki doğdun, ma petite cervelle de génie ⭐",
        "Baklava pour toi si tu gagnes ! 🍯",
        "La femme la plus intelligente du bosphore 🌙"
    ];

    const randomPunchline = punchlines[Math.floor(Math.random() * punchlines.length)];
    const randomSticker = 'assets/player.webp'; // Show player image as decoration

    container.innerHTML = `
    <div style="width:90vw; max-width:700px; background:linear-gradient(160deg, rgba(20,3,0,0.96), rgba(50,5,5,0.92)); border:3px solid #D4AF37; border-radius:16px; padding:28px; box-shadow:0 0 40px rgba(212,175,55,0.25);">
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:20px; letter-spacing:3px;">🔢 SUDOKU</h2>
            <div>
                <button onclick="initSudoku(document.getElementById('game-slot'))" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer; margin-right:6px;">Nouveau</button>
                <button onclick="hideGame()" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer;">← Menu</button>
            </div>
        </header>
        
        <!-- Random quote + sticker -->
        <div style="display:flex; align-items:center; gap:16px; background:rgba(255,255,255,0.07); padding:14px 18px; border-radius:10px; border:1px solid rgba(212,175,55,0.25); margin-bottom:20px;">
            <img src="${randomSticker}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; border:2px solid #D4AF37;">
            <p style="font-family:'Lora',serif; font-style:italic; font-size:16px; color:#F5E27A;">" ${randomPunchline} "</p>
        </div>

        <div id="sudoku-grid-wrap" style="display:flex; justify-content:center; margin-bottom:20px;"></div>
        
        <div style="text-align:center; display:flex; gap:12px; justify-content:center;">
            <button id="verify-btn" style="background:linear-gradient(135deg,#6B0000,#A50000); border:2px solid #D4AF37; color:#FDF5E6; font-family:'Cinzel Decorative',cursive; font-size:12px; font-weight:700; padding:12px 28px; border-radius:8px; cursor:pointer; letter-spacing:2px; transition:all 0.3s;">VÉRIFIER ✦</button>
        </div>
        <p id="check-result" style="text-align:center; margin-top:12px; font-size:14px; font-family:'Lora',serif; min-height:20px; color:#4ECDC4;"></p>
    </div>
    `;

    // Generate Sudoku
    const board = Array.from({length: 9}, () => Array(9).fill(0));
    
    function isValid(grid, r, c, k) {
        for (let i = 0; i < 9; i++) {
            if (grid[r][i] === k || grid[i][c] === k) return false;
            const rm = 3 * Math.floor(r / 3) + Math.floor(i / 3);
            const cm = 3 * Math.floor(c / 3) + i % 3;
            if (grid[rm][cm] === k) return false;
        }
        return true;
    }
    
    function solve(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                    for (const n of nums) {
                        if (isValid(grid, r, c, n)) {
                            grid[r][c] = n;
                            if (solve(grid)) return true;
                            grid[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve(board);
    const puzzle = board.map(row => [...row]);
    
    // Remove cells for medium difficulty
    let removed = 0;
    while (removed < 35) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
    }

    // Render grid
    const wrap = document.getElementById('sudoku-grid-wrap');
    const table = document.createElement('table');
    table.style.cssText = 'border-collapse:collapse;';
    
    for (let r = 0; r < 9; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 9; c++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.r = r;
            input.dataset.c = c;
            
            // Strong borders for 3x3 boxes
            const borderTop = r % 3 === 0 ? '3px solid #D4AF37' : '1px solid #aaa';
            const borderLeft = c % 3 === 0 ? '3px solid #D4AF37' : '1px solid #aaa';
            const borderBottom = r === 8 ? '3px solid #D4AF37' : '1px solid #aaa';
            const borderRight = c === 8 ? '3px solid #D4AF37' : '1px solid #aaa';
            
            input.style.cssText = `
                width: 44px; height: 44px;
                text-align: center;
                font-size: 20px;
                font-weight: 700;
                font-family: 'Outfit', sans-serif;
                border-top: ${borderTop};
                border-left: ${borderLeft};
                border-bottom: ${borderBottom};
                border-right: ${borderRight};
                background: #FFFEF5;
                color: #2A0A00;
                outline: none;
                transition: background 0.2s;
            `;
            
            if (puzzle[r][c] !== 0) {
                input.value = puzzle[r][c];
                input.readOnly = true;
                input.style.background = '#F0E6CC';
                input.style.color = '#6B0000';
                input.style.fontWeight = '900';
            } else {
                input.addEventListener('input', (e) => {
                    if (!/^[1-9]$/.test(e.target.value)) e.target.value = '';
                    else e.target.style.background = '#FFFFF0';
                });
                input.addEventListener('focus', (e) => e.target.style.background = '#FFF3D0');
                input.addEventListener('blur', (e) => { if (!e.target.readOnly) e.target.style.background = '#FFFEF5'; });
            }
            
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    
    wrap.appendChild(table);
    
    document.getElementById('verify-btn').onclick = () => {
        const result = document.getElementById('check-result');
        const inputs = table.querySelectorAll('input');
        let allCorrect = true;
        let allFilled = true;
        
        inputs.forEach(inp => {
            const r = inp.dataset.r, c = inp.dataset.c;
            const val = parseInt(inp.value);
            if (isNaN(val)) {
                allFilled = false;
                if (!inp.readOnly) inp.style.background = '#FFD0D0';
            } else if (val !== board[r][c]) {
                allCorrect = false;
                inp.style.background = '#FEF08A';
            } else {
                if (!inp.readOnly) inp.style.background = '#DCFCE7';
            }
        });
        
        if (!allFilled) {
            result.textContent = '❌ Il manque des chiffres !';
            result.style.color = '#f43f5e';
        } else if (!allCorrect) {
            result.textContent = '⚠️ Certaines cases sont incorrectes, cherche encore...';
            result.style.color = '#fbbf24';
        } else {
            result.textContent = '🎉 PARFAIT ! +100 points !';
            result.style.color = '#4ade80';
            if (typeof addGlobalScore === 'function') addGlobalScore(POINTS_PER_WIN);
            setTimeout(() => {
                result.textContent = 'Bravo babylovebutterfly ! 🌹';
                setTimeout(() => hideGame(), 2000);
            }, 1500);
        }
    };
};
