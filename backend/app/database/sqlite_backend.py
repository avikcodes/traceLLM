import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any


class _DateTimeEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

import aiosqlite

from app.database.base import StorageBackend


_TRACELLM_HOME = Path(os.getenv("TRACELLM_HOME", "~/.tracellm")).expanduser()
_DB_PATH = _TRACELLM_HOME / "traces.db"

CREATE_TRACES_TABLE = """
CREATE TABLE IF NOT EXISTS traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT UNIQUE NOT NULL,
    prompt TEXT,
    response TEXT,
    latency REAL,
    token_count INTEGER,
    model_name TEXT,
    project_id TEXT,
    project_name TEXT,
    api_key TEXT,
    environment TEXT,
    status TEXT,
    retry_count INTEGER,
    slow_request INTEGER,
    failure_reason TEXT,
    created_at TEXT,
    updated_at TEXT,
    steps TEXT
)
"""

CREATE_PROJECTS_TABLE = """
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT UNIQUE NOT NULL,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TEXT
)
"""

CREATE_API_KEYS_TABLE = """
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    project_id TEXT,
    environment TEXT,
    created_at TEXT
)
"""

TRACE_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_traces_trace_id ON traces(trace_id)",
    "CREATE INDEX IF NOT EXISTS idx_traces_created_at ON traces(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_traces_status ON traces(status)",
    "CREATE INDEX IF NOT EXISTS idx_traces_model_name ON traces(model_name)",
    "CREATE INDEX IF NOT EXISTS idx_traces_project_id ON traces(project_id)",
    "CREATE INDEX IF NOT EXISTS idx_traces_environment ON traces(environment)",
]

PROJECT_INDEXES = [
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_id ON projects(project_id)",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name ON projects(name)",
]

API_KEY_INDEXES = [
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key)",
    "CREATE INDEX IF NOT EXISTS idx_api_keys_project_id ON api_keys(project_id)",
    "CREATE INDEX IF NOT EXISTS idx_api_keys_environment ON api_keys(environment)",
]


def _build_where(filter: dict | None) -> tuple[str, list]:
    if not filter:
        return "", []

    conditions: list[str] = []
    params: list[Any] = []

    for key, value in filter.items():
        if key == "$or":
            or_parts: list[str] = []
            for sub in value:
                sub_clause, sub_params = _build_where_conditions(sub)
                or_parts.append(f"({sub_clause})")
                params.extend(sub_params)
            conditions.append(f"({' OR '.join(or_parts)})")
        elif isinstance(value, dict):
            for op, op_val in value.items():
                if op == "$gte":
                    conditions.append(f"{key} >= ?")
                    params.append(op_val)
                elif op == "$lte":
                    conditions.append(f"{key} <= ?")
                    params.append(op_val)
                elif op == "$gt":
                    conditions.append(f"{key} > ?")
                    params.append(op_val)
                elif op == "$lt":
                    conditions.append(f"{key} < ?")
                    params.append(op_val)
        else:
            conditions.append(f"{key} = ?")
            params.append(value)

    return " WHERE " + " AND ".join(conditions) if conditions else "", params


def _build_where_conditions(filter: dict) -> tuple[str, list]:
    conditions: list[str] = []
    params: list[Any] = []

    for key, value in filter.items():
        if isinstance(value, dict):
            for op, op_val in value.items():
                if op == "$gte":
                    conditions.append(f"{key} >= ?")
                    params.append(op_val)
                elif op == "$lte":
                    conditions.append(f"{key} <= ?")
                    params.append(op_val)
                elif op == "$gt":
                    conditions.append(f"{key} > ?")
                    params.append(op_val)
                elif op == "$lt":
                    conditions.append(f"{key} < ?")
                    params.append(op_val)
        else:
            conditions.append(f"{key} = ?")
            params.append(value)

    return " AND ".join(conditions), params


def _build_order_by(sort: list | None) -> str:
    if not sort:
        return ""
    clauses: list[str] = []
    for item in sort:
        if isinstance(item, str):
            clauses.append(f"{item} ASC")
        elif isinstance(item, (list, tuple)) and len(item) == 2:
            field, direction = item
            clauses.append(f"{field} {'DESC' if direction == -1 else 'ASC'}")
    return " ORDER BY " + ", ".join(clauses) if clauses else ""


