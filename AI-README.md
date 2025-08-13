# AI Assistant Setup - Flipgame Project

## 🚨 AUTOMATED COMPLIANCE SYSTEM

Questo progetto utilizza un **sistema di compliance automatico** per garantire che ogni AI assistant segua le regole architetturali senza intervento manuale.

---

## 📁 File di Configurazione AI

### **File Automatici per AI:**
```
.ai-context.md              # 🔴 LETTURA OBBLIGATORIA immediata
.ai-development-rules.md     # 📋 Regole complete non negoziabili  
.ai-assistant-config.json    # ⚙️ Configurazione JSON machine-readable
.cursor-rules               # 🎯 Regole specifiche per Cursor AI
validate-compliance.js      # 🔍 Script validazione automatica
```

### **Documentazione Tecnica:**
```
CODE_INSTRUCTIONS.md        # 🏗️ Architettura tecnica completa
README.md                   # 📖 Documentazione progetto
CHANGELOG.md                # 📋 Cronologia implementazioni
```

---

## 🤖 Setup Automatico per AI Assistant

### **Step 1: Lettura Obbligatoria**
Ogni AI DEVE leggere automaticamente al primo accesso:
1. **`.ai-context.md`** - Contesto immediato e checklist
2. **`.ai-development-rules.md`** - Regole complete

### **Step 2: Configurazione Automatica**
Gli AI assistant compatibili possono:
- Caricare **`.ai-assistant-config.json`** per configurazione machine-readable
- Utilizzare **`.cursor-rules`** se sono Cursor AI
- Eseguire **`validate-compliance.js`** per validazione automatica

### **Step 3: Enforcement Automatico**
Il sistema applica automaticamente:
- ✅ **Zero tolerance** per duplicazioni
- ✅ **Pattern obbligatori** per ogni operazione
- ✅ **Utility classes** per funzioni comuni
- ✅ **CONSTANTS** per tutti i messaggi

---

## 🔧 Integrazione AI Assistant

### **Per AI Assistant Generici:**
```javascript
// Carica configurazione automatica
const config = require('./.ai-assistant-config.json');

// Applica regole obbligatorie
const rules = config.ai_compliance.mandatory_patterns;
const forbidden = config.ai_compliance.forbidden_patterns;

// Valida prima di suggerire modifiche
const validator = require('./validate-compliance.js');
```

### **Per Cursor AI:**
Il file `.cursor-rules` viene letto automaticamente e applica:
- Regole immediate per ogni modifica
- Pattern obbligatori hardcoded
- Blocco automatico violazioni

### **Per Altri IDE/AI:**
Utilizzare `.ai-assistant-config.json` per:
- Configurazione strutturata
- Machine-readable rules
- Automated enforcement

---

## 🎯 Funzionamento Automatico

### **Processo Standard:**
1. **AI accede al progetto** → Legge automaticamente `.ai-context.md`
2. **AI pianifica modifiche** → Controlla pattern in `.ai-assistant-config.json`
3. **AI suggerisce codice** → Applica regole obbligatorie automaticamente
4. **Validazione automatica** → `validate-compliance.js` verifica compliance

### **Enforcement Levels:**
- 🔴 **CRITICAL**: Violazioni architettura → Blocco immediato
- 🟠 **HIGH**: Duplicazioni/hardcoding → Correzione obbligatoria  
- 🟡 **MEDIUM**: Pattern non ottimali → Warning con suggerimento
- 🔵 **INFO**: Miglioramenti possibili → Suggerimento opzionale

---

## 📋 Checklist Automatica AI

### **Pre-Modifica (Automatico):**
- [ ] ✅ Letto `.ai-context.md`
- [ ] ✅ Verificato pattern esistenti
- [ ] ✅ Controllato utility classes disponibili
- [ ] ✅ Confermato zero duplicazioni

### **Durante Modifica (Enforcement):**
- [ ] ✅ Uso `Utils.validateLevelData()` per validazioni

- [ ] ✅ Uso `HtmlBuilder.*` per HTML
- [ ] ✅ Uso `DisplayManager.*` per stati vuoti
- [ ] ✅ Uso manager appropriati per business logic:
  - `StorageManager` per localStorage
  - `GameManager` per logica di gioco
- [ ] ✅ Delego operazioni a manager invece di codice diretto
- [ ] ✅ Aggiungo messaggi in `CONSTANTS.MESSAGES`

### **Post-Modifica (Validazione):**
- [ ] ✅ Eseguito `npm run validate`
- [ ] ✅ Zero violazioni compliance
- [ ] ✅ Pattern mantenuti
- [ ] ✅ Architettura preservata

---

## 🎮 Level Trimming Operations

### **When trimming level board faces:**
1. **Maintain dimensional consistency** - Both front and rear faces must have identical dimensions
2. **Remove empty rows** - Eliminate rows containing only dots (empty spaces) EXCEPT when needed for front/rear relative positioning
3. **Remove empty columns** - Eliminate columns containing only dots (empty spaces) from both start and end
4. **Update ball coordinates** - Adjust all coordinates in the "balls" section to reflect new positions:
   - **X coordinates** (columns): Adjust if columns were removed from start/end
   - **Y coordinates** (rows): Adjust if rows were removed
5. **Preserve game logic** - Ensure ball paths and game mechanics remain intact
6. **Maintain relative positioning** - Keep empty rows with dots when necessary to preserve front/rear spatial relationships

