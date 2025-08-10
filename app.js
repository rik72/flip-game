// ===== APPLICATION STATE =====
class HallOfFameApp {
    constructor() {
        // Inizializza i manager
        this.storageManager = new StorageManager();
        this.navigationManager = new NavigationManager();
        this.backupManager = new BackupManager(this.storageManager);
        this.avatarManager = new AvatarManager();
        this.languageManager = window.languageManager; // Use the global instance
        
        // Carica i dati dall'archiviazione
        this.players = this.storageManager.load('players') || [];
        this.games = this.storageManager.load('games') || [];
        this.matches = this.storageManager.load('matches') || [];
        
        // Inizializza il StatsManager
        this.statsManager = new StatsManager(this.avatarManager);
        this.statsManager.setData(this.players, this.matches);
        
        // Inizializza il GameManager con callback per i cambiamenti dati e per ottenere i migliori giocatori
        this.gameManager = new GameManager(
            this.storageManager,
            (type, data) => this.onDataChange(type, data),
            () => this.getBestPlayersForGames()
        );
        this.gameManager.setData(this.games, this.matches);
        
        // Inizializza il MatchManager con callback per i cambiamenti dati
        this.matchManager = new MatchManager(
            this.storageManager,
            this.avatarManager,
            (type, data) => this.onDataChange(type, data)
        );
        this.matchManager.setData(this.matches, this.players, this.games);
        
        // Inizializza il PlayerManager con callback per i cambiamenti dati e per ottenere i giochi migliori
        this.playerManager = new PlayerManager(
            this.storageManager, 
            this.avatarManager, 
            (type, data) => this.onDataChange(type, data),
            (playerId) => this.getBestGamesForPlayer(playerId),
            () => this.getRanking('points'),
            () => this.getRanking('performance')
        );
        this.playerManager.setData(this.players, this.matches);
        
        // Configurazione dell'applicazione
        this.currentSortOrder = 'points'; // Default sorting by points
        
        this.init();
    }

    // ===== DATA CHANGE CALLBACK =====
    onDataChange(type, data) {
        // Aggiorna i dati locali quando vengono modificati dai manager
        if (type === 'players') {
            this.players = data;
            this.playerManager.setData(this.players, this.matches);
            this.matchManager.setData(this.matches, this.players, this.games);
            this.statsManager.setData(this.players, this.matches);
        } else if (type === 'games') {
            this.games = data;
            this.gameManager.setData(this.games, this.matches);
            this.matchManager.setData(this.matches, this.players, this.games);
        } else if (type === 'matches') {
            this.matches = data;
            this.playerManager.setData(this.players, this.matches);
            this.gameManager.setData(this.games, this.matches);
            this.matchManager.setData(this.matches, this.players, this.games);
            this.statsManager.setData(this.players, this.matches);
        }
    }

    // ===== STORAGE METHODS (Delegati allo StorageManager) =====
    saveToStorage(key, data) {
        return this.storageManager.save(key, data);
    }

    loadFromStorage(key) {
        return this.storageManager.load(key);
    }

    // ===== INITIALIZATION =====
    init() {
        this.avatarManager.initializeAvatarOptions();
        this.avatarManager.setupEventListeners();
        this.setupEventListeners();
        this.setupNavigationCallbacks();
        this.navigationManager.showSection('podium');
        this.setTodayDate();
    }

    setupNavigationCallbacks() {
        // Registra i callback per ogni sezione
        this.navigationManager.registerSectionCallback('podium', () => {
            this.statsManager.displayPodium();
            this.statsManager.displayFullRanking();
            // Update the sort selector to reflect current sort order
            const sortSelector = document.getElementById('ranking-sort');
            if (sortSelector) {
                sortSelector.value = this.statsManager.getCurrentSortOrder();
            }
        });
        
        this.navigationManager.registerSectionCallback('players', () => {
            this.playerManager.displayPlayers();
        });
        
        this.navigationManager.registerSectionCallback('games', () => {
            this.gameManager.displayGames();
        });
        
        this.navigationManager.registerSectionCallback('matches', () => {
            this.matchManager.displayMatches();
        });
    }

