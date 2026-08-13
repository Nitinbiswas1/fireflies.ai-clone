"""Initial schema — all tables.

Revision ID: 0001
Revises:
Create Date: 2026-08-13
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # participants
    # ------------------------------------------------------------------
    op.create_table(
        "participants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.String(1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_participants_id", "participants", ["id"])
    op.create_index("ix_participants_email", "participants", ["email"], unique=True)

    # ------------------------------------------------------------------
    # meetings
    # ------------------------------------------------------------------
    op.create_table(
        "meetings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("meeting_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_meetings_id", "meetings", ["id"])
    op.create_index("ix_meetings_title", "meetings", ["title"])
    op.create_index("ix_meetings_meeting_date", "meetings", ["meeting_date"])

    # ------------------------------------------------------------------
    # meeting_participants (association table)
    # ------------------------------------------------------------------
    op.create_table(
        "meeting_participants",
        sa.Column("meeting_id", sa.Integer(), nullable=False),
        sa.Column("participant_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["meeting_id"], ["meetings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["participant_id"], ["participants.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("meeting_id", "participant_id"),
        sa.UniqueConstraint("meeting_id", "participant_id", name="uq_meeting_participant"),
    )

    # ------------------------------------------------------------------
    # transcript_segments
    # ------------------------------------------------------------------
    op.create_table(
        "transcript_segments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("meeting_id", sa.Integer(), nullable=False),
        sa.Column("participant_id", sa.Integer(), nullable=True),
        sa.Column("start_time", sa.Float(), nullable=False),
        sa.Column("end_time", sa.Float(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["meeting_id"], ["meetings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["participant_id"], ["participants.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_transcript_segments_id", "transcript_segments", ["id"])
    op.create_index("ix_transcript_segments_meeting_id", "transcript_segments", ["meeting_id"])
    op.create_index("ix_transcript_segments_participant_id", "transcript_segments", ["participant_id"])

    # ------------------------------------------------------------------
    # summaries
    # ------------------------------------------------------------------
    op.create_table(
        "summaries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("meeting_id", sa.Integer(), nullable=False),
        sa.Column("overview", sa.Text(), nullable=True),
        sa.Column("key_points", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["meeting_id"], ["meetings.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("meeting_id"),
    )
    op.create_index("ix_summaries_id", "summaries", ["id"])
    op.create_index("ix_summaries_meeting_id", "summaries", ["meeting_id"])

    # ------------------------------------------------------------------
    # action_items
    # ------------------------------------------------------------------
    op.create_table(
        "action_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("meeting_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("assignee_id", sa.Integer(), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["meeting_id"], ["meetings.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assignee_id"], ["participants.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_action_items_id", "action_items", ["id"])
    op.create_index("ix_action_items_meeting_id", "action_items", ["meeting_id"])
    op.create_index("ix_action_items_assignee_id", "action_items", ["assignee_id"])

    # ------------------------------------------------------------------
    # topics
    # ------------------------------------------------------------------
    op.create_table(
        "topics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("meeting_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(512), nullable=False),
        sa.Column("start_time", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["meeting_id"], ["meetings.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_topics_id", "topics", ["id"])
    op.create_index("ix_topics_meeting_id", "topics", ["meeting_id"])


def downgrade() -> None:
    op.drop_table("topics")
    op.drop_table("action_items")
    op.drop_table("summaries")
    op.drop_table("transcript_segments")
    op.drop_table("meeting_participants")
    op.drop_table("meetings")
    op.drop_table("participants")
