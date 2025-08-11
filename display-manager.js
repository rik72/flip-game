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

    static createStatsDisplay(stats) {
        const winsStats = HtmlBuilder.createStatsBadge('🏆', stats.wins, 'Wins');
        const participantsStats = HtmlBuilder.createStatsBadge('🥈', stats.participants, 'Placements');
        const lastsStats = HtmlBuilder.createStatsBadge('😞', stats.lasts, 'Last places');
        
        return `
            <div class="stats-single-line">
                <span class="me-3">Games played: <strong>${stats.gamesPlayed}</strong></span>
                <span>${winsStats} ${participantsStats} ${lastsStats}</span>
            </div>
        `;
    }

    // Game-specific methods
    static renderGameState(container, gameState) {
        if (!gameState) {
            return false;
        }
        
        container.innerHTML = HtmlBuilder.createGameUI();
        return true;
    }

    static renderLevelNumber(level) {
        const levelDisplay = document.getElementById('levelDisplay');
        if (levelDisplay) {
            levelDisplay.innerHTML = HtmlBuilder.createLevelNumber(level);
        }
    }

    static renderGameStats(score, moves) {
        const scoreDisplay = document.getElementById('scoreDisplay');
        const movesCounter = document.getElementById('movesCounter');
        
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${score}`;
        }
        
        if (movesCounter) {
            movesCounter.textContent = `Moves: ${moves}`;
        }
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

    static renderLevelCompleteModal(level, score, moves) {
        const modalContainer = document.getElementById('levelCompleteModal');
        if (modalContainer) {
            modalContainer.innerHTML = HtmlBuilder.createLevelCompleteModal(level, score, moves);
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

    static updateGameProgress(level, score, moves) {
        this.renderLevelNumber(level);
        this.renderGameStats(score, moves);
    }
} 