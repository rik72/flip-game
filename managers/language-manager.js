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
        console.log('🔄 Initializing LanguageManager...');
        this.loadLanguagePreference();
        console.log(`📱 Detected/loaded language preference: ${this.currentLanguage}`);
        
        // Wait a bit to ensure constants are loaded, then set language
        setTimeout(() => {
            // Set initial CONSTANTS value
            if (window.CONSTANTS_IT_OBJ && window.CONSTANTS_EN_OBJ) {
                console.log('✅ Constants objects loaded, creating copies...');
                // Create deep copies of the constants
                window.CONSTANTS_IT = JSON.parse(JSON.stringify(window.CONSTANTS_IT_OBJ));
                window.CONSTANTS_EN = JSON.parse(JSON.stringify(window.CONSTANTS_EN_OBJ));
                console.log('✅ Constants copies created, setting initial language...');
                this.setLanguage(this.currentLanguage);
            } else {
                console.error('❌ Constants objects not loaded yet, retrying...');
                // Try one more time with a longer delay
                setTimeout(() => {
                    if (window.CONSTANTS_IT_OBJ && window.CONSTANTS_EN_OBJ) {
                        console.log('✅ Constants objects loaded on retry, creating copies...');
                        window.CONSTANTS_IT = JSON.parse(JSON.stringify(window.CONSTANTS_IT_OBJ));
                        window.CONSTANTS_EN = JSON.parse(JSON.stringify(window.CONSTANTS_EN_OBJ));
                        console.log('✅ Constants copies created, setting language...');
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

        console.log(`🔄 Setting language to: ${languageCode}`);
        this.currentLanguage = languageCode;
        localStorage.setItem('hall-of-fame-language', languageCode);
        
        // Load the appropriate constants file and update UI
        this.loadConstantsFile(languageCode);
        
        console.log(`✅ Language changed to: ${this.languageNames[languageCode]}`);
        
        // Notify that language is ready
        this.onLanguageReady();
    }

    // Load the appropriate constants file based on language
    loadConstantsFile(languageCode) {
        console.log(`🔄 Loading constants for language: ${languageCode}`);
        
        // Debug: Log all available constants
        console.log('Available constants:');
        console.log('- CONSTANTS_IT_OBJ:', window.CONSTANTS_IT_OBJ);
        console.log('- CONSTANTS_EN_OBJ:', window.CONSTANTS_EN_OBJ);
        console.log('- CONSTANTS_IT:', window.CONSTANTS_IT);
        console.log('- CONSTANTS_EN:', window.CONSTANTS_EN);
        
        // Check if constants are available
        if (!window.CONSTANTS_IT || !window.CONSTANTS_EN) {
            console.error('❌ Constants not loaded properly!');
            console.log('CONSTANTS_IT:', window.CONSTANTS_IT);
            console.log('CONSTANTS_EN:', window.CONSTANTS_EN);
            return;
        }
        
        // Switch to the appropriate constants
        if (languageCode === 'it') {
            window.CONSTANTS = window.CONSTANTS_IT;
            console.log('✅ Switched to Italian constants');
            console.log('Sample text:', window.CONSTANTS.PAGE_TITLE);
        } else if (languageCode === 'en') {
            window.CONSTANTS = window.CONSTANTS_EN;
            console.log('✅ Switched to English constants');
            console.log('Sample text:', window.CONSTANTS.PAGE_TITLE);
        }
        
        // Update UI language
        this.updateUILanguage();
    }

    // Update UI language by re-initializing text manager
    updateUILanguage() {
        console.log('🔄 Updating UI language...');
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Re-initialize text manager to update all text
        if (window.textManager) {
            console.log('🔄 Re-initializing TextManager...');
            window.textManager.initialize();
        } else {
            console.warn('⚠️ TextManager not found!');
        }
        
        console.log('✅ UI language update completed');
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
        console.log('✅ Language is ready, CONSTANTS available:', window.CONSTANTS);
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('languageReady', { 
            detail: { language: this.currentLanguage } 
        }));
    }
}

// Create global instance (will be initialized in app-bridge.js)
window.languageManager = new LanguageManager(); 