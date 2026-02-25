// ─── Screen Shake Controller ───────────────────────────────────
export class ScreenShake {
    constructor(camera) {
        this.camera = camera;
    }

    onDeath() {
        this.camera.shake(8, 0.5);
    }

    onRewind() {
        this.camera.shake(6, 0.4);
    }

    onNearMiss() {
        this.camera.shake(2, 0.15);
    }
}
