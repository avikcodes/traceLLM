import os
import subprocess
import sys
import time
from pathlib import Path

import httpx
from rich.panel import Panel
from rich.table import Table

from tracellm.banner import render_banner
from tracellm.mascot import MascotState, message
from tracellm.utils import console

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _start_fastapi(port: int) -> subprocess.Popen:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)

    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(port), "--reload"],
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return process


def _health_check(port: int, timeout: int = 30) -> tuple[bool, str, str]:
    """Poll the API health endpoint.

    Returns (api_ok, storage_type, storage_detail).
    """
    start = time.time()
    with console.status("[bold white]Waiting for API server...[/bold white]"):
        while time.time() - start < timeout:
            try:
                response = httpx.get(f"http://127.0.0.1:{port}/", timeout=3)
                body = response.json()
                if response.status_code == 200:
                    storage_type = body.get("storage_type", "sqlite")
                    storage_detail = body.get("storage_detail", "traces.db")
                    return (True, storage_type, storage_detail)
            except Exception:
                pass
            time.sleep(0.5)

    return (False, "", "")


def _render_status(storage_type: str, storage_detail: str, api_ok: bool, port: int, dashboard_port: int, launch_dashboard: bool) -> None:
    table = Table.grid(padding=(0, 2))
    table.add_column()
    table.add_column()

    table.add_row(
        "API Server",
        f"[green]●[/green] http://127.0.0.1:{port}" if api_ok else "[red]●[/red] Failed",
    )
    if storage_type == "sqlite":
        table.add_row(
            "Storage",
            f"[green]●[/green] SQLite Local [dim]({storage_detail})[/dim]",
        )
    else:
        table.add_row(
            "Storage",
            f"[green]●[/green] MongoDB [dim]({storage_detail})[/dim]",
        )
    table.add_row(
        "Dashboard",
        f"[green]● http://localhost:{dashboard_port}[/green]" if launch_dashboard else "[dim]● Not launched[/dim]",
    )
    table.add_row(
        "WebSocket",
        f"[dim]ws://127.0.0.1:{port}/ws[/dim]",
    )

    console.print()
    console.print(
        Panel.fit(table, title="TraceLLM Stack", border_style="bright_black", padding=(1, 3))
    )
    console.print()


def run_start(port: int = 8000, dashboard_port: int = 3000, launch_dashboard: bool = False) -> None:
    console.print()
    console.print(render_banner())
    console.print()
    console.print(message("TraceLLM starting...", MascotState.LOADING))
    console.print()

    api_process = _start_fastapi(port)
    api_ok, storage_type, storage_detail = _health_check(port)

    if api_ok:
        console.print(f"  [green]✓[/green] API ready")
        if storage_type == "sqlite":
            console.print(f"  [green]✓[/green] SQLite initialized")
        else:
            console.print(f"  [green]✓[/green] MongoDB connected")
        console.print(f"  [green]✓[/green] WebSocket ready")
    else:
        console.print(f"  [red]✗[/red] API failed")
        console.print(f"  [red]✗[/red] Storage unavailable")
        console.print(f"  [red]✗[/red] WebSocket unavailable")

    if launch_dashboard and api_ok:
        import webbrowser
        webbrowser.open(f"http://localhost:{dashboard_port}")

    _render_status(storage_type, storage_detail, api_ok, port, dashboard_port, launch_dashboard)

    try:
        api_process.wait()
    except KeyboardInterrupt:
        console.print("\n[yellow]Shutting down...[/yellow]")
        api_process.terminate()
        api_process.wait()
        console.print("[green]Stopped.[/green]")
