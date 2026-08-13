"""Summary service — query helpers."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.summary import Summary


def get_summary_by_meeting(db: Session, meeting_id: int) -> Summary | None:
    return db.query(Summary).filter(Summary.meeting_id == meeting_id).first()
