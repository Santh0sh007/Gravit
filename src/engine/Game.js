// ─── Game Loop Orchestrator ────────────────────────────────────
import { Canvas } from './Canvas.js';
import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { Player } from '../entities/Player.js';
import { Physics } from '../systems/Physics.js';
import { Procedural } from '../systems/Procedural.js';
import { Rewind } from '../systems/Rewind.js';
import { GravityZone } from '../systems/GravityZone.js';
import { Particles } from '../effects/Particles.js';
import { GlitchRewind } from '../effects/GlitchRewind.js';
import { NeonGlow } from '../rendering/NeonGlow.js';
import { Background } from '../rendering/Background.js';
import { SynthAudio } from '../audio/SynthAudio.js';
import { HUD } from '../ui/HUD.js';
import { StartScreen } from '../ui/StartScreen.js';
import { GameOver } from '../ui/GameOver.js';
import { PauseScreen } from '../ui/PauseScreen.js';

export class Game {
    constructor() {
        // Core engine
        this.canvas = new Canvas();
        this.input = new Input(this.canvas);
        this.camera = new Camera();

        // Entities
        this.player = new Player();

        // Systems
        this.physics = new Physics();
        this.procedural = new Procedural();
        this.rewind = new Rewind();
        this.gravityZone = new GravityZone();

        // Effects
        this.particles = new Particles();
        this.glitch = new GlitchRewind();
        this.neonGlow = new NeonGlow(this.canvas);

        // Rendering
        this.background = new Background();

        // Audio
        this.audio = new SynthAudio();

        // UI
        this.hud = new HUD();
        this.startScreen = new StartScreen();
        this.gameOver = new GameOver();
        this.pauseScreen = new PauseScreen();

        // State
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, DEAD
        this.score = 0;
        this.time = 0;
        this.startX = 0;

        // Fixed timestep
        this.fixedDt = 1 / 60;
        this.accumulator = 0;
        this.lastTime = 0;

        // Scanline effect persistent
        this.scanlineOffset = 0;

        // Menu click handling
        this._setupMenuClicks();
    }

    _setupMenuClicks() {
        const el = this.canvas.el;
        const toInternal = (clientX, clientY) => {
            const rect = el.getBoundingClientRect();
            return {
                x: (clientX - rect.left) / rect.width * this.canvas.W,
                y: (clientY - rect.top) / rect.height * this.canvas.H
            };
        };

        const handleClick = (cx, cy) => {
            const p = toInternal(cx, cy);
            if (this.state === 'MENU') {
                // Init and start menu music on first interaction
                this.audio.init();
                this.audio.startMenuMusic();

                const result = this.startScreen.handleClick(p.x, p.y, this.canvas.W, this.canvas.H, this.audio);
                if (result === 'play') {
                    this._startGame();
                }
            } else if (this.state === 'PLAYING') {
                if (this.hud.checkPauseClick(p.x, p.y)) {
                    this.state = 'PAUSED';
                    this.audio.musicGain.gain.setTargetAtTime(this.audio._musicVol * 0.1, this.audio.ctx.currentTime, 0.2);
                }
            } else if (this.state === 'PAUSED') {
                const result = this.pauseScreen.handleClick(p.x, p.y);
                if (result === 'resume') {
                    this.state = 'PLAYING';
                    this.audio.musicGain.gain.setTargetAtTime(this.audio._musicVol * 0.25, this.audio.ctx.currentTime, 0.2);
                } else if (result === 'quit') {
                    this.state = 'MENU';
                    this.audio.startMenuMusic();
                }
            }
        };

        el.addEventListener('click', (e) => handleClick(e.clientX, e.clientY));
        el.addEventListener('touchstart', (e) => {
            if (this.state === 'MENU' && e.touches.length > 0) {
                const t = e.touches[0];
                handleClick(t.clientX, t.clientY);
            }
        }, { passive: true });
    }

    start() {
        this.lastTime = performance.now();
        this._loop();
    }

    _loop() {
        const now = performance.now();
        let dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        // Clamp dt to avoid spiral of death
        if (dt > 0.1) dt = 0.1;

        this.accumulator += dt;
        this.time += dt;

        // Fixed timestep updates
        while (this.accumulator >= this.fixedDt) {
            this._update(this.fixedDt);
            this.accumulator -= this.fixedDt;
        }

        this._render();
        requestAnimationFrame(() => this._loop());
    }

    _update(dt) {
        this.input.update();

        switch (this.state) {
            case 'MENU':
                this.startScreen.update(dt);
                // Menu clicks handled by _setupMenuClicks
                break;

            case 'PLAYING':
                this._updatePlaying(dt);
                break;

            case 'PAUSED':
                // Only allow state transition from clicks handled in _setupMenuClicks
                break;

            case 'DEAD':
                this.gameOver.update(dt);
                this.particles.update(dt);
                if (this.input.justPressed && this.gameOver.canRetry) {
                    this._startGame();
                }
                break;
        }
    }

    _startGame() {
        this.audio.init();
        this.audio.startGameMusic();

        this.state = 'PLAYING';
        this.player.reset();
        this.procedural.reset();
        this.rewind.reset();
        this.gravityZone.reset();
        this.particles.reset();
        this.score = 0;
        this.startX = this.player.x;
        this.camera.x = 0;
        this.camera.shakeX = 0;
        this.camera.shakeY = 0;
    }

