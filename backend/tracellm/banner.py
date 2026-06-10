from __future__ import annotations

from datetime import datetime

from rich.box import DOUBLE
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.align import Align

from tracellm.themes import current_theme


def render_banner(
    version: str = "0.2.0",
    environment: str = "development",
) -> Panel:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    theme = current_theme()

    inner = Table.grid(padding=(0, 0))
    inner.add_column(justify="center")
    inner.add_row(Text(f"TraceLLM v{version}", style=theme.primary))
    inner.add_row(Text("Open-source LLM Observability", style=theme.secondary))
    inner.add_row(Text(""))
    inner.add_row(Text(f"Started at {now}", style="dim"))
    inner.add_row(Text(f"Environment: {environment}", style="dim"))

    return Panel(
        Align.center(inner),
        box=DOUBLE,
        border_style=theme.border,
        padding=(1, 4),
    )
