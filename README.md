# Hall of Fame - Classifica Giochi Famiglia 🏆

Un'applicazione web per gestire classifiche di giochi familiari con sistema di punteggi, statistiche e backup dei dati.

## 🚀 Caratteristiche Principali

- **Gestione Giocatori**: Aggiunta, modifica ed eliminazione giocatori con avatar personalizzati
- **Catalogo Giochi**: Organizzazione giochi per tipologia (tavolo, carte, giardino, sport)
- **Registrazione Partite**: Sistema di punteggi con posizioni (Vincitore: 2pt, Piazzamento: 1pt, Ultimo: 0pt)
- **Classifica Dinamica**: Podio e ranking completo con calcolo performance
- **Backup/Restore**: Esportazione e importazione dati in formato .hof
- **Design Responsive**: Interfaccia moderna e mobile-friendly

## 📁 Struttura del Progetto

```
halloffame/
├── index.html                 # Interfaccia utente principale
├── constants.js               # Costanti e configurazioni centrali
├── utils.js                   # Funzioni di utilità e validazioni
├── modal-manager.js           # Gestione modali standardizzata
├── html-builder.js            # Generazione HTML riutilizzabile
├── display-manager.js         # Pattern di visualizzazione comuni
├── managers/                  # 📁 Manager specializzati (architettura modulare)
│   ├── storage-manager.js     # 🆕 Gestione localStorage centralizzata
│   ├── navigation-manager.js  # 🆕 Navigazione sezioni con callback
│   ├── backup-manager.js      # 🆕 Import/export dati avanzato
│   ├── avatar-manager.js      # 🆕 Sistema avatar e filtri
│   ├── player-manager.js      # 🆕 CRUD giocatori e statistiche
│   ├── stats-manager.js       # 🆕 Calcolo ranking e podio
│   ├── game-manager.js        # 🆕 CRUD giochi e statistiche
│   └── match-manager.js       # 🆕 CRUD partite e partecipanti
├── hall-of-fame.js            # Controller principale (architettura manager)
├── app-bridge.js              # Funzioni globali e inizializzazione
├── validate-compliance.js     # Script validazione compliance automatica
├── styles.css                 # Stili CSS consolidati  
├── README.md                  # Documentazione progetto
├── CODE_INSTRUCTIONS.md       # Istruzioni tecniche dettagliate
├── AI-README.md               # Setup automatico per AI assistant
├── .ai-development-rules.md   # Regole obbligatorie per AI development
└── .gitignore                 # File da escludere dal versioning
```

## 🏗️ Architettura del Codice

### **Architettura Manager (Modularizzata):**
```javascript
constants.js → utils.js → modal-manager.js → html-builder.js → display-manager.js → 
storage-manager.js → navigation-manager.js → backup-manager.js → 
avatar-manager.js → player-manager.js → stats-manager.js → 
hall-of-fame.js → app-bridge.js
```

**Manager Specializzati (Nuova Architettura - `/managers/`):**
- **`managers/storage-manager.js`**: Gestione localStorage centralizzata e sicura
- **`managers/navigation-manager.js`**: Navigazione sezioni con sistema callback
- **`managers/backup-manager.js`**: Import/export avanzato con validazione dati
- **`managers/avatar-manager.js`**: Sistema avatar, filtri dinamici, preview
- **`managers/player-manager.js`**: CRUD giocatori, statistiche, validazioni
- **`managers/stats-manager.js`**: Calcolo ranking, performance, podio dinamico
- **`managers/game-manager.js`**: CRUD giochi, statistiche, tipologie
- **`managers/match-manager.js`**: CRUD partite, partecipanti, ordinamento

**Moduli Base (Invariati):**
- **`constants.js`**: Configurazioni centrali e messaggi
- **`utils.js`**: Funzioni di utilità (validazioni, modali)  
- **`modal-manager.js`**: Gestione unificata modali add/edit
- **`html-builder.js`**: Generazione HTML standardizzata
- **`display-manager.js`**: Pattern comuni di visualizzazione
- **`hall-of-fame.js`**: **Controller principale** che coordina i manager
- **`app-bridge.js`**: Funzioni globali e inizializzazione app

