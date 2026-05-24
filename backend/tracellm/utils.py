import csv
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from rich.align import Align
from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

console = Console()
SLOW_TRACE_THRESHOLD_MS = 1500.0
WARNING_TRACE_THRESHOLD_MS = 900.0


def estimate_tokens(*parts: Any) -> int:
    text = " ".join(str(part) for part in parts if part is not None)
    if not text.strip():
        return 0
    return max(1, len(text.split()) + len(text) // 4)


def build_tool_step(
    tool_name: str,
    input_data: dict[str, Any],
    output_data: dict[str, Any],
    duration: float,
    success: bool = True,
) -> dict[str, Any]:
    return {
        "step_id": str(uuid.uuid4()),
        "tool_name": tool_name,
        "input": input_data,
        "output": output_data,
        "duration": round(duration, 2),
        "success": success,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def simulate_step(
    steps: list[dict[str, Any]],
    tool_name: str,
    input_data: dict[str, Any],
    output_data: dict[str, Any],
    min_delay: float,
    max_delay: float,
    random_module: Any,
    success: bool = True,
) -> dict[str, Any]:
    started = time.perf_counter()
    time.sleep(random_module.uniform(min_delay, max_delay))
    duration = round((time.perf_counter() - started) * 1000, 2)
    step = build_tool_step(
        tool_name=tool_name,
        input_data=input_data,
        output_data=output_data,
        duration=duration,
        success=success,
    )
    steps.append(step)
    return step


def coerce_response(result: Any) -> str:
    if isinstance(result, dict):
        response = result.get("response")
        if response is not None:
            return str(response)
    if result is None:
        return ""
    return str(result)


def coerce_steps(result: Any) -> list[dict[str, Any]]:
    if isinstance(result, dict) and isinstance(result.get("steps"), list):
        return [step for step in result["steps"] if isinstance(step, dict)]
    return []


def coerce_retry_count(result: Any) -> int:
    if isinstance(result, dict):
        value = result.get("retry_count", 0)
        try:
            return max(0, int(value))
        except (TypeError, ValueError):
            return 0
    return 0


def coerce_status(result: Any, retry_count: int) -> str:
    if isinstance(result, dict):
        status = str(result.get("status") or "").lower()
        if status in {"success", "warning", "failed"}:
            return status
    if retry_count > 0:
        return "warning"
    return "success"


def coerce_failure_reason(result: Any) -> str | None:
    if isinstance(result, dict):
        failure_reason = result.get("failure_reason")
        if failure_reason:
            return str(failure_reason)
    return None


def status_style(status: str) -> str:
    normalized = status.lower()
    if normalized == "success":
        return "bold green"
    if normalized == "warning":
        return "bold yellow"
    return "bold red"


def environment_style(environment: str) -> str:
    normalized = environment.lower()
    if normalized == "production":
        return "bold red"
    if normalized == "staging":
        return "bold yellow"
    return "bold cyan"


def latency_style(latency_ms: float) -> str:
    if latency_ms >= SLOW_TRACE_THRESHOLD_MS:
        return "bold red"
    if latency_ms >= WARNING_TRACE_THRESHOLD_MS:
        return "bold yellow"
    return "green"


def ensure_export_dir() -> Path:
    export_dir = Path.cwd() / "exports"
    export_dir.mkdir(parents=True, exist_ok=True)
    return export_dir


def export_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def build_trace_summary_table(trace_data: dict[str, Any]) -> Table:
    table = Table(show_header=False, box=None, pad_edge=False)
    table.add_column("Field", style="cyan", no_wrap=True)
    table.add_column("Value", style="white")
    table.add_row("Trace ID", str(trace_data["trace_id"]))
    table.add_row("Prompt", str(trace_data["prompt"]))
    table.add_row("Model", str(trace_data["model_name"]))
    table.add_row("Project", str(trace_data.get("project_name") or trace_data.get("project_id") or "default"))
    table.add_row(
        "Environment",
        f'[{environment_style(str(trace_data.get("environment") or "development"))}]{str(trace_data.get("environment") or "development")}[/]',
    )
    table.add_row("Latency", f'[{latency_style(float(trace_data["latency"]))}]{float(trace_data["latency"]):.2f} ms[/]')
    table.add_row("Token Count", str(trace_data["token_count"]))
    table.add_row("Status", f'[{status_style(str(trace_data["status"]))}]{str(trace_data["status"]).upper()}[/]')
    table.add_row("Retries", str(trace_data["retry_count"]))
    table.add_row("Steps", str(len(trace_data["steps"])))
    return table


def build_steps_table(steps: list[dict[str, Any]]) -> Table:
    table = Table(title="Tool Steps")
    table.add_column("#", style="cyan", width=4)
    table.add_column("Tool", style="magenta")
    table.add_column("Duration", justify="right")
    table.add_column("Status", justify="center")
    for index, step in enumerate(steps, start=1):
        success = bool(step.get("success", True))
        duration = float(step.get("duration", 0.0))
        table.add_row(
            str(index),
            str(step.get("tool_name", "unknown")),
            f'[{latency_style(duration)}]{duration:.2f} ms[/]',
            "[green]OK[/]" if success else "[red]RETRY[/]",
        )
    return table


def render_trace_report(trace_data: dict[str, Any]) -> None:
    console.print(Rule("[bold cyan]TraceLLM Trace Summary[/bold cyan]"))
    console.print(Panel(build_trace_summary_table(trace_data), border_style="cyan"))
    console.print(build_steps_table(trace_data["steps"]))

    response_preview = str(trace_data.get("response") or "")
    console.print(
        Panel.fit(
            response_preview[:900] + ("..." if len(response_preview) > 900 else ""),
            title="LLM Response Preview",
            border_style="green",
        )
    )


def render_replay_report(trace_result: dict[str, Any]) -> None:
    console.print(Rule("[bold cyan]TraceLLM Replay Snapshot[/bold cyan]"))
    console.print(build_steps_table(trace_result.get("steps", [])))


def build_live_trace_screen(prompt: str, model_name: str, finished_steps: list[dict[str, Any]], current_label: str) -> Panel:
    progress = Progress(
        SpinnerColumn(style="cyan"),
        TextColumn("[bold white]{task.description}"),
        BarColumn(bar_width=28),
        TextColumn("{task.completed}/{task.total}"),
        TimeElapsedColumn(),
        expand=True,
    )
    task_id = progress.add_task(current_label, total=max(1, len(finished_steps) + 1), completed=len(finished_steps))

    timeline = Table(show_header=True, box=None, pad_edge=False)
    timeline.add_column("Step", style="cyan", width=4)
    timeline.add_column("Tool", style="magenta")
    timeline.add_column("Latency", justify="right")
    timeline.add_column("Signal", style="white")

    for index, step in enumerate(finished_steps[-5:], start=max(1, len(finished_steps) - 4)):
        duration = float(step.get("duration", 0.0))
        signal = "retry" if not step.get("success", True) else "steady"
        if duration >= SLOW_TRACE_THRESHOLD_MS:
            signal = "spike"
        timeline.add_row(
            str(index),
            str(step.get("tool_name", "unknown")),
            f'[{latency_style(duration)}]{duration:.0f} ms[/]',
            signal,
        )

    body = Group(
        Align.left(Text(prompt, style="bold white")),
        Text(f"model: {model_name}", style="dim"),
        Rule(style="dim"),
        progress,
        Rule(style="dim"),
        timeline,
    )
    progress.update(task_id, completed=len(finished_steps))
    return Panel(body, title="Live Trace", border_style="cyan")


def trace_command_footer(trace_data: dict[str, Any]) -> None:
    console.print(
        Panel.fit(
            f"[bold]trace_id[/bold] {trace_data['trace_id']}\n"
            f"[bold]project[/bold] {trace_data.get('project_name') or trace_data.get('project_id') or 'default'}\n"
            f"[bold]environment[/bold] [{environment_style(str(trace_data.get('environment') or 'development'))}]{trace_data.get('environment') or 'development'}[/]\n"
            f"[bold]status[/bold] [{status_style(str(trace_data['status']))}]{str(trace_data['status']).upper()}[/]\n"
            f"[bold]latency[/bold] {float(trace_data['latency']):.2f} ms\n"
            f"[bold]tokens[/bold] {trace_data['token_count']}\n"
            f"[bold]retries[/bold] {trace_data['retry_count']}",
            title="Trace Complete",
            border_style="green" if str(trace_data["status"]).lower() == "success" else "yellow",
        )
    )


def render_project_credentials(
    project_id: str,
    name: str,
    environment: str,
    api_key: str,
    description: str,
) -> None:
    console.print(
        Panel.fit(
            f"[bold]project[/bold] {name}\n"
            f"[bold]project_id[/bold] {project_id}\n"
            f"[bold]environment[/bold] [{environment_style(environment)}]{environment}[/]\n"
            f"[bold]api_key[/bold] {api_key}\n"
            f"[bold]description[/bold] {description or 'n/a'}",
            title="Project Credentials",
            border_style="cyan",
        )
    )
