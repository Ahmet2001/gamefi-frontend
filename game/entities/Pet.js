class Pet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, null);
        
        // --- DRONE VISUALS ---
        // Generating texture programmatically
        if (!scene.textures.exists('drone_tex')) {
            const gfx = scene.make.graphics({x: 0, y: 0, add: false});
            
            // Core
            gfx.fillStyle(0x111111, 1);
            gfx.fillCircle(16, 16, 8);
            
            // Outer Ring (Gold)
            gfx.lineStyle(2, 0xC5A059, 1);
            gfx.strokeCircle(16, 16, 12);
            
            // Eye (Red/Scanner)
            gfx.fillStyle(0xff0000, 1);
            gfx.fillRect(14, 14, 4, 4);
            
            // Blades/Wings
            gfx.fillStyle(0x333333, 1);
            gfx.fillRect(2, 14, 8, 4); // Left
            gfx.fillRect(22, 14, 8, 4); // Right
            
            gfx.generateTexture('drone_tex', 32, 32);
        }

        this.setTexture('drone_tex');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.speed = 120;
        this.target = null;
        
        // Floating Animation (Tween)
        scene.tweens.add({
            targets: this,
            y: this.y + 5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // --- RL BRAIN SETUP ---
        this.qTable = {}; 
        this.learningRate = 0.1;
        this.epsilon = 0.2; 
        
        this.lastState = null;
        this.lastAction = null;
        
        // Decision Timer
        scene.time.addEvent({
            delay: 1000, 
            callback: this.makeDecision,
            callbackScope: this,
            loop: true
        });

        window.gameEvent.on('reward', (val) => this.applyReward(val));
    }

    getState() {
        if (!this.target) return 'unknown';
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        
        if (dist < 80) return 'close';
        if (dist < 250) return 'medium';
        return 'far';
    }

    getQ(state, action) {
        if (!this.qTable[state]) this.qTable[state] = [0, 0, 0];
        return this.qTable[state][action];
    }

    makeDecision() {
        const state = this.getState();
        let action;

        if (Math.random() < this.epsilon) {
            action = Phaser.Math.Between(0, 2); 
        } else {
            const qValues = this.qTable[state] || [0,0,0];
            action = qValues.indexOf(Math.max(...qValues));
        }

        this.executeAction(action);
        
        this.lastState = state;
        this.lastAction = action;
        
        // Log to console UI
        const actionNames = ['HOVER', 'FOLLOW', 'SCOUT'];
        this.logToUI(`STATE: ${state.toUpperCase()} | ACT: ${actionNames[action]}`);
    }

    logToUI(msg) {
        const consoleDiv = document.getElementById('console-log');
        if(consoleDiv) {
            consoleDiv.innerHTML += `> ${msg}<br>`;
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        }
    }

    executeAction(action) {
        this.body.setVelocity(0);
        
        if (action === 0) { // Hover/Idle
            // Small drift
        } 
        else if (action === 1) { // Follow
            if (this.target) {
                this.scene.physics.moveToObject(this, this.target, this.speed);
            }
        } 
        else if (action === 2) { // Scout (Random)
            const rx = Phaser.Math.Between(-1, 1) * this.speed;
            const ry = Phaser.Math.Between(-1, 1) * this.speed;
            this.body.setVelocity(rx, ry);
        }
    }

    applyReward(reward) {
        if (!this.lastState) return;

        const currentQ = this.getQ(this.lastState, this.lastAction);
        const newQ = currentQ + this.learningRate * (reward - currentQ);
        this.qTable[this.lastState][this.lastAction] = newQ;
        
        // Visual Feedback
        const color = reward > 0 ? '#10b981' : '#ef4444';
        const symbol = reward > 0 ? 'Protocol Accepted' : 'Protocol Violation';
        
        this.logToUI(`<span style="color:${color}">${symbol}</span>`);

        const text = this.scene.add.text(this.x, this.y - 40, reward > 0 ? "👍" : "⚠️", {
            fontSize: '24px'
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: text,
            y: this.y - 80,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }
}