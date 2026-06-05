"use client"
import React, { useEffect, useState } from 'react'
import { fetchHistory } from '@/lib/services'
import AppShell from '@/components/AppShell'

function severityClass(severity) {
  const value = (severity || '').toLowerCase()
  if (value === 'severe' || value === 'high') return 'bg-red-50 text-red-700 border-red-200'
  if (value === 'moderate') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-green-50 text-green-700 border-green-200'
}

export default function InteractionHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  function openDetails(item){
    setSelected(item)
  }

  function downloadReport(item){
    const content = `Report for ${item.drugA} + ${item.drugB}\nSeverity: ${item.severity}\nRisk Score: ${item.riskScore}\n\nExplanation:\n${item.explanation || ''}\n\nSources:\n${(item.sources||[]).map(s=>`${s.drug} — ${s.section}`).join('\n')}`
    const blob = new Blob([content], {type: 'text/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.drugA || 'report'}_${item.drugB || ''}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function saveReport(item){
    const blob = new Blob([JSON.stringify(item, null, 2)], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${item.createdAt ? item.createdAt.split('T')[0] : 'report'}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await fetchHistory()
        if (active) setHistory(data)
      } catch (err) {
        if (active) setError(err.message || 'Failed to load history')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const filteredHistory = history.filter(item => {
    const q = searchQuery.toLowerCase()
    return (
      (item.drugA || '').toLowerCase().includes(q) ||
      (item.drugB || '').toLowerCase().includes(q) ||
      (item.severity || '').toLowerCase().includes(q)
    )
  })

  return (
    <AppShell activeRoute="/history">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e8f0] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]" style={{fontFamily:'Manrope,sans-serif'}}>Clinical Reports</h1>
            <p className="text-sm text-[#64748b] mt-1">Review past interaction analyses and saved documents.</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] transition-all"
              placeholder="Search by drug name or severity..."
            />
          </div>
          <button className="px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569] flex items-center gap-2 hover:bg-[#f8fafc] transition-colors shrink-0">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-[#003d9b] text-4xl">progress_activity</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-5xl text-[#94a3b8] mb-3">history</span>
            <h3 className="text-[#0f172a] font-bold">No records found</h3>
            <p className="text-[#64748b] text-sm mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Date</th>
                    <th className="px-5 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Medications</th>
                    <th className="px-5 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Severity</th>
                    <th className="px-5 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider">Risk Score</th>
                    <th className="px-5 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-5 py-4 text-sm text-[#475569]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 font-medium text-[#0f172a] text-sm">
                          <span className="bg-[#f1f5f9] border border-[#e2e8f0] px-2 py-0.5 rounded">{item.drugA || '?'}</span>
                          <span className="text-[#94a3b8]">+</span>
                          <span className="bg-[#f1f5f9] border border-[#e2e8f0] px-2 py-0.5 rounded">{item.drugB || '?'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${severityClass(item.severity)}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#475569]">
                        {item.riskScore ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => openDetails(item)} 
                          className="text-[#003d9b] hover:text-[#002a7a] font-semibold text-sm hover:underline px-2"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Details */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.2s_ease] flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
                <h2 className="font-bold text-lg text-[#0f172a]">Interaction Details</h2>
                <button onClick={() => setSelected(null)} className="text-[#94a3b8] hover:text-[#475569] transition-colors p-1 rounded hover:bg-[#e2e8f0]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-[#003d9b]">{selected.drugA}</span>
                  <span className="material-symbols-outlined text-[#94a3b8]">add</span>
                  <span className="text-xl font-bold text-[#003d9b]">{selected.drugB}</span>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2 rounded-xl">
                    <span className="text-xs text-[#64748b] uppercase tracking-wider font-bold block mb-1">Severity</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ${severityClass(selected.severity)}`}>
                      {selected.severity}
                    </span>
                  </div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2 rounded-xl">
                    <span className="text-xs text-[#64748b] uppercase tracking-wider font-bold block mb-1">Risk Score</span>
                    <span className="text-lg font-extrabold text-[#0f172a]">{selected.riskScore ?? '—'}<span className="text-xs text-[#94a3b8] font-normal">/100</span></span>
                  </div>
                </div>

                {selected.explanation && (
                  <div>
                    <h3 className="font-bold text-[#0f172a] mb-2 text-sm uppercase tracking-wider">Clinical Explanation</h3>
                    <p className="text-sm text-[#475569] bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl leading-relaxed">
                      {selected.explanation}
                    </p>
                  </div>
                )}
                
                {selected.sources && selected.sources.length > 0 && (
                  <div>
                    <h3 className="font-bold text-[#0f172a] mb-2 text-sm uppercase tracking-wider">FDA Sources</h3>
                    <ul className="space-y-2">
                      {selected.sources.map((src, i) => (
                        <li key={i} className="text-sm bg-blue-50 text-[#003d9b] border border-blue-100 p-3 rounded-xl flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">policy</span>
                          <div>
                            <span className="font-bold">{src.drug}</span> &middot; {src.section}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex justify-end gap-3 rounded-b-2xl">
                <button 
                  onClick={() => downloadReport(selected)} 
                  className="px-4 py-2 text-sm font-semibold text-[#003d9b] border border-[#003d9b]/30 hover:bg-[#f3f0ff] rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span> Download txt
                </button>
                <button 
                  onClick={() => saveReport(selected)} 
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#003d9b] hover:bg-[#002a7a] rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span> Save JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
