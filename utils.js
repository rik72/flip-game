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
        
        if (!levelData.board || !levelData.board.cells || !Array.isArray(levelData.board.cells)) {
            throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
        }
        
        // Check if cells array is not empty
        if (levelData.board.cells.length === 0) {
            throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
        }
        
        // Check if all rows have the same length
        const firstRowLength = levelData.board.cells[0].length;
        for (let i = 1; i < levelData.board.cells.length; i++) {
            if (levelData.board.cells[i].length !== firstRowLength) {
                throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
            }
        }
        
        // Check if level has balls with start and end positions
        if (!levelData.balls || !Array.isArray(levelData.balls) || levelData.balls.length === 0) {
            throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
        }
        
        // Validate each ball has start and end positions
        for (const ball of levelData.balls) {
            if (!ball.start || !Array.isArray(ball.start) || ball.start.length !== 2) {
                throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
            }
            if (!ball.end || !Array.isArray(ball.end) || ball.end.length !== 2) {
                throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
            }
        }
        
        return true;
    }

    // Testing and validation methods
    static async testGameReachability() {
        try {
            const response = await fetch('http://localhost:8099', {
                method: 'HEAD',
                mode: 'no-cors'
            });
            return true;
        } catch (error) {
            console.warn('Game not reachable at localhost:8099:', error);
            return false;
        }
    }

    static requireGameServer() {
        const isReachable = this.testGameReachability();
        if (!isReachable) {
            throw new Error('Game server not reachable at localhost:8099. Please start the server with: python3 -m http.server 8099');
        }
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