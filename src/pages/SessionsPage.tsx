import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calendar, Check, ChevronRight, Edit2, FolderOpen, Plus, Trash2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useToast } from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatsHeader from '../components/sessions/StatsHeader';
import { getStats, calculateAo5, calculateAo12 } from '../utils/stats';
import { formatTime } from '../utils/time';
import {
  groupSessionsByMonthAndWeek,
  getGroupStats,
  formatMonthName,
  formatWeekRange,
  type MonthGroup,
  type WeekGroup
} from '../utils/sessionGroups';

type ViewState =
  | { type: 'months' }
  | { type: 'weeks'; monthKey: string }
  | { type: 'sessions'; monthKey: string; weekKey: string };

const SessionsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { sessions, currentSessionId, createSession, renameSession, deleteSession } = useSessions();
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [viewState, setViewState] = useState<ViewState>({ type: 'months' });
  const confirmDialog = useConfirmDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const locale = language === 'it' ? 'it-IT' : 'en-US';

  // Group sessions by month and week
  const monthGroups = useMemo(() => groupSessionsByMonthAndWeek(sessions), [sessions]);

  const startEditing = (sessionId: number, currentName: string): void => {
    setEditingSessionId(sessionId);
    setEditingName(currentName);
  };

  const stopEditing = (): void => {
    setEditingSessionId(null);
    setEditingName('');
  };

  const handleCreateSession = (): void => {
    createSession();
    showToast(t('sessionCreated'), 'success');
  };

  const handleDeleteSession = (session: { id: number; name: string; times: { time: number }[] }): void => {
    if (session.times.length > 0) {
      confirmDialog.open(
        t('confirmDeleteTitle'),
        `${t('confirmDeleteSession')}: ${session.name}`,
        () => {
          deleteSession(session.id);
          showToast(t('sessionDeleted'), 'info');
        }
      );
    } else {
      deleteSession(session.id);
      showToast(t('sessionDeleted'), 'info');
    }
  };

  // Get current month and week data
  const currentMonth = useMemo(() => {
    if (viewState.type === 'months') return null;
    return monthGroups.find(m => m.monthKey === viewState.monthKey) || null;
  }, [viewState, monthGroups]);

  const currentWeek = useMemo(() => {
    if (viewState.type !== 'sessions' || !currentMonth) return null;
    return currentMonth.weeks.find(w => w.weekKey === viewState.weekKey) || null;
  }, [viewState, currentMonth]);

  // Reset view state if selected group no longer exists (e.g., after deleting last session)
  useEffect(() => {
    if (viewState.type === 'weeks' && !currentMonth) {
      setViewState({ type: 'months' });
    } else if (viewState.type === 'sessions' && (!currentMonth || !currentWeek)) {
      if (currentMonth) {
        setViewState({ type: 'weeks', monthKey: viewState.monthKey });
      } else {
        setViewState({ type: 'months' });
      }
    }
  }, [viewState, currentMonth, currentWeek]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const monthKey = searchParams.get('month');
    const weekKey = searchParams.get('week');

    if (monthKey && weekKey) {
      setViewState({ type: 'sessions', monthKey, weekKey });
    } else if (monthKey) {
      setViewState({ type: 'weeks', monthKey });
    }
  }, [location.search]);

  // Render month folders view
  const renderMonthsView = () => (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-black uppercase">{t('allSessions')}</h2>
        <button
          onClick={handleCreateSession}
          className="px-4 py-3 min-h-11 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400 flex items-center gap-2 text-sm md:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">{t('newSession')}</span>
        </button>
      </div>

      {monthGroups.length === 0 ? (
        <div className="border-4 border-black p-8 bg-gray-100 text-center">
          <p className="font-bold text-lg">{t('noSessions')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {monthGroups.map(monthGroup => {
            const stats = getGroupStats(monthGroup.sessions);
            return (
              <div
                key={monthGroup.monthKey}
                onClick={() => setViewState({ type: 'weeks', monthKey: monthGroup.monthKey })}
                className="border-4 border-black p-6 bg-yellow-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen size={28} className="flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-black uppercase">
                        {formatMonthName(monthGroup.year, monthGroup.month, locale)}
                      </h3>
                      <p className="text-sm font-bold">
                        {monthGroup.sessions.length} {t('sessionsInMonth')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={24} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                  <div>
                    <div className="font-bold uppercase text-xs">{t('solves')}</div>
                    <div className="font-black text-lg">{stats.count}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs">{t('best')}</div>
                    <div className="font-black text-lg font-mono">
                      {stats.best !== null ? formatTime(stats.best) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs">{t('average')}</div>
                    <div className="font-black text-lg font-mono">
                      {stats.average !== null ? formatTime(stats.average) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs">{t('worst')}</div>
                    <div className="font-black text-lg font-mono">
                      {stats.worst !== null ? formatTime(stats.worst) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // Render weeks view for a specific month
  const renderWeeksView = (monthGroup: MonthGroup) => {
    const stats = getGroupStats(monthGroup.sessions);

    return (
      <>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setViewState({ type: 'months' })}
            className="p-3 min-w-11 min-h-11 border-4 border-black bg-gray-200 hover:bg-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl md:text-3xl font-black uppercase flex-1">
            {formatMonthName(monthGroup.year, monthGroup.month, locale)}
          </h2>
          <button
            onClick={handleCreateSession}
            className="px-4 py-3 min-h-11 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400 flex items-center gap-2 text-sm md:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('newSession')}</span>
          </button>
        </div>

        <StatsHeader
          title={t('monthStats')}
          subtitle={`${monthGroup.sessions.length} ${t('sessionsInMonth')}`}
          stats={stats}
        />

        <div className="space-y-4 mt-6">
          {monthGroup.weeks.map(weekGroup => {
            const weekStats = getGroupStats(weekGroup.sessions);
            return (
              <div
                key={weekGroup.weekKey}
                onClick={() => setViewState({
                  type: 'sessions',
                  monthKey: monthGroup.monthKey,
                  weekKey: weekGroup.weekKey
                })}
                className="border-4 border-black p-6 bg-cyan-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar size={24} className="flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-black uppercase">
                        {t('week')} {weekGroup.weekNumber}
                      </h3>
                      <p className="text-sm font-bold">
                        {formatWeekRange(weekGroup.startDate, weekGroup.endDate, locale)}
                      </p>
                      <p className="text-xs font-bold mt-1">
                        {weekGroup.sessions.length} {t('sessionsInWeek')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={24} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                  <div>
                    <div className="font-bold uppercase text-xs">{t('solves')}</div>
                    <div className="font-black text-lg">{weekStats.count}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs">{t('best')}</div>
                    <div className="font-black text-lg font-mono">
                      {weekStats.best !== null ? formatTime(weekStats.best) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs">{t('average')}</div>
                    <div className="font-black text-lg font-mono">
                      {weekStats.average !== null ? formatTime(weekStats.average) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-xs">{t('worst')}</div>
                    <div className="font-black text-lg font-mono">
                      {weekStats.worst !== null ? formatTime(weekStats.worst) : '-'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Render sessions view for a specific week
  const renderSessionsView = (monthGroup: MonthGroup, weekGroup: WeekGroup) => {
    const stats = getGroupStats(weekGroup.sessions);

    return (
      <>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setViewState({ type: 'weeks', monthKey: monthGroup.monthKey })}
            className="p-3 min-w-11 min-h-11 border-4 border-black bg-gray-200 hover:bg-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black uppercase">
              {t('week')} {weekGroup.weekNumber}
            </h2>
            <p className="text-sm font-bold">
              {formatWeekRange(weekGroup.startDate, weekGroup.endDate, locale)}
            </p>
          </div>
          <button
            onClick={handleCreateSession}
            className="px-4 py-3 min-h-11 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400 flex items-center gap-2 text-sm md:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('newSession')}</span>
          </button>
        </div>

        <StatsHeader
          title={t('weekStats')}
          subtitle={`${weekGroup.sessions.length} ${t('sessionsInWeek')}`}
          stats={stats}
        />

        <div className="space-y-4 mt-6">
          {weekGroup.sessions.map(session => {
            const sessionStats = getStats(session.times.map(t => t.time));
            const times = session.times.map(t => t.time);
            const ao5 = calculateAo5(times);
            const ao12 = calculateAo12(times);
            const date = new Date(session.date);
            const isEditing = editingSessionId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => navigate(`/sessions/${session.id}`)}
                className={`relative border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${
                  session.id === currentSessionId ? 'bg-yellow-200' : 'bg-white'
                }`}
              >
                {isEditing && (
                  <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                              renameSession(session.id, editingName);
                              stopEditing();
                            }
                          }}
                          onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                          className="border-4 border-black px-3 py-3 text-xl font-black uppercase w-full flex-1"
                          autoFocus
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              renameSession(session.id, editingName);
                              stopEditing();
                            }}
                            className="flex-1 sm:flex-none p-3 min-w-11 min-h-11 border-2 border-black bg-green-300 hover:bg-green-400"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              stopEditing();
                            }}
                            className="flex-1 sm:flex-none p-3 min-w-11 min-h-11 border-2 border-black bg-gray-300 hover:bg-gray-400"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black uppercase">{session.name}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(session.id, session.name);
                          }}
                          className="p-3 min-w-11 min-h-11 border-2 border-black bg-blue-300 hover:bg-blue-400"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}
                    <div className="text-sm font-bold mt-1">
                      {date.toLocaleDateString(locale)} {date.toLocaleTimeString(locale)}
                    </div>
                    {session.id === currentSessionId && (
                      <span className="text-sm font-bold uppercase bg-black text-white px-2 py-1 inline-block mt-1">
                        {t('currentSession')}
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session);
                      }}
                      className="p-3 min-w-11 min-h-11 border-2 border-black bg-red-300 hover:bg-red-400"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                {sessionStats && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="font-bold uppercase">{t('solves')}</div>
                        <div className="font-black text-lg">{sessionStats.count}</div>
                      </div>
                      <div>
                        <div className="font-bold uppercase">{t('best')}</div>
                        <div className="font-black text-lg font-mono">{formatTime(sessionStats.best)}</div>
                      </div>
                      <div>
                        <div className="font-bold uppercase">{t('average')}</div>
                        <div className="font-black text-lg font-mono">{formatTime(sessionStats.average)}</div>
                      </div>
                      <div>
                        <div className="font-bold uppercase">{t('worst')}</div>
                        <div className="font-black text-lg font-mono">{formatTime(sessionStats.worst)}</div>
                      </div>
                    </div>

                    {(ao5 !== null || ao12 !== null) && (
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        {ao5 !== null && (
                          <div className="bg-purple-200 p-2 border-2 border-black">
                            <div className="font-bold uppercase text-xs">{t('currentAo5')}</div>
                            <div className="font-black text-lg font-mono">{formatTime(ao5)}</div>
                          </div>
                        )}
                        {ao12 !== null && (
                          <div className="bg-purple-200 p-2 border-2 border-black">
                            <div className="font-bold uppercase text-xs">{t('currentAo12')}</div>
                            <div className="font-black text-lg font-mono">{formatTime(ao12)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {viewState.type === 'months' && renderMonthsView()}
        {viewState.type === 'weeks' && currentMonth && renderWeeksView(currentMonth)}
        {viewState.type === 'sessions' && currentMonth && currentWeek &&
          renderSessionsView(currentMonth, currentWeek)}
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
    </>
  );
};

export default SessionsPage;
