// ===== AVATAR MANAGER =====
// Gestisce tutto il sistema di avatar: creazione, preview, filtri e selezione

class AvatarManager {
    constructor() {
        this.allAvatarOptions = []; // Store all avatar options for filtering
        this.currentFilterText = '';
    }

    /**
     * Crea un elemento avatar con emoji e dimensione specificata
     * @param {string} emoji - Emoji da visualizzare
     * @param {string} size - Classe CSS per la dimensione ('avatar-large', 'avatar-podium', '')
     * @returns {HTMLElement} - Elemento span con l'avatar
     */
    createAvatar(emoji, size = '') {
        const avatar = document.createElement('span');
        avatar.className = `avatar ${size}`;
        
        // Imposta la dimensione del font in base alla classe
        if (size === 'avatar-large') {
            avatar.style.fontSize = '4rem';
        } else if (size === 'avatar-podium') {
            avatar.style.fontSize = '3rem';
        } else {
            avatar.style.fontSize = '2rem';
        }
        
        avatar.textContent = emoji || '😊';
        
        return avatar;
    }

    /**
     * Aggiorna la preview dell'avatar nel modal
     */
    updateAvatarPreview() {
        const emojiSelect = document.getElementById('player-avatar');
        const preview = document.getElementById('avatar-preview');
        
        if (emojiSelect && preview) {
            const emoji = emojiSelect.value;
            preview.textContent = emoji;
        }
    }

    /**
     * Inizializza le opzioni degli avatar dal select HTML
     */
    initializeAvatarOptions() {
        const avatarSelect = document.getElementById('player-avatar');
        
        if (!avatarSelect) {
            console.warn('Elemento player-avatar non trovato');
            return;
        }
        
        // Get all existing options from the HTML
        this.allAvatarOptions = Array.from(avatarSelect.options).map(option => ({
            value: option.value,
            text: option.textContent
        }));
        
        // Store the original selected value
        const originalValue = avatarSelect.value || '😊';
        
        // Set up the initial display
        this.populateAvatarSelect(this.allAvatarOptions);
        avatarSelect.value = originalValue;
    }

