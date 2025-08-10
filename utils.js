// ===== UTILITY FUNCTIONS =====
class Utils {
    static formatMessage(template, type) {
        return template.replace('{type}', type);
    }

    static validateName(name, existingItems, currentId = null, itemType = 'item') {
        if (!name.trim()) {
            throw new Error(Utils.formatMessage(CONSTANTS.MESSAGES.EMPTY_NAME, itemType));
        }
        
        const duplicateExists = existingItems.some(item => 
            item.name.toLowerCase() === name.toLowerCase() && 
            (currentId === null || item.id !== currentId)
        );
        
        if (duplicateExists) {
            throw new Error(Utils.formatMessage(CONSTANTS.MESSAGES.DUPLICATE_NAME, itemType));
        }
        
        return true;
    }

    static confirmDelete(message) {
        return confirm(message);
    }

    static showModal(modalId) {
        new bootstrap.Modal(document.getElementById(modalId)).show();
    }

    static hideModal(modalId) {
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById(modalId));
        if (modalInstance) modalInstance.hide();
    }

    static pluralizeMatches(count, capitalize = false) {
        const word = count === 1 ? (window.CONSTANTS?.UI_TEXT?.PARTITA || 'match') : (window.CONSTANTS?.UI_TEXT?.PARTITE || 'matches');
        return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    }
} 