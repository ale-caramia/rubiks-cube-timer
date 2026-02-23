import React from 'react';
import { NavLink } from 'react-router-dom';
import { Award, FolderOpen, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const DesktopTabs: React.FC = () => {
  const { t } = useLanguage();

  const baseClass = 'px-8 py-4 font-bold uppercase transition-all flex items-center gap-2';
  const inactiveClass = 'bg-white/85 hover:bg-yellow-100';
  const activeClass = 'bg-black text-cyan-200';

  return (
    <div className="hidden md:block sticky top-0 z-30 neo-entrance">
      <div className="bg-linear-to-b from-white/35 via-cyan-50/25 to-white/45 border-b-4 backdrop-blur-lg border-black pt-4 pb-6 mb-4">
        <div className="mx-4 flex items-center justify-center">
          <div className="inline-flex items-stretch overflow-hidden rounded-2xl border-4 border-black bg-linear-to-r from-[#fff6de] via-[#fff1f6] to-[#eef8ff] shadow-[5px_5px_0px_0px_rgba(17,17,17,1)]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${baseClass} border-r-4 border-black ${isActive ? activeClass : inactiveClass}`
              }
            >
              <Award size={20} />
              {t('timer')}
            </NavLink>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                `${baseClass} border-r-4 border-black ${isActive ? activeClass : inactiveClass}`
              }
            >
              <FolderOpen size={20} />
              {t('sessions')}
            </NavLink>
            <NavLink
              to="/statistics"
              className={({ isActive }) =>
                `${baseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              <TrendingUp size={20} />
              {t('statistics')}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopTabs;
