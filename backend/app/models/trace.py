from datetime import datetime, timezone
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


TraceStatus = Literal["success", "warning", "failed"]


class MongoFriendlyModel(BaseModel):
    """Base settings shared by storage-backed models."""

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={datetime: lambda value: value.isoformat()},
    )


class StepSchema(MongoFriendlyModel):
    step_id: str
    tool_name: str
    input: dict[str, Any] = Field(default_factory=dict)
    output: dict[str, Any] = Field(default_factory=dict)
    duration: float
    success: bool
    timestamp: datetime = Field(default_factory=_utcnow)

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, value: float) -> float:
        if value < 0:
            raise ValueError("duration must be greater than or equal to 0")
        return value


class TraceSchema(MongoFriendlyModel):
    trace_id: str
    prompt: str
    response: Optional[str] = None
    latency: float
    token_count: int
    model_name: Optional[str] = None
    project_id: str = "default"
    project_name: Optional[str] = None
    api_key: Optional[str] = None
    environment: str = "development"
    status: TraceStatus
    steps: list[StepSchema] = Field(default_factory=list)
    retry_count: int = 0
    slow_request: bool = False
    failure_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)

    @field_validator("latency")
    @classmethod
    def validate_latency(cls, value: float) -> float:
        if value < 0:
            raise ValueError("latency must be greater than or equal to 0")
        return value

    @field_validator("token_count", "retry_count")
    @classmethod
    def validate_non_negative_ints(cls, value: int) -> int:
        if value < 0:
            raise ValueError("value must be greater than or equal to 0")
        return value
