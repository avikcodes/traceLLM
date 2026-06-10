from __future__ import annotations

from enum import Enum

from rich.panel import Panel
from rich.text import Text

from tracellm.themes import current_theme


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


def _style_for(state: MascotState) -> str:
    theme = current_theme()
    mapping = {
        MascotState.IDLE: theme.secondary,
        MascotState.LOADING: theme.info,
        MascotState.SUCCESS: theme.success,
        MascotState.WARNING: theme.warning,
    }
    return mapping.get(state, theme.secondary)


def render(state: MascotState = MascotState.IDLE) -> Text:
    return Text(DINOSAUR, style=_style_for(state))


def header(title: str, state: MascotState = MascotState.IDLE) -> Panel:
    dino = Text("🦖 ", style=_style_for(state))
    title_text = Text.assemble(dino, Text(title, style=current_theme().primary))
    return Panel("", title=title_text, border_style=current_theme().border)


def message(text: str, state: MascotState = MascotState.IDLE) -> Text:
    dino = Text("🦖 ", style=_style_for(state))
    return Text.assemble(dino, Text(text, style=_style_for(state)))
