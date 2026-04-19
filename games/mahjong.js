window.initMahjong = function(container) {
    // Build a static pool from known assets since no assets.json here
    // Utilisation de la liste des niveaux définis dans app.js
    const stickerPool = window.NIVEAU_IMAGES || [
        'assets/player.webp', 'assets/win.webp', 'assets/lose.webp', 'assets/baklava.png'
    ];

    <div style="width:95vw; max-width:860px; background:linear-gradient(160deg, rgba(20,3,0,0.96), rgba(50,5,5,0.92)); border:3px solid #D4AF37; border-radius:16px; padding:20px; box-shadow:0 0 40px rgba(212,175,55,0.25);">
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:20px; letter-spacing:3px;" data-i18n="game.mj">🀄 MAHJONG SOLITAIRE</h2>
            <div>
                <button onclick="initMahjong(document.getElementById('game-slot'))" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer; margin-right:6px;" data-i18n="game.replay">Recommencer</button>
                <button onclick="hideGame()" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer;" data-i18n="game.back">← Menu</button>
            </div>
        </header>
        <div id="mahjong-board" style="position:relative; width:100%; height:480px; background:rgba(0,0,0,0.4); border-radius:10px; border:1px solid rgba(212,175,55,0.3); overflow:hidden;"></div>
        <p id="mahjong-status" style="text-align:center; margin-top:12px; color:#4ECDC4; font-family:'Lora',serif; font-style:italic; font-size:14px;" data-i18n="mj.rules">
            <strong>Règles :</strong> Clique sur deux tuiles pour les retourner. Si ce sont les mêmes images de stickers (paires identiques), elles disparaîtront.<br>
            <em>Attention : Tu as besoin d'une bonne mémoire car les tuiles se recouvrent rapidement. Vide le plateau complet pour gagner 100 points !</em>
        </p>
    </div>
    `;
    if(window.setLanguage) window.setLanguage(window.currentLang);

    const boardEl = document.getElementById('mahjong-board');
    const statusEl = document.getElementById('mahjong-status');
    
    // Grid: 8x6 = 48 + top layer 4x4 = 16 → too many, use simpler 8x6=48 tiles (24 pairs)
    const COLS = 8, ROWS = 6;
    const TILE_W = 70, TILE_H = 90;
    const PAD_X = 4, PAD_Y = 4;
    
    const totalTiles = COLS * ROWS; // 48
    const pairsNeeded = totalTiles / 2; // 24
    
    // Build valid sticker pool (use repeats if needed)
    let images = [];
    for (let i = 0; i < pairsNeeded; i++) {
        const img = stickerPool[i % stickerPool.length];
        images.push(img, img);
    }
    images.sort(() => Math.random() - 0.5);
    
    let tiles = [];
    
    const boardW = COLS * (TILE_W + PAD_X) + PAD_X;
    const boardH = ROWS * (TILE_H + PAD_Y) + PAD_Y;
    const offsetX = Math.max(0, (boardEl.offsetWidth - boardW) / 2);
    const offsetY = Math.max(0, (boardEl.offsetHeight - boardH) / 2);
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const idx = r * COLS + c;
            const tile = {
                id: idx,
                row: r, col: c,
                imgSrc: images[idx],
                active: true,
                el: document.createElement('div')
            };
            
            tile.el.className = 'mahjong-tile';
            tile.el.style.cssText = `
                position: absolute;
                width: ${TILE_W}px;
                height: ${TILE_H}px;
                left: ${offsetX + PAD_X + c * (TILE_W + PAD_X)}px;
                top: ${offsetY + PAD_Y + r * (TILE_H + PAD_Y)}px;
                background: transparent;
                border: none;
                cursor: pointer;
                transition: transform 0.15s, opacity 0.3s, filter 0.15s;
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(3px 3px 4px rgba(0,0,0,0.6));
            `;
            
            const imgEl = document.createElement('img');
            imgEl.src = tile.imgSrc;
            imgEl.style.width = '100%';
            imgEl.style.height = '100%';
            imgEl.style.objectFit = 'contain';
            imgEl.style.pointerEvents = 'none'; // prevent dragging
            tile.el.appendChild(imgEl);
            
            tile.el.onmouseenter = () => {
                if (tile.active) { tile.el.style.transform = 'translateY(-6px)'; tile.el.style.filter = 'drop-shadow(5px 8px 8px rgba(0,0,0,0.8)) brightness(1.1)'; }
            };
            tile.el.onmouseleave = () => {
                if (tile.active && !tile.selected) { tile.el.style.transform = ''; tile.el.style.filter = 'drop-shadow(3px 3px 4px rgba(0,0,0,0.6))'; }
            };
            tile.el.onclick = () => onTileClick(tile);
            
            boardEl.appendChild(tile.el);
            tiles.push(tile);
        }
    }
    
    let selected = null;
    let tilesLeft = totalTiles;
    
    function onTileClick(tile) {
        if (!tile.active) return;
        
        if (!selected) {
            selected = tile;
            tile.selected = true;
            tile.el.style.transform = 'translateY(-10px)';
            tile.el.style.filter = 'drop-shadow(0 0 15px rgba(245,226,122,1)) brightness(1.2)';
        } else if (selected.id === tile.id) {
            // Deselect same tile
            selected.selected = false;
            selected.el.style.transform = '';
            selected.el.style.filter = 'drop-shadow(3px 3px 4px rgba(0,0,0,0.6))';
            selected = null;
        } else if (selected.imgSrc === tile.imgSrc) {
            // MATCH!
            selected.active = false;
            tile.active = false;
            selected.el.style.opacity = '0';
            tile.el.style.opacity = '0';
            setTimeout(() => { selected.el.style.display = 'none'; tile.el.style.display = 'none'; }, 300);
            tilesLeft -= 2;
            selected = null;
            statusEl.textContent = window.t('mj.left').replace('{x}', tilesLeft);
            
            if (tilesLeft <= 0) {
                setTimeout(() => {
                    statusEl.textContent = window.t('mj.win');
                    if (typeof addGlobalScore === 'function') addGlobalScore(window.POINTS_PER_WIN || 100);
                    setTimeout(() => hideGame(), 2000);
                }, 400);
            }
        } else {
            // No match
            selected.selected = false;
            selected.el.style.filter = 'drop-shadow(0 0 15px rgba(255,0,0,1))';
            tile.el.style.filter = 'drop-shadow(0 0 15px rgba(255,0,0,1))';
            const s = selected;
            setTimeout(() => {
                s.el.style.transform = '';
                s.el.style.filter = 'drop-shadow(3px 3px 4px rgba(0,0,0,0.6))';
                tile.el.style.filter = 'drop-shadow(3px 3px 4px rgba(0,0,0,0.6))';
            }, 400);
            selected = null;
        }
    }
};
