from __future__ import annotations

from typing import Any

from rich.panel import Panel
from rich.text import Text
from rich.tree import Tree

from tracellm.themes import current_theme, success, error, secondary, tick
from tracellm.utils import console, latency_style


def _step_icon(step: dict[str, Any], active: bool, done: bool) -> str:
    if active:
        return "\u25b6"
    if not step.get("success", True):
        return "\u2717"
    if done:
        return "\u2713"
    return " "


def _step_label(step: dict[str, Any]) -> str:
    parts = []
    tool_name = step.get("tool_name", "unknown")
    duration = float(step.get("duration", 0.0))
    success_flag = bool(step.get("success", True))

    parts.append(tool_name)
    parts.append(secondary(f"{duration:.0f}ms"))
    if not success_flag:
        parts.append(error("RETRY"))

    return "  ".join(parts)


def build_execution_tree(
    steps: list[dict[str, Any]],
    active_index: int | None = None,
) -> Tree:
    theme = current_theme()
    tree = Tree(
        Text("agent:start", style=theme.primary),
        guide_style=theme.secondary,
    )

    for i, step in enumerate(steps, 1):
        is_active = active_index == i
        is_done = active_index is not None and i < active_index
        icon = _step_icon(step, is_active, is_done)

        if is_active:
            style = theme.info
        elif active_index is not None and i > active_index:
            style = "dim"
        else:
            style = theme.primary

        label = f"[{style}]{icon}[/]  [{style}]{_step_label(step)}[/]"

        if "children" in step and step["children"]:
            branch = tree.add(label)
            for child in step["children"]:
                c_icon = _step_icon(child, False, True)
                c_label = f"{c_icon}  {_step_label(child)}"
                branch.add(c_label)
        else:
            tree.add(label)

    status = "success" if all(s.get("success", True) for s in steps) else "warning"
    final_style = theme.success if status == "success" else theme.warning
    tree.add(f"[{final_style}]\u2713[/]  [{final_style}]done[/]")

    return tree


def render_execution_panel(
    steps: list[dict[str, Any]],
    active_index: int | None = None,
) -> Panel:
    tree = build_execution_tree(steps, active_index=active_index)
    return Panel(tree, title="Execution Tree", border_style=current_theme().border, padding=(1, 2))
