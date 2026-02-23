import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#2a3040_0%,#161b25_45%,#090b10_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(159,211,255,0.18)_0%,rgba(159,211,255,0)_55%)]" />
      <img
        src="/animated-loader.svg"
        alt={t('loadingAnimationAlt')}
        className="relative z-10 w-[min(88vw,640px)] h-[min(66vh,460px)] object-contain"
      />
      <div className="absolute bottom-8 text-center px-4">
        <p className="text-cyan-200 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">{t('loadingMessage')}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
