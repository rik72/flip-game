# Flipgame - Istruzioni di Sviluppo

## 📋 Panoramica Tecnica

Questo documento descrive la struttura del codice del progetto Flipgame e fornisce linee guida per lo sviluppo futuro. Il progetto è organizzato seguendo principi DRY (Don't Repeat Yourself) e modularità, ottimizzato per dispositivi mobili.

## 🏗️ Architettura del Codice

### 1. **Struttura Modulare (Architettura Manager)**

Il codice è organizzato in manager specializzati con separazione delle responsabilità.
Tutti i manager sono organizzati nella cartella **`/managers/`** per una struttura pulita e modulare.

```javascript
// Ordine di caricamento e dipendenze:
CONSTANTS → Utils → HtmlBuilder → DisplayManager → 
managers/StorageManager → managers/GameManager → App
```

#### **Manager Specializzati (in `/managers/`):**

- **StorageManager**: Gestione localStorage centralizzata per salvataggio progresso

- **GameManager**: Logica di gioco, gestione livelli, meccaniche puzzle

#### **App**: Controller principale che coordina i manager

#### **CONSTANTS**
Oggetto centralizzato per tutte le configurazioni:
- `MESSAGES`: Tutti i messaggi di errore e notifiche

- `GAME_CONFIG`: Configurazioni di gioco (livelli, meccaniche, difficoltà)
- `CANVAS_CONFIG`: Configurazioni canvas (dimensioni, performance)
- `TOUCH_CONFIG`: Configurazioni touch (sensitivity, gesture recognition)

#### **Utils** - Funzioni di Utilità
- `formatMessage(template, type)`: Formattazione messaggi con placeholder
- `validateLevelData(levelData)`: Validazione dati livello
- `confirmAction(message)`: Conferma azioni importanti




#### **HtmlBuilder** - Generazione HTML
- `createButton(text, className, onClick, icon)`: Bottoni standardizzati
- `createCanvas(id, className)`: Canvas ottimizzati per mobile
- `createTouchArea(id, className)`: Aree touch interattive
- `createGameUI()`: Interfaccia di gioco completa

#### **DisplayManager** - Gestione Display
- `renderEmptyState(container, message)`: Rendering stati vuoti
- `renderGameState(container, gameState)`: Rendering stato di gioco
- `renderLevelNumber(level)`: Rendering numero livello grafico

#### **StorageManager** - Gestione localStorage
- `save(key, data)`: Salvataggio con prefisso automatico
- `load(key)`: Caricamento con deserializzazione JSON
- `remove(key)`, `exists(key)`, `clearAll()`: Operazioni gestione dati
- `getStorageInfo()`: Informazioni utilizzo spazio
- `saveGameProgress(level)`: Salvataggio progresso gioco
- `loadGameProgress()`: Caricamento progresso gioco

#### **GameManager** - Logica di Gioco
- `loadLevel(levelNumber)`: Caricamento livello specifico
- `handleTouch(x, y)`: Gestione input touch
- `checkWinCondition()`: Verifica completamento livello
- `nextLevel()`: Passaggio al livello successivo
- `resetLevel()`: Reset livello corrente
- `rotateBoard(degrees)`: Rotazione board di gioco
- `flipBoard()`: Flip board di gioco

### 2. **Principi di Design**

#### **Struttura Attuale:**
```javascript
// Implementazione unificata per validazioni
try {
    Utils.validateLevelData(levelData);
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
- ✅ **Mobile Optimization** per touch interactions

#### **Pattern di Delegazione:**
```javascript
// App delega ai manager invece di implementare direttamente
class App {
    constructor() {
        this.storageManager = new StorageManager();
        this.gameManager = new GameManager(this.storageManager, ...);
        // ...altri manager
    }
    
    // Metodi delegano ai manager appropriati
    handleTouch(x, y) {
        return this.gameManager.handleTouch(x, y);
    }
    
    loadLevel(levelNumber) {
        return this.gameManager.loadLevel(levelNumber);
    }
}
```

## 🎨 Architettura CSS

### **Utility Classes**
```css
.game-canvas         /* Stile base per canvas di gioco */
.touch-area          /* Aree touch interattive */
.game-ui             /* Elementi UI del gioco */
.mobile-optimized    /* Ottimizzazioni per mobile */
```

### **Pattern Consolidati**
- Tutti i canvas ereditano da `.game-canvas`
- Touch areas con dimensioni minime per accessibilità
- Game UI responsive con viewport units
- Performance ottimizzata per mobile

### **Regole CSS Selettori**
- ❌ **MAI usare** selettori basati su classi Bootstrap (`.mt-3`, `.d-flex`, `.justify-content-*`)
- ✅ **SEMPRE creare** classi custom semantiche (`.game-controls`, `.level-display`)
- ✅ **Consentito** override di stili Bootstrap (`.btn-primary`, `.form-control`)
- ✅ **Consentito** selettori su classi custom contenenti Bootstrap (`.my-container .form-select`)

## 🎮 Pattern di Sviluppo

### **1. Aggiunta Nuove Funzionalità di Gioco**

Per aggiungere una nuova funzionalità (es. "power-ups"):

1. **Aggiorna CONSTANTS:**
```javascript
GAME_CONFIG: {
    POWER_UPS: {
        enabled: true,
        types: ['speed', 'jump', 'teleport'],
        settings: {...}
    }
}
```

2. **Estendi GameManager:**
```javascript
static handlePowerUp(type, position) {
    // Logica specifica per power-up
}
```

3. **Usa pattern standard:**
```javascript
activatePowerUp(type) {
    
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
static createNewGameComponent(data) {
    return `<div class="game-component">${data}</div>`;
}
```

## 📊 Standard di Qualità

### **Indicatori Target**
- **Duplicazione codice**: 0%
- **Messaggi hardcoded**: 0%
- **Consistenza pattern**: 100%
- **Copertura utility functions**: 100%
- **Mobile performance**: 60fps su dispositivi target

### **Obiettivi di Manutenibilità**
- Modifiche centralizzate in punti specifici
- Pattern riutilizzabili per operazioni comuni
- Consistenza garantita dall'architettura
- Scalabilità per nuove funzionalità di gioco
- Performance ottimizzata per mobile

## 🚀 Best Practices per Sviluppi Futuri

### **1. Sempre usare le Utility Classes**
```javascript
// ❌ NON fare così
if (!levelData) {
    alert('Dati livello mancanti');
}

// ✅ Fare così
Utils.validateLevelData(levelData);
```

### **2. Centralizzare configurazioni**
```javascript
// ❌ NON hardcodare
const canvasWidth = 800;
const canvasHeight = 600;

// ✅ Usare CONSTANTS
const canvasWidth = CONSTANTS.CANVAS_CONFIG.width;
const canvasHeight = CONSTANTS.CANVAS_CONFIG.height;
```

### **3. Riutilizzare componenti HTML**
```javascript
// ❌ NON duplicare HTML
const html = `<canvas id="gameCanvas" class="game-canvas"></canvas>`;

// ✅ Usare HtmlBuilder
const html = HtmlBuilder.createCanvas('gameCanvas', 'game-canvas');
```

### **4. Seguire pattern di display**
```javascript
// ✅ Pattern standard per stati di gioco
if (!DisplayManager.renderGameState(container, gameState)) {
    DisplayManager.renderEmptyState(container, 'Stato gioco non disponibile');
}
```

### **5. Ottimizzare per Mobile**
```javascript
// ✅ Gestire touch events correttamente
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
```

## 🔍 Testing e Debugging

### **Punti di Controllo**
1. **Costanti**: Verificare che tutti i testi siano in `CONSTANTS`
2. **Validazioni**: Controllare che usino `Utils`

4. **HTML**: Controllare che usino `HtmlBuilder` per elementi comuni
5. **CSS**: Verificare che le nuove classi estendano quelle base
6. **Touch**: Testare gesture handling su dispositivi mobili
7. **Performance**: Verificare frame rate su dispositivi target

### **Strumenti di Sviluppo**
- Browser Dev Tools per verificare CSS
- Console per errori JavaScript
- Network tab per prestazioni
- Lighthouse per audit qualità
- Device emulation per test mobile

## 📚 Risorse e Riferimenti

- **HTML5 Canvas**: Per rendering di gioco
- **Touch Events API**: Per gesture handling
- **CSS Grid/Flexbox**: Per layout responsive
- **Vanilla JavaScript**: Nessuna dipendenza aggiuntiva
- Device pixel ratio aware canvas scaling; no external canvas library needed

## 🎯 Roadmap Tecnica

### **Estensioni Possibili**
1. **TypeScript**: Aggiungere type safety
2. **Module System**: Separare in file multipli
3. **Testing**: Aggiungere unit tests
4. **PWA**: Progressive Web App features
5. **WebGL**: Accelerazione hardware per grafica
6. **Audio API**: Effetti sonori e musica

### **Architettura Preparata Per:**
- Separazione in moduli ES6
- Aggiunta nuove meccaniche di gioco
- Estensione componenti UI
- Implementazione testing automatico
- Integrazione con framework moderni
- Ottimizzazioni performance mobile 