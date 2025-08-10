// ===== TEXT MANAGER =====
class TextManager {
    constructor() {
        this.initialized = false;
    }

    // Initialize text content throughout the application
    initialize() {
        console.log('🔄 TextManager: Updating all text content...');
        
        // Check if CONSTANTS is available
        if (typeof window.CONSTANTS === 'undefined') {
            console.error('❌ CONSTANTS not available, cannot initialize TextManager');
            return;
        }
        
        this.updatePageTitle();
        this.updateNavigationText();
        this.updateSectionHeaders();
        this.updateButtonLabels();
        this.updateFormLabels();
        this.updateFormHelp();
        this.updateModalTitles();
        this.updateDropdownOptions();
        this.updateFooterText();
        this.updateAlertMessages();
        this.updateAvatarOptions();
        
        if (!this.initialized) {
            this.initialized = true;
            console.log('✅ TextManager initialized successfully');
        } else {
            console.log('✅ TextManager text updated successfully');
        }
    }

    // Update page title
    updatePageTitle() {
        document.title = CONSTANTS.PAGE_TITLE;
        
        // Update app title spans
        this.updateElementText('#app-title-hall', CONSTANTS.APP_TITLE.HALL);
        this.updateElementText('#app-title-of', CONSTANTS.APP_TITLE.OF);
        this.updateElementText('#app-title-fame', CONSTANTS.APP_TITLE.FAME);
    }

    // Update navigation text
    updateNavigationText() {
        // Update navigation text spans
        this.updateElementText('#nav-players-text', CONSTANTS.NAVIGATION.PLAYERS);
        this.updateElementText('#nav-games-text', CONSTANTS.NAVIGATION.GAMES);
        this.updateElementText('#nav-matches-text', CONSTANTS.NAVIGATION.MATCHES);
    }

    // Update section headers
    updateSectionHeaders() {
        // Update ranking section
        this.updateElementText('#ranking-header', CONSTANTS.SECTIONS.RANKING);

        // Update section headers
        this.updateElementText('#section-players-header', CONSTANTS.SECTIONS.PLAYERS);
        this.updateElementText('#section-games-header', CONSTANTS.SECTIONS.GAMES);
        this.updateElementText('#section-matches-header', CONSTANTS.SECTIONS.MATCHES);
    }

    // Update button labels
    updateButtonLabels() {
        // Update add player button
        this.updateElementText('#add-player-btn-text', CONSTANTS.BUTTONS.ADD_PLAYER);

        // Update add game button
        this.updateElementText('#add-game-btn-text', CONSTANTS.BUTTONS.ADD_GAME);

        // Update record match button
        this.updateElementText('#add-match-btn-text', CONSTANTS.BUTTONS.RECORD_MATCH);

        // Update add participant button
        this.updateElementText('#add-participant-btn-text', CONSTANTS.BUTTONS.ADD_PARTICIPANT);

        // Update modal buttons
        this.updateModalButtons();
    }

    // Update modal buttons
    updateModalButtons() {
        // Player modal buttons
        const playerCancelBtn = document.querySelector('#addPlayerModal .btn-secondary');
        const playerSubmitBtn = document.querySelector('#player-submit-btn');
        if (playerCancelBtn) playerCancelBtn.textContent = CONSTANTS.BUTTONS.CANCEL;
        if (playerSubmitBtn) playerSubmitBtn.textContent = CONSTANTS.BUTTONS.ADD;

        // Game modal buttons
        const gameCancelBtn = document.querySelector('#addGameModal .btn-secondary');
        const gameSubmitBtn = document.querySelector('#game-submit-btn');
        if (gameCancelBtn) gameCancelBtn.textContent = CONSTANTS.BUTTONS.CANCEL;
        if (gameSubmitBtn) gameSubmitBtn.textContent = CONSTANTS.BUTTONS.ADD;

        // Match modal buttons
        const matchCancelBtn = document.querySelector('#addMatchModal .btn-secondary');
        const matchSubmitBtn = document.querySelector('#match-submit-btn');
        if (matchCancelBtn) matchCancelBtn.textContent = CONSTANTS.BUTTONS.CANCEL;
        if (matchSubmitBtn) matchSubmitBtn.textContent = CONSTANTS.BUTTONS.RECORD_MATCH;

        // Import modal buttons
        const importCancelBtn = document.querySelector('#importModal .btn-secondary');
        const importSubmitBtn = document.querySelector('#importModal .btn-primary');
        if (importCancelBtn) importCancelBtn.textContent = CONSTANTS.BUTTONS.CANCEL;
        if (importSubmitBtn) {
            importSubmitBtn.innerHTML = `<i class="bi bi-upload me-1"></i>${CONSTANTS.BUTTONS.IMPORT}`;
        }

        // Game ranking modal buttons
        const gameRankingCloseBtn = document.querySelector('#gameRankingModal .btn-secondary');
        if (gameRankingCloseBtn) gameRankingCloseBtn.textContent = CONSTANTS.BUTTONS.CLOSE;
    }

