// ===== MATCH MANAGER =====
// Gestisce tutte le operazioni CRUD sulle partite: creazione, modifica, eliminazione, visualizzazione

class MatchManager {
    constructor(storageManager, avatarManager, onDataChange = null) {
        this.storageManager = storageManager;
        this.avatarManager = avatarManager;
        this.onDataChange = onDataChange; // Callback chiamato quando i dati cambiano
        this.matches = [];
        this.players = []; // Necessari per validazioni e display
        this.games = [];   // Necessari per display partite
    }

    /**
     * Imposta i dati delle partite, giocatori e giochi
     * @param {Array} matches - Array delle partite
     * @param {Array} players - Array dei giocatori
     * @param {Array} games - Array dei giochi
     */
    setData(matches, players, games) {
        this.matches = matches || [];
        this.players = players || [];
        this.games = games || [];
    }

    /**
     * Mostra il modal per aggiungere una nuova partita
     */
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
        const editIdField = document.getElementById('match-edit-id');
        if (editIdField) editIdField.value = '';
        
        // Populate games dropdown
        const gameSelect = document.getElementById('match-game');
        if (gameSelect) {
            gameSelect.innerHTML = '<option value="">Seleziona un gioco...</option>' +
                this.games.map(game => `<option value="${game.id}">${game.name}</option>`).join('');
        }
        
        // Clear participants
        const participantsContainer = document.getElementById('match-participants');
        if (participantsContainer) {
            participantsContainer.innerHTML = '';
        }
        
        // Add first two participants
        this.addParticipant();
        this.addParticipant();
        
        // Update modal title and button
        this.updateModalElements('Registra Partita', 'Registra Partita');
        
