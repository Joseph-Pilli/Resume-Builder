import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ResumeFontProvider, useResumeFont, ATS_FONTS } from './context/ResumeFontContext'
import ResumeBuilder from './pages/ResumeBuilder'
import ResumeOptimizer from './pages/ResumeOptimizer'
import './App.css'

function NavFontDropdown() {
  const { font, setFont } = useResumeFont()
  return (
    <div className="nav-font-dropdown">
      <label htmlFor="font-type">Font Type</label>
      <select id="font-type" value={font} onChange={e => setFont(e.target.value)}>
        {ATS_FONTS.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
    </div>
  )
}

function AppContent() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="logo">ATS Resume Builder</h1>
          <nav className="nav">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              Resume Builder
            </NavLink>
            <NavLink to="/optimizer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Resume Optimizer
            </NavLink>
            <NavFontDropdown />
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ResumeBuilder />} />
          <Route path="/optimizer" element={<ResumeOptimizer />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ResumeFontProvider>
        <AppContent />
      </ResumeFontProvider>
    </BrowserRouter>
  )
}

export default App
