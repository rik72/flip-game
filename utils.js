// ===== UTILITY FUNCTIONS =====
class Utils {
	static showModal(modalId) {
		// Play modal open sound if app instance is available
		if (window.appInstance && window.appInstance.soundManager) {
			window.appInstance.soundManager.playSound('modalOpen');
		}
		new bootstrap.Modal(document.getElementById(modalId)).show();
	}

	static hideModal(modalId) {
		// Play modal close sound if app instance is available
		if (window.appInstance && window.appInstance.soundManager) {
			window.appInstance.soundManager.playSound('modalClose');
		}
		const modalInstance = bootstrap.Modal.getInstance(document.getElementById(modalId));
		if (modalInstance) modalInstance.hide();
	}

	// Game-specific validation methods
	static validateLevelData(levelData) {
		try {
			if (!levelData) {
				throw new Error(CONSTANTS.MESSAGES.LEVEL_DATA_REQUIRED);
			}
			
			if (!levelData.board || !levelData.board.front || !Array.isArray(levelData.board.front)) {
				throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
			}
			
			// Check if front array is not empty
			if (levelData.board.front.length === 0) {
				throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
			}
			
			// Check if all rows in front have the same length
			const firstRowLength = levelData.board.front[0].length;
			for (let i = 1; i < levelData.board.front.length; i++) {
				if (levelData.board.front[i].length !== firstRowLength) {
					throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
				}
			}
			
			// If rear is present, validate it has the same dimensions as front
			if (levelData.board.rear) {
				if (!Array.isArray(levelData.board.rear)) {
					throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
				}
				
				// Check if rear has same number of rows as front
				if (levelData.board.rear.length !== levelData.board.front.length) {
					throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
				}
				
				// Check if all rows in rear have the same length as front rows
				for (let i = 0; i < levelData.board.rear.length; i++) {
					if (levelData.board.rear[i].length !== firstRowLength) {
						throw new Error(CONSTANTS.MESSAGES.INVALID_LEVEL);
					}
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
		} catch (error) {
			console.error('Validation error:', error);
			throw error; // Re-throw to allow calling code to handle
		}
	}

	// URL parameter utilities
	static getUrlParameter(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

	static getUrlParameterAsNumber(name, defaultValue = null) {
		const value = this.getUrlParameter(name);
		if (value === null) return defaultValue;
		
		const numValue = parseInt(value, 10);
		return isNaN(numValue) ? defaultValue : numValue;
	}

	static getUrlParameterAsString(name, defaultValue = null) {
		const value = this.getUrlParameter(name);
		return value !== null ? value : defaultValue;
	}

	// Utility function to generate gradient colors from level data
	static generateGradientColors(levelData) {
		// Create a checksum from the level data
		const levelString = JSON.stringify(levelData);
		let checksum = 0;
		for (let i = 0; i < levelString.length; i++) {
			checksum = ((checksum << 5) - checksum + levelString.charCodeAt(i)) & 0xFFFFFFFF;
		}
		
		// Use checksum to generate two dark colors
		const seed1 = checksum & 0xFFFF;
		const seed2 = (checksum >> 16) & 0xFFFF;
		
		// Generate dark colors (values between 16-64 for dark, 8-32 for darker)
		const r1 = 20 + (seed1 % 50);
		const g1 = 20 + ((seed1 >> 4) % 50);
		const b1 = 20 + ((seed1 >> 8) % 50);
		
		const r2 = 16 + (seed2 % 24);
		const g2 = 16 + ((seed2 >> 4) % 24);
		const b2 = 16 + ((seed2 >> 8) % 24);
		
		// Convert to hex colors
		const topColor = '#' + 
			(r1.toString(16).padStart(2, '0')) + 
			(g1.toString(16).padStart(2, '0')) + 
			(b1.toString(16).padStart(2, '0'));
		const bottomColor = '#' + 
			(r2.toString(16).padStart(2, '0')) + 
			(g2.toString(16).padStart(2, '0')) + 
			(b2.toString(16).padStart(2, '0'));
		
		return { topColor, bottomColor };
	}
} 