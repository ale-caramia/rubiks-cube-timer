export type Language = 'it' | 'en';

export const translations = {
  it: {
    // Header
    appTitle: "Rubik's Timer",
    timer: 'Timer',
    stats: 'Stats',
    sessions: 'Sessioni',
    statistics: 'Statistiche',
    settings: 'Impostazioni',
    settingsTitle: 'Impostazioni',
    newSession: 'Nuova Sessione',
    menuMore: 'Altro',
    loginGoogle: 'Login con Google',
    logout: 'Logout',

    // Timer states
    holdToReady: 'Tieni premuto per prepararti',
    releaseToStart: 'Rilascia per partire!',
    inspection: 'Ispezione cubo',
    countdown: 'Partenza imminente',
    solving: 'Risolvi il cubo...',
    clickToReset: 'Click per resettare',
    tapToStop: 'Tocca per fermare',
    tapToCancel: 'Tocca per annullare',
    skipInspection: 'Salta ispezione',
    inspectionSeconds: 'Secondi di ispezione',
    countdownSeconds: 'Secondi al via',

    // Scramble
    scramble: 'Scramble',

    // Stats
    best: 'Best',
    average: 'Media',
    worst: 'Worst',
    recentTimes: 'Ultimi Tempi',
    globalStats: 'Statistiche Globali',
    allSessions: 'Tutte le Sessioni',
    currentAo5: 'Ao5 Corrente',
    currentAo12: 'Ao12 Corrente',

    // Session
    session: 'Sessione',
    currentSession: 'Sessione Corrente',
    solve: 'Solve',
    solves: 'Solve',
    total: 'Totale',
    sessionStatistics: 'Statistiche Sessione',
    aoDetails: 'Ao5 / Ao12',

    // Actions
    back: 'Indietro',
    setAsCurrent: 'Imposta come corrente',
    allSolves: 'Tutti i solve',
    confirmDelete: 'Eliminare questo tempo?',
    confirmDeleteTitle: 'Conferma eliminazione',
    confirmDeleteTime: 'Vuoi eliminare questo tempo?',
    confirmDeleteSession: 'Vuoi eliminare la sessione',
    delete: 'Elimina',
    cancel: 'Annulla',
    moveTime: 'Sposta',
    moveTimeTitle: 'Sposta giocata',
    moveTimeSubtitle: 'Seleziona la sessione di destinazione (stesso mese e settimana)',
    noAvailableSessions: 'Nessuna sessione disponibile nello stesso mese e settimana. Crea una nuova sessione per spostare questa giocata.',
    timeMoved: 'Giocata spostata con successo',

    // Time-based stats
    timeBasedStats: 'Statistiche per Periodo',
    today: 'Oggi',
    thisWeek: 'Questa Settimana',
    thisMonth: 'Questo Mese',
    noData: 'Nessun dato',
    averageLast7Days: 'Media ultimi 7 giorni',
    solvesByMode: 'Solve per modalità',

    // Session folders
    monthlyFolders: 'Cartelle Mensili',
    weeklyFolders: 'Settimane',
    week: 'Settimana',
    monthStats: 'Statistiche del Mese',
    weekStats: 'Statistiche della Settimana',
    sessionsInMonth: 'sessioni in questo mese',
    sessionsInWeek: 'sessioni in questa settimana',
    noSessions: 'Nessuna sessione',
    backToMonths: 'Torna ai mesi',
    backToWeeks: 'Torna alle settimane',

    // Toast messages
    sessionCreated: 'Nuova sessione creata',
    sessionDeleted: 'Sessione eliminata',
    sessionRenamed: 'Sessione rinominata',

    // Settings
    settingsLanguage: 'Lingua',
    settingsLanguageDescription: "Scegli la lingua dell'interfaccia.",
    settingsAccount: 'Account',
    settingsTimer: 'Timer e sessioni',
    settingsTimerDescription: 'Personalizza la fase di partenza, scramble e creazione automatica delle sessioni.',
    settingsTimerRequiresLogin: 'Accedi con Google per salvare queste impostazioni sul tuo account.',
    settingsInspectionCountdown: 'Countdown ispezione',
    settingsInspectionCountdownHint: 'Avvia prima la finestra di ispezione.',
    settingsInspectionCountdownSeconds: 'Durata ispezione',
    settingsLaunchCountdown: 'Conto alla rovescia di avvio',
    settingsLaunchCountdownHint: 'Piccolo conto alla rovescia prima del timer di solve.',
    settingsLaunchCountdownSeconds: 'Durata conto avvio',
    settingsScrambleMoveCount: 'Numero mosse scramble',
    settingsAutoSessionAfterHours: 'Nuova sessione automatica dopo inattività',
    enabled: 'Attivo',
    disabled: 'Disattivo',
    secondsSuffix: 's',
    hoursSuffix: 'h',
    dangerZoneTitle: 'Zona pericolosa',
    dangerZoneDescription: "Queste azioni sono irreversibili. Apri questa sezione solo se sai esattamente cosa stai facendo.",
    showDangerZone: 'Mostra zona pericolosa',
    hideDangerZone: 'Nascondi zona pericolosa',
    deleteAccount: 'Cancella account',
    deleteAccountWarning: "Questa operazione non può essere annullata e cancellerà tutti i dati dell'account.",
    deleteAccountTypePrompt: 'Per confermare, scrivi',
    deleteAccountConfirmationWord: 'ELIMINA',
    deleteAccountConfirmTitle: 'Conferma cancellazione account',
    deleteAccountConfirmMessage: "Ultimo avviso: eliminando l'account perderai definitivamente sessioni e impostazioni.",
    deleteAccountInProgress: 'Cancellazione...',
    deleteAccountSuccess: 'Account eliminato con successo.',
    deleteAccountRecentLoginRequired: "Per sicurezza devi effettuare di nuovo il login prima di cancellare l'account.",
    deleteAccountError: 'Impossibile cancellare account. Riprova tra poco.',
    languageItalian: 'Italiano',
    languageEnglish: 'English',
    accountLoggedInAs: 'Connesso come:',
    accountNotLoggedIn: 'Non sei connesso.',
    cubeCategory: 'Categoria cubo',
    mode: 'Modalità',
    firebaseNotConfigured: 'Firebase non configurato: imposta le variabili VITE_FIREBASE_* per usare login e salvataggio cloud.',
    migrationPrompt: 'Dati locali trovati. Migra le tue sessioni su Firebase per collegarle al tuo account.',
    migrationInProgress: 'Migrazione...',
    migrateNow: 'Migra ora',
    signInToContinue: 'Accedi per continuare',
    signInHint: 'Per continuare vai in Impostazioni e accedi con Google.',
    openSettings: 'Apri Impostazioni',
    rubikLogoAlt: 'Logo Rubik',
    loadingAnimationAlt: 'Animazione di caricamento Rubik',
    loadingMessage: "Caricamento Rubik's Timer...",
    updateAvailableReload: 'Nuova versione disponibile! Ricaricare?',
    offlineReady: 'App pronta per funzionare offline!'
  },
  en: {
    // Header
    appTitle: "Rubik's Timer",
    timer: 'Timer',
    stats: 'Stats',
    sessions: 'Sessions',
    statistics: 'Statistics',
    settings: 'Settings',
    settingsTitle: 'Settings',
    newSession: 'New Session',
    menuMore: 'More',
    loginGoogle: 'Login with Google',
    logout: 'Logout',

    // Timer states
    holdToReady: 'Hold to get ready',
    releaseToStart: 'Release to start!',
    inspection: 'Cube inspection',
    countdown: 'Starting soon',
    solving: 'Solve the cube...',
    clickToReset: 'Click to reset',
    tapToStop: 'Tap to stop',
    tapToCancel: 'Tap to cancel',
    skipInspection: 'Skip inspection',
    inspectionSeconds: 'Inspection seconds',
    countdownSeconds: 'Seconds to start',

    // Scramble
    scramble: 'Scramble',

    // Stats
    best: 'Best',
    average: 'Average',
    worst: 'Worst',
    recentTimes: 'Recent Times',
    globalStats: 'Global Statistics',
    allSessions: 'All Sessions',
    currentAo5: 'Current Ao5',
    currentAo12: 'Current Ao12',

    // Session
    session: 'Session',
    currentSession: 'Current Session',
    solve: 'Solve',
    solves: 'Solves',
    total: 'Total',
    sessionStatistics: 'Session Statistics',
    aoDetails: 'Ao5 / Ao12',

    // Actions
    back: 'Back',
    setAsCurrent: 'Set as current',
    allSolves: 'All solves',
    confirmDelete: 'Delete this time?',
    confirmDeleteTitle: 'Confirm deletion',
    confirmDeleteTime: 'Do you want to delete this time?',
    confirmDeleteSession: 'Do you want to delete the session',
    delete: 'Delete',
    cancel: 'Cancel',
    moveTime: 'Move',
    moveTimeTitle: 'Move Solve',
    moveTimeSubtitle: 'Select destination session (same month and week)',
    noAvailableSessions: 'No sessions available in the same month and week. Create a new session to move this solve.',
    timeMoved: 'Solve moved successfully',

    // Time-based stats
    timeBasedStats: 'Time-Based Statistics',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    noData: 'No data',
    averageLast7Days: 'Average last 7 days',
    solvesByMode: 'Solves by mode',

    // Session folders
    monthlyFolders: 'Monthly Folders',
    weeklyFolders: 'Weeks',
    week: 'Week',
    monthStats: 'Month Statistics',
    weekStats: 'Week Statistics',
    sessionsInMonth: 'sessions in this month',
    sessionsInWeek: 'sessions in this week',
    noSessions: 'No sessions',
    backToMonths: 'Back to months',
    backToWeeks: 'Back to weeks',

    // Toast messages
    sessionCreated: 'New session created',
    sessionDeleted: 'Session deleted',
    sessionRenamed: 'Session renamed',

    // Settings
    settingsLanguage: 'Language',
    settingsLanguageDescription: 'Choose the interface language.',
    settingsAccount: 'Account',
    settingsTimer: 'Timer and sessions',
    settingsTimerDescription: 'Customize pre-start flow, scramble length and automatic session creation.',
    settingsTimerRequiresLogin: 'Sign in with Google to save these preferences to your account.',
    settingsInspectionCountdown: 'Inspection countdown',
    settingsInspectionCountdownHint: 'Run an inspection window before solving.',
    settingsInspectionCountdownSeconds: 'Inspection duration',
    settingsLaunchCountdown: 'Launch countdown',
    settingsLaunchCountdownHint: 'Short countdown right before solve timer starts.',
    settingsLaunchCountdownSeconds: 'Launch countdown duration',
    settingsScrambleMoveCount: 'Scramble move count',
    settingsAutoSessionAfterHours: 'Auto-create new session after inactivity',
    enabled: 'Enabled',
    disabled: 'Disabled',
    secondsSuffix: 's',
    hoursSuffix: 'h',
    dangerZoneTitle: 'Danger zone',
    dangerZoneDescription: 'These actions are irreversible. Open this section only if you are sure.',
    showDangerZone: 'Show danger zone',
    hideDangerZone: 'Hide danger zone',
    deleteAccount: 'Delete account',
    deleteAccountWarning: 'This action cannot be undone and will permanently delete all account data.',
    deleteAccountTypePrompt: 'To confirm, type',
    deleteAccountConfirmationWord: 'DELETE',
    deleteAccountConfirmTitle: 'Confirm account deletion',
    deleteAccountConfirmMessage: 'Final warning: deleting your account permanently removes sessions and settings.',
    deleteAccountInProgress: 'Deleting...',
    deleteAccountSuccess: 'Account deleted successfully.',
    deleteAccountRecentLoginRequired: 'For security, sign in again before deleting your account.',
    deleteAccountError: 'Unable to delete account right now. Please try again.',
    languageItalian: 'Italian',
    languageEnglish: 'English',
    accountLoggedInAs: 'Logged in as:',
    accountNotLoggedIn: 'You are not logged in.',
    cubeCategory: 'Cube category',
    mode: 'Mode',
    firebaseNotConfigured: 'Firebase is not configured: set VITE_FIREBASE_* variables to enable login and cloud sync.',
    migrationPrompt: 'Local data found. Migrate your sessions to Firebase to link them to your account.',
    migrationInProgress: 'Migrating...',
    migrateNow: 'Migrate now',
    signInToContinue: 'Sign in to continue',
    signInHint: 'To continue, go to Settings and sign in with Google.',
    openSettings: 'Open Settings',
    rubikLogoAlt: 'Rubik logo',
    loadingAnimationAlt: 'Rubik loading animation',
    loadingMessage: "Loading Rubik's Timer...",
    updateAvailableReload: 'New version available! Reload now?',
    offlineReady: 'App is ready to work offline!'
  }
};

export type TranslationKeys = keyof typeof translations.it;

export const detectLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const saved = window.localStorage.getItem('language') as Language | null;
  if (saved === 'it' || saved === 'en') {
    return saved;
  }

  const browserLang = window.navigator.language.toLowerCase();
  return browserLang.startsWith('it') ? 'it' : 'en';
};

export const translate = (language: Language, key: TranslationKeys): string => {
  return translations[language][key] || key;
};
