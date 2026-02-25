// ─── Main Menu with Settings & Audio ──────────────────────────
export class StartScreen {
    constructor() {
        this.font = '"Press Start 2P", monospace';
        this.timer = 0;
        this.highScore = parseInt(localStorage.getItem('rr_highscore') || '0');

        // Menu state: 'main', 'settings', 'how'
        this.screen = 'main';

        // Main menu items
        this.menuItems = ['PLAY', 'SETTINGS', 'HOW TO PLAY'];
        this.selectedIndex = 0;
        this.hoverIndex = -1;

        // Settings
        this.settings = {
            masterVol: parseFloat(localStorage.getItem('rr_masterVol') ?? '0.8'),
            musicVol: parseFloat(localStorage.getItem('rr_musicVol') ?? '0.5'),
            sfxVol: parseFloat(localStorage.getItem('rr_sfxVol') ?? '0.8'),
            screenShake: localStorage.getItem('rr_screenShake') !== 'false',
            scanlines: localStorage.getItem('rr_scanlines') !== 'false',
        };
        this.settingsItems = ['MASTER VOL', 'MUSIC VOL', 'SFX VOL', 'SCREEN SHAKE', 'SCANLINES', 'RESET HIGH SCORE', 'BACK'];
        this.settingsIndex = 0;

        // Slider drag state
        this._dragging = null;

        // Touch/click areas (populated on draw)
        this._hitAreas = [];

        // Menu select sound queued
        this._pendingAction = null;
    }

    update(dt) {
        this.timer += dt;
    }

    // Returns action string: 'play' | null
    handleInput(input, canvasEl) {
        // Tap / click on items
        if (input.justPressed) {
            if (this._pendingAction) {
                const action = this._pendingAction;
                this._pendingAction = null;
                return action;
            }
        }
        return null;
    }

