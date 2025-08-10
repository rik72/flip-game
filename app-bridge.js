// ===== GLOBAL BRIDGE FUNCTIONS =====
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for all scripts to be loaded
    setTimeout(() => {
        // Initialize LanguageManager first to set the correct language
        if (window.languageManager) {
            window.languageManager.init();
        } else {
            console.error('❌ LanguageManager not found!');
        }
    }, 200);
});

// Listen for language ready event
window.addEventListener('languageReady', (event) => {
    // Initialize TextManager with the correct language
    if (window.textManager) {
        window.textManager.initialize();
    } else {
        console.error('❌ TextManager not found!');
    }
    
    // Then initialize the main app
    app = new App();
});

// Global functions for HTML onclick handlers
function showSection(section, element = null) {
    app.showSection(section, element);
}

function showAddPlayerModal() {
    app.showAddPlayerModal();
}

function addPlayer() {
    app.addPlayer();
}

function savePlayer() {
    app.savePlayer();
}

function showAddGameModal() {
    app.showAddGameModal();
}

function addGame() {
    app.addGame();
}

function saveGame() {
    app.saveGame();
}

function showAddMatchModal() {
    app.showAddMatchModal();
}

function addParticipant() {
    app.addParticipant();
}

function addMatch() {
    app.addMatch();
}

function saveMatch() {
    app.saveMatch();
}

function updateRankingSortOrder(sortBy) {
    app.updateRankingSortOrder(sortBy);
}

function setLanguage(languageCode) {
    app.setLanguage(languageCode);
} 