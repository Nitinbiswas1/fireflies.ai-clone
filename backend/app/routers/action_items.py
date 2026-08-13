"""Action items router."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.schemas.action_item import ActionItemCreate, ActionItemResponse, ActionItemUpdate

router = APIRouter(tags=["action-items"])


def _get_action_or_404(db: Session, action_id: int) -> ActionItem:
    action = (
        db.query(ActionItem)
        .options(joinedload(ActionItem.assignee))
        .filter(ActionItem.id == action_id)
        .first()
    )
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
    return action


def _assert_meeting_exists(db: Session, meeting_id: int) -> None:
    if not db.query(Meeting).filter(Meeting.id == meeting_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")


# ---------------------------------------------------------------------------
# GET /api/meetings/{meeting_id}/actions
# ---------------------------------------------------------------------------

@router.get("/api/meetings/{meeting_id}/actions", response_model=list[ActionItemResponse])
def list_actions(meeting_id: int, db: Session = Depends(get_db)):
    _assert_meeting_exists(db, meeting_id)
    return (
        db.query(ActionItem)
        .options(joinedload(ActionItem.assignee))
        .filter(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.created_at)
        .all()
    )


# ---------------------------------------------------------------------------
# POST /api/meetings/{meeting_id}/actions
# ---------------------------------------------------------------------------

@router.post(
    "/api/meetings/{meeting_id}/actions",
    response_model=ActionItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_action(
    meeting_id: int, payload: ActionItemCreate, db: Session = Depends(get_db)
):
    _assert_meeting_exists(db, meeting_id)
    now = datetime.now(timezone.utc)
    action = ActionItem(
        meeting_id=meeting_id,
        title=payload.title,
        description=payload.description,
        assignee_id=payload.assignee_id,
        due_date=payload.due_date,
        completed=payload.completed,
        created_at=now,
        updated_at=now,
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return _get_action_or_404(db, action.id)


# ---------------------------------------------------------------------------
# PATCH /api/actions/{action_id}
# ---------------------------------------------------------------------------

@router.patch("/api/actions/{action_id}", response_model=ActionItemResponse)
def update_action(action_id: int, payload: ActionItemUpdate, db: Session = Depends(get_db)):
    action = _get_action_or_404(db, action_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(action, field, value)
    action.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(action)
    return _get_action_or_404(db, action.id)


# ---------------------------------------------------------------------------
# DELETE /api/actions/{action_id}
# ---------------------------------------------------------------------------

@router.delete("/api/actions/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action(action_id: int, db: Session = Depends(get_db)):
    action = _get_action_or_404(db, action_id)
    db.delete(action)
    db.commit()
