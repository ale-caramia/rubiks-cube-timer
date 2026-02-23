import React from 'react';
import { Languages, LogIn, LogOut, UserRound } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../state/AuthContext';

const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, loading, firebaseConfigured, loginWithGoogle, logout } = useAuth();

  return (
    <div className="space-y-4 md:space-y-6 neo-entrance">
      <div className="neo-surface-cool p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Languages size={20} />
          <h2 className="text-xl md:text-2xl font-black uppercase">{t('settingsLanguage')}</h2>
        </div>
        <p className="text-sm font-bold mb-3">{t('settingsLanguageDescription')}</p>

        <div className="inline-flex overflow-hidden rounded-xl border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]">
          <button
            onClick={() => setLanguage('it')}
            className={`px-4 py-2 font-bold uppercase border-r-4 border-black ${
              language === 'it' ? 'bg-black text-cyan-200' : 'bg-white hover:bg-yellow-100'
            }`}
          >
            {t('languageItalian')}
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 font-bold uppercase ${
              language === 'en' ? 'bg-black text-cyan-200' : 'bg-white hover:bg-yellow-100'
            }`}
          >
            {t('languageEnglish')}
          </button>
        </div>
      </div>

      <div className="neo-surface-warm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <UserRound size={20} />
          <h2 className="text-xl md:text-2xl font-black uppercase">{t('settingsAccount')}</h2>
        </div>
        <p className="text-sm font-bold mb-4">
          {user ? `${t('accountLoggedInAs')} ${user.displayName ?? user.email ?? user.uid}` : t('accountNotLoggedIn')}
        </p>

        {!firebaseConfigured && (
          <div className="neo-surface mb-3 p-3 text-sm font-bold">
            {t('firebaseNotConfigured')}
          </div>
        )}

        {firebaseConfigured && !loading && (
          user ? (
            <button
              onClick={() => void logout()}
              className="neo-btn neo-btn-danger px-4 py-3 flex items-center gap-2"
            >
              <LogOut size={18} />
              {t('logout')}
            </button>
          ) : (
            <button
              onClick={() => void loginWithGoogle()}
              className="neo-btn neo-btn-positive px-4 py-3 flex items-center gap-2"
            >
              <LogIn size={18} />
              {t('loginGoogle')}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
