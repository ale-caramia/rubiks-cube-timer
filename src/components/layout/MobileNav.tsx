import React from 'react';
import { NavLink } from 'react-router-dom';
import { Award, FolderOpen, Settings, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const MobileNav: React.FC = () => {
  const { t } = useLanguage();

  const items = [
    { to: '/', label: t('timer'), icon: Award, end: true, iconBg: 'bg-yellow-200', iconActiveBg: 'bg-yellow-300' },
    { to: '/sessions', label: t('sessions'), icon: FolderOpen, iconBg: 'bg-cyan-100', iconActiveBg: 'bg-cyan-200' },
    { to: '/statistics', label: t('stats'), icon: TrendingUp, iconBg: 'bg-lime-100', iconActiveBg: 'bg-lime-200' },
    { to: '/settings', label: t('settings'), icon: Settings, iconBg: 'bg-rose-100', iconActiveBg: 'bg-rose-200' }
  ];

  const baseClass = 'group relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1.5 py-2 text-[10px] font-black uppercase tracking-[0.08em] transition-all duration-150';
  const inactiveClass = 'bg-white/78 text-black active:bg-white';
  const activeClass = 'bg-black text-cyan-200';

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border-4 border-black bg-linear-to-r from-[#fff6de] via-[#fff1f6] to-[#eef8ff] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
        <div className="grid grid-cols-4 divide-x-4 divide-black">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${baseClass} ${isActive ? activeClass : inactiveClass}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black transition-all ${isActive ? `${item.iconActiveBg} text-black shadow-[1px_1px_0px_0px_rgba(17,17,17,1)]` : `${item.iconBg} text-black/85`}`}>
                      <Icon size={18} strokeWidth={2.25} />
                    </span>
                    <span className="leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
