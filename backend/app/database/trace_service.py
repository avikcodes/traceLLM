import asyncio
import logging
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from math import ceil
from typing import Any, Optional

from bson import ObjectId
from fastapi import HTTPException
from rich.console import Console

from app.database.mongodb import get_database_connection
from app.models.trace import StepSchema, TraceSchema
from app.models.trace_model import (
    AnalyticsBreakdownItem,
    AnalyticsChartPoint,
    AnalyticsResponse,
    AnalyticsSummary,
    FailureResponse,
    TraceFilters,
    TraceListResponse,
)
from app.websocket.socket import manager

console = Console()
logger = logging.getLogger(__name__)

COLLECTION_NAME = "traces"
SLOW_TRACE_THRESHOLD_MS = 1500.0


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _coerce_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str) and value:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    return _utc_now()


def _clean_document(document: dict[str, Any]) -> dict[str, Any]:
    cleaned = {key: value for key, value in document.items() if key != "_id"}
    if isinstance(document.get("_id"), ObjectId):
        cleaned["id"] = str(document["_id"])
    return cleaned


def _normalize_steps(steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized_steps: list[dict[str, Any]] = []
    for index, step in enumerate(steps):
        raw_input = step.get("input") or step.get("input_data") or {}
        raw_output = step.get("output") or step.get("output_data") or {}
        normalized_steps.append(
            StepSchema(
                step_id=step.get("step_id") or f"step_{index + 1}",
                tool_name=step.get("tool_name") or step.get("step_type") or "agent",
                input=raw_input if isinstance(raw_input, dict) else {"value": raw_input},
                output=raw_output if isinstance(raw_output, dict) else {"value": raw_output},
                duration=float(step.get("duration", 0.0)),
                success=bool(step.get("success", True)),
                timestamp=_coerce_datetime(
                    step.get("timestamp") or step.get("created_at") or _utc_now()
                ),
            ).model_dump(mode="python")
        )
    return normalized_steps


def _infer_retry_count(steps: list[dict[str, Any]]) -> int:
    retries = 0
    tool_attempts: defaultdict[str, int] = defaultdict(int)
    for step in steps:
        tool_name = step.get("tool_name", "agent")
        tool_attempts[tool_name] += 1
        if tool_attempts[tool_name] > 1:
            retries += 1
    return retries


def _infer_status(trace_data: dict[str, Any], steps: list[dict[str, Any]]) -> str:
    status = str(trace_data.get("status") or "").lower()
    if status in {"success", "warning", "failed"}:
        return status

    if any(not step.get("success", True) for step in steps):
        return "failed"
    if trace_data.get("failure_reason") or trace_data.get("retry_count", 0):
        return "warning"
    return "success"


def _infer_failure_reason(trace_data: dict[str, Any], steps: list[dict[str, Any]]) -> Optional[str]:
    failure_reason = trace_data.get("failure_reason")
    if failure_reason:
        return str(failure_reason)

    for step in steps:
        if not step.get("success", True):
            output = step.get("output", {})
            if isinstance(output, dict):
                return str(output.get("error") or output.get("message") or step.get("tool_name"))
            return str(step.get("tool_name"))
    return None


def normalize_trace_document(trace_data: dict[str, Any]) -> dict[str, Any]:
    created_at = _coerce_datetime(
        trace_data.get("created_at") or trace_data.get("timestamp") or _utc_now()
    )
    normalized_steps = _normalize_steps(trace_data.get("steps", []))
    retry_count = int(trace_data.get("retry_count", _infer_retry_count(normalized_steps)))
    latency = float(trace_data.get("latency", 0.0))
    status = _infer_status(trace_data, normalized_steps)
    failure_reason = _infer_failure_reason(trace_data, normalized_steps)
    slow_request = bool(trace_data.get("slow_request", latency >= SLOW_TRACE_THRESHOLD_MS))
    prompt = str(trace_data.get("prompt", ""))
    response = trace_data.get("response")

    document = TraceSchema(
        trace_id=str(trace_data.get("trace_id") or trace_data.get("id") or ObjectId()),
        prompt=prompt,
        response=str(response) if response is not None else None,
        latency=latency,
        token_count=int(trace_data.get("token_count", 0)),
        model_name=trace_data.get("model_name") or trace_data.get("model") or "unknown",
        project_id=str(trace_data.get("project_id") or "default"),
        project_name=(
            None
            if trace_data.get("project_name") is None
            else str(trace_data.get("project_name"))
        ),
        api_key=(
            None if trace_data.get("api_key") is None else str(trace_data.get("api_key"))
        ),
        environment=str(trace_data.get("environment") or "development"),
        status=status,  # type: ignore[arg-type]
        steps=normalized_steps,
        retry_count=retry_count,
        slow_request=slow_request,
        failure_reason=failure_reason,
        created_at=created_at,
        updated_at=_utc_now(),
    )
    return document.model_dump(mode="python")


async def ensure_trace_indexes() -> None:
    db = await get_database_connection()
    collection = db[COLLECTION_NAME]
    await collection.create_index("trace_id")
    await collection.create_index("created_at")
    await collection.create_index("status")
    await collection.create_index("model_name")
    await collection.create_index("project_id")
    await collection.create_index("environment")


def _build_trace_query(filters: TraceFilters) -> dict[str, Any]:
    query: dict[str, Any] = {}
    latency_query: dict[str, float] = {}
    token_query: dict[str, int] = {}

    if filters.latency_min is not None:
        latency_query["$gte"] = filters.latency_min
    if filters.latency_max is not None:
        latency_query["$lte"] = filters.latency_max
    if latency_query:
        query["latency"] = latency_query

    if filters.token_min is not None:
        token_query["$gte"] = filters.token_min
    if filters.token_max is not None:
        token_query["$lte"] = filters.token_max
    if token_query:
        query["token_count"] = token_query

    if filters.status:
        query["status"] = filters.status
    if filters.model:
        query["model_name"] = filters.model
    if filters.project_id:
        query["project_id"] = filters.project_id
    if filters.environment:
        query["environment"] = filters.environment

    return query


def _serialize_traces(documents: list[dict[str, Any]]) -> list[TraceSchema]:
    traces: list[TraceSchema] = []

    for document in documents:
        cleaned = _clean_document(document)
        serialized = TraceSchema(
            trace_id=str(cleaned.get("trace_id") or cleaned.get("id") or ObjectId()),
            prompt=str(cleaned.get("prompt") or ""),
            response="" if cleaned.get("response") is None else str(cleaned.get("response")),
            latency=float(cleaned.get("latency", 0.0) or 0.0),
            token_count=int(cleaned.get("token_count", 0) or 0),
            model_name=str(cleaned.get("model_name") or "unknown"),
            project_id=str(cleaned.get("project_id") or "default"),
            project_name=(
                None if cleaned.get("project_name") is None else str(cleaned.get("project_name"))
            ),
            api_key=None if cleaned.get("api_key") is None else str(cleaned.get("api_key")),
            environment=str(cleaned.get("environment") or "development"),
            status=_infer_status(cleaned, cleaned.get("steps", [])),  # type: ignore[arg-type]
            steps=_normalize_steps(cleaned.get("steps", [])),
            retry_count=int(cleaned.get("retry_count", 0) or 0),
            slow_request=bool(cleaned.get("slow_request", False)),
            failure_reason=(
                None
                if cleaned.get("failure_reason") is None
                else str(cleaned.get("failure_reason"))
            ),
            created_at=_coerce_datetime(cleaned.get("created_at") or _utc_now()),
            updated_at=_coerce_datetime(cleaned.get("updated_at") or _utc_now()),
        )
        traces.append(serialized)

    return traces


async def save_trace(trace_data: dict[str, Any]) -> dict[str, Any]:
    """Insert a trace payload into MongoDB and broadcast it to connected dashboards."""
    try:
        db = await get_database_connection()
        collection = db[COLLECTION_NAME]
        document = normalize_trace_document(trace_data)
        await collection.insert_one(document)
        console.print(
            f"[bold green]Trace saved to MongoDB[/bold green] [dim]({COLLECTION_NAME})[/dim]"
        )

        await manager.broadcast({"type": "trace.created", "trace": TraceSchema.model_validate(document).model_dump(mode="json")})
        return document
    except Exception as error:
        console.print(f"[bold red]Failed to save trace:[/bold red] {error}")
        logger.exception("MongoDB save_trace error")
        raise


def save_trace_sync(trace_data: dict) -> None:
    """Save trace data safely from synchronous code."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop is not None and loop.is_running():
        loop.create_task(save_trace(trace_data))
    else:
        asyncio.run(save_trace(trace_data))


async def list_traces(filters: TraceFilters) -> TraceListResponse:
    db = await get_database_connection()
    collection = db[COLLECTION_NAME]
    query = _build_trace_query(filters)
    total = await collection.count_documents(query)
    documents = (
        await collection.find(query).sort("created_at", -1).limit(filters.limit).to_list(filters.limit)
    )
    return TraceListResponse(total=total, items=_serialize_traces(documents))


async def get_trace_by_id(trace_id: str) -> TraceSchema:
    db = await get_database_connection()
    collection = db[COLLECTION_NAME]
    document = await collection.find_one({"trace_id": trace_id})
    if not document:
        raise HTTPException(status_code=404, detail="Trace not found")
    return TraceSchema.model_validate(_clean_document(document))


def _calculate_percentile(values: list[float], percentile: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = max(0, ceil((percentile / 100) * len(ordered)) - 1)
    return round(ordered[index], 2)


async def get_analytics(filters: TraceFilters | None = None) -> AnalyticsResponse:
    db = await get_database_connection()
    collection = db[COLLECTION_NAME]
    query = _build_trace_query(filters or TraceFilters())
    documents = await collection.find(query).sort("created_at", 1).to_list(length=5000)
    traces = _serialize_traces(documents)

    if not traces:
        empty_summary = AnalyticsSummary(
            total_traces=0,
            success_rate=0.0,
            average_latency=0.0,
            p95_latency=0.0,
            total_token_usage=0,
            failed_traces=0,
            warning_traces=0,
            retries=0,
            slow_requests=0,
        )
        return AnalyticsResponse(
            summary=empty_summary,
            charts=[],
            status_breakdown=[],
            model_breakdown=[],
            project_breakdown=[],
            recent_failures=[],
        )

    total_traces = len(traces)
    latencies = [trace.latency for trace in traces]
    total_token_usage = sum(trace.token_count for trace in traces)
    failed_traces = sum(1 for trace in traces if trace.status == "failed")
    warning_traces = sum(1 for trace in traces if trace.status == "warning")
    retries = sum(trace.retry_count for trace in traces)
    slow_requests = sum(1 for trace in traces if trace.slow_request)
    success_rate = round(
        (sum(1 for trace in traces if trace.status == "success") / total_traces) * 100,
        2,
    )

    bucketed: dict[str, list[TraceSchema]] = defaultdict(list)
    window_start = _utc_now() - timedelta(hours=24)
    for trace in traces:
        if trace.created_at < window_start:
            continue
        label = trace.created_at.astimezone(timezone.utc).strftime("%H:00")
        bucketed[label].append(trace)

    chart_points = [
        AnalyticsChartPoint(
            label=label,
            latency=round(sum(item.latency for item in items) / len(items), 2),
            tokens=sum(item.token_count for item in items),
            traces=len(items),
        )
        for label, items in sorted(bucketed.items())
    ]

    status_breakdown = [
        AnalyticsBreakdownItem(key=key, count=count)
        for key, count in Counter(trace.status for trace in traces).most_common()
    ]
    model_breakdown = [
        AnalyticsBreakdownItem(key=key, count=count)
        for key, count in Counter(trace.model_name or "unknown" for trace in traces).most_common()
    ]
    project_breakdown = [
        AnalyticsBreakdownItem(key=key, count=count)
        for key, count in Counter(trace.project_name or trace.project_id for trace in traces).most_common()
    ]

    summary = AnalyticsSummary(
        total_traces=total_traces,
        success_rate=success_rate,
        average_latency=round(sum(latencies) / total_traces, 2),
        p95_latency=_calculate_percentile(latencies, 95),
        total_token_usage=total_token_usage,
        failed_traces=failed_traces,
        warning_traces=warning_traces,
        retries=retries,
        slow_requests=slow_requests,
    )

    recent_failures = [
        trace
        for trace in sorted(traces, key=lambda item: item.created_at, reverse=True)
        if trace.status in {"failed", "warning"} or trace.slow_request or trace.retry_count > 0
    ][:5]

    return AnalyticsResponse(
        summary=summary,
        charts=chart_points,
        status_breakdown=status_breakdown,
        model_breakdown=model_breakdown,
        project_breakdown=project_breakdown,
        recent_failures=recent_failures,
    )


async def get_failures(limit: int = 25, filters: TraceFilters | None = None) -> FailureResponse:
    db = await get_database_connection()
    collection = db[COLLECTION_NAME]
    query = _build_trace_query(filters or TraceFilters(limit=min(limit, 200)))
    documents = await collection.find(query).sort("created_at", -1).to_list(length=1000)
    traces = _serialize_traces(documents)

    failed_traces = [trace for trace in traces if trace.status == "failed"][:limit]
    retry_traces = [trace for trace in traces if trace.retry_count > 0][:limit]
    slow_requests = [trace for trace in traces if trace.slow_request][:limit]

    return FailureResponse(
        failed_traces=failed_traces,
        retries=retry_traces,
        slow_requests=slow_requests,
        totals={
            "failed_traces": len([trace for trace in traces if trace.status == "failed"]),
            "retries": len([trace for trace in traces if trace.retry_count > 0]),
            "slow_requests": len([trace for trace in traces if trace.slow_request]),
        },
    )
