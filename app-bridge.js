// ===== GLOBAL BRIDGE FUNCTIONS =====
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM loaded, initializing application...');
    
    // Wait for all scripts to be loaded
    setTimeout(() => {
        // Initialize LanguageManager first to set the correct language
        if (window.languageManager) {
            console.log('🔄 Initializing LanguageManager...');
            window.languageManager.init();
        } else {
            console.error('❌ LanguageManager not found!');
        }
    }, 200);
});

// Listen for language ready event
window.addEventListener('languageReady', (event) => {
    console.log('🔄 Language ready event received:', event.detail);
    
    // Initialize TextManager with the correct language
    if (window.textManager) {
        console.log('🔄 Initializing TextManager...');
        window.textManager.initialize();
    } else {
        console.error('❌ TextManager not found!');
    }
    
    // Then initialize the main app
    console.log('🔄 Initializing HallOfFameApp...');
    app = new HallOfFameApp();
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