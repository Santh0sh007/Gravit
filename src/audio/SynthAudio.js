// ─── Synth Audio (Web Audio API) ───────────────────────────────
export class SynthAudio {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.musicPlaying = false;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        // Music state: 'menu' | 'gameplay' | 'none'
        this.musicMode = 'none';
        this._currentSource = null;

        // Audio Buffers
        this.buffers = {
            menu: null,
            gameplay: null
        };

        // Load saved settings
        this._masterVol = parseFloat(localStorage.getItem('rr_masterVol') ?? '0.8');
        this._musicVol = parseFloat(localStorage.getItem('rr_musicVol') ?? '0.5');
        this._sfxVol = parseFloat(localStorage.getItem('rr_sfxVol') ?? '0.8');
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this._masterVol;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this._sfxVol;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this._musicVol * 0.25;
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
            this.loadMusic();
        } catch (e) {
            console.warn('Web Audio not available');
        }
    }

    async loadMusic() {
        if (!this.initialized) return;

        const files = {
            menu: './mfcc-retro-arcade-game-music-297305.mp3',
            gameplay: './hitslab-game-gaming-video-game-music-459876.mp3'
        };

        for (const [key, url] of Object.entries(files)) {
            try {
                const response = await fetch(url); 
                const arrayBuffer = await response.arrayBuffer();
                this.buffers[key] = await this.ctx.decodeAudioData(arrayBuffer);
                console.log(`🎵 ${key} music loaded`);

                // If this mode was requested before it loaded, start it now
                if (this.musicMode === key && this.musicPlaying && !this._currentSource) {
                    this._playBuffer(key);
                }
            } catch (e) {
                console.warn(`Failed to load ${key} music:`, e);
            }
        }
    }

    applySettings(settings) {
        this._masterVol = settings.masterVol;
        this._musicVol = settings.musicVol;
        this._sfxVol = settings.sfxVol;
        if (!this.initialized) return;
        this.masterGain.gain.value = settings.masterVol;
        this.sfxGain.gain.value = settings.sfxVol;
        this.musicGain.gain.value = settings.musicVol * 0.25;
    }

    // ─── MUSIC ─────────────────────────────────────

    startMenuMusic() {
        if (!this.initialized) return;
        if (this.musicMode === 'menu' && this.musicPlaying) return;

        console.log('🔈 Starting menu music');
        this.stopMusic();
        this.musicMode = 'menu';
        this.musicPlaying = true;

        if (this.buffers.menu) {
            this._playBuffer('menu');
        }
    }

    startGameMusic() {
        if (!this.initialized) return;
        if (this.musicMode === 'gameplay' && this.musicPlaying) return;

        console.log('🔈 Starting gameplay music');
        this.stopMusic();
        this.musicMode = 'gameplay';
        this.musicPlaying = true;

        if (this.buffers.gameplay) {
            this._playBuffer('gameplay');
        }
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this._currentSource) {
            try {
                this._currentSource.stop();
            } catch (e) { }
            this._currentSource = null;
        }
    }

    _playBuffer(key) {
        if (!this.musicPlaying || this.musicMode !== key || !this.buffers[key]) return;

        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers[key];
        source.loop = true;
        source.connect(this.musicGain);
        source.start(0);
        this._currentSource = source;
    }

    // ─── SFX (Keeping previous ones as fallbacks/sfx) ───

    playSelect() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.06);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    playJump() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    playDeath() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.4);

        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(t);
    }

    playRewind() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.35);

        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(40, t);
        gain2.gain.setValueAtTime(0.08, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.start(t);
        osc2.stop(t + 0.3);
    }

    playSpeedUp() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t + i * 0.06);
            gain.gain.linearRampToValueAtTime(0.1, t + i * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.1);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + 0.1);
        });
    }

    startMusic() { this.startGameMusic(); }
}
