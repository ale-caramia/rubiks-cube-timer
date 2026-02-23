import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, getDocFromServer, onSnapshot, setDoc } from 'firebase/firestore';
import { useLanguage } from '../i18n/LanguageContext';
import { db } from '../firebaseClient';
import type { CubeMode, Session, StorageData, TimeEntry, TimerSettings } from '../types/timer';
import { DEFAULT_CUBE_MODE, isCubeMode } from '../utils/cubeModes';
import { DEFAULT_TIMER_SETTINGS, normalizeTimerSettings } from '../utils/timerSettings';
import { useAuth } from './AuthContext';

interface SessionsContextValue {
  sessions: Session[];
  currentSessionId: number | null;
  currentSession: Session | null;
  selectedCubeMode: CubeMode;
  timerSettings: TimerSettings;
  migrationNeeded: boolean;
  migrating: boolean;
  setSelectedCubeMode: (mode: CubeMode) => void;
  updateTimerSettings: (nextSettings: Partial<TimerSettings>) => void;
  setCurrentSessionId: (id: number | null) => void;
  createSession: (forcedNumber?: number) => void;
  renameSession: (sessionId: number, newName: string) => void;
  deleteSession: (sessionId: number) => void;
  deleteTime: (sessionId: number, timeIndex: number) => void;
  addTime: (timeMs: number, scramble: string) => void;
  moveTime: (fromSessionId: number, timeIndex: number, toSessionId: number) => void;
  migrateLegacyData: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);
const STORAGE_KEY = 'rubiks-sessions';
const MIGRATION_VERSION = 1;
const HOUR_MS = 60 * 60 * 1000;

const migrateSessionData = (session: (Session | { times: number[] } & Omit<Session, 'times'>)): Session => {
  const cubeMode = isCubeMode((session as Session).cubeMode) ? (session as Session).cubeMode : DEFAULT_CUBE_MODE;

  if (session.times.length === 0) {
    return { ...session, cubeMode, times: [] } as Session;
  }

  if (typeof session.times[0] === 'object' && 'timestamp' in session.times[0]) {
    return { ...(session as Session), cubeMode };
  }

  const baseTimestamp = new Date(session.date).getTime();
  const estimatedInterval = 3 * 60 * 1000;

  return {
    ...session,
    cubeMode,
    times: (session.times as number[]).map((time: number, index: number): TimeEntry => ({
      time,
      timestamp: baseTimestamp + (index * estimatedInterval),
      scramble: undefined
    }))
  };
};

const getMostRecentSessionId = (list: Session[]): number | null => {
  if (list.length === 0) return null;
  return list.reduce((latest, session) => {
    const latestTime = new Date(latest.date).getTime();
    const sessionTime = new Date(session.date).getTime();
    if (sessionTime > latestTime) return session;
    if (sessionTime === latestTime && session.id > latest.id) return session;
    return latest;
  }).id;
};

const normalizeData = (raw: StorageData): StorageData => {
  const migratedSessions = (raw.sessions ?? []).map(migrateSessionData);

  const uniqueSessions: Session[] = [];
  const seenIds = new Set<number>();
  for (const session of migratedSessions) {
    if (!seenIds.has(session.id)) {
      seenIds.add(session.id);
      uniqueSessions.push(session);
    }
  }

  return {
    sessions: uniqueSessions,
    currentSessionId: raw.currentSessionId ?? null,
    preferredCubeMode: isCubeMode(raw.preferredCubeMode) ? raw.preferredCubeMode : DEFAULT_CUBE_MODE,
    timerSettings: normalizeTimerSettings(raw.timerSettings),
    migrationVersion: raw.migrationVersion ?? 0
  };
};

const readLegacyStorage = async (): Promise<StorageData | null> => {
  try {
    if (window.storage?.get) {
      const result = await window.storage.get(STORAGE_KEY);
      if (result?.value) {
        return normalizeData(JSON.parse(result.value) as StorageData);
      }
    }
  } catch {
    // noop
  }

  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      return normalizeData(JSON.parse(local) as StorageData);
    }
  } catch {
    // noop
  }

  return null;
};

