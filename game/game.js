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