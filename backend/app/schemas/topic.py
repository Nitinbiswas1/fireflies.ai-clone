"""Topic Pydantic schemas."""

from pydantic import BaseModel, ConfigDict


class TopicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    name: str
    start_time: float