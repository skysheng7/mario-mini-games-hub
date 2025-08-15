// Block Puzzle Game - Match colored blocks to clear lines
class PuzzleGame extends BaseGame {
    constructor(engine) {
        super(engine);
        
        // Game board properties
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.blockSize = 25;
        this.boardOffsetX = (this.width - this.gridWidth * this.blockSize) / 2;
        this.boardOffsetY = 50;
        
        // Game state
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropTimer = 0;
        this.dropInterval = 1000; // milliseconds
        
        // Colors for different block types
        this.colors = [
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7B8', // Blue
            '#96CEB4', // Green
            '#FFEAA7', // Yellow
            '#DDA0DD', // Purple
            '#98D8C8'  // Mint
        ];
        
        // Tetris-like piece shapes
        this.pieceShapes = [
            // I-piece
            [
                [1, 1, 1, 1]
            ],
            // O-piece
            [
                [1, 1],
                [1, 1]
            ],
            // T-piece
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            // S-piece
            [
                [0, 1, 1],
                [1, 1, 0]
            ],
            // Z-piece
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            // J-piece
            [
                [1, 0, 0],
                [1, 1, 1]
            ],
            // L-piece
            [
                [0, 0, 1],
                [1, 1, 1]
            ]
        ];
        
        // Input state
        this.inputState = {
            left: false,
            right: false,
            down: false,
            rotate: false,
            drop: false
        };
        
        // Input timing
        this.inputTimer = {
            left: 0,
            right: 0,
            down: 0
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Initialize empty grid
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = 0; // 0 = empty, >0 = filled with color index
            }
        }
        
