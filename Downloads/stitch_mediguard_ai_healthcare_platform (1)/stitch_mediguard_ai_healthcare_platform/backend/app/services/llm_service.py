import os
import json
from typing import Dict, Any, List, Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from dotenv import load_dotenv
from .openfda_service import _build_label_summary

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("API Key Found:", GEMINI_API_KEY is not None)
if GEMINI_API_KEY:
    print(GEMINI_API_KEY[:10])

GEMINI_MODEL = "gemini-3.1-flash-lite"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


def analyze_regimen_with_llm(
    drugs: List[str],
    age: Optional[int] = None,
    weight: Optional[float] = None,
    kidney: Optional[str] = None,
    liver: Optional[str] = None,
    pregnancy: bool = False,
    pediatric: bool = False,
    geriatric: bool = False,
) -> Optional[Dict[str, Any]]:
    """Query Google Gemini API to analyze a drug regimen with patient physiology parameters.

    Returns a dictionary matching AnalyzeResponse if successful, or None if the API key
    is not configured or if the API call fails.
    """
    api_key = GEMINI_API_KEY
    if not api_key:
        # Gracefully return None to fall back to the deterministic local rules
        return None

    # 1. Fetch FDA label summaries for context
    fda_evidence = []
    for drug in drugs:
        try:
            summary = _build_label_summary(drug)
            if summary and "warnings" in summary:
                warnings = summary["warnings"]
                warning_text = warnings[0] if isinstance(warnings, list) else str(warnings)
                fda_evidence.append(f"- FDA Label Warnings for {drug.title()}: {warning_text[:800]}")
        except Exception as e:
            print(f"Error fetching FDA label for {drug}: {e}")

    fda_context = "\n".join(fda_evidence) if fda_evidence else "- No specific FDA label warning evidence retrieved."

    # Prepare patient details text for the prompt
    patient_info = []
    if age is not None:
        patient_info.append(f"- Age: {age} years")
    if weight is not None:
        patient_info.append(f"- Weight: {weight} kg")
    if kidney:
        patient_info.append(f"- Renal Function: {kidney}")
    if liver:
        patient_info.append(f"- Hepatic Function: {liver}")
    if pregnancy:
        patient_info.append("- Pregnancy/Lactation: Yes")
    if pediatric:
        patient_info.append("- Patient is pediatric (<18 years)")
    if geriatric:
        patient_info.append("- Patient is geriatric (>65 years)")

    patient_str = "\n".join(patient_info) if patient_info else "- Normal/Unspecified physiological parameters"

    prompt = f"""You are a clinical pharmacology AI assistant.
Analyze the following drug regimen for drug-drug interactions and patient physiology compatibility:

Drugs to analyze: {', '.join(drugs)}

FDA Evidence Context:
{fda_context}

Patient Physiology Parameters:
{patient_str}

Please perform a concise clinical interaction analysis. Consider how the patient's age, weight, renal function, hepatic function, pregnancy status, pediatric status, or geriatric status impacts the metabolism, clearance, safety, and efficacy of these drugs.

You MUST respond with a single, valid JSON object containing exactly the following keys (do not include any markdown wrapping or text outside the JSON):
{{
  "severity": "Severe" | "High" | "Moderate" | "Minor" | "Low" | "Safe",
  "message": "A concise (1-2 sentences) summary of the primary clinical concern or safety status.",
  "riskScore": An integer from 0 (completely safe) to 100 (lethal/critical risk),
  "explanation": "A concise clinical explanation (1-2 paragraphs max) covering the pharmacology of the interaction and how the patient's specific parameters impact the safety profile.",
  "sources": [
    {{
      "drug": "Name of Drug A",
      "section": "Relevant section, e.g., Boxed Warning or Drug Interactions"
    }},
    {{
      "drug": "Name of Drug B",
      "section": "Relevant section, e.g., Warnings and Precautions"
    }}
  ]
}}"""

    # Prepare request payload
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2,
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "severity": {"type": "STRING", "enum": ["Severe", "High", "Moderate", "Minor", "Low", "Safe"]},
                    "message": {"type": "STRING"},
                    "riskScore": {"type": "INTEGER"},
                    "explanation": {"type": "STRING"},
                    "sources": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "drug": {"type": "STRING"},
                                "section": {"type": "STRING"}
                            },
                            "required": ["drug", "section"]
                        }
                    }
                },
                "required": ["severity", "message", "riskScore", "explanation", "sources"]
            }
        }
    }

    url = f"{GEMINI_API_URL}?key={api_key}"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "MediGuard-AI/1.0"
    }

    req = Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

    try:
        with urlopen(req, timeout=90) as response:
            resp_data = json.loads(response.read().decode("utf-8"))

            candidates = resp_data.get("candidates", [])
            if not candidates:
                return None

            content_text = candidates[0].get("content", {}).get("parts", [])[0].get("text", "")
            if not content_text:
                return None

            result = json.loads(content_text.strip())

            # Phase 2 — Patient-Specific Risk Scoring
            # Normalize drugs to lowercase set for matching
            drug_set = {d.lower().strip() for d in drugs if d}

            # Determine base_risk
            if "warfarin" in drug_set and "aspirin" in drug_set:
                base_risk = 72
            elif "atorvastatin" in drug_set and "clopidogrel" in drug_set:
                base_risk = 55
            else:
                # Use the LLM's suggested riskScore as the base_risk for other combinations
                base_risk = result.get("riskScore", 50)

            # Apply patient physiology modifiers
            risk = base_risk
            if age is not None and age > 65:
                risk += 10

            # eGFR (kidney) mapping: moderate/severe represent eGFR < 50
            kidney_val = (kidney or "normal").lower().strip()
            if kidney_val in ("moderate", "severe"):
                risk += 15

            # Hepatic (liver) mapping: mild/severe represent Child-Pugh score < 50 (Class B/C)
            liver_val = (liver or "normal").lower().strip()
            if liver_val in ("mild", "severe"):
                risk += 10

            # Cap the final riskScore at 100
            final_risk = min(max(risk, 0), 100)
            result["riskScore"] = final_risk

            # Update severity based on the final riskScore
            if final_risk >= 85:
                result["severity"] = "Severe"
            elif final_risk >= 70:
                result["severity"] = "High"
            elif final_risk >= 40:
                result["severity"] = "Moderate"
            elif final_risk >= 15:
                result["severity"] = "Minor"
            else:
                result["severity"] = "Low"

            return result
    except HTTPError as e:
        print(f"LLM Service HTTP Error: {e.code} {e.reason}")
        try:
            print("ERROR BODY:", e.read().decode("utf-8"))
        except Exception:
            pass
        return None
    except Exception as e:
        # Fail gracefully and fall back to local rules
        print(f"LLM Service Error: {e}")
        return None
