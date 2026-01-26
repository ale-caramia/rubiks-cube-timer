import React from 'react';
import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSessions } from '../../state/SessionsContext';
import DesktopTabs from './DesktopTabs';
import MobileNav from './MobileNav';
import { getMonthKey, getWeekKey } from '../../utils/sessionGroups';

const AppLayout: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { currentSession, sessions } = useSessions();
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-5xl font-black uppercase">{t('appTitle')}</h1>
              {currentSession && (
                <div className="text-xs md:text-sm font-bold uppercase mt-1">
                  {t('currentSession')}: {currentSession.name}
                </div>
              )}
            </div>
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
          <Outlet />
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default AppLayout;
