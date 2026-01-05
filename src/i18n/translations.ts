export type Language = 'it' | 'en';

export const translations = {
  it: {
    // Header
    appTitle: "Rubik's Timer",
    timer: 'Timer',
    stats: 'Stats',
    sessions: 'Sessioni',
    statistics: 'Statistiche',
    newSession: 'Nuova Sessione',

    // Timer states
    holdToReady: 'Tieni premuto per prepararti',
    releaseToStart: 'Rilascia per partire!',
    inspection: 'Ispezione cubo',
    countdown: 'Partenza imminente',
    solving: 'Risolvi il cubo...',
    clickToReset: 'Click per resettare',
    tapToStop: 'Tocca per fermare',
    tapToCancel: 'Tocca per annullare',
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
    solves: 'Solve',
    total: 'Totale',
    sessionStatistics: 'Statistiche Sessione',

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

    // Time-based stats
    timeBasedStats: 'Statistiche per Periodo',
    today: 'Oggi',
    thisWeek: 'Questa Settimana',
    thisMonth: 'Questo Mese',
    noData: 'Nessun dato',
  },
  en: {
    // Header
    appTitle: "Rubik's Timer",
    timer: 'Timer',
    stats: 'Stats',
    sessions: 'Sessions',
    statistics: 'Statistics',
    newSession: 'New Session',

    // Timer states
    holdToReady: 'Hold to get ready',
    releaseToStart: 'Release to start!',
    inspection: 'Cube inspection',
    countdown: 'Starting soon',
    solving: 'Solve the cube...',
    clickToReset: 'Click to reset',
    tapToStop: 'Tap to stop',
    tapToCancel: 'Tap to cancel',
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
    solves: 'Solves',
    total: 'Total',
    sessionStatistics: 'Session Statistics',

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

    // Time-based stats
    timeBasedStats: 'Time-Based Statistics',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    noData: 'No data',
  }
};

export type TranslationKeys = keyof typeof translations.it;
