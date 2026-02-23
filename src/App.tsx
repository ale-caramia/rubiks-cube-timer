import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { SessionsProvider } from './state/SessionsContext'
import { AuthProvider } from './state/AuthContext'
import { ToastProvider } from './components/common/Toast'
import AppLayout from './components/layout/AppLayout'
import TimerPage from './pages/TimerPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailPage from './pages/SessionDetailPage'
import StatisticsPage from './pages/StatisticsPage'
import SettingsPage from './pages/SettingsPage'
import LoadingScreen from './components/common/LoadingScreen'

function App() {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowLoader(false)
    }, 2200)

    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <LanguageProvider>
      <AuthProvider>
        <SessionsProvider>
          <ToastProvider>
            {showLoader && <LoadingScreen />}
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route index element={<TimerPage />} />
                  <Route path="sessions" element={<SessionsPage />} />
                  <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
                  <Route path="statistics" element={<StatisticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </SessionsProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
