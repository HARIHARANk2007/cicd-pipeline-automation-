from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..models.analysis_history import AnalysisHistory
from ..models.database import SessionLocal
from .auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/history")
async def get_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    rows = db.query(AnalysisHistory).order_by(AnalysisHistory.created_at.desc()).all()
    return [
        {
            "drugA": row.drug_a,
            "drugB": row.drug_b,
            "severity": row.severity,
            "riskScore": row.risk_score,
            "explanation": row.explanation,
            "sources": row.sources,
            "createdAt": row.created_at.isoformat() if row.created_at is not None else None,
        }
        for row in rows
    ]