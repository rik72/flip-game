/**
 * GameManager - Gestione logica di gioco per Flipgame
 * Responsabile per: livelli, touch interactions, meccaniche puzzle
 * 
 * @class GameManager
 * @description Manages the core game logic including level loading, ball movement,
 * touch interactions, and win condition checking for the Flipgame puzzle game.
 */
class GameManager {
    /**
     * Creates a new GameManager instance
     * @param {StorageManager} storageManager - The storage manager for saving/loading game state
     * @param {number} currentLevel - The starting level number (default: 1)
     * @param {App|null} appReference - Reference to the main App instance for synchronization
     */
    constructor(storageManager, currentLevel = 1, appReference = null) {
        this.storageManager = storageManager;
        this.currentLevel = currentLevel;
        this.appReference = appReference; // Reference to App instance for synchronization
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
        
        // New properties for improved ball drag/snap behavior
        this.ballOriginNode = null; // Store the origin node when ball is picked up
        this.currentUsablePath = null; // Store the current usable path being followed
        this.pathProjectionPoint = null; // Store the projected point on the current path
        this.isBlockedByOccupiedNode = false; // Track if ball is blocked by an occupied node
        
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
        
        // Return the ball's current face (tracked during gameplay)
        return ball.currentFace || 'front';
    }

    // Determine which face a goal is on based on the ball's end coordinates
    getGoalCurrentFace(ball) {
        if (!this.board || !this.board.front) return 'front';
        
        const isRearGoal = ball.originalEnd[0] < 0 || ball.originalEnd[1] < 0;
        return isRearGoal ? 'rear' : 'front';
    }