export const SessionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [selectedCubeMode, setSelectedCubeMode] = useState<CubeMode>(DEFAULT_CUBE_MODE);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_TIMER_SETTINGS);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid, 'timer', 'main');
  }, [user]);

  const persistData = async (
    nextSessions: Session[],
    nextCurrentSessionId: number | null,
    nextMode: CubeMode,
    nextTimerSettings: TimerSettings,
    migrationVersion = MIGRATION_VERSION
  ): Promise<void> => {
    if (!userDocRef) return;
    await setDoc(userDocRef, {
      sessions: nextSessions,
      currentSessionId: nextCurrentSessionId,
      preferredCubeMode: nextMode,
      timerSettings: nextTimerSettings,
      migrationVersion
    }, { merge: true });
  };

  useEffect(() => {
    if (!userDocRef) {
      setSessions([]);
      setCurrentSessionId(null);
      setSelectedCubeMode(DEFAULT_CUBE_MODE);
      setTimerSettings(DEFAULT_TIMER_SETTINGS);
      setMigrationNeeded(false);
      return;
    }

    let active = true;
    let checkingServerDoc = false;

    const unsub = onSnapshot(userDocRef, async snapshot => {
      if (!active) return;

      if (snapshot.exists()) {
        const normalized = normalizeData(snapshot.data() as StorageData);
        setSessions(normalized.sessions);
        setCurrentSessionId(normalized.currentSessionId);
        setSelectedCubeMode(normalized.preferredCubeMode ?? DEFAULT_CUBE_MODE);
        setTimerSettings(normalized.timerSettings ?? DEFAULT_TIMER_SETTINGS);
        const legacy = await readLegacyStorage();
        if (!active) return;
        setMigrationNeeded((normalized.migrationVersion ?? 0) < MIGRATION_VERSION && Boolean(legacy?.sessions?.length));
      } else {
        const legacy = await readLegacyStorage();
        if (!active) return;
        if (legacy?.sessions?.length) {
          setMigrationNeeded(true);
          setSessions([]);
          setCurrentSessionId(null);
          setSelectedCubeMode(legacy.preferredCubeMode ?? DEFAULT_CUBE_MODE);
          setTimerSettings(legacy.timerSettings ?? DEFAULT_TIMER_SETTINGS);
          return;
        }

        if (checkingServerDoc) return;
        checkingServerDoc = true;

        try {
          // Guard against cache-first snapshots that report "missing" before server data arrives.
          const serverSnapshot = await getDocFromServer(userDocRef);
          if (!active) return;
          if (serverSnapshot.exists()) {
            const normalized = normalizeData(serverSnapshot.data() as StorageData);
            setSessions(normalized.sessions);
            setCurrentSessionId(normalized.currentSessionId);
            setSelectedCubeMode(normalized.preferredCubeMode ?? DEFAULT_CUBE_MODE);
            setTimerSettings(normalized.timerSettings ?? DEFAULT_TIMER_SETTINGS);
            setMigrationNeeded(false);
            return;
          }
        } catch {
          // If we cannot confirm server state, avoid creating starter data that could overwrite cloud data later.
          return;
        } finally {
          checkingServerDoc = false;
        }

        const newSessionId = Date.now();
        const starter: Session = {
          id: newSessionId,
          name: `${t('session')} 1`,
          date: new Date().toISOString(),
          cubeMode: DEFAULT_CUBE_MODE,
          times: []
        };

        const starterPayload = {
          sessions: [starter],
          currentSessionId: newSessionId,
          preferredCubeMode: DEFAULT_CUBE_MODE,
          timerSettings: DEFAULT_TIMER_SETTINGS,
          migrationVersion: MIGRATION_VERSION
        };

        await setDoc(userDocRef, starterPayload);
      }
    });

    return () => {
      active = false;
      unsub();
    };
  }, [userDocRef, t]);

  const createSession = (forcedNumber?: number): void => {
    const sessionNumber = typeof forcedNumber === 'number' ? forcedNumber : (sessions.length + 1);
    let newId = Date.now();
    const existingIds = new Set(sessions.map(s => s.id));
    while (existingIds.has(newId)) {
      newId += 1;
    }

    const newSession: Session = {
      id: newId,
      name: `${t('session')} ${sessionNumber}`,
      date: new Date().toISOString(),
      cubeMode: selectedCubeMode,
      times: []
    };

    const nextSessions = [...sessions, newSession];
    setSessions(nextSessions);
    setCurrentSessionId(newId);
    void persistData(nextSessions, newId, selectedCubeMode, timerSettings);
  };

  const renameSession = (sessionId: number, newName: string): void => {
    const nextSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, name: newName }
        : session
    );
    setSessions(nextSessions);
    void persistData(nextSessions, currentSessionId, selectedCubeMode, timerSettings);
  };

  const deleteSession = (sessionId: number): void => {
    const remaining = sessions.filter(s => s.id !== sessionId);
    let nextId = currentSessionId;

    if (sessionId === currentSessionId) {
      nextId = getMostRecentSessionId(remaining);
      if (remaining.length === 0) {
        let newId = Date.now();
        while (remaining.some(s => s.id === newId)) newId += 1;
        const newSession: Session = {
          id: newId,
          name: `${t('session')} 1`,
          date: new Date().toISOString(),
          cubeMode: selectedCubeMode,
          times: []
        };
        remaining.push(newSession);
        nextId = newId;
      }
    }

    setSessions(remaining);
    setCurrentSessionId(nextId);
    void persistData(remaining, nextId, selectedCubeMode, timerSettings);
  };

  const deleteTime = (sessionId: number, timeIndex: number): void => {
    const nextSessions = sessions.map(session => {
      if (session.id !== sessionId) return session;
      return {
        ...session,
        times: session.times.filter((_, i) => i !== timeIndex)
      };
    });
    setSessions(nextSessions);
    void persistData(nextSessions, currentSessionId, selectedCubeMode, timerSettings);
  };

  const addTime = (timeMs: number, scramble: string): void => {
    const now = Date.now();
    const activeSession = sessions.find(session => session.id === currentSessionId);
    const latestSolveTimestamp = sessions
      .filter(session => session.cubeMode === selectedCubeMode)
      .flatMap(session => session.times)
      .reduce<number | null>((latest, entry) => {
      if (latest === null || entry.timestamp > latest) {
        return entry.timestamp;
      }
      return latest;
    }, null);
    const shouldStartNewSessionForInactivity = latestSolveTimestamp !== null
      && now - latestSolveTimestamp >= timerSettings.autoSessionAfterHours * HOUR_MS
      && !(activeSession && activeSession.cubeMode === selectedCubeMode && activeSession.times.length === 0);

    if (!activeSession || activeSession.cubeMode !== selectedCubeMode || shouldStartNewSessionForInactivity) {
      let newId = Date.now();
      const existingIds = new Set(sessions.map(s => s.id));
      while (existingIds.has(newId)) newId += 1;

      const newSession: Session = {
        id: newId,
        name: `${t('session')} ${sessions.length + 1}`,
        date: new Date().toISOString(),
        cubeMode: selectedCubeMode,
        times: [{
          time: timeMs,
          timestamp: now,
          scramble
        }]
      };

      const nextSessions = [...sessions, newSession];
      setSessions(nextSessions);
      setCurrentSessionId(newId);
      void persistData(nextSessions, newId, selectedCubeMode, timerSettings);
      return;
    }

    const nextSessions = sessions.map(session => {
      if (session.id !== currentSessionId) return session;
      return {
        ...session,
        times: [...session.times, {
          time: timeMs,
          timestamp: now,
          scramble
        }]
      };
    });

    setSessions(nextSessions);
    void persistData(nextSessions, currentSessionId, selectedCubeMode, timerSettings);
  };

  const moveTime = (fromSessionId: number, timeIndex: number, toSessionId: number): void => {
    if (fromSessionId === toSessionId) return;

    const fromSession = sessions.find(s => s.id === fromSessionId);
    if (!fromSession || !fromSession.times[timeIndex]) return;

    const entry = fromSession.times[timeIndex];

    const nextSessions = sessions.map(session => {
      if (session.id === fromSessionId) {
        return {
          ...session,
          times: session.times.filter((_, idx) => idx !== timeIndex)
        };
      }

      if (session.id === toSessionId) {
        return {
          ...session,
          times: [...session.times, entry]
        };
      }

      return session;
    });

    setSessions(nextSessions);
    void persistData(nextSessions, currentSessionId, selectedCubeMode, timerSettings);
  };

  const updatePreferredMode = (mode: CubeMode): void => {
    setSelectedCubeMode(mode);
    void persistData(sessions, currentSessionId, mode, timerSettings);
  };

  const updateTimerSettings = (nextSettings: Partial<TimerSettings>): void => {
    const merged = normalizeTimerSettings({ ...timerSettings, ...nextSettings });
    setTimerSettings(merged);
    void persistData(sessions, currentSessionId, selectedCubeMode, merged);
  };

  const migrateLegacyData = async (): Promise<void> => {
    if (!userDocRef) return;

    setMigrating(true);
    try {
      const legacy = await readLegacyStorage();
      if (!legacy) {
        setMigrationNeeded(false);
        return;
      }

      const normalized = normalizeData(legacy);
      const payload: StorageData = {
        sessions: normalized.sessions,
        currentSessionId: normalized.currentSessionId ?? getMostRecentSessionId(normalized.sessions),
        preferredCubeMode: normalized.preferredCubeMode ?? DEFAULT_CUBE_MODE,
        timerSettings: normalized.timerSettings ?? DEFAULT_TIMER_SETTINGS,
        migrationVersion: MIGRATION_VERSION
      };

      await setDoc(userDocRef, payload, { merge: true });
      setMigrationNeeded(false);
    } finally {
      setMigrating(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const value: SessionsContextValue = {
    sessions,
    currentSessionId,
    currentSession,
    selectedCubeMode,
    timerSettings,
    migrationNeeded,
    migrating,
    setSelectedCubeMode: updatePreferredMode,
    updateTimerSettings,
    setCurrentSessionId,
    createSession,
    renameSession,
    deleteSession,
    deleteTime,
    addTime,
    moveTime,
    migrateLegacyData
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = (): SessionsContextValue => {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error('useSessions must be used within SessionsProvider');
  }
  return context;
};
