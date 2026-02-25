// ─── Player Entity ─────────────────────────────────────────────
export class Player {
    constructor() {
        this.reset();
        this.w = 12;
        this.h = 16;
        this.jumpForce = -280;
        this.baseSpeed = 80;
        this.color = '#00f5ff';
        this.frameTimer = 0;
        this.animFrame = 0;
        this.animFrames = 8;
        this.sprites = null; // Set by SpriteSheet
    }

    reset() {
        this.x = 50;
        this.y = 160;
        this.vx = 0;
        this.vy = 0;
        this.gravityDir = 1; // 1 = down, -1 = up
        this.grounded = false;
        this.alive = true;
        this.speedMultiplier = 1;
        this.animFrame = 0;
        this.hasFlipped = false;
    }

    update(dt, input, canvasH, floorY, ceilY) {
        if (!this.alive) return;

        // Auto-run
        this.vx = this.baseSpeed * this.speedMultiplier;

        // Jump (Single Tap / Space)
        if (input.jumpPressed && this.grounded) {
            this.vy = this.jumpForce * this.gravityDir;
            this.grounded = false;
        }

        // Gravity flip (Double Tap / Shift)
        if (input.flipPressed && !this.hasFlipped) {
            this.gravityDir *= -1;
            this.hasFlipped = true;
            this.grounded = false;
        }
        if (!input.flipPressed && !input.isHolding) {
            this.hasFlipped = false;
        }

        // Animation
        this.frameTimer += dt;
        if (this.frameTimer > 0.08) {
            this.frameTimer = 0;
            this.animFrame = (this.animFrame + 1) % this.animFrames;
        }

        // Position
        this.x += this.vx * dt;
    }

    draw(ctx, glowCtx) {
        const px = Math.round(this.x);
        const py = Math.round(this.y);
        const flip = this.gravityDir === -1;

        ctx.save();
        if (flip) {
            ctx.translate(px + this.w / 2, py + this.h / 2);
            ctx.scale(1, -1);
            ctx.translate(-(px + this.w / 2), -(py + this.h / 2));
        }

        // Draw pixel ninja
        this._drawNinja(ctx, px, py);

        // Glow layer
        glowCtx.save();
        if (flip) {
            glowCtx.translate(px + this.w / 2, py + this.h / 2);
            glowCtx.scale(1, -1);
            glowCtx.translate(-(px + this.w / 2), -(py + this.h / 2));
        }
        this._drawNinja(glowCtx, px, py);
        glowCtx.restore();

        ctx.restore();
    }

    _drawNinja(ctx, px, py) {
        const f = this.animFrame;
        const col = this.alive ? this.color : '#ff0040';

        // Stick figure dimensions
        const cx = px + this.w / 2;   // center x
        const headR = 3;
        const headY = py + headR;
        const neckY = headY + headR;
        const hipY = neckY + 7;
        const legLen = 5;
        const armLen = 5;
        const armY = neckY + 2;

        // Running animation angles
        const runCycle = f * Math.PI / 4;
        const legSwing = this.grounded ? Math.sin(runCycle) * 0.7 : 0.3;
        const armSwing = this.grounded ? Math.sin(runCycle + Math.PI) * 0.6 : -0.4;

        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Head (circle)
        ctx.beginPath();
        ctx.arc(cx, headY, headR, 0, Math.PI * 2);
        ctx.stroke();

        // Eye dot
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 1, headY - 1, 1, 1);

        // Headband
        ctx.strokeStyle = '#ff0040';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - headR, headY - 1);
        ctx.lineTo(cx + headR, headY - 1);
        ctx.stroke();
        // Headband tail
        const scarfLen = 3 + Math.sin(f * 0.3) * 2;
        ctx.beginPath();
        ctx.moveTo(cx - headR, headY - 1);
        ctx.lineTo(cx - headR - scarfLen, headY - 2 + Math.sin(f * 0.5));
        ctx.stroke();

        // Spine (neck to hip)
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, neckY);
        ctx.lineTo(cx, hipY);
        ctx.stroke();

        // Left leg
        const l1x = cx + Math.sin(legSwing) * legLen;
        const l1y = hipY + Math.cos(legSwing) * legLen;
        ctx.beginPath();
        ctx.moveTo(cx, hipY);
        ctx.lineTo(l1x, l1y);
        ctx.stroke();

        // Right leg
        const l2x = cx + Math.sin(-legSwing) * legLen;
        const l2y = hipY + Math.cos(-legSwing) * legLen;
        ctx.beginPath();
        ctx.moveTo(cx, hipY);
        ctx.lineTo(l2x, l2y);
        ctx.stroke();

        // Left arm
        const a1x = cx + Math.sin(armSwing) * armLen;
        const a1y = armY + Math.cos(armSwing) * armLen;
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(a1x, a1y);
        ctx.stroke();

        // Right arm
        const a2x = cx + Math.sin(-armSwing) * armLen;
        const a2y = armY + Math.cos(-armSwing) * armLen;
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(a2x, a2y);
        ctx.stroke();
    }

    get box() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
