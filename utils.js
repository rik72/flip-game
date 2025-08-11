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

    // Game-specific validation methods
    static validateLevelData(levelData) {
        if (!levelData) {
            throw new Error(CONSTANTS.MESSAGES.LEVEL_DATA_REQUIRED);
        }
        
        if (!levelData.board || !levelData.start || !levelData.end) {
            throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
        }
        
        return true;
    }

    static validateMove(fromX, fromY, toX, toY, board) {
        // Basic move validation - can be enhanced with path finding
        const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        
        if (distance > CONSTANTS.GAME_CONFIG.PLAYER_RADIUS * 2) {
            throw new Error(CONSTANTS.MESSAGES.INVALID_MOVE);
        }
        
        return true;
    }

    static validateTouchPosition(x, y, canvas) {
        if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
            return false;
        }
        
        return true;
    }

    static calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    static isPointInCircle(px, py, cx, cy, radius) {
        const distance = this.calculateDistance(px, py, cx, cy);
        return distance <= radius;
    }

    static isPointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    static rotatePoint(x, y, cx, cy, angle) {
        const radians = (angle * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        
        const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
        const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        
        return { x: nx, y: ny };
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
} 