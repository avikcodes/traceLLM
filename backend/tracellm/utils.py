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
from rich.tree import Tree

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


def render_status_badge(status: str) -> Text:
    normalized = status.lower()
    if normalized == "success":
        return Text(" SUCCESS ", style="bold white on #1a6b3c")
    if normalized == "warning":
        return Text(" WARNING ", style="bold #1a1a1a on #b8860b")
    return Text(" FAILED ", style="bold white on #8b1a1a")


def build_trace_summary_table(trace_data: dict[str, Any]) -> Table:
    table = Table.grid(padding=(0, 3), collapse_padding=True)
    table.add_column(style="bright_black", no_wrap=True)
    table.add_column(style="white")
    table.add_row("Trace ID", str(trace_data["trace_id"]))
    table.add_row("Prompt", str(trace_data["prompt"])[:80])
    table.add_row("Model", str(trace_data["model_name"]))
    table.add_row("Project", str(trace_data.get("project_name") or trace_data.get("project_id") or "default"))
    table.add_row(
        "Environment",
        f'[{environment_style(str(trace_data.get("environment") or "development"))}]{str(trace_data.get("environment") or "development")}[/]',
    )
    latency = float(trace_data["latency"])
    table.add_row("Latency", f'[{latency_style(latency)}]{latency:.2f} ms[/]')
    table.add_row("Token Count", f"{trace_data['token_count']:,}")
    table.add_row("Retries", str(trace_data["retry_count"]))
    table.add_row("Steps", str(len(trace_data["steps"])))
    status_badge = render_status_badge(str(trace_data["status"]))
    table.add_row("Status", status_badge)
    return table


def build_steps_table(steps: list[dict[str, Any]]) -> Table:
    table = Table(title="  Steps", box=None, padding=(0, 2), header_style="dim")
    table.add_column("#", style="bright_black", width=3)
    table.add_column("Tool", style="white")
    table.add_column("Duration", justify="right", style="bright_black")
    table.add_column("Status", justify="center")
    table.add_column("Detail", style="dim")
    for index, step in enumerate(steps, start=1):
        success = bool(step.get("success", True))
        duration = float(step.get("duration", 0.0))
        detail = ""
        if not success:
            detail = "retry"
        elif duration >= SLOW_TRACE_THRESHOLD_MS:
            detail = "spike"
        table.add_row(
            str(index),
            str(step.get("tool_name", "unknown")),
            f'[{latency_style(duration)}]{duration:.0f} ms[/]',
            "[green]OK[/]" if success else "[red]RETRY[/]",
            detail,
        )
    return table


def render_trace_panel(trace_data: dict[str, Any], title: str = "Trace") -> Panel:
    return Panel(
        build_trace_summary_table(trace_data),
        title=f"[bold]{title}[/bold]",
        subtitle=f"[{status_style(str(trace_data['status']))}]{str(trace_data['status']).upper()}[/]",
        border_style="bright_black",
        padding=(1, 2),
    )


def render_trace_report(trace_data: dict[str, Any]) -> None:
    console.print()
    console.print(render_trace_panel(trace_data, "TraceLLM Trace"))
    console.print()
    console.print(build_steps_table(trace_data["steps"]))
    console.print()
    response_preview = str(trace_data.get("response") or "")
    if response_preview:
        console.print(
            Panel.fit(
                response_preview[:600] + ("..." if len(response_preview) > 600 else ""),
                title="Response Preview",
                border_style="bright_black",
                padding=(1, 2),
            )
        )
        console.print()


def render_replay_tree(
    steps: list[dict[str, Any]],
    active_index: int | None = None,
) -> Tree:
    tree = Tree("", hide_root=True)
    for i, step in enumerate(steps, 1):
        tool_name = step.get("tool_name", "unknown")
        duration = float(step.get("duration", 0.0))
        success = bool(step.get("success", True))
        dur_str = f"[bright_black]{duration:.0f}ms[/bright_black]"
        if active_index == i:
            branch = tree.add(f"[cyan]▶[/cyan] [white]{tool_name}[/white] {dur_str}")
        elif active_index is not None and i < active_index:
            status = "[green]OK[/green]" if success else "[red]RETRY[/red]"
            branch = tree.add(f"[green]✓[/green] [dim]{tool_name}[/dim] {dur_str} {status}")
        elif active_index is not None and i > active_index:
            branch = tree.add(f"  [dim]{tool_name}[/dim] {dur_str}")
        else:
            status = "[green]OK[/green]" if success else "[red]RETRY[/red]"
            branch = tree.add(f"  [white]{tool_name}[/white] {dur_str} {status}")
    return tree


