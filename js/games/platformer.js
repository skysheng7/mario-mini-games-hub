// Super Platformer Game - Mario-style side-scrolling platformer
class PlatformerGame extends BaseGame {
    constructor(engine) {
        super(engine);
        
        // Player properties
        this.player = {
            x: 100,
            y: 400,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            speed: 5,
            jumpPower: 15,
            onGround: false,
            color: '#FF6B6B'
        };
        
        // Game state
        this.gravity = 0.8;
        this.friction = 0.85;
        this.scrollX = 0;
        this.gameTime = 0;
        this.coinsCollected = 0;
        this.lives = 3;
        
        // Game objects
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.spikes = [];
        
        // Input state
        this.inputState = {
            left: false,
            right: false,
            jump: false
        };
        
        this.generateLevel();
    }
    
    generateLevel() {
        // Generate platforms
        this.platforms = [
            // Ground platforms
            { x: 0, y: 550, width: 300, height: 50, color: '#8B4513' },
            { x: 400, y: 500, width: 200, height: 50, color: '#8B4513' },
            { x: 700, y: 450, width: 150, height: 50, color: '#8B4513' },
            { x: 950, y: 400, width: 200, height: 50, color: '#8B4513' },
            { x: 1250, y: 350, width: 150, height: 50, color: '#8B4513' },
            { x: 1500, y: 300, width: 200, height: 50, color: '#8B4513' },
            { x: 1800, y: 400, width: 300, height: 50, color: '#8B4513' },
            { x: 2200, y: 500, width: 200, height: 50, color: '#8B4513' },
            { x: 2500, y: 450, width: 150, height: 50, color: '#8B4513' },
            { x: 2750, y: 350, width: 300, height: 50, color: '#8B4513' },
            
            // Higher platforms
            { x: 500, y: 350, width: 100, height: 20, color: '#A0522D' },
            { x: 800, y: 300, width: 100, height: 20, color: '#A0522D' },
            { x: 1100, y: 250, width: 100, height: 20, color: '#A0522D' },
            { x: 1600, y: 200, width: 100, height: 20, color: '#A0522D' },
            { x: 1900, y: 250, width: 100, height: 20, color: '#A0522D' },
            { x: 2300, y: 300, width: 100, height: 20, color: '#A0522D' }
        ];
        
        // Generate coins
        this.coins = [
            { x: 450, y: 460, width: 20, height: 20, collected: false },
            { x: 520, y: 310, width: 20, height: 20, collected: false },
            { x: 750, y: 410, width: 20, height: 20, collected: false },
            { x: 820, y: 260, width: 20, height: 20, collected: false },
            { x: 1000, y: 360, width: 20, height: 20, collected: false },
            { x: 1120, y: 210, width: 20, height: 20, collected: false },
            { x: 1300, y: 310, width: 20, height: 20, collected: false },
            { x: 1550, y: 260, width: 20, height: 20, collected: false },
            { x: 1620, y: 160, width: 20, height: 20, collected: false },
            { x: 1850, y: 360, width: 20, height: 20, collected: false },
            { x: 1920, y: 210, width: 20, height: 20, collected: false },
            { x: 2250, y: 460, width: 20, height: 20, collected: false },
            { x: 2320, y: 260, width: 20, height: 20, collected: false },
            { x: 2550, y: 410, width: 20, height: 20, collected: false },
            { x: 2800, y: 310, width: 20, height: 20, collected: false }
        ];
        
        // Generate enemies (simple moving enemies)
        this.enemies = [
            { x: 450, y: 460, width: 25, height: 25, vx: 1, color: '#8B0000', minX: 400, maxX: 600 },
            { x: 750, y: 410, width: 25, height: 25, vx: -1, color: '#8B0000', minX: 700, maxX: 850 },
            { x: 1000, y: 360, width: 25, height: 25, vx: 1, color: '#8B0000', minX: 950, maxX: 1150 },
            { x: 1550, y: 260, width: 25, height: 25, vx: -1, color: '#8B0000', minX: 1500, maxX: 1700 },
            { x: 1850, y: 360, width: 25, height: 25, vx: 1, color: '#8B0000', minX: 1800, maxX: 2100 },
            { x: 2250, y: 460, width: 25, height: 25, vx: -1, color: '#8B0000', minX: 2200, maxX: 2400 }
        ];
        
        // Generate spikes
        this.spikes = [
            { x: 350, y: 530, width: 30, height: 20 },
            { x: 650, y: 480, width: 30, height: 20 },
            { x: 900, y: 380, width: 30, height: 20 },
            { x: 1200, y: 330, width: 30, height: 20 },
            { x: 1750, y: 280, width: 30, height: 20 },
            { x: 2150, y: 480, width: 30, height: 20 },
            { x: 2450, y: 430, width: 30, height: 20 }
        ];
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update player physics
        this.updatePlayer();
        
        // Update enemies
        this.updateEnemies();
        
        // Update camera
        this.updateCamera();
        
        // Check collisions
        this.checkCollisions();
        
        // Check win condition
        if (this.player.x > 3000) {
            this.engine.addScore(this.coinsCollected * 100 + Math.floor(1000 - this.gameTime / 100));
            this.engine.gameOver();
        }
        
        // Check if player fell off the map
        if (this.player.y > 700) {
            this.lives--;
            if (this.lives <= 0) {
                this.engine.gameOver();
            } else {
                this.respawnPlayer();
            }
        }
    }
    
