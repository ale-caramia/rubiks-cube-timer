import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './firebaseClient.ts'
import { registerSW } from 'virtual:pwa-register'
import { detectLanguage, translate, type TranslationKeys } from './i18n/translations'

const t = (key: TranslationKeys): string => {
  return translate(detectLanguage(), key)
}

// Registra il service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm(t('updateAvailableReload'))) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log(t('offlineReady'))
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
