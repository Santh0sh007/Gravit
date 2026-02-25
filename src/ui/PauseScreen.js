// ─── Pause Screen Overlay ───────────────────────────────────────
export class PauseScreen {
    constructor() {
        this.font = '"Press Start 2P", monospace';
        this.resumeBtn = { x: 0, y: 0, w: 80, h: 20 };
        this.quitBtn = { x: 0, y: 0, w: 80, h: 20 };
    }

    draw(ctx, W, H) {
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, W, H);

        // Title
        ctx.fillStyle = '#00f5ff';
        ctx.font = `12px ${this.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', W / 2, H / 2 - 40);

        // Resume Button
        this.resumeBtn.x = W / 2 - this.resumeBtn.w / 2;
        this.resumeBtn.y = H / 2 - 10;

        ctx.fillStyle = 'rgba(0, 245, 255, 0.1)';
        ctx.fillRect(this.resumeBtn.x, this.resumeBtn.y, this.resumeBtn.w, this.resumeBtn.h);
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.resumeBtn.x, this.resumeBtn.y, this.resumeBtn.w, this.resumeBtn.h);

        ctx.fillStyle = '#00f5ff';
        ctx.font = `6px ${this.font}`;
        ctx.fillText('RESUME', W / 2, this.resumeBtn.y + this.resumeBtn.h / 2);

        // Quit Button (Back to Menu)
        this.quitBtn.x = W / 2 - this.quitBtn.w / 2;
        this.quitBtn.y = H / 2 + 20;

        ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
        ctx.fillRect(this.quitBtn.x, this.quitBtn.y, this.quitBtn.w, this.quitBtn.h);
        ctx.strokeStyle = '#ff00ff';
        ctx.strokeRect(this.quitBtn.x, this.quitBtn.y, this.quitBtn.w, this.quitBtn.h);

        ctx.fillStyle = '#ff00ff';
        ctx.fillText('QUIT', W / 2, this.quitBtn.y + this.quitBtn.h / 2);
    }

    handleClick(x, y) {
        if (x >= this.resumeBtn.x && x <= this.resumeBtn.x + this.resumeBtn.w &&
            y >= this.resumeBtn.y && y <= this.resumeBtn.y + this.resumeBtn.h) {
            return 'resume';
        }
        if (x >= this.quitBtn.x && x <= this.quitBtn.x + this.quitBtn.w &&
            y >= this.quitBtn.y && y <= this.quitBtn.y + this.quitBtn.h) {
            return 'quit';
        }
        return null;
    }
}
