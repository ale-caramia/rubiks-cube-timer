import React from 'react';
import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom';
import { Languages, LogIn, LogOut } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSessions } from '../../state/SessionsContext';
import { useAuth } from '../../state/AuthContext';
import DesktopTabs from './DesktopTabs';
import MobileNav from './MobileNav';
import { getMonthKey, getWeekKey } from '../../utils/sessionGroups';
import { getCubeModeMeta } from '../../utils/cubeModes';

const AppLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { currentSession, sessions, migrationNeeded, migrateLegacyData, migrating, selectedCubeMode } = useSessions();
  const { user, loading, firebaseConfigured, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const sessionDetailMatch = useMatch('/sessions/:sessionId');
  const { sessionId } = useParams();
  const detailSession = sessionId ? sessions.find(s => s.id === Number(sessionId)) : null;
  const detailMonthKey = detailSession ? getMonthKey(new Date(detailSession.date)) : null;
  const detailWeekKey = detailSession ? getWeekKey(new Date(detailSession.date)) : null;

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="border-b-4 md:border-4 border-black bg-yellow-300 p-4 md:p-6 mb-4 md:mb-6 md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:mx-4 md:mt-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl md:text-5xl font-black uppercase">{t('appTitle')}</h1>
              {currentSession && (
                <div className="text-xs md:text-sm font-bold uppercase mt-1">
                  {t('currentSession')}: {currentSession.name} · {getCubeModeMeta(selectedCubeMode).shortLabel}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {firebaseConfigured && !loading && (
                user ? (
                  <button
                    onClick={() => void logout()}
                    className="px-3 py-2 md:px-4 md:py-3 min-h-11 border-4 border-black font-bold uppercase bg-red-300 hover:bg-red-400 flex items-center gap-2 text-sm"
                  >
                    <LogOut size={18} />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => void loginWithGoogle()}
                    className="px-3 py-2 md:px-4 md:py-3 min-h-11 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400 flex items-center gap-2 text-sm"
                  >
                    <LogIn size={18} />
                    <span className="hidden md:inline">Google Login</span>
                  </button>
                )
              )}
              <button
                onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
                className="px-3 py-2 md:px-4 md:py-3 min-h-11 border-4 border-black font-bold uppercase bg-purple-300 hover:bg-purple-400 flex items-center gap-2 text-sm md:text-base"
                title={language === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
              >
                <Languages size={18} className="md:hidden" />
                <Languages size={20} className="hidden md:block" />
                <span className="hidden md:inline">{language.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {!firebaseConfigured && (
            <div className="mt-3 border-4 border-black bg-red-200 p-3 text-sm font-bold">
              Firebase non configurato: imposta le variabili VITE_FIREBASE_* per usare login e salvataggio cloud.
            </div>
          )}

          {migrationNeeded && user && (
            <div className="mt-3 border-4 border-black bg-cyan-200 p-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-sm font-bold">
                Dati locali trovati. Migra le tue sessioni su Firebase per collegarle al tuo account.
              </p>
              <button
                onClick={() => void migrateLegacyData()}
                disabled={migrating}
                className="px-4 py-2 border-4 border-black font-bold uppercase bg-white hover:bg-gray-100 disabled:opacity-60"
              >
                {migrating ? 'Migrazione...' : 'Migra ora'}
              </button>
            </div>
          )}

          {sessionDetailMatch && detailSession && (
            <div className="mt-4 flex items-center gap-2 text-sm font-bold">
              <button
                onClick={() => {
                  if (detailMonthKey && detailWeekKey) {
                    navigate(`/sessions?month=${detailMonthKey}&week=${detailWeekKey}`);
                  } else {
                    navigate('/sessions');
                  }
                }}
                className="hover:underline"
              >
                {t('sessions')}
              </button>
              <span>/</span>
              <span className="text-gray-700">{detailSession.name}</span>
            </div>
          )}
        </div>

        {!sessionDetailMatch && <DesktopTabs />}

        <div className="px-4 md:px-4">
          {firebaseConfigured && !loading && !user ? (
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-2">Accedi per continuare</h2>
              <p className="font-bold mb-4">I dati ora vengono salvati su Firebase e associati al tuo account Google.</p>
              <button
                onClick={() => void loginWithGoogle()}
                className="px-4 py-3 border-4 border-black font-bold uppercase bg-green-300 hover:bg-green-400"
              >
                Login con Google
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default AppLayout;
