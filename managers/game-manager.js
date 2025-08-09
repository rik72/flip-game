// ===== GAME MANAGER =====
// Gestisce tutte le operazioni CRUD sui giochi: creazione, modifica, eliminazione, visualizzazione

class GameManager {
    constructor(storageManager, onDataChange = null, getBestPlayersCallback = null) {
        this.storageManager = storageManager;
        this.onDataChange = onDataChange; // Callback chiamato quando i dati cambiano
        this.getBestPlayersCallback = getBestPlayersCallback; // Callback per ottenere i migliori giocatori
        this.games = [];
        this.matches = []; // Necessario per calcolare statistiche sui giochi
    }

    /**
     * Imposta i dati dei giochi e delle partite
     * @param {Array} games - Array dei giochi
     * @param {Array} matches - Array delle partite (per calcolare statistiche)
     */
    setData(games, matches) {
        this.games = games || [];
        this.matches = matches || [];
    }

    /**
     * Mostra il modal per aggiungere un nuovo gioco
     */
    showAddGameModal() {
        ModalManager.setupModal('game', false);
    }

    /**
     * Aggiunge un nuovo gioco
     * @returns {boolean} - True se l'aggiunta è riuscita
     */
    addGame() {
        const name = document.getElementById('game-name')?.value.trim();
        const type = document.getElementById('game-type')?.value;
        
        try {
            // Validazione nome
            Utils.validateName(name, this.games, null, 'gioco');
        } catch (error) {
            alert(error.message);
            return false;
        }
        
        const game = {
            id: Date.now(),
            name,
            type
        };
        
        this.games.push(game);
        this.saveToStorage();
        this.displayGames();
        
        Utils.hideModal('addGameModal');
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('games', this.games);
        }
        
