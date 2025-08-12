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
        this.touchOffset = null; // Touch offset for better mobile dragging
        this.touchStartTime = null; // Touch start time for gesture recognition
        this.isDragging = false;
        this.animationFrameId = null; // For smooth animations
        this.touchAnimationState = {}; // Track animation state for each ball
        this.restScale = 0.75; // Resting visual scale for balls
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
        // Get device pixel ratio for high DPI displays
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Get the display size of the canvas
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        
        // Set the canvas size to match the display size
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        // Set the actual canvas size accounting for device pixel ratio
        this.canvas.width = displayWidth * devicePixelRatio;
        this.canvas.height = displayHeight * devicePixelRatio;
        
        // Scale the drawing context to match the device pixel ratio
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Store the scale factor for touch calculations
        this.devicePixelRatio = devicePixelRatio;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        
        console.log(`Canvas resized: display=${displayWidth}x${displayHeight}, actual=${this.canvas.width}x${this.canvas.height}, ratio=${devicePixelRatio}`);
    }

    setupTouchEvents() {
        if (!this.canvas) return;

        // Prevent default touch behaviors that might interfere
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleTouchStart(e);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleTouchMove(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleTouchEnd(e);
        }, { passive: false });

        // Also handle touchcancel for better mobile support
        this.canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleTouchEnd(e);
        }, { passive: false });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate touch position using CSS coordinates (not scaled by device pixel ratio)
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Debug: log touch coordinates and canvas info
        console.log(`Touch: clientX=${touch.clientX}, clientY=${touch.clientY}, rect.left=${rect.left}, rect.top=${rect.top}`);
        console.log(`Calculated: x=${x}, y=${y}`);
        console.log(`Canvas: width=${this.canvas.width}, height=${this.canvas.height}, style.width=${this.canvas.style.width}, style.height=${this.canvas.style.height}`);
        console.log(`Display: width=${this.displayWidth}, height=${this.displayHeight}, devicePixelRatio=${this.devicePixelRatio}`);
        
        // Use larger touch target for mobile (minimum 44px as per accessibility guidelines)
        const touchTargetSize = Math.max(CONSTANTS.TOUCH_CONFIG.MIN_TOUCH_SIZE, CONSTANTS.GAME_CONFIG.BALL_RADIUS * 3);
        
        // Check if touch is near any ball - find the closest one within touch range
        let closestBallIndex = -1;
        let closestDistance = Infinity;
        
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            const distanceToBall = Math.sqrt(
                Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2)
            );
            
            if (distanceToBall <= touchTargetSize && distanceToBall < closestDistance) {
                closestDistance = distanceToBall;
                closestBallIndex = i;
            }
        }
        
        if (closestBallIndex !== -1) {
            const selectedBall = this.balls[closestBallIndex];
            
            // Prevent accidental touches with a small delay
            this.touchStartTime = Date.now();
            
            this.selectedBallIndex = closestBallIndex;
            this.touchStartPos = { x, y };
            this.touchOffset = {
                x: x - selectedBall.x,
                y: y - selectedBall.y
            };
            this.isDragging = true;
            
            // Add visual feedback for touch
            this.showTouchFeedback(selectedBall);
        }
    }

    handleTouchMove(e) {
        if (!this.isDragging || this.selectedBallIndex === -1) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate touch position using CSS coordinates (not scaled by device pixel ratio)
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Apply touch offset to maintain relative position
        const targetX = x - this.touchOffset.x;
        const targetY = y - this.touchOffset.y;
        
        // Move ball with offset applied
        this.moveBallToPosition(targetX, targetY);
    }

    handleTouchEnd(e) {
        if (this.isDragging) {
            // Hide touch feedback with fade out
            this.hideTouchFeedback();
            
            // Check win condition when drag is released
            this.checkWinCondition();
        }
        
        this.touchStartPos = null;
        this.touchOffset = null;
        this.touchStartTime = null;
        this.isDragging = false;
        this.selectedBallIndex = -1; // Reset selected ball
    }

    // Clean up animations when needed
    cleanupAnimations() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.touchAnimationState = {};
    }

    showTouchFeedback(ball) {
        // Initialize animation state for this ball
        const ballId = this.balls.indexOf(ball);
                this.touchAnimationState[ballId] = {
            isAnimating: true,
            startTime: Date.now(),
            duration: 300, // 300ms animation
            opacity: 0.0,
            scale: this.restScale
        };
        
        // Start animation loop if not already running
        if (!this.animationFrameId) {
            this.animateTouchFeedback();
        }
    }



    hideTouchFeedback() {
        if (this.selectedBallIndex !== -1) {
            const ballId = this.selectedBallIndex;
            if (this.touchAnimationState[ballId]) {
                // Start fade out animation
                this.touchAnimationState[ballId].isAnimating = true;
                this.touchAnimationState[ballId].startTime = Date.now();
                this.touchAnimationState[ballId].duration = 200; // 200ms fade out
                this.touchAnimationState[ballId].fadeOut = true;
            }
        }
    }

    animateTouchFeedback() {
        const currentTime = Date.now();
        let hasActiveAnimations = false;

        // Update animation states
        Object.keys(this.touchAnimationState).forEach(ballId => {
            const state = this.touchAnimationState[ballId];
            if (!state.isAnimating) return;

            const elapsed = currentTime - state.startTime;
            const progress = Math.min(elapsed / state.duration, 1.0);

            if (state.fadeOut) {
                // Fade out animation
                state.opacity = 1.0 - progress;
                // Shrink back towards restScale
                state.scale = this.restScale + (0.45 * (1.0 - progress));
                
                if (progress >= 1.0) {
                    state.isAnimating = false;
                    this.balls[ballId].isTouched = false;
                    this.balls[ballId].touchOpacity = 0.0;
                                         this.balls[ballId].touchScale = this.restScale;
                }
            } else {
                // Fade in animation
                state.opacity = progress;
                // Grow from restScale to restScale + 0.45 (equivalent to 1.2 when restScale=0.75)
                state.scale = this.restScale + (0.45 * progress);
                
                if (progress >= 1.0) {
                    state.opacity = 1.0;
                    state.scale = this.restScale + 0.45;
                }
            }

            this.balls[ballId].isTouched = true;
            this.balls[ballId].touchOpacity = state.opacity;
            this.balls[ballId].touchScale = state.scale;
            hasActiveAnimations = true;
        });

        // Render the frame
        this.render();

        // Continue animation if there are active animations
        if (hasActiveAnimations) {
            this.animationFrameId = requestAnimationFrame(() => this.animateTouchFeedback());
        } else {
            this.animationFrameId = null;
        }
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
        
        // Calculate board positioning first
        this.calculateBoardPosition();
        
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
                    isTouched: false, // Touch feedback state
                    touchOpacity: 0.0, // Animation opacity
                    touchScale: this.restScale, // Animation scale
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
                isTouched: false, // Touch feedback state
                touchOpacity: 0.0, // Animation opacity
                touchScale: this.restScale, // Animation scale
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
        
        // Clear canvas using display dimensions (since context is scaled)
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        
        // Draw background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        
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

    calculateBoardPosition() {
        if (!this.canvas || !this.board || !this.board.nodes) return;
        
        const nodes = this.board.nodes;
        const boardRows = nodes.length;
        const boardCols = nodes[0] ? nodes[0].length : 0;
        
        if (boardRows === 0 || boardCols === 0) return;
        
        // Calculate grid size based on available canvas space with margins
        // Use display dimensions (CSS size) for calculations, not actual canvas size
        const margin = 80; // Space for level number and menus
        const availableWidth = this.displayWidth - (margin * 2);
        const availableHeight = this.displayHeight - (margin * 2);
        
        // Use the smaller dimension to ensure grid fits
        const gridSize = Math.min(availableWidth / boardCols, availableHeight / boardRows);
        
        // Calculate board position to center it
        const boardWidth = boardCols * gridSize;
        const boardHeight = boardRows * gridSize;
        const boardStartX = (this.displayWidth - boardWidth) / 2;
        const boardStartY = (this.displayHeight - boardHeight) / 2;
        
        // Store grid info for other methods to use
        this.gridSize = gridSize;
        this.boardStartX = boardStartX;
        this.boardStartY = boardStartY;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        
        console.log(`Board positioned: startX=${boardStartX}, startY=${boardStartY}, width=${boardWidth}, height=${boardHeight}, gridSize=${gridSize}`);
    }

    renderGrid() {
        if (!this.board || !this.board.nodes) return;
        
        // Ensure board position is calculated
        this.calculateBoardPosition();
        
        const nodes = this.board.nodes;
        const boardRows = nodes.length;
        const boardCols = nodes[0] ? nodes[0].length : 0;
        
        if (boardRows === 0 || boardCols === 0) return;
        
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines for the board area only
        for (let col = 0; col <= boardCols; col++) {
            const x = this.boardStartX + (col * this.gridSize);
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.boardStartY);
            this.ctx.lineTo(x, this.boardStartY + this.boardHeight);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines for the board area only
        for (let row = 0; row <= boardRows; row++) {
            const y = this.boardStartY + (row * this.gridSize);
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardStartX, y);
            this.ctx.lineTo(this.boardStartX + this.boardWidth, y);
            this.ctx.stroke();
        }
    }

    renderLevelNumber() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`#${this.currentLevel}`, this.displayWidth / 2, 40);
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
            
            // Add touch feedback glow effect with animation
            if (ball.isTouched && ball.touchOpacity > 0) {
                // Draw single inner glow with animated opacity
                const glowSize = (ball.radius * this.restScale) + 8;
                const glowOpacity = Math.floor((ball.touchOpacity || 1.0) * 64).toString(16).padStart(2, '0');
                this.ctx.fillStyle = colorHex + glowOpacity;
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, glowSize, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            
            // Draw the ball with subtle scale animation around restScale
            const visualScale = (typeof ball.touchScale === 'number') ? ball.touchScale : this.restScale;
            const ballRadius = ball.radius * visualScale;
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Add subtle border for better visibility
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
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