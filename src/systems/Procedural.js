// ─── Procedural Level Generator ────────────────────────────────
import { Spike } from '../entities/Spike.js';
import { Blade } from '../entities/Blade.js';
import { Platform } from '../entities/Platform.js';

export class Procedural {
    constructor() {
        this.obstacles = [];
        this.platforms = [];
        this.lastSpawnX = 200;
        this.minGap = 60;
        this.maxObstacles = 80;
    }

    reset() {
        this.obstacles = [];
        this.platforms = [];
        this.lastSpawnX = 200;
    }

    update(cameraX, canvasW, rewindCount, speedMult) {
        const viewRight = cameraX + canvasW + 400;

        // Spawn ahead of camera
        while (this.lastSpawnX < viewRight) {
            const difficulty = Math.min(rewindCount * 0.15 + 0.3, 1);
            const gap = this.minGap * (1.2 - difficulty * 0.5) + Math.random() * 30;
            this.lastSpawnX += gap;

            const roll = Math.random();
            const floorY = 190;
            const ceilY = 10;

            if (roll < 0.35) {
                // Floor spike
                this.obstacles.push(new Spike(this.lastSpawnX, floorY - 10, false));
                // Sometimes double spike
                if (difficulty > 0.5 && Math.random() < 0.4) {
                    this.obstacles.push(new Spike(this.lastSpawnX + 12, floorY - 10, false));
                }
            } else if (roll < 0.55) {
                // Ceiling spike
                this.obstacles.push(new Spike(this.lastSpawnX, ceilY, true));
            } else if (roll < 0.75) {
                // Rotating blade
                const bladeY = floorY - 30 - Math.random() * 80;
                const radius = 8 + Math.random() * 6;
                this.obstacles.push(new Blade(this.lastSpawnX, bladeY, radius));
            } else {
                // Moving platform
                const platY = floorY - 40 - Math.random() * 80;
                const moveType = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const range = 15 + Math.random() * 25;
                this.platforms.push(new Platform(this.lastSpawnX, platY, 28 + Math.random() * 15, 5, moveType, range));

                // Add hazard near platform at higher difficulty
                if (difficulty > 0.4 && Math.random() < 0.5) {
                    this.lastSpawnX += 20;
                    this.obstacles.push(new Spike(this.lastSpawnX, floorY - 10, false));
                }
            }
        }

        // Update all
        for (const o of this.obstacles) o.update(0);
        for (const p of this.platforms) p.update(0);

        // Cull far-left obstacles
        const cullX = cameraX - 100;
        this.obstacles = this.obstacles.filter(o => o.x > cullX);
        this.platforms = this.platforms.filter(p => p.x + p.w > cullX);
    }

    draw(ctx, glowCtx) {
        for (const p of this.platforms) p.draw(ctx, glowCtx);
        for (const o of this.obstacles) o.draw(ctx, glowCtx);
    }
}
