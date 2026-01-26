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
    <div className="border-4 border-black bg-orange-300 p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-black uppercase">{title}</h2>
        {subtitle && (
          <p className="text-sm font-bold mt-1">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-white/50 p-3 border-2 border-black">
          <div className="font-bold uppercase text-xs">{t('solves')}</div>
          <div className="font-black text-xl">{stats.count}</div>
        </div>
        <div className="bg-white/50 p-3 border-2 border-black">
          <div className="font-bold uppercase text-xs">{t('best')}</div>
          <div className="font-black text-xl font-mono">
            {stats.best !== null ? formatTime(stats.best) : '-'}
          </div>
        </div>
        <div className="bg-white/50 p-3 border-2 border-black">
          <div className="font-bold uppercase text-xs">{t('average')}</div>
          <div className="font-black text-xl font-mono">
            {stats.average !== null ? formatTime(stats.average) : '-'}
          </div>
        </div>
        <div className="bg-white/50 p-3 border-2 border-black">
          <div className="font-bold uppercase text-xs">{t('worst')}</div>
          <div className="font-black text-xl font-mono">
            {stats.worst !== null ? formatTime(stats.worst) : '-'}
          </div>
        </div>
      </div>

      {(stats.ao5 !== null || stats.ao12 !== null) && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {stats.ao5 !== null && (
            <div className="bg-white/50 p-3 border-2 border-black">
              <div className="font-bold uppercase text-xs">{t('currentAo5')}</div>
              <div className="font-black text-xl font-mono">{formatTime(stats.ao5)}</div>
            </div>
          )}
          {stats.ao12 !== null && (
            <div className="bg-white/50 p-3 border-2 border-black">
              <div className="font-bold uppercase text-xs">{t('currentAo12')}</div>
              <div className="font-black text-xl font-mono">{formatTime(stats.ao12)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsHeader;
