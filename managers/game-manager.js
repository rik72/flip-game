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
        this.loadLevel(this.currentLevel).catch(error => {
            console.error('Failed to load initial level:', error);
        });
        
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
        
        // Check if touch is too far from the ball - if so, release the ball
        const ball = this.balls[this.selectedBallIndex];
        if (ball) {
            const distanceFromBall = Math.sqrt(
                Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2)
            );
            
            // Use MAX_TOUCH_DISTANCE from constants to determine when to release
            if (distanceFromBall > CONSTANTS.TOUCH_CONFIG.MAX_TOUCH_DISTANCE) {
                // Release the ball - simulate touch end
                this.handleTouchEnd(e);
                return;
            }
        }
        
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

    // Radius helpers to keep balls and graphics proportional to the board
    getLogicalBallRadius() {
        // Base logical radius used for bounds and goals (independent of touch animation)
        return this.gridSize * 0.375; // 37.5% of a cell; tweak as desired
    }

    getVisualScale(ball) {
        return typeof ball.touchScale === 'number' ? ball.touchScale : this.restScale;
    }

    getVisualBallRadius(ball) {
        return this.getLogicalBallRadius() * this.getVisualScale(ball);
    }

    // Goal ring radii helpers (keep visuals proportional and reusable)
    getGoalInnerRadius() {
        const base = this.getLogicalBallRadius();
        return base + Math.max(1, this.gridSize * 0.02);
    }

    getGoalOuterRadius() {
        const base = this.getLogicalBallRadius();
        return base + Math.max(5, this.gridSize * 0.125);
    }

    // Check if a grid node is already occupied by another ball
    isNodeOccupied(gridX, gridY, ignoreBallIndex = -1) {
        return this.balls.some((otherBall, idx) => {
            if (idx === ignoreBallIndex) return false;
            const otherGridX = Math.round((otherBall.x - this.boardStartX) / this.gridSize);
            const otherGridY = Math.round((otherBall.y - this.boardStartY) / this.gridSize);
            return otherGridX === gridX && otherGridY === gridY;
        });
    }

    // Get the node type at a specific grid position
    getNodeType(gridX, gridY) {
        if (!this.board || !this.board.nodes) return CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
        
        const nodes = this.board.nodes;
        if (gridY < 0 || gridY >= nodes.length) return CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
        
        const row = nodes[gridY];
        if (gridX < 0 || gridX >= row.length) return CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
        
        return row[gridX];
    }

    // Check if a ball can move to a specific node based on path types
    canBallMoveToNode(ballIndex, gridX, gridY) {
        const nodeType = this.getNodeType(gridX, gridY);
        
        // Empty nodes are not accessible
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY) return false;
        
        // Path for all balls ('0') can be used by any ball
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS) return true;
        
        // Ball-specific paths: ball 0 can use path '1', ball 1 can use path '2', etc.
        const ballPathType = (ballIndex + 1).toString();
        if (nodeType === ballPathType) return true;
        
        return false;
    }

    // Check if two adjacent nodes are connected via valid paths for a specific ball
    areNodesConnected(fromGridX, fromGridY, toGridX, toGridY, ballIndex) {
        // Only allow horizontal or vertical movement (no diagonal)
        const deltaX = Math.abs(toGridX - fromGridX);
        const deltaY = Math.abs(toGridY - fromGridY);
        
        if ((deltaX === 1 && deltaY === 0) || (deltaX === 0 && deltaY === 1)) {
            // Check if both nodes allow this ball to move on them
            return this.canBallMoveToNode(ballIndex, fromGridX, fromGridY) && 
                   this.canBallMoveToNode(ballIndex, toGridX, toGridY);
        }
        
        return false;
    }

    // Check if a ball can move from its current position to a target position
    isValidPathMove(ballIndex, targetGridX, targetGridY) {
        const ball = this.balls[ballIndex];
        if (!ball) return false;
        
        // Get current grid position
        const currentGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const currentGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // Check if target node allows this ball
        if (!this.canBallMoveToNode(ballIndex, targetGridX, targetGridY)) return false;
        
        // Check if nodes are connected (adjacent and both allow this ball)
        return this.areNodesConnected(currentGridX, currentGridY, targetGridX, targetGridY, ballIndex);
    }

    showTouchFeedback(ball) {
        // Initialize animation state for this ball
        const ballId = this.balls.indexOf(ball);
        this.touchAnimationState[ballId] = {
            isAnimating: true,
            startTime: Date.now(),
            duration: 150, // 150ms fade-in
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
                // Shrink back towards restScale from the goal inner radius scale
                const logical = this.getLogicalBallRadius();
                const targetScaleAtPeak = this.getGoalInnerRadius() / logical;
                state.scale = targetScaleAtPeak - (targetScaleAtPeak - this.restScale) * progress;
                
                if (progress >= 1.0) {
                    state.isAnimating = false;
                    this.balls[ballId].isTouched = false;
                    this.balls[ballId].touchOpacity = 0.0;
                                         this.balls[ballId].touchScale = this.restScale;
                }
            } else {
                // Fade in animation
                state.opacity = progress;
                // Scale so that at peak the visual ball radius equals goal inner radius
                const logical = this.getLogicalBallRadius();
                const targetScaleAtPeak = this.getGoalInnerRadius() / logical;
                state.scale = this.restScale + (targetScaleAtPeak - this.restScale) * progress;
                
                if (progress >= 1.0) {
                    state.opacity = 1.0;
                    state.scale = targetScaleAtPeak;
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
        
        // Use logical radius for bounds checks
        const logicalRadius = this.getLogicalBallRadius();
        
        // Snap to grid relative to board position
        const relativeX = x - this.boardStartX;
        const relativeY = y - this.boardStartY;
        const snappedRelativeX = Math.round(relativeX / this.gridSize) * this.gridSize;
        const snappedRelativeY = Math.round(relativeY / this.gridSize) * this.gridSize;
        
        // Convert back to absolute coordinates
        const snappedX = this.boardStartX + snappedRelativeX;
        const snappedY = this.boardStartY + snappedRelativeY;
        
        // Ensure the ball stays within board bounds (node-based, not radius-based)
        const clampedX = Math.max(
            this.boardStartX, 
            Math.min(snappedX, this.boardStartX + this.boardWidth)
        );
        const clampedY = Math.max(
            this.boardStartY, 
            Math.min(snappedY, this.boardStartY + this.boardHeight)
        );
        
        // Compute target grid cell
        const targetGridX = Math.round((clampedX - this.boardStartX) / this.gridSize);
        const targetGridY = Math.round((clampedY - this.boardStartY) / this.gridSize);
        
        // Check if this is a valid path-based move
        if (!this.isValidPathMove(this.selectedBallIndex, targetGridX, targetGridY)) {
            return; // Skip movement if not allowed by path rules
        }
        
        // Prevent two balls in the same node
        if (this.isNodeOccupied(targetGridX, targetGridY, this.selectedBallIndex)) {
            return; // Skip movement if target node is occupied
        }
        
        // Only update if position actually changed
        if (ball.x !== clampedX || ball.y !== clampedY) {
            ball.x = clampedX;
            ball.y = clampedY;
            this.render();
            // Don't check win condition during drag - only when released
        }
    }

    isValidMove(x, y, ballRadius = CONSTANTS.GAME_CONFIG.BALL_RADIUS) {
        // Check if position is within board bounds (node-based boundaries)
        return x >= this.boardStartX && 
               x <= this.boardStartX + this.boardWidth &&
               y >= this.boardStartY && 
               y <= this.boardStartY + this.boardHeight;
    }

    async loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.gameState.isPlaying = true;
        
        console.log('Loading level:', levelNumber);
        console.log('Canvas available:', !!this.canvas);
        
        try {
            // Load level data from JSON file
            const levelData = await this.storageManager.loadLevelData(levelNumber);
            
            if (levelData && levelData.board && levelData.board.nodes) {
                this.levelData = levelData;
                console.log('Level data loaded from file:', this.levelData);
            } else {
                console.error(`Failed to load level ${levelNumber} from file`);
                throw new Error(`Level ${levelNumber} not found or invalid`);
            }
            
            console.log('Board:', this.levelData.board);
            console.log('Balls:', this.levelData.balls);
            
            this.board = this.levelData.board;
            
            // Calculate board positioning first
            this.calculateBoardPosition();
            
            // Initialize balls array from level data
            this.initializeBalls();
            
            this.render();
        } catch (error) {
            console.error('Error loading level:', error);
            // Show error message to user
            alert(`Failed to load level ${levelNumber}. Please check that the level file exists.`);
        }
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
                    // radius kept for legacy but not used in rendering; dynamic radius derives from gridSize
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
                    x: this.boardStartX + (4 * this.gridSize),
                    y: this.boardStartY + (4 * this.gridSize)
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
        this.loadLevel(this.currentLevel).catch(error => {
            console.error('Failed to load next level:', error);
        });
    }

    resetLevel() {
        this.loadLevel(this.currentLevel).catch(error => {
            console.error('Failed to reset level:', error);
        });
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
        
        // Draw path lines first
        this.renderPathLines();
        
        // Draw board nodes on top of path lines
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
        
        // For node-oriented grid: we need spacing between nodes, not cell sizes
        // For N nodes, we need (N-1) spaces between them
        const gridSpacingX = boardCols > 1 ? availableWidth / (boardCols - 1) : availableWidth;
        const gridSpacingY = boardRows > 1 ? availableHeight / (boardRows - 1) : availableHeight;
        
        // Use the smaller spacing to ensure grid fits
        const gridSize = Math.min(gridSpacingX, gridSpacingY);
        
        // Calculate board position to center it
        // Board area spans from first node to last node
        const boardWidth = (boardCols - 1) * gridSize;
        const boardHeight = (boardRows - 1) * gridSize;
        const boardStartX = (this.displayWidth - boardWidth) / 2;
        const boardStartY = (this.displayHeight - boardHeight) / 2;
        
        // Store grid info for other methods to use
        this.gridSize = gridSize;
        this.boardStartX = boardStartX;
        this.boardStartY = boardStartY;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        
        console.log(`Board positioned: startX=${boardStartX}, startY=${boardStartY}, width=${boardWidth}, height=${boardHeight}, gridSize=${gridSize}`);
        console.log(`Node grid: ${boardCols}x${boardRows} nodes with ${gridSize}px spacing`);
    }

    renderGrid() {
        if (!this.board || !this.board.nodes) return;
        
        // Ensure board position is calculated
        this.calculateBoardPosition();
        
        const nodes = this.board.nodes;
        const boardRows = nodes.length;
        const boardCols = nodes[0] ? nodes[0].length : 0;
        
        if (boardRows === 0 || boardCols === 0) return;
        
        // Draw dots only at empty intersections (not at path nodes)
        this.ctx.fillStyle = '#222222'; // Even darker color for better visibility
        for (let row = 0; row < boardRows; row++) {
            for (let col = 0; col < boardCols; col++) {
                const nodeType = nodes[row][col];
                
                // Only draw grid dots at empty nodes
                if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY) {
                    const x = this.boardStartX + (col * this.gridSize);
                    const y = this.boardStartY + (row * this.gridSize);
                    // Make grid dots proportional to grid size, but smaller than path nodes
                    const gridDotRadius = Math.max(2, this.gridSize * 0.06); // Smaller than path nodes (0.12)
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, gridDotRadius, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            }
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
                    
                    // Render path nodes as circles
                    if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1 ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2) {
                        
                        const centerX = this.boardStartX + (col * this.gridSize);
                        const centerY = this.boardStartY + (row * this.gridSize);
                        // Make path nodes slightly larger than grid dots for better visibility
                        const nodeRadius = Math.max(5, this.gridSize * 0.08); // Larger than grid dots (4px)
                        
                        // Use same color as path lines
                        this.ctx.fillStyle = this.getPathColor(nodeType);
                        this.ctx.beginPath();
                        this.ctx.arc(centerX, centerY, nodeRadius, 0, 2 * Math.PI);
                        this.ctx.fill();
                    }
                    
                    // Legacy support: render '#' nodes as squares (if still used)
                    else if (nodeType === '#') {
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

    renderPathLines() {
        // Draw lines between connected path nodes
        if (!this.board || !this.board.nodes) return;
        
        const nodes = this.board.nodes;
        
        for (let row = 0; row < nodes.length; row++) {
            const rowString = nodes[row];
            for (let col = 0; col < rowString.length; col++) {
                const nodeType = rowString[col];
                
                // Only process path nodes
                if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2) {
                    
                    const centerX = this.boardStartX + (col * this.gridSize);
                    const centerY = this.boardStartY + (row * this.gridSize);
                    
                    // Check right neighbor (horizontal connection)
                    if (col + 1 < rowString.length) {
                        const rightNodeType = rowString[col + 1];
                        if (this.shouldDrawConnection(nodeType, rightNodeType)) {
                            const rightX = this.boardStartX + ((col + 1) * this.gridSize);
                            const rightY = centerY;
                            
                            const lineColor = this.getConnectionColor(nodeType, rightNodeType);
                            this.drawPathLine(centerX, centerY, rightX, rightY, lineColor);
                        }
                    }
                    
                    // Check bottom neighbor (vertical connection)
                    if (row + 1 < nodes.length) {
                        const bottomRowString = nodes[row + 1];
                        if (col < bottomRowString.length) {
                            const bottomNodeType = bottomRowString[col];
                            if (this.shouldDrawConnection(nodeType, bottomNodeType)) {
                                const bottomX = centerX;
                                const bottomY = this.boardStartY + ((row + 1) * this.gridSize);
                                
                                const lineColor = this.getConnectionColor(nodeType, bottomNodeType);
                                this.drawPathLine(centerX, centerY, bottomX, bottomY, lineColor);
                            }
                        }
                    }
                }
            }
        }
    }

    // Check if two node types should be connected with a line
    shouldDrawConnection(nodeType1, nodeType2) {
        // Both nodes must be path nodes (not empty)
        const pathTypes = [
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2
        ];
        
        if (!pathTypes.includes(nodeType1) || !pathTypes.includes(nodeType2)) {
            return false;
        }
        
        // Same path types are always connected
        if (nodeType1 === nodeType2) return true;
        
        // PATH_ALL_BALLS ('0') connects to any specific ball path
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS) {
            return true;
        }
        
        // Different specific ball paths don't connect
        return false;
    }

    // Get the color for a connection between two node types
    getConnectionColor(nodeType1, nodeType2) {
        // If one is PATH_ALL_BALLS, use the color of the specific ball path
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS) {
            return this.getPathColor(nodeType2);
        }
        if (nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS) {
            return this.getPathColor(nodeType1);
        }
        
        // Both are same specific type
        return this.getPathColor(nodeType1);
    }

    // Get the color for a specific path type
    getPathColor(nodeType) {
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS) {
            return '#BBBBBB'; // light gray for all-ball paths
        }
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1) {
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.red; // Red for ball 1
        }
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2) {
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.blue; // Blue for ball 2
        }
        return '#666666'; // Default gray
    }

    // Draw a line between two points with specified color
    drawPathLine(x1, y1, x2, y2, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = Math.max(3, this.gridSize * 0.08);
         // Proportional line width
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    renderBalls() {
        this.balls.forEach((ball, index) => {
            // Use ball color from ball data, fallback to white
            const colorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
            
            // Add touch feedback glow effect with animation
            if (ball.isTouched && ball.touchOpacity > 0) {
                				// Ensure halo matches the goal ring outer radius for consistency
				const haloRadius = this.getGoalOuterRadius();
				
				// Use globalAlpha for reliable alpha on all browsers
                this.ctx.save();
                this.ctx.globalAlpha = Math.min(1, Math.max(0, (ball.touchOpacity || 1.0) * 0.35));
                this.ctx.fillStyle = colorHex;
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, haloRadius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.restore();
            }
            
            // Draw the ball with subtle scale animation around restScale
            const ballRadius = this.getVisualBallRadius(ball);
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
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
            const innerRadius = this.getGoalInnerRadius();
            const outerRadius = this.getGoalOuterRadius();
            
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