import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, StorageData, TimeEntry } from '../types/timer';
import { useLanguage } from '../i18n/LanguageContext';

interface SessionsContextValue {
  sessions: Session[];
  currentSessionId: number | null;
  currentSession: Session | null;
  setCurrentSessionId: (id: number | null) => void;
  createSession: (forcedNumber?: number) => void;
  renameSession: (sessionId: number, newName: string) => void;
  deleteSession: (sessionId: number) => void;
  deleteTime: (sessionId: number, timeIndex: number) => void;
  addTime: (timeMs: number, scramble: string) => void;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

const migrateSessionData = (session: Session | { times: number[] } & Omit<Session, 'times'>): Session => {
  if (session.times.length === 0) {
    return { ...session, times: [] } as Session;
  }

  if (typeof session.times[0] === 'object' && 'timestamp' in session.times[0]) {
    return session as Session;
  }

  const baseTimestamp = new Date(session.date).getTime();
  const estimatedInterval = 3 * 60 * 1000;

  return {
    ...session,
    times: (session.times as number[]).map((time: number, index: number): TimeEntry => ({
      time,
      timestamp: baseTimestamp + (index * estimatedInterval),
      scramble: undefined
    }))
  };
};

export const SessionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  useEffect(() => {
    const loadSessions = async (): Promise<void> => {
      try {
        const result = await window.storage.get('rubiks-sessions');
        if (result) {
          const data: StorageData = JSON.parse(result.value);
          const migratedSessions = data.sessions.map(migrateSessionData);

          const uniqueSessions: Session[] = [];
          const seenIds = new Set<number>();
          for (const session of migratedSessions) {
            if (!seenIds.has(session.id)) {
              seenIds.add(session.id);
              uniqueSessions.push(session);
            }
          }

          setSessions(uniqueSessions);
          setCurrentSessionId(data.currentSessionId || null);
        }
      } catch (error) {
        console.log('No saved sessions found');
      } finally {
        setSessionsLoaded(true);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    const saveSessions = async (): Promise<void> => {
      if (sessions.length > 0 || currentSessionId) {
        try {
          await window.storage.set('rubiks-sessions', JSON.stringify({
            sessions,
            currentSessionId
          }));
        } catch (error) {
          console.error('Error saving sessions:', error);
        }
      }
    };
    saveSessions();
  }, [sessions, currentSessionId]);

  useEffect(() => {
    if (sessionsLoaded && sessions.length === 0) {
      createSession(1);
    }
  }, [sessionsLoaded, sessions.length]);

  // Auto-create new session if last solve was 6+ hours ago
  useEffect(() => {
    if (!sessionsLoaded || sessions.length === 0) return;

    // Find the most recent solve across all sessions
    let lastSolveTimestamp: number | null = null;
    for (const session of sessions) {
      for (const timeEntry of session.times) {
        if (lastSolveTimestamp === null || timeEntry.timestamp > lastSolveTimestamp) {
          lastSolveTimestamp = timeEntry.timestamp;
        }
      }
    }

    // If there are no solves yet, don't create a new session
    if (lastSolveTimestamp === null) return;

    // Check if 6 hours (21600000 ms) have passed since the last solve
    const now = Date.now();
    const sixHoursInMs = 6 * 60 * 60 * 1000;
    const timeSinceLastSolve = now - lastSolveTimestamp;

    if (timeSinceLastSolve >= sixHoursInMs) {
      // Create a new session and set it as current
      createSession();
    }
  }, [sessionsLoaded]);

  const createSession = (forcedNumber?: number): void => {
    let createdId: number | null = null;
    setSessions(prev => {
      const sessionNumber = typeof forcedNumber === 'number' ? forcedNumber : (prev.length + 1);

      let newId = Date.now();
      const existingIds = new Set(prev.map(s => s.id));
      while (existingIds.has(newId)) {
        newId += 1;
      }

      const newSession: Session = {
        id: newId,
        name: `${t('session')} ${sessionNumber}`,
        date: new Date().toISOString(),
        times: []
      };
      createdId = newId;
      return [...prev, newSession];
    });
    if (createdId !== null) {
      setCurrentSessionId(createdId);
    }
  };

  const renameSession = (sessionId: number, newName: string): void => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, name: newName }
        : session
    ));
  };

  const deleteSession = (sessionId: number): void => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));

    if (sessionId === currentSessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remaining[0]?.id || null);
      if (remaining.length === 0) {
        createSession(1);
      }
    }
  };

  const deleteTime = (sessionId: number, timeIndex: number): void => {
    const targetSession = sessions.find(s => s.id === sessionId);
    if (targetSession && targetSession.times.length === 1) {
      deleteSession(sessionId);
      return;
    }
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, times: session.times.filter((_, i) => i !== timeIndex) }
        : session
    ));
  };

  const addTime = (timeMs: number, scramble: string): void => {
    if (!currentSessionId) return;
    setSessions(prev => prev.map(session =>
      session.id === currentSessionId
        ? {
            ...session,
            times: [...session.times, {
              time: timeMs,
              timestamp: Date.now(),
              scramble
            }]
          }
        : session
    ));
  };

  const currentSession = useMemo(
    () => sessions.find(s => s.id === currentSessionId) || null,
    [sessions, currentSessionId]
  );

  const value: SessionsContextValue = {
    sessions,
    currentSessionId,
    currentSession,
    setCurrentSessionId,
    createSession,
    renameSession,
    deleteSession,
    deleteTime,
    addTime
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
