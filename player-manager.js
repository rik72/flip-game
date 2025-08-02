// ===== PLAYER MANAGER =====
// Gestisce tutte le operazioni CRUD sui giocatori: creazione, modifica, eliminazione, visualizzazione

class PlayerManager {
    constructor(storageManager, avatarManager, onDataChange = null) {
        this.storageManager = storageManager;
        this.avatarManager = avatarManager;
        this.onDataChange = onDataChange; // Callback chiamato quando i dati cambiano
        this.players = [];
        this.matches = []; // Necessario per calcolare le statistiche
    }

    /**
     * Imposta i dati dei giocatori e delle partite
     * @param {Array} players - Array dei giocatori
     * @param {Array} matches - Array delle partite (per calcolare statistiche)
     */
    setData(players, matches) {
        this.players = players || [];
        this.matches = matches || [];
    }

    /**
     * Mostra il modal per aggiungere un nuovo giocatore
     */
    showAddPlayerModal() {
        ModalManager.setupModal('player', false);
        this.avatarManager.prepareForNewPlayer();
    }

    /**
     * Aggiunge un nuovo giocatore
     * @returns {boolean} - True se l'aggiunta è riuscita
     */
    addPlayer() {
        const name = document.getElementById('player-name')?.value.trim();
        const avatar = this.avatarManager.getSelectedEmoji();
        
        try {
            // Validazione nome
            Utils.validateName(name, this.players, null, 'giocatore');
        } catch (error) {
            alert(error.message);
            return false;
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
        this.saveToStorage();
        this.displayPlayers();
        
        Utils.hideModal('addPlayerModal');
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('players', this.players);
        }
        
        return true;
    }

    /**
     * Mostra il modal per modificare un giocatore esistente
     * @param {number} playerId - ID del giocatore da modificare
     */
    showEditPlayerModal(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            console.error(`Giocatore con ID ${playerId} non trovato`);
            return;
        }

