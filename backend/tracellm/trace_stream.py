"""Live event stream for trace execution."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from tracellm.utils import console


class TraceStream:
    """Realtime event stream that renders timestamped trace events."""

    def __init__(self, prompt: str, model_name: str) -> None:
        self.prompt = prompt
        self.model_name = model_name
        self.events: list[tuple[str, str, str]] = []
        self._start = datetime.now()
        self._live = Live(console=console, refresh_per_second=10, transient=True)

    def __enter__(self) -> TraceStream:
        self.emit("trace.start")
        self._live.__enter__()
        return self

    def __exit__(self, *args: Any) -> None:
        self.emit("trace.complete")
        self._live.__exit__(*args)

    def emit(self, event: str, detail: str = "") -> None:
        """Emit a trace event and update the live display."""
        ts = datetime.now().strftime("%H:%M:%S")
        self.events.append((ts, event, detail))
        self._live.update(self._render())

    def _render(self) -> Panel:
        now = datetime.now()
        elapsed = (now - self._start).total_seconds()

        event_table = Table.grid(padding=(0, 2))
        event_table.add_column(style="bright_black", width=10)
        event_table.add_column(style="cyan")
        event_table.add_column(style="dim", width=30)

        for ts, evt, det in self.events:
            event_table.add_row(f"[{ts}]", evt, det)

        summary = Table.grid(padding=(0, 2))
        summary.add_column(style="bright_black")
        summary.add_column(style="white")
        summary.add_row("Prompt", self.prompt[:60])
        summary.add_row("Model", self.model_name)
        summary.add_row("Elapsed", f"{elapsed:.1f}s")
        summary.add_row("Events", str(len(self.events)))

        body = Table.grid(padding=(0, 1))
        body.add_column()
        body.add_row(Text("Event Stream", style="bold white"))
        body.add_row(event_table)
        body.add_row(Text(""))
        body.add_row(summary)

        return Panel(body, title="Live Trace", border_style="bright_black", padding=(1, 2))
