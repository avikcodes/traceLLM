"""Async utilities with persistent event loop lifecycle management."""

from __future__ import annotations

import asyncio
from typing import Any, TypeVar

T = TypeVar("T")

_ASYNC_LOOP: asyncio.AbstractEventLoop | None = None


def run_async(coro: Any) -> T:
    """Run a coroutine synchronously using a persistent event loop.

    Unlike ``asyncio.run()`` this does **not** close the loop after the
    coroutine completes, which avoids issues with event-loop-bound resources
    (e.g. aiosqlite connections).
    """
    global _ASYNC_LOOP

    try:
        running = asyncio.get_running_loop()
        if running.is_running():
            future = asyncio.run_coroutine_threadsafe(coro, running)
            return future.result()
    except RuntimeError:
        pass

    if _ASYNC_LOOP is None or _ASYNC_LOOP.is_closed():
        _ASYNC_LOOP = asyncio.new_event_loop()
        asyncio.set_event_loop(_ASYNC_LOOP)

    return _ASYNC_LOOP.run_until_complete(coro)
