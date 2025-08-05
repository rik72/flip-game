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
        const winsStats = HtmlBuilder.createStatsBadge('🏆', stats.wins, 'Vittorie');
        const participantsStats = HtmlBuilder.createStatsBadge('🥈', stats.participants, 'Piazzamenti');
        const lastsStats = HtmlBuilder.createStatsBadge('😞', stats.lasts, 'Ultimi posti');
        
        return `
            <div class="stats-single-line">
                <span class="me-3">Partite: <strong>${stats.gamesPlayed}</strong></span>
                <span>${winsStats} ${participantsStats} ${lastsStats}</span>
            </div>
        `;
    }
} 