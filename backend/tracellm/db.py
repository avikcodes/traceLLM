"""Database helpers with persistent async lifecycle management."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, TypeVar

from app.database.project_service import create_project, get_project_by_api_key, list_projects
from app.database.trace_service import get_trace_by_id, list_traces, save_trace, save_trace_sync
from app.models.project import ApiKeySchema, ProjectCreateResponse, ProjectSchema
from app.models.trace import TraceSchema
from app.models.trace_model import TraceFilters

logger = logging.getLogger(__name__)

T = TypeVar("T")

_ASYNC_LOOP: asyncio.AbstractEventLoop | None = None


def _run_async(coro: Any) -> T:
    """Run a coroutine synchronously using a persistent event loop.

    Unlike ``asyncio.run()`` this does **not** close the loop after the
    coroutine completes, which avoids “event loop is closed” errors when
    Motor / MongoDB background tasks reference the loop.
    """
    global _ASYNC_LOOP

    # If an event loop is already running (e.g. inside FastAPI / uvicorn),
    # schedule on that loop instead.
    try:
        running = asyncio.get_running_loop()
        if running.is_running():
            future = asyncio.run_coroutine_threadsafe(coro, running)
            return future.result()
    except RuntimeError:
        pass

    # Reuse or create a persistent loop for synchronous callers (CLI).
    if _ASYNC_LOOP is None or _ASYNC_LOOP.is_closed():
        _ASYNC_LOOP = asyncio.new_event_loop()
        asyncio.set_event_loop(_ASYNC_LOOP)

    return _ASYNC_LOOP.run_until_complete(coro)


def save_trace_payload(trace_data: dict[str, Any]) -> None:
    save_trace_sync(trace_data)


async def save_trace_payload_async(trace_data: dict[str, Any]) -> dict[str, Any]:
    return await save_trace(trace_data)


def fetch_trace(trace_id: str) -> TraceSchema:
    return _run_async(get_trace_by_id(trace_id))


def fetch_recent_traces(limit: int = 100) -> list[TraceSchema]:
    response = _run_async(list_traces(TraceFilters(limit=limit)))
    return response.items


def create_project_with_key(name: str, description: str, environment: str) -> ProjectCreateResponse:
    return _run_async(create_project(name=name, description=description, environment=environment))


def fetch_projects() -> list[ProjectSchema]:
    return _run_async(list_projects())


def resolve_api_key(api_key: str) -> ApiKeySchema:
    return _run_async(get_project_by_api_key(api_key))
