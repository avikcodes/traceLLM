import functools
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Iterator

from openai import OpenAI, Stream
from openai.types.chat import ChatCompletion, ChatCompletionChunk

from tracellm.utils import (
    console,
    estimate_tokens,
    build_tool_step,
)
from tracellm.db import save_trace_payload


def _get_openai_trace_context() -> dict[str, Any] | None:
    try:
        from tracellm.tracer import _current_trace_context
        return _current_trace_context.get()
    except ImportError:
        return None


def _build_openai_step(
    tool_name: str,
    input_data: dict[str, Any],
    output_data: dict[str, Any],
    duration: float,
    success: bool = True,
) -> dict[str, Any]:
    return build_tool_step(tool_name, input_data, output_data, duration, success)


def _finalize_trace(
    trace_id: str,
    prompt: str,
    response: str,
    model: str,
    latency: float,
    token_count: int,
    steps: list[dict[str, Any]],
    status: str,
    error: str | None = None,
    retry_count: int = 0,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    ctx = _get_openai_trace_context()
    trace_data = {
        "trace_id": trace_id,
        "prompt": prompt,
        "response": response,
        "latency": round(latency, 2),
        "token_count": token_count,
        "model_name": model,
        "project_id": (ctx.get("project_id") if ctx else None) or "default",
        "project_name": (ctx.get("project_name") if ctx else None) or None,
        "api_key": (ctx.get("api_key") if ctx else None) or None,
        "environment": (ctx.get("environment") if ctx else None) or "development",
        "status": status,
        "steps": steps,
        "retry_count": retry_count,
        "failure_reason": error,
        "slow_request": latency >= 1500.0,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    try:
        save_trace_payload(trace_data)
    except Exception as e:
        console.print(f"[yellow]Trace persist skipped: {e}[/yellow]")
    return trace_data


def _extract_token_usage(completion: ChatCompletion) -> dict[str, int]:
    usage = completion.usage
    if usage:
        return {
            "prompt_tokens": usage.prompt_tokens,
            "completion_tokens": usage.completion_tokens,
            "total_tokens": usage.total_tokens,
        }
    return {}


def _estimate_streaming_tokens(chunks: list[ChatCompletionChunk]) -> dict[str, int]:
    total = 0
    for chunk in chunks:
        if chunk.choices and chunk.choices[0].delta.content:
            total += 1
    return {"total_tokens": total}


def wrap_openai(client: OpenAI) -> OpenAI:
    original_create = client.chat.completions.create

    @functools.wraps(original_create)
    def traced_create(*args: Any, **kwargs: Any) -> Any:
        return _traced_chat_completion(client, kwargs, original_create)

    client.chat.completions.create = traced_create
    return client


def _traced_chat_completion(client: OpenAI, kwargs: dict[str, Any], original_create: Any) -> Any:
    trace_id = str(uuid.uuid4())
    started_at = time.perf_counter()
    start_dt = datetime.now(timezone.utc)

    messages = kwargs.get("messages", [])
    model = kwargs.get("model", "unknown")
    stream = kwargs.get("stream", False)

    prompt_text = str(messages)
    steps: list[dict[str, Any]] = []
    error: str | None = None
    retry_count = 0
    max_retries = kwargs.get("max_retries", 0) or 0

    max_attempts = max_retries + 1
    last_exception: Exception | None = None

    for attempt in range(max_attempts):
        step_start = time.perf_counter()
        try:
            if attempt > 0:
                retry_count += 1

            result = original_create(*client.chat.completions._get_original_args() if hasattr(client.chat.completions, '_get_original_args') else [], **kwargs)

            if stream:
                collected_chunks: list[ChatCompletionChunk] = []
                full_content = ""

                for chunk in result:
                    collected_chunks.append(chunk)
                    if chunk.choices and chunk.choices[0].delta.content:
                        full_content += chunk.choices[0].delta.content
                    yield chunk

                step_duration = (time.perf_counter() - step_start) * 1000
                token_data = _estimate_streaming_tokens(collected_chunks)
                token_count = sum(token_data.values())
                steps.append(_build_openai_step(
                    "openai_chat_stream",
                    {"model": model, "messages": messages},
                    {"content_preview": full_content[:200], "chunks": len(collected_chunks)},
                    step_duration,
                ))

                latency = (time.perf_counter() - started_at) * 1000
                _finalize_trace(
                    trace_id=trace_id,
                    prompt=prompt_text,
                    response=full_content,
                    model=model,
                    latency=latency,
                    token_count=token_count,
                    steps=steps,
                    status="success",
                    retry_count=retry_count,
                )
                return

            step_duration = (time.perf_counter() - step_start) * 1000

            token_usage = _extract_token_usage(result)
            token_count = token_usage.get("total_tokens", estimate_tokens(str(messages), str(result.choices[0].message.content if result.choices else "")))

            steps.append(_build_openai_step(
                "openai_chat",
                {"model": model, "messages": messages},
                {
                    "content": result.choices[0].message.content if result.choices else "",
                    "finish_reason": result.choices[0].finish_reason if result.choices else None,
                    "usage": token_usage,
                },
                step_duration,
            ))

            latency = (time.perf_counter() - started_at) * 1000
            response_text = result.choices[0].message.content if result.choices else ""
            _finalize_trace(
                trace_id=trace_id,
                prompt=prompt_text,
                response=response_text,
                model=model,
                latency=latency,
                token_count=token_count,
                steps=steps,
                status="success",
                retry_count=retry_count,
            )
            return result

        except Exception as e:
            last_exception = e
            step_duration = (time.perf_counter() - step_start) * 1000
            error = str(e)
            steps.append(_build_openai_step(
                f"openai_chat_retry_{attempt + 1}" if attempt < max_attempts - 1 else "openai_chat",
                {"model": model, "messages": messages, "attempt": attempt + 1},
                {"error": error},
                step_duration,
                success=(attempt == max_attempts - 1),
            ))
            if attempt < max_attempts - 1:
                time.sleep(min(0.5 * (2 ** attempt), 5.0))
            else:
                break

    latency = (time.perf_counter() - started_at) * 1000
    _finalize_trace(
        trace_id=trace_id,
        prompt=prompt_text,
        response="",
        model=model,
        latency=latency,
        token_count=0,
        steps=steps,
        status="failed",
        error=error,
        retry_count=retry_count,
    )
    if last_exception:
        raise last_exception
    return None


class TraceOpenAI(OpenAI):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        wrap_openai(self)
