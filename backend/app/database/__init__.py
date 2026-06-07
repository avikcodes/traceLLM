"""Database helpers for TraceLLM.

Storage is automatically selected:
- If MONGO_URL environment variable is set → MongoBackend
- Otherwise → SQLiteBackend (default, zero-configuration)
"""

import os
from typing import Optional

from app.database.base import StorageBackend
from app.database.mongodb import MongoBackend
from app.database.sqlite_backend import SQLiteBackend

_backend: Optional[StorageBackend] = None


def create_backend() -> StorageBackend:
    if os.getenv("MONGO_URL"):
        return MongoBackend(
            mongo_url=os.getenv("MONGO_URL"),
            db_name=os.getenv("DB_NAME", "tracellm"),
        )
    return SQLiteBackend()


def get_backend() -> StorageBackend:
    global _backend
    if _backend is None:
        _backend = create_backend()
    return _backend


def set_backend(backend: StorageBackend) -> None:
    global _backend
    _backend = backend
