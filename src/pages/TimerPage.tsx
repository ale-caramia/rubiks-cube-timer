import React, { useEffect, useRef, useState } from 'react';
import { Award, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { useWakeLock } from '../hooks/useWakeLock';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { generateScramble } from '../utils/scramble';
import { formatTime } from '../utils/time';
import { calculateAo5, calculateAo12, calculateBestAo5, calculateBestAo12, getStats } from '../utils/stats';
import type { TimerState } from '../types/timer';

const TimerPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentSession, addTime, deleteTime } = useSessions();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [time, setTime] = useState<number>(0);
  const [holdTimeout, setHoldTimeout] = useState<number | null>(null);
  const [scramble, setScramble] = useState<string>('');
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { requestWakeLock, releaseWakeLock } = useWakeLock(timerState === 'running');
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    if (!scramble) {
      setScramble(generateScramble());
    }
  }, [scramble]);

  const handlePressStart = (): void => {
    if (timerState === 'idle' || timerState === 'stopped') {
      const timeout = window.setTimeout(() => {
        setTimerState('ready');
        setTime(0);
      }, 1000);
      setHoldTimeout(timeout);
    }
  };

  const handlePressEnd = (): void => {
    if (holdTimeout) {
      clearTimeout(holdTimeout);
      setHoldTimeout(null);
    }

    if (timerState === 'ready') {
      setTimerState('running');
      startTimeRef.current = Date.now();
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null) {
          setTime(Date.now() - startTimeRef.current);
        }
      }, 10);
      requestWakeLock();
    } else if (timerState === 'running') {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      setTimerState('stopped');
      addTime(time, scramble);
      setScramble(generateScramble());
      releaseWakeLock();
    } else if (timerState === 'stopped') {
      setTimerState('idle');
      setTime(0);
    }
  };

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
      case 'idle': return t('holdToReady');
      case 'ready': return t('releaseToStart');
      case 'running': return t('solving');
      case 'stopped': return t('clickToReset');
      default: return '';
    }
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
          <div className="border-4 border-black bg-cyan-300 p-4 md:p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-sm font-bold uppercase mb-2">{t('scramble')}</div>
            <div className="text-2xl md:text-3xl font-black font-mono wrap-break-word">
              {scramble}
            </div>
          </div>

          <div
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            className={`border-8 border-black ${getStateColor()} p-8 md:p-20 mb-6 cursor-pointer select-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1.5 active:translate-y-1.5`}
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
