window.renderLandingPage = function(container) {
    container.innerHTML = `
        <div class="landing-content">
            <div class="landing-frame">
                <div class="emoji-row">🌙 🧿 🌹 🧿 🌙</div>

                <h1 class="kitsch-title">JOYEUX ANNIVERSAIRE</h1>
                <div class="kitsch-subtitle">✦ MUTLU YILLAR SEVGILIM ✦</div>

                <div class="ornament-line"></div>

                <p class="love-message">
                    Pour toi, mon rayon de soleil turc, ma baklava préférée,<br>
                    j'ai préparé une petite surprise numérique...<br>
                    <em>joue, gagne, et découvre le mystère qui t'attend 🌹</em>
                </p>

                <div class="emoji-row">🫖 ☕ 🍯 🌺 💫</div>

                <div class="ornament-line"></div>

                <div class="games-title">✦ CHOISIS TON JEU ✦</div>
                
                <div class="menu-grid">
                    <button class="game-btn" onclick="startSpaceInvaders()">👾 SPACE INVADERS</button>
                    <button class="game-btn" onclick="startMahjong()">🀄 MAHJONG</button>
                    <button class="game-btn" onclick="startSudoku()">🔢 SUDOKU</button>
                </div>

                <div id="mystery-box" class="mystery-box">
                    <p id="mystery-msg">🔒 Une surprise secrète se cache ici...</p>
                    <button id="mystery-btn" class="mystery-btn" onclick="playEasterEggVideo()" disabled>
                        🎁 OUVRIR MA SURPRISE
                    </button>
                </div>
            </div>
        </div>
    `;

    // Scatter sticker images behind the frame
    if (globalData.assets) {
        const pool = globalData.assets.landingPage.length > 0
            ? globalData.assets.landingPage
            : globalData.assets.allStickers;

        const positions = [
            { left: '3%', top: '15%', rot: '-15deg', dur: '6s' },
            { left: '88%', top: '18%', rot: '12deg', dur: '8s' },
            { left: '6%', top: '55%', rot: '-8deg', dur: '7s' },
            { left: '85%', top: '60%', rot: '18deg', dur: '9s' },
            { left: '92%', top: '40%', rot: '-20deg', dur: '6.5s' },
            { left: '1%', top: '78%', rot: '10deg', dur: '10s' },
            { left: '80%', top: '82%', rot: '-12deg', dur: '7.5s' },
        ];

        positions.forEach((pos, i) => {
            if (!pool[i % pool.length]) return;
            const img = document.createElement('img');
            img.src = pool[i % pool.length];
            img.className = 'bg-sticker';
            img.style.left = pos.left;
            img.style.top = pos.top;
            img.style.setProperty('--rot', pos.rot);
            img.style.animationDuration = pos.dur;
            img.style.animationDelay = `-${i * 1.2}s`;
            container.appendChild(img);
        });
    }

    updateGlobalUI();
};
