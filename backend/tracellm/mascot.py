"""TraceLLM dinosaur mascot."""

from __future__ import annotations

from enum import Enum

from rich.panel import Panel
from rich.text import Text


class MascotState(Enum):
    IDLE = "idle"
    LOADING = "loading"
    SUCCESS = "success"
    WARNING = "warning"


DINOSAUR = """\
      __
     / _)
 .-^^^-/ /
__/       /
<__.|_|-|_|"""


_STYLE: dict[MascotState, str] = {
    MascotState.IDLE: "bright_black",
    MascotState.LOADING: "cyan",
    MascotState.SUCCESS: "green",
    MascotState.WARNING: "yellow",
}


def render(state: MascotState = MascotState.IDLE) -> Text:
    """Full ASCII dinosaur art with state-based styling."""
    return Text(DINOSAUR, style=_STYLE[state])


def header(title: str, state: MascotState = MascotState.IDLE) -> Panel:
    """Compact header Panel with mascot prefix."""
    dino = Text("🦖 ", style=_STYLE[state])
    title_text = Text.assemble(dino, Text(title, style="bold white"))
    return Panel("", title=title_text, border_style="bright_black")


def message(text: str, state: MascotState = MascotState.IDLE) -> Text:
    """One-line mascot message (e.g. \"🦖 Trace complete\")."""
    dino = Text("🦖 ", style=_STYLE[state])
    return Text.assemble(dino, Text(text, style=_STYLE[state]))
