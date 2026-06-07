import os
from typing import Any

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from rich.console import Console

from app.database.base import StorageBackend

load_dotenv()

console = Console()


def _clean_document(document: dict) -> dict:
    cleaned = {key: value for key, value in document.items() if key != "_id"}
    if "_id" in document:
        cleaned["id"] = str(document["_id"])
    return cleaned


class MongoBackend(StorageBackend):
    def __init__(
        self, mongo_url: str | None = None, db_name: str | None = None
    ) -> None:
        self._mongo_url = mongo_url or os.getenv("MONGO_URL")
        self._db_name = db_name or os.getenv("DB_NAME", "tracellm")
        self._client: AsyncIOMotorClient | None = None
        self._database: AsyncIOMotorDatabase | None = None
        self._connected = False

    async def initialize(self) -> None:
        if self._connected:
            return
        if not self._mongo_url:
            raise ValueError("MONGO_URL is not set in the environment.")
        try:
            self._client = AsyncIOMotorClient(self._mongo_url)
            self._database = self._client[self._db_name]
            await self._client.admin.command("ping")
            self._connected = True
            console.print(
                f"[bold green]MongoDB connected[/bold green] [dim](database: {self._db_name})[/dim]"
            )
        except Exception:
            self._client = None
            self._database = None
            self._connected = False
            console.print("[bold red]MongoDB connection failed[/bold red]")
            raise

    async def close(self) -> None:
        self._connected = False
        try:
            if self._client is not None:
                self._client.close()
                console.print(
                    f"[bold yellow]MongoDB connection closed[/bold yellow] [dim](database: {self._db_name})[/dim]"
                )
        finally:
            self._client = None
            self._database = None

    async def insert_one(self, collection: str, document: dict) -> None:
        assert self._database is not None
        await self._database[collection].insert_one(document)

    async def find_one(self, collection: str, filter: dict) -> dict | None:
        assert self._database is not None
        doc = await self._database[collection].find_one(filter)
        if doc is None:
            return None
        return _clean_document(doc)

    async def find_many(
        self,
        collection: str,
        filter: dict | None = None,
        sort: list | None = None,
        limit: int | None = None,
    ) -> list[dict]:
        assert self._database is not None
        cursor = self._database[collection].find(filter or {})
        if sort:
            cursor = cursor.sort(*sort[0]) if len(sort) == 1 else cursor.sort(sort)
        if limit is not None:
            cursor = cursor.limit(limit)
        docs = await cursor.to_list(length=limit or 10000)
        return [_clean_document(doc) for doc in docs]

    async def count_documents(
        self, collection: str, filter: dict | None = None
    ) -> int:
        assert self._database is not None
        return await self._database[collection].count_documents(filter or {})

    async def create_index(
        self, collection: str, key_or_list: str | list, unique: bool = False
    ) -> None:
        assert self._database is not None
        await self._database[collection].create_index(key_or_list, unique=unique)

    @property
    def is_connected(self) -> bool:
        return self._connected

    @property
    def storage_type(self) -> str:
        return "mongodb"

    @property
    def storage_detail(self) -> str:
        return f"{self._db_name} ({self._mongo_url})"
