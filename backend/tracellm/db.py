import asyncio
from typing import Any

from app.database.project_service import create_project, get_project_by_api_key, list_projects
from app.database.trace_service import get_trace_by_id, list_traces, save_trace, save_trace_sync
from app.models.project import ApiKeySchema, ProjectCreateResponse, ProjectSchema
from app.models.trace import TraceSchema
from app.models.trace_model import TraceFilters


def save_trace_payload(trace_data: dict[str, Any]) -> None:
    save_trace_sync(trace_data)


async def save_trace_payload_async(trace_data: dict[str, Any]) -> dict[str, Any]:
    return await save_trace(trace_data)


def fetch_trace(trace_id: str) -> TraceSchema:
    return asyncio.run(get_trace_by_id(trace_id))


def fetch_recent_traces(limit: int = 100) -> list[TraceSchema]:
    response = asyncio.run(list_traces(TraceFilters(limit=limit)))
    return response.items


def create_project_with_key(name: str, description: str, environment: str) -> ProjectCreateResponse:
    return asyncio.run(create_project(name=name, description=description, environment=environment))


def fetch_projects() -> list[ProjectSchema]:
    return asyncio.run(list_projects())


def resolve_api_key(api_key: str) -> ApiKeySchema:
    return asyncio.run(get_project_by_api_key(api_key))
