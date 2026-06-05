from pydantic import BaseModel
from typing import List, Optional


class SourceItem(BaseModel):
    drug: str
    section: str


class AnalyzeRequest(BaseModel):
    # Accept either a list of `drugs` or individual `drugA`/`drugB` fields for convenience.
    drugs: Optional[List[str]] = None
    drugA: Optional[str] = None
    drugB: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    kidney: Optional[str] = None
    liver: Optional[str] = None
    pregnancy: Optional[bool] = False
    pediatric: Optional[bool] = False
    geriatric: Optional[bool] = False


class AnalyzeResponse(BaseModel):
    severity: str
    message: str
    riskScore: Optional[int] = None
    explanation: Optional[str] = None
    sources: Optional[List[SourceItem]] = None
    alternatives: Optional[List[str]] = None
