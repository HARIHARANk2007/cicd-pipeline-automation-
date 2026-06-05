"use client"
import React, { useState } from 'react'
import AppShell from '@/components/AppShell'

const INITIAL_PATIENTS = [
  {
    id: 'PT-8924',
    name: 'Eleanor James',
    initials: 'EJ',
    color: 'bg-[#003d9b]',
    age: 68,
    gender: 'F',
    weight: 64,
    conditions: [
      { name: 'Hypertension', type: 'error' },
      { name: 'Type 2 Diabetes', type: 'normal' }
    ]
  },
  {
    id: 'PT-3319',
    name: 'Marcus Reed',
    initials: 'MR',
    color: 'bg-[#059669]',
    age: 45,
    gender: 'M',
    weight: 82,
    conditions: [
      { name: 'Asthma', type: 'normal' }
    ]
  }
]

export default function PatientProfiles() {
  const [patients, setPatients] = useState(INITIAL_PATIENTS)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  // New patient form state
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newGender, setNewGender] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [condInput, setCondInput] = useState('')
  const [conditions, setConditions] = useState([])

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  function handleAddCondition(e) {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault()
      const val = condInput.trim()
      if (val && !conditions.includes(val)) {
        setConditions([...conditions, val])
        setCondInput('')
      }
    }
  }

  function removeCondition(cond) {
    setConditions(conditions.filter(c => c !== cond))
  }

  function handleSaveProfile() {
    if (!newName.trim()) return
    const newPt = {
      id: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName,
      initials: newName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase(),
      color: 'bg-[#7c3aed]', // default purple for new
      age: newAge || '—',
      gender: newGender || '—',
      weight: newWeight || '—',
      conditions: conditions.map(c => ({ name: c, type: 'normal' }))
    }
    setPatients([newPt, ...patients])
    setShowModal(false)
    // reset form
    setNewName('')
    setNewAge('')
    setNewGender('')
    setNewWeight('')
    setConditions([])
  }

  return (
    <AppShell activeRoute="/patients">
      <div className="p-6 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[#e2e8f0] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]" style={{fontFamily:'Manrope,sans-serif'}}>Patient Profiles</h1>
            <p className="text-sm text-[#64748b] mt-1">Manage and review clinical patient data.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#003d9b] text-white hover:bg-[#002a7a] px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Create Profile
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">search</span>
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] transition-all"
              placeholder="Search by name or ID..."
            />
          </div>
          <button className="px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm font-semibold text-[#475569] flex items-center gap-2 hover:bg-[#f8fafc] transition-colors shrink-0">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
        </div>

        {/* Patient Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#64748b]">
              <span className="material-symbols-outlined text-4xl mb-2 block">person_search</span>
              No patients found.
            </div>
          )}
          {filtered.map(pt => (
            <div key={pt.id} className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${pt.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                    {pt.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0f172a]">{pt.name}</h3>
                    <p className="text-xs font-mono text-[#64748b]">ID: {pt.id}</p>
                  </div>
                </div>
                <button className="text-[#94a3b8] hover:text-[#475569] p-1 rounded-full hover:bg-[#e2e8f0] transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <div className="p-5 flex-1">
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Age/Gender</p>
                    <p className="text-sm font-semibold text-[#1e293b]">{pt.age} {pt.gender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Weight</p>
                    <p className="text-sm font-semibold text-[#1e293b]">{pt.weight} kg</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Active Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {pt.conditions.map((c, i) => (
                      <span 
                        key={i} 
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          c.type === 'error' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]'
                        }`}
                      >
                        {c.name}
                      </span>
                    ))}
                    {pt.conditions.length === 0 && <span className="text-xs text-[#94a3b8] italic">None recorded</span>}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end gap-2">
                <button className="px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-md transition-colors">
                  Edit
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-[#003d9b] bg-[#e8e0ff] hover:bg-[#d8ccf8] rounded-md transition-colors">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.2s_ease] flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
                <h2 className="font-bold text-lg text-[#0f172a]">Create Patient Profile</h2>
                <button onClick={() => setShowModal(false)} className="text-[#94a3b8] hover:text-[#475569] transition-colors p-1 rounded hover:bg-[#e2e8f0]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={newName} onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#003d9b]" 
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">Age</label>
                    <input 
                      type="number" 
                      value={newAge} onChange={e => setNewAge(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#003d9b]" 
                      placeholder="Years"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1.5">Gender</label>
                    <select 
                      value={newGender} onChange={e => setNewGender(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#003d9b]"
                    >
                      <option value="">Select</option>
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={newWeight} onChange={e => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#003d9b]" 
                    placeholder="e.g. 70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Medical Conditions</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={condInput} 
                      onChange={e => setCondInput(e.target.value)}
                      onKeyDown={handleAddCondition}
                      className="w-full pl-3 pr-10 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:border-[#003d9b]" 
                      placeholder="Type and press enter..."
                    />
                    <button 
                      onClick={handleAddCondition}
                      className="absolute right-1 top-1 text-[#003d9b] hover:bg-[#e8e0ff] p-1 rounded transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] border-dashed rounded-lg min-h-[50px]">
                    {conditions.map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-white border border-[#e2e8f0] rounded-md text-xs font-medium text-[#475569] flex items-center gap-1 shadow-sm">
                        {c}
                        <span 
                          onClick={() => removeCondition(c)}
                          className="material-symbols-outlined text-[14px] cursor-pointer hover:text-red-500"
                        >
                          close
                        </span>
                      </span>
                    ))}
                    {conditions.length === 0 && <span className="text-xs text-[#94a3b8] italic">No conditions added</span>}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex justify-end gap-3 rounded-b-2xl">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={!newName.trim()}
                  className="px-4 py-2 text-sm font-bold text-white bg-[#003d9b] hover:bg-[#002a7a] disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </AppShell>
  )
}

