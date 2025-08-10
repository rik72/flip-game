// ===== TEXT MANAGEMENT EXAMPLES =====
// This file demonstrates how to use the text management system

// Example 1: Basic text updates
function exampleBasicTextUpdates() {
    console.log('=== Basic Text Updates ===');
    
    // Update a button text
    textManager.updateElementText('#example-button', 'Nuovo Testo Pulsante');
    
    // Update multiple elements
    textManager.updateElementsText(['#title1', '#title2'], 'Titolo Aggiornato');
    
    // Update using constants path
    textManager.setTextFromPath('#player-name-label', 'FORM_LABELS.NAME');
    
    console.log('Basic text updates completed');
}

// Example 2: Modal management
function exampleModalManagement() {
    console.log('=== Modal Management ===');
    
    // Switch modal between add and edit modes
    function switchToEditMode() {
        textManager.updateModalTitle('addPlayerModal', CONSTANTS.MODAL_TITLES.EDIT_PLAYER);
        textManager.updateButtonText('player-submit-btn', CONSTANTS.BUTTONS.SAVE_CHANGES);
    }
    
    function switchToAddMode() {
        textManager.updateModalTitle('addPlayerModal', CONSTANTS.MODAL_TITLES.ADD_PLAYER);
        textManager.updateButtonText('player-submit-btn', CONSTANTS.BUTTONS.ADD);
    }
    
    // Simulate switching modes
    switchToEditMode();
    setTimeout(() => switchToAddMode(), 2000);
    
    console.log('Modal management examples completed');
}

// Example 3: Dynamic form labels
function exampleDynamicFormLabels() {
    console.log('=== Dynamic Form Labels ===');
    
    // Update form labels based on context
    function updateFormForPlayer() {
        textManager.updateFormLabel('name-input', CONSTANTS.FORM_LABELS.NAME);
        textManager.updateFormLabel('avatar-input', CONSTANTS.FORM_LABELS.AVATAR);
    }
    
    function updateFormForGame() {
        textManager.updateFormLabel('name-input', CONSTANTS.FORM_LABELS.GAME_NAME);
        textManager.updateFormLabel('type-input', CONSTANTS.FORM_LABELS.TYPE);
    }
    
    updateFormForPlayer();
    setTimeout(() => updateFormForGame(), 2000);
    
    console.log('Dynamic form labels examples completed');
}

// Example 4: Constants access patterns
function exampleConstantsAccess() {
    console.log('=== Constants Access Patterns ===');
    
    // Direct access
    const buttonText = CONSTANTS.BUTTONS.ADD_PLAYER;
    console.log('Direct access:', buttonText);
    
    // Path-based access
    const buttonTextPath = textManager.getText('BUTTONS.ADD_PLAYER');
    console.log('Path-based access:', buttonTextPath);
    
    // Nested access
    const avatarLabel = CONSTANTS.AVATAR_CATEGORIES.FACES_EMOTIONS.SORRIDENTE;
    console.log('Nested access:', avatarLabel);
    
    // Complex path access
    const complexPath = textManager.getText('AVATAR_CATEGORIES.PEOPLE.DONNA');
    console.log('Complex path access:', complexPath);
    
    console.log('Constants access patterns completed');
}

// Example 5: Adding new text constants
function exampleAddingNewConstants() {
    console.log('=== Adding New Constants ===');
    
    // Add new section constants
    CONSTANTS.NEW_FEATURE = {
        TITLE: 'Nuova Funzionalità',
        DESCRIPTION: 'Descrizione della nuova funzionalità',
        BUTTON: 'Attiva Funzionalità',
        SUCCESS_MESSAGE: 'Funzionalità attivata con successo!'
    };
    
    // Use the new constants
    textManager.setTextFromPath('#new-feature-title', 'NEW_FEATURE.TITLE');
    textManager.setTextFromPath('#new-feature-desc', 'NEW_FEATURE.DESCRIPTION');
    textManager.updateButtonText('new-feature-btn', CONSTANTS.NEW_FEATURE.BUTTON);
    
    console.log('New constants added and used');
}

// Example 6: Validation messages
function exampleValidationMessages() {
    console.log('=== Validation Messages ===');
    
    // Simulate validation scenarios
    function simulateValidation() {
        try {
            // This would normally be called with actual data
            Utils.validateName('', [], null, 'giocatore');
        } catch (error) {
            console.log('Validation error:', error.message);
        }
        
        try {
            Utils.validateName('Mario', [{name: 'Mario', id: 1}], null, 'giocatore');
        } catch (error) {
            console.log('Duplicate error:', error.message);
        }
    }
    
    simulateValidation();
    console.log('Validation messages examples completed');
}

// Example 7: Internationalization preparation
function exampleI18nPreparation() {
    console.log('=== I18n Preparation ===');
    
    // Simulate language switching
    const languages = {
        IT: {
            BUTTONS: { ADD_PLAYER: 'Aggiungi Giocatore' },
            SECTIONS: { PLAYERS: 'Giocatori' }
        },
        EN: {
            BUTTONS: { ADD_PLAYER: 'Add Player' },
            SECTIONS: { PLAYERS: 'Players' }
        }
    };
    
    function switchLanguage(lang) {
        // In a real implementation, this would update CONSTANTS
        console.log(`Switching to ${lang} language`);
        console.log('Button text would be:', languages[lang].BUTTONS.ADD_PLAYER);
        console.log('Section text would be:', languages[lang].SECTIONS.PLAYERS);
        
        // Re-initialize text manager with new language
        // textManager.initialize();
    }
    
    switchLanguage('IT');
    setTimeout(() => switchLanguage('EN'), 1000);
    
    console.log('I18n preparation examples completed');
}

// Example 8: Error handling
function exampleErrorHandling() {
    console.log('=== Error Handling ===');
    
    // Test invalid paths
    const invalidPath = textManager.getText('INVALID.PATH');
    console.log('Invalid path result:', invalidPath);
    
    // Test missing elements
    textManager.updateElementText('#non-existent-element', 'Test');
    console.log('Non-existent element handled gracefully');
    
    // Test constants utility methods
    const result = CONSTANTS.setText(document.querySelector('#example-button'), 'BUTTONS.ADD_PLAYER');
    console.log('Constants utility method result:', result);
    
    console.log('Error handling examples completed');
}

// Run all examples
function runAllExamples() {
    console.log('🚀 Starting Text Management Examples...\n');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runExamples, 1000);
        });
    } else {
        setTimeout(runExamples, 1000);
    }
}

function runExamples() {
    exampleBasicTextUpdates();
    setTimeout(() => exampleModalManagement(), 1000);
    setTimeout(() => exampleDynamicFormLabels(), 2000);
    setTimeout(() => exampleConstantsAccess(), 3000);
    setTimeout(() => exampleAddingNewConstants(), 4000);
    setTimeout(() => exampleValidationMessages(), 5000);
    setTimeout(() => exampleI18nPreparation(), 6000);
    setTimeout(() => exampleErrorHandling(), 7000);
    setTimeout(() => {
        console.log('\n✅ All Text Management Examples Completed!');
        console.log('Check the console and page elements for results.');
    }, 8000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllExamples,
        exampleBasicTextUpdates,
        exampleModalManagement,
        exampleDynamicFormLabels,
        exampleConstantsAccess,
        exampleAddingNewConstants,
        exampleValidationMessages,
        exampleI18nPreparation,
        exampleErrorHandling
    };
} 