### **Trimming Process:**
```json
// Before trimming (example)
{
    "board": {
        "front": [
            "......",  // Row 0 - empty
            ".1111.",  // Row 1 - has content
            "......",  // Row 2 - empty
            "......"   // Row 3 - empty
        ],
        "rear": [
            "......",  // Row 0 - empty
            "......",  // Row 1 - empty
            ".2222.",  // Row 2 - has content
            "......"   // Row 3 - empty
        ]
    },
    "balls": [
        {
            "start": [1, 1],  // Row 1, Column 1
            "end": [4, 1],    // Row 1, Column 4
            "color": "red"
        },
        {
            "start": [-1, 2], // Row 2, Column -1
            "end": [-4, 2],   // Row 2, Column -4
            "color": "blue"
        }
    ]
}

// After row trimming only
{
    "board": {
        "front": [
            ".1111.",  // Row 0 (was Row 1)
            "......"   // Row 1 (empty)
        ],
        "rear": [
            "......",  // Row 0 (empty)
            ".2222."   // Row 1 (was Row 2)
        ]
    },
    "balls": [
        {
            "start": [1, 0],  // Row 0 (was Row 1), Column 1
            "end": [4, 0],    // Row 0 (was Row 1), Column 4
            "color": "red"
        },
        {
            "start": [-1, 1], // Row 1 (was Row 2), Column -1
            "end": [-4, 1],   // Row 1 (was Row 2), Column -4
            "color": "blue"
        }
    ]
}

// After row AND column trimming
{
    "board": {
        "front": [
            "1111",   // Row 0, trimmed columns (was ".1111.")
            "...."    // Row 1, empty with dots (maintains relative positioning)
        ],
        "rear": [
            "....",   // Row 0, empty with dots (maintains relative positioning)
            "2222"    // Row 1, trimmed columns (was ".2222.")
        ]
    },
    "balls": [
        {
            "start": [0, 0],  // Row 0, Column 0 (was [1, 0])
            "end": [3, 0],    // Row 0, Column 3 (was [4, 0])
            "color": "red"
        },
        {
            "start": [-1, 1], // Row 1, Column -1 (unchanged)
            "end": [-4, 1],   // Row 1, Column -4 (unchanged)
            "color": "blue"
        }
    ]
}
```

### **Coordinate Adjustment Rules:**
- **Row removal**: Subtract the number of removed rows from Y coordinates
- **Column removal from start**: Subtract the number of removed columns from positive X coordinates
- **Column removal from end**: Adjust negative X coordinates if columns were removed from the end
- **Negative coordinates**: Handle negative coordinates appropriately (they represent positions from the right/bottom)
- **Validation**: Always verify that adjusted coordinates fall within the new board dimensions

### **Row Trimming Logic:**
- **Empty rows**: Remove rows containing only dots EXCEPT when needed for front/rear relative positioning
- **Relative positioning**: Keep empty rows with dots if they maintain spatial relationship between front and rear faces
- **Game mechanics**: Empty rows with dots represent valid grid positions and cannot be completely eliminated

### **Column Trimming Logic:**
- **Start columns**: Remove leading empty columns (containing only dots)
- **End columns**: Remove trailing empty columns (containing only dots)
- **Mixed content**: Keep columns that contain any non-dot content in any row
- **Coordinate mapping**: Map old column positions to new positions after trimming

---

## 🚀 Comandi di Validazione

### **Validazione Manuale:**
```bash
# Validazione compliance completa
npm run validate

# Controllo + avvio server
npm run start

# Solo controllo compliance
npm run check-compliance
```

### **Validazione Automatica:**
```javascript
// In AI assistant script
const ComplianceValidator = require('./validate-compliance.js');
const validator = new ComplianceValidator();
const isCompliant = validator.validateCodeCompliance();

if (!isCompliant) {
    throw new Error('Code modifications violate Flipgame standards');
}
```

---

## 🎛️ Configurazione Avanzata

### **Customizzazione per Specifici AI:**
Modifica `.ai-assistant-config.json` per:
- Aggiungere pattern specifici
- Definire nuovi enforcement levels
- Estendere validazioni automatiche

### **Estensione Validation Script:**
Modifica `validate-compliance.js` per:
- Aggiungere nuovi controlli
- Personalizzare report output
- Integrare con CI/CD

### **AI Context Personalizzato:**
Aggiorna `.ai-context.md` per:
- Nuovi quick reference
- Pattern specifici progetto
- Checklist personalizzate

---

## 🔒 Garanzie di Qualità

### **Questo sistema garantisce:**
- ✅ **Zero regressioni** architetturali
- ✅ **Consistenza** automatica del codice
- ✅ **Pattern compliance** obbligatoria
- ✅ **Manutenibilità** preservata
- ✅ **Scalabilità** garantita

### **Risultato finale:**
Ogni AI assistant, indipendentemente dal tipo, seguirà automaticamente le regole del progetto Flipgame senza necessità di istruzioni manuali ripetute.

---

## 🆘 Supporto e Troubleshooting

### **Per problemi di compliance:**
1. Esegui `npm run validate` per dettagli specifici
2. Consulta `.ai-development-rules.md` per regole complete
3. Verifica pattern in `CODE_INSTRUCTIONS.md`

### **Per configurazione AI:**
1. Controlla `.ai-assistant-config.json` per settings
2. Verifica `.cursor-rules` per Cursor specifico
3. Aggiorna `.ai-context.md` per nuovi context

**Il sistema è progettato per essere auto-esplicativo e auto-enforcing! 🚀** 