"""Summary Pydantic schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    overview: str | None = None
    key_points: list[str] | None = None  # stored as JSON array
    created_at: datetime
    updated_at: datetime
