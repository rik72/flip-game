# Hall of Fame - Istruzioni di Sviluppo

## 📋 Panoramica Tecnica

Questo documento descrive la struttura del codice del progetto Hall of Fame e fornisce linee guida per lo sviluppo futuro. Il progetto è organizzato seguendo principi DRY (Don't Repeat Yourself) e modularità.

## 🏗️ Architettura del Codice

### 1. **Struttura Modulare (Architettura Manager)**

Il codice è organizzato in manager specializzati con separazione delle responsabilità.
Tutti i manager sono organizzati nella cartella **`/managers/`** per una struttura pulita e modulare.

```javascript
// Ordine di caricamento e dipendenze:
CONSTANTS → Utils → ModalManager → HtmlBuilder → DisplayManager → 
managers/StorageManager → managers/NavigationManager → managers/BackupManager → 
managers/AvatarManager → managers/PlayerManager → managers/StatsManager → 
managers/GameManager → managers/MatchManager → HallOfFameApp
```

#### **Manager Specializzati (in `/managers/`):**

- **StorageManager**: Gestione localStorage centralizzata
- **NavigationManager**: Navigazione tra sezioni con callback system
- **BackupManager**: Import/export dati con validazione
- **AvatarManager**: Sistema avatar, filtri, preview
- **PlayerManager**: CRUD giocatori con statistics integration
- **StatsManager**: Calcolo statistiche, ranking, podio
- **GameManager**: CRUD giochi, statistiche, tipologie
- **MatchManager**: CRUD partite, partecipanti, ordinamento

#### **HallOfFameApp**: Controller principale che coordina i manager

#### **CONSTANTS**
Oggetto centralizzato per tutte le configurazioni:
- `MESSAGES`: Tutti i messaggi di errore e notifiche
- `MODAL_TYPES`: Configurazioni per modali (titoli, bottoni)
- `POSITION_POINTS`: Punteggi per posizioni (winner: 2, participant: 1, last: 0)
- `GAME_TYPE_LABELS`: Etichette per tipi di gioco
- `POSITION_LABELS`: Etichette per posizioni con emoji
- `POSITION_BADGE_CLASSES`: Classi CSS per badge delle posizioni

#### **Utils** - Funzioni di Utilità
- `formatMessage(template, type)`: Formattazione messaggi con placeholder
- `validateName(name, existingItems, currentId, itemType)`: Validazione nomi univoci
- `confirmDelete(message)`: Conferma eliminazione
- `showModal(modalId)` / `hideModal(modalId)`: Gestione modali Bootstrap

#### **ModalManager** - Gestione Modali Unificata
- `setupModal(type, isEdit, data)`: Setup universale per modali add/edit
- `setupPlayerModal(isEdit, data)`: Configurazione specifica per player
- `setupGameModal(isEdit, data)`: Configurazione specifica per game

#### **HtmlBuilder** - Generazione HTML
- `createButton(text, className, onClick, icon)`: Bottoni standardizzati
- `createActionButtons(itemId, itemType)`: Bottoni Modifica/Elimina
- `createStatsBadge(icon, value, title)`: Badge con tooltip
- `createEmptyStateMessage(message)`: Messaggi stato vuoto
- `createParticipantSelector(players, selected...)`: Selettore partecipanti

#### **DisplayManager** - Gestione Display
- `renderEmptyState(container, message)`: Rendering stati vuoti
- `renderItemList(container, items, renderFunction)`: Rendering liste
- `createStatsDisplay(stats)`: Display statistiche con tooltip

#### **StorageManager** - Gestione localStorage
- `save(key, data)`: Salvataggio con prefisso automatico
- `load(key)`: Caricamento con deserializzazione JSON
- `remove(key)`, `exists(key)`, `clearAll()`: Operazioni gestione dati
- `getStorageInfo()`: Informazioni utilizzo spazio

#### **NavigationManager** - Navigazione Sezioni
- `showSection(sectionName, element)`: Cambio sezione con callback
- `registerSectionCallback(name, callback)`: Registrazione callback sezione
- `getCurrentSection()`: Sezione corrente attiva
- `goToPreviousSection()`, `goToNextSection()`: Navigazione sequenziale

#### **BackupManager** - Import/Export
- `exportData(data)`: Esporta dati in file .hof compresso
- `importData()`: Importa e valida dati da file .hof
- `showImportModal()`: Gestione modal importazione
- `createAutoBackup(data)`: Backup automatico in localStorage

#### **AvatarManager** - Sistema Avatar
- `createAvatar(emoji, size)`: Creazione elementi avatar HTML
- `updateAvatarPreview()`: Aggiornamento preview in tempo reale
- `filterAvatars(text)`: Filtro dinamico emoji
- `prepareForNewPlayer()`, `prepareForEditPlayer()`: Setup per modali

#### **PlayerManager** - CRUD Giocatori
- `addPlayer()`, `editPlayer()`, `deletePlayer()`: Operazioni CRUD
- `displayPlayers()`: Rendering lista giocatori con statistiche
- `calculatePlayerStats(id)`: Calcolo statistiche individuali
- `searchPlayers(term)`: Ricerca giocatori per nome

#### **StatsManager** - Statistiche e Ranking
- `calculatePlayerStats(id)`: Statistiche complete giocatore
- `getRanking(sortBy)`: Ranking ordinato per criterio
- `displayPodium()`: Rendering podio top 3
- `displayFullRanking()`: Classifica completa con tooltip
- `getOverallStats()`: Statistiche aggregate globali

### 2. **Principi di Design**

#### **Struttura Attuale:**
```javascript
// Implementazione unificata per validazioni
try {
    Utils.validateName(name, this.players, null, 'giocatore');
} catch (error) {
    alert(error.message);
    return;
}
```

#### **Benefici dell'Architettura Manager:**
- ✅ **Single Source of Truth** per configurazioni
- ✅ **Separation of Concerns** tra logica, UI e dati  
- ✅ **Reusable Components** per operazioni comuni
- ✅ **Consistent Patterns** in tutto il codebase
- ✅ **Modular Architecture** con manager specializzati
- ✅ **Delegation Pattern** nella classe principale
- ✅ **Testability** di ogni manager individualmente
- ✅ **Scalability** per nuove funzionalità

#### **Pattern di Delegazione:**
```javascript
// HallOfFameApp delega ai manager invece di implementare direttamente
class HallOfFameApp {
    constructor() {
        this.storageManager = new StorageManager();
        this.playerManager = new PlayerManager(this.storageManager, ...);
        // ...altri manager
    }
    
    // Metodi delegano ai manager appropriati
    addPlayer() {
        return this.playerManager.addPlayer();
    }
    
    displayPodium() {
        return this.statsManager.displayPodium();
    }
}
```

## 🎨 Architettura CSS

### **Utility Classes**
```css
.card-base         /* Stile base per tutte le card */
.gradient-*        /* Gradienti standardizzati */
.performance-base  /* Base per valori performance */
.bg-soft          /* Background semi-trasparente */
.shadow-soft      /* Ombra standardizzata */
```

### **Pattern Consolidati**
- Tutte le card ereditano da `.card-base`
- Hover effects unificati con `transform: translateY(-5px)`
- Performance classes con gradienti e ombre coerenti
- Border radius standardizzato (15px-20px)

### **Regole CSS Selettori**
- ❌ **MAI usare** selettori basati su classi Bootstrap (`.mt-3`, `.d-flex`, `.justify-content-*`)
- ✅ **SEMPRE creare** classi custom semantiche (`.card-actions`, `.ranking-header`)
- ✅ **Consentito** override di stili Bootstrap (`.btn-primary`, `.form-control`)
- ✅ **Consentito** selettori su classi custom contenenti Bootstrap (`.my-container .form-select`)

## 🔧 Pattern di Sviluppo

### **1. Aggiunta Nuovi Entity Types**

Per aggiungere un nuovo tipo (es. "tournaments"):

1. **Aggiorna CONSTANTS:**
```javascript
MODAL_TYPES: {
    TOURNAMENT: {
        name: 'torneo',
        addTitle: 'Aggiungi Torneo',
        editTitle: 'Modifica Torneo',
        addButton: 'Aggiungi',
        editButton: 'Salva Modifiche'
    }
}
```

2. **Estendi ModalManager:**
```javascript
static setupTournamentModal(isEdit, data, modalConfig) {
    // Logica specifica per tournament
}
```

3. **Usa pattern standard:**
```javascript
showAddTournamentModal() {
    ModalManager.setupModal('tournament', false);
}
```

### **2. Aggiunta Nuovi Messaggi**
Tutti i messaggi vanno in `CONSTANTS.MESSAGES`:
```javascript
MESSAGES: {
    NEW_MESSAGE: 'Nuovo messaggio con {placeholder}'
}
```

### **3. Nuovi Componenti HTML**
Usa `HtmlBuilder` per componenti riutilizzabili:
```javascript
static createNewComponent(data) {
    return `<div class="new-component">${data}</div>`;
}
```

## 📊 Standard di Qualità

### **Indicatori Target**
- **Duplicazione codice**: 0%
- **Messaggi hardcoded**: 0%
- **Consistenza pattern**: 100%
- **Copertura utility functions**: 100%

### **Obiettivi di Manutenibilità**
- Modifiche centralizzate in punti specifici
- Pattern riutilizzabili per operazioni comuni
- Consistenza garantita dall'architettura
- Scalabilità per nuovi entity types

## 🚀 Best Practices per Sviluppi Futuri

### **1. Sempre usare le Utility Classes**
```javascript
// ❌ NON fare così
if (!name) {
    alert('Inserisci il nome');
}

// ✅ Fare così
Utils.validateName(name, existingItems, currentId, 'entityType');
```

### **2. Centralizzare configurazioni**
```javascript
// ❌ NON hardcodare
const message = 'Errore durante il salvataggio';

// ✅ Usare CONSTANTS
const message = CONSTANTS.MESSAGES.SAVE_ERROR;
```

### **3. Riutilizzare componenti HTML**
```javascript
// ❌ NON duplicare HTML
const html = `<button class="btn btn-primary" onclick="...">Modifica</button>`;

// ✅ Usare HtmlBuilder
const html = HtmlBuilder.createButton('Modifica', 'btn-primary', onclick, 'bi-pencil');
```

### **4. Seguire pattern di display**
```javascript
// ✅ Pattern standard per liste
if (!DisplayManager.renderItemList(container, items, this.renderItem.bind(this))) {
    DisplayManager.renderEmptyState(container, 'Nessun elemento trovato');
}
```

## 🔍 Testing e Debugging

### **Punti di Controllo**
1. **Costanti**: Verificare che tutti i testi siano in `CONSTANTS`
2. **Validazioni**: Controllare che usino `Utils.validateName()`
3. **Modali**: Verificare che usino `ModalManager.setupModal()`
4. **HTML**: Controllare che usino `HtmlBuilder` per elementi comuni
5. **CSS**: Verificare che le nuove classi estendano quelle base

### **Strumenti di Sviluppo**
- Browser Dev Tools per verificare CSS
- Console per errori JavaScript
- Network tab per prestazioni
- Lighthouse per audit qualità

## 📚 Risorse e Riferimenti

- **Bootstrap 5.3.3**: Framework CSS utilizzato
- **Bootstrap Icons**: Set di icone
- **JSZip**: Libreria per backup/restore
- **Vanilla JavaScript**: Nessuna dipendenza aggiuntiva

## 🎯 Roadmap Tecnica

### **Estensioni Possibili**
1. **TypeScript**: Aggiungere type safety
2. **Module System**: Separare in file multipli
3. **Testing**: Aggiungere unit tests
4. **PWA**: Progressive Web App features
5. **Internazionalizzazione**: Supporto multi-lingua

### **Architettura Preparata Per:**
- Separazione in moduli ES6
- Aggiunta nuovi entity types
- Estensione componenti UI
- Implementazione testing automatico
- Integrazione con framework moderni 