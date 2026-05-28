from datetime import datetime, timezone
from typing import Literal

from pydantic import Field

from app.models.trace import MongoFriendlyModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


EnvironmentLiteral = Literal["development", "staging", "production"]


class ProjectSchema(MongoFriendlyModel):
    project_id: str
    name: str
    description: str = ""
    created_at: datetime = Field(default_factory=_utcnow)


class ApiKeySchema(MongoFriendlyModel):
    key: str
    project_id: str
    environment: str
    created_at: datetime = Field(default_factory=_utcnow)


class ProjectCreateResponse(MongoFriendlyModel):
    project: ProjectSchema
    api_key: ApiKeySchema
