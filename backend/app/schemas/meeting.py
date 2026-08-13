"""Meeting Pydantic schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from app.schemas.topic import TopicResponse

from app.schemas.participant import ParticipantResponse


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=512)
    description: str | None = None
    meeting_date: datetime
    duration_seconds: int | None = Field(None, ge=0)
    participant_ids: list[int] = Field(default_factory=list)
    transcript_text: str | None = None


class MeetingUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=512)
    description: str | None = None
    meeting_date: datetime | None = None
    duration_seconds: int | None = Field(None, ge=0)
    participant_ids: list[int] | None = None


"""class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    meeting_date: datetime
    duration_seconds: int | None = None
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantResponse] = []"""
class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    meeting_date: datetime
    duration_seconds: int | None = None
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantResponse] = Field(default_factory=list)
    topics: list[TopicResponse] = Field(default_factory=list)


class MeetingListResponse(BaseModel):
    """Lightweight version used in list endpoints (no nested segments/summary)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    meeting_date: datetime
    duration_seconds: int | None = None
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantResponse] = []


class MeetingListPage(BaseModel):
    """Paginated meeting list."""

    total: int
    page: int
    page_size: int
    items: list[MeetingListResponse]
