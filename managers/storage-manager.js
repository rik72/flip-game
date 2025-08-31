// ===== STORAGE MANAGER =====
// Gestisce tutte le operazioni di localStorage per l'applicazione Flipgame

class StorageManager {
    constructor(prefix = 'flipgame') {
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

    /**
     * Salva il progresso del gioco
     * @param {number} level - Livello completato
     */
    saveGameProgress(level) {
        const progress = {
            level: level,
            timestamp: Date.now()
        };
        
        this.save('progress', progress);
        this.save(`level_${level}`, { completed: true });
    }

    /**
     * Carica il progresso del gioco
     * @returns {object|null} - Progresso salvato o null
     */
    loadGameProgress() {
        return this.load('progress');
    }

    /**
     * Ottiene il livello più alto completato
     * @returns {number} - Livello più alto completato
     */
    getHighestLevel() {
        const progress = this.loadGameProgress();
        return progress ? progress.level : 0;
    }

    /**
     * Controlla se un livello specifico è stato completato
     * @param {number} level - Numero del livello da controllare
     * @returns {boolean} - True se il livello è completato, false altrimenti
     */
    isLevelCompleted(level) {
        const levelData = this.load(`level_${level}`);
        return levelData && levelData.completed === true;
    }

    /**
     * Resetta lo stato di completamento di un livello specifico
     * @param {number} level - Numero del livello da resettare
     */
    resetLevelCompletion(level) {
        this.save(`level_${level}`, { completed: false });
    }



    /**
     * Salva le impostazioni del gioco
     * @param {object} settings - Impostazioni da salvare
     */
    saveGameSettings(settings) {
        this.save('settings', settings);
    }

    /**
     * Carica le impostazioni del gioco
     * @returns {object} - Impostazioni salvate o default
     */
    loadGameSettings() {
        const settings = this.load('settings');
        return settings || {
            soundEnabled: true,
            vibrationEnabled: true,
            difficulty: 'normal'
        };
    }

    /**
     * Salva i dati di un livello specifico
     * @param {number} levelNumber - Numero del livello
     * @param {object} levelData - Dati del livello
     */
    saveLevelData(levelNumber, levelData) {
        this.save(`level_${levelNumber}`, levelData);
    }

    /**
     * Improved hash function for generating level filenames
     * @param {string} input - Input string to hash
     * @returns {string} - 6-character hash [a-z0-9]
     */
    simpleHash(input) {
        // Use a more sophisticated hash algorithm for better distribution
        let hash1 = 0x811c9dc5; // FNV-1a hash prime
        let hash2 = 0x1505;     // FNV-1a hash offset basis
        
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash1 = (hash1 ^ char) * 0x01000193; // FNV-1a multiplication
            hash2 = (hash2 ^ char) * 0x01000193;
            hash1 = hash1 >>> 0; // Keep as 32-bit unsigned
            hash2 = hash2 >>> 0;
        }
        
        // Combine both hashes for better distribution
        const combinedHash = (hash1 << 16) | (hash2 & 0xffff);
        const positiveHash = Math.abs(combinedHash);
        
        // Use a larger character set and better distribution
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        // Generate each character using different parts of the hash
        for (let i = 0; i < 6; i++) {
            // Use different bit positions for each character
            const shift = (i * 5) % 32;
            const charIndex = (positiveHash >> shift) & 0x1f; // 5 bits = 0-31
            result += chars[charIndex % chars.length];
        }
        
        return result;
    }

    /**
     * Generate hashed filename for a level
     * @param {number} levelNumber - Level number
     * @param {string} hashSeed - Hash seed
     * @returns {string} - Hashed filename
     */
    generateLevelFilename(levelNumber, hashSeed) {
        const content = `${levelNumber}_${hashSeed}`;
        const hash = this.simpleHash(content);
        return `level_${levelNumber}_${hash}.json`;
    }

    /**
     * Carica i dati di un livello specifico da file JSON
     * @param {number} levelNumber - Numero del livello
     * @returns {Promise<object|null>} - Dati del livello o null
     */
    async loadLevelData(levelNumber) {
        try {
            // Check if we have a hash seed (production mode)
            const hashSeed = CONSTANTS.GAME_CONFIG.LEVEL_HASH_SEED;
            let filename;
            
            if (hashSeed && hashSeed.trim() !== '') {
                // Production mode: use hashed filename
                filename = this.generateLevelFilename(levelNumber, hashSeed);
            } else {
                // Development mode: use original filename
                filename = `level_${levelNumber}.json`;
            }
            
            const response = await fetch(`levels/${filename}`);
            if (!response.ok) {
                console.warn(`Level ${levelNumber} file not found: ${filename}`);
                return null;
            }
            const levelData = await response.json();
            return levelData;
        } catch (error) {
            console.error(`Error loading level ${levelNumber}:`, error);
            return null;
        }
    }
} 