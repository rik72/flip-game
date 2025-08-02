// ===== CONSTANTS =====
const CONSTANTS = {
    MESSAGES: {
        EMPTY_NAME: 'Inserisci il nome del {type}',
        DUPLICATE_NAME: 'Esiste già un {type} con questo nome',
        CONFIRM_DELETE_PLAYER: 'Sei sicuro di voler eliminare questo giocatore? Tutte le sue partite verranno rimosse.',
        CONFIRM_DELETE_GAME: 'Sei sicuro di voler eliminare questo gioco? Tutte le partite associate verranno rimosse.',
        CONFIRM_DELETE_MATCH: 'Sei sicuro di voler eliminare questa partita?',
        MIN_PLAYERS_FOR_MATCH: 'Aggiungi almeno 2 giocatori prima di registrare una partita',
        MIN_GAMES_FOR_MATCH: 'Aggiungi almeno un gioco prima di registrare una partita',
        SELECT_GAME: 'Seleziona un gioco',
        SELECT_DATE: 'Seleziona una data',
        COMPLETE_PARTICIPANTS: 'Completa tutti i dati dei partecipanti',
        NO_DUPLICATE_PLAYERS: 'Un giocatore non può partecipare due volte alla stessa partita',
        MIN_PARTICIPANTS: 'Servono almeno 2 partecipanti',
        BACKUP_EXPORT_SUCCESS: 'Backup esportato con successo!',
        BACKUP_SELECT_FILE: 'Seleziona un file di backup (.hof)',
        BACKUP_INVALID_FILE: 'Il file selezionato non è un file di backup valido (.hof)',
        BACKUP_IMPORT_SUCCESS: 'Backup importato con successo!',
        BACKUP_EXPORT_ERROR: 'Errore durante l\'esportazione del backup.'
    },
    MODAL_TYPES: {
        PLAYER: {
            name: 'giocatore',
            addTitle: 'Aggiungi Giocatore',
            editTitle: 'Modifica Giocatore',
            addButton: 'Aggiungi',
            editButton: 'Salva Modifiche'
        },
        GAME: {
            name: 'gioco',
            addTitle: 'Aggiungi Gioco',
            editTitle: 'Modifica Gioco',
            addButton: 'Aggiungi',
            editButton: 'Salva Modifiche'
        }
    },
    POSITION_POINTS: {
        winner: 2,
        participant: 1,
        last: 0
    },
    GAME_TYPE_LABELS: {
        board: 'Gioco da Tavolo',
        card: 'Gioco di Carte',
        garden: 'Gioco da Giardino',
        sport: 'Sport',
        other: 'Altro'
    },
    POSITION_LABELS: {
        winner: '🏆 Vincitore',
        participant: '🥈 Piazzamento', 
        last: '😞 Ultimo posto'
    },
    POSITION_BADGE_CLASSES: {
        winner: 'bg-warning',
        participant: 'bg-primary',
        last: 'bg-secondary'
    }
};

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
}

// ===== MODAL MANAGER =====
class ModalManager {
    static setupModal(type, isEdit = false, data = null) {
        const modalConfig = CONSTANTS.MODAL_TYPES[type.toUpperCase()];
        const modalId = `add${type.charAt(0).toUpperCase() + type.slice(1)}Modal`;
        
        // Reset edit ID
        document.getElementById(`${type}-edit-id`).value = isEdit && data ? data.id : '';
        
        // Set form values
        if (type === 'player') {
            this.setupPlayerModal(isEdit, data, modalConfig);
        } else if (type === 'game') {
            this.setupGameModal(isEdit, data, modalConfig);
        }
        
        // Update modal title and button
        document.getElementById(`${type}-modal-title`).textContent = 
            isEdit ? modalConfig.editTitle : modalConfig.addTitle;
        document.getElementById(`${type}-submit-btn`).textContent = 
            isEdit ? modalConfig.editButton : modalConfig.addButton;
        
        Utils.showModal(modalId);
    }

    static setupPlayerModal(isEdit, data, modalConfig) {
        const nameField = document.getElementById('player-name');
        const avatarField = document.getElementById('player-avatar');
        const filterField = document.getElementById('avatar-filter');
        
        if (isEdit && data) {
            nameField.value = data.name;
            filterField.value = '';
            avatarField.value = data.avatar || '😊';
        } else {
            nameField.value = '';
            filterField.value = '';
            avatarField.value = '😊';
        }
    }

    static setupGameModal(isEdit, data, modalConfig) {
        const nameField = document.getElementById('game-name');
        const typeField = document.getElementById('game-type');
        
        if (isEdit && data) {
            nameField.value = data.name;
            typeField.value = data.type;
        } else {
            nameField.value = '';
            typeField.value = 'board';
        }
    }
}

// ===== HTML BUILDER HELPERS =====
class HtmlBuilder {
    static createButton(text, className, onClick, icon = null) {
        const iconHtml = icon ? `<i class="bi ${icon}"></i> ` : '';
        return `<button class="btn btn-sm ${className}" onclick="${onClick}">${iconHtml}${text}</button>`;
    }

