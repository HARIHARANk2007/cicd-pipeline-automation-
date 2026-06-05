import React, { useEffect, useState } from 'react'
import Landing from './pages/mediguard_ai_landing_page'
import PatientProfiles from './pages/patient_profiles'
import ClinicianDashboard from './pages/clinician_dashboard'
import DrugChecker from './pages/drug_interaction_checker'
import AlertsCenter from './pages/alerts_center'
import InteractionHistory from './pages/interaction_history'
import AIResults from './pages/ai_analysis_results'
import Login from './pages/login_mediguard_ai'
import { getUser, logout } from './services'

const PROTECTED = ['/dashboard', '/checker', '/patients', '/alerts', '/history', '/results']

const routes = {
  '/': Landing,
  '/landing': Landing,
  '/patients': PatientProfiles,
  '/dashboard': ClinicianDashboard,
  '/checker': DrugChecker,
  '/alerts': AlertsCenter,
  '/history': InteractionHistory,
  '/results': AIResults,
  '/login': Login,
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || '/')
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    const onHash = () => {
      const r = window.location.hash.replace('#', '') || '/'
      setRoute(r)
      setUser(getUser())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Guard protected routes
  const isProtected = PROTECTED.includes(route)
  if (isProtected && !user) {
    window.location.hash = '#/login'
    return null
  }

  const Page = routes[route] || (() => <div className="p-8 text-[#64748b]">Page not found: {route}</div>)

  function handleLogout() {
    logout()
    setUser(null)
    window.location.hash = '#/login'
  }

  return (
    <div>
      {/* Top nav — hidden on pages that have their own sidebar */}
      {(route === '/' || route === '/landing' || route === '/login') && (
        <nav className="p-3 bg-[#003d9b] flex items-center justify-between">
          <a className="text-white font-bold text-sm tracking-wide" href="#/landing">MediGuard AI</a>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-white/80 text-xs hidden sm:block">{user.name}</span>
                <a className="text-white/80 text-xs hover:text-white" href="#/dashboard">Dashboard</a>
                <button onClick={handleLogout} className="text-xs text-white/70 hover:text-white border border-white/30 rounded px-2 py-1 transition-colors">Logout</button>
              </>
            ) : (
              <a className="text-xs text-white/80 hover:text-white border border-white/30 rounded px-2 py-1" href="#/login">Clinician Login</a>
            )}
          </div>
        </nav>
      )}

      {/* Logout floating button for internal pages */}
      {user && isProtected && (
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
          <span className="text-xs text-[#475569] hidden md:block bg-white/80 px-2 py-1 rounded-full border border-[#e2e8f0]">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-1 text-xs text-[#475569] bg-white hover:bg-red-50 hover:text-red-700 border border-[#e2e8f0] hover:border-red-200 rounded-full px-3 py-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      )}

      <main>
        <Page />
      </main>
    </div>
  )
}
