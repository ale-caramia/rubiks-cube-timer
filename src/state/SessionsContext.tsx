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
  moveTime: (fromSessionId: number, timeIndex: number, toSessionId: number) => void;
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
      // Delete all empty sessions before creating a new one
      setSessions(prev => prev.filter(s => s.times.length > 0));
      // Create a new session and set it as current
      createSession();
    }
  }, [sessionsLoaded]);

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
      times: []
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newId);
  };

  const renameSession = (sessionId: number, newName: string): void => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, name: newName }
        : session
    ));
  };

  const deleteSession = (sessionId: number): void => {
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);

    if (sessionId === currentSessionId) {
      const nextId = getMostRecentSessionId(remaining);
      setCurrentSessionId(nextId);
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

    // Check if we need to create a new session due to inactivity
    let lastSolveTimestamp: number | null = null;
    for (const session of sessions) {
      for (const timeEntry of session.times) {
        if (lastSolveTimestamp === null || timeEntry.timestamp > lastSolveTimestamp) {
          lastSolveTimestamp = timeEntry.timestamp;
        }
      }
    }

    const now = Date.now();
    const sixHoursInMs = 6 * 60 * 60 * 1000;

    // If 6+ hours have passed since last solve, create a new session
    if (lastSolveTimestamp !== null && (now - lastSolveTimestamp) >= sixHoursInMs) {
      // Filter out empty sessions
      const nonEmptySessions = sessions.filter(s => s.times.length > 0);

      // Create new session with the new time
      const sessionNumber = nonEmptySessions.length + 1;
      let newId = Date.now();
      const existingIds = new Set(nonEmptySessions.map(s => s.id));
      while (existingIds.has(newId)) {
        newId += 1;
      }

      const newSession: Session = {
        id: newId,
        name: `${t('session')} ${sessionNumber}`,
        date: new Date().toISOString(),
        times: [{
          time: timeMs,
          timestamp: now,
          scramble
        }]
      };

      setSessions(prev => [...prev.filter(s => s.times.length > 0), newSession]);
      setCurrentSessionId(newId);
    } else {
      // Normal add time to current session
      setSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? {
              ...session,
              times: [...session.times, {
                time: timeMs,
                timestamp: now,
                scramble
              }]
            }
          : session
      ));
    }
  };

  const moveTime = (fromSessionId: number, timeIndex: number, toSessionId: number): void => {
    const fromSession = sessions.find(s => s.id === fromSessionId);
    if (!fromSession || timeIndex < 0 || timeIndex >= fromSession.times.length) {
      return;
    }

    const timeEntry = fromSession.times[timeIndex];
    const willDeleteFromSession = fromSession.times.length === 1;

    setSessions(prev => {
      let updated = prev.map(session => {
        if (session.id === fromSessionId) {
          // Remove from source session
          return { ...session, times: session.times.filter((_, i) => i !== timeIndex) };
        } else if (session.id === toSessionId) {
          // Add to destination session
          return { ...session, times: [...session.times, timeEntry] };
        }
        return session;
      });

      // If source session is now empty, remove it
      if (willDeleteFromSession) {
        updated = updated.filter(s => s.id !== fromSessionId);
      }

      return updated;
    });

    // If we deleted the current session, switch to another one
    if (willDeleteFromSession && fromSessionId === currentSessionId) {
      const remaining = sessions.filter(s => s.id !== fromSessionId);
      const nextId = getMostRecentSessionId(remaining);
      setCurrentSessionId(nextId);
      if (remaining.length === 0) {
        createSession(1);
      }
    }
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
    addTime,
    moveTime
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
