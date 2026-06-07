from abc import ABC, abstractmethod
from typing import Any


class StorageBackend(ABC):
    @abstractmethod
    async def initialize(self) -> None:
        ...

    @abstractmethod
    async def close(self) -> None:
        ...

    @abstractmethod
    async def insert_one(self, collection: str, document: dict) -> None:
        ...

    @abstractmethod
    async def find_one(self, collection: str, filter: dict) -> dict | None:
        ...

    @abstractmethod
    async def find_many(
        self,
        collection: str,
        filter: dict | None = None,
        sort: list | None = None,
        limit: int | None = None,
    ) -> list[dict]:
        ...

    @abstractmethod
    async def count_documents(self, collection: str, filter: dict | None = None) -> int:
        ...

    @abstractmethod
    async def create_index(
        self, collection: str, key_or_list: str | list, unique: bool = False
    ) -> None:
        ...

    @property
    @abstractmethod
    def is_connected(self) -> bool:
        ...

    @property
    @abstractmethod
    def storage_type(self) -> str:
        ...

    @property
    @abstractmethod
    def storage_detail(self) -> str:
        ...
