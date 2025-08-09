// ===== STATS MANAGER =====
// Gestisce tutte le statistiche dei giocatori, il ranking e la visualizzazione del podio

class StatsManager {
    constructor(avatarManager) {
        this.avatarManager = avatarManager;
        this.players = [];
        this.matches = [];
        this.currentSortOrder = 'points'; // Default sorting by points
    }

    /**
     * Imposta i dati dei giocatori e delle partite
     * @param {Array} players - Array dei giocatori
     * @param {Array} matches - Array delle partite
     */
    setData(players, matches) {
        this.players = players || [];
        this.matches = matches || [];
    }

    /**
     * Imposta l'ordinamento corrente
     * @param {string} sortOrder - Criterio di ordinamento ('points', 'performance')
     */
    setCurrentSortOrder(sortOrder) {
        this.currentSortOrder = sortOrder;
    }

    /**
     * Ottiene l'ordinamento corrente
     * @returns {string} - Criterio di ordinamento corrente
     */
    getCurrentSortOrder() {
        return this.currentSortOrder;
    }

    /**
     * Calcola le statistiche complete di un giocatore
     * @param {number} playerId - ID del giocatore
     * @returns {object} - Oggetto con tutte le statistiche del giocatore
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
     * Ottiene il ranking completo dei giocatori
     * @param {string} sortBy - Criterio di ordinamento ('points', 'performance')
     * @returns {Array} - Array dei giocatori con statistiche, ordinato
     */
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

    /**
     * Ottiene il ranking dei giocatori per un gioco specifico
     * @param {number} gameId - ID del gioco
     * @param {string} sortBy - Criterio di ordinamento ('points', 'performance')
     * @returns {Array} - Array dei giocatori con statistiche per il gioco specifico, ordinato
     */
    getGameRanking(gameId, sortBy = 'points') {
        const gameMatches = this.matches.filter(m => m.gameId === gameId);
        
        if (gameMatches.length === 0) {
            return [];
        }
        
        // Ottieni tutti i giocatori che hanno giocato questo gioco
        const playersInGame = new Set();
        gameMatches.forEach(match => {
            match.participants.forEach(participant => {
                playersInGame.add(participant.playerId);
            });
        });
        
        // Calcola statistiche per ogni giocatore in questo gioco
        const playersWithStats = Array.from(playersInGame).map(playerId => {
            const player = this.players.find(p => p.id === playerId);
            if (!player) return null;
            
            const stats = this.calculatePlayerStatsForGame(playerId, gameId);
            if (!stats) return null;
            
            return {
                ...player,
                ...stats
            };
        }).filter(player => player !== null);
        
        if (playersWithStats.length === 0) {
            return [];
        }
        
        // Ordina per il criterio specificato
        return playersWithStats.sort((a, b) => {
            if (sortBy === 'performance') {
                if (b.performance !== a.performance) return b.performance - a.performance;
                if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                if (b.wins !== a.wins) return b.wins - a.wins;
                return a.gamesPlayed - b.gamesPlayed;
            } else {
                if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                if (b.wins !== a.wins) return b.wins - a.wins;
                if (b.gamesPlayed !== a.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
                return a.name.localeCompare(b.name);
            }
        });
    }

    /**
     * Visualizza il podio con i primi 3 giocatori
     */
    displayPodium() {
        const container = document.getElementById('podium-container');
        
        if (!container) {
            console.warn('Container podium-container non trovato');
            return;
        }
        
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
            const avatar = this.avatarManager.createAvatar(player.avatar || '😊', 'avatar-podium');
            stepDiv.appendChild(avatar);
            
            // Player name with wrapper for scroll animation
            const nameWrapper = document.createElement('div');
            nameWrapper.className = 'podium-name-wrapper';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'podium-name';
            nameDiv.textContent = player.name;
            
            nameWrapper.appendChild(nameDiv);
            stepDiv.appendChild(nameWrapper);
            
            // Check if name is too long and add animation class
            setTimeout(() => {
                const maxWidth = window.innerWidth <= 768 ? 220 : 140; // Mobile vs Desktop
                const isTextTruncated = nameDiv.scrollWidth > nameDiv.clientWidth;
                
                if (isTextTruncated) {
                    nameDiv.classList.add('long-name');
                }
            }, 500);
            
            // Score
            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'podium-score';
            
            // Show performance percentage when sorting by performance, otherwise show points
            if (this.currentSortOrder === 'performance') {
                scoreDiv.innerHTML = `${player.performance}<span class="points-unit">%</span>`;
            } else {
                scoreDiv.innerHTML = `${player.totalPoints}<span class="points-unit">pt</span>`;
            }
            
            stepDiv.appendChild(scoreDiv);
            
            podiumDiv.appendChild(stepDiv);
        });
        
