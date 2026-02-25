// ─── Particle System ───────────────────────────────────────────
export class Particles {
    constructor(maxParticles = 200) {
        this.particles = [];
        this.max = maxParticles;
    }

    emit(x, y, count, color, opts = {}) {
        for (let i = 0; i < count && this.particles.length < this.max; i++) {
            this.particles.push({
                x, y,
                vx: (opts.vx || 0) + (Math.random() - 0.5) * (opts.spread || 60),
                vy: (opts.vy || 0) + (Math.random() - 0.5) * (opts.spread || 60),
                life: opts.life || (0.3 + Math.random() * 0.5),
                maxLife: opts.life || 0.6,
                size: opts.size || (1 + Math.random() * 2),
                color: color
            });
        }
    }

    emitTrail(x, y, speedMult) {
        if (Math.random() < 0.3 + speedMult * 0.1) {
            this.emit(x, y, 1, '#00f5ff', {
                vx: -20 - speedMult * 10,
                vy: (Math.random() - 0.5) * 15,
                spread: 5,
                life: 0.2 + Math.random() * 0.2,
                size: 1 + Math.random()
            });
        }
    }

    emitDeath(x, y) {
        this.emit(x, y, 40, '#ff0040', { spread: 150, life: 0.8, size: 2 });
        this.emit(x, y, 20, '#ff6600', { spread: 100, life: 0.6, size: 1.5 });
        this.emit(x, y, 15, '#ffffff', { spread: 80, life: 0.4, size: 1 });
    }

    emitSpeedLines(x, y, canvasW) {
        this.emit(x + canvasW, y + Math.random() * 216, 1, 'rgba(0, 245, 255, 0.3)', {
            vx: -300,
            vy: 0,
            spread: 2,
            life: 0.3,
            size: 1
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.size), Math.ceil(p.size));
        }
        ctx.globalAlpha = 1;
    }

    reset() {
        this.particles = [];
    }
}
