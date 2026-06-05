import os
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import declarative_base, sessionmaker

# Phase 8 — PostgreSQL support
# Set DATABASE_URL env var to a postgres:// connection string for production.
# Falls back to SQLite for local development when env var is not set.
_raw_url = os.getenv("DATABASE_URL", "sqlite:///./analysis_history.db")

# Heroku / Railway export postgres:// but SQLAlchemy 1.4+ requires postgresql://
if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = _raw_url
_is_sqlite = DATABASE_URL.startswith("sqlite")

_connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def initialize_database() -> None:
    from .analysis_history import AnalysisHistory  # noqa: F401

    expected_columns = {
        "id", "drug_a", "drug_b", "severity",
        "risk_score", "sources", "explanation", "created_at",
    }

    inspector = inspect(engine)
    if inspector.has_table(AnalysisHistory.__tablename__):
        existing_columns = {col["name"] for col in inspector.get_columns(AnalysisHistory.__tablename__)}
        if existing_columns != expected_columns:
            Base.metadata.drop_all(bind=engine, tables=[AnalysisHistory.__table__])

    Base.metadata.create_all(bind=engine)
    db_type = "SQLite" if _is_sqlite else "PostgreSQL"
    print(f"[MediGuard] Database initialised ({db_type}): {DATABASE_URL[:60]}...")