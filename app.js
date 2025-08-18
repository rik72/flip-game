/**
 * Flipgame - Main Application Controller
 * Responsabile per: inizializzazione gioco, coordinamento manager, gestione eventi
 */

class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.soundManager = new SoundManager();
        this.gameManager = null; // Will be initialized after UI is created
        
        this.currentLevel = 1;
        this.gameState = {
            isPlaying: false
        };
        
        this.init();
    }

    init() {
        // Make app instance globally available for sound effects
        window.appInstance = this;
        
        // Check for level URL parameter in development mode
        if (CONSTANTS.APP_CONFIG.DEVEL) {
            const urlLevel = Utils.getUrlParameterAsString('level');
            
            if (urlLevel === 'test') {
                // Test level mode - check localStorage for test data
                try {
                    const testData = localStorage.getItem('testLevel');
                    if (testData) {
                        const levelData = JSON.parse(testData);
                        
                        // Validate the test level data structure
                        if (!levelData || !levelData.board || !levelData.board.front) {
                            throw new Error('Test level data is missing required board structure');
                        }
                        
                        if (!Array.isArray(levelData.board.front)) {
                            throw new Error('Test level front board should be an array');
                        }
                        
                        if (levelData.board.rear && !Array.isArray(levelData.board.rear)) {
                            throw new Error('Test level rear board should be an array');
                        }
                        
                        this.currentLevel = 'test';
                        this.testLevelData = levelData;
                        console.log(`🔧 Test mode: Loading test level from localStorage`);
                    } else {
                        console.error('No test level data found in localStorage');
                        this.loadDefaultLevel();
                    }
                } catch (error) {
                    console.error('Error parsing test level data:', error);
                    this.loadDefaultLevel();
                }
            } else if (urlLevel !== null && !isNaN(urlLevel) && urlLevel >= 1 && urlLevel <= CONSTANTS.GAME_CONFIG.MAX_LEVEL) {
                this.currentLevel = parseInt(urlLevel);
                console.log(`🔧 Development mode: Loading level ${this.currentLevel} from URL parameter`);
            } else if (CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL !== null) {
                this.currentLevel = CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL;
                console.log(`🔧 Development mode: Forcing start at level ${this.currentLevel}`);
            } else {
                this.loadDefaultLevel();
            }
        } else {
            // Production mode - check if we should force a specific level for development
            if (CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL !== null) {
                this.currentLevel = CONSTANTS.GAME_CONFIG.FORCE_START_LEVEL;
                console.log(`🔧 Development mode: Forcing start at level ${this.currentLevel}`);
            } else {
                this.loadDefaultLevel();
            }
        }
        
        // Initialize game UI first
        this.initializeGameUI();
        
        // Initialize game manager after UI is created
        this.gameManager = new GameManager(this.storageManager, this.currentLevel, this);
        
        // Pass sound manager reference to game manager
        this.gameManager.soundManager = this.soundManager;
        
        // Store test level data if available
        if (this.testLevelData) {
            this.gameManager.testLevelData = this.testLevelData;
        }
        
        // Load the level after setting up test data
        this.gameManager.loadLevel(this.currentLevel).catch(error => {
            console.error('Failed to load initial level:', error);
        });
        
        // Don't auto-start background music due to browser autoplay policies
        // Music will start when user first interacts with the game
        
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

    loadDefaultLevel() {
        // Load saved progress
        const progress = this.storageManager.loadGameProgress();
        if (progress) {
            this.currentLevel = progress.level;
        }
    }

    async loadLevel(levelNumber) {
        try {
            this.currentLevel = levelNumber;
            this.gameState.isPlaying = true;
            
            // Play level start sound
            this.soundManager.playSound('levelStart');
            
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
        
        // Play game completion sound
        this.soundManager.playSound('gameComplete');
        
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
        
        // Load current audio settings
        const audioSettings = this.soundManager.getSettings();
        
        // Set form values
        document.getElementById('soundToggle').checked = audioSettings.soundEnabled;
        document.getElementById('musicToggle').checked = audioSettings.musicEnabled;
        document.getElementById('soundVolumeSlider').value = audioSettings.volume;
        document.getElementById('musicVolumeSlider').value = audioSettings.musicVolume;
        
        // Update volume display values
        document.getElementById('soundVolumeValue').textContent = Math.round(audioSettings.volume * 100) + '%';
        document.getElementById('musicVolumeValue').textContent = Math.round(audioSettings.musicVolume * 100) + '%';
        
        // Add event listeners for volume sliders
        this.setupVolumeSliderListeners();
        
        Utils.showModal('settingsModal');
    }

    saveSettings() {
        const soundEnabled = document.getElementById('soundToggle').checked;
        const musicEnabled = document.getElementById('musicToggle').checked;
        const soundVolume = parseFloat(document.getElementById('soundVolumeSlider').value);
        const musicVolume = parseFloat(document.getElementById('musicVolumeSlider').value);
        const vibrationEnabled = document.getElementById('vibrationToggle').checked;
        const difficulty = document.getElementById('difficultySelect').value;
        
        // Update sound manager settings
        this.soundManager.setSoundEnabled(soundEnabled);
        this.soundManager.setMusicEnabled(musicEnabled);
        this.soundManager.setVolume(soundVolume);
        this.soundManager.setMusicVolume(musicVolume);
        
        const settings = {
            soundEnabled,
            musicEnabled,
            soundVolume,
            musicVolume,
            vibrationEnabled,
            difficulty
        };
        
        this.storageManager.saveGameSettings(settings);
        
        // Play success sound
        this.soundManager.playSound('success');
        
        Utils.hideModal('settingsModal');
        this.hideMenu();
    }

    resetProgress() {
        if (confirm(CONSTANTS.MESSAGES.RESET_CONFIRM)) {
            // Play warning sound
            this.soundManager.playSound('warning');
            
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
            // Play warning sound
            this.soundManager.playSound('warning');
            
            this.saveProgress();
            // In a real app, this might redirect to a menu or close the app
            window.close();
        }
    }

    restartGame() {
        // Play button click sound
        this.soundManager.playSound('buttonClick');
        
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

    setupVolumeSliderListeners() {
        const soundVolumeSlider = document.getElementById('soundVolumeSlider');
        const musicVolumeSlider = document.getElementById('musicVolumeSlider');
        const soundVolumeValue = document.getElementById('soundVolumeValue');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        
        if (soundVolumeSlider && soundVolumeValue) {
            soundVolumeSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                soundVolumeValue.textContent = Math.round(value * 100) + '%';
                
                // Update sound manager in real-time
                this.soundManager.setVolume(value);
            });
        }
        
        if (musicVolumeSlider && musicVolumeValue) {
            musicVolumeSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                musicVolumeValue.textContent = Math.round(value * 100) + '%';
                
                // Update sound manager in real-time
                this.soundManager.setMusicVolume(value);
            });
        }
    }
} 