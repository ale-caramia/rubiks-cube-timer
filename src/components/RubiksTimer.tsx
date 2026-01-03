import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, TrendingUp, Award, TrendingDown, Edit2, Check, X } from 'lucide-react';

type TimerState = 'idle' | 'ready' | 'running' | 'stopped';
type ViewType = 'timer' | 'stats';

interface Session {
  id: number;
  name: string;
  date: string;
  times: number[];
}

interface Stats {
  best: number;
  worst: number;
  average: number;
  count: number;
}

interface StorageData {
  sessions: Session[];
  currentSessionId: number | null;
}

declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string) => Promise<void>;
    };
  }
}

const RubiksTimer: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [time, setTime] = useState<number>(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [holdTimeout, setHoldTimeout] = useState<number | null>(null);
  const [view, setView] = useState<ViewType>('timer');
  const [scramble, setScramble] = useState<string>('');
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load sessions from storage
  useEffect(() => {
    const loadSessions = async (): Promise<void> => {
      try {
        const result = await window.storage.get('rubiks-sessions');
        if (result) {
          const data: StorageData = JSON.parse(result.value);
          setSessions(data.sessions || []);
          setCurrentSessionId(data.currentSessionId || null);
        }
      } catch (error) {
        console.log('No saved sessions found');
      }
    };
    loadSessions();
  }, []);

  // Save sessions to storage
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

  // Create new session if none exists
  useEffect(() => {
    if (!currentSessionId && sessions.length === 0) {
      createNewSession();
    }
  }, []);

  // Generate initial scramble
  useEffect(() => {
    if (!scramble) {
      setScramble(generateScramble());
    }
  }, []);

  const generateScramble = (): string => {
    const moves: string[] = ['R', 'L', 'U', 'D', 'F', 'B'];
    const modifiers: string[] = ['', "'", '2'];
    const scrambleLength = 20;
    const scrambleArray: string[] = [];
    let lastMove = '';
    let lastAxis = '';

    const getAxis = (move: string): string => {
      if (move === 'R' || move === 'L') return 'RL';
      if (move === 'U' || move === 'D') return 'UD';
      if (move === 'F' || move === 'B') return 'FB';
      return '';
    };

    for (let i = 0; i < scrambleLength; i++) {
      let move: string, modifier: string;
      do {
        move = moves[Math.floor(Math.random() * moves.length)];
        modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      } while (move === lastMove || getAxis(move) === lastAxis);

      scrambleArray.push(move + modifier);
      lastMove = move;
      lastAxis = getAxis(move);
    }

    return scrambleArray.join(' ');
  };

  const createNewSession = (): void => {
    const sessionNumber = sessions.length + 1;
    const newSession: Session = {
      id: Date.now(),
      name: `Sessione ${sessionNumber}`,
      date: new Date().toISOString(),
      times: []
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const renameSession = (sessionId: number, newName: string): void => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, name: newName }
        : session
    ));
    setEditingSessionId(null);
    setEditingName('');
  };

  const startEditing = (sessionId: number, currentName: string): void => {
    setEditingSessionId(sessionId);
    setEditingName(currentName);
  };

  const handlePressStart = (): void => {
    if (timerState === 'idle' || timerState === 'stopped') {
      const timeout = setTimeout(() => {
        setTimerState('ready');
        setTime(0);
      }, 500);
      setHoldTimeout(timeout);
    }
  };

  const handlePressEnd = (): void => {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      setHoldTimeout(null);
    }

    if (timerState === 'ready') {
      // Start timer
      setTimerState('running');
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setTime(Date.now() - startTimeRef.current);
        }
      }, 10);
    } else if (timerState === 'running') {
      // Stop timer
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      setTimerState('stopped');
      saveTime(time);
    } else if (timerState === 'stopped') {
      // Reset
      setTimerState('idle');
      setTime(0);
    }
  };

  const saveTime = (timeMs: number): void => {
    setSessions(prev => prev.map(session =>
      session.id === currentSessionId
        ? { ...session, times: [...session.times, timeMs] }
        : session
    ));
    // Generate new scramble for next solve
    setScramble(generateScramble());
  };

  const deleteTime = (sessionId: number, timeIndex: number): void => {
    setSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, times: session.times.filter((_, i) => i !== timeIndex) }
        : session
    ));
  };

  const deleteSession = (sessionId: number): void => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (sessionId === currentSessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remaining[0]?.id || null);
      if (remaining.length === 0) {
        createNewSession();
      }
    }
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getStats = (times: number[]): Stats | null => {
    if (times.length === 0) return null;
    const sorted = [...times].sort((a, b) => a - b);
    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      average: times.reduce((a, b) => a + b, 0) / times.length,
      count: times.length
    };
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentStats = currentSession ? getStats(currentSession.times) : null;
  
  const allTimes = sessions.flatMap(s => s.times);
  const globalStats = getStats(allTimes);

  const getStateColor = (): string => {
    switch (timerState) {
      case 'ready': return 'bg-green-400';
      case 'running': return 'bg-red-400';
      case 'stopped': return 'bg-blue-400';
      default: return 'bg-yellow-400';
    }
  };

  const getStateText = (): string => {
    switch (timerState) {
      case 'idle': return 'Tieni premuto per prepararti';
      case 'ready': return 'Rilascia per partire!';
      case 'running': return 'Risolvi il cubo...';
      case 'stopped': return 'Click per resettare';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-4 border-black bg-yellow-300 p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-2">Rubik's Timer</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView('timer')}
              className={`px-4 py-2 border-4 border-black font-bold uppercase ${
                view === 'timer' ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              Timer
            </button>
            <button
              onClick={() => setView('stats')}
              className={`px-4 py-2 border-4 border-black font-bold uppercase ${
                view === 'stats' ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              Stats
            </button>
            <button
              onClick={createNewSession}
              className="ml-auto px-4 py-2 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400 flex items-center gap-2"
            >
              <Plus size={20} /> Nuova Sessione
            </button>
          </div>
        </div>

        {view === 'timer' ? (
          <>
            {/* Scramble Display */}
            <div className="border-4 border-black bg-cyan-300 p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-sm font-bold uppercase mb-2">Scramble</div>
              <div className="text-2xl md:text-3xl font-black font-mono wrap-break-word">
                {scramble}
              </div>
            </div>

            {/* Timer Display */}
            <div
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              className={`border-8 border-black ${getStateColor()} p-12 md:p-20 mb-6 cursor-pointer select-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1.5 active:translate-y-1.5`}
            >
              <div className="text-center">
                <div className="text-6xl md:text-8xl font-black mb-4 font-mono">
                  {formatTime(time)}
                </div>
                <div className="text-xl md:text-2xl font-bold uppercase">
                  {getStateText()}
                </div>
              </div>
            </div>

            {/* Current Session Stats */}
            {currentStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border-4 border-black bg-green-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={24} />
                    <span className="font-bold uppercase text-sm">Best</span>
                  </div>
                  <div className="text-3xl font-black font-mono">{formatTime(currentStats.best)}</div>
                </div>
                <div className="border-4 border-black bg-blue-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={24} />
                    <span className="font-bold uppercase text-sm">Media</span>
                  </div>
                  <div className="text-3xl font-black font-mono">{formatTime(currentStats.average)}</div>
                </div>
                <div className="border-4 border-black bg-red-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={24} />
                    <span className="font-bold uppercase text-sm">Worst</span>
                  </div>
                  <div className="text-3xl font-black font-mono">{formatTime(currentStats.worst)}</div>
                </div>
              </div>
            )}

            {/* Recent Times */}
            {currentSession && currentSession.times.length > 0 && (
              <div className="border-4 border-black bg-purple-300 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black uppercase mb-4">Ultimi Tempi</h2>
                <div className="space-y-2">
                  {[...currentSession.times].reverse().slice(0, 10).map((time, idx) => {
                    const originalIdx = currentSession.times.length - 1 - idx;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white border-2 border-black p-3"
                      >
                        <span className="font-mono text-xl font-bold">{formatTime(time)}</span>
                        <button
                          onClick={() => deleteTime(currentSession.id, originalIdx)}
                          className="p-2 border-2 border-black bg-red-300 hover:bg-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Stats View */
          <div className="space-y-6">
            {/* Global Stats */}
            {globalStats && (
              <div className="border-4 border-black bg-orange-300 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-4">Statistiche Globali</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-bold uppercase mb-1">Totale</div>
                    <div className="text-2xl font-black">{globalStats.count}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase mb-1">Best</div>
                    <div className="text-2xl font-black font-mono">{formatTime(globalStats.best)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase mb-1">Media</div>
                    <div className="text-2xl font-black font-mono">{formatTime(globalStats.average)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase mb-1">Worst</div>
                    <div className="text-2xl font-black font-mono">{formatTime(globalStats.worst)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase">Tutte le Sessioni</h2>
              {sessions.map(session => {
                const stats = getStats(session.times);
                const date = new Date(session.date);
                const isEditing = editingSessionId === session.id;
                
                return (
                  <div
                    key={session.id}
                    className={`border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                      session.id === currentSessionId ? 'bg-yellow-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  renameSession(session.id, editingName);
                                }
                              }}
                              className="border-4 border-black px-3 py-2 text-xl font-black uppercase flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => renameSession(session.id, editingName)}
                              className="p-2 border-2 border-black bg-green-300 hover:bg-green-400"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSessionId(null);
                                setEditingName('');
                              }}
                              className="p-2 border-2 border-black bg-gray-300 hover:bg-gray-400"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black uppercase">
                              {session.name}
                            </h3>
                            <button
                              onClick={() => startEditing(session.id, session.name)}
                              className="p-1 border-2 border-black bg-blue-300 hover:bg-blue-400"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}
                        <div className="text-sm font-bold mt-1">
                          {date.toLocaleDateString('it-IT')} {date.toLocaleTimeString('it-IT')}
                        </div>
                        {session.id === currentSessionId && (
                          <span className="text-sm font-bold uppercase bg-black text-white px-2 py-1 inline-block mt-1">
                            Sessione Corrente
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-2 border-2 border-black bg-red-300 hover:bg-red-400"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    {stats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="font-bold uppercase">Solve</div>
                          <div className="font-black text-lg">{stats.count}</div>
                        </div>
                        <div>
                          <div className="font-bold uppercase">Best</div>
                          <div className="font-black text-lg font-mono">{formatTime(stats.best)}</div>
                        </div>
                        <div>
                          <div className="font-bold uppercase">Media</div>
                          <div className="font-black text-lg font-mono">{formatTime(stats.average)}</div>
                        </div>
                        <div>
                          <div className="font-bold uppercase">Worst</div>
                          <div className="font-black text-lg font-mono">{formatTime(stats.worst)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RubiksTimer;