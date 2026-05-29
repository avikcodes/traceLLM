"""Interactive command palette for TraceLLM CLI."""

from __future__ import annotations

import sys
from typing import Any

import typer
from rich.align import Align
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from tracellm.mascot import render, MascotState

_OPTIONS: list[tuple[str, str, str]] = [
    ("\U0001f996  Trace Request", "trace", "Run a traced prompt simulation"),
    ("\u21bb  Replay Trace", "replay", "Replay a saved trace from MongoDB"),
    ("\u21e7  Export Traces", "export", "Export traces to JSON or CSV"),
    ("\u25cb  Monitor Live", "monitor", "Watch incoming traces in realtime"),
    ("\u25b6  Start Stack", "start", "Start backend + dashboard"),
    ("\u2699  Create Project", "create-project", "Create a project and API key"),
]

_IS_WINDOWS = sys.platform == "win32"


def _get_key() -> str:
    """Read a single keypress from the terminal (cross-platform)."""
    if _IS_WINDOWS:
        return _get_key_windows()
    return _get_key_unix()


def _get_key_unix() -> str:
    """Unix key reader using termios/tty."""
    import termios
    import tty
    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        ch = sys.stdin.read(1)
        if ch == "\x1b":
            seq = sys.stdin.read(2)
            return {"[A": "up", "[B": "down", "[C": "right", "[D": "left"}.get(seq, "esc")
        if ch == "\r":
            return "enter"
        if ch == "\x03":
            return "ctrl_c"
        return ch
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)


def _get_key_windows() -> str:
    """Windows key reader using msvcrt."""
    import msvcrt
    ch = msvcrt.getch()
    if ch == b"\xe0":
        seq = msvcrt.getch()
        return {b"H": "up", b"P": "down", b"M": "right", b"K": "left"}.get(seq, "esc")
    if ch in (b"\r", b"\n"):
        return "enter"
    if ch == b"\x03":
        return "ctrl_c"
    if ch == b"q":
        return "q"
    return ch.decode("utf-8", errors="replace")


def _render_palette(options: list[tuple[str, str, str]], selected: int) -> Panel:
    """Render the interactive palette as a Rich Panel."""
    title = Text("TraceLLM Command Palette", style="bold white")
    subtitle = Text("Use arrow keys to navigate, Enter to select, q to quit", style="dim")

    table = Table.grid(padding=(0, 2))
    table.add_column(style="bright_black", width=2)
    table.add_column(style="white", width=20)
    table.add_column(style="dim")

    for i, (label, _, desc) in enumerate(options):
        indicator = "\u25b6" if i == selected else " "
        style = "bold cyan" if i == selected else "white"
        table.add_row(indicator, f"[{style}]{label}[/]", f"[bright_black]{desc}[/]")

    body = Table.grid(padding=(0, 1))
    body.add_column()
    body.add_row(Align.center(title))
    body.add_row(Align.center(subtitle))
    body.add_row(Text(""))
    body.add_row(Align.center(table))
    body.add_row(Text(""))
    body.add_row(Align.center(render(MascotState.IDLE)))

    return Panel(body, border_style="bright_black", padding=(1, 3))


def _prompt_for_trace(console: Any) -> str | None:
    """Prompt user for a trace prompt. Returns the prompt or None if empty."""
    console.print()
    console.print("[bold]Enter prompt:[/bold]")
    try:
        prompt = input().strip()
        return prompt if prompt else None
    except (EOFError, KeyboardInterrupt):
        return None


def run_palette(app: typer.Typer) -> None:
    """Show interactive command palette and let the user pick a command."""
    from tracellm.utils import console

    while True:
        selected = 0
        inline_input = False
        restart = False

        try:
            with Live(console=console, refresh_per_second=20, screen=True) as live:
                while True:
                    live.update(_render_palette(_OPTIONS, selected))
                    key = _get_key()

                    if key == "up":
                        selected = (selected - 1) % len(_OPTIONS)
                    elif key == "down":
                        selected = (selected + 1) % len(_OPTIONS)
                    elif key == "enter":
                        cmd = _OPTIONS[selected][1]
                        live.stop()
                        if cmd == "trace":
                            prompt = _prompt_for_trace(console)
                            if prompt:
                                app(args=["trace", prompt])
                                return
                            console.print("[yellow]Prompt cannot be empty. Returning to menu...[/yellow]")
                            restart = True
                        else:
                            app(args=[cmd])
                            return
                        break
                    elif key in ("q", "ctrl_c", "esc"):
                        live.stop()
                        return
                    elif key == "fallback":
                        inline_input = True
                        break
        except Exception:
            inline_input = True

        if inline_input:
            _run_fallback(app)
            return

        if not restart:
            break


def _run_fallback(app: typer.Typer) -> None:
    """Fallback numbered menu when raw terminal input is unavailable."""
    from tracellm.utils import console

    console.print()
    console.print(Text("TraceLLM Command Palette", style="bold white"))
    console.print()
    for i, (label, _, desc) in enumerate(_OPTIONS, 1):
        console.print(f"  [bright_black]{i}.[/] {label}  [dim]{desc}[/dim]")
    console.print(f"  [bright_black]0.[/] [dim]Quit[/dim]")
    console.print()

    try:
        choice = input("  Select [0-6]: ").strip()
        if choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(_OPTIONS):
                cmd = _OPTIONS[idx][1]
                if cmd == "trace":
                    prompt = input("  Enter prompt: ").strip()
                    if prompt:
                        app(args=["trace", prompt])
                else:
                    app(args=[cmd])
    except (EOFError, KeyboardInterrupt):
        pass
