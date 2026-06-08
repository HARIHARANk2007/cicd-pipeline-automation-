from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import analyze, history, drugs, auth, explain
from .models.database import initialize_database

app = FastAPI(title="MediGuard AI Backend")

import os

allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_str:
    origins = [o.strip() for o in allowed_origins_str.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://mediguard-ai-one.vercel.app",
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(drugs.router, prefix="/api")
app.include_router(explain.router, prefix="/api")

initialize_database()


@app.get("/health")
async def health():
    return {"status": "ok"}
