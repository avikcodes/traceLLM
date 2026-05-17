import asyncio
import logging

from rich.console import Console

from app.database.mongodb import get_database_connection

console = Console()
logger = logging.getLogger(__name__)

COLLECTION_NAME = "traces"


async def save_trace(trace_data: dict) -> None:
    """Insert a trace payload into the MongoDB `traces` collection."""
    try:
        db = await get_database_connection()
        collection = db[COLLECTION_NAME]
        await collection.insert_one(trace_data)
        console.print(
            f"[bold green]Trace saved to MongoDB[/bold green] [dim]({COLLECTION_NAME})[/dim]"
        )
    except Exception as error:
        console.print(f"[bold red]Failed to save trace:[/bold red] {error}")
        logger.exception("MongoDB save_trace error")


def save_trace_sync(trace_data: dict) -> None:
    """Save trace data safely from synchronous code."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop is not None and loop.is_running():
        loop.create_task(save_trace(trace_data))
    else:
        asyncio.run(save_trace(trace_data))
