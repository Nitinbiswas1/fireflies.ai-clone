"""TranscriptSegment ORM model."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.meeting import Meeting
    from app.models.participant import Participant


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    participant_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("participants.id", ondelete="SET NULL"), nullable=True, index=True
    )
    start_time: Mapped[float] = mapped_column(Float, nullable=False)  # seconds from start
    end_time: Mapped[float] = mapped_column(Float, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)  # ordering within meeting

    # Relationships
    meeting: Mapped[Meeting] = relationship(
        "Meeting", back_populates="transcript_segments"
    )
    speaker: Mapped[Participant | None] = relationship(
        "Participant", back_populates="transcript_segments"
    )
