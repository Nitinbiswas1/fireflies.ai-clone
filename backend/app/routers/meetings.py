"""Meetings router — CRUD + search/pagination + transcript/summary sub-routes."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.schemas.chat import ChatPayload, ChatResponse
from app.schemas.meeting import (
    MeetingCreate,
    MeetingListPage,
    MeetingListResponse,
    MeetingResponse,
    MeetingUpdate,
)
from app.schemas.participant import ParticipantResponse
from app.schemas.summary import SummaryResponse
from app.schemas.transcript import TranscriptResponse, TranscriptSegmentResponse
from app.services.meeting_chat import (
    HuggingFaceModelNotFoundError,
    HuggingFaceNotConfiguredError,
    HuggingFaceUnavailableError,
    build_meeting_context,
    query_huggingface,
)
from app.services.summary_service import get_summary_by_meeting
from app.services.transcript_parser import get_segments_for_meeting

router = APIRouter(prefix="/api", tags=["meetings"])


# ---------------------------------------------------------------------------
# GET /api/participants
# ---------------------------------------------------------------------------

@router.get("/participants", response_model=list[ParticipantResponse], tags=["participants"])
def list_participants(db: Session = Depends(get_db)) -> list[ParticipantResponse]:
    """Return all participants ordered by name."""
    participants = db.query(Participant).order_by(Participant.name).all()
    return [ParticipantResponse.model_validate(p) for p in participants]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_meeting_or_404(db: Session, meeting_id: int) -> Meeting:
    meeting = (
        db.query(Meeting)
        .options(joinedload(Meeting.participants))
        .filter(Meeting.id == meeting_id)
        .first()
    )
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return meeting


# ---------------------------------------------------------------------------
# GET /api/topics
# ---------------------------------------------------------------------------

@router.get("/topics", response_model=list[str], tags=["topics"])
def list_topics(db: Session = Depends(get_db)) -> list[str]:
    """Return all unique topic names currently present in the database, sorted alphabetically."""
    from app.models.topic import Topic
    raw_topics = db.query(Topic.name).distinct().all()
    topic_names = sorted([t[0] for t in raw_topics if t[0]])
    return topic_names


# ---------------------------------------------------------------------------
# GET /api/meetings
# ---------------------------------------------------------------------------

@router.get("/meetings", response_model=MeetingListPage)
def list_meetings(
    search: str | None = Query(None, description="Search by title (case-insensitive)"),
    participant_id: int | None = Query(None, description="Filter by participant ID"),
    topics: str | None = Query(None, description="Comma-separated topic names to filter by"),
    sort: str = Query("recent", description="Sort order: 'recent' or 'oldest'"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> MeetingListPage:
    from app.models.topic import Topic
    q = db.query(Meeting).options(joinedload(Meeting.participants), joinedload(Meeting.topics))

    if search:
        q = q.filter(Meeting.title.ilike(f"%{search}%"))

    if participant_id is not None:
        q = q.filter(Meeting.participants.any(Participant.id == participant_id))

    if topics:
        topic_list = [t.strip() for t in topics.split(",") if t.strip()]
        if topic_list:
            q = q.filter(Meeting.topics.any(Topic.name.in_(topic_list)))

    total: int = q.with_entities(func.count(Meeting.id)).scalar() or 0

    if sort == "oldest":
        q = q.order_by(Meeting.meeting_date.asc())
    else:
        q = q.order_by(Meeting.meeting_date.desc())

    offset = (page - 1) * page_size
    orm_items = q.offset(offset).limit(page_size).all()

    items = [MeetingListResponse.model_validate(m) for m in orm_items]
    return MeetingListPage(total=total, page=page, page_size=page_size, items=items)


# ---------------------------------------------------------------------------
# GET /api/meetings/{meeting_id}
# ---------------------------------------------------------------------------

@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)) -> MeetingResponse:
    meeting = _get_meeting_or_404(db, meeting_id)
    return MeetingResponse.model_validate(meeting)


# ---------------------------------------------------------------------------
# POST /api/meetings
# ---------------------------------------------------------------------------

@router.post("/meetings", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)) -> MeetingResponse:
    now = datetime.now(timezone.utc)
    meeting = Meeting(
        title=payload.title,
        description=payload.description,
        meeting_date=payload.meeting_date,
        duration_seconds=payload.duration_seconds,
        created_at=now,
        updated_at=now,
    )
    db.add(meeting)
    db.flush()  # get meeting.id

    # Link participants if provided
    if payload.participant_ids:
        participants = db.query(Participant).filter(Participant.id.in_(payload.participant_ids)).all()
        meeting.participants.extend(participants)

    # Optionally process transcript immediately
    if payload.transcript_text and payload.transcript_text.strip():
        from app.services.meeting_processor import process_meeting
        process_meeting(db, meeting, payload.transcript_text)
    else:
        db.commit()

    db.refresh(meeting)
    return MeetingResponse.model_validate(_get_meeting_or_404(db, meeting.id))


# ---------------------------------------------------------------------------
# PATCH /api/meetings/{meeting_id}
# ---------------------------------------------------------------------------

@router.patch("/meetings/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: int, payload: MeetingUpdate, db: Session = Depends(get_db)
) -> MeetingResponse:
    meeting = _get_meeting_or_404(db, meeting_id)
    update_data = payload.model_dump(exclude_unset=True)

    # Handle participant_ids separately
    participant_ids = update_data.pop("participant_ids", None)

    for field, value in update_data.items():
        setattr(meeting, field, value)
    meeting.updated_at = datetime.now(timezone.utc)

    # Sync participants if provided
    if participant_ids is not None:
        participants = db.query(Participant).filter(Participant.id.in_(participant_ids)).all()
        meeting.participants = participants

    db.commit()
    db.refresh(meeting)
    return MeetingResponse.model_validate(_get_meeting_or_404(db, meeting_id))


# ---------------------------------------------------------------------------
# DELETE /api/meetings/{meeting_id}
# ---------------------------------------------------------------------------

@router.delete("/meetings/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)) -> None:
    meeting = _get_meeting_or_404(db, meeting_id)
    db.delete(meeting)
    db.commit()


# ---------------------------------------------------------------------------
# GET /api/meetings/{meeting_id}/transcript
# ---------------------------------------------------------------------------

@router.get("/meetings/{meeting_id}/transcript", response_model=TranscriptResponse)
def get_transcript(meeting_id: int, db: Session = Depends(get_db)) -> TranscriptResponse:
    _get_meeting_or_404(db, meeting_id)
    orm_segments = get_segments_for_meeting(db, meeting_id)
    segments = [TranscriptSegmentResponse.model_validate(s) for s in orm_segments]
    return TranscriptResponse(meeting_id=meeting_id, segments=segments)


# ---------------------------------------------------------------------------
# GET /api/meetings/{meeting_id}/summary
# ---------------------------------------------------------------------------

@router.get("/meetings/{meeting_id}/summary", response_model=SummaryResponse)
def get_summary(meeting_id: int, db: Session = Depends(get_db)) -> SummaryResponse:
    _get_meeting_or_404(db, meeting_id)
    summary = get_summary_by_meeting(db, meeting_id)
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    return SummaryResponse.model_validate(summary)


# ---------------------------------------------------------------------------
# POST /api/meetings/{meeting_id}/process
# ---------------------------------------------------------------------------

class ProcessPayload(BaseModel):
    transcript_text: str | None = None


@router.post("/meetings/{meeting_id}/process", response_model=MeetingResponse)
def process_meeting_endpoint(
    meeting_id: int,
    payload: ProcessPayload | None = None,
    db: Session = Depends(get_db),
) -> MeetingResponse:
    """Parse *transcript_text* and run the mock AI pipeline for a meeting.

    If transcript_text is provided, parses it into new TranscriptSegment records
    and generates AI insights. If transcript_text is omitted or empty, re-processes
    the meeting's existing TranscriptSegment records.
    """
    meeting = _get_meeting_or_404(db, meeting_id)
    raw_text = payload.transcript_text if payload else None

    try:
        from app.services.meeting_processor import process_meeting, reprocess_meeting
        if raw_text and raw_text.strip():
            process_meeting(db, meeting, raw_text)
        else:
            reprocess_meeting(db, meeting)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {exc}",
        ) from exc
    return MeetingResponse.model_validate(_get_meeting_or_404(db, meeting_id))


# ---------------------------------------------------------------------------
# POST /api/meetings/{meeting_id}/chat
# ---------------------------------------------------------------------------

@router.post("/meetings/{meeting_id}/chat", response_model=ChatResponse)
def chat_meeting_endpoint(
    meeting_id: int,
    payload: ChatPayload,
    db: Session = Depends(get_db),
) -> ChatResponse:
    """Answer questions about a meeting using Hugging Face Inference Providers."""
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message must not be empty",
        )

    meeting = _get_meeting_or_404(db, meeting_id)

    # Check if meeting has content (transcript segments or summary)
    context_text = build_meeting_context(db, meeting)
    if "TRANSCRIPT SEGMENTS:" not in context_text and "OVERVIEW:" not in context_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="This meeting doesn't have enough content for AI questions yet. Add and process a transcript first.",
        )

    try:
        answer = query_huggingface(context_text, payload.message.strip(), payload.history)
    except HuggingFaceNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI assistant is not configured.",
        ) from exc
    except HuggingFaceModelNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI model is currently unavailable. Check the Hugging Face model configuration.",
        ) from exc
    except HuggingFaceUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI assistant is temporarily unavailable. Please try again.",
        ) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected server error.",
        ) from exc

    return ChatResponse(answer=answer, meeting_id=meeting_id)

