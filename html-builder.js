// ===== HTML BUILDER HELPERS =====
class HtmlBuilder {
    static createButton(text, className, onClick, icon = null) {
        const iconHtml = icon ? `<i class="bi ${icon}"></i> ` : '';
        return `<button class="btn btn-sm ${className}" onclick="${onClick}">${iconHtml}${text}</button>`;
    }

    static createActionButtons(itemId, itemType, additionalButtons = []) {
        const deleteButton = this.createButton(
            'Delete', 
            'btn-danger', 
            `app.delete${itemType}(${itemId})`,
            'bi-trash'
        );
        const editButton = this.createButton(
            'Edit', 
            'btn-primary', 
            `app.showEdit${itemType}Modal(${itemId})`,
            'bi-pencil'
        );
        
        let buttons = deleteButton + editButton;
        
        // Add additional buttons if provided
        additionalButtons.forEach(button => {
            buttons += this.createButton(
                button.text,
                button.className,
                button.onClick,
                button.icon
            );
        });
        
        return buttons;
    }

    static createStatsBadge(icon, value, title = '') {
        const titleAttr = title ? `title="${title}" data-bs-toggle="tooltip" data-bs-placement="top"` : '';
        return `<span ${titleAttr}>${icon} ${value}</span>`;
    }

    static createEmptyStateMessage(message) {
        return `<div class="col-12 text-center"><p class="text-muted">${message}</p></div>`;
    }

    // Game-specific methods
    static createCanvas(id, className = 'game-canvas') {
        return `<canvas id="${id}" class="${className}" width="800" height="600"></canvas>`;
    }

    static createTouchArea(id, className = 'touch-area') {
        return `<div id="${id}" class="${className}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10;"></div>`;
    }

    static createGameUI() {
        return `
            <div class="game-container">
                <div class="game-header">
                    <div class="level-display" id="levelDisplay"></div>
                    <div class="game-controls">
                        <button class="btn btn-sm btn-outline-light" onclick="app.resetLevel()">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
                <div class="game-canvas-container">
                    <canvas id="gameCanvas" class="game-canvas"></canvas>
                </div>
                <div class="game-footer">
                    <div class="game-menu-button">
                        <button class="btn btn-sm btn-outline-light" onclick="app.showMenu()">
                            <i class="bi bi-three-dots"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static createLevelNumber(level) {
        return `<div class="level-number">${level}</div>`;
    }

    static createGameMenu() {
        return `
            <div class="game-menu" id="gameMenu">
                <div class="menu-content">
                    <button class="menu-item" onclick="app.showSettings()">
                        <i class="bi bi-gear"></i> Settings
                    </button>
                    <button class="menu-item" onclick="app.resetProgress()">
                        <i class="bi bi-arrow-clockwise"></i> Reset Progress
                    </button>
                    <button class="menu-item" onclick="app.exitGame()">
                        <i class="bi bi-box-arrow-right"></i> Exit
                    </button>
                </div>
            </div>
        `;
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
                                <label>Sound</label>
                                <input type="checkbox" id="soundToggle" checked>
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

    static createLevelCompleteModal(level) {
        return `
            <div class="modal fade" id="levelCompleteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Level ${level} Completed!</h5>
                        </div>
                        <div class="modal-body">
                            <div class="completion-stats">
                                <p>Great job! Level ${level} completed!</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="app.nextLevel()">Next Level</button>
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