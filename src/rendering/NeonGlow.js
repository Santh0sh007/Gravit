// ─── Neon Glow Post-Process ────────────────────────────────────
export class NeonGlow {
    constructor(canvas) {
        this.canvas = canvas;
        // Pre-create blur buffer
        this.blurCanvas = document.createElement('canvas');
        this.blurCanvas.width = canvas.W;
        this.blurCanvas.height = canvas.H;
        this.blurCtx = this.blurCanvas.getContext('2d');
        this.blurCtx.imageSmoothingEnabled = false;
    }

    apply() {
        const { ctx, glowCanvas, W, H } = this.canvas;

        // Sync blur canvas size if it changed
        if (this.blurCanvas.width !== W || this.blurCanvas.height !== H) {
            this.blurCanvas.width = W;
            this.blurCanvas.height = H;
            this.blurCtx.imageSmoothingEnabled = false;
        }

        // Draw glow layer with blur approximation
        this.blurCtx.clearRect(0, 0, W, H);
        this.blurCtx.drawImage(glowCanvas, 0, 0);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Multiple offset passes for bloom
        const offsets = [
            [-2, 0], [2, 0], [0, -2], [0, 2],
            [-1, -1], [1, 1], [-1, 1], [1, -1]
        ];

        ctx.globalAlpha = 0.25;
        for (const [ox, oy] of offsets) {
            ctx.drawImage(this.blurCanvas, ox, oy);
        }

        // Bright center
        ctx.globalAlpha = 0.4;
        ctx.drawImage(this.blurCanvas, 0, 0);

        ctx.restore();
    }
}
