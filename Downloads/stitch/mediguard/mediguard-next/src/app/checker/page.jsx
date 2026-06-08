"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import AlertCard from '@/components/AlertCard'
import { analyzeInteraction as analyzeService, searchDrugs } from '@/lib/services'

export default function DrugChecker(){
  const router = useRouter()
  const [drugA, setDrugA] = useState('')
  const [suggestionsA, setSuggestionsA] = useState([])
  const [showA, setShowA] = useState(false)

  const [drugB, setDrugB] = useState('')
  const [suggestionsB, setSuggestionsB] = useState([])
  const [showB, setShowB] = useState(false)

  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [kidney, setKidney] = useState('normal')
  const [liver, setLiver] = useState('normal')
  const [pregnancy, setPregnancy] = useState(false)
  const [pediatric, setPediatric] = useState(false)
  const [geriatric, setGeriatric] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Debounced search for Drug A
  useEffect(() => {
    const term = drugA.trim()
    if (term.length < 1) {
      setSuggestionsA([])
      return
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchDrugs(term)
        setSuggestionsA(results)
      } catch (err) {
        console.error(err)
      }
    }, 150)
    return () => clearTimeout(delayDebounce)
  }, [drugA])

  // Debounced search for Drug B
  useEffect(() => {
    const term = drugB.trim()
    if (term.length < 1) {
      setSuggestionsB([])
      return
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchDrugs(term)
        setSuggestionsB(results)
      } catch (err) {
        console.error(err)
      }
    }, 150)
    return () => clearTimeout(delayDebounce)
  }, [drugB])

  async function handleSubmit(e){
    e.preventDefault()
    setResult(null)
    setLoading(true)
    const payload = {drugs:[drugA, drugB], age, weight, kidney, liver, pregnancy, pediatric, geriatric, drugA, drugB}
    try{
      const resp = await analyzeService(payload)
      // persist request + response so results page can read them
      try{ sessionStorage.setItem('lastAnalysis', JSON.stringify({request: payload, response: resp})) }catch(e){}
      // navigate to results page
      router.push('/results')
    }catch(err){
      setResult({level:'error', message: err.message || 'Analysis failed'})
    }finally{
      setLoading(false)
    }
  }

  function handleReset(){
    setDrugA('')
    setSuggestionsA([])
    setShowA(false)
    setDrugB('')
    setSuggestionsB([])
    setShowB(false)
    setAge('')
    setWeight('')
    setKidney('normal')
    setLiver('normal')
    setPregnancy(false)
    setPediatric(false)
    setGeriatric(false)
    setResult(null)
  }

  return (
    <AppShell activeRoute="/checker">
      <main className="flex-1 p-margin-mobile md:p-margin-desktop bg-surface-container-low overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-[32px]">
          <div>
            <h1 className="font-headline-lg text-primary font-bold hidden md:block">Drug Interaction Checker</h1>
            <h2 className="font-headline-lg-mobile text-primary font-bold md:hidden">Interaction Checker</h2>
            <p className="font-body-sm text-on-surface-variant mt-2">Analyze complex drug combinations against patient physiology parameters.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-[#DFE1E6] p-6 shadow-sm space-y-[32px]">
            <section>
              <h3 className="font-headline-md text-on-surface mb-4 flex items-center space-x-2">
                <span className="material-symbols-outlined text-primary">prescriptions</span>
                <span>Medication Regimen</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Primary Medication</label>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
                      <input 
                        value={drugA} 
                        onChange={e=>setDrugA(e.target.value)} 
                        onFocus={()=>setShowA(true)}
                        onBlur={() => setTimeout(() => setShowA(false), 200)}
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface placeholder:text-outline outline-none transition-all" 
                        placeholder="e.g., Atorvastatin" 
                        type="text"
                      />
                    </div>
                    {showA && suggestionsA.length > 0 && (
                      <ul className="absolute left-0 right-0 mt-1 bg-white border border-[#DFE1E6] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                        {suggestionsA.map((item, idx) => (
                          <li 
                            key={idx} 
                            onClick={() => {
                              setDrugA(item)
                              setShowA(false)
                            }}
                            className="px-4 py-2.5 hover:bg-[#f3f0ff] cursor-pointer text-sm font-medium text-[#1e293b] border-b border-gray-100 last:border-b-0"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Secondary Medication</label>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
                      <input 
                        value={drugB} 
                        onChange={e=>setDrugB(e.target.value)} 
                        onFocus={()=>setShowB(true)}
                        onBlur={() => setTimeout(() => setShowB(false), 200)}
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface placeholder:text-outline outline-none transition-all" 
                        placeholder="e.g., Clopidogrel" 
                        type="text"
                      />
                    </div>
                    {showB && suggestionsB.length > 0 && (
                      <ul className="absolute left-0 right-0 mt-1 bg-white border border-[#DFE1E6] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                        {suggestionsB.map((item, idx) => (
                          <li 
                            key={idx} 
                            onClick={() => {
                              setDrugB(item)
                              setShowB(false)
                            }}
                            className="px-4 py-2.5 hover:bg-[#f3f0ff] cursor-pointer text-sm font-medium text-[#1e293b] border-b border-gray-100 last:border-b-0"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-headline-md text-on-surface mb-4 flex items-center space-x-2 pt-4 border-t border-outline-variant">
                <span className="material-symbols-outlined text-secondary">vital_signs</span>
                <span>Patient Physiology</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Age (Years)</label>
                  <input value={age} onChange={e=>setAge(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface outline-none transition-all" placeholder="45" type="number"/>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Weight (kg)</label>
                  <input value={weight} onChange={e=>setWeight(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface outline-none transition-all" placeholder="70" type="number"/>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Renal Function (eGFR)</label>
                  <select value={kidney} onChange={e=>setKidney(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface outline-none transition-all appearance-none">
                    <option value="normal">Normal (&gt;90 mL/min)</option>
                    <option value="mild">Mild impairment (60-89 mL/min)</option>
                    <option value="moderate">Moderate impairment (30-59 mL/min)</option>
                    <option value="severe">Severe impairment (&lt;30 mL/min)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Hepatic Function (Child-Pugh)</label>
                  <select value={liver} onChange={e=>setLiver(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface outline-none transition-all appearance-none">
                    <option value="normal">Class A (Well-compensated)</option>
                    <option value="mild">Class B (Significant compromise)</option>
                    <option value="severe">Class C (Decompensated)</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <h4 className="font-body-md font-semibold text-on-surface mb-3 flex items-center space-x-2">
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Advanced Considerations</span>
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input checked={pregnancy} onChange={e=>setPregnancy(e.target.checked)} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
                  <span className="font-body-sm text-on-surface">Pregnancy or Lactation Analysis</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input checked={pediatric} onChange={e=>setPediatric(e.target.checked)} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
                  <span className="font-body-sm text-on-surface">Pediatric Dosing Adjustments (&lt; 18 yrs)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input checked={geriatric} onChange={e=>setGeriatric(e.target.checked)} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox"/>
                  <span className="font-body-sm text-on-surface">Geriatric Fall Risk Factors (&gt; 65 yrs)</span>
                </label>
              </div>
            </section>

            <div className="flex flex-col-reverse md:flex-row md:justify-end gap-4 pt-6 border-t border-outline-variant">
              <button onClick={handleReset} type="button" className="px-6 py-3 border border-outline text-on-surface font-label-md uppercase tracking-wider rounded-lg hover:bg-surface-container-high transition-colors focus:ring-2 focus:ring-outline outline-none">
                Clear Form
              </button>
              <button disabled={loading} type="submit" className="px-6 py-3 bg-[#00B8D9] disabled:opacity-60 text-on-primary font-label-md uppercase tracking-wider rounded-lg hover:brightness-95 transition-all flex justify-center items-center space-x-2 shadow-sm focus:ring-2 focus:ring-[#00B8D9] focus:ring-offset-2 outline-none">
                <span className="material-symbols-outlined text-sm">memory</span>
                <span>{loading ? 'Analyzing...' : 'Analyze Interaction'}</span>
              </button>
            </div>
          </form>

          {result && (
            <div>
              <AlertCard title={result.level === 'error' ? 'Error' : result.level === 'warning' ? 'Warning' : `Risk ${result.riskScore ?? ''}`}>
                <div className="space-y-2">
                  <div className="font-semibold">{result.message}</div>
                  {result.explanation && <div className="text-sm text-on-surface-variant">{result.explanation}</div>}
                  {typeof result.riskScore === 'number' && <div className="text-xs">Risk Score: <strong>{result.riskScore}</strong></div>}
                </div>
              </AlertCard>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}


