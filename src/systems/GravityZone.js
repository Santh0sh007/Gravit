// ─── Gravity Zone System ───────────────────────────────────────
export class GravityZone {
    constructor() {
        this.zones = [];
        this.lastSpawnX = 400;
        this.types = ['heavy', 'low', 'sideways', 'chaotic'];
        this.colors = {
            heavy: 'rgba(128, 0, 255, 0.15)',
            low: 'rgba(0, 200, 255, 0.15)',
            sideways: 'rgba(255, 200, 0, 0.15)',
            chaotic: 'rgba(255, 0, 50, 0.15)'
        };
        this.borderColors = {
            heavy: '#8000ff',
            low: '#00c8ff',
            sideways: '#ffc800',
            chaotic: '#ff0032'
        };
        this.labels = {
            heavy: 'HEAVY',
            low: 'LOW-G',
            sideways: 'PULL',
            chaotic: 'CHAOS'
        };
    }

    reset() {
        this.zones = [];
        this.lastSpawnX = 400;
    }

    update(cameraX, canvasW, rewindCount) {
        const viewRight = cameraX + canvasW + 200;

        // Spawn more zones with higher rewind count
        const spawnChance = Math.min(0.3 + rewindCount * 0.1, 0.8);
        const gap = 200 - rewindCount * 10;

        while (this.lastSpawnX < viewRight) {
            this.lastSpawnX += Math.max(gap, 80) + Math.random() * 100;

            if (Math.random() < spawnChance) {
                const type = this.types[Math.floor(Math.random() * this.types.length)];
                const w = 60 + Math.random() * 80;
                const h = 80 + Math.random() * 60;
                const y = 10 + Math.random() * (180 - h);

                this.zones.push({
                    x: this.lastSpawnX,
                    y: y,
                    w: w,
                    h: h,
                    type: type,
                    dir: Math.random() < 0.5 ? 1 : -1,
                    active: true,
                    timer: 0,
                    get box() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
                });
            }
        }

        // Animate
        for (const z of this.zones) {
            z.timer += 0.016;
        }

        // Cull
        this.zones = this.zones.filter(z => z.x + z.w > cameraX - 50);
    }

    draw(ctx) {
        for (const z of this.zones) {
            const pulse = 0.7 + Math.sin(z.timer * 3) * 0.3;

            // Fill
            ctx.fillStyle = this.colors[z.type];
            ctx.globalAlpha = pulse;
            ctx.fillRect(z.x, z.y, z.w, z.h);

            // Border
            ctx.strokeStyle = this.borderColors[z.type];
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.lineDashOffset = -z.timer * 20;
            ctx.strokeRect(z.x, z.y, z.w, z.h);
            ctx.setLineDash([]);

            // Label
            ctx.globalAlpha = 0.6 * pulse;
            ctx.fillStyle = this.borderColors[z.type];
            ctx.font = '4px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.labels[z.type], z.x + z.w / 2, z.y + z.h / 2 + 2);

            ctx.globalAlpha = 1;
        }
    }
}
