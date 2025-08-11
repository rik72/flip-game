/**
 * GameManager - Gestione logica di gioco per Flipgame
 * Responsabile per: livelli, touch interactions, meccaniche puzzle
 */

class GameManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentLevel = 1;
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            moves: 0
        };
        this.canvas = null;
        this.ctx = null;
        this.board = null;
        this.levelData = null; // Store current level data
        this.player = {
            x: 0,
            y: 0,
            radius: 15
        };
        this.touchStartPos = null;
        this.isDragging = false;
        this.gridSize = 40; // Grid cell size for snapping
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupTouchEvents();
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Load level after canvas is set up
        this.loadLevel(this.currentLevel);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.render();
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupTouchEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchStart(e);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchMove(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouchEnd(e);
        }, { passive: false });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Check if touch is near the player
        const distanceToPlayer = Math.sqrt(
            Math.pow(x - this.player.x, 2) + Math.pow(y - this.player.y, 2)
        );
        
        if (distanceToPlayer <= this.player.radius * 2) {
            this.touchStartPos = { x, y };
            this.isDragging = true;
        }
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Move player directly to pointer position with grid snapping
        this.movePlayerToPosition(x, y);
    }

    handleTouchEnd(e) {
        this.touchStartPos = null;
        this.isDragging = false;
        
        // Check win condition when drag is released
        this.checkWinCondition();
    }

    movePlayerToPosition(x, y) {
        // Snap to grid
        const snappedX = Math.round(x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(y / this.gridSize) * this.gridSize;
        
        // Ensure the ball stays within bounds
        const clampedX = Math.max(this.player.radius, Math.min(snappedX, this.canvas.width - this.player.radius));
        const clampedY = Math.max(this.player.radius, Math.min(snappedY, this.canvas.height - this.player.radius));
        
        // Only update if position actually changed
        if (this.player.x !== clampedX || this.player.y !== clampedY) {
            this.player.x = clampedX;
            this.player.y = clampedY;
            this.gameState.moves++;
            this.render();
            // Don't check win condition during drag - only when released
        }
    }

    isValidMove(x, y) {
        // Basic boundary check - can be enhanced with board validation
        return x >= this.player.radius && 
               x <= this.canvas.width - this.player.radius &&
               y >= this.player.radius && 
               y <= this.canvas.height - this.player.radius;
    }

    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.gameState.isPlaying = true;
        this.gameState.moves = 0;
        
        console.log('Loading level:', levelNumber);
        console.log('Canvas available:', !!this.canvas);
        
        // Load level data from storage or default
        const storedLevel = this.storageManager.load(`level_${levelNumber}`);
        console.log('Stored level data:', storedLevel);
        
        this.levelData = storedLevel || this.getDefaultLevel(levelNumber);
        
        // Ensure we have valid level data
        if (!this.levelData || !this.levelData.end) {
            console.warn('Invalid level data, creating default');
            this.levelData = this.getDefaultLevel(levelNumber);
        }
        
        // Final safety check - create a minimal level if everything else fails
        if (!this.levelData || !this.levelData.end) {
            console.error('Failed to create level data, using emergency fallback');
            this.levelData = {
                board: { width: 800, height: 600, cells: [] },
                start: { x: 40, y: 40 },
                end: { x: 760, y: 560 }
            };
        }
        
        console.log('Level data created:', this.levelData);
        console.log('Level data end position:', this.levelData?.end);
        
        this.board = this.levelData.board;
        
        // Set player starting position with proper fallbacks
        const canvasWidth = this.canvas ? this.canvas.width : 800;
        const canvasHeight = this.canvas ? this.canvas.height : 600;
        
        this.player.x = this.levelData.start && this.levelData.start.x ? this.levelData.start.x : canvasWidth / 2;
        this.player.y = this.levelData.start && this.levelData.start.y ? this.levelData.start.y : canvasHeight / 2;
        
        this.render();
    }

    getDefaultLevel(levelNumber) {
        // Simple default level structure
        const canvasWidth = this.canvas ? this.canvas.width : 800;
        const canvasHeight = this.canvas ? this.canvas.height : 600;
        
        // Snap start and end positions to grid
        const startX = Math.round(100 / this.gridSize) * this.gridSize;
        const startY = Math.round(100 / this.gridSize) * this.gridSize;
        const endX = Math.round((canvasWidth - 100) / this.gridSize) * this.gridSize;
        const endY = Math.round((canvasHeight - 100) / this.gridSize) * this.gridSize;
        
        console.log('Creating default level with canvas size:', canvasWidth, canvasHeight);
        console.log('Start position:', startX, startY);
        console.log('End position:', endX, endY);
        
        return {
            board: {
                width: canvasWidth,
                height: canvasHeight,
                cells: []
            },
            start: {
                x: startX,
                y: startY
            },
            end: {
                x: endX,
                y: endY
            }
        };
    }

    checkWinCondition() {
        if (!this.canvas || !this.levelData) return;
        
        const endX = this.levelData.end.x;
        const endY = this.levelData.end.y;
        
        // Check if player is on the same grid position as the goal
        const playerGridX = Math.round(this.player.x / this.gridSize);
        const playerGridY = Math.round(this.player.y / this.gridSize);
        const goalGridX = Math.round(endX / this.gridSize);
        const goalGridY = Math.round(endY / this.gridSize);
        
        if (playerGridX === goalGridX && playerGridY === goalGridY) {
            this.levelCompleted();
        }
    }

    levelCompleted() {
        this.gameState.isPlaying = false;
        this.gameState.score += 100;
        
        // Save progress
        this.storageManager.saveGameProgress(this.currentLevel, this.gameState.score);
        
        // Show completion message (can be enhanced with animations)
        setTimeout(() => {
            this.nextLevel();
        }, 1000);
    }

    nextLevel() {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
    }

    resetLevel() {
        this.loadLevel(this.currentLevel);
    }

    rotateBoard(degrees) {
        // Rotate the game board
        if (this.board && this.board.cells) {
            // Implementation for board rotation
            this.render();
        }
    }

    flipBoard() {
        // Flip the game board
        if (this.board && this.board.cells) {
            // Implementation for board flip
            this.render();
        }
    }

    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.renderGrid();
        
        // Draw level number
        this.renderLevelNumber();
        
        // Draw board
        this.renderBoard();
        
        // Draw end goal
        this.renderEndGoal();
        
        // Draw player LAST (on top of everything)
        this.renderPlayer();
    }

    renderGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    renderLevelNumber() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Level ${this.currentLevel}`, this.canvas.width / 2, 40);
    }

    renderBoard() {
        // Draw board cells if they exist
        if (this.board && this.board.cells) {
            this.board.cells.forEach(cell => {
                this.ctx.fillStyle = cell.color || '#333333';
                this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
            });
        }
    }

    renderPlayer() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    renderEndGoal() {
        if (!this.levelData || !this.levelData.end) {
            console.warn('Level data or end position not available');
            return;
        }
        
        const endX = this.levelData.end.x;
        const endY = this.levelData.end.y;
        
        console.log('Rendering goal at:', endX, endY, 'Canvas size:', this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00FF00';
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 20, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    pause() {
        this.gameState.isPaused = true;
    }

    resume() {
        this.gameState.isPaused = false;
        this.render();
    }

    getGameState() {
        return {
            ...this.gameState,
            currentLevel: this.currentLevel,
            player: { ...this.player }
        };
    }
} 