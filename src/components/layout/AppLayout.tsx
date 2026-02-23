import React, { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useMatch, useNavigate, useParams } from 'react-router-dom';
import { Award, FolderOpen, Plus, Settings, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSessions } from '../../state/SessionsContext';
import { useAuth } from '../../state/AuthContext';
import MobileNav from './MobileNav';
import { getCubeModeMeta } from '../../utils/cubeModes';
import { formatMonthName } from '../../utils/sessionGroups';
import { useToast } from '../common/Toast';

const AppLayout: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentSession, sessions, migrationNeeded, migrateLegacyData, migrating, selectedCubeMode, createSession } = useSessions();
  const { user, loading, firebaseConfigured } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionDetailMatch = useMatch('/sessions/:sessionId');
  const { sessionId } = useParams();
  const detailSession = sessionId ? sessions.find(s => s.id === Number(sessionId)) : null;

  const isSettingsPage = location.pathname === '/settings';
  const isSessionsPage = location.pathname === '/sessions';
  const isStatisticsPage = location.pathname === '/statistics';
  const isTimerPage = location.pathname === '/';
  const sessionsSearchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isSessionsRootPage = isSessionsPage && !sessionsSearchParams.get('month') && !sessionsSearchParams.get('week');

  const navItems = useMemo(() => ([
    { path: '/', label: t('timer'), icon: Award },
    { path: '/sessions', label: t('sessions'), icon: FolderOpen },
    { path: '/statistics', label: t('statistics'), icon: TrendingUp },
    { path: '/settings', label: t('settings'), icon: Settings }
  ]), [t]);

  const pageTitle = useMemo(() => {
    if (sessionDetailMatch && detailSession) return detailSession.name;
    if (isSessionsPage) {
      const searchParams = new URLSearchParams(location.search);
      const monthKey = searchParams.get('month');
      const weekKey = searchParams.get('week');
      if (weekKey) {
        const weekMatch = weekKey.match(/W(\d{1,2})$/i);
        if (weekMatch) {
          const weekNumber = Number(weekMatch[1]);
          if (Number.isFinite(weekNumber)) {
            return `${t('week')} ${weekNumber}`;
          }
        }
      }
      if (monthKey) {
        const [yearRaw, monthRaw] = monthKey.split('-');
        const year = Number(yearRaw);
        const month = Number(monthRaw);
        if (Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
          const locale = language === 'it' ? 'it-IT' : 'en-US';
          return formatMonthName(year, month - 1, locale);
        }
      }
    }
    if (isTimerPage) return t('timer');
    if (isSessionsPage) return t('sessions');
    if (isStatisticsPage) return t('statistics');
    if (isSettingsPage) return t('settingsTitle');
    return t('appTitle');
  }, [detailSession, isSettingsPage, isSessionsPage, isStatisticsPage, isTimerPage, language, location.search, sessionDetailMatch, t]);

  const showAuthGate = firebaseConfigured && !loading && !user && !isSettingsPage;
  const handleCreateSession = (): void => {
    createSession();
    showToast(t('sessionCreated'), 'success');
  };

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="sticky top-0 z-40 pt-2 md:pt-3">
          <div className="mx-2 md:mx-4">
            <div className="neo-surface-punch neo-entrance">
              <div className="px-2 py-2 md:px-3 md:py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <img
                    src="/icon.svg"
                    alt={t('rubikLogoAlt')}
                    className="w-12 h-12 md:w-14 md:h-14 shrink-0 block -translate-y-[1px]"
                  />
                  <div className="min-w-0 flex flex-col">
                    <h1 className="text-base md:text-xl font-black uppercase truncate leading-none text-left">
                      {pageTitle}
                    </h1>
                    {currentSession && (
                      <p className="mt-1 text-[9px] md:text-[11px] font-bold uppercase truncate leading-none text-left opacity-85">
                        {t('currentSession')}: {currentSession.name} · {getCubeModeMeta(selectedCubeMode).shortLabel}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isSessionsRootPage && (
                    <button
                      onClick={handleCreateSession}
                      className="neo-chip h-9 w-9 bg-cyan-200 flex items-center justify-center"
                      aria-label={t('newSession')}
                      title={t('newSession')}
                    >
                      <Plus size={18} />
                    </button>
                  )}
                  <div className="hidden md:flex items-center gap-1">
                    {navItems.map(item => {
                      const Icon = item.icon;
                      const active = location.pathname === item.path;
                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={`h-9 w-9 flex items-center justify-center ${
                            active ? 'neo-badge-active' : 'neo-chip bg-white/85'
                          }`}
                          aria-label={item.label}
                          title={item.label}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                  {isSessionsRootPage ? <div className="w-2 h-9 md:hidden" /> : <div className="w-9 h-9 md:hidden" />}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="px-2 md:px-4 mt-3 md:mt-4">
          {!firebaseConfigured && (
            <div className="neo-surface mb-3 p-3 text-sm font-bold neo-wiggle">
              {t('firebaseNotConfigured')}
            </div>
          )}

          {migrationNeeded && user && (
            <div className="neo-surface-cool mb-3 p-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-sm font-bold">
                {t('migrationPrompt')}
              </p>
              <button
                onClick={() => void migrateLegacyData()}
                disabled={migrating}
                className="neo-btn neo-btn-ghost px-4 py-2 disabled:opacity-60"
              >
                {migrating ? t('migrationInProgress') : t('migrateNow')}
              </button>
            </div>
          )}

          {showAuthGate ? (
            <div className="neo-surface-warm p-6 neo-entrance">
              <h2 className="text-2xl font-black uppercase mb-2">{t('signInToContinue')}</h2>
              <p className="font-bold mb-4">{t('signInHint')}</p>
              <button
                onClick={() => navigate('/settings')}
                className="neo-btn neo-btn-accent px-4 py-3"
              >
                {t('openSettings')}
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
