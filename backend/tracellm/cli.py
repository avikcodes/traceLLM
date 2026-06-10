import os

import typer

from tracellm.db import create_project_with_key
from tracellm.exporter import export_traces
from tracellm.replay import replay_trace
from tracellm.startup import run_start
from tracellm.tracer import llm_response, run_live_trace
from tracellm.utils import console, render_project_credentials

app = typer.Typer(help="TraceLLM SDK and developer CLI.")

theme_app = typer.Typer(help="Manage CLI themes.")
app.add_typer(theme_app, name="theme")


@app.callback(invoke_without_command=True)
def cli_entry(ctx: typer.Context) -> None:
    if ctx.invoked_subcommand is None:
        from tracellm.palette import run_palette
        run_palette(app)


@theme_app.command("list")
def theme_list() -> None:
    """List all available themes."""
    from tracellm.themes import get_available_themes, get_current_theme_name
    themes = get_available_themes()
    current = get_current_theme_name()
    console.print()
    console.print("[bold]Available Themes:[/bold]")
    console.print()
    for t in themes:
        marker = "●" if t == current else " "
        style = "bold white" if t == current else "white"
        console.print(f"  {marker} [{style}]{t}[/]")
    console.print()


@theme_app.command("current")
def theme_current() -> None:
    """Show the current theme."""
    from tracellm.themes import get_current_theme_name
    name = get_current_theme_name()
    console.print()
    console.print(f"[bold]Current Theme:[/bold] {name}")
    console.print()


@theme_app.command("set")
def theme_set(
    theme: str = typer.Argument(..., help="Theme name to activate."),
) -> None:
    """Switch to a theme."""
    from tracellm.themes import get_theme, set_current_theme
    found = get_theme(theme)
    if found is None:
        available = get_available_themes()
        console.print(f"[red]Unknown theme:[/red] {theme}")
        console.print(f"[dim]Available themes: {', '.join(available)}[/dim]")
        raise typer.Exit(code=1)
    set_current_theme(theme)
    console.print()
    console.print(f"  Theme changed to [bold]{found.name.title()}.[/bold]")
    console.print()


@theme_app.command("reset")
def theme_reset() -> None:
    """Reset theme back to default (dark)."""
    from tracellm.themes import reset_theme
    reset_theme()
    console.print()
    console.print("  Theme reset to default.")
    console.print()


@theme_app.command("create")
def theme_create() -> None:
    """Create a custom theme interactively."""
    from tracellm.themes import save_custom_theme
    name = typer.prompt("Theme name").strip().lower()
    if not name:
        console.print("[red]Theme name cannot be empty.[/red]")
        raise typer.Exit(code=1)
    console.print("Enter hex colors (e.g. #ff0000) or Rich style names (e.g. bold white, green).")
    primary = typer.prompt("Primary color", default="bold white").strip()
    secondary = typer.prompt("Secondary color", default="bright_black").strip()
    success = typer.prompt("Success color", default="green").strip()
    warning = typer.prompt("Warning color", default="yellow").strip()
    error = typer.prompt("Error color", default="red").strip()
    info = typer.prompt("Info color", default="cyan").strip()
    border = typer.prompt("Border color", default="bright_black").strip()
    accent = typer.prompt("Accent color", default="bold white").strip()

    theme_data = {
        "primary": primary,
        "secondary": secondary,
        "success": success,
        "warning": warning,
        "error": error,
        "info": info,
        "border": border,
        "accent": accent,
    }
    save_custom_theme(name, theme_data)
    console.print()
    console.print(f"  Custom theme [bold]{name}[/bold] created.")
    console.print()


@app.command()
def demo() -> None:
    """Generate a realistic demo trace."""
    result = llm_response()
    retries = result.get("retry_count", 0)
    steps = len(result.get("steps", []))
    from tracellm.themes import primary, secondary
    console.print()
    console.print(primary("Demo complete"))
    console.print(secondary(f"{steps} steps, {retries} retries"))
    console.print()


