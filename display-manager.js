// ===== DISPLAY MANAGER =====
class DisplayManager {
    static renderEmptyState(container, message) {
        container.innerHTML = HtmlBuilder.createEmptyStateMessage(message);
    }

    static renderItemList(container, items, renderItemFunction) {
        if (items.length === 0) {
            return false; // Caller should handle empty state
        }
        
        container.innerHTML = items.map(renderItemFunction).join('');
        return true;
    }



    // Game-specific methods
    static renderGameState(container, gameState) {
        if (!gameState) {
            return false;
        }
        
        container.innerHTML = HtmlBuilder.createGameUI();
        return true;
    }





    static renderGameMenu() {
        const menuContainer = document.getElementById('gameMenu');
        if (menuContainer) {
            menuContainer.innerHTML = HtmlBuilder.createGameMenu();
        }
    }

    static renderSettingsModal() {
        const modalContainer = document.getElementById('settingsModal');
        if (modalContainer) {
            modalContainer.innerHTML = HtmlBuilder.createSettingsModal();
        }
    }

    static renderLevelCompleteModal(level) {
        const modalContainer = document.getElementById('levelCompleteModal');
        if (modalContainer) {
            modalContainer.innerHTML = HtmlBuilder.createLevelCompleteModal(level);
        }
    }

    static renderGameOverModal() {
        const modalContainer = document.getElementById('gameOverModal');
        if (modalContainer) {
            modalContainer.innerHTML = HtmlBuilder.createGameOverModal();
        }
    }

    static showGameMenu() {
        const menu = document.getElementById('gameMenu');
        if (menu) {
            menu.style.display = 'block';
        }
    }

    static hideGameMenu() {
        const menu = document.getElementById('gameMenu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    static updateGameProgress(level) {
        // Level number is now rendered directly on canvas, no HTML update needed
    }
} 