    _updatePlaying(dt) {
        const { player, physics, procedural, rewind, gravityZone, particles, camera, audio, canvas } = this;

        // Update rewind timer / visual scrub
        rewind.update(dt, player, camera, audio);

        // Glitch effect on rewind
        if (rewind.rewindEffectTimer > 0 && !this.glitch.active) {
            this.glitch.trigger();
            audio.playSpeedUp();
        }
        this.glitch.update(dt);

        // During visual rewind scrub — skip normal gameplay
        if (rewind.rewindPhase) {
            // Emit rewind particles (reverse trail)
            particles.emitTrail(player.x + player.w, player.y + player.h / 2, rewind.speedMultiplier);
            particles.update(dt);

            // Update score to reflect position
            this.score = Math.max(0, (player.x - this.startX) * 0.1);
            return;
        }

        // ─── Normal gameplay (not rewinding) ───────────────
        // Update player
        player.update(dt, this.input, canvas.H, physics.floorY, physics.ceilY);

        // Jump sound
        if (this.input.justPressed && player.grounded) {
            audio.playJump();
        }

        // Record for ghost
        rewind.recordFrame(player);

        // Procedural generation
        procedural.update(camera.x, canvas.W, rewind.rewindCount, rewind.speedMultiplier);

        // Update platforms
        for (const p of procedural.platforms) {
            p.update(dt);
        }

        // Update blades
        for (const o of procedural.obstacles) {
            o.update(dt);
        }

        // Gravity zones
        gravityZone.update(camera.x, canvas.W, rewind.rewindCount);

        // Physics + collision
        const result = physics.update(
            dt, player,
            procedural.obstacles,
            procedural.platforms,
            gravityZone.zones,
            rewind.ghosts
        );

        if (result === 'dead' && rewind.graceTimer <= 0) {
            this._die();
            return;
        }

        // Score
        this.score = (player.x - this.startX) * 0.1;

        // Camera
        camera.update(dt, player.x, canvas.W);

        // Particles
        particles.emitTrail(player.x - 2, player.y + player.h / 2, rewind.speedMultiplier);

        // Speed lines at high speed
        if (rewind.speedMultiplier > 1.5) {
            particles.emitSpeedLines(camera.x, 0, canvas.W);
        }

        particles.update(dt);
    }

    _die() {
        this.state = 'DEAD';
        this.player.alive = false;
        this.audio.playDeath();
        this.audio.startMenuMusic();
        if (this.startScreen.settings.screenShake) this.camera.shake(10, 0.6);
        this.particles.emitDeath(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);

        this.gameOver.show({
            score: this.rewind.rewindCount,
            distance: this.score,
            ghosts: this.rewind.ghosts.length,
            maxSpeed: this.rewind.speedMultiplier
        });
    }

    _render() {
        const { ctx, glowCtx, W, H } = this.canvas;

        // Clear
        this.canvas.clear();

        // Background (not affected by camera)
        this.background.draw(ctx, this.camera.x, this.time, W, H);

        // Camera transform
        ctx.save();
        glowCtx.save();
        this.camera.apply(ctx);
        this.camera.apply(glowCtx);

        if (this.state === 'PLAYING' || this.state === 'DEAD') {
            // Gravity zones (behind everything)
            this.gravityZone.draw(ctx);

            // Procedural obstacles & platforms
            this.procedural.draw(ctx, glowCtx);

            // Ghosts
            for (const ghost of this.rewind.ghosts) {
                ghost.draw(ctx);
            }

            // Player (render during rewind scrub too, flash during grace)
            if (this.player.alive || this.rewind.rewindPhase) {
                const gracing = this.rewind.graceTimer > 0;
                const visible = !gracing || Math.floor(this.time * 15) % 2 === 0;
                if (visible) {
                    this.player.draw(ctx, glowCtx);
                }
            }

            // Particles (world space)
            this.particles.draw(ctx);
        }

        ctx.restore();
        glowCtx.restore();

        // Apply neon glow post-process
        this.neonGlow.apply();

        // Screen-space effects
        if (this.state === 'PLAYING' || this.state === 'DEAD') {
            // HUD
            this.hud.draw(ctx, W, H,
                this.rewind.rewindCount,
                this.rewind.rewindCount,
                this.rewind.speedMultiplier,
                this.rewind.progress,
                this.rewind.timer
            );
        }

        // Glitch overlay
        this.glitch.draw(ctx, this.canvas);

        // Scanline overlay (toggle-able)
        if (this.startScreen.settings.scanlines) {
            ctx.globalAlpha = 0.03;
            ctx.fillStyle = '#000';
            for (let y = 0; y < H; y += 2) {
                ctx.fillRect(0, y, W, 1);
            }
            ctx.globalAlpha = 1;
        }

        // UI screens
        if (this.state === 'MENU') {
            this.startScreen.draw(ctx, W, H);
        } else if (this.state === 'PAUSED') {
            this.pauseScreen.draw(ctx, W, H);
        } else if (this.state === 'DEAD') {
            this.gameOver.draw(ctx, W, H);
        }

        // Vignette
        this._drawVignette(ctx, W, H);
    }

    _drawVignette(ctx, W, H) {
        const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }
}