    // Update the toggle button visibility based on whether the board has a rear face
    updateToggleButton() {
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
            
            // Position button one full grid cell below the board
            let bottomOffset = '0';
            if (this.gridSize && this.boardStartY !== undefined && this.boardHeight !== undefined) {
                // Calculate position: board bottom + one grid cell + button radius
                const boardBottom = this.boardStartY + this.boardHeight;
                const gridCellBelow = boardBottom + this.gridSize;
                const buttonRadius = parseInt(buttonSize) / 2;
                const buttonCenterY = gridCellBelow + buttonRadius;
                
                // Convert to bottom offset from screen bottom
                const screenBottom = this.displayHeight || window.innerHeight;
                bottomOffset = `${screenBottom - buttonCenterY}px`;
            } else if (isMobile) {
                // Fallback if board positioning not available
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
        if (!this.board || !this.board.rear || this.isFlipping) {
            return;
        }
        
        // Ensure flip wrapper is initialized
        if (!this.ensureFlipWrapper()) {
            return;
        }
        
        // Start flip animation
        this.isFlipping = true;
        const targetFace = this.currentFace === 'front' ? 'rear' : 'front';
        
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
        
        // Schedule face content switch at the very end (99% of animation)
        const contentSwitchDelay = CONSTANTS.ANIMATION_CONFIG.FLIP_DURATION * CONSTANTS.ANIMATION_CONFIG.FLIP_HALFWAY_THRESHOLD;
        
        setTimeout(() => {
            this.currentFace = targetFace;
            this.render(); // Re-render with new face content
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

            // Check win condition after transfer animation is complete, but only if level is not already completed
            if (!this.storageManager.isLevelCompleted(this.currentLevel)) {
                this.checkWinCondition();
            }
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
        if (!this.flipWrapper) {
            console.error('Flip wrapper not found - will retry later');
            // Retry after a short delay
            setTimeout(() => {
                this.flipWrapper = document.getElementById('gameFlipWrapper');
                if (this.flipWrapper) {
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
        
        // Update level number display in DOM
        this.updateLevelNumberDisplay();
        
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
        
        // Recalculate board position and update toggle button after resize
        if (this.board) {
            this.calculateBoardPosition();
            this.updateToggleButton();
        }
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
        
        // Use grid-scaled touch target (minimum 100% of grid size for accessibility)
        const touchTargetSize = Math.max(this.gridSize * CONSTANTS.TOUCH_CONFIG.MIN_TOUCH_SIZE_RATIO, CONSTANTS.GAME_CONFIG.BALL_RADIUS * 3);
        
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
            
            // Store the origin node when ball is picked up
            const originGridX = Math.round((selectedBall.x - this.boardStartX) / this.gridSize);
            const originGridY = Math.round((selectedBall.y - this.boardStartY) / this.gridSize);
            this.ballOriginNode = { x: originGridX, y: originGridY };
            
            // Reset path tracking
            this.currentUsablePath = null;
            this.pathProjectionPoint = null;
            
            // Add visual feedback for touch
            this.showTouchFeedback(selectedBall);
        }
    }

    handleTouchMove(e) {
        if (!this.isDragging || this.selectedBallIndex === -1 || !this.ballOriginNode) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate touch position using CSS coordinates (not scaled by device pixel ratio)
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        const ball = this.balls[this.selectedBallIndex];
        if (!ball) return;
        
        // Convert origin node to absolute coordinates
        const originX = this.boardStartX + this.ballOriginNode.x * this.gridSize;
        const originY = this.boardStartY + this.ballOriginNode.y * this.gridSize;
        
        // Calculate distance from touch to origin node
        const distanceFromOrigin = Math.sqrt(
            Math.pow(touchX - originX, 2) + Math.pow(touchY - originY, 2)
        );
        
        // Check if touch is too far from the ball - if so, release the ball
        const distanceFromBall = Math.sqrt(
            Math.pow(touchX - ball.x, 2) + Math.pow(touchY - ball.y, 2)
        );
        
        if (distanceFromBall > this.gridSize * CONSTANTS.TOUCH_CONFIG.MAX_TOUCH_DISTANCE_RATIO) {
            // Release the ball - simulate touch end
            this.handleTouchEnd(e);
            return;
        }
        
        const threshold = this.gridSize / 4; // gridBoxSize / 4
        
        // Step 2: As long as touch distance from origin node is <= gridBoxSize / 4, stay there
        if (distanceFromOrigin <= threshold) {
            // Ball stays at origin node
            this.moveBallToPosition(originX, originY, true);
            this.currentUsablePath = null;
            this.pathProjectionPoint = null;

            return;
        }
        
        // Step 3: As soon as touch distance from origin node is > gridBoxSize / 4, 
        // find closest usable path and project touch position onto it
        // BUT don't find new paths if the ball is blocked by an occupied node
        if (!this.currentUsablePath && !this.isBlockedByOccupiedNode) {
            // Find the closest usable path within gridBoxSize distance
            this.currentUsablePath = this.findClosestUsablePath(touchX, touchY, this.selectedBallIndex);
        }
        
        if (this.currentUsablePath) {
            // Project touch position onto the current usable path
            this.pathProjectionPoint = this.projectTouchOnPath(touchX, touchY, this.currentUsablePath);
            
            if (this.pathProjectionPoint) {
                // Determine the correct destination node based on current ball position
                const currentBallGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
                const currentBallGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
                
                let destNode;
                if (currentBallGridX === this.currentUsablePath.start.x && currentBallGridY === this.currentUsablePath.start.y) {
                    // Ball is at start node, destination is end node
                    // Check if end node is occupied
                    if (this.isNodeOccupied(this.currentUsablePath.end.x, this.currentUsablePath.end.y, this.selectedBallIndex)) {
                        // End node is occupied, no valid destination
                        destNode = null;
                    } else {
                        destNode = this.currentUsablePath.end;
                    }
                } else if (currentBallGridX === this.currentUsablePath.end.x && currentBallGridY === this.currentUsablePath.end.y) {
                    // Ball is at end node, determine which direction the touch is going
                    const startDist = Math.sqrt(
                        Math.pow(touchX - (this.boardStartX + this.currentUsablePath.start.x * this.gridSize), 2) +
                        Math.pow(touchY - (this.boardStartY + this.currentUsablePath.start.y * this.gridSize), 2)
                    );
                    const endDist = Math.sqrt(
                        Math.pow(touchX - (this.boardStartX + this.currentUsablePath.end.x * this.gridSize), 2) +
                        Math.pow(touchY - (this.boardStartY + this.currentUsablePath.end.y * this.gridSize), 2)
                    );
                    
                    // Check which direction is unoccupied
                    const startOccupied = this.isNodeOccupied(this.currentUsablePath.start.x, this.currentUsablePath.start.y, this.selectedBallIndex);
                    const endOccupied = this.isNodeOccupied(this.currentUsablePath.end.x, this.currentUsablePath.end.y, this.selectedBallIndex);
                    
                    if (startDist < endDist && !startOccupied) {
                        destNode = this.currentUsablePath.start;
                    } else if (!endOccupied) {
                        destNode = this.currentUsablePath.end;
                    } else {
                        // Both directions are occupied
                        destNode = null;
                    }
                } else {
                    // Ball is somewhere in between, determine which end is closer to touch
                    const startDist = Math.sqrt(
                        Math.pow(touchX - (this.boardStartX + this.currentUsablePath.start.x * this.gridSize), 2) +
                        Math.pow(touchY - (this.boardStartY + this.currentUsablePath.start.y * this.gridSize), 2)
                    );
                    const endDist = Math.sqrt(
                        Math.pow(touchX - (this.boardStartX + this.currentUsablePath.end.x * this.gridSize), 2) +
                        Math.pow(touchY - (this.boardStartY + this.currentUsablePath.end.y * this.gridSize), 2)
                    );
                    
                    // Check which direction is unoccupied
                    const startOccupied = this.isNodeOccupied(this.currentUsablePath.start.x, this.currentUsablePath.start.y, this.selectedBallIndex);
                    const endOccupied = this.isNodeOccupied(this.currentUsablePath.end.x, this.currentUsablePath.end.y, this.selectedBallIndex);
                    
                    if (startDist < endDist && !startOccupied) {
                        destNode = this.currentUsablePath.start;
                    } else if (!endOccupied) {
                        destNode = this.currentUsablePath.end;
                    } else {
                        // Both directions are occupied
                        destNode = null;
                    }
                }
                
                // Check if we have a valid destination node
                if (!destNode) {
                    // Both directions are occupied, stay at current projected position
                    this.moveBallToPosition(this.pathProjectionPoint.x, this.pathProjectionPoint.y, true);
                    this.isBlockedByOccupiedNode = true; // Mark as blocked
                } else {
                    // Convert destination node to absolute coordinates
                    const destX = this.boardStartX + destNode.x * this.gridSize;
                    const destY = this.boardStartY + destNode.y * this.gridSize;
                    
                    // Calculate distance from projected point to destination node
                    const distanceToDest = Math.sqrt(
                        Math.pow(this.pathProjectionPoint.x - destX, 2) + 
                        Math.pow(this.pathProjectionPoint.y - destY, 2)
                    );
                
                // Step 4: As soon as touch distance from destination node is < gridBoxSize / 4, snap to new node
                if (distanceToDest < threshold) {
                    // Check if destination node is occupied before snapping
                    if (this.isNodeOccupied(destNode.x, destNode.y, this.selectedBallIndex)) {
                        // Destination is occupied, stay at current projected position
                        this.moveBallToPosition(this.pathProjectionPoint.x, this.pathProjectionPoint.y, true);
                        this.isBlockedByOccupiedNode = true; // Mark as blocked
                    } else {
                        // Snap to destination node
                        this.moveBallToPosition(destX, destY, true);
                        
                        // Update origin node to the new destination
                        this.ballOriginNode = { 
                            x: destNode.x, 
                            y: destNode.y 
                        };
                        
                        // Reset path tracking for next movement
                        this.currentUsablePath = null;
                        this.pathProjectionPoint = null;
                        this.isBlockedByOccupiedNode = false; // Clear blocked flag
                        
                        // Ball snapped to destination node
                    }
                } else {
                    // Move ball to projected position on path
                    this.moveBallToPosition(this.pathProjectionPoint.x, this.pathProjectionPoint.y, true);
                }
                }
                
                // If ball is at a node and touch is moving away from the current path, reset path to find a new one
                // BUT only if the ball is not blocked by an occupied node
                if (this.currentUsablePath && !this.isBlockedByOccupiedNode &&
                    ((currentBallGridX === this.currentUsablePath.start.x && currentBallGridY === this.currentUsablePath.start.y) ||
                     (currentBallGridX === this.currentUsablePath.end.x && currentBallGridY === this.currentUsablePath.end.y))) {
                    
                    const pathStartX = this.boardStartX + this.currentUsablePath.start.x * this.gridSize;
                    const pathStartY = this.boardStartY + this.currentUsablePath.start.y * this.gridSize;
                    const pathEndX = this.boardStartX + this.currentUsablePath.end.x * this.gridSize;
                    const pathEndY = this.boardStartY + this.currentUsablePath.end.y * this.gridSize;
                    
                    const distToPathStart = Math.sqrt(Math.pow(touchX - pathStartX, 2) + Math.pow(touchY - pathStartY, 2));
                    const distToPathEnd = Math.sqrt(Math.pow(touchX - pathEndX, 2) + Math.pow(touchY - pathEndY, 2));
                    
                    // If touch is far from both ends of the current path, look for a new path
                    if (distToPathStart > this.gridSize && distToPathEnd > this.gridSize) {
                        this.currentUsablePath = null;
                        this.pathProjectionPoint = null;
                    }
                }
            }
        } else {
            // No usable path found, stay at origin
            this.moveBallToPosition(originX, originY, true);
        }
    }

    handleTouchEnd(e) {
        if (this.isDragging && this.selectedBallIndex !== -1) {
            // Hide touch feedback with fade out
            this.hideTouchFeedback();
            
            // Get the final position where the ball was dropped
            const ball = this.balls[this.selectedBallIndex];
            
            // First, handle snapping to closest node if needed
            let finalSnapX = ball.x;
            let finalSnapY = ball.y;
            
            // Check if ball is at an exact grid position (on a node)
            const isOnNode = (ball.x - this.boardStartX) % this.gridSize === 0 && 
                            (ball.y - this.boardStartY) % this.gridSize === 0;
            
            if (!isOnNode) {
                // Ball is mid-course, snap to closest accessible node
                const closestNode = this.findClosestAccessibleNode(this.selectedBallIndex, ball.x, ball.y);
                if (closestNode) {
                    finalSnapX = this.boardStartX + closestNode.x * this.gridSize;
                    finalSnapY = this.boardStartY + closestNode.y * this.gridSize;
                }
            }
            
            // Now check if the snapped position is on a WELL node
            const snappedGridX = Math.round((finalSnapX - this.boardStartX) / this.gridSize);
            const snappedGridY = Math.round((finalSnapY - this.boardStartY) / this.gridSize);
            const nodeType = this.getNodeType(snappedGridX, snappedGridY);
            
            if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
                // Check if the well destination is occupied on the other face
                if (this.isWellDestinationOccupied(snappedGridX, snappedGridY, this.selectedBallIndex)) {
                    // Destination is occupied, show blocked transfer animation
                    console.log('Well transfer blocked: destination is occupied on the other face');
                    this.moveBallToPosition(finalSnapX, finalSnapY, true);
                    // Start blocked well animation after a small delay
                    setTimeout(() => {
                        this.startBlockedWellAnimation(ball, snappedGridX, snappedGridY);
                    }, 100);
                } else {
                    // Destination is free, proceed with well transfer
                    this.moveBallToPosition(finalSnapX, finalSnapY, true);
                    // Start well animation after a small delay to let the snap complete
                    setTimeout(() => {
                        this.startWellAnimation(ball, snappedGridX, snappedGridY);
                    }, 100); // Small delay to let snap animation complete
                }
            } else {
                // Snap to final position (not a well)
                this.moveBallToPosition(finalSnapX, finalSnapY, true);
                
                // Check win condition when drag is released (after a small delay for animation), but only if level is not already completed
                setTimeout(() => {
                    if (!this.storageManager.isLevelCompleted(this.currentLevel)) {
                        this.checkWinCondition();
                    }
                }, 50); // Small delay to let animation start
            }
        }
        
        this.touchStartPos = null;
        this.touchOffset = null;
        this.touchStartTime = null;
        this.isDragging = false;
        this.selectedBallIndex = -1; // Reset selected ball
        
        // Reset ball drag/snap tracking properties
        this.ballOriginNode = null;
        this.currentUsablePath = null;
        this.pathProjectionPoint = null;
        this.isBlockedByOccupiedNode = false;
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

    // Check if a grid node is already occupied by another ball on the same face
    isNodeOccupied(gridX, gridY, ignoreBallIndex = -1) {
        // Get the face of the ball being moved (if ignoreBallIndex is valid)
        let movingBallFace = 'front'; // Default to front
        if (ignoreBallIndex >= 0 && ignoreBallIndex < this.balls.length) {
            movingBallFace = this.getBallCurrentFace(this.balls[ignoreBallIndex]);
        }
        
        return this.balls.some((otherBall, idx) => {
            if (idx === ignoreBallIndex) return false;
            
            // Only check balls on the same face
            const otherBallFace = this.getBallCurrentFace(otherBall);
            if (otherBallFace !== movingBallFace) return false;
            
            const otherGridX = Math.round((otherBall.x - this.boardStartX) / this.gridSize);
            const otherGridY = Math.round((otherBall.y - this.boardStartY) / this.gridSize);
            return otherGridX === gridX && otherGridY === gridY;
        });
    }

    // Check if a well destination is occupied on the other face
    isWellDestinationOccupied(wellGridX, wellGridY, ballIndex) {
        if (!this.board || !this.board.rear) return false; // No rear face, no transfer possible
        
        // Get the board dimensions in grid cells
        const nodes = this.getCurrentNodes();
        const boardGridWidth = nodes[0] ? nodes[0].length : 0;
        
        // Calculate the transfer coordinates on the other side (same logic as handleWellTransfer)
        let transferX = boardGridWidth - 1 - wellGridX;
        let transferY = wellGridY;
        
        // Get the face of the ball being transferred
        const ball = this.balls[ballIndex];
        const currentBallFace = this.getBallCurrentFace(ball);
        const destinationFace = currentBallFace === 'front' ? 'rear' : 'front';
        
        // Check if the destination coordinates are occupied by a ball on the destination face
        return this.balls.some((otherBall, idx) => {
            if (idx === ballIndex) return false; // Don't check the ball being transferred
            
            // Only check balls on the destination face
            const otherBallFace = this.getBallCurrentFace(otherBall);
            if (otherBallFace !== destinationFace) return false;
            
            // Convert the other ball's position to grid coordinates
            const otherGridX = Math.round((otherBall.x - this.boardStartX) / this.gridSize);
            const otherGridY = Math.round((otherBall.y - this.boardStartY) / this.gridSize);
            
            // Check if the other ball is at the destination coordinates
            return otherGridX === transferX && otherGridY === transferY;
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

    // Find the closest usable path within gridBoxSize distance from a touch position
    findClosestUsablePath(touchX, touchY, ballIndex) {
        const nodes = this.getCurrentNodes();
        if (!nodes) return null;
        

        
        let closestPath = null;
        let closestDistance = Infinity;
        
        // Convert touch position to grid coordinates
        const touchGridX = (touchX - this.boardStartX) / this.gridSize;
        const touchGridY = (touchY - this.boardStartY) / this.gridSize;
        
        // Check all possible paths (horizontal and vertical connections)
        for (let y = 0; y < nodes.length; y++) {
            for (let x = 0; x < nodes[y].length; x++) {
                // Check if this node allows the ball
                if (!this.canBallMoveToNode(ballIndex, x, y)) continue;
                
                // Check horizontal connection to the right
                if (x + 1 < nodes[y].length && this.canBallMoveToNode(ballIndex, x + 1, y) && !this.isNodeOccupied(x + 1, y, ballIndex)) {
                    const pathDistance = this.getDistanceToPath(touchGridX, touchGridY, x, y, x + 1, y);
                    if (pathDistance <= 1.0 && pathDistance < closestDistance) { // Within gridBoxSize (1.0 in grid coordinates)
                        closestDistance = pathDistance;
                        closestPath = { start: { x, y }, end: { x: x + 1, y }, isHorizontal: true };
                    }
                }
                
                // Check horizontal connection to the left (from the right node)
                if (x > 0 && this.canBallMoveToNode(ballIndex, x - 1, y) && !this.isNodeOccupied(x - 1, y, ballIndex)) {
                    const pathDistance = this.getDistanceToPath(touchGridX, touchGridY, x - 1, y, x, y);
                    if (pathDistance <= 1.0 && pathDistance < closestDistance) { // Within gridBoxSize (1.0 in grid coordinates)
                        closestDistance = pathDistance;
                        closestPath = { start: { x: x - 1, y }, end: { x, y }, isHorizontal: true };
                    }
                }
                
                // Check vertical connection downward
                if (y + 1 < nodes.length && this.canBallMoveToNode(ballIndex, x, y + 1) && !this.isNodeOccupied(x, y + 1, ballIndex)) {
                    const pathDistance = this.getDistanceToPath(touchGridX, touchGridY, x, y, x, y + 1);
                    if (pathDistance <= 1.0 && pathDistance < closestDistance) { // Within gridBoxSize (1.0 in grid coordinates)
                        closestDistance = pathDistance;
                        closestPath = { start: { x, y }, end: { x, y: y + 1 }, isHorizontal: false };
                    }
                }
                
                // Check vertical connection upward (from the bottom node)
                if (y > 0 && this.canBallMoveToNode(ballIndex, x, y - 1) && !this.isNodeOccupied(x, y - 1, ballIndex)) {
                    const pathDistance = this.getDistanceToPath(touchGridX, touchGridY, x, y - 1, x, y);
                    if (pathDistance <= 1.0 && pathDistance < closestDistance) { // Within gridBoxSize (1.0 in grid coordinates)
                        closestDistance = pathDistance;
                        closestPath = { start: { x, y: y - 1 }, end: { x, y }, isHorizontal: false };
                    }
                }
            }
        }
        

        
        return closestPath;
    }

    // Calculate distance from a point to a path segment
    getDistanceToPath(pointX, pointY, pathStartX, pathStartY, pathEndX, pathEndY) {
        const A = pointX - pathStartX;
        const B = pointY - pathStartY;
        const C = pathEndX - pathStartX;
        const D = pathEndY - pathStartY;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            // Path is a point, return distance to that point
            return Math.sqrt(A * A + B * B);
        }
        
        let param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = pathStartX;
            yy = pathStartY;
        } else if (param > 1) {
            xx = pathEndX;
            yy = pathEndY;
        } else {
            xx = pathStartX + param * C;
            yy = pathStartY + param * D;
        }
        
        const dx = pointX - xx;
        const dy = pointY - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Project a touch position onto a usable path
    projectTouchOnPath(touchX, touchY, path) {
        if (!path) return null;
        
        // Convert touch position to grid coordinates
        const touchGridX = (touchX - this.boardStartX) / this.gridSize;
        const touchGridY = (touchY - this.boardStartY) / this.gridSize;
        
        const startX = path.start.x;
        const startY = path.start.y;
        const endX = path.end.x;
        const endY = path.end.y;
        
        if (path.isHorizontal) {
            // Horizontal path: project X coordinate, clamp Y
            const projectedX = Math.max(startX, Math.min(endX, touchGridX));
            const projectedY = startY; // Y is fixed for horizontal path
            
            // Convert back to absolute coordinates
            return {
                x: this.boardStartX + projectedX * this.gridSize,
                y: this.boardStartY + projectedY * this.gridSize,
                gridX: projectedX,
                gridY: projectedY
            };
        } else {
            // Vertical path: project Y coordinate, clamp X
            const projectedX = startX; // X is fixed for vertical path
            const projectedY = Math.max(startY, Math.min(endY, touchGridY));
            
            // Convert back to absolute coordinates
            return {
                x: this.boardStartX + projectedX * this.gridSize,
                y: this.boardStartY + projectedY * this.gridSize,
                gridX: projectedX,
                gridY: projectedY
            };
        }
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
        
        // For the new drag/snap system, we don't snap to grid here
        // The position is already calculated correctly by the projection system
        let targetX = x;
        let targetY = y;
        
        // Ensure the ball stays within board bounds (node-based, not radius-based)
        const clampedX = Math.max(
            this.boardStartX, 
            Math.min(targetX, this.boardStartX + this.boardWidth)
        );
        const clampedY = Math.max(
            this.boardStartY, 
            Math.min(targetY, this.boardStartY + this.boardHeight)
        );
        
        // Compute target grid cell for validation
        const targetGridX = Math.round((clampedX - this.boardStartX) / this.gridSize);
        const targetGridY = Math.round((clampedY - this.boardStartY) / this.gridSize);
        
        // During dragging, we skip path validation since the new system handles it
        // Only validate when not dragging (final placement)
        if (!this.isDragging) {
            // Check if this is a valid path-based move
            if (!this.isValidPathMove(this.selectedBallIndex, targetGridX, targetGridY)) {
                return; // Skip movement if not allowed by path rules
            }
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

    // Start well animation when ball is dropped on a well
    startWellAnimation(ball, wellGridX, wellGridY) {
        // Create a pulsing/glowing effect on the well
        this.wellAnimationState = {
            isAnimating: true,
            startTime: performance.now(),
            duration: 800, // 800ms animation
            ball: ball,
            wellGridX: wellGridX,
            wellGridY: wellGridY,
            pulseCount: 0,
            maxPulses: 3,
            isBlocked: false // Track if this is a blocked transfer
        };
        
        // Start the well animation loop
        this.wellAnimationLoop();
    }

    // Start blocked well animation when transfer is blocked
    startBlockedWellAnimation(ball, wellGridX, wellGridY) {
        // Create a blocked transfer animation
        this.wellAnimationState = {
            isAnimating: true,
            startTime: performance.now(),
            duration: 400, // Shorter animation for blocked transfer
            ball: ball,
            wellGridX: wellGridX,
            wellGridY: wellGridY,
            pulseCount: 0,
            maxPulses: 3,
            isBlocked: true // Mark as blocked transfer
        };
        
        // Mark the ball as blocked for visual feedback
        ball.isBlockedTransfer = true;
        
        // Start the blocked well animation loop
        this.blockedWellAnimationLoop();
    }
    
    // Well animation loop
    wellAnimationLoop() {
        if (!this.wellAnimationState || !this.wellAnimationState.isAnimating) {
            return;
        }
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.wellAnimationState.startTime;
        const progress = elapsed / this.wellAnimationState.duration;
        
        // Ball shrinking and fading out effect
        const ball = this.wellAnimationState.ball;
        
        // Scale: start at 1.0, end at 0.0 (shrink to nothing)
        ball.wellAnimationScale = 1.0 - progress;
        
        // Opacity: start at 1.0, end at 0.0 (fade out)
        ball.wellAnimationOpacity = 1.0 - progress;
        
        // Re-render to show the animation
        this.render();
        
        if (progress >= 1) {
            // Animation complete, handle the transfer
            this.wellAnimationState.isAnimating = false;
            
            // Reset animation properties
            ball.wellAnimationScale = undefined;
            ball.wellAnimationOpacity = undefined;
            
            this.handleWellTransfer(this.wellAnimationState.ball, this.wellAnimationState.wellGridX, this.wellAnimationState.wellGridY);
        } else {
            // Continue animation
            requestAnimationFrame(() => this.wellAnimationLoop());
        }
    }

    // Blocked well animation loop (reverses halfway through)
    blockedWellAnimationLoop() {
        if (!this.wellAnimationState || !this.wellAnimationState.isAnimating) {
            return;
        }
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.wellAnimationState.startTime;
        const progress = elapsed / this.wellAnimationState.duration;
        
        // Ball shrinking and fading effect that reverses halfway through
        const ball = this.wellAnimationState.ball;
        
        // Create a "bounce back" effect: shrink/fade to 0.7 at 50% progress, then return to 1.0
        let scaleProgress, opacityProgress;
        if (progress <= 0.5) {
            // First half: shrink and fade to 0.7
            scaleProgress = 1.0 - (progress * 2 * 0.3); // From 1.0 to 0.7
            opacityProgress = 1.0 - (progress * 2 * 0.3); // From 1.0 to 0.7
        } else {
            // Second half: grow and fade back to 1.0
            const secondHalfProgress = (progress - 0.5) * 2; // 0.0 to 1.0 in second half
            scaleProgress = 0.7 + (secondHalfProgress * 0.3); // From 0.7 to 1.0
            opacityProgress = 0.7 + (secondHalfProgress * 0.3); // From 0.7 to 1.0
        }
        
        ball.wellAnimationScale = scaleProgress;
        ball.wellAnimationOpacity = opacityProgress;
        
        // Re-render to show the animation
        this.render();
        
        if (progress >= 1) {
            // Animation complete, ball stays on current face
            this.wellAnimationState.isAnimating = false;
            
            // Reset animation properties
            ball.wellAnimationScale = undefined;
            ball.wellAnimationOpacity = undefined;
            ball.isBlockedTransfer = false; // Clear blocked flag
            
            // Check win condition since transfer was blocked, but only if level is not already completed
            setTimeout(() => {
                if (!this.storageManager.isLevelCompleted(this.currentLevel)) {
                    this.checkWinCondition();
                }
            }, 50);
        } else {
            // Continue animation
            requestAnimationFrame(() => this.blockedWellAnimationLoop());
        }
    }

    // Handle ball transfer through a well
    handleWellTransfer(ball, wellGridX, wellGridY) {
        // Get the board dimensions in grid cells
        const nodes = this.getCurrentNodes();
        const boardGridWidth = nodes[0] ? nodes[0].length : 0;
        
        // Calculate the transfer coordinates on the other side
        // For a 6x3 board, well at (4,1) should transfer to (1,1) on rear face
        // This suggests mirroring the coordinates
        let transferX = boardGridWidth - 1 - wellGridX;
        let transferY = wellGridY;
        
        // Convert grid coordinates back to absolute coordinates
        // The transfer coordinates are now positive, so we can use them directly
        let mappedX = transferX;
        let mappedY = transferY;
        
        const transferAbsX = this.boardStartX + (mappedX * this.gridSize);
        const transferAbsY = this.boardStartY + (mappedY * this.gridSize);
        
        // Update ball position to the transfer location
        ball.x = transferAbsX;
        ball.y = transferAbsY;
        
        // Update the ball's original start coordinates and current face based on transfer
        // If currently on front face, transfer to rear (negative coordinates)
        // If currently on rear face, transfer to front (positive coordinates)
        const currentBallFace = this.getBallCurrentFace(ball);
        if (currentBallFace === 'front') {
            // Transfer from front to rear - use negative coordinates
            ball.originalStart = [-transferX, -transferY];
            ball.currentFace = 'rear';
        } else {
            // Transfer from rear to front - use positive coordinates
            ball.originalStart = [transferX, transferY];
            ball.currentFace = 'front';
        }
        
        // Flip the board as if user clicked the flip button
        this.toggleBoardFace();
        
        // Re-render to show the changes
        this.render();
    }

    /**
     * Loads a specific level and initializes the game state
     * @param {number} levelNumber - The level number to load
     * @returns {Promise<void>}
     * @throws {Error} When level data cannot be loaded or is invalid
     */
    async loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        // Synchronize with App instance if available
        if (this.appReference) {
            this.appReference.currentLevel = levelNumber;
        }
        this.gameState.isPlaying = true;
        
        // Reset completion status for this level when entering it
        this.storageManager.resetLevelCompletion(levelNumber);
        
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
            
            // Calculate board positioning first
            this.calculateBoardPosition();
            
            // Add toggle button if board has rear face (after board position is calculated)
            this.updateToggleButton();
            
            // Initialize balls array from level data
            this.initializeBalls();
            
            // Update level number display in DOM
            this.updateLevelNumberDisplay();
            
            this.render();
        } catch (error) {
            console.error('Error loading level:', error);
            // Show error message to user
            alert(CONSTANTS.MESSAGES.LEVEL_LOAD_ERROR.replace('{levelNumber}', levelNumber));
        }
    }



    /**
     * Initializes the balls array from level data
     * Creates ball objects with position, color, and animation properties
     * @returns {void}
     */
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
                    // Track which face the ball is currently on
                    currentFace: ballData.start[0] < 0 || ballData.start[1] < 0 ? 'rear' : 'front',
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
                currentFace: 'front', // Default ball starts on front face
                endPosition: {
                    x: this.boardStartX + (4 * this.gridSize),
                    y: this.boardStartY + (4 * this.gridSize)
                }
            };
            this.balls.push(defaultBall);
        }
    }

    /**
     * Checks if all balls have reached their goal positions
     * Triggers level completion if win condition is met
     * @returns {void}
     */
    checkWinCondition() {
        if (!this.canvas || this.balls.length === 0) return;
        
        // Check if all balls are at their respective end positions AND on the correct face
        const allBallsAtGoal = this.balls.every(ball => {
            // Convert ball's current position back to grid coordinates
            const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
            const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
            
            // Get the goal coordinates from the original coordinate system
            const goalGridX = ball.originalEnd[0];
            const goalGridY = ball.originalEnd[1];
            
            // Check if ball is at the correct grid position
            const correctPosition = ballGridX === Math.abs(goalGridX) && ballGridY === Math.abs(goalGridY);
            
            // Check if ball is on the correct face
            const goalFace = goalGridX < 0 || goalGridY < 0 ? 'rear' : 'front';
            const ballFace = this.getBallCurrentFace(ball);
            const correctFace = goalFace === ballFace;
            
            return correctPosition && correctFace;
        });
        
        if (allBallsAtGoal) {
            this.levelCompleted();
        }
    }

    levelCompleted() {
        this.gameState.isPlaying = false;
        
        // Save progress
        this.storageManager.saveGameProgress(this.currentLevel);
        
        // Create explosion animations for each goal node
        this.createExplosionAnimations();
        
        // Show completion overlay with touch event
        this.showLevelCompletionOverlay();
    }

    createExplosionAnimations() {
        if (!this.balls || !this.canvas) return;
        
        const config = CONSTANTS.ANIMATION_CONFIG;
        
        // Only create explosions for balls that have goals on the current face
        const visibleBalls = this.balls.filter((ball, index) => {
            // Check if this ball's goal is on the current face
            return this.getGoalCurrentFace(ball) === this.currentFace;
        });
        
        visibleBalls.forEach((ball, index) => {
            // Create explosion with delay based on ball index
            setTimeout(() => {
                this.createExplosionDisc(ball.endPosition.x, ball.endPosition.y, config, index);
            }, index * config.EXPLOSION_DELAY);
        });
    }



    createExplosionDisc(x, y, config, index) {
        if (!this.canvas) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Convert canvas coordinates to screen coordinates
        let screenX = (x / this.displayWidth) * canvasRect.width;
        let screenY = (y / this.displayHeight) * canvasRect.height;
        
        // Apply horizontal reflection for rear face (same as in render method)
        if (this.currentFace === 'rear') {
            screenX = canvasRect.width - screenX;
        }
        
        // Calculate explosion radii based on ball radius
        const ballRadius = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.BALL_RADIUS_RATIO;
        const startRadius = ballRadius * 0.25; // 1/4 of ball radius
        const maxRadius = ballRadius * 3; // 3 times ball radius
        
        const disc = document.createElement('div');
        disc.className = 'explosion-disc';
        disc.id = `explosion-${index}`;
        
        // Position the disc at the goal center
        disc.style.left = `${screenX}px`;
        disc.style.top = `${screenY}px`;
        
        // Set initial size and ensure it's visible
        disc.style.width = `${startRadius * 2}px`;
        disc.style.height = `${startRadius * 2}px`;
        disc.style.opacity = '0.5';
        
        // Set higher z-index for later explosions to ensure they're visible
        disc.style.zIndex = 150 + index;
        
        // Add to container
        const canvasContainer = this.canvas.parentElement;
        if (canvasContainer) {
            canvasContainer.appendChild(disc);
            
            // Animate the expansion with JavaScript
            this.animateExplosion(disc, startRadius, maxRadius, config.EXPLOSION_DURATION, index);
        }
    }

    animateExplosion(disc, startRadius, maxRadius, duration, index) {
        const startTime = performance.now();
        const startSize = startRadius * 2;
        const endSize = maxRadius * 2;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const currentSize = startSize + (endSize - startSize) * easeOut;
            const currentOpacity = 1 - progress;
            
            disc.style.width = `${currentSize}px`;
            disc.style.height = `${currentSize}px`;
            disc.style.opacity = currentOpacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete, remove the disc
                if (disc.parentElement) {
                    disc.parentElement.removeChild(disc);
                }
            }
        };
        
        requestAnimationFrame(animate);
    }

    showLevelCompletionOverlay() {
        const canvasContainer = this.canvas?.parentElement;
        if (!canvasContainer) return;
        
        // Create invisible overlay for touch events
        const overlay = document.createElement('div');
        overlay.className = 'level-completion-overlay';
        overlay.style.background = 'transparent'; // Make it invisible
        
        // Add touch event to proceed to next level
        overlay.addEventListener('click', () => {
            this.proceedToNextLevel();
        });
        
        // Add to container
        canvasContainer.appendChild(overlay);
        
        // Activate overlay
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);
    }

    proceedToNextLevel() {
        // Remove overlay
        const overlay = document.querySelector('.level-completion-overlay');
        if (overlay && overlay.parentElement) {
            overlay.parentElement.removeChild(overlay);
        }
        
        // Remove any remaining explosion discs
        const discs = document.querySelectorAll('.explosion-disc');
        discs.forEach(disc => {
            if (disc.parentElement) {
                disc.parentElement.removeChild(disc);
            }
        });
        
        // Proceed to next level
        this.nextLevel();
    }

    nextLevel() {
        this.currentLevel++;
        // Synchronize with App instance if available
        if (this.appReference) {
            this.appReference.currentLevel = this.currentLevel;
        }
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

    updateLevelNumberDisplay() {
        const levelNumberElement = document.getElementById('levelNumberDisplay');
        if (levelNumberElement) {
            levelNumberElement.textContent = `#${this.currentLevel}`;
        } else {
            // Retry after a short delay if element is not found
            setTimeout(() => {
                const retryElement = document.getElementById('levelNumberDisplay');
                if (retryElement) {
                    retryElement.textContent = `#${this.currentLevel}`;
                }
            }, 100);
        }
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
                    
                    // Render WELL nodes as white circle rings with gradient
                    else if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
                        const centerX = this.boardStartX + (col * this.gridSize);
                        const centerY = this.boardStartY + (row * this.gridSize);
                        
                        // Use same radii as goal nodes
                        const innerRadius = this.getGoalInnerRadius();
                        const outerRadius = this.getGoalOuterRadius();
                        
                        // Create radial gradient from opaque white at outer radius to transparent at inner radius
                        const gradient = this.ctx.createRadialGradient(
                            centerX, centerY, 0,             // Start at center (0)
                            centerX, centerY, outerRadius    // End at outer radius
                        );
                        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');                           // Transparent at center
                        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');                         // Still transparent at 50%
                        gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');                           // Opaque white at edge
                        
                        this.ctx.fillStyle = gradient;
                        this.ctx.beginPath();
                        this.ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
                        this.ctx.fill();
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
                
                // Process path nodes and WELL nodes
                if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
                    
                    const centerX = this.boardStartX + (col * this.gridSize);
                    const centerY = this.boardStartY + (row * this.gridSize);
                    
                    // Check right neighbor (horizontal connection)
                    if (col + 1 < rowString.length) {
                        const rightNodeType = rowString[col + 1];
                        if (this.shouldDrawConnection(nodeType, rightNodeType)) {
                            const rightX = this.boardStartX + ((col + 1) * this.gridSize);
                            const rightY = centerY;
                            
                            const lineColor = this.getConnectionColor(nodeType, rightNodeType);
                            this.drawPathLineWithWellClipping(centerX, centerY, rightX, rightY, lineColor, nodeType, rightNodeType);
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
                                this.drawPathLineWithWellClipping(centerX, centerY, bottomX, bottomY, lineColor, nodeType, bottomNodeType);
                            }
                        }
                    }
                }
            }
        }
    }

    // Check if two node types should be connected with a line
    shouldDrawConnection(nodeType1, nodeType2) {
        // Both nodes must be path nodes (not empty) or WELL nodes
        const pathTypes = [
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL
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
        
        // WELL nodes connect to any path type (allowing balls to enter wells)
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            return true;
        }
        
        // Different specific ball paths don't connect
        return false;
    }

    // Get the color for a connection between two node types
    getConnectionColor(nodeType1, nodeType2) {
        // If one is PATH_ALL_BALLS or WELL, use the color of the specific ball path
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS || 
            nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            return this.getPathColor(nodeType2);
        }
        if (nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
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
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            return '#BBBBBB'; // light gray for well nodes (same as PATH_ALL_BALLS)
        }
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1) {
            // Use the color of the first ball (ball 0) from the level data
            if (this.balls && this.balls.length > 0) {
                const ballColor = this.balls[0].color;
                return CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ballColor] || '#FF0000';
            }
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.red; // Fallback to red
        }
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2) {
            // Use the color of the second ball (ball 1) from the level data
            if (this.balls && this.balls.length > 1) {
                const ballColor = this.balls[1].color;
                return CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ballColor] || '#0000FF';
            }
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.blue; // Fallback to blue
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

    // Draw a line between two points with well clipping
    drawPathLineWithWellClipping(x1, y1, x2, y2, color, nodeType1, nodeType2) {
        // If neither node is a WELL, draw normal line
        if (nodeType1 !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL && 
            nodeType2 !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            this.drawPathLine(x1, y1, x2, y2, color);
            return;
        }
        
        // Determine which endpoint is the WELL
        let wellX, wellY, otherX, otherY;
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            wellX = x1;
            wellY = y1;
            otherX = x2;
            otherY = y2;
        } else {
            wellX = x2;
            wellY = y2;
            otherX = x1;
            otherY = y1;
        }
        
        // Calculate the clipped endpoint at the well's outer radius
        const wellOuterRadius = this.getGoalOuterRadius();
        const dx = otherX - wellX;
        const dy = otherY - wellY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= wellOuterRadius) {
            // Line is completely inside the well, don't draw it
            return;
        }
        
        // Calculate the intersection point at the well's outer radius
        const ratio = wellOuterRadius / distance;
        const clippedX = wellX + dx * ratio;
        const clippedY = wellY + dy * ratio;
        
        // Draw the line from the other endpoint to the clipped point
        this.drawPathLine(otherX, otherY, clippedX, clippedY, color);
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
            
            // Apply well animation effects if active
            let finalBallRadius = this.getVisualBallRadius(ball);
            let finalAlpha = 1.0;
            
            if (ball.wellAnimationScale !== undefined) {
                finalBallRadius *= Math.max(0, ball.wellAnimationScale); // Clamp to prevent negative radius
            }
            if (ball.wellAnimationOpacity !== undefined) {
                finalAlpha = Math.max(0, Math.min(1, ball.wellAnimationOpacity)); // Clamp opacity between 0 and 1
            }
            
            // Draw the ball with well animation effects
            this.ctx.save();
            if (finalAlpha < 1.0) {
                this.ctx.globalAlpha = finalAlpha;
            }
            
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, finalBallRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.restore();
            

        });
    }

    renderEndGoals() {
        this.balls.forEach((ball, index) => {
            // Only render goals for balls that belong to the current face
            if (this.getGoalCurrentFace(ball) !== this.currentFace) return;
            const endX = ball.endPosition.x;
            const endY = ball.endPosition.y;
            
            // Use the same color as the ball for the square frame
            const colorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
            
            // Get the radii for the square frame and circular hole
            const innerRadius = this.getGoalInnerRadius();
            const outerRadius = this.getGoalOuterRadius();
            
            // Calculate square dimensions (side length = outer radius * 2)
            const squareHalfSize = outerRadius;
            
            this.ctx.fillStyle = colorHex;
            this.ctx.beginPath();
            
            // Draw the outer square
            this.ctx.rect(endX - squareHalfSize, endY - squareHalfSize, squareHalfSize * 2, squareHalfSize * 2);
            
            // Cut out the circular hole in the middle
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

    // Find the closest accessible node for a ball
    findClosestAccessibleNode(ballIndex, currentX, currentY) {
        const nodes = this.getCurrentNodes();
        if (!nodes) return null;
        
        let closestNode = null;
        let closestDistance = Infinity;
        
        // Convert current position to grid coordinates
        const currentGridX = (currentX - this.boardStartX) / this.gridSize;
        const currentGridY = (currentY - this.boardStartY) / this.gridSize;
        
        // Check all nodes to find the closest accessible one
        for (let y = 0; y < nodes.length; y++) {
            for (let x = 0; x < nodes[y].length; x++) {
                // Check if this node is accessible to the ball and not occupied
                if (this.canBallMoveToNode(ballIndex, x, y) && !this.isNodeOccupied(x, y, ballIndex)) {
                    const distance = Math.sqrt(
                        Math.pow(currentGridX - x, 2) + Math.pow(currentGridY - y, 2)
                    );
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestNode = { x, y };
                    }
                }
            }
        }
        
        return closestNode;
    }

    // Check if a ball can move to a specific node based on path types
    canBallMoveToNode(ballIndex, gridX, gridY) {
        const nodeType = this.getNodeType(gridX, gridY);
        
        // Empty nodes are not accessible
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY) return false;
        
        // WELL nodes can be used by any ball (like PATH_ALL_BALLS)
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) return true;
        
        // Path for all balls ('0') can be used by any ball
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS) return true;
        
        // Ball-specific paths: ball 0 can use path '1', ball 1 can use path '2', etc.
        const ballPathType = (ballIndex + 1).toString();
        if (nodeType === ballPathType) return true;
        

        return false;
    }

} 