# Text Management System Guide

## Overview

The Hall of Fame application now uses a centralized text management system that eliminates hardcoded text strings from the HTML and manages all user-facing text through JavaScript constants. This system provides:

- **Centralized text management** - All text is stored in `constants.js`
- **Programmatic text updates** - Text can be changed dynamically via JavaScript
- **Internationalization ready** - Easy to add multiple languages
- **Consistent text handling** - Standardized approach across the application
- **Zero hardcoded text** - No user-facing text is hardcoded in HTML

## Architecture

### Files Structure

```
constants-it.js       - Central text constants repository (Italian)
text-manager.js       - TextManager class for dynamic text updates
index.html           - HTML with minimal hardcoded text
app-bridge.js        - Initializes TextManager on page load
```

### Loading Order

1. `constants-it.js` - Loads all text constants (Italian)
2. `text-manager.js` - Creates TextManager class
3. `app-bridge.js` - Initializes TextManager on DOM ready
4. Other application files

## Constants Structure

### Main Categories

```javascript
CONSTANTS = {
    PAGE_TITLE: '...',                    // Page title
    APP_TITLE: { ... },                   // App title components
    NAVIGATION: { ... },                  // Navigation labels
    SECTIONS: { ... },                    // Section headers
    BUTTONS: { ... },                     // Button labels
    FORM_LABELS: { ... },                 // Form field labels
    FORM_HELP: { ... },                   // Form help text
    DROPDOWN_OPTIONS: { ... },            // Dropdown options
    MODAL_TITLES: { ... },                // Modal titles
    ALERTS: { ... },                      // Alert messages
    FOOTER: { ... },                      // Footer text
    AVATAR_CATEGORIES: { ... },           // Avatar labels
    MESSAGES: { ... },                    // Error/validation messages
    // ... other categories
}
```

### Example Constants

```javascript
// Simple text
PAGE_TITLE: 'Hall of Fame - Classifica Giochi Famiglia',

// Nested objects
BUTTONS: {
    ADD_PLAYER: 'Aggiungi Giocatore',
    CANCEL: 'Annulla',
    SAVE: 'Salva'
},

// Complex nested structure
AVATAR_CATEGORIES: {
    FACES_EMOTIONS: {
        SORRIDENTE: 'Sorridente',
        FELICE: 'Felice'
    },
    PEOPLE: {
        DONNA: 'Donna',
        UOMO: 'Uomo'
    }
}
```

## TextManager Class

### Initialization

```javascript
// Automatic initialization (recommended)
document.addEventListener('DOMContentLoaded', () => {
    textManager.initialize();
});

// Manual initialization
textManager.initialize();
```

### Core Methods

#### 1. Automatic Text Updates

```javascript
// Updates all text content automatically
textManager.initialize();

// Individual update methods
textManager.updatePageTitle();
textManager.updateNavigationText();
textManager.updateSectionHeaders();
textManager.updateButtonLabels();
textManager.updateFormLabels();
textManager.updateModalTitles();
textManager.updateDropdownOptions();
textManager.updateFooterText();
```

#### 2. Dynamic Text Updates

```javascript
// Update specific element text
textManager.updateElementText('#my-button', 'New Text');

// Update multiple elements
textManager.updateElementsText(['#btn1', '#btn2'], 'New Text');

// Update modal title
textManager.updateModalTitle('myModal', 'New Modal Title');

// Update button with icon
textManager.updateButtonText('myButton', 'New Button', 'bi-icon');

// Update form label
textManager.updateFormLabel('input-id', 'New Label');

// Update dropdown option
textManager.updateDropdownOption('select-id', 'value', 'New Option Text');
```

#### 3. Constants Path Access

```javascript
// Get text from constants using dot notation
const text = textManager.getText('BUTTONS.ADD_PLAYER');
// Returns: 'Aggiungi Giocatore'

// Set text using constants path
textManager.setTextFromPath('#my-button', 'BUTTONS.ADD_PLAYER');
```

## Usage Examples

### 1. Adding New Text Constants

```javascript
// In constants-it.js
CONSTANTS.NEW_SECTION = {
    TITLE: 'Nuova Sezione',
    DESCRIPTION: 'Descrizione della nuova sezione',
    BUTTON: 'Aggiungi Nuovo'
};

// In your JavaScript
textManager.setTextFromPath('#new-section-title', 'NEW_SECTION.TITLE');
textManager.setTextFromPath('#new-section-desc', 'NEW_SECTION.DESCRIPTION');
textManager.updateButtonText('new-button', CONSTANTS.NEW_SECTION.BUTTON);
```

### 2. Dynamic Modal Text

