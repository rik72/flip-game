// ===== NAVIGATION MANAGER =====
// Gestisce la navigazione tra le diverse sezioni dell'applicazione Hall of Fame

class NavigationManager {
    constructor() {
        this.currentSection = 'podium';
        this.sections = ['podium', 'players', 'games', 'matches'];
        this.sectionCallbacks = new Map();
    }

    /**
     * Registra un callback per quando una sezione viene mostrata
     * @param {string} sectionName - Nome della sezione
     * @param {function} callback - Funzione da chiamare quando la sezione è attivata
     */
    registerSectionCallback(sectionName, callback) {
        this.sectionCallbacks.set(sectionName, callback);
    }

    /**
     * Mostra una sezione specifica e nasconde le altre
     * @param {string} sectionName - Nome della sezione da mostrare
     * @param {HTMLElement} clickedElement - Elemento cliccato (opzionale)
     */
    showSection(sectionName, clickedElement = null) {
        // Valida il nome della sezione
        if (!this.sections.includes(sectionName)) {
            console.error(`Sezione non valida: ${sectionName}`);
            return false;
        }

        // Nasconde tutte le sezioni
        this.hideAllSections();
        
        // Mostra la sezione selezionata
        const sectionElement = document.getElementById(`${sectionName}-section`);
        if (sectionElement) {
            sectionElement.style.display = 'block';
        } else {
            console.error(`Elemento sezione non trovato: ${sectionName}-section`);
            return false;
        }
        
        // Aggiorna la navigazione
        this.updateNavigation(sectionName, clickedElement);
        
        // Aggiorna la sezione corrente
        this.currentSection = sectionName;
        
        // Esegue il callback specifico della sezione se presente
        const callback = this.sectionCallbacks.get(sectionName);
        if (callback && typeof callback === 'function') {
            try {
                callback();
            } catch (error) {
                console.error(`Errore nell'esecuzione del callback per la sezione ${sectionName}:`, error);
            }
        }

        return true;
    }

    /**
     * Nasconde tutte le sezioni
     */
    hideAllSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }

    /**
     * Aggiorna la navigazione evidenziando il link attivo
     * @param {string} sectionName - Nome della sezione attiva
     * @param {HTMLElement} clickedElement - Elemento cliccato (opzionale)
     */
    updateNavigation(sectionName, clickedElement = null) {
        // Rimuove la classe active da tutti i link di navigazione
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Se è stato fornito un elemento cliccato, aggiunge la classe active
        if (clickedElement && clickedElement.classList) {
            clickedElement.classList.add('active');
        } else {
            // Trova e attiva il link corretto basato sul nome della sezione
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                if (link.getAttribute('onclick')?.includes(sectionName)) {
                    link.classList.add('active');
                }
            });
        }
    }

    /**
     * Ottiene la sezione corrente
     * @returns {string} - Nome della sezione corrente
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Controlla se una sezione è attualmente visibile
     * @param {string} sectionName - Nome della sezione da controllare
     * @returns {boolean}
     */
    isSectionVisible(sectionName) {
        const sectionElement = document.getElementById(`${sectionName}-section`);
        return sectionElement && sectionElement.style.display !== 'none';
    }

    /**
     * Ottiene tutte le sezioni disponibili
     * @returns {string[]} - Array con i nomi delle sezioni
     */
    getAvailableSections() {
        return [...this.sections];
    }

    /**
     * Naviga alla sezione precedente nell'ordine
     */
    goToPreviousSection() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : this.sections.length - 1;
        this.showSection(this.sections[previousIndex]);
    }

    /**
     * Naviga alla sezione successiva nell'ordine
     */
    goToNextSection() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        const nextIndex = currentIndex < this.sections.length - 1 ? currentIndex + 1 : 0;
        this.showSection(this.sections[nextIndex]);
    }

    /**
     * Aggiunge una nuova sezione alla lista delle sezioni disponibili
     * @param {string} sectionName - Nome della nuova sezione
     */
    addSection(sectionName) {
        if (!this.sections.includes(sectionName)) {
            this.sections.push(sectionName);
        }
    }

    /**
     * Rimuove una sezione dalla lista delle sezioni disponibili
     * @param {string} sectionName - Nome della sezione da rimuovere
     */
    removeSection(sectionName) {
        const index = this.sections.indexOf(sectionName);
        if (index > -1) {
            this.sections.splice(index, 1);
            this.sectionCallbacks.delete(sectionName);
        }
    }
} 