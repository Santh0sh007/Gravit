// ─── Time Rewind System ────────────────────────────────────────
import { Ghost } from '../entities/Ghost.js';

export class Rewind {
    constructor() {
        this.cycleDuration = 10; // seconds
        this.timer = this.cycleDuration;
        this.rewindCount = 0;
        this.speedMultiplier = 1;
        this.speedIncrease = 1.25;
        this.currentRecording = [];
        this.ghosts = [];
        this.isRewinding = false;
        this.rewindEffectTimer = 0;
        this.maxGhosts = 8;

        // Visual rewind playback
        this.rewindPhase = false;
        this.rewindPlayback = [];
        this.rewindIndex = 0;
        this.cycleStartX = 0;

        // Post-rewind invincibility
        this.graceTimer = 0;
    }

    reset() {
        this.timer = this.cycleDuration;
        this.rewindCount = 0;
        this.speedMultiplier = 1;
        this.currentRecording = [];
        this.ghosts = [];
        this.isRewinding = false;
        this.rewindEffectTimer = 0;
        this.rewindPhase = false;
        this.rewindPlayback = [];
        this.rewindIndex = 0;
        this.cycleStartX = 0;
        this.graceTimer = 0;
    }

    recordFrame(player) {
        // Save start position on first frame of cycle
        if (this.currentRecording.length === 0) {
            this.cycleStartX = player.x;
        }
        this.currentRecording.push({
            x: player.x,
            y: player.y,
            gravityDir: player.gravityDir,
            animFrame: player.animFrame
        });
    }

    update(dt, player, camera, audio) {
        // During visual rewind — scrub player backward
        if (this.rewindPhase) {
            this._updateRewindPlayback(player, camera);
            return;
        }

        this.timer -= dt;

        // Rewind effect cooldown
        if (this.rewindEffectTimer > 0) {
            this.rewindEffectTimer -= dt;
        }

        if (this.timer <= 0) {
            this.triggerRewind(player, camera, audio);
        }

        // Update all ghosts
        for (const ghost of this.ghosts) {
            ghost.update(dt);
        }

        // Post-rewind grace period
        if (this.graceTimer > 0) {
            this.graceTimer -= dt;
        }
    }

    _updateRewindPlayback(player, camera) {
        // Skip frames for fast rewind (scales with recording length)
        const skip = Math.max(4, Math.floor(this.rewindPlayback.length / 40));

        for (let i = 0; i < skip; i++) {
            if (this.rewindIndex >= this.rewindPlayback.length) {
                // Visual rewind complete — finish the rewind
                this._finishRewind(player, camera);
                return;
            }
            const frame = this.rewindPlayback[this.rewindIndex];
            player.x = frame.x;
            player.y = frame.y;
            player.gravityDir = frame.gravityDir;
            player.animFrame = frame.animFrame;
            this.rewindIndex++;
        }

        // Camera follows during rewind
        camera.x = player.x - 384 * 0.3;
    }

    triggerRewind(player, camera, audio) {
        this.rewindCount++;
        this.isRewinding = true;
        this.rewindEffectTimer = 0.8;

        // Save recording as ghost
        if (this.currentRecording.length > 0) {
            const ghost = new Ghost([...this.currentRecording], this.speedMultiplier);
            this.ghosts.push(ghost);

            if (this.ghosts.length > this.maxGhosts) {
                this.ghosts.shift();
            }
        }

        // Increase speed
        this.speedMultiplier *= this.speedIncrease;

        // Start visual rewind — play recording backwards
        this.rewindPlayback = [...this.currentRecording].reverse();
        this.rewindIndex = 0;
        this.rewindPhase = true;

        // Disable player controls during rewind
        player.alive = false;

        // Camera shake
        camera.shake(6, 0.4);

        // Audio
        if (audio) audio.playRewind();
    }

    _finishRewind(player, camera) {
        this.rewindPhase = false;

        // Reset for new cycle
        this.currentRecording = [];
        this.timer = this.cycleDuration;

        // Reset player back to the starting point of the cycle
        player.x = this.cycleStartX;
        player.y = 160;
        player.vy = 0;
        player.gravityDir = 1;
        player.speedMultiplier = this.speedMultiplier;
        player.grounded = false;
        player.alive = true;

        // Camera snaps to player start
        camera.x = player.x - 50;

        // Reset ghosts to start of their loops
        for (const ghost of this.ghosts) {
            ghost.frameIndex = 0;
        }

        this.isRewinding = false;

        // Grace period — invincible for 1.5s after rewind
        this.graceTimer = 1.5;
    }

    get progress() {
        return 1 - (this.timer / this.cycleDuration);
    }
}
