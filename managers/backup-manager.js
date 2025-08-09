// ===== BACKUP MANAGER =====
// Gestisce l'import e export dei dati dell'applicazione Hall of Fame

class BackupManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.version = "1.0";
    }

    /**
     * Esporta tutti i dati dell'applicazione in un file .hof
     * @param {object} data - Oggetto contenente players, games, matches
     * @returns {Promise<boolean>} - True se l'esportazione è riuscita
     */
    async exportData(data) {
        try {
            // Valida i dati di input
            if (!this.validateDataStructure(data)) {
                throw new Error('Struttura dati non valida per l\'esportazione');
            }

            // Prepara i dati per l'esportazione
            const exportData = {
                players: data.players || [],
                games: data.games || [],
                matches: data.matches || [],
                exportDate: new Date().toISOString(),
                version: this.version
            };

            // Verifica che JSZip sia disponibile
            if (typeof JSZip === 'undefined') {
                throw new Error('Libreria JSZip non disponibile');
            }

            // Crea il file ZIP
            const zip = new JSZip();
            zip.file("halloffame-backup.json", JSON.stringify(exportData, null, 2));

            // Genera il file ZIP e avvia il download
            const content = await zip.generateAsync({ type: "blob" });
            this.downloadFile(content, `hall-of-fame-backup-${this.getDateString()}.hof`);
            
            return true;

        } catch (error) {
            console.error('Errore durante l\'esportazione:', error);
            alert(CONSTANTS.MESSAGES.BACKUP_EXPORT_ERROR);
            return false;
        }
    }

    /**
     * Mostra il modal per l'importazione di un backup
     */
    showImportModal() {
        // Reset del file input
        const fileInput = document.getElementById('backup-file');
        if (fileInput) {
            fileInput.value = '';
        }
        
        Utils.showModal('importModal');
    }

    /**
     * Importa dati da un file di backup .hof
     * @returns {Promise<object|null>} - Dati importati o null se errore
     */
    async importData() {
        try {
            const fileInput = document.getElementById('backup-file');
            const file = fileInput?.files[0];

            if (!file) {
                alert(CONSTANTS.MESSAGES.BACKUP_SELECT_FILE);
                return null;
            }

            if (!file.name.endsWith('.hof')) {
                alert(CONSTANTS.MESSAGES.BACKUP_INVALID_FILE);
                return null;
            }

            // Verifica che JSZip sia disponibile
            if (typeof JSZip === 'undefined') {
                throw new Error('Libreria JSZip non disponibile');
            }

            // Legge e processa il file ZIP
            const zip = await JSZip.loadAsync(file);
            const jsonFile = zip.file("halloffame-backup.json");
            
            if (!jsonFile) {
                throw new Error('File di backup non valido: manca il file JSON');
            }

            const jsonContent = await jsonFile.async("string");
            const data = JSON.parse(jsonContent);

            // Valida la struttura dei dati
            if (!this.validateImportData(data)) {
                throw new Error('File di backup non valido: struttura dati mancante o non corretta');
            }

            // Mostra informazioni di conferma all'utente
            const confirmData = this.prepareImportConfirmation(data);
            
            if (confirm(confirmData.message)) {
                return {
                    players: data.players,
                    games: data.games,
                    matches: data.matches
                };
            }

            return null;

        } catch (error) {
            console.error('Errore durante l\'importazione:', error);
            alert('Errore durante l\'importazione del backup: ' + error.message);
            return null;
        }
    }

    /**
     * Valida la struttura dei dati per l'esportazione
     * @param {object} data - Dati da validare
     * @returns {boolean}
     */
    validateDataStructure(data) {
        return data && 
               typeof data === 'object' &&
               Array.isArray(data.players) &&
               Array.isArray(data.games) &&
               Array.isArray(data.matches);
    }

    /**
     * Valida i dati importati da un backup
     * @param {object} data - Dati del backup da validare
     * @returns {boolean}
     */
    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Controlla la presenza delle proprietà richieste
        if (!data.hasOwnProperty('players') || !data.hasOwnProperty('games') || !data.hasOwnProperty('matches')) {
            return false;
        }

        // Controlla che siano array
        if (!Array.isArray(data.players) || !Array.isArray(data.games) || !Array.isArray(data.matches)) {
            return false;
        }

        return true;
    }

    /**
     * Prepara il messaggio di conferma per l'importazione
     * @param {object} data - Dati del backup
     * @returns {object} - Oggetto con messaggio e statistiche
     */
    prepareImportConfirmation(data) {
        const playerCount = data.players.length;
        const gameCount = data.games.length;
        const matchCount = data.matches.length;
        const exportDate = data.exportDate ? 
            new Date(data.exportDate).toLocaleDateString('it-IT') : 
            'Data sconosciuta';

        const message = `Confermi l'importazione del backup del ${exportDate}?\n\n` +
                       `Dati nel backup:\n` +
                       `- ${playerCount} giocatori\n` +
                       `- ${gameCount} giochi\n` +
                       `- ${matchCount} ${Utils.pluralizeMatches(matchCount)}\n\n` +
                       `Tutti i dati attuali verranno sostituiti.`;

        return {
            message,
            stats: { playerCount, gameCount, matchCount, exportDate }
        };
    }

    /**
     * Avvia il download di un file
     * @param {Blob} content - Contenuto del file
     * @param {string} filename - Nome del file
     */
    downloadFile(content, filename) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Ottiene una stringa data nel formato YYYY-MM-DD
     * @returns {string}
     */
    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Crea un backup automatico dei dati attuali
     * @param {object} data - Dati da salvare come backup
     * @returns {boolean} - True se il backup è stato creato
     */
    createAutoBackup(data) {
        try {
            if (!this.storageManager) {
                return false;
            }

            const backupData = {
                ...data,
                backupDate: new Date().toISOString(),
                type: 'auto'
            };

            return this.storageManager.save('auto_backup', backupData);
        } catch (error) {
            console.error('Errore durante la creazione del backup automatico:', error);
            return false;
        }
    }

    /**
     * Ripristina un backup automatico
     * @returns {object|null} - Dati del backup o null
     */
    restoreAutoBackup() {
        try {
            if (!this.storageManager) {
                return null;
            }

            return this.storageManager.load('auto_backup');
        } catch (error) {
            console.error('Errore durante il ripristino del backup automatico:', error);
            return null;
        }
    }

    /**
     * Controlla se esiste un backup automatico
     * @returns {boolean}
     */
    hasAutoBackup() {
        return this.storageManager && this.storageManager.exists('auto_backup');
    }

    /**
     * Rimuove il backup automatico
     * @returns {boolean}
     */
    removeAutoBackup() {
        return this.storageManager && this.storageManager.remove('auto_backup');
    }
} 