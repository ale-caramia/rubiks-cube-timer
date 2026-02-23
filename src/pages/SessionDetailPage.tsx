import React, { useEffect, useState } from 'react';
import { Trash2, MoveRight, ChevronRight, CalendarClock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MoveTimeDialog from '../components/common/MoveTimeDialog';
import { useToast } from '../components/common/Toast';
import { calculateAo5, calculateAo12, getStats } from '../utils/stats';
import { formatTime } from '../utils/time';
import { getMonthKey, getWeekKey } from '../utils/sessionGroups';

const SessionDetailPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, currentSessionId, setCurrentSessionId, deleteTime, moveTime } = useSessions();
  const confirmDialog = useConfirmDialog();
  const { showToast } = useToast();
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);

  const session = sessions.find(s => s.id === Number(sessionId));

  useEffect(() => {
    if (!session) {
      navigate('/sessions', { replace: true });
    }
  }, [session, navigate]);

  if (!session) return null;

  const stats = getStats(session.times.map(t => t.time));
  const ao5 = calculateAo5(session.times.map(t => t.time));
  const ao12 = calculateAo12(session.times.map(t => t.time));
  const sessionMonthKey = getMonthKey(new Date(session.date));
  const sessionWeekKey = getWeekKey(new Date(session.date));

  const handleMoveTime = (toSessionId: number) => {
    if (selectedTimeIndex !== null) {
      const isLastTime = session.times.length === 1;

      // Close the dialog and show feedback immediately for better UX
      setMoveDialogOpen(false);
      showToast(t('timeMoved'), 'success');

      // Perform the move
      moveTime(session.id, selectedTimeIndex, toSessionId);

      // If this was the last time in the session, navigate away from this page
      if (isLastTime) {
        navigate(`/sessions?month=${sessionMonthKey}&week=${sessionWeekKey}`, { replace: true });
      }
    }
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6 neo-entrance">
        <div className="neo-surface px-3 py-2">
          <div className="flex items-center gap-2 flex-wrap text-xs md:text-sm font-bold uppercase">
            <button
              onClick={() => navigate('/sessions')}
              className="hover:underline"
            >
              {t('allSessions')}
            </button>
            <ChevronRight size={14} />
            <button
              onClick={() => navigate(`/sessions?month=${sessionMonthKey}`)}
              className="hover:underline"
            >
              {new Date(session.date).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long', year: 'numeric' })}
            </button>
            <ChevronRight size={14} />
            <button
              onClick={() => navigate(`/sessions?month=${sessionMonthKey}&week=${sessionWeekKey}`)}
              className="hover:underline"
            >
              {t('week')} {getWeekKey(new Date(session.date)).split('W')[1]}
            </button>
            <ChevronRight size={14} />
            <span className="opacity-70">{session.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-stretch justify-between gap-3">
          <div className="neo-chip inline-flex h-11 items-center gap-2 px-3">
            <CalendarClock size={16} className="shrink-0" />
            <span className="text-[11px] md:text-sm font-bold leading-none">
              {new Date(session.date).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}
            </span>
          </div>
          {session.id === currentSessionId ? (
            <span className="neo-badge-active ml-auto inline-flex h-11 items-center px-3 text-[10px] md:text-xs font-black uppercase">
              {t('currentSession')}
            </span>
          ) : (
            <button
              onClick={() => setCurrentSessionId(session.id)}
              className="neo-btn neo-btn-positive ml-auto h-11 px-5 text-sm"
            >
              {t('setAsCurrent')}
            </button>
          )}
        </div>

        {stats && (
          <div className="neo-surface-cool p-3 md:p-5">
            <h3 className="text-xl md:text-2xl font-black uppercase">{t('sessionStatistics')}</h3>

            <div className="-mx-1 mt-3 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                <div className="neo-block w-28 md:w-36 p-2 md:p-3">
                  <div className="font-bold uppercase text-[10px] md:text-xs">{t('solves')}</div>
                  <div className="text-lg md:text-2xl font-black">{stats.count}</div>
                </div>
                <div className="neo-stat-best w-32 md:w-44 p-2 md:p-3">
                  <div className="font-bold uppercase text-[10px] md:text-xs">{t('best')}</div>
                  <div className="text-lg md:text-2xl font-black font-mono">{formatTime(stats.best)}</div>
                </div>
                <div className="neo-stat-average w-32 md:w-44 p-2 md:p-3">
                  <div className="font-bold uppercase text-[10px] md:text-xs">{t('average')}</div>
                  <div className="text-lg md:text-2xl font-black font-mono">{formatTime(stats.average)}</div>
                </div>
                <div className="neo-stat-worst w-32 md:w-44 p-2 md:p-3">
                  <div className="font-bold uppercase text-[10px] md:text-xs">{t('worst')}</div>
                  <div className="text-lg md:text-2xl font-black font-mono">{formatTime(stats.worst)}</div>
                </div>
              </div>
            </div>

            {(ao5 || ao12) && (
              <details className="neo-block mt-3 px-3 py-2">
                <summary className="cursor-pointer font-bold uppercase text-xs md:text-sm">
                  {t('aoDetails')}
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ao5 && (
                    <div className="neo-block p-2">
                      <div className="font-bold uppercase text-[10px] md:text-xs">{t('currentAo5')}</div>
                      <div className="text-base md:text-lg font-black font-mono">{formatTime(ao5)}</div>
                    </div>
                  )}
                  {ao12 && (
                    <div className="neo-block p-2">
                      <div className="font-bold uppercase text-[10px] md:text-xs">{t('currentAo12')}</div>
                      <div className="text-base md:text-lg font-black font-mono">{formatTime(ao12)}</div>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        <div className={stats ? 'mt-8 md:mt-10' : ''}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-2xl font-black uppercase">{t('allSolves')}</h3>
            <div className="neo-chip px-3 py-1 text-xs md:text-sm font-black uppercase">
              {session.times.length} {t('solves')}
            </div>
          </div>

          {session.times.length === 0 ? (
            <div className="neo-surface p-5 text-center font-bold">
              {t('noData')}
            </div>
          ) : (
            <div className="space-y-3">
              {[...session.times].reverse().map((entry, idx) => {
                const originalIdx = session.times.length - 1 - idx;
                const date = new Date(entry.timestamp);
                return (
                  <div key={originalIdx} className="neo-surface overflow-hidden">
                    <div className="grid md:grid-cols-[1fr_auto]">
                      <div className="p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="neo-chip px-2 py-1 text-[10px] md:text-xs font-black uppercase leading-none">
                            #{session.times.length - idx}
                          </span>
                          <span className="text-xs md:text-sm font-bold">
                            {date.toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}
                          </span>
                        </div>

                        <div className="font-mono text-2xl md:text-3xl font-black mb-2">
                          {formatTime(entry.time)}
                        </div>

                        {entry.scramble && (
                          <div className="neo-block mt-3 p-2">
                            <div className="text-[10px] md:text-xs font-bold uppercase mb-1">{t('scramble')}</div>
                            <div className="text-xs font-mono text-black/75 break-all">
                              {entry.scramble}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t-4 md:border-t-0 md:border-l-4 border-black bg-linear-to-b from-cyan-100/70 to-yellow-100/70 flex md:flex-col gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedTimeIndex(originalIdx);
                            setMoveDialogOpen(true);
                          }}
                          className="neo-btn neo-btn-info neo-icon-btn"
                          title={t('moveTime')}
                        >
                          <MoveRight size={20} />
                        </button>
                        <button
                          onClick={() => {
                            confirmDialog.open(
                              t('confirmDeleteTitle'),
                              t('confirmDeleteTime'),
                              () => deleteTime(session.id, originalIdx)
                            );
                          }}
                          className="neo-btn neo-btn-danger neo-icon-btn"
                          title={t('delete')}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDialog.confirm}
        onClose={confirmDialog.close}
      />

      <MoveTimeDialog
        isOpen={moveDialogOpen}
        fromSessionId={session.id}
        timeIndex={selectedTimeIndex ?? 0}
        sessions={sessions}
        onMove={handleMoveTime}
        onClose={() => setMoveDialogOpen(false)}
        title={t('moveTimeTitle')}
        subtitle={t('moveTimeSubtitle')}
        cancelLabel={t('cancel')}
        noSessionsMessage={t('noAvailableSessions')}
      />
    </>
  );
};

export default SessionDetailPage;
