import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatTime } from '../../utils/time';

interface StatsHeaderProps {
  title: string;
  subtitle?: string;
  stats: {
    count: number;
    sessionCount: number;
    best: number | null;
    worst: number | null;
    average: number | null;
    ao5: number | null;
    ao12: number | null;
  };
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ title, subtitle, stats }) => {
  const { t } = useLanguage();

  return (
    <div className="neo-surface-warm p-3 md:p-5 neo-entrance">
      <div>
        <h2 className="text-xl md:text-3xl font-black uppercase leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs md:text-sm font-bold mt-1">{subtitle}</p>
        )}
      </div>

      <div className="-mx-1 mt-3 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2 px-1">
          <div className="neo-block w-28 md:w-36 p-2 md:p-3">
            <div className="font-bold uppercase text-[10px] md:text-xs">{t('solves')}</div>
            <div className="font-black text-lg md:text-2xl">{stats.count}</div>
          </div>
          <div className="neo-stat-best w-32 md:w-44 p-2 md:p-3">
            <div className="font-bold uppercase text-[10px] md:text-xs">{t('best')}</div>
            <div className="font-black text-lg md:text-2xl font-mono">
              {stats.best !== null ? formatTime(stats.best) : '-'}
            </div>
          </div>
          <div className="neo-stat-average w-32 md:w-44 p-2 md:p-3">
            <div className="font-bold uppercase text-[10px] md:text-xs">{t('average')}</div>
            <div className="font-black text-lg md:text-2xl font-mono">
              {stats.average !== null ? formatTime(stats.average) : '-'}
            </div>
          </div>
          <div className="neo-stat-worst w-32 md:w-44 p-2 md:p-3">
            <div className="font-bold uppercase text-[10px] md:text-xs">{t('worst')}</div>
            <div className="font-black text-lg md:text-2xl font-mono">
              {stats.worst !== null ? formatTime(stats.worst) : '-'}
            </div>
          </div>
        </div>
      </div>

      {(stats.ao5 !== null || stats.ao12 !== null) && (
        <details className="neo-block mt-3 px-3 py-2">
          <summary className="cursor-pointer font-bold uppercase text-xs md:text-sm">
            {t('aoDetails')}
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {stats.ao5 !== null && (
              <div className="neo-block p-2">
                <div className="font-bold uppercase text-[10px] md:text-xs">{t('currentAo5')}</div>
                <div className="font-black text-base md:text-lg font-mono">{formatTime(stats.ao5)}</div>
              </div>
            )}
            {stats.ao12 !== null && (
              <div className="neo-block p-2">
                <div className="font-bold uppercase text-[10px] md:text-xs">{t('currentAo12')}</div>
                <div className="font-black text-base md:text-lg font-mono">{formatTime(stats.ao12)}</div>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
};

export default StatsHeader;
