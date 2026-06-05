import React, {useEffect, useState} from 'react'

export default function AIResults(){
  const [data, setData] = useState(null)

  useEffect(()=>{
    try{
      const raw = sessionStorage.getItem('lastAnalysis')
      if(raw) setData(JSON.parse(raw))
    }catch(e){
      setData(null)
    }
  },[])

  if(!data) return (
    <div className="p-6">
      <h2 className="font-headline-md">No analysis available</h2>
      <p className="text-on-surface-variant">Run the Interaction Checker and submit to view results here.</p>
    </div>
  )

  const {request, response} = data
  const drugs = request?.drugs || [request?.drugA, request?.drugB].filter(Boolean)
  const sources = Array.isArray(response?.sources) ? response.sources : []

  function generateRecommendations(drugs, severity, riskScore) {
    const recommendations = []
    const drugSet = new Set(drugs.map(d => d.toLowerCase().trim()))

    // Specific interactions
    if (drugSet.has('warfarin') && drugSet.has('aspirin')) {
      recommendations.push("Consider gastroprotection with a proton pump inhibitor (PPI) (e.g., Omeprazole) due to heightened GI bleeding risk.")
      recommendations.push("Closely monitor Prothrombin Time (PT) and International Normalized Ratio (INR) targets.")
      recommendations.push("Instruct patient to report warning signs of hemorrhage immediately (bruising, epistaxis, dark/tarry stools).")
    } else if (drugSet.has('clopidogrel') && (drugSet.has('atorvastatin') || drugSet.has('simvastatin'))) {
      const statin = drugSet.has('atorvastatin') ? 'Atorvastatin' : 'Simvastatin'
      recommendations.push(`Statin CYP3A4 pathway overlap: Consider alternative lipid-lowering therapy not dependent on CYP3A4 (e.g., Rosuvastatin or Pravastatin) to avoid reducing Clopidogrel's antiplatelet efficacy.`)
      recommendations.push("Monitor patient for symptoms of myalgia, muscle tenderness, or weakness (myotoxicity).")
      recommendations.push("Perform baseline and periodic liver function tests (LFTs) as clinically indicated.")
    }

    // Severity based general recommendations
    const upperSeverity = (severity || '').toUpperCase()
    if (upperSeverity === 'SEVERE' || upperSeverity === 'HIGH' || riskScore >= 70) {
      recommendations.push("CRITICAL: Consult a clinical pharmacist or senior attending physician to discuss therapeutic alternatives.")
      recommendations.push("Evaluate clinical necessity of co-prescription against the risk of severe adverse drug events (ADEs).")
      recommendations.push("Establish a strict monitoring protocol with frequent laboratory and clinical reviews if co-prescribing is unavoidable.")
    } else if (upperSeverity === 'MODERATE' || (riskScore >= 40 && riskScore < 70)) {
      recommendations.push("Monitor patient response and laboratory parameters (e.g., renal panel, hepatic enzymes) at regular intervals.")
      recommendations.push("Educate patient on potential side effects and provide a clear contact protocol for emergency symptoms.")
      recommendations.push("Consider scheduling administration of these medications at different times of the day if absorption interference is possible.")
    } else {
      recommendations.push("Standard clinical monitoring and routine follow-up are sufficient.")
      recommendations.push("Ensure standard medication compliance and review overall regimen during annual checkups.")
    }

    return recommendations
  }

  function handleDownloadReport() {
    const recommendations = generateRecommendations(drugs, response.severity, response.riskScore)
    const reportId = `CDSS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    const dateStr = new Date().toLocaleString()

    const ageVal = request.age ? `${request.age} years` : 'Not Specified'
    const weightVal = request.weight ? `${request.weight} kg` : 'Not Specified'
    
    // Kidney formatting
    let kidneyVal = 'Normal'
    if (request.kidney === 'mild') kidneyVal = 'Mild Impairment (60-89 mL/min)'
    else if (request.kidney === 'moderate') kidneyVal = 'Moderate Impairment (30-59 mL/min)'
    else if (request.kidney === 'severe') kidneyVal = 'Severe Impairment (<30 mL/min)'

    // Liver formatting
    let liverVal = 'Normal (Class A)'
    if (request.liver === 'mild') liverVal = 'Mild-Moderate (Class B)'
    else if (request.liver === 'severe') liverVal = 'Severe (Class C)'

    // Special Flags
    const flags = []
    if (request.pregnancy) flags.push('Pregnancy/Lactation')
    if (request.pediatric) flags.push('Pediatric Consider.')
    if (request.geriatric) flags.push('Geriatric Risk')

    const severityClass = `risk-${(response.severity || 'low').toLowerCase()}`

    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Clinical Interaction Report - MediGuard AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 40px;
      line-height: 1.5;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #003d9b;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background-color: #003d9b;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: 'Manrope', sans-serif;
      font-weight: 800;
      font-size: 20px;
    }
    .brand-name {
      font-family: 'Manrope', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #003d9b;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .system-label {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .meta-details {
      text-align: right;
      font-size: 12px;
      color: #475569;
    }
    .meta-details div {
      margin-bottom: 4px;
    }
    .report-title {
      font-family: 'Manrope', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 24px 0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      background: #f8fafc;
    }
    .card-title {
      font-family: 'Manrope', sans-serif;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin: 0 0 12px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .profile-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .profile-table td {
      padding: 6px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .profile-table td.label {
      font-weight: 600;
      color: #64748b;
      width: 45%;
    }
    .profile-table td.value {
      color: #0f172a;
      text-align: right;
      font-weight: 500;
    }
    .profile-table tr:last-child td {
      border-bottom: none;
    }
    .drug-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      margin: 4px;
    }
    .risk-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid;
    }
    .risk-banner.risk-severe {
      background: #fef2f2;
      border-color: #fee2e2;
      color: #991b1b;
    }
    .risk-banner.risk-high {
      background: #fff5f5;
      border-color: #fed7d7;
      color: #c53030;
    }
    .risk-banner.risk-moderate {
      background: #fffbeb;
      border-color: #fef3c7;
      color: #b45309;
    }
    .risk-banner.risk-low {
      background: #f0fdf4;
      border-color: #dcfce7;
      color: #166534;
    }
    .risk-info {
      display: flex;
      flex-direction: column;
    }
    .risk-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .risk-value {
      font-family: 'Manrope', sans-serif;
      font-size: 26px;
      font-weight: 800;
      margin-top: 4px;
    }
    .risk-score-box {
      font-size: 32px;
      font-weight: 800;
      font-family: 'Manrope', sans-serif;
      text-align: right;
    }
    .risk-score-sub {
      font-size: 12px;
      opacity: 0.8;
      font-weight: normal;
    }
    .section-title {
      font-family: 'Manrope', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 28px 0 12px 0;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .narrative-box {
      background: #fafafb;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #003d9b;
      padding: 16px;
      border-radius: 0 12px 12px 0;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .narrative-title {
      font-weight: 700;
      margin-bottom: 6px;
      color: #0f172a;
    }
    .sources-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    .source-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
    }
    .source-icon {
      color: #003d9b;
      font-size: 20px;
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }
    .source-content {
      display: flex;
      flex-direction: column;
    }
    .source-drug {
      font-weight: 700;
      color: #0f172a;
    }
    .source-section {
      color: #64748b;
      margin-top: 2px;
    }
    .recommendations-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .recommendation-item {
      position: relative;
      padding-left: 28px;
      margin-bottom: 12px;
      font-size: 13.5px;
      color: #334155;
    }
    .recommendation-item::before {
      content: "check_box";
      font-family: 'Material Symbols Outlined';
      position: absolute;
      left: 0;
      top: 1px;
      font-size: 18px;
      color: #10b981;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 48px;
      padding-top: 16px;
      font-size: 10px;
      color: #64748b;
      text-align: center;
      line-height: 1.6;
    }
    .considerations-badge {
      display: inline-block;
      background: #fef3c7;
      color: #d97706;
      border: 1px solid #fde68a;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 6px;
      text-transform: uppercase;
    }
    @media print {
      body {
        padding: 0;
      }
      .card {
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
      }
      .source-item {
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
      }
      .recommendation-item {
        page-break-inside: avoid;
      }
      .page-break-avoid {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      <div class="logo-icon">+</div>
      <div>
        <h1 class="brand-name">MediGuard AI</h1>
        <div class="system-label">Clinical Decision Support Report</div>
      </div>
    </div>
    <div class="meta-details">
      <div><strong>Report Ref:</strong> ${reportId}</div>
      <div><strong>Date Generated:</strong> ${dateStr}</div>
      <div><strong>System Version:</strong> v2.1.0-Gemini</div>
    </div>
  </div>

  <h2 class="report-title">Drug Interaction Analysis</h2>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Patient Profile</h3>
      <table class="profile-table">
        <tr>
          <td class="label">Age</td>
          <td class="value">${ageVal}</td>
        </tr>
        <tr>
          <td class="label">Weight</td>
          <td class="value">${weightVal}</td>
        </tr>
        <tr>
          <td class="label">Renal Function</td>
          <td class="value">${kidneyVal}</td>
        </tr>
        <tr>
          <td class="label">Hepatic Function</td>
          <td class="value">${liverVal}</td>
        </tr>
        <tr>
          <td class="label">Special Conditions</td>
          <td class="value">
            ${flags.length > 0 ? flags.map(f => `<span class="considerations-badge">${f}</span>`).join('') : 'None Specified'}
          </td>
        </tr>
      </table>
    </div>

    <div class="card">
      <h3 class="card-title">Medication Regimen</h3>
      <div style="margin-top: 8px;">
        ${drugs.map(d => `<span class="drug-badge">${d}</span>`).join('')}
      </div>
      <div style="font-size: 11px; color: #64748b; margin-top: 16px; font-style: italic;">
        Total medications analyzed: ${drugs.length}
      </div>
    </div>
  </div>

  <div class="risk-banner ${severityClass}">
    <div class="risk-info">
      <span class="risk-label">Interaction Severity Assessment</span>
      <span class="risk-value">${(response.severity || 'UNKNOWN').toUpperCase()}</span>
    </div>
    <div class="risk-score-box">
      ${response.riskScore ?? '—'}<span class="risk-score-sub">/100</span>
    </div>
  </div>

  <div class="section-title">Clinical Findings & Summary</div>
  <div class="narrative-box">
    <div class="narrative-title">AI Clinical Evaluation</div>
    <div>${response.message}</div>
  </div>
  ${response.explanation ? `<div style="font-size: 13.5px; color: #334155; margin-bottom: 24px; text-align: justify; text-justify: inter-word;">${response.explanation}</div>` : ''}

  <div class="page-break-avoid">
    <div class="section-title">FDA openFDA Warning Evidence</div>
    <div class="sources-list">
      ${sources.length > 0 ? sources.map(source => `
        <div class="source-item">
          <span class="source-icon">description</span>
          <div class="source-content">
            <span class="source-drug">${source.drug}</span>
            <span class="source-section">FDA Label Section: ${source.section}</span>
          </div>
        </div>
      `).join('') : `
        <div class="source-item" style="color: #64748b;">
          <span class="source-icon" style="color: #64748b;">info</span>
          <span>No specific openFDA label reference warnings recorded for this analysis.</span>
        </div>
      `}
    </div>
  </div>

  <div class="page-break-avoid" style="margin-top: 28px;">
    <div class="section-title">Clinical Action Recommendations</div>
    <ul class="recommendations-list">
      ${recommendations.map(rec => `
        <li class="recommendation-item">${rec}</li>
      `).join('')}
    </ul>
  </div>

  <div class="footer">
    <strong>CONFIDENTIAL MEDICAL DOCUMENTATION — FOR CLINICIAN USE ONLY</strong><br>
    Disclaimer: This report is a clinical decision support analysis generated using automated queries to openFDA and LLM-assisted pharmacology evaluations. It is designed to assist licensed clinicians in evaluating potential drug-drug and patient-drug interactions. It does not constitute final medical advice or diagnose patients. The final clinical responsibility for patient prescribing and monitoring lies entirely with the attending physician.
  </div>
</body>
</html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(reportHtml)
    printWindow.document.close()
    
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg">Interaction Analysis</h1>
        <span className={`px-3 py-1 rounded-full font-semibold ${
          response.severity?.toLowerCase() === 'severe' || response.severity?.toLowerCase() === 'high' 
            ? 'bg-red-600 text-white' 
            : response.severity?.toLowerCase() === 'low' || response.severity?.toLowerCase() === 'safe' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
        }`}>
          {response.severity?.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {drugs.map((d,i)=>(
          <div key={i} className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-lg border border-outline-variant">{d}</div>
        ))}
      </div>

      <div className="bg-surface p-4 rounded-xl border border-outline-variant">
        <div className="flex justify-between items-end">
          <span className="text-sm text-on-surface-variant">AI Risk Index</span>
          <span className="text-2xl font-bold text-error">{response.riskScore ?? '—' }<span className="text-sm text-on-surface-variant">/100</span></span>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mt-3">
          <div className="h-full bg-error" style={{width: `${response.riskScore ?? 0}%`}} />
        </div>
      </div>

      <section className="bg-surface border border-outline-variant rounded-xl p-4">
        <h3 className="font-semibold text-on-surface">AI Summary</h3>
        <p className="mt-2 text-on-surface">{response.message}</p>
        {response.explanation && <p className="mt-2 text-sm text-on-surface-variant">{response.explanation}</p>}
      </section>

      <section className="bg-surface border border-outline-variant rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-on-surface">Evidence Sources</h3>
          <span className="text-xs uppercase tracking-wider text-on-surface-variant">OpenFDA</span>
        </div>
        <div className="mt-4 space-y-3">
          {sources.length > 0 ? sources.map((source, index) => (
            <div key={`${source.drug}-${source.section}-${index}`} className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
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

      <section className="flex gap-3">
        <button onClick={handleDownloadReport} className="bg-[#00B8D9] hover:bg-[#00a3c2] text-white w-full py-3 px-4 rounded-xl font-body-md font-semibold flex items-center justify-center gap-2 transition-colors">
          <span className="material-symbols-outlined text-[20px]">download</span>
          <span>Download PDF Report</span>
        </button>
        <button className="bg-surface border border-[#DFE1E6] w-full py-3 px-4 rounded-xl font-semibold text-on-surface hover:bg-surface-container-high transition-colors">Save</button>
      </section>
    </main>
  )
}
