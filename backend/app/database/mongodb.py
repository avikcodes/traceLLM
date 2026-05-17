import os
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from rich.console import Console

console = Console()

load_dotenv()

client: Optional[AsyncIOMotorClient] = None
database: Optional[AsyncIOMotorDatabase] = None
database_name: Optional[str] = None


async def connect_to_mongo(
    mongo_url: Optional[str] = None, db_name: Optional[str] = None
) -> AsyncIOMotorDatabase:
    """
    Create the MongoDB client if it is not already connected.
    This supports both FastAPI startup and direct SDK usage.
    """
    global client, database, database_name

    if database is not None:
        return database

    mongo_url = mongo_url or os.getenv("MONGO_URL")
    db_name = db_name or os.getenv("DB_NAME")

    if not mongo_url:
        raise ValueError("MONGO_URL is not set in the environment.")

    if not db_name:
        raise ValueError("DB_NAME is not set in the environment.")

    try:
        client = AsyncIOMotorClient(mongo_url)
        database = client[db_name]
        database_name = db_name

        # Ping MongoDB once so we can fail early if the connection is invalid.
        await client.admin.command("ping")

        console.print(
            f"[bold green]MongoDB connected[/bold green] [dim](database: {db_name})[/dim]"
        )
        return database
    except Exception:
        client = None
        database = None
        database_name = None
        console.print("[bold red]MongoDB connection failed[/bold red]")
        raise


def get_database() -> AsyncIOMotorDatabase:
    """
    Return the active database instance.
    Use this after the connection has already been initialized.
    """
    if database is None:
        raise RuntimeError("MongoDB is not connected yet.")

    return database


async def get_database_connection() -> AsyncIOMotorDatabase:
    """
    Ensure MongoDB is connected before returning the database.
    """
    if database is None:
        return await connect_to_mongo()

    return database


async def close_mongo_connection() -> None:
    """
    Close the MongoDB client when the FastAPI app shuts down.
    """
    global client, database, database_name

    try:
        if client is not None:
            client.close()
            console.print(
                f"[bold yellow]MongoDB connection closed[/bold yellow] [dim](database: {database_name})[/dim]"
            )
    finally:
        client = None
        database = None
        database_name = None
