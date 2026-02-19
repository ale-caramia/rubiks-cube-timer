import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './firebaseClient.ts'
import { registerSW } from 'virtual:pwa-register'

// Registra il service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nuova versione disponibile! Ricaricare?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App pronta per funzionare offline!')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
