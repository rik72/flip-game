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
		ACTUAL_MAX_LEVEL: 14, // Actual final level of the game (auto-detected, see script/levels/update-max-level.js)
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
		
		// Mobile grid boundary constraints
		MOBILE_MAX_WIDTH_RATIO: 0.9, // Mobile: limit to 90% of screen width
		MOBILE_MAX_HEIGHT_RATIO: 0.8, // Mobile: limit to 80% of screen height
		MOBILE_SAFE_MARGIN: 100, // Mobile: additional margin for UI elements (header, footer, safe areas)
		
		// Desktop grid boundary constraints (existing)
		DESKTOP_MAX_WIDTH_RATIO: 0.15, // Desktop: limit to 15% of screen width (reduced for larger boards like 8x16)
		DESKTOP_MAX_HEIGHT_RATIO: 0.7, // Desktop: limit to 70% of screen height
		
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
		
		// Trap sizing (larger than goals for better visibility)
		TRAP_OUTER_RADIUS_RATIO: 0.75, // Trap outer radius as ratio of gridSize
		
		// Switch sizing (same distance as trap X dimension)
		SWITCH_DISC_DISTANCE_RATIO: 0.6, // Distance of switch discs from center as ratio of gridSize
		SWITCH_DISC_SIZE_RATIO: 0.15, // Size of each switch disc as ratio of gridSize
		SWITCH_CIRCLE_LINE_WIDTH_RATIO: 0.05, // Line width for switch circle as ratio of gridSize
		
		// Trap sizing (same distance as switch discs)
		TRAP_DISC_DISTANCE_RATIO: 0.6, // Distance of trap discs from center as ratio of gridSize
		TRAP_DISC_SIZE_RATIO: 0.12, // Size of each trap disc as ratio of gridSize
		TRAP_X_LINE_WIDTH_RATIO: 0.05, // Line width for trap X lines as ratio of gridSize
		
		// Tail rendering configuration
		TAIL_BALL_SIZE_RATIO: .7, // Tail ball size as ratio of normal ball size (1.0 = same size)
		TAIL_LINE_WIDTH_MULTIPLIER: 5.0, // Tail line width multiplier compared to normal lines (2.0 = 2x thicker)
		
		// Glow animation configuration
		GLOW_SHADOW_MAX_OPACITY: 0.3, // Maximum opacity of the white glow shadow (0.0-1.0)
		GLOW_SHADOW_MAX_RADIUS_RATIO: 1.8, // Maximum shadow radius as ratio of ball radius (0.8 = 80% of ball size)
		GLOW_BRIGHTNESS_FACTOR: 0.6, // Brightness factor for glow color interpolation (0.0-1.0)
		GLOW_CYCLE_DURATION: 3200, // Glow animation cycle duration in milliseconds
		GLOW_STAGGER_DELAY: 800, // Delay between ball glow animations in milliseconds
		
	},



	// Animation configurations
	ANIMATION_CONFIG: {
		// Board flip animation
		FLIP_DURATION: 600, // Animation duration in milliseconds
		
		// Animation states
		FLIP_HALFWAY_THRESHOLD: 0.5, // When to switch face content (0.0-1.0) - at halfway point
		
		// Level transition fade animations
		// NOTE: Keep these durations in sync with CSS transitions in styles.css:
		// - .game-flip-wrapper.fade-out transition: opacity 0.2s ease-in-out
		// - .game-flip-wrapper.fade-in transition: opacity 0.8s ease-in-out
		LEVEL_FADE_OUT_DURATION: 200, // milliseconds for fade out animation
		LEVEL_FADE_IN_DURATION: 300, // milliseconds for fade in animation
		
		// Next level button appearance delay
		NEXT_LEVEL_BUTTON_DELAY: 1000, // milliseconds delay before showing next level button
		
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
		
		// Trap animation configuration
		TRAP_ANIMATION_DURATION: 150, // milliseconds for trap X-to-+ rotation animation (increased for better visibility)
		TRAP_DARKENING_FACTOR: 0.4, // Factor to darken trap colors (same as other elements)
		TRAP_DARKER_SHADE_FACTOR: 0.3, // Factor for very dark cross under squares (darker than default darkenColor)
		
		// Switch animation configuration
		SWITCH_ANIMATION_DURATION: 400, // milliseconds for switch open-to-closed animation
		SWITCH_DARKENING_FACTOR: 0.4, // Factor to darken switch colors when open
		
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
			COLLECTIBLE: 'c0',
			STICKER: '$0',
			// Trap node types (color variants)
			TRAP_RED: 'xr',
			TRAP_GREEN: 'xg',
			TRAP_BLUE: 'xb',
			TRAP_LIGHTBLUE: 'xl',
			TRAP_YELLOW: 'xy',
			TRAP_PURPLE: 'xp',
			TRAP_ORANGE: 'xo',
			// Switch node types (color variants)
			SWITCH_RED: 'sr',
			SWITCH_GREEN: 'sg',
			SWITCH_BLUE: 'sb',
			SWITCH_LIGHTBLUE: 'sl',
			SWITCH_YELLOW: 'sy',
			SWITCH_PURPLE: 'sp',
			SWITCH_ORANGE: 'so',
			// Shared goal node type
			SHARED_GOAL: 'g0'
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
			'c0': '#FF00FF',  // Collectible
			'$0': '#FFFFFF',   // Sticker (orange)
			// Trap node colors (will be darkened versions of ball colors)
			'xr': '#EE1111',  // Red trap
			'xg': '#11EE11',  // Green trap
			'xb': '#1111EE',  // Blue trap
			'xl': '#BBBBFF',  // Lightblue trap
			'xy': '#FFFF00',  // Yellow trap
			'xp': '#FF00FF',  // Purple trap
			'xo': '#FF6600',  // Orange trap
			// Switch node colors (same as trap colors)
			'sr': '#EE1111',  // Red switch
			'sg': '#11EE11',  // Green switch
			'sb': '#1111EE',  // Blue switch
			'sl': '#BBBBFF',  // Lightblue switch
			'sy': '#FFFF00',  // Yellow switch
			'sp': '#FF00FF',  // Purple switch
			'so': '#FF6600',   // Orange switch
			'g0': '#FFFFFF'   // Shared goal (white)
		},
		
		// Ball colors mapping
		BALL_COLORS: {
			'red': '#EE1111',
			'green': '#11EE11',
			'blue': '#2222FF',
			'lightblue': '#BBBBFF',
			'gray': '#666666',
			'yellow': '#FFFF00',
			'purple': '#FF00FF',
			'orange': '#FF6600',
			'pink': '#FF8080'
		},
		
		// Visual color adjustment factors for different elements
		STICKER_DARKENING_FACTOR: 0.4, // Factor to darken ball colors for sticker nodes (0.5 = 50% darker)
		GOAL_DARKENING_FACTOR: 0.4, // Factor to darken ball colors for inactive goals (0.5 = 50% darker)
		TAIL_BRIGHTENING_FACTOR: 0.4, // Factor to brighten ball colors for tail effects (0.3 = 30% brighter)
		EXPLOSION_BRIGHTENING_FACTOR: 0.7 // Factor to brighten ball colors for goal explosion effects (0.7 = 70% brighter)
	},

	// Touch configurations
	TOUCH_CONFIG: {
		// Touch interaction settings
		TOUCH_SIZE_RATIO: 0.8, // Touch target size as ratio of grid cell
		TOUCH_FEEDBACK_DURATION: 150, // Touch feedback animation duration in milliseconds
	},

	// Audio configurations
	AUDIO_CONFIG: {
		ENABLED: false,
		VOLUME: 0.7,
	},

	// Background gradient configurations
	BACKGROUND_CONFIG: {
		GRADIENT_ENABLED: true,
		// Colors will be generated dynamically based on level data checksum
	},

	// Infinite grid configurations
	INFINITE_GRID_CONFIG: {
		ENABLED: true,
		LINE_WIDTH: 1, // 1px line width
		COLOR: '#aaaaaa', // Very dark color, darker than grid dots
		OPACITY: 0.05, // Opacity of the infinite grid lines (0.0 = transparent, 1.0 = fully opaque)
		EXTEND_TO_CANVAS_EDGES: true // Extend beyond board boundaries to canvas edges
	},
}; 