@app.command()
def start(
    port: int = typer.Option(8000, "--port", "-p", help="Port for the API server."),
    dashboard_port: int = typer.Option(3000, "--dashboard-port", help="Port for the frontend dashboard."),
    no_browser: bool = typer.Option(False, "--no-browser", help="Start the stack without opening the browser."),
) -> None:
    """Start the TraceLLM observability stack (backend + dashboard)."""
    run_start(port=port, dashboard_port=dashboard_port, no_browser=no_browser)


@app.command("trace")
def trace_command(
    prompt: str = typer.Argument(..., help="Prompt to trace."),
    model: str = typer.Option("gpt-4.1-mini", "--model", help="Model name label for the trace."),
    project: str = typer.Option("default", "--project", help="Project identifier or display name."),
    environment: str = typer.Option("development", "--environment", help="Environment label."),
    api_key: str | None = typer.Option(None, "--api-key", help="TraceLLM API key."),
) -> None:
    """Run a production-style traced prompt simulation."""
    run_live_trace(
        prompt=prompt,
        model_name=model,
        project=project,
        environment=environment,
        api_key=api_key,
        render=True,
    )


@app.command()
def replay(
    trace_id: str = typer.Argument(..., help="Trace ID to replay."),
    speed: float = typer.Option(1.0, "--speed", min=0.1, help="Replay speed multiplier."),
    show_response: bool = typer.Option(False, "--show-response", help="Show the full saved response after replay."),
) -> None:
    """Replay a saved trace in the terminal."""
    replay_trace(trace_id=trace_id, speed=speed, show_response=show_response)


@app.command()
def monitor(
    refresh: float = typer.Option(2.0, "--refresh", "-r", help="Polling interval in seconds."),
    limit: int = typer.Option(10, "--limit", "-l", help="Number of recent traces to show."),
    ws_host: str = typer.Option(os.environ.get("TRACELLM_WS_HOST", "127.0.0.1"), "--ws-host", help="Backend WebSocket host. Falls back to TRACELLM_WS_HOST env."),
    ws_port: int = typer.Option(int(os.environ.get("TRACELLM_WS_PORT", "8000")), "--ws-port", help="Backend WebSocket port. Falls back to TRACELLM_WS_PORT env."),
) -> None:
    """Watch incoming real traces in realtime."""
    from tracellm.monitor import run_monitor as _run_monitor
    from tracellm.themes import warning as warn
    try:
        _run_monitor(refresh=refresh, limit=limit, ws_host=ws_host, ws_port=ws_port)
    except KeyboardInterrupt:
        console.print(f"\n{warn('Monitor stopped.')}")


@app.command()
def export(
    format: str = typer.Option("json", "--format", help="Export format: json or csv."),
    limit: int = typer.Option(100, "--limit", min=1, max=1000, help="How many recent traces to export."),
) -> None:
    """Export traces from storage."""
    normalized = format.lower()
    if normalized not in {"json", "csv"}:
        raise typer.BadParameter("format must be one of: json, csv")
    export_traces(export_format=normalized, limit=limit)


@app.command("create-project")
def create_project_command() -> None:
    """Create a project and generate a secure API key."""
    name = typer.prompt("Project name").strip()
    description = typer.prompt("Description", default="", show_default=False).strip()
    environment = typer.prompt("Environment", default="development").strip().lower()
    if environment not in {"development", "staging", "production"}:
        raise typer.BadParameter("environment must be development, staging, or production")

    response = create_project_with_key(name=name, description=description, environment=environment)
    render_project_credentials(
        project_id=response.project.project_id,
        name=response.project.name,
        environment=response.api_key.environment,
        api_key=response.api_key.key,
        description=response.project.description,
    )


def main() -> None:
    app()


if __name__ == "__main__":
    main()
