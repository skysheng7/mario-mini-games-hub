// Coin Rush Game - Collect falling coins while avoiding obstacles
class CoinCollectorGame extends BaseGame {
    constructor(engine) {
        super(engine);
        
        // Player properties
        this.player = {
            x: this.width / 2,
            y: this.height - 80,
            width: 40,
            height: 40,
            speed: 8,
            color: '#4ECDC4'
        };
        
        // Game state
        this.score = 0;
        this.gameTime = 0;
        this.difficulty = 1;
        this.lives = 3;
        
        // Game objects
        this.coins = [];
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        
        // Spawn timers
        this.coinSpawnTimer = 0;
        this.obstacleSpawnTimer = 0;
        this.powerupSpawnTimer = 0;
        
        // Power-up effects
        this.powerupEffects = {
            shield: { active: false, timer: 0, duration: 5000 },
            magnet: { active: false, timer: 0, duration: 3000 },
            slow: { active: false, timer: 0, duration: 4000 }
        };
        
        // Input state
        this.inputState = {
            left: false,
            right: false,
            up: false,
            down: false
        };
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Increase difficulty over time
        this.difficulty = 1 + Math.floor(this.gameTime / 10000);
        
        // Update player
        this.updatePlayer();
        
        // Update power-ups
        this.updatePowerups();
        
        // Spawn objects
        this.spawnObjects();
        
        // Update game objects
        this.updateCoins();
        this.updateObstacles();
        this.updatePowerupObjects();
        
        // Check collisions
        this.checkCollisions();
        
        // Clean up off-screen objects
        this.cleanupObjects();
    }
    
    updatePlayer() {
        // Handle input
        let vx = 0;
        let vy = 0;
        
        if (this.inputState.left) vx -= this.player.speed;
        if (this.inputState.right) vx += this.player.speed;
        if (this.inputState.up) vy -= this.player.speed;
        if (this.inputState.down) vy += this.player.speed;
        
        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            const factor = 1 / Math.sqrt(2);
            vx *= factor;
            vy *= factor;
        }
        
