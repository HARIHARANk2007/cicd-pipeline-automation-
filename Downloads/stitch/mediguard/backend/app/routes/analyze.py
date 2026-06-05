from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..models.schemas import AnalyzeRequest, AnalyzeResponse
from ..models.analysis_history import AnalysisHistory
from ..models.database import SessionLocal
from ..services.analyzer import analyze_regimen
from .auth import get_current_user

router = APIRouter()

# Phase 6 — Alternative medication suggestions mapping
ALTERNATIVES_MAP = {
    frozenset(["warfarin", "aspirin"]): [
        "Acetaminophen (Paracetamol) — analgesic/antipyretic with no antiplatelet effect",
        "Clopidogrel — antiplatelet alternative if anticoagulation must continue",
        "Celecoxib (COX-2 inhibitor) — lower GI bleeding risk vs. non-selective NSAIDs",
    ],
    frozenset(["warfarin", "ibuprofen"]): [
        "Acetaminophen — safer analgesic without anticoagulation interaction",
        "Celecoxib — lower bleeding risk NSAID alternative",
    ],
    frozenset(["atorvastatin", "clopidogrel"]): [
        "Rosuvastatin — not metabolised by CYP3A4, avoids clopidogrel interaction",
        "Pravastatin — CYP3A4-independent statin with established safety data",
        "Fluvastatin — alternative lipid-lowering agent with minimal CYP interaction",
    ],
    frozenset(["simvastatin", "clopidogrel"]): [
        "Rosuvastatin — preferred statin without CYP3A4 pathway competition",
        "Pravastatin — safe alternative with low drug-interaction profile",
    ],
    frozenset(["lisinopril", "ibuprofen"]): [
        "Acetaminophen — preserves antihypertensive efficacy without NSAID interference",
        "Amlodipine — calcium channel blocker unaffected by NSAID co-administration",
    ],
}


def get_alternatives(drugs: list[str]) -> list[str]:
    """Return curated alternative suggestions for a given drug pair."""
    normalized = frozenset(d.strip().lower() for d in drugs if d)
    # Exact pair match
    if normalized in ALTERNATIVES_MAP:
        return ALTERNATIVES_MAP[normalized]
    # Partial match — one drug in a known pair
    for pair, alts in ALTERNATIVES_MAP.items():
        if len(normalized & pair) > 0:
            return alts[:2]
    return []


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Analyze a drug regimen and patient parameters. Requires valid auth token."""
    out = analyze_regimen(payload)

    # Phase 6 — attach alternatives
    raw_drugs = list(payload.drugs or [])
    if payload.drugA:
        raw_drugs.append(payload.drugA)
    if payload.drugB:
        raw_drugs.append(payload.drugB)
    out["alternatives"] = get_alternatives(raw_drugs)

    history_row = AnalysisHistory(
        drug_a=payload.drugA or (payload.drugs[0] if payload.drugs else None),
        drug_b=payload.drugB or (payload.drugs[1] if payload.drugs and len(payload.drugs) > 1 else None),
        severity=out.get("severity", "unknown"),
        risk_score=out.get("riskScore"),
        explanation=out.get("explanation"),
        sources=out.get("sources"),
    )
    db.add(history_row)
    db.commit()
    return AnalyzeResponse(**out)
