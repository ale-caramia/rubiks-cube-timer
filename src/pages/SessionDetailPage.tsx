import React, { useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { calculateAo5, calculateAo12, getStats } from '../utils/stats';
import { formatTime } from '../utils/time';

const SessionDetailPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, currentSessionId, setCurrentSessionId, deleteTime } = useSessions();
  const confirmDialog = useConfirmDialog();

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

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <div className="border-4 border-black bg-yellow-300 p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/sessions')}
              className="p-3 min-w-11 min-h-11 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
              aria-label={t('back')}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase">{session.name}</h2>
              <div className="text-xs md:text-sm font-bold mt-2">
                {new Date(session.date).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}
              </div>
            </div>
          </div>
          {session.id !== currentSessionId && (
            <button
              onClick={() => setCurrentSessionId(session.id)}
              className="mt-4 px-6 py-3 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm"
            >
              {t('setAsCurrent')}
            </button>
          )}
        </div>

        {stats && (
          <div className="border-4 border-black bg-blue-300 p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-black uppercase mb-4">{t('sessionStatistics')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-bold uppercase mb-1">{t('solves')}</div>
                <div className="text-2xl font-black">{stats.count}</div>
              </div>
              <div>
                <div className="font-bold uppercase mb-1">{t('best')}</div>
                <div className="text-2xl font-black font-mono">{formatTime(stats.best)}</div>
              </div>
              <div>
                <div className="font-bold uppercase mb-1">{t('average')}</div>
                <div className="text-2xl font-black font-mono">{formatTime(stats.average)}</div>
              </div>
              <div>
                <div className="font-bold uppercase mb-1">{t('worst')}</div>
                <div className="text-2xl font-black font-mono">{formatTime(stats.worst)}</div>
              </div>
            </div>

            {(ao5 || ao12) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {ao5 && (
                  <div>
                    <div className="font-bold uppercase mb-1">{t('currentAo5')}</div>
                    <div className="text-xl font-black font-mono">{formatTime(ao5)}</div>
                  </div>
                )}
                {ao12 && (
                  <div>
                    <div className="font-bold uppercase mb-1">{t('currentAo12')}</div>
                    <div className="text-xl font-black font-mono">{formatTime(ao12)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="border-4 border-black bg-purple-300 p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-2xl font-black uppercase mb-4">{t('allSolves')}</h3>
          <div className="space-y-3">
            {[...session.times].reverse().map((entry, idx) => {
              const originalIdx = session.times.length - 1 - idx;
              const date = new Date(entry.timestamp);
              return (
                <div key={originalIdx} className="bg-white border-4 border-black p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-mono text-2xl font-black mb-1">
                        {formatTime(entry.time)}
                      </div>
                      <div className="text-sm font-bold">
                        {date.toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}
                      </div>
                      {entry.scramble && (
                        <div className="text-xs font-mono mt-2 text-gray-700 break-all">
                          {entry.scramble}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        confirmDialog.open(
                          t('confirmDeleteTitle'),
                          t('confirmDeleteTime'),
                          () => deleteTime(session.id, originalIdx)
                        );
                      }}
                      className="p-3 border-4 border-black bg-red-300 hover:bg-red-400 min-w-11 min-h-11 shrink-0"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
    </>
  );
};

export default SessionDetailPage;
