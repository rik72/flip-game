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
        // Load saved progress
        const progress = this.storageManager.loadGameProgress();
        if (progress) {
            this.currentLevel = progress.level;
        }
        
        // Initialize game UI first
        this.initializeGameUI();
        
        // Initialize game manager after UI is created
        this.gameManager = new GameManager(this.storageManager);
        
        // Load first level
        this.loadLevel(this.currentLevel).catch(error => {
            console.error('Failed to load initial level in App:', error);
        });
        
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
        this.currentLevel = levelNumber;
        this.gameState.isPlaying = true;
        
        if (this.gameManager) {
            await this.gameManager.loadLevel(levelNumber);
        }
        
        // Update UI
        DisplayManager.updateGameProgress(this.currentLevel);
    }



    resetLevel() {
        if (this.gameManager) {
            this.gameManager.resetLevel();
        }
        DisplayManager.updateGameProgress(this.currentLevel);
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 