import './App.css'
import RubiksTimer from './components/RubiksTimer'
import { LanguageProvider } from './i18n/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <RubiksTimer />
    </LanguageProvider>
  )
}

export default App
