// ─── Camera with Screen Shake ──────────────────────────────────
export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this._shakeIntensity = 0;
        this._shakeDuration = 0;
        this._shakeTimer = 0;
    }

    shake(intensity = 4, duration = 0.3) {
        this._shakeIntensity = intensity;
        this._shakeDuration = duration;
        this._shakeTimer = duration;
    }

    update(dt, playerX, canvasW) {
        // Follow player with lead (position player at 15% from left)
        this.x = playerX - canvasW * 0.15;

        // Screen shake
        if (this._shakeTimer > 0) {
            this._shakeTimer -= dt;
            const t = this._shakeTimer / this._shakeDuration;
            const intensity = this._shakeIntensity * t;
            this.shakeX = (Math.random() - 0.5) * 2 * intensity;
            this.shakeY = (Math.random() - 0.5) * 2 * intensity;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    apply(ctx) {
        ctx.translate(-this.x + this.shakeX, this.shakeY);
    }
}