    // Call from Game when mouse/touch hits canvas to detect menu clicks
    handleClick(x, y, W, H, audio) {
        // Scale from canvas display coords → internal coords
        const rect = { w: W, h: H };

        for (const area of this._hitAreas) {
            if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) {
                return this._onItemClick(area.id, area, x, audio);
            }
        }
        return null;
    }

    _onItemClick(id, area, clickX, audio) {
        if (audio) {
            audio.init();
            audio.playSelect();
        }

        if (this.screen === 'main') {
            switch (id) {
                case 'PLAY': return 'play';
                case 'SETTINGS': this.screen = 'settings'; this.settingsIndex = 0; break;
                case 'HOW TO PLAY': this.screen = 'how'; break;
            }
        } else if (this.screen === 'settings') {
            switch (id) {
                case 'MASTER VOL':
                case 'MUSIC VOL':
                case 'SFX VOL':
                    // Calculate relative position within the slider bar area
                    const relX = (clickX - (area.x + area.w * 0.45)) / (area.w * 0.5);
                    const val = Math.max(0, Math.min(1, relX));
                    if (id === 'MASTER VOL') { this.settings.masterVol = val; localStorage.setItem('rr_masterVol', val.toString()); }
                    if (id === 'MUSIC VOL') { this.settings.musicVol = val; localStorage.setItem('rr_musicVol', val.toString()); }
                    if (id === 'SFX VOL') { this.settings.sfxVol = val; localStorage.setItem('rr_sfxVol', val.toString()); }
                    if (audio) audio.applySettings(this.settings);
                    break;
                case 'SCREEN SHAKE':
                    this.settings.screenShake = !this.settings.screenShake;
                    localStorage.setItem('rr_screenShake', this.settings.screenShake.toString());
                    break;
                case 'SCANLINES':
                    this.settings.scanlines = !this.settings.scanlines;
                    localStorage.setItem('rr_scanlines', this.settings.scanlines.toString());
                    break;
                case 'RESET HIGH SCORE':
                    localStorage.setItem('rr_highscore', '0');
                    this.highScore = 0;
                    break;
                case 'BACK':
                    this.screen = 'main';
                    break;
            }
        } else if (this.screen === 'how' || this.screen === 'credits') {
            this.screen = 'main';
        }
        return null;
    }

    draw(ctx, W, H) {
        this._hitAreas = [];

        // Dark overlay
        ctx.fillStyle = 'rgba(10, 10, 26, 0.9)';
        ctx.fillRect(0, 0, W, H);

        switch (this.screen) {
            case 'main': this._drawMain(ctx, W, H); break;
            case 'settings': this._drawSettings(ctx, W, H); break;
            case 'how': this._drawHowToPlay(ctx, W, H); break;
        }
    }

    // ─── Main Menu ───────────────────────────────
    _drawMain(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title with glitch
        const glitchOffset = Math.sin(this.timer * 8) > 0.95 ? (Math.random() - 0.5) * 4 : 0;

        // Title shadow
        ctx.fillStyle = '#ff00ff';
        ctx.font = `12px ${this.font}`;
        ctx.globalAlpha = 0.3;
        ctx.fillText('REWIND', W / 2 + 1, H * 0.16 + 1);
        ctx.fillText('RUNNER', W / 2 + 1, H * 0.16 + 18);
        ctx.globalAlpha = 1;

        // Title main
        ctx.fillStyle = '#00f5ff';
        ctx.fillText('REWIND', W / 2 + glitchOffset, H * 0.16);
        ctx.fillStyle = '#ff00ff';
        ctx.fillText('RUNNER', W / 2 - glitchOffset, H * 0.16 + 17);

        // Subtitle
        ctx.font = `3px ${this.font}`;
        ctx.fillStyle = '#666';
        ctx.fillText('TIME LOOP ARENA', W / 2, H * 0.16 + 30);

        // Decorative line
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W * 0.25, H * 0.16 + 36);
        ctx.lineTo(W * 0.75, H * 0.16 + 36);
        ctx.stroke();

        // Menu items
        const startY = H * 0.48;
        const itemH = 16;
        ctx.font = `5px ${this.font}`;

        for (let i = 0; i < this.menuItems.length; i++) {
            const y = startY + i * itemH;
            const label = this.menuItems[i];
            const isHovered = this.selectedIndex === i;

            // Hit area
            const hitX = W / 2 - 60;
            const hitW = 120;
            this._hitAreas.push({ id: label, x: hitX, y: y - 6, w: hitW, h: 12 });

            // Selection indicator
            if (isHovered) {
                ctx.fillStyle = 'rgba(0, 245, 255, 0.08)';
                ctx.fillRect(hitX, y - 5, hitW, 10);
                ctx.strokeStyle = '#00f5ff';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(hitX, y - 5, hitW, 10);
            }

            // Arrow
            if (isHovered) {
                ctx.fillStyle = '#ffcc00';
                ctx.font = `5px ${this.font}`;
                ctx.textAlign = 'right';
                ctx.fillText('▶', W / 2 - 45, y + 1);
                ctx.textAlign = 'center';
            }

            // Label
            ctx.fillStyle = isHovered ? '#00f5ff' : '#777';
            ctx.font = `5px ${this.font}`;
            ctx.fillText(label, W / 2, y + 1);
        }

        // High score
        if (this.highScore > 0) {
            ctx.font = `4px ${this.font}`;
            ctx.fillStyle = '#ff00ff';
            ctx.fillText(`BEST: ${this.highScore}m`, W / 2, H * 0.94);
        }

        // Version
        ctx.font = `3px ${this.font}`;
        ctx.fillStyle = '#333';
        ctx.fillText('v1.0', W - 15, H - 6);

        ctx.restore();
    }

    // ─── Settings Screen ─────────────────────────
    _drawSettings(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Header
        ctx.fillStyle = '#00f5ff';
        ctx.font = `8px ${this.font}`;
        ctx.fillText('SETTINGS', W / 2, H * 0.1);

        ctx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(W * 0.2, H * 0.1 + 10);
        ctx.lineTo(W * 0.8, H * 0.1 + 10);
        ctx.stroke();

        const startY = H * 0.25;
        const itemH = 22;
        ctx.font = `4px ${this.font}`;

        for (let i = 0; i < this.settingsItems.length; i++) {
            const y = startY + i * itemH;
            const label = this.settingsItems[i];
            const isSlider = i < 3;
            const isToggle = i === 3 || i === 4;
            const isSelected = this.settingsIndex === i;

            // Hit area
            const hitX = W * 0.08;
            const hitW = W * 0.84;
            this._hitAreas.push({ id: label, x: hitX, y: y - 7, w: hitW, h: 14 });

            // Background highlight
            if (isSelected) {
                ctx.fillStyle = 'rgba(0, 245, 255, 0.06)';
                ctx.fillRect(hitX, y - 6, hitW, 12);
            }

            // Label
            ctx.textAlign = 'left';
            ctx.fillStyle = isSelected ? '#00f5ff' : '#888';
            ctx.fillText(label, hitX + 4, y + 1);

            if (isSlider) {
                // Draw slider
                const sliderX = hitX + hitW * 0.45;
                const sliderW = hitW * 0.5;
                const val = i === 0 ? this.settings.masterVol : i === 1 ? this.settings.musicVol : this.settings.sfxVol;

                // Track background
                ctx.fillStyle = '#222';
                ctx.fillRect(sliderX, y - 2, sliderW, 4);

                // Track fill
                const fillColor = i === 0 ? '#00f5ff' : i === 1 ? '#ff00ff' : '#ffcc00';
                ctx.fillStyle = fillColor;
                ctx.fillRect(sliderX, y - 2, sliderW * val, 4);

                // Track border
                ctx.strokeStyle = '#444';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(sliderX, y - 2, sliderW, 4);

                // Knob
                const knobX = sliderX + sliderW * val;
                ctx.fillStyle = '#fff';
                ctx.fillRect(knobX - 2, y - 4, 4, 8);
                ctx.strokeStyle = fillColor;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(knobX - 2, y - 4, 4, 8);

                // Percentage
                ctx.textAlign = 'right';
                ctx.fillStyle = '#aaa';
                ctx.fillText(`${Math.round(val * 100)}%`, hitX + hitW - 2, y + 1);
            } else if (isToggle) {
                // Draw toggle
                const toggleVal = i === 3 ? this.settings.screenShake : this.settings.scanlines;
                const toggleX = hitX + hitW - 30;
                const toggleW = 20;
                const toggleH = 8;

                // Track
                ctx.fillStyle = toggleVal ? 'rgba(0, 245, 255, 0.3)' : '#222';
                ctx.fillRect(toggleX, y - 4, toggleW, toggleH);
                ctx.strokeStyle = toggleVal ? '#00f5ff' : '#555';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(toggleX, y - 4, toggleW, toggleH);

                // Knob
                const knobPos = toggleVal ? toggleX + toggleW - 8 : toggleX;
                ctx.fillStyle = toggleVal ? '#00f5ff' : '#555';
                ctx.fillRect(knobPos, y - 4, 8, toggleH);

                // Label
                ctx.textAlign = 'right';
                ctx.fillStyle = toggleVal ? '#00f5ff' : '#555';
                ctx.fillText(toggleVal ? 'ON' : 'OFF', toggleX - 4, y + 1);
            } else if (label === 'RESET HIGH SCORE') {
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ff0040';
                ctx.fillText(this.highScore > 0 ? `(${this.highScore}m)` : '(NONE)', hitX + hitW - 4, y + 1);
            } else if (label === 'BACK') {
                // Center the BACK button
                ctx.textAlign = 'center';
                ctx.fillStyle = isSelected ? '#ffcc00' : '#888';
                ctx.font = `5px ${this.font}`;
                ctx.fillText('‹ BACK', W / 2, y + 1);
            }
        }

        ctx.restore();
    }

    // ─── How to Play ─────────────────────────────
    _drawHowToPlay(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Header
        ctx.fillStyle = '#ffcc00';
        ctx.font = `7px ${this.font}`;
        ctx.fillText('HOW TO PLAY', W / 2, H * 0.1);

        ctx.strokeStyle = 'rgba(255, 204, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(W * 0.15, H * 0.1 + 10);
        ctx.lineTo(W * 0.85, H * 0.1 + 10);
        ctx.stroke();

        const lines = [
            { icon: '►', text: 'AUTO-RUN FORWARD', color: '#00f5ff' },
            { icon: '▲', text: 'TAP TO JUMP', color: '#00ff88' },
            { icon: '◆', text: 'HOLD TO FLIP GRAVITY', color: '#ff00ff' },
            { icon: '⟲', text: 'EVERY 10s TIME REWINDS', color: '#ffcc00' },
            { icon: '⚠', text: 'GHOST CLONES KILL ON TOUCH', color: '#ff0040' },
            { icon: '↑', text: 'SPEED INCREASES EACH LOOP', color: '#ff6600' },
            { icon: '◎', text: 'GRAVITY ZONES ALTER PHYSICS', color: '#8000ff' },
        ];

        const startY = H * 0.25;
        const lineH = 15;
        ctx.font = `4px ${this.font}`;

        for (let i = 0; i < lines.length; i++) {
            const y = startY + i * lineH;
            const l = lines[i];

            // Icon
            ctx.fillStyle = l.color;
            ctx.textAlign = 'center';
            ctx.fillText(l.icon, W * 0.18, y);

            // Text
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'left';
            ctx.fillText(l.text, W * 0.25, y);
        }

        // Back
        const backY = H * 0.9;
        this._hitAreas.push({ id: 'BACK_HOW', x: W / 2 - 40, y: backY - 6, w: 80, h: 12 });
        const blink = Math.sin(this.timer * 3) > 0;
        ctx.textAlign = 'center';
        ctx.fillStyle = blink ? '#ffcc00' : '#888';
        ctx.font = `5px ${this.font}`;
        ctx.fillText('TAP TO GO BACK', W / 2, backY);

        ctx.restore();
    }

    // ─── Credits ─────────────────────────────────
    _drawCredits(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Header
        ctx.fillStyle = '#ff00ff';
        ctx.font = `7px ${this.font}`;
        ctx.fillText('CREDITS', W / 2, H * 0.12);

        ctx.strokeStyle = 'rgba(255, 0, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(W * 0.25, H * 0.12 + 10);
        ctx.lineTo(W * 0.75, H * 0.12 + 10);
        ctx.stroke();

        const items = [
            { label: 'GAME', value: 'REWIND RUNNER', color: '#00f5ff' },
            { label: 'ENGINE', value: 'HTML5 CANVAS + JS', color: '#00ff88' },
            { label: 'AUDIO', value: 'WEB AUDIO SYNTH', color: '#ffcc00' },
            { label: 'STYLE', value: 'NEON PIXEL ART', color: '#ff00ff' },
            { label: 'BUILT WITH', value: 'VITE', color: '#8000ff' },
        ];

        const startY = H * 0.32;
        const lineH = 18;

        for (let i = 0; i < items.length; i++) {
            const y = startY + i * lineH;
            const item = items[i];

            ctx.font = `3px ${this.font}`;
            ctx.fillStyle = '#555';
            ctx.fillText(item.label, W / 2, y);

            ctx.font = `5px ${this.font}`;
            ctx.fillStyle = item.color;
            ctx.fillText(item.value, W / 2, y + 10);
        }

        // Back
        const backY = H * 0.9;
        this._hitAreas.push({ id: 'BACK_CREDITS', x: W / 2 - 40, y: backY - 6, w: 80, h: 12 });
        const blink = Math.sin(this.timer * 3) > 0;
        ctx.fillStyle = blink ? '#ffcc00' : '#888';
        ctx.font = `5px ${this.font}`;
        ctx.fillText('TAP TO GO BACK', W / 2, backY);

        ctx.restore();
    }
}
