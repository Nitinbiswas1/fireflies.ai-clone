"""Participant Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, HttpUrl


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    avatar_url: str | None = None
