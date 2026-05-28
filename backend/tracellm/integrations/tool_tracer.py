import asyncio
import functools
import inspect
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, TypeVar

from tracellm.utils import console
from tracellm.db import save_trace_payload

F = TypeVar("F", bound=Callable[..., Any])


def trace_tool(
    name: str | None = None,
    max_retries: int = 0,
    capture_input: bool = True,
    capture_output: bool = True,
) -> Callable[[F], F]:
    def decorator(func: F) -> F:
        tool_name = name or func.__name__
        retry_count = 0

        if inspect.iscoroutinefunction(func):

            @functools.wraps(func)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                nonlocal retry_count
                step_id = str(uuid.uuid4())
                started_at = time.perf_counter()
                last_exception: Exception | None = None

                for attempt in range(max_retries + 1):
                    try:
                        if attempt > 0:
                            retry_count += 1
                            console.print(f"  [yellow]retry {attempt}/{max_retries}[/yellow] {tool_name}")

                        result = await func(*args, **kwargs)
                        duration = (time.perf_counter() - started_at) * 1000

                        step = {
                            "step_id": step_id,
                            "tool_name": tool_name,
                            "input": _capture_args(func, args, kwargs) if capture_input else {},
                            "output": _capture_output(result) if capture_output else {},
                            "duration": round(duration, 2),
                            "success": True,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                        _try_append_step(step)
                        return result

                    except Exception as e:
                        last_exception = e
                        duration = (time.perf_counter() - started_at) * 1000
                        if attempt < max_retries:
                            wait = min(0.5 * (2 ** attempt), 5.0)
                            await asyncio.sleep(wait)
                        else:
                            step = {
                                "step_id": step_id,
                                "tool_name": tool_name,
                                "input": _capture_args(func, args, kwargs) if capture_input else {},
                                "output": {"error": str(e)},
                                "duration": round(duration, 2),
                                "success": False,
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            }
                            _try_append_step(step)
                            raise

            return async_wrapper  # type: ignore

        else:

            @functools.wraps(func)
            def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
                nonlocal retry_count
                step_id = str(uuid.uuid4())
                started_at = time.perf_counter()
                last_exception: Exception | None = None

                for attempt in range(max_retries + 1):
                    try:
                        if attempt > 0:
                            retry_count += 1
                            console.print(f"  [yellow]retry {attempt}/{max_retries}[/yellow] {tool_name}")

                        result = func(*args, **kwargs)
                        duration = (time.perf_counter() - started_at) * 1000

                        step = {
                            "step_id": step_id,
                            "tool_name": tool_name,
                            "input": _capture_args(func, args, kwargs) if capture_input else {},
                            "output": _capture_output(result) if capture_output else {},
                            "duration": round(duration, 2),
                            "success": True,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        }
                        _try_append_step(step)
                        return result

                    except Exception as e:
                        last_exception = e
                        duration = (time.perf_counter() - started_at) * 1000
                        if attempt < max_retries:
                            time.sleep(min(0.5 * (2 ** attempt), 5.0))
                        else:
                            step = {
                                "step_id": step_id,
                                "tool_name": tool_name,
                                "input": _capture_args(func, args, kwargs) if capture_input else {},
                                "output": {"error": str(e)},
                                "duration": round(duration, 2),
                                "success": False,
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            }
                            _try_append_step(step)
                            raise

            return sync_wrapper  # type: ignore

    return decorator


def _capture_args(func: Callable, args: tuple[Any, ...], kwargs: dict[str, Any]) -> dict[str, Any]:
    try:
        sig = inspect.signature(func)
        bound = sig.bind(*args, **kwargs)
        bound.apply_defaults()
        return {k: str(v)[:500] for k, v in bound.arguments.items()}
    except Exception:
        return {"args": str(args)[:500], "kwargs": str(kwargs)[:500]}


def _capture_output(result: Any) -> dict[str, Any]:
    return {"result": str(result)[:500]}


def _try_append_step(step: dict[str, Any]) -> None:
    try:
        from tracellm.tracer import _current_trace_context
        ctx = _current_trace_context.get()
        if ctx is not None:
            steps = ctx.setdefault("collected_steps", [])
            steps.append(step)
    except Exception:
        pass
