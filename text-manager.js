// ===== TEXT MANAGER =====
class TextManager {
    constructor() {
        this.initialized = false;
    }

    // Initialize text content throughout the application
    initialize() {
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
        const avatarSelect = document.getElementById('player-avatar');
        if (!avatarSelect) {
            console.warn('⚠️ Avatar select element not found');
            return;
        }

        // Store current selection
        const currentValue = avatarSelect.value;
        
        // Clear existing options
        avatarSelect.innerHTML = '';
        
        // Get avatar categories from constants
        const categories = CONSTANTS.AVATAR_CATEGORIES;
        if (!categories) {
            console.error('❌ Avatar categories not found in constants');
            return;
        }

        // Add Faces & Emotions section
        if (categories.FACES_EMOTIONS) {
            const emotions = categories.FACES_EMOTIONS;
            this.addAvatarOption(avatarSelect, '😊', emotions.SORRIDENTE);
            this.addAvatarOption(avatarSelect, '😎', emotions.COOL);
            this.addAvatarOption(avatarSelect, '🤩', emotions.STELLARE);
            this.addAvatarOption(avatarSelect, '🥳', emotions.FESTA);
            this.addAvatarOption(avatarSelect, '🤯', emotions.WOW);
            this.addAvatarOption(avatarSelect, '😍', emotions.INNAMORATO);
            this.addAvatarOption(avatarSelect, '🤔', emotions.PENSIEROSO);
            this.addAvatarOption(avatarSelect, '😄', emotions.FELICE);
            this.addAvatarOption(avatarSelect, '😂', emotions.LACRIME);
            this.addAvatarOption(avatarSelect, '🥰', emotions.AMOROSO);
            this.addAvatarOption(avatarSelect, '😇', emotions.ANGELO);
            this.addAvatarOption(avatarSelect, '🤗', emotions.ABBRACCIO);
            this.addAvatarOption(avatarSelect, '🤭', emotions.TIMIDO);
            this.addAvatarOption(avatarSelect, '🤫', emotions.SILENZIO);
            this.addAvatarOption(avatarSelect, '🤨', emotions.SOSPETTOSO);
            this.addAvatarOption(avatarSelect, '😏', emotions.FURBO);
            this.addAvatarOption(avatarSelect, '😴', emotions.DORMIENTE);
            this.addAvatarOption(avatarSelect, '🤓', emotions.NERD);
            this.addAvatarOption(avatarSelect, '🥶', emotions.FREDDO);
            this.addAvatarOption(avatarSelect, '🥵', emotions.CALDO);
            this.addAvatarOption(avatarSelect, '😶‍🌫️', emotions.MISTERIOSO);
            this.addAvatarOption(avatarSelect, '🤪', emotions.PAZZO);
            this.addAvatarOption(avatarSelect, '😵‍💫', emotions.STORDITO);
            this.addAvatarOption(avatarSelect, '🤑', emotions.SOLDI);
            this.addAvatarOption(avatarSelect, '🤠', emotions.COWBOY);
        }

        // Add People section
        if (categories.PEOPLE) {
            const people = categories.PEOPLE;
            
            // Babies
            this.addAvatarOption(avatarSelect, '👶', people.BIMBO);
            this.addAvatarOption(avatarSelect, '👶🏻', people.BIMBO_CHIARO);
            this.addAvatarOption(avatarSelect, '👶🏼', people.BIMBO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👶🏽', people.BIMBO_MEDIO);
            this.addAvatarOption(avatarSelect, '👶🏾', people.BIMBO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👶🏿', people.BIMBO_SCURO);
            
            this.addAvatarOption(avatarSelect, '👧', people.BIMBA);
            this.addAvatarOption(avatarSelect, '👧🏻', people.BIMBA_CHIARA);
            this.addAvatarOption(avatarSelect, '👧🏼', people.BIMBA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👧🏽', people.BIMBA_MEDIA);
            this.addAvatarOption(avatarSelect, '👧🏾', people.BIMBA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👧🏿', people.BIMBA_SCURA);
            
            this.addAvatarOption(avatarSelect, '👦', people.BAMBINO);
            this.addAvatarOption(avatarSelect, '👦🏻', people.BAMBINO_CHIARO);
            this.addAvatarOption(avatarSelect, '👦🏼', people.BAMBINO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👦🏽', people.BAMBINO_MEDIO);
            this.addAvatarOption(avatarSelect, '👦🏾', people.BAMBINO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👦🏿', people.BAMBINO_SCURO);
            
            // Women
            this.addAvatarOption(avatarSelect, '👩', people.DONNA);
            this.addAvatarOption(avatarSelect, '👩🏻', people.DONNA_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏼', people.DONNA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏽', people.DONNA_MEDIA);
            this.addAvatarOption(avatarSelect, '👩🏾', people.DONNA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👩🏿', people.DONNA_SCURA);
            
            this.addAvatarOption(avatarSelect, '👱‍♀️', people.DONNA_BIONDA);
            this.addAvatarOption(avatarSelect, '👱🏻‍♀️', people.DONNA_BIONDA_CHIARA);
            this.addAvatarOption(avatarSelect, '👱🏼‍♀️', people.DONNA_BIONDA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👱🏽‍♀️', people.DONNA_BIONDA_MEDIA);
            this.addAvatarOption(avatarSelect, '👱🏾‍♀️', people.DONNA_BIONDA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👱🏿‍♀️', people.DONNA_BIONDA_SCURA);
            
            this.addAvatarOption(avatarSelect, '👩‍🦱', people.DONNA_RICCIA);
            this.addAvatarOption(avatarSelect, '👩🏻‍🦱', people.DONNA_RICCIA_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏼‍🦱', people.DONNA_RICCIA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏽‍🦱', people.DONNA_RICCIA_MEDIA);
            this.addAvatarOption(avatarSelect, '👩🏾‍🦱', people.DONNA_RICCIA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👩🏿‍🦱', people.DONNA_RICCIA_SCURA);
            
            this.addAvatarOption(avatarSelect, '👩‍🦰', people.DONNA_ROSSA);
            this.addAvatarOption(avatarSelect, '👩🏻‍🦰', people.DONNA_ROSSA_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏼‍🦰', people.DONNA_ROSSA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏽‍🦰', people.DONNA_ROSSA_MEDIA);
            this.addAvatarOption(avatarSelect, '👩🏾‍🦰', people.DONNA_ROSSA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👩🏿‍🦰', people.DONNA_ROSSA_SCURA);
            
            this.addAvatarOption(avatarSelect, '👩‍🦳', people.DONNA_BIANCA);
            this.addAvatarOption(avatarSelect, '👩🏻‍🦳', people.DONNA_BIANCA_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏼‍🦳', people.DONNA_BIANCA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏽‍🦳', people.DONNA_BIANCA_MEDIA);
            this.addAvatarOption(avatarSelect, '👩🏾‍🦳', people.DONNA_BIANCA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👩🏿‍🦳', people.DONNA_BIANCA_SCURA);
            
            this.addAvatarOption(avatarSelect, '👩‍🦲', people.DONNA_CALVA);
            this.addAvatarOption(avatarSelect, '👩🏻‍🦲', people.DONNA_CALVA_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏼‍🦲', people.DONNA_CALVA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👩🏽‍🦲', people.DONNA_CALVA_MEDIA);
            this.addAvatarOption(avatarSelect, '👩🏾‍🦲', people.DONNA_CALVA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👩🏿‍🦲', people.DONNA_CALVA_SCURA);
            
            // Men
            this.addAvatarOption(avatarSelect, '👨', people.UOMO);
            this.addAvatarOption(avatarSelect, '👨🏻', people.UOMO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏼', people.UOMO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏽', people.UOMO_MEDIO);
            this.addAvatarOption(avatarSelect, '👨🏾', people.UOMO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👨🏿', people.UOMO_SCURO);
            
            this.addAvatarOption(avatarSelect, '👱‍♂️', people.UOMO_BIONDO);
            this.addAvatarOption(avatarSelect, '👱🏻‍♂️', people.UOMO_BIONDO_CHIARO);
            this.addAvatarOption(avatarSelect, '👱🏼‍♂️', people.UOMO_BIONDO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👱🏽‍♂️', people.UOMO_BIONDO_MEDIO);
            this.addAvatarOption(avatarSelect, '👱🏾‍♂️', people.UOMO_BIONDO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👱🏿‍♂️', people.UOMO_BIONDO_SCURO);
            
            this.addAvatarOption(avatarSelect, '👨‍🦱', people.UOMO_RICCIO);
            this.addAvatarOption(avatarSelect, '👨🏻‍🦱', people.UOMO_RICCIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏼‍🦱', people.UOMO_RICCIO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏽‍🦱', people.UOMO_RICCIO_MEDIO);
            this.addAvatarOption(avatarSelect, '👨🏾‍🦱', people.UOMO_RICCIO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👨🏿‍🦱', people.UOMO_RICCIO_SCURO);
            
            this.addAvatarOption(avatarSelect, '👨‍🦰', people.UOMO_ROSSO);
            this.addAvatarOption(avatarSelect, '👨🏻‍🦰', people.UOMO_ROSSO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏼‍🦰', people.UOMO_ROSSO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏽‍🦰', people.UOMO_ROSSO_MEDIO);
            this.addAvatarOption(avatarSelect, '👨🏾‍🦰', people.UOMO_ROSSO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👨🏿‍🦰', people.UOMO_ROSSO_SCURO);
            
            this.addAvatarOption(avatarSelect, '👨‍🦳', people.UOMO_BIANCO);
            this.addAvatarOption(avatarSelect, '👨🏻‍🦳', people.UOMO_BIANCO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏼‍🦳', people.UOMO_BIANCO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏽‍🦳', people.UOMO_BIANCO_MEDIO);
            this.addAvatarOption(avatarSelect, '👨🏾‍🦳', people.UOMO_BIANCO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👨🏿‍🦳', people.UOMO_BIANCO_SCURO);
            
            this.addAvatarOption(avatarSelect, '👨‍🦲', people.UOMO_CALVO);
            this.addAvatarOption(avatarSelect, '👨🏻‍🦲', people.UOMO_CALVO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏼‍🦲', people.UOMO_CALVO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👨🏽‍🦲', people.UOMO_CALVO_MEDIO);
            this.addAvatarOption(avatarSelect, '👨🏾‍🦲', people.UOMO_CALVO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👨🏿‍🦲', people.UOMO_CALVO_SCURO);
            
            // Grandparents
            this.addAvatarOption(avatarSelect, '👵', people.NONNA);
            this.addAvatarOption(avatarSelect, '👵🏻', people.NONNA_CHIARA);
            this.addAvatarOption(avatarSelect, '👵🏼', people.NONNA_MEDIO_CHIARA);
            this.addAvatarOption(avatarSelect, '👵🏽', people.NONNA_MEDIA);
            this.addAvatarOption(avatarSelect, '👵🏾', people.NONNA_MEDIO_SCURA);
            this.addAvatarOption(avatarSelect, '👵🏿', people.NONNA_SCURA);
            
            this.addAvatarOption(avatarSelect, '👴', people.NONNO);
            this.addAvatarOption(avatarSelect, '👴🏻', people.NONNO_CHIARO);
            this.addAvatarOption(avatarSelect, '👴🏼', people.NONNO_MEDIO_CHIARO);
            this.addAvatarOption(avatarSelect, '👴🏽', people.NONNO_MEDIO);
            this.addAvatarOption(avatarSelect, '👴🏾', people.NONNO_MEDIO_SCURO);
            this.addAvatarOption(avatarSelect, '👴🏿', people.NONNO_SCURO);
        }

        // Add Professions section
        if (categories.PROFESSIONS) {
            const professions = categories.PROFESSIONS;
            this.addAvatarOption(avatarSelect, '👮‍♀️', professions.POLIZIOTTA);
            this.addAvatarOption(avatarSelect, '👮‍♂️', professions.POLIZIOTTO);
            this.addAvatarOption(avatarSelect, '👷‍♀️', professions.COSTRUTTRICE);
            this.addAvatarOption(avatarSelect, '👷‍♂️', professions.COSTRUTTORE);
            this.addAvatarOption(avatarSelect, '💂‍♀️', professions.GUARDIA);
            this.addAvatarOption(avatarSelect, '💂‍♂️', professions.GUARDIA);
            this.addAvatarOption(avatarSelect, '🕵️‍♀️', professions.DETECTIVE);
            this.addAvatarOption(avatarSelect, '🕵️‍♂️', professions.DETECTIVE);
            this.addAvatarOption(avatarSelect, '👩‍⚕️', professions.DOTTORESSA);
            this.addAvatarOption(avatarSelect, '👨‍⚕️', professions.DOTTORE);
            this.addAvatarOption(avatarSelect, '👩‍🌾', professions.CONTADINA);
            this.addAvatarOption(avatarSelect, '👨‍🌾', professions.CONTADINO);
            this.addAvatarOption(avatarSelect, '👩‍🍳', professions.CHEF);
            this.addAvatarOption(avatarSelect, '👨‍🍳', professions.CHEF);
            this.addAvatarOption(avatarSelect, '👩‍🎓', professions.STUDENTESSA);
            this.addAvatarOption(avatarSelect, '👨‍🎓', professions.STUDENTE);
            this.addAvatarOption(avatarSelect, '👩‍🎤', professions.CANTANTE);
            this.addAvatarOption(avatarSelect, '👨‍🎤', professions.CANTANTE);
            this.addAvatarOption(avatarSelect, '👩‍🏫', professions.INSEGNANTE);
            this.addAvatarOption(avatarSelect, '👨‍🏫', professions.INSEGNANTE);
            this.addAvatarOption(avatarSelect, '👩‍💻', professions.PROGRAMMATRICE);
            this.addAvatarOption(avatarSelect, '👨‍💻', professions.PROGRAMMATORE);
            this.addAvatarOption(avatarSelect, '👩‍🚀', professions.ASTRONAUTA);
            this.addAvatarOption(avatarSelect, '👨‍🚀', professions.ASTRONAUTA);
            this.addAvatarOption(avatarSelect, '👩‍🚒', professions.POMPIERE);
            this.addAvatarOption(avatarSelect, '👨‍🚒', professions.POMPIERE);
            this.addAvatarOption(avatarSelect, '🥷', professions.NINJA);
            this.addAvatarOption(avatarSelect, '🤴', professions.PRINCIPE);
            this.addAvatarOption(avatarSelect, '👸', professions.PRINCIPESSA);
        }

        // Add Fantasy & Characters section
        if (categories.FANTASY_CHARACTERS) {
            const fantasy = categories.FANTASY_CHARACTERS;
            this.addAvatarOption(avatarSelect, '👻', fantasy.FANTASMA);
            this.addAvatarOption(avatarSelect, '🤡', fantasy.PAGLIACCIO);
            this.addAvatarOption(avatarSelect, '👹', fantasy.OGRE);
            this.addAvatarOption(avatarSelect, '👺', fantasy.GOBLIN);
            this.addAvatarOption(avatarSelect, '🤖', fantasy.ROBOT);
            this.addAvatarOption(avatarSelect, '👽', fantasy.ALIENO);
            this.addAvatarOption(avatarSelect, '👾', fantasy.MOSTRO);
            this.addAvatarOption(avatarSelect, '🎅', fantasy.BABBO_NATALE);
            this.addAvatarOption(avatarSelect, '🤶', fantasy.MAMMA_NATALE);
            this.addAvatarOption(avatarSelect, '🧙‍♀️', fantasy.STREGA);
            this.addAvatarOption(avatarSelect, '🧙‍♂️', fantasy.MAGO);
            this.addAvatarOption(avatarSelect, '🧚‍♀️', fantasy.FATA);
            this.addAvatarOption(avatarSelect, '🧚‍♂️', fantasy.FOLLETTO);
            this.addAvatarOption(avatarSelect, '🧛‍♀️', fantasy.VAMPIRA);
            this.addAvatarOption(avatarSelect, '🧛‍♂️', fantasy.VAMPIRO);
            this.addAvatarOption(avatarSelect, '🧟‍♀️', fantasy.ZOMBIE);
            this.addAvatarOption(avatarSelect, '🧟‍♂️', fantasy.ZOMBIE);
        }

        // Add Animals section
        if (categories.ANIMALS) {
            const animals = categories.ANIMALS;
            this.addAvatarOption(avatarSelect, '🐶', animals.CANE);
            this.addAvatarOption(avatarSelect, '🐱', animals.GATTO);
            this.addAvatarOption(avatarSelect, '🐭', animals.TOPO);
            this.addAvatarOption(avatarSelect, '🐹', animals.CRICETO);
            this.addAvatarOption(avatarSelect, '🐰', animals.CONIGLIO);
            this.addAvatarOption(avatarSelect, '🦊', animals.VOLPE);
            this.addAvatarOption(avatarSelect, '🐻', animals.ORSO);
            this.addAvatarOption(avatarSelect, '🐼', animals.PANDA);
            this.addAvatarOption(avatarSelect, '🐨', animals.KOALA);
            this.addAvatarOption(avatarSelect, '🐯', animals.TIGRE);
            this.addAvatarOption(avatarSelect, '🦁', animals.LEONE);
            this.addAvatarOption(avatarSelect, '🐮', animals.MUCCA);
            this.addAvatarOption(avatarSelect, '🐷', animals.MAIALE);
            this.addAvatarOption(avatarSelect, '🐸', animals.RANA);
            this.addAvatarOption(avatarSelect, '🐵', animals.SCIMMIA);
            this.addAvatarOption(avatarSelect, '🙈', animals.NON_VEDO);
            this.addAvatarOption(avatarSelect, '🙉', animals.NON_SENTO);
            this.addAvatarOption(avatarSelect, '🙊', animals.NON_PARLO);
            this.addAvatarOption(avatarSelect, '🐒', animals.SCIMMIA);
            this.addAvatarOption(avatarSelect, '🦄', animals.UNICORNO);
            this.addAvatarOption(avatarSelect, '🐝', animals.APE);
            this.addAvatarOption(avatarSelect, '🐛', animals.BRUCO);
            this.addAvatarOption(avatarSelect, '🦋', animals.FARFALLA);
            this.addAvatarOption(avatarSelect, '🐌', animals.LUMACA);
            this.addAvatarOption(avatarSelect, '🐞', animals.COCCINELLA);
            this.addAvatarOption(avatarSelect, '🐜', animals.FORMICA);
            this.addAvatarOption(avatarSelect, '🦗', animals.GRILLO);
            this.addAvatarOption(avatarSelect, '🕷️', animals.RAGNO);
            this.addAvatarOption(avatarSelect, '🦂', animals.SCORPIONE);
            this.addAvatarOption(avatarSelect, '🐢', animals.TARTARUGA);
            this.addAvatarOption(avatarSelect, '🐍', animals.SERPENTE);
            this.addAvatarOption(avatarSelect, '🦎', animals.LUCERTOLA);
            this.addAvatarOption(avatarSelect, '🦖', animals.T_REX);
            this.addAvatarOption(avatarSelect, '🦕', animals.DINOSAURO);
            this.addAvatarOption(avatarSelect, '🐙', animals.POLPO);
            this.addAvatarOption(avatarSelect, '🦑', animals.CALAMARO);
            this.addAvatarOption(avatarSelect, '🦐', animals.GAMBERO);
            this.addAvatarOption(avatarSelect, '🦀', animals.GRANCHIO);
            this.addAvatarOption(avatarSelect, '🐡', animals.PESCE_PALLA);
            this.addAvatarOption(avatarSelect, '🐠', animals.PESCE);
            this.addAvatarOption(avatarSelect, '🐟', animals.PESCE);
            this.addAvatarOption(avatarSelect, '🐬', animals.DELFINO);
            this.addAvatarOption(avatarSelect, '🐳', animals.BALENA);
            this.addAvatarOption(avatarSelect, '🦈', animals.SQUALO);
            this.addAvatarOption(avatarSelect, '🐊', animals.COCCODRILLO);
            this.addAvatarOption(avatarSelect, '🐅', animals.TIGRE);
            this.addAvatarOption(avatarSelect, '🐆', animals.LEOPARDO);
            this.addAvatarOption(avatarSelect, '🦓', animals.ZEBRA);
            this.addAvatarOption(avatarSelect, '🦍', animals.GORILLA);
            this.addAvatarOption(avatarSelect, '🦧', animals.ORANGUTAN);
            this.addAvatarOption(avatarSelect, '🐘', animals.ELEFANTE);
            this.addAvatarOption(avatarSelect, '🦛', animals.IPPOPOTAMO);
            this.addAvatarOption(avatarSelect, '🦏', animals.RINOCERONTE);
            this.addAvatarOption(avatarSelect, '🐪', animals.CAMMELLO);
            this.addAvatarOption(avatarSelect, '🐫', animals.DROMEDARIO);
            this.addAvatarOption(avatarSelect, '🦒', animals.GIRAFFA);
            this.addAvatarOption(avatarSelect, '🦘', animals.CANGURO);
            this.addAvatarOption(avatarSelect, '🐃', animals.BUFALO);
            this.addAvatarOption(avatarSelect, '🐂', animals.TORO);
            this.addAvatarOption(avatarSelect, '🐄', animals.MUCCA);
            this.addAvatarOption(avatarSelect, '🐎', animals.CAVALLO);
            this.addAvatarOption(avatarSelect, '🐖', animals.MAIALE);
            this.addAvatarOption(avatarSelect, '🐏', animals.ARIETE);
            this.addAvatarOption(avatarSelect, '🐑', animals.PECORA);
            this.addAvatarOption(avatarSelect, '🦙', animals.LAMA);
            this.addAvatarOption(avatarSelect, '🐐', animals.CAPRA);
            this.addAvatarOption(avatarSelect, '🦌', animals.CERVO);
            this.addAvatarOption(avatarSelect, '🐕', animals.CANE);
            this.addAvatarOption(avatarSelect, '🐩', animals.BARBONCINO);
            this.addAvatarOption(avatarSelect, '🦮', animals.CANE_GUIDA);
            this.addAvatarOption(avatarSelect, '🐕‍🦺', animals.CANE_SERVIZIO);
            this.addAvatarOption(avatarSelect, '🐈', animals.GATTO);
            this.addAvatarOption(avatarSelect, '🐈‍⬛', animals.GATTO_NERO);
            this.addAvatarOption(avatarSelect, '🐓', animals.GALLO);
            this.addAvatarOption(avatarSelect, '🐔', animals.GALLINA);
            this.addAvatarOption(avatarSelect, '🐣', animals.PULCINO);
            this.addAvatarOption(avatarSelect, '🐤', animals.PULCINO);
            this.addAvatarOption(avatarSelect, '🐥', animals.PULCINO);
            this.addAvatarOption(avatarSelect, '🦆', animals.ANATRA);
            this.addAvatarOption(avatarSelect, '🦢', animals.CIGNO);
            this.addAvatarOption(avatarSelect, '🦅', animals.AQUILA);
            this.addAvatarOption(avatarSelect, '🦉', animals.GUFO);
            this.addAvatarOption(avatarSelect, '🦚', animals.PAVONE);
            this.addAvatarOption(avatarSelect, '🦜', animals.PAPPAGALLO);
            this.addAvatarOption(avatarSelect, '🪿', animals.OCA);
            this.addAvatarOption(avatarSelect, '🐧', animals.PINGUINO);
            this.addAvatarOption(avatarSelect, '🕊️', animals.COLOMBA);
            this.addAvatarOption(avatarSelect, '🦇', animals.PIPISTRELLO);
            this.addAvatarOption(avatarSelect, '🐺', animals.LUPO);
            this.addAvatarOption(avatarSelect, '🦔', animals.RICCIO);
            this.addAvatarOption(avatarSelect, '🦝', animals.PROCIONE);
            this.addAvatarOption(avatarSelect, '🐿️', animals.SCOIATTOLO);
        }

        // Add Food & Drinks section
        if (categories.FOOD_DRINKS) {
            const food = categories.FOOD_DRINKS;
            this.addAvatarOption(avatarSelect, '🍎', food.MELA);
            this.addAvatarOption(avatarSelect, '🍊', food.ARANCIA);
            this.addAvatarOption(avatarSelect, '🍌', food.BANANA);
            this.addAvatarOption(avatarSelect, '🍓', food.FRAGOLA);
            this.addAvatarOption(avatarSelect, '🫐', food.MIRTILLI);
            this.addAvatarOption(avatarSelect, '🍇', food.UVA);
            this.addAvatarOption(avatarSelect, '🥝', food.KIWI);
            this.addAvatarOption(avatarSelect, '🍉', food.ANGURIA);
            this.addAvatarOption(avatarSelect, '🍑', food.CILIEGIE);
            this.addAvatarOption(avatarSelect, '🍒', food.CILIEGIA);
            this.addAvatarOption(avatarSelect, '🥭', food.MANGO);
            this.addAvatarOption(avatarSelect, '🍍', food.ANANAS);
            this.addAvatarOption(avatarSelect, '🥥', food.COCCO);
            this.addAvatarOption(avatarSelect, '🥕', food.CAROTA);
            this.addAvatarOption(avatarSelect, '🌶️', food.PEPERONCINO);
            this.addAvatarOption(avatarSelect, '🫒', food.OLIVA);
            this.addAvatarOption(avatarSelect, '🥑', food.AVOCADO);
            this.addAvatarOption(avatarSelect, '🍆', food.MELANZANA);
            this.addAvatarOption(avatarSelect, '🥔', food.PATATA);
            this.addAvatarOption(avatarSelect, '🥖', food.BAGUETTE);
            this.addAvatarOption(avatarSelect, '🥯', food.BAGEL);
            this.addAvatarOption(avatarSelect, '🧀', food.FORMAGGIO);
            this.addAvatarOption(avatarSelect, '🥩', food.CARNE);
            this.addAvatarOption(avatarSelect, '🥓', food.BACON);
            this.addAvatarOption(avatarSelect, '🍔', food.HAMBURGER);
            this.addAvatarOption(avatarSelect, '🍟', food.PATATINE);
            this.addAvatarOption(avatarSelect, '🍕', food.PIZZA);
            this.addAvatarOption(avatarSelect, '🌭', food.HOT_DOG);
            this.addAvatarOption(avatarSelect, '🥪', food.SANDWICH);
            this.addAvatarOption(avatarSelect, '🌮', food.TACO);
            this.addAvatarOption(avatarSelect, '🌯', food.BURRITO);
            this.addAvatarOption(avatarSelect, '🥗', food.INSALATA);
            this.addAvatarOption(avatarSelect, '🍜', food.RAMEN);
            this.addAvatarOption(avatarSelect, '🍝', food.PASTA);
            this.addAvatarOption(avatarSelect, '🍲', food.STUFATO);
            this.addAvatarOption(avatarSelect, '🍛', food.CURRY);
            this.addAvatarOption(avatarSelect, '🍣', food.SUSHI);
            this.addAvatarOption(avatarSelect, '🍤', food.GAMBERO);
            this.addAvatarOption(avatarSelect, '🍰', food.TORTA);
            this.addAvatarOption(avatarSelect, '🧁', food.CUPCAKE);
            this.addAvatarOption(avatarSelect, '🍭', food.LECCA_LECCA);
            this.addAvatarOption(avatarSelect, '🍬', food.CARAMELLA);
            this.addAvatarOption(avatarSelect, '🍫', food.CIOCCOLATO);
            this.addAvatarOption(avatarSelect, '🍩', food.DONUT);
            this.addAvatarOption(avatarSelect, '🍪', food.BISCOTTO);
            this.addAvatarOption(avatarSelect, '🥛', food.LATTE);
            this.addAvatarOption(avatarSelect, '☕', food.CAFFE);
            this.addAvatarOption(avatarSelect, '🧃', food.SUCCO);
            this.addAvatarOption(avatarSelect, '🥤', food.BIBITA);
            this.addAvatarOption(avatarSelect, '🧋', food.BUBBLE_TEA);
            this.addAvatarOption(avatarSelect, '🍺', food.BIRRA);
            this.addAvatarOption(avatarSelect, '🍷', food.VINO);
            this.addAvatarOption(avatarSelect, '🍸', food.COCKTAIL);
            this.addAvatarOption(avatarSelect, '🍹', food.DRINK);
            this.addAvatarOption(avatarSelect, '🥃', food.WHISKY);
        }

        // Add Objects & Symbols section
        if (categories.OBJECTS_SYMBOLS) {
            const objects = categories.OBJECTS_SYMBOLS;
            this.addAvatarOption(avatarSelect, '💩', objects.CACCA);
            this.addAvatarOption(avatarSelect, '⭐', objects.STELLA);
            this.addAvatarOption(avatarSelect, '🌟', objects.STELLA_BRILLANTE);
            this.addAvatarOption(avatarSelect, '✨', objects.BRILLANTINI);
            this.addAvatarOption(avatarSelect, '💫', objects.COMETA);
            this.addAvatarOption(avatarSelect, '🔥', objects.FUOCO);
            this.addAvatarOption(avatarSelect, '⚡', objects.FULMINE);
            this.addAvatarOption(avatarSelect, '💎', objects.DIAMANTE);
            this.addAvatarOption(avatarSelect, '👑', objects.CORONA);
            this.addAvatarOption(avatarSelect, '🎯', objects.BERSAGLIO);
            this.addAvatarOption(avatarSelect, '🎲', objects.DADO);
            this.addAvatarOption(avatarSelect, '🎮', objects.GAMING);
            this.addAvatarOption(avatarSelect, '🕹️', objects.JOYSTICK);
            this.addAvatarOption(avatarSelect, '🎭', objects.TEATRO);
            this.addAvatarOption(avatarSelect, '🎪', objects.CIRCO);
            this.addAvatarOption(avatarSelect, '🎨', objects.ARTE);
            this.addAvatarOption(avatarSelect, '🎬', objects.CINEMA);
            this.addAvatarOption(avatarSelect, '🎤', objects.MICROFONO);
            this.addAvatarOption(avatarSelect, '🎧', objects.CUFFIE);
            this.addAvatarOption(avatarSelect, '🎵', objects.MUSICA);
            this.addAvatarOption(avatarSelect, '🎶', objects.NOTE);
            this.addAvatarOption(avatarSelect, '🎸', objects.CHITARRA);
            this.addAvatarOption(avatarSelect, '🥁', objects.TAMBURO);
            this.addAvatarOption(avatarSelect, '🎺', objects.TROMBA);
            this.addAvatarOption(avatarSelect, '🎷', objects.SAX);
            this.addAvatarOption(avatarSelect, '🚀', objects.RAZZO);
            this.addAvatarOption(avatarSelect, '🛸', objects.UFO);
            this.addAvatarOption(avatarSelect, '🌈', objects.ARCOBALENO);
            this.addAvatarOption(avatarSelect, '🎈', objects.PALLONCINO);
            this.addAvatarOption(avatarSelect, '🎉', objects.FESTA);
            this.addAvatarOption(avatarSelect, '🎊', objects.CORIANDOLI);
            this.addAvatarOption(avatarSelect, '🎁', objects.REGALO);
            this.addAvatarOption(avatarSelect, '🎀', objects.FIOCCO);
            this.addAvatarOption(avatarSelect, '💝', objects.DONO);
            this.addAvatarOption(avatarSelect, '💖', objects.CUORE_ROSA);
            this.addAvatarOption(avatarSelect, '💕', objects.DUE_CUORI);
            this.addAvatarOption(avatarSelect, '💗', objects.CUORE_CRESCENTE);
            this.addAvatarOption(avatarSelect, '💓', objects.CUORE_BATTENTE);
            this.addAvatarOption(avatarSelect, '💘', objects.CUPIDO);
            this.addAvatarOption(avatarSelect, '❤️', objects.CUORE_ROSSO);
            this.addAvatarOption(avatarSelect, '🧡', objects.CUORE_ARANCIONE);
            this.addAvatarOption(avatarSelect, '💛', objects.CUORE_GIALLO);
            this.addAvatarOption(avatarSelect, '💚', objects.CUORE_VERDE);
            this.addAvatarOption(avatarSelect, '💙', objects.CUORE_BLU);
            this.addAvatarOption(avatarSelect, '💜', objects.CUORE_VIOLA);
            this.addAvatarOption(avatarSelect, '🖤', objects.CUORE_NERO);
            this.addAvatarOption(avatarSelect, '🤍', objects.CUORE_BIANCO);
            this.addAvatarOption(avatarSelect, '🤎', objects.CUORE_MARRONE);
        }

        // Restore selection if it still exists
        if (currentValue && avatarSelect.querySelector(`option[value="${currentValue}"]`)) {
            avatarSelect.value = currentValue;
        } else if (avatarSelect.options.length > 0) {
            // Select first option if current value doesn't exist
            avatarSelect.value = avatarSelect.options[0].value;
        }
    }

    // Helper method to add avatar option
    addAvatarOption(select, emoji, label) {
        if (label) {
            const option = document.createElement('option');
            option.value = emoji;
            option.textContent = `${emoji} ${label}`;
            select.appendChild(option);
        }
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