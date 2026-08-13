"""Global search router for querying across all meetings, transcripts, summaries, and action items."""

from __future__ import annotations

import json
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting, MeetingParticipant
from app.models.participant import Participant
from app.models.summary import Summary
from app.models.transcript import TranscriptSegment
from app.schemas.search import GlobalSearchResponse, SearchResultItem

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search", response_model=GlobalSearchResponse)
def global_search(
    q: str = Query(..., description="Search query string"),
    db: Session = Depends(get_db),
) -> GlobalSearchResponse:
    """Global search across titles, descriptions, participants, transcripts, summaries, and action items."""
    query_str = q.strip()
    if not query_str:
        return GlobalSearchResponse(query="", total=0, results=[])

    search_term = f"%{query_str}%"
    results: List[SearchResultItem] = []
    seen_keys = set()

    # 1. Search Transcript Segments (highest specificity)
    transcript_matches = (
        db.query(TranscriptSegment)
        .join(Meeting, TranscriptSegment.meeting_id == Meeting.id)
        .outerjoin(Participant, TranscriptSegment.participant_id == Participant.id)
        .filter(TranscriptSegment.text.ilike(search_term))
        .options(
            joinedload(TranscriptSegment.speaker),
            joinedload(TranscriptSegment.meeting),
        )
        .order_by(Meeting.meeting_date.desc(), TranscriptSegment.start_time.asc())
        .limit(30)
        .all()
    )

    for seg in transcript_matches:
        if not seg.meeting:
            continue
        key = f"transcript-{seg.id}"
        if key in seen_keys:
            continue
        seen_keys.add(key)
        results.append(
            SearchResultItem(
                meeting_id=seg.meeting_id,
                meeting_title=seg.meeting.title,
                meeting_date=seg.meeting.meeting_date,
                match_type="transcript",
                speaker=seg.speaker.name if seg.speaker else "Unknown",
                timestamp=seg.start_time,
                text=seg.text,
            )
        )

    # 2. Search Meeting Titles and Descriptions
    meeting_matches = (
        db.query(Meeting)
        .filter(
            or_(
                Meeting.title.ilike(search_term),
                Meeting.description.ilike(search_term),
            )
        )
        .order_by(Meeting.meeting_date.desc())
        .limit(15)
        .all()
    )

    for m in meeting_matches:
        key = f"meeting-{m.id}"
        if key in seen_keys:
            continue
        seen_keys.add(key)
        match_type = "title" if query_str.lower() in m.title.lower() else "description"
        results.append(
            SearchResultItem(
                meeting_id=m.id,
                meeting_title=m.title,
                meeting_date=m.meeting_date,
                match_type=match_type,
                speaker=None,
                timestamp=None,
                text=m.description or m.title,
            )
        )

    # 3. Search Participants
    participant_matches = (
        db.query(Meeting)
        .join(Meeting.participants)
        .filter(Participant.name.ilike(search_term))
        .order_by(Meeting.meeting_date.desc())
        .limit(15)
        .all()
    )

    for m in participant_matches:
        key = f"participant-{m.id}"
        if key in seen_keys:
            continue
        seen_keys.add(key)
        results.append(
            SearchResultItem(
                meeting_id=m.id,
                meeting_title=m.title,
                meeting_date=m.meeting_date,
                match_type="participant",
                speaker=None,
                timestamp=None,
                text=f"Participant name matched: {m.title}",
            )
        )

    # 4. Search Summaries (Overview & Key Points)
    summary_matches = (
        db.query(Summary)
        .join(Meeting, Summary.meeting_id == Meeting.id)
        .filter(
            or_(
                Summary.overview.ilike(search_term),
                Summary.key_points.ilike(search_term),
            )
        )
        .options(joinedload(Summary.meeting))
        .order_by(Meeting.meeting_date.desc())
        .limit(15)
        .all()
    )

    for s in summary_matches:
        if not s.meeting:
            continue
        key = f"summary-{s.meeting_id}"
        if key in seen_keys:
            continue
        seen_keys.add(key)

        matched_text = s.overview or s.meeting.title
        match_type = "summary"
        if s.key_points:
            try:
                kp_list = json.loads(s.key_points)
                if isinstance(kp_list, list):
                    for kp in kp_list:
                        if query_str.lower() in str(kp).lower():
                            matched_text = str(kp)
                            match_type = "key_point"
                            break
            except Exception:
                pass

        results.append(
            SearchResultItem(
                meeting_id=s.meeting_id,
                meeting_title=s.meeting.title,
                meeting_date=s.meeting.meeting_date,
                match_type=match_type,
                speaker=None,
                timestamp=None,
                text=matched_text,
            )
        )

    # 5. Search Action Items
    action_matches = (
        db.query(ActionItem)
        .join(Meeting, ActionItem.meeting_id == Meeting.id)
        .filter(ActionItem.description.ilike(search_term))
        .options(joinedload(ActionItem.meeting))
        .order_by(Meeting.meeting_date.desc())
        .limit(15)
        .all()
    )

    for act in action_matches:
        if not act.meeting:
            continue
        key = f"action-{act.id}"
        if key in seen_keys:
            continue
        seen_keys.add(key)
        results.append(
            SearchResultItem(
                meeting_id=act.meeting_id,
                meeting_title=act.meeting.title,
                meeting_date=act.meeting.meeting_date,
                match_type="action_item",
                speaker=None,
                timestamp=None,
                text=act.description,
            )
        )

    return GlobalSearchResponse(
        query=query_str,
        total=len(results),
        results=results,
    )
