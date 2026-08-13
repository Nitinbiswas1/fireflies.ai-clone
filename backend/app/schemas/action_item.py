"""ActionItem Pydantic schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.participant import ParticipantResponse


class ActionItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=512)
    description: str | None = None
    assignee_id: int | None = None
    due_date: datetime | None = None
    completed: bool = False


class ActionItemUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=512)
    description: str | None = None
    assignee_id: int | None = None
    due_date: datetime | None = None
    completed: bool | None = None


class ActionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    title: str
    description: str | None = None
    assignee_id: int | None = None
    due_date: datetime | None = None
    completed: bool
    created_at: datetime
    updated_at: datetime
    assignee: ParticipantResponse | None = None
