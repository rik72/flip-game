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
        this.boardStartX = 0;
        this.boardStartY = 0;
        this.boardWidth = 0;
        this.boardHeight = 0;
        
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
        
        // Snap to grid relative to board position
        const relativeX = x - this.boardStartX;
        const relativeY = y - this.boardStartY;
        const snappedRelativeX = Math.round(relativeX / this.gridSize) * this.gridSize;
        const snappedRelativeY = Math.round(relativeY / this.gridSize) * this.gridSize;
        
        // Convert back to absolute coordinates
        const snappedX = this.boardStartX + snappedRelativeX;
        const snappedY = this.boardStartY + snappedRelativeY;
        
        // Ensure the ball stays within board bounds
        const clampedX = Math.max(
            this.boardStartX + ball.radius, 
            Math.min(snappedX, this.boardStartX + this.boardWidth - ball.radius)
        );
        const clampedY = Math.max(
            this.boardStartY + ball.radius, 
            Math.min(snappedY, this.boardStartY + this.boardHeight - ball.radius)
        );
        
        // Only update if position actually changed
        if (ball.x !== clampedX || ball.y !== clampedY) {
            ball.x = clampedX;
            ball.y = clampedY;
            this.render();
            // Don't check win condition during drag - only when released
        }
    }

    isValidMove(x, y, ballRadius = CONSTANTS.GAME_CONFIG.BALL_RADIUS) {
        // Check if position is within board bounds
        return x >= this.boardStartX + ballRadius && 
               x <= this.boardStartX + this.boardWidth - ballRadius &&
               y >= this.boardStartY + ballRadius && 
               y <= this.boardStartY + this.boardHeight - ballRadius;
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
        if (!this.levelData || !this.levelData.board || !this.levelData.board.nodes) {
            console.warn('Invalid level data, creating default');
            this.levelData = this.getDefaultLevel(levelNumber);
        }
        
        // Final safety check - create a minimal level if everything else fails
        if (!this.levelData || !this.levelData.board || !this.levelData.board.nodes) {
            console.error('Failed to create level data, using emergency fallback');
            this.levelData = this.getDefaultLevel(1);
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
        // Default level structure with string-based nodes
        return {
            board: {
                nodes: [
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
                    x: this.boardStartX + (ballData.start[0] * this.gridSize),
                    y: this.boardStartY + (ballData.start[1] * this.gridSize),
                    radius: CONSTANTS.GAME_CONFIG.BALL_RADIUS,
                    color: ballData.color || 'white',
                    endPosition: {
                        x: this.boardStartX + (ballData.end[0] * this.gridSize),
                        y: this.boardStartY + (ballData.end[1] * this.gridSize)
                    }
                };
                
                this.balls.push(ball);
                console.log(`Ball ${index} initialized:`, ball);
            });
        } else {
            console.warn('No balls found in level data, creating default ball');
            // Create a default ball
            const defaultBall = {
                x: this.boardStartX + (2 * this.gridSize),
                y: this.boardStartY + (2 * this.gridSize),
                radius: CONSTANTS.GAME_CONFIG.BALL_RADIUS,
                color: 'white',
                endPosition: {
                    x: this.boardStartX + (6 * this.gridSize),
                    y: this.boardStartY + (6 * this.gridSize)
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
            const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
            const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
            const goalGridX = Math.round((ball.endPosition.x - this.boardStartX) / this.gridSize);
            const goalGridY = Math.round((ball.endPosition.y - this.boardStartY) / this.gridSize);
            
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
        if (this.board && this.board.nodes) {
            // Implementation for board rotation
            this.render();
        }
    }

    flipBoard() {
        // Flip the game board
        if (this.board && this.board.nodes) {
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
        if (!this.board || !this.board.nodes) return;
        
        const nodes = this.board.nodes;
        const boardRows = nodes.length;
        const boardCols = nodes[0] ? nodes[0].length : 0;
        
        if (boardRows === 0 || boardCols === 0) return;
        
        // Calculate grid size based on available canvas space with margins
        const margin = 80; // Space for level number and menus
        const availableWidth = this.canvas.width - (margin * 2);
        const availableHeight = this.canvas.height - (margin * 2);
        
        // Use the smaller dimension to ensure grid fits
        const gridSize = Math.min(availableWidth / boardCols, availableHeight / boardRows);
        
        // Calculate board position to center it
        const boardWidth = boardCols * gridSize;
        const boardHeight = boardRows * gridSize;
        const boardStartX = (this.canvas.width - boardWidth) / 2;
        const boardStartY = (this.canvas.height - boardHeight) / 2;
        
        // Store grid info for other methods to use
        this.gridSize = gridSize;
        this.boardStartX = boardStartX;
        this.boardStartY = boardStartY;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines for the board area only
        for (let col = 0; col <= boardCols; col++) {
            const x = boardStartX + (col * gridSize);
            this.ctx.beginPath();
            this.ctx.moveTo(x, boardStartY);
            this.ctx.lineTo(x, boardStartY + boardHeight);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines for the board area only
        for (let row = 0; row <= boardRows; row++) {
            const y = boardStartY + (row * gridSize);
            this.ctx.beginPath();
            this.ctx.moveTo(boardStartX, y);
            this.ctx.lineTo(boardStartX + boardWidth, y);
            this.ctx.stroke();
        }
    }

    renderLevelNumber() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`#${this.currentLevel}`, this.canvas.width / 2, 40);
    }

    renderBoard() {
        // Draw board nodes if they exist
        if (this.board && this.board.nodes) {
            const nodes = this.board.nodes;
            
            for (let row = 0; row < nodes.length; row++) {
                const rowString = nodes[row];
                for (let col = 0; col < rowString.length; col++) {
                    const nodeType = rowString[col];
                    
                    // Only render path nodes as squares, skip start/end (they're rendered as circles)
                    if (nodeType === '#') {
                        this.ctx.fillStyle = CONSTANTS.LEVEL_CONFIG.NODE_COLORS[nodeType] || '#666666';
                        this.ctx.fillRect(
                            this.boardStartX + (col * this.gridSize),
                            this.boardStartY + (row * this.gridSize),
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