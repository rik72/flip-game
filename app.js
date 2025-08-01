// ===== APPLICATION STATE =====
class HallOfFameApp {
    constructor() {
        this.players = this.loadFromStorage('players') || [];
        this.games = this.loadFromStorage('games') || [];
        this.matches = this.loadFromStorage('matches') || [];
        this.allAvatarOptions = []; // Store all avatar options for filtering
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
        // Reset form for adding new player
        document.getElementById('player-edit-id').value = '';
        document.getElementById('player-name').value = '';
        
        // Reset avatar filter
        document.getElementById('avatar-filter').value = '';
        this.populateAvatarSelect(this.allAvatarOptions);
        document.getElementById('player-avatar').value = '😊';
        
        // Update modal title and button
        document.getElementById('player-modal-title').textContent = 'Aggiungi Giocatore';
        document.getElementById('player-submit-btn').textContent = 'Aggiungi';
        
        this.updateAvatarPreview();
        new bootstrap.Modal(document.getElementById('addPlayerModal')).show();
    }

    addPlayer() {
        const name = document.getElementById('player-name').value.trim();
        const avatar = document.getElementById('player-avatar').value;
        
        if (!name) {
            alert('Inserisci il nome del giocatore');
            return;
        }
        
        if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Esiste già un giocatore con questo nome');
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
        
        bootstrap.Modal.getInstance(document.getElementById('addPlayerModal')).hide();
    }

