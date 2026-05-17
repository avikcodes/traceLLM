from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MongoFriendlyModel(BaseModel):
    """
    Shared base model with settings that work well when saving or
    reading documents for MongoDB-based apps.
    """

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={datetime: lambda value: value.isoformat()},
    )


class StepSchema(MongoFriendlyModel):
    step_type: str
    tool_name: Optional[str] = None
    input_data: Optional[dict] = None
    output_data: Optional[dict] = None
    duration: float
    success: bool

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, value: float) -> float:
        if value < 0:
            raise ValueError("duration must be greater than or equal to 0")
        return value


class TraceSchema(MongoFriendlyModel):
    prompt: str
    response: Optional[str] = None
    latency: float
    token_count: int
    model_name: Optional[str] = None
    status: str
    steps: List[StepSchema] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("latency")
    @classmethod
    def validate_latency(cls, value: float) -> float:
        if value < 0:
            raise ValueError("latency must be greater than or equal to 0")
        return value

    @field_validator("token_count")
    @classmethod
    def validate_token_count(cls, value: int) -> int:
        if value < 0:
            raise ValueError("token_count must be greater than or equal to 0")
        return value
