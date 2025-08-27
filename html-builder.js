// ===== HTML BUILDER HELPERS =====
class HtmlBuilder {
    static createButton(text, className, onClick, icon = null) {
        const iconHtml = icon ? `<i class="bi ${icon}"></i> ` : '';
        return `<button class="btn btn-sm ${className}" onclick="${onClick}">${iconHtml}${text}</button>`;
    }

    static createActionButtons(itemId, itemType, additionalButtons = []) {
        const deleteButton = this.createButton(
            '', 'btn-outline-danger', 
            `app.confirmDelete('${itemType}', '${itemId}')`, 
            'bi-trash'
        );
        
        return [deleteButton, ...additionalButtons].join(' ');
    }

    static createEmptyStateMessage(message) {
        return `
            <div class="empty-state">
                <div class="empty-state-content">
                    <i class="bi bi-inbox empty-state-icon"></i>
                    <p class="empty-state-message">${message}</p>
                </div>
            </div>
        `;
    }

    static createCanvas(id, className = 'game-canvas') {
        return `<canvas id="${id}" class="${className}"></canvas>`;
    }

    static createModal(id, title, content, footerButtons = []) {
        const footer = footerButtons.length > 0 
            ? `<div class="modal-footer">${footerButtons.join(' ')}</div>`
            : '';
        
        return `
            <div class="modal fade" id="${id}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">${content}</div>
                        ${footer}
                    </div>
                </div>
            </div>
        `;
    }

    static createTouchArea(id, className = 'touch-area') {
        return `<div id="${id}" class="${className}"></div>`;
    }

    static createGameUI() {
        return `
            <div class="game-container">
                <div class="game-header">
                    <div class="level-navigation">
                        <button id="prevLevelBtn" class="level-nav-btn" style="visibility: hidden;">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="level-display-container">
                            <div id="levelNumberDisplay" class="level-number">#1</div>
                            <button id="restartLevelBtn" class="restart-level-btn" onclick="app.restartCurrentLevel()">
                                <i class="bi bi-arrow-clockwise"></i>
                            </button>
                        </div>
                        <button id="nextLevelBtn" class="level-nav-btn" style="visibility: hidden;">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
                <div class="game-canvas-container">
                    <div id="gameFlipWrapper" class="game-flip-wrapper">
                        <canvas id="gameCanvas" class="game-canvas"></canvas>
                    </div>
                </div>
                <div class="game-footer">
                </div>
            </div>
        `;
    }

    static createLevelNumber(level) {
        return `<div class="level-number">#${level}</div>`;
    }

    static createSettingsModal() {
        return `
            <div class="modal fade" id="settingsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Settings</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="setting-item">
                                <label>Sound Effects</label>
                                <input type="checkbox" id="soundToggle" checked>
                            </div>
                            <div class="setting-item">
                                <label>Background Music</label>
                                <input type="checkbox" id="musicToggle" checked>
                            </div>
                            <div class="setting-item">
                                <label>Sound Volume</label>
                                <input type="range" id="soundVolumeSlider" min="0" max="1" step="0.1" value="0.7">
                                <span id="soundVolumeValue">70%</span>
                            </div>
                            <div class="setting-item">
                                <label>Music Volume</label>
                                <input type="range" id="musicVolumeSlider" min="0" max="1" step="0.1" value="0.5">
                                <span id="musicVolumeValue">50%</span>
                            </div>
                            <div class="setting-item">
                                <label>Vibration</label>
                                <input type="checkbox" id="vibrationToggle" checked>
                            </div>
                            <div class="setting-item">
                                <label>Difficulty</label>
                                <select id="difficultySelect">
                                    <option value="easy">Easy</option>
                                    <option value="normal" selected>Normal</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="app.saveSettings()">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static createGameOverModal() {
        return `
            <div class="modal fade" id="gameOverModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Game Completed!</h5>
                        </div>
                        <div class="modal-body">
                            <p>Congratulations! You've completed all levels!</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="app.restartGame()">Play Again</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
} 