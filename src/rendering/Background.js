// ─── Parallax Background ───────────────────────────────────────
export class Background {
    constructor() {
        this.stars = [];
        this.buildings = [];

        // Generate star field
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.random() * 800,
                y: Math.random() * 150,
                size: Math.random() < 0.3 ? 2 : 1,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.5
            });
        }

        // Generate city skyline
        let bx = 0;
        while (bx < 1200) {
            const w = 15 + Math.random() * 25;
            const h = 30 + Math.random() * 80;
            this.buildings.push({
                x: bx,
                w: w,
                h: h,
                windows: Math.floor(Math.random() * 6) + 2,
                color: `hsl(${260 + Math.random() * 40}, 70%, ${8 + Math.random() * 6}%)`
            });
            bx += w + Math.random() * 5;
        }
    }

    draw(ctx, cameraX, time, W, H) {

        // Deep background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#05051a');
        grad.addColorStop(0.5, '#0a0a2e');
        grad.addColorStop(1, '#1a0a2e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Stars (parallax: slow)
        for (const s of this.stars) {
            const sx = ((s.x - cameraX * 0.05) % 800 + 800) % 800;
            if (sx > W) continue;
            const alpha = 0.4 + Math.sin(time * 2 + s.twinkle) * 0.4;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(Math.round(sx), s.y, s.size, s.size);
        }
        ctx.globalAlpha = 1;

        // City silhouettes (parallax: medium)
        const floorY = 190;
        for (const b of this.buildings) {
            const bx = ((b.x - cameraX * 0.15) % 1200 + 1200) % 1200;
            if (bx > W + 40) continue;
            const by = floorY - b.h;

            ctx.fillStyle = b.color;
            ctx.fillRect(Math.round(bx), by, b.w, b.h);

            // Building outline glow
            ctx.strokeStyle = 'rgba(100, 50, 200, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(Math.round(bx), by, b.w, b.h);

            // Windows
            ctx.fillStyle = 'rgba(0, 200, 255, 0.15)';
            const wSize = 2;
            const wGap = 5;
            for (let wy = by + 4; wy < floorY - 6; wy += wGap) {
                for (let wx = 3; wx < b.w - 3; wx += wGap) {
                    if (Math.sin(wx * 7 + wy * 3 + b.x) > 0.2) {
                        ctx.fillRect(Math.round(bx) + wx, wy, wSize, wSize);
                    }
                }
            }
        }

        // Grid floor
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
        ctx.lineWidth = 1;
        const gridSize = 16;
        const gridOffset = cameraX * 0.8 % gridSize;

        // Horizontal lines
        for (let y = floorY; y < H; y += 6) {
            const alpha = 0.15 - (y - floorY) * 0.01;
            if (alpha <= 0) break;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Vertical grid lines (perspective)
        ctx.globalAlpha = 0.1;
        for (let x = -gridOffset; x < W; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, floorY);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Floor line (neon)
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(W, floorY);
        ctx.stroke();

        // Ceiling line
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(W, 10);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}
