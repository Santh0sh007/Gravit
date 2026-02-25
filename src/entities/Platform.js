// ─── Moving Platform ───────────────────────────────────────────
export class Platform {
    constructor(x, y, w = 30, h = 6, moveType = 'horizontal', range = 40) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.moveType = moveType;
        this.range = range;
        this.timer = Math.random() * Math.PI * 2;
        this.speed = 1.5 + Math.random();
        this.color = '#00ff88';
        this.active = true;
    }

    update(dt) {
        this.timer += dt * this.speed;
        if (this.moveType === 'horizontal') {
            this.x = this.baseX + Math.sin(this.timer) * this.range;
        } else {
            this.y = this.baseY + Math.sin(this.timer) * this.range;
        }
    }
    draw(ctx, glowCtx) {
        if (!this.active) return;
        const px = Math.round(this.x);
        const py = Math.round(this.y);

        // Platform body
        ctx.fillStyle = '#0a2a1a';
        ctx.fillRect(px, py, this.w, this.h);

        // Neon outline
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, this.w - 1, this.h - 1);

        // Top edge highlight
        ctx.fillStyle = this.color;
        ctx.fillRect(px + 1, py, this.w - 2, 1);

        // Grid lines
        ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
        for (let i = 4; i < this.w; i += 6) {
            ctx.fillRect(px + i, py + 1, 1, this.h - 2);
        }

        // Glow
        glowCtx.fillStyle = this.color;
        glowCtx.fillRect(px, py, this.w, 1);
        glowCtx.fillRect(px, py + this.h - 1, this.w, 1);
    }

    get box() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