        // Update position with bounds checking
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x + vx));
        this.player.y = Math.max(0, Math.min(this.height - this.player.height, this.player.y + vy));
    }
    
    updatePowerups() {
        Object.keys(this.powerupEffects).forEach(type => {
            const effect = this.powerupEffects[type];
            if (effect.active) {
                effect.timer -= 16; // Approximate deltaTime
                if (effect.timer <= 0) {
                    effect.active = false;
                }
            }
        });
    }
    
    spawnObjects() {
        const baseSpawnRate = 60; // Lower = more frequent
        const difficultyFactor = Math.max(0.3, 1 - (this.difficulty - 1) * 0.1);
        
        // Spawn coins
        this.coinSpawnTimer++;
        if (this.coinSpawnTimer > baseSpawnRate * difficultyFactor) {
            this.spawnCoin();
            this.coinSpawnTimer = 0;
        }
        
        // Spawn obstacles
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer > (baseSpawnRate * 2) * difficultyFactor) {
            this.spawnObstacle();
            this.obstacleSpawnTimer = 0;
        }
        
        // Spawn power-ups (less frequent)
        this.powerupSpawnTimer++;
        if (this.powerupSpawnTimer > baseSpawnRate * 8) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }
    }
    
    spawnCoin() {
        const coin = {
            x: Math.random() * (this.width - 20),
            y: -20,
            width: 20,
            height: 20,
            vy: 2 + this.difficulty * 0.5,
            color: '#FFD700',
            type: 'normal',
            collected: false
        };
        
        // Sometimes spawn special coins
        if (Math.random() < 0.1) {
            coin.color = '#FF6B6B';
            coin.type = 'bonus';
            coin.width = 25;
            coin.height = 25;
        }
        
        this.coins.push(coin);
    }
    
    spawnObstacle() {
        const obstacle = {
            x: Math.random() * (this.width - 30),
            y: -30,
            width: 30,
            height: 30,
            vy: 3 + this.difficulty * 0.7,
            color: '#8B0000',
            type: 'normal'
        };
        
        // Sometimes spawn special obstacles
        const rand = Math.random();
        if (rand < 0.2) {
            obstacle.color = '#4B0082';
            obstacle.type = 'fast';
            obstacle.vy *= 1.5;
            obstacle.width = 25;
            obstacle.height = 25;
        } else if (rand < 0.3) {
            obstacle.color = '#2F4F4F';
            obstacle.type = 'big';
            obstacle.width = 45;
            obstacle.height = 45;
            obstacle.vy *= 0.7;
        }
        
        this.obstacles.push(obstacle);
    }
    
    spawnPowerup() {
        const types = ['shield', 'magnet', 'slow'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const colors = {
            shield: '#00FF00',
            magnet: '#FF69B4',
            slow: '#87CEEB'
        };
        
        const powerup = {
            x: Math.random() * (this.width - 25),
            y: -25,
            width: 25,
            height: 25,
            vy: 2,
            color: colors[type],
            type: type,
            collected: false
        };
        
        this.powerups.push(powerup);
    }
    
    updateCoins() {
        this.coins.forEach(coin => {
            coin.y += coin.vy;
            
            // Magnet effect
            if (this.powerupEffects.magnet.active && !coin.collected) {
                const dx = this.player.x + this.player.width / 2 - (coin.x + coin.width / 2);
                const dy = this.player.y + this.player.height / 2 - (coin.y + coin.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = 0.3;
                    coin.x += (dx / distance) * force * distance * 0.01;
                    coin.y += (dy / distance) * force * distance * 0.01;
                }
            }
        });
    }
    
    updateObstacles() {
        const speedMultiplier = this.powerupEffects.slow.active ? 0.3 : 1;
        
        this.obstacles.forEach(obstacle => {
            obstacle.y += obstacle.vy * speedMultiplier;
        });
    }
    
    updatePowerupObjects() {
        this.powerups.forEach(powerup => {
            powerup.y += powerup.vy;
        });
    }
    
    checkCollisions() {
        // Coin collisions
        this.coins.forEach(coin => {
            if (!coin.collected && this.engine.checkCollision(this.player, coin)) {
                coin.collected = true;
                
                let points = coin.type === 'bonus' ? 100 : 50;
                this.engine.addScore(points);
                
                // Create particle effect
                const particleColor = coin.color;
                for (let i = 0; i < 8; i++) {
                    this.engine.createParticle(
                        coin.x + coin.width / 2,
                        coin.y + coin.height / 2,
                        particleColor,
                        4,
                        { 
                            x: (Math.random() - 0.5) * 6, 
                            y: (Math.random() - 0.5) * 6 
                        }
                    );
                }
            }
        });
        
        // Obstacle collisions
        if (!this.powerupEffects.shield.active) {
            this.obstacles.forEach(obstacle => {
                if (this.engine.checkCollision(this.player, obstacle)) {
                    this.lives--;
                    
                    // Create damage effect
                    for (let i = 0; i < 12; i++) {
                        this.engine.createParticle(
                            this.player.x + this.player.width / 2,
                            this.player.y + this.player.height / 2,
                            '#FF0000',
                            5,
                            { 
                                x: (Math.random() - 0.5) * 8, 
                                y: (Math.random() - 0.5) * 8 
                            }
                        );
                    }
                    
                    // Remove obstacle
                    obstacle.y = this.height + 100;
                    
                    if (this.lives <= 0) {
                        this.engine.gameOver();
                    }
                }
            });
        }
        
        // Power-up collisions
        this.powerups.forEach(powerup => {
            if (!powerup.collected && this.engine.checkCollision(this.player, powerup)) {
                powerup.collected = true;
                
                // Activate power-up
                this.powerupEffects[powerup.type].active = true;
                this.powerupEffects[powerup.type].timer = this.powerupEffects[powerup.type].duration;
                
                // Create effect particles
                for (let i = 0; i < 10; i++) {
                    this.engine.createParticle(
                        powerup.x + powerup.width / 2,
                        powerup.y + powerup.height / 2,
                        powerup.color,
                        6,
                        { 
                            x: (Math.random() - 0.5) * 8, 
                            y: (Math.random() - 0.5) * 8 
                        }
                    );
                }
            }
        });
    }
    
    cleanupObjects() {
        this.coins = this.coins.filter(coin => coin.y < this.height + 50 && !coin.collected);
        this.obstacles = this.obstacles.filter(obstacle => obstacle.y < this.height + 50);
        this.powerups = this.powerups.filter(powerup => powerup.y < this.height + 50 && !powerup.collected);
    }
    
    render(ctx) {
        // Draw background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                ctx.fillStyle = coin.color;
                ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
                
                // Add sparkle effect
                if (coin.type === 'bonus') {
                    ctx.fillStyle = '#FFFF00';
                    ctx.fillRect(coin.x + 5, coin.y + 5, coin.width - 10, coin.height - 10);
                }
                
                // Add border
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 2;
                ctx.strokeRect(coin.x, coin.y, coin.width, coin.height);
            }
        });
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Add spikes or details based on type
            ctx.fillStyle = '#000';
            if (obstacle.type === 'fast') {
                // Lightning pattern
                ctx.fillRect(obstacle.x + 10, obstacle.y + 5, 5, 15);
                ctx.fillRect(obstacle.x + 5, obstacle.y + 10, 15, 5);
            } else if (obstacle.type === 'big') {
                // Grid pattern
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        ctx.fillRect(obstacle.x + i * 15 + 5, obstacle.y + j * 15 + 5, 5, 5);
                    }
                }
            } else {
                // Simple spikes
                for (let i = 0; i < obstacle.width; i += 6) {
                    ctx.fillRect(obstacle.x + i, obstacle.y, 3, obstacle.height);
                }
            }
        });
        
        // Draw power-ups
        this.powerups.forEach(powerup => {
            if (!powerup.collected) {
                ctx.fillStyle = powerup.color;
                ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
                
                // Add symbol based on type
                ctx.fillStyle = '#FFF';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                let symbol = '';
                switch (powerup.type) {
                    case 'shield': symbol = '🛡️'; break;
                    case 'magnet': symbol = '🧲'; break;
                    case 'slow': symbol = '⏰'; break;
                }
                ctx.fillText(symbol, powerup.x + powerup.width / 2, powerup.y + powerup.height / 2 + 5);
                
                // Add border
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.strokeRect(powerup.x, powerup.y, powerup.width, powerup.height);
            }
        });
        
        // Draw player
        ctx.fillStyle = this.player.color;
        if (this.powerupEffects.shield.active) {
            // Shield effect
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.player.x - 5, this.player.y - 5, this.player.width + 10, this.player.height + 10);
            ctx.fillStyle = this.player.color;
        }
        
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Add player details
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.player.x + 10, this.player.y + 8, 6, 6);
        ctx.fillRect(this.player.x + 24, this.player.y + 8, 6, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(this.player.x + 12, this.player.y + 10, 2, 2);
        ctx.fillRect(this.player.x + 26, this.player.y + 10, 2, 2);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.player.x + 15, this.player.y + 25, 10, 4);
        
        // Draw UI
        this.drawUI(ctx);
    }
    
    drawUI(ctx) {
        // Draw lives
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Lives: ${this.lives}`, 10, 30);
        
        // Draw difficulty
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText(`Level: ${this.difficulty}`, 10, 60);
        
        // Draw power-up status
        let yPos = 90;
        Object.keys(this.powerupEffects).forEach(type => {
            const effect = this.powerupEffects[type];
            if (effect.active) {
                const timeLeft = Math.ceil(effect.timer / 1000);
                ctx.fillStyle = '#00FF00';
                ctx.fillText(`${type.toUpperCase()}: ${timeLeft}s`, 10, yPos);
                yPos += 25;
            }
        });
        
        // Draw game time
        const minutes = Math.floor(this.gameTime / 60000);
        const seconds = Math.floor((this.gameTime % 60000) / 1000);
        ctx.fillStyle = '#333';
        ctx.textAlign = 'right';
        ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, this.width - 10, 30);
    }
    
    handleInput(key, pressed) {
        switch (key) {
            case 'ArrowLeft':
                this.inputState.left = pressed;
                break;
            case 'ArrowRight':
                this.inputState.right = pressed;
                break;
            case 'ArrowUp':
                this.inputState.up = pressed;
                break;
            case 'ArrowDown':
                this.inputState.down = pressed;
                break;
        }
    }
    
    handleClick(x, y) {
        // Move player towards click position
        const dx = x - (this.player.x + this.player.width / 2);
        const dy = y - (this.player.y + this.player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            const speed = 15;
            this.player.x += (dx / distance) * speed;
            this.player.y += (dy / distance) * speed;
            
            // Keep player in bounds
            this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
            this.player.y = Math.max(0, Math.min(this.height - this.player.height, this.player.y));
        }
    }
}