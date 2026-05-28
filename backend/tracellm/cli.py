import asyncio
import json
import time
from datetime import datetime, timezone
from typing import Any

import typer
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from tracellm.db import create_project_with_key, fetch_recent_traces
from tracellm.exporter import export_traces
from tracellm.replay import replay_trace
from tracellm.startup import run_start
from tracellm.tracer import llm_response, run_live_trace
from tracellm.utils import console, render_project_credentials, status_style, latency_style

app = typer.Typer(help="TraceLLM SDK and developer CLI.")


@app.command()
def demo() -> None:
    """Generate a realistic demo trace."""
    result = llm_response()
    retries = result.get("retry_count", 0)
    steps = len(result.get("steps", []))
    console.print()
    console.print("[bold white]Demo complete[/bold white]")
    console.print(f"[bright_black]{steps} steps, {retries} retries[/bright_black]")
    console.print()


@app.command()
def start(
    port: int = typer.Option(8000, "--port", "-p", help="Port for the API server."),
    dashboard: bool = typer.Option(False, "--dashboard", "-d", help="Open the dashboard in your browser."),
    dashboard_port: int = typer.Option(3000, "--dashboard-port", help="Port for the frontend dashboard."),
) -> None:
    """Start the TraceLLM observability stack (backend + dashboard)."""
    run_start(port=port, dashboard_port=dashboard_port, launch_dashboard=dashboard)


@app.command("trace")
def trace_command(
    prompt: str = typer.Argument(..., help="Prompt to trace."),
    model: str = typer.Option("gpt-4.1-mini", "--model", help="Model name label for the trace."),
    project: str = typer.Option("default", "--project", help="Project identifier or display name."),
    environment: str = typer.Option("development", "--environment", help="Environment label."),
    api_key: str | None = typer.Option(None, "--api-key", help="TraceLLM API key."),
) -> None:
    """Run a production-style traced prompt simulation."""
    run_live_trace(
        prompt=prompt,
        model_name=model,
        project=project,
        environment=environment,
        api_key=api_key,
        render=True,
    )


@app.command()
def replay(
    trace_id: str = typer.Argument(..., help="Trace ID to replay from MongoDB."),
    speed: float = typer.Option(1.0, "--speed", min=0.1, help="Replay speed multiplier."),
    show_response: bool = typer.Option(False, "--show-response", help="Show the full saved response after replay."),
) -> None:
    """Replay a saved trace from MongoDB in the terminal."""
    replay_trace(trace_id=trace_id, speed=speed, show_response=show_response)


@app.command()
def monitor(
    refresh: float = typer.Option(2.0, "--refresh", "-r", help="Polling interval in seconds."),
    limit: int = typer.Option(10, "--limit", "-l", help="Number of recent traces to show."),
) -> None:
    """Watch incoming real traces in realtime."""
    try:
        _run_monitor(refresh, limit)
    except KeyboardInterrupt:
        console.print("\n[yellow]Monitor stopped.[/yellow]")


def _run_monitor(refresh: float, limit: int) -> None:
    seen: set[str] = set()

    with Live(console=console, refresh_per_second=4, screen=True) as live:
        while True:
            try:
                traces = fetch_recent_traces(limit=limit)
                new_count = sum(1 for t in traces if t.trace_id not in seen)
                for t in traces:
                    seen.add(t.trace_id)

                table = Table(title=f"Live Traces  •  {len(seen)} total  •  {new_count} new", box=None, padding=(0, 1))
                table.add_column("Time", style="bright_black", width=8)
                table.add_column("Status", width=8, justify="center")
                table.add_column("Model", style="white", no_wrap=True)
                table.add_column("Latency", justify="right", width=10)
                table.add_column("Tokens", justify="right", width=8)
                table.add_column("Retries", justify="right", width=7)
                table.add_column("Prompt", style="dim", width=40)
                table.add_column("Steps", justify="right", width=5)

                for t in traces[:limit]:
                    ts = t.created_at.strftime("%H:%M:%S") if hasattr(t.created_at, "strftime") else str(t.created_at)[11:19]
                    lat = float(t.latency)
                    table.add_row(
                        ts,
                        f"[{status_style(t.status)}]{t.status.upper()}[/]",
                        str(t.model_name or "?")[:16],
                        f"[{latency_style(lat)}]{lat:.0f}ms[/]",
                        f"{t.token_count}",
                        f"{t.retry_count}",
                        str(t.prompt)[:40],
                        str(len(t.steps)),
                    )

                if new_count > 0:
                    title = Text(f" NEW: {new_count} trace(s) ", style="bold white on green")
                else:
                    title = Text(" No new traces ", style="dim")

                live.update(
                    Panel(
                        table,
                        title="TraceLLM Monitor",
                        subtitle=f"polling every {refresh}s — Ctrl+C to stop {str(title)}",
                        border_style="bright_black",
                        padding=(1, 2),
                    )
                )
                time.sleep(refresh)
            except Exception as e:
                live.update(Panel(f"[yellow]Connection issue: {e}[/yellow]", title="Monitor"))
                time.sleep(refresh)


@app.command()
def export(
    format: str = typer.Option("json", "--format", help="Export format: json or csv."),
    limit: int = typer.Option(100, "--limit", min=1, max=1000, help="How many recent traces to export."),
) -> None:
    """Export traces from MongoDB."""
    normalized = format.lower()
    if normalized not in {"json", "csv"}:
        raise typer.BadParameter("format must be one of: json, csv")
    export_traces(export_format=normalized, limit=limit)


@app.command("create-project")
def create_project_command() -> None:
    """Create a project and generate a secure API key."""
    name = typer.prompt("Project name").strip()
    description = typer.prompt("Description", default="", show_default=False).strip()
    environment = typer.prompt("Environment", default="development").strip().lower()
    if environment not in {"development", "staging", "production"}:
        raise typer.BadParameter("environment must be development, staging, or production")

    response = create_project_with_key(name=name, description=description, environment=environment)
    render_project_credentials(
        project_id=response.project.project_id,
        name=response.project.name,
        environment=response.api_key.environment,
        api_key=response.api_key.key,
        description=response.project.description,
    )


def main() -> None:
    app()


if __name__ == "__main__":
    main()
