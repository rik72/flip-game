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
            } else if (urlLevel !== null && !isNaN(urlLevel) && urlLevel >= 1) {
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
        
        // Expose debug methods globally for console access
        window.debugLogBallsWithTails = () => {
            if (this.gameManager) {
                this.gameManager.debugLogBallsWithTails();
            } else {
                console.log('❌ Game manager not initialized yet');
            }
        };
        
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
            
            // Hide prize scene if we're loading a level that's not the actual max
            if (levelNumber <= CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
                this.hidePrizeScene();
            }
            
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
        
        if (this.currentLevel > CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
            this.showPrizeScene();
        } else {
            this.loadLevel(this.currentLevel).catch(error => {
                console.error('Failed to load next level in App:', error);
            });
        }
    }

    showPrizeScene() {
        this.gameState.isPlaying = false;
        this.saveProgress();
        
        // Play game completion sound
        this.soundManager.playSound('gameComplete');
        
        // Show prize scene instead of game over modal
        this.renderPrizeScene();
    }

    renderPrizeScene() {
        // Hide the game canvas
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }
        
        // Hide the flip wrapper
        const flipWrapper = document.getElementById('gameFlipWrapper');
        if (flipWrapper) {
            flipWrapper.style.display = 'none';
        }
        
        // Hide level number display
        const levelDisplay = document.getElementById('levelNumberDisplay');
        if (levelDisplay) {
            levelDisplay.style.display = 'none';
        }
        
        // Hide next level button (keep previous if in devel mode)
        const nextBtn = document.getElementById('nextLevelBtn');
        if (nextBtn) {
            nextBtn.style.visibility = 'hidden';
        }
        
        // Hide flip board button
        const flipBtn = document.getElementById('faceToggleButton');
        if (flipBtn) {
            flipBtn.style.visibility = 'hidden';
        }
        
        // Show previous button if in devel mode and we're past the actual max level
        if (CONSTANTS.APP_CONFIG.DEVEL && this.currentLevel > CONSTANTS.GAME_CONFIG.ACTUAL_MAX_LEVEL) {
            const prevBtn = document.getElementById('prevLevelBtn');
            if (prevBtn) {
                prevBtn.style.visibility = 'visible';
                prevBtn.disabled = false;
            }
        }
        
        // Create prize scene container
        const gameContainer = document.querySelector('.game-canvas-container');
        if (gameContainer) {
            // Remove any existing prize scene
            const existingPrize = document.getElementById('prizeScene');
            if (existingPrize) {
                existingPrize.remove();
            }
            
                    // Create new prize scene
        const prizeScene = document.createElement('div');
        prizeScene.id = 'prizeScene';
        prizeScene.className = 'prize-scene';
        prizeScene.innerHTML = `
            <div class="prize-text">${CONSTANTS.MESSAGES.ALL_LEVELS_SOLVED}</div>
        `;
        
        gameContainer.appendChild(prizeScene);
        
        // Start fireworks effects
        this.startFireworks();
        }
    }

    hidePrizeScene() {
        // Stop fireworks effects
        this.stopFireworks();
        
        // Show the game canvas
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'block';
        }
        
        // Show the flip wrapper
        const flipWrapper = document.getElementById('gameFlipWrapper');
        if (flipWrapper) {
            flipWrapper.style.display = 'block';
        }
        
        // Show level number display
        const levelDisplay = document.getElementById('levelNumberDisplay');
        if (levelDisplay) {
            levelDisplay.style.display = 'flex';
        }
        
        // Show flip board button again
        const flipBtn = document.getElementById('faceToggleButton');
        if (flipBtn) {
            flipBtn.style.visibility = 'visible';
        }
        
        // Remove prize scene
        const prizeScene = document.getElementById('prizeScene');
        if (prizeScene) {
            prizeScene.remove();
        }
        
        // Update navigation buttons
        if (this.gameManager) {
            this.gameManager.updateLevelNavigationButtons();
        }
    }

    startFireworks() {
        this.fireworkWavePhase = 0;
        this.fireworkWaveTime = Date.now();
        this.activeFireworks = [];
        
        // Create canvas for fireworks
        this.createFireworksCanvas();
        
        // Start animation loop
        this.fireworksAnimationId = requestAnimationFrame(() => this.animateFireworks());
        
        this.fireworksInterval = setInterval(() => {
            this.createFirework();
        }, 100); // Check every 100ms for wave-based timing
    }

    stopFireworks() {
        if (this.fireworksInterval) {
            clearInterval(this.fireworksInterval);
            this.fireworksInterval = null;
        }
        
        if (this.fireworksAnimationId) {
            cancelAnimationFrame(this.fireworksAnimationId);
            this.fireworksAnimationId = null;
        }
        
        // Clear active fireworks array
        this.activeFireworks = [];
        
        // Remove canvas
        const canvas = document.getElementById('fireworksCanvas');
        if (canvas) {
            canvas.remove();
        }
    }

    createFirework() {
        const prizeScene = document.getElementById('prizeScene');
        if (!prizeScene) return;

        // Calculate wave-based frequency
        const currentTime = Date.now();
        const timeSinceStart = currentTime - this.fireworkWaveTime;
        const wavePhase = (timeSinceStart / 1000) % 8; // 8-second wave cycle (longer pauses)
        
        // Create wave pattern: high frequency (0.3-0.6s) during peaks, low frequency (2.0-3.0s) during troughs
        const waveIntensity = Math.sin(wavePhase * Math.PI / 2) * 0.5 + 0.5; // 0 to 1
        const baseInterval = 3000 - (waveIntensity * 2700); // 300ms to 3000ms
        
        // Add some randomness to the wave
        const randomFactor = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
        const actualInterval = baseInterval * randomFactor;
        
        // Only create fireworks based on the wave timing
        if (timeSinceStart % Math.round(actualInterval) < 100) {
            // Create 1-2 canvas-based fireworks for more lively display
            const fireworkCount = 1 + Math.floor(Math.random() * 2); // 1-2 fireworks
            for (let i = 0; i < fireworkCount; i++) {
                this.createCanvasFirework();
            }
        }
    }

    createCirclePattern(count) {
        const pattern = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const distance = 80 + Math.random() * 20; // 80-100px (less random for cleaner circle)
            pattern.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
        return pattern;
    }

    createSpiralPattern(count) {
        const pattern = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 4 * Math.PI; // 2 full rotations
            const distance = 30 + (i / count) * 60; // Increasing distance from 30 to 90px
            pattern.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
        return pattern;
    }

    createStarPattern(count) {
        const pattern = [];
        const points = 5; // Fixed 5-point star for consistency
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const baseDistance = 70;
            const starVariation = Math.sin(angle * points) * 25; // Star shape variation
            const distance = baseDistance + starVariation;
            pattern.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
        return pattern;
    }

    createBurstPattern(count) {
        const pattern = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = 60 + Math.random() * 60; // 60-120px (more controlled random)
            pattern.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
        return pattern;
    }

    createFireworksCanvas() {
        const prizeScene = document.getElementById('prizeScene');
        if (!prizeScene) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'fireworksCanvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1002';
        
        // Set canvas size
        canvas.width = prizeScene.offsetWidth;
        canvas.height = prizeScene.offsetHeight;
        
        prizeScene.appendChild(canvas);
        this.fireworksCanvas = canvas;
        this.fireworksCtx = canvas.getContext('2d');
    }

    createCanvasFirework() {
        const canvas = document.getElementById('fireworksCanvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        
        // Random position
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        
        // Random firework type
        const types = ['circle', 'spiral', 'star', 'burst'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Rich color palette
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff9f43', '#00d2d3'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create firework particles based on type
        let particleCount, particlePattern;
        
        switch(type) {
            case 'circle':
                particleCount = 8 + Math.floor(Math.random() * 6); // 8-13 particles
                particlePattern = this.createCirclePattern(particleCount);
                break;
            case 'spiral':
                particleCount = 10 + Math.floor(Math.random() * 8); // 10-17 particles
                particlePattern = this.createSpiralPattern(particleCount);
                break;
            case 'star':
                particleCount = 6 + Math.floor(Math.random() * 5); // 6-10 particles
                particlePattern = this.createStarPattern(particleCount);
                break;
            case 'burst':
                particleCount = 12 + Math.floor(Math.random() * 8); // 12-19 particles
                particlePattern = this.createBurstPattern(particleCount);
                break;
        }
        
        // Create firework object for canvas animation
        const firework = {
            x: x,
            y: y,
            particles: [],
            startTime: performance.now(),
            duration: 2000,
            type: type
        };
        
        // Create particles
        particlePattern.forEach((pattern, i) => {
            firework.particles.push({
                startX: 0,
                startY: 0,
                endX: pattern.x,
                endY: pattern.y,
                color: color,
                size: 2 + Math.random() * 3, // 2-5px
                delay: Math.random() * 300, // 0-300ms delay
                duration: 1500 + Math.random() * 1000 // 1.5-2.5s duration
            });
        });
        
        this.activeFireworks.push(firework);
    }

    animateFireworks() {
        const canvas = document.getElementById('fireworksCanvas');
        if (!canvas || !this.fireworksCtx) return;

        const ctx = this.fireworksCtx;
        const currentTime = performance.now();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw all active fireworks
        this.activeFireworks = this.activeFireworks.filter(firework => {
            const elapsed = currentTime - firework.startTime;
            
            if (elapsed > firework.duration) {
                return false; // Remove expired fireworks
            }
            
            // Draw particles
            firework.particles.forEach(particle => {
                const particleElapsed = currentTime - firework.startTime - particle.delay;
                
                if (particleElapsed > 0 && particleElapsed < particle.duration) {
                    const progress = particleElapsed / particle.duration;
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    
                    // Calculate current position
                    const currentX = firework.x + particle.endX * easeOut;
                    const currentY = firework.y + particle.endY * easeOut;
                    
                    // Calculate scale and opacity
                    let scale, opacity;
                    if (progress < 0.1) {
                        scale = progress * 10; // 0 to 1
                        opacity = 1;
                    } else if (progress < 0.8) {
                        scale = 1;
                        opacity = 1;
                    } else {
                        scale = 1 - (progress - 0.8) / 0.2;
                        opacity = 1 - (progress - 0.8) / 0.2;
                    }
                    
                    // Draw particle
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.fillStyle = particle.color;
                    ctx.beginPath();
                    ctx.arc(currentX, currentY, particle.size * scale, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Add glow effect
                    ctx.shadowColor = particle.color;
                    ctx.shadowBlur = 8;
                    ctx.fill();
                    ctx.restore();
                }
            });
            
            return true; // Keep this firework
        });
        
        // Continue animation loop
        this.fireworksAnimationId = requestAnimationFrame(() => this.animateFireworks());
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

    restartCurrentLevel() {
        // Play button click sound
        this.soundManager.playSound('buttonClick');
        
        // Reload the current level
        this.loadLevel(this.currentLevel).catch(error => {
            console.error('Failed to restart current level:', error);
        });
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