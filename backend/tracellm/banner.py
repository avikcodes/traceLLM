from __future__ import annotations

from datetime import datetime

from rich.box import ROUNDED
from rich.panel import Panel
from rich.text import Text
from rich.align import Align

from tracellm.themes import current_theme

TRACE_LOGO = """\
████████╗██████╗  █████╗  ██████╗███████╗
╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝
   ██║   ██████╔╝███████║██║     █████╗
   ██║   ██╔══██╗██╔══██║██║     ██╔══╝
   ██║   ██║  ██║██║  ██║╚██████╗███████╗
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝"""


def render_banner(
    version: str = "0.2.0",
    environment: str = "development",
) -> Panel:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    theme = current_theme()

    content = Text.assemble(
        Text(TRACE_LOGO, style=theme.primary),
        "\n\n",
        Text("Open Source LLM Observability Platform", style=theme.secondary),
        "\n",
        Text(f"v{version}  |  {environment}  |  {now}", style="dim"),
    )

    return Panel(
        Align.center(content),
        box=ROUNDED,
        border_style=theme.border,
        padding=(1, 4),
    )
