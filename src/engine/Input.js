// ─── Unified Input System with Gesture Controls ──────────────
export class Input {
    constructor(canvas) {
        this.isDown = false;
        this.justPressed = false;
        this.holdDuration = 0;
        this._wasDown = false;
        this._downTime = 0;

        // Gestures
        this.jumpPressed = false;
        this.flipPressed = false;
        this._lastTapTime = 0;
        this._doubleTapThreshold = 250; // ms

        // Detect mobile
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        const el = canvas.el;
        this._canvas = canvas;

        const handleTap = (e) => {
            const now = performance.now();
            const timeSinceLast = now - this._lastTapTime;

            if (timeSinceLast < this._doubleTapThreshold) {
                // Double tap -> FLIP
                this.flipPressed = true;
                this.jumpPressed = false; // Cancel jump on double tap
                this._lastTapTime = 0; // Reset
            } else {
                // Single tap -> JUMP (delayed slightly to see if it's a double tap)
                this.jumpPressed = true;
                this.flipPressed = false;
                this._lastTapTime = now;
            }

            if (!this.isDown) {
                this.isDown = true;
                this._downTime = now;
            }
        };

        const up = () => {
            this.isDown = false;
            this.holdDuration = 0;
            this._downTime = 0;
        };

        // Touch gestures
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTap(e);
        }, { passive: false });

        el.addEventListener('touchend', (e) => {
            e.preventDefault();
            up();
        }, { passive: false });

        // Mouse (desktop fallback)
        el.addEventListener('mousedown', (e) => {
            handleTap(e);
        });
        el.addEventListener('mouseup', () => {
            up();
        });

        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jumpPressed = true;
                if (!this.isDown) {
                    this.isDown = true;
                    this._downTime = performance.now();
                }
            }
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'ArrowDown') {
                e.preventDefault();
                this.flipPressed = true;
                if (!this.isDown) {
                    this.isDown = true;
                    this._downTime = performance.now();
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                up();
            }
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'ArrowDown') {
                up();
            }
        });
    }

    update() {
        this.justPressed = this.isDown && !this._wasDown;

        // Reset states after loop if not justPressed
        if (!this.justPressed) {
            this.jumpPressed = false;
            this.flipPressed = false;
        }

        if (this.isDown && this._downTime > 0) {
            this.holdDuration = (performance.now() - this._downTime) / 1000;
        }
        this._wasDown = this.isDown;
    }

    get isHolding() {
        return this.isDown;
    }

    drawControls(ctx, W, H, state) {
        // Obsolete — gestures don't need UI
    }
}
