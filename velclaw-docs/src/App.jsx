import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import Introduction from './pages/Introduction'
import GettingStarted from './pages/GettingStarted'
import Installation from './pages/Installation'
import Configuration from './pages/Configuration'
import Deployment from './pages/Deployment'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app">
      <Header onMenuClick={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Routes>
        <Route path="/" element={<Introduction />} />
        <Route path="/bat-dau" element={<GettingStarted />} />
        <Route path="/cai-dat" element={<Installation />} />
        <Route path="/cau-hinh" element={<Configuration />} />
        <Route path="/trien-khai" element={<Deployment />} />
      </Routes>
    </div>
  )
}
