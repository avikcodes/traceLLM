import time
from typing import Any

from rich.live import Live
from rich.panel import Panel
from rich.rule import Rule

from tracellm.db import fetch_trace
from tracellm.mascot import MascotState, header, message
from tracellm.tree_renderer import render_execution_panel
from tracellm.utils import (
    console,
    render_trace_report,
    status_style,
)


def _replay_detail_panel(trace_data: dict[str, Any], step: dict[str, Any], index: int, total: int) -> Panel:
    duration = float(step.get("duration", 0.0))
    success = bool(step.get("success", True))
    tool_name = step.get("tool_name", "unknown")
    inp = str(step.get("input", {}))
    out = str(step.get("output", {}))

    lines = [
        f"[bright_black]step[/bright_black]     {index}/{total}",
        f"[bright_black]tool[/bright_black]     [white]{tool_name}[/white]",
        f"[bright_black]duration[/bright_black] {duration:.0f} ms",
        f"[bright_black]status[/bright_black]   {'[green]OK[/]' if success else '[red]RETRY[/]'}",
    ]
    if inp:
        clipped = inp[:200] + ("..." if len(inp) > 200 else "")
        lines.append(f"[bright_black]input[/bright_black]   [dim]{clipped}[/dim]")
    if out:
        clipped = out[:200] + ("..." if len(out) > 200 else "")
        lines.append(f"[bright_black]output[/bright_black]  [dim]{clipped}[/dim]")

    body = "\n".join(lines)
    return Panel.fit(body, title="Step Detail", border_style="bright_black", padding=(1, 2))


def replay_trace(trace_id: str, speed: float = 1.0, show_response: bool = False) -> None:
    trace = fetch_trace(trace_id)
    trace_data = trace.model_dump(mode="json")
    steps = trace_data.get("steps", [])

    if not steps:
        console.print(f"[yellow]Trace {trace_id} has no steps to replay.[/yellow]")
        return

    console.print()
    console.print(header("Replaying execution timeline...", MascotState.LOADING))
    console.print()
    meta_lines = [
        f"[bright_black]trace_id[/bright_black] {trace_data['trace_id']}",
        f"[bright_black]status[/bright_black]   [{status_style(str(trace_data['status']))}]{str(trace_data['status']).upper()}[/]",
        f"[bright_black]latency[/bright_black]  {float(trace_data['latency']):.2f} ms",
        f"[bright_black]retries[/bright_black]  {trace_data['retry_count']}",
        f"[bright_black]steps[/bright_black]    {len(steps)}",
    ]
    console.print(Panel.fit("\n".join(meta_lines), title="Replay", border_style="bright_black", padding=(1, 2)))

    with Live(console=console, refresh_per_second=12, transient=False) as live:
        for index, step in enumerate(steps, start=1):
            tree_panel = render_execution_panel(steps, active_index=index)
            detail = _replay_detail_panel(trace_data, step, index, len(steps))
            body = f"{tree_panel}\n\n{detail}"
            live.update(Panel(body, title=f"Replaying step {index}/{len(steps)}", border_style="bright_black", padding=(1, 2)))
            delay = float(step.get("duration", 0.0)) / 1000 / max(speed, 0.1)
            time.sleep(max(0.08, min(0.55, delay)))

    status = str(trace_data.get("status", "success")).lower()
    if status == "success":
        console.print(message("Replay complete", MascotState.SUCCESS))
    elif status in ("warning", "failed"):
        console.print(message("Warning: trace had issues", MascotState.WARNING))
    console.print()
    render_trace_report(trace_data)
    if show_response:
        console.print(Panel(str(trace_data.get("response") or ""), title="Full Response", border_style="bright_black", padding=(1, 2)))