        return true;
    }

    /**
     * Mostra il modal per modificare un gioco esistente
     * @param {number} gameId - ID del gioco da modificare
     */
    showEditGameModal(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) {
            console.error(`Gioco con ID ${gameId} non trovato`);
            return;
        }

        ModalManager.setupModal('game', true, game);
    }

    /**
     * Salva un gioco (nuovo o esistente basato sull'editId)
     */
    saveGame() {
        const editId = document.getElementById('game-edit-id')?.value;
        
        if (editId) {
            this.editGame();
        } else {
            this.addGame();
        }
    }

    /**
     * Modifica un gioco esistente
     * @returns {boolean} - True se la modifica è riuscita
     */
    editGame() {
        const editId = parseInt(document.getElementById('game-edit-id')?.value);
        const name = document.getElementById('game-name')?.value.trim();
        const type = document.getElementById('game-type')?.value;
        
        try {
            // Validazione nome (escludendo il gioco corrente)
            Utils.validateName(name, this.games, editId, 'gioco');
        } catch (error) {
            alert(error.message);
            return false;
        }
        
        const gameIndex = this.games.findIndex(g => g.id === editId);
        if (gameIndex === -1) {
            console.error(`Gioco con ID ${editId} non trovato`);
            return false;
        }
        
        // Update game data
        this.games[gameIndex] = {
            ...this.games[gameIndex],
            name,
            type
        };
        
        this.saveToStorage();
        this.displayGames();
        
        Utils.hideModal('addGameModal');
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('games', this.games);
        }
        
        return true;
    }

    /**
     * Elimina un gioco
     * @param {number} gameId - ID del gioco da eliminare
     * @returns {boolean} - True se l'eliminazione è riuscita
     */
    deleteGame(gameId) {
        if (!Utils.confirmDelete(CONSTANTS.MESSAGES.CONFIRM_DELETE_GAME)) {
            return false;
        }
        
        // Rimuovi il gioco
        this.games = this.games.filter(g => g.id !== gameId);
        
        // Rimuovi le partite del gioco (cascade delete)
        if (this.matches) {
            this.matches = this.matches.filter(m => m.gameId !== gameId);
        }
        
        this.saveToStorage();
        this.displayGames();
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('games', this.games);
            if (this.matches) {
                this.onDataChange('matches', this.matches);
            }
        }
        
        return true;
    }

    /**
     * Visualizza la lista dei giochi
     * @param {Array} bestPlayers - Array con i migliori giocatori per ogni gioco
     */
    displayGames(bestPlayers = null) {
        const container = document.getElementById('games-list');
        
        if (!container) {
            console.warn('Container games-list non trovato');
            return;
        }
        
        if (this.games.length === 0) {
            DisplayManager.renderEmptyState(container, 'Nessun gioco aggiunto. Inizia aggiungendo i primi giochi!');
            return;
        }
        
        // Se bestPlayers non è fornito, prova a ottenerlo dal callback
        if (!bestPlayers && this.getBestPlayersCallback) {
            bestPlayers = this.getBestPlayersCallback();
        }
        
        const gameIcons = {
            board: 'bi-grid-3x3-gap-fill',
            card: 'bi-suit-spade-fill',
            garden: 'bi-tree-fill',
            sport: 'bi-dribbble',
            other: 'bi-controller'
        };
        
        container.innerHTML = this.games.map(game => {
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card-base game-card">
                        <div class="game-icon ${game.type}">
                            <i class="bi ${gameIcons[game.type]}"></i>
                        </div>
                        <div class="card-header">
                            <h5 class="mb-0">${game.name}</h5>
                            ${HtmlBuilder.createButton(
                                'Classifica',
                                'btn-info btn-sm',
                                `app.showGameRankingModal(${game.id}, '${game.name}')`,
                                'bi-trophy'
                            )}
                        </div>
                        <p class="text-muted small mb-3">${this.getGameTypeLabel(game.type)}</p>
                        <div class="text-muted small mb-3">
                            Partite giocate: <strong>${this.getGameMatchCount(game.id)}</strong>
                        </div>
                        <div class="card-actions">
                            ${HtmlBuilder.createActionButtons(game.id, 'Game')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Crea l'HTML per visualizzare il miglior giocatore di un gioco
     * @param {object} bestPlayer - Dati del miglior giocatore
     * @returns {string} - HTML per il miglior giocatore
     */
    createBestPlayerHtml(bestPlayer) {
        const performanceClass = this.getPerformanceClass(bestPlayer.performance);
        const performanceText = bestPlayer.performance > 0 ? `${bestPlayer.performance}%` : 'N/A';
        
        return `
            <div class="best-player-info mb-3">
                <div class="best-player-label text-muted small mb-1">
                    <i class="bi bi-trophy-fill text-warning me-1"></i>Primo posto:
                </div>
                <div class="best-player-details d-flex align-items-center">
                    <div class="best-player-avatar me-2">
                        ${bestPlayer.avatar}
                    </div>
                    <div class="best-player-stats flex-grow-1">
                        <div class="best-player-name fw-bold">
                            ${bestPlayer.name}
                            <span class="text-muted ms-2">${bestPlayer.totalPoints} pt • ${bestPlayer.wins != 1 ? `${bestPlayer.wins} vittorie` : `${bestPlayer.wins} vittoria`}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Ottiene la classe CSS per la performance
     * @param {number} performance - Percentuale di performance
     * @returns {string} - Classe CSS per la performance
     */
    getPerformanceClass(performance) {
        if (performance >= 80) return 'performance-excellent';
        if (performance >= 60) return 'performance-good';
        if (performance >= 40) return 'performance-average';
        if (performance >= 20) return 'performance-poor';
        return 'performance-very-poor';
    }

    /**
     * Ottiene l'etichetta testuale per un tipo di gioco
     * @param {string} type - Tipo di gioco ('board', 'card', 'garden', 'sport', 'other')
     * @returns {string} - Etichetta localizzata del tipo
     */
    getGameTypeLabel(type) {
        return CONSTANTS.GAME_TYPE_LABELS[type] || 'Altro';
    }

    /**
     * Conta il numero di partite giocate per un gioco specifico
     * @param {number} gameId - ID del gioco
     * @returns {number} - Numero di partite giocate
     */
    getGameMatchCount(gameId) {
        return this.matches.filter(m => m.gameId === gameId).length;
    }

    /**
     * Salva i dati nel localStorage
     */
    saveToStorage() {
        if (this.storageManager) {
            this.storageManager.save('games', this.games);
            if (this.matches) {
                this.storageManager.save('matches', this.matches);
            }
        }
    }

    /**
     * Ottiene un gioco per ID
     * @param {number} gameId - ID del gioco
     * @returns {object|null} - Gioco o null se non trovato
     */
    getGameById(gameId) {
        return this.games.find(g => g.id === gameId) || null;
    }

    /**
     * Ottiene tutti i giochi
     * @returns {Array} - Array dei giochi
     */
    getAllGames() {
        return [...this.games];
    }

    /**
     * Verifica se un nome di gioco esiste (escludendo un ID specifico)
     * @param {string} name - Nome da verificare
     * @param {number} excludeId - ID da escludere dal controllo
     * @returns {boolean} - True se il nome esiste
     */
    isGameNameExists(name, excludeId = null) {
        return this.games.some(g => 
            g.name.toLowerCase() === name.toLowerCase() && g.id !== excludeId
        );
    }

    /**
     * Ottiene il numero totale di giochi
     * @returns {number} - Numero di giochi
     */
    getGameCount() {
        return this.games.length;
    }

    /**
     * Cerca giochi per nome
     * @param {string} searchTerm - Termine di ricerca
     * @returns {Array} - Array dei giochi trovati
     */
    searchGames(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        return this.games.filter(game => 
            game.name.toLowerCase().includes(term)
        );
    }

    /**
     * Filtra giochi per tipo
     * @param {string} gameType - Tipo di gioco ('board', 'card', 'garden', 'sport', 'other')
     * @returns {Array} - Array dei giochi del tipo specificato
     */
    getGamesByType(gameType) {
        return this.games.filter(game => game.type === gameType);
    }

    /**
     * Ottiene statistiche sui tipi di gioco
     * @returns {object} - Oggetto con conteggi per ogni tipo
     */
    getGameTypeStats() {
        const stats = {
            board: 0,
            card: 0,
            garden: 0,
            sport: 0,
            other: 0
        };

        this.games.forEach(game => {
            if (stats.hasOwnProperty(game.type)) {
                stats[game.type]++;
            } else {
                stats.other++;
            }
        });

        return stats;
    }

    /**
     * Ottiene i giochi più giocati
     * @param {number} limit - Limite di risultati (default: 5)
     * @returns {Array} - Array dei giochi ordinati per numero di partite
     */
    getMostPlayedGames(limit = 5) {
        return this.games
            .map(game => ({
                ...game,
                matchCount: this.getGameMatchCount(game.id)
            }))
            .sort((a, b) => b.matchCount - a.matchCount)
            .slice(0, limit);
    }

    /**
     * Ottiene tutti i tipi di gioco disponibili
     * @returns {Array} - Array con le informazioni sui tipi di gioco
     */
    getAvailableGameTypes() {
        return [
            { value: 'board', label: this.getGameTypeLabel('board'), icon: 'bi-grid-3x3-gap-fill' },
            { value: 'card', label: this.getGameTypeLabel('card'), icon: 'bi-suit-spade-fill' },
            { value: 'garden', label: this.getGameTypeLabel('garden'), icon: 'bi-tree-fill' },
            { value: 'sport', label: this.getGameTypeLabel('sport'), icon: 'bi-dribbble' },
            { value: 'other', label: this.getGameTypeLabel('other'), icon: 'bi-controller' }
        ];
    }

    /**
     * Ordina i giochi per un criterio specifico
     * @param {string} sortBy - Criterio di ordinamento ('name', 'type', 'matches')
     * @returns {Array} - Array dei giochi ordinati
     */
    sortGames(sortBy = 'name') {
        switch (sortBy) {
            case 'matches':
                return this.games
                    .map(game => ({
                        ...game,
                        matchCount: this.getGameMatchCount(game.id)
                    }))
                    .sort((a, b) => b.matchCount - a.matchCount);
            case 'type':
                return [...this.games].sort((a, b) => {
                    const labelA = this.getGameTypeLabel(a.type);
                    const labelB = this.getGameTypeLabel(b.type);
                    return labelA.localeCompare(labelB, 'it');
                });
            case 'name':
            default:
                return [...this.games].sort((a, b) => a.name.localeCompare(b.name, 'it'));
        }
    }
} 