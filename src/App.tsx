import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { SessionsProvider } from './state/SessionsContext'
import { ToastProvider } from './components/common/Toast'
import AppLayout from './components/layout/AppLayout'
import TimerPage from './pages/TimerPage'
import SessionsPage from './pages/SessionsPage'
import SessionDetailPage from './pages/SessionDetailPage'
import StatisticsPage from './pages/StatisticsPage'

function App() {
  return (
    <LanguageProvider>
      <SessionsProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<TimerPage />} />
                <Route path="sessions" element={<SessionsPage />} />
                <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
                <Route path="statistics" element={<StatisticsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </SessionsProvider>
    </LanguageProvider>
  )
}

export default App
