"""Participant ORM model."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.action_item import ActionItem
    from app.models.meeting import Meeting
    from app.models.transcript import TranscriptSegment


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships (back-populated from other models)
    meetings: Mapped[list[Meeting]] = relationship(
        "Meeting",
        secondary="meeting_participants",
        back_populates="participants",
    )
    transcript_segments: Mapped[list[TranscriptSegment]] = relationship(
        "TranscriptSegment", back_populates="speaker", cascade="all, delete-orphan"
    )
    assigned_actions: Mapped[list[ActionItem]] = relationship(
        "ActionItem", back_populates="assignee"
    )
