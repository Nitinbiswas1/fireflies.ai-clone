"""Meeting and MeetingParticipant ORM models."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.action_item import ActionItem
    from app.models.participant import Participant
    from app.models.summary import Summary
    from app.models.topic import Topic
    from app.models.transcript import TranscriptSegment


class MeetingParticipant(Base):
    """Association table between Meeting and Participant."""

    __tablename__ = "meeting_participants"
    __table_args__ = (
        UniqueConstraint("meeting_id", "participant_id", name="uq_meeting_participant"),
    )

    meeting_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True
    )
    participant_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("participants.id", ondelete="CASCADE"), primary_key=True
    )


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    meeting_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    participants: Mapped[list[Participant]] = relationship(
        "Participant",
        secondary="meeting_participants",
        back_populates="meetings",
    )
    transcript_segments: Mapped[list[TranscriptSegment]] = relationship(
        "TranscriptSegment",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.sequence",
    )
    summary: Mapped[Summary | None] = relationship(
        "Summary", back_populates="meeting", cascade="all, delete-orphan", uselist=False
    )
    action_items: Mapped[list[ActionItem]] = relationship(
        "ActionItem", back_populates="meeting", cascade="all, delete-orphan"
    )
    topics: Mapped[list[Topic]] = relationship(
        "Topic",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Topic.start_time",
    )