    /**
     * Popola il select degli avatar con le opzioni filtrate
     * @param {Array} options - Array di opzioni {value, text}
     */
    populateAvatarSelect(options) {
        const avatarSelect = document.getElementById('player-avatar');
        
        if (!avatarSelect) {
            console.warn('Elemento player-avatar non trovato');
            return;
        }
        
        const currentValue = avatarSelect.value;
        
        // Clear existing options
        avatarSelect.innerHTML = '';
        
        // Add filtered options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            avatarSelect.appendChild(optionElement);
        });
        
        // Restore selection if the value still exists in filtered options
        if (options.some(opt => opt.value === currentValue)) {
            avatarSelect.value = currentValue;
        } else if (options.length > 0) {
            // If current value doesn't exist in filtered options, select the first one
            avatarSelect.value = options[0].value;
            this.updateAvatarPreview();
        }
    }

    /**
     * Filtra gli avatar basandosi sul testo di ricerca
     * @param {string} filterText - Testo per filtrare gli avatar
     */
    filterAvatars(filterText) {
        this.currentFilterText = filterText;
        const normalizedFilter = filterText.toLowerCase().trim();
        
        if (normalizedFilter === '') {
            // Show all options when filter is empty
            this.populateAvatarSelect(this.allAvatarOptions);
        } else {
            // Filter options based on text content
            const filteredOptions = this.allAvatarOptions.filter(option => 
                option.text.toLowerCase().includes(normalizedFilter)
            );
            this.populateAvatarSelect(filteredOptions);
            
            // Auto-select first result if available and nothing is currently selected
            const avatarSelect = document.getElementById('player-avatar');
            if (avatarSelect && filteredOptions.length > 0 && !avatarSelect.value) {
                avatarSelect.value = filteredOptions[0].value;
                this.updateAvatarPreview();
            }
        }
    }

    /**
     * Mostra gli avatar filtrati quando il campo ricerca riceve focus
     */
    showFilteredAvatars() {
        // Ensure the select shows the current filter when focused
        const filterInput = document.getElementById('avatar-filter');
        const filterText = filterInput ? filterInput.value : this.currentFilterText;
        this.filterAvatars(filterText);
    }

    /**
     * Configura gli event listeners per il sistema di avatar
     */
    setupEventListeners() {
        // Avatar preview updates
        const avatarSelect = document.getElementById('player-avatar');
        if (avatarSelect) {
            avatarSelect.addEventListener('change', () => this.updateAvatarPreview());
        }
        
        // Avatar filter functionality
        const avatarFilter = document.getElementById('avatar-filter');
        if (avatarFilter) {
            avatarFilter.addEventListener('input', (e) => this.filterAvatars(e.target.value));
            avatarFilter.addEventListener('focus', () => this.showFilteredAvatars());
        }
        
        // Clear filter when modal is hidden
        const addPlayerModal = document.getElementById('addPlayerModal');
        if (addPlayerModal) {
            addPlayerModal.addEventListener('hidden.bs.modal', () => {
                this.clearFilter();
            });
        }
    }

    /**
     * Cancella il filtro e ripristina tutte le opzioni
     */
    clearFilter() {
        const filterInput = document.getElementById('avatar-filter');
        if (filterInput) {
            filterInput.value = '';
        }
        this.currentFilterText = '';
        this.populateAvatarSelect(this.allAvatarOptions);
    }

    /**
     * Prepara il sistema avatar per un nuovo giocatore
     */
    prepareForNewPlayer() {
        this.clearFilter();
        this.populateAvatarSelect(this.allAvatarOptions);
        this.updateAvatarPreview();
    }

    /**
     * Prepara il sistema avatar per modificare un giocatore esistente
     * @param {string} selectedEmoji - Emoji attualmente selezionato per il giocatore
     */
    prepareForEditPlayer(selectedEmoji) {
        this.clearFilter();
        this.populateAvatarSelect(this.allAvatarOptions);
        
        const avatarSelect = document.getElementById('player-avatar');
        if (avatarSelect && selectedEmoji) {
            avatarSelect.value = selectedEmoji;
        }
        
        this.updateAvatarPreview();
    }

    /**
     * Ottiene l'emoji attualmente selezionato
     * @returns {string} - Emoji selezionato
     */
    getSelectedEmoji() {
        const avatarSelect = document.getElementById('player-avatar');
        return avatarSelect ? avatarSelect.value : '😊';
    }

    /**
     * Imposta l'emoji selezionato
     * @param {string} emoji - Emoji da selezionare
     */
    setSelectedEmoji(emoji) {
        const avatarSelect = document.getElementById('player-avatar');
        if (avatarSelect) {
            avatarSelect.value = emoji;
            this.updateAvatarPreview();
        }
    }

    /**
     * Verifica se un emoji è disponibile nelle opzioni
     * @param {string} emoji - Emoji da verificare
     * @returns {boolean}
     */
    isEmojiAvailable(emoji) {
        return this.allAvatarOptions.some(option => option.value === emoji);
    }

    /**
     * Ottiene tutte le opzioni di avatar disponibili
     * @returns {Array} - Array delle opzioni {value, text}
     */
    getAllAvatarOptions() {
        return [...this.allAvatarOptions];
    }

    /**
     * Aggiunge una nuova opzione di avatar
     * @param {string} emoji - Emoji da aggiungere
     * @param {string} description - Descrizione dell'emoji
     */
    addAvatarOption(emoji, description) {
        if (!this.isEmojiAvailable(emoji)) {
            this.allAvatarOptions.push({
                value: emoji,
                text: description
            });
            // Refresh the select if no filter is active
            if (!this.currentFilterText) {
                this.populateAvatarSelect(this.allAvatarOptions);
            }
        }
    }

    /**
     * Rimuove un'opzione di avatar
     * @param {string} emoji - Emoji da rimuovere
     */
    removeAvatarOption(emoji) {
        this.allAvatarOptions = this.allAvatarOptions.filter(option => option.value !== emoji);
        // Refresh the select
        if (this.currentFilterText) {
            this.filterAvatars(this.currentFilterText);
        } else {
            this.populateAvatarSelect(this.allAvatarOptions);
        }
    }
} 