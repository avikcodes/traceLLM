from typing import Optional

from pydantic import BaseModel, Field

from app.models.trace import TraceSchema


class TraceListResponse(BaseModel):
    total: int
    items: list[TraceSchema]


class TraceFilters(BaseModel):
    latency_min: Optional[float] = None
    latency_max: Optional[float] = None
    status: Optional[str] = None
    model: Optional[str] = None
    project_id: Optional[str] = None
    environment: Optional[str] = None
    token_min: Optional[int] = None
    token_max: Optional[int] = None
    limit: int = Field(default=50, ge=1, le=200)


class AnalyticsSummary(BaseModel):
    total_traces: int
    success_rate: float
    average_latency: float
    p95_latency: float
    total_token_usage: int
    failed_traces: int
    warning_traces: int
    retries: int
    slow_requests: int


class AnalyticsChartPoint(BaseModel):
    label: str
    latency: float
    tokens: int
    traces: int


class AnalyticsBreakdownItem(BaseModel):
    key: str
    count: int


class AnalyticsResponse(BaseModel):
    summary: AnalyticsSummary
    charts: list[AnalyticsChartPoint]
    status_breakdown: list[AnalyticsBreakdownItem]
    model_breakdown: list[AnalyticsBreakdownItem]
    project_breakdown: list[AnalyticsBreakdownItem]
    recent_failures: list[TraceSchema]


class FailureResponse(BaseModel):
    failed_traces: list[TraceSchema]
    retries: list[TraceSchema]
    slow_requests: list[TraceSchema]
    totals: dict[str, int]
