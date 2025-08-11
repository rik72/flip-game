/**
 * App Bridge - Bridge functions for Flipgame
 * Provides global access to app functions and utilities
 */

// Global app instance
let appInstance = null;

// Bridge functions for global access
window.FlipgameApp = {
    // Initialize app
    init: function() {
        if (!appInstance) {
            appInstance = new App();
        }
        return appInstance;
    },

    // Get app instance
    getApp: function() {
        return appInstance;
    },

    // Game control functions




    resetLevel: function() {
        if (appInstance) {
            appInstance.resetLevel();
        }
    },

    nextLevel: function() {
        if (appInstance) {
            appInstance.nextLevel();
        }
    },

    showMenu: function() {
        if (appInstance) {
            appInstance.showMenu();
        }
    },

    hideMenu: function() {
        if (appInstance) {
            appInstance.hideMenu();
        }
    },

    showSettings: function() {
        if (appInstance) {
            appInstance.showSettings();
        }
    },

    saveSettings: function() {
        if (appInstance) {
            appInstance.saveSettings();
        }
    },

    resetProgress: function() {
        if (appInstance) {
            appInstance.resetProgress();
        }
    },

    exitGame: function() {
        if (appInstance) {
            appInstance.exitGame();
        }
    },

    restartGame: function() {
        if (appInstance) {
            appInstance.restartGame();
        }
    },

    // Utility functions
    getGameState: function() {
        if (appInstance) {
            return appInstance.getGameState();
        }
        return null;
    },

    // Touch handling
    handleTouch: function(x, y) {
        if (appInstance) {
            appInstance.handleTouch(x, y);
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    appInstance = FlipgameApp.init();
}); 