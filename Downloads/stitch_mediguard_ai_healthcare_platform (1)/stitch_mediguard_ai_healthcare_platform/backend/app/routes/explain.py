"""Phase 8 feature — Explain Like a Doctor / Explain Like a Patient.

Calls the Gemini LLM with audience-specific prompts to generate
plain-language or clinical-language explanations for a drug interaction.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os, json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from .auth import get_current_user

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-3.1-flash-lite"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


class ExplainRequest(BaseModel):
    drugA: str
    drugB: str
    severity: Optional[str] = None
    riskScore: Optional[int] = None
    mode: str  # "doctor" | "patient"


class ExplainResponse(BaseModel):
    explanation: str
    mode: str


DOCTOR_PROMPT = """You are a senior clinical pharmacologist briefing a medical team.
Provide a concise, technically precise explanation of the interaction between {drugA} and {drugB}.
Severity: {severity}. Risk Score: {riskScore}/100.
Cover: pharmacokinetic/pharmacodynamic mechanism, clinical implications, monitoring parameters.
Write 2-3 sentences in formal medical language. No markdown, plain text only."""

PATIENT_PROMPT = """You are a pharmacist explaining a medicine concern to a patient in simple, reassuring language.
Explain why taking {drugA} and {drugB} together might be risky.
Severity: {severity}.
Write 2-3 short, easy-to-understand sentences. Avoid medical jargon. No markdown, plain text only."""


def _call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="LLM service not configured.")
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 200},
    }
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    req = Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except HTTPError as e:
        raise HTTPException(status_code=502, detail=f"LLM API error: {e.code}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")


@router.post("/explain", response_model=ExplainResponse)
async def explain_interaction(
    body: ExplainRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate a doctor-grade or patient-friendly explanation. Requires auth."""
    if body.mode not in ("doctor", "patient"):
        raise HTTPException(status_code=400, detail="mode must be 'doctor' or 'patient'")

    template = DOCTOR_PROMPT if body.mode == "doctor" else PATIENT_PROMPT
    prompt = template.format(
        drugA=body.drugA,
        drugB=body.drugB,
        severity=body.severity or "Unknown",
        riskScore=body.riskScore or "N/A",
    )
    text = _call_gemini(prompt)
    return ExplainResponse(explanation=text, mode=body.mode)