def render_replay_report(trace_result: dict[str, Any]) -> None:
    steps = trace_result.get("steps", [])
    console.print()
    console.print("Replay complete", style="bold white")
    console.print()
    tree = render_replay_tree(steps, active_index=len(steps))
    console.print(Panel(tree, border_style="bright_black", padding=(1, 2)))
    console.print()


def build_progress_bar(description: str, total: int) -> Progress:
    progress = Progress(
        SpinnerColumn(style="white"),
        TextColumn("[bright_black]{task.description}"),
        BarColumn(bar_width=24, style="bright_black", pulse_style="white"),
        TextColumn("[bright_black]{task.completed}/{task.total}[/bright_black]"),
        TimeElapsedColumn(),
        expand=True,
    )
    progress.add_task(description, total=total)
    return progress


def build_live_trace_screen(
    prompt: str,
    model_name: str,
    finished_steps: list[dict[str, Any]],
    current_label: str,
) -> Panel:
    progress = Progress(
        SpinnerColumn(style="white"),
        TextColumn("[white]{task.description}"),
        BarColumn(bar_width=28, style="bright_black", complete_style="white"),
        TextColumn("[bright_black]{task.completed}/{task.total}[/bright_black]"),
        TimeElapsedColumn(),
        expand=True,
    )
    total = max(1, len(finished_steps) + 1)
    task_id = progress.add_task(current_label, total=total, completed=len(finished_steps))

    timeline = Table.grid(padding=(0, 2))
    timeline.add_column(style="bright_black", width=3)
    timeline.add_column(style="white")
    timeline.add_column(style="bright_black", justify="right")
    timeline.add_column(style="bright_black")

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
        Text(f"model: {model_name}", style="bright_black"),
        Rule(style="bright_black"),
        progress,
        Rule(style="bright_black"),
        timeline,
    )
    progress.update(task_id, completed=len(finished_steps))
    return Panel(body, title="Live Trace", border_style="bright_black", padding=(1, 2))


def trace_command_footer(trace_data: dict[str, Any]) -> None:
    status = str(trace_data["status"])
    badge = render_status_badge(status)
    console.print(
        Panel.fit(
            f"[bright_black]trace_id[/bright_black] {trace_data['trace_id']}\n"
            f"[bright_black]model[/bright_black] {trace_data.get('model_name', 'unknown')}\n"
            f"[bright_black]latency[/bright_black] {float(trace_data['latency']):.2f} ms\n"
            f"[bright_black]tokens[/bright_black] {trace_data['token_count']:,}\n"
            f"[bright_black]retries[/bright_black] {trace_data['retry_count']}\n"
            f"{badge}",
            title="Trace Complete",
            border_style="bright_black",
            padding=(1, 2),
        )
    )


def render_project_credentials(
    project_id: str,
    name: str,
    environment: str,
    api_key: str,
    description: str,
) -> None:
    console.print()
    console.print(
        Panel.fit(
            f"[bold white]{name}[/bold white]\n\n"
            f"[bright_black]project_id[/bright_black]  {project_id}\n"
            f"[bright_black]env[/bright_black]         [{environment_style(environment)}]{environment}[/]\n"
            f"[bright_black]api_key[/bright_black]     [bold]{api_key}[/bold]\n"
            f"[bright_black]desc[/bright_black]        {description or 'n/a'}\n\n"
            f"[dim]Save this key — it will not be shown again.[/dim]",
            title="Project Credentials",
            border_style="bright_black",
            padding=(1, 2),
        )
    )
    console.print()


def render_export_success(path: Path, count: int) -> None:
    console.print()
    console.print(
        Panel.fit(
            f"[bold white]{count} traces exported[/bold white]\n"
            f"[dim]{path}[/dim]",
            title="Export Complete",
            border_style="bright_black",
            padding=(1, 2),
        )
    )
    console.print()
