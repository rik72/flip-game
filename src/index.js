// Main entry point for Flipgame
// This file imports all modules in the correct order for bundling

// Import constants first
import '../constants.js';

// Import utility classes
import '../utils.js';
import '../html-builder.js';
import '../display-manager.js';

// Import managers
import '../managers/storage-manager.js';
import '../managers/sound-manager.js';
import '../managers/game-manager.js';

// Import main app
import '../app.js';
import '../app-bridge.js';

// Bootstrap JS is handled separately as it's already minified
// We'll copy it as-is to the dist folder 