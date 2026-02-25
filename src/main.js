// ─── Entry Point ───────────────────────────────────────────────
import { Game } from './engine/Game.js';

// Prevent default mobile behaviors
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Lock screen orientation on mobile (if supported)
if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => { });
}

// Start game
const game = new Game();
game.start();

// Dismiss loading screen
const loader = document.getElementById('loading');
if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 600);
}

console.log('🎮 Rewind Runner v1.0 — Production');
