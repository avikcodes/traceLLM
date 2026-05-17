import time
import uuid
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Optional

import typer
from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from app.database.trace_service import save_trace_sync

console = Console()
cli = typer.Typer()


def estimate_tokens(text: str) -> int:
    """Simple token estimation: ~1 token per word."""
    if not text:
        return 0
    return len(text.split())


def _build_report(
    trace_id: str,
    prompt: str,
    response: str,
    latency: float,
    token_count: int,
    timestamp: str,
    status: str = "SUCCESS",
) -> Panel:
    """Build a rich Panel with the full trace report."""
    status_color = "green" if status == "SUCCESS" else "red"
    status_icon = "✓" if status == "SUCCESS" else "✗"

    table = Table(show_header=False, box=box.ROUNDED, padding=(0, 2))
    table.add_column("Field", style="bold yellow", width=14)
    table.add_column("Value")

    table.add_row("Trace ID", f"[bold cyan]{trace_id}[/bold cyan]")
    table.add_row("Prompt", prompt)
    preview = (response[:80] + "...") if len(response) > 80 else response
    table.add_row("Response", preview)
    table.add_row("Latency", f"[bold green]{latency:.4f}s[/bold green]")
    table.add_row("Token Count", f"[bold blue]{token_count}[/bold blue]")
    table.add_row("Status", f"[bold {status_color}]{status_icon} {status}[/bold {status_color}]")
    table.add_row("Timestamp", timestamp)

    return Panel(
        table,
        title="[bold cyan]TraceLLM Trace Report[/bold cyan]",
        border_style="cyan",
        box=box.HEAVY,
        padding=(1, 2),
    )


def trace(func: Optional[Callable] = None, *, prompt: str = "") -> Callable:
    """
    Trace decorator for LLM function calls.

    Usage:
        @trace
        def my_func(): ...

        @trace(prompt="Explain transformers")
        def my_func(): ...
    """

    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            trace_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()

            start = time.perf_counter()
            with console.status(
                "[bold cyan]⏳ Processing LLM call...", spinner="dots"
            ):
                response = f(*args, **kwargs)
            latency = time.perf_counter() - start

            token_count = estimate_tokens(prompt) + estimate_tokens(response)

            payload = {
                "trace_id": trace_id,
                "prompt": prompt,
                "response": response,
                "latency": round(latency, 4),
                "token_count": token_count,
                "timestamp": timestamp,
            }

            console.print()
            report = _build_report(
                trace_id=trace_id,
                prompt=prompt,
                response=response,
                latency=latency,
                token_count=token_count,
                timestamp=timestamp,
                status="SUCCESS",
            )
            console.print(report)

            save_trace_sync(payload)

            return payload

        return wrapper

    if func is not None:
        return decorator(func)

    return decorator


@cli.command()
def run() -> None:
    """Run the example traced LLM call."""
    result = llm_response()
    console.print(
        f"\n[dim]Trace complete — payload has {len(result)} fields[/dim]"
    )


@cli.command()
def demo() -> None:
    """Run a quick demo of the trace system."""
    console.rule("[bold cyan]TraceLLM Demo")
    console.print("[yellow]Running traced LLM call...[/yellow]\n")

    result = llm_response()

    console.print("\n[green]✓ Demo finished successfully[/green]")
    console.print(f"[dim]trace_id: {result['trace_id']}[/dim]")


@trace(prompt="Explain transformers")
def llm_response() -> str:
    return (
        "Transformers are neural networks that use self-attention mechanisms "
        "to process sequential data in parallel, enabling efficient training "
        "on large datasets."
    )


if __name__ == "__main__":
    cli()
