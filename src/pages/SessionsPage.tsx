import React, { useState } from 'react';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { getStats } from '../utils/stats';
import { formatTime } from '../utils/time';

const SessionsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { sessions, currentSessionId, createSession, renameSession, deleteSession } = useSessions();
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const confirmDialog = useConfirmDialog();
  const navigate = useNavigate();

  const startEditing = (sessionId: number, currentName: string): void => {
    setEditingSessionId(sessionId);
    setEditingName(currentName);
  };

  const stopEditing = (): void => {
    setEditingSessionId(null);
    setEditingName('');
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black uppercase">{t('allSessions')}</h2>
            <button
              onClick={() => createSession()}
              className="px-4 py-3 min-h-11 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400 flex items-center gap-2 text-sm md:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t('newSession')}</span>
            </button>
          </div>

          {sessions.map(session => {
            const stats = getStats(session.times.map(time => time.time));
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
                      {date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')} {date.toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US')}
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
                        if (session.times.length > 0) {
                          confirmDialog.open(
                            t('confirmDeleteTitle'),
                            `${t('confirmDeleteSession')}: ${session.name}`,
                            () => deleteSession(session.id)
                          );
                        } else {
                          deleteSession(session.id);
                        }
                      }}
                      className="p-3 min-w-11 min-h-11 border-2 border-black bg-red-300 hover:bg-red-400"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="font-bold uppercase">{t('solves')}</div>
                      <div className="font-black text-lg">{stats.count}</div>
                    </div>
                    <div>
                      <div className="font-bold uppercase">{t('best')}</div>
                      <div className="font-black text-lg font-mono">{formatTime(stats.best)}</div>
                    </div>
                    <div>
                      <div className="font-bold uppercase">{t('average')}</div>
                      <div className="font-black text-lg font-mono">{formatTime(stats.average)}</div>
                    </div>
                    <div>
                      <div className="font-bold uppercase">{t('worst')}</div>
                      <div className="font-black text-lg font-mono">{formatTime(stats.worst)}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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

export default SessionsPage;
