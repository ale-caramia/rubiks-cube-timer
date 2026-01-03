export type Language = 'it' | 'en';

export const translations = {
  it: {
    // Header
    appTitle: "Rubik's Timer",
    timer: 'Timer',
    stats: 'Statistiche',
    newSession: 'Nuova Sessione',

    // Timer states
    holdToReady: 'Tieni premuto per prepararti',
    releaseToStart: 'Rilascia per partire!',
    solving: 'Risolvi il cubo...',
    clickToReset: 'Click per resettare',

    // Scramble
    scramble: 'Scramble',

    // Stats
    best: 'Best',
    average: 'Media',
    worst: 'Worst',
    recentTimes: 'Ultimi Tempi',
    globalStats: 'Statistiche Globali',
    allSessions: 'Tutte le Sessioni',

    // Session
    session: 'Sessione',
    currentSession: 'Sessione Corrente',
    solves: 'Solve',
    total: 'Totale',

    // Actions
    delete: 'Elimina',
    edit: 'Modifica',
    save: 'Salva',
    cancel: 'Annulla',
  },
  en: {
    // Header
    appTitle: "Rubik's Timer",
    timer: 'Timer',
    stats: 'Stats',
    newSession: 'New Session',

    // Timer states
    holdToReady: 'Hold to get ready',
    releaseToStart: 'Release to start!',
    solving: 'Solve the cube...',
    clickToReset: 'Click to reset',

    // Scramble
    scramble: 'Scramble',

    // Stats
    best: 'Best',
    average: 'Average',
    worst: 'Worst',
    recentTimes: 'Recent Times',
    globalStats: 'Global Statistics',
    allSessions: 'All Sessions',

    // Session
    session: 'Session',
    currentSession: 'Current Session',
    solves: 'Solves',
    total: 'Total',

    // Actions
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
  }
};

export type TranslationKeys = keyof typeof translations.it;
