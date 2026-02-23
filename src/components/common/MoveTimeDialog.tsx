import React, { useMemo } from 'react';
import type { Session } from '../../types/timer';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface MoveTimeDialogProps {
  isOpen: boolean;
  fromSessionId: number;
  // Index of the time entry being moved; intentionally unused here but kept for parent validation/future use.
  timeIndex: number;
  sessions: Session[];
  onMove: (toSessionId: number) => void;
  onClose: () => void;
  title: string;
  subtitle: string;
  cancelLabel: string;
  noSessionsMessage: string;
}

// Get ISO week number for a date
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Get month key (YYYY-MM)
const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

// Get week key (YYYY-WNN)
const getWeekKey = (date: Date): string => {
  // Determine ISO week year by adjusting to Thursday of the current ISO week
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const isoYear = d.getUTCFullYear();
  const weekNumber = getWeekNumber(date);
  return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`;
};

const MoveTimeDialog: React.FC<MoveTimeDialogProps> = ({
  isOpen,
  fromSessionId,
  sessions,
  onMove,
  onClose,
  title,
  subtitle,
  cancelLabel,
  noSessionsMessage
}) => {
  const { language, t } = useLanguage();
  const locale = language === 'it' ? 'it-IT' : 'en-US';

  const availableSessions = useMemo(() => {
    const fromSession = sessions.find(s => s.id === fromSessionId);
    if (!fromSession) return [];

    const fromDate = new Date(fromSession.date);
    const fromMonthKey = getMonthKey(fromDate);
    const fromWeekKey = getWeekKey(fromDate);

    // Filter sessions that are in the same month and week, excluding the current session
    return sessions.filter(session => {
      if (session.id === fromSessionId) return false;

      const sessionDate = new Date(session.date);
      const sessionMonthKey = getMonthKey(sessionDate);
      const sessionWeekKey = getWeekKey(sessionDate);

      return sessionMonthKey === fromMonthKey && sessionWeekKey === fromWeekKey;
    });
  }, [sessions, fromSessionId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="neo-surface-cool w-full max-w-md p-6 neo-entrance"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-black uppercase mb-2">{title}</h3>
        <p className="mb-6 text-sm font-bold text-black/75">{subtitle}</p>

        {availableSessions.length === 0 ? (
          <div className="neo-surface mb-6 p-4">
            <p className="text-sm font-bold">{noSessionsMessage}</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto mb-6 space-y-3">
            {availableSessions.map((session) => {
              const sessionDate = new Date(session.date);
              return (
                <button
                  key={session.id}
                  onClick={() => {
                    onMove(session.id);
                    onClose();
                  }}
                  className="neo-surface w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-black uppercase text-lg">{session.name}</div>
                      <div className="mt-1 text-xs font-bold text-black/75">
                        {sessionDate.toLocaleDateString(locale)} - {session.times.length} {session.times.length === 1 ? t('solve') : t('solves')}
                      </div>
                    </div>
                    <ArrowRight size={24} className="shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="neo-btn neo-btn-ghost min-h-11 px-6 py-3"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveTimeDialog;
