import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_12%_15%,rgba(255,226,86,0.74),transparent_34%),radial-gradient(circle_at_85%_8%,rgba(255,141,177,0.68),transparent_36%),radial-gradient(circle_at_82%_88%,rgba(126,231,255,0.72),transparent_34%),linear-gradient(145deg,#fffef8_0%,#fff8d8_45%,#eef9ff_100%)]">
      <div className="neo-surface mx-4 w-full max-w-2xl p-6 md:p-8">
        <img
          src="/animated-loader.svg"
          alt={t('loadingAnimationAlt')}
          className="mx-auto h-[min(48vh,360px)] w-full object-contain"
        />
        <p className="mt-4 text-center text-xs font-black uppercase tracking-[0.2em] md:text-sm">
          {t('loadingMessage')}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
