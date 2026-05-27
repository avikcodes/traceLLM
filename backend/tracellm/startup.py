import os
import subprocess
import sys
import time
import webbrowser
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

from rich.panel import Panel
from rich.table import Table

from tracellm.utils import console

BACKEND_PORT = 8000
DASHBOARD_PORT = 3000
HEALTH_TIMEOUT = 15.0
DB_TIMEOUT_MS = 5000


def _find_backend_dir() -> Path:
    return Path(__file__).resolve().parent.parent


def _load_env() -> None:
    try:
        from dotenv import load_dotenv

        backend_dir = _find_backend_dir()
        env_path = backend_dir / ".env"
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
        else:
            load_dotenv()
    except ImportError:
        pass


def _check_mongodb() -> tuple[bool, str]:
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        return False, "MONGO_URL not set"

    try:
        from pymongo import MongoClient

        client = MongoClient(mongo_url, serverSelectionTimeoutMS=DB_TIMEOUT_MS)
        client.admin.command("ping")
        client.close()
        return True, "MongoDB connected"
    except Exception as exc:
        reason = str(exc).split(".")[0] if "." in str(exc) else str(exc)
        return False, f"MongoDB unreachable: {reason}"


def _start_backend(port: int) -> subprocess.Popen | None:
    backend_dir = _find_backend_dir()
    env = os.environ.copy()

    pythonpath = env.get("PYTHONPATH", "")
    sep = ";" if sys.platform == "win32" else ":"
    env["PYTHONPATH"] = f"{backend_dir}{sep}{pythonpath}" if pythonpath else str(backend_dir)

    try:
        proc = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", str(port)],
            cwd=backend_dir,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return proc
    except FileNotFoundError:
        return None


def _check_health(port: int, timeout: float) -> bool:
    url = f"http://127.0.0.1:{port}/"
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urlopen(Request(url), timeout=2) as resp:
                if resp.status == 200:
                    return True
        except (URLError, ConnectionResetError, TimeoutError, OSError):
            pass
        time.sleep(0.3)
    return False


def _render_startup_screen(
    mongo_ok: bool,
    health_ok: bool,
    port: int,
    dashboard_port: int,
    launch_dashboard: bool,
) -> None:
    console.print()

    grid = Table.grid(padding=(0, 2))
    grid.add_column(no_wrap=True)
    grid.add_column()
    grid.add_row("[bold white]TraceLLM[/bold white]", "[bright_black]local observability infrastructure[/bright_black]")
    grid.add_row("", "")
    grid.add_row(
        "[green]●[/green]" if mongo_ok else "[red]●[/red]",
        f"[{'green' if mongo_ok else 'red'}]{'MongoDB connected' if mongo_ok else 'MongoDB connection failed'}[/]",
    )
    grid.add_row(
        "[green]●[/green]" if health_ok else "[red]●[/red]",
        f"[{'green' if health_ok else 'red'}]{'API server running' if health_ok else 'API server failed to start'}[/]",
    )
    if health_ok:
        grid.add_row("[green]●[/green]", "[green]WebSocket ready[/green]")

    body = grid
    subtitle = f"[dim]http://127.0.0.1:{port}[/dim]"

    console.print(Panel(body, title="Startup", subtitle=subtitle, border_style="bright_black", padding=(1, 2)))

    if health_ok:
        info = Table.grid(padding=(0, 3))
        info.add_column(style="bright_black", no_wrap=True)
        info.add_column(style="white")
        info.add_row("API", f"http://127.0.0.1:{port}")
        info.add_row("Dashboard", f"http://localhost:{dashboard_port}")
        info.add_row("WebSocket", f"ws://127.0.0.1:{port}/ws")
        console.print()
        console.print(Panel(info, border_style="bright_black", padding=(1, 2)))
        if launch_dashboard:
            webbrowser.open(f"http://localhost:{dashboard_port}")
        console.print()
        console.print("[dim]Press Ctrl+C to stop[/dim]")
        console.print()


def _render_mongo_error(reason: str) -> None:
    console.print()
    console.print(
        Panel.fit(
            f"[yellow]{reason}[/yellow]\n\n"
            f"[bright_black]Check that:[/bright_black]\n"
            f"  [bright_black]1.[/bright_black] [bold]MONGO_URL[/bold] is set in [dim].env[/dim]\n"
            f"  [bright_black]2.[/bright_black] MongoDB is running and accessible\n"
            f"  [bright_black]3.[/bright_black] Network/firewall allows the connection\n\n"
            f"[bright_black]Tip:[/bright_black] [dim]create a [bold].env[/bold] file in the backend directory[/dim]",
            title="Startup Error",
            border_style="red",
            padding=(1, 2),
        )
    )
    console.print()


def _render_start_error(port: int) -> None:
    console.print()
    console.print(
        Panel.fit(
            "[yellow]The API server did not start within the timeout.[/yellow]\n\n"
            f"[bright_black]Check that:[/bright_black]\n"
            f"  [bright_black]1.[/bright_black] Port [bold]{port}[/bold] is not in use\n"
            f"  [bright_black]2.[/bright_black] All dependencies are installed\n"
            f"  [bright_black]3.[/bright_black] [bold].env[/bold] is configured\n\n"
            f"[bright_black]Try running manually:[/bright_black]\n"
            f"  [dim]cd backend && uvicorn main:app --reload --port {port}[/dim]",
            title="Startup Error",
            border_style="red",
            padding=(1, 2),
        )
    )
    console.print()


def run_start(port: int = BACKEND_PORT, dashboard_port: int = DASHBOARD_PORT, launch_dashboard: bool = False) -> None:
    _load_env()

    mongo_ok, mongo_msg = _check_mongodb()
    if not mongo_ok:
        _render_mongo_error(mongo_msg)
        raise SystemExit(1)

    proc = _start_backend(port=port)
    if proc is None:
        console.print("[red]uvicorn not found. Install it with: pip install uvicorn[/red]")
        raise SystemExit(1)

    health_ok = _check_health(port=port, timeout=HEALTH_TIMEOUT)

    _render_startup_screen(
        mongo_ok=mongo_ok,
        health_ok=health_ok,
        port=port,
        dashboard_port=dashboard_port,
        launch_dashboard=launch_dashboard,
    )

    if not health_ok:
        _render_start_error(port)
        proc.terminate()
        raise SystemExit(1)

    try:
        proc.wait()
    except KeyboardInterrupt:
        console.print()
        console.print("[yellow]Shutting down...[/yellow]")
        proc.terminate()
        console.print("[green]●[/green] TraceLLM stopped")
        console.print()
