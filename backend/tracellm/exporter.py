import json
from pathlib import Path

from tracellm.db import fetch_recent_traces
from tracellm.utils import console, ensure_export_dir, export_timestamp, render_export_success, write_csv


def export_traces(export_format: str, limit: int = 100) -> Path:
    console.print()
    console.print("[bold white]Exporting traces...[/bold white]")

    traces = fetch_recent_traces(limit=limit)
    export_dir = ensure_export_dir()
    timestamp = export_timestamp()

    if export_format == "json":
        path = export_dir / f"traces-{timestamp}.json"
        payload = [trace.model_dump(mode="json") for trace in traces]
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    else:
        path = export_dir / f"traces-{timestamp}.csv"
        rows = [
            {
                "trace_id": trace.trace_id,
                "project_id": trace.project_id,
                "project_name": trace.project_name,
                "environment": trace.environment,
                "prompt": trace.prompt,
                "model_name": trace.model_name,
                "status": trace.status,
                "latency": trace.latency,
                "token_count": trace.token_count,
                "retry_count": trace.retry_count,
                "slow_request": trace.slow_request,
                "failure_reason": trace.failure_reason,
                "created_at": trace.created_at.isoformat(),
                "updated_at": trace.updated_at.isoformat(),
                "step_count": len(trace.steps),
            }
            for trace in traces
        ]
        write_csv(
            path,
            rows,
            [
                "trace_id",
                "project_id",
                "project_name",
                "environment",
                "prompt",
                "model_name",
                "status",
                "latency",
                "token_count",
                "retry_count",
                "slow_request",
                "failure_reason",
                "created_at",
                "updated_at",
                "step_count",
            ],
        )

    render_export_success(path, len(traces))
    return path
