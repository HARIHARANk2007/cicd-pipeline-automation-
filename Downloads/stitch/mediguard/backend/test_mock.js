function mockAnalyze(payload){
  const drugs = (payload.drugs || []).map(d => (d||'').toLowerCase())
  if(drugs.includes('atorvastatin') && drugs.includes('clopidogrel')){
    return {severity:'high', message:'High-risk interaction: Clopidogrel may reduce efficacy of Atorvastatin via CYP pathways. Consider alternative therapy and consult pharmacy.'}
  }
  if(drugs.length < 2){
    return {severity:'info', message:'Provide at least two medications for interaction analysis.'}
  }
  return {severity:'low', message:'No major interactions detected for the provided regimen. Review patient-specific parameters before finalizing.'}
}

const tests = [
  {drugs:['Atorvastatin','Clopidogrel']},
  {drugs:['Warfarin','Aspirin']},
  {drugs:['Aspirin']},
  {drugA:'Warfarin', drugB:'Aspirin'},
]

for(const t of tests){
  const payload = t.drugs ? {drugs:t.drugs} : {drugs:[t.drugA, t.drugB]}
  console.log('INPUT:', JSON.stringify(payload))
  console.log('OUTPUT:', mockAnalyze(payload))
  console.log('---')
}
