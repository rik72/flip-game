// ===== STORAGE MANAGER =====
// Gestisce tutte le operazioni di localStorage per l'applicazione Hall of Fame

class StorageManager {
    constructor(prefix = 'halloffame') {
        this.prefix = prefix;
    }

    /**
     * Salva dati nel localStorage con prefisso
     * @param {string} key - Chiave per identificare i dati
     * @param {any} data - Dati da salvare (saranno serializzati in JSON)
     */
    save(key, data) {
        try {
            localStorage.setItem(`${this.prefix}_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
            return false;
        }
    }

    /**
     * Carica dati dal localStorage
     * @param {string} key - Chiave dei dati da caricare
     * @returns {any|null} - Dati deserializzati o null se non presenti
     */
    load(key) {
        try {
            const data = localStorage.getItem(`${this.prefix}_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Errore durante il caricamento:', error);
            return null;
        }
    }

    /**
     * Rimuove dati dal localStorage
     * @param {string} key - Chiave dei dati da rimuovere
     */
    remove(key) {
        try {
            localStorage.removeItem(`${this.prefix}_${key}`);
            return true;
        } catch (error) {
            console.error('Errore durante la rimozione:', error);
            return false;
        }
    }

    /**
     * Controlla se una chiave esiste nel localStorage
     * @param {string} key - Chiave da verificare
     * @returns {boolean}
     */
    exists(key) {
        return localStorage.getItem(`${this.prefix}_${key}`) !== null;
    }

    /**
     * Cancella tutti i dati dell'applicazione dal localStorage
     */
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(`${this.prefix}_`)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Errore durante la cancellazione:', error);
            return false;
        }
    }

    /**
     * Ottiene tutte le chiavi dell'applicazione presenti nel localStorage
     * @returns {string[]} - Array delle chiavi (senza prefisso)
     */
    getAllKeys() {
        const keys = Object.keys(localStorage);
        return keys
            .filter(key => key.startsWith(`${this.prefix}_`))
            .map(key => key.replace(`${this.prefix}_`, ''));
    }

    /**
     * Ottiene informazioni sullo spazio utilizzato nel localStorage
     * @returns {object} - Oggetto con informazioni sui dati memorizzati
     */
    getStorageInfo() {
        const keys = this.getAllKeys();
        const info = {
            totalKeys: keys.length,
            totalSize: 0,
            data: {}
        };

        keys.forEach(key => {
            const data = localStorage.getItem(`${this.prefix}_${key}`);
            const size = data ? data.length : 0;
            info.data[key] = size;
            info.totalSize += size;
        });

        return info;
    }
} 