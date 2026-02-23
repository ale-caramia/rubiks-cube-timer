import React, { useMemo } from 'react';
import { Award, Hash, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { getCubeModeMeta } from '../utils/cubeModes';
import { formatTime } from '../utils/time';
import { getStats, getDailyStats, getWeeklyStats, getMonthlyStats } from '../utils/stats';

interface ChartBucket {
  label: string;
  value: number;
}

const StatisticsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { sessions, selectedCubeMode } = useSessions();
  const modeSessions = sessions.filter(session => session.cubeMode === selectedCubeMode);
  const allTimes = modeSessions.flatMap(s => s.times.map(time => time.time));
  const globalStats = getStats(allTimes);
  const locale = language === 'it' ? 'it-IT' : 'en-US';

  const trendByDay = useMemo<ChartBucket[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entries = modeSessions.flatMap(session => session.times);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));
      const start = day.getTime();
      const end = start + (24 * 60 * 60 * 1000);
      const dayTimes = entries.filter(entry => entry.timestamp >= start && entry.timestamp < end).map(entry => entry.time);
      const avg = getStats(dayTimes)?.average ?? 0;
      return {
        label: day.toLocaleDateString(locale, { weekday: 'short' }),
        value: Math.round(avg)
      };
    });
  }, [modeSessions, locale]);

  const modeDistribution = useMemo<ChartBucket[]>(() => {
    const counts = new Map<string, number>();
    sessions.forEach(session => {
      counts.set(session.cubeMode, (counts.get(session.cubeMode) ?? 0) + session.times.length);
    });

    return Array.from(counts.entries())
      .map(([mode, count]) => ({ label: getCubeModeMeta(mode as typeof selectedCubeMode).shortLabel, value: count }))
      .sort((a, b) => b.value - a.value);
  }, [sessions, selectedCubeMode]);

  const maxTrend = Math.max(...trendByDay.map(bucket => bucket.value), 1);
  const maxDistribution = Math.max(...modeDistribution.map(bucket => bucket.value), 1);

  return (
    <div className="space-y-4 md:space-y-6 neo-entrance">
      {globalStats && (
        <section className="pt-2 md:pt-3">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-3 md:mb-4">{t('globalStats')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="neo-surface-warm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={24} />
                <span className="font-bold uppercase text-sm">{t('total')}</span>
              </div>
              <div className="text-3xl font-black">{globalStats.count}</div>
            </div>
            <div className="neo-stat-best p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={24} />
                <span className="font-bold uppercase text-sm">{t('best')}</span>
              </div>
              <div className="text-3xl font-black font-mono">{formatTime(globalStats.best)}</div>
            </div>
            <div className="neo-stat-average p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={24} />
                <span className="font-bold uppercase text-sm">{t('average')}</span>
              </div>
              <div className="text-3xl font-black font-mono">{formatTime(globalStats.average)}</div>
            </div>
            <div className="neo-stat-worst p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={24} />
                <span className="font-bold uppercase text-sm">{t('worst')}</span>
              </div>
              <div className="text-3xl font-black font-mono">{formatTime(globalStats.worst)}</div>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <div className="neo-surface-cool p-4">
          <h3 className="text-lg md:text-xl font-black uppercase mb-3">{t('averageLast7Days')}</h3>
          <div className="h-48 flex items-end gap-2">
            {trendByDay.map(bucket => {
              const height = bucket.value === 0 ? 0 : Math.max(8, Math.round((bucket.value / maxTrend) * 100));
              return (
                <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] md:text-xs font-black font-mono min-h-4">{bucket.value ? formatTime(bucket.value) : '-'}</div>
                  <div className="neo-block h-28 w-full flex items-end rounded-lg border-2">
                    <div className="w-full bg-linear-to-t from-cyan-400 to-blue-400 border-t-2 border-black transition-all duration-300" style={{ height: `${height}%` }} />
                  </div>
                  <div className="text-[10px] md:text-xs font-bold uppercase">{bucket.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="neo-surface-warm p-4">
          <h3 className="text-lg md:text-xl font-black uppercase mb-3">{t('solvesByMode')}</h3>
          <div className="space-y-2">
            {modeDistribution.length === 0 ? (
              <div className="text-sm font-bold">{t('noData')}</div>
            ) : modeDistribution.map(bucket => (
              <div key={bucket.label}>
                <div className="flex justify-between text-xs font-bold uppercase mb-1">
                  <span>{bucket.label}</span>
                  <span>{bucket.value}</span>
                </div>
                <div className="neo-block h-4 rounded-md border-2">
                  <div
                    className="h-full bg-linear-to-r from-lime-400 to-green-400 border-r-2 border-black transition-all duration-300"
                    style={{ width: `${Math.max(4, Math.round((bucket.value / maxDistribution) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">{t('timeBasedStats')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {(() => {
            const stats = getDailyStats(modeSessions);
            return (
              <div className="neo-surface-cool p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase">{t('today')}</h3>
                  <Award className="opacity-50" size={32} />
                </div>
                {stats.count > 0 ? (
                  <div className="space-y-3">
                    <div className="neo-block p-3">
                      <div className="text-xs font-bold uppercase text-black/65 mb-1">{t('solves')}</div>
                      <div className="text-2xl font-black">{stats.count}</div>
                    </div>
                    <div className="neo-block p-3">
                      <div className="text-xs font-bold uppercase text-black/65 mb-1">{t('average')}</div>
                      <div className="text-xl font-black font-mono">{formatTime(stats.average!)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="neo-block neo-stat-chip-best p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('best')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.best!)}</div>
                      </div>
                      <div className="neo-block neo-stat-chip-worst p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('worst')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.worst!)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-black/65 font-bold">{t('noData')}</div>
                )}
              </div>
            );
          })()}

          {(() => {
            const stats = getWeeklyStats(modeSessions);
            return (
              <div className="neo-surface p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase">{t('thisWeek')}</h3>
                  <TrendingUp className="opacity-50" size={32} />
                </div>
                {stats.count > 0 ? (
                  <div className="space-y-3">
                    <div className="neo-block p-3">
                      <div className="text-xs font-bold uppercase text-black/65 mb-1">{t('solves')}</div>
                      <div className="text-2xl font-black">{stats.count}</div>
                    </div>
                    <div className="neo-block p-3">
                      <div className="text-xs font-bold uppercase text-black/65 mb-1">{t('average')}</div>
                      <div className="text-xl font-black font-mono">{formatTime(stats.average!)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="neo-block neo-stat-chip-best p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('best')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.best!)}</div>
                      </div>
                      <div className="neo-block neo-stat-chip-worst p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('worst')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.worst!)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-black/65 font-bold">{t('noData')}</div>
                )}
              </div>
            );
          })()}

          {(() => {
            const stats = getMonthlyStats(modeSessions);
            return (
              <div className="neo-surface-warm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase">{t('thisMonth')}</h3>
                  <TrendingDown className="opacity-50" size={32} />
                </div>
                {stats.count > 0 ? (
                  <div className="space-y-3">
                    <div className="neo-block p-3">
                      <div className="text-xs font-bold uppercase text-black/65 mb-1">{t('solves')}</div>
                      <div className="text-2xl font-black">{stats.count}</div>
                    </div>
                    <div className="neo-block p-3">
                      <div className="text-xs font-bold uppercase text-black/65 mb-1">{t('average')}</div>
                      <div className="text-xl font-black font-mono">{formatTime(stats.average!)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="neo-block neo-stat-chip-best p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('best')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.best!)}</div>
                      </div>
                      <div className="neo-block neo-stat-chip-worst p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('worst')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.worst!)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-black/65 font-bold">{t('noData')}</div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {!globalStats && (
        <div className="neo-surface p-8 text-center">
          <p className="text-xl font-bold uppercase text-black/65">{t('noData')}</p>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
