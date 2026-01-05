import React from 'react';
import { NavLink } from 'react-router-dom';
import { Award, FolderOpen, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const MobileNav: React.FC = () => {
  const { t } = useLanguage();

  const baseClass = 'px-4 py-3 font-bold uppercase text-xs flex flex-col items-center justify-center gap-1 transition-colors';
  const inactiveClass = 'bg-yellow-300 active:bg-yellow-400';
  const activeClass = 'bg-black text-white';

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t-4 border-black bg-yellow-300 md:hidden z-40">
      <div className="grid grid-cols-3 gap-0">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${baseClass} border-r-4 border-black ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Award size={20} />
          <span>{t('timer')}</span>
        </NavLink>
        <NavLink
          to="/sessions"
          className={({ isActive }) =>
            `${baseClass} border-r-4 border-black ${isActive ? activeClass : inactiveClass}`
          }
        >
          <FolderOpen size={20} />
          <span>{t('sessions')}</span>
        </NavLink>
        <NavLink
          to="/statistics"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <TrendingUp size={20} />
          <span>{t('stats')}</span>
        </NavLink>
      </div>
    </div>
  );
};

export default MobileNav;
