// ─── Glitch Rewind Effect ──────────────────────────────────────
export class GlitchRewind {
    constructor() {
        this.active = false;
        this.timer = 0;
        this.duration = 0.5;
        this.slices = [];
    }

    trigger() {
        this.active = true;
        this.timer = this.duration;

        // Generate random scanline slices
        this.slices = [];
        for (let i = 0; i < 12; i++) {
            this.slices.push({
                y: Math.random() * 216,
                h: 2 + Math.random() * 8,
                offset: (Math.random() - 0.5) * 20,
                speed: (Math.random() - 0.5) * 100
            });
        }
    }

    update(dt) {
        if (!this.active) return;
        this.timer -= dt;
        if (this.timer <= 0) {
            this.active = false;
        }

        for (const s of this.slices) {
            s.offset += s.speed * dt;
        }
    }

    draw(ctx, canvas) {
        if (!this.active) return;
        const t = this.timer / this.duration;
        const intensity = t;

        ctx.save();

        // Chromatic aberration — RGB channel offset
        const offset = Math.round(intensity * 4);
        if (offset > 0) {
            // Red channel shift
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.3 * intensity;
            ctx.drawImage(canvas.el, offset, 0);
            ctx.drawImage(canvas.el, -offset, 0);
        }

        // Scanline displacement
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = intensity * 0.8;
        for (const s of this.slices) {
            const sy = Math.round(s.y);
            const sh = Math.round(s.h);
            ctx.drawImage(canvas.el, 0, sy, canvas.W, sh, s.offset * intensity, sy, canvas.W, sh);
        }

        // Scanlines overlay
        ctx.globalAlpha = 0.1 * intensity;
        ctx.fillStyle = '#000';
        for (let y = 0; y < canvas.H; y += 2) {
            ctx.fillRect(0, y, canvas.W, 1);
        }

        // White flash at start
        if (t > 0.8) {
            ctx.globalAlpha = (t - 0.8) * 5 * 0.7;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.W, canvas.H);
        }

        ctx.restore();
    }
}
