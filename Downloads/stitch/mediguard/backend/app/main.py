from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import analyze, history, drugs, auth, explain
from .models.database import initialize_database

app = FastAPI(title="MediGuard AI Backend")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
