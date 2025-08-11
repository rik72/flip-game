// ===== CONSTANTS - ENGLISH =====
// Centralized configurations for Flipgame application

const CONSTANTS = {
    // System messages
    MESSAGES: {
        // Error messages
        SAVE_ERROR: 'Error during save',
        LOAD_ERROR: 'Error during load',
        VALIDATION_ERROR: 'Invalid data',
        NETWORK_ERROR: 'Connection error',
        
        // Success messages
        SAVE_SUCCESS: 'Save completed',
        LEVEL_COMPLETED: 'Level completed!',
        GAME_COMPLETED: 'Congratulations! You completed the game!',
        
        // Confirmation messages
        RESET_CONFIRM: 'Are you sure you want to reset progress?',
        EXIT_CONFIRM: 'Are you sure you want to exit? Progress will be saved.',
        
        // Informational messages
        LOADING: 'Loading...',
        PAUSED: 'Game paused',
        RESUME: 'Resume game',
        NEW_LEVEL: 'New level!',
        
        // Validation messages
        LEVEL_DATA_REQUIRED: 'Level data required',
        INVALID_LEVEL: 'Invalid level',
        INVALID_MOVE: 'Invalid move',
        
        // Help messages
        TOUCH_TO_MOVE: 'Touch and drag to move',
        REACH_GOAL: 'Reach the green goal',
        ROTATE_BOARD: 'Rotate the board for new perspectives'
    },

    // Modal configurations
    MODAL_TYPES: {
        SETTINGS: {
            name: 'settings',
            title: 'Settings',
            saveButton: 'Save',
            cancelButton: 'Cancel'
        },
        LEVEL_INFO: {
            name: 'level_info',
            title: 'Level Information',
            closeButton: 'Close'
        },
        PAUSE: {
            name: 'pause',
            title: 'Game Paused',
            resumeButton: 'Resume',
            settingsButton: 'Settings',
            exitButton: 'Exit'
        }
    },

    // Game configurations
    GAME_CONFIG: {
        // General configurations
        DEFAULT_LEVEL: 1,
        MAX_LEVEL: 50,
        POINTS_PER_LEVEL: 100,
        BONUS_POINTS: 50,
        
        // Player configurations
        PLAYER_RADIUS: 15,
        PLAYER_SPEED: 0.1,
        PLAYER_COLOR: '#FFFFFF',
        
        // Board configurations
        BOARD_TYPES: {
            SQUARE: 'square',
            TRIANGULAR: 'triangular'
        },
        ROTATION_ANGLES: {
            SQUARE: 90,
            TRIANGULAR: 60
        },
        
        // Touch configurations
        TOUCH_SENSITIVITY: 10,
        DRAG_THRESHOLD: 5,
        
        // Difficulty configurations
        DIFFICULTY_LEVELS: {
            EASY: 'easy',
            NORMAL: 'normal',
            HARD: 'hard'
        }
    },

    // Canvas configurations
    CANVAS_CONFIG: {
        DEFAULT_WIDTH: 800,
        DEFAULT_HEIGHT: 600,
        BACKGROUND_COLOR: '#000000',
        GRID_COLOR: '#333333',
        GOAL_COLOR: '#00FF00',
        PATH_COLOR: '#666666'
    },

    // Touch configurations
    TOUCH_CONFIG: {
        MIN_TOUCH_SIZE: 44,
        MAX_TOUCH_DISTANCE: 100,
        TOUCH_TIMEOUT: 300,
        GESTURE_RECOGNITION: {
            SWIPE_THRESHOLD: 50,
            PINCH_THRESHOLD: 0.5
        }
    },

    // Level configurations
    LEVEL_CONFIG: {
        // Default level structure
        DEFAULT_STRUCTURE: {
            board: {
                width: 800,
                height: 600,
                cells: []
            },
            start: {
                x: 100,
                y: 100
            },
            end: {
                x: 700,
                y: 500
            },
            obstacles: [],
            powerUps: [],
            timeLimit: null
        },
        
        // Cell types
        CELL_TYPES: {
            EMPTY: 'empty',
            PATH: 'path',
            WALL: 'wall',
            TELEPORT: 'teleport',
            SWITCH: 'switch',
            COLLECTIBLE: 'collectible'
        },
        
        // Cell colors
        CELL_COLORS: {
            empty: '#000000',
            path: '#666666',
            wall: '#FF0000',
            teleport: '#0000FF',
            switch: '#FFFF00',
            collectible: '#FF00FF'
        }
    },

    // Audio configurations
    AUDIO_CONFIG: {
        ENABLED: true,
        VOLUME: 0.7,
        SOUNDS: {
            MOVE: 'move.mp3',
            COLLECT: 'collect.mp3',
            COMPLETE: 'complete.mp3',
            ERROR: 'error.mp3'
        }
    },

    // Vibration configurations
    VIBRATION_CONFIG: {
        ENABLED: true,
        PATTERNS: {
            MOVE: [50],
            COLLECT: [100, 50, 100],
            COMPLETE: [200, 100, 200],
            ERROR: [300]
        }
    },

    // Performance configurations
    PERFORMANCE_CONFIG: {
        TARGET_FPS: 60,
        RENDER_QUALITY: 'high',
        ENABLE_PARTICLES: true,
        ENABLE_ANIMATIONS: true
    }
}; 