"""Lightweight clinician authentication using HMAC-signed tokens.

No external JWT libraries required — uses Python standard library only.
"""
import hmac
import hashlib
import base64
import json
import os
import time
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Secret key — in production load from env var
SECRET_KEY = os.getenv("AUTH_SECRET", "mediguard-secret-key-change-in-production-2024")

# Clinician registry — in production this would be a database table with hashed passwords
CLINICIANS = {
    "dr.sarah.chen@hospital.org": {
        "password": "password123",
        "name": "Dr. Sarah Chen",
        "role": "Doctor",
        "hospitalId": "8829",
    },
    "clinician@hospital.org": {
        "password": "clinician123",
        "name": "Dr. James Miller",
        "role": "Clinician",
        "hospitalId": "4421",
    },
    "admin@mediguard.ai": {
        "password": "admin123",
        "name": "Admin User",
        "role": "Admin",
        "hospitalId": "0001",
    },
}


def _sign(payload: dict) -> str:
    """Create a signed token string from a payload dict."""
    payload_json = json.dumps(payload, separators=(",", ":"))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode()
    sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def _verify(token: str) -> Optional[dict]:
    """Verify token signature and expiry; return payload dict or None."""
    try:
        payload_b64, sig = token.rsplit(".", 1)
    except ValueError:
        return None
    expected_sig = hmac.new(SECRET_KEY.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected_sig):
        return None
    try:
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "==").decode())
    except Exception:
        return None
    if payload.get("exp", 0) < time.time():
        return None
    return payload


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    name: str
    role: str
    hospitalId: str
    email: str


@router.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    clinician = CLINICIANS.get(body.email.lower().strip())
    if not clinician or clinician["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    payload = {
        "email": body.email,
        "name": clinician["name"],
        "role": clinician["role"],
        "hospitalId": clinician["hospitalId"],
        "exp": time.time() + 8 * 3600,  # 8-hour session
    }
    token = _sign(payload)
    return LoginResponse(
        token=token,
        name=clinician["name"],
        role=clinician["role"],
        hospitalId=clinician["hospitalId"],
        email=body.email,
    )


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """FastAPI dependency — extracts and validates the Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")
    token = authorization[7:]
    payload = _verify(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Session expired or invalid token. Please log in again.")
    return payload
