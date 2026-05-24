from datetime import datetime
from typing import Literal

from pydantic import Field

from app.models.trace import MongoFriendlyModel


EnvironmentLiteral = Literal["development", "staging", "production"]


class ProjectSchema(MongoFriendlyModel):
    project_id: str
    name: str
    description: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ApiKeySchema(MongoFriendlyModel):
    key: str
    project_id: str
    environment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProjectCreateResponse(MongoFriendlyModel):
    project: ProjectSchema
    api_key: ApiKeySchema
