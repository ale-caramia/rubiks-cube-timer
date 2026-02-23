import React from 'react';
import { LogIn } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../state/AuthContext';

const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { loading, firebaseConfigured, loginWithGoogle } = useAuth();

  return (
    <div className="h-[100svh] overflow-y-hidden">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <div className="z-40 pt-2 md:pt-3">
          <div className="mx-2 md:mx-4">
            <div className="neo-surface-punch neo-entrance">
              <div className="px-2 py-2 md:px-3 md:py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <img
                    src="/icon.svg"
                    alt={t('rubikLogoAlt')}
                    className="w-12 h-12 md:w-14 md:h-14 shrink-0 block -translate-y-px"
                  />
                  <div className="min-w-0 flex flex-col">
                    <h1 className="text-base md:text-xl font-black uppercase truncate leading-none text-left">
                      {t('appTitle')}
                    </h1>
                  </div>
                </div>
                <div className="w-9 h-9" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-2 md:px-4 mt-3 md:mt-4 pb-4 md:pb-6">
          <div className="neo-surface-warm p-6 neo-entrance">
            <h2 className="text-2xl font-black uppercase mb-2">{t('signInToContinue')}</h2>
            <p className="font-bold mb-4">{t('signInHint')}</p>

            {!firebaseConfigured && (
              <div className="neo-surface mb-4 p-3 text-sm font-bold neo-wiggle">
                {t('firebaseNotConfigured')}
              </div>
            )}

            {firebaseConfigured && !loading && (
              <button
                onClick={() => void loginWithGoogle()}
                className="neo-btn neo-btn-positive px-4 py-3 flex items-center gap-2"
              >
                <LogIn size={18} />
                {t('loginGoogle')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
