from typing import Dict

from .openfda_service import analyze_bleeding_risk
from .llm_service import analyze_regimen_with_llm


def analyze_regimen(payload) -> Dict[str, str]:
    """Minimal deterministic analyzer used for local testing.

    Replace this with real clinical logic or an AI service call.
    Supports payloads with `drugs` list or `drugA`/`drugB` fields.
    """
    raw_drugs = []
    if getattr(payload, 'drugs', None):
        raw_drugs = list(payload.drugs)
    else:
        # collect drugA/drugB if provided
        if getattr(payload, 'drugA', None):
            raw_drugs.append(payload.drugA)
        if getattr(payload, 'drugB', None):
            raw_drugs.append(payload.drugB)

    # Try dynamic LLM analysis first if API key is configured
    llm_result = analyze_regimen_with_llm(
        drugs=raw_drugs,
        age=getattr(payload, 'age', None),
        weight=getattr(payload, 'weight', None),
        kidney=getattr(payload, 'kidney', None),
        liver=getattr(payload, 'liver', None),
        pregnancy=getattr(payload, 'pregnancy', False),
        pediatric=getattr(payload, 'pediatric', False),
        geriatric=getattr(payload, 'geriatric', False),
    )
    if llm_result:
        return llm_result

    openfda_result = analyze_bleeding_risk(raw_drugs)
    if openfda_result:
        return openfda_result


    drugs = [d.lower() for d in (raw_drugs or []) if d]
    if len(drugs) < 2:
        return {"severity": "info", "message": "Provide at least two medications for interaction analysis.", "riskScore": 0, "explanation": "Not enough medications provided"}

    # example rule
    if 'atorvastatin' in drugs and 'clopidogrel' in drugs:
        return {
            "severity": "high",
            "message": "High-risk interaction: Clopidogrel may reduce efficacy of Atorvastatin via CYP pathways.",
            "riskScore": 80,
            "explanation": "CYP-mediated interaction may alter statin metabolism; monitor LFTs and consider dose adjustment."
        }

    if 'warfarin' in drugs and 'aspirin' in drugs:
        return {
            "severity": "high",
            "message": "High-risk interaction: Warfarin + Aspirin increases bleeding risk; review anticoagulation management.",
            "riskScore": 90,
            "explanation": "Concurrent antiplatelet and anticoagulant therapy significantly increases bleeding risk, especially in elderly patients."
        }

    if len(set(drugs)) != len(drugs):
        return {"severity": "info", "message": "Duplicate medications detected — please verify entries.", "riskScore": 10, "explanation": "Same drug listed more than once"}

    return {"severity": "low", "message": "No major interactions detected (mock analysis).", "riskScore": 5, "explanation": "No significant interaction rules matched in the mock analyzer."}
