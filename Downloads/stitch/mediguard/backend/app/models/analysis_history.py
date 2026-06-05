from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, JSON, Text

from .database import Base


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    drug_a = Column(String(255), nullable=True)
    drug_b = Column(String(255), nullable=True)
    severity = Column(String(50), nullable=False)
    risk_score = Column(Integer, nullable=True)
    sources = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)