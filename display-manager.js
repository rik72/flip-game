// ===== DISPLAY MANAGER =====
class DisplayManager {
    // Game-specific methods
    static renderGameState(container, gameState) {
        if (!gameState) {
            return false;
        }
        
        container.innerHTML = HtmlBuilder.createGameUI();
        return true;
    }

    static renderSettingsModal() {
        const modalContainer = document.getElementById('settingsModal');
        if (modalContainer) {
            modalContainer.innerHTML = HtmlBuilder.createSettingsModal();
        }
    }

    static renderGameOverModal() {
        const modalContainer = document.getElementById('gameOverModal');
        if (modalContainer) {
            modalContainer.innerHTML = HtmlBuilder.createGameOverModal();
        }
    }
} 