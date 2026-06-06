from pydantic import BaseModel, ConfigDict, Field


class EventTypeReadResponse(BaseModel):
    """Response schema for reading the EventType entity."""

    id: str
    title: str
    description: str
    duration_minutes: int = Field(alias="durationMinutes", ge=1)

    model_config = ConfigDict(populate_by_name=True)
