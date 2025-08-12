/**
 * GameManager - Gestione logica di gioco per Flipgame
 * Responsabile per: livelli, touch interactions, meccaniche puzzle
 */

class GameManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentLevel = 1;
        this.gameState = {
            isPlaying: false
        };
        this.canvas = null;
        this.ctx = null;
        this.board = null;
        this.levelData = null; // Store current level data
        this.balls = []; // Array of ball objects
        this.selectedBallIndex = -1; // Index of currently selected ball
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
        
        // Check if touch is near any ball
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            const distanceToBall = Math.sqrt(
                Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2)
            );
            
            if (distanceToBall <= ball.radius * 2) {
                this.selectedBallIndex = i;
                this.touchStartPos = { x, y };
                this.isDragging = true;
                break;
            }
        }
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Move ball directly to pointer position with grid snapping
        this.moveBallToPosition(x, y);
    }

    handleTouchEnd(e) {
        this.touchStartPos = null;
        this.isDragging = false;
        this.selectedBallIndex = -1; // Reset selected ball
        
        // Check win condition when drag is released
        this.checkWinCondition();
    }

    moveBallToPosition(x, y) {
        if (this.selectedBallIndex === -1) return;
        
        const ball = this.balls[this.selectedBallIndex];
        
        // Snap to grid
        const snappedX = Math.round(x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(y / this.gridSize) * this.gridSize;
        
        // Ensure the ball stays within bounds
        const clampedX = Math.max(ball.radius, Math.min(snappedX, this.canvas.width - ball.radius));
        const clampedY = Math.max(ball.radius, Math.min(snappedY, this.canvas.height - ball.radius));
        
        // Only update if position actually changed
        if (ball.x !== clampedX || ball.y !== clampedY) {
            ball.x = clampedX;
            ball.y = clampedY;
            this.render();
            // Don't check win condition during drag - only when released
        }
    }

    isValidMove(x, y, ballRadius = CONSTANTS.GAME_CONFIG.PLAYER_RADIUS) {
        // Basic boundary check - can be enhanced with board validation
        return x >= ballRadius && 
               x <= this.canvas.width - ballRadius &&
               y >= ballRadius && 
               y <= this.canvas.height - ballRadius;
    }

    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.gameState.isPlaying = true;
        
        console.log('Loading level:', levelNumber);
        console.log('Canvas available:', !!this.canvas);
        
        // Load level data from storage or default
        const storedLevel = this.storageManager.load(`level_${levelNumber}`);
        console.log('Stored level data:', storedLevel);
        
        this.levelData = storedLevel || this.getDefaultLevel(levelNumber);
        
        // Ensure we have valid level data
        if (!this.levelData || !this.levelData.board || !this.levelData.board.cells) {
            console.warn('Invalid level data, creating default');
            this.levelData = this.getDefaultLevel(levelNumber);
        }
        
        // Final safety check - create a minimal level if everything else fails
        if (!this.levelData || !this.levelData.board || !this.levelData.board.cells) {
            console.error('Failed to create level data, using emergency fallback');
            this.levelData = {
                board: {
                    cells: [
                        "........",
                        "..s.....",
                        "........",
                        ".....e..",
                        "........"
                    ]
                }
            };
        }
        
        console.log('Level data created:', this.levelData);
        console.log('Board:', this.levelData.board);
        console.log('Balls:', this.levelData.balls);
        
        this.board = this.levelData.board;
        
        // Initialize balls array from level data
        this.initializeBalls();
        
        this.render();
    }

    getDefaultLevel(levelNumber) {
        // Default level structure with string-based cells
        return {
            board: {
                cells: [
                    "........",
                    "........",
                    "........",
                    "........",
                    "........",
                    "........",
                    "........",
                    "........"
                ]
            },
            balls: [
                {
                    start: [2, 2],
                    end: [6, 6],
                    color: 'red'
                },
                {
                    start: [2, 6],
                    end: [6, 2],
                    color: 'blue'
                }
                // Additional balls can be added here for multi-ball levels
                // {
                //     start: [3, 3],
                //     end: [5, 5],
                //     color: 'red'
                // }
            ]
        };
    }

    initializeBalls() {
        console.log('Initializing balls from level data:', this.levelData);
        
        this.balls = [];
        
        if (this.levelData.balls && this.levelData.balls.length > 0) {
            this.levelData.balls.forEach((ballData, index) => {
                console.log(`Initializing ball ${index}:`, ballData);
                
                const ball = {
                    x: ballData.start[0] * this.gridSize,
                    y: ballData.start[1] * this.gridSize,
                    radius: CONSTANTS.GAME_CONFIG.PLAYER_RADIUS,
                    color: ballData.color || 'white',
                    endPosition: {
                        x: ballData.end[0] * this.gridSize,
                        y: ballData.end[1] * this.gridSize
                    }
                };
                
                this.balls.push(ball);
                console.log(`Ball ${index} initialized:`, ball);
            });
        } else {
            console.warn('No balls found in level data, creating default ball');
            // Create a default ball
            const defaultBall = {
                x: 2 * this.gridSize,
                y: 2 * this.gridSize,
                radius: CONSTANTS.GAME_CONFIG.PLAYER_RADIUS,
                color: 'white',
                endPosition: {
                    x: 6 * this.gridSize,
                    y: 6 * this.gridSize
                }
            };
            this.balls.push(defaultBall);
        }
        
        console.log('Balls array initialized:', this.balls);
    }

    checkWinCondition() {
        if (!this.canvas || this.balls.length === 0) return;
        
        // Check if all balls are at their respective end positions
        const allBallsAtGoal = this.balls.every(ball => {
            const ballGridX = Math.round(ball.x / this.gridSize);
            const ballGridY = Math.round(ball.y / this.gridSize);
            const goalGridX = Math.round(ball.endPosition.x / this.gridSize);
            const goalGridY = Math.round(ball.endPosition.y / this.gridSize);
            
            return ballGridX === goalGridX && ballGridY === goalGridY;
        });
        
        if (allBallsAtGoal) {
            this.levelCompleted();
        }
    }

    levelCompleted() {
        this.gameState.isPlaying = false;
        
        // Save progress
        this.storageManager.saveGameProgress(this.currentLevel);
        
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
        
        // Draw end goals
        this.renderEndGoals();
        
        // Draw balls LAST (on top of everything)
        this.renderBalls();
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
            const cells = this.board.cells;
            
            for (let row = 0; row < cells.length; row++) {
                const rowString = cells[row];
                for (let col = 0; col < rowString.length; col++) {
                    const cellType = rowString[col];
                    
                    // Only render path cells as squares, skip start/end (they're rendered as circles)
                    if (cellType === '#') {
                        this.ctx.fillStyle = CONSTANTS.LEVEL_CONFIG.CELL_COLORS[cellType] || '#666666';
                        this.ctx.fillRect(
                            col * this.gridSize,
                            row * this.gridSize,
                            this.gridSize,
                            this.gridSize
                        );
                    }
                }
            }
        }
    }

    renderBalls() {
        this.balls.forEach((ball, index) => {
            // Use ball color from ball data, fallback to white
            const colorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
            
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    renderEndGoals() {
        this.balls.forEach((ball, index) => {
            const endX = ball.endPosition.x;
            const endY = ball.endPosition.y;
            
            console.log(`Rendering goal ${index} at:`, endX, endY, 'Canvas size:', this.canvas.width, this.canvas.height);
            
            // Use the same color as the ball for the ring
            const colorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
            
            // Draw ring: inner radius = ball radius + 1, outer radius = ball radius + 5
            const innerRadius = ball.radius + 1;
            const outerRadius = ball.radius + 5;
            
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(endX, endY, outerRadius, 0, 2 * Math.PI);
            this.ctx.arc(endX, endY, innerRadius, 0, 2 * Math.PI, true); // true = counterclockwise for hole
            this.ctx.fill();
        });
    }



    getGameState() {
        return {
            ...this.gameState,
            currentLevel: this.currentLevel,
            balls: this.balls.map(ball => ({ ...ball }))
        };
    }

    // Testing method for new level format
    testLevelFormat() {
        try {
            // Test the current level data
            if (this.levelData) {
                Utils.validateLevelData(this.levelData);
                console.log('✅ Level format validation passed');
                
                // Test ball initialization
                console.log('✅ Balls initialized:', this.balls.length);
                this.balls.forEach((ball, index) => {
                    console.log(`✅ Ball ${index}:`, ball);
                });
                
                return true;
            } else {
                console.error('❌ No level data available for testing');
                return false;
            }
        } catch (error) {
            console.error('❌ Level format validation failed:', error.message);
            return false;
        }
    }
} 