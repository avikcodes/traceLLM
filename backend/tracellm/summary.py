"""Premium trace summary card."""

from __future__ import annotations

from typing import Any

from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from tracellm.utils import render_status_badge


def render_summary(trace_data: dict[str, Any]) -> Panel:
    """Render a professional trace summary card."""
    status = str(trace_data["status"])
    badge = render_status_badge(status)
    border = "green" if status == "success" else "yellow" if status == "warning" else "red"

    table = Table.grid(padding=(0, 3))
    table.add_column(style="bright_black", width=14)
    table.add_column(style="white")

    table.add_row("Model", str(trace_data.get("model_name", "unknown")))
    table.add_row("Latency", f"{float(trace_data['latency']):.2f} ms")
    table.add_row("Tokens", f"{trace_data['token_count']:,}")
    table.add_row("Retries", str(trace_data["retry_count"]))
    table.add_row("Status", badge)
    created = str(trace_data.get("created_at", ""))
    if created:
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(created)
            created = dt.strftime("%Y-%m-%d %H:%M:%S")
        except (ValueError, TypeError):
            pass
    table.add_row("Timestamp", created)
    table.add_row("Trace ID", str(trace_data["trace_id"]))

    return Panel(
        table,
        title="\U0001f996 Trace Complete",
        border_style=border,
        padding=(1, 3),
    )


def print_summary(trace_data: dict[str, Any]) -> None:
    """Print the trace summary card to console."""
    from tracellm.utils import console
    console.print()
    console.print(render_summary(trace_data))
    console.print()
