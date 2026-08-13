"""Topic ORM model."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.meeting import Meeting


class Topic(Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    start_time: Mapped[float] = mapped_column(Float, nullable=False)  # seconds from meeting start

    # Relationships
    meeting: Mapped[Meeting] = relationship("Meeting", back_populates="topics")
