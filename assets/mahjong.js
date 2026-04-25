// mahjong.js
window.initMahjong = function(container) {
    if (!globalData.assets || !globalData.assets.allStickers || globalData.assets.allStickers.length === 0) {
        container.innerHTML = `<h2 style="color:white; text-align:center;">Aucun sticker disponible !</h2>`;
        return;
    }

    container.innerHTML = `
        <div class="landing-content" style="max-width:1000px; width:90%; height:80%;">
            <header style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h2>MAHJONG SOLITAIRE</h2>
                <div>
                    <button class="back-btn" onclick="initMahjong(document.getElementById('module-mahjong'))">Recommencer</button>
                    <button class="back-btn" onclick="showLandingPage()">Quitter</button>
                </div>
            </header>
            <div id="mahjong-board" style="position:relative; width:100%; height:500px; background:rgba(0,0,0,0.3); border-radius:10px; border:1px solid #fff;"></div>
        </div>
    `;

    const boardEl = document.getElementById('mahjong-board');
    
    // Layout definition (Pyramid style)
    // x, y are logical coordinates. TILE_W=60, TILE_H=80.
    const layout = [];
    
    // Layer 0: 8x6 (48 tiles)
    for(let r=0; r<6; r++) {
        for(let c=0; c<8; c++) {
            layout.push({x: c*1.1, y: r*1.1, z: 0});
        }
    }
    // Layer 1: 4x4 (16 tiles) centered
    for(let r=1; r<5; r++) {
        for(let c=2; c<6; c++) {
            layout.push({x: c*1.1, y: r*1.1, z: 1});
        }
    }
    // Layer 2: 2x2 (4 tiles) centered
    for(let r=2; r<4; r++) {
        for(let c=3; c<5; c++) {
            layout.push({x: c*1.1, y: r*1.1, z: 2});
        }
    }
    
    // Total 68 tiles = 34 pairs.
    let totalTiles = layout.length;
    let pairsNeeded = totalTiles / 2;
    
    // Select 34 random stickers representing pairs (allow duplicates since there are only 32 stickers)
    const pool = globalData.assets.allStickers;
    let selectedImages = [];
    for(let i=0; i<pairsNeeded; i++) {
        const img = pool[Math.floor(Math.random() * pool.length)];
        selectedImages.push(img, img); // Pair
    }
    
    // Shuffle
    selectedImages.sort(() => Math.random() - 0.5);
    
    let tiles = [];
    
    // Render tiles
    layout.forEach((pos, index) => {
        let tile = {
            id: index,
            x: pos.x, y: pos.y, z: pos.z,
            imgSrc: selectedImages[index],
            active: true,
            el: document.createElement('div')
        };
        
        tile.el.className = 'mahjong-tile';
        tile.el.style.position = 'absolute';
        tile.el.style.width = '60px';
        tile.el.style.height = '80px';
        tile.el.style.backgroundImage = \`url('\${tile.imgSrc}')\`;
        tile.el.style.backgroundSize = 'cover';
        tile.el.style.backgroundPosition = 'center';
        tile.el.style.border = '2px solid #ccc';
        tile.el.style.borderRadius = '5px';
        tile.el.style.boxShadow = \`\${pos.z * 4 + 2}px \${pos.z * 4 + 2}px 5px rgba(0,0,0,0.5)\`;
        tile.el.style.cursor = 'pointer';
        tile.el.style.transition = 'all 0.2s';
        
        // Transform coord to px (center the board roughly)
        const offsetX = 50 + (pos.z * 3);
        const offsetY = 50 + (pos.z * -3);
        tile.el.style.left = (pos.x * 65 + offsetX) + 'px';
        tile.el.style.top = (pos.y * 85 + offsetY) + 'px';
        tile.el.style.zIndex = pos.z * 10;
        
        tile.el.onclick = () => onTileClick(tile);
        
        boardEl.appendChild(tile.el);
        tiles.push(tile);
    });
    
    let firstSelected = null;
    let tilesRemaining = totalTiles;
    
    function isTileFree(t) {
        // A tile is free if there's no active tile directly above it
        const above = tiles.find(other => other.active && other.z > t.z && Math.abs(other.x - t.x) < 0.5 && Math.abs(other.y - t.y) < 0.5);
        if (above) return false;
        
        // And it must be free on at least ONE side (Left or Right)
        const hasLeft = tiles.find(other => other.active && other.z === t.z && other.y === t.y && other.x < t.x && Math.abs(other.x - t.x) <= 1.2);
        const hasRight = tiles.find(other => other.active && other.z === t.z && other.y === t.y && other.x > t.x && Math.abs(other.x - t.x) <= 1.2);
        
        return !(hasLeft && hasRight);
    }
    
    function onTileClick(tile) {
        if (!tile.active || !isTileFree(tile)) return;
        
        if (!firstSelected) {
            firstSelected = tile;
            tile.el.style.border = '3px solid #fbbf24';
            tile.el.style.transform = 'translateY(-5px)';
        } else if (firstSelected.id === tile.id) {
            // Deselect
            tile.el.style.border = '2px solid #ccc';
            tile.el.style.transform = 'none';
            firstSelected = null;
        } else {
            // Check match
            if (firstSelected.imgSrc === tile.imgSrc) {
                // MATCH!
                tile.active = false;
                firstSelected.active = false;
                
                tile.el.style.opacity = '0';
                firstSelected.el.style.opacity = '0';
                
                setTimeout(() => {
                    tile.el.style.display = 'none';
                    firstSelected.el.style.display = 'none';
                }, 300);
                
                tilesRemaining -= 2;
                firstSelected = null;
                
                if (tilesRemaining <= 0) {
                    setTimeout(() => {
                        alert("🎉 BRAVO ! Plateau terminé ! +100 points");
                        addGlobalScore(POINTS_PER_WIN);
                        showLandingPage();
                    }, 500);
                }
            } else {
                // No match
                firstSelected.el.style.border = '2px solid #ccc';
                firstSelected.el.style.transform = 'none';
                
                // Shake slightly to indicate mismatch
                tile.el.style.border = '2px solid red';
                setTimeout(() => {
                    tile.el.style.border = '2px solid #ccc';
                }, 300);
                
                firstSelected = null;
            }
        }
    }
};
