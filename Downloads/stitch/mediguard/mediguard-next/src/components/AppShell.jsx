"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getUser, logout } from '../lib/services'

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: 'dashboard',    route: '/dashboard' },
  { label: 'Checker',      icon: 'troubleshoot', route: '/checker'   },
  { label: 'Patients',     icon: 'group',        route: '/patients'  },
  { label: 'Reports',      icon: 'assessment',   route: '/history'   },
  { label: 'Alerts',       icon: 'notifications',route: '/alerts'    },
]

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setUser(getUser())
  }, [])

  function handleLogout() {
    logout()
    router.push('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : 'CL'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-[#e8e0ff]/30">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white text-[22px]" style={{fontVariationSettings:"'FILL' 1"}}>shield_person</span>
        </div>
        <div>
          <div className="text-white font-extrabold text-[15px] tracking-tight" style={{fontFamily:'Manrope,sans-serif'}}>MediGuard AI</div>
          <div className="text-white/60 text-[10px] uppercase tracking-wider">Clinician Portal</div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 my-4 p-3 bg-white/10 rounded-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#e8e0ff] text-[#003d9b] flex items-center justify-center font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-white font-semibold text-sm truncate">{user?.name || 'Clinician'}</div>
          <div className="text-white/60 text-[11px]">{user?.role || 'Doctor'} · ID {user?.hospitalId || '—'}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon, route }) => {
          const isActive = pathname === route
          return (
            <Link
              key={route}
              href={route}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-[#003d9b] font-bold shadow-sm'
                  : 'text-white/75 hover:bg-white/15 hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={isActive ? {fontVariationSettings:"'FILL' 1"} : {}}
              >{icon}</span>
              {label}
              {label === 'Alerts' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-red-400 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: logout */}
      <div className="p-3 border-t border-white/10 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:bg-white/15 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">help</span>
          Help & Support
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#f7f6fd]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-[#003d9b] flex-col z-40 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-[#003d9b] flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[#475569] hover:bg-[#f1f5f9] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-bold text-[#003d9b] text-sm" style={{fontFamily:'Manrope,sans-serif'}}>MediGuard AI</span>
          <Link href="/alerts" className="p-2 text-[#475569] hover:bg-[#f1f5f9] rounded-lg relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