    static createActionButtons(itemId, itemType) {
        const editButton = this.createButton(
            'Modifica', 
            'btn-primary me-2', 
            `app.showEdit${itemType}Modal(${itemId})`,
            'bi-pencil'
        );
        const deleteButton = this.createButton(
            'Elimina', 
            'btn-danger', 
            `app.delete${itemType}(${itemId})`,
            'bi-trash'
        );
        return editButton + deleteButton;
    }

    static createStatsBadge(icon, value, title = '') {
        const titleAttr = title ? `title="${title}" data-bs-toggle="tooltip" data-bs-placement="top"` : '';
        return `<span ${titleAttr}>${icon} ${value}</span>`;
    }

    static createEmptyStateMessage(message) {
        return `<div class="col-12 text-center"><p class="text-muted">${message}</p></div>`;
    }

    static createParticipantSelector(players, selectedPlayerId = null, selectedPosition = null, participantCount = 0) {
        const playerOptions = players.map(player => 
            `<option value="${player.id}" ${selectedPlayerId === player.id ? 'selected' : ''}>${player.name}</option>`
        ).join('');
        
        const positionOptions = [
            { value: 'winner', label: '🏆 Vincitore (2 punti)', selected: selectedPosition === 'winner' },
            { value: 'participant', label: '🥈 Piazzamento (1 punto)', selected: selectedPosition === 'participant' },
            { value: 'last', label: '😞 Ultimo posto (0 punti)', selected: selectedPosition === 'last' }
        ].map(opt => 
            `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const showDeleteButton = participantCount >= 2 || selectedPlayerId;
        const deleteButton = showDeleteButton ? 
            `<button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()"><i class="bi bi-trash"></i></button>` : '';

        return `
            <div class="participant-row">
                <div class="row w-100">
                    <div class="col-6">
                        <select class="form-select" required>
                            <option value="">Seleziona giocatore...</option>
                            ${playerOptions}
                        </select>
                    </div>
                    <div class="col-4">
                        <select class="form-select" required>
                            <option value="">Posizione...</option>
                            ${positionOptions}
                        </select>
                    </div>
                    <div class="col-2">
                        ${deleteButton}
                    </div>
                </div>
            </div>
        `;
    }
}

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
            <div>Partite: <strong>${stats.gamesPlayed}</strong></div>
            <div>${winsStats} ${participantsStats} ${lastsStats}</div>
        `;
    }
}

// ===== APPLICATION STATE =====
class HallOfFameApp {
    constructor() {
        this.players = this.loadFromStorage('players') || [];
        this.games = this.loadFromStorage('games') || [];
        this.matches = this.loadFromStorage('matches') || [];
        this.allAvatarOptions = []; // Store all avatar options for filtering
        this.currentSortOrder = 'points'; // Default sorting by points
        this.init();
    }

    // ===== STORAGE METHODS =====
    saveToStorage(key, data) {
        localStorage.setItem(`halloffame_${key}`, JSON.stringify(data));
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(`halloffame_${key}`);
        return data ? JSON.parse(data) : null;
    }

    // ===== INITIALIZATION =====
    init() {
        this.initializeAvatarOptions();
        this.setupEventListeners();
        this.updateAvatarPreview();
        this.showSection('podium');
        this.setTodayDate();
    }

    setupEventListeners() {
        // Avatar preview updates
        document.getElementById('player-avatar').addEventListener('change', () => this.updateAvatarPreview());
        
        // Avatar filter functionality
        document.getElementById('avatar-filter').addEventListener('input', (e) => this.filterAvatars(e.target.value));
        document.getElementById('avatar-filter').addEventListener('focus', () => this.showFilteredAvatars());
        
        // Clear filter when modal is hidden
        document.getElementById('addPlayerModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('avatar-filter').value = '';
            this.populateAvatarSelect(this.allAvatarOptions);
        });
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('match-date').value = today;
    }

    initializeTooltips() {
        // Inizializza tutti i tooltip di Bootstrap presenti nella pagina
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // ===== NAVIGATION =====
    showSection(sectionName, clickedElement = null) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.style.display = 'none');
        
        // Show selected section
        document.getElementById(`${sectionName}-section`).style.display = 'block';
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        
        // If clicked from navigation, highlight the active link
        if (clickedElement && clickedElement.classList) {
            clickedElement.classList.add('active');
        } else {
            // Find and activate the correct nav link based on section name
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                if (link.getAttribute('onclick')?.includes(sectionName)) {
                    link.classList.add('active');
                }
            });
        }
        
        // Refresh content based on section
        switch(sectionName) {
            case 'podium':
                this.displayPodium();
                this.displayFullRanking();
                // Update the sort selector to reflect current sort order
                const sortSelector = document.getElementById('ranking-sort');
                if (sortSelector) {
                    sortSelector.value = this.currentSortOrder;
                }
                break;
            case 'players':
                this.displayPlayers();
                break;
            case 'games':
                this.displayGames();
                break;
            case 'matches':
                this.displayMatches();
                break;
        }
    }

    // ===== AVATAR SYSTEM =====
    createAvatar(emoji, size = '') {
        const avatar = document.createElement('span');
        avatar.className = `avatar ${size}`;
        avatar.style.fontSize = size === 'avatar-large' ? '4rem' : size === 'avatar-podium' ? '3rem' : '2rem';
        avatar.textContent = emoji || '😊';
        
        return avatar;
    }

    updateAvatarPreview() {
        const emoji = document.getElementById('player-avatar').value;
        const preview = document.getElementById('avatar-preview');
        
        preview.textContent = emoji;
    }

    // ===== AVATAR FILTERING SYSTEM =====
    initializeAvatarOptions() {
        const avatarSelect = document.getElementById('player-avatar');
        
        // Get all existing options from the HTML
        this.allAvatarOptions = Array.from(avatarSelect.options).map(option => ({
            value: option.value,
            text: option.textContent
        }));
        
        // Store the original selected value
        const originalValue = avatarSelect.value || '😊';
        
        // Set up the initial display
        this.populateAvatarSelect(this.allAvatarOptions);
        avatarSelect.value = originalValue;
    }

    populateAvatarSelect(options) {
        const avatarSelect = document.getElementById('player-avatar');
        const currentValue = avatarSelect.value;
        
        // Clear existing options
        avatarSelect.innerHTML = '';
        
        // Add filtered options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            avatarSelect.appendChild(optionElement);
        });
        
        // Restore selection if the value still exists in filtered options
        if (options.some(opt => opt.value === currentValue)) {
            avatarSelect.value = currentValue;
        } else if (options.length > 0) {
            // If current value doesn't exist in filtered options, select the first one
            avatarSelect.value = options[0].value;
            this.updateAvatarPreview();
        }
    }

    filterAvatars(filterText) {
        const normalizedFilter = filterText.toLowerCase().trim();
        
        if (normalizedFilter === '') {
            // Show all options when filter is empty
            this.populateAvatarSelect(this.allAvatarOptions);
        } else {
            // Filter options based on text content
            const filteredOptions = this.allAvatarOptions.filter(option => 
                option.text.toLowerCase().includes(normalizedFilter)
            );
            this.populateAvatarSelect(filteredOptions);
            
            // Auto-select first result if available and nothing is currently selected
            const avatarSelect = document.getElementById('player-avatar');
            if (filteredOptions.length > 0 && !avatarSelect.value) {
                avatarSelect.value = filteredOptions[0].value;
                this.updateAvatarPreview();
            }
        }
    }

    showFilteredAvatars() {
        // Ensure the select shows the current filter when focused
        const filterText = document.getElementById('avatar-filter').value;
        this.filterAvatars(filterText);
    }

    // ===== PLAYER MANAGEMENT =====
    showAddPlayerModal() {
        ModalManager.setupModal('player', false);
        this.populateAvatarSelect(this.allAvatarOptions);
        this.updateAvatarPreview();
    }

    addPlayer() {
        const name = document.getElementById('player-name').value.trim();
        const avatar = document.getElementById('player-avatar').value;
        
        try {
            Utils.validateName(name, this.players, null, 'giocatore');
        } catch (error) {
            alert(error.message);
            return;
        }
        
        const player = {
            id: Date.now(),
            name,
            avatar,
            totalPoints: 0,
            gamesPlayed: 0,
            wins: 0
        };
        
        this.players.push(player);
        this.saveToStorage('players', this.players);
        this.displayPlayers();
        
        Utils.hideModal('addPlayerModal');
    }

    showEditPlayerModal(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        ModalManager.setupModal('player', true, player);
        this.populateAvatarSelect(this.allAvatarOptions);
        this.updateAvatarPreview();
    }

    savePlayer() {
        const editId = document.getElementById('player-edit-id').value;
        
        if (editId) {
            this.editPlayer();
        } else {
            this.addPlayer();
        }
    }

    editPlayer() {
        const editId = parseInt(document.getElementById('player-edit-id').value);
        const name = document.getElementById('player-name').value.trim();
        const avatar = document.getElementById('player-avatar').value;
        
        try {
            Utils.validateName(name, this.players, editId, 'giocatore');
        } catch (error) {
            alert(error.message);
            return;
        }
        
        const playerIndex = this.players.findIndex(p => p.id === editId);
        if (playerIndex === -1) return;
        
        // Update player data
        this.players[playerIndex] = {
            ...this.players[playerIndex],
            name,
            avatar
        };
        
        this.saveToStorage('players', this.players);
        this.displayPlayers();
        
        Utils.hideModal('addPlayerModal');
    }

    deletePlayer(playerId) {
        if (Utils.confirmDelete(CONSTANTS.MESSAGES.CONFIRM_DELETE_PLAYER)) {
            this.players = this.players.filter(p => p.id !== playerId);
            this.matches = this.matches.filter(m => !m.participants.some(p => p.playerId === playerId));
            this.saveToStorage('players', this.players);
            this.saveToStorage('matches', this.matches);
            this.displayPlayers();
        }
    }

    displayPlayers() {
        const container = document.getElementById('players-list');
        
        if (this.players.length === 0) {
            DisplayManager.renderEmptyState(container, 'Nessun giocatore aggiunto. Inizia aggiungendo i primi giocatori!');
            return;
        }
        
        container.innerHTML = this.players.map(player => {
            const stats = this.calculatePlayerStats(player.id);
            return `
            <div class="col-md-6 col-lg-4">
                <div class="player-card">
                    <div class="player-card-stats">
                        <div class="player-points">
                            <div class="fs-4 fw-bold text-primary">${stats.totalPoints}<span class="points-unit">pt</span></div>
                        </div>
                        <div class="player-avatar-center">
                            ${this.createAvatar(player.avatar || '😊', 'avatar-large').outerHTML}
                        </div>
                        <div class="player-performance">
                            <div class="performance-value ${this.getPerformanceClass(stats.performance)}" title="Performance: Percentuale dei punti vinti sul massimo possibile (2 per ogni partita)" data-bs-toggle="tooltip" data-bs-placement="top">${stats.performance}%</div>
                        </div>
                    </div>
                    <h5 class="mb-2 mt-3">${player.name}</h5>
                    <div class="text-muted small">
                        ${DisplayManager.createStatsDisplay(stats)}
                    </div>
                    <div class="mt-3">
                        ${HtmlBuilder.createActionButtons(player.id, 'Player')}
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        // Inizializza i tooltip di Bootstrap
        this.initializeTooltips();
    }

    // ===== GAME MANAGEMENT =====
    showAddGameModal() {
        ModalManager.setupModal('game', false);
    }

    addGame() {
        const name = document.getElementById('game-name').value.trim();
        const type = document.getElementById('game-type').value;
        
        try {
            Utils.validateName(name, this.games, null, 'gioco');
        } catch (error) {
            alert(error.message);
            return;
        }
        
        const game = {
            id: Date.now(),
            name,
            type
        };
        
        this.games.push(game);
        this.saveToStorage('games', this.games);
        this.displayGames();
        
        Utils.hideModal('addGameModal');
    }

    showEditGameModal(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        ModalManager.setupModal('game', true, game);
    }

    saveGame() {
        const editId = document.getElementById('game-edit-id').value;
        
        if (editId) {
            this.editGame();
        } else {
            this.addGame();
        }
    }

    editGame() {
        const editId = parseInt(document.getElementById('game-edit-id').value);
        const name = document.getElementById('game-name').value.trim();
        const type = document.getElementById('game-type').value;
        
        try {
            Utils.validateName(name, this.games, editId, 'gioco');
        } catch (error) {
            alert(error.message);
            return;
        }
        
        const gameIndex = this.games.findIndex(g => g.id === editId);
        if (gameIndex === -1) return;
        
        // Update game data
        this.games[gameIndex] = {
            ...this.games[gameIndex],
            name,
            type
        };
        
        this.saveToStorage('games', this.games);
        this.displayGames();
        
        Utils.hideModal('addGameModal');
    }

    deleteGame(gameId) {
        if (Utils.confirmDelete(CONSTANTS.MESSAGES.CONFIRM_DELETE_GAME)) {
            this.games = this.games.filter(g => g.id !== gameId);
            this.matches = this.matches.filter(m => m.gameId !== gameId);
            this.saveToStorage('games', this.games);
            this.saveToStorage('matches', this.matches);
            this.displayGames();
        }
    }

    displayGames() {
        const container = document.getElementById('games-list');
        
        if (this.games.length === 0) {
            DisplayManager.renderEmptyState(container, 'Nessun gioco aggiunto. Inizia aggiungendo i primi giochi!');
            return;
        }
        
        const gameIcons = {
            board: 'bi-grid-3x3-gap-fill',
            card: 'bi-suit-spade-fill',
            garden: 'bi-tree-fill',
            sport: 'bi-dribbble',
            other: 'bi-controller'
        };
        
        container.innerHTML = this.games.map(game => `
            <div class="col-md-6 col-lg-4">
                <div class="game-card">
                    <div class="game-icon ${game.type}">
                        <i class="bi ${gameIcons[game.type]}"></i>
                    </div>
                    <h5 class="mb-2">${game.name}</h5>
                    <p class="text-muted small mb-3">${this.getGameTypeLabel(game.type)}</p>
                    <div class="text-muted small mb-3">
                        Partite giocate: <strong>${this.matches.filter(m => m.gameId === game.id).length}</strong>
                    </div>
                    ${HtmlBuilder.createActionButtons(game.id, 'Game')}
                </div>
            </div>
        `).join('');
    }

    getGameTypeLabel(type) {
        return CONSTANTS.GAME_TYPE_LABELS[type] || 'Altro';
    }

    // ===== MATCH MANAGEMENT =====
    showAddMatchModal() {
        if (this.players.length < 2) {
            alert(CONSTANTS.MESSAGES.MIN_PLAYERS_FOR_MATCH);
            return;
        }
        
        if (this.games.length === 0) {
            alert(CONSTANTS.MESSAGES.MIN_GAMES_FOR_MATCH);
            return;
        }
        
        // Reset form for adding new match
        document.getElementById('match-edit-id').value = '';
        
        // Populate games dropdown
        const gameSelect = document.getElementById('match-game');
        gameSelect.innerHTML = '<option value="">Seleziona un gioco...</option>' +
            this.games.map(game => `<option value="${game.id}">${game.name}</option>`).join('');
        
        // Clear participants
        document.getElementById('match-participants').innerHTML = '';
        
        // Add first two participants
        this.addParticipant();
        this.addParticipant();
        
        // Update modal title and button
        document.getElementById('match-modal-title').textContent = 'Registra Partita';
        document.getElementById('match-submit-btn').textContent = 'Registra Partita';
        
        Utils.showModal('addMatchModal');
    }

    addParticipant() {
        const container = document.getElementById('match-participants');
        const participantCount = container.children.length;
        
        const participantDiv = document.createElement('div');
        participantDiv.innerHTML = HtmlBuilder.createParticipantSelector(this.players, null, null, participantCount);
        
        container.appendChild(participantDiv.firstElementChild);
    }

    addMatch() {
        const gameId = parseInt(document.getElementById('match-game').value);
        const date = document.getElementById('match-date').value;
        const participantRows = document.querySelectorAll('#match-participants .participant-row');
        
        if (!gameId) {
            alert(CONSTANTS.MESSAGES.SELECT_GAME);
            return;
        }
        
        if (!date) {
            alert(CONSTANTS.MESSAGES.SELECT_DATE);
            return;
        }
        
        const participants = [];
        for (let row of participantRows) {
            const playerSelect = row.querySelector('.col-6 select');
            const positionSelect = row.querySelector('.col-4 select');
            
            const playerId = parseInt(playerSelect.value);
            const position = positionSelect.value;
            
            if (!playerId || !position) {
                alert(CONSTANTS.MESSAGES.COMPLETE_PARTICIPANTS);
                return;
            }
            
            if (participants.some(p => p.playerId === playerId)) {
                alert(CONSTANTS.MESSAGES.NO_DUPLICATE_PLAYERS);
                return;
            }
            
            participants.push({ playerId, position });
        }
        
        if (participants.length < 2) {
            alert(CONSTANTS.MESSAGES.MIN_PARTICIPANTS);
            return;
        }
        
        // Sort participants by position first, then by name
        const sortedParticipants = this.sortParticipantsByRank(participants);
        
        const match = {
            id: Date.now(),
            gameId,
            date,
            participants: sortedParticipants
        };
        
        this.matches.push(match);
        this.saveToStorage('matches', this.matches);
        this.displayMatches();
        
        Utils.hideModal('addMatchModal');
    }

    showEditMatchModal(matchId) {
        if (this.players.length < 2) {
            alert(CONSTANTS.MESSAGES.MIN_PLAYERS_FOR_MATCH);
            return;
        }
        
        if (this.games.length === 0) {
            alert(CONSTANTS.MESSAGES.MIN_GAMES_FOR_MATCH);
            return;
        }

        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;

        // Populate form with existing data
        document.getElementById('match-edit-id').value = matchId;
        
        // Populate games dropdown
        const gameSelect = document.getElementById('match-game');
        gameSelect.innerHTML = '<option value="">Seleziona un gioco...</option>' +
            this.games.map(game => `<option value="${game.id}">${game.name}</option>`).join('');
        gameSelect.value = match.gameId;
        
        // Set date
        document.getElementById('match-date').value = match.date;
        
        // Clear and populate participants
        const participantsContainer = document.getElementById('match-participants');
        participantsContainer.innerHTML = '';
        
        // Add existing participants
        match.participants.forEach(participant => {
            this.addParticipantForEdit(participant.playerId, participant.position);
        });
        
        // Add at least 2 participants if less than 2
        while (participantsContainer.children.length < 2) {
            this.addParticipant();
        }
        
        // Update modal title and button
        document.getElementById('match-modal-title').textContent = 'Modifica Partita';
        document.getElementById('match-submit-btn').textContent = 'Salva Modifiche';
        
        Utils.showModal('addMatchModal');
    }

    addParticipantForEdit(selectedPlayerId = null, selectedPosition = null) {
        const container = document.getElementById('match-participants');
        const participantCount = container.children.length;
        
        const participantDiv = document.createElement('div');
        participantDiv.innerHTML = HtmlBuilder.createParticipantSelector(this.players, selectedPlayerId, selectedPosition, participantCount);
        
        container.appendChild(participantDiv.firstElementChild);
    }

    saveMatch() {
        const editId = document.getElementById('match-edit-id').value;
        
        if (editId) {
            this.editMatch();
        } else {
            this.addMatch();
        }
    }

    editMatch() {
        const editId = parseInt(document.getElementById('match-edit-id').value);
        const gameId = parseInt(document.getElementById('match-game').value);
        const date = document.getElementById('match-date').value;
        const participantRows = document.querySelectorAll('#match-participants .participant-row');
        
        if (!gameId) {
            alert(CONSTANTS.MESSAGES.SELECT_GAME);
            return;
        }
        
        if (!date) {
            alert(CONSTANTS.MESSAGES.SELECT_DATE);
            return;
        }
        
        const participants = [];
        for (let row of participantRows) {
            const playerSelect = row.querySelector('.col-6 select');
            const positionSelect = row.querySelector('.col-4 select');
            
            const playerId = parseInt(playerSelect.value);
            const position = positionSelect.value;
            
            if (!playerId || !position) {
                alert(CONSTANTS.MESSAGES.COMPLETE_PARTICIPANTS);
                return;
            }
            
            if (participants.some(p => p.playerId === playerId)) {
                alert(CONSTANTS.MESSAGES.NO_DUPLICATE_PLAYERS);
                return;
            }
            
            participants.push({ playerId, position });
        }
        
        if (participants.length < 2) {
            alert(CONSTANTS.MESSAGES.MIN_PARTICIPANTS);
            return;
        }
        
        const matchIndex = this.matches.findIndex(m => m.id === editId);
        if (matchIndex === -1) return;
        
        // Sort participants by position first, then by name
        const sortedParticipants = this.sortParticipantsByRank(participants);
        
        // Update match data
        this.matches[matchIndex] = {
            ...this.matches[matchIndex],
            gameId,
            date,
            participants: sortedParticipants
        };
        
        this.saveToStorage('matches', this.matches);
        this.displayMatches();
        
        Utils.hideModal('addMatchModal');
    }

    deleteMatch(matchId) {
        if (Utils.confirmDelete(CONSTANTS.MESSAGES.CONFIRM_DELETE_MATCH)) {
            this.matches = this.matches.filter(m => m.id !== matchId);
            this.saveToStorage('matches', this.matches);
            this.displayMatches();
        }
    }

    displayMatches() {
        const container = document.getElementById('matches-list');
        
        if (this.matches.length === 0) {
            DisplayManager.renderEmptyState(container, 'Nessuna partita registrata. Inizia registrando le prime partite!');
            return;
        }
        
        // Sort matches by date (newest first)
        const sortedMatches = [...this.matches].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = `<div class="row">${sortedMatches.map(match => {
            const game = this.games.find(g => g.id === match.gameId);
            return `
                <div class="col-lg-4 col-md-6 col-12">
                    <div class="match-card">
                        <div class="match-header d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="mb-1">${game ? game.name : 'Gioco eliminato'}</h5>
                                <small class="text-muted">${new Date(match.date).toLocaleDateString('it-IT')}</small>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    Azioni
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="app.showEditMatchModal(${match.id})">
                                        <i class="bi bi-pencil me-2"></i>Modifica
                                    </a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="app.deleteMatch(${match.id})">
                                        <i class="bi bi-trash me-2"></i>Elimina
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="participants">
                            ${match.participants.map(p => {
                                const player = this.players.find(pl => pl.id === p.playerId);
                                const points = this.getPointsForPosition(p.position);
                                return `
                                    <div class="participant-item">
                                        <div class="d-flex align-items-center">
                                            ${player ? this.createAvatar(player.avatar || '😊').outerHTML : ''}
                                            <span class="ms-2 flex-grow-1">${player ? player.name : 'Giocatore eliminato'}</span>
                                        </div>
                                        <span class="badge ${this.getPositionBadgeClass(p.position)}">
                                            ${this.getPositionLabel(p.position)} (+${points} pt)
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('')}</div>`;
    }

    getPointsForPosition(position) {
        return CONSTANTS.POSITION_POINTS[position] || 0;
    }

    getPositionLabel(position) {
        return CONSTANTS.POSITION_LABELS[position] || position;
    }

    getPositionBadgeClass(position) {
        return CONSTANTS.POSITION_BADGE_CLASSES[position] || 'bg-secondary';
    }

    getPerformanceClass(performance) {
        if (performance >= 80) return 'performance-excellent';
        if (performance >= 60) return 'performance-good';
        if (performance >= 40) return 'performance-average';
        if (performance >= 20) return 'performance-poor';
        return 'performance-very-poor';
    }

    updateRankingSortOrder(sortBy) {
        this.currentSortOrder = sortBy;
        this.displayPodium();
        this.displayFullRanking();
    }

    // Sort participants by position first (winner, participant, last), then by name
    sortParticipantsByRank(participants) {
        const positionOrder = {
            'winner': 1,
            'participant': 2,
            'last': 3
        };
        
        return participants.sort((a, b) => {
            // First sort by position
            const positionDiff = positionOrder[a.position] - positionOrder[b.position];
            if (positionDiff !== 0) return positionDiff;
            
            // Then sort by player name
            const playerA = this.players.find(p => p.id === a.playerId);
            const playerB = this.players.find(p => p.id === b.playerId);
            const nameA = playerA ? playerA.name : 'Giocatore eliminato';
            const nameB = playerB ? playerB.name : 'Giocatore eliminato';
            
            return nameA.localeCompare(nameB, 'it', { sensitivity: 'base' });
        });
    }

    // ===== RANKING SYSTEM =====
    calculatePlayerStats(playerId) {
        const playerMatches = this.matches.filter(m => 
            m.participants.some(p => p.playerId === playerId)
        );
        
        let totalPoints = 0;
        let wins = 0;
        let participants = 0;
        let lasts = 0;
        
        playerMatches.forEach(match => {
            const participation = match.participants.find(p => p.playerId === playerId);
            const points = this.getPointsForPosition(participation.position);
            totalPoints += points;
            
            if (participation.position === 'winner') {
                wins++;
            } else if (participation.position === 'participant') {
                participants++;
            } else if (participation.position === 'last') {
                lasts++;
            }
        });
        
        // Calcola la performance come percentuale dei punti vinti sul massimo possibile (2 per ogni partita)
        const maxPossiblePoints = playerMatches.length * 2;
        const performance = maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100) : 0;
        
        return {
            totalPoints,
            gamesPlayed: playerMatches.length,
            wins,
            participants,
            lasts,
            performance
        };
    }

    getRanking(sortBy = 'points') {
        return this.players.map(player => ({
            ...player,
            ...this.calculatePlayerStats(player.id)
        })).sort((a, b) => {
            if (sortBy === 'performance') {
                // Sort by performance (descending), then by total points (descending), then by wins (descending)
                if (b.performance !== a.performance) return b.performance - a.performance;
                if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                if (b.wins !== a.wins) return b.wins - a.wins;
                return a.gamesPlayed - b.gamesPlayed;
            } else {
                // Sort by total points (descending), then by wins (descending), then by games played (ascending)
                if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                if (b.wins !== a.wins) return b.wins - a.wins;
                return a.gamesPlayed - b.gamesPlayed;
            }
        });
    }

    displayPodium() {
        const container = document.getElementById('podium-container');
        const ranking = this.getRanking(this.currentSortOrder);
        
        if (ranking.length === 0) {
            container.innerHTML = `
                <div class="text-center">
                    <h3 class="text-muted">Il podio è ancora vuoto!</h3>
                    <p class="text-muted">Aggiungi giocatori e registra le prime partite per vedere la classifica</p>
                </div>
            `;
            return;
        }
        
        // Create podium container
        const podiumDiv = document.createElement('div');
        podiumDiv.className = 'podium';
        
        // Create podium steps for top 3 players
        ranking.slice(0, 3).forEach((player, index) => {
            // Correct mapping: index 0 = 1st place, index 1 = 2nd place, index 2 = 3rd place
            const positionNumber = index + 1; // 1, 2, 3
            const positionClass = index === 0 ? 'first' : index === 1 ? 'second' : 'third';
            
            const stepDiv = document.createElement('div');
            stepDiv.className = `podium-step ${positionClass}`;
            
            // Position number
            const positionDiv = document.createElement('div');
            positionDiv.className = 'podium-position';
            positionDiv.textContent = positionNumber;
            stepDiv.appendChild(positionDiv);
            
            // Avatar
            const avatar = this.createAvatar(player.avatar || '😊', 'avatar-podium');
            stepDiv.appendChild(avatar);
            
            // Player name
            const nameDiv = document.createElement('div');
            nameDiv.className = 'podium-name';
            nameDiv.textContent = player.name;
            stepDiv.appendChild(nameDiv);
            
            // Score
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'podium-score';
            scoreDiv.innerHTML = `${player.totalPoints}<span class="points-unit">pt</span>`;
            stepDiv.appendChild(scoreDiv);
            
            podiumDiv.appendChild(stepDiv);
        });
        
        container.innerHTML = '';
        container.appendChild(podiumDiv);
    }

    displayFullRanking() {
        const container = document.getElementById('ranking-table');
        const ranking = this.getRanking(this.currentSortOrder);
        
        if (ranking.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nessun giocatore in classifica</p>';
            return;
        }
        
        container.innerHTML = ranking.map((player, index) => `
            <div class="ranking-row">
                <div class="ranking-position pos-${index + 1}">${index + 1}</div>
                <div class="ranking-player">
                    ${this.createAvatar(player.avatar || '😊').outerHTML}
                    <div>
                        <div class="fw-bold">${player.name}</div>
                        <small class="text-muted">${player.gamesPlayed} partite<br><span title="Vittorie" data-bs-toggle="tooltip" data-bs-placement="top">🏆 ${player.wins}</span> <span title="Piazzamenti" data-bs-toggle="tooltip" data-bs-placement="top">🥈 ${player.participants}</span> <span title="Ultimi posti" data-bs-toggle="tooltip" data-bs-placement="top">😞 ${player.lasts}</span></small>
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="fs-4 fw-bold text-primary">${player.totalPoints}<span class="points-unit">pt</span></div>
                </div>
                <div class="ranking-performance">
                    <div class="performance-value ${this.getPerformanceClass(player.performance)}" title="Performance: Percentuale dei punti vinti sul massimo possibile (2 per ogni partita)" data-bs-toggle="tooltip" data-bs-placement="top">${player.performance}%</div>
                </div>
            </div>
        `).join('');
        
        // Inizializza i tooltip di Bootstrap
        this.initializeTooltips();
    }

    // ===== BACKUP/RESTORE FUNCTIONALITY =====
    exportData() {
        try {
            // Collect all Hall of Fame data from localStorage
            const data = {
                players: this.players,
                games: this.games,
                matches: this.matches,
                exportDate: new Date().toISOString(),
                version: "1.0"
            };

            // Create ZIP file
            const zip = new JSZip();
            zip.file("halloffame-backup.json", JSON.stringify(data, null, 2));

            // Generate ZIP and trigger download
            zip.generateAsync({ type: "blob" }).then(content => {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hall-of-fame-backup-${new Date().toISOString().split('T')[0]}.hof`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                alert(CONSTANTS.MESSAGES.BACKUP_EXPORT_SUCCESS);
            }).catch(error => {
                console.error('Errore durante l\'esportazione:', error);
                alert(CONSTANTS.MESSAGES.BACKUP_EXPORT_ERROR);
            });

        } catch (error) {
            console.error('Errore durante l\'esportazione:', error);
            alert(CONSTANTS.MESSAGES.BACKUP_EXPORT_ERROR);
        }
    }

    showImportModal() {
        // Reset file input
        document.getElementById('backup-file').value = '';
        Utils.showModal('importModal');
    }

    importData() {
        const fileInput = document.getElementById('backup-file');
        const file = fileInput.files[0];

        if (!file) {
            alert(CONSTANTS.MESSAGES.BACKUP_SELECT_FILE);
            return;
        }

        if (!file.name.endsWith('.hof')) {
            alert(CONSTANTS.MESSAGES.BACKUP_INVALID_FILE);
            return;
        }

        try {
            // Read and process ZIP file
            JSZip.loadAsync(file).then(zip => {
                const jsonFile = zip.file("halloffame-backup.json");
                
                if (!jsonFile) {
                    throw new Error('File di backup non valido: manca il file JSON');
                }

                return jsonFile.async("string");
            }).then(jsonContent => {
                // Parse JSON data
                const data = JSON.parse(jsonContent);

                // Validate data structure
                if (!data.players || !data.games || !data.matches) {
                    throw new Error('File di backup non valido: struttura dati mancante');
                }

                // Validate data arrays
                if (!Array.isArray(data.players) || !Array.isArray(data.games) || !Array.isArray(data.matches)) {
                    throw new Error('File di backup non valido: formato dati non corretto');
                }

                // Confirm import with user
                const playerCount = data.players.length;
                const gameCount = data.games.length;
                const matchCount = data.matches.length;
                const exportDate = data.exportDate ? new Date(data.exportDate).toLocaleDateString('it-IT') : 'Data sconosciuta';

                const confirmMessage = `Confermi l'importazione del backup del ${exportDate}?\n\nDati nel backup:\n- ${playerCount} giocatori\n- ${gameCount} giochi\n- ${matchCount} partite\n\nTutti i dati attuali verranno sostituiti.`;

                if (confirm(confirmMessage)) {
                    // Import data
                    this.players = data.players;
                    this.games = data.games;
                    this.matches = data.matches;

                    // Save to localStorage
                    this.saveToStorage('players', this.players);
                    this.saveToStorage('games', this.games);
                    this.saveToStorage('matches', this.matches);

                    // Refresh current section
                    const currentSection = document.querySelector('.section[style="display: block;"]')?.id.replace('-section', '') || 'podium';
                    this.showSection(currentSection);

                    // Close modal
                    Utils.hideModal('importModal');

                    alert(CONSTANTS.MESSAGES.BACKUP_IMPORT_SUCCESS);
                }

            }).catch(error => {
                console.error('Errore durante l\'importazione:', error);
                alert('Errore durante l\'importazione del backup: ' + error.message);
            });

        } catch (error) {
            console.error('Errore durante l\'importazione:', error);
            alert('Errore durante l\'importazione del backup: ' + error.message);
        }
    }
}

// ===== GLOBAL FUNCTIONS =====
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new HallOfFameApp();
});

// Global functions for HTML onclick handlers
function showSection(section, element = null) {
    app.showSection(section, element);
}

function showAddPlayerModal() {
    app.showAddPlayerModal();
}

function addPlayer() {
    app.addPlayer();
}

function savePlayer() {
    app.savePlayer();
}

function showAddGameModal() {
    app.showAddGameModal();
}

function addGame() {
    app.addGame();
}

function saveGame() {
    app.saveGame();
}

function showAddMatchModal() {
    app.showAddMatchModal();
}

function addParticipant() {
    app.addParticipant();
}

function addMatch() {
    app.addMatch();
}

function saveMatch() {
    app.saveMatch();
}

function updateRankingSortOrder(sortBy) {
    app.updateRankingSortOrder(sortBy);
} 