        container.innerHTML = '';
        container.appendChild(podiumDiv);
    }

    /**
     * Calcola la larghezza del testo in pixel
     * @param {string} text - Il testo da misurare
     * @param {HTMLElement} element - L'elemento per ottenere lo stile
     * @returns {number} - La larghezza in pixel
     */
    getTextWidth(text, element) {
        try {
            // Metodo alternativo: crea un elemento temporaneo per misurare
            const tempElement = document.createElement('span');
            tempElement.style.visibility = 'hidden';
            tempElement.style.position = 'absolute';
            tempElement.style.whiteSpace = 'nowrap';
            tempElement.style.fontSize = window.getComputedStyle(element).fontSize;
            tempElement.style.fontWeight = window.getComputedStyle(element).fontWeight;
            tempElement.style.fontFamily = window.getComputedStyle(element).fontFamily;
            tempElement.textContent = text;
            
            document.body.appendChild(tempElement);
            const width = tempElement.offsetWidth;
            document.body.removeChild(tempElement);
            
            return width;
        } catch (error) {
            console.error('Error measuring text width:', error);
            // Fallback: stima approssimativa
            return text.length * 16; // ~16px per carattere
        }
    }

    /**
     * Visualizza la classifica completa di tutti i giocatori
     */
    displayFullRanking() {
        const container = document.getElementById('ranking-table');
        
        if (!container) {
            console.warn('Container ranking-table non trovato');
            return;
        }
        
        const ranking = this.getRanking(this.currentSortOrder);
        
        if (ranking.length === 0) {
            container.innerHTML = '<p class="my-2 text-center text-muted">Nessun giocatore in classifica</p>';
            return;
        }
        
        container.innerHTML = ranking.map((player, index) => `
            <div class="ranking-row pos-${index + 1}">
                <div class="ranking-position pos-${index + 1}">${index + 1}</div>
                <div class="ranking-player">
                    ${this.avatarManager.createAvatar(player.avatar || '😊').outerHTML}
                    <div class="player-name">${player.name}</div>
                    <div>
                        ${player.gamesPlayed} partite
                    </div>
                    <div>
                        <span title="Vittorie" data-bs-toggle="tooltip" data-bs-placement="top">🏆 ${player.wins}</span>
                        <span title="Piazzamenti" data-bs-toggle="tooltip" data-bs-placement="top">🥈 ${player.participants}</span>
                        <span title="Ultimi posti" data-bs-toggle="tooltip" data-bs-placement="top">😞 ${player.lasts}</span>
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

    /**
     * Visualizza la classifica per un gioco specifico
     * @param {number} gameId - ID del gioco
     * @param {string} gameName - Nome del gioco
     * @param {string} sortBy - Criterio di ordinamento ('points', 'performance')
     */
    displayGameRanking(gameId, gameName, sortBy = 'points') {
        const container = document.getElementById('game-ranking-table');
        
        if (!container) {
            console.warn('Container game-ranking-table non trovato');
            return;
        }
        
        const ranking = this.getGameRanking(gameId, sortBy);
        
        if (ranking.length === 0) {
            container.innerHTML = '<p class="my-2 text-center text-muted">Nessun giocatore ha ancora giocato questo gioco</p>';
            return;
        }
        
        container.innerHTML = ranking.map((player, index) => `
            <div class="ranking-row pos-${index + 1}">
                <div class="ranking-position pos-${index + 1}">${index + 1}</div>
                <div class="ranking-player">
                    ${this.avatarManager.createAvatar(player.avatar || '😊').outerHTML}
                    <div class="player-name">${player.name}</div>
                    <div>
                        ${player.gamesPlayed} partite
                    </div>
                    <div>
                        <span title="Vittorie" data-bs-toggle="tooltip" data-bs-placement="top">🏆 ${player.wins}</span>
                        <span title="Piazzamenti" data-bs-toggle="tooltip" data-bs-placement="top">🥈 ${player.participants}</span>
                        <span title="Ultimi posti" data-bs-toggle="tooltip" data-bs-placement="top">😞 ${player.lasts}</span>
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

    /**
     * Aggiorna l'ordinamento del ranking e ricarica le visualizzazioni
     * @param {string} sortBy - Nuovo criterio di ordinamento
     */
    updateRankingSortOrder(sortBy) {
        this.currentSortOrder = sortBy;
        this.displayPodium();
        this.displayFullRanking();
    }

    /**
     * Ottiene i punti assegnati per una posizione specifica
     * @param {string} position - Posizione ('winner', 'participant', 'last')
     * @returns {number} - Punti per la posizione
     */
    getPointsForPosition(position) {
        return CONSTANTS.POSITION_POINTS[position] || 0;
    }

    /**
     * Ottiene l'etichetta testuale per una posizione
     * @param {string} position - Posizione ('winner', 'participant', 'last')
     * @returns {string} - Etichetta della posizione
     */
    getPositionLabel(position) {
        return CONSTANTS.POSITION_LABELS[position] || position;
    }

    /**
     * Ottiene la classe CSS per il badge di una posizione
     * @param {string} position - Posizione ('winner', 'participant', 'last')
     * @returns {string} - Classe CSS per il badge
     */
    getPositionBadgeClass(position) {
        return CONSTANTS.POSITION_BADGE_CLASSES[position] || 'bg-secondary';
    }

    /**
     * Ottiene la classe CSS per la visualizzazione della performance
     * @param {number} performance - Percentuale di performance (0-100)
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
     * Inizializza i tooltip di Bootstrap per la visualizzazione
     */
    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    /**
     * Ottiene le statistiche aggregate di tutti i giocatori
     * @returns {object} - Oggetto con statistiche generali
     */
    getOverallStats() {
        const ranking = this.getRanking();
        
        if (ranking.length === 0) {
            return {
                totalPlayers: 0,
                totalMatches: 0,
                averagePoints: 0,
                topPlayer: null,
                mostActivePlayer: null
            };
        }

        const totalMatches = this.matches.length;
        const totalPoints = ranking.reduce((sum, player) => sum + player.totalPoints, 0);
        const averagePoints = Math.round(totalPoints / ranking.length);
        
        const topPlayer = ranking[0]; // First in ranking
        const mostActivePlayer = ranking.reduce((most, player) => 
            player.gamesPlayed > most.gamesPlayed ? player : most
        );

        return {
            totalPlayers: ranking.length,
            totalMatches,
            averagePoints,
            topPlayer,
            mostActivePlayer
        };
    }

    /**
     * Ottiene la classifica filtrata per un criterio specifico
     * @param {string} criteria - Criterio di filtro ('wins', 'gamesPlayed', 'performance')
     * @param {number} limit - Limite di risultati (default: 10)
     * @returns {Array} - Array dei migliori giocatori per il criterio
     */
    getTopPlayersByCriteria(criteria, limit = 10) {
        const ranking = this.getRanking();
        
        return ranking
            .sort((a, b) => {
                switch (criteria) {
                    case 'wins':
                        return b.wins - a.wins;
                    case 'gamesPlayed':
                        return b.gamesPlayed - a.gamesPlayed;
                    case 'performance':
                        return b.performance - a.performance;
                    default:
                        return b.totalPoints - a.totalPoints;
                }
            })
            .slice(0, limit);
    }

    /**
     * Cerca giocatori nelle statistiche per nome o criteri
     * @param {string} searchTerm - Termine di ricerca
     * @returns {Array} - Array dei giocatori trovati con statistiche
     */
    searchPlayersInStats(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const ranking = this.getRanking();
        
        return ranking.filter(player => 
            player.name.toLowerCase().includes(term)
        );
    }

    /**
     * Verifica se ci sono dati sufficienti per mostrare le statistiche
     * @returns {boolean} - True se ci sono dati sufficienti
     */
    hasStatsData() {
        return this.players.length > 0 && this.matches.length > 0;
    }

    /**
     * Ottiene la posizione di un giocatore specifico nel ranking
     * @param {number} playerId - ID del giocatore
     * @returns {number} - Posizione nel ranking (1-based) o -1 se non trovato
     */
    getPlayerPosition(playerId) {
        const ranking = this.getRanking(this.currentSortOrder);
        const index = ranking.findIndex(player => player.id === playerId);
        return index !== -1 ? index + 1 : -1;
    }

    /**
     * Ottiene il miglioramento/peggioramento di posizione di un giocatore
     * @param {number} playerId - ID del giocatore
     * @param {string} previousSortOrder - Ordinamento precedente per il confronto
     * @returns {number} - Differenza di posizione (positivo = migliorato, negativo = peggiorato)
     */
    getPositionChange(playerId, previousSortOrder) {
        const currentPosition = this.getPlayerPosition(playerId);
        const previousRanking = this.getRanking(previousSortOrder);
        const previousIndex = previousRanking.findIndex(player => player.id === playerId);
        const previousPosition = previousIndex !== -1 ? previousIndex + 1 : -1;
        
        if (currentPosition === -1 || previousPosition === -1) {
            return 0;
        }
        
        return previousPosition - currentPosition; // Positive means improved (lower position number)
    }

    /**
     * Calcola le statistiche di un giocatore per un gioco specifico
     * @param {number} playerId - ID del giocatore
     * @param {number} gameId - ID del gioco
     * @returns {object} - Oggetto con le statistiche del giocatore per il gioco specifico
     */
    calculatePlayerStatsForGame(playerId, gameId) {
        const gameMatches = this.matches.filter(m => m.gameId === gameId);
        const playerMatches = gameMatches.filter(m => 
            m.participants.some(p => p.playerId === playerId)
        );
        
        if (playerMatches.length === 0) {
            return null;
        }
        
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
     * Ottiene il miglior giocatore per un gioco specifico
     * @param {number} gameId - ID del gioco
     * @param {string} sortBy - Criterio di ordinamento ('points', 'performance', 'wins')
     * @returns {object|null} - Miglior giocatore con statistiche o null se nessun giocatore
     */
    getBestPlayerForGame(gameId, sortBy = 'points') {
        const gameMatches = this.matches.filter(m => m.gameId === gameId);
        
        if (gameMatches.length === 0) {
            return null;
        }
        
        // Ottieni tutti i giocatori che hanno giocato questo gioco
        const playersInGame = new Set();
        gameMatches.forEach(match => {
            match.participants.forEach(participant => {
                playersInGame.add(participant.playerId);
            });
        });
        
        // Calcola statistiche per ogni giocatore in questo gioco
        const playersWithStats = Array.from(playersInGame).map(playerId => {
            const player = this.players.find(p => p.id === playerId);
            if (!player) return null;
            
            const stats = this.calculatePlayerStatsForGame(playerId, gameId);
            if (!stats) return null;
            
            return {
                ...player,
                ...stats
            };
        }).filter(player => player !== null);
        
        if (playersWithStats.length === 0) {
            return null;
        }
        
        // Ordina per il criterio specificato
        playersWithStats.sort((a, b) => {
            switch (sortBy) {
                case 'performance':
                    if (b.performance !== a.performance) return b.performance - a.performance;
                    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    return a.gamesPlayed - b.gamesPlayed;
                case 'wins':
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                    if (b.performance !== a.performance) return b.performance - a.performance;
                    return a.gamesPlayed - b.gamesPlayed;
                case 'points':
                default:
                    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    if (b.performance !== a.performance) return b.performance - a.performance;
                    return a.gamesPlayed - b.gamesPlayed;
            }
        });
        
        return playersWithStats[0];
    }

    /**
     * Ottiene i giochi dove un giocatore è il migliore
     * @param {number} playerId - ID del giocatore
     * @param {Array} games - Array di tutti i giochi
     * @returns {Array} - Array di oggetti con id, nome e tipo del gioco
     */
    getGamesWherePlayerIsBest(playerId, games) {
        const bestGames = [];
        
        games.forEach(game => {
            const bestPlayer = this.getBestPlayerForGame(game.id, 'points');
            if (bestPlayer && bestPlayer.id === playerId) {
                bestGames.push({
                    id: game.id,
                    name: game.name,
                    type: game.type
                });
            }
        });
        
        return bestGames;
    }
} 