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