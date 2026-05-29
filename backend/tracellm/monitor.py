"""Live monitor dashboard — htop for AI systems.

Connects to the backend WebSocket for real-time trace events, falls back to
polling MongoDB when the server is unavailable, and reconnects automatically
on disconnect.
"""

from __future__ import annotations

import json
import logging
import os
import queue
import threading
import time
from typing import Any

from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from tracellm.mascot import MascotState, message
from tracellm.utils import console, status_style, latency_style

logger = logging.getLogger(__name__)

_WS_DEFAULT_HOST = os.environ.get("TRACELLM_WS_HOST", "127.0.0.1")
_WS_DEFAULT_PORT = int(os.environ.get("TRACELLM_WS_PORT", "8000"))


def _discover_ws_endpoint(hint_host: str, hint_port: int) -> tuple[str, int]:
    """Probe common ports if the hinted endpoint is unreachable.

    Tries the hint first, then falls through to common alternatives.
    Returns the first port that responds to a TCP connect.
    """
    import socket

    def _probe(host: str, port: int) -> bool:
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return True
        except (OSError, socket.error):
            return False

    if _probe(hint_host, hint_port):
        return hint_host, hint_port

    common_ports = [8000, 8001, 8080, 3000]
    tried = {hint_port}
    for p in common_ports:
        if p not in tried:
            tried.add(p)
            if _probe(hint_host, p):
                logger.info("Auto-discovered WS endpoint on port %d", p)
                return hint_host, p

    return hint_host, hint_port


# ── WebSocket background listener ──────────────────────────────────────


def _ws_listener(
    host: str,
    port: int,
    event_queue: queue.Queue,
    stop_event: threading.Event,
) -> None:
    """Background thread: connect to WebSocket and push events to the queue."""
    import asyncio

    import websockets

    async def _listen() -> None:
        nonlocal host, port
        discovered_host, discovered_port = _discover_ws_endpoint(host, port)
        host, port = discovered_host, discovered_port

        uri = f"ws://{host}:{port}/ws"
        retry_delay = 1.0

        while not stop_event.is_set():
            try:
                async with websockets.connect(uri, ping_interval=20) as ws:
                    retry_delay = 1.0
                    event_queue.put(("ws_connected", None))
                    # Consume the welcome message
                    try:
                        welcome = await asyncio.wait_for(ws.recv(), timeout=2)
                        event_queue.put(("ws_welcome", welcome))
                    except asyncio.TimeoutError:
                        pass

                    while not stop_event.is_set():
                        try:
                            raw = await asyncio.wait_for(ws.recv(), timeout=1)
                            data = json.loads(raw)
                            if data.get("type") == "trace.created":
                                event_queue.put(("trace", data["trace"]))
                        except asyncio.TimeoutError:
                            continue
                        except websockets.ConnectionClosed:
                            event_queue.put(("ws_disconnected", None))
                            break
            except asyncio.CancelledError:
                break
            except Exception as exc:
                event_queue.put(("ws_error", f"WebSocket: {exc}"))
                if retry_delay >= 2.0:
                    event_queue.put(("ws_retry", f"retrying in {retry_delay:.0f}s"))

            if not stop_event.is_set():
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, 30.0)

    asyncio.run(_listen())


# ── Stats computation ──────────────────────────────────────────────────


def _compute_stats(traces: list[Any]) -> dict[str, Any]:
    total = len(traces)
    completed = sum(1 for t in traces if getattr(t, "status", "") == "success")
    errors = sum(1 for t in traces if getattr(t, "status", "") in ("failed", "warning"))
    latencies = [float(t.latency) for t in traces if hasattr(t, "latency") and t.latency is not None]
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    sorted_lats = sorted(latencies)
    p95 = sorted_lats[int(len(sorted_lats) * 0.95)] if sorted_lats else 0.0
    total_tokens = sum(int(t.token_count) for t in traces if hasattr(t, "token_count") and t.token_count is not None)

    return {
        "total": total,
        "completed": completed,
        "errors": errors,
        "avg_latency": avg_latency,
        "p95_latency": p95,
        "total_tokens": total_tokens,
    }


# ── Dashboard rendering ────────────────────────────────────────────────


