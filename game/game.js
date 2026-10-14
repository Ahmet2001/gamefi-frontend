// Global Event Emitter for HTML-Game communication
window.gameEvent = new Phaser.Events.EventEmitter();

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    pixelArt: true, // Pixel art için kritik, bulanıklığı önler
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top-down olduğu için yerçekimi yok
            debug: false
        }
    },
    scene: [MainScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

// Persist each training signal; the pet continues to receive the local event.
// Authentication is via the same-origin, HttpOnly session cookie.
window.gameEvent.on('reward', async (reward) => {
    if (reward !== 1 && reward !== -1) return;

    try {
        const response = await fetch('/api/game/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ reward })
        });
        if (!response.ok) throw new Error('Feedback save failed: ' + response.status);
        logAI(reward === 1 ? 'APPROVE feedback saved.' : 'DISCIPLINE feedback saved.');
    } catch (error) {
        console.error('Could not save training feedback', error);
        logAI('Feedback was not saved. Check your session or connection.');
    }
});

// Log Helper
function logAI(msg) {
    const consoleDiv = document.getElementById('console-log');
    consoleDiv.innerHTML += `> ${msg}<br>`;
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
    // Keep only last 6 lines
    const lines = consoleDiv.innerHTML.split('<br>');
    if (lines.length > 7) {
        consoleDiv.innerHTML = lines.slice(lines.length - 7).join('<br>');
    }
}