        // Create first pieces
        this.nextPiece = this.createRandomPiece();
        this.spawnNewPiece();
    }
    
    createRandomPiece() {
        const shapeIndex = Math.floor(Math.random() * this.pieceShapes.length);
        const colorIndex = Math.floor(Math.random() * this.colors.length) + 1;
        
        return {
            shape: this.pieceShapes[shapeIndex],
            color: colorIndex,
            x: Math.floor(this.gridWidth / 2) - 1,
            y: 0
        };
    }
    
    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createRandomPiece();
        
        // Check if new piece can be placed
        if (!this.canPlacePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.engine.gameOver();
        }
    }
    
    canPlacePiece(piece, x, y) {
        for (let py = 0; py < piece.shape.length; py++) {
            for (let px = 0; px < piece.shape[py].length; px++) {
                if (piece.shape[py][px]) {
                    const boardX = x + px;
                    const boardY = y + py;
                    
                    // Check bounds
                    if (boardX < 0 || boardX >= this.gridWidth || 
                        boardY >= this.gridHeight) {
                        return false;
                    }
                    
                    // Check collision with existing blocks
                    if (boardY >= 0 && this.grid[boardY][boardX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece(piece) {
        for (let py = 0; py < piece.shape.length; py++) {
            for (let px = 0; px < piece.shape[py].length; px++) {
                if (piece.shape[py][px]) {
                    const boardX = piece.x + px;
                    const boardY = piece.y + py;
                    
                    if (boardY >= 0) {
                        this.grid[boardY][boardX] = piece.color;
                    }
                }
            }
        }
    }
    
    rotatePiece(piece) {
        const rotated = [];
        const rows = piece.shape.length;
        const cols = piece.shape[0].length;
        
        // Create rotated shape (90 degrees clockwise)
        for (let x = 0; x < cols; x++) {
            rotated[x] = [];
            for (let y = rows - 1; y >= 0; y--) {
                rotated[x][rows - 1 - y] = piece.shape[y][x];
            }
        }
        
        return {
            ...piece,
            shape: rotated
        };
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            // Check if line is full
            let lineFull = true;
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] === 0) {
                    lineFull = false;
                    break;
                }
            }
            
            if (lineFull) {
                // Create line clear effect
                for (let x = 0; x < this.gridWidth; x++) {
                    const worldX = this.boardOffsetX + x * this.blockSize + this.blockSize / 2;
                    const worldY = this.boardOffsetY + y * this.blockSize + this.blockSize / 2;
                    
                    for (let i = 0; i < 5; i++) {
                        this.engine.createParticle(
                            worldX,
                            worldY,
                            this.colors[this.grid[y][x] - 1],
                            6,
                            { 
                                x: (Math.random() - 0.5) * 10, 
                                y: (Math.random() - 0.5) * 10 
                            }
                        );
                    }
                }
                
                // Remove the line
                this.grid.splice(y, 1);
                // Add empty line at top
                const emptyLine = new Array(this.gridWidth).fill(0);
                this.grid.unshift(emptyLine);
                
                linesCleared++;
                y++; // Check same line again since we removed one
            }
        }
        
        if (linesCleared > 0) {
            // Calculate score based on lines cleared
            const lineScores = [0, 100, 300, 500, 800];
            const scoreToAdd = lineScores[Math.min(linesCleared, 4)] * this.level;
            this.engine.addScore(scoreToAdd);
            
            this.linesCleared += linesCleared;
            
            // Increase level every 10 lines
            const newLevel = Math.floor(this.linesCleared / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            }
        }
    }
    
    update(deltaTime) {
        if (!this.currentPiece) return;
        
        // Handle input timing
        this.updateInput(deltaTime);
        
        // Auto-drop piece
        this.dropTimer += deltaTime;
        if (this.dropTimer >= this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTimer = 0;
        }
    }
    
    updateInput(deltaTime) {
        // Update input timers
        Object.keys(this.inputTimer).forEach(key => {
            if (this.inputState[key]) {
                this.inputTimer[key] += deltaTime;
            } else {
                this.inputTimer[key] = 0;
            }
        });
        
        // Handle continuous movement
        const moveDelay = 150; // milliseconds
        
        if (this.inputState.left && this.inputTimer.left > moveDelay) {
            this.movePiece(-1, 0);
            this.inputTimer.left = 0;
        }
        
        if (this.inputState.right && this.inputTimer.right > moveDelay) {
            this.movePiece(1, 0);
            this.inputTimer.right = 0;
        }
        
        if (this.inputState.down && this.inputTimer.down > 50) {
            this.movePiece(0, 1);
            this.inputTimer.down = 0;
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.canPlacePiece(this.currentPiece, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        } else if (dy > 0) {
            // Piece can't move down, so place it
            this.placePiece(this.currentPiece);
            this.clearLines();
            this.spawnNewPiece();
            this.dropTimer = 0;
        }
        
        return false;
    }
    
    rotatePieceInGame() {
        if (!this.currentPiece) return;
        
        const rotatedPiece = this.rotatePiece(this.currentPiece);
        
        // Try to place rotated piece
        if (this.canPlacePiece(rotatedPiece, rotatedPiece.x, rotatedPiece.y)) {
            this.currentPiece = rotatedPiece;
        } else {
            // Try wall kicks (move left/right to fit rotation)
            for (let kick of [-1, 1, -2, 2]) {
                if (this.canPlacePiece(rotatedPiece, rotatedPiece.x + kick, rotatedPiece.y)) {
                    rotatedPiece.x += kick;
                    this.currentPiece = rotatedPiece;
                    break;
                }
            }
        }
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.canPlacePiece(this.currentPiece, this.currentPiece.x, this.currentPiece.y + dropDistance + 1)) {
            dropDistance++;
        }
        
        this.currentPiece.y += dropDistance;
        this.engine.addScore(dropDistance * 2); // Bonus for hard drop
        
        this.placePiece(this.currentPiece);
        this.clearLines();
        this.spawnNewPiece();
        this.dropTimer = 0;
    }
    
    render(ctx) {
        // Draw background
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw game board border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(
            this.boardOffsetX - 3, 
            this.boardOffsetY - 3, 
            this.gridWidth * this.blockSize + 6, 
            this.gridHeight * this.blockSize + 6
        );
        
        // Draw grid background
        ctx.fillStyle = '#FFF';
        ctx.fillRect(
            this.boardOffsetX, 
            this.boardOffsetY, 
            this.gridWidth * this.blockSize, 
            this.gridHeight * this.blockSize
        );
        
        // Draw grid lines
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 1;
        for (let x = 0; x <= this.gridWidth; x++) {
            const lineX = this.boardOffsetX + x * this.blockSize;
            ctx.beginPath();
            ctx.moveTo(lineX, this.boardOffsetY);
            ctx.lineTo(lineX, this.boardOffsetY + this.gridHeight * this.blockSize);
            ctx.stroke();
        }
        for (let y = 0; y <= this.gridHeight; y++) {
            const lineY = this.boardOffsetY + y * this.blockSize;
            ctx.beginPath();
            ctx.moveTo(this.boardOffsetX, lineY);
            ctx.lineTo(this.boardOffsetX + this.gridWidth * this.blockSize, lineY);
            ctx.stroke();
        }
        
        // Draw placed blocks
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x] !== 0) {
                    this.drawBlock(
                        ctx,
                        this.boardOffsetX + x * this.blockSize,
                        this.boardOffsetY + y * this.blockSize,
                        this.colors[this.grid[y][x] - 1]
                    );
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            ctx.globalAlpha = 0.8;
            for (let py = 0; py < this.currentPiece.shape.length; py++) {
                for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
                    if (this.currentPiece.shape[py][px]) {
                        const x = this.boardOffsetX + (this.currentPiece.x + px) * this.blockSize;
                        const y = this.boardOffsetY + (this.currentPiece.y + py) * this.blockSize;
                        this.drawBlock(ctx, x, y, this.colors[this.currentPiece.color - 1]);
                    }
                }
            }
            ctx.globalAlpha = 1;
        }
        
        // Draw ghost piece (preview of where piece will land)
        if (this.currentPiece) {
            let ghostY = this.currentPiece.y;
            while (this.canPlacePiece(this.currentPiece, this.currentPiece.x, ghostY + 1)) {
                ghostY++;
            }
            
            if (ghostY > this.currentPiece.y) {
                ctx.globalAlpha = 0.3;
                for (let py = 0; py < this.currentPiece.shape.length; py++) {
                    for (let px = 0; px < this.currentPiece.shape[py].length; px++) {
                        if (this.currentPiece.shape[py][px]) {
                            const x = this.boardOffsetX + (this.currentPiece.x + px) * this.blockSize;
                            const y = this.boardOffsetY + (ghostY + py) * this.blockSize;
                            this.drawBlock(ctx, x, y, this.colors[this.currentPiece.color - 1]);
                        }
                    }
                }
                ctx.globalAlpha = 1;
            }
        }
        
        // Draw next piece preview
        this.drawNextPiece(ctx);
        
        // Draw UI
        this.drawUI(ctx);
    }
    
    drawBlock(ctx, x, y, color) {
        // Main block
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Highlight (top-left)
        ctx.fillStyle = this.lightenColor(color, 0.3);
        ctx.fillRect(x + 1, y + 1, this.blockSize - 2, 4);
        ctx.fillRect(x + 1, y + 1, 4, this.blockSize - 2);
        
        // Shadow (bottom-right)
        ctx.fillStyle = this.darkenColor(color, 0.3);
        ctx.fillRect(x + 1, y + this.blockSize - 5, this.blockSize - 2, 4);
        ctx.fillRect(x + this.blockSize - 5, y + 1, 4, this.blockSize - 2);
    }
    
    lightenColor(color, factor) {
        const rgb = this.hexToRgb(color);
        return `rgb(${Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * factor))}, ${Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * factor))}, ${Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * factor))})`;
    }
    
    darkenColor(color, factor) {
        const rgb = this.hexToRgb(color);
        return `rgb(${Math.floor(rgb.r * (1 - factor))}, ${Math.floor(rgb.g * (1 - factor))}, ${Math.floor(rgb.b * (1 - factor))})`;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    drawNextPiece(ctx) {
        if (!this.nextPiece) return;
        
        const previewX = this.boardOffsetX + this.gridWidth * this.blockSize + 20;
        const previewY = this.boardOffsetY + 50;
        
        // Draw preview box
        ctx.fillStyle = '#FFF';
        ctx.fillRect(previewX, previewY, 100, 80);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(previewX, previewY, 100, 80);
        
        // Draw "NEXT" label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NEXT', previewX + 50, previewY - 10);
        
        // Draw next piece
        const pieceSize = 15;
        const offsetX = previewX + 50 - (this.nextPiece.shape[0].length * pieceSize) / 2;
        const offsetY = previewY + 40 - (this.nextPiece.shape.length * pieceSize) / 2;
        
        for (let py = 0; py < this.nextPiece.shape.length; py++) {
            for (let px = 0; px < this.nextPiece.shape[py].length; px++) {
                if (this.nextPiece.shape[py][px]) {
                    ctx.fillStyle = this.colors[this.nextPiece.color - 1];
                    ctx.fillRect(
                        offsetX + px * pieceSize,
                        offsetY + py * pieceSize,
                        pieceSize - 1,
                        pieceSize - 1
                    );
                }
            }
        }
    }
    
    drawUI(ctx) {
        const uiX = this.boardOffsetX + this.gridWidth * this.blockSize + 20;
        let uiY = this.boardOffsetY + 180;
        
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        ctx.fillText(`Level: ${this.level}`, uiX, uiY);
        uiY += 25;
        ctx.fillText(`Lines: ${this.linesCleared}`, uiX, uiY);
        uiY += 50;
        
        // Draw controls
        ctx.font = '10px Arial';
        ctx.fillText('Controls:', uiX, uiY);
        uiY += 20;
        ctx.fillText('← → Move', uiX, uiY);
        uiY += 15;
        ctx.fillText('↓ Soft Drop', uiX, uiY);
        uiY += 15;
        ctx.fillText('↑ Rotate', uiX, uiY);
        uiY += 15;
        ctx.fillText('Space Hard Drop', uiX, uiY);
    }
    
    handleInput(key, pressed) {
        if (!pressed) {
            // Handle key release
            switch (key) {
                case 'ArrowLeft':
                    this.inputState.left = false;
                    break;
                case 'ArrowRight':
                    this.inputState.right = false;
                    break;
                case 'ArrowDown':
                    this.inputState.down = false;
                    break;
            }
            return;
        }
        
        // Handle key press
        switch (key) {
            case 'ArrowLeft':
                if (!this.inputState.left) {
                    this.movePiece(-1, 0);
                }
                this.inputState.left = true;
                break;
            case 'ArrowRight':
                if (!this.inputState.right) {
                    this.movePiece(1, 0);
                }
                this.inputState.right = true;
                break;
            case 'ArrowDown':
                this.inputState.down = true;
                break;
            case 'ArrowUp':
                this.rotatePieceInGame();
                break;
            case 'Space':
                this.hardDrop();
                break;
        }
    }
    
    handleClick(x, y) {
        // Simple click controls for mobile
        const boardCenterX = this.boardOffsetX + (this.gridWidth * this.blockSize) / 2;
        const boardCenterY = this.boardOffsetY + (this.gridHeight * this.blockSize) / 2;
        
        if (y < boardCenterY) {
            // Upper half - rotate
            this.rotatePieceInGame();
        } else if (x < boardCenterX - 50) {
            // Left side - move left
            this.movePiece(-1, 0);
        } else if (x > boardCenterX + 50) {
            // Right side - move right
            this.movePiece(1, 0);
        } else {
            // Center - hard drop
            this.hardDrop();
        }
    }
}