// ─── Ghost Entity (replays recorded player frames) ─────────────
export class Ghost {
    constructor(recording, speedAtRecord) {
        this.recording = recording; // Array of { x, y, gravityDir, animFrame }
        this.speedAtRecord = speedAtRecord;
        this.frameIndex = 0;
        this.x = 0;
        this.y = 0;
        this.w = 12;
        this.h = 16;
        this.gravityDir = 1;
        this.animFrame = 0;
        this.active = true;
        this.alpha = 0.6;
    }

    update(dt) {
        if (!this.active || this.recording.length === 0) return;

        if (this.frameIndex < this.recording.length) {
            const frame = this.recording[this.frameIndex];
            this.x = frame.x;
            this.y = frame.y;
            this.gravityDir = frame.gravityDir;
            this.animFrame = frame.animFrame;
            this.frameIndex++;
        } else {
            // Loop the ghost
            this.frameIndex = 0;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        const px = Math.round(this.x);
        const py = Math.round(this.y);
        const flip = this.gravityDir === -1;

        ctx.save();
        ctx.globalAlpha = this.alpha;

        if (flip) {
            ctx.translate(px + this.w / 2, py + this.h / 2);
            ctx.scale(1, -1);
            ctx.translate(-(px + this.w / 2), -(py + this.h / 2));
        }

        const f = this.animFrame;
        const col = '#ff0040';

        // Stick figure dimensions (same as Player)
        const cx = px + this.w / 2;
        const headR = 3;
        const headY = py + headR;
        const neckY = headY + headR;
        const hipY = neckY + 7;
        const legLen = 5;
        const armLen = 5;
        const armY = neckY + 2;

        const runCycle = f * Math.PI / 4;
        const legSwing = Math.sin(runCycle) * 0.7;
        const armSwing = Math.sin(runCycle + Math.PI) * 0.6;

        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(cx, headY, headR, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing eyes
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(cx - 1, headY - 1, 1, 1);
        ctx.fillRect(cx + 1, headY - 1, 1, 1);

        // Spine
        ctx.beginPath();
        ctx.moveTo(cx, neckY);
        ctx.lineTo(cx, hipY);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(cx, hipY);
        ctx.lineTo(cx + Math.sin(legSwing) * legLen, hipY + Math.cos(legSwing) * legLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, hipY);
        ctx.lineTo(cx + Math.sin(-legSwing) * legLen, hipY + Math.cos(-legSwing) * legLen);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(cx + Math.sin(armSwing) * armLen, armY + Math.cos(armSwing) * armLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(cx + Math.sin(-armSwing) * armLen, armY + Math.cos(-armSwing) * armLen);
        ctx.stroke();

        // Glitch lines
        if (Math.random() > 0.85) {
            ctx.fillStyle = 'rgba(255, 0, 64, 0.5)';
            const gy = py + Math.random() * this.h;
            ctx.fillRect(px - 3, gy, this.w + 6, 1);
        }

        ctx.restore();
    }

    get box() {
        return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 };
    }
}
