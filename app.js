/**
 * Flipgame - Main Application Controller
 * Responsabile per: inizializzazione gioco, coordinamento manager, gestione eventi
 */

class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.backupManager = new BackupManager(this.storageManager);
        this.gameManager = null; // Will be initialized after UI is created
        
        this.currentLevel = 1;
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            moves: 0
        };
        
        this.init();
    }

    init() {
        // Load saved progress
        const progress = this.storageManager.loadGameProgress();
        if (progress) {
            this.currentLevel = progress.level;
            this.gameState.score = progress.score;
        }
        
        // Initialize game UI first
        this.initializeGameUI();
        
        // Initialize game manager after UI is created
        this.gameManager = new GameManager(this.storageManager);
        
        // Load first level
        this.loadLevel(this.currentLevel);
        
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

        // Handle visibility change (pause when app goes to background)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            }
        });

        // Handle beforeunload (save progress before leaving)
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }

    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        
        if (this.gameManager) {
            this.gameManager.loadLevel(levelNumber);
        }
        
        // Update UI
        DisplayManager.updateGameProgress(this.currentLevel, this.gameState.score, this.gameState.moves);
    }

    pauseGame() {
        this.gameState.isPaused = true;
        if (this.gameManager) {
            this.gameManager.pause();
        }
        DisplayManager.showGameMenu();
    }

    resumeGame() {
        this.gameState.isPaused = false;
        if (this.gameManager) {
            this.gameManager.resume();
        }
        DisplayManager.hideGameMenu();
    }

    resetLevel() {
        if (this.gameManager) {
            this.gameManager.resetLevel();
        }
        this.gameState.moves = 0;
        DisplayManager.updateGameProgress(this.currentLevel, this.gameState.score, this.gameState.moves);
    }

    nextLevel() {
        this.currentLevel++;
        this.gameState.score += CONSTANTS.GAME_CONFIG.POINTS_PER_LEVEL;
        
        if (this.currentLevel > CONSTANTS.GAME_CONFIG.MAX_LEVEL) {
            this.gameCompleted();
        } else {
            this.loadLevel(this.currentLevel);
        }
    }

    gameCompleted() {
        this.gameState.isPlaying = false;
        this.saveProgress();
        DisplayManager.renderGameOverModal();
        Utils.showModal('gameOverModal');
    }

    showMenu() {
        DisplayManager.showGameMenu();
    }

    hideMenu() {
        DisplayManager.hideGameMenu();
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
            this.gameState.score = 0;
            this.gameState.moves = 0;
            this.loadLevel(this.currentLevel);
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
        this.gameState.score = 0;
        this.gameState.moves = 0;
        this.loadLevel(this.currentLevel);
        Utils.hideModal('gameOverModal');
    }

    saveProgress() {
        this.storageManager.saveGameProgress(this.currentLevel, this.gameState.score);
    }

    // Handle touch events (delegated to GameManager)
    handleTouch(x, y) {
        if (this.gameManager && this.gameState.isPlaying && !this.gameState.isPaused) {
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 