    // Update form labels
    updateFormLabels() {
        // Player form labels
        this.updateElementText('#player-name-label', CONSTANTS.FORM_LABELS.NAME);
        this.updateElementText('#player-avatar-label', CONSTANTS.FORM_LABELS.AVATAR);

        // Game form labels
        this.updateElementText('#game-name-label', CONSTANTS.FORM_LABELS.GAME_NAME);
        this.updateElementText('#game-type-label', CONSTANTS.FORM_LABELS.TYPE);

        // Match form labels
        this.updateElementText('#match-game-label', CONSTANTS.FORM_LABELS.GAME);
        this.updateElementText('#match-date-label', CONSTANTS.FORM_LABELS.DATE);
        this.updateElementText('#participants-label', CONSTANTS.FORM_LABELS.PARTICIPANTS_AND_RESULTS);

        // Import form labels
        this.updateElementText('#backup-file-label', CONSTANTS.FORM_LABELS.BACKUP_FILE);
    }

    // Update form help text and placeholders
    updateFormHelp() {
        // Avatar filter placeholder and help
        const avatarFilter = document.querySelector('#avatar-filter');
        if (avatarFilter) avatarFilter.placeholder = CONSTANTS.FORM_HELP.AVATAR_FILTER;
        this.updateElementText('#avatar-filter-help', CONSTANTS.FORM_HELP.AVATAR_FILTER_HELP);

        // Game selector placeholder
        this.updateElementText('#match-game-placeholder', CONSTANTS.FORM_HELP.SELECT_GAME_PLACEHOLDER);

        // Backup file help
        this.updateElementText('#backup-file-help', CONSTANTS.FORM_HELP.BACKUP_FILE_HELP);
    }

    // Update modal titles
    updateModalTitles() {
        // Player modal title
        this.updateElementText('#player-modal-title', CONSTANTS.MODAL_TITLES.ADD_PLAYER);

        // Game modal title
        this.updateElementText('#game-modal-title', CONSTANTS.MODAL_TITLES.ADD_GAME);

        // Match modal title
        this.updateElementText('#match-modal-title', CONSTANTS.MODAL_TITLES.RECORD_MATCH);

        // Import modal title
        this.updateElementText('#import-modal-title', CONSTANTS.MODAL_TITLES.IMPORT_BACKUP);

        // Game ranking modal title
        this.updateElementText('#game-ranking-modal-title', CONSTANTS.MODAL_TITLES.GAME_RANKING);
    }

