import React, { useState } from 'react';
import { Clock3, Gauge, Languages, LogIn, LogOut, ShieldAlert, Timer, UserRound } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../state/AuthContext';
import { useSessions } from '../state/SessionsContext';
import { useToast } from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { TIMER_SETTINGS_LIMITS } from '../utils/timerSettings';

const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, loading, firebaseConfigured, loginWithGoogle, logout, deleteAccount } = useAuth();
  const { timerSettings, updateTimerSettings } = useSessions();
  const { showToast } = useToast();
  const [dangerZoneVisible, setDangerZoneVisible] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const canEditTimerSettings = firebaseConfigured && !loading && Boolean(user);
  const deleteKeyword = t('deleteAccountConfirmationWord');
  const deleteCheckPassed = deletePhrase.trim().toUpperCase() === deleteKeyword;

  const handleDeleteAccount = async (): Promise<void> => {
    if (!deleteCheckPassed || deletingAccount) return;
    setDeletingAccount(true);

    try {
      await deleteAccount();
      setDeleteDialogOpen(false);
      setDangerZoneVisible(false);
      setDeletePhrase('');
      showToast(t('deleteAccountSuccess'), 'info');
    } catch (error) {
      const errorCode = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: string }).code)
        : '';
      if (errorCode.includes('requires-recent-login')) {
        showToast(t('deleteAccountRecentLoginRequired'), 'error');
      } else {
        showToast(t('deleteAccountError'), 'error');
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 neo-entrance">
      <div className="neo-surface-cool p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Languages size={20} />
          <h2 className="text-xl md:text-2xl font-black uppercase">{t('settingsLanguage')}</h2>
        </div>
        <p className="text-sm font-bold mb-3">{t('settingsLanguageDescription')}</p>

        <div className="inline-flex overflow-hidden rounded-xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]">
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

      <div className="neo-surface-cool p-4 md:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Timer size={20} />
          <h2 className="text-xl md:text-2xl font-black uppercase">{t('settingsTimer')}</h2>
        </div>
        <p className="text-sm font-bold mb-4">{t('settingsTimerDescription')}</p>

        {!canEditTimerSettings && (
          <div className="neo-surface mb-3 p-3 text-sm font-bold">
            {t('settingsTimerRequiresLogin')}
          </div>
        )}

        <div className="space-y-3">
          <div className="neo-block p-3 md:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-black uppercase">{t('settingsInspectionCountdown')}</div>
                <div className="text-xs font-bold opacity-80">{t('settingsInspectionCountdownHint')}</div>
              </div>
              <button
                disabled={!canEditTimerSettings}
                onClick={() => updateTimerSettings({ inspectionEnabled: !timerSettings.inspectionEnabled })}
                className={`neo-chip px-3 py-2 min-w-24 text-center font-black uppercase ${
                  timerSettings.inspectionEnabled ? 'bg-lime-200' : 'bg-white'
                } ${!canEditTimerSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {timerSettings.inspectionEnabled ? t('enabled') : t('disabled')}
              </button>
            </div>

            {timerSettings.inspectionEnabled && (
              <div className="mt-3">
                <div className="text-xs font-black uppercase mb-2">{t('settingsInspectionCountdownSeconds')}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={TIMER_SETTINGS_LIMITS.inspectionSeconds.min}
                    max={TIMER_SETTINGS_LIMITS.inspectionSeconds.max}
                    value={timerSettings.inspectionSeconds}
                    disabled={!canEditTimerSettings}
                    onChange={(event) => updateTimerSettings({ inspectionSeconds: Number(event.target.value) })}
                    className="flex-1 accent-black"
                  />
                  <input
                    type="number"
                    min={TIMER_SETTINGS_LIMITS.inspectionSeconds.min}
                    max={TIMER_SETTINGS_LIMITS.inspectionSeconds.max}
                    value={timerSettings.inspectionSeconds}
                    disabled={!canEditTimerSettings}
                    onChange={(event) => updateTimerSettings({ inspectionSeconds: Number(event.target.value) })}
                    className="neo-input w-20 px-2 py-1 text-center font-mono text-sm"
                  />
                  <span className="font-black text-sm">{t('secondsSuffix')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="neo-block p-3 md:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-black uppercase">{t('settingsLaunchCountdown')}</div>
                <div className="text-xs font-bold opacity-80">{t('settingsLaunchCountdownHint')}</div>
              </div>
              <button
                disabled={!canEditTimerSettings}
                onClick={() => updateTimerSettings({ launchCountdownEnabled: !timerSettings.launchCountdownEnabled })}
                className={`neo-chip px-3 py-2 min-w-24 text-center font-black uppercase ${
                  timerSettings.launchCountdownEnabled ? 'bg-lime-200' : 'bg-white'
                } ${!canEditTimerSettings ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {timerSettings.launchCountdownEnabled ? t('enabled') : t('disabled')}
              </button>
            </div>

            {timerSettings.launchCountdownEnabled && (
              <div className="mt-3">
                <div className="text-xs font-black uppercase mb-2">{t('settingsLaunchCountdownSeconds')}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={TIMER_SETTINGS_LIMITS.launchCountdownSeconds.min}
                    max={TIMER_SETTINGS_LIMITS.launchCountdownSeconds.max}
                    value={timerSettings.launchCountdownSeconds}
                    disabled={!canEditTimerSettings}
                    onChange={(event) => updateTimerSettings({ launchCountdownSeconds: Number(event.target.value) })}
                    className="flex-1 accent-black"
                  />
                  <input
                    type="number"
                    min={TIMER_SETTINGS_LIMITS.launchCountdownSeconds.min}
                    max={TIMER_SETTINGS_LIMITS.launchCountdownSeconds.max}
                    value={timerSettings.launchCountdownSeconds}
                    disabled={!canEditTimerSettings}
                    onChange={(event) => updateTimerSettings({ launchCountdownSeconds: Number(event.target.value) })}
                    className="neo-input w-20 px-2 py-1 text-center font-mono text-sm"
                  />
                  <span className="font-black text-sm">{t('secondsSuffix')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="neo-block p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge size={16} />
              <div className="font-black uppercase">{t('settingsScrambleMoveCount')}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={TIMER_SETTINGS_LIMITS.scrambleMoveCount.min}
                max={TIMER_SETTINGS_LIMITS.scrambleMoveCount.max}
                value={timerSettings.scrambleMoveCount}
                disabled={!canEditTimerSettings}
                onChange={(event) => updateTimerSettings({ scrambleMoveCount: Number(event.target.value) })}
                className="flex-1 accent-black"
              />
              <input
                type="number"
                min={TIMER_SETTINGS_LIMITS.scrambleMoveCount.min}
                max={TIMER_SETTINGS_LIMITS.scrambleMoveCount.max}
                value={timerSettings.scrambleMoveCount}
                disabled={!canEditTimerSettings}
                onChange={(event) => updateTimerSettings({ scrambleMoveCount: Number(event.target.value) })}
                className="neo-input w-20 px-2 py-1 text-center font-mono text-sm"
              />
            </div>
          </div>

          <div className="neo-block p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock3 size={16} />
              <div className="font-black uppercase">{t('settingsAutoSessionAfterHours')}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={TIMER_SETTINGS_LIMITS.autoSessionAfterHours.min}
                max={TIMER_SETTINGS_LIMITS.autoSessionAfterHours.max}
                value={timerSettings.autoSessionAfterHours}
                disabled={!canEditTimerSettings}
                onChange={(event) => updateTimerSettings({ autoSessionAfterHours: Number(event.target.value) })}
                className="flex-1 accent-black"
              />
              <input
                type="number"
                min={TIMER_SETTINGS_LIMITS.autoSessionAfterHours.min}
                max={TIMER_SETTINGS_LIMITS.autoSessionAfterHours.max}
                value={timerSettings.autoSessionAfterHours}
                disabled={!canEditTimerSettings}
                onChange={(event) => updateTimerSettings({ autoSessionAfterHours: Number(event.target.value) })}
                className="neo-input w-20 px-2 py-1 text-center font-mono text-sm"
              />
              <span className="font-black text-sm">{t('hoursSuffix')}</span>
            </div>
          </div>
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

      <div className="neo-surface-warm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={20} />
          <h2 className="text-xl md:text-2xl font-black uppercase">{t('dangerZoneTitle')}</h2>
        </div>
        <p className="text-sm font-bold mb-4">{t('dangerZoneDescription')}</p>

        <button
          onClick={() => setDangerZoneVisible(prev => !prev)}
          className="neo-btn neo-btn-danger px-4 py-2"
        >
          {dangerZoneVisible ? t('hideDangerZone') : t('showDangerZone')}
        </button>

        {dangerZoneVisible && (
          <div className="mt-4 neo-block p-4 border-2 border-red-500 bg-[#fff2f4]">
            <h3 className="text-lg font-black uppercase text-red-700 mb-2">{t('deleteAccount')}</h3>
            <p className="text-sm font-bold mb-2">{t('deleteAccountWarning')}</p>
            <p className="text-sm font-bold mb-4">{t('deleteAccountTypePrompt')} <span className="font-mono">{deleteKeyword}</span></p>
            {!canEditTimerSettings && (
              <div className="neo-chip bg-white px-3 py-2 mb-3 text-sm font-bold">
                {t('settingsTimerRequiresLogin')}
              </div>
            )}

            <input
              type="text"
              value={deletePhrase}
              onChange={(event) => setDeletePhrase(event.target.value.toUpperCase())}
              placeholder={deleteKeyword}
              disabled={!canEditTimerSettings || deletingAccount}
              className="neo-input w-full px-3 py-2 mb-3 text-center font-mono"
            />

            <button
              disabled={!canEditTimerSettings || !deleteCheckPassed || deletingAccount}
              onClick={() => setDeleteDialogOpen(true)}
              className="neo-btn neo-btn-danger w-full px-4 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deletingAccount ? t('deleteAccountInProgress') : t('deleteAccount')}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title={t('deleteAccountConfirmTitle')}
        message={t('deleteAccountConfirmMessage')}
        confirmLabel={t('deleteAccount')}
        cancelLabel={t('cancel')}
        onConfirm={() => void handleDeleteAccount()}
        onClose={() => {
          if (!deletingAccount) {
            setDeleteDialogOpen(false);
          }
        }}
      />
    </div>
  );
};

export default SettingsPage;
