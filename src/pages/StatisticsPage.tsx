import React from 'react';
import { Award, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSessions } from '../state/SessionsContext';
import { getCubeModeMeta } from '../utils/cubeModes';
import { formatTime } from '../utils/time';
import { getStats, getDailyStats, getWeeklyStats, getMonthlyStats } from '../utils/stats';

const StatisticsPage: React.FC = () => {
  const { t } = useLanguage();
  const { sessions, selectedCubeMode } = useSessions();
  const modeSessions = sessions.filter(session => session.cubeMode === selectedCubeMode);
  const allTimes = modeSessions.flatMap(s => s.times.map(t => t.time));
  const globalStats = getStats(allTimes);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="border-4 border-black bg-yellow-100 p-3 font-bold uppercase text-sm">
        Modalità attiva: {getCubeModeMeta(selectedCubeMode).label}
      </div>

      {globalStats && (
        <div className="border-4 border-black bg-linear-to-br from-orange-300 to-orange-200 p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">{t('globalStats')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs md:text-sm font-bold uppercase mb-2 text-gray-600">{t('total')}</div>
              <div className="text-3xl md:text-4xl font-black">{globalStats.count}</div>
            </div>
            <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs md:text-sm font-bold uppercase mb-2 text-gray-600">{t('best')}</div>
              <div className="text-2xl md:text-3xl font-black font-mono">{formatTime(globalStats.best)}</div>
            </div>
            <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs md:text-sm font-bold uppercase mb-2 text-gray-600">{t('average')}</div>
              <div className="text-2xl md:text-3xl font-black font-mono">{formatTime(globalStats.average)}</div>
            </div>
            <div className="bg-white border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs md:text-sm font-bold uppercase mb-2 text-gray-600">{t('worst')}</div>
              <div className="text-2xl md:text-3xl font-black font-mono">{formatTime(globalStats.worst)}</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">{t('timeBasedStats')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {(() => {
            const stats = getDailyStats(modeSessions);
            return (
              <div className="border-4 border-black bg-linear-to-br from-blue-300 to-blue-200 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase">{t('today')}</h3>
                  <Award className="opacity-50" size={32} />
                </div>
                {stats.count > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-white border-2 border-black p-3">
                      <div className="text-xs font-bold uppercase text-gray-600 mb-1">{t('solves')}</div>
                      <div className="text-2xl font-black">{stats.count}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-3">
                      <div className="text-xs font-bold uppercase text-gray-600 mb-1">{t('average')}</div>
                      <div className="text-xl font-black font-mono">{formatTime(stats.average!)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-100 border-2 border-black p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('best')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.best!)}</div>
                      </div>
                      <div className="bg-red-100 border-2 border-black p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('worst')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.worst!)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 font-bold">{t('noData')}</div>
                )}
              </div>
            );
          })()}

          {(() => {
            const stats = getWeeklyStats(modeSessions);
            return (
              <div className="border-4 border-black bg-linear-to-br from-purple-300 to-purple-200 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase">{t('thisWeek')}</h3>
                  <TrendingUp className="opacity-50" size={32} />
                </div>
                {stats.count > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-white border-2 border-black p-3">
                      <div className="text-xs font-bold uppercase text-gray-600 mb-1">{t('solves')}</div>
                      <div className="text-2xl font-black">{stats.count}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-3">
                      <div className="text-xs font-bold uppercase text-gray-600 mb-1">{t('average')}</div>
                      <div className="text-xl font-black font-mono">{formatTime(stats.average!)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-100 border-2 border-black p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('best')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.best!)}</div>
                      </div>
                      <div className="bg-red-100 border-2 border-black p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('worst')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.worst!)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 font-bold">{t('noData')}</div>
                )}
              </div>
            );
          })()}

          {(() => {
            const stats = getMonthlyStats(modeSessions);
            return (
              <div className="border-4 border-black bg-linear-to-br from-pink-300 to-pink-200 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase">{t('thisMonth')}</h3>
                  <TrendingDown className="opacity-50" size={32} />
                </div>
                {stats.count > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-white border-2 border-black p-3">
                      <div className="text-xs font-bold uppercase text-gray-600 mb-1">{t('solves')}</div>
                      <div className="text-2xl font-black">{stats.count}</div>
                    </div>
                    <div className="bg-white border-2 border-black p-3">
                      <div className="text-xs font-bold uppercase text-gray-600 mb-1">{t('average')}</div>
                      <div className="text-xl font-black font-mono">{formatTime(stats.average!)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-100 border-2 border-black p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('best')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.best!)}</div>
                      </div>
                      <div className="bg-red-100 border-2 border-black p-2">
                        <div className="text-xs font-bold uppercase mb-1">{t('worst')}</div>
                        <div className="text-lg font-black font-mono">{formatTime(stats.worst!)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 font-bold">{t('noData')}</div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
