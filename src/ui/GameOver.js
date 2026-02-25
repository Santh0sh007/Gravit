// ─── Game Over Screen ──────────────────────────────────────────
export class GameOver {
    constructor() {
        this.font = '"Press Start 2P", monospace';
        this.timer = 0;
        this.stats = { score: 0, rewinds: 0, ghosts: 0, maxSpeed: 1, distance: 0 };
    }

    show(stats) {
        this.stats = stats;
        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;
    }

    draw(ctx, W, H) {
        // Dark overlay with fade-in
        const fadeIn = Math.min(this.timer / 0.5, 1);
        ctx.fillStyle = `rgba(10, 10, 26, ${0.8 * fadeIn})`;
        ctx.fillRect(0, 0, W, H);

        if (this.timer < 0.3) return;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = Math.min((this.timer - 0.3) / 0.3, 1);

        // DEAD text
        ctx.fillStyle = '#ff0040';
        ctx.font = `14px ${this.font}`;
        ctx.fillText('DEAD', W / 2, H * 0.25);

        // Stats
        ctx.font = `5px ${this.font}`;
        const startY = H * 0.42;
        const lineH = 14;

        ctx.fillStyle = '#00f5ff';
        ctx.fillText(`LOOPS SURVIVED: ${this.stats.score}`, W / 2, startY);

        ctx.fillStyle = '#00ff88';
        ctx.fillText(`DISTANCE: ${Math.floor(this.stats.distance)}m`, W / 2, startY + lineH);

        ctx.fillStyle = '#ff3333';
        ctx.fillText(`GHOSTS: ${this.stats.ghosts}`, W / 2, startY + lineH * 2);

        ctx.fillStyle = '#ffcc00';
        ctx.fillText(`MAX SPEED: ×${this.stats.maxSpeed.toFixed(1)}`, W / 2, startY + lineH * 3);

        // New high score
        const prevHigh = parseInt(localStorage.getItem('rr_highscore') || '0');
        if (this.stats.score > prevHigh) {
            localStorage.setItem('rr_highscore', this.stats.score.toString());
            ctx.fillStyle = '#ffcc00';
            ctx.font = `4px ${this.font}`;
            const pulse = 0.6 + Math.sin(this.timer * 5) * 0.4;
            ctx.globalAlpha = pulse;
            ctx.fillText('★ NEW HIGH SCORE ★', W / 2, startY + lineH * 4 + 5);
            ctx.globalAlpha = 1;
        }

        // Retry prompt
        if (this.timer > 1) {
            const blink = Math.sin(this.timer * 3) > 0;
            if (blink) {
                ctx.font = `5px ${this.font}`;
                ctx.fillStyle = '#ffcc00';
                ctx.fillText('TAP TO RETRY', W / 2, H * 0.88);
            }
        }

        ctx.restore();
    }

    get canRetry() {
        return this.timer > 1;
    }
}
