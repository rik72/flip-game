// ===== CONSTANTS - ENGLISH =====
// Centralized configurations for Flipgame application

const CONSTANTS = {
	// System messages
	MESSAGES: {
		// Confirmation messages
		RESET_CONFIRM: 'Are you sure you want to reset progress?',
		EXIT_CONFIRM: 'Are you sure you want to exit? Progress will be saved.',

		// Validation messages
		EMPTY_NAME: 'The {type} name cannot be empty',
		DUPLICATE_NAME: 'A {type} with this name already exists',
		LEVEL_DATA_REQUIRED: 'Level data required',
		INVALID_LEVEL: 'Invalid level',
		INVALID_MOVE: 'Invalid move'
	},

	// Game configurations
	GAME_CONFIG: {
		// General configurations
		DEFAULT_LEVEL: 1,
		MAX_LEVEL: 50,
		
			// Ball configurations
	BALL_RADIUS: 15,
	BALL_SPEED: 0.1,
	BALL_COLOR: '#FFFFFF',
		
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
				nodes: [
					"........",
					"........",
					"........",
					"........",
					"........",
					"........",
					"........",
					"........"
				]
			},
			balls: [
				{
					start: [2, 2],
					end: [6, 6],
					color: 'white'
				}
			]
		},
		
		// Node types (string-based)
		NODE_TYPES: {
			EMPTY: '.',
			PATH: '#',
			WALL: 'X',
			TELEPORT: 'T',
			SWITCH: 'S',
			COLLECTIBLE: 'C'
		},
		
		// Node colors (only for square nodes, circles use their own colors)
		NODE_COLORS: {
			'.': '#000000',  // Empty
			'#': '#666666',  // Path
			'X': '#FF0000',  // Wall
			'T': '#0000FF',  // Teleport
			'S': '#FFFF00',  // Switch
			'C': '#FF00FF'   // Collectible
		},
		
		// Ball colors mapping
		BALL_COLORS: {
			'white': '#FFFFFF',
			'red': '#FF0000',
			'green': '#00FF00',
			'blue': '#0000FF',
			'yellow': '#FFFF00',
			'purple': '#FF00FF',
			'orange': '#FFA500',
			'pink': '#FFC0CB'
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