window.initSudoku = function(container) {
    const fallbackPunchlines = [
        "Remplis bien tes cases, mon amour 💛",
        "Tu es plus forte que ce Sudoku !",
        "Chaque chiffre que tu mets = un bisou 🌹",
        "Mon cœur a plus de niveaux que ce puzzle 🧿",
        "İyi ki doğdun, ma petite cervelle de génie ⭐",
        "Baklava pour toi si tu gagnes ! 🍯",
        "La femme la plus intelligente du bosphore 🌙"
    ];

    const sourceQuotes = (window.ELIF_QUOTES && window.ELIF_QUOTES.length > 0) ? window.ELIF_QUOTES : fallbackPunchlines;
    const randomPunchline = sourceQuotes[Math.floor(Math.random() * sourceQuotes.length)];

    // ── Sticker map: digit 1-9 → sticker image ──────────────────────────────
    const sudokuAssets = (window.GAME_ASSETS && window.GAME_ASSETS.sudoku && window.GAME_ASSETS.sudoku.length >= 9)
        ? window.GAME_ASSETS.sudoku
        : null;

    // DIGIT_STICKER[1..9] → sticker URL (index 0 = digit 1, etc.)
    const DIGIT_STICKER = sudokuAssets
        ? [null, ...sudokuAssets.slice(0, 9)]  // index 0 unused, 1-9 usable
        : null;

    // Pre-load sticker images
    const stickerImgs = {};
    if (DIGIT_STICKER) {
        for (let d = 1; d <= 9; d++) {
            const img = new Image();
            img.src = DIGIT_STICKER[d];
            stickerImgs[d] = img;
        }
    }

    // A decorative sticker for the header quote
    const randomSticker = sudokuAssets
        ? sudokuAssets[Math.floor(Math.random() * sudokuAssets.length)]
        : 'assets/player.webp';

    // Win sticker: pick from sudoku pool, prefer one that's not used for digits
    const winSticker = sudokuAssets
        ? sudokuAssets[Math.floor(Math.random() * sudokuAssets.length)]
        : 'assets/win.webp';

    // ── Sudoku cell size ─────────────────────────────────────────────────────
    const CELL = DIGIT_STICKER ? 54 : 44; // bigger cells for stickers

    container.innerHTML = `
    <div style="width:90vw; max-width:700px; background:linear-gradient(160deg, rgba(20,3,0,0.96), rgba(50,5,5,0.92)); border:3px solid #D4AF37; border-radius:16px; padding:28px; box-shadow:0 0 40px rgba(212,175,55,0.25);">
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:20px; letter-spacing:3px;" data-i18n="game.sdk">🔢 SUDOKU</h2>
            <div>
                <button onclick="initSudoku(document.getElementById('game-slot'))" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer; margin-right:6px;" data-i18n="game.replay">Nouveau</button>
                <button onclick="hideGame()" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer;" data-i18n="game.back">← Menu</button>
            </div>
        </header>

        <!-- Random quote + sticker -->
        <div style="display:flex; align-items:center; gap:16px; background:rgba(255,255,255,0.07); padding:14px 18px; border-radius:10px; border:1px solid rgba(212,175,55,0.25); margin-bottom:20px;">
            <img src="${randomSticker}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; border:2px solid #D4AF37;">
            <p style="font-family:'Lora',serif; font-style:italic; font-size:16px; color:#F5E27A;">" ${randomPunchline} "</p>
        </div>

        ${DIGIT_STICKER ? `
        <!-- Sticker legend 1-9 -->
        <div id="sudoku-legend" style="display:flex; justify-content:center; gap:6px; flex-wrap:wrap; margin-bottom:14px;">
            ${[1,2,3,4,5,6,7,8,9].map(d => `
                <div style="display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:4px 6px; border-radius:8px; border:1px solid rgba(212,175,55,0.3); background:rgba(0,0,0,0.3); transition:all 0.2s;"
                     onclick="document.getElementById('sudoku-grid-wrap').querySelectorAll('input:not([readonly])').forEach(i=>i.dataset.pending='')"
                     id="legend-${d}">
                    <img src="${DIGIT_STICKER[d]}" style="width:36px; height:36px; object-fit:contain;">
                    <span style="color:#D4AF37; font-size:11px; font-weight:bold; font-family:'Outfit',sans-serif;">${d}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div id="sudoku-grid-wrap" style="display:flex; justify-content:center; margin-bottom:20px;"></div>

        <div style="text-align:center; display:flex; gap:12px; justify-content:center; flex-direction:column; align-items:center;">
            <p id="sudoku-errors" style="color:#f43f5e; font-size:18px; font-weight:bold; font-family:'Outfit',sans-serif; margin:0;" data-i18n="sdk.errors"></p>
            <p id="check-result" style="text-align:center; font-size:16px; font-family:'Lora',serif; min-height:20px; color:#4ECDC4; transition: all 0.3s;"></p>
        </div>
    </div>
    `;
    if(window.setLanguage) window.setLanguage(window.currentLang);
    document.getElementById('sudoku-errors').textContent = window.t('sdk.errors').replace('{x}', '0');

    let errorCount = 0;

    // ── Generate Sudoku ──────────────────────────────────────────────────────
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

    // ── Render grid ──────────────────────────────────────────────────────────
    const wrap = document.getElementById('sudoku-grid-wrap');
    const table = document.createElement('table');
    table.style.cssText = 'border-collapse:collapse;';

    // ── Helper: render a cell's value as sticker or number ──────────────────
    function renderCellContent(td, digit, isGiven) {
        td.innerHTML = '';
        if (!digit) return;

        if (DIGIT_STICKER && stickerImgs[digit]) {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                width:100%; height:100%;
                display:flex; align-items:center; justify-content:center;
                position:relative;
            `;
            const img = document.createElement('img');
            img.src = DIGIT_STICKER[digit];
            img.style.cssText = `
                width:${isGiven ? CELL - 8 : CELL - 10}px;
                height:${isGiven ? CELL - 8 : CELL - 10}px;
                object-fit:contain;
                pointer-events:none;
                ${isGiven ? 'filter:drop-shadow(0 0 4px rgba(212,175,55,0.6));' : 'opacity:0.9;'}
            `;
            wrapper.appendChild(img);
            td.appendChild(wrapper);
        } else {
            td.textContent = digit;
        }
    }

    for (let r = 0; r < 9; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 9; c++) {
            const td = document.createElement('td');
            td.dataset.r = r;
            td.dataset.c = c;
            td.dataset.value = puzzle[r][c] ? String(puzzle[r][c]) : '';

            const borderTop    = r % 3 === 0 ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            const borderLeft   = c % 3 === 0 ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            const borderBottom = r === 8     ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            const borderRight  = c === 8     ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';

            const isGiven = puzzle[r][c] !== 0;

            td.style.cssText = `
                width:${CELL}px; height:${CELL}px;
                text-align:center; vertical-align:middle;
                font-size:20px; font-weight:700;
                font-family:'Outfit',sans-serif;
                border-top:${borderTop};
                border-left:${borderLeft};
                border-bottom:${borderBottom};
                border-right:${borderRight};
                background:${isGiven ? 'rgba(212,175,55,0.12)' : 'rgba(0,0,0,0.4)'};
                color:${isGiven ? '#D4AF37' : '#FFF'};
                cursor:${isGiven ? 'default' : 'pointer'};
                transition:background 0.2s, box-shadow 0.2s;
                position:relative; overflow:hidden;
                user-select:none;
            `;

            if (isGiven) {
                renderCellContent(td, puzzle[r][c], true);
            } else {
                // Click to cycle through stickers via keyboard input OR click-to-pick
                let currentVal = 0;

                // ── Keyboard input ───────────────────────────────────────────
                td.tabIndex = 0;
                td.setAttribute('role', 'button');

                td.addEventListener('focus', () => {
                    if (!td.dataset.locked) td.style.boxShadow = '0 0 0 3px #D4AF37';
                });
                td.addEventListener('blur', () => {
                    td.style.boxShadow = '';
                });

                td.addEventListener('keydown', (e) => {
                    if (td.dataset.locked) return;
                    const n = parseInt(e.key);
                    if (n >= 1 && n <= 9) {
                        e.preventDefault();
                        validateEntry(td, n, r, c);
                    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                        e.preventDefault();
                        currentVal = 0;
                        td.dataset.value = '';
                        td.innerHTML = '';
                        td.style.background = 'rgba(0,0,0,0.4)';
                        td.style.boxShadow = '0 0 0 3px #D4AF37';
                    }
                });

                // Click to cycle: 0 → 1 → 2 → ... → 9 → 0
                td.addEventListener('click', () => {
                    if (td.dataset.locked) return;
                    currentVal = (currentVal % 9) + 1;
                    // Show tentative (not validated yet); user must press Enter or next click validates
                    renderCellContent(td, currentVal, false);
                    td.dataset.pending = currentVal;
                    td.style.background = 'rgba(212,175,55,0.08)';
                    td.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.5)';
                });

                // Double-click or Enter to validate pending value
                td.addEventListener('dblclick', () => {
                    if (td.dataset.locked || !td.dataset.pending) return;
                    const n = parseInt(td.dataset.pending);
                    if (n >= 1 && n <= 9) validateEntry(td, n, r, c);
                });

                td.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && td.dataset.pending && !td.dataset.locked) {
                        const n = parseInt(td.dataset.pending);
                        if (n >= 1 && n <= 9) validateEntry(td, n, r, c);
                    }
                });

                function validateEntry(cell, n, row, col) {
                    delete cell.dataset.pending;
                    currentVal = n;

                    if (n === board[row][col]) {
                        // ✅ Correct
                        renderCellContent(cell, n, false);
                        cell.dataset.value = String(n);
                        cell.dataset.locked = '1';
                        cell.style.background = 'rgba(74,222,128,0.15)';
                        cell.style.boxShadow = '0 0 12px rgba(74,222,128,0.4)';
                        cell.style.cursor = 'default';
                        setTimeout(() => {
                            if (!cell.dataset.win) {
                                cell.style.background = 'rgba(0,0,0,0.4)';
                                cell.style.boxShadow = '';
                            }
                        }, 1000);
                        checkWin();
                    } else {
                        // ❌ Wrong
                        renderCellContent(cell, n, false);
                        cell.style.background = 'rgba(244,63,94,0.3)';
                        cell.style.boxShadow = '0 0 12px rgba(244,63,94,0.6)';
                        setTimeout(() => {
                            cell.innerHTML = '';
                            cell.dataset.value = '';
                            cell.style.background = 'rgba(0,0,0,0.4)';
                            cell.style.boxShadow = '';
                            currentVal = 0;
                        }, 900);

                        errorCount++;
                        document.getElementById('sudoku-errors').textContent = window.t('sdk.errors').replace('{x}', errorCount);

                        if (errorCount >= 3) {
                            const result = document.getElementById('check-result');
                            result.innerHTML = window.t('sdk.toomany');
                            result.style.color = '#f43f5e';
                            table.querySelectorAll('td[tabindex]').forEach(c => c.dataset.locked = '1');
                            setTimeout(() => window.initSudoku(container), 2500);
                        }
                    }
                }
            }

            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    wrap.appendChild(table);

    // ── Check Win ────────────────────────────────────────────────────────────
    function checkWin() {
        const cells = table.querySelectorAll('td');
        let allCorrect = true;
        cells.forEach(td => {
            const r = td.dataset.r, c = td.dataset.c;
            if (parseInt(td.dataset.value) !== board[r][c]) allCorrect = false;
        });

        if (allCorrect) {
            const result = document.getElementById('check-result');
            result.innerHTML = `
                <div style="animation:fade-in 1s forwards;">
                    <h3 style="color:#4ade80; font-family:'Cinzel Decorative'; margin-bottom:10px;">${window.t('sdk.perfect')}</h3>
                    <img src="${winSticker}" style="max-height:180px; border-radius:10px; border:3px solid #D4AF37; box-shadow:0 0 20px rgba(212,175,55,0.6);">
                    <h2 style="color:#F5E27A; font-family:'Cinzel Decorative',cursive; margin-top:10px;">Elif is Lisan al Ghaib 🌹</h2>
                </div>
            `;
            if (typeof addGlobalScore === 'function') addGlobalScore(POINTS_PER_WIN);
            setTimeout(() => hideGame(), 4500);
        }
    }
};
