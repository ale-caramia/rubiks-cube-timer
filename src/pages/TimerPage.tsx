import React, { useEffect, useRef, useState } from 'react';
import { Award, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { generateScramble } from '../utils/scramble';
import { CUBE_MODES, getCubeModeMeta } from '../utils/cubeModes';
import { formatTime } from '../utils/time';
import { calculateAo5, calculateAo12, calculateBestAo5, calculateBestAo12, getStats } from '../utils/stats';
import type { TimerState } from '../types/timer';

const INSPECTION_DURATION_MS = 15000;
const PRE_START_COUNTDOWN_SECONDS = 5;

const TimerPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentSession, addTime, deleteTime, selectedCubeMode, setSelectedCubeMode } = useSessions();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [time, setTime] = useState<number>(0);
  const holdTimeoutRef = useRef<number | null>(null);
  const [inspectionRemainingMs, setInspectionRemainingMs] = useState<number>(INSPECTION_DURATION_MS);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(PRE_START_COUNTDOWN_SECONDS);
  const [scramble, setScramble] = useState<string>('');
  const intervalRef = useRef<number | null>(null);
  const inspectionRafRef = useRef<number | null>(null);
  const inspectionStartRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { requestWakeLock, releaseWakeLock } = useWakeLock(
    timerState === 'running' || timerState === 'inspection' || timerState === 'countdown'
  );
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    if (!scramble) {
      setScramble(generateScramble(selectedCubeMode));
    }
  }, [scramble, selectedCubeMode]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current !== null) {
        clearTimeout(holdTimeoutRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (inspectionRafRef.current !== null) {
        cancelAnimationFrame(inspectionRafRef.current);
      }
      if (countdownIntervalRef.current !== null) {
        clearInterval(countdownIntervalRef.current);
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  const clearIntervalRef = (ref: React.MutableRefObject<number | null>): void => {
    if (ref.current !== null) {
      clearInterval(ref.current);
      ref.current = null;
    }
  };

  const clearRafRef = (ref: React.MutableRefObject<number | null>): void => {
    if (ref.current !== null) {
      cancelAnimationFrame(ref.current);
      ref.current = null;
    }
  };

  const resetPreSolveTimers = (): void => {
    setInspectionRemainingMs(INSPECTION_DURATION_MS);
    setCountdownSeconds(PRE_START_COUNTDOWN_SECONDS);
  };

  const cancelPreSolve = (): void => {
    clearRafRef(inspectionRafRef);
    inspectionStartRef.current = null;
    clearIntervalRef(countdownIntervalRef);
    setTimerState('idle');
    setTime(0);
    resetPreSolveTimers();
    setScramble(generateScramble(selectedCubeMode));
    releaseWakeLock();
  };

  const startCountdown = (): void => {
    setTimerState('countdown');
    setCountdownSeconds(PRE_START_COUNTDOWN_SECONDS);
    const countdownStart = Date.now();
    countdownIntervalRef.current = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - countdownStart) / 1000);
      const remaining = Math.max(0, PRE_START_COUNTDOWN_SECONDS - elapsedSeconds);
      setCountdownSeconds(remaining);
      if (remaining === 0) {
        clearIntervalRef(countdownIntervalRef);
        setTimerState('running');
        setTime(0);
        startTimeRef.current = Date.now();
        intervalRef.current = window.setInterval(() => {
          if (startTimeRef.current !== null) {
            setTime(Date.now() - startTimeRef.current);
          }
        }, 10);
        requestWakeLock();
      }
    }, 50);
  };

  const startInspection = (): void => {
    clearIntervalRef(intervalRef);
    clearIntervalRef(countdownIntervalRef);
    clearRafRef(inspectionRafRef);
    setTimerState('inspection');
    setTime(0);
    setInspectionRemainingMs(INSPECTION_DURATION_MS);
    inspectionStartRef.current = Date.now();
    const tick = (): void => {
      if (inspectionStartRef.current === null) {
        return;
      }
      const elapsed = Date.now() - inspectionStartRef.current;
      const remaining = Math.max(0, INSPECTION_DURATION_MS - elapsed);
      setInspectionRemainingMs(remaining);
      if (remaining === 0) {
        clearRafRef(inspectionRafRef);
        inspectionStartRef.current = null;
        startCountdown();
        return;
      }
      inspectionRafRef.current = requestAnimationFrame(tick);
    };
    inspectionRafRef.current = requestAnimationFrame(tick);
    requestWakeLock();
  };

  const handlePressStart = (): void => {
    if (timerState === 'idle' || timerState === 'stopped') {
      const timeout = window.setTimeout(() => {
        setTimerState('ready');
        setTime(0);
      }, 1000);
      holdTimeoutRef.current = timeout;
    }
  };

  const handlePressEnd = (): void => {
    if (holdTimeoutRef.current !== null) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (timerState === 'ready') {
      startInspection();
    } else if (timerState === 'inspection') {
      cancelPreSolve();
    } else if (timerState === 'countdown') {
      cancelPreSolve();
    } else if (timerState === 'running') {
      clearIntervalRef(intervalRef);
      setTimerState('stopped');
      addTime(time, scramble);
      setScramble(generateScramble(selectedCubeMode));
      releaseWakeLock();
    } else if (timerState === 'stopped') {
      setTimerState('idle');
      setTime(0);
    }
  };

  const getStateColor = (): string => {
    switch (timerState) {
      case 'ready': return 'bg-green-400';
      case 'inspection': return 'bg-orange-300';
      case 'countdown': return 'bg-yellow-300';
      case 'running': return 'bg-red-400';
      case 'stopped': return 'bg-blue-400';
      default: return 'bg-yellow-400';
    }
  };

  const getStateText = (): string => {
    switch (timerState) {
      case 'idle': return t('holdToReady');
      case 'ready': return t('releaseToStart');
      case 'inspection': return t('inspection');
      case 'countdown': return t('countdown');
      case 'running': return t('solving');
      case 'stopped': return t('clickToReset');
      default: return '';
    }
  };

  const getCountdownColor = (): string => {
    if (countdownSeconds >= 4) return 'text-green-700';
    if (countdownSeconds === 3) return 'text-yellow-700';
    if (countdownSeconds === 2) return 'text-orange-700';
    return 'text-red-700';
  };

  const formatInspectionSeconds = (remainingMs: number): string => {
    const seconds = Math.max(0, remainingMs) / 1000;
    return seconds.toFixed(2);
  };

  const renderTimerValue = (): React.ReactNode => {
    if (timerState === 'inspection') {
      return formatInspectionSeconds(inspectionRemainingMs);
    }
    if (timerState === 'countdown') {
      return countdownSeconds;
    }
    return formatTime(time);
  };

  const currentStats = currentSession ? getStats(currentSession.times.map(t => t.time)) : null;

  return (
    <>
      {timerState === 'running' ? (
        <div
          onMouseUp={handlePressEnd}
          onTouchEnd={handlePressEnd}
          className="fixed inset-0 bg-red-400 border-8 border-black cursor-pointer select-none z-50 flex items-center justify-center"
        >
          <div className="text-center px-4">
            <div className="text-8xl md:text-9xl font-black mb-8 font-mono">
              {formatTime(time)}
            </div>
            <div className="text-3xl md:text-5xl font-bold uppercase">
              {t('solving')}
            </div>
            <div className="text-xl md:text-2xl font-bold uppercase mt-8 opacity-70">
              {t('tapToStop')}
            </div>
          </div>
        </div>
      ) : (
        <>

          <div className="border-4 border-black bg-white p-3 md:p-4 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-bold uppercase mb-2">Categoria cubo</div>
            <div className="flex flex-wrap gap-2">
              {CUBE_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedCubeMode(mode.id);
                    setScramble(generateScramble(mode.id));
                  }}
                  className={`px-3 py-2 border-4 border-black font-bold uppercase text-xs md:text-sm ${mode.accentClass} ${selectedCubeMode === mode.id ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'opacity-80'}`}
                >
                  {mode.shortLabel}
                </button>
              ))}
            </div>
          </div>
          <div className="border-4 border-black bg-cyan-300 p-4 md:p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-bold uppercase mb-2">{t('scramble')}</div>
            <div className="text-2xl md:text-3xl font-black font-mono wrap-break-word">
              {scramble}
            </div>
            <div className="text-xs font-bold uppercase mt-2">Modalità: {getCubeModeMeta(selectedCubeMode).label}</div>
          </div>

          <div
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            className={`border-8 border-black ${getStateColor()} p-8 md:p-20 mb-6 cursor-pointer select-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1.5 active:translate-y-1.5`}
          >
            <div className="text-center">
              {timerState === 'inspection' ? (
                <>
                  <div className="text-sm md:text-base font-bold uppercase mb-3">
                    {t('inspection')}
                  </div>
                  <div className="text-6xl md:text-8xl font-black font-mono">
                    {renderTimerValue()}
                  </div>
                  <div className="text-xs md:text-sm font-bold uppercase mt-1 opacity-70">
                    {t('inspectionSeconds')}
                  </div>
                  <div className="text-sm md:text-base font-bold uppercase mt-4 opacity-70">
                    {t('tapToCancel')}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`text-6xl md:text-8xl font-black mb-4 font-mono ${
                      timerState === 'countdown' ? getCountdownColor() : ''
                    }`}
                  >
                    {renderTimerValue()}
                  </div>
                  <div className="text-xl md:text-2xl font-bold uppercase">
                    {getStateText()}
                  </div>
                  {(timerState === 'countdown') && (
                    <div className="text-sm md:text-base font-bold uppercase mt-2 opacity-70">
                      {t('countdownSeconds')}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {currentStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="border-4 border-black bg-green-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={24} />
                  <span className="font-bold uppercase text-sm">{t('best')}</span>
                </div>
                <div className="text-3xl font-black font-mono">{formatTime(currentStats.best)}</div>
              </div>
              <div className="border-4 border-black bg-blue-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={24} />
                  <span className="font-bold uppercase text-sm">{t('average')}</span>
                </div>
                <div className="text-3xl font-black font-mono">{formatTime(currentStats.average)}</div>
              </div>
              <div className="border-4 border-black bg-red-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={24} />
                  <span className="font-bold uppercase text-sm">{t('worst')}</span>
                </div>
                <div className="text-3xl font-black font-mono">{formatTime(currentStats.worst)}</div>
              </div>
            </div>
          )}

          {currentSession && currentSession.times.length >= 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {calculateAo5(currentSession.times.map(t => t.time)) && (
                <div className="border-4 border-black bg-cyan-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={24} />
                    <span className="font-bold uppercase text-sm">{t('currentAo5')}</span>
                  </div>
                  <div className="text-3xl font-black font-mono">
                    {formatTime(calculateAo5(currentSession.times.map(t => t.time))!)}
                  </div>
                  {calculateBestAo5(currentSession.times.map(t => t.time)) && (
                    <div className="text-sm font-bold mt-2">
                      {t('best')}: {formatTime(calculateBestAo5(currentSession.times.map(t => t.time))!)}
                    </div>
                  )}
                </div>
              )}
              {currentSession.times.length >= 12 && calculateAo12(currentSession.times.map(t => t.time)) && (
                <div className="border-4 border-black bg-orange-300 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={24} />
                    <span className="font-bold uppercase text-sm">{t('currentAo12')}</span>
                  </div>
                  <div className="text-3xl font-black font-mono">
                    {formatTime(calculateAo12(currentSession.times.map(t => t.time))!)}
                  </div>
                  {calculateBestAo12(currentSession.times.map(t => t.time)) && (
                    <div className="text-sm font-bold mt-2">
                      {t('best')}: {formatTime(calculateBestAo12(currentSession.times.map(t => t.time))!)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentSession && currentSession.times.length > 0 && (
            <div className="border-4 border-black bg-purple-300 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-4">{t('recentTimes')}</h2>
              <div className="space-y-2">
                {[...currentSession.times].reverse().slice(0, 10).map((entry, idx) => {
                  const originalIdx = currentSession.times.length - 1 - idx;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border-2 border-black p-3"
                    >
                      <span className="font-mono text-xl font-bold">{formatTime(entry.time)}</span>
                      <button
                        onClick={() => {
                          confirmDialog.open(
                            t('confirmDeleteTitle'),
                            t('confirmDeleteTime'),
                            () => deleteTime(currentSession.id, originalIdx)
                          );
                        }}
                        className="p-3 min-w-11 min-h-11 border-2 border-black bg-red-300 hover:bg-red-400"
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
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDialog.confirm}
        onClose={confirmDialog.close}
      />
    </>
  );
};

export default TimerPage;
