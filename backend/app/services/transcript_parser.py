"""Transcript query helpers."""

from __future__ import annotations

from sqlalchemy.orm import Session, joinedload

from app.models.transcript import TranscriptSegment


def get_segments_for_meeting(db: Session, meeting_id: int) -> list[TranscriptSegment]:
    return (
        db.query(TranscriptSegment)
        .options(joinedload(TranscriptSegment.speaker))
        .filter(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.sequence)
        .all()
    )
