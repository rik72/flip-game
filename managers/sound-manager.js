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
        this.audioContext = null;
        this.isSoundEnabled = CONSTANTS.AUDIO_CONFIG.SOUND_FX_ENABLED;
        this.isMusicEnabled = CONSTANTS.AUDIO_CONFIG.MUSIC_ENABLED;
        this.soundFxVolume = CONSTANTS.AUDIO_CONFIG.SOUND_FX_VOLUME || 0.7;
        this.musicVolume = CONSTANTS.AUDIO_CONFIG.MUSIC_VOLUME || 0.5;
        this.musicStarted = false; // Track if music has been started by user interaction
        
        this.init();
    }

    /**
     * Initialize the sound manager
     */
    init() {
        // Initialize audio context for mobile compatibility
        this.initAudioContext();
        
        // Only load sounds if audio is enabled and sound effects are enabled
        if (CONSTANTS.AUDIO_CONFIG.ENABLED && CONSTANTS.AUDIO_CONFIG.SOUND_FX_ENABLED) {
            this.loadSounds();
        }
        // Always load background music if audio is enabled and music is enabled
        if (CONSTANTS.AUDIO_CONFIG.ENABLED && CONSTANTS.AUDIO_CONFIG.MUSIC_ENABLED) {
            this.loadBackgroundMusic();
        }
        this.loadSettings();
    }

    /**
     * Initialize audio context for mobile compatibility
     */
    initAudioContext() {
        try {
            // Create audio context for mobile audio handling
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // For mobile devices, we need to resume the audio context on user interaction
            const resumeAudioContext = () => {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                // Remove event listeners after first interaction
                document.removeEventListener('touchstart', resumeAudioContext);
                document.removeEventListener('mousedown', resumeAudioContext);
                document.removeEventListener('keydown', resumeAudioContext);
            };
            
            // Add event listeners for user interaction
            document.addEventListener('touchstart', resumeAudioContext, { once: true });
            document.addEventListener('mousedown', resumeAudioContext, { once: true });
            document.addEventListener('keydown', resumeAudioContext, { once: true });
            
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
        }
    }

    /**
     * Load all sound effects
     */
    loadSounds() {
        // Early return if audio is disabled or sound effects are disabled
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED || !CONSTANTS.AUDIO_CONFIG.SOUND_FX_ENABLED) {
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
        
        // Trap sounds
        this.sounds.trapActivate = this.createAudio('error.mp3', 0.7); // Use error sound for trap activation
        this.sounds.trapClose = this.createAudio('ball-snap.mp3', 0.6); // Use ball snap sound for trap closing
        
        // Switch sounds
        this.sounds.switchActivate = this.createAudio('button-click.mp3', 0.6); // Use button click sound for switch activation
    }

    /**
     * Load background music
     */
    loadBackgroundMusic() {
        // Early return if audio is disabled or music is disabled
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED || !CONSTANTS.AUDIO_CONFIG.MUSIC_ENABLED) {
            return;
        }
        
        // Background music
        this.backgroundMusic = this.createAudio('191021-japan-electronica-155533.mp3', this.musicVolume);
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
        // Check if audio is globally disabled or sound effects are disabled
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED || !CONSTANTS.AUDIO_CONFIG.SOUND_FX_ENABLED) return;
        
        // Simple fallback using Web Audio API
        try {
            // Use existing audio context or create new one
            const audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context if suspended (mobile requirement)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
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
            // For mobile devices, ensure audio context is resumed
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
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
            // Ensure audio context is resumed for mobile
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.backgroundMusic.play().catch(error => {
                console.warn('Failed to resume background music:', error);
            });
        }
    }

    /**
     * Ensure audio context is resumed (for mobile compatibility)
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(error => {
                console.warn('Failed to resume audio context:', error);
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
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSoundFxVolume(volume) {
        this.soundFxVolume = Math.max(0, Math.min(1, volume));
        
        // Only update audio elements if audio is enabled and sounds exist
        if (CONSTANTS.AUDIO_CONFIG.ENABLED && this.sounds) {
            Object.values(this.sounds).forEach(sound => {
                if (sound !== this.backgroundMusic) {
                    sound.volume = this.soundFxVolume;
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
                this.isSoundEnabled = audioSettings.soundEnabled !== undefined ? audioSettings.soundEnabled : CONSTANTS.AUDIO_CONFIG.SOUND_FX_ENABLED;
                this.isMusicEnabled = audioSettings.musicEnabled !== undefined ? audioSettings.musicEnabled : CONSTANTS.AUDIO_CONFIG.MUSIC_ENABLED;
                this.soundFxVolume = audioSettings.soundFxVolume !== undefined ? audioSettings.soundFxVolume : CONSTANTS.AUDIO_CONFIG.SOUND_FX_VOLUME;
                this.musicVolume = audioSettings.musicVolume !== undefined ? audioSettings.musicVolume : CONSTANTS.AUDIO_CONFIG.MUSIC_VOLUME;
                
                // Only apply settings to audio elements if audio is enabled
                if (CONSTANTS.AUDIO_CONFIG.ENABLED) {
                    this.setSoundFxVolume(this.soundFxVolume);
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
                soundFxVolume: this.soundFxVolume,
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
            soundFxVolume: this.soundFxVolume,
            musicVolume: this.musicVolume
        };
    }

    /**
     * Reset audio settings to defaults
     */
    resetSettings() {
        this.isSoundEnabled = CONSTANTS.AUDIO_CONFIG.SOUND_FX_ENABLED;
        this.isMusicEnabled = CONSTANTS.AUDIO_CONFIG.MUSIC_ENABLED;
        this.soundFxVolume = CONSTANTS.AUDIO_CONFIG.SOUND_FX_VOLUME;
        this.musicVolume = CONSTANTS.AUDIO_CONFIG.MUSIC_VOLUME;
        
        // Only apply settings to audio elements if audio is enabled
        if (CONSTANTS.AUDIO_CONFIG.ENABLED) {
            this.setSoundFxVolume(this.soundFxVolume);
            this.setMusicVolume(this.musicVolume);
        }
        this.saveSettings();
    }

    /**
     * Preload all audio files
     */
    preloadAll() {
        // Only preload if audio is enabled, sound effects are enabled, and sounds exist
        if (!CONSTANTS.AUDIO_CONFIG.ENABLED || !CONSTANTS.AUDIO_CONFIG.SOUND_FX_ENABLED || !this.sounds) {
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
        
        // Clean up audio context
        if (this.audioContext) {
            this.audioContext.close().catch(error => {
                console.warn('Failed to close audio context:', error);
            });
        }
        
        // Clear references
        this.sounds = {};
        this.backgroundMusic = null;
        this.audioContext = null;
    }
} 