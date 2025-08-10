// ===== LANGUAGE MANAGER =====
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en'; // Default to English
        this.supportedLanguages = ['it', 'en'];
        this.languageNames = {
            'it': 'Italiano',
            'en': 'English'
        };
        // Don't initialize here - will be called from app-bridge.js
    }

    // Initialize language manager
    init() {
        this.loadLanguagePreference();
        
        // Wait a bit to ensure constants are loaded, then set language
        setTimeout(() => {
            // Set initial CONSTANTS value
            if (window.CONSTANTS_IT_OBJ && window.CONSTANTS_EN_OBJ) {
                // Create deep copies of the constants
                window.CONSTANTS_IT = JSON.parse(JSON.stringify(window.CONSTANTS_IT_OBJ));
                window.CONSTANTS_EN = JSON.parse(JSON.stringify(window.CONSTANTS_EN_OBJ));
                this.setLanguage(this.currentLanguage);
            } else {
                // Try one more time with a longer delay
                setTimeout(() => {
                    if (window.CONSTANTS_IT_OBJ && window.CONSTANTS_EN_OBJ) {
                        window.CONSTANTS_IT = JSON.parse(JSON.stringify(window.CONSTANTS_IT_OBJ));
                        window.CONSTANTS_EN = JSON.parse(JSON.stringify(window.CONSTANTS_EN_OBJ));
                        this.setLanguage(this.currentLanguage);
                    } else {
                        console.error('❌ Constants objects still not loaded, application may not work properly');
                    }
                }, 500);
            }
        }, 100);
    }

    // Load language preference from localStorage or detect from browser
    loadLanguagePreference() {
        const savedLanguage = localStorage.getItem('hall-of-fame-language');
        
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        } else {
            // Detect browser language
            this.currentLanguage = this.detectBrowserLanguage();
        }
    }

    // Detect browser language and return supported language or default to English
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (browserLang) {
            const langCode = browserLang.toLowerCase().split('-')[0];
            
            if (this.supportedLanguages.includes(langCode)) {
                return langCode;
            }
        }
        
        return 'en'; // Default to English
    }

    // Set language and update the application
    setLanguage(languageCode) {
        if (!this.supportedLanguages.includes(languageCode)) {
            console.warn(`Unsupported language: ${languageCode}`);
            return;
        }

        this.currentLanguage = languageCode;
        localStorage.setItem('hall-of-fame-language', languageCode);
        
        // Load the appropriate constants file and update UI
        this.loadConstantsFile(languageCode);
        
        // Notify that language is ready
        this.onLanguageReady();
    }

    // Load the appropriate constants file based on language
    loadConstantsFile(languageCode) {
        // Check if constants are available
        if (!window.CONSTANTS_IT || !window.CONSTANTS_EN) {
            console.error('❌ Constants not loaded properly!');
            return;
        }
        
        // Switch to the appropriate constants
        if (languageCode === 'it') {
            window.CONSTANTS = window.CONSTANTS_IT;
        } else if (languageCode === 'en') {
            window.CONSTANTS = window.CONSTANTS_EN;
        }
        
        // Update UI language
        this.updateUILanguage();
    }

    // Update UI language by re-initializing text manager
    updateUILanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Re-initialize text manager to update all text
        if (window.textManager) {
            window.textManager.initialize();
        } else {
            console.warn('⚠️ TextManager not found!');
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get current language name
    getCurrentLanguageName() {
        return this.languageNames[this.currentLanguage];
    }

    // Get all supported languages
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    // Get language names
    getLanguageNames() {
        return this.languageNames;
    }

    // Check if a language is supported
    isLanguageSupported(languageCode) {
        return this.supportedLanguages.includes(languageCode);
    }

    // Called when language is ready
    onLanguageReady() {
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('languageReady', { 
            detail: { language: this.currentLanguage } 
        }));
    }
}

// Create global instance (will be initialized in app-bridge.js)
window.languageManager = new LanguageManager(); 