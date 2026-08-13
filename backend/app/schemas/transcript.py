"""TranscriptSegment Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from app.schemas.participant import ParticipantResponse


class TranscriptSegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    participant_id: int | None = None
    start_time: float
    end_time: float
    text: str
    sequence: int
    speaker: ParticipantResponse | None = None


class TranscriptResponse(BaseModel):
    meeting_id: int
    segments: list[TranscriptSegmentResponse]
