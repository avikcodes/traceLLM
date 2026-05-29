import os
import subprocess
import sys
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv
from rich.panel import Panel
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.table import Table

from tracellm.banner import render_banner
from tracellm.mascot import MascotState, message
from tracellm.utils import console

load_dotenv()


def _check_mongodb() -> bool:
    try:
        import pymongo
        mongo_url = os.getenv("MONGO_URL")
        if not mongo_url:
            console.print("[yellow]MONGO_URL not set — traces won't be persisted[/yellow]")
            return False
        client = pymongo.MongoClient(mongo_url, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        client.close()
        return True
    except Exception:
        console.print("[yellow]MongoDB not reachable — traces won't be persisted[/yellow]")
        return False


def _start_fastapi(port: int) -> subprocess.Popen:
    backend_dir = Path(__file__).resolve().parent.parent
    env = os.environ.copy()
    env["PYTHONPATH"] = str(backend_dir)

    process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(port), "--reload"],
        cwd=backend_dir,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return process


def _health_check(port: int, timeout: int = 15) -> bool:
    start = time.time()
    with console.status("[bold white]Waiting for API server...[/bold white]"):
        while time.time() - start < timeout:
            try:
                response = httpx.get(f"http://127.0.0.1:{port}/", timeout=3)
                if response.status_code == 200:
                    return True
            except (httpx.ConnectError, httpx.TimeoutException):
                pass
            time.sleep(0.5)
    return False


def _render_status(mongodb_ok: bool, api_ok: bool, port: int, dashboard_port: int, launch_dashboard: bool) -> None:
    table = Table.grid(padding=(0, 2))
    table.add_column()
    table.add_column()

    table.add_row(
        "API Server",
        f"[green]●[/green] http://127.0.0.1:{port}" if api_ok else "[red]●[/red] Failed",
    )
    table.add_row(
        "MongoDB",
        "[green]● Connected[/green]" if mongodb_ok else "[yellow]● Skipped[/yellow]",
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

    mongodb_ok = _check_mongodb()
    console.print(f"  [green]✓[/green] MongoDB connected" if mongodb_ok else f"  [red]✗[/red] MongoDB unavailable")

    api_process = _start_fastapi(port)
    api_ok = _health_check(port)
    console.print(f"  [green]✓[/green] API ready" if api_ok else f"  [red]✗[/red] API failed")
    console.print(f"  [green]✓[/green] WebSocket ready" if api_ok else f"  [red]✗[/red] WebSocket unavailable")

    if launch_dashboard and api_ok:
        import webbrowser
        webbrowser.open(f"http://localhost:{dashboard_port}")

    _render_status(mongodb_ok, api_ok, port, dashboard_port, launch_dashboard)

    try:
        api_process.wait()
    except KeyboardInterrupt:
        console.print("\n[yellow]Shutting down...[/yellow]")
        api_process.terminate()
        api_process.wait()
        console.print("[green]Stopped.[/green]")