        Utils.showModal('addMatchModal');
    }

    /**
     * Aggiunge un partecipante al form della partita
     */
    addParticipant() {
        const container = document.getElementById('match-participants');
        if (!container) {
            console.warn('Container match-participants non trovato');
            return;
        }
        
        const participantCount = container.children.length;
        
        const participantDiv = document.createElement('div');
        participantDiv.innerHTML = HtmlBuilder.createParticipantSelector(this.players, null, null, participantCount);
        
        container.appendChild(participantDiv.firstElementChild);
    }

    /**
     * Aggiunge una nuova partita
     * @returns {boolean} - True se l'aggiunta è riuscita
     */
    addMatch() {
        const gameId = parseInt(document.getElementById('match-game')?.value);
        const date = document.getElementById('match-date')?.value;
        const participantRows = document.querySelectorAll('#match-participants .participant-row');
        
        // Validazioni
        if (!gameId) {
            alert(CONSTANTS.MESSAGES.SELECT_GAME);
            return false;
        }
        
        if (!date) {
            alert(CONSTANTS.MESSAGES.SELECT_DATE);
            return false;
        }
        
        const participants = [];
        for (let row of participantRows) {
            const playerSelect = row.querySelector('.col-6 select');
            const positionSelect = row.querySelector('.col-4 select');
            
            const playerId = parseInt(playerSelect?.value);
            const position = positionSelect?.value;
            
            if (!playerId || !position) {
                alert(CONSTANTS.MESSAGES.COMPLETE_PARTICIPANTS);
                return false;
            }
            
            if (participants.some(p => p.playerId === playerId)) {
                alert(CONSTANTS.MESSAGES.NO_DUPLICATE_PLAYERS);
                return false;
            }
            
            participants.push({ playerId, position });
        }
        
        if (participants.length < 2) {
            alert(CONSTANTS.MESSAGES.MIN_PARTICIPANTS);
            return false;
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
        this.saveToStorage();
        this.displayMatches();
        
        Utils.hideModal('addMatchModal');
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('matches', this.matches);
        }
        
        return true;
    }

    /**
     * Mostra il modal per modificare una partita esistente
     * @param {number} matchId - ID della partita da modificare
     */
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
        if (!match) {
            console.error(`Partita con ID ${matchId} non trovata`);
            return;
        }

        // Populate form with existing data
        const editIdField = document.getElementById('match-edit-id');
        if (editIdField) editIdField.value = matchId;
        
        // Populate games dropdown
        const gameSelect = document.getElementById('match-game');
        if (gameSelect) {
            gameSelect.innerHTML = '<option value="">Seleziona un gioco...</option>' +
                this.games.map(game => `<option value="${game.id}">${game.name}</option>`).join('');
            gameSelect.value = match.gameId;
        }
        
        // Set date
        const dateField = document.getElementById('match-date');
        if (dateField) dateField.value = match.date;
        
        // Clear and populate participants
        const participantsContainer = document.getElementById('match-participants');
        if (participantsContainer) {
            participantsContainer.innerHTML = '';
            
            // Add existing participants
            match.participants.forEach(participant => {
                this.addParticipantForEdit(participant.playerId, participant.position);
            });
            
            // Add at least 2 participants if less than 2
            while (participantsContainer.children.length < 2) {
                this.addParticipant();
            }
        }
        
        // Update modal title and button
        this.updateModalElements('Modifica Partita', 'Salva Modifiche');
        
        Utils.showModal('addMatchModal');
    }

    /**
     * Aggiunge un partecipante per la modifica con valori preselezionati
     * @param {number} selectedPlayerId - ID del giocatore selezionato
     * @param {string} selectedPosition - Posizione selezionata
     */
    addParticipantForEdit(selectedPlayerId = null, selectedPosition = null) {
        const container = document.getElementById('match-participants');
        if (!container) {
            console.warn('Container match-participants non trovato');
            return;
        }
        
        const participantCount = container.children.length;
        
        const participantDiv = document.createElement('div');
        participantDiv.innerHTML = HtmlBuilder.createParticipantSelector(this.players, selectedPlayerId, selectedPosition, participantCount);
        
        container.appendChild(participantDiv.firstElementChild);
    }

    /**
     * Salva una partita (nuovo o esistente basato sull'editId)
     */
    saveMatch() {
        const editId = document.getElementById('match-edit-id')?.value;
        
        if (editId) {
            this.editMatch();
        } else {
            this.addMatch();
        }
    }

    /**
     * Modifica una partita esistente
     * @returns {boolean} - True se la modifica è riuscita
     */
    editMatch() {
        const editId = parseInt(document.getElementById('match-edit-id')?.value);
        const gameId = parseInt(document.getElementById('match-game')?.value);
        const date = document.getElementById('match-date')?.value;
        const participantRows = document.querySelectorAll('#match-participants .participant-row');
        
        // Validazioni
        if (!gameId) {
            alert(CONSTANTS.MESSAGES.SELECT_GAME);
            return false;
        }
        
        if (!date) {
            alert(CONSTANTS.MESSAGES.SELECT_DATE);
            return false;
        }
        
        const participants = [];
        for (let row of participantRows) {
            const playerSelect = row.querySelector('.col-6 select');
            const positionSelect = row.querySelector('.col-4 select');
            
            const playerId = parseInt(playerSelect?.value);
            const position = positionSelect?.value;
            
            if (!playerId || !position) {
                alert(CONSTANTS.MESSAGES.COMPLETE_PARTICIPANTS);
                return false;
            }
            
            if (participants.some(p => p.playerId === playerId)) {
                alert(CONSTANTS.MESSAGES.NO_DUPLICATE_PLAYERS);
                return false;
            }
            
            participants.push({ playerId, position });
        }
        
        if (participants.length < 2) {
            alert(CONSTANTS.MESSAGES.MIN_PARTICIPANTS);
            return false;
        }
        
        const matchIndex = this.matches.findIndex(m => m.id === editId);
        if (matchIndex === -1) {
            console.error(`Partita con ID ${editId} non trovata`);
            return false;
        }
        
        // Sort participants by position first, then by name
        const sortedParticipants = this.sortParticipantsByRank(participants);
        
        // Update match data
        this.matches[matchIndex] = {
            ...this.matches[matchIndex],
            gameId,
            date,
            participants: sortedParticipants
        };
        
        this.saveToStorage();
        this.displayMatches();
        
        Utils.hideModal('addMatchModal');
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('matches', this.matches);
        }
        
        return true;
    }

    /**
     * Elimina una partita
     * @param {number} matchId - ID della partita da eliminare
     * @returns {boolean} - True se l'eliminazione è riuscita
     */
    deleteMatch(matchId) {
        if (!Utils.confirmDelete(CONSTANTS.MESSAGES.CONFIRM_DELETE_MATCH)) {
            return false;
        }
        
        this.matches = this.matches.filter(m => m.id !== matchId);
        this.saveToStorage();
        this.displayMatches();
        
        // Notifica il cambiamento dei dati
        if (this.onDataChange) {
            this.onDataChange('matches', this.matches);
        }
        
        return true;
    }

    /**
     * Visualizza la lista delle partite
     */
    displayMatches() {
        const container = document.getElementById('matches-list');
        
        if (!container) {
            console.warn('Container matches-list non trovato');
            return;
        }
        
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
                                            ${player ? this.avatarManager.createAvatar(player.avatar || '😊').outerHTML : ''}
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

    /**
     * Ordina i partecipanti per posizione prima (winner, participant, last), poi per nome
     * @param {Array} participants - Array dei partecipanti
     * @returns {Array} - Array dei partecipanti ordinati
     */
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

    /**
     * Ottiene i punti per una posizione specifica
     * @param {string} position - Posizione ('winner', 'participant', 'last')
     * @returns {number} - Punti assegnati per la posizione
     */
    getPointsForPosition(position) {
        return CONSTANTS.POSITION_POINTS[position] || 0;
    }

    /**
     * Ottiene l'etichetta per una posizione specifica
     * @param {string} position - Posizione ('winner', 'participant', 'last')
     * @returns {string} - Etichetta localizzata della posizione
     */
    getPositionLabel(position) {
        return CONSTANTS.POSITION_LABELS[position] || position;
    }

    /**
     * Ottiene la classe CSS del badge per una posizione specifica
     * @param {string} position - Posizione ('winner', 'participant', 'last')
     * @returns {string} - Classe CSS del badge
     */
    getPositionBadgeClass(position) {
        return CONSTANTS.POSITION_BADGE_CLASSES[position] || 'bg-secondary';
    }

    /**
     * Aggiorna gli elementi del modal (titolo e pulsante)
     * @param {string} title - Titolo del modal
     * @param {string} buttonText - Testo del pulsante
     */
    updateModalElements(title, buttonText) {
        const modalTitle = document.getElementById('match-modal-title');
        const submitBtn = document.getElementById('match-submit-btn');
        
        if (modalTitle) modalTitle.textContent = title;
        if (submitBtn) submitBtn.textContent = buttonText;
    }

    /**
     * Salva i dati nel localStorage
     */
    saveToStorage() {
        if (this.storageManager) {
            this.storageManager.save('matches', this.matches);
        }
    }

    /**
     * Ottiene una partita per ID
     * @param {number} matchId - ID della partita
     * @returns {object|null} - Partita o null se non trovata
     */
    getMatchById(matchId) {
        return this.matches.find(m => m.id === matchId) || null;
    }

    /**
     * Ottiene tutte le partite
     * @returns {Array} - Array delle partite
     */
    getAllMatches() {
        return [...this.matches];
    }

    /**
     * Ottiene il numero totale di partite
     * @returns {number} - Numero di partite
     */
    getMatchCount() {
        return this.matches.length;
    }

    /**
     * Filtra le partite per gioco
     * @param {number} gameId - ID del gioco
     * @returns {Array} - Array delle partite del gioco specificato
     */
    getMatchesByGame(gameId) {
        return this.matches.filter(match => match.gameId === gameId);
    }

    /**
     * Filtra le partite per giocatore
     * @param {number} playerId - ID del giocatore
     * @returns {Array} - Array delle partite con il giocatore specificato
     */
    getMatchesByPlayer(playerId) {
        return this.matches.filter(match => 
            match.participants.some(p => p.playerId === playerId)
        );
    }

    /**
     * Filtra le partite per data
     * @param {string} startDate - Data di inizio (formato YYYY-MM-DD)
     * @param {string} endDate - Data di fine (formato YYYY-MM-DD) 
     * @returns {Array} - Array delle partite nel periodo specificato
     */
    getMatchesByDateRange(startDate, endDate) {
        return this.matches.filter(match => {
            const matchDate = new Date(match.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return matchDate >= start && matchDate <= end;
        });
    }

    /**
     * Ottiene le partite più recenti
     * @param {number} limit - Limite di risultati (default: 10)
     * @returns {Array} - Array delle partite più recenti
     */
    getRecentMatches(limit = 10) {
        return [...this.matches]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    /**
     * Calcola statistiche sulle partite
     * @returns {object} - Oggetto con statistiche aggregate
     */
    getMatchStatistics() {
        const totalMatches = this.matches.length;
        
        if (totalMatches === 0) {
            return {
                totalMatches: 0,
                averageParticipants: 0,
                gamesPlayed: 0,
                playersInvolved: 0
            };
        }

        const totalParticipants = this.matches.reduce((sum, match) => sum + match.participants.length, 0);
        const averageParticipants = Math.round(totalParticipants / totalMatches * 100) / 100;
        
        const uniqueGames = new Set(this.matches.map(m => m.gameId)).size;
        const uniquePlayers = new Set(
            this.matches.flatMap(m => m.participants.map(p => p.playerId))
        ).size;

        return {
            totalMatches,
            averageParticipants,
            gamesPlayed: uniqueGames,
            playersInvolved: uniquePlayers
        };
    }

    /**
     * Ordina le partite per criterio specificato
     * @param {string} sortBy - Criterio di ordinamento ('date', 'game', 'participants')
     * @param {string} order - Ordine ('asc' o 'desc')
     * @returns {Array} - Array delle partite ordinate
     */
    sortMatches(sortBy = 'date', order = 'desc') {
        const sortedMatches = [...this.matches];
        
        const multiplier = order === 'desc' ? -1 : 1;
        
        return sortedMatches.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return multiplier * (new Date(a.date) - new Date(b.date));
                case 'game':
                    const gameA = this.games.find(g => g.id === a.gameId);
                    const gameB = this.games.find(g => g.id === b.gameId);
                    const nameA = gameA ? gameA.name : 'Gioco eliminato';
                    const nameB = gameB ? gameB.name : 'Gioco eliminato';
                    return multiplier * nameA.localeCompare(nameB, 'it');
                case 'participants':
                    return multiplier * (a.participants.length - b.participants.length);
                default:
                    return 0;
            }
        });
    }
} 