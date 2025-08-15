// Game Engine - Core framework for all mini-games
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.setupCanvas();
        
        // Game state
        this.isRunning = false;
        this.currentGame = null;
        this.score = 0;
        this.gameStartTime = 0;
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        this.touch = { x: 0, y: 0, active: false };
        
        // Game objects
        this.gameObjects = [];
        this.particles = [];
        
        // Animation
        this.lastTime = 0;
        this.animationId = null;
        
        this.setupInputHandlers();
    }
    
    setupCanvas() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
        
        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    setupInputHandlers() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.isRunning && this.currentGame && this.currentGame.handleInput) {
                this.currentGame.handleInput(e.code, true);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (this.isRunning && this.currentGame && this.currentGame.handleInput) {
                this.currentGame.handleInput(e.code, false);
            }
        });
        
        // Mouse input
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.clicked = true;
            
            if (this.isRunning && this.currentGame && this.currentGame.handleClick) {
                this.currentGame.handleClick(this.mouse.x, this.mouse.y);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.clicked = false;
        });
        
        // Touch input for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
            this.touch.active = true;
            
            if (this.isRunning && this.currentGame && this.currentGame.handleClick) {
                this.currentGame.handleClick(this.touch.x, this.touch.y);
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.active = false;
        });
        
        // Mobile control buttons
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const jumpBtn = document.getElementById('jump-btn');
        
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = true;
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('ArrowLeft', true);
                }
            });
            
            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowLeft'] = false;
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('ArrowLeft', false);
                }
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = true;
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('ArrowRight', true);
                }
            });
            
            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['ArrowRight'] = false;
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('ArrowRight', false);
                }
            });
        }
        
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['Space'] = true;
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('Space', true);
                }
            });
            
            jumpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['Space'] = false;
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('Space', false);
                }
            });
        }
    }
    
    startGame(gameClass, gameTitle) {
        this.stop();
        this.currentGame = new gameClass(this);
        this.score = 0;
        this.gameStartTime = Date.now();
        this.isRunning = true;
        
        // Update UI
        document.getElementById('current-game-title').textContent = gameTitle;
        this.updateScore(0);
        
        // Clear canvas and start game loop
        this.gameObjects = [];
        this.particles = [];
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.currentGame = null;
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game
        if (this.currentGame && this.currentGame.update) {
            this.currentGame.update(deltaTime);
        }
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Clear and render
        this.clear();
        
        if (this.currentGame && this.currentGame.render) {
            this.currentGame.render(this.ctx);
        }
        
        this.renderParticles();
        
        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    clear() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    updateScore(newScore) {
        this.score = newScore;
        document.getElementById('current-score').textContent = `Score: ${this.score}`;
    }
    
    addScore(points) {
        this.score += points;
        this.updateScore(this.score);
    }
    
    gameOver() {
        this.isRunning = false;
        window.gameManager.showGameOver(this.score);
    }
    
    // Particle system
    createParticle(x, y, color = '#FFD700', size = 5, velocity = { x: 0, y: -2 }) {
        this.particles.push({
            x, y, color, size,
            vx: velocity.x + (Math.random() - 0.5) * 2,
            vy: velocity.y + (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: 0.02
        });
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= particle.decay;
            return particle.life > 0;
        });
    }
    
    renderParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        this.ctx.globalAlpha = 1;
    }
    
    // Collision detection
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Utility functions
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawText(text, x, y, color = '#000', font = '16px Arial') {
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y);
    }
    
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

// Base Game Class that all mini-games extend
class BaseGame {
    constructor(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;
        this.gameObjects = [];
    }
    
    update(deltaTime) {
        // Override in subclasses
    }
    
    render(ctx) {
        // Override in subclasses
    }
    
    handleInput(key, pressed) {
        // Override in subclasses
    }
    
    handleClick(x, y) {
        // Override in subclasses
    }
    
    addGameObject(obj) {
        this.gameObjects.push(obj);
    }
    
    removeGameObject(obj) {
        const index = this.gameObjects.indexOf(obj);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }
}

// Game Object Base Class
class GameObject {
    constructor(x, y, width, height, color = '#FF6B6B') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.active = true;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    checkCollision(other) {
        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();
        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }
}