    setupEventListeners() {
        // Event listeners non relativi agli avatar possono essere aggiunti qui
        // Gli avatar sono ora gestiti dall'AvatarManager
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

    // ===== NAVIGATION (Delegato al NavigationManager) =====
    showSection(sectionName, clickedElement = null) {
        return this.navigationManager.showSection(sectionName, clickedElement);
    }

    // ===== AVATAR SYSTEM (Delegato all'AvatarManager) =====
    createAvatar(emoji, size = '') {
        return this.avatarManager.createAvatar(emoji, size);
    }

    updateAvatarPreview() {
        return this.avatarManager.updateAvatarPreview();
    }

    initializeAvatarOptions() {
        return this.avatarManager.initializeAvatarOptions();
    }

    populateAvatarSelect(options) {
        return this.avatarManager.populateAvatarSelect(options);
    }

    filterAvatars(filterText) {
        return this.avatarManager.filterAvatars(filterText);
    }

    showFilteredAvatars() {
        return this.avatarManager.showFilteredAvatars();
    }

    // ===== PLAYER MANAGEMENT (Delegato al PlayerManager) =====
    showAddPlayerModal() {
        return this.playerManager.showAddPlayerModal();
    }

    addPlayer() {
        return this.playerManager.addPlayer();
    }

    showEditPlayerModal(playerId) {
        return this.playerManager.showEditPlayerModal(playerId);
    }

    savePlayer() {
        return this.playerManager.savePlayer();
    }

    editPlayer() {
        return this.playerManager.editPlayer();
    }

    deletePlayer(playerId) {
        return this.playerManager.deletePlayer(playerId);
    }

    displayPlayers() {
        return this.playerManager.displayPlayers();
    }

    // ===== GAME MANAGEMENT (Delegato al GameManager) =====
    showAddGameModal() {
        return this.gameManager.showAddGameModal();
    }

    addGame() {
        return this.gameManager.addGame();
    }

    showEditGameModal(gameId) {
        return this.gameManager.showEditGameModal(gameId);
    }

    saveGame() {
        return this.gameManager.saveGame();
    }

    editGame() {
        return this.gameManager.editGame();
    }

    deleteGame(gameId) {
        return this.gameManager.deleteGame(gameId);
    }

    displayGames() {
        // Calcola i migliori giocatori per ogni gioco
        const bestPlayers = this.getBestPlayersForGames();
        return this.gameManager.displayGames(bestPlayers);
    }

    /**
     * Ottiene i migliori giocatori per tutti i giochi
     * @returns {Array} - Array con i migliori giocatori per ogni gioco
     */
    getBestPlayersForGames() {
        return this.gameManager.getAllGames().map(game => {
            const bestPlayer = this.statsManager.getBestPlayerForGame(game.id, 'points');
            if (bestPlayer) {
                return {
                    gameId: game.id,
                    ...bestPlayer
                };
            }
            return null;
        }).filter(bp => bp !== null);
    }

    /**
     * Ottiene i giochi dove un giocatore è il migliore
     * @param {number} playerId - ID del giocatore
     * @returns {Array} - Array di oggetti con id e nome del gioco
     */
    getBestGamesForPlayer(playerId) {
        const games = this.gameManager.getAllGames();
        return this.statsManager.getGamesWherePlayerIsBest(playerId, games);
    }

    getGameTypeLabel(type) {
        return this.gameManager.getGameTypeLabel(type);
    }

    // ===== MATCH MANAGEMENT (Delegato al MatchManager) =====
    showAddMatchModal() {
        return this.matchManager.showAddMatchModal();
    }

    addParticipant() {
        return this.matchManager.addParticipant();
    }

    addMatch() {
        return this.matchManager.addMatch();
    }

    showEditMatchModal(matchId) {
        return this.matchManager.showEditMatchModal(matchId);
    }

    addParticipantForEdit(selectedPlayerId = null, selectedPosition = null) {
        return this.matchManager.addParticipantForEdit(selectedPlayerId, selectedPosition);
    }

    saveMatch() {
        return this.matchManager.saveMatch();
    }

    editMatch() {
        return this.matchManager.editMatch();
    }

    deleteMatch(matchId) {
        return this.matchManager.deleteMatch(matchId);
    }

    displayMatches() {
        return this.matchManager.displayMatches();
    }

    updateRankingSortOrder(sortBy) {
        this.currentSortOrder = sortBy;
        this.statsManager.setCurrentSortOrder(sortBy);
        this.statsManager.updateRankingSortOrder(sortBy);
    }

    // Sort participants by position first (winner, participant, last), then by name (Delegato al MatchManager)
    sortParticipantsByRank(participants) {
        return this.matchManager.sortParticipantsByRank(participants);
    }

    // ===== RANKING SYSTEM (Delegato allo StatsManager) =====
    calculatePlayerStats(playerId) {
        return this.statsManager.calculatePlayerStats(playerId);
    }

    getRanking(sortBy = 'points') {
        return this.statsManager.getRanking(sortBy);
    }

    displayPodium() {
        return this.statsManager.displayPodium();
    }

    displayFullRanking() {
        return this.statsManager.displayFullRanking();
    }

    getPointsForPosition(position) {
        return this.statsManager.getPointsForPosition(position);
    }

    getPositionLabel(position) {
        return this.statsManager.getPositionLabel(position);
    }

    getPositionBadgeClass(position) {
        return this.statsManager.getPositionBadgeClass(position);
    }

    getPerformanceClass(performance) {
        return this.statsManager.getPerformanceClass(performance);
    }

    // ===== BACKUP/RESTORE FUNCTIONALITY (Delegato al BackupManager) =====
    async exportData() {
        const data = {
            players: this.players,
            games: this.games,
            matches: this.matches
        };
        
        const success = await this.backupManager.exportData(data);
        if (success) {
            alert(CONSTANTS.MESSAGES.BACKUP_EXPORT_SUCCESS);
        }
    }

    showImportModal() {
        this.backupManager.showImportModal();
    }

    async importData() {
        const importedData = await this.backupManager.importData();
        
        if (importedData) {
            // Import data
            this.players = importedData.players;
            this.games = importedData.games;
            this.matches = importedData.matches;

            // Save to localStorage
            this.saveToStorage('players', this.players);
            this.saveToStorage('games', this.games);
            this.saveToStorage('matches', this.matches);

            // Refresh current section
            const currentSection = this.navigationManager.getCurrentSection();
            this.showSection(currentSection);

            // Close modal
            Utils.hideModal('importModal');

            alert(CONSTANTS.MESSAGES.BACKUP_IMPORT_SUCCESS);
        }
    }

    // ===== GAME RANKING FUNCTIONALITY =====
    showGameRankingModal(gameId, gameName) {
        // Set the modal title and game name
        document.getElementById('game-ranking-game-name').textContent = gameName;
        
        // Store the game ID in the modal for later use
        document.getElementById('gameRankingModal').setAttribute('data-game-id', gameId);
        
        // Set the current sort order in the selector
        const sortSelector = document.getElementById('game-ranking-sort');
        if (sortSelector) {
            sortSelector.value = this.statsManager.getCurrentSortOrder();
        }
        
        // Display the game ranking
        this.statsManager.displayGameRanking(gameId, gameName, this.statsManager.getCurrentSortOrder());
        
        // Show the modal
        Utils.showModal('gameRankingModal');
    }

    updateGameRankingSortOrder(sortBy) {
        // Get the current game ID from the modal (we'll need to store it)
        const modal = document.getElementById('gameRankingModal');
        const gameId = modal.getAttribute('data-game-id');
        const gameName = document.getElementById('game-ranking-game-name').textContent;
        
        if (gameId) {
            this.statsManager.displayGameRanking(parseInt(gameId), gameName, sortBy);
        }
    }

    // ===== LANGUAGE FUNCTIONALITY =====
    setLanguage(languageCode) {
        this.languageManager.setLanguage(languageCode);
    }
}

// HallOfFameApp class - now refactored with modular managers
// Uses StorageManager, NavigationManager, BackupManager, AvatarManager, PlayerManager, StatsManager, GameManager, MatchManager, and LanguageManager for better separation of concerns 