def _render_dashboard(
    stats: dict[str, Any],
    traces: list[Any],
    refresh: float,
    seen_count: int,
    ws_status: str,
    ws_detail: str,
    polling: bool,
) -> Panel:
    status_line = message("Monitor active", MascotState.LOADING)

    stats_table = Table.grid(padding=(0, 3))
    stats_table.add_column(style="bright_black", width=20)
    stats_table.add_column(style="white")

    stats_table.add_row("Total Traces", str(stats["total"]))
    stats_table.add_row("Completed", f"[green]{stats['completed']}[/green]")
    stats_table.add_row("Errors", f"[red]{stats['errors']}[/red]")
    stats_table.add_row("Avg Latency", f"{stats['avg_latency']:.0f} ms")
    stats_table.add_row("P95 Latency", f"[yellow]{stats['p95_latency']:.0f} ms[/yellow]")
    stats_table.add_row("Total Tokens", f"{stats['total_tokens']:,}")

    if ws_status:
        stats_table.add_row("WebSocket", ws_status)
    if ws_detail:
        stats_table.add_row("", f"[bright_black]{ws_detail}[/bright_black]")

    traces_table = Table(box=None, padding=(0, 2), header_style="dim")
    traces_table.add_column("Time", width=8)
    traces_table.add_column("Status", width=8, justify="center")
    traces_table.add_column("Model", width=16, no_wrap=True)
    traces_table.add_column("Latency", justify="right", width=10)
    traces_table.add_column("Tokens", justify="right", width=8)
    traces_table.add_column("Steps", justify="right", width=5)
    traces_table.add_column("Prompt", width=36)

    for t in traces:
        ts = t.created_at.strftime("%H:%M:%S") if hasattr(t.created_at, "strftime") else str(t.created_at)[11:19]
        lat = float(t.latency) if hasattr(t, "latency") and t.latency is not None else 0.0
        traces_table.add_row(
            ts,
            f"[{status_style(t.status)}]{t.status.upper()}[/]",
            str(getattr(t, "model_name", "?") or "?")[:16],
            f"[{latency_style(lat)}]{lat:.0f}ms[/]",
            str(getattr(t, "token_count", 0) or 0),
            str(len(getattr(t, "steps", []) or [])),
            str(getattr(t, "prompt", "") or "")[:36],
        )

    stats_panel = Panel(
        stats_table,
        title="\U0001f4ca  Overview",
        border_style="bright_black",
        padding=(1, 2),
    )
    traces_panel = Panel(
        traces_table,
        title=f"\U0001f4cb  Recent Traces  ({seen_count} unique)",
        border_style="bright_black",
        padding=(1, 2),
    )

    body = Table.grid(padding=(0, 1))
    body.add_column()
    body.add_row(status_line)
    body.add_row(Text(""))
    body.add_row(stats_panel)
    body.add_row(Text(""))
    body.add_row(traces_panel)

    subtitle_parts = [f"Ctrl+C to stop"]
    if polling:
        subtitle_parts.append(f"polling every {refresh}s")
    else:
        subtitle_parts.append("live via WebSocket")
    subtitle = " \u2014 ".join(subtitle_parts)

    return Panel(
        body,
        title="TraceLLM Monitor",
        subtitle=subtitle,
        border_style="bright_black",
        padding=(1, 2),
    )


# ── Main entry point ───────────────────────────────────────────────────


