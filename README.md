# 🏆 Hall of Fame - Classifica Giochi Famiglia

Una web app per amici e famiglie che permette di mantenere una classifica aperta basata sui risultati di diversi giochi della vita reale.

![Hall of Fame Screenshot](screenshot.png)

## ✨ Caratteristiche Principali

### 🎮 Sistema di Punteggio Semplice
- **Vincitore**: 2 punti (primo classificato o primi in caso di parità)
- **Piazzamento**: 1 punto (secondo, terzo, etc.)
- **Ultimo posto**: 0 punti

### 👥 Gestione Giocatori
- Aggiungi giocatori con avatar personalizzabili
- Sistema avatar con genere (maschio/femmina) e colore capelli
- Statistiche automatiche per ogni giocatore
- Visualizzazione punti totali, partite giocate e vittorie

### 🎲 Gestione Giochi
- Supporto per diversi tipi di giochi:
  - Giochi da Tavolo
  - Giochi di Carte
  - Giochi da Giardino
  - Sport
  - Altri
- Tracciamento partite per ogni gioco

### 📊 Sistema di Classifica
- **Podio animato** ispirato all'immagine fornita
- Classifica completa con posizioni colorate
- Ordinamento per punti totali, vittorie e partite giocate
- Aggiornamento automatico dopo ogni partita

### 📱 Funzionalità Tecniche
- **Nessun login richiesto** - tutto salvato nel browser
- **Responsive design** - funziona su tutti i dispositivi
- **Local Storage** per persistenza dati
- **Bootstrap 5** per un'interfaccia moderna
- **Tema cartoon colorato** che rispecchia l'immagine di riferimento

## 🚀 Come Iniziare

1. Apri `index.html` nel tuo browser
2. Aggiungi i primi giocatori nella sezione "Giocatori"
3. Aggiungi i giochi nella sezione "Giochi"
4. Registra le prime partite nella sezione "Partite"
5. Guarda il podio aggiornarsi automaticamente!

## 📋 Struttura dell'Applicazione

### Sezioni Principali
- **🏆 Podio**: Visualizza i top 3 giocatori con podio 3D animato
- **👥 Giocatori**: Gestione completa dei partecipanti
- **🎮 Giochi**: Catalogazione dei giochi disponibili
- **📝 Partite**: Registrazione risultati e storico

### File del Progetto
```
halloffame/
├── index.html          # Struttura principale dell'app
├── styles.css          # Stili personalizzati e tema cartoon
├── app.js             # Logica dell'applicazione
└── README.md          # Questa documentazione
```

## 🎨 Design e Tema

L'applicazione è stata progettata per riflettere l'estetica allegra e colorata dell'immagine di riferimento:

- **Colori vivaci** con gradienti blu e verde
- **Podio 3D** con oro, argento e bronzo
- **Avatar cartoon** personalizzabili
- **Animazioni fluide** per un'esperienza coinvolgente
- **Effetti hover** per interattività migliorata

## 💾 Gestione Dati

I dati vengono salvati automaticamente nel Local Storage del browser:
- `halloffame_players` - Lista giocatori
- `halloffame_games` - Lista giochi
- `halloffame_matches` - Storico partite

**Nota**: I dati sono legati al browser specifico. Per trasferire i dati, sarà necessario esportare/importare manualmente in futuro.

## 🔧 Tecnologie Utilizzate

- **HTML5** per la struttura
- **CSS3** con variabili personalizzate e animazioni
- **JavaScript ES6+** con classi moderne
- **Bootstrap 5.3.3** per il framework CSS
- **Bootstrap Icons** per le icone
- **Local Storage API** per la persistenza

## 📱 Compatibilità

L'applicazione è compatibile con:
- Chrome, Firefox, Safari, Edge (ultime versioni)
- Dispositivi mobili e tablet
- Tutte le risoluzioni schermo

## 🎯 Prossimi Sviluppi Possibili

- Export/Import dati in JSON
- Grafici statistiche avanzate
- Sistema torneo a eliminazione
- Notifiche achievement
- Modalità multiplayer online
- Tema scuro/chiaro

## 📞 Supporto

Per domande o suggerimenti sull'applicazione, contatta lo sviluppatore.

---

*Divertiti con la tua famiglia e amici! Che vinca il migliore! 🏆* 