    showEditPlayerModal(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        // Populate form with existing data
        document.getElementById('player-edit-id').value = playerId;
        document.getElementById('player-name').value = player.name;
        
        // Reset avatar filter and set player's avatar
        document.getElementById('avatar-filter').value = '';
        this.populateAvatarSelect(this.allAvatarOptions);
        document.getElementById('player-avatar').value = player.avatar || '😊';
        
        // Update modal title and button
        document.getElementById('player-modal-title').textContent = 'Modifica Giocatore';
        document.getElementById('player-submit-btn').textContent = 'Salva Modifiche';
        
        this.updateAvatarPreview();
        new bootstrap.Modal(document.getElementById('addPlayerModal')).show();
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
        
        if (!name) {
            alert('Inserisci il nome del giocatore');
            return;
        }
        
        // Check if name exists (but allow same name for current player)
        if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== editId)) {
            alert('Esiste già un giocatore con questo nome');
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
        
        bootstrap.Modal.getInstance(document.getElementById('addPlayerModal')).hide();
    }

    deletePlayer(playerId) {
        if (confirm('Sei sicuro di voler eliminare questo giocatore? Tutte le sue partite verranno rimosse.')) {
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
            container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Nessun giocatore aggiunto. Inizia aggiungendo i primi giocatori!</p></div>';
            return;
        }
        
        container.innerHTML = this.players.map(player => `
            <div class="col-md-6 col-lg-4">
                <div class="player-card">
                    <div class="d-flex justify-content-center mb-3">
                        ${this.createAvatar(player.avatar || '😊', 'avatar-large').outerHTML}
                    </div>
                    <h5 class="mb-2">${player.name}</h5>
                    <div class="text-muted small">
                        <div>Punti: <strong>${this.calculatePlayerStats(player.id).totalPoints}</strong></div>
                        <div>Partite: <strong>${this.calculatePlayerStats(player.id).gamesPlayed}</strong></div>
                        <div><span title="Vittorie" data-bs-toggle="tooltip" data-bs-placement="top">🏆 ${this.calculatePlayerStats(player.id).wins}</span> <span title="Piazzamenti" data-bs-toggle="tooltip" data-bs-placement="top">👤 ${this.calculatePlayerStats(player.id).participants}</span> <span title="Ultimi posti" data-bs-toggle="tooltip" data-bs-placement="top">😞 ${this.calculatePlayerStats(player.id).lasts}</span></div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-primary me-2" onclick="app.showEditPlayerModal(${player.id})">
                            <i class="bi bi-pencil"></i> Modifica
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deletePlayer(${player.id})">
                            <i class="bi bi-trash"></i> Elimina
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Inizializza i tooltip di Bootstrap
        this.initializeTooltips();
    }

    // ===== GAME MANAGEMENT =====
    showAddGameModal() {
        // Reset form for adding new game
        document.getElementById('game-edit-id').value = '';
        document.getElementById('game-name').value = '';
        document.getElementById('game-type').value = 'board';
        
        // Update modal title and button
        document.getElementById('game-modal-title').textContent = 'Aggiungi Gioco';
        document.getElementById('game-submit-btn').textContent = 'Aggiungi';
        
        new bootstrap.Modal(document.getElementById('addGameModal')).show();
    }

    addGame() {
        const name = document.getElementById('game-name').value.trim();
        const type = document.getElementById('game-type').value;
        
        if (!name) {
            alert('Inserisci il nome del gioco');
            return;
        }
        
        if (this.games.some(g => g.name.toLowerCase() === name.toLowerCase())) {
            alert('Esiste già un gioco con questo nome');
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
        
        bootstrap.Modal.getInstance(document.getElementById('addGameModal')).hide();
    }

    showEditGameModal(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Populate form with existing data
        document.getElementById('game-edit-id').value = gameId;
        document.getElementById('game-name').value = game.name;
        document.getElementById('game-type').value = game.type;
        
        // Update modal title and button
        document.getElementById('game-modal-title').textContent = 'Modifica Gioco';
        document.getElementById('game-submit-btn').textContent = 'Salva Modifiche';
        
        new bootstrap.Modal(document.getElementById('addGameModal')).show();
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
        
        if (!name) {
            alert('Inserisci il nome del gioco');
            return;
        }
        
        // Check if name exists (but allow same name for current game)
        if (this.games.some(g => g.name.toLowerCase() === name.toLowerCase() && g.id !== editId)) {
            alert('Esiste già un gioco con questo nome');
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
        
        bootstrap.Modal.getInstance(document.getElementById('addGameModal')).hide();
    }

    deleteGame(gameId) {
        if (confirm('Sei sicuro di voler eliminare questo gioco? Tutte le partite associate verranno rimosse.')) {
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
            container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Nessun gioco aggiunto. Inizia aggiungendo i primi giochi!</p></div>';
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
                    <button class="btn btn-sm btn-primary me-2" onclick="app.showEditGameModal(${game.id})">
                        <i class="bi bi-pencil"></i> Modifica
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteGame(${game.id})">
                        <i class="bi bi-trash"></i> Elimina
                    </button>
                </div>
            </div>
        `).join('');
    }

    getGameTypeLabel(type) {
        const labels = {
            board: 'Gioco da Tavolo',
            card: 'Gioco di Carte',
            garden: 'Gioco da Giardino',
            sport: 'Sport',
            other: 'Altro'
        };
        return labels[type] || 'Altro';
    }

    // ===== MATCH MANAGEMENT =====
    showAddMatchModal() {
        if (this.players.length < 2) {
            alert('Aggiungi almeno 2 giocatori prima di registrare una partita');
            return;
        }
        
        if (this.games.length === 0) {
            alert('Aggiungi almeno un gioco prima di registrare una partita');
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
        
        new bootstrap.Modal(document.getElementById('addMatchModal')).show();
    }

    addParticipant() {
        const container = document.getElementById('match-participants');
        const participantCount = container.children.length;
        
        const participantDiv = document.createElement('div');
        participantDiv.className = 'participant-row';
        participantDiv.innerHTML = `
            <div class="row w-100">
                <div class="col-6">
                    <select class="form-select" required>
                        <option value="">Seleziona giocatore...</option>
                        ${this.players.map(player => `<option value="${player.id}">${player.name}</option>`).join('')}
                    </select>
                </div>
                <div class="col-4">
                    <select class="form-select" required>
                        <option value="">Posizione...</option>
                        <option value="winner">🏆 Vincitore (2 punti)</option>
                        <option value="participant">👤 Piazzamento (1 punto)</option>
                        <option value="last">😞 Ultimo posto (0 punti)</option>
                    </select>
                </div>
                <div class="col-2">
                    ${participantCount >= 2 ? `<button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()"><i class="bi bi-trash"></i></button>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(participantDiv);
    }

    addMatch() {
        const gameId = parseInt(document.getElementById('match-game').value);
        const date = document.getElementById('match-date').value;
        const participantRows = document.querySelectorAll('#match-participants .participant-row');
        
        if (!gameId) {
            alert('Seleziona un gioco');
            return;
        }
        
        if (!date) {
            alert('Seleziona una data');
            return;
        }
        
        const participants = [];
        for (let row of participantRows) {
            const playerSelect = row.querySelector('.col-6 select');
            const positionSelect = row.querySelector('.col-4 select');
            
            const playerId = parseInt(playerSelect.value);
            const position = positionSelect.value;
            
            if (!playerId || !position) {
                alert('Completa tutti i dati dei partecipanti');
                return;
            }
            
            if (participants.some(p => p.playerId === playerId)) {
                alert('Un giocatore non può partecipare due volte alla stessa partita');
                return;
            }
            
            participants.push({ playerId, position });
        }
        
        if (participants.length < 2) {
            alert('Servono almeno 2 partecipanti');
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
        
        bootstrap.Modal.getInstance(document.getElementById('addMatchModal')).hide();
    }

    showEditMatchModal(matchId) {
        if (this.players.length < 2) {
            alert('Aggiungi almeno 2 giocatori prima di modificare una partita');
            return;
        }
        
        if (this.games.length === 0) {
            alert('Aggiungi almeno un gioco prima di modificare una partita');
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
        
        new bootstrap.Modal(document.getElementById('addMatchModal')).show();
    }

    addParticipantForEdit(selectedPlayerId = null, selectedPosition = null) {
        const container = document.getElementById('match-participants');
        const participantCount = container.children.length;
        
        const participantDiv = document.createElement('div');
        participantDiv.className = 'participant-row';
        participantDiv.innerHTML = `
            <div class="row w-100">
                <div class="col-6">
                    <select class="form-select" required>
                        <option value="">Seleziona giocatore...</option>
                        ${this.players.map(player => `<option value="${player.id}" ${selectedPlayerId === player.id ? 'selected' : ''}>${player.name}</option>`).join('')}
                    </select>
                </div>
                <div class="col-4">
                    <select class="form-select" required>
                        <option value="">Posizione...</option>
                        <option value="winner" ${selectedPosition === 'winner' ? 'selected' : ''}>🏆 Vincitore (2 punti)</option>
                        <option value="participant" ${selectedPosition === 'participant' ? 'selected' : ''}>👤 Piazzamento (1 punto)</option>
                        <option value="last" ${selectedPosition === 'last' ? 'selected' : ''}>😞 Ultimo posto (0 punti)</option>
                    </select>
                </div>
                <div class="col-2">
                    ${participantCount >= 2 || selectedPlayerId ? `<button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.parentElement.parentElement.remove()"><i class="bi bi-trash"></i></button>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(participantDiv);
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
            alert('Seleziona un gioco');
            return;
        }
        
        if (!date) {
            alert('Seleziona una data');
            return;
        }
        
        const participants = [];
        for (let row of participantRows) {
            const playerSelect = row.querySelector('.col-6 select');
            const positionSelect = row.querySelector('.col-4 select');
            
            const playerId = parseInt(playerSelect.value);
            const position = positionSelect.value;
            
            if (!playerId || !position) {
                alert('Completa tutti i dati dei partecipanti');
                return;
            }
            
            if (participants.some(p => p.playerId === playerId)) {
                alert('Un giocatore non può partecipare due volte alla stessa partita');
                return;
            }
            
            participants.push({ playerId, position });
        }
        
        if (participants.length < 2) {
            alert('Servono almeno 2 partecipanti');
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
        
        bootstrap.Modal.getInstance(document.getElementById('addMatchModal')).hide();
    }

    deleteMatch(matchId) {
        if (confirm('Sei sicuro di voler eliminare questa partita?')) {
            this.matches = this.matches.filter(m => m.id !== matchId);
            this.saveToStorage('matches', this.matches);
            this.displayMatches();
        }
    }

    displayMatches() {
        const container = document.getElementById('matches-list');
        
        if (this.matches.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Nessuna partita registrata. Inizia registrando le prime partite!</p></div>';
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
                                    <i class="bi bi-three-dots"></i>
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
        return position === 'winner' ? 2 : position === 'participant' ? 1 : 0;
    }

    getPositionLabel(position) {
        const labels = {
            winner: '🏆 Vincitore',
            participant: '👤 Piazzamento', 
            last: '😞 Ultimo posto'
        };
        return labels[position] || position;
    }

    getPositionBadgeClass(position) {
        return position === 'winner' ? 'bg-warning' : position === 'participant' ? 'bg-primary' : 'bg-secondary';
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
        
        return {
            totalPoints,
            gamesPlayed: playerMatches.length,
            wins,
            participants,
            lasts
        };
    }

    getRanking() {
        return this.players.map(player => ({
            ...player,
            ...this.calculatePlayerStats(player.id)
        })).sort((a, b) => {
            // Sort by total points (descending), then by wins (descending), then by games played (ascending)
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            if (b.wins !== a.wins) return b.wins - a.wins;
            return a.gamesPlayed - b.gamesPlayed;
        });
    }

    displayPodium() {
        const container = document.getElementById('podium-container');
        const ranking = this.getRanking();
        
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
            scoreDiv.textContent = `${player.totalPoints} punti`;
            stepDiv.appendChild(scoreDiv);
            
            podiumDiv.appendChild(stepDiv);
        });
        
        container.innerHTML = '';
        container.appendChild(podiumDiv);
    }

    displayFullRanking() {
        const container = document.getElementById('ranking-table');
        const ranking = this.getRanking();
        
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
                        <small class="text-muted">${player.gamesPlayed} partite • <span title="Vittorie" data-bs-toggle="tooltip" data-bs-placement="top">🏆 ${player.wins}</span> <span title="Piazzamenti" data-bs-toggle="tooltip" data-bs-placement="top">👤 ${player.participants}</span> <span title="Ultimi posti" data-bs-toggle="tooltip" data-bs-placement="top">😞 ${player.lasts}</span></small>
                    </div>
                </div>
                <div class="ranking-stats">
                    <div class="fs-4 fw-bold text-primary">${player.totalPoints}</div>
                    <small class="text-muted">punti</small>
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
                
                alert('Backup esportato con successo!');
            }).catch(error => {
                console.error('Errore durante l\'esportazione:', error);
                alert('Errore durante l\'esportazione del backup.');
            });

        } catch (error) {
            console.error('Errore durante l\'esportazione:', error);
            alert('Errore durante l\'esportazione del backup.');
        }
    }

    showImportModal() {
        // Reset file input
        document.getElementById('backup-file').value = '';
        new bootstrap.Modal(document.getElementById('importModal')).show();
    }

    importData() {
        const fileInput = document.getElementById('backup-file');
        const file = fileInput.files[0];

        if (!file) {
            alert('Seleziona un file di backup (.hof)');
            return;
        }

        if (!file.name.endsWith('.hof')) {
            alert('Il file selezionato non è un file di backup valido (.hof)');
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
                    bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();

                    alert('Backup importato con successo!');
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