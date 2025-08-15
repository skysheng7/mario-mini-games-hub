// Main Application Manager
class GameManager {
    constructor() {
        this.gameEngine = null;
        this.currentScreen = 'main-menu';
        this.highScores = this.loadHighScores();
        this.currentGameType = null;
        
        this.init();
    }
    
    init() {
        // Initialize game engine
        this.gameEngine = new GameEngine('game-canvas');
        window.gameEngine = this.gameEngine; // Make globally accessible
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show main menu
        this.showScreen('main-menu');
        
        // Update high scores display
        this.updateHighScoresDisplay();
    }
    
    setupEventListeners() {
        // Game card clicks
        document.querySelectorAll('.game-card:not(.coming-soon)').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.dataset.game;
                this.startGame(gameType);
            });
        });
        
        // Navigation buttons
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartCurrentGame();
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartCurrentGame();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Prevent context menu on canvas (for mobile)
        document.getElementById('game-canvas').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }
    
    startGame(gameType) {
        this.currentGameType = gameType;
        this.showScreen('game-screen');
        
        let gameClass, gameTitle;
        
        switch (gameType) {
            case 'platformer':
                gameClass = PlatformerGame;
                gameTitle = 'Super Platformer';
                break;
            case 'collector':
                gameClass = CoinCollectorGame;
                gameTitle = 'Coin Rush';
                break;
            case 'puzzle':
                gameClass = PuzzleGame;
                gameTitle = 'Block Puzzle';
                break;
            default:
                console.error('Unknown game type:', gameType);
                return;
        }
        
        // Start the game
        this.gameEngine.startGame(gameClass, gameTitle);
    }
    
    restartCurrentGame() {
        if (this.currentGameType) {
            this.startGame(this.currentGameType);
        }
    }
    
    showMainMenu() {
        this.gameEngine.stop();
        this.showScreen('main-menu');
        this.currentGameType = null;
        this.updateHighScoresDisplay();
    }
    
    showGameOver(finalScore) {
        // Update high score if needed
        const isNewHighScore = this.updateHighScore(this.currentGameType, finalScore);
        
        // Update game over screen
        document.getElementById('final-score').textContent = finalScore;
        
        const highScoreMessage = document.getElementById('high-score-message');
        if (isNewHighScore) {
            highScoreMessage.textContent = '🎉 NEW HIGH SCORE! 🎉';
            highScoreMessage.style.color = '#FFD700';
        } else {
            const currentHighScore = this.highScores[this.currentGameType] || 0;
            highScoreMessage.textContent = `Best: ${currentHighScore}`;
            highScoreMessage.style.color = '#666';
        }
        
        // Show game over screen
        this.showScreen('game-over-screen');
    }
    
    loadHighScores() {
        const saved = localStorage.getItem('mario-games-high-scores');
        return saved ? JSON.parse(saved) : {
            platformer: 0,
            collector: 0,
            puzzle: 0
        };
    }
    
    saveHighScores() {
        localStorage.setItem('mario-games-high-scores', JSON.stringify(this.highScores));
    }
    
    updateHighScore(gameType, score) {
        const currentBest = this.highScores[gameType] || 0;
        if (score > currentBest) {
            this.highScores[gameType] = score;
            this.saveHighScores();
            return true;
        }
        return false;
    }
    
    updateHighScoresDisplay() {
        document.getElementById('platformer-score').textContent = this.highScores.platformer;
        document.getElementById('collector-score').textContent = this.highScores.collector;
        document.getElementById('puzzle-score').textContent = this.highScores.puzzle;
    }
}

// Utility functions
function randomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7B8', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.gameManager && window.gameManager.gameEngine) {
        window.gameManager.gameEngine.setupCanvas();
    }
});

// Prevent default touch behaviors that might interfere with the game
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}, { passive: false });