"""FastAPI application entry point."""

from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env relative to the backend project directory
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)
else:
    load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import action_items, meetings, search

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Fireflies Meeting Notes API",
    description="Meeting transcription, summaries, and action item tracking.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
_origins = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(meetings.router)
app.include_router(action_items.router)
app.include_router(search.router)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "service": "fireflies-api", "version": "1.0.0"}
