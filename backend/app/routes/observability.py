from fastapi import APIRouter, Query

from app.database.trace_service import get_analytics, get_failures, get_trace_by_id, list_traces
from app.models.trace import TraceSchema
from app.models.trace_model import AnalyticsResponse, FailureResponse, TraceFilters, TraceListResponse

router = APIRouter()


@router.get("/traces", response_model=TraceListResponse)
async def get_traces(
    latency_min: float | None = Query(default=None, ge=0),
    latency_max: float | None = Query(default=None, ge=0),
    status: str | None = Query(default=None),
    model: str | None = Query(default=None),
    project_id: str | None = Query(default=None),
    environment: str | None = Query(default=None),
    token_min: int | None = Query(default=None, ge=0),
    token_max: int | None = Query(default=None, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
) -> TraceListResponse:
    filters = TraceFilters(
        latency_min=latency_min,
        latency_max=latency_max,
        status=status,
        model=model,
        project_id=project_id,
        environment=environment,
        token_min=token_min,
        token_max=token_max,
        limit=limit,
    )
    return await list_traces(filters)


@router.get("/traces/{trace_id}", response_model=TraceSchema)
async def get_trace(trace_id: str) -> TraceSchema:
    return await get_trace_by_id(trace_id)


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(
    project_id: str | None = Query(default=None),
    environment: str | None = Query(default=None),
) -> AnalyticsResponse:
    return await get_analytics(
        TraceFilters(project_id=project_id, environment=environment)
    )


@router.get("/failures", response_model=FailureResponse)
async def failures(
    limit: int = Query(default=25, ge=1, le=100),
    project_id: str | None = Query(default=None),
    environment: str | None = Query(default=None),
) -> FailureResponse:
    return await get_failures(
        limit=limit,
        filters=TraceFilters(limit=limit, project_id=project_id, environment=environment),
    )
