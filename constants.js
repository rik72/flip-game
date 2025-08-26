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
        MAX_BALLS: 2, // Maximum number of balls allowed in a level
	},

	// Rendering size configurations
	RENDER_SIZE_CONFIG: {
		// Rendering toggles
		RENDER_CONNECTIONS: false, // true => current behaviour, false => connections edges are not rendered
		RENDER_EMPTY_NODES: false, // true => current behaviour, false => empty nodes are not rendered
		
		// Ball sizing
		BALL_RADIUS_RATIO: 0.375, // Ball radius as ratio of gridSize (37.5% of grid cell)
		BALL_REST_SCALE: 0.6, // Resting visual scale for balls during animations
		BALL_TAIL_REST_SCALE: 1.2, // Resting visual scale for balls with tails (1.2x larger)
		BALL_TOUCH_SCALE_RATIO: 0.8, // Touch ball scale as ratio of gridSize (80% of grid cell)
		
		// Ball gradient effect configuration
		BALL_GRADIENT_ENABLED: true, // Enable subtle white gradient on balls
		BALL_GRADIENT_OPACITY: 0.15, // Very low opacity for subtle effect (0.0-1.0)
		BALL_GRADIENT_RADIUS_RATIO: 1, // Gradient radius as ratio of ball radius (0.6 = 60% of ball size)
		BALL_GRADIENT_INNER_RADIUS_RATIO: 0, // Gradient inner radius as ratio of ball radius (0.6 = 60% of ball size)
		
		// Grid dot sizing (for empty intersections)
		GRID_DOT_MIN_SIZE: 3, // Minimum grid dot radius in pixels
		GRID_DOT_RATIO: 0.06, // Grid dot radius as ratio of gridSize
		
		// Path node sizing (for path intersections)
		PATH_NODE_MIN_SIZE: 3, // Minimum path node radius in pixels
		PATH_NODE_RATIO: 0.08, // Path node radius as ratio of gridSize
		
		// Path line sizing
		PATH_LINE_MIN_WIDTH: 1, // Minimum path line width in pixels
		PATH_LINE_RATIO: 0.02, // Path line width as ratio of gridSize
		
		// Goal ring sizing
		GOAL_INNER_RADIUS_RATIO: 0.3, // Goal inner radius as ratio of gridSize
		GOAL_OUTER_RADIUS_RATIO: 0.4, // Goal outer radius as ratio of gridSize
		
		// Tail rendering configuration
		TAIL_BALL_SIZE_RATIO: .7, // Tail ball size as ratio of normal ball size (1.0 = same size)
		TAIL_LINE_WIDTH_MULTIPLIER: 5.0, // Tail line width multiplier compared to normal lines (2.0 = 2x thicker)
		
	},



	// Animation configurations
	ANIMATION_CONFIG: {
		// Board flip animation
		FLIP_DURATION: 600, // Animation duration in milliseconds
		
		// Animation states
		FLIP_HALFWAY_THRESHOLD: 0.5, // When to switch face content (0.0-1.0) - at halfway point
		
		// Ball movement animation
		BALL_DRAG_DURATION: 20, // milliseconds for smooth ball movement
		BALL_BACKTRACK_DURATION: 1, // milliseconds for faster backtracking movement (uses instant easing)
		
		// Level completion explosion animation
		EXPLOSION_DURATION: 1000, // milliseconds for explosion animation
		EXPLOSION_DELAY: 30, // milliseconds between explosions
		
		// Goal state transition animation
		GOAL_TRANSITION_DURATION: 500, // milliseconds for goal state transition animation
		
		// Movement trail animation
		TRAIL_ENABLED: true, // flag to enable/disable trail animations
        TRAIL_MIN_RADIUS_FACTOR: .5, // start trail radius as ratio of ball radius
        TRAIL_MAX_RADIUS_FACTOR: 2, // max trail radius as ratio of ball radius
		TRAIL_RING_THICKNESS_FACTOR: 0.5, // ring thickness as ratio of ball radius
		TRAIL_DURATION: 200, // milliseconds for movement trail animation
		TRAIL_OPACITY: 0.15, // opacity for movement trail (lower than explosion)
		
		// Easing functions
		EASING: {
			LINEAR: (t) => t,
			EASE_OUT: (t) => 1 - Math.pow(1 - t, 3), // cubic ease-out
			EASE_IN: (t) => t * t * t, // cubic ease-in
			EASE_IN_OUT: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, // cubic ease-in-out
			EASE_OUT_QUICK: (t) => 1 - Math.pow(1 - t, 2), // quadratic ease-out for dragging
			INSTANT: (t) => 1 // Always return 1 for instant completion
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
			'red': '#EE1111',
			'green': '#11EE11',
			'blue': '#1111EE',
			'lightblue': '#BBBBFF',
			'gray': '#666666',
			'yellow': '#FFFF00',
			'purple': '#FF00FF',
			'orange': '#FF6600',
			'pink': '#FF8080'
		},
		
		// Visual darkening factors for different elements
		STICKER_DARKENING_FACTOR: 0.4, // Factor to darken ball colors for sticker nodes (0.5 = 50% darker)
		GOAL_DARKENING_FACTOR: 0.4, // Factor to darken ball colors for inactive goals (0.5 = 50% darker)
		TAIL_DARKENING_FACTOR: 0.4 // Factor to darken ball colors for tail effects (0.5 = 50% darker)
	},

	// Audio configurations
	AUDIO_CONFIG: {
		ENABLED: false,
		VOLUME: 0.7,
	},
}; 