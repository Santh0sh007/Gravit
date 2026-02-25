// ─── HUD (Heads-Up Display) ────────────────────────────────────
export class HUD {
    constructor() {
        this.font = '"Press Start 2P", monospace';
    }

    draw(ctx, W, H, score, rewindCount, speedMult, rewindProgress, rewindTimer) {
        ctx.save();
        ctx.textBaseline = 'top';

        // Score (top-left)
        ctx.font = `6px ${this.font}`;
        ctx.fillStyle = '#00f5ff';
        ctx.textAlign = 'left';
        ctx.fillText(`LOOPS: ${Math.floor(score)}`, 6, 3);

        // Rewind count + speed (top-right)
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ff00ff';
        ctx.fillText(`LOOP ${rewindCount}`, W - 6, 3);

        ctx.fillStyle = '#ffcc00';
        ctx.font = `5px ${this.font}`;
        ctx.fillText(`×${speedMult.toFixed(1)}`, W - 6, 12);

        // Rewind countdown bar (bottom)
        const barW = 100;
        const barH = 4;
        const barX = (W - barW) / 2;
        const barY = H - 10;

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(barX, barY, barW, barH);

        // Progress fill
        const urgent = rewindTimer < 3;
        const pulse = urgent ? 0.6 + Math.sin(performance.now() * 0.01) * 0.4 : 1;
        const barColor = urgent ? '#ff0040' : '#00f5ff';
        ctx.fillStyle = barColor;
        ctx.globalAlpha = pulse;
        ctx.fillRect(barX, barY, barW * rewindProgress, barH);
        ctx.globalAlpha = 1;

        // Glow on bar
        if (urgent) {
            ctx.shadowColor = '#ff0040';
            ctx.shadowBlur = 6;
            ctx.fillRect(barX, barY, barW * rewindProgress, barH);
            ctx.shadowBlur = 0;
        }

        // Timer text
        ctx.font = `4px ${this.font}`;
        ctx.fillStyle = urgent ? '#ff0040' : '#888';
        ctx.textAlign = 'center';
        ctx.fillText(`REWIND ${Math.ceil(rewindTimer)}s`, W / 2, barY - 7);

        // Ghost count indicator
        // Pause Button (top-center)
        const btnW = 16;
        const btnH = 16;
        const btnX = (W - btnW) / 2;
        const btnY = 3;
        this.pauseBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };

        ctx.fillStyle = 'rgba(0, 245, 255, 0.1)';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = '#00f5ff';
        ctx.font = `6px ${this.font}`;
        ctx.textAlign = 'center';
        ctx.fillText('‖', W / 2, btnY + 11);

        ctx.restore();
    }

    checkPauseClick(x, y) {
        if (!this.pauseBtnRect) return false;
        return (x >= this.pauseBtnRect.x && x <= this.pauseBtnRect.x + this.pauseBtnRect.w &&
            y >= this.pauseBtnRect.y && y <= this.pauseBtnRect.y + this.pauseBtnRect.h);
    }
}