```javascript
// Update modal for different contexts
function showEditPlayerModal(playerId) {
    textManager.updateModalTitle('addPlayerModal', CONSTANTS.MODAL_TITLES.EDIT_PLAYER);
    textManager.updateButtonText('player-submit-btn', CONSTANTS.BUTTONS.SAVE_CHANGES);
    // ... rest of modal logic
}

function showAddPlayerModal() {
    textManager.updateModalTitle('addPlayerModal', CONSTANTS.MODAL_TITLES.ADD_PLAYER);
    textManager.updateButtonText('player-submit-btn', CONSTANTS.BUTTONS.ADD);
    // ... rest of modal logic
}
```

### 3. Form Validation Messages

```javascript
// Use existing validation messages
try {
    Utils.validateName(name, existingItems, currentId, 'giocatore');
} catch (error) {
    // error.message will use CONSTANTS.MESSAGES.*
    alert(error.message);
}
```

### 4. Avatar Labels

```javascript
// Get avatar label from constants
const avatarLabel = CONSTANTS.AVATAR_CATEGORIES.FACES_EMOTIONS.SORRIDENTE;
// Returns: 'Sorridente'

// Use in avatar selector
const option = document.createElement('option');
option.value = '😊';
option.textContent = `${option.value} ${avatarLabel}`;
```

## Best Practices

### 1. Always Use Constants

```javascript
// ❌ DON'T do this
element.textContent = 'Aggiungi Giocatore';

// ✅ DO this
element.textContent = CONSTANTS.BUTTONS.ADD_PLAYER;
// or
textManager.setTextFromPath('#element', 'BUTTONS.ADD_PLAYER');
```

### 2. Use Descriptive Paths

```javascript
// ❌ DON'T do this
CONSTANTS.TEXT1 = 'Some text';

// ✅ DO this
CONSTANTS.BUTTONS.ADD_PLAYER = 'Aggiungi Giocatore';
CONSTANTS.FORM_LABELS.PLAYER_NAME = 'Nome Giocatore';
```

### 3. Group Related Constants

```javascript
// ✅ Good organization
CONSTANTS.BUTTONS = {
    ADD_PLAYER: 'Aggiungi Giocatore',
    ADD_GAME: 'Aggiungi Gioco',
    CANCEL: 'Annulla'
};

CONSTANTS.MESSAGES = {
    VALIDATION_ERROR: 'Errore di validazione',
    SUCCESS: 'Operazione completata'
};
```

### 4. Use TextManager for Dynamic Updates

```javascript
// ✅ Use TextManager for runtime updates
textManager.updateModalTitle('modalId', newTitle);
textManager.updateButtonText('buttonId', newText);

// ❌ Don't directly manipulate DOM
document.querySelector('#title').textContent = newTitle;
```

## Internationalization (i18n) Ready

The system is designed to support multiple languages:

```javascript
// Future i18n implementation
CONSTANTS.LANGUAGES = {
    IT: {
        BUTTONS: { ADD_PLAYER: 'Aggiungi Giocatore' }
    },
    EN: {
        BUTTONS: { ADD_PLAYER: 'Add Player' }
    }
};

// Language switching
function setLanguage(lang) {
    CONSTANTS.CURRENT_LANG = lang;
    textManager.initialize(); // Re-initialize with new language
}
```

## Migration Guide

### From Hardcoded Text to Constants

1. **Identify hardcoded text** in HTML
2. **Add to constants-it.js** in appropriate category
3. **Update HTML** to use data attributes or IDs
4. **Use TextManager** to populate text programmatically

### Example Migration

```html
<!-- Before -->
<button>Aggiungi Giocatore</button>

<!-- After -->
<button id="add-player-btn"></button>
```

```javascript
// In constants-it.js
CONSTANTS.BUTTONS.ADD_PLAYER = 'Aggiungi Giocatore';

// In JavaScript
textManager.setTextFromPath('#add-player-btn', 'BUTTONS.ADD_PLAYER');
```

## Troubleshooting

### Common Issues

1. **Text not updating**: Check if TextManager is initialized
2. **Constants not found**: Verify path exists in constants-it.js
3. **Element not found**: Check selector is correct
4. **Loading order**: Ensure constants-it.js loads before text-manager.js

### Debug Methods

```javascript
// Check if TextManager is initialized
console.log(textManager.initialized);

// Check if constants are loaded
console.log(CONSTANTS.BUTTONS.ADD_PLAYER);

// Test text path resolution
console.log(textManager.getText('BUTTONS.ADD_PLAYER'));
```

## Performance Considerations

- TextManager.initialize() runs once on page load
- Individual updates are lightweight
- Constants are cached in memory
- No performance impact on user interactions

## Future Enhancements

- **Template support** for complex text with variables
- **Pluralization support** for different languages
- **Context-aware text** based on user preferences
- **Text analytics** for usage tracking
- **Auto-translation** integration 