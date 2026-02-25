// ─── Canvas Manager (Responsive) ────────────────────────────────
export class Canvas {
    constructor() {
        this.el = document.getElementById('game');
        this.ctx = this.el.getContext('2d');

        // Target height for consistent scale
        this.H = 216;
        this.W = 384; // Default/Start width

        // Off-screen buffer for glow
        this.glowCanvas = document.createElement('canvas');
        this.glowCtx = this.glowCanvas.getContext('2d');

        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        const aspect = window.innerWidth / window.innerHeight;

        // Fix height, adjust width to fill screen
        // Limits to prevent ultra-wide or ultra-tall issues
        this.W = Math.floor(this.H * aspect);

        // Ensure at least some width
        if (this.W < 200) this.W = 200;

        // Apply internal resolution
        this.el.width = this.W;
        this.el.height = this.H;

        this.glowCanvas.width = this.W;
        this.glowCanvas.height = this.H;

        this.ctx.imageSmoothingEnabled = false;
        this.glowCtx.imageSmoothingEnabled = false;

        console.log(`📏 Resized: ${this.W}x${this.H} (Aspect: ${aspect.toFixed(2)})`);
    }

    clear() {
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.W, this.H);
        this.glowCtx.clearRect(0, 0, this.W, this.H);
    }

    applyGlow() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.ctx.globalAlpha = 0.6;
        for (let i = -2; i <= 2; i += 2) {
            for (let j = -2; j <= 2; j += 2) {
                this.ctx.drawImage(this.glowCanvas, i, j);
            }
        }
        this.ctx.restore();
    }
}