        ModalManager.setupModal('player', true, player);
        this.avatarManager.prepareForEditPlayer(player.avatar);
    }

    /**
     * Salva un giocatore (nuovo o esistente basato sull'editId)
     */
    savePlayer() {
        const editId = document.getElementById('player-edit-id')?.value;
        
        if (editId) {
            this.editPlayer();
        } else {
            this.addPlayer();
        }
    }

    /**
     * Modifica un giocatore esistente
     * @returns {boolean} - True se la modifica è riuscita
     */
    editPlayer() {
        const editId = parseInt(document.getElementById('player-edit-id')?.value);
        const name = document.getElementById('player-name')?.value.trim();
        const avatar = this.avatarManager.getSelectedEmoji();
        
        try {
            // Validazione nome (escludendo il giocatore corrente)
            Utils.validateName(name, this.players, editId, 'giocatore');
        } catch (error) {
            alert(error.message);
            return false;
        }
        
        const playerIndex = this.players.findIndex(p => p.id === editId);
        if (playerIndex === -1) {
            console.error(`Giocatore con ID ${editId} non trovato`);
            return false;
        }
        
        // Update player data (mantiene le statistiche esistenti)
        this.players[playerIndex] = {
            ...this.players[playerIndex],
            name,
            avatar
        };
        
        this.saveToStorage();
        this.displayPlayers();
        
        Utils.hideModal('addPlayerModal');
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('players', this.players);
        }
        
        return true;
    }

    /**
     * Elimina un giocatore
     * @param {number} playerId - ID del giocatore da eliminare
     * @returns {boolean} - True se l'eliminazione è riuscita
     */
    deletePlayer(playerId) {
        if (!Utils.confirmDelete(CONSTANTS.MESSAGES.CONFIRM_DELETE_PLAYER)) {
            return false;
        }
        
        // Rimuovi il giocatore
        this.players = this.players.filter(p => p.id !== playerId);
        
        // Rimuovi le partite del giocatore (se abbiamo accesso ai matches)
        if (this.matches) {
            this.matches = this.matches.filter(m => 
                !m.participants.some(p => p.playerId === playerId)
            );
        }
        
        this.saveToStorage();
        this.displayPlayers();
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('players', this.players);
            if (this.matches) {
                this.onDataChange('matches', this.matches);
            }
        }
        
        return true;
    }

    /**
     * Visualizza la lista dei giocatori
     */
    displayPlayers() {
        const container = document.getElementById('players-list');
        
        if (!container) {
            console.warn('Container players-list non trovato');
            return;
        }
        
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
                            ${this.avatarManager.createAvatar(player.avatar || '😊', 'avatar-large').outerHTML}
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

    /**
     * Calcola le statistiche di un giocatore
     * @param {number} playerId - ID del giocatore
     * @returns {object} - Oggetto con le statistiche
     */
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
            if (participation) {
                const points = this.getPointsForPosition(participation.position);
                totalPoints += points;
                
                if (participation.position === 'winner') {
                    wins++;
                } else if (participation.position === 'participant') {
                    participants++;
                } else if (participation.position === 'last') {
                    lasts++;
                }
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

    /**
     * Ottiene i punti per una posizione
     * @param {string} position - Posizione ('winner', 'participant', 'last')
     * @returns {number} - Punti per la posizione
     */
    getPointsForPosition(position) {
        return CONSTANTS.POSITION_POINTS[position] || 0;
    }

    /**
     * Ottiene la classe CSS per la performance
     * @param {number} performance - Percentuale di performance
     * @returns {string} - Classe CSS
     */
    getPerformanceClass(performance) {
        if (performance >= 80) return 'performance-excellent';
        if (performance >= 60) return 'performance-good';
        if (performance >= 40) return 'performance-average';
        if (performance >= 20) return 'performance-poor';
        return 'performance-very-poor';
    }

    /**
     * Inizializza i tooltip di Bootstrap
     */
    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    /**
     * Salva i dati nel localStorage
     */
    saveToStorage() {
        if (this.storageManager) {
            this.storageManager.save('players', this.players);
            if (this.matches) {
                this.storageManager.save('matches', this.matches);
            }
        }
    }

    /**
     * Ottiene un giocatore per ID
     * @param {number} playerId - ID del giocatore
     * @returns {object|null} - Giocatore o null se non trovato
     */
    getPlayerById(playerId) {
        return this.players.find(p => p.id === playerId) || null;
    }

    /**
     * Ottiene tutti i giocatori
     * @returns {Array} - Array dei giocatori
     */
    getAllPlayers() {
        return [...this.players];
    }

    /**
     * Verifica se un nome di giocatore esiste (escludendo un ID specifico)
     * @param {string} name - Nome da verificare
     * @param {number} excludeId - ID da escludere dal controllo
     * @returns {boolean} - True se il nome esiste
     */
    isPlayerNameExists(name, excludeId = null) {
        return this.players.some(p => 
            p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId
        );
    }

    /**
     * Ottiene il numero totale di giocatori
     * @returns {number} - Numero di giocatori
     */
    getPlayerCount() {
        return this.players.length;
    }

    /**
     * Cerca giocatori per nome
     * @param {string} searchTerm - Termine di ricerca
     * @returns {Array} - Array dei giocatori trovati
     */
    searchPlayers(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        return this.players.filter(player => 
            player.name.toLowerCase().includes(term)
        );
    }

    /**
     * Ordina i giocatori per un criterio specifico
     * @param {string} sortBy - Criterio di ordinamento ('name', 'points', 'performance')
     * @returns {Array} - Array dei giocatori ordinati
     */
    sortPlayers(sortBy = 'name') {
        const playersWithStats = this.players.map(player => ({
            ...player,
            ...this.calculatePlayerStats(player.id)
        }));

        switch (sortBy) {
            case 'points':
                return playersWithStats.sort((a, b) => b.totalPoints - a.totalPoints);
            case 'performance':
                return playersWithStats.sort((a, b) => b.performance - a.performance);
            case 'name':
            default:
                return playersWithStats.sort((a, b) => a.name.localeCompare(b.name, 'it'));
        }
    }
} 