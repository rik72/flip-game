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
    },

    // Testing functions
    testLevelFormat: function() {
        if (appInstance && appInstance.gameManager) {
            return appInstance.gameManager.testLevelFormat();
        }
        console.error('❌ Game manager not available for testing');
        return false;
    },

    testGameReachability: function() {
        return Utils.testGameReachability();
    },

    validateCurrentLevel: function() {
        if (appInstance && appInstance.gameManager && appInstance.gameManager.levelData) {
            try {
                Utils.validateLevelData(appInstance.gameManager.levelData);
                console.log('✅ Current level validation passed');
                return true;
            } catch (error) {
                console.error('❌ Current level validation failed:', error.message);
                return false;
            }
        } else {
            console.error('❌ No level data available for validation');
            return false;
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    appInstance = FlipgameApp.init();
}); 