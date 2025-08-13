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
        this.currentFace = 'front'; // Track which face is currently being shown ('front' or 'rear')
        this.balls = []; // Array of ball objects
        this.selectedBallIndex = -1; // Index of currently selected ball
        this.touchStartPos = null;
        this.touchOffset = null; // Touch offset for better mobile dragging
        this.touchStartTime = null; // Touch start time for gesture recognition
        this.isDragging = false;
        this.animationFrameId = null; // For smooth animations
        this.touchAnimationState = {}; // Track animation state for each ball
        this.ballAnimationId = null; // For ball movement animations
        this.restScale = CONSTANTS.RENDER_SIZE_CONFIG.BALL_REST_SCALE; // Resting visual scale for balls
        
        // Flip animation state
        this.isFlipping = false; // Track if flip animation is currently running
        this.flipWrapper = null; // Reference to the flip wrapper element
        this.flipAnimationTimeout = null; // Track animation timing
        
        this.gridSize = 40; // Grid cell size for snapping
        this.boardStartX = 0;
        this.boardStartY = 0;
        this.boardWidth = 0;
        this.boardHeight = 0;
        
        this.init();
    }

    // Get the current nodes array based on which face is being shown
    getCurrentNodes() {
        if (!this.board || !this.board.front) return null;
        
        if (this.currentFace === 'rear' && this.board.rear) {
            return this.board.rear;
        }
        return this.board.front;
    }

    // Determine which face a ball is currently on based on its position
    getBallCurrentFace(ball) {
        if (!this.board || !this.board.front) return 'front';
        
        // Convert ball position back to grid coordinates (for future use)
        const gridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const gridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // Currently determine face based on original coordinates
        // TODO: In the future, enhance this to detect actual current position
        // and allow balls to dynamically switch between faces during gameplay
        const isRearBall = ball.originalStart[0] < 0 || ball.originalStart[1] < 0;
        return isRearBall ? 'rear' : 'front';
    }

    // Determine which face a goal is on based on the ball's end coordinates
    getGoalCurrentFace(ball) {
        if (!this.board || !this.board.front) return 'front';
        
        const isRearGoal = ball.originalEnd[0] < 0 || ball.originalEnd[1] < 0;
        return isRearGoal ? 'rear' : 'front';
    }

    // Update the toggle button visibility based on whether the board has a rear face
    updateToggleButton() {
        console.log('updateToggleButton called', {
            hasBoard: !!this.board,
            hasRear: !!(this.board && this.board.rear),
            boardKeys: this.board ? Object.keys(this.board) : null
        });
        
        const gameFooter = document.querySelector('.game-footer');
        if (!gameFooter) {
            console.error('Game footer not found');
            return;
        }

        // Remove existing toggle button if present
        const existingButton = document.getElementById('faceToggleButton');
        if (existingButton) {
            existingButton.remove();
        }

        // Add toggle button if board has rear face
        if (this.board && this.board.rear) {
            console.log('Creating toggle button - board has rear face');
            const toggleButton = document.createElement('button');
            toggleButton.id = 'faceToggleButton';
            toggleButton.className = 'btn btn-outline-light face-toggle-btn';
            toggleButton.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
            toggleButton.title = 'Toggle board face';
            // Ensure visibility on mobile with clean styling
            toggleButton.style.border = 'none';
            toggleButton.style.zIndex = '9999';
            toggleButton.style.backgroundColor = 'transparent';
            toggleButton.style.color = 'white';
            toggleButton.style.display = 'flex !important';
            toggleButton.style.alignItems = 'center';
            toggleButton.style.justifyContent = 'center';
            toggleButton.style.position = 'relative';
            // Responsive sizing and positioning for mobile
            const isMobile = window.innerWidth <= 768;
            const buttonSize = isMobile ? '56px' : '44px';
            const fontSize = isMobile ? '32px' : '24px';
            
            // Position button one grid cell away from board
            let bottomOffset = '0';
            if (isMobile && this.gridSize) {
                // Distance = one grid cell + button size + some padding
                const gridGap = this.gridSize;
                const buttonRadius = parseInt(buttonSize) / 2;
                const padding = 10;
                bottomOffset = `${gridGap + buttonRadius + padding}px`;
            } else if (isMobile) {
                // Fallback if gridSize not available
                bottomOffset = '80px';
            }
            
            toggleButton.style.width = buttonSize;
            toggleButton.style.height = buttonSize;
            toggleButton.style.minWidth = buttonSize;
            toggleButton.style.minHeight = buttonSize;
            toggleButton.style.maxWidth = buttonSize;
            toggleButton.style.maxHeight = buttonSize;
            toggleButton.style.flexShrink = '0';
            toggleButton.style.borderRadius = '50%';
            toggleButton.style.fontSize = fontSize;
            toggleButton.style.lineHeight = '1';
            toggleButton.style.padding = '0';
            toggleButton.style.margin = '0';
            toggleButton.style.boxSizing = 'border-box';
            toggleButton.style.touchAction = 'manipulation'; // Better mobile touch
            toggleButton.style.webkitTapHighlightColor = 'transparent';
            // Fallback text if icon doesn't load
            toggleButton.setAttribute('aria-label', 'Toggle board face');
            toggleButton.onclick = () => this.toggleBoardFace();
            
            // Insert button and position closer to board on mobile
            
            gameFooter.style.justifyContent = 'center';
            gameFooter.style.display = 'flex !important';
            gameFooter.style.alignItems = 'center';
            gameFooter.style.position = 'fixed';
            gameFooter.style.bottom = bottomOffset;
            gameFooter.style.left = '0';
            gameFooter.style.right = '0';
            gameFooter.style.zIndex = '9998';
            gameFooter.style.minHeight = isMobile ? '80px' : '60px';
            gameFooter.style.height = 'auto';
            gameFooter.style.padding = '5px';
            gameFooter.style.background = 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)';
            gameFooter.style.border = 'none';
            gameFooter.appendChild(toggleButton);
        } else {
            // Reset footer alignment when no toggle button
            gameFooter.style.justifyContent = 'flex-end';
        }
    }

    // Toggle between front and rear board faces with animation
    toggleBoardFace() {
        console.log('toggleBoardFace called', {
            hasBoard: !!this.board,
            hasRear: !!(this.board && this.board.rear),
            isFlipping: this.isFlipping,
            hasFlipWrapper: !!this.flipWrapper,
            currentFace: this.currentFace
        });
        
        if (!this.board || !this.board.rear || this.isFlipping) {
            console.log('toggleBoardFace early return - board/rear/flipping check failed');
            return;
        }
        
        // Ensure flip wrapper is initialized
        if (!this.ensureFlipWrapper()) {
            console.log('toggleBoardFace early return - flip wrapper not available');
            return;
        }
        
        // Start flip animation
        this.isFlipping = true;
        const targetFace = this.currentFace === 'front' ? 'rear' : 'front';
        
        console.log('Starting flip animation to:', targetFace);
        
        // Add flipping class to disable interactions and show overlay
        this.flipWrapper.classList.add('flipping');
        
        // Apply CSS animation class based on target face
        if (targetFace === 'rear') {
            this.flipWrapper.classList.remove('flip-to-front');
            this.flipWrapper.classList.add('flip-to-rear');
        } else {
            this.flipWrapper.classList.remove('flip-to-rear');
            this.flipWrapper.classList.add('flip-to-front');
        }
        
        console.log('Applied CSS classes:', this.flipWrapper.className);
        
        // Schedule face content switch at the very end (99% of animation)
        const contentSwitchDelay = CONSTANTS.ANIMATION_CONFIG.FLIP_DURATION * CONSTANTS.ANIMATION_CONFIG.FLIP_HALFWAY_THRESHOLD;
        console.log('Content switch timing:', {
            duration: CONSTANTS.ANIMATION_CONFIG.FLIP_DURATION,
            threshold: CONSTANTS.ANIMATION_CONFIG.FLIP_HALFWAY_THRESHOLD,
            delay: contentSwitchDelay
        });
        
        setTimeout(() => {
            this.currentFace = targetFace;
            this.render(); // Re-render with new face content
            console.log('Switched face content to:', targetFace);
            
            // Keep the rotation going to 180 degrees for smooth easing
            console.log('Content switched, continuing rotation to 180° for smooth easing');
        }, contentSwitchDelay);
        
        // Clear any existing animation timeout
        if (this.flipAnimationTimeout) {
            clearTimeout(this.flipAnimationTimeout);
        }
        
        // Schedule animation completion
        this.flipAnimationTimeout = setTimeout(() => {
            this.isFlipping = false;
            this.flipWrapper.classList.remove('flipping');
            this.flipAnimationTimeout = null;
            console.log('Flip animation completed');
        }, CONSTANTS.ANIMATION_CONFIG.FLIP_DURATION);
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
        
        // Initialize flip wrapper reference - retry if not available
        this.flipWrapper = document.getElementById('gameFlipWrapper');
        console.log('Flip wrapper found:', !!this.flipWrapper);
        if (!this.flipWrapper) {
            console.error('Flip wrapper not found - will retry later');
            // Retry after a short delay
            setTimeout(() => {
                this.flipWrapper = document.getElementById('gameFlipWrapper');
                if (this.flipWrapper) {
                    console.log('Flip wrapper found on retry');
                    this.initializeFlipAnimation();
                } else {
                    console.error('Flip wrapper still not found after retry');
                }
            }, 100);
        } else {
            // Initialize flip animation CSS properties
            this.initializeFlipAnimation();
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
        
        // Use larger touch target for mobile (minimum 44px as per accessibility guidelines)
        const touchTargetSize = Math.max(CONSTANTS.TOUCH_CONFIG.MIN_TOUCH_SIZE, CONSTANTS.GAME_CONFIG.BALL_RADIUS * 3);
        
        // Check if touch is near any ball - find the closest one within touch range
        let closestBallIndex = -1;
        let closestDistance = Infinity;
        
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            
            // Only consider balls on the current face
            if (this.getBallCurrentFace(ball) !== this.currentFace) continue;
            
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
        
        // Move ball with animated snapping during dragging
        this.moveBallToPosition(targetX, targetY, true);
    }

    handleTouchEnd(e) {
        if (this.isDragging && this.selectedBallIndex !== -1) {
            // Hide touch feedback with fade out
            this.hideTouchFeedback();
            
            // Perform final animated snap to ensure ball is properly positioned
            const ball = this.balls[this.selectedBallIndex];
            this.moveBallToPosition(ball.x, ball.y, true);
            
            // Check win condition when drag is released (after a small delay for animation)
            setTimeout(() => {
                this.checkWinCondition();
            }, 50); // Small delay to let animation start
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
        if (this.ballAnimationId) {
            cancelAnimationFrame(this.ballAnimationId);
            this.ballAnimationId = null;
        }
        
        // Clean up flip animation
        if (this.flipAnimationTimeout) {
            clearTimeout(this.flipAnimationTimeout);
            this.flipAnimationTimeout = null;
        }
        if (this.flipWrapper) {
            this.flipWrapper.classList.remove('flipping', 'flip-to-rear', 'flip-to-front');
        }
        this.isFlipping = false;
        
        this.touchAnimationState = {};
    }

    // Start ball animation to target position
    animateBallToPosition(ballIndex, targetX, targetY, isDragging = false) {
        if (ballIndex < 0 || ballIndex >= this.balls.length) return;
        
        const ball = this.balls[ballIndex];
        const animation = ball.animation;
        
        // If already animating to the same target, don't restart
        if (animation.isAnimating && 
            Math.abs(animation.targetX - targetX) < 1 && 
            Math.abs(animation.targetY - targetY) < 1) {
            return;
        }
        
        // Set up animation properties
        animation.isAnimating = true;
        animation.startX = ball.x;
        animation.startY = ball.y;
        animation.targetX = targetX;
        animation.targetY = targetY;
        animation.startTime = performance.now();
        animation.duration = isDragging ? 
            CONSTANTS.ANIMATION_CONFIG.BALL_DRAG_DURATION : 
            CONSTANTS.ANIMATION_CONFIG.BALL_EASE_DURATION;
        animation.easing = isDragging ? 'EASE_OUT_QUICK' : 'EASE_OUT';
        
        // Start the animation loop if not already running
        if (!this.ballAnimationId) {
            this.ballAnimationLoop();
        }
    }

    // Animation loop for ball movements
    ballAnimationLoop() {
        const currentTime = performance.now();
        let anyAnimating = false;

        // Update all animating balls
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            const animation = ball.animation;
            
            if (animation.isAnimating) {
                const elapsed = currentTime - animation.startTime;
                const progress = Math.min(elapsed / animation.duration, 1);
                
                // Apply easing function
                const easingFunc = CONSTANTS.ANIMATION_CONFIG.EASING[animation.easing] || CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT;
                const easedProgress = easingFunc(progress);
                
                // Interpolate position
                ball.x = animation.startX + (animation.targetX - animation.startX) * easedProgress;
                ball.y = animation.startY + (animation.targetY - animation.startY) * easedProgress;
                
                // Check if animation is complete
                if (progress >= 1) {
                    ball.x = animation.targetX;
                    ball.y = animation.targetY;
                    animation.isAnimating = false;
                } else {
                    anyAnimating = true;
                }
            }
        }

        // Continue animation loop if any balls are still animating
        if (anyAnimating) {
            this.render(); // Re-render with updated positions
            this.ballAnimationId = requestAnimationFrame(() => this.ballAnimationLoop());
        } else {
            this.ballAnimationId = null;
        }
    }

    // Radius helpers to keep balls and graphics proportional to the board
    getLogicalBallRadius() {
        // Base logical radius used for bounds and goals (independent of touch animation)
        return this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.BALL_RADIUS_RATIO;
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
        return base + Math.max(CONSTANTS.RENDER_SIZE_CONFIG.GOAL_INNER_MIN_OFFSET, this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.GOAL_INNER_RATIO);
    }

    getGoalOuterRadius() {
        const base = this.getLogicalBallRadius();
        return base + Math.max(CONSTANTS.RENDER_SIZE_CONFIG.GOAL_OUTER_MIN_OFFSET, this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.GOAL_OUTER_RATIO);
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
        if (!this.board || !this.board.front) return CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
        
        const nodes = this.getCurrentNodes();
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

    moveBallToPosition(x, y, animate = false) {
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
            if (animate) {
                // Use smooth animation for snapping
                const isDragging = this.isDragging;
                this.animateBallToPosition(this.selectedBallIndex, clampedX, clampedY, isDragging);
            } else {
                // Immediate update during dragging
                ball.x = clampedX;
                ball.y = clampedY;
                this.render();
            }
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
        
        try {
            // Load level data from JSON file
            const levelData = await this.storageManager.loadLevelData(levelNumber);
            
            if (levelData && levelData.board && levelData.board.front) {
                this.levelData = levelData;
            } else {
                console.error(`Failed to load level ${levelNumber} from file`);
                throw new Error(`Level ${levelNumber} not found or invalid`);
            }
            
            this.board = this.levelData.board;
            
            // Add toggle button if board has rear face
            this.updateToggleButton();
            
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
        this.balls = [];
        
        if (this.levelData.balls && this.levelData.balls.length > 0) {
            this.levelData.balls.forEach((ballData, index) => {
                
                // Handle coordinate system: positive = front, negative = rear
                const startX = Math.abs(ballData.start[0]);
                const startY = Math.abs(ballData.start[1]);
                const endX = Math.abs(ballData.end[0]);
                const endY = Math.abs(ballData.end[1]);
                
                const ball = {
                    x: this.boardStartX + (startX * this.gridSize),
                    y: this.boardStartY + (startY * this.gridSize),
                    // radius kept for legacy but not used in rendering; dynamic radius derives from gridSize
                    radius: CONSTANTS.GAME_CONFIG.BALL_RADIUS,
                    color: ballData.color || 'white',
                    isTouched: false, // Touch feedback state
                    touchOpacity: 0.0, // Animation opacity
                    touchScale: this.restScale, // Animation scale
                    // Store original coordinates for reference
                    originalStart: ballData.start,
                    originalEnd: ballData.end,
                    endPosition: {
                        x: this.boardStartX + (endX * this.gridSize),
                        y: this.boardStartY + (endY * this.gridSize)
                    },
                    // Animation properties for smooth movement
                    animation: {
                        isAnimating: false,
                        startX: 0,
                        startY: 0,
                        targetX: 0,
                        targetY: 0,
                        startTime: 0,
                        duration: CONSTANTS.ANIMATION_CONFIG.BALL_EASE_DURATION,
                        easing: 'EASE_OUT'
                    }
                };
                
                this.balls.push(ball);
            });
        } else {
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
        if (this.board && this.board.front) {
            // Implementation for board rotation
            this.render();
        }
    }

    flipBoard() {
        // Flip the game board
        if (this.board && this.board.front) {
            // Implementation for board flip
            this.render();
        }
    }

    // Initialize CSS custom properties for flip animation
    initializeFlipAnimation() {
        if (!this.flipWrapper) return;
        
        console.log('Flip wrapper initialized for animation');
        
        // The CSS animation is now handled directly in the stylesheet
        // No need to set custom properties
    }

    // Ensure flip wrapper is initialized
    ensureFlipWrapper() {
        if (!this.flipWrapper) {
            this.flipWrapper = document.getElementById('gameFlipWrapper');
            if (this.flipWrapper) {
                this.initializeFlipAnimation();
            }
        }
        return !!this.flipWrapper;
    }

    // Test method for debugging flip animation
    testFlipAnimation() {
        console.log('Testing flip animation...');
        if (!this.ensureFlipWrapper()) {
            console.error('Flip wrapper not available for test');
            return;
        }
        
        console.log('Flip wrapper found, testing animation...');
        this.flipWrapper.classList.add('flipping');
        this.flipWrapper.classList.add('flip-to-rear');
        
        // Test animation without switching content
        setTimeout(() => {
            this.flipWrapper.classList.remove('flip-to-rear');
            this.flipWrapper.classList.add('flip-to-front');
            console.log('Animation halfway - switched to front rotation');
        }, 400);
        
        setTimeout(() => {
            this.flipWrapper.classList.remove('flip-to-front');
            this.flipWrapper.classList.remove('flipping');
            console.log('Test animation completed');
        }, 800);
    }

    // Test pure rotation without content switching
    testPureRotation() {
        console.log('Testing pure rotation without content switching...');
        if (!this.ensureFlipWrapper()) {
            console.error('Flip wrapper not available for rotation test');
            return;
        }
        
        console.log('Starting pure rotation test...');
        // Use a single continuous rotation to 180 degrees
        this.flipWrapper.classList.add('flip-to-rear');
        
        // Let it complete the full rotation to 180 degrees
        setTimeout(() => {
            console.log('Rotation should be complete at 180 degrees');
            console.log('Current transform:', this.flipWrapper.style.transform);
            console.log('Current classes:', this.flipWrapper.className);
            // Don't remove the class - keep it at 180 degrees
            // this.flipWrapper.classList.remove('flip-to-rear');
            console.log('Keeping rotation at 180 degrees');
        }, 6000);
    }

    // Test flip animation without content switching
    testFlipWithoutContentSwitch() {
        console.log('Testing flip animation without content switching...');
        if (!this.ensureFlipWrapper()) {
            console.error('Flip wrapper not available for flip test');
            return;
        }
        
        console.log('Starting flip animation test...');
        this.isFlipping = true;
        
        // Add flipping class to show overlay
        this.flipWrapper.classList.add('flipping');
        this.flipWrapper.classList.add('flip-to-rear');
        
        // Don't switch content - just let it rotate
        setTimeout(() => {
            this.isFlipping = false;
            this.flipWrapper.classList.remove('flipping');
            console.log('Flip animation completed without content switch');
        }, 6000);
    }

    // Simple CSS test to verify CSS is working
    testCSSChanges() {
        console.log('Testing CSS changes...');
        if (!this.ensureFlipWrapper()) {
            console.error('Flip wrapper not available for CSS test');
            return;
        }
        
        // Test by changing canvas opacity to make wrapper visible
        if (this.canvas) {
            this.canvas.style.opacity = '0.3';
            console.log('Set canvas opacity to 0.3');
        }
        
        // Test with a very visible border and background
        this.flipWrapper.style.backgroundColor = 'red';
        this.flipWrapper.style.border = '10px solid yellow';
        this.flipWrapper.style.zIndex = '10000';
        this.flipWrapper.style.position = 'absolute';
        this.flipWrapper.style.top = '0';
        this.flipWrapper.style.left = '0';
        this.flipWrapper.style.width = '100%';
        this.flipWrapper.style.height = '100%';
        console.log('Set wrapper with red background, yellow border, and high z-index');
        
        setTimeout(() => {
            this.flipWrapper.style.backgroundColor = 'blue';
            this.flipWrapper.style.border = '10px solid green';
            console.log('Set wrapper with blue background and green border');
        }, 1000);
        
        setTimeout(() => {
            this.flipWrapper.style.backgroundColor = '';
            this.flipWrapper.style.border = '';
            this.flipWrapper.style.zIndex = '';
            this.flipWrapper.style.position = '';
            this.flipWrapper.style.top = '';
            this.flipWrapper.style.left = '';
            this.flipWrapper.style.width = '';
            this.flipWrapper.style.height = '';
            if (this.canvas) {
                this.canvas.style.opacity = '';
            }
            console.log('Reset all styles');
        }, 2000);
    }

    render() {
        if (!this.ctx) return;
        
        // Clear canvas using display dimensions (since context is scaled)
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        
        // Draw background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        
        // Apply horizontal reflection for rear face
        if (this.currentFace === 'rear') {
            this.ctx.save();
            // Scale horizontally by -1 to flip the image
            this.ctx.scale(-1, 1);
            // Translate to compensate for the flip
            this.ctx.translate(-this.displayWidth, 0);
        }
        
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
        
        // Restore context if we applied reflection
        if (this.currentFace === 'rear') {
            this.ctx.restore();
        }
    }

    calculateBoardPosition() {
        if (!this.canvas || !this.board || !this.board.front) return;
        
        const nodes = this.getCurrentNodes();
        if (!nodes) return;
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
    }

    renderGrid() {
        if (!this.board || !this.board.front) return;
        
        // Ensure board position is calculated
        this.calculateBoardPosition();
        
        const nodes = this.getCurrentNodes();
        if (!nodes) return;
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
                    const gridDotRadius = Math.max(CONSTANTS.RENDER_SIZE_CONFIG.GRID_DOT_MIN_SIZE, this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.GRID_DOT_RATIO);
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
        if (this.board && this.board.front) {
            const nodes = this.getCurrentNodes();
            if (!nodes) return;
            
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
                        const nodeRadius = Math.max(CONSTANTS.RENDER_SIZE_CONFIG.PATH_NODE_MIN_SIZE, this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.PATH_NODE_RATIO);
                        
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
        if (!this.board || !this.board.front) return;
        
        const nodes = this.getCurrentNodes();
        if (!nodes) return;
        
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
        this.ctx.lineWidth = Math.max(CONSTANTS.RENDER_SIZE_CONFIG.PATH_LINE_MIN_WIDTH, this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.PATH_LINE_RATIO);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    renderBalls() {
        this.balls.forEach((ball, index) => {
            // Only render balls that belong to the current face
            if (this.getBallCurrentFace(ball) !== this.currentFace) return;
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
            // Only render goals for balls that belong to the current face
            if (this.getGoalCurrentFace(ball) !== this.currentFace) return;
            const endX = ball.endPosition.x;
            const endY = ball.endPosition.y;
            
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