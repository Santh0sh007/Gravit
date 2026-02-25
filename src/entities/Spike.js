// ─── Spike Obstacle ────────────────────────────────────────────
export class Spike {
    constructor(x, y, onCeiling = false) {
        this.x = x;
        this.y = y;
        this.w = 10;
        this.h = 10;
        this.onCeiling = onCeiling;
        this.color = '#ff00ff';
        this.active = true;
    }

    update(dt) {
        // Static obstacle
    }

    draw(ctx, glowCtx) {
        if (!this.active) return;
        const px = this.x;
        const py = this.y;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.onCeiling) {
            ctx.moveTo(px, py);
            ctx.lineTo(px + this.w, py);
            ctx.lineTo(px + this.w / 2, py + this.h);
        } else {
            ctx.moveTo(px, py + this.h);
            ctx.lineTo(px + this.w, py + this.h);
            ctx.lineTo(px + this.w / 2, py);
        }
        ctx.closePath();
        ctx.fill();

        // Glow outline
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Glow layer
        glowCtx.save();
        glowCtx.fillStyle = this.color;
        glowCtx.beginPath();
        if (this.onCeiling) {
            glowCtx.moveTo(px, py);
            glowCtx.lineTo(px + this.w, py);
            glowCtx.lineTo(px + this.w / 2, py + this.h);
        } else {
            glowCtx.moveTo(px, py + this.h);
            glowCtx.lineTo(px + this.w, py + this.h);
            glowCtx.lineTo(px + this.w / 2, py);
        }
        glowCtx.closePath();
        glowCtx.fill();
        glowCtx.restore();
    }

    get box() {
        return { x: this.x + 1, y: this.y + 2, w: this.w - 2, h: this.h - 2 };
    }
}
