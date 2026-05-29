"""Premium startup banner for TraceLLM CLI."""

from __future__ import annotations

from datetime import datetime

from rich.box import DOUBLE
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.align import Align


def render_banner(
    version: str = "0.2.0",
    environment: str = "development",
) -> Panel:
    """Render a centered premium startup banner panel."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    inner = Table.grid(padding=(0, 0))
    inner.add_column(justify="center")
    inner.add_row(Text(f"TraceLLM v{version}", style="bold white"))
    inner.add_row(Text("Open-source LLM Observability", style="bright_black"))
    inner.add_row(Text(""))
    inner.add_row(Text(f"Started at {now}", style="dim"))
    inner.add_row(Text(f"Environment: {environment}", style="dim"))

    return Panel(
        Align.center(inner),
        box=DOUBLE,
        border_style="bright_black",
        padding=(1, 4),
    )
