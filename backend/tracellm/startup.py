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
from tracellm.themes import current_theme, success, warning as warn, cross, tick
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
    start = time.time()
    theme = current_theme()
    with console.status(f"[{theme.info}]Waiting for API server...[/]"):
        while time.time() - start < timeout:
            try:
                response = httpx.get(f"http://127.0.0.1:{port}/api/", timeout=3)
                body = response.json()
                if response.status_code == 200:
                    storage_type = body.get("storage_type", "sqlite")
                    storage_detail = body.get("storage_detail", "traces.db")
                    return (True, storage_type, storage_detail)
            except Exception:
                pass
            time.sleep(0.5)

    return (False, "", "")


def _open_browser(url: str) -> None:
    import webbrowser
    webbrowser.open(url)


def _render_status(storage_type: str, storage_detail: str, api_ok: bool, port: int) -> None:
    theme = current_theme()
    table = Table.grid(padding=(0, 2))
    table.add_column()
    table.add_column()

    table.add_row(
        "API Server",
        f"{tick()} http://127.0.0.1:{port}" if api_ok else f"{cross()} Failed",
    )
    if storage_type == "sqlite":
        table.add_row(
            "Storage",
            f"{tick()} SQLite Local [dim]({storage_detail})[/dim]",
        )
    else:
        table.add_row(
            "Storage",
            f"{tick()} MongoDB [dim]({storage_detail})[/dim]",
        )
    table.add_row(
        "WebSocket",
        f"[dim]ws://127.0.0.1:{port}/ws[/dim]",
    )
    table.add_row(
        "Dashboard",
        f"{tick()} http://127.0.0.1:{port}" if api_ok else f"{cross()} Unavailable",
    )

    console.print()
    console.print(
        Panel.fit(table, title="TraceLLM Stack", border_style=theme.border, padding=(1, 3))
    )


def run_start(port: int = 8000, dashboard_port: int = 3000, no_browser: bool = False) -> None:
    console.print()
    console.print(render_banner())
    console.print(message("TraceLLM starting...", MascotState.LOADING))

    api_process = _start_fastapi(port)
    api_ok, storage_type, storage_detail = _health_check(port)

    console.print()

    if api_ok:
        if storage_type == "sqlite":
            console.print(f"  {tick()} SQLite connected")
        else:
            console.print(f"  {tick()} MongoDB connected")
        console.print(f"  {tick()} API ready")
        console.print(f"  {tick()} WebSocket ready")
        console.print(f"  {tick()} Dashboard ready")

        if not no_browser:
            console.print(f"  {tick()} Opening browser...")
            _open_browser(f"http://127.0.0.1:{port}")
    else:
        console.print(f"  {cross()} API failed")
        console.print(f"  {cross()} Storage unavailable")
        console.print(f"  {cross()} WebSocket unavailable")

    _render_status(storage_type, storage_detail, api_ok, port)

    console.print()
    console.print(message("Tracey: Ready to monitor your AI workflows", MascotState.SUCCESS))

    try:
        api_process.wait()
    except KeyboardInterrupt:
        console.print(f"\n{warn('Shutting down...')}")
        api_process.terminate()
        api_process.wait()
        console.print(success("Stopped."))