def run_monitor(
    refresh: float = 2.0,
    limit: int = 10,
    ws_host: str = _WS_DEFAULT_HOST,
    ws_port: int = _WS_DEFAULT_PORT,
) -> None:
    """Run the live monitor dashboard.

    Connects to the TraceLLM backend WebSocket for real-time trace events.
    Falls back to polling MongoDB when the server is unavailable.
    Reconnects automatically on disconnect.

    When WebSocket is connected, polling is suspended and only live events
    drive the display for minimal DB overhead.
    """
    from tracellm.db import fetch_recent_traces

    seen: set[str] = set()
    event_queue: queue.Queue = queue.Queue()
    stop_event = threading.Event()
    ws_status = ""
    ws_detail = ""
    ws_connected = False
    has_ever_connected = False
    needs_initial_fetch = True

    console.print()
    console.print(message("Monitor starting...", MascotState.LOADING))
    console.print()

    # Start WebSocket listener in background thread
    ws_thread = threading.Thread(
        target=_ws_listener,
        args=(ws_host, ws_port, event_queue, stop_event),
        daemon=True,
    )
    ws_thread.start()

    # Local cache of traces seen via WebSocket events
    ws_traces: list[Any] = []
    db_traces: list[Any] = []

    with Live(console=console, refresh_per_second=4, screen=True) as live:
        try:
            while True:
                # Drain queued WebSocket events
                while not event_queue.empty():
                    try:
                        evt_type, evt_data = event_queue.get_nowait()
                        if evt_type == "ws_connected":
                            ws_status = "[green]\u25cf Connected[/green]"
                            ws_detail = ""
                            ws_connected = True
                            has_ever_connected = True
                        elif evt_type == "ws_welcome":
                            pass
                        elif evt_type == "ws_disconnected":
                            ws_status = "[yellow]\u25cf Disconnected[/yellow]"
                            ws_detail = "reconnecting..."
                            ws_connected = False
                        elif evt_type == "ws_error":
                            if not has_ever_connected:
                                ws_status = "[yellow]\u25cf Unavailable[/yellow]"
                                ws_detail = "polling MongoDB"
                            else:
                                ws_status = "[yellow]\u25cf Error[/yellow]"
                                ws_detail = str(evt_data)[:40]
                            ws_connected = False
                        elif evt_type == "ws_retry":
                            ws_status = "[yellow]\u25cf Reconnecting[/yellow]"
                            ws_detail = str(evt_data)
                            ws_connected = False
                        elif evt_type == "trace":
                            # Build a lightweight object so _compute_stats can read it
                            t = _make_trace_obj(evt_data)
                            if t.trace_id not in seen:
                                seen.add(t.trace_id)
                                ws_traces.insert(0, t)
                                ws_traces = ws_traces[:limit]
                    except queue.Empty:
                        break

                # Decide whether to poll MongoDB or use live data
                if needs_initial_fetch or not ws_connected:
                    try:
                        db_traces = fetch_recent_traces(limit=limit)
                        for t in db_traces:
                            seen.add(t.trace_id)
                        needs_initial_fetch = False
                    except Exception as exc:
                        live.update(Panel(
                            f"[yellow]DB poll error: {exc}[/yellow]\n"
                            f"[bright_black]will retry in {refresh}s[/bright_black]",
                            title="Monitor",
                            border_style="bright_black",
                        ))
                        time.sleep(refresh)
                        continue

                # Use WS traces when connected, DB traces otherwise
                display_traces = ws_traces if (ws_connected and has_ever_connected and ws_traces) else db_traces
                polling = not ws_connected or not has_ever_connected

                try:
                    stats = _compute_stats(display_traces)
                    live.update(_render_dashboard(
                        stats, display_traces, refresh, len(seen),
                        ws_status, ws_detail, polling,
                    ))
                except Exception as exc:
                    live.update(Panel(
                        f"[yellow]Render error: {exc}[/yellow]",
                        title="Monitor",
                        border_style="bright_black",
                    ))

                # Sleep in smaller increments so we can respond to Ctrl+C quickly
                for _ in range(int(refresh * 4)):
                    if stop_event.is_set():
                        break
                    time.sleep(0.25)

        except KeyboardInterrupt:
            stop_event.set()
            raise

        finally:
            stop_event.set()


def _make_trace_obj(data: dict[str, Any]) -> Any:
    """Convert a trace dict from WebSocket into a simple object compatible with _compute_stats."""

    class _TraceObj:
        def __init__(self, d: dict[str, Any]) -> None:
            self.trace_id = d.get("trace_id", "")
            self.status = d.get("status", "success")
            self.latency = d.get("latency", 0.0)
            self.token_count = d.get("token_count", 0)
            self.model_name = d.get("model_name", "?")
            self.prompt = d.get("prompt", "")
            self.created_at = d.get("created_at", "")
            steps = d.get("steps", []) or []
            self.steps = steps if isinstance(steps, list) else []

    return _TraceObj(data)