### **🏆 Benefici della Nuova Architettura:**
- ✅ **Separation of Concerns**: Ogni manager ha responsabilità specifiche
- ✅ **Testabilità**: Manager individuali completamente testabili
- ✅ **Manutenibilità**: Modifiche isolate senza impact trasversali
- ✅ **Scalabilità**: Facile aggiungere nuovi manager o funzionalità
- ✅ **Riusabilità**: Manager utilizzabili in altri contesti
- ✅ **Performance**: Caricamento ottimizzato e gestione memoria
- ✅ **Debugging**: Errori localizzati nei manager specifici

## 🤖 Sistema di Compliance Automatico per AI

Questo progetto include un **sistema avanzato di compliance automatico** che garantisce che qualsiasi AI assistant segua automaticamente le regole architetturali senza intervento manuale.

### **File di Configurazione AI:**
```
.ai-context.md              # Contesto immediato per AI (lettura obbligatoria)
.ai-development-rules.md     # Regole complete non negoziabili
.ai-assistant-config.json    # Configurazione machine-readable
.cursor-rules               # Regole specifiche per Cursor AI
validate-compliance.js      # Script validazione automatica
AI-README.md                # Guida completa per setup AI
```

### **Benefici per AI Assistant:**
- ✅ **Compliance automatica** senza istruzioni manuali
- ✅ **Zero duplicazioni** garantite dall'architettura
- ✅ **Pattern enforcement** automatico
- ✅ **Validazione real-time** del codice
- ✅ **Regole self-enforcing** per qualsiasi AI

### **Comandi di Validazione:**
```bash
npm run validate          # Validazione compliance completa
npm run check-compliance  # Controllo veloce + conferma
npm run start            # Validazione + avvio server
```

## 🚀 Avvio Rapido

### **Prerequisiti**
- Browser moderno (Chrome, Firefox, Safari, Edge)
- Node.js 14+ (per validazione compliance)
- Server web locale (opzionale per sviluppo)

### **Installazione**
```bash
# Clona il repository
git clone https://github.com/rik72/hall-of-fame.git

# Entra nella directory
cd hall-of-fame

# Installa dipendenze (opzionale, per validazione)
npm install

# Avvia con validazione automatica
npm start

# Oppure solo il server web
python3 -m http.server 8088
```

### **Utilizzo**
1. Apri `index.html` nel browser o vai su `http://localhost:8088`
2. Aggiungi giocatori dalla sezione "Giocatori"
3. Aggiungi giochi dalla sezione "Giochi"
4. Registra partite dalla sezione "Partite"
5. Visualizza la classifica nel "Podium"

## 💾 Sistema di Backup

### **Esportazione**
- Clicca su "Backup" → "Esporta Backup"
- Viene creato un file `.hof` con tutti i dati
- Il file contiene: giocatori, giochi, partite + metadati

### **Importazione**
- Clicca su "Backup" → "Importa Backup"
- Seleziona un file `.hof` precedentemente esportato
- Conferma la sostituzione dei dati attuali

## 🛠️ Sviluppo

### **Per Sviluppatori**
1. **Leggi** `CODE_INSTRUCTIONS.md` per l'architettura completa
2. **Segui** `.ai-development-rules.md` per standard di sviluppo
3. **Usa sempre** i moduli utility esistenti (zero duplicazioni!)
4. **Testa** le modifiche con `npm run validate`

### **Per AI Assistant**
1. **Leggi automaticamente** `.ai-context.md` al primo accesso
2. **Carica configurazione** da `.ai-assistant-config.json`
3. **Applica regole** da `.ai-development-rules.md`
4. **Valida sempre** con `validate-compliance.js`

