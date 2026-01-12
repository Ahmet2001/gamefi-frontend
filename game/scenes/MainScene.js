class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // No external assets needed. We generate high-quality pixel art procedurally.
    }

    create() {
        // --- 1. PROCEDURAL WORLD GENERATION ---
        this.physics.world.setBounds(0, 0, 2000, 2000);
        
        // Generate Ground Texture (Noise)
        const groundCanvas = this.textures.createCanvas('ground', 64, 64);
        const ctx = groundCanvas.context;
        
        // Base Soil
        ctx.fillStyle = '#111111'; 
        ctx.fillRect(0, 0, 64, 64);
        
        // Noise details
        for(let i=0; i<40; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#1a1a1a' : '#0d0d0d';
            const s = Math.floor(Math.random() * 4) + 1; // 1-4px dots
            const x = Math.floor(Math.random() * 64);
            const y = Math.floor(Math.random() * 64);
            ctx.fillRect(x, y, s, s);
        }
        groundCanvas.refresh();

        // Tile sprite for performance
        this.add.tileSprite(1000, 1000, 2000, 2000, 'ground');

        // --- 2. RESOURCES (CRYSTALS) ---
        this.resources = this.physics.add.staticGroup();
        
        // Generate Crystal Texture
        const crystalGfx = this.make.graphics({x: 0, y: 0, add: false});
        crystalGfx.fillStyle(0xC5A059, 1);
        crystalGfx.beginPath();
        crystalGfx.moveTo(10, 0);
        crystalGfx.lineTo(20, 10);
        crystalGfx.lineTo(20, 30);
        crystalGfx.lineTo(10, 40);
        crystalGfx.lineTo(0, 30);
        crystalGfx.lineTo(0, 10);
        crystalGfx.closePath();
        crystalGfx.fillPath();
        crystalGfx.fillStyle(0xFFD700, 0.5); // Highlight
        crystalGfx.fillTriangle(0, 10, 10, 0, 20, 10);
        crystalGfx.generateTexture('crystal', 20, 40);

        for(let i=0; i<40; i++) {
            const x = Phaser.Math.Between(100, 1900);
            const y = Phaser.Math.Between(100, 1900);
            this.resources.create(x, y, 'crystal').setScale(1.5).refreshBody();
        }

        // --- 3. PLAYER (THE WANDERER) ---
        // Generating a pixel-art character using Graphics
        const pGfx = this.make.graphics({x: 0, y: 0, add: false});
        
        // Shadow
        pGfx.fillStyle(0x000000, 0.5);
        pGfx.fillEllipse(16, 28, 20, 8);
        
        // Body (Cloak)
        pGfx.fillStyle(0x333333, 1);
        pGfx.fillRect(8, 10, 16, 20);
        
        // Hood
        pGfx.fillStyle(0x222222, 1);
        pGfx.beginPath();
        pGfx.moveTo(8, 10);
        pGfx.lineTo(16, 0);
        pGfx.lineTo(24, 10);
        pGfx.closePath();
        pGfx.fillPath();

        // Eyes (Glowing)
        pGfx.fillStyle(0x00ffcc, 1);
        pGfx.fillRect(12, 8, 2, 2);
        pGfx.fillRect(18, 8, 2, 2);
        
        pGfx.generateTexture('player_sprite', 32, 32);

        this.player = this.physics.add.sprite(1000, 1000, 'player_sprite');
        this.player.setCollideWorldBounds(true);
        
        // --- 4. PET (AI) ---
        this.pet = new Pet(this, 1050, 1000);
        this.pet.target = this.player;

        // --- 5. COLLISIONS ---
        this.physics.add.collider(this.player, this.resources);
        this.physics.add.collider(this.pet, this.resources);
        this.physics.add.collider(this.player, this.pet);

        // --- 6. CAMERA ---
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(2); // Zoom in for pixel art look

        // --- 7. MINIMAP ---
        // Important: Position matches the CSS .minimap-container
        this.minimap = this.cameras.add(24, 24, 220, 220).setZoom(0.2).setName('minimap');
        this.minimap.setBackgroundColor(0x000000);
        this.minimap.startFollow(this.player);
        this.minimap.alpha = 0.8;
        // Don't render "ground" on minimap to keep it clean, only entities
        // this.minimap.ignore(groundLayer); 

        // --- 8. INPUTS ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    }

    update() {
        const speed = 180;
        const body = this.player.body;
        body.setVelocity(0);

        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) dx = -1;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) dx = 1;

        if (this.cursors.up.isDown || this.wasd.W.isDown) dy = -1;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) dy = 1;

        // Normalize speed
        if (dx !== 0 || dy !== 0) {
            const angle = Math.atan2(dy, dx);
            body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        }
    }
}