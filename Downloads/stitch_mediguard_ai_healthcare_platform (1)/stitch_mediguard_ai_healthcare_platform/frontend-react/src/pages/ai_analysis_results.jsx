import React, { useEffect, useState } from 'react'
import { explainInteraction } from '../services'

export default function AIResults() {
  const [data, setData] = useState(null)
  const [explainMode, setExplainMode] = useState(null)   // 'doctor' | 'patient'
  const [explainText, setExplainText] = useState('')
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainError, setExplainError] = useState('')

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lastAnalysis')
      if (raw) setData(JSON.parse(raw))
    } catch (e) { setData(null) }
  }, [])

  if (!data) return (
    <div className="p-6">
      <h2 className="font-headline-md">No analysis available</h2>
      <p className="text-on-surface-variant">Run the Interaction Checker and submit to view results here.</p>
    </div>
  )

  const { request, response } = data
  const drugs = request?.drugs || [request?.drugA, request?.drugB].filter(Boolean)
  const sources = Array.isArray(response?.sources) ? response.sources : []
  const alternatives = Array.isArray(response?.alternatives) ? response.alternatives : []

  // ── Explain handler ───────────────────────────────────────────────────────
  async function handleExplain(mode) {
    setExplainMode(mode)
    setExplainText('')
    setExplainError('')
    setExplainLoading(true)
    try {
      const result = await explainInteraction(
        drugs[0] || '', drugs[1] || '',
        response.severity, response.riskScore, mode
      )
      setExplainText(result.explanation)
    } catch (err) {
      setExplainError(err.message || 'Explanation failed.')
    } finally {
      setExplainLoading(false)
    }
  }

  function closeModal() {
    setExplainMode(null)
    setExplainText('')
    setExplainError('')
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  function generateRecommendations(drugs, severity, riskScore) {
    const recs = []
    const drugSet = new Set(drugs.map(d => d.toLowerCase().trim()))
    if (drugSet.has('warfarin') && drugSet.has('aspirin')) {
      recs.push("Gastroprotection with a PPI (e.g. Omeprazole) is strongly recommended.")
      recs.push("Monitor PT/INR closely and adjust Warfarin dose as needed.")
      recs.push("Educate patient: report bruising, dark stools, or unusual bleeding immediately.")
    } else if (drugSet.has('clopidogrel') && (drugSet.has('atorvastatin') || drugSet.has('simvastatin'))) {
      recs.push("Consider switching to Rosuvastatin or Pravastatin (non-CYP3A4 statins).")
      recs.push("Monitor for myalgia and perform baseline/periodic LFTs.")
    }
    const s = (severity || '').toUpperCase()
    if (s === 'SEVERE' || s === 'HIGH' || riskScore >= 70) {
      recs.push("CRITICAL: Consult a clinical pharmacist or senior physician for therapeutic alternatives.")
      recs.push("Establish strict monitoring protocol with frequent lab and clinical reviews.")
    } else if (s === 'MODERATE' || riskScore >= 40) {
      recs.push("Monitor laboratory parameters at regular intervals.")
      recs.push("Educate patient on side effects and emergency contact protocol.")
    } else {
      recs.push("Standard monitoring and routine follow-up are sufficient.")
    }
    return recs
  }

  // ── PDF Report ────────────────────────────────────────────────────────────
  function handleDownloadReport() {
    const recommendations = generateRecommendations(drugs, response.severity, response.riskScore)
    const reportId = `CDSS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    const dateStr = new Date().toLocaleString()
    const ageVal = request.age ? `${request.age} years` : 'Not Specified'
    const weightVal = request.weight ? `${request.weight} kg` : 'Not Specified'
    let kidneyVal = 'Normal'
    if (request.kidney === 'mild') kidneyVal = 'Mild Impairment (60-89 mL/min)'
    else if (request.kidney === 'moderate') kidneyVal = 'Moderate Impairment (30-59 mL/min)'
    else if (request.kidney === 'severe') kidneyVal = 'Severe Impairment (<30 mL/min)'
    let liverVal = 'Normal (Class A)'
    if (request.liver === 'mild') liverVal = 'Mild-Moderate (Class B)'
    else if (request.liver === 'severe') liverVal = 'Severe (Class C)'
    const flags = []
    if (request.pregnancy) flags.push('Pregnancy/Lactation')
    if (request.pediatric) flags.push('Pediatric')
    if (request.geriatric) flags.push('Geriatric Risk')
    const severityClass = `risk-${(response.severity || 'low').toLowerCase()}`

    const altSection = alternatives.length > 0 ? `
      <div class="page-break-avoid" style="margin-top:28px;">
        <div class="section-title">Suggested Therapeutic Alternatives</div>
        <ul class="recommendations-list">
          ${alternatives.map(a => `<li class="recommendation-item" style="--icon:'swap_horiz';">${a}</li>`).join('')}
        </ul>
      </div>` : ''

    const reportHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Clinical Interaction Report — MediGuard AI</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">
<style>
body{font-family:'Inter',sans-serif;color:#1e293b;margin:0;padding:40px;line-height:1.5;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #003d9b;padding-bottom:16px;margin-bottom:24px;}
.logo-icon{width:36px;height:36px;background:#003d9b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Manrope',sans-serif;font-weight:800;font-size:20px;}
.brand-name{font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;color:#003d9b;margin:0;}
.system-label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
.meta-details{text-align:right;font-size:12px;color:#475569;}
.meta-details div{margin-bottom:4px;}
.report-title{font-family:'Manrope',sans-serif;font-size:24px;font-weight:700;color:#0f172a;margin:0 0 24px;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
.card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc;}
.card-title{font-family:'Manrope',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#475569;margin:0 0 12px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;}
.profile-table{width:100%;border-collapse:collapse;font-size:13px;}
.profile-table td{padding:6px 0;border-bottom:1px dashed #e2e8f0;}
.profile-table td.label{font-weight:600;color:#64748b;width:45%;}
.profile-table td.value{color:#0f172a;text-align:right;font-weight:500;}
.profile-table tr:last-child td{border-bottom:none;}
.drug-badge{display:inline-block;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;padding:6px 12px;border-radius:8px;font-size:13px;font-weight:600;margin:4px;}
.risk-banner{display:flex;align-items:center;justify-content:space-between;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid;}
.risk-severe,.risk-high{background:#fef2f2;border-color:#fee2e2;color:#991b1b;}
.risk-moderate{background:#fffbeb;border-color:#fef3c7;color:#b45309;}
.risk-low{background:#f0fdf4;border-color:#dcfce7;color:#166534;}
.risk-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;}
.risk-value{font-family:'Manrope',sans-serif;font-size:26px;font-weight:800;margin-top:4px;}
.risk-score-box{font-size:32px;font-weight:800;font-family:'Manrope',sans-serif;text-align:right;}
.risk-score-sub{font-size:12px;opacity:.8;font-weight:normal;}
.section-title{font-family:'Manrope',sans-serif;font-size:16px;font-weight:700;color:#0f172a;margin:28px 0 12px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;}
.narrative-box{background:#fafafb;border:1px solid #e2e8f0;border-left:4px solid #003d9b;padding:16px;border-radius:0 12px 12px 0;font-size:14px;margin-bottom:20px;}
.sources-list{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
.source-item{display:flex;align-items:flex-start;gap:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:12px 16px;border-radius:8px;font-size:13px;}
.source-drug{font-weight:700;color:#0f172a;}
.source-section{color:#64748b;margin-top:2px;}
.alt-item{position:relative;padding-left:28px;margin-bottom:12px;font-size:13.5px;color:#334155;}
.alt-item::before{content:"swap_horiz";font-family:'Material Symbols Outlined';position:absolute;left:0;top:1px;font-size:18px;color:#003d9b;font-style:normal;line-height:1;}
.recommendations-list{list-style:none;padding:0;margin:0;}
.recommendation-item{position:relative;padding-left:28px;margin-bottom:12px;font-size:13.5px;color:#334155;}
.recommendation-item::before{content:"check_box";font-family:'Material Symbols Outlined';position:absolute;left:0;top:1px;font-size:18px;color:#10b981;font-style:normal;line-height:1;}
.footer{border-top:1px solid #e2e8f0;margin-top:48px;padding-top:16px;font-size:10px;color:#64748b;text-align:center;line-height:1.6;}
.considerations-badge{display:inline-block;background:#fef3c7;color:#d97706;border:1px solid #fde68a;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-left:6px;text-transform:uppercase;}
.page-break-avoid{page-break-inside:avoid;}
@media print{body{padding:0;}.card{background:#fff!important;border:1px solid #cbd5e1!important;}}
</style></head>
<body>
<div class="header">
  <div style="display:flex;align-items:center;gap:12px;">
    <div class="logo-icon">+</div>
    <div><h1 class="brand-name">MediGuard AI</h1><div class="system-label">Clinical Decision Support Report</div></div>
  </div>
  <div class="meta-details">
    <div><strong>Report Ref:</strong> ${reportId}</div>
    <div><strong>Generated:</strong> ${dateStr}</div>
    <div><strong>Version:</strong> v3.0.0-Gemini</div>
  </div>
</div>
<h2 class="report-title">Drug Interaction Analysis</h2>
<div class="grid-2">
  <div class="card">
    <h3 class="card-title">Patient Profile</h3>
    <table class="profile-table">
      <tr><td class="label">Age</td><td class="value">${ageVal}</td></tr>
      <tr><td class="label">Weight</td><td class="value">${weightVal}</td></tr>
      <tr><td class="label">Renal Function</td><td class="value">${kidneyVal}</td></tr>
      <tr><td class="label">Hepatic Function</td><td class="value">${liverVal}</td></tr>
      <tr><td class="label">Special Conditions</td><td class="value">${flags.length > 0 ? flags.map(f => `<span class="considerations-badge">${f}</span>`).join('') : 'None'}</td></tr>
    </table>
  </div>
  <div class="card">
    <h3 class="card-title">Medication Regimen</h3>
    <div style="margin-top:8px;">${drugs.map(d => `<span class="drug-badge">${d}</span>`).join('')}</div>
    <div style="font-size:11px;color:#64748b;margin-top:16px;font-style:italic;">Total medications: ${drugs.length}</div>
  </div>
</div>
<div class="risk-banner ${severityClass}">
  <div><span class="risk-label">Severity Assessment</span><span class="risk-value">${(response.severity || 'UNKNOWN').toUpperCase()}</span></div>
  <div class="risk-score-box">${response.riskScore ?? '—'}<span class="risk-score-sub">/100</span></div>
</div>
<div class="section-title">Clinical Findings & AI Summary</div>
<div class="narrative-box"><strong>${response.message}</strong></div>
${response.explanation ? `<p style="font-size:13.5px;color:#334155;margin-bottom:24px;text-align:justify;">${response.explanation}</p>` : ''}
<div class="page-break-avoid">
  <div class="section-title">FDA openFDA Warning Evidence</div>
  <div class="sources-list">
    ${sources.length > 0 ? sources.map(s => `<div class="source-item"><span style="font-family:'Material Symbols Outlined';font-size:20px;color:#003d9b;font-style:normal;line-height:1;">description</span><div><div class="source-drug">${s.drug}</div><div class="source-section">FDA Label Section: ${s.section}</div></div></div>`).join('') : '<div class="source-item" style="color:#64748b;">No openFDA references recorded.</div>'}
  </div>
</div>
${altSection}
<div class="page-break-avoid" style="margin-top:28px;">
  <div class="section-title">Clinical Action Recommendations</div>
  <ul class="recommendations-list">${recommendations.map(r => `<li class="recommendation-item">${r}</li>`).join('')}</ul>
</div>
<div class="footer">
  <strong>CONFIDENTIAL MEDICAL DOCUMENTATION — FOR CLINICIAN USE ONLY</strong><br>
  This report is generated by MediGuard AI (CDSS). It assists licensed clinicians in evaluating drug-drug interactions. It does not constitute final medical advice. Full clinical responsibility lies with the attending physician.
</div>
</body></html>`

    const w = window.open('', '_blank')
    w.document.write(reportHtml)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 250)
  }

  // ── Severity colour helper ─────────────────────────────────────────────────
  const sev = (response.severity || '').toLowerCase()
  const sevBadge = sev === 'severe' || sev === 'high'
    ? 'bg-red-600 text-white'
    : sev === 'low' || sev === 'safe'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg">Interaction Analysis</h1>
        <span className={`px-3 py-1 rounded-full font-semibold text-sm ${sevBadge}`}>
          {response.severity?.toUpperCase()}
        </span>
      </div>

      {/* Drug badges */}
      <div className="flex flex-wrap gap-2">
        {drugs.map((d, i) => (
          <div key={i} className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-lg border border-outline-variant">{d}</div>
        ))}
      </div>

      {/* Risk Index */}
      <div className="bg-surface p-4 rounded-xl border border-outline-variant">
        <div className="flex justify-between items-end">
          <span className="text-sm text-on-surface-variant">AI Risk Index</span>
          <span className="text-2xl font-bold text-error">{response.riskScore ?? '—'}<span className="text-sm text-on-surface-variant">/100</span></span>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mt-3">
          <div className="h-full bg-error transition-all" style={{ width: `${response.riskScore ?? 0}%` }} />
        </div>
      </div>

      {/* AI Summary */}
      <section className="bg-surface border border-outline-variant rounded-xl p-4">
        <h3 className="font-semibold text-on-surface">AI Summary</h3>
        <p className="mt-2 text-on-surface">{response.message}</p>
        {response.explanation && <p className="mt-2 text-sm text-on-surface-variant">{response.explanation}</p>}
      </section>

      {/* ── Explain Like a Doctor / Patient ─────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#f3f0ff] to-[#e8f4ff] border border-[#c4b5fd]/40 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#7c3aed]">psychology</span>
          <h3 className="font-semibold text-[#1e293b]">AI-Powered Explanations</h3>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-[#7c3aed] font-bold bg-[#ede9fe] px-2 py-0.5 rounded-full">New</span>
        </div>
        <p className="text-xs text-[#64748b] mb-4">Get the same interaction explained in two different ways — choose your audience.</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleExplain('doctor')}
            disabled={explainLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#003d9b] text-white text-sm font-semibold rounded-lg hover:bg-[#002a7a] disabled:opacity-60 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">stethoscope</span>
            Explain Like a Doctor
          </button>
          <button
            onClick={() => handleExplain('patient')}
            disabled={explainLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#059669] text-white text-sm font-semibold rounded-lg hover:bg-[#047857] disabled:opacity-60 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
            Explain Like a Patient
          </button>
        </div>
      </section>

      {/* Phase 6 — Alternatives */}
      {alternatives.length > 0 && (
        <section className="bg-surface border border-outline-variant rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#7c3aed]">swap_horiz</span>
            <h3 className="font-semibold text-on-surface">Suggested Therapeutic Alternatives</h3>
          </div>
          <div className="space-y-2">
            {alternatives.map((alt, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[#f3f0ff] rounded-lg border border-[#c4b5fd]/40">
                <span className="material-symbols-outlined text-[#7c3aed] text-[18px] mt-0.5 shrink-0">check_circle</span>
                <span className="text-sm text-[#1e293b]">{alt}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-3">Always consult a pharmacist or physician before switching medications.</p>
        </section>
      )}

      {/* Evidence Sources */}
      <section className="bg-surface border border-outline-variant rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-on-surface">Evidence Sources</h3>
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">OpenFDA</span>
        </div>
        <div className="mt-4 space-y-3">
          {sources.length > 0 ? sources.map((source, index) => (
            <div key={`${source.drug}-${index}`} className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">description</span>
              <div>
                <div className="font-semibold text-on-surface">{source.drug}</div>
                <div className="text-sm text-on-surface-variant">Section: {source.section}</div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-on-surface-variant">No evidence sources were returned for this analysis.</p>
          )}
        </div>
      </section>

      {/* Action buttons */}
      <section className="flex gap-3">
        <button onClick={handleDownloadReport} className="bg-[#00B8D9] hover:bg-[#00a3c2] text-white w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Download PDF Report
        </button>
        <button className="bg-surface border border-[#DFE1E6] w-full py-3 px-4 rounded-xl font-semibold text-on-surface hover:bg-surface-container-high transition-colors">Save</button>
      </section>

      {/* ── Explain Modal ──────────────────────────────────────────────────── */}
      {explainMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease]">
            {/* Modal header */}
            <div className={`px-6 py-4 flex items-center justify-between ${explainMode === 'doctor' ? 'bg-[#003d9b]' : 'bg-[#059669]'}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-[24px]">
                  {explainMode === 'doctor' ? 'stethoscope' : 'sentiment_satisfied'}
                </span>
                <div>
                  <h3 className="text-white font-bold text-base">
                    {explainMode === 'doctor' ? 'Clinical Explanation' : 'Patient Explanation'}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {explainMode === 'doctor' ? 'Pharmacokinetic & clinical detail' : 'Plain-language, easy to understand'}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Drug context bar */}
            <div className="px-6 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2 flex-wrap">
              {drugs.map((d, i) => (
                <span key={i} className="text-xs font-semibold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] px-2 py-1 rounded-md">{d}</span>
              ))}
              <span className="text-xs text-[#94a3b8] ml-1">· Risk: {response.riskScore}/100</span>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 min-h-[140px] flex items-center justify-center">
              {explainLoading ? (
                <div className="flex flex-col items-center gap-3 text-[#64748b]">
                  <span className="material-symbols-outlined text-[32px] animate-spin text-[#003d9b]">progress_activity</span>
                  <span className="text-sm">Generating {explainMode === 'doctor' ? 'clinical' : 'patient'} explanation...</span>
                </div>
              ) : explainError ? (
                <div className="flex items-center gap-2 text-red-600">
                  <span className="material-symbols-outlined">error</span>
                  <span className="text-sm">{explainError}</span>
                </div>
              ) : explainText ? (
                <p className={`text-[15px] leading-relaxed text-[#1e293b] ${explainMode === 'patient' ? 'text-center' : ''}`}>
                  {explainText}
                </p>
              ) : null}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
              <p className="text-[11px] text-[#94a3b8]">Generated by Gemini AI · MediGuard v3.0</p>
              <button onClick={closeModal} className="text-sm font-semibold text-[#475569] hover:text-[#1e293b] border border-[#e2e8f0] rounded-lg px-4 py-2 hover:bg-white transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