### **Aggiunta Nuove Funzionalità**
```javascript
// 1. Aggiungi configurazioni in constants-it.js
CONSTANTS.MESSAGES.NEW_FEATURE = 'Messaggio per nuova feature';

// 2. Usa utility modules esistenti
Utils.validateName(name, items, id, 'entity');           // da utils.js
ModalManager.setupModal('entity', false);                // da modal-manager.js
HtmlBuilder.createButton('Azione', 'btn-primary', callback); // da html-builder.js

// 3. Segui i pattern consolidati
DisplayManager.renderEmptyState(container, message);     // da display-manager.js

// 4. Valida compliance
npm run validate
```

### **Tecnologie Utilizzate**
- **Frontend**: Vanilla JavaScript ES6+, HTML5, CSS3
- **Framework CSS**: Bootstrap 5.3.3
- **Icone**: Bootstrap Icons 1.11.3
- **Backup**: JSZip 3.10.1
- **Storage**: LocalStorage API
- **Compliance**: Node.js per validazione automatica

## 📊 Sistema di Punteggi

### **Posizioni e Punti**
- 🏆 **Vincitore**: 2 punti
- 🥈 **Piazzamento**: 1 punto  
- 😞 **Ultimo posto**: 0 punti

### **Performance**
Calcolata come percentuale dei punti ottenuti sul massimo possibile:
```
Performance = (Punti Totali / (Partite × 2)) × 100
```

### **Classifica**
- **Ordinamento primario**: Punti totali
- **Ordinamento secondario**: Numero vittorie
- **Ordinamento terziario**: Partite giocate (meno = meglio)

## 🎨 Personalizzazione

### **Avatar Giocatori**
- Oltre 400 emoji disponibili
- Filtro di ricerca per categoria
- Anteprima in tempo reale
- Supporto emoji con toni di pelle

### **Temi e Stili**
- Gradiente di sfondo personalizzabile
- Animazioni fluide e moderne
- Design responsive mobile-first
- Dark/Light mode ready (CSS variables)

## 🤝 Contribuzione

### **Come Contribuire**
1. **Fork** del repository
2. **Crea** branch per la feature: `git checkout -b feature/nuova-feature`
3. **Segui** le regole in `.ai-development-rules.md`
4. **Testa** le modifiche con `npm run validate`
5. **Commit** con messaggi descrittivi
6. **Push** e crea Pull Request

### **Standard di Qualità**
- ✅ Zero duplicazioni nel codice
- ✅ Uso obbligatorio dei moduli utility
- ✅ Messaggi centralizzati in constants-it.js
- ✅ Rispetto dell'architettura modulare
- ✅ Validazione compliance automatica

## 📈 Roadmap

### **Versione Attuale: 1.0** ✅
- [x] Gestione completa giocatori, giochi, partite
- [x] Sistema classifiche e statistiche
- [x] Backup/restore completo
- [x] Architettura modulare
- [x] Sistema compliance automatico per AI
- [x] Documentazione completa

### **Versione 1.1** 🔄
- [ ] Sistema tornei multi-round
- [ ] Grafici statistiche avanzate
- [ ] Esportazione PDF classifiche
- [ ] Modalità offline completa

### **Versione 2.0** 📋
- [ ] Multi-database support
- [ ] Sync cloud opzionale
- [ ] Progressive Web App
- [ ] Internazionalizzazione

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🙏 Riconoscimenti

- **Bootstrap Team** per il framework CSS
- **JSZip** per la gestione file compressi
- **Emojipedia** per la documentazione emoji
- **Community GitHub** per feedback e contributi

---

## 📞 Supporto

- **Issues**: [GitHub Issues](https://github.com/rik72/hall-of-fame/issues)
- **Documentazione**: `CODE_INSTRUCTIONS.md`
- **Regole AI**: `.ai-development-rules.md`
- **Setup AI**: `AI-README.md`

**Developed with ❤️ for family gaming fun! 🎮** 