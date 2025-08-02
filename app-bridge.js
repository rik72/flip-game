// ===== GLOBAL BRIDGE FUNCTIONS =====
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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