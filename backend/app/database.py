"""Database configuration and session management."""

from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ---------------------------------------------------------------------------
# Resolve database path
# ---------------------------------------------------------------------------
# When the app (or alembic) is run from backend/, the DB lands at
# backend/meeting.db — the same dir as alembic.ini.
# If DATABASE_URL is set in the environment it takes precedence.
# ---------------------------------------------------------------------------

_BASE_DIR = Path(__file__).resolve().parent.parent  # .../backend/
_DEFAULT_DB_PATH = _BASE_DIR / "meeting.db"
_DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB_PATH}")

engine = create_engine(
    _DATABASE_URL,
    connect_args={"check_same_thread": False},  # required for SQLite + FastAPI
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------


def get_db():
    """Yield a database session; close on exit."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
