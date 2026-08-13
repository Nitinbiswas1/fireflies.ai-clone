"""Schemas for Global Workspace Search."""

from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SearchResultItem(BaseModel):
    meeting_id: int
    meeting_title: str
    meeting_date: datetime
    match_type: str  # "title", "description", "participant", "transcript", "summary", "key_point", "action_item"
    speaker: Optional[str] = None
    timestamp: Optional[float] = None
    text: str


class GlobalSearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResultItem]
