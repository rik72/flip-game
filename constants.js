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
		
		// Error messages
		LEVEL_LOAD_ERROR: 'Failed to load level {levelNumber}. Please check that the level file exists.',

	},

	// Game configurations
	GAME_CONFIG: {
		// General configurations
		MAX_LEVEL: 50,
		// Development: Force loading specific level as first (set to null to disable)
		FORCE_START_LEVEL: 1, // Set to level number (e.g., 4) to force start at that level
		
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

	// Rendering size configurations
	RENDER_SIZE_CONFIG: {
		// Ball sizing
		BALL_RADIUS_RATIO: 0.375, // Ball radius as ratio of gridSize (37.5% of grid cell)
		BALL_REST_SCALE: 0.75, // Resting visual scale for balls during animations
		
		// Grid dot sizing (for empty intersections)
		GRID_DOT_MIN_SIZE: 2, // Minimum grid dot radius in pixels
		GRID_DOT_RATIO: 0.06, // Grid dot radius as ratio of gridSize
		
		// Path node sizing (for path intersections)
		PATH_NODE_MIN_SIZE: 3, // Minimum path node radius in pixels
		PATH_NODE_RATIO: 0.08, // Path node radius as ratio of gridSize
		
		// Path line sizing
		PATH_LINE_MIN_WIDTH: 3, // Minimum path line width in pixels
		PATH_LINE_RATIO: 0.08, // Path line width as ratio of gridSize
		
		// Goal ring sizing
		GOAL_INNER_MIN_OFFSET: 1, // Minimum inner goal ring offset from ball radius
		GOAL_INNER_RATIO: 0.01, // Goal inner ring offset as ratio of gridSize
		GOAL_OUTER_MIN_OFFSET: 4, // Minimum outer goal ring offset from ball radius
		GOAL_OUTER_RATIO: 0.07 // Goal outer ring offset as ratio of gridSize
	},

	// Touch configurations
	TOUCH_CONFIG: {
		// Touch size and distance are now scaled with grid size
		// These will be calculated as: gridSize * ratio
		MIN_TOUCH_SIZE_RATIO: 1, // Minimum touch size as ratio of gridSize (120% of grid cell)
		MAX_TOUCH_DISTANCE_RATIO: 1.1, // Maximum touch distance as ratio of gridSize (140% of grid cell)
		TOUCH_TIMEOUT: 300,
		GESTURE_RECOGNITION: {
			SWIPE_THRESHOLD: 50,
			PINCH_THRESHOLD: 0.5
		}
	},

	// Animation configurations
	ANIMATION_CONFIG: {
		// Board flip animation
		FLIP_DURATION: 600, // Animation duration in milliseconds
		FLIP_EASING: 'ease-in-out', // CSS easing function
		FLIP_PERSPECTIVE: 1000, // 3D perspective distance in pixels
		FLIP_AXIS: 'Y', // Rotation axis (X, Y, or Z)
		
		// Animation states
		FLIP_ANGLE: 180, // Rotation angle in degrees
		FLIP_HALFWAY_THRESHOLD: 0.5, // When to switch face content (0.0-1.0) - at halfway point
		
		// Ball movement animation
		BALL_EASE_DURATION: 300, // milliseconds for final snap
		BALL_DRAG_DURATION: 50, // milliseconds for smooth dragging
		BALL_EASE_TYPE: 'ease-out', // ease-in, ease-out, ease-in-out
		
		// Level completion explosion animation
		EXPLOSION_DURATION: 1000, // milliseconds for explosion animation
		EXPLOSION_DELAY: 100, // milliseconds between explosions
		EXPLOSION_COLOR: '#FFFFFF', // white explosion color
		
		// Level completion delay
		LEVEL_COMPLETION_DELAY: 2000, // milliseconds before allowing next level
		
		// Easing functions
		EASING: {
			LINEAR: (t) => t,
			EASE_OUT: (t) => 1 - Math.pow(1 - t, 3), // cubic ease-out
			EASE_IN: (t) => t * t * t, // cubic ease-in
			EASE_IN_OUT: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // cubic ease-in-out
			EASE_OUT_QUICK: (t) => 1 - Math.pow(1 - t, 2) // quadratic ease-out for dragging
		}
	},

	// Level configurations
	LEVEL_CONFIG: {
		
		// Node types (string-based)
		NODE_TYPES: {
			EMPTY: '.',
			PATH_ALL_BALLS: '0',
			PATH_BALL_1: '1',
			PATH_BALL_2: '2',
            WELL: 'W',
			WALL: 'X',
			TELEPORT: 'T',
			SWITCH: 'S',
			COLLECTIBLE: 'C'
		},
		
		// Node colors (only for square nodes, circles use their own colors)
		NODE_COLORS: {
			'.': '#000000',  // Empty
			'0': '#444444',  // Path for all balls (darker gray to show it's a path)
			'1': '#331111',  // Path for ball 1 (dark red tint)
			'2': '#111133',  // Path for ball 2 (dark blue tint)
			// TO DO
			'W': '#FFFFFF',  // Well
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