def _serialize_document(doc: dict) -> dict:
    result = dict(doc)
    if "steps" in result and isinstance(result["steps"], str):
        result["steps"] = json.loads(result["steps"])
    if "slow_request" in result:
        result["slow_request"] = bool(result["slow_request"])
    result.pop("id", None)
    return result


def _deserialize_document(document: dict) -> dict:
    result = dict(document)
    if "steps" in result and isinstance(result["steps"], (list, dict)):
        result["steps"] = json.dumps(result["steps"], cls=_DateTimeEncoder)
    if "slow_request" in result:
        result["slow_request"] = 1 if result["slow_request"] else 0
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result


class SQLiteBackend(StorageBackend):
    def __init__(self, db_path: str | Path | None = None) -> None:
        self._db_path = Path(db_path) if db_path else _DB_PATH
        self._conn: aiosqlite.Connection | None = None
        self._connected = False
        self._db_path.parent.mkdir(parents=True, exist_ok=True)

    async def initialize(self) -> None:
        if self._connected:
            return
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = await aiosqlite.connect(str(self._db_path))
        self._conn.row_factory = aiosqlite.Row
        await self._conn.execute("PRAGMA journal_mode=WAL")
        await self._conn.execute("PRAGMA foreign_keys=ON")
        await self._conn.execute(CREATE_TRACES_TABLE)
        await self._conn.execute(CREATE_PROJECTS_TABLE)
        await self._conn.execute(CREATE_API_KEYS_TABLE)
        for sql in TRACE_INDEXES:
            await self._conn.execute(sql)
        for sql in PROJECT_INDEXES:
            await self._conn.execute(sql)
        for sql in API_KEY_INDEXES:
            await self._conn.execute(sql)
        await self._conn.commit()
        self._connected = True

    async def close(self) -> None:
        if self._conn:
            await self._conn.close()
        self._conn = None
        self._connected = False

    async def insert_one(self, collection: str, document: dict) -> None:
        assert self._conn is not None
        doc = _deserialize_document(document)
        columns = ", ".join(doc.keys())
        placeholders = ", ".join("?" for _ in doc)
        values = list(doc.values())
        await self._conn.execute(
            f"INSERT OR REPLACE INTO {collection} ({columns}) VALUES ({placeholders})",
            values,
        )
        await self._conn.commit()

    async def find_one(self, collection: str, filter: dict) -> dict | None:
        assert self._conn is not None
        where_clause, params = _build_where(filter)
        cursor = await self._conn.execute(
            f"SELECT * FROM {collection}{where_clause} LIMIT 1", params
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        return _serialize_document(dict(row))

    async def find_many(
        self,
        collection: str,
        filter: dict | None = None,
        sort: list | None = None,
        limit: int | None = None,
    ) -> list[dict]:
        assert self._conn is not None
        where_clause, params = _build_where(filter)
        order_clause = _build_order_by(sort)
        limit_clause = f" LIMIT {limit}" if limit is not None else ""
        cursor = await self._conn.execute(
            f"SELECT * FROM {collection}{where_clause}{order_clause}{limit_clause}",
            params,
        )
        rows = await cursor.fetchall()
        return [_serialize_document(dict(row)) for row in rows]

    async def count_documents(
        self, collection: str, filter: dict | None = None
    ) -> int:
        assert self._conn is not None
        where_clause, params = _build_where(filter)
        cursor = await self._conn.execute(
            f"SELECT COUNT(*) as cnt FROM {collection}{where_clause}", params
        )
        row = await cursor.fetchone()
        return row["cnt"] if row else 0

    async def create_index(
        self, collection: str, key_or_list: str | list, unique: bool = False
    ) -> None:
        assert self._conn is not None
        if isinstance(key_or_list, str):
            keys = [key_or_list]
        else:
            keys = [k[0] if isinstance(k, (list, tuple)) else k for k in key_or_list]
        for key in keys:
            idx_name = f"idx_{collection}_{key}"
            unique_str = "UNIQUE " if unique else ""
            await self._conn.execute(
                f"CREATE {unique_str}INDEX IF NOT EXISTS {idx_name} ON {collection}({key})"
            )
        await self._conn.commit()

    @property
    def is_connected(self) -> bool:
        return self._connected

    @property
    def storage_type(self) -> str:
        return "sqlite"

    @property
    def storage_detail(self) -> str:
        return str(self._db_path)
