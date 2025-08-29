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
        
        // Glow animation system
        this.glowAnimations = []; // Array to store glow animation data for each ball
        this.glowAnimationStartTime = Date.now(); // Global start time for consistent timing
        this.glowAnimationId = null; // For continuous glow animation loop
        
        this.canvas = null;
        this.ctx = null;
        this.board = null;
        this.levelData = null; // Store current level data
        this.currentFace = 'front'; // Track which face is currently being shown ('front' or 'rear')
        this.gradientColors = { topColor: '#000000', bottomColor: '#000000' }; // Store gradient colors for current level
        this.balls = []; // Array of ball objects
        this.selectedBallIndex = -1; // Index of currently selected ball
        this.touchStartPos = null;
        this.isDragging = false;
        this.animationFrameId = null; // For smooth animations
        this.touchAnimationState = {}; // Track animation state for each ball

        this.ballAnimationId = null; // For ball movement animations
        this.restScale = CONSTANTS.RENDER_SIZE_CONFIG.BALL_REST_SCALE; // Resting visual scale for balls
        
        // Flip animation state
        this.isFlipping = false; // Track if flip animation is currently running
        this.flipWrapper = null; // Reference to the flip wrapper element
        this.flipAnimationTimeout = null;
        
        // Level progression state
        this.isLevelProgression = false; // Track if we're proceeding to next level from completion // Track animation timing
        this.levelLoadedViaNavigation = false; // Track if level was loaded via navigation buttons
        
        this.gridSize = 40; // Grid cell size for snapping
        this.boardStartX = 0;
        this.boardStartY = 0;
        this.boardWidth = 0;
        this.boardHeight = 0;
        
        // Enhanced ball movement system properties
        this.ballOriginNode = null; // Store the origin node when ball is picked up
        
        // New properties for enhanced ball movement system
        this.connectedNodes = []; // List of available connected nodes for each ball
        this.lastNodePositions = []; // Last node position for each ball (grid coordinates)
        this.isBallClamped = []; // Track if each ball is currently clamped
        this.touchPosition = null; // Current touch position
        this.transitionInProgress = []; // Track if each ball is in transition
        this.isBacktracking = []; // Track if each ball is currently backtracking
        this.backtrackingQueue = []; // Queue for multi-step backtracking sequences
        
        // Movement trail animation system
        this.trailAnimationId = null; // For trail animation loop
        this.activeTrailAnimations = []; // Array of active trail animations
        
        // Tail system properties
        this.nodeTails = {}; // Track nodes with tail property: {face: {row_col: {ballIndex, color}}}
        this.connectionTails = {}; // Track connections with tail property: {face: {row1_col1_row2_col2: {ballIndex, color}}}
        
        // Sticker activation tracking
        this.activatedStickers = {}; // Track activated stickers: {face: {row_col: {ballIndex, color}}}
        
        // Trap state tracking
        this.closedTraps = {}; // Track closed traps: {face: {row_col: true}}
        this.trapAnimations = {}; // Track trap animations: {face: {row_col: {isAnimating, startTime}}}
        
        // Switch state tracking
        this.closedSwitches = {}; // Track closed switches: {face: {row_col: true}}
        this.switchAnimations = {}; // Track switch animations: {face: {row_col: {isAnimating, startTime}}}
        
        // Track which goal nodes are currently exploding
        this.explodingGoals = new Set();
        
        // Track goal state animations
        this.goalAnimations = new Map(); // Map of goalKey -> {startTime, fromState, toState, progress}
        this.goalStates = new Map(); // Map of goalKey -> current state ('active' or 'rest')
        
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

    /**
     * Determines if the current device is mobile based on touch capability
     * @returns {boolean} True if mobile device, false if desktop
     */
    isMobileDevice() {
        return !(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }

    // Determine which face a ball is currently on based on its position
    getBallCurrentFace(ball) {
        if (!this.board || !this.board.front) return 'front';
        
        // Return the ball's current face (tracked during gameplay)
        return ball.currentFace || 'front';
    }

    /**
     * Transform pointer coordinates to grid coordinates, snapping to nearest valid game node
     * @param {number} pointerX - Pointer X coordinate in canvas space (mouse or touch)
     * @param {number} pointerY - Pointer Y coordinate in canvas space (mouse or touch)
     * @returns {Object} Grid coordinates {x, y} of nearest valid node or null if outside board
     */
    pointerToGridCoordinates(pointerX, pointerY) {
        // Add tolerance margin around board bounds (half a grid cell)
        const tolerance = this.gridSize / 2;
        const extendedBoardStartX = this.boardStartX - tolerance;
        const extendedBoardEndX = this.boardStartX + this.boardWidth + tolerance;
        const extendedBoardStartY = this.boardStartY - tolerance;
        const extendedBoardEndY = this.boardStartY + this.boardHeight + tolerance;
        
        // Check if pointer is within the extended board bounds
        if (pointerX < extendedBoardStartX || pointerX > extendedBoardEndX ||
            pointerY < extendedBoardStartY || pointerY > extendedBoardEndY) {
            return null;
        }
        
        // First, get the grid cell the pointer is in
        const gridX = Math.round((pointerX - this.boardStartX) / this.gridSize);
        const gridY = Math.round((pointerY - this.boardStartY) / this.gridSize);
        
        // Check if the current grid position is a valid node (not empty)
        const currentNodeType = this.getNodeType(gridX, gridY);
        if (currentNodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY) {
            return { x: gridX, y: gridY };
        }
        
        // If current position is empty, find the nearest valid node within a reasonable radius
        const searchRadius = 2; // Search up to 2 cells away
        let nearestNode = null;
        let nearestDistance = Infinity;
        
        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                const checkX = gridX + dx;
                const checkY = gridY + dy;
                
                // Check if this position is a valid node
                const nodeType = this.getNodeType(checkX, checkY);
                if (nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY) {
                    // Calculate distance from pointer to this node
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestNode = { x: checkX, y: checkY };
                    }
                }
            }
        }
        
        return nearestNode;
    }

    // Utility method to log the current state of all balls with tails
    // do not remove these logs even during cleanup
    logBallsWithTails() {
        console.log('\n🎯 === BALLS WITH TAILS STATUS ===');
        this.balls.forEach((ball, index) => {
            if (ball.hasTail) {
                console.log(`🎯 Ball ${index} (${ball.color}):`);
                console.log(`   - Has tail: ${ball.hasTail}`);
                console.log(`   - Visited nodes: ${JSON.stringify(ball.visitedNodes)}`);
                console.log(`   - Current position: (${Math.round((ball.x - this.boardStartX) / this.gridSize)}, ${Math.round((ball.y - this.boardStartY) / this.gridSize)})`);
                console.log(`   - Current face: ${this.getBallCurrentFace(ball)}`);
            }
        });
        console.log('🎯 === END BALLS WITH TAILS STATUS ===\n');
    }



    // Determine which face a goal is on based on the ball's end coordinates
    getGoalCurrentFace(ball) {
        if (!this.board || !this.board.front) return 'front';
        
        const isRearGoal = ball.originalEnd[0] < 0 || ball.originalEnd[1] < 0;
        return isRearGoal ? 'rear' : 'front';
    }

    // Helper function to darken a hex color
    darkenColor(hexColor, factor = 0.5) {
        // Remove # if present
        const hex = hexColor.replace('#', '');
        
        // Parse RGB values
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Darken by multiplying by factor
        const newR = Math.max(0, Math.floor(r * (1 - factor)));
        const newG = Math.max(0, Math.floor(g * (1 - factor)));
        const newB = Math.max(0, Math.floor(b * (1 - factor)));
        
        // Convert back to hex
        const result = '#' + 
            newR.toString(16).padStart(2, '0') + 
            newG.toString(16).padStart(2, '0') + 
            newB.toString(16).padStart(2, '0');
        
        return result;
    }

    // Helper function to brighten a hex color
    brightenColor(hexColor, factor = 0.3) {
        // Remove # if present
        const hex = hexColor.replace('#', '');
        
        // Parse RGB values
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Brighten by adding factor * (255 - current value)
        const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        // Convert back to hex
        const result = '#' + 
            newR.toString(16).padStart(2, '0') + 
            newG.toString(16).padStart(2, '0') + 
            newB.toString(16).padStart(2, '0');
        
        return result;
    }

    // Helper function to interpolate between two hex colors
    interpolateColor(color1, color2, factor) {
        // Remove # if present
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        // Parse RGB values for both colors
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        // Interpolate each component
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        // Convert back to hex
        const result = '#' + 
            r.toString(16).padStart(2, '0') + 
            g.toString(16).padStart(2, '0') + 
            b.toString(16).padStart(2, '0');
        
        return result;
    }

    // Glow animation methods
    initializeGlowAnimations() {
        // Initialize glow animation data for each ball
        this.glowAnimations = this.balls.map((ball, index) => ({
            startTime: this.glowAnimationStartTime + (index * CONSTANTS.RENDER_SIZE_CONFIG.GLOW_STAGGER_DELAY), // Stagger start times for individual animation
            cycleDuration: CONSTANTS.RENDER_SIZE_CONFIG.GLOW_CYCLE_DURATION, // Cycle duration from constants
            phase: 0 // Current phase of the animation
        }));
    }

    updateGlowAnimations() {
        const currentTime = Date.now();
        
        this.glowAnimations.forEach((animation, index) => {
            if (!animation) return;
            
            // Calculate elapsed time for this ball's animation
            const elapsedTime = currentTime - animation.startTime;
            
            // Calculate current phase (0 to 1) using sine wave
            // This ensures perfect synchronization: phase 0 = darkest ball + minimum shadow, phase 1 = brightest ball + maximum shadow
            animation.phase = (Math.sin((elapsedTime / animation.cycleDuration) * 2 * Math.PI) + 1) / 2;
            animation.phase *= animation.phase;
            animation.phase *= animation.phase;
        });
    }

    glowAnimationLoop() {
        // Update glow animations
        this.updateGlowAnimations();
        
        // Trigger a render to show the updated colors
        this.render();
        
        // Continue the animation loop
        this.glowAnimationId = requestAnimationFrame(() => this.glowAnimationLoop());
    }

    startGlowAnimation() {
        // Stop any existing glow animation
        if (this.glowAnimationId) {
            cancelAnimationFrame(this.glowAnimationId);
        }
        
        // Start the continuous glow animation loop
        this.glowAnimationId = requestAnimationFrame(() => this.glowAnimationLoop());
    }

    stopGlowAnimation() {
        if (this.glowAnimationId) {
            cancelAnimationFrame(this.glowAnimationId);
            this.glowAnimationId = null;
        }
    }

    getGlowColor(ballIndex, originalColor) {
        // Return original color if no animation, ball is clamped, or game is not playing
        if (!this.glowAnimations[ballIndex] || 
            this.isBallClamped[ballIndex] || 
            !this.gameState.isPlaying) {
            return originalColor;
        }
        
        const animation = this.glowAnimations[ballIndex];
        const phase = animation.phase;
        
        // Interpolate between original color (phase 0) and brightened color (phase 1) using constant
        // This ensures phase 0 = darkest ball, phase 1 = brightest ball
        const brightenedColor = this.brightenColor(originalColor, CONSTANTS.RENDER_SIZE_CONFIG.GLOW_BRIGHTNESS_FACTOR);
        const glowColor = this.interpolateColor(originalColor, brightenedColor, phase);
        
        return glowColor;
    }

    drawBallShadow(x, y, ballRadius, ballIndex, originalColor) {
        // Only draw shadow if glow animation is active
        if (!this.glowAnimations[ballIndex] || 
            this.isBallClamped[ballIndex] || 
            !this.gameState.isPlaying) {
            return;
        }
        
        const animation = this.glowAnimations[ballIndex];
        const phase = animation.phase;
        
        // Calculate shadow properties based on glow phase using constants
        // This ensures phase 0 = minimum shadow, phase 1 = maximum shadow
        const maxShadowRadius = ballRadius * CONSTANTS.RENDER_SIZE_CONFIG.GLOW_SHADOW_MAX_RADIUS_RATIO; // Shadow expands based on constant
        const shadowRadius = maxShadowRadius * phase; // Shadow size syncs with glow intensity (phase 0 = 0, phase 1 = max)
        const shadowOpacity = CONSTANTS.RENDER_SIZE_CONFIG.GLOW_SHADOW_MAX_OPACITY * phase; // Shadow opacity syncs with glow intensity (phase 0 = 0, phase 1 = max)
        
        // Draw the shadow as a radial gradient
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, shadowRadius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${shadowOpacity})`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${shadowOpacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, shadowRadius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    // Update the toggle button visibility based on whether the board has a rear face
    updateToggleButton() {
        const gameFooter = document.querySelector('.game-footer');
        if (!gameFooter) {
            console.error('Game footer not found');
            return;
        }

        // Remove existing buttons if present
        const existingToggleButton = document.getElementById('faceToggleButton');
        if (existingToggleButton) {
            existingToggleButton.remove();
        }
        
        const existingNextLevelButton = document.getElementById('nextLevelButton');
        if (existingNextLevelButton) {
            existingNextLevelButton.remove();
        }

        // Create a container for the buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'game-controls';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.alignItems = 'center';
        buttonContainer.style.justifyContent = 'center';

        // Add toggle button if board has rear face
        if (this.board && this.board.rear) {
            const toggleButton = document.createElement('button');
            toggleButton.id = 'faceToggleButton';
            toggleButton.className = 'mx-4 btn btn-outline-light face-toggle-btn';
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
            const isMobile = this.isMobileDevice();
            const buttonSize = isMobile ? '56px' : '44px';
            const fontSize = isMobile ? '32px' : '24px';
            
            // Position footer at fixed distance from screen bottom
            const fixedBottomDistance = isMobile ? '20px' : '10px';
            const bottomOffset = fixedBottomDistance;
            
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
            
            buttonContainer.appendChild(toggleButton);
        }

        // Add next level button (always present, but only visible when level is completed)
        const nextLevelButton = document.createElement('button');
        nextLevelButton.id = 'nextLevelButton';
        nextLevelButton.className = 'mx-4 btn btn-outline-light next-level-btn';
        nextLevelButton.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i>';
        nextLevelButton.title = 'Next level';
        nextLevelButton.style.zIndex = '9999';
        nextLevelButton.style.display = 'none'; // Hidden by default
        nextLevelButton.style.position = 'relative';
        
        // Responsive sizing and positioning for mobile
        const isMobile = this.isMobileDevice();
        const buttonSize = isMobile ? '56px' : '44px';
        const fontSize = isMobile ? '32px' : '24px';
        
        nextLevelButton.style.width = buttonSize;
        nextLevelButton.style.height = buttonSize;
        nextLevelButton.style.minWidth = buttonSize;
        nextLevelButton.style.minHeight = buttonSize;
        nextLevelButton.style.maxWidth = buttonSize;
        nextLevelButton.style.maxHeight = buttonSize;
        nextLevelButton.style.flexShrink = '0';
        nextLevelButton.style.fontSize = fontSize;
        nextLevelButton.style.lineHeight = '1';
        nextLevelButton.style.padding = '0';
        nextLevelButton.style.margin = '0';
        nextLevelButton.style.boxSizing = 'border-box';
        nextLevelButton.style.touchAction = 'manipulation';
        nextLevelButton.style.webkitTapHighlightColor = 'transparent';
        nextLevelButton.setAttribute('aria-label', 'Next level');
        nextLevelButton.onclick = () => this.proceedToNextLevel();
        
        buttonContainer.appendChild(nextLevelButton);
        
        // Insert button container and position closer to board on mobile
        gameFooter.style.justifyContent = 'center';
        gameFooter.style.display = 'flex !important';
        gameFooter.style.alignItems = 'center';
        gameFooter.style.position = 'fixed';
        gameFooter.style.bottom = isMobile ? '20px' : '10px';
        gameFooter.style.left = '0';
        gameFooter.style.right = '0';
        gameFooter.style.zIndex = '9998';
        gameFooter.style.minHeight = isMobile ? '80px' : '60px';
        gameFooter.style.height = 'auto';
        gameFooter.style.padding = '5px';
        gameFooter.style.border = 'none';
        gameFooter.appendChild(buttonContainer);
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
        
        // Play board flip sound
        if (this.soundManager) {
            this.soundManager.playSound('boardFlip');
        }
        
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
            
            // Recalculate connected nodes for all balls after face change
            this.recalculateAllConnectedNodes();
            
            // Initialize goal states for the new face
            this.initializeGoalStates();
            
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
            // For test levels, always check win condition
            // Also check if level was loaded via navigation (allows replaying completed levels)
            if (this.currentLevel === 'test' || !this.storageManager.isLevelCompleted(this.currentLevel) || this.levelLoadedViaNavigation) {
                this.checkWinCondition();
            }
        }, CONSTANTS.ANIMATION_CONFIG.FLIP_DURATION);
    }

    init() {
        this.setupCanvas();
        this.setupTouchEvents();
        this.setupNavigationButtons();
        
        // Don't load level here - let the app handle it after setting test data
        // this.loadLevel(this.currentLevel).catch(error => {
        //     console.error('Failed to load initial level:', error);
        // });
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas not found');
            return;
        }
        
        // Set cursor style for desktop support
        if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            this.canvas.style.cursor = 'pointer';
            // Also set cursor on the canvas container
            const canvasContainer = document.querySelector('.game-canvas-container');
            if (canvasContainer) {
                canvasContainer.style.cursor = 'pointer';
            }
            // Set cursor on the game container as well
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.style.cursor = 'pointer';
            }
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
        
        // Don't load level here - let the app handle it after setting test data
        // this.loadLevel(this.currentLevel).catch(error => {
        //     console.error('Failed to load initial level:', error);
        // });
        
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
        
        // Reset the transformation matrix before applying new scale
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Scale the drawing context to match the device pixel ratio
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Store the scale factor for touch calculations
        this.devicePixelRatio = devicePixelRatio;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        
        // Clear board position cache when display dimensions change
        this._boardPositionCache = null;
        
        // Recalculate board position and update toggle button after resize
        if (this.board) {
            this.calculateBoardPosition();
            this.updateToggleButton();
        }
        
        // Reapply gradient to flip wrapper after resize
        if (this.gradientColors) {
            this.applyGradientToFlipWrapper();
        }
    }

    applyGradientToFlipWrapper() {
        if (this.flipWrapper && CONSTANTS.BACKGROUND_CONFIG.GRADIENT_ENABLED) {
            // Create CSS gradient string
            const gradientString = `linear-gradient(to bottom, ${this.gradientColors.topColor}, ${this.gradientColors.bottomColor})`;
            this.flipWrapper.style.background = gradientString;
            
            // Also apply to canvas container as fallback
            const canvasContainer = document.querySelector('.game-canvas-container');
            if (canvasContainer) {
                canvasContainer.style.background = gradientString;
            }
        }
    }

    setupNavigationButtons() {
        // Only setup navigation buttons if in development mode
        if (!CONSTANTS.APP_CONFIG.DEVEL) return;

        // Setup navigation buttons with retry mechanism
        const setupButtons = () => {
            const prevBtn = document.getElementById('prevLevelBtn');
            const nextBtn = document.getElementById('nextLevelBtn');

            if (prevBtn && nextBtn) {
                // Previous level button
                prevBtn.addEventListener('click', () => {
                    if (this.currentLevel > 1) {
                        // If we're currently showing the prize scene, go back to the actual max level
                        if (this.currentLevel > CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
                            this.currentLevel = CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL;
                            if (this.appReference) {
                                this.appReference.currentLevel = this.currentLevel;
                                this.appReference.hidePrizeScene();
                            }
                        } else {
                            // Normal case: go to previous level
                            this.currentLevel--;
                            if (this.appReference) {
                                this.appReference.currentLevel = this.currentLevel;
                            }
                        }
                        
                        // Reset level completion status when using navigation buttons
                        if (typeof this.currentLevel === 'number') {
                            this.storageManager.resetLevelCompletion(this.currentLevel);
                        }
                        
                        // Mark that this level was loaded via navigation
                        this.levelLoadedViaNavigation = true;
                        
                        this.loadLevel(this.currentLevel).catch(error => {
                            console.error('Failed to load previous level:', error);
                        });
                    }
                });

                // Next level button
                nextBtn.addEventListener('click', () => {
                    if (this.currentLevel < CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
                        const nextLevel = this.currentLevel + 1;
                        
                        // Reset level completion status when using navigation buttons
                        if (typeof nextLevel === 'number') {
                            this.storageManager.resetLevelCompletion(nextLevel);
                        }
                        
                        // Mark that this level was loaded via navigation
                        this.levelLoadedViaNavigation = true;
                        
                        this.loadLevel(nextLevel).catch(error => {
                            console.error('Failed to load next level:', error);
                        });
                    }
                });

                // Initial button state
                this.updateLevelNavigationButtons();
            } else {
                // Retry after a short delay if buttons are not found
                setTimeout(setupButtons, 100);
            }
        };

        setupButtons();
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

        // Add mouse event support for desktop
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleMouseDown(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleMouseMove(e);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleMouseUp(e);
        });

        // Handle mouse leaving the canvas
        this.canvas.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleMouseUp(e);
        });
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate touch position using CSS coordinates (not scaled by device pixel ratio)
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        

        
        // Transform pointer coordinates to grid coordinates and log the touch event
        const gridCoords = this.pointerToGridCoordinates(x, y);
        if (gridCoords) {
            // do not remove this log even during cleanup
            console.log(`👆 Touch at grid coordinates: (${gridCoords.x}, ${gridCoords.y}) on face: ${this.currentFace}`);
        } else {
            // do not remove this log even during cleanup
            console.log(`👆 Touch outside board at canvas coordinates: (${x}, ${y})`);
        }
        
        // Check for touches on balls with tails - on any visited node
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            
            // Only consider balls with tails on the current face
            if (!ball.hasTail || this.getBallCurrentFace(ball) !== this.currentFace) continue;
            
            // Check if ball has visited nodes
            if (ball.visitedNodes && ball.visitedNodes.length > 0) {
                // Check if touch is on any visited node (only if gridCoords is not null)
                if (gridCoords) {
                    const touchedVisitedNode = ball.visitedNodes.find(node => 
                        node.x === gridCoords.x && 
                        node.y === gridCoords.y && 
                        node.face === this.currentFace
                    );
                    
                    if (touchedVisitedNode) {
                        // Trigger multi-step backtracking for this ball
                        this.triggerMultiStepBacktracking(i, touchedVisitedNode);
                    }
                }
            }
        }
        
        // Use touch target size based on touch ball scale
        const touchTargetSize = this.getLogicalBallRadius() * this.getTouchBallScale() * 2;
        
        // Check if touch is near any ball - find the closest one within touch range
        let closestBallIndex = -1;
        let closestDistance = Infinity;
        
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            
            // Only consider balls on the current face
            if (this.getBallCurrentFace(ball) !== this.currentFace) continue;
            
            // Skip balls that are currently backtracking
            if (this.isBacktracking[i]) {
                continue;
            }
            
            const distanceToBall = this.manhattanDistance(x, y, ball.x, ball.y);

            if (distanceToBall <= touchTargetSize && distanceToBall < closestDistance) {
                closestDistance = distanceToBall;
                closestBallIndex = i;
            }
        }
        
        if (closestBallIndex !== -1) {
            const selectedBall = this.balls[closestBallIndex];
            
            this.selectedBallIndex = closestBallIndex;
            this.touchStartPos = { x, y };
            this.isDragging = true;
            
            // Store the origin node when ball is picked up
            const originGridX = Math.round((selectedBall.x - this.boardStartX) / this.gridSize);
            const originGridY = Math.round((selectedBall.y - this.boardStartY) / this.gridSize);
            this.ballOriginNode = { x: originGridX, y: originGridY };
            
            // Mark ball as clamped
            this.isBallClamped[closestBallIndex] = true;
            
            // Start background music on first user interaction
            if (this.soundManager && !this.soundManager.musicStarted) {
                this.soundManager.playBackgroundMusic();
                this.soundManager.musicStarted = true;
            }
            
            // Play ball pickup sound
            if (this.soundManager) {
                this.soundManager.playSound('ballPickup');
            }
            
            // Reset backtracking flag when starting to drag a ball
            this.isBacktracking[closestBallIndex] = false;
            
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
        
        // Store current touch position for enhanced system
        this.touchPosition = { x: touchX, y: touchY };
        
        const ball = this.balls[this.selectedBallIndex];
        if (!ball) return;
        
        // Convert origin node to absolute coordinates
        const originX = this.boardStartX + this.ballOriginNode.x * this.gridSize;
        const originY = this.boardStartY + this.ballOriginNode.y * this.gridSize;
        
        // Calculate distance from touch to origin node
        const distanceFromOrigin = this.manhattanDistance(touchX, touchY, originX, originY);
        
        // Note: Removed automatic drop behavior - ball stays clamped regardless of touch distance
        
        const threshold = this.gridSize / 4; // gridBoxSize / 4
        
        // Step 2: As long as touch distance from origin node is <= gridBoxSize / 4, stay there
        if (distanceFromOrigin <= threshold) {
            // Ball stays at origin node
            this.moveBallToPosition(originX, originY, true);
            return;
        }
        
        // Step 3: Enhanced ball movement system
        // Handle clamped ball movement using the new system
        // This will automatically continue transitions until touch distance is within threshold
        this.handleClampedBallMovement(this.selectedBallIndex, this.touchPosition);
    }

    handleTouchEnd(e) {
        if (this.isDragging && this.selectedBallIndex !== -1) {
            // Hide touch feedback with fade out
            this.hideTouchFeedback();
            
            // Get the final position where the ball was dropped
            const ball = this.balls[this.selectedBallIndex];
            
            // Play ball drop sound
            if (this.soundManager) {
                this.soundManager.playSound('ballDrop');
            }
            
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
                    this.moveBallToPosition(finalSnapX, finalSnapY, true);
                    // Start blocked well animation after a small delay
                    setTimeout(() => {
                        this.startBlockedWellAnimation(ball, snappedGridX, snappedGridY);
                    }, 100);
                } else {
                    // Destination is free, proceed with well transfer
                    this.moveBallToPosition(finalSnapX, finalSnapY, true);
                    
                    // Check if ball entered a switch when dropped
                    this.checkSwitchActivation(this.selectedBallIndex);
                    
                    // Start well animation after a small delay to let the snap complete
                    setTimeout(() => {
                        this.startWellAnimation(ball, snappedGridX, snappedGridY);
                    }, 100); // Small delay to let snap animation complete
                }
            } else {
                // Snap to final position (not a well)
                // Set isDragging to false BEFORE the final snap so it uses the fast EASE duration
                this.isDragging = false;
                this.moveBallToPosition(finalSnapX, finalSnapY, true);
                
                // Check if ball entered a switch when dropped
                this.checkSwitchActivation(this.selectedBallIndex);
                
                // Check win condition when drag is released, but wait for touch feedback animations to complete
                this.checkWinConditionAfterTouchAnimations();
            }
        }
        
        // Reset enhanced ball movement properties
        let justUnclampedBallIndex = -1;
        if (this.selectedBallIndex !== -1) {
            justUnclampedBallIndex = this.selectedBallIndex;
            this.isBallClamped[this.selectedBallIndex] = false;
        }
        
        // Ensure all balls return to rest scale when touch ends
        this.balls.forEach((ball, ballIndex) => {
            if (ball.isTouched) {
                // Always clean up touch feedback for the ball that was just unclamped
                // or for any ball that is not clamped
                if (ballIndex === justUnclampedBallIndex || !this.isBallClamped[ballIndex]) {
                    ball.isTouched = false;
                    ball.touchOpacity = 0.0;
                    ball.touchScale = this.restScale;
                }
            }
        });
        
        this.touchPosition = null;
        
        this.touchStartPos = null;
        this.isDragging = false;
        this.selectedBallIndex = -1; // Reset selected ball
        
        // Reset ball drag/snap tracking properties
        this.ballOriginNode = null;
    }

    // Mouse event handlers for desktop support
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate mouse position using CSS coordinates
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        

        
        // Transform pointer coordinates to grid coordinates and log the click event
        const gridCoords = this.pointerToGridCoordinates(x, y);
        if (gridCoords) {
            // do not remove this log even during cleanup
            console.log(`🖱️ Mouse click at grid coordinates: (${gridCoords.x}, ${gridCoords.y}) on face: ${this.currentFace}`);
        } else {
            // do not remove this log even during cleanup
            console.log(`🖱️ Mouse click outside board at canvas coordinates: (${x}, ${y})`);
        }
        
        // Check for clicks on balls with tails - on any visited node
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            
            // Only consider balls with tails on the current face
            if (!ball.hasTail || this.getBallCurrentFace(ball) !== this.currentFace) continue;
            
            // Check if ball has visited nodes
            if (ball.visitedNodes && ball.visitedNodes.length > 0) {
                // Check if click is on any visited node (only if gridCoords is not null)
                if (gridCoords) {
                    const clickedVisitedNode = ball.visitedNodes.find(node => 
                        node.x === gridCoords.x && 
                        node.y === gridCoords.y && 
                        node.face === this.currentFace
                    );
                    
                    if (clickedVisitedNode) {
                        // Trigger multi-step backtracking for this ball
                        this.triggerMultiStepBacktracking(i, clickedVisitedNode);
                    }
                }
            }
        }
        
        // Use mouse target size based on touch ball scale
        const mouseTargetSize = this.getLogicalBallRadius() * this.getTouchBallScale() * 2;
        
        // Check if mouse is near any ball - find the closest one within mouse range
        let closestBallIndex = -1;
        let closestDistance = Infinity;
        
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            
            // Only consider balls on the current face
            if (this.getBallCurrentFace(ball) !== this.currentFace) continue;
            
            // Skip balls that are currently backtracking
            if (this.isBacktracking[i]) {
                continue;
            }
            
            const distanceToBall = this.manhattanDistance(x, y, ball.x, ball.y);

            if (distanceToBall <= mouseTargetSize && distanceToBall < closestDistance) {
                closestDistance = distanceToBall;
                closestBallIndex = i;
            }
        }
        
        if (closestBallIndex !== -1) {
            const selectedBall = this.balls[closestBallIndex];
            
            this.selectedBallIndex = closestBallIndex;
            this.touchStartPos = { x, y };
            this.isDragging = true;
            
            // Store the origin node when ball is picked up
            const originGridX = Math.round((selectedBall.x - this.boardStartX) / this.gridSize);
            const originGridY = Math.round((selectedBall.y - this.boardStartY) / this.gridSize);
            this.ballOriginNode = { x: originGridX, y: originGridY };
            
            // Mark ball as clamped
            this.isBallClamped[closestBallIndex] = true;
            
            // Start background music on first user interaction
            if (this.soundManager && !this.soundManager.musicStarted) {
                this.soundManager.playBackgroundMusic();
                this.soundManager.musicStarted = true;
            }
            
            // Play ball pickup sound
            if (this.soundManager) {
                this.soundManager.playSound('ballPickup');
            }
            
            // Reset backtracking flag when starting to drag a ball
            this.isBacktracking[closestBallIndex] = false;
            
            // Add visual feedback for mouse interaction
            this.showTouchFeedback(selectedBall);
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || this.selectedBallIndex === -1 || !this.ballOriginNode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate mouse position using CSS coordinates
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Store current mouse position for enhanced system
        this.touchPosition = { x: mouseX, y: mouseY };
        
        const ball = this.balls[this.selectedBallIndex];
        if (!ball) return;
        
        // Convert origin node to absolute coordinates
        const originX = this.boardStartX + this.ballOriginNode.x * this.gridSize;
        const originY = this.boardStartY + this.ballOriginNode.y * this.gridSize;
        
        // Calculate distance from mouse to origin node
        const distanceFromOrigin = this.manhattanDistance(mouseX, mouseY, originX, originY);
        
        const threshold = this.gridSize / 4; // gridBoxSize / 4
        
        // Step 2: As long as mouse distance from origin node is <= gridBoxSize / 4, stay there
        if (distanceFromOrigin <= threshold) {
            // Ball stays at origin node
            this.moveBallToPosition(originX, originY, true);
            return;
        }
        
        // Step 3: Enhanced ball movement system
        // Handle clamped ball movement using the new system
        // This will automatically continue transitions until mouse distance is within threshold
        this.handleClampedBallMovement(this.selectedBallIndex, this.touchPosition);
    }

    handleMouseUp(e) {
        if (this.isDragging && this.selectedBallIndex !== -1) {
            // Hide touch feedback with fade out
            this.hideTouchFeedback();
            
            // Get the final position where the ball was dropped
            const ball = this.balls[this.selectedBallIndex];
            
            // Play ball drop sound
            if (this.soundManager) {
                this.soundManager.playSound('ballDrop');
            }
            
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
                    this.moveBallToPosition(finalSnapX, finalSnapY, true);
                    // Start blocked well animation after a small delay
                    setTimeout(() => {
                        this.startBlockedWellAnimation(ball, snappedGridX, snappedGridY);
                    }, 100);
                } else {
                    // Destination is free, proceed with well transfer
                    this.moveBallToPosition(finalSnapX, finalSnapY, true);
                    
                    // Check if ball entered a switch when dropped
                    this.checkSwitchActivation(this.selectedBallIndex);
                    
                    // Start well animation after a small delay to let the snap complete
                    setTimeout(() => {
                        this.startWellAnimation(ball, snappedGridX, snappedGridY);
                    }, 100); // Small delay to let snap animation complete
                }
            } else {
                // Snap to final position (not a well)
                // Set isDragging to false BEFORE the final snap so it uses the fast EASE duration
                this.isDragging = false;
                this.moveBallToPosition(finalSnapX, finalSnapY, true);
                
                // Check if ball entered a switch when dropped
                this.checkSwitchActivation(this.selectedBallIndex);
                
                // Check win condition when drag is released, but wait for touch feedback animations to complete
                this.checkWinConditionAfterTouchAnimations();
            }
        }
        
        // Reset enhanced ball movement properties
        let justUnclampedBallIndex = -1;
        if (this.selectedBallIndex !== -1) {
            justUnclampedBallIndex = this.selectedBallIndex;
            this.isBallClamped[this.selectedBallIndex] = false;
        }
        
        // Ensure all balls return to rest scale when mouse interaction ends
        this.balls.forEach((ball, ballIndex) => {
            if (ball.isTouched) {
                // Always clean up touch feedback for the ball that was just unclamped
                // or for any ball that is not clamped
                if (ballIndex === justUnclampedBallIndex || !this.isBallClamped[ballIndex]) {
                    ball.isTouched = false;
                    ball.touchOpacity = 0.0;
                    ball.touchScale = this.restScale;
                }
            }
        });
        
        this.touchPosition = null;
        
        this.touchStartPos = null;
        this.isDragging = false;
        this.selectedBallIndex = -1; // Reset selected ball
        
        // Reset ball drag/snap tracking properties
        this.ballOriginNode = null;
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
        if (this.trailAnimationId) {
            cancelAnimationFrame(this.trailAnimationId);
            this.trailAnimationId = null;
        }
        
        // Clean up flip animation
        if (this.flipAnimationTimeout) {
            clearTimeout(this.flipAnimationTimeout);
            this.flipAnimationTimeout = null;
        }
        if (this.flipWrapper) {
            // Only remove the 'flipping' class, preserve the current face state
            this.flipWrapper.classList.remove('flipping');
            // Ensure the flip wrapper state matches the current face
            if (this.currentFace === 'rear') {
                this.flipWrapper.classList.add('flip-to-rear');
                this.flipWrapper.classList.remove('flip-to-front');
            } else {
                this.flipWrapper.classList.add('flip-to-front');
                this.flipWrapper.classList.remove('flip-to-rear');
            }
        }
        this.isFlipping = false;
        
        this.touchAnimationState = {};
        this.activeTrailAnimations = [];
    }

    // Start ball animation to target position
    animateBallToPosition(ballIndex, targetX, targetY, customDuration = null) {
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
        animation.duration = customDuration || CONSTANTS.ANIMATION_CONFIG.BALL_DRAG_DURATION;
        
        // Use instant easing for backtracking (very short duration), otherwise use quick easing
        if (customDuration === CONSTANTS.ANIMATION_CONFIG.BALL_BACKTRACK_DURATION) {
            animation.easing = 'INSTANT';
        } else {
            animation.easing = 'EASE_OUT_QUICK';
        }
        
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
                    
                    // Play ball snap sound when animation completes
                    if (this.soundManager) {
                        this.soundManager.playSound('ballSnap');
                    }
                    
                    // Check if ball entered a trap (skip during backtracking)
                    if (!this.isBacktracking[i]) {
                        this.checkTrapActivation(i);
                    }
        
        // Check if ball left any switches
        this.checkSwitchDeactivation(i);
                    
                    // Handle enhanced ball movement system completion
                    if (this.transitionInProgress[i]) {
                        this.completeBallTransition(i);
                    }
                } else {
                    anyAnimating = true;
                }
            }
        }

        // Check if there are any active goal animations
        const hasActiveGoalAnimations = this.goalAnimations.size > 0;
        
        // Check if there are any active trap animations
        const hasActiveTrapAnimations = this.checkTrapAnimations();
        
        // Check if there are any active switch animations
        const hasActiveSwitchAnimations = this.checkSwitchAnimations();
        
        // Continue animation loop if any balls are still animating OR if there are goal animations OR trap animations OR switch animations
        if (anyAnimating || hasActiveGoalAnimations || hasActiveTrapAnimations || hasActiveSwitchAnimations) {
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
        // If ball has a touch scale (being dragged), use that
        if (typeof ball.touchScale === 'number') {
            return ball.touchScale;
        }
        
        // If ball has a tail, use the tail rest scale
        if (ball.hasTail) {
            return CONSTANTS.RENDER_SIZE_CONFIG.BALL_TAIL_REST_SCALE;
        }
        
        // Otherwise use the normal rest scale
        return this.restScale;
    }

    getVisualBallRadius(ball) {
        return this.getLogicalBallRadius() * this.getVisualScale(ball);
    }

    // Get touch ball scale as ratio of grid size
    getTouchBallScale() {
        return CONSTANTS.RENDER_SIZE_CONFIG.BALL_TOUCH_SCALE_RATIO;
    }

    // Goal ring radii helpers (keep visuals proportional and reusable)
    getGoalInnerRadius() {
        return this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.GOAL_INNER_RADIUS_RATIO;
    }

    getGoalOuterRadius() {
        return this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.GOAL_OUTER_RADIUS_RATIO;
    }

    // Check if a goal position is occupied by a specific ball (by ball or tail disc)
    isGoalOccupied(goalX, goalY, face, ballIndex = -1) {
        // Check if the specific ball is at this goal position
        if (ballIndex >= 0 && ballIndex < this.balls.length) {
            const ball = this.balls[ballIndex];
            const ballFace = this.getBallCurrentFace(ball);
            if (ballFace === face) {
                const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
                const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
                
                // Use exact grid position match
                if (ballGridX === goalX && ballGridY === goalY) {
                    return true;
                }
            }
        }
        
        // Check if there's a tail disc from this specific ball at this goal position
        if (ballIndex >= 0 && this.nodeTails[face] && this.nodeTails[face][`${goalY}_${goalX}`]) {
            const tailData = this.nodeTails[face][`${goalY}_${goalX}`];
            if (tailData.ballIndex === ballIndex) {
                return true;
            }
        }
        
        return false;
    }

    // Update goal animation state
    updateGoalAnimation(goalKey, isOccupied) {
        const currentTime = Date.now();
        const animationDuration = CONSTANTS.ANIMATION_CONFIG.GOAL_TRANSITION_DURATION;
        
        // Determine target state
        const targetState = isOccupied ? 'active' : 'rest';
        
        // Get current state (default to target state if not tracked)
        const currentState = this.goalStates.get(goalKey) || targetState;
        
        // Only animate if state is actually changing
        if (currentState !== targetState) {
            if (!this.goalAnimations.has(goalKey)) {
                // Start new animation
                this.goalAnimations.set(goalKey, {
                    startTime: currentTime,
                    fromState: currentState,
                    toState: targetState,
                    progress: 0
                });
            } else {
                const animation = this.goalAnimations.get(goalKey);
                
                // If target changed during animation, update it
                if (animation.toState !== targetState) {
                    animation.startTime = currentTime;
                    animation.fromState = animation.toState; // Start from where we were going
                    animation.toState = targetState;
                    animation.progress = 0;
                }
            }
        }
        
        // Update progress for all animations
        this.goalAnimations.forEach((animation, key) => {
            const elapsed = currentTime - animation.startTime;
            animation.progress = Math.min(elapsed / animationDuration, 1);
            
            // Remove completed animations and update state
            if (animation.progress >= 1) {
                this.goalStates.set(key, animation.toState);
                this.goalAnimations.delete(key);
            }
        });
        
        // Start animation loop if not already running
        if (this.goalAnimations.size > 0 && !this.ballAnimationId) {
            this.ballAnimationId = requestAnimationFrame(() => this.ballAnimationLoop());
        }
    }

    // Get goal animation progress
    getGoalAnimationProgress(goalKey) {
        const animation = this.goalAnimations.get(goalKey);
        if (!animation) return 1; // No animation = fully transitioned
        
        // Apply easing function for smooth animation
        return CONSTANTS.ANIMATION_CONFIG.EASING.EASE_IN_OUT(animation.progress);
    }

    // Get current goal state
    getGoalState(goalKey) {
        return this.goalStates.get(goalKey) || 'rest';
    }

    // Update goal states after a ball has moved and tail system is updated
    updateGoalStatesAfterBallMove(ballIndex) {
        const ball = this.balls[ballIndex];
        if (!ball) return;
        
        // Get all end positions for this ball
        const endPositions = ball.endPositionsAbsolute || [];
        
        if (endPositions.length === 0) {
            // Fallback to legacy single end position
            if (this.getGoalCurrentFace(ball) !== this.currentFace) return;
            const endX = ball.endPosition.x;
            const endY = ball.endPosition.y;
            
            // Convert to grid coordinates for occupation check
            const goalGridX = Math.round((endX - this.boardStartX) / this.gridSize);
            const goalGridY = Math.round((endY - this.boardStartY) / this.gridSize);
            
            // Check if goal is occupied and update animation
            const isOccupied = this.isGoalOccupied(goalGridX, goalGridY, this.currentFace, ballIndex);
            const goalKey = `${endX}_${endY}_${this.currentFace}`;
            this.updateGoalAnimation(goalKey, isOccupied);
            return;
        }
        
        // Update all end positions for this ball
        endPositions.forEach(endPos => {
            // Only update goals for the current face
            if (endPos.face !== this.currentFace) return;
            
            const endX = endPos.x;
            const endY = endPos.y;
            
            // Convert to grid coordinates for occupation check
            const goalGridX = Math.round((endX - this.boardStartX) / this.gridSize);
            const goalGridY = Math.round((endY - this.boardStartY) / this.gridSize);
            
            // Check if goal is occupied and update animation
            const isOccupied = this.isGoalOccupied(goalGridX, goalGridY, this.currentFace, ballIndex);
            const goalKey = `${endX}_${endY}_${this.currentFace}`;
            this.updateGoalAnimation(goalKey, isOccupied);
        });
    }

    // Check if a grid node is already occupied by another ball on the same face
    isNodeOccupied(gridX, gridY, ignoreBallIndex = -1) {
        // Get the face of the ball being moved (if ignoreBallIndex is valid)
        let movingBallFace = 'front'; // Default to front
        if (ignoreBallIndex >= 0 && ignoreBallIndex < this.balls.length) {
            movingBallFace = this.getBallCurrentFace(this.balls[ignoreBallIndex]);
        }
        
        // Check if the moving ball is trying to return to a previously visited node
        if (ignoreBallIndex >= 0 && ignoreBallIndex < this.balls.length) {
            const movingBall = this.balls[ignoreBallIndex];
            if (movingBall.hasTail && movingBall.visitedNodes) {
                // Check if this node is in the ball's visited nodes list
                const isPreviouslyVisited = movingBall.visitedNodes.some(node => 
                    node.x === gridX && node.y === gridY && node.face === movingBallFace
                );
                
                // If it's a previously visited node, allow the ball to return
                if (isPreviouslyVisited) {
                    return false; // Not occupied for this ball
                }
            }
        }
        
        // Check if node has a tail property (occupied by any ball)
        if (this.nodeTails[movingBallFace] && this.nodeTails[movingBallFace][`${gridY}_${gridX}`]) {
            // Check if the tail belongs to the moving ball
            const tailData = this.nodeTails[movingBallFace][`${gridY}_${gridX}`];
            if (tailData.ballIndex === ignoreBallIndex) {
                return false; // Not occupied for this ball (it's their own tail)
            }
            return true; // Occupied by another ball's tail
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
            const fromNodeAllows = this.canBallMoveToNode(ballIndex, fromGridX, fromGridY);
            const toNodeAllows = this.canBallMoveToNode(ballIndex, toGridX, toGridY);
            
    
            
            return fromNodeAllows && toNodeAllows;
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
        
        // Get current and target node types for debugging
        const currentNodeType = this.getNodeTypeAt(currentGridX, currentGridY);
        const targetNodeType = this.getNodeTypeAt(targetGridX, targetGridY);
        

        
        // Check if target node allows this ball
        if (!this.canBallMoveToNode(ballIndex, targetGridX, targetGridY)) {

            return false;
        }
        
        // Check if nodes are connected (adjacent and both allow this ball)
        const areConnected = this.areNodesConnected(currentGridX, currentGridY, targetGridX, targetGridY, ballIndex);

        return areConnected;
    }

    showTouchFeedback(ball) {
        // Initialize animation state for this ball
        const ballId = this.balls.indexOf(ball);
        
        // Check if level is completed - if so, don't animate to clamped state
        // For test levels, always allow clamping animation (test levels are never "completed")
        const isLevelCompleted = this.currentLevel === 'test' ? false : this.storageManager.isLevelCompleted(this.currentLevel);
        
        this.touchAnimationState[ballId] = {
            isAnimating: true,
            startTime: Date.now(),
            duration: 150, // 150ms fade-in
            opacity: 0.0,
            scale: this.restScale,
            // Don't animate to clamped state if level is completed
            skipClampedAnimation: isLevelCompleted
        };
        
        // Start animation loop if not already running
        if (!this.animationFrameId) {
            this.animateTouchFeedback();
        }
    }



    hideTouchFeedback() {
        // Hide touch feedback for all balls that have active animations
        // This is called when touch ends, so we want to fade out all active touch feedback
        Object.keys(this.touchAnimationState).forEach(ballId => {
            const state = this.touchAnimationState[ballId];
            if (state && state.isAnimating && !state.fadeOut) {
                // Start fade out animation
                state.isAnimating = true;
                state.startTime = Date.now();
                state.duration = 200; // 200ms fade out
                state.fadeOut = true;
            }
        });
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
                // Shrink back towards restScale from the touch ball scale
                const targetScaleAtPeak = this.getTouchBallScale();
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
                
                // Check if we should skip the clamped animation (level completed)
                if (state.skipClampedAnimation) {
                    // Keep ball at rest scale if level is completed
                    state.scale = this.restScale;
                    
                    if (progress >= 1.0) {
                        state.opacity = 1.0;
                        state.scale = this.restScale;
                    }
                } else {
                    // Normal clamped animation - scale to touch ball scale ratio of grid size
                    const targetScaleAtPeak = this.getTouchBallScale();
                    state.scale = this.restScale + (targetScaleAtPeak - this.restScale) * progress;
                    
                    if (progress >= 1.0) {
                        state.opacity = 1.0;
                        state.scale = targetScaleAtPeak;
                    }
                }
            }

            this.balls[ballId].isTouched = true;
            this.balls[ballId].touchOpacity = state.opacity;
            this.balls[ballId].touchScale = state.scale;
            hasActiveAnimations = true;
        });



        // Render the frame
        this.render();

        // Continue animation if there are active touch animations
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
        
        // Get current node type to check if we're on a switch
        const currentGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const currentGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        const currentNodeType = this.getNodeTypeAt(currentGridX, currentGridY);
        const targetNodeType = this.getNodeTypeAt(targetGridX, targetGridY);
        
        // If we're on a switch, allow movement to any adjacent node
        const isOnSwitch = currentNodeType && currentNodeType.startsWith('s');
        const isMovingToAdjacent = Math.abs(targetGridX - currentGridX) + Math.abs(targetGridY - currentGridY) === 1;
        
        if (isOnSwitch && isMovingToAdjacent) {
            // Allow movement from switch to adjacent nodes without path validation

        } else {
            // Always validate path-based moves, even during dragging
            // This prevents balls from moving to invalid positions during drag
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
                    // Check if ball left any switches before moving
        this.checkSwitchDeactivation(this.selectedBallIndex);
        
        // Check if ball left any traps before moving
        this.checkTrapDeactivation(this.selectedBallIndex);
            // Handle visited nodes tracking for balls with tail (both during dragging and final placement)
            if (ball.hasTail && ball.visitedNodes) {
                
                // Get the previous position before moving
                const previousGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
                const previousGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
                const previousFace = this.getBallCurrentFace(ball);
                
                // Get the new position
                const newGridX = Math.round((clampedX - this.boardStartX) / this.gridSize);
                const newGridY = Math.round((clampedY - this.boardStartY) / this.gridSize);
                const newFace = this.getBallCurrentFace(ball);
                
                // Only proceed if the ball is actually moving to a different position
                if (previousGridX !== newGridX || previousGridY !== newGridY || previousFace !== newFace) {
                
                // Check if the ball is returning to the last visited node (only allow backtracking to the most recent location)
                const lastVisitedNode = ball.visitedNodes.length > 0 ? ball.visitedNodes[ball.visitedNodes.length - 1] : null;
                const isReturningToLastVisited = lastVisitedNode && 
                    lastVisitedNode.x === newGridX && 
                    lastVisitedNode.y === newGridY && 
                    lastVisitedNode.face === newFace;
                
                if (isReturningToLastVisited) {
                    // Remove the last visited node from visited nodes (ball is backtracking to the most recent location)
                    const removedNode = ball.visitedNodes.pop(); // Remove the last visited node
                    
                    // Remove tail from the connection between previous and current node
                    this.removeConnectionTail(previousGridX, previousGridY, newGridX, newGridY, this.selectedBallIndex);
                    
                    // Check if ball has no more visited nodes and should lose tail property
                    if (ball.visitedNodes.length === 0) {
                        ball.hasTail = false;
                    }
                } else {
                    
                    // Add the previous node to visited nodes (ball is moving forward)
                    const newNodeToAdd = {
                        x: previousGridX,
                        y: previousGridY,
                        face: previousFace
                    };
                    ball.visitedNodes.push(newNodeToAdd);
                                        
                    // Create tail on the node the ball just left
                    this.createNodeTail(previousGridX, previousGridY, this.selectedBallIndex, ball.color);
                    
                    // Create tail on the connection between previous and current node
                    this.createConnectionTail(previousGridX, previousGridY, newGridX, newGridY, this.selectedBallIndex, ball.color);
                }
                
                // Check if ball entered a sticker node and give it tail property
                const currentNodeType = this.getNodeTypeAt(newGridX, newGridY);
                if (currentNodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
                    
                    // Check if this sticker is already activated by this ball
                    const currentFace = this.getBallCurrentFace(ball);
                    const nodeKey = `${newGridY}_${newGridX}`;
                    const isAlreadyActivated = this.activatedStickers[currentFace] && 
                                             this.activatedStickers[currentFace][nodeKey] && 
                                             this.activatedStickers[currentFace][nodeKey].ballIndex === this.selectedBallIndex;
                    
                    if (!ball.hasTail && !isAlreadyActivated) {
                        ball.hasTail = true;
                        // Initialize visited nodes if not already done
                        if (!ball.visitedNodes) {
                            ball.visitedNodes = [];
                        }
                        // Activate the sticker with the ball's color
                        this.activateSticker(newGridX, newGridY, this.selectedBallIndex, ball.color);
                    }
                }
            }
            }
            
            if (animate) {
                // Use smooth animation for snapping
                this.animateBallToPosition(this.selectedBallIndex, clampedX, clampedY);
            } else {
                // Immediate update during dragging
                ball.x = clampedX;
                ball.y = clampedY;
                this.render();
            }
            
            // Play ball movement sound for significant movements
            if (this.soundManager && (Math.abs(ball.x - clampedX) > 5 || Math.abs(ball.y - clampedY) > 5)) {
                this.soundManager.playSound('ballMove', 0.3); // Lower volume for movement sounds
            }
            
            // Create movement trail animation for non-transition movements
            if (!this.transitionInProgress[this.selectedBallIndex]) {
                const ballColor = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
                this.createMovementTrail(clampedX, clampedY, ballColor);
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
            duration: 500,
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
            duration: 300, // Shorter animation for blocked transfer
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
                // For test levels, always check win condition
                // Also check if level was loaded via navigation (allows replaying completed levels)
                if (this.currentLevel === 'test' || !this.storageManager.isLevelCompleted(this.currentLevel) || this.levelLoadedViaNavigation) {
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
        
        // Ensure the ball is perfectly centered on the grid intersection
        const transferAbsX = this.boardStartX + (mappedX * this.gridSize);
        const transferAbsY = this.boardStartY + (mappedY * this.gridSize);
        
        // Update ball position to the transfer location
        ball.x = transferAbsX;
        ball.y = transferAbsY;
        
        // Reset any visual state that might cause positioning issues
        ball.isTouched = false;
        ball.touchOpacity = 0.0;
        ball.touchScale = this.restScale;
        ball.wellAnimationScale = undefined;
        ball.wellAnimationOpacity = undefined;
        
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
        
        // Update the enhanced ball movement system after well transfer
        const ballIndex = this.balls.indexOf(ball);
        if (ballIndex !== -1) {
            this.updateBallLastNode(ballIndex);
        }
        
        // Re-render to show the changes
        this.render();
    }
    
    // Convert board faces from space-separated strings to arrays of arrays
    convertBoardToArrays() {
        // Validate board structure first
        if (!this.board || typeof this.board !== 'object') {
            throw new Error('Board data is missing or invalid');
        }
        
        if (this.board.front) {
            if (!Array.isArray(this.board.front)) {
                throw new Error(`Front board should be an array, got ${typeof this.board.front}`);
            }
            this.board.front = this.board.front.map((row, index) => {
                if (typeof row !== 'string') {
                    throw new Error(`Expected string row at index ${index}, got ${typeof row}: ${JSON.stringify(row)}`);
                }
                return row.split(' ');
            });
        }
        if (this.board.rear) {
            if (!Array.isArray(this.board.rear)) {
                throw new Error(`Rear board should be an array, got ${typeof this.board.rear}`);
            }
            this.board.rear = this.board.rear.map((row, index) => {
                if (typeof row !== 'string') {
                    throw new Error(`Expected string row at index ${index}, got ${typeof row}: ${JSON.stringify(row)}`);
                }
                return row.split(' ');
            });
        }
    }

    /**
     * Loads a specific level and initializes the game state
     * @param {number|string} levelNumber - The level number to load, or 'test' for test levels
     * @returns {Promise<void>}
     * @throws {Error} When level data cannot be loaded or is invalid
     */
    async loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        // Synchronize with App instance if available
        if (this.appReference) {
            this.appReference.currentLevel = levelNumber;
        }
        
        // Always flip board to front face before level loading (invisible to user)
        this.flipToFrontFaceSilently();
        
        this.gameState.isPlaying = true;
        
        // Since we already silently flipped to front face, just ensure the flip wrapper state is correct
        // This prevents any visual glitches during level loading
        this.syncFlipWrapperState();
        
        // Reset the flag for next time
        this.isLevelProgression = false;
        
        // Reset exploding goals tracking
        this.explodingGoals.clear();
        
        // Reset completion status for this level when entering it (only for numbered levels)
        if (typeof levelNumber === 'number') {
            this.storageManager.resetLevelCompletion(levelNumber);
        }
        
        // Track if this level was loaded via navigation (for win condition checking)
        this.levelLoadedViaNavigation = false;
        
        // Hide the next level button when loading a new level
        const nextLevelButton = document.getElementById('nextLevelButton');
        if (nextLevelButton) {
            nextLevelButton.style.display = 'none';
            nextLevelButton.style.animation = '';
        }
        

        
        // Remove any remaining explosion discs
        const discs = document.querySelectorAll('.explosion-disc');
        discs.forEach(disc => {
            if (disc.parentElement) {
                disc.parentElement.removeChild(disc);
            }
        });
        
        try {
            let levelData;
            
            // Handle test levels
            if (levelNumber === 'test' && this.testLevelData) {
                levelData = this.testLevelData;
            } else {
                // Load level data from JSON file
                levelData = await this.storageManager.loadLevelData(levelNumber);
            }
            
            if (levelData && levelData.board && levelData.board.front) {
                // Validate the board structure
                if (!Array.isArray(levelData.board.front)) {
                    console.error('Front board is not an array:', levelData.board.front);
                    throw new Error(`Level ${levelNumber}: Front board should be an array`);
                }
                if (levelData.board.rear && !Array.isArray(levelData.board.rear)) {
                    console.error('Rear board is not an array:', levelData.board.rear);
                    throw new Error(`Level ${levelNumber}: Rear board should be an array`);
                }
                this.levelData = levelData;
            } else {
                if (levelNumber === 'test') {
                    console.error('Test level data is missing or invalid');
                    throw new Error('Test level data is missing or invalid');
                } else {
                    console.error(`Failed to load level ${levelNumber} from file`);
                    throw new Error(`Level ${levelNumber} not found or invalid`);
                }
            }
            
            this.board = this.levelData.board;
            
            			// Generate gradient colors based on level data
			this.gradientColors = Utils.generateGradientColors(this.levelData);
            
            // Apply gradient background to flip wrapper
            this.applyGradientToFlipWrapper();
            
            // Convert board faces from space-separated strings to arrays of arrays
            this.convertBoardToArrays();
            
            // Calculate board positioning first
            this.calculateBoardPosition();
            
            // Add toggle button if board has rear face (after board position is calculated)
            this.updateToggleButton();
            
            // Initialize balls array from level data
            this.initializeBalls();
            
            // Initialize enhanced ball movement system
            this.initializeEnhancedBallMovement();
            
            // Initialize tail system
            this.initializeTailSystem();
            
            // Update level number display in DOM
            this.updateLevelNumberDisplay();
            
            this.render();
            
            // Start the continuous glow animation
            this.startGlowAnimation();
            

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
        
        // Reset trap state when initializing balls (level reset/restart)
        this.closedTraps = {
            front: {},
            rear: {}
        };
        this.trapAnimations = {
            front: {},
            rear: {}
        };
        
        if (this.levelData.balls && this.levelData.balls.length > 0) {
            this.levelData.balls.forEach((ballData, index) => {
                
                // Handle coordinate system: positive = front, negative = rear
                // Editor uses: front = [col, row], rear = [-col, -row]
                const startX = ballData.start[0] < 0 ? -ballData.start[0] : ballData.start[0];
                const startY = ballData.start[1] < 0 ? -ballData.start[1] : ballData.start[1];
                
                // Handle multiple end positions - convert to array format
                let endPositions = [];
                if (Array.isArray(ballData.end[0])) {
                    // New format: end is array of arrays [[x1,y1], [x2,y2], ...]
                    endPositions = ballData.end;
                } else {
                    // Legacy format: end is single [x,y] array
                    endPositions = [ballData.end];
                }
                
                // Convert end positions to absolute coordinates
                const endPositionsAbsolute = endPositions.map(endPos => {
                    const endX = endPos[0] < 0 ? -endPos[0] : endPos[0];
                    const endY = endPos[1] < 0 ? -endPos[1] : endPos[1];
                    return {
                        x: this.boardStartX + (endX * this.gridSize),
                        y: this.boardStartY + (endY * this.gridSize),
                        gridX: endX,
                        gridY: endY,
                        face: endPos[0] < 0 || endPos[1] < 0 ? 'rear' : 'front'
                    };
                });
                
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
                    originalEnd: ballData.end, // Keep for backward compatibility
                    endPositions: endPositions, // New: array of end positions
                    endPositionsAbsolute: endPositionsAbsolute, // New: converted to absolute coordinates
                    // Track which face the ball is currently on
                    currentFace: ballData.start[0] < 0 || ballData.start[1] < 0 ? 'rear' : 'front',
                    // Legacy: keep single endPosition for backward compatibility
                    endPosition: endPositionsAbsolute[0] || {
                        x: this.boardStartX + (4 * this.gridSize),
                        y: this.boardStartY + (4 * this.gridSize)
                    },
                    // Tail system property
                    hasTail: false,
                    // Visited nodes tracking for tail system
                    visitedNodes: [], // Array of {x, y, face} objects representing visited nodes
                    // Trap system property
                    isTrapped: false, // Track if ball is trapped by a trap node
                    // Animation properties for smooth movement
                    animation: {
                        isAnimating: false,
                        startX: 0,
                        startY: 0,
                        targetX: 0,
                        targetY: 0,
                        startTime: 0,
                        duration: CONSTANTS.ANIMATION_CONFIG.BALL_DRAG_DURATION,
                        easing: 'EASE_OUT_QUICK'
                    }
                };
                

                
                // Note: Sticker detection and activation is now handled in initializeTailSystem()
                
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
                hasTail: false, // Tail system property
                visitedNodes: [], // Array of {x, y, face} objects representing visited nodes
                isTrapped: false, // Track if ball is trapped by a trap node
                endPositions: [[4, 2]], // New: array of end positions
                endPositionsAbsolute: [{ // New: converted to absolute coordinates
                    x: this.boardStartX + (4 * this.gridSize),
                    y: this.boardStartY + (2 * this.gridSize),
                    gridX: 4,
                    gridY: 2,
                    face: 'front'
                }],
                endPosition: { // Legacy: keep single endPosition for backward compatibility
                    x: this.boardStartX + (4 * this.gridSize),
                    y: this.boardStartY + (2 * this.gridSize)
                }
            };
            this.balls.push(defaultBall);
        }
        
        // Initialize goal states
        this.initializeGoalStates();
        
        // Initialize glow animations for all balls
        this.initializeGlowAnimations();
    }

    // Initialize goal states for all balls
    initializeGoalStates() {
        // Clear existing goal states
        this.goalStates.clear();
        this.goalAnimations.clear();
        
        this.balls.forEach((ball, ballIndex) => {
            // Get all end positions for this ball
            const endPositions = ball.endPositionsAbsolute || [];
            
            if (endPositions.length === 0) {
                // Fallback to legacy single end position
                if (this.getGoalCurrentFace(ball) !== this.currentFace) return;
                const endX = ball.endPosition.x;
                const endY = ball.endPosition.y;
                const goalKey = `${endX}_${endY}_${this.currentFace}`;
                
                // Convert to grid coordinates for occupation check
                const goalGridX = Math.round((endX - this.boardStartX) / this.gridSize);
                const goalGridY = Math.round((endY - this.boardStartY) / this.gridSize);
                const isOccupied = this.isGoalOccupied(goalGridX, goalGridY, this.currentFace);
                
                // Set initial state
                this.goalStates.set(goalKey, isOccupied ? 'active' : 'rest');
            } else {
                // Handle multiple end positions
                endPositions.forEach(endPos => {
                    if (endPos.face !== this.currentFace) return;
                    
                    const endX = endPos.x;
                    const endY = endPos.y;
                    const goalKey = `${endX}_${endY}_${this.currentFace}`;
                    
                    // Convert to grid coordinates for occupation check
                    const goalGridX = Math.round((endX - this.boardStartX) / this.gridSize);
                    const goalGridY = Math.round((endY - this.boardStartY) / this.gridSize);
                    const isOccupied = this.isGoalOccupied(goalGridX, goalGridY, this.currentFace);
                    
                    // Set initial state
                    this.goalStates.set(goalKey, isOccupied ? 'active' : 'rest');
                });
            }
        });
    }

    /**
     * Checks if all balls have reached their goal positions
     * Triggers level completion if win condition is met
     * @returns {void}
     */
    checkWinCondition() {
        if (!this.canvas || this.balls.length === 0) return;
        
        // Check if all balls satisfy their win conditions
        const allBallsAtGoal = this.balls.every((ball, ballIndex) => {
            const isAtGoal = this.isBallAtGoal(ball, ballIndex);
            return isAtGoal;
        });
        
        if (allBallsAtGoal) {
            this.levelCompleted();
        }
    }

    /**
     * Checks win condition after touch feedback animations have completed
     * @returns {void}
     */
    checkWinConditionAfterTouchAnimations() {
        // Check if there are any active touch feedback animations
        const hasActiveTouchAnimations = Object.keys(this.touchAnimationState).some(ballId => {
            const state = this.touchAnimationState[ballId];
            return state && state.isAnimating;
        });

        if (hasActiveTouchAnimations) {
            // Wait for animations to complete, then check win condition
            setTimeout(() => {
                this.checkWinConditionAfterTouchAnimations();
            }, 50); // Check again in 50ms
        } else {
            // All touch animations are complete, now check win condition
            // For test levels, always check win condition
            // Also check if level was loaded via navigation (allows replaying completed levels)
            const isTestLevel = this.currentLevel === 'test';
            const isNotCompleted = !this.storageManager.isLevelCompleted(this.currentLevel);
            const wasLoadedViaNavigation = this.levelLoadedViaNavigation;
            

            
            if (isTestLevel || isNotCompleted || wasLoadedViaNavigation) {
                this.checkWinCondition();
            }
        }
    }

    /**
     * Checks if a specific ball satisfies its win condition
     * @param {Object} ball - The ball object to check
     * @param {number} ballIndex - The index of the ball
     * @returns {boolean} True if the ball satisfies its win condition
     */
    isBallAtGoal(ball, ballIndex) {
        // Convert ball's current position back to grid coordinates
        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        const ballFace = this.getBallCurrentFace(ball);
        
        // Get all end positions for this ball
        const endPositions = ball.endPositionsAbsolute || [];
        
        if (endPositions.length === 0) {
            // Fallback to legacy single end position
            const goalGridX = ball.originalEnd[0];
            const goalGridY = ball.originalEnd[1];
            const goalGridXConverted = goalGridX < 0 ? -goalGridX : goalGridX;
            const goalGridYConverted = goalGridY < 0 ? -goalGridY : goalGridY;
            const goalFace = goalGridX < 0 || goalGridY < 0 ? 'rear' : 'front';
            
            return ballGridX === goalGridXConverted && 
                   ballGridY === goalGridYConverted && 
                   ballFace === goalFace;
        }
        
        // Check if ball is at one of its end positions
        const ballAtEndPosition = endPositions.some(endPos => {
            return ballGridX === endPos.gridX && 
                   ballGridY === endPos.gridY && 
                   ballFace === endPos.face;
        });
        
        if (!ballAtEndPosition) {
            return false; // Ball is not at any end position
        }
        
        // Check if all other end positions have tail discs from this ball
        const allOtherEndPositionsHaveTail = endPositions.every(endPos => {
            // Skip the end position where the ball currently is
            if (ballGridX === endPos.gridX && 
                ballGridY === endPos.gridY && 
                ballFace === endPos.face) {
                return true; // This is the position where the ball is, so it's "satisfied"
            }
            
            // Check if this end position has a tail disc from this ball
            const nodeKey = `${endPos.gridY}_${endPos.gridX}`;
            const face = endPos.face;
            
            return this.nodeTails[face] && 
                   this.nodeTails[face][nodeKey] && 
                   this.nodeTails[face][nodeKey].ballIndex === ballIndex;
        });
        
        return allOtherEndPositionsHaveTail;
    }



    levelCompleted() {
        this.gameState.isPlaying = false;
        
        // Save progress (skip for test levels)
        if (this.currentLevel !== 'test') {
            this.storageManager.saveGameProgress(this.currentLevel);
        }
        
        // Play level completion sound
        if (this.soundManager) {
            this.soundManager.playSound('levelComplete');
        }
        
        // First, ensure all balls return to rest scale
        this.balls.forEach((ball, ballIndex) => {
            if (ball.isTouched) {
                ball.isTouched = false;
                ball.touchOpacity = 0.0;
                ball.touchScale = this.restScale;
            }
        });
        
        // Clear all touch animation states
        this.touchAnimationState = {};
        
        // Stop all animations immediately when win condition is met
        this.cleanupAnimations();
        
        // Stop glow animation when level is completed
        this.stopGlowAnimation();
        
        // Create explosion animations for each goal node
        this.createExplosionAnimations();
        
        // Show next level button after delay instead of overlay
        setTimeout(() => {
            this.showNextLevelButton();
        }, CONSTANTS.ANIMATION_CONFIG.NEXT_LEVEL_BUTTON_DELAY);
    }

    createExplosionAnimations() {
        if (!this.balls || !this.canvas) return;
        
        const config = CONSTANTS.ANIMATION_CONFIG;
        
        // Create explosions for all end positions on the current face
        let explosionIndex = 0;
        
        this.balls.forEach((ball, ballIndex) => {
            const endPositions = ball.endPositionsAbsolute || [];
            const ballColorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
            
            if (endPositions.length === 0) {
                // Fallback to legacy single end position
                if (this.getGoalCurrentFace(ball) === this.currentFace) {
                    setTimeout(() => {
                        this.createExplosionDisc(ball.endPosition.x, ball.endPosition.y, config, explosionIndex, ballColorHex);
                    }, explosionIndex * config.EXPLOSION_DELAY);
                    explosionIndex++;
                }
                return;
            }
            
            // Create explosions for all end positions on the current face
            endPositions.forEach(endPos => {
                if (endPos.face === this.currentFace) {
                    setTimeout(() => {
                        this.createExplosionDisc(endPos.x, endPos.y, config, explosionIndex, ballColorHex);
                    }, explosionIndex * config.EXPLOSION_DELAY);
                    explosionIndex++;
                }
            });
        });
    }



    createExplosionDisc(x, y, config, index, ballColorHex) {
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
        
        // Mark this goal position as having started its explosion
        const goalKey = `${x}_${y}_${this.currentFace}`;
        if (!this.explodingGoals) {
            this.explodingGoals = new Set();
        }
        this.explodingGoals.add(goalKey);
        
        // Re-render to show this goal node in exact ball color
        this.render();
        
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
        
        // Set the explosion color to a brightened version of the ball color
        const brightenedColor = this.brightenColor(ballColorHex, CONSTANTS.LEVEL_CONFIG.EXPLOSION_BRIGHTENING_FACTOR);
        disc.style.backgroundColor = brightenedColor;
        
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

    // Create movement trail animation at destination node
    createMovementTrail(x, y, ballColor) {
        if (!this.canvas || !CONSTANTS.ANIMATION_CONFIG.TRAIL_ENABLED) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Convert canvas coordinates to screen coordinates
        let screenX = (x / this.displayWidth) * canvasRect.width;
        let screenY = (y / this.displayHeight) * canvasRect.height;
        
        // Apply horizontal reflection for rear face (same as in render method)
        if (this.currentFace === 'rear') {
            screenX = canvasRect.width - screenX;
        }
        
        // Calculate trail radii based on ball radius (half the size of explosion)
        const ballRadius = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.BALL_RADIUS_RATIO;
        const startRadius = ballRadius * CONSTANTS.ANIMATION_CONFIG.TRAIL_MIN_RADIUS_FACTOR;
        const maxRadius = ballRadius * CONSTANTS.ANIMATION_CONFIG.TRAIL_MAX_RADIUS_FACTOR;
        const ringThickness = ballRadius * CONSTANTS.ANIMATION_CONFIG.TRAIL_RING_THICKNESS_FACTOR;
        
        // Create trail animation object
        const trailAnimation = {
            id: Date.now() + Math.random(), // Unique ID
            x: screenX,
            y: screenY,
            startRadius: startRadius,
            maxRadius: maxRadius,
            ringThickness: ringThickness,
            startTime: performance.now(),
            duration: CONSTANTS.ANIMATION_CONFIG.TRAIL_DURATION,
            color: '#FFFFFF', // Always white
            opacity: CONSTANTS.ANIMATION_CONFIG.TRAIL_OPACITY
        };
        
        // Add to active animations
        this.activeTrailAnimations.push(trailAnimation);
        
        // Start animation loop if not already running
        if (!this.trailAnimationId) {
            this.trailAnimationLoop();
        }
    }

    // Trail animation loop
    trailAnimationLoop() {
        const currentTime = performance.now();
        let hasActiveAnimations = false;

        // Update all active trail animations
        for (let i = this.activeTrailAnimations.length - 1; i >= 0; i--) {
            const animation = this.activeTrailAnimations[i];
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            // Ease-out function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Calculate current ring radii and opacity
            const currentRadius = animation.startRadius + (animation.maxRadius - animation.startRadius) * easeOut;
            const currentOpacity = animation.opacity * (1 - progress);
            
            // Calculate inner and outer radii for the ring
            const innerRadius = Math.max(0, currentRadius - animation.ringThickness / 2);
            const outerRadius = currentRadius + animation.ringThickness / 2;
            
            // Store current animation state for rendering
            animation.currentInnerRadius = innerRadius;
            animation.currentOuterRadius = outerRadius;
            animation.currentOpacity = currentOpacity;
            animation.progress = progress;
            
            if (progress >= 1) {
                // Animation complete, remove from array
                this.activeTrailAnimations.splice(i, 1);
            } else {
                hasActiveAnimations = true;
            }
        }

        // Continue animation loop if any trails are still animating
        if (hasActiveAnimations) {
            this.render(); // Re-render with updated trail animations
            this.trailAnimationId = requestAnimationFrame(() => this.trailAnimationLoop());
        } else {
            this.trailAnimationId = null;
        }
    }

    showNextLevelButton() {
        // Show the next level button
        const nextLevelButton = document.getElementById('nextLevelButton');
        if (nextLevelButton) {
            nextLevelButton.style.display = 'flex';
            // Add fade-in animation only, icon has its own glow
            nextLevelButton.style.animation = 'fadeIn 0.5s ease-out';
        }
        
        // Animate flip button position if present
        this.animateFlipButtonPosition();
    }
    
    /**
     * Animate the flip button to its new position when next level button appears
     */
    animateFlipButtonPosition() {
        const flipButton = document.getElementById('faceToggleButton');
        if (!flipButton) return;
        
        // Add a small delay to ensure the next level button is rendered
        setTimeout(() => {
            // Force a reflow to ensure the new layout is calculated
            // This triggers the existing position transition
            flipButton.offsetHeight;
        }, 50);
    }
    
    /**
     * Animate the flip button back to original position when next level button is hidden
     * @returns {Promise} Promise that resolves when animation is complete
     */
    async animateFlipButtonBack() {
        const flipButton = document.getElementById('faceToggleButton');
        if (!flipButton) return Promise.resolve();
        
        return new Promise((resolve) => {
            // Force a reflow to ensure the new layout is calculated
            // This triggers the existing position transition
            flipButton.offsetHeight;
            
            // Wait for the transition to complete
            setTimeout(() => {
                resolve();
            }, 300); // Match the transition duration
        });
    }
    
    /**
     * Fade out the flip button during level transition
     */
    fadeOutFlipButton() {
        const flipButton = document.getElementById('faceToggleButton');
        if (!flipButton) return;
        
        flipButton.classList.add('fade-out');
    }
    
    /**
     * Fade in the flip button during level transition
     */
    fadeInFlipButton() {
        const flipButton = document.getElementById('faceToggleButton');
        if (!flipButton) return;
        
        flipButton.classList.remove('fade-out');
        flipButton.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
            flipButton.classList.remove('fade-in');
        }, CONSTANTS.ANIMATION_CONFIG.LEVEL_FADE_IN_DURATION);
    }
    
    /**
     * Fade in the flip button if it was faded out and is needed for the new level
     */
    fadeInFlipButtonIfNeeded() {
        const flipButton = document.getElementById('faceToggleButton');
        if (!flipButton) return;
        
        // Only fade in if the button has the fade-out class (was faded out)
        if (flipButton.classList.contains('fade-out')) {
            flipButton.classList.remove('fade-out');
            flipButton.classList.add('fade-in');
            
            // Remove fade-in class after animation completes
            setTimeout(() => {
                flipButton.classList.remove('fade-in');
            }, CONSTANTS.ANIMATION_CONFIG.LEVEL_FADE_IN_DURATION);
        }
    }
    
    /**
     * Fade out both next level button and flip button together
     * @returns {Promise} Promise that resolves when fade out is complete
     */
    async fadeOutButtons() {
        const nextLevelButton = document.getElementById('nextLevelButton');
        const flipButton = document.getElementById('faceToggleButton');
        
        return new Promise((resolve) => {
            // Fade out next level button if present
            if (nextLevelButton) {
                nextLevelButton.classList.add('fade-out');
            }
            
            // Fade out flip button if present
            if (flipButton) {
                flipButton.classList.add('fade-out');
            }
            
            // Wait for fade out animation to complete
            setTimeout(() => {
                // Hide next level button after fade out
                if (nextLevelButton) {
                    nextLevelButton.style.display = 'none';
                    nextLevelButton.style.animation = '';
                    nextLevelButton.classList.remove('fade-out');
                }
                resolve();
            }, CONSTANTS.ANIMATION_CONFIG.LEVEL_FADE_OUT_DURATION);
        });
    }

    async proceedToNextLevel() {
        // For test level mode, don't proceed to next level
        if (this.currentLevel === 'test') {
            console.log('Next level button disabled in test mode');
            return;
        }
        
        // Fade out both buttons together
        await this.fadeOutButtons();
        
        // Clean up any remaining explosion discs
        const discs = document.querySelectorAll('.explosion-disc');
        discs.forEach(disc => {
            if (disc.parentElement) {
                disc.parentElement.removeChild(disc);
            }
        });
        
        // Ensure game state is properly reset
        this.gameState.isPlaying = true;
        
        // Proceed to next level with fade transition
        this.nextLevelWithFade();
    }
    
    /**
     * Fade out the current level
     * @returns {Promise} Promise that resolves when fade out is complete
     */
    async fadeOut() {
        if (!this.ensureFlipWrapper()) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            // Add fade-out class to flip wrapper
            this.flipWrapper.classList.add('fade-out');
            
            // Also fade out the flip button if present
            this.fadeOutFlipButton();
            
            // Wait for fade out animation to complete
            setTimeout(() => {
                resolve();
            }, CONSTANTS.ANIMATION_CONFIG.LEVEL_FADE_OUT_DURATION);
        });
    }
    
    /**
     * Fade in the new level
     * @returns {Promise} Promise that resolves when fade in is complete
     */
    async fadeIn() {
        if (!this.ensureFlipWrapper()) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            // Remove fade-out class and add fade-in class
            this.flipWrapper.classList.remove('fade-out');
            this.flipWrapper.classList.add('fade-in');
            
            // Also fade in the flip button if present and needed
            this.fadeInFlipButtonIfNeeded();
            
            // Wait for fade in animation to complete
            setTimeout(() => {
                this.flipWrapper.classList.remove('fade-in');
                resolve();
            }, CONSTANTS.ANIMATION_CONFIG.LEVEL_FADE_IN_DURATION);
        });
    }
    
    /**
     * Load level with fade transition
     * @param {number} levelNumber - The level number to load
     * @returns {Promise} Promise that resolves when level is loaded and faded in
     */
    async loadLevelWithFade(levelNumber) {
        // Fade out current level
        await this.fadeOut();
        
        // Load new level
        await this.loadLevel(levelNumber);
        
        // Fade in new level
        await this.fadeIn();
    }
    
    /**
     * Next level with fade transition
     */
    async nextLevelWithFade() {
        this.currentLevel++;
        // Synchronize with App instance if available
        if (this.appReference) {
            this.appReference.currentLevel = this.currentLevel;
        }
        
        // Set flag to indicate this is a level progression (not a fresh start)
        this.isLevelProgression = true;
        
        if (this.currentLevel > CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
            // Show prize scene instead of loading a level
            if (this.appReference) {
                this.appReference.showPrizeScene();
            }
        } else {
            await this.loadLevelWithFade(this.currentLevel);
        }
    }

    nextLevel() {
        this.currentLevel++;
        // Synchronize with App instance if available
        if (this.appReference) {
            this.appReference.currentLevel = this.currentLevel;
        }
        
        // Set flag to indicate this is a level progression (not a fresh start)
        this.isLevelProgression = true;
        
        if (this.currentLevel > CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
            // Show prize scene instead of loading a level
            if (this.appReference) {
                this.appReference.showPrizeScene();
            }
        } else {
            this.loadLevel(this.currentLevel).catch(error => {
                console.error('Failed to load next level:', error);
            });
        }
    }

    resetLevel() {
        // Hide the next level button if it's visible
        const nextLevelButton = document.getElementById('nextLevelButton');
        if (nextLevelButton) {
            nextLevelButton.style.display = 'none';
            nextLevelButton.style.animation = '';
        }
        
        // Clean up any remaining explosion discs
        const discs = document.querySelectorAll('.explosion-disc');
        discs.forEach(disc => {
            if (disc.parentElement) {
                disc.parentElement.removeChild(disc);
            }
        });
        
        // Stop glow animation before resetting
        this.stopGlowAnimation();
        
        // Reset level with fade transition
        this.resetLevelWithFade();
    }
    
    /**
     * Reset level with fade transition
     */
    async resetLevelWithFade() {
        await this.loadLevelWithFade(this.currentLevel);
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
        
        // Apply gradient background if colors are available
        if (this.gradientColors) {
            this.applyGradientToFlipWrapper();
        }
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

    // Reset flip wrapper CSS classes to match current face state
    resetFlipWrapperState() {
        if (!this.ensureFlipWrapper()) {
            return;
        }
        
        // Temporarily disable transitions and hide the flip wrapper
        const originalTransition = this.flipWrapper.style.transition;
        const originalVisibility = this.flipWrapper.style.visibility;
        this.flipWrapper.style.transition = 'none';
        this.flipWrapper.style.visibility = 'hidden';
        
        // Remove all flip-related classes
        this.flipWrapper.classList.remove('flipping', 'flip-to-rear', 'flip-to-front');
        
        // Ensure the wrapper is in the correct state for front face
        // The default state (no classes) shows the front face
        this.flipWrapper.style.transform = 'rotateY(0deg)';
        
        // Force a reflow to ensure the changes are applied
        this.flipWrapper.offsetHeight;
        
        // Restore transition and visibility
        this.flipWrapper.style.transition = originalTransition || '';
        this.flipWrapper.style.visibility = originalVisibility || 'visible';
    }

    // Sync flip wrapper state to match current face without animation
    syncFlipWrapperState() {
        if (!this.ensureFlipWrapper()) {
            return;
        }
        
        // Temporarily disable transitions
        const originalTransition = this.flipWrapper.style.transition;
        this.flipWrapper.style.transition = 'none';
        
        // Remove all flip-related classes
        this.flipWrapper.classList.remove('flipping', 'flip-to-rear', 'flip-to-front');
        
        // Set the correct transform based on current face
        if (this.currentFace === 'rear') {
            this.flipWrapper.style.transform = 'rotateY(180deg)';
        } else {
            this.flipWrapper.style.transform = 'rotateY(0deg)';
        }
        
        // Force a reflow to ensure the changes are applied
        this.flipWrapper.offsetHeight;
        
        // Restore transition
        this.flipWrapper.style.transition = originalTransition || '';
    }

    // Flip board to front face without animation (invisible to user)
    flipToFrontFaceSilently() {
        if (!this.board || !this.board.rear || this.currentFace === 'front') {
            return; // Already on front face or no rear face
        }
        
        // If a flip animation is currently running, stop it first
        if (this.isFlipping) {
            // Clear any pending animation timeout
            if (this.flipAnimationTimeout) {
                clearTimeout(this.flipAnimationTimeout);
                this.flipAnimationTimeout = null;
            }
            this.isFlipping = false;
        }
        
        // Ensure flip wrapper is initialized
        if (!this.ensureFlipWrapper()) {
            return;
        }
        
        // Temporarily disable transitions and hide the flip wrapper
        const originalTransition = this.flipWrapper.style.transition;
        const originalVisibility = this.flipWrapper.style.visibility;
        this.flipWrapper.style.transition = 'none';
        this.flipWrapper.style.visibility = 'hidden';
        
        // Remove all flip-related classes
        this.flipWrapper.classList.remove('flipping', 'flip-to-rear', 'flip-to-front');
        
        // Set to front face state
        this.currentFace = 'front';
        this.flipWrapper.style.transform = 'rotateY(0deg)';
        
        // Force a reflow to ensure the changes are applied
        this.flipWrapper.offsetHeight;
        
        // Restore transition and visibility
        this.flipWrapper.style.transition = originalTransition || '';
        this.flipWrapper.style.visibility = originalVisibility || 'visible';
        
        // Recalculate connected nodes for all balls after face change
        this.recalculateAllConnectedNodes();
    }



    render() {
        if (!this.ctx) return;
        
        // Update glow animations
        this.updateGlowAnimations();
        
        // Reset context state to ensure clean rendering
        this.ctx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
        
        // Clear canvas using display dimensions (since context is scaled)
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        
        // Draw background gradient
        if (CONSTANTS.BACKGROUND_CONFIG.GRADIENT_ENABLED) {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.displayHeight);
            gradient.addColorStop(0, this.gradientColors.topColor);
            gradient.addColorStop(1, this.gradientColors.bottomColor);
            this.ctx.fillStyle = gradient;
        } else {
            this.ctx.fillStyle = '#000000';
        }
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        
        // Apply horizontal reflection for rear face
        if (this.currentFace === 'rear') {
            this.ctx.save();
            // Scale horizontally by -1 to flip the image
            this.ctx.scale(-1, 1);
            // Translate to compensate for the flip
            this.ctx.translate(-this.displayWidth, 0);
        }
        
        // Draw infinite grid first (under everything else)
        this.renderInfiniteGrid();
        
        // Draw grid
        this.renderGrid();
        
        // Draw path lines first
        this.renderPathLines();
        
        // Draw board nodes on top of path lines
        this.renderBoard();
        
        // Draw end goals
        this.renderEndGoals();
        
        // Draw trap open states (under balls)
        this.renderTrapOpenStates();
        
        // Draw tail connections on top of trap open states
        this.renderTailConnections();
        
        // Draw tail nodes on top of trap open states
        this.renderTailNodes();
        
        // Draw switches (under balls)
        this.renderSwitches();
        
        // Draw balls
        this.renderBalls();
        
        // Draw trap closed states (over balls)
        this.renderTrapClosedStates();
        
        // Draw movement trail animations (on top of everything)
        this.renderTrailAnimations();
        
        // Restore context if we applied reflection
        if (this.currentFace === 'rear') {
            this.ctx.restore();
        }
    }

    calculateBoardPosition() {
        if (!this.canvas || !this.board || !this.board.front) return;
        
        // Create a cache key based on the current state
        const cacheKey = `${this.displayWidth}x${this.displayHeight}_${this.board.front.length}x${this.board.front[0]?.length || 0}`;
        
        // Check if we have a cached result for this exact state
        if (this._boardPositionCache && this._boardPositionCache.key === cacheKey) {
            // Use cached values
            this.gridSize = this._boardPositionCache.gridSize;
            this.boardStartX = this._boardPositionCache.boardStartX;
            this.boardStartY = this._boardPositionCache.boardStartY;
            this.boardWidth = this._boardPositionCache.boardWidth;
            this.boardHeight = this._boardPositionCache.boardHeight;
            
            if (CONSTANTS.APP_CONFIG.DEVEL) {
                console.log('Using cached grid values:', {
                    gridSize: this.gridSize,
                    boardStartX: this.boardStartX,
                    boardStartY: this.boardStartY,
                    boardWidth: this.boardWidth,
                    boardHeight: this.boardHeight
                });
            }
            return;
        }
        
        const nodes = this.getCurrentNodes();
        if (!nodes) return;
        const boardRows = nodes.length;
        const boardCols = nodes[0] ? nodes[0].length : 0;
        
        if (boardRows === 0 || boardCols === 0) return;
        
        // Determine if we're on mobile or desktop
        const isDesktop = !this.isMobileDevice();
        
        // Calculate actual available space accounting for UI elements
        let availableWidth, availableHeight;
        
        if (isDesktop) {
            // Desktop: calculate actual available space by measuring UI elements
            const header = document.querySelector('.game-header');
            const headerHeight = header ? header.offsetHeight : 90;
            
            // Account for header and safe margins
            const safeMargin = 40; // Safe margin from edges
            availableWidth = this.displayWidth - (safeMargin * 2);
            availableHeight = this.displayHeight - headerHeight - (safeMargin * 2);
            
            // Ensure we have minimum available space
            availableHeight = Math.max(availableHeight, 300); // Minimum 300px available height for desktop
        } else {
            // Mobile: calculate actual available space by measuring UI elements
            const header = document.querySelector('.game-header');
            const footer = document.querySelector('.game-footer');
            
            // Get actual UI element heights with fallbacks
            const headerHeight = header ? header.offsetHeight : 90; // Default mobile header height
            const footerHeight = footer ? footer.offsetHeight : 80; // Default mobile footer height
            
            // Add extra padding for safe areas and touch targets
            const safeAreaPadding = 20;
            const totalVerticalUI = headerHeight + footerHeight + (safeAreaPadding * 2);
            
            // Calculate available space
            availableWidth = this.displayWidth - 40; // 20px margin on each side
            availableHeight = this.displayHeight - totalVerticalUI;
            
            // Ensure we have minimum available space
            availableHeight = Math.max(availableHeight, 200); // Minimum 200px available height
        }
        
        // For node-oriented grid: we need spacing between nodes, not cell sizes
        // For N nodes, we need (N-1) spaces between them
        const gridSpacingX = boardCols > 1 ? availableWidth / (boardCols - 1) : availableWidth;
        const gridSpacingY = boardRows > 1 ? availableHeight / (boardRows - 1) : availableHeight;
        
        // Calculate grid size with maximum constraints
        let gridSize;
        if (isDesktop) {
            // Desktop: limit to 15% width and 70% height
            const maxGridWidth = this.displayWidth * CONSTANTS.RENDER_SIZE_CONFIG.DESKTOP_MAX_WIDTH_RATIO;
            const maxGridHeight = this.displayHeight * CONSTANTS.RENDER_SIZE_CONFIG.DESKTOP_MAX_HEIGHT_RATIO;
            
            const maxGridSpacingX = boardCols > 1 ? maxGridWidth / (boardCols - 1) : maxGridWidth;
            const maxGridSpacingY = boardRows > 1 ? maxGridHeight / (boardRows - 1) : maxGridHeight;
            
            // Use the smaller spacing to ensure grid fits within both constraints
            gridSize = Math.min(maxGridSpacingX, maxGridSpacingY, gridSpacingX, gridSpacingY);
            
            // Debug logging for 8x16 boards
            if (boardCols === 8 && boardRows === 16) {
                console.log('8x16 Board Debug:', {
                    displayWidth: this.displayWidth,
                    displayHeight: this.displayHeight,
                    maxGridWidth,
                    maxGridHeight,
                    maxGridSpacingX,
                    maxGridSpacingY,
                    gridSpacingX,
                    gridSpacingY,
                    calculatedGridSize: gridSize,
                    boardCols,
                    boardRows
                });
            }
        } else {
            // Mobile: ensure grid fits within available space regardless of size
            const maxGridWidth = availableWidth * 0.95; // 95% of available width
            const maxGridHeight = availableHeight * 0.95; // 95% of available height
            
            // Calculate maximum grid size that would fit the available space
            const maxGridSpacingX = boardCols > 1 ? maxGridWidth / (boardCols - 1) : maxGridWidth;
            const maxGridSpacingY = boardRows > 1 ? maxGridHeight / (boardRows - 1) : maxGridHeight;
            
            // Use the smaller spacing to ensure grid fits within available space
            gridSize = Math.min(maxGridSpacingX, maxGridSpacingY, gridSpacingX, gridSpacingY);
            
            // Additional safety check: ensure the resulting grid actually fits
            const calculatedGridWidth = (boardCols - 1) * gridSize;
            const calculatedGridHeight = (boardRows - 1) * gridSize;
            
            if (calculatedGridHeight > availableHeight || calculatedGridWidth > availableWidth) {
                // Grid is still too large, force it to fit
                const maxAllowedGridSizeX = availableWidth / (boardCols - 1);
                const maxAllowedGridSizeY = availableHeight / (boardRows - 1);
                gridSize = Math.min(maxAllowedGridSizeX, maxAllowedGridSizeY, gridSize);
            }
        }
        
        // Ensure minimum grid size for consistent visual scaling across different window sizes
        // This prevents test levels from having different visual scaling than normal levels
        // For larger boards, use a smaller minimum to prevent oversized rendering
        const minGridSize = boardCols > 6 || boardRows > 10 ? 20 : 40; // Adaptive minimum grid size
        gridSize = Math.max(gridSize, minGridSize);
        
        // Round grid size to prevent floating-point precision issues
        gridSize = Math.round(gridSize);
        
        // Calculate board position to center it
        // Board area spans from first node to last node
        let boardWidth = (boardCols - 1) * gridSize;
        let boardHeight = (boardRows - 1) * gridSize;
        
        // Debug logging for 8x16 boards
        if (boardCols === 8 && boardRows === 16) {
            console.log('8x16 Board Final Dimensions:', {
                boardWidth,
                boardHeight,
                gridSize,
                minGridSize: boardCols > 6 || boardRows > 10 ? 20 : 40,
                boardStartX: Math.round((this.displayWidth - boardWidth) / 2),
                boardStartY: Math.round((this.displayHeight - boardHeight) / 2)
            });
        }
        
        // Center the grid both horizontally and vertically
        let boardStartX = Math.round((this.displayWidth - boardWidth) / 2);
        let boardStartY = Math.round((this.displayHeight - boardHeight) / 2);
        
        // Desktop: Ensure grid doesn't overlap with UI elements
        if (isDesktop) {
            const header = document.querySelector('.game-header');
            const headerHeight = header ? header.offsetHeight : 90;
            
            // Account for rendered elements that extend beyond grid boundaries
            const ballRadius = this.getLogicalBallRadius();
            const goalRadius = this.getGoalOuterRadius();
            const maxElementRadius = Math.max(ballRadius, goalRadius);
            
            // Calculate effective grid bounds including rendered elements
            const effectiveGridWidth = boardWidth + (maxElementRadius * 2);
            const effectiveGridHeight = boardHeight + (maxElementRadius * 2);
            
            // Ensure grid doesn't overlap with header
            const minTopPosition = headerHeight + maxElementRadius + 40; // 40px padding from header
            const maxTopPosition = this.displayHeight - effectiveGridHeight - maxElementRadius - 40; // 40px padding from bottom
            
            // Adjust vertical position if needed
            if (boardStartY < minTopPosition) {
                boardStartY = minTopPosition;
            } else if (boardStartY > maxTopPosition) {
                boardStartY = maxTopPosition;
            }
            
            // Ensure grid doesn't go off-screen horizontally
            const minLeftPosition = maxElementRadius + 20; // 20px padding from left
            const maxLeftPosition = this.displayWidth - effectiveGridWidth - maxElementRadius - 20; // 20px padding from right
            
            if (boardStartX < minLeftPosition) {
                boardStartX = minLeftPosition;
            } else if (boardStartX > maxLeftPosition) {
                boardStartX = maxLeftPosition;
            }
        }
        
        // Mobile: Ensure grid stays within viewport bounds
        if (!isDesktop) {
            const header = document.querySelector('.game-header');
            const footer = document.querySelector('.game-footer');
            const headerHeight = header ? header.offsetHeight : 90;
            const footerHeight = footer ? footer.offsetHeight : 80;
            
            // Calculate the actual available vertical space
            const availableVerticalSpace = this.displayHeight - headerHeight - footerHeight - 20; // 20px total padding
            
            // Account for rendered elements that extend beyond grid boundaries
            const ballRadius = this.getLogicalBallRadius();
            const goalRadius = this.getGoalOuterRadius();
            const maxElementRadius = Math.max(ballRadius, goalRadius);
            
            // Calculate effective grid bounds including rendered elements
            const effectiveGridWidth = boardWidth + (maxElementRadius * 2);
            const effectiveGridHeight = boardHeight + (maxElementRadius * 2);
            
            // If effective grid is larger than available space, scale it down
            if (effectiveGridHeight > availableVerticalSpace || effectiveGridWidth > availableWidth) {
                const scaleFactorY = availableVerticalSpace / effectiveGridHeight;
                const scaleFactorX = (availableWidth - 40) / effectiveGridWidth; // 40px horizontal padding
                const scaleFactor = Math.min(scaleFactorY, scaleFactorX, 0.9); // Cap at 90% to add padding
                
                const newGridSize = gridSize * scaleFactor;
                
                // Recalculate grid dimensions with new size
                gridSize = newGridSize;
                boardWidth = (boardCols - 1) * gridSize;
                boardHeight = (boardRows - 1) * gridSize;
            }
            
            // Position grid to ensure all elements fit within viewport
            const effectiveWidth = boardWidth + (maxElementRadius * 2);
            const effectiveHeight = boardHeight + (maxElementRadius * 2);
            
            // Center the grid itself (not the effective bounds) within available space
            boardStartX = Math.round((this.displayWidth - boardWidth) / 2);
            boardStartY = Math.round(headerHeight + (availableVerticalSpace / 2) - (boardHeight / 2));
            
            // Ensure the effective grid (including rendered elements) doesn't go off-screen
            const effectiveStartX = boardStartX - maxElementRadius;
            const effectiveStartY = boardStartY - maxElementRadius;
            
            // If effective bounds would go off-screen, adjust the grid position
            if (effectiveStartX < 10) {
                boardStartX = Math.round(maxElementRadius + 10);
            } else if (effectiveStartX + effectiveWidth > this.displayWidth - 10) {
                boardStartX = Math.round(this.displayWidth - effectiveWidth + maxElementRadius - 10);
            }
            
            if (effectiveStartY < headerHeight + 10) {
                boardStartY = Math.round(headerHeight + maxElementRadius + 10);
            } else if (effectiveStartY + effectiveHeight > this.displayHeight - footerHeight - 10) {
                boardStartY = Math.round(this.displayHeight - footerHeight - effectiveHeight + maxElementRadius - 10);
            }
        }
        

        
        // Store grid info for other methods to use
        this.gridSize = gridSize;
        this.boardStartX = boardStartX;
        this.boardStartY = boardStartY;
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        
        // Cache the result for future use
        this._boardPositionCache = {
            key: cacheKey,
            gridSize: this.gridSize,
            boardStartX: this.boardStartX,
            boardStartY: this.boardStartY,
            boardWidth: this.boardWidth,
            boardHeight: this.boardHeight
        };
        
        // Position footer consistently across all devices
        const footer = document.querySelector('.game-footer');
        if (footer) {
            if (isDesktop) {
                // Desktop: position relative to grid if space allows, otherwise fixed at bottom
                const footerHeight = 60; // Footer height in pixels
                const calculatedFooterTop = boardStartY + boardHeight + (gridSize * 2);
                const maxFooterTop = this.displayHeight - footerHeight; // Maximum top position to stay in view
                
                if (calculatedFooterTop > maxFooterTop) {
                    // Footer would go outside view - make it fixed at bottom
                    footer.style.position = 'fixed';
                    footer.style.bottom = '10px';
                    footer.style.top = 'auto';
                } else {
                    // Footer fits in view - position it 2 grid spaces below grid
                    footer.style.position = 'absolute';
                    footer.style.top = calculatedFooterTop + 'px';
                    footer.style.bottom = 'auto';
                }
            } else {
                // Mobile: always fixed at bottom with consistent distance
                footer.style.position = 'fixed';
                footer.style.bottom = '20px';
                footer.style.top = 'auto';
            }
        }
    }

    renderInfiniteGrid() {
        if (!this.board || !this.board.front) return;
        
        // Check if infinite grid should be rendered
        if (!CONSTANTS.INFINITE_GRID_CONFIG.ENABLED) return;
        
        // Board position should already be calculated during level loading
        // Only recalculate if gridSize is not set (fallback)
        if (typeof this.gridSize === 'undefined' || this.gridSize === null) {
            this.calculateBoardPosition();
        }
        
        const nodes = this.getCurrentNodes();
        if (!nodes) return;
        const boardRows = nodes.length;
        const boardCols = nodes[0] ? nodes[0].length : 0;
        
        if (boardRows === 0 || boardCols === 0) return;
        
        // Set up infinite grid drawing style
        this.ctx.strokeStyle = CONSTANTS.INFINITE_GRID_CONFIG.COLOR;
        this.ctx.lineWidth = CONSTANTS.INFINITE_GRID_CONFIG.LINE_WIDTH;
        this.ctx.lineCap = 'round';
        this.ctx.globalAlpha = CONSTANTS.INFINITE_GRID_CONFIG.OPACITY;
        
        // Calculate the infinite grid that extends beyond the level boundaries
        // The grid lines should be spaced exactly at gridSize intervals
        // and should align with the level grid lines
        
        // Calculate how many grid lines we need to cover the entire canvas
        const canvasWidth = this.displayWidth;
        const canvasHeight = this.displayHeight;
        
        // Calculate the infinite grid that aligns with the level grid
        // The level grid starts at boardStartX, boardStartY and has spacing of gridSize
        // We need to extend this grid pattern to cover the entire canvas
        
        // The infinite grid should align with the level grid positions
        // Level grid nodes are centered at boardStartX + col*gridSize, boardStartY + row*gridSize
        // So the grid lines should pass through these centers
        // We need to extend the grid in all directions, including negative coordinates
        
        // Calculate the infinite grid that extends in both negative AND positive directions
        // We need to ensure the grid covers the entire canvas area
        
        // Calculate how far we need to extend in each direction to cover the canvas
        const extendLeft = Math.ceil(canvasWidth / this.gridSize) + 2;
        const extendRight = Math.ceil(canvasWidth / this.gridSize) + 2;
        const extendUp = Math.ceil(canvasHeight / this.gridSize) + 2;
        const extendDown = Math.ceil(canvasHeight / this.gridSize) + 2;
        
        // Calculate the starting positions to extend in all directions
        const leftmostGridLine = this.boardStartX - (extendLeft * this.gridSize);
        const topmostGridLine = this.boardStartY - (extendUp * this.gridSize);
        
        // Calculate total number of lines needed
        const numVerticalLines = extendLeft + extendRight + 1; // +1 for the level grid line
        const numHorizontalLines = extendUp + extendDown + 1; // +1 for the level grid line
        
        this.ctx.beginPath();
        
        // Draw vertical lines
        for (let i = 0; i < numVerticalLines; i++) {
            const x = leftmostGridLine + (i * this.gridSize);
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, canvasHeight);
        }
        
        // Draw horizontal lines
        for (let i = 0; i < numHorizontalLines; i++) {
            const y = topmostGridLine + (i * this.gridSize);
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(canvasWidth, y);
        }
        
        this.ctx.stroke();
        
        // Reset globalAlpha to avoid affecting other rendering operations
        this.ctx.globalAlpha = 1.0;
    }

    renderGrid() {
        if (!this.board || !this.board.front) return;
        
        // Check if empty nodes should be rendered
        if (!CONSTANTS.RENDER_SIZE_CONFIG.RENDER_EMPTY_NODES) return;
        
        // Board position should already be calculated during level loading
        // Only recalculate if gridSize is not set (fallback)
        if (typeof this.gridSize === 'undefined' || this.gridSize === null) {
            this.calculateBoardPosition();
        }
        
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

        // Update navigation buttons if in development mode
        if (CONSTANTS.APP_CONFIG.DEVEL) {
            this.updateLevelNavigationButtons();
        }
    }

    updateLevelNavigationButtons() {
        const prevBtn = document.getElementById('prevLevelBtn');
        const nextBtn = document.getElementById('nextLevelBtn');

        if (prevBtn) {
            if (this.currentLevel > 1) {
                prevBtn.style.visibility = 'visible';
                prevBtn.disabled = false;
            } else {
                prevBtn.style.visibility = 'hidden';
                prevBtn.disabled = true;
            }
        }

        if (nextBtn) {
            if (this.currentLevel < CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
                nextBtn.style.visibility = 'visible';
                nextBtn.disabled = false;
            } else {
                nextBtn.style.visibility = 'hidden';
                nextBtn.disabled = true;
            }
        }
    }

    renderBoard() {
        // Draw board nodes if they exist
        if (this.board && this.board.front) {
            const nodes = this.getCurrentNodes();
            if (!nodes) return;
            
            for (let row = 0; row < nodes.length; row++) {
                const rowArray = nodes[row];
                for (let col = 0; col < rowArray.length; col++) {
                    const nodeType = rowArray[col];
                    
                    // Render path nodes as circles (including new v# and h# nodes)
                    if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1 ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2 ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_1 ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_2 ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_1 ||
                        nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_2) {
                        
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
                    
                    // Render STICKER nodes as orange hollow rings with four segments pointing to center
                    else if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
                        const centerX = this.boardStartX + (col * this.gridSize);
                        const centerY = this.boardStartY + (row * this.gridSize);
                        
                        // Use same radii as goal nodes
                        const innerRadius = this.getGoalInnerRadius();
                        const outerRadius = this.getGoalOuterRadius();
                        
                        // Check if this sticker is activated
                        const nodeKey = `${row}_${col}`;
                        const isActivated = this.activatedStickers[this.currentFace] && 
                                          this.activatedStickers[this.currentFace][nodeKey];
                        
                        // Always use brighter shade of ball color for sticker nodes
                        let stickerColor;
                        if (isActivated) {
                            // Use brighter shade of the ball color that activated this sticker
                            const ballColorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[isActivated.color] || '#FFFFFF';
                            stickerColor = this.brightenColor(ballColorHex, 0.3);
                        } else {
                            // Not activated - use default sticker color
                            stickerColor = CONSTANTS.LEVEL_CONFIG.NODE_COLORS[nodeType];
                        }
                        
                        // Draw four arc shapes exactly like goal rendering to form a four-spike star
                        const goalInnerRadius = this.getGoalInnerRadius();
                        const goalOuterRadius = this.getGoalOuterRadius();
                        const arcThickness = goalOuterRadius - goalInnerRadius;
                        
                        // Set up drawing context with same thickness as goals
                        this.ctx.strokeStyle = stickerColor;
                        this.ctx.lineWidth = arcThickness;
                        this.ctx.lineCap = 'butt';
                        
                        // Use same arc segments as goal rendering - four separate arc segments covering the full circle
                        // Each segment covers π/2 (90 degrees)
                        const arcSegments = [
                            { start: 0, end: Math.PI/2, direction: Math.PI/4 },                // Top-right segment (0 to π/2)
                            { start: Math.PI/2, end: Math.PI, direction: 3*Math.PI/4 },        // Bottom-right segment (π/2 to π)
                            { start: Math.PI, end: 3*Math.PI/2, direction: 5*Math.PI/4 },      // Bottom-left segment (π to 3π/2)
                            { start: 3*Math.PI/2, end: 2*Math.PI, direction: 7*Math.PI/4 }     // Top-left segment (3π/2 to 2π)
                        ];
                        
                        const arcRadius = goalInnerRadius + arcThickness/2; // Center of the ring thickness
                        const arcOffset = -5 * arcThickness; // Offset to create the star effect (spikes pointing outward)
                        
                        // Draw four separate arcs, each offset outward to create star spikes
                        arcSegments.forEach((segment, index) => {
                            // Calculate arc center offset to create outward spikes
                            const arcCenterX = centerX + Math.cos(segment.direction) * arcOffset;
                            const arcCenterY = centerY + Math.sin(segment.direction) * arcOffset;
                            
                            // Draw the arc segment
                            this.ctx.beginPath();
                            this.ctx.arc(arcCenterX, arcCenterY, arcRadius, segment.start, segment.end);
                            this.ctx.stroke();
                        });
                    }
                    

                }
            }
        }
    }

    renderTrapOpenStates() {
        // Draw trap open states (under balls)
        if (this.board && this.board.front) {
            const nodes = this.getCurrentNodes();
            if (!nodes) return;
            
            for (let row = 0; row < nodes.length; row++) {
                const rowArray = nodes[row];
                for (let col = 0; col < rowArray.length; col++) {
                    const nodeType = rowArray[col];
                    
                    // Render TRAP nodes in open state (four squares)
                    if (nodeType.startsWith('x') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
                        const centerX = this.boardStartX + (col * this.gridSize);
                        const centerY = this.boardStartY + (row * this.gridSize);
                        
                        // Check if this trap is closed (has trapped a ball)
                        const nodeKey = `${row}_${col}`;
                        const isClosed = this.closedTraps[this.currentFace] && 
                                       this.closedTraps[this.currentFace][nodeKey];
                        
                        // Get trap animation state if it exists
                        const trapAnimation = this.trapAnimations[this.currentFace] && 
                                            this.trapAnimations[this.currentFace][nodeKey];
                        
                        // Only render open state if trap is open or during opening animation
                        if (isClosed && !(trapAnimation && trapAnimation.isAnimating && trapAnimation.isOpening)) {
                            continue; // Skip rendering open state for closed traps
                        }
                        
                        // Get trap color - use darkened color for open state
                        const baseColor = CONSTANTS.LEVEL_CONFIG.NODE_COLORS[nodeType] || '#FF0000';
                        let trapColor;
                        
                        if (trapAnimation && trapAnimation.isAnimating) {
                            // Animate color during animation
                            const elapsed = performance.now() - trapAnimation.startTime;
                            const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.TRAP_ANIMATION_DURATION, 1);
                            const easedProgress = CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT(progress);
                            const darkenedColor = this.darkenColor(baseColor, CONSTANTS.ANIMATION_CONFIG.TRAP_DARKENING_FACTOR);
                            
                            if (trapAnimation.isOpening) {
                                // Animate from full to darkened color (opening animation)
                                trapColor = this.interpolateColor(baseColor, darkenedColor, easedProgress);
                            } else {
                                // Animate from darkened to full color (closing animation)
                                trapColor = this.interpolateColor(darkenedColor, baseColor, easedProgress);
                            }
                        } else {
                            // Use darkened color when trap is open (no animation)
                            trapColor = this.darkenColor(baseColor, CONSTANTS.ANIMATION_CONFIG.TRAP_DARKENING_FACTOR);
                        }
                        
                        // Calculate trap dimensions for open state (four discs)
                        const discDistance = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_DISC_DISTANCE_RATIO;
                        const discRadius = (this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_DISC_SIZE_RATIO) / 2; // Same as switch discs
                        
                        // Calculate thin X dimensions
                        const xLength = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_OUTER_RADIUS_RATIO;
                        
                        // Set up drawing context for discs
                        this.ctx.fillStyle = trapColor;
                        this.ctx.save();
                        this.ctx.translate(centerX, centerY);
                        
                        // Calculate rotation angle based on animation state
                        let rotationAngle = Math.PI / 4; // X shape orientation (45°)
                        if (trapAnimation && trapAnimation.isAnimating) {
                            // Animate rotation during animation
                            const elapsed = performance.now() - trapAnimation.startTime;
                            const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.TRAP_ANIMATION_DURATION, 1);
                            const easedProgress = CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT(progress);
                            
                            if (trapAnimation.isOpening) {
                                // Opening: rotate clockwise by π/2 (90°) from X to X
                                rotationAngle = Math.PI / 4 + (Math.PI / 2) * easedProgress;
                            } else {
                                // Closing: rotate counter-clockwise by π/2 (90°) from X to X
                                rotationAngle = Math.PI / 4 - (Math.PI / 2) * easedProgress;
                            }
                        }
                        
                        this.ctx.rotate(rotationAngle);
                        
                        if (trapAnimation && trapAnimation.isAnimating) {
                            // During animation, show discs with appropriate fade
                            const elapsed = performance.now() - trapAnimation.startTime;
                            const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.TRAP_ANIMATION_DURATION, 1);
                            const easedProgress = CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT(progress);
                            
                            if (trapAnimation.isOpening) {
                                // Opening: fade in discs
                                this.ctx.globalAlpha = easedProgress;
                            } else {
                                // Closing: fade out discs
                                this.ctx.globalAlpha = 1 - easedProgress;
                            }
                        }
                        
                        // Draw four discs in diagonal arrangement (open state)
                        const positions = [
                            [0, -discDistance/2],  // Top (vertical axis)
                            [discDistance/2, 0],   // Right (horizontal axis)
                            [0, discDistance/2],   // Bottom (vertical axis)
                            [-discDistance/2, 0]   // Left (horizontal axis)
                        ];
                        positions.forEach(([x, y]) => {
                            this.ctx.beginPath();
                            this.ctx.arc(x, y, discRadius, 0, 2 * Math.PI);
                            this.ctx.fill();
                        });
                        
                        // Draw thin X in trap color
                        this.ctx.strokeStyle = trapColor;
                        this.ctx.lineWidth = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_X_LINE_WIDTH_RATIO;
                        this.ctx.beginPath();
                        this.ctx.moveTo(positions[0][0], positions[0][1]);
                        this.ctx.lineTo(positions[2][0], positions[2][1]);
                        this.ctx.moveTo(positions[1][0], positions[1][1]);
                        this.ctx.lineTo(positions[3][0], positions[3][1]);
                        this.ctx.stroke();
                        
                        this.ctx.globalAlpha = 1;
                        this.ctx.restore();
                    }
                }
            }
        }
    }

    renderTrapClosedStates() {
        // Draw trap closed states (over balls)
        if (this.board && this.board.front) {
            const nodes = this.getCurrentNodes();
            if (!nodes) return;
            
            for (let row = 0; row < nodes.length; row++) {
                const rowArray = nodes[row];
                for (let col = 0; col < rowArray.length; col++) {
                    const nodeType = rowArray[col];
                    
                    // Render TRAP nodes in closed state (X/+ shape)
                    if (nodeType.startsWith('x') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
                        const centerX = this.boardStartX + (col * this.gridSize);
                        const centerY = this.boardStartY + (row * this.gridSize);
                        
                        // Check if this trap is closed (has trapped a ball)
                        const nodeKey = `${row}_${col}`;
                        const isClosed = this.closedTraps[this.currentFace] && 
                                       this.closedTraps[this.currentFace][nodeKey];
                        
                        // Get trap animation state if it exists
                        const trapAnimation = this.trapAnimations[this.currentFace] && 
                                            this.trapAnimations[this.currentFace][nodeKey];
                        
                        // Only render closed state if trap is closed or during closing animation
                        if (!isClosed && !(trapAnimation && trapAnimation.isAnimating && !trapAnimation.isOpening)) {
                            continue; // Skip rendering closed state for open traps
                        }
                        
                        // Get trap color - use full color for closed state
                        const baseColor = CONSTANTS.LEVEL_CONFIG.NODE_COLORS[nodeType] || '#FF0000';
                        let trapColor;
                        
                        if (trapAnimation && trapAnimation.isAnimating) {
                            // Animate color during animation
                            const elapsed = performance.now() - trapAnimation.startTime;
                            const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.TRAP_ANIMATION_DURATION, 1);
                            const easedProgress = CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT(progress);
                            const darkenedColor = this.darkenColor(baseColor, CONSTANTS.ANIMATION_CONFIG.TRAP_DARKENING_FACTOR);
                            
                            if (trapAnimation.isOpening) {
                                // Animate from full to darkened color (opening animation)
                                trapColor = this.interpolateColor(baseColor, darkenedColor, easedProgress);
                            } else {
                                // Animate from darkened to full color (closing animation)
                                trapColor = this.interpolateColor(darkenedColor, baseColor, easedProgress);
                            }
                        } else {
                            // Use full color when trap is closed (no animation)
                            trapColor = baseColor;
                        }
                        
                        // Calculate trap dimensions for closed state (same as open state)
                        const discDistance = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_DISC_DISTANCE_RATIO;
                        const discRadius = (this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_DISC_SIZE_RATIO) / 2; // Same as switch discs
                        
                        // Calculate thin X dimensions
                        const xLength = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_OUTER_RADIUS_RATIO;
                        
                        // Set up drawing context
                        this.ctx.fillStyle = trapColor;
                        this.ctx.save();
                        this.ctx.translate(centerX, centerY);
                        
                        // Calculate rotation angle based on animation state
                        let rotationAngle = Math.PI / 4; // X shape orientation (45°)
                        if (trapAnimation && trapAnimation.isAnimating) {
                            // Animate rotation during animation
                            const elapsed = performance.now() - trapAnimation.startTime;
                            const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.TRAP_ANIMATION_DURATION, 1);
                            const easedProgress = CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT(progress);
                            
                            if (trapAnimation.isOpening) {
                                // Opening: rotate clockwise by π/2 (90°) from X to X
                                rotationAngle = Math.PI / 4 + (Math.PI / 2) * easedProgress;
                            } else {
                                // Closing: rotate counter-clockwise by π/2 (90°) from X to X
                                rotationAngle = Math.PI / 4 - (Math.PI / 2) * easedProgress;
                            }
                        }
                        
                        this.ctx.rotate(rotationAngle);
                        
                        if (trapAnimation && trapAnimation.isAnimating) {
                            // During animation, show with appropriate fade
                            const elapsed = performance.now() - trapAnimation.startTime;
                            const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.TRAP_ANIMATION_DURATION, 1);
                            const easedProgress = CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT(progress);
                            
                            if (trapAnimation.isOpening) {
                                // Opening: fade out closed state
                                this.ctx.globalAlpha = 1 - easedProgress;
                            } else {
                                // Closing: fade in closed state
                                this.ctx.globalAlpha = easedProgress;
                            }
                        }
                        
                        // Positions of the four discs in diagonal arrangement (same as open state)
                        const positions = [
                            [0, -discDistance/2],  // Top (vertical axis)
                            [discDistance/2, 0],   // Right (horizontal axis)
                            [0, discDistance/2],   // Bottom (vertical axis)
                            [-discDistance/2, 0]   // Left (horizontal axis)
                        ];
                        
                        // Draw four discs in diagonal arrangement (same as open state)
                        positions.forEach(([x, y]) => {
                            this.ctx.beginPath();
                            this.ctx.arc(x, y, discRadius, 0, 2 * Math.PI);
                            this.ctx.fill();
                        });
                        
                        // Draw thin X in trap color (on top of trapped ball)
                        this.ctx.strokeStyle = trapColor;
                        this.ctx.lineWidth = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.TRAP_X_LINE_WIDTH_RATIO;
                        this.ctx.beginPath();
                        this.ctx.moveTo(positions[0][0], positions[0][1]);
                        this.ctx.lineTo(positions[2][0], positions[2][1]);
                        this.ctx.moveTo(positions[1][0], positions[1][1]);
                        this.ctx.lineTo(positions[3][0], positions[3][1]);
                        this.ctx.stroke();
                        
                        this.ctx.globalAlpha = 1;
                        this.ctx.restore();
                    }
                }
            }
        }
    }

    renderSwitches() {
        // Draw switch nodes on top of balls
        if (this.board && this.board.front) {
            const nodes = this.getCurrentNodes();
            if (!nodes) return;
            
            for (let row = 0; row < nodes.length; row++) {
                const rowArray = nodes[row];
                for (let col = 0; col < rowArray.length; col++) {
                    const nodeType = rowArray[col];
                    
                    // Render SWITCH nodes as four squares arranged diagonally
                    if (nodeType.startsWith('s') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.SWITCH) {
        
                        const centerX = this.boardStartX + (col * this.gridSize);
                        const centerY = this.boardStartY + (row * this.gridSize);
        
                        
                        // Check if this switch is closed (has a ball on it)
                        const nodeKey = `${row}_${col}`;
                        const isClosed = this.closedSwitches[this.currentFace] && 
                                       this.closedSwitches[this.currentFace][nodeKey];
                        
                        // Get switch animation state if it exists
                        const switchAnimation = this.switchAnimations[this.currentFace] && 
                                              this.switchAnimations[this.currentFace][nodeKey];
                        
            
                        
                        // Get switch color - use full color when closed, darkened when open
                        const baseColor = CONSTANTS.LEVEL_CONFIG.NODE_COLORS[nodeType] || '#FFFF00';
                        let switchColor;
                        
                        if (isClosed) {
                            // Use full color when switch is closed
                            switchColor = baseColor;
                        } else if (switchAnimation && switchAnimation.isAnimating) {
                            // Animate color from darkened to full during animation
                            const elapsed = performance.now() - switchAnimation.startTime;
                            const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.SWITCH_ANIMATION_DURATION, 1);
                            const easedProgress = CONSTANTS.ANIMATION_CONFIG.EASING.EASE_OUT(progress);
                            const darkenedColor = this.darkenColor(baseColor, CONSTANTS.ANIMATION_CONFIG.SWITCH_DARKENING_FACTOR);
                            switchColor = this.interpolateColor(darkenedColor, baseColor, easedProgress);
                
                        } else {
                            // Use darkened color when switch is open
                            switchColor = this.darkenColor(baseColor, CONSTANTS.ANIMATION_CONFIG.SWITCH_DARKENING_FACTOR);
                        }
                        
                        // Calculate switch dimensions
                        const discDistance = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.SWITCH_DISC_DISTANCE_RATIO;
                        const discRadius = (this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.SWITCH_DISC_SIZE_RATIO) / 2; // Diameter = disc size
                        
                        // Set up drawing context
            
                        this.ctx.fillStyle = switchColor;
                        this.ctx.save();
                        this.ctx.translate(centerX, centerY);
                        this.ctx.rotate(Math.PI / 4); // Rotate entire pattern by 45 degrees
                        
                        // Draw four discs on principal axes, then rotate to diagonal positions
                        const positions = [
                            [0, -discDistance/2],  // Top (vertical axis)
                            [discDistance/2, 0],   // Right (horizontal axis)
                            [0, discDistance/2],   // Bottom (vertical axis)
                            [-discDistance/2, 0]   // Left (horizontal axis)
                        ];
                        
                        positions.forEach(([x, y]) => {
                            this.ctx.beginPath();
                            this.ctx.arc(x, y, discRadius, 0, 2 * Math.PI);
                            this.ctx.fill();
                        });
                        
                        // Draw thin circle passing through the centers of the four discs
                        this.ctx.strokeStyle = switchColor;
                        this.ctx.lineWidth = this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.SWITCH_CIRCLE_LINE_WIDTH_RATIO;
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, discDistance/2, 0, 2 * Math.PI);
                        this.ctx.stroke();
                        
                        this.ctx.restore();
            
                    }
                }
            }
        }
    }

    renderPathLines() {
        // Draw lines between connected path nodes
        if (!this.board || !this.board.front) return;
        
        // Check if connections should be rendered
        if (!CONSTANTS.RENDER_SIZE_CONFIG.RENDER_CONNECTIONS) return;
        
        const nodes = this.getCurrentNodes();
        if (!nodes) return;
        
        for (let row = 0; row < nodes.length; row++) {
            const rowArray = nodes[row];
            for (let col = 0; col < rowArray.length; col++) {
                const nodeType = rowArray[col];
                
                // Process path nodes, WELL nodes, TRAP nodes, and SWITCH nodes (including new v# and h# nodes)
                if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_1 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_2 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_1 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_2 ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL ||
                    nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER ||
                    (nodeType.startsWith('x') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) ||
                    (nodeType.startsWith('s'))) {
                    
                    const centerX = this.boardStartX + (col * this.gridSize);
                    const centerY = this.boardStartY + (row * this.gridSize);
                    
                    // Check right neighbor (horizontal connection)
                    if (col + 1 < rowArray.length) {
                        const rightNodeType = rowArray[col + 1];
                        if (this.shouldDrawConnection(nodeType, rightNodeType, 'horizontal')) {
                            const rightX = this.boardStartX + ((col + 1) * this.gridSize);
                            const rightY = centerY;
                            
                            const lineColor = this.getConnectionColor(nodeType, rightNodeType);
                            this.drawPathLineWithWellClipping(centerX, centerY, rightX, rightY, lineColor, nodeType, rightNodeType);
                        }
                    }
                    
                    // Check bottom neighbor (vertical connection)
                    if (row + 1 < nodes.length) {
                        const bottomRowArray = nodes[row + 1];
                        if (col < bottomRowArray.length) {
                            const bottomNodeType = bottomRowArray[col];
                            if (this.shouldDrawConnection(nodeType, bottomNodeType, 'vertical')) {
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
    shouldDrawConnection(nodeType1, nodeType2, direction) {
        // Both nodes must be path nodes (not empty), WELL nodes, or TRAP nodes
        const pathTypes = [
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_2,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_1,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_2,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_1,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_2,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL,
            CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER
        ];
        
        // Add trap nodes to path types
        if (nodeType1.startsWith('x') && nodeType1 !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
            pathTypes.push(nodeType1);
        }
        if (nodeType2.startsWith('x') && nodeType2 !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
            pathTypes.push(nodeType2);
        }
        
        // Add switch nodes to path types
        if (nodeType1.startsWith('s')) {
            pathTypes.push(nodeType1);
        }
        if (nodeType2.startsWith('s')) {
            pathTypes.push(nodeType2);
        }
        
        if (!pathTypes.includes(nodeType1) || !pathTypes.includes(nodeType2)) {
            return false;
        }
        
        // Check directional constraints for v# and h# nodes
        if (direction === 'horizontal') {
            // For horizontal connections, v# nodes are not allowed (all v# nodes are vertical-only)
            if (nodeType1.startsWith('v')) {
                return false; // v# nodes don't allow horizontal connections
            }
            if (nodeType2.startsWith('v')) {
                return false; // v# nodes don't allow horizontal connections
            }
        } else if (direction === 'vertical') {
            // For vertical connections, h# nodes are not allowed (all h# nodes are horizontal-only)
            if (nodeType1.startsWith('h')) {
                return false; // h# nodes don't allow vertical connections
            }
            if (nodeType2.startsWith('h')) {
                return false; // h# nodes don't allow vertical connections
            }
        }
        
        // Same path types are always connected (if direction is allowed)
        if (nodeType1 === nodeType2) return true;
        
        // PATH_ALL_BALLS, VERTICAL_ALL_BALLS, and HORIZONTAL_ALL_BALLS ('0') connect to any specific ball path
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS ||
            nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS ||
            nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS) {
            return true;
        }
        
        // WELL nodes connect to any path type (allowing balls to enter wells)
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            return true;
        }
        
        // STICKER nodes connect to any path type (allowing balls to enter stickers)
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
            return true;
        }
        
        // SWITCH nodes connect to any path type (allowing balls to enter switches)
        if (nodeType1.startsWith('s') || nodeType2.startsWith('s')) {
            return true;
        }
        
        // Different specific ball paths don't connect
        return false;
    }

    // Get the color for a connection between two node types
    getConnectionColor(nodeType1, nodeType2) {
        // If one is PATH_ALL_BALLS, VERTICAL_ALL_BALLS, HORIZONTAL_ALL_BALLS, WELL, STICKER, or SWITCH, use the color of the specific ball path
        if (nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS || 
            nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS ||
            nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS ||
            nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL ||
            nodeType1 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER ||
            nodeType1.startsWith('s')) {
            return this.getPathColor(nodeType2);
        }
        if (nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS || 
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS ||
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS ||
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL ||
            nodeType2 === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER ||
            nodeType2.startsWith('s')) {
            return this.getPathColor(nodeType1);
        }
        
        // Both are same specific type
        return this.getPathColor(nodeType1);
    }

    // Get the color for a specific path type
    getPathColor(nodeType) {
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_BALL_1) {
            // Use the color of the first ball (ball 0) from the level data
            if (this.balls && this.balls.length > 0) {
                const ballColor = this.balls[0].color;
                return CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ballColor] || '#FF0000';
            }
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.red; // Fallback to red
        }
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_1) {
            // Use the color of the first ball (ball 0) from the level data
            if (this.balls && this.balls.length > 0) {
                const ballColor = this.balls[0].color;
                return CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ballColor] || '#FF0000';
            }
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.red; // Fallback to red
        }
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_1) {
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
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_BALL_2) {
            // Use the color of the second ball (ball 1) from the level data
            if (this.balls && this.balls.length > 1) {
                const ballColor = this.balls[1].color;
                return CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ballColor] || '#0000FF';
            }
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.blue; // Fallback to blue
        }
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_BALL_2) {
            // Use the color of the second ball (ball 1) from the level data
            if (this.balls && this.balls.length > 1) {
                const ballColor = this.balls[1].color;
                return CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ballColor] || '#0000FF';
            }
            return CONSTANTS.LEVEL_CONFIG.BALL_COLORS.blue; // Fallback to blue
        }
        
        // For general path types (p0, v0, h0), use default gray
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS ||
            nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS ||
            nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS) {
            return CONSTANTS.LEVEL_CONFIG.NODE_COLORS[CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS];
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
        const distance = this.euclideanDistance(otherX, otherY, wellX, wellY);
        
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
            
            // Check if there's a tail disc at this ball's current position
            // If so, don't render the ball to avoid visual conflict
            const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
            const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
            const nodeKey = `${ballGridY}_${ballGridX}`;
            
            if (this.nodeTails[this.currentFace] && this.nodeTails[this.currentFace][nodeKey]) {
                const tailData = this.nodeTails[this.currentFace][nodeKey];
                // If there's a tail at this position, don't render the ball
                // The tail disc will be rendered instead
                return;
            }
            // Use ball color from ball data, fallback to white
            const colorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
            
            // Add touch feedback glow effect with animation
            if (ball.isTouched && ball.touchOpacity > 0) {
                // For clamped balls, don't show a separate halo - just enlarge the ball itself
                // The ball scaling in getVisualBallRadius() will handle the enlargement
                // This prevents the "darker halo" effect that can be confusing
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
            
            // Draw the synchronized box shadow effect
            this.drawBallShadow(ball.x, ball.y, finalBallRadius, index, colorHex);
            
            // Draw the main ball with glow animation color
            const glowColor = this.getGlowColor(index, colorHex);
            this.ctx.fillStyle = glowColor;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, finalBallRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.restore();
            

        });
    }

    renderTrailAnimations() {
        // Draw all active trail animations
        this.activeTrailAnimations.forEach(animation => {
            if (!animation || animation.progress >= 1) return; // Skip completed or invalid animations
            
            // Ensure animation has required properties with fallbacks
            const x = animation.x || 0;
            const y = animation.y || 0;
            const currentOpacity = animation.currentOpacity || 0.5;
            const innerRadius = animation.currentInnerRadius || 5;
            const outerRadius = animation.currentOuterRadius || 10;
            const color = animation.color || '#FFFFFF';
            
            // Convert screen coordinates back to canvas coordinates
            const canvasRect = this.canvas.getBoundingClientRect();
            if (!canvasRect || canvasRect.width === 0 || canvasRect.height === 0) return;
            
            const canvasX = (x / canvasRect.width) * this.displayWidth;
            const canvasY = (y / canvasRect.height) * this.displayHeight;
            
            // Apply horizontal reflection for rear face
            let finalX = canvasX;
            let finalY = canvasY; // Y coordinate doesn't change with horizontal reflection
            if (this.currentFace === 'rear') {
                finalX = this.displayWidth - canvasX;
            }
            
            // Draw the trail animation as a ring
            this.ctx.save();
            this.ctx.globalAlpha = currentOpacity;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            // Draw outer circle
            this.ctx.arc(finalX, finalY, outerRadius, 0, 2 * Math.PI);
            
            // Cut out inner circle to create ring
            this.ctx.arc(finalX, finalY, innerRadius, 0, 2 * Math.PI, true); // true = counterclockwise for hole
            
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    renderEndGoals() {
        // Check if any ball is currently transitioning
        const anyBallTransitioning = this.transitionInProgress.some(inProgress => inProgress);
        if (anyBallTransitioning) {
            // Still render goals but don't update their states during transitions
            this.balls.forEach((ball, index) => {
                // Get all end positions for this ball
                const endPositions = ball.endPositionsAbsolute || [];
                
                if (endPositions.length === 0) {
                    // Fallback to legacy single end position
                    if (this.getGoalCurrentFace(ball) !== this.currentFace) return;
                    const endX = ball.endPosition.x;
                    const endY = ball.endPosition.y;
                    
                    // Just render the goal without updating state
                    const goalKey = `${endX}_${endY}_${this.currentFace}`;
                    const currentState = this.getGoalState(goalKey);
                    this.renderGoalWithArcs(endX, endY, ball.color, goalKey, currentState === 'active');
                    return;
                }
                
                // Render all end positions for this ball
                endPositions.forEach(endPos => {
                    // Only render goals for the current face
                    if (endPos.face !== this.currentFace) return;
                    
                    const endX = endPos.x;
                    const endY = endPos.y;
                    
                    // Just render the goal without updating state
                    const goalKey = `${endX}_${endY}_${this.currentFace}`;
                    const currentState = this.getGoalState(goalKey);
                    this.renderGoalWithArcs(endX, endY, ball.color, goalKey, currentState === 'active');
                });
            });
            return;
        }
        
        this.balls.forEach((ball, index) => {
            // Get all end positions for this ball
            const endPositions = ball.endPositionsAbsolute || [];
            
            if (endPositions.length === 0) {
                // Fallback to legacy single end position
                if (this.getGoalCurrentFace(ball) !== this.currentFace) return;
                const endX = ball.endPosition.x;
                const endY = ball.endPosition.y;
                
                // Convert to grid coordinates for occupation check
                const goalGridX = Math.round((endX - this.boardStartX) / this.gridSize);
                const goalGridY = Math.round((endY - this.boardStartY) / this.gridSize);
                
                // Check if goal is occupied and update animation
                const isOccupied = this.isGoalOccupied(goalGridX, goalGridY, this.currentFace, index);
                const goalKey = `${endX}_${endY}_${this.currentFace}`;
                this.updateGoalAnimation(goalKey, isOccupied);
                
                // Render the goal with 4-arc animation
                this.renderGoalWithArcs(endX, endY, ball.color, goalKey, isOccupied);
                return;
            }
            
            // Render all end positions for this ball
            endPositions.forEach(endPos => {
                // Only render goals for the current face
                if (endPos.face !== this.currentFace) return;
                
                const endX = endPos.x;
                const endY = endPos.y;
                
                // Convert to grid coordinates for occupation check
                const goalGridX = Math.round((endX - this.boardStartX) / this.gridSize);
                const goalGridY = Math.round((endY - this.boardStartY) / this.gridSize);
                
                // Check if goal is occupied and update animation
                const isOccupied = this.isGoalOccupied(goalGridX, goalGridY, this.currentFace, index);
                const goalKey = `${endX}_${endY}_${this.currentFace}`;
                this.updateGoalAnimation(goalKey, isOccupied);
                
                // Render the goal with 4-arc animation
                this.renderGoalWithArcs(endX, endY, ball.color, goalKey, isOccupied);
            });
        });
    }

    // Render a goal with the new 4-arc animation system
    renderGoalWithArcs(centerX, centerY, ballColor, goalKey, isOccupied) {
        // Get ball color
        const ballColorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ballColor] || '#FFFFFF';
        const darkenedColorHex = this.darkenColor(ballColorHex, CONSTANTS.LEVEL_CONFIG.GOAL_DARKENING_FACTOR);
        
        // Use exploding color if goal is exploding
        if (this.explodingGoals.has(goalKey)) {
            this.ctx.strokeStyle = ballColorHex;
        } else {
            // Interpolate color based on animation state
            const currentState = this.getGoalState(goalKey);
            const animation = this.goalAnimations.get(goalKey);
            
            let colorInterpolation = 0; // 0 = darkened, 1 = full color
            if (animation && animation.progress < 1) {
                // During animation, interpolate between states
                const fromColor = animation.fromState === 'active' ? 1 : 0;
                const toColor = animation.toState === 'active' ? 1 : 0;
                colorInterpolation = fromColor + (toColor - fromColor) * this.getGoalAnimationProgress(goalKey);
            } else {
                // Use current state
                colorInterpolation = currentState === 'active' ? 1 : 0;
            }
            
            // Interpolate between darkened and full color
            this.ctx.strokeStyle = this.interpolateColor(darkenedColorHex, ballColorHex, colorInterpolation);
        }
        
        // Get radii
        const goalInnerRadius = this.getGoalInnerRadius();
        const goalOuterRadius = this.getGoalOuterRadius();
        const arcThickness = goalOuterRadius - goalInnerRadius;
        
        // Get animation progress
        const animationProgress = this.getGoalAnimationProgress(goalKey);
        
        // Get current goal state
        const currentState = this.getGoalState(goalKey);
        
        // Calculate arc positions based on current state and animation
        let arcRadius, arcOffset;
        
        // Apply animation interpolation
        const animation = this.goalAnimations.get(goalKey);
        if (animation && animation.progress < 1) {
            // Interpolate between states during animation
            const fromOffset = animation.fromState === 'active' ? 0 : arcThickness;
            const toOffset = animation.toState === 'active' ? 0 : arcThickness;
            
            arcRadius = goalInnerRadius + arcThickness/2; // Center of the ring thickness
            arcOffset = fromOffset + (toOffset - fromOffset) * animationProgress;
        } else {
            // Use current state (no animation)
            if (currentState === 'active') {
                arcRadius = goalInnerRadius + arcThickness/2; // Center of the ring thickness
                arcOffset = 0;
            } else {
                arcRadius = goalInnerRadius + arcThickness/2; // Center of the ring thickness
                arcOffset = arcThickness;
            }
        }
        
        // Set up drawing context
        this.ctx.lineWidth = arcThickness; // Arc thickness
        this.ctx.lineCap = 'butt';
        
        // Draw four separate arc segments covering the full circle
        // Each segment covers π/2 (90 degrees)
        const arcSegments = [
            { start: 0, end: Math.PI/2, direction: Math.PI/4 },                // Top-right segment (0 to π/2)
            { start: Math.PI/2, end: Math.PI, direction: 3*Math.PI/4 },        // Bottom-right segment (π/2 to π)
            { start: Math.PI, end: 3*Math.PI/2, direction: 5*Math.PI/4 },      // Bottom-left segment (π to 3π/2)
            { start: 3*Math.PI/2, end: 2*Math.PI, direction: 7*Math.PI/4 }     // Top-left segment (3π/2 to 2π)
        ];
        
        // Always draw 4 separate arcs, but interpolate their positions
        arcSegments.forEach((segment, index) => {
            // Calculate arc center offset based on animation
            let arcCenterX = centerX;
            let arcCenterY = centerY;
            
            // Interpolate the offset based on animation progress
            let currentOffset = 0;
            if (animation && animation.progress < 1) {
                // During animation, interpolate between states
                const fromOffset = animation.fromState === 'active' ? 0 : arcThickness;
                const toOffset = animation.toState === 'active' ? 0 : arcThickness;
                currentOffset = fromOffset + (toOffset - fromOffset) * animationProgress;
            } else {
                // Use current state
                currentOffset = currentState === 'active' ? 0 : arcOffset;
            }
            
            // Move arc centers outward along diagonal axes
            arcCenterX += Math.cos(segment.direction) * currentOffset;
            arcCenterY += Math.sin(segment.direction) * currentOffset;
            
            // Draw the arc segment
            this.ctx.beginPath();
            this.ctx.arc(arcCenterX, arcCenterY, arcRadius, segment.start, segment.end);
            this.ctx.stroke();
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
                const nodeType = this.getNodeType(x, y);
                
                // Check if this node is accessible to the ball and not occupied
                const canMove = this.canBallMoveToNode(ballIndex, x, y);
                const isOccupied = this.isNodeOccupied(x, y, ballIndex);
                
                if (canMove && !isOccupied) {
                    const distance = this.manhattanDistance(currentGridX, currentGridY, x, y);
                    
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
        const ball = this.balls[ballIndex];
        const nodeType = this.getNodeType(gridX, gridY);
        
        // Trapped balls cannot move
        if (ball && ball.isTrapped) {
            return false;
        }
        
        // Empty nodes are not accessible
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY) {
            return false;
        }
        
        // For balls with tails, check if they're trying to move to a visited node
        if (ball && ball.hasTail && ball.visitedNodes && ball.visitedNodes.length > 0) {
            const currentFace = this.getBallCurrentFace(ball);
            const targetNode = { x: gridX, y: gridY, face: currentFace };
            
            // Check if this is a visited node
            const isVisitedNode = ball.visitedNodes.some(node => 
                node.x === targetNode.x && node.y === targetNode.y && node.face === targetNode.face
            );
            
            if (isVisitedNode) {
                // Only allow moving to the last visited node (for backtracking)
                const lastVisitedNode = ball.visitedNodes[ball.visitedNodes.length - 1];
                const isLastVisitedNode = lastVisitedNode.x === targetNode.x && 
                                        lastVisitedNode.y === targetNode.y && 
                                        lastVisitedNode.face === targetNode.face;
                
                if (!isLastVisitedNode) {
                    return false; // Block access to any visited node except the last one
                }
            }
        }
        
        // WELL nodes require path validation - don't allow direct access
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            // Check if there's a valid path from ball's current position to this well
            const hasValidPath = this.canBallAccessWell(ballIndex, gridX, gridY);
            return hasValidPath;
        }
        
        // STICKER nodes can be accessed by any ball, but check if already activated
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
            // Check if this sticker is already activated by this ball
            const currentFace = this.getBallCurrentFace(ball);
            const nodeKey = `${gridY}_${gridX}`;
            const isAlreadyActivated = this.activatedStickers[currentFace] && 
                                     this.activatedStickers[currentFace][nodeKey] && 
                                     this.activatedStickers[currentFace][nodeKey].ballIndex === ballIndex;
            
            if (isAlreadyActivated) {
                // Allow backtracking to the last visited sticker node
                if (ball && ball.hasTail && ball.visitedNodes && ball.visitedNodes.length > 0) {
                    const lastVisitedNode = ball.visitedNodes[ball.visitedNodes.length - 1];
                    const isLastVisitedNode = lastVisitedNode.x === gridX && 
                                            lastVisitedNode.y === gridY && 
                                            lastVisitedNode.face === currentFace;
                    
                    if (isLastVisitedNode) {
                        return true; // Allow backtracking to the last visited sticker
                    }
                }
                
                return false; // Block re-entry to already activated stickers (except for backtracking)
            }
            return true;
        }
        
        // TRAP nodes can be accessed by any ball, but check if already closed
        if (nodeType.startsWith('x') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
            const currentFace = this.getBallCurrentFace(ball);
            const nodeKey = `${gridY}_${gridX}`;
            const isClosed = this.closedTraps[currentFace] && 
                           this.closedTraps[currentFace][nodeKey];
            
            // Check if there's an active switch of the same color
            const trapColor = nodeType.charAt(1);
            const hasActiveSwitch = this.hasActiveSwitchOfColor(trapColor);
            
            // If there's an active switch of the same color, the trap should be open
            if (hasActiveSwitch) {

                return true; // Allow access to traps when there's an active switch of the same color
            }
            
            if (isClosed) {
                return false; // Block access to closed traps
            }
            return true; // Allow access to open traps
        }
        
        // SWITCH nodes can be accessed by any ball (free movement)
        if (nodeType.startsWith('s')) {
            return true; // Allow free movement through switches
        }
        
        // Check if the ball can access this node type (ignoring directional constraints)
        const canAccessNodeType = this.canBallAccessNodeType(ballIndex, nodeType);
        if (!canAccessNodeType) {
            return false;
        }
        
        // For directional nodes (v# and h#), check movement direction constraints
        if (nodeType.startsWith('v') || nodeType.startsWith('h')) {
            return this.canBallMoveInDirection(ballIndex, gridX, gridY, nodeType);
        }
        
        return true;
    }
    
    // Check if a ball can access a specific node type (ignoring directional constraints)
    canBallAccessNodeType(ballIndex, nodeType) {
        // Path for all balls ('0') can be used by any ball
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.PATH_ALL_BALLS) {
            return true;
        }
        
        // Ball-specific paths: ball 0 can use path 'p1', ball 1 can use path 'p2', etc.
        const ballPathType = 'p' + (ballIndex + 1).toString();
        if (nodeType === ballPathType) {
            return true;
        }
        
        // Vertical paths for all balls ('v0') can be used by any ball
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.VERTICAL_ALL_BALLS) {
            return true;
        }
        
        // Ball-specific vertical paths: ball 0 can use v1, ball 1 can use v2, etc.
        const ballVerticalType = 'v' + (ballIndex + 1).toString();
        if (nodeType === ballVerticalType) {
            return true;
        }
        
        // Horizontal paths for all balls ('h0') can be used by any ball
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.HORIZONTAL_ALL_BALLS) {
            return true;
        }
        
        // Ball-specific horizontal paths: ball 0 can use h1, ball 1 can use h2, etc.
        const ballHorizontalType = 'h' + (ballIndex + 1).toString();
        if (nodeType === ballHorizontalType) {
            return true;
        }
        
        // STICKER nodes can be used by any ball
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
            return true;
        }
        
        // WELL nodes can be used by any ball
        if (nodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            return true;
        }
        
        // TRAP nodes can be used by any ball
        if (nodeType.startsWith('x') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
            return true;
        }
        
        // SWITCH nodes can be used by any ball
        if (nodeType.startsWith('s')) {
            return true;
        }
        
        return false;
    }
    
    // Check if a ball can move to a directional node based on movement direction
    canBallMoveInDirection(ballIndex, targetGridX, targetGridY, nodeType) {
        const ball = this.balls[ballIndex];
        if (!ball) return false;
        
        // Get ball's current grid position
        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // Calculate movement direction
        const deltaX = targetGridX - ballGridX;
        const deltaY = targetGridY - ballGridY;
        
        // For vertical nodes (v#), only allow vertical movement (up/down)
        if (nodeType.startsWith('v')) {
            return deltaX === 0 && Math.abs(deltaY) === 1;
        }
        
        // For horizontal nodes (h#), only allow horizontal movement (left/right)
        if (nodeType.startsWith('h')) {
            return deltaY === 0 && Math.abs(deltaX) === 1;
        }
        
        return true;
    }
    
    // Check if a ball can access a well (without causing infinite recursion)
    canBallAccessWell(ballIndex, wellGridX, wellGridY) {
        const ball = this.balls[ballIndex];
        if (!ball) {
            return false;
        }
        
        // Get ball's current grid position
        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // If ball is already on the well, it's valid
        if (ballGridX === wellGridX && ballGridY === wellGridY) {
            return true;
        }
        
        // Check if the well is adjacent to the ball's current position
        const isAdjacent = Math.abs(ballGridX - wellGridX) + Math.abs(ballGridY - wellGridY) === 1;
        
        if (isAdjacent) {
            // If the well is adjacent, check if the ball can move to it
            // This allows direct well access when the ball is next to it
            return true;
        }
        
        // For non-adjacent wells, check if there's a valid path
        // But be more lenient - allow access if the ball is on a valid path node
        const ballNodeType = this.getNodeType(ballGridX, ballGridY);
        const isOnValidPath = this.canBallAccessNodeType(ballIndex, ballNodeType);
        
        if (isOnValidPath) {
            return true;
        }
        
        return false;
    }
    


    // Initialize the enhanced ball movement system
    initializeEnhancedBallMovement() {
        this.connectedNodes = [];
        this.lastNodePositions = [];
        this.isBallClamped = [];
        this.transitionInProgress = [];
        // Initialize for each ball
        for (let i = 0; i < this.balls.length; i++) {
            this.connectedNodes[i] = [];
            this.lastNodePositions[i] = this.getBallGridPosition(i);
            this.isBallClamped[i] = false;
            this.transitionInProgress[i] = false;
        }
        
        // Calculate initial connected nodes for all balls
        this.recalculateAllConnectedNodes();
        
        // Initialize glow animations for all balls
        this.initializeGlowAnimations();
    }

    // Get ball's current grid position
    getBallGridPosition(ballIndex) {
        const ball = this.balls[ballIndex];
        if (!ball) return { x: 0, y: 0 };
        
        const gridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const gridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        return { x: gridX, y: gridY };
    }

    // Calculate connected nodes for a specific ball
    calculateConnectedNodes(ballIndex) {
        const nodes = this.getCurrentNodes();
        if (!nodes) return [];
        
        const currentPos = this.getBallGridPosition(ballIndex);
        const connected = [];
        
        // Get the current node type to check for directional constraints
        const currentNodeType = this.getNodeType(currentPos.x, currentPos.y);
        
        // Check all four adjacent directions
        const directions = [
            { dx: 1, dy: 0 },   // Right
            { dx: -1, dy: 0 },  // Left
            { dx: 0, dy: 1 },   // Down
            { dx: 0, dy: -1 }   // Up
        ];
        
        for (const dir of directions) {
            const newX = currentPos.x + dir.dx;
            const newY = currentPos.y + dir.dy;
            
            // Check bounds
            if (newY < 0 || newY >= nodes.length || 
                newX < 0 || newX >= nodes[newY].length) {
                continue;
            }
            
            // Check if the ball can move in this direction from its current position
            const canMoveInDirection = this.canBallMoveInDirectionFromCurrent(ballIndex, dir, currentNodeType);
            if (!canMoveInDirection) {
                continue;
            }
            
            // Check if node is accessible and unoccupied
            const canMove = this.canBallMoveToNode(ballIndex, newX, newY);
            const isOccupied = this.isNodeOccupied(newX, newY, ballIndex);
            
            if (canMove && !isOccupied) {
                connected.push({ x: newX, y: newY });
            }
        }
        
        return connected;
    }
    
    // Check if a ball can move in a specific direction from its current position
    canBallMoveInDirectionFromCurrent(ballIndex, direction, currentNodeType) {
        // If the ball is on a regular path node (p#), it can move in any direction
        if (currentNodeType.startsWith('p')) {
            return true;
        }
        
        // If the ball is on a vertical node (v#), it can only move vertically
        if (currentNodeType.startsWith('v')) {
            return direction.dx === 0 && Math.abs(direction.dy) === 1;
        }
        
        // If the ball is on a horizontal node (h#), it can only move horizontally
        if (currentNodeType.startsWith('h')) {
            return direction.dy === 0 && Math.abs(direction.dx) === 1;
        }
        
        // If the ball is on a sticker node, it can move in any direction
        if (currentNodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
            return true;
        }
        
        // If the ball is on a well node, it can move in any direction
        if (currentNodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WELL) {
            return true;
        }
        
        // If the ball is on a switch node, it can move in any direction
        if (currentNodeType.startsWith('s')) {
            return true;
        }
        
        // If the ball is on a trap node, check if it's open (allow movement) or closed (block movement)
        if (currentNodeType.startsWith('x') && currentNodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
            const currentFace = this.getBallCurrentFace(this.balls[ballIndex]);
            const nodeKey = `${this.getBallGridPosition(ballIndex).y}_${this.getBallGridPosition(ballIndex).x}`;
            const isClosed = this.closedTraps[currentFace] && 
                           this.closedTraps[currentFace][nodeKey];
            
            // Check if there's an active switch of the same color
            const trapColor = currentNodeType.charAt(1);
            const hasActiveSwitch = this.hasActiveSwitchOfColor(trapColor);
            
            // If there's an active switch of the same color, allow movement regardless of trap state
            if (hasActiveSwitch) {

                return true;
            }
            
            // Allow movement only if trap is open (not closed)
            return !isClosed;
        }
        
        // For other node types (wall, etc.), no movement allowed
        return false;
    }

    // Recalculate connected nodes for all balls
    recalculateAllConnectedNodes() {
        for (let i = 0; i < this.balls.length; i++) {
            this.connectedNodes[i] = this.calculateConnectedNodes(i);
        }
    }

    // Update last node position when ball completes transition
    updateBallLastNode(ballIndex) {
        this.lastNodePositions[ballIndex] = this.getBallGridPosition(ballIndex);
        this.recalculateAllConnectedNodes();
    }

    // Find closest destination node from connected nodes
    findClosestDestination(ballIndex, touchPos) {
        const connected = this.connectedNodes[ballIndex];
        if (!connected || connected.length === 0) return null;
        
        // Get current node position
        const lastNode = this.lastNodePositions[ballIndex];
        const lastNodeX = this.boardStartX + lastNode.x * this.gridSize;
        const lastNodeY = this.boardStartY + lastNode.y * this.gridSize;
        
        // Calculate distance from touch to current node
        const currentDistance = this.manhattanDistance(touchPos.x, touchPos.y, lastNodeX, lastNodeY);
        
        let closestNode = null;
        let closestDistance = Infinity;
        
        for (const node of connected) {
            const nodeX = this.boardStartX + node.x * this.gridSize;
            const nodeY = this.boardStartY + node.y * this.gridSize;
            
            const distance = this.manhattanDistance(touchPos.x, touchPos.y, nodeX, nodeY);
            
            // Only consider nodes that are closer to touch than current position
            if (distance < currentDistance && distance < closestDistance) {
                closestDistance = distance;
                closestNode = node;
            }
        }
        
        return closestNode;
    }

    // Start transition animation for a ball
    startBallTransition(ballIndex, targetNode, customDuration = null) {
        if (this.transitionInProgress[ballIndex]) return;
        
        const ball = this.balls[ballIndex];
        if (!ball) return;
        
        const targetX = this.boardStartX + targetNode.x * this.gridSize;
        const targetY = this.boardStartY + targetNode.y * this.gridSize;
        
        // Mark transition as in progress
        this.transitionInProgress[ballIndex] = true;
        
        // Start animation
        this.animateBallToPosition(ballIndex, targetX, targetY, customDuration);
    }

    // Complete ball transition
    completeBallTransition(ballIndex) {
        this.transitionInProgress[ballIndex] = false;
        
        const ball = this.balls[ballIndex];
        if (!ball) return;
        
        // Get the node the ball just left (previous position)
        const previousNode = this.lastNodePositions[ballIndex];
        const previousGridX = previousNode.x;
        const previousGridY = previousNode.y;
        
        // Get the node the ball just entered (current position)
        const currentGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const currentGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        const currentFace = this.getBallCurrentFace(ball);
        
        // Handle visited nodes tracking for balls with tail
        if (ball.hasTail && ball.visitedNodes) {
            
            // Check if this ball is currently backtracking
            if (this.isBacktracking[ballIndex]) {
                
                // Clear the backtracking flag
                this.isBacktracking[ballIndex] = false;
                
                // Don't create any new connections or add nodes to visited list during backtracking
                
                // Continue multi-step backtracking sequence if there are more steps
                if (this.backtrackingQueue[ballIndex]) {
                    // Use setTimeout to ensure the current transition is fully complete
                    setTimeout(() => {
                        this.executeNextBacktrackingStep(ballIndex);
                    }, 10); // Reduced delay for faster backtracking
                } else {
                    // No more steps in queue, ensure backtracking flag is cleared
                    this.isBacktracking[ballIndex] = false;
                }
            } else {
                // Check if the ball is returning to a previously visited node
                const isReturningToVisited = ball.visitedNodes.some(node => 
                    node.x === currentGridX && node.y === currentGridY && node.face === currentFace
                );
                
                if (isReturningToVisited) {

                    // Remove the current node from visited nodes (ball is backtracking)
                    ball.visitedNodes = ball.visitedNodes.filter(node => 
                        !(node.x === currentGridX && node.y === currentGridY && node.face === currentFace)
                    );
                    
                    // Remove tail from the current node since it's no longer visited
                    this.removeNodeTail(currentGridX, currentGridY, ballIndex);
                    
                    // Remove tail from the connection between previous and current node
                    this.removeConnectionTail(previousGridX, previousGridY, currentGridX, currentGridY, ballIndex);
                    
                    // Check if ball has no more visited nodes and should lose tail property
                    if (ball.visitedNodes.length === 0) {
                        ball.hasTail = false;
                    }
                } else {
                    // Check if the previous node is a sticker node (special case)
                    const previousNodeType = this.getNodeTypeAt(previousGridX, previousGridY);
                    const isMovingFromSticker = previousNodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER;
                    
                    if (isMovingFromSticker) {
                        
                        // Always add sticker node to visited nodes when moving away from it
                        const previousFace = this.getBallCurrentFace(ball);
                        const newNodeToAdd = {
                            x: previousGridX,
                            y: previousGridY,
                            face: previousFace
                        };
                        ball.visitedNodes.push(newNodeToAdd);
                        
                        // Create tail on the sticker node
                        this.createNodeTail(previousGridX, previousGridY, ballIndex, ball.color);
                        
                        // Create tail on the connection from sticker to current node
                        this.createConnectionTail(previousGridX, previousGridY, currentGridX, currentGridY, ballIndex, ball.color);
                    } else {
                        
                        // Add the previous node to visited nodes (ball is moving forward)
                        const previousFace = this.getBallCurrentFace(ball);
                        const newNodeToAdd = {
                            x: previousGridX,
                            y: previousGridY,
                            face: previousFace
                        };
                        ball.visitedNodes.push(newNodeToAdd);
                        
                        // Create tail on the node the ball just left
                        this.createNodeTail(previousGridX, previousGridY, ballIndex, ball.color);
                        
                        // Create tail on the connection between previous and current node
                        this.createConnectionTail(previousGridX, previousGridY, currentGridX, currentGridY, ballIndex, ball.color);
                    }
                }
            }
        } else if (ball.hasTail) {
            
            // Ball has tail but no visited nodes list (legacy case)
            // Add the previous node to visited nodes
            const previousFace = this.getBallCurrentFace(ball);
            const initialNode = {
                x: previousGridX,
                y: previousGridY,
                face: previousFace
            };
            ball.visitedNodes = [initialNode];
            
            // Create tail on the node the ball just left
            this.createNodeTail(previousGridX, previousGridY, ballIndex, ball.color);
            
            // Create tail on the connection between previous and current node
            this.createConnectionTail(previousGridX, previousGridY, currentGridX, currentGridY, ballIndex, ball.color);
        }
        
        // Check if ball entered a sticker node and give it tail property
        const currentNodeType = this.getNodeTypeAt(currentGridX, currentGridY);
        if (currentNodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
            
            // If the ball was backtracking, clear the backtracking flag (backtracking to sticker is complete)
            if (this.isBacktracking[ballIndex]) {
                this.isBacktracking[ballIndex] = false;
                // Clean up any remaining queue
                if (this.backtrackingQueue[ballIndex]) {
                    delete this.backtrackingQueue[ballIndex];
                }
            }
            
            ball.hasTail = true;
            // Initialize visited nodes if not already done
            if (!ball.visitedNodes) {
                ball.visitedNodes = [];
            }
            // Activate the sticker with the ball's color
            this.activateSticker(currentGridX, currentGridY, ballIndex, ball.color);
        }
        
        this.updateBallLastNode(ballIndex);
        
        // Create movement trail animation at the destination node
        const ballColor = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[ball.color] || '#FFFFFF';
        this.createMovementTrail(ball.x, ball.y, ballColor);
        
        // Update goal states after tail system is updated
        this.updateGoalStatesAfterBallMove(ballIndex);
        
        // Handle touch feedback based on ball state
        if (this.touchAnimationState[ballIndex]) {
            const isAtGoal = this.isBallAtGoal(ball, ballIndex);
            
            if (!this.isBallClamped[ballIndex]) {
                // Ball is not clamped - check if it's at a goal
                if (isAtGoal) {
                    // Ball is at goal - set to rest scale
                    this.balls[ballIndex].isTouched = false;
                    this.balls[ballIndex].touchOpacity = 0.0;
                    this.balls[ballIndex].touchScale = this.restScale;
                    // Remove the animation state
                    delete this.touchAnimationState[ballIndex];
                } else {
                    // Ball is not at goal and not clamped - should be at rest scale
                    this.balls[ballIndex].isTouched = false;
                    this.balls[ballIndex].touchOpacity = 0.0;
                    this.balls[ballIndex].touchScale = this.restScale;
                    // Remove the animation state
                    delete this.touchAnimationState[ballIndex];
                }
            } else {
                // Ball is still clamped - keep it in clamped state (enlarged)
                // Don't remove the animation state, let it continue
            }
        }
        
        // Check if we need to continue with another transition
        if (this.isBallClamped[ballIndex] && this.touchPosition) {
            // Use setTimeout to ensure the current transition is fully complete
            setTimeout(() => {
                this.handleClampedBallMovement(ballIndex, this.touchPosition);
            }, 10);
        }
    }

    // Enhanced touch move handling for clamped balls
    handleClampedBallMovement(ballIndex, touchPos) {
        if (!this.isBallClamped[ballIndex]) return;
        
        // Check if we need to start a transition
        if (this.transitionInProgress[ballIndex]) {
            return; // Already in transition, wait for completion
        }
        
        const lastNode = this.lastNodePositions[ballIndex];
        const lastNodeX = this.boardStartX + lastNode.x * this.gridSize;
        const lastNodeY = this.boardStartY + lastNode.y * this.gridSize;
        
        // Calculate distance from touch to last node
        const touchDist = this.manhattanDistance(touchPos.x, touchPos.y, lastNodeX, lastNodeY);
        
        // Check if touch is far enough to start transition
        const threshold = this.gridSize * 0.65;
        
        if (touchDist > threshold) {
            // Find closest destination from connected nodes
            const closestDestination = this.findClosestDestination(ballIndex, touchPos);
            
            if (closestDestination) {
                this.startBallTransition(ballIndex, closestDestination);
            }
        }
    }

    /**
     * Calculate Euclidean distance between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} Euclidean distance between the points
     */
    euclideanDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate Manhattan distance between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} Manhattan distance between the points
     */
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    }

    // Check if a ball has a valid path connection to a well
    hasValidPathToWell(ballIndex, wellGridX, wellGridY) {
        const ball = this.balls[ballIndex];
        if (!ball) {
            return false;
        }
        
        // Get ball's current grid position
        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // If ball is already on the well, it's valid
        if (ballGridX === wellGridX && ballGridY === wellGridY) {
            return true;
        }
        
        // Use pathfinding to check if there's a valid path from ball to well
        const path = this.findPathToWell(ballIndex, ballGridX, ballGridY, wellGridX, wellGridY);
        const hasPath = path && path.length > 0;
        
        return hasPath;
    }
    
    // Find a path from ball's current position to a well
    findPathToWell(ballIndex, startX, startY, targetX, targetY) {
        const nodes = this.getCurrentNodes();
        if (!nodes) return null;
        
        // Simple BFS pathfinding
        const queue = [{ x: startX, y: startY, path: [] }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            // Check if we reached the target
            if (current.x === targetX && current.y === targetY) {
                return current.path;
            }
            
            // Check all four adjacent directions
            const directions = [
                { dx: 1, dy: 0 },   // Right
                { dx: -1, dy: 0 },  // Left
                { dx: 0, dy: 1 },   // Down
                { dx: 0, dy: -1 }   // Up
            ];
            
            for (const dir of directions) {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                
                // Check bounds
                if (newY < 0 || newY >= nodes.length || 
                    newX < 0 || newX >= nodes[newY].length) {
                    continue;
                }
                
                // Check if node is accessible and unoccupied
                if (this.canBallMoveToNode(ballIndex, newX, newY) && 
                    !this.isNodeOccupied(newX, newY, ballIndex)) {
                    
                    const newPath = [...current.path, { x: newX, y: newY }];
                    queue.push({ x: newX, y: newY, path: newPath });
                }
            }
        }
        
        return null;
    }

    renderTailNodes() {
        // Render tail nodes (nodes with tail property)
        if (!this.nodeTails[this.currentFace]) return;
        
        Object.keys(this.nodeTails[this.currentFace]).forEach(nodeKey => {
            const tailData = this.nodeTails[this.currentFace][nodeKey];
            const [row, col] = nodeKey.split('_').map(Number);
            
            const centerX = this.boardStartX + (col * this.gridSize);
            const centerY = this.boardStartY + (row * this.gridSize);
            
            // Get ball color and brighten it for tail
            const ballColorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[tailData.color] || '#FFFFFF';
            const ballColor = this.brightenColor(ballColorHex, 0.3);
            
            // Calculate tail ball size
            const normalBallRadius = this.getVisualBallRadius({});
            const tailBallRadius = normalBallRadius * CONSTANTS.RENDER_SIZE_CONFIG.TAIL_BALL_SIZE_RATIO;
            
            // Draw tail ball
            this.ctx.fillStyle = ballColor;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, tailBallRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }

    renderTailConnections() {
        // Render tail connections (connections with tail property)
        if (!this.connectionTails[this.currentFace]) return;
        
        Object.keys(this.connectionTails[this.currentFace]).forEach(connectionKey => {
            const tailData = this.connectionTails[this.currentFace][connectionKey];
            const [row1, col1, row2, col2] = connectionKey.split('_').map(Number);
            
            const x1 = this.boardStartX + (col1 * this.gridSize);
            const y1 = this.boardStartY + (row1 * this.gridSize);
            const x2 = this.boardStartX + (col2 * this.gridSize);
            const y2 = this.boardStartY + (row2 * this.gridSize);
            
            // Get ball color and brighten it for tail
            const ballColorHex = CONSTANTS.LEVEL_CONFIG.BALL_COLORS[tailData.color] || '#FFFFFF';
            const ballColor = this.brightenColor(ballColorHex, 0.3);
            
            // Calculate tail line width
            const normalLineWidth = Math.max(CONSTANTS.RENDER_SIZE_CONFIG.PATH_LINE_MIN_WIDTH, this.gridSize * CONSTANTS.RENDER_SIZE_CONFIG.PATH_LINE_RATIO);
            const tailLineWidth = normalLineWidth * CONSTANTS.RENDER_SIZE_CONFIG.TAIL_LINE_WIDTH_MULTIPLIER;
            
            // Draw tail connection
            this.ctx.strokeStyle = ballColor;
            this.ctx.lineWidth = tailLineWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        });
    }

    // Get the node type at a specific grid position
    getNodeTypeAt(gridX, gridY) {
        const nodes = this.getCurrentNodes();
        if (!nodes || gridY < 0 || gridY >= nodes.length || gridX < 0 || gridX >= nodes[gridY].length) {
            return CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
        }
        return nodes[gridY][gridX] || CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
    }

    // Get the node type at a specific grid position for a specific face
    getNodeTypeAtFace(gridX, gridY, face) {
        if (!this.board || !this.board[face]) {
            return CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
        }
        const nodes = this.board[face];
        if (!nodes || gridY < 0 || gridY >= nodes.length || gridX < 0 || gridX >= nodes[gridY].length) {
            return CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
        }
        return nodes[gridY][gridX] || CONSTANTS.LEVEL_CONFIG.NODE_TYPES.EMPTY;
    }

    // Create a tail on a node
    createNodeTail(gridX, gridY, ballIndex, ballColor) {
        const face = this.currentFace;
        const nodeKey = `${gridY}_${gridX}`;
        
        // Initialize face if it doesn't exist
        if (!this.nodeTails[face]) {
            this.nodeTails[face] = {};
        }
        
        // Set tail data
        this.nodeTails[face][nodeKey] = {
            ballIndex: ballIndex,
            color: ballColor
        };
    }

    // Create a tail on a connection
    createConnectionTail(fromGridX, fromGridY, toGridX, toGridY, ballIndex, ballColor) {
        const face = this.currentFace;
        // Create a consistent key for the connection (smaller coordinates first)
        const connectionKey = this.getConnectionKey(fromGridX, fromGridY, toGridX, toGridY);
        
        // Initialize face if it doesn't exist
        if (!this.connectionTails[face]) {
            this.connectionTails[face] = {};
        }
        
        // Set tail data
        this.connectionTails[face][connectionKey] = {
            ballIndex: ballIndex,
            color: ballColor
        };
    }

    // Remove a tail from a node
    removeNodeTail(gridX, gridY, ballIndex) {
        const face = this.currentFace;
        const nodeKey = `${gridY}_${gridX}`;
        
        // Check if the tail exists and belongs to this ball
        if (this.nodeTails[face] && this.nodeTails[face][nodeKey]) {
            const tailData = this.nodeTails[face][nodeKey];
            if (tailData.ballIndex === ballIndex) {
                delete this.nodeTails[face][nodeKey];
            }
        }
    }

    // Remove a tail from a connection
    removeConnectionTail(fromGridX, fromGridY, toGridX, toGridY, ballIndex) {
        const face = this.currentFace;
        const connectionKey = this.getConnectionKey(fromGridX, fromGridY, toGridX, toGridY);
        
        // Check if the tail exists and belongs to this ball
        if (this.connectionTails[face] && this.connectionTails[face][connectionKey]) {
            const tailData = this.connectionTails[face][connectionKey];
            if (tailData.ballIndex === ballIndex) {
                delete this.connectionTails[face][connectionKey];
            }
        }
    }

    // Activate a sticker with a ball's color
    activateSticker(gridX, gridY, ballIndex, ballColor) {
        const face = this.currentFace;
        const nodeKey = `${gridY}_${gridX}`;
        
        // Initialize face if it doesn't exist
        if (!this.activatedStickers[face]) {
            this.activatedStickers[face] = {};
        }
        
        // Set activated sticker data
        this.activatedStickers[face][nodeKey] = {
            ballIndex: ballIndex,
            color: ballColor
        };
    }

    // Check if a ball entered a trap and activate it
    checkTrapActivation(ballIndex) {
        const ball = this.balls[ballIndex];
        if (!ball) return;
        
        // Get ball's current grid position
        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // Get node type at ball's position
        const nodeType = this.getNodeTypeAt(ballGridX, ballGridY);

        
        // Check if ball is on a trap node
        if (nodeType.startsWith('x') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
            const face = this.getBallCurrentFace(ball);
            const nodeKey = `${ballGridY}_${ballGridX}`;
            
            // Check if trap is already closed
            const isClosed = this.closedTraps[face] && 
                           this.closedTraps[face][nodeKey];
            

            
            // Check if there's an active switch of the same color
            const trapColor = nodeType.charAt(1); // Get the color character (r, g, b, l, y, p, o)
            const hasActiveSwitch = this.hasActiveSwitchOfColor(trapColor);
            
            if (!isClosed && !hasActiveSwitch) {
                // Only activate the trap if it's not already closed AND there's no active switch of the same color

                this.activateTrap(ballGridX, ballGridY, ballIndex);
            } else if (hasActiveSwitch) {

                // Ensure the trap is not in closedTraps when there's an active switch
                if (this.closedTraps[face] && this.closedTraps[face][nodeKey]) {
                    delete this.closedTraps[face][nodeKey];

                }
                // Ensure the ball is not marked as trapped when there's an active switch
                if (ball.isTrapped) {
                    ball.isTrapped = false;

                }
            }
        }
    }

    // Check if a ball entered a switch and activate it
    checkSwitchActivation(ballIndex) {
        const ball = this.balls[ballIndex];
        if (!ball) return;
        
        // Get ball's current grid position
        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // Get node type at ball's position
        const nodeType = this.getNodeTypeAt(ballGridX, ballGridY);

        
        // Check if ball is on a switch node (colored switches only)
        if (nodeType.startsWith('s')) {
            const face = this.getBallCurrentFace(ball);
            const nodeKey = `${ballGridY}_${ballGridX}`;
            
            // Check if switch is already closed
            const isClosed = this.closedSwitches[face] && 
                           this.closedSwitches[face][nodeKey];
            

            
            if (!isClosed) {
                // Activate the switch

                this.activateSwitch(ballGridX, ballGridY, ballIndex, face);
            }
        }
    }

    // Check if any ball left a switch and deactivate it
    checkSwitchDeactivation(ballIndex) {
        // Check both faces for switches that might have been left
        ['front', 'rear'].forEach(face => {
            if (this.closedSwitches[face]) {
                Object.keys(this.closedSwitches[face]).forEach(nodeKey => {
                    const [row, col] = nodeKey.split('_').map(Number);
                    const nodeType = this.getNodeTypeAt(col, row);
                    
                    // Check if this is a switch node
                    if (nodeType.startsWith('s')) {
                        // Check if ANY ball is still on this switch
                        let anyBallOnSwitch = false;
                        
                        for (let i = 0; i < this.balls.length; i++) {
                            const checkBall = this.balls[i];
                            if (!checkBall) continue;
                            
                            const checkBallGridX = Math.round((checkBall.x - this.boardStartX) / this.gridSize);
                            const checkBallGridY = Math.round((checkBall.y - this.boardStartY) / this.gridSize);
                            const checkBallFace = this.getBallCurrentFace(checkBall);
                            
                            if (checkBallFace === face && checkBallGridX === col && checkBallGridY === row) {
                                anyBallOnSwitch = true;
                                break; // Found a ball on this switch, no need to check others
                            }
                        }
                        
                        if (!anyBallOnSwitch) {
                            // No ball is on this switch anymore, deactivate it

                            this.deactivateSwitch(col, row, ballIndex, face);
                        } else {

                        }
                    }
                });
            }
        });
    }

    // Check if a ball left a trap and handle it appropriately
    checkTrapDeactivation(ballIndex) {
        const ball = this.balls[ballIndex];
        if (!ball) return;
        
        // Get ball's current grid position
        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        
        // Check both faces for traps that might have been left
        ['front', 'rear'].forEach(face => {
            if (this.closedTraps[face]) {
                Object.keys(this.closedTraps[face]).forEach(nodeKey => {
                    const [row, col] = nodeKey.split('_').map(Number);
                    const nodeType = this.getNodeTypeAt(col, row);
                    
                    // Check if this is a trap node and if the ball is no longer on it
                    if (nodeType.startsWith('x') && nodeType !== CONSTANTS.LEVEL_CONFIG.NODE_TYPES.WALL) {
                        const ballFace = this.getBallCurrentFace(ball);
                        const ballOnTrap = (ballFace === face && ballGridX === col && ballGridY === row);
                        
                        if (!ballOnTrap) {
                            // Ball left the trap, check if we should close it
                            const trapColor = nodeType.charAt(1);
                            const hasActiveSwitch = this.hasActiveSwitchOfColor(trapColor);
                            
                            if (!hasActiveSwitch) {
                                // No active switch, close the trap
        
                                // Note: We don't actually close the trap here, just log it
                                // The trap should remain closed until a switch opens it
                            } else {
                                // Active switch exists, trap should remain open
        
                            }
                        }
                    }
                });
            }
        });
    }

    // Activate a trap (close it and trap the ball)
    activateTrap(gridX, gridY, ballIndex) {
        const ball = this.balls[ballIndex];
        const face = this.getBallCurrentFace(ball);
        const nodeKey = `${gridY}_${gridX}`;
        
        // Initialize face if it doesn't exist
        if (!this.closedTraps[face]) {
            this.closedTraps[face] = {};
        }
        
        if (!this.trapAnimations[face]) {
            this.trapAnimations[face] = {};
        }
        
        // Start trap animation (don't mark as closed until animation completes)
        this.trapAnimations[face][nodeKey] = {
            isAnimating: true,
            startTime: performance.now(),
            isOpening: false // Closing animation (trap is being activated)
        };

        
        // Play trap activation sound
        if (this.soundManager) {
            this.soundManager.playSound('trapActivate');
        }
        
        // Force ball to rest state (drop it)
        if (ball) {
            ball.isTouched = false;
            ball.touchOpacity = 0.0;
            ball.touchScale = this.restScale;
            
            // Ensure ball is at exact center of trap node
            ball.x = this.boardStartX + (gridX * this.gridSize);
            ball.y = this.boardStartY + (gridY * this.gridSize);
        }
        
        // Clear any ongoing animations for this ball
        if (ball && ball.animation) {
            ball.animation.isAnimating = false;
        }
        
        // Mark ball as trapped (cannot move)
        ball.isTrapped = true;
    }

    // Activate a switch (close it and control traps of the same color)
    activateSwitch(gridX, gridY, ballIndex, face) {
        const nodeKey = `${gridY}_${gridX}`;
        
        // Get the switch node type to determine color
        const nodeType = this.getNodeTypeAt(gridX, gridY);
        const switchColor = nodeType.charAt(1); // Get the color character (r, g, b, l, y, p, o)
        

        
        // Initialize face if it doesn't exist
        if (!this.closedSwitches[face]) {
            this.closedSwitches[face] = {};
        }
        
        if (!this.switchAnimations[face]) {
            this.switchAnimations[face] = {};
        }
        
        // Start switch animation (don't mark as closed until animation completes)
        this.switchAnimations[face][nodeKey] = {
            isAnimating: true,
            startTime: performance.now()
        };
        
        // Play switch activation sound
        if (this.soundManager) {
            this.soundManager.playSound('switchActivate');
        }
        
        // Open all traps of the same color in the level (all faces)
        this.openTrapsOfColor(switchColor);
        
        // Immediately free any balls that are trapped in traps of the same color
        this.freeTrappedBallsOfColor(switchColor);
    }

    // Deactivate a switch (open it and close traps of the same color)
    deactivateSwitch(gridX, gridY, ballIndex, face) {
        const nodeKey = `${gridY}_${gridX}`;
        
        // Get the switch node type to determine color
        const nodeType = this.getNodeTypeAt(gridX, gridY);
        const switchColor = nodeType.charAt(1); // Get the color character (r, g, b, l, y, p, o)
        

        
        // Remove from closed switches (open the switch)
        if (this.closedSwitches[face] && this.closedSwitches[face][nodeKey]) {
            delete this.closedSwitches[face][nodeKey];

        }
        
        // Check if there are still any active switches of this color
        const hasActiveSwitch = this.hasActiveSwitchOfColor(switchColor);
        
        // Only close traps if there are no active switches of this color
        if (!hasActiveSwitch) {
            this.closeTrapsOfColor(switchColor);
        }
    }

    // Check and update trap animations
    checkTrapAnimations() {
        let hasActiveAnimations = false;
        
        // Check both faces
        ['front', 'rear'].forEach(face => {
            if (this.trapAnimations[face]) {
                Object.keys(this.trapAnimations[face]).forEach(nodeKey => {
                    const animation = this.trapAnimations[face][nodeKey];
                    if (animation && animation.isAnimating) {
                        const elapsed = performance.now() - animation.startTime;
                        const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.TRAP_ANIMATION_DURATION, 1);
                        
                        if (progress >= 1) {
                            // Animation complete
                            animation.isAnimating = false;
                            
                            if (animation.isOpening) {
                                // Opening animation complete - remove from closed traps
                                if (this.closedTraps[face] && this.closedTraps[face][nodeKey]) {
                                    delete this.closedTraps[face][nodeKey];

                                    
                                    // Free any ball that was trapped in this trap
                                    const [row, col] = nodeKey.split('_').map(Number);
                                    this.balls.forEach((ball, ballIndex) => {
                                        if (ball.isTrapped) {
                                            const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
                                            const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
                                            const ballFace = this.getBallCurrentFace(ball);
                                            
                                            // Check if this ball is on the trap that just opened
                                            if (ballFace === face && ballGridX === col && ballGridY === row) {
                                                ball.isTrapped = false;
        
                                            }
                                        }
                                    });
                                    
                                    // Recalculate connected nodes after freeing ball
                                    this.recalculateAllConnectedNodes();
                                }
                            } else {
                                // Closing animation complete - mark trap as closed
                                if (!this.closedTraps[face]) {
                                    this.closedTraps[face] = {};
                                }
                                this.closedTraps[face][nodeKey] = true;

                                
                                // Trap any ball that is on this trap (only if no active switch of same color)
                                const [row, col] = nodeKey.split('_').map(Number);
                                const nodeType = this.getNodeTypeAt(col, row);
                                const trapColor = nodeType.charAt(1);
                                const hasActiveSwitch = this.hasActiveSwitchOfColor(trapColor);
                                
                                if (!hasActiveSwitch) {
                                    this.balls.forEach((ball, ballIndex) => {
                                        const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
                                        const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
                                        const ballFace = this.getBallCurrentFace(ball);
                                        
                                        // Check if this ball is on the trap that just closed
                                        if (ballFace === face && ballGridX === col && ballGridY === row) {
                                            ball.isTrapped = true;

                                        }
                                    });
                                }
                                
                                // Recalculate connected nodes after trapping ball
                                this.recalculateAllConnectedNodes();
                            }
                        } else {
                            hasActiveAnimations = true;
                        }
                    }
                });
            }
        });
        
        return hasActiveAnimations;
    }

    // Check and update switch animations
    checkSwitchAnimations() {
        let hasActiveAnimations = false;
        
        // Check both faces
        ['front', 'rear'].forEach(face => {
            if (this.switchAnimations[face]) {
                Object.keys(this.switchAnimations[face]).forEach(nodeKey => {
                    const animation = this.switchAnimations[face][nodeKey];
                    if (animation && animation.isAnimating) {
                        const elapsed = performance.now() - animation.startTime;
                        const progress = Math.min(elapsed / CONSTANTS.ANIMATION_CONFIG.SWITCH_ANIMATION_DURATION, 1);
                        
                        if (progress >= 1) {
                            // Animation complete
                            animation.isAnimating = false;
                            
                            // Mark switch as closed now that animation is complete
                            if (!this.closedSwitches[face]) {
                                this.closedSwitches[face] = {};
                            }
                            this.closedSwitches[face][nodeKey] = true;
                            

                        } else {
                            hasActiveAnimations = true;
                        }
                    }
                });
            }
        });
        
        return hasActiveAnimations;
    }

    // Open all traps of a specific color in the level (all faces) that are currently holding balls
    openTrapsOfColor(color) {

        
        // Check both faces
        ['front', 'rear'].forEach(face => {
            if (this.board && this.board[face]) {
                const nodes = this.board[face];
                for (let row = 0; row < nodes.length; row++) {
                    const rowArray = nodes[row];
                    for (let col = 0; col < rowArray.length; col++) {
                        const nodeType = rowArray[col];
                        
                        // Check if this is a trap of the specified color
                        if (nodeType === `x${color}`) {
                            const nodeKey = `${row}_${col}`;
                            
                            // Check if this trap is currently holding a ball
                            const isHoldingBall = this.isTrapHoldingBall(face, row, col);
                            
                            if (isHoldingBall) {
                                // Check if this trap is currently closed
                                if (this.closedTraps[face] && this.closedTraps[face][nodeKey]) {
                                    // Initialize trap animations if it doesn't exist
                                    if (!this.trapAnimations[face]) {
                                        this.trapAnimations[face] = {};
                                    }
                                    
                                    // Start trap opening animation (from closed to open state)
                                    this.trapAnimations[face][nodeKey] = {
                                        isAnimating: true,
                                        startTime: performance.now(),
                                        isOpening: true // New flag to indicate opening animation
                                    };

                                    
                                    // Play trap opening sound
                                    if (this.soundManager) {
                                        this.soundManager.playSound('success');
                                    }
                                }
                            } else {
                                
                            }
                        }
                    }
                }
            }
        });
        
        // Note: Balls will be freed when the trap opening animation completes
        // Recalculate connected nodes for all balls after trap state changes
        this.recalculateAllConnectedNodes();
    }

    // Check if there's an active switch of a specific color
    hasActiveSwitchOfColor(color) {
        // Check both faces for active switches of the specified color
        for (const face of ['front', 'rear']) {
            // Check for closed switches
            if (this.closedSwitches[face]) {
                for (const nodeKey of Object.keys(this.closedSwitches[face])) {
                    const [row, col] = nodeKey.split('_').map(Number);
                    const nodeType = this.getNodeTypeAtFace(col, row, face);
                    
                    // Check if this is a switch of the specified color
                    if (nodeType === `s${color}`) {
                        return true; // Found an active switch of this color
                    }
                }
            }
            
            // Check for switches that are currently animating (being activated)
            if (this.switchAnimations[face]) {
                for (const nodeKey of Object.keys(this.switchAnimations[face])) {
                    const animation = this.switchAnimations[face][nodeKey];
                    if (animation && animation.isAnimating) {
                        const [row, col] = nodeKey.split('_').map(Number);
                        const nodeType = this.getNodeTypeAtFace(col, row, face);
                        
                        // Check if this is a switch of the specified color
                        if (nodeType === `s${color}`) {
                            return true; // Found a switch of this color that's being activated
                        }
                    }
                }
            }
        }
        return false; // No active switch of this color found
    }

    // Immediately free any balls that are trapped in traps of the specified color
    freeTrappedBallsOfColor(color) {

        
        // Check both faces
        ['front', 'rear'].forEach(face => {
            if (this.board && this.board[face]) {
                const nodes = this.board[face];
                for (let row = 0; row < nodes.length; row++) {
                    const rowArray = nodes[row];
                    for (let col = 0; col < rowArray.length; col++) {
                        const nodeType = rowArray[col];
                        
                        // Check if this is a trap of the specified color
                        if (nodeType === `x${color}`) {
                            // Check if any ball is trapped at this position
                            this.balls.forEach((ball, ballIndex) => {
                                if (ball && ball.isTrapped) {
                                    const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
                                    const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
                                    const ballFace = this.getBallCurrentFace(ball);
                                    
                                    // Check if this ball is on the trap that should be opened
                                    if (ballFace === face && ballGridX === col && ballGridY === row) {
                                        ball.isTrapped = false;

                                    }
                                }
                            });
                        }
                    }
                }
            }
        });
        
        // Recalculate connected nodes after freeing balls
        this.recalculateAllConnectedNodes();
    }

    // Check if a trap at the specified position is currently holding a ball
    isTrapHoldingBall(face, row, col) {
        // Check if any ball is currently on this trap position
        for (let ballIndex = 0; ballIndex < this.balls.length; ballIndex++) {
            const ball = this.balls[ballIndex];
            if (!ball) continue;
            
            const ballGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
            const ballGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
            const ballFace = this.getBallCurrentFace(ball);
            
            // Check if this ball is on the specified trap position
            if (ballFace === face && ballGridX === col && ballGridY === row) {
                return true; // This trap is holding a ball
            }
        }
        return false; // No ball is on this trap
    }

    // Close all traps of a specific color in the level (all faces) that are currently holding balls
    closeTrapsOfColor(color) {

        
        // Check both faces
        ['front', 'rear'].forEach(face => {
            if (this.board && this.board[face]) {
                const nodes = this.board[face];
                for (let row = 0; row < nodes.length; row++) {
                    const rowArray = nodes[row];
                    for (let col = 0; col < rowArray.length; col++) {
                        const nodeType = rowArray[col];
                        
                        // Check if this is a trap of the specified color
                        if (nodeType === `x${color}`) {
                            const nodeKey = `${row}_${col}`;
                            
                            // Check if this trap is currently holding a ball
                            const isHoldingBall = this.isTrapHoldingBall(face, row, col);
                            
                            if (isHoldingBall) {
                                // Check if this trap is currently open (not in closedTraps)
                                if (!this.closedTraps[face] || !this.closedTraps[face][nodeKey]) {
                                    // Check if there's an active switch of the same color
                                    const hasActiveSwitch = this.hasActiveSwitchOfColor(color);
                                    
                                    // Only close the trap if there's no active switch
                                    if (!hasActiveSwitch) {
                                        // Initialize trap animations if it doesn't exist
                                        if (!this.trapAnimations[face]) {
                                            this.trapAnimations[face] = {};
                                        }
                                        
                                        // Start trap closing animation (from open to closed state)
                                        this.trapAnimations[face][nodeKey] = {
                                            isAnimating: true,
                                            startTime: performance.now(),
                                            isOpening: false // Closing animation
                                        };

                                        
                                        // Play trap closing sound
                                        if (this.soundManager) {
                                            this.soundManager.playSound('trapClose');
                                        }
                                    }
                                }
                            } else {
                                
                            }
                        }
                    }
                }
            }
        });
        
        // Recalculate connected nodes for all balls after trap state changes
        this.recalculateAllConnectedNodes();
    }

    // Get a consistent connection key (smaller coordinates first)
    getConnectionKey(x1, y1, x2, y2) {
        // Sort coordinates to ensure consistent key regardless of direction
        const [smallerX, smallerY, largerX, largerY] = 
            (x1 < x2 || (x1 === x2 && y1 < y2)) ? [x1, y1, x2, y2] : [x2, y2, x1, y1];
        return `${smallerY}_${smallerX}_${largerY}_${largerX}`;
    }

    /**
     * Trigger multi-step backtracking for a ball to a specific visited node
     * @param {number} ballIndex - Index of the ball to backtrack
     * @param {Object} targetNode - The target visited node to backtrack to
     */
    triggerMultiStepBacktracking(ballIndex, targetNode) {
        const ball = this.balls[ballIndex];
        if (!ball || !ball.hasTail || !ball.visitedNodes || ball.visitedNodes.length === 0) {
            return;
        }

        // Check if ball is already backtracking
        if (this.isBacktracking[ballIndex]) {
            return;
        }

        // Find the target node in the visited nodes list
        const targetNodeIndex = ball.visitedNodes.findIndex(node => 
            node.x === targetNode.x && node.y === targetNode.y && node.face === targetNode.face
        );

        if (targetNodeIndex === -1) {
            return;
        }

        // Create backtracking sequence from last visited node to target node (inclusive)
        const backtrackingSequence = [];
        for (let i = ball.visitedNodes.length - 1; i >= targetNodeIndex; i--) {
            backtrackingSequence.push(ball.visitedNodes[i]);
        }

        // Store the sequence in the queue
        this.backtrackingQueue[ballIndex] = {
            sequence: backtrackingSequence,
            currentIndex: 0
        };

        // Start the first backtracking step
        this.executeNextBacktrackingStep(ballIndex);
    }

    /**
     * Execute the next step in a multi-step backtracking sequence
     * @param {number} ballIndex - Index of the ball to backtrack
     */
    executeNextBacktrackingStep(ballIndex) {
        const queueItem = this.backtrackingQueue[ballIndex];
        if (!queueItem || queueItem.currentIndex >= queueItem.sequence.length) {
            // Backtracking sequence complete
            delete this.backtrackingQueue[ballIndex];
            // Clear the backtracking flag when sequence is complete
            this.isBacktracking[ballIndex] = false;
            return;
        }

        const targetNode = queueItem.sequence[queueItem.currentIndex];

        // Trigger single-step backtracking
        this.triggerBallBacktracking(ballIndex, targetNode);

        // Increment the current index for the next step
        queueItem.currentIndex++;
    }

    /**
     * Trigger backtracking for a ball to its last visited node
     * @param {number} ballIndex - Index of the ball to backtrack
     * @param {Object} lastVisitedNode - The last visited node to backtrack to
     */
    triggerBallBacktracking(ballIndex, lastVisitedNode) {
        const ball = this.balls[ballIndex];
        if (!ball || !ball.hasTail || !ball.visitedNodes || ball.visitedNodes.length === 0) {
            return;
        }

        // Cancel any ongoing transitions for this ball
        this.transitionInProgress[ballIndex] = false;
        
        // Cancel any ongoing animations for this ball
        if (ball.animation && ball.animation.isAnimating) {
            ball.animation.isAnimating = false;
        }

        // Mark this ball as backtracking
        this.isBacktracking[ballIndex] = true;

        // Get current ball position
        const currentGridX = Math.round((ball.x - this.boardStartX) / this.gridSize);
        const currentGridY = Math.round((ball.y - this.boardStartY) / this.gridSize);
        const currentFace = this.getBallCurrentFace(ball);

        // Remove the tail connection immediately
        this.removeConnectionTail(currentGridX, currentGridY, lastVisitedNode.x, lastVisitedNode.y, ballIndex);

        // Remove the tail disc at the last visited node (before ball arrives)
        this.removeNodeTail(lastVisitedNode.x, lastVisitedNode.y, ballIndex);

        // Remove the last visited node from the list
        ball.visitedNodes.pop();

        // Check if ball has no more visited nodes and should lose tail property
        if (ball.visitedNodes.length === 0) {
            ball.hasTail = false;
        }

        // Calculate target position in canvas coordinates
        const targetX = this.boardStartX + lastVisitedNode.x * this.gridSize;
        const targetY = this.boardStartY + lastVisitedNode.y * this.gridSize;

        // Start ball movement animation to the last visited node with faster backtracking duration
        this.startBallTransition(ballIndex, { x: lastVisitedNode.x, y: lastVisitedNode.y }, CONSTANTS.ANIMATION_CONFIG.BALL_BACKTRACK_DURATION);
    }

    /**
     * Initialize the tail system for a new level
     * Resets all tail data structures
     */
    initializeTailSystem() {
        // Reset tail data structures
        this.nodeTails = {
            front: {},
            rear: {}
        };
        this.connectionTails = {
            front: {},
            rear: {}
        };
        
        // Reset activated stickers
        this.activatedStickers = {
            front: {},
            rear: {}
        };
        
        // Reset trap state
        this.closedTraps = {
            front: {},
            rear: {}
        };
        this.trapAnimations = {
            front: {},
            rear: {}
        };
        
        // Check for balls that start on sticker nodes and activate them
        this.balls.forEach((ball, ballIndex) => {
            // Get the ball's starting grid position
            const startX = ball.originalStart[0] < 0 ? -ball.originalStart[0] : ball.originalStart[0];
            const startY = ball.originalStart[1] < 0 ? -ball.originalStart[1] : ball.originalStart[1];
            
            // Check if ball starts on a sticker node
            const startNodeType = this.getNodeTypeAt(startX, startY);
            if (startNodeType === CONSTANTS.LEVEL_CONFIG.NODE_TYPES.STICKER) {
                ball.hasTail = true;
                // Initialize visited nodes for balls with tail
                if (!ball.visitedNodes) {
                    ball.visitedNodes = [];
                }
                // Activate the sticker with the ball's color
                this.activateSticker(startX, startY, ballIndex, ball.color);
            } else {
                ball.hasTail = false;
                // Initialize visited nodes as empty array for all balls
                if (!ball.visitedNodes) {
                    ball.visitedNodes = [];
                }
            }
        });
    }

}
