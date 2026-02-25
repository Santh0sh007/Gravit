// ─── Rotating Blade Obstacle ───────────────────────────────────
export class Blade {
    constructor(x, y, radius = 10) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = 0;
        this.rotSpeed = 5;
        this.color = '#ff3333';
        this.active = true;
    }

    update(dt) {
        this.angle += this.rotSpeed * dt;
    }

    draw(ctx, glowCtx) {
        if (!this.active) return;
        const r = this.radius;
        const teeth = 8;

        const drawBlade = (c) => {
            c.save();
            c.translate(this.x, this.y);
            c.rotate(this.angle);

            // Inner circle
            c.beginPath();
            c.arc(0, 0, r * 0.3, 0, Math.PI * 2);
            c.fillStyle = '#440000';
            c.fill();
            c.strokeStyle = this.color;
            c.lineWidth = 1;
            c.stroke();

            // Teeth
            c.beginPath();
            for (let i = 0; i < teeth; i++) {
                const a1 = (i / teeth) * Math.PI * 2;
                const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
                const a3 = ((i + 1) / teeth) * Math.PI * 2;
                const innerR = r * 0.4;
                if (i === 0) {
                    c.moveTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
                }
                c.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
                c.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
            }
            c.closePath();
            c.fillStyle = this.color;
            c.fill();
            c.strokeStyle = '#ff6666';
            c.lineWidth = 0.5;
            c.stroke();

            c.restore();
        };

        drawBlade(ctx);
        drawBlade(glowCtx);
    }

    get box() {
        const r = this.radius * 0.7;
        return { x: this.x - r, y: this.y - r, w: r * 2, h: r * 2 };
    }
}
