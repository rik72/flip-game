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
} 