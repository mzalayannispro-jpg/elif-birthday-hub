window.initSudoku = function(container) {
    // ── Les punchlines personnalisées de l'utilisateur (remplace les phrases FR auto-générées) ──
    const legendaryPunchlines = [
        "I want fruit liquid=juice 11.09.25",
        "🎬 ElXulo=Pelicula=Hairdraiser · 24.04.26",
        "🐬 Where are my flipper Slipper+FlipFlop · 02.07.24",
        "☀️ 15.07.24 · Manana por la morningo",
        "🌳 Why did you refused 2 times Indian Restaurant? Because I love trees · 16.07.24",
        "🍽️ 9.8.24 · Nécessito comer ahora porque soy muy hungriyero",
        "💳 27.08.24 · Your bank card is not successfull to paid",
        "💇 14.01.24 · I want to Saïd my air is curly.. tengo el pedo Rosita",
        "📱 21.05.25 · 9pm message + vocal = I heard your mocal",
        "🌽 This is corn without pop · 11.12.23",
        "🤔 Difficult + complicated : diflicated · 12.12.23"
    ];
    
    // On force les punchlines personnelles comme seul fallback
    const fallbackPunchlines = legendaryPunchlines;

    const sourceQuotes = (window.ELIF_QUOTES && window.ELIF_QUOTES.length > 0) ? window.ELIF_QUOTES : fallbackPunchlines;
    const randomPunchline = sourceQuotes[Math.floor(Math.random() * sourceQuotes.length)];

    // ── Sticker map ─────────────────────────────────────────────────────────
    const sudokuAssets = (window.GAME_ASSETS && window.GAME_ASSETS.sudoku && window.GAME_ASSETS.sudoku.length >= 9)
        ? window.GAME_ASSETS.sudoku : null;
    const DIGIT_STICKER = sudokuAssets ? [null, ...sudokuAssets.slice(0, 9)] : null;

    const stickerImgs = {};
    if (DIGIT_STICKER) {
        for (let d = 1; d <= 9; d++) {
            const img = new Image(); img.src = DIGIT_STICKER[d]; stickerImgs[d] = img;
        }
    }
    const randomSticker = sudokuAssets ? sudokuAssets[Math.floor(Math.random() * sudokuAssets.length)] : 'assets/player.webp';
    const winSticker    = sudokuAssets ? sudokuAssets[Math.floor(Math.random() * sudokuAssets.length)] : 'assets/win.webp';
    const CELL = DIGIT_STICKER ? 54 : 44;

    container.innerHTML = `
    <style>
        @keyframes sdk-ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .sdk-ticker-track {
            display: flex;
            width: max-content;
            animation: sdk-ticker-scroll 38s linear infinite;
        }
        .sdk-ticker-track:hover { animation-play-state: paused; }
        .sdk-ticker-item {
            white-space: nowrap;
            padding: 0 56px;
            font-family: 'Lora', serif;
            font-style: italic;
            font-size: 13.5px;
            color: #F5E27A;
            letter-spacing: 0.4px;
        }
        .sdk-ticker-sep {
            color: #D4AF37;
            padding: 0 8px;
            font-style: normal;
        }
    </style>
    <div style="width:90vw; max-width:700px;">

        <!-- ── Punchlines Ticker ────────────────────────────────── -->
        <div style="
            overflow: hidden;
            background: linear-gradient(90deg, rgba(30,5,0,0.97), rgba(60,8,8,0.95));
            border: 2px solid #D4AF37;
            border-radius: 12px 12px 0 0;
            padding: 10px 0;
            box-shadow: 0 0 20px rgba(212,175,55,0.3);
            position: relative;
        ">
            <div style="position:absolute;top:0;left:0;width:60px;height:100%;background:linear-gradient(90deg,rgba(30,5,0,0.97),transparent);z-index:2;pointer-events:none;"></div>
            <div style="position:absolute;top:0;right:0;width:60px;height:100%;background:linear-gradient(270deg,rgba(30,5,0,0.97),transparent);z-index:2;pointer-events:none;"></div>
            <div class="sdk-ticker-track">
                ${[...legendaryPunchlines, ...legendaryPunchlines].map(p =>
                    `<span class="sdk-ticker-item">${p}<span class="sdk-ticker-sep">✦</span></span>`
                ).join('')}
            </div>
        </div>

        <!-- ── Main Game Card ──────────────────────────────────── -->
        <div style="background:linear-gradient(160deg,rgba(20,3,0,0.96),rgba(50,5,5,0.92)); border:3px solid #D4AF37; border-top:none; border-radius:0 0 16px 16px; padding:28px; box-shadow:0 0 40px rgba(212,175,55,0.25);">
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:20px; letter-spacing:3px;" data-i18n="game.sdk">🔢 SUDOKU</h2>
            <div>
                <button onclick="initSudoku(document.getElementById('game-slot'))" style="background:transparent;border:1px solid #D4AF37;color:#D4AF37;padding:6px 14px;border-radius:5px;cursor:pointer;margin-right:6px;" data-i18n="game.replay">Nouveau</button>
                <button onclick="hideGame()" style="background:transparent;border:1px solid #D4AF37;color:#D4AF37;padding:6px 14px;border-radius:5px;cursor:pointer;" data-i18n="game.back">← Menu</button>
            </div>
        </header>

        <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.07);padding:14px 18px;border-radius:10px;border:1px solid rgba(212,175,55,0.25);margin-bottom:20px;">
            <img src="${randomSticker}" style="width:60px;height:60px;object-fit:cover;border-radius:50%;border:2px solid #D4AF37;">
            <p style="font-family:'Lora',serif;font-style:italic;font-size:16px;color:#F5E27A;">" ${randomPunchline} "</p>
        </div>

        ${DIGIT_STICKER ? `
        <div id="sudoku-legend" style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap;margin-bottom:10px;">
            ${[1,2,3,4,5,6,7,8,9].map(d => `
                <div class="sk-leg" data-digit="${d}" id="leg-${d}"
                     style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;padding:5px 6px;border-radius:8px;border:1px solid rgba(212,175,55,0.3);background:rgba(0,0,0,0.3);transition:all 0.18s;touch-action:manipulation;user-select:none;">
                    <img src="${DIGIT_STICKER[d]}" style="width:38px;height:38px;object-fit:contain;pointer-events:none;">
                    <span style="color:#D4AF37;font-size:11px;font-weight:bold;font-family:'Outfit',sans-serif;">${d}</span>
                </div>`).join('')}
        </div>
        <p style="text-align:center;color:rgba(212,175,55,0.55);font-size:12px;margin-bottom:10px;font-family:'Outfit',sans-serif;">
            ① Sélectionne un sticker ci-dessus &nbsp;·&nbsp; ② Clique une case vide &nbsp;|&nbsp;
            ⌨️ tape 1-9 puis <kbd style="background:rgba(212,175,55,0.2);border:1px solid #D4AF37;border-radius:3px;padding:1px 5px;font-size:11px;">Espace</kbd>
        </p>` : ''}

        <div id="sudoku-grid-wrap" style="display:flex;justify-content:center;margin-bottom:20px;overflow-x:auto;"></div>

        <div style="text-align:center;display:flex;gap:12px;justify-content:center;flex-direction:column;align-items:center;">
            <p id="sudoku-errors" style="color:#f43f5e;font-size:18px;font-weight:bold;font-family:'Outfit',sans-serif;margin:0;"></p>
            <p id="check-result" style="text-align:center;font-size:16px;font-family:'Lora',serif;min-height:20px;color:#4ECDC4;transition:all 0.3s;"></p>
        </div>
        </div>
    </div>`;

    if (window.setLanguage) window.setLanguage(window.currentLang);
    document.getElementById('sudoku-errors').textContent = window.t('sdk.errors').replace('{x}', '0');

    // ── Armed digit (from legend) ────────────────────────────────────────────
    let armedDigit = null;
    function setArmed(d) {
        armedDigit = d;
        document.querySelectorAll('.sk-leg').forEach(el => {
            const active = parseInt(el.dataset.digit) === d;
            el.style.border     = active ? '2px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            el.style.background = active ? 'rgba(212,175,55,0.25)' : 'rgba(0,0,0,0.3)';
            el.style.transform  = active ? 'scale(1.12)' : 'scale(1)';
        });
    }
    document.querySelectorAll('.sk-leg').forEach(el => {
        el.addEventListener('click', () => {
            const d = parseInt(el.dataset.digit);
            setArmed(armedDigit === d ? null : d);  // toggle
        });
    });

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
                    for (const n of [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5)) {
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
    let removed = 0;
    while (removed < 35) {
        const r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== 0) { puzzle[r][c] = 0; removed++; }
    }

    // ── Cell content renderer ────────────────────────────────────────────────
    function renderCell(td, digit, isGiven) {
        td.innerHTML = '';
        if (!digit) return;
        if (DIGIT_STICKER) {
            const img = document.createElement('img');
            img.src = DIGIT_STICKER[digit];
            img.style.cssText = `width:${CELL-8}px;height:${CELL-8}px;object-fit:contain;pointer-events:none;${isGiven ? 'filter:drop-shadow(0 0 4px rgba(212,175,55,0.6));' : ''}`;
            td.appendChild(img);
        } else {
            td.textContent = digit;
        }
    }

    // ── Build grid ───────────────────────────────────────────────────────────
    const wrap  = document.getElementById('sudoku-grid-wrap');
    const table = document.createElement('table');
    table.style.cssText = 'border-collapse:collapse;';

    for (let r = 0; r < 9; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 9; c++) {
            const td = document.createElement('td');
            td.dataset.r = r; td.dataset.c = c;
            td.dataset.value = puzzle[r][c] ? String(puzzle[r][c]) : '';

            const bT = r % 3 === 0 ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            const bL = c % 3 === 0 ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            const bB = r === 8     ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            const bR = c === 8     ? '3px solid #D4AF37' : '1px solid rgba(212,175,55,0.3)';
            const isGiven = puzzle[r][c] !== 0;

            td.style.cssText = `
                width:${CELL}px;height:${CELL}px;
                text-align:center;vertical-align:middle;
                font-size:18px;font-weight:700;font-family:'Outfit',sans-serif;
                border-top:${bT};border-left:${bL};border-bottom:${bB};border-right:${bR};
                background:${isGiven ? 'rgba(212,175,55,0.12)' : 'rgba(0,0,0,0.4)'};
                color:${isGiven ? '#D4AF37' : '#FFF'};
                cursor:${isGiven ? 'default' : 'pointer'};
                transition:background 0.2s,box-shadow 0.2s;
                position:relative;overflow:hidden;user-select:none;touch-action:manipulation;
            `;

            if (isGiven) {
                renderCell(td, puzzle[r][c], true);
            } else {
                let pending = 0;
                td.tabIndex = 0;

                function validate(n) {
                    pending = 0; delete td.dataset.pending;
                    if (n === board[r][c]) {
                        renderCell(td, n, false);
                        td.dataset.value = String(n); td.dataset.locked = '1';
                        td.style.background = 'rgba(74,222,128,0.15)';
                        td.style.boxShadow  = '0 0 12px rgba(74,222,128,0.4)';
                        td.style.cursor = 'default';
                        setTimeout(() => { td.style.background = 'rgba(0,0,0,0.4)'; td.style.boxShadow = ''; }, 1000);
                        setArmed(null);
                        checkWin();
                    } else {
                        renderCell(td, n, false);
                        td.style.background = 'rgba(244,63,94,0.3)';
                        td.style.boxShadow  = '0 0 12px rgba(244,63,94,0.6)';
                        setTimeout(() => {
                            td.innerHTML = ''; td.dataset.value = ''; pending = 0;
                            td.style.background = 'rgba(0,0,0,0.4)'; td.style.boxShadow = '';
                        }, 900);
                        errorCount++;
                        document.getElementById('sudoku-errors').textContent = window.t('sdk.errors').replace('{x}', errorCount);
                        if (errorCount >= 3) {
                            document.getElementById('check-result').innerHTML = `<span style="color:#f43f5e">${window.t('sdk.toomany')}</span>`;
                            table.querySelectorAll('td').forEach(x => x.dataset.locked = '1');
                            setTimeout(() => window.initSudoku(container), 2500);
                        }
                    }
                }

                // ① Click: if digit armed from legend → place immediately; else just focus
                td.addEventListener('click', () => {
                    if (td.dataset.locked) return;
                    if (armedDigit) {
                        validate(armedDigit);
                    } else {
                        td.focus();
                        td.style.boxShadow = '0 0 0 3px #D4AF37';
                    }
                });

                // ② Keyboard: 1-9 = preview (no instant validate), Space/Enter = validate
                td.addEventListener('keydown', e => {
                    if (td.dataset.locked) return;
                    const n = parseInt(e.key);
                    if (n >= 1 && n <= 9) {
                        e.preventDefault();
                        pending = n; td.dataset.pending = n;
                        renderCell(td, n, false);
                        td.style.background = 'rgba(212,175,55,0.1)';
                        td.style.boxShadow  = '0 0 0 3px rgba(212,175,55,0.5)';
                    } else if ((e.key === ' ' || e.key === 'Enter') && pending) {
                        e.preventDefault();
                        validate(pending);
                    } else if (e.key === 'Backspace' || e.key === 'Delete') {
                        e.preventDefault();
                        pending = 0; delete td.dataset.pending;
                        td.innerHTML = ''; td.dataset.value = '';
                        td.style.background = 'rgba(0,0,0,0.4)'; td.style.boxShadow = '0 0 0 3px #D4AF37';
                    }
                });

                td.addEventListener('focus', () => { if (!td.dataset.locked) td.style.boxShadow = '0 0 0 3px #D4AF37'; });
                td.addEventListener('blur',  () => { if (!td.dataset.locked && !pending) td.style.boxShadow = ''; });
            }

            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    wrap.appendChild(table);

    // ── Win check ────────────────────────────────────────────────────────────
    function checkWin() {
        let all = true;
        table.querySelectorAll('td').forEach(td => {
            if (parseInt(td.dataset.value) !== board[td.dataset.r][td.dataset.c]) all = false;
        });
        if (all) {
            document.getElementById('check-result').innerHTML = `
                <div style="animation:fade-in 1s forwards;">
                    <h3 style="color:#4ade80;font-family:'Cinzel Decorative';margin-bottom:10px;">${window.t('sdk.perfect')}</h3>
                    <img src="${winSticker}" style="max-height:180px;border-radius:10px;border:3px solid #D4AF37;box-shadow:0 0 20px rgba(212,175,55,0.6);">
                    <h2 style="color:#F5E27A;font-family:'Cinzel Decorative',cursive;margin-top:10px;">Elif is Lisan al Ghaib 🌹</h2>
                </div>`;
            if (typeof addGlobalScore === 'function') addGlobalScore(POINTS_PER_WIN);
            setTimeout(() => hideGame(), 4500);
        }
    }
};
