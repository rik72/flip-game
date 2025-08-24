// ===== CONSTANTS - ENGLISH =====
// Centralized configurations for Flipgame application

const CONSTANTS = {
	// System messages
	MESSAGES: {
		// Confirmation messages
		RESET_CONFIRM: 'Are you sure you want to reset progress?',
		EXIT_CONFIRM: 'Are you sure you want to exit? Progress will be saved.',

		// Validation messages
		LEVEL_DATA_REQUIRED: 'Level data required',
		INVALID_LEVEL: 'Invalid level',
		
		// Error messages
		LEVEL_LOAD_ERROR: 'Failed to load level {levelNumber}. Please check that the level file exists.',
		
		// Prize scene message
		ALL_LEVELS_SOLVED: 'All levels solved',
	},

	// Application configurations
	APP_CONFIG: {
		// Development mode - e.g. enables "level" URL query parameter
		DEVEL: true
	},

	// Game configurations
	GAME_CONFIG: {
		// General configurations
		ACTUAL_MAX_LEVEL: 11, // Actual final level of the game
		// Development: Force loading specific level as first (set to null to disable)
		FORCE_START_LEVEL: 1, // Set to level number (e.g., 4) to force start at that level
		
        // Ball configurations
        BALL_RADIUS: 15,
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
		GOAL_OUTER_MIN_OFFSET: 1, // Minimum outer goal ring offset from ball radius
		GOAL_OUTER_RATIO: 0.01, // Goal outer ring offset as ratio of gridSize
		
		// Tail rendering configuration
		TAIL_BALL_SIZE_RATIO: .6, // Tail ball size as ratio of normal ball size (1.0 = same size)
		TAIL_LINE_WIDTH_MULTIPLIER: 1.2, // Tail line width multiplier compared to normal lines (2.0 = 2x thicker)
		
		// Pulsating ring configuration
		PULSATING_RING_CYCLE_TIME: 2500, // Animation cycle time in milliseconds (2 seconds)
		PULSATING_RING_MIN_OPACITY: 0.6, // Minimum opacity for pulsating ring
		PULSATING_RING_MAX_OPACITY: 0.8, // Maximum opacity for pulsating ring
		PULSATING_RING_MIN_RADIUS_MULTIPLIER: 1.3, // Minimum radius as multiplier of ball radius (1.25 = 25% larger)
		PULSATING_RING_MAX_RADIUS_MULTIPLIER: 1.2, // Maximum radius as multiplier of ball radius (1.75 = 75% larger)
		PULSATING_RING_LINE_WIDTH_MULTIPLIER: 0.1 // Line width as multiplier of ball radius (0.1 = 10% of ball radius)
	},

	// Touch configurations
	TOUCH_CONFIG: {
		// Touch size and distance are now scaled with grid size
		// These will be calculated as: gridSize * ratio
		MIN_TOUCH_SIZE_RATIO: 1, // Minimum touch size as ratio of gridSize (120% of grid cell)
	},

	// Animation configurations
	ANIMATION_CONFIG: {
		// Board flip animation
		FLIP_DURATION: 600, // Animation duration in milliseconds
		
		// Animation states
		FLIP_HALFWAY_THRESHOLD: 0.5, // When to switch face content (0.0-1.0) - at halfway point
		
		// Ball movement animation
		BALL_DRAG_DURATION: 40, // milliseconds for smooth ball movement
		
		// Level completion explosion animation
		EXPLOSION_DURATION: 1000, // milliseconds for explosion animation
		EXPLOSION_DELAY: 100, // milliseconds between explosions
		
		// Movement trail animation
		TRAIL_ENABLED: true, // flag to enable/disable trail animations
        TRAIL_MIN_RADIUS_FACTOR: .5, // start trail radius as ratio of ball radius
        TRAIL_MAX_RADIUS_FACTOR: 1.6, // max trail radius as ratio of ball radius
		TRAIL_RING_THICKNESS_FACTOR: 0.5, // ring thickness as ratio of ball radius
		TRAIL_DURATION: 400, // milliseconds for movement trail animation
		TRAIL_OPACITY: 0.15, // opacity for movement trail (lower than explosion)
		
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
		
		// Node types (2-character codes)
		NODE_TYPES: {
			EMPTY: '__',
			PATH_ALL_BALLS: 'p0',
			PATH_BALL_1: 'p1',
			PATH_BALL_2: 'p2',
			VERTICAL_ALL_BALLS: 'v0',
			VERTICAL_BALL_1: 'v1',
			VERTICAL_BALL_2: 'v2',
			HORIZONTAL_ALL_BALLS: 'h0',
			HORIZONTAL_BALL_1: 'h1',
			HORIZONTAL_BALL_2: 'h2',
            WELL: 'w0',
			WALL: 'x0',
			TELEPORT: 't0',
			SWITCH: 's0',
			COLLECTIBLE: 'c0',
			STICKER: '$0'
		},
		
		// Node colors (only for square nodes, circles use their own colors)
		NODE_COLORS: {
			'__': '#000000',  // Empty
			'p0': '#999999',  // Path for all balls
			'p1': '#801111',  // Path for ball 1
			'p2': '#111180',  // Path for ball 2
			'v0': '#999999',  // Vertical path for all balls
			'v1': '#801111',  // Vertical path for ball 1
			'v2': '#111180',  // Vertical path for ball 2
			'h0': '#999999',  // Horizontal path for all balls
			'h1': '#801111',  // Horizontal path for ball 1
			'h2': '#111180',  // Horizontal path for ball 2
			// TO DO
			'w0': '#FFFFFF',  // Well
			'x0': '#FF0000',  // Wall
			't0': '#8000FF',  // Teleport
			's0': '#FFFF00',  // Switch
			'c0': '#FF00FF',  // Collectible
			'$0': '#FFFFFF'   // Sticker (orange)
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
		ENABLED: false,
		VOLUME: 0.7,
	},
}; 