    updatePlayer() {
        // Handle input
        if (this.inputState.left) {
            this.player.vx = Math.max(this.player.vx - 1, -this.player.speed);
        }
        if (this.inputState.right) {
            this.player.vx = Math.min(this.player.vx + 1, this.player.speed);
        }
        if (this.inputState.jump && this.player.onGround) {
            this.player.vy = -this.player.jumpPower;
            this.player.onGround = false;
        }
        
        // Apply friction
        if (!this.inputState.left && !this.inputState.right) {
            this.player.vx *= this.friction;
        }
        
        // Apply gravity
        this.player.vy += this.gravity;
        
        // Update position
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // Reset ground state
        this.player.onGround = false;
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            enemy.x += enemy.vx;
            
            // Bounce off boundaries
            if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
                enemy.vx *= -1;
            }
        });
    }
    
    updateCamera() {
        // Follow player with some offset
        const targetScrollX = this.player.x - this.engine.width / 3;
        this.scrollX = Math.max(0, targetScrollX);
    }
    
    checkCollisions() {
        // Platform collisions
        this.platforms.forEach(platform => {
            if (this.engine.checkCollision(this.player, platform)) {
                // Landing on top
                if (this.player.vy > 0 && this.player.y < platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.vy = 0;
                    this.player.onGround = true;
                }
                // Hitting from below
                else if (this.player.vy < 0 && this.player.y > platform.y) {
                    this.player.y = platform.y + platform.height;
                    this.player.vy = 0;
                }
                // Side collisions
                else if (this.player.vx > 0) {
                    this.player.x = platform.x - this.player.width;
                } else if (this.player.vx < 0) {
                    this.player.x = platform.x + platform.width;
                }
            }
        });
        
        // Coin collisions
        this.coins.forEach(coin => {
            if (!coin.collected && this.engine.checkCollision(this.player, coin)) {
                coin.collected = true;
                this.coinsCollected++;
                this.engine.addScore(50);
                
                // Create particle effect
                for (let i = 0; i < 5; i++) {
                    this.engine.createParticle(
                        coin.x + coin.width / 2,
                        coin.y + coin.height / 2,
                        '#FFD700',
                        4,
                        { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 }
                    );
                }
            }
        });
        
        // Enemy collisions
        this.enemies.forEach(enemy => {
            if (this.engine.checkCollision(this.player, enemy)) {
                // Player lands on enemy (defeat enemy)
                if (this.player.vy > 0 && this.player.y < enemy.y - 10) {
                    this.engine.addScore(100);
                    enemy.x = -1000; // Remove enemy off-screen
                    this.player.vy = -8; // Bounce player up
                    
                    // Create particles
                    for (let i = 0; i < 8; i++) {
                        this.engine.createParticle(
                            enemy.x + enemy.width / 2,
                            enemy.y + enemy.height / 2,
                            '#8B0000',
                            3,
                            { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }
                        );
                    }
                } else {
                    // Player gets hurt
                    this.lives--;
                    if (this.lives <= 0) {
                        this.engine.gameOver();
                    } else {
                        this.respawnPlayer();
                    }
                }
            }
        });
        
        // Spike collisions
        this.spikes.forEach(spike => {
            if (this.engine.checkCollision(this.player, spike)) {
                this.lives--;
                if (this.lives <= 0) {
                    this.engine.gameOver();
                } else {
                    this.respawnPlayer();
                }
            }
        });
    }
    
    respawnPlayer() {
        // Find safe respawn position
        let respawnX = Math.max(100, this.player.x - 200);
        this.player.x = respawnX;
        this.player.y = 300;
        this.player.vx = 0;
        this.player.vy = 0;
        
        // Create respawn effect
        for (let i = 0; i < 10; i++) {
            this.engine.createParticle(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                '#4ECDC4',
                6,
                { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 }
            );
        }
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(-this.scrollX, 0);
        
        // Draw background elements
        this.drawBackground(ctx);
        
        // Draw platforms
        this.platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Add border
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        });
        
        // Draw coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
                // Add sparkle effect
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(coin.x + 5, coin.y + 5, 10, 10);
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 2;
                ctx.strokeRect(coin.x, coin.y, coin.width, coin.height);
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            if (enemy.x > -100) { // Only draw if on screen
                ctx.fillStyle = enemy.color;
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                // Add eyes
                ctx.fillStyle = '#FFF';
                ctx.fillRect(enemy.x + 5, enemy.y + 5, 6, 6);
                ctx.fillRect(enemy.x + 14, enemy.y + 5, 6, 6);
                ctx.fillStyle = '#000';
                ctx.fillRect(enemy.x + 7, enemy.y + 7, 2, 2);
                ctx.fillRect(enemy.x + 16, enemy.y + 7, 2, 2);
            }
        });
        
        // Draw spikes
        this.spikes.forEach(spike => {
            ctx.fillStyle = '#666';
            ctx.fillRect(spike.x, spike.y, spike.width, spike.height);
            // Draw spiky top
            ctx.fillStyle = '#444';
            for (let i = 0; i < spike.width; i += 6) {
                ctx.fillRect(spike.x + i, spike.y - 5, 3, 5);
            }
        });
        
        // Draw player
        ctx.fillStyle = this.player.color;
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        // Add simple face
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.player.x + 8, this.player.y + 8, 4, 4);
        ctx.fillRect(this.player.x + 18, this.player.y + 8, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(this.player.x + 9, this.player.y + 9, 2, 2);
        ctx.fillRect(this.player.x + 19, this.player.y + 9, 2, 2);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.player.x + 12, this.player.y + 20, 6, 3);
        
        ctx.restore();
        
        // Draw UI elements (not affected by camera)
        this.drawUI(ctx);
    }
    
    drawBackground(ctx) {
        // Draw simple background elements
        const cloudColor = '#FFF';
        const cloudY = 50;
        
        // Draw clouds that move with parallax
        for (let i = 0; i < 10; i++) {
            const cloudX = i * 300 - (this.scrollX * 0.3);
            if (cloudX > -100 && cloudX < this.engine.width + this.scrollX + 100) {
                ctx.fillStyle = cloudColor;
                ctx.fillRect(cloudX, cloudY + i * 20, 60, 30);
                ctx.fillRect(cloudX + 20, cloudY + i * 20 - 10, 60, 30);
                ctx.fillRect(cloudX + 40, cloudY + i * 20, 60, 30);
            }
        }
    }
    
    drawUI(ctx) {
        // Draw lives
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Lives: ${this.lives}`, 10, 30);
        
        // Draw coins collected
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Coins: ${this.coinsCollected}`, 10, 60);
        
        // Draw progress
        const progress = Math.min(this.player.x / 3000, 1);
        ctx.fillStyle = '#333';
        ctx.fillRect(10, this.engine.height - 30, 200, 10);
        ctx.fillStyle = '#4ECDC4';
        ctx.fillRect(10, this.engine.height - 30, 200 * progress, 10);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        ctx.fillText('Progress', 10, this.engine.height - 35);
    }
    
    handleInput(key, pressed) {
        switch (key) {
            case 'ArrowLeft':
                this.inputState.left = pressed;
                break;
            case 'ArrowRight':
                this.inputState.right = pressed;
                break;
            case 'Space':
            case 'ArrowUp':
                this.inputState.jump = pressed;
                break;
        }
    }
}