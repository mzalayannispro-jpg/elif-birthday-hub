window.initMahjong = function(container) {
    // Build a static pool from known assets since no assets.json here
    // Utilisation de la liste des niveaux définis dans app.js
    const stickerPool = window.NIVEAU_IMAGES || [
        'assets/player.webp', 'assets/win.webp', 'assets/lose.webp', 'assets/baklava.png'
    ];

    container.innerHTML = `
    <div style="width:95vw; max-width:860px; background:linear-gradient(160deg, rgba(20,3,0,0.96), rgba(50,5,5,0.92)); border:3px solid #D4AF37; border-radius:16px; padding:20px; box-shadow:0 0 40px rgba(212,175,55,0.25);">
        <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h2 style="font-family:'Cinzel Decorative',cursive; color:#D4AF37; font-size:20px; letter-spacing:3px;">🀄 MAHJONG SOLITAIRE</h2>
            <div>
                <button onclick="initMahjong(document.getElementById('game-slot'))" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer; margin-right:6px;">Recommencer</button>
                <button onclick="hideGame()" style="background:transparent; border:1px solid #D4AF37; color:#D4AF37; padding:6px 14px; border-radius:5px; cursor:pointer;">← Menu</button>
            </div>
        </header>
        <div id="mahjong-board" style="position:relative; width:100%; height:480px; background:rgba(0,0,0,0.4); border-radius:10px; border:1px solid rgba(212,175,55,0.3); overflow:hidden;"></div>
        <p id="mahjong-status" style="text-align:center; margin-top:12px; color:#4ECDC4; font-family:'Lora',serif; font-style:italic; font-size:14px;">
            <strong>Règles :</strong> Trouve et clique sur deux tuiles strictement identiques pour les retirer du plateau.<br>
            <em>Attention : tu ne peux sélectionner que les tuiles qui sont libres (non bloquées par d'autres).</em>
        </p>
    </div>
    `;

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
                background-image: url('${tile.imgSrc}');
                background-size: cover;
                background-position: center;
                border: 2px solid #D4AF37;
                border-radius: 6px;
                cursor: pointer;
                box-shadow: 3px 3px 5px rgba(0,0,0,0.5);
                transition: transform 0.15s, box-shadow 0.15s, opacity 0.3s;
                background-color: #FFF8E7;
            `;
            
            tile.el.onmouseenter = () => {
                if (tile.active) { tile.el.style.transform = 'translateY(-4px)'; tile.el.style.boxShadow = '3px 8px 15px rgba(0,0,0,0.5), 0 0 12px rgba(212,175,55,0.4)'; }
            };
            tile.el.onmouseleave = () => {
                if (tile.active && !tile.selected) { tile.el.style.transform = ''; tile.el.style.boxShadow = '3px 3px 5px rgba(0,0,0,0.5)'; }
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
            tile.el.style.border = '3px solid #F5E27A';
            tile.el.style.transform = 'translateY(-6px)';
            tile.el.style.boxShadow = '0 0 15px rgba(245,226,122,0.7)';
        } else if (selected.id === tile.id) {
            // Deselect same tile
            selected.selected = false;
            selected.el.style.border = '2px solid #D4AF37';
            selected.el.style.transform = '';
            selected.el.style.boxShadow = '3px 3px 5px rgba(0,0,0,0.5)';
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
            statusEl.textContent = `Bravo ! ${tilesLeft} tuiles restantes...`;
            
            if (tilesLeft <= 0) {
                setTimeout(() => {
                    statusEl.textContent = '🎉 PLATEAU COMPLÉTÉ ! +100 points !';
                    if (typeof addGlobalScore === 'function') addGlobalScore(POINTS_PER_WIN);
                    setTimeout(() => hideGame(), 2000);
                }, 400);
            }
        } else {
            // No match
            selected.selected = false;
            selected.el.style.border = '2px solid #ff4444';
            tile.el.style.border = '2px solid #ff4444';
            const s = selected;
            setTimeout(() => {
                s.el.style.border = '2px solid #D4AF37';
                s.el.style.transform = '';
                s.el.style.boxShadow = '3px 3px 5px rgba(0,0,0,0.5)';
                tile.el.style.border = '2px solid #D4AF37';
            }, 400);
            selected = null;
        }
    }
};
