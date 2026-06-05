"use client"
import React, { useState } from 'react'
import AppShell from '@/components/AppShell'

const INITIAL_ALERTS = [
  {
    id: 1,
    level: 'SEVERE',
    levelClass: 'bg-red-600 text-white',
    borderClass: 'border-red-200',
    barClass: 'bg-red-500',
    icon: 'warning',
    iconClass: 'text-red-600',
    time: 'Just now',
    title: 'Critical Interaction: Warfarin & Amiodarone',
    body: 'Patient ID: 8492-A. High risk of bleeding detected. Co-administration significantly increases INR. Immediate review recommended.',
    read: false,
  },
  {
    id: 2,
    level: 'WARNING',
    levelClass: 'bg-amber-100 text-amber-800',
    borderClass: 'border-amber-200',
    barClass: 'bg-amber-400',
    icon: 'info',
    iconClass: 'text-amber-600',
    time: '2 hrs ago',
    title: 'Updated FDA Guidelines: Metformin',
    body: 'New dosing recommendations for patients with moderate renal impairment (eGFR 30–45 mL/min/1.73m²).',
    read: false,
  },
  {
    id: 3,
    level: 'MODERATE',
    levelClass: 'bg-blue-100 text-blue-800',
    borderClass: 'border-blue-200',
    barClass: 'bg-blue-400',
    icon: 'medication',
    iconClass: 'text-blue-600',
    time: '4 hrs ago',
    title: 'Interaction Flagged: Clopidogrel & Atorvastatin',
    body: 'Patient ID: 9913-B. CYP3A4-mediated interaction may reduce antiplatelet efficacy. Consider switching to Rosuvastatin.',
    read: false,
  },
  {
    id: 4,
    level: 'ROUTINE',
    levelClass: 'bg-slate-100 text-slate-600',
    borderClass: 'border-slate-200',
    barClass: 'bg-slate-300',
    icon: 'notifications',
    iconClass: 'text-slate-400',
    time: '5 hrs ago',
    title: 'Review Pending Approvals',
    body: 'You have 4 prescription renewals awaiting authorization in your queue.',
    read: true,
  },
]

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [filter, setFilter] = useState('All')

  const unread = alerts.filter(a => !a.read).length

  function markRead(id) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }

  function markAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  function dismiss(id) {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const LEVELS = ['All', 'SEVERE', 'WARNING', 'MODERATE', 'ROUTINE']
  const shown = filter === 'All' ? alerts : alerts.filter(a => a.level === filter)

  return (
    <AppShell activeRoute="/alerts">
      <div className="p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-[#e2e8f0]">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]" style={{fontFamily:'Manrope,sans-serif'}}>Alerts Center</h1>
            <p className="text-sm text-[#64748b] mt-1">
              {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              className="px-4 py-2 border border-[#e2e8f0] text-[#475569] text-sm font-medium rounded-lg hover:bg-white transition-colors"
            >
              Mark All Read
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === level
                  ? 'bg-[#003d9b] text-white'
                  : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#003d9b] hover:text-[#003d9b]'
              }`}
            >
              {level}
              {level === 'All' && unread > 0 && (
                <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-4">
          {shown.length === 0 && (
            <div className="text-center py-16 text-[#94a3b8]">
              <span className="material-symbols-outlined text-5xl block mb-3">notifications_off</span>
              No alerts in this category.
            </div>
          )}
          {shown.map(alert => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border ${alert.borderClass} shadow-sm overflow-hidden flex ${alert.read ? 'opacity-70' : ''} transition-opacity`}
            >
              <div className={`${alert.barClass} w-1.5 shrink-0`} />
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`material-symbols-outlined ${alert.iconClass} text-[20px]`} style={{fontVariationSettings:"'FILL' 1"}}>{alert.icon}</span>
                    <span className={`${alert.levelClass} text-xs font-bold px-2 py-0.5 rounded`}>{alert.level}</span>
                    <span className="text-xs text-[#94a3b8]">{alert.time}</span>
                    {!alert.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <button
                    onClick={() => dismiss(alert.id)}
                    className="text-[#94a3b8] hover:text-[#475569] p-1 rounded transition-colors shrink-0 ml-2"
                    title="Dismiss"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <h3 className="font-bold text-[#0f172a] text-base mb-1">{alert.title}</h3>
                <p className="text-sm text-[#64748b] mb-4">{alert.body}</p>
                <div className="flex flex-wrap gap-2">
                  {alert.level === 'SEVERE' && (
                    <a
                      href="/checker"
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      View in Checker
                    </a>
                  )}
                  {!alert.read && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="border border-[#e2e8f0] text-[#475569] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f8fafc] transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.level === 'WARNING' && (
                    <a
                      href="/history"
                      className="text-[#003d9b] border border-[#003d9b]/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f3f0ff] transition-colors"
                    >
                      View Guidelines
                    </a>
                  )}
                  {alert.level === 'ROUTINE' && (
                    <a
                      href="/history"
                      className="text-[#003d9b] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#f3f0ff] transition-colors"
                    >
                      Go to Queue
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

