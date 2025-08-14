/**
 * Flipgame - Main Application Controller
 * Responsabile per: inizializzazione gioco, coordinamento manager, gestione eventi
 */

class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.gameManager = null; // Will be initialized after UI is created
        
        this.currentLevel = 1;
        this.gameState = {
            isPlaying: false
        };
        
        this.init();
    }

    init() {
        // Check for level URL parameter in development mode
        if (CONSTANTS.APP_CONFIG.DEVEL) {
            const urlLevel = Utils.getUrlParameterAsNumber('level');
            if (urlLevel !== null && urlLevel >= 1 && urlLevel <= CONSTANTS.GAME_CONFIG.MAX_LEVEL) {
                this.currentLevel = urlLevel;
                console.log(`🔧 Development mode: Loading level ${this.currentLevel} from URL parameter`);
            } else if (CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL !== null) {
                this.currentLevel = CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL;
                console.log(`🔧 Development mode: Forcing start at level ${this.currentLevel}`);
            } else {
                // Load saved progress
                const progress = this.storageManager.loadGameProgress();
                if (progress) {
                    this.currentLevel = progress.level;
                }
            }
        } else {
            // Production mode - check if we should force a specific level for development
            if (CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL !== null) {
                this.currentLevel = CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL;
                console.log(`🔧 Development mode: Forcing start at level ${this.currentLevel}`);
            } else {
                // Load saved progress
                const progress = this.storageManager.loadGameProgress();
                if (progress) {
                    this.currentLevel = progress.level;
                }
            }
        }
        
        // Initialize game UI first
        this.initializeGameUI();
        
        // Initialize game manager after UI is created
        this.gameManager = new GameManager(this.storageManager, this.currentLevel, this);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    initializeGameUI() {
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            DisplayManager.renderGameState(gameContainer, this.gameState);
        }
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.gameManager && this.gameManager.resizeCanvas) {
                this.gameManager.resizeCanvas();
            }
        });



        // Handle beforeunload (save progress before leaving)
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }

    async loadLevel(levelNumber) {
        try {
            this.currentLevel = levelNumber;
            this.gameState.isPlaying = true;
            
            if (this.gameManager) {
                await this.gameManager.loadLevel(levelNumber);
            }
        } catch (error) {
            console.error('Error loading level in App:', error);
            this.gameState.isPlaying = false;
            // Error handling is already done in GameManager
        }
    }



    resetLevel() {
        if (this.gameManager) {
            this.gameManager.resetLevel();
        }
    }

    nextLevel() {
        this.currentLevel++;
        
        if (this.currentLevel > CONSTANTS.GAME_CONFIG.MAX_LEVEL) {
            this.gameCompleted();
        } else {
            this.loadLevel(this.currentLevel).catch(error => {
                console.error('Failed to load next level in App:', error);
            });
        }
    }

    gameCompleted() {
        this.gameState.isPlaying = false;
        this.saveProgress();
        DisplayManager.renderGameOverModal();
        Utils.showModal('gameOverModal');
    }

    showMenu() {
        // Menu functionality removed - no UI button to access menu
    }

    hideMenu() {
        // Menu functionality removed - no UI button to access menu
    }

    showSettings() {
        DisplayManager.renderSettingsModal();
        Utils.showModal('settingsModal');
    }

    saveSettings() {
        const soundEnabled = document.getElementById('soundToggle').checked;
        const vibrationEnabled = document.getElementById('vibrationToggle').checked;
        const difficulty = document.getElementById('difficultySelect').value;
        
        const settings = {
            soundEnabled,
            vibrationEnabled,
            difficulty
        };
        
        this.storageManager.saveGameSettings(settings);
        Utils.hideModal('settingsModal');
        this.hideMenu();
    }

    resetProgress() {
        if (confirm(CONSTANTS.MESSAGES.RESET_CONFIRM)) {
            this.storageManager.clearAll();
            this.currentLevel = 1;
            if (this.gameManager) {
                this.gameManager.currentLevel = 1;
            }
            this.loadLevel(this.currentLevel).catch(error => {
                console.error('Failed to load level after reset:', error);
            });
            this.hideMenu();
        }
    }

    exitGame() {
        if (confirm(CONSTANTS.MESSAGES.EXIT_CONFIRM)) {
            this.saveProgress();
            // In a real app, this might redirect to a menu or close the app
            window.close();
        }
    }

    restartGame() {
        this.currentLevel = 1;
        if (this.gameManager) {
            this.gameManager.currentLevel = 1;
        }
        this.loadLevel(this.currentLevel).catch(error => {
            console.error('Failed to restart game:', error);
        });
        Utils.hideModal('gameOverModal');
    }

    saveProgress() {
        this.storageManager.saveGameProgress(this.currentLevel);
    }

    // Handle touch events (delegated to GameManager)
    handleTouch(x, y) {
        if (this.gameManager && this.gameState.isPlaying) {
            this.gameManager.handleTouch(x, y);
        }
    }

    // Get current game state
    getGameState() {
        return {
            ...this.gameState,
            currentLevel: this.currentLevel
        };
    }
} 