    // Update dropdown options
    updateDropdownOptions() {
        // Ranking sort options
        this.updateElementText('#ranking-sort-points', CONSTANTS.DROPDOWN_OPTIONS.RANKING_SORT.POINTS);
        this.updateElementText('#ranking-sort-performance', CONSTANTS.DROPDOWN_OPTIONS.RANKING_SORT.PERFORMANCE);

        // Game ranking sort options
        this.updateElementText('#game-ranking-sort-points', CONSTANTS.DROPDOWN_OPTIONS.RANKING_SORT.POINTS);
        this.updateElementText('#game-ranking-sort-performance', CONSTANTS.DROPDOWN_OPTIONS.RANKING_SORT.PERFORMANCE);

        // Game type options
        this.updateElementText('#game-type-board', CONSTANTS.DROPDOWN_OPTIONS.GAME_TYPES.BOARD);
        this.updateElementText('#game-type-card', CONSTANTS.DROPDOWN_OPTIONS.GAME_TYPES.CARD);
        this.updateElementText('#game-type-garden', CONSTANTS.DROPDOWN_OPTIONS.GAME_TYPES.GARDEN);
        this.updateElementText('#game-type-sport', CONSTANTS.DROPDOWN_OPTIONS.GAME_TYPES.SPORT);
        this.updateElementText('#game-type-other', CONSTANTS.DROPDOWN_OPTIONS.GAME_TYPES.OTHER);
    }

    // Update footer text
    updateFooterText() {
        // Settings dropdown headers
        this.updateElementText('#settings-backup-header', CONSTANTS.FOOTER.BACKUP);
        this.updateElementText('#settings-language-header', CONSTANTS.FOOTER.LANGUAGE);

        // Backup dropdown items
        this.updateElementText('#export-backup-text', CONSTANTS.FOOTER.EXPORT_BACKUP);
        this.updateElementText('#import-backup-text', CONSTANTS.FOOTER.IMPORT_BACKUP);

        // Language dropdown items
        this.updateElementText('#language-italian-text', CONSTANTS.FOOTER.ITALIAN);
        this.updateElementText('#language-english-text', CONSTANTS.FOOTER.ENGLISH);

        // GitHub link title
        const githubLink = document.querySelector('#github-link');
        if (githubLink) {
            githubLink.title = CONSTANTS.FOOTER.GITHUB_TITLE;
        }
    }

    // Update alert messages
    updateAlertMessages() {
        // Import warning alert
        this.updateElementText('#import-warning-title', CONSTANTS.ALERTS.IMPORT_WARNING_TITLE);
        this.updateElementText('#import-warning-message', CONSTANTS.ALERTS.IMPORT_WARNING_MESSAGE);
    }

    // Update avatar options (this would be a large update, so we'll create a separate method)
    updateAvatarOptions() {
        // This method would update all the avatar options in the select dropdown
        // Since there are hundreds of avatar options, this would be a significant update
        // For now, we'll leave this as a placeholder that can be implemented later
        // The avatar options are already well-organized in CONSTANTS.AVATAR_CATEGORIES
        console.log('Avatar options update would be implemented here');
    }

    // Method to update text for a specific element
    updateElementText(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`⚠️ Element not found: ${selector}`);
        }
    }

    // Method to update text for multiple elements
    updateElementsText(selectors, text) {
        selectors.forEach(selector => {
            this.updateElementText(selector, text);
        });
    }

    // Method to update modal title dynamically
    updateModalTitle(modalId, title) {
        const modalTitle = document.querySelector(`#${modalId} .modal-title`);
        if (modalTitle) {
            modalTitle.textContent = title;
        }
    }

    // Method to update button text dynamically
    updateButtonText(buttonId, text, icon = null) {
        const button = document.querySelector(`#${buttonId}`);
        if (button) {
            if (icon) {
                button.innerHTML = `<i class="${icon}"></i>${text}`;
            } else {
                button.textContent = text;
            }
        }
    }

    // Method to update form label dynamically
    updateFormLabel(forAttribute, text) {
        const label = document.querySelector(`label[for="${forAttribute}"]`);
        if (label) {
            label.textContent = text;
        }
    }

    // Method to update dropdown option dynamically
    updateDropdownOption(selectId, value, text) {
        const option = document.querySelector(`#${selectId} option[value="${value}"]`);
        if (option) {
            option.textContent = text;
        }
    }

    // Method to get text from constants
    getText(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], CONSTANTS);
    }

    // Method to set text to an element using a constants path
    setTextFromPath(selector, path) {
        const text = this.getText(path);
        if (text) {
            this.updateElementText(selector, text);
        }
    }
}

// Create global instance
window.textManager = new TextManager(); 