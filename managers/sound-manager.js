/**
 * SoundManager - Gestione audio per Flipgame
 * Responsabile per: effetti sonori, musica, controlli audio
 * 
 * @class SoundManager
 * @description Manages all audio functionality including sound effects, background music,
 * and audio settings for the Flipgame puzzle game.
 */
class SoundManager {
    /**
     * Creates a new SoundManager instance
     */
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.isSoundEnabled = CONSTANTS.AUDIO_CONFIG.ENABLED;
        this.isMusicEnabled = CONSTANTS.AUDIO_CONFIG.ENABLED;
        this.volume = CONSTANTS.AUDIO_CONFIG.VOLUME || 0.7;
        this.musicVolume = 0.5;
        this.musicStarted = false; // Track if music has been started by user interaction
        
        this.init();
    }

    /**
     * Initialize the sound manager
     */
    init() {
        // Only load sounds if audio is enabled
        if (CONSTANTS.AUDIO_CONFIG.ENABLED) {
            this.loadSounds();
        }
        this.loadSettings();
    }

    /**
     * Load all sound effects
     */
    loadSounds() {
        // Early return if audio is disabled
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED) {
            return;
        }
        
        // Ball movement sounds
        this.sounds.ballPickup = this.createAudio('ball-pickup.mp3', 0.6);
        this.sounds.ballDrop = this.createAudio('ball-drop.mp3', 0.5);
        this.sounds.ballMove = this.createAudio('ball-move.mp3', 0.4);
        this.sounds.ballSnap = this.createAudio('ball-snap.mp3', 0.7);
        
        // Board interaction sounds
        this.sounds.boardFlip = this.createAudio('board-flip.mp3', 0.8);
        this.sounds.boardRotate = this.createAudio('board-rotate.mp3', 0.6);
        
        // Game state sounds
        this.sounds.levelComplete = this.createAudio('level-complete.mp3', 0.9);
        this.sounds.gameComplete = this.createAudio('game-complete.mp3', 1.0);
        this.sounds.levelStart = this.createAudio('level-start.mp3', 0.7);
        
        // UI interaction sounds
        this.sounds.buttonClick = this.createAudio('button-click.mp3', 0.5);
        this.sounds.buttonHover = this.createAudio('button-hover.mp3', 0.3);
        this.sounds.modalOpen = this.createAudio('modal-open.mp3', 0.6);
        this.sounds.modalClose = this.createAudio('modal-close.mp3', 0.6);
        
        // Error and feedback sounds
        this.sounds.error = this.createAudio('error.mp3', 0.6);
        this.sounds.success = this.createAudio('success.mp3', 0.7);
        this.sounds.warning = this.createAudio('warning.mp3', 0.5);
        
        // Background music
        this.backgroundMusic = this.createAudio('background-music.mp3', this.musicVolume);
        this.backgroundMusic.loop = true;
    }

    /**
     * Create an audio element with fallback handling
     * @param {string} filename - The audio file name
     * @param {number} volume - The volume level (0-1)
     * @returns {HTMLAudioElement} The audio element
     */
    createAudio(filename, volume = 0.7) {
        const audio = new Audio();
        
        // Try to load the audio file
        try {
            audio.src = `assets/sounds/${filename}`;
            audio.volume = volume;
            audio.preload = 'auto';
            
            // Add error handling for missing audio files
            audio.addEventListener('error', (e) => {
                // Only log warning once per file to avoid spam
                if (!audio.errorLogged) {
                    console.warn(`Audio file not found: ${filename} - using generated sound fallback`);
                    audio.errorLogged = true;
                }
            });
            
        } catch (error) {
            console.warn(`Failed to create audio for ${filename}:`, error);
        }
        
        return audio;
    }

    /**
     * Play a sound effect
     * @param {string} soundName - The name of the sound to play
     * @param {number} volume - Optional volume override
     */
    playSound(soundName, volume = null) {
        // Check if audio is globally disabled
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED) return;
        
        if (!this.isSoundEnabled) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }
        
        try {
            // Clone the audio to allow overlapping sounds
            const audioClone = sound.cloneNode();
            if (volume !== null) {
                audioClone.volume = volume;
            }
            
            audioClone.play().catch(error => {
                console.warn(`Failed to play sound ${soundName}:`, error);
                // Fallback to generated sound if audio file fails
                this.playGeneratedSound(soundName);
            });
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
            // Fallback to generated sound if audio file fails
            this.playGeneratedSound(soundName);
        }
    }

    /**
     * Play a generated sound as fallback
     * @param {string} soundName - The name of the sound to play
     */
    playGeneratedSound(soundName) {
        // Check if audio is globally disabled
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED) return;
        
        // Simple fallback using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Set frequency and duration based on sound type
            let frequency = 440;
            let duration = 0.1;
            let volume = 0.3;

            switch (soundName) {
                case 'ballPickup':
                    frequency = 800;
                    duration = 0.1;
                    volume = 0.4;
                    break;
                case 'ballDrop':
                    frequency = 600;
                    duration = 0.15;
                    volume = 0.3;
                    break;
                case 'ballMove':
                    frequency = 400;
                    duration = 0.05;
                    volume = 0.2;
                    break;
                case 'ballSnap':
                    frequency = 1000;
                    duration = 0.08;
                    volume = 0.5;
                    break;
                case 'boardFlip':
                    frequency = 300;
                    duration = 0.3;
                    volume = 0.6;
                    break;
                case 'levelComplete':
                    frequency = 784;
                    duration = 0.4;
                    volume = 0.6;
                    break;
                case 'gameComplete':
                    frequency = 1047;
                    duration = 0.5;
                    volume = 0.7;
                    break;
                case 'buttonClick':
                    frequency = 1000;
                    duration = 0.05;
                    volume = 0.4;
                    break;
                case 'success':
                    frequency = 659;
                    duration = 0.3;
                    volume = 0.5;
                    break;
                case 'error':
                    frequency = 200;
                    duration = 0.2;
                    volume = 0.5;
                    break;
                case 'warning':
                    frequency = 400;
                    duration = 0.2;
                    volume = 0.5;
                    break;
            }

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);

        } catch (error) {
            console.warn(`Failed to play generated sound ${soundName}:`, error);
        }
    }

    /**
     * Play background music
     */
    playBackgroundMusic() {
        // Check if audio is globally disabled
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED) return;
        
        if (!this.isMusicEnabled || !this.backgroundMusic) return;
        
        try {
            this.backgroundMusic.play().catch(error => {
                console.warn('Failed to play background music:', error);
                // Don't show error for autoplay policy - this is expected
                if (error.name !== 'NotAllowedError') {
                    console.warn('Background music error:', error);
                }
            });
        } catch (error) {
            console.warn('Error playing background music:', error);
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    /**
     * Pause background music
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    /**
     * Resume background music
     */
    resumeBackgroundMusic() {
        if (this.isMusicEnabled && this.backgroundMusic) {
            this.backgroundMusic.play().catch(error => {
                console.warn('Failed to resume background music:', error);
            });
        }
    }

    /**
     * Set sound effects enabled/disabled
     * @param {boolean} enabled - Whether sound effects should be enabled
     */
    setSoundEnabled(enabled) {
        this.isSoundEnabled = enabled;
        this.saveSettings();
    }

    /**
     * Set background music enabled/disabled
     * @param {boolean} enabled - Whether background music should be enabled
     */
    setMusicEnabled(enabled) {
        this.isMusicEnabled = enabled;
        
        if (enabled) {
            this.resumeBackgroundMusic();
        } else {
            this.pauseBackgroundMusic();
        }
        
        this.saveSettings();
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Only update audio elements if audio is enabled and sounds exist
        if (CONSTANTS.AUDIO_CONFIG.ENABLED && this.sounds) {
            Object.values(this.sounds).forEach(sound => {
                if (sound !== this.backgroundMusic) {
                    sound.volume = this.volume;
                }
            });
        }
        
        this.saveSettings();
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Only update background music if audio is enabled and it exists
        if (CONSTANTS.AUDIO_CONFIG.ENABLED && this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
        
        this.saveSettings();
    }

    /**
     * Load audio settings from storage
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem('audioSettings');
            if (settings) {
                const audioSettings = JSON.parse(settings);
                this.isSoundEnabled = audioSettings.soundEnabled !== undefined ? audioSettings.soundEnabled : true;
                this.isMusicEnabled = audioSettings.musicEnabled !== undefined ? audioSettings.musicEnabled : true;
                this.volume = audioSettings.volume !== undefined ? audioSettings.volume : 0.7;
                this.musicVolume = audioSettings.musicVolume !== undefined ? audioSettings.musicVolume : 0.5;
                
                // Only apply settings to audio elements if audio is enabled
                if (CONSTANTS.AUDIO_CONFIG.ENABLED) {
                    this.setVolume(this.volume);
                    this.setMusicVolume(this.musicVolume);
                }
            }
        } catch (error) {
            console.warn('Failed to load audio settings:', error);
        }
    }

    /**
     * Save audio settings to storage
     */
    saveSettings() {
        try {
            const settings = {
                soundEnabled: this.isSoundEnabled,
                musicEnabled: this.isMusicEnabled,
                volume: this.volume,
                musicVolume: this.musicVolume
            };
            localStorage.setItem('audioSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save audio settings:', error);
        }
    }

    /**
     * Get current audio settings
     * @returns {Object} Current audio settings
     */
    getSettings() {
        return {
            soundEnabled: this.isSoundEnabled,
            musicEnabled: this.isMusicEnabled,
            volume: this.volume,
            musicVolume: this.musicVolume
        };
    }

    /**
     * Reset audio settings to defaults
     */
    resetSettings() {
        this.isSoundEnabled = true;
        this.isMusicEnabled = true;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        
        // Only apply settings to audio elements if audio is enabled
        if (CONSTANTS.AUDIO_CONFIG.ENABLED) {
            this.setVolume(this.volume);
            this.setMusicVolume(this.musicVolume);
        }
        this.saveSettings();
    }

    /**
     * Preload all audio files
     */
    preloadAll() {
        // Only preload if audio is enabled and sounds exist
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED || !this.sounds) {
            return;
        }
        
        Object.values(this.sounds).forEach(sound => {
            if (sound.load) {
                sound.load();
            }
        });
        
        if (this.backgroundMusic && this.backgroundMusic.load) {
            this.backgroundMusic.load();
        }
    }

    /**
     * Clean up audio resources
     */
    destroy() {
        // Only clean up if audio elements exist
        if (this.sounds) {
            Object.values(this.sounds).forEach(sound => {
                sound.pause();
                sound.src = '';
            });
        }
        
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.src = '';
        }
        
        // Clear references
        this.sounds = {};
        this.backgroundMusic = null;
    }
} 