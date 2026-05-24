import time
from typing import Any

from rich.console import Group
from rich.live import Live
from rich.panel import Panel
from rich.rule import Rule
from rich.table import Table

from tracellm.db import fetch_trace
from tracellm.utils import (
    SLOW_TRACE_THRESHOLD_MS,
    console,
    latency_style,
    render_trace_report,
    status_style,
)


def _step_panel(trace_data: dict[str, Any], step: dict[str, Any], index: int, total: int) -> Panel:
    duration = float(step.get("duration", 0.0))
    signal = "latency spike" if duration >= SLOW_TRACE_THRESHOLD_MS else "steady"
    if not step.get("success", True):
        signal = "retry"

    detail = Table(show_header=False, box=None, pad_edge=False)
    detail.add_column("Field", style="cyan", no_wrap=True)
    detail.add_column("Value")
    detail.add_row("Trace ID", str(trace_data["trace_id"]))
    detail.add_row("Step", f"{index}/{total}")
    detail.add_row("Tool", str(step.get("tool_name", "unknown")))
    detail.add_row("Duration", f'[{latency_style(duration)}]{duration:.2f} ms[/]')
    detail.add_row("Status", "[green]success[/]" if step.get("success", True) else "[red]retry[/]")
    detail.add_row("Signal", signal)
    detail.add_row("Input", str(step.get("input", {}))[:240])
    detail.add_row("Output", str(step.get("output", {}))[:320])

    return Panel(detail, title="Replay Step", border_style="cyan")


def _timeline_table(steps: list[dict[str, Any]], active_index: int) -> Table:
    table = Table(title="Execution Timeline")
    table.add_column("#", style="cyan", width=4)
    table.add_column("Tool", style="magenta")
    table.add_column("Latency", justify="right")
    table.add_column("Marker")

    for index, step in enumerate(steps, start=1):
        duration = float(step.get("duration", 0.0))
        marker = "active" if index == active_index else "done" if index < active_index else "queued"
        if not step.get("success", True):
            marker = "retry"
        elif duration >= SLOW_TRACE_THRESHOLD_MS:
            marker = "spike"
        table.add_row(
            str(index),
            str(step.get("tool_name", "unknown")),
            f'[{latency_style(duration)}]{duration:.2f} ms[/]',
            marker,
        )
    return table


def replay_trace(trace_id: str, speed: float = 1.0, show_response: bool = False) -> None:
    trace = fetch_trace(trace_id)
    trace_data = trace.model_dump(mode="json")
    steps = trace_data.get("steps", [])

    if not steps:
        console.print(f"[yellow]Trace {trace_id} has no steps to replay.[/yellow]")
        return

    console.print(Rule("[bold cyan]TraceLLM Replay Viewer[/bold cyan]"))
    console.print(
        Panel.fit(
            f"[bold]trace_id[/bold] {trace_data['trace_id']}\n"
            f"[bold]status[/bold] [{status_style(str(trace_data['status']))}]{str(trace_data['status']).upper()}[/]\n"
            f"[bold]latency[/bold] {float(trace_data['latency']):.2f} ms\n"
            f"[bold]retries[/bold] {trace_data['retry_count']}\n"
            f"[bold]steps[/bold] {len(steps)}",
            title="Replay Metadata",
            border_style="cyan",
        )
    )

    with Live(console=console, refresh_per_second=12, transient=False) as live:
        for index, step in enumerate(steps, start=1):
            live.update(
                Group(
                    _step_panel(trace_data, step, index, len(steps)),
                    _timeline_table(steps, index),
                )
            )
            time.sleep(max(0.08, min(0.55, float(step.get("duration", 0.0)) / 1000 / max(speed, 0.1))))

    render_trace_report(trace_data)
    if show_response:
        console.print(Panel(str(trace_data.get("response") or ""), title="Full Response", border_style="green"))
