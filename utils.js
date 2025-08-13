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
		
		if (!levelData.board || !levelData.board.nodes || !Array.isArray(levelData.board.nodes)) {
			throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
		}
		
		// Check if nodes array is not empty
		if (levelData.board.nodes.length === 0) {
			throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
		}
		
		// Check if all rows have the same length
		const firstRowLength = levelData.board.nodes[0].length;
		for (let i = 1; i < levelData.board.nodes.length; i++) {
			if (levelData.board.nodes[i].length !== firstRowLength) {
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
} 