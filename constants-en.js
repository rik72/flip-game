// ===== CONSTANTS =====
window.CONSTANTS_EN_OBJ = window.CONSTANTS_EN_OBJ || {
    // Page and Application Titles
    PAGE_TITLE: 'Hall of Fame - Family Games Leaderboard',
    APP_TITLE: {
        HALL: 'Hall',
        OF: 'of', 
        FAME: 'Fame'
    },

    // Navigation Labels
    NAVIGATION: {
        PLAYERS: 'Players',
        GAMES: 'Games',
        MATCHES: 'Matches'
    },

    // Section Headers
    SECTIONS: {
        RANKING: 'Leaderboard',
        PLAYERS: 'Players',
        GAMES: 'Games',
        MATCHES: 'Matches',
        GAME_RANKING: 'Game Leaderboard'
    },

    // Button Labels
    BUTTONS: {
        ADD_PLAYER: 'Add Player',
        ADD_GAME: 'Add Game',
        RECORD_MATCH: 'Record Match',
        ADD_PARTICIPANT: 'Add Participant',
        CANCEL: 'Cancel',
        ADD: 'Add',
        SAVE: 'Save',
        SAVE_CHANGES: 'Save Changes',
        CLOSE: 'Close',
        IMPORT: 'Import',
        EXPORT: 'Export'
    },

    // Form Labels
    FORM_LABELS: {
        NAME: 'Name',
        GAME_NAME: 'Game Name',
        AVATAR: 'Avatar',
        GAME: 'Game',
        DATE: 'Date',
        TYPE: 'Type',
        PARTICIPANTS_AND_RESULTS: 'Participants and Results',
        BACKUP_FILE: 'Select .hof file'
    },

    // Form Placeholders and Help Text
    FORM_HELP: {
        AVATAR_FILTER: 'Filter avatars... (e.g., \'cat\', \'happy\', \'food\')',
        AVATAR_FILTER_HELP: 'Type to filter the avatar list',
        SELECT_GAME_PLACEHOLDER: 'Select a game...',
        BACKUP_FILE_HELP: 'Select a backup file (.hof) previously exported'
    },

    // Dropdown Options
    DROPDOWN_OPTIONS: {
        RANKING_SORT: {
            POINTS: 'By Points',
            PERFORMANCE: 'By Performance'
        },
        GAME_TYPES: {
            BOARD: 'Board Game',
            CARD: 'Card Game', 
            GARDEN: 'Garden Game',
            SPORT: 'Sport',
            OTHER: 'Other'
        }
    },

    // Modal Titles
    MODAL_TITLES: {
        ADD_PLAYER: 'Add Player',
        EDIT_PLAYER: 'Edit Player',
        ADD_GAME: 'Add Game',
        EDIT_GAME: 'Edit Game',
        RECORD_MATCH: 'Record Match',
        IMPORT_BACKUP: 'Import Backup',
        GAME_RANKING: 'Game Leaderboard'
    },

    // Alert Messages
    ALERTS: {
        IMPORT_WARNING_TITLE: 'Warning!',
        IMPORT_WARNING_MESSAGE: 'Importing will replace all current data (players, games, and matches) with the backup file data.'
    },

    // Footer and Links
    FOOTER: {
        BACKUP: 'Backup',
        EXPORT_BACKUP: 'Export Backup (.hof)',
        IMPORT_BACKUP: 'Import Backup',
        GITHUB_TITLE: 'View on GitHub',
        SETTINGS: 'Settings',
        LANGUAGE: 'Language',
        ITALIAN: 'Italiano',
        ENGLISH: 'English'
    },

    // Additional UI Text
    UI_TEXT: {
        PARTITA: 'match',
        PARTITE: 'matches',
        PARTITE_GIOCATE: 'Matches played',
        CLASSIFICA: 'Leaderboard',
        PRIMO_POSTO: 'First place',
        ULTIMO_POSTO: 'Last place',
        ELIMINA: 'Delete',
        MODIFICA: 'Edit',
        NESSUN_GIOCATORE_CLASSIFICA: 'No players in leaderboard',
        NESSUNA_PARTITA: 'No matches recorded. Start by recording the first matches!',
        AGGIUNGI_PARTITE_CLASSIFICA: 'Add players and record the first matches to see the leaderboard',
        GIOCO_ELIMINATO: 'Game deleted',
        GIOCATORE_ELIMINATO: 'Player deleted',
        PODIO_CLASSIFICA_PUNTEGGI: 'Podium in the complete score leaderboard',
        PRIMO_POSTO_GIOCO: 'First place in',
        SECONDO_POSTO: 'Second place',
        TERZO_POSTO: 'Third place',
        MIGLIOR_PERFORMANCE: 'Best performance'
    },

    // Avatar Categories and Labels
    AVATAR_CATEGORIES: {
        FACES_EMOTIONS: {
            SORRIDENTE: 'Smiling',
            COOL: 'Cool',
            STELLARE: 'Stellar',
            FESTA: 'Party',
            WOW: 'Wow',
            INNAMORATO: 'In Love',
            PENSIEROSO: 'Thoughtful',
            FELICE: 'Happy',
            LACRIME: 'Tears',
            AMOROSO: 'Loving',
            ANGELO: 'Angel',
            ABBRACCIO: 'Hug',
            TIMIDO: 'Shy',
            SILENZIO: 'Silence',
            SOSPETTOSO: 'Suspicious',
            FURBO: 'Cunning',
            DORMIENTE: 'Sleeping',
            NERD: 'Nerd',
            FREDDO: 'Cold',
            CALDO: 'Hot',
            MISTERIOSO: 'Mysterious',
            PAZZO: 'Crazy',
            STORDITO: 'Dizzy',
            SOLDI: 'Money',
            COWBOY: 'Cowboy'
        },
        PEOPLE: {
            BIMBO: 'Baby Boy',
            BIMBO_CHIARO: 'Light Baby Boy',
            BIMBO_MEDIO_CHIARO: 'Medium-Light Baby Boy',
            BIMBO_MEDIO: 'Medium Baby Boy',
            BIMBO_MEDIO_SCURO: 'Medium-Dark Baby Boy',
            BIMBO_SCURO: 'Dark Baby Boy',
            BIMBA: 'Baby Girl',
            BIMBA_CHIARA: 'Light Baby Girl',
            BIMBA_MEDIO_CHIARA: 'Medium-Light Baby Girl',
            BIMBA_MEDIA: 'Medium Baby Girl',
            BIMBA_MEDIO_SCURA: 'Medium-Dark Baby Girl',
            BIMBA_SCURA: 'Dark Baby Girl',
            BAMBINO: 'Child',
            BAMBINO_CHIARO: 'Light Child',
            BAMBINO_MEDIO_CHIARO: 'Medium-Light Child',
            BAMBINO_MEDIO: 'Medium Child',
            BAMBINO_MEDIO_SCURO: 'Medium-Dark Child',
            BAMBINO_SCURO: 'Dark Child',
            DONNA: 'Woman',
            DONNA_CHIARA: 'Light Woman',
            DONNA_MEDIO_CHIARA: 'Medium-Light Woman',
            DONNA_MEDIA: 'Medium Woman',
            DONNA_MEDIO_SCURA: 'Medium-Dark Woman',
            DONNA_SCURA: 'Dark Woman',
            DONNA_BIONDA: 'Blonde Woman',
            DONNA_BIONDA_CHIARA: 'Light Blonde Woman',
            DONNA_BIONDA_MEDIO_CHIARA: 'Medium-Light Blonde Woman',
            DONNA_BIONDA_MEDIA: 'Medium Blonde Woman',
            DONNA_BIONDA_MEDIO_SCURA: 'Medium-Dark Blonde Woman',
            DONNA_BIONDA_SCURA: 'Dark Blonde Woman',
            DONNA_RICCIA: 'Curly Woman',
            DONNA_RICCIA_CHIARA: 'Light Curly Woman',
            DONNA_RICCIA_MEDIO_CHIARA: 'Medium-Light Curly Woman',
            DONNA_RICCIA_MEDIA: 'Medium Curly Woman',
            DONNA_RICCIA_MEDIO_SCURA: 'Medium-Dark Curly Woman',
            DONNA_RICCIA_SCURA: 'Dark Curly Woman',
            DONNA_ROSSA: 'Redhead Woman',
            DONNA_ROSSA_CHIARA: 'Light Redhead Woman',
            DONNA_ROSSA_MEDIO_CHIARA: 'Medium-Light Redhead Woman',
            DONNA_ROSSA_MEDIA: 'Medium Redhead Woman',
            DONNA_ROSSA_MEDIO_SCURA: 'Medium-Dark Redhead Woman',
            DONNA_ROSSA_SCURA: 'Dark Redhead Woman',
            DONNA_BIANCA: 'White Woman',
            DONNA_BIANCA_CHIARA: 'Light White Woman',
            DONNA_BIANCA_MEDIO_CHIARA: 'Medium-Light White Woman',
            DONNA_BIANCA_MEDIA: 'Medium White Woman',
            DONNA_BIANCA_MEDIO_SCURA: 'Medium-Dark White Woman',
            DONNA_BIANCA_SCURA: 'Dark White Woman',
            DONNA_CALVA: 'Bald Woman',
            DONNA_CALVA_CHIARA: 'Light Bald Woman',
            DONNA_CALVA_MEDIO_CHIARA: 'Medium-Light Bald Woman',
            DONNA_CALVA_MEDIA: 'Medium Bald Woman',
            DONNA_CALVA_MEDIO_SCURA: 'Medium-Dark Bald Woman',
            DONNA_CALVA_SCURA: 'Dark Bald Woman',
            UOMO: 'Man',
            UOMO_CHIARO: 'Light Man',
            UOMO_MEDIO_CHIARO: 'Medium-Light Man',
            UOMO_MEDIO: 'Medium Man',
            UOMO_MEDIO_SCURO: 'Medium-Dark Man',
            UOMO_SCURO: 'Dark Man',
            UOMO_BIONDO: 'Blonde Man',
            UOMO_BIONDO_CHIARO: 'Light Blonde Man',
            UOMO_BIONDO_MEDIO_CHIARO: 'Medium-Light Blonde Man',
            UOMO_BIONDO_MEDIO: 'Medium Blonde Man',
            UOMO_BIONDO_MEDIO_SCURO: 'Medium-Dark Blonde Man',
            UOMO_BIONDO_SCURO: 'Dark Blonde Man',
            UOMO_RICCIO: 'Curly Man',
            UOMO_RICCIO_CHIARO: 'Light Curly Man',
            UOMO_RICCIO_MEDIO_CHIARO: 'Medium-Light Curly Man',
            UOMO_RICCIO_MEDIO: 'Medium Curly Man',
            UOMO_RICCIO_MEDIO_SCURO: 'Medium-Dark Curly Man',
            UOMO_RICCIO_SCURO: 'Dark Curly Man',
            UOMO_ROSSO: 'Redhead Man',
            UOMO_ROSSO_CHIARO: 'Light Redhead Man',
            UOMO_ROSSO_MEDIO_CHIARO: 'Medium-Light Redhead Man',
            UOMO_ROSSO_MEDIO: 'Medium Redhead Man',
            UOMO_ROSSO_MEDIO_SCURO: 'Medium-Dark Redhead Man',
            UOMO_ROSSO_SCURO: 'Dark Redhead Man',
            UOMO_BIANCO: 'White Man',
            UOMO_BIANCO_CHIARO: 'Light White Man',
            UOMO_BIANCO_MEDIO_CHIARO: 'Medium-Light White Man',
            UOMO_BIANCO_MEDIO: 'Medium White Man',
            UOMO_BIANCO_MEDIO_SCURO: 'Medium-Dark White Man',
            UOMO_BIANCO_SCURO: 'Dark White Man',
            UOMO_CALVO: 'Bald Man',
            UOMO_CALVO_CHIARO: 'Light Bald Man',
            UOMO_CALVO_MEDIO_CHIARO: 'Medium-Light Bald Man',
            UOMO_CALVO_MEDIO: 'Medium Bald Man',
            UOMO_CALVO_MEDIO_SCURO: 'Medium-Dark Bald Man',
            UOMO_CALVO_SCURO: 'Dark Bald Man',
            NONNA: 'Grandmother',
            NONNA_CHIARA: 'Light Grandmother',
            NONNA_MEDIO_CHIARA: 'Medium-Light Grandmother',
            NONNA_MEDIA: 'Medium Grandmother',
            NONNA_MEDIO_SCURA: 'Medium-Dark Grandmother',
            NONNA_SCURA: 'Dark Grandmother',
            NONNO: 'Grandfather',
            NONNO_CHIARO: 'Light Grandfather',
            NONNO_MEDIO_CHIARO: 'Medium-Light Grandfather',
            NONNO_MEDIO: 'Medium Grandfather',
            NONNO_MEDIO_SCURO: 'Medium-Dark Grandfather',
            NONNO_SCURO: 'Dark Grandfather'
        },
        PROFESSIONS: {
            POLIZIOTTA: 'Policewoman',
            POLIZIOTTO: 'Policeman',
            COSTRUTTRICE: 'Builder',
            COSTRUTTORE: 'Builder',
            GUARDIA: 'Guard',
            DETECTIVE: 'Detective',
            DOTTORESSA: 'Doctor',
            DOTTORE: 'Doctor',
            CONTADINA: 'Farmer',
            CONTADINO: 'Farmer',
            CHEF: 'Chef',
            STUDENTESSA: 'Student',
            STUDENTE: 'Student',
            CANTANTE: 'Singer',
            INSEGNANTE: 'Teacher',
            PROGRAMMATRICE: 'Programmer',
            PROGRAMMATORE: 'Programmer',
            ASTRONAUTA: 'Astronaut',
            POMPIERE: 'Firefighter',
            NINJA: 'Ninja',
            PRINCIPE: 'Prince',
            PRINCIPESSA: 'Princess'
        },
        FANTASY_CHARACTERS: {
            FANTASMA: 'Ghost',
            PAGLIACCIO: 'Clown',
            OGRE: 'Ogre',
            GOBLIN: 'Goblin',
            ROBOT: 'Robot',
            ALIENO: 'Alien',
            MOSTRO: 'Monster',
            BABBO_NATALE: 'Santa Claus',
            MAMMA_NATALE: 'Mrs. Claus',
            STREGA: 'Witch',
            MAGO: 'Wizard',
            FATA: 'Fairy',
            FOLLETTO: 'Elf',
            VAMPIRA: 'Vampire',
            VAMPIRO: 'Vampire',
            ZOMBIE: 'Zombie'
        },
        ANIMALS: {
            CANE: 'Dog',
            GATTO: 'Cat',
            TOPO: 'Mouse',
            CRICETO: 'Hamster',
            CONIGLIO: 'Rabbit',
            VOLPE: 'Fox',
            ORSO: 'Bear',
            PANDA: 'Panda',
            KOALA: 'Koala',
            TIGRE: 'Tiger',
            LEONE: 'Lion',
            MUCCA: 'Cow',
            MAIALE: 'Pig',
            RANA: 'Frog',
            SCIMMIA: 'Monkey',
            NON_VEDO: 'See No Evil',
            NON_SENTO: 'Hear No Evil',
            NON_PARLO: 'Speak No Evil',
            UNICORNO: 'Unicorn',
            APE: 'Bee',
            BRUCO: 'Caterpillar',
            FARFALLA: 'Butterfly',
            LUMACA: 'Snail',
            COCCINELLA: 'Ladybug',
            FORMICA: 'Ant',
            GRILLO: 'Cricket',
            RAGNO: 'Spider',
            SCORPIONE: 'Scorpion',
            TARTARUGA: 'Turtle',
            SERPENTE: 'Snake',
            LUCERTOLA: 'Lizard',
            T_REX: 'T-Rex',
            DINOSAURO: 'Dinosaur',
            POLPO: 'Octopus',
            CALAMARO: 'Squid',
            GAMBERO: 'Shrimp',
            GRANCHIO: 'Crab',
            PESCE_PALLA: 'Pufferfish',
            PESCE: 'Fish',
            DELFINO: 'Dolphin',
            BALENA: 'Whale',
            SQUALO: 'Shark',
            COCCODRILLO: 'Crocodile',
            ZEBRA: 'Zebra',
            GORILLA: 'Gorilla',
            ORANGUTAN: 'Orangutan',
            ELEFANTE: 'Elephant',
            LEOPARDO: 'Leopard',
            IPPOPOTAMO: 'Hippopotamus',
            RINOCERONTE: 'Rhinoceros',
            CAMMELLO: 'Camel',
            DROMEDARIO: 'Dromedary',
            GIRAFFA: 'Giraffe',
            CANGURO: 'Kangaroo',
            BUFALO: 'Buffalo',
            TORO: 'Bull',
            CAVALLO: 'Horse',
            ARIETE: 'Ram',
            PECORA: 'Sheep',
            LAMA: 'Llama',
            CAPRA: 'Goat',
            CERVO: 'Deer',
            BARBONCINO: 'Poodle',
            CANE_GUIDA: 'Guide Dog',
            CANE_SERVIZIO: 'Service Dog',
            GATTO_NERO: 'Black Cat',
            GALLO: 'Rooster',
            GALLINA: 'Chicken',
            PULCINO: 'Chick',
            ANATRA: 'Duck',
            CIGNO: 'Swan',
            AQUILA: 'Eagle',
            GUFO: 'Owl',
            PAVONE: 'Peacock',
            PAPPAGALLO: 'Parrot',
            OCA: 'Goose',
            PINGUINO: 'Penguin',
            COLOMBA: 'Dove',
            PIPISTRELLO: 'Bat',
            LUPO: 'Wolf',
            RICCIO: 'Hedgehog',
            PROCIONE: 'Raccoon',
            SCOIATTOLO: 'Squirrel'
        },
        FOOD_DRINKS: {
            MELA: 'Apple',
            ARANCIA: 'Orange',
            BANANA: 'Banana',
            FRAGOLA: 'Strawberry',
            MIRTILLI: 'Blueberries',
            UVA: 'Grapes',
            KIWI: 'Kiwi',
            ANGURIA: 'Watermelon',
            CILIEGIE: 'Cherries',
            CILIEGIA: 'Cherry',
            MANGO: 'Mango',
            ANANAS: 'Pineapple',
            COCCO: 'Coconut',
            CAROTA: 'Carrot',
            PEPERONCINO: 'Chili Pepper',
            OLIVA: 'Olive',
            AVOCADO: 'Avocado',
            MELANZANA: 'Eggplant',
            PATATA: 'Potato',
            BAGUETTE: 'Baguette',
            BAGEL: 'Bagel',
            FORMAGGIO: 'Cheese',
            CARNE: 'Meat',
            BACON: 'Bacon',
            HAMBURGER: 'Hamburger',
            PATATINE: 'French Fries',
            PIZZA: 'Pizza',
            HOT_DOG: 'Hot Dog',
            SANDWICH: 'Sandwich',
            TACO: 'Taco',
            BURRITO: 'Burrito',
            INSALATA: 'Salad',
            RAMEN: 'Ramen',
            PASTA: 'Pasta',
            STUFATO: 'Stew',
            CURRY: 'Curry',
            SUSHI: 'Sushi',
            GAMBERO: 'Shrimp',
            TORTA: 'Cake',
            CUPCAKE: 'Cupcake',
            LECCA_LECCA: 'Lollipop',
            CARAMELLA: 'Candy',
            CIOCCOLATO: 'Chocolate',
            DONUT: 'Donut',
            BISCOTTO: 'Cookie',
            LATTE: 'Milk',
            CAFFE: 'Coffee',
            SUCCO: 'Juice',
            BIBITA: 'Soda',
            BUBBLE_TEA: 'Bubble Tea',
            BIRRA: 'Beer',
            VINO: 'Wine',
            COCKTAIL: 'Cocktail',
            DRINK: 'Drink',
            WHISKY: 'Whisky'
        },
        OBJECTS_SYMBOLS: {
            CACCA: 'Poop',
            STELLA: 'Star',
            STELLA_BRILLANTE: 'Sparkling Star',
            BRILLANTINI: 'Sparkles',
            COMETA: 'Comet',
            FUOCO: 'Fire',
            FULMINE: 'Lightning',
            DIAMANTE: 'Diamond',
            CORONA: 'Crown',
            BERSAGLIO: 'Target',
            DADO: 'Dice',
            GAMING: 'Gaming',
            JOYSTICK: 'Joystick',
            TEATRO: 'Theater',
            CIRCO: 'Circus',
            ARTE: 'Art',
            CINEMA: 'Cinema',
            MICROFONO: 'Microphone',
            CUFFIE: 'Headphones',
            MUSICA: 'Music',
            NOTE: 'Notes',
            CHITARRA: 'Guitar',
            TAMBURO: 'Drum',
            TROMBA: 'Trumpet',
            SAX: 'Saxophone',
            RAZZO: 'Rocket',
            UFO: 'UFO',
            ARCOBALENO: 'Rainbow',
            PALLONCINO: 'Balloon',
            FESTA: 'Party',
            CORIANDOLI: 'Confetti',
            REGALO: 'Gift',
            FIOCCO: 'Bow',
            DONO: 'Present',
            CUORE_ROSA: 'Pink Heart',
            DUE_CUORI: 'Two Hearts',
            CUORE_CRESCENTE: 'Growing Heart',
            CUORE_BATTENTE: 'Beating Heart',
            CUPIDO: 'Cupid',
            CUORE_ROSSO: 'Red Heart',
            CUORE_ARANCIONE: 'Orange Heart',
            CUORE_GIALLO: 'Yellow Heart',
            CUORE_VERDE: 'Green Heart',
            CUORE_BLU: 'Blue Heart',
            CUORE_VIOLA: 'Purple Heart',
            CUORE_NERO: 'Black Heart',
            CUORE_BIANCO: 'White Heart',
            CUORE_MARRONE: 'Brown Heart'
        }
    },

    // Existing message constants
    MESSAGES: {
        EMPTY_NAME: 'Enter the {type} name',
        DUPLICATE_NAME: 'A {type} with this name already exists',
        CONFIRM_DELETE_PLAYER: 'Are you sure you want to delete this player? All their matches will be removed.',
        CONFIRM_DELETE_GAME: 'Are you sure you want to delete this game? All associated matches will be removed.',
        CONFIRM_DELETE_MATCH: 'Are you sure you want to delete this match?',
        MIN_PLAYERS_FOR_MATCH: 'Add at least 2 players before recording a match',
        MIN_GAMES_FOR_MATCH: 'Add at least one game before recording a match',
        SELECT_GAME: 'Select a game',
        SELECT_DATE: 'Select a date',
        COMPLETE_PARTICIPANTS: 'Complete all participant data',
        NO_DUPLICATE_PLAYERS: 'A player cannot participate twice in the same match',
        MIN_PARTICIPANTS: 'At least 2 participants are required',
        BACKUP_EXPORT_SUCCESS: 'Backup exported successfully!',
        BACKUP_SELECT_FILE: 'Select a backup file (.hof)',
        BACKUP_INVALID_FILE: 'The selected file is not a valid backup file (.hof)',
        BACKUP_IMPORT_SUCCESS: 'Backup imported successfully!',
        BACKUP_EXPORT_ERROR: 'Error during backup export.'
    },

    // Modal types configuration
    MODAL_TYPES: {
        PLAYER: {
            name: 'player',
            addTitle: 'Add Player',
            editTitle: 'Edit Player',
            addButton: 'Add',
            editButton: 'Save Changes'
        },
        GAME: {
            name: 'game',
            addTitle: 'Add Game',
            editTitle: 'Edit Game',
            addButton: 'Add',
            editButton: 'Save Changes'
        }
    },

    // Game mechanics constants
    POSITION_POINTS: {
        winner: 2,
        participant: 1,
        last: 0
    },

    GAME_TYPE_LABELS: {
        board: 'Board Game',
        card: 'Card Game',
        garden: 'Garden Game',
        sport: 'Sport',
        other: 'Other'
    },

    POSITION_LABELS: {
        winner: '🏆 Winner',
        participant: '🥈 Placement', 
        last: '😞 Last Place'
    },

    POSITION_BADGE_CLASSES: {
        winner: 'bg-warning',
        participant: 'bg-primary',
        last: 'bg-secondary'
    },

    // Utility methods for text management
    getText(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this);
    },

    setText(element, path) {
        const text = this.getText(path);
        if (text && element) {
            element.textContent = text;
        }
        return text;
    },

    setInnerHTML(element, path, icon = null) {
        const text = this.getText(path);
        if (text && element) {
            if (icon) {
                element.innerHTML = `<i class="${icon}"></i>${text}`;
            } else {
                element.innerHTML = text;
            }
        }
        return text;
    }
};

// Constants object created - will be copied by language manager 