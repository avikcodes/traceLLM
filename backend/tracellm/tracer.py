import asyncio
import contextvars
import functools
import inspect
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Callable

from tracellm.db import resolve_api_key, save_trace_payload
from tracellm.mascot import MascotState, header, message
from tracellm.summary import print_summary
from tracellm.trace_stream import TraceStream
from tracellm.utils import (
    SLOW_TRACE_THRESHOLD_MS,
    coerce_failure_reason,
    coerce_response,
    coerce_retry_count,
    coerce_status,
    coerce_steps,
    console,
    estimate_tokens,
    render_trace_report,
    simulate_step,
)

_current_trace_context: contextvars.ContextVar[dict[str, Any] | None] = contextvars.ContextVar(
    "_current_trace_context", default=None
)


def build_trace_payload(
    prompt: str,
    model_name: str,
    project_id: str,
    project_name: str | None,
    api_key: str | None,
    environment: str,
    result: Any,
    trace_error: Exception | None,
    started_at: datetime,
    latency: float,
) -> dict[str, Any]:
    response_text = coerce_response(result)
    steps = coerce_steps(result)
    retry_count = coerce_retry_count(result)
    status = coerce_status(result, retry_count)
    failure_reason = coerce_failure_reason(result)

    ctx = _current_trace_context.get()
    if ctx and not steps:
        steps = ctx.get("collected_steps", [])
    if ctx and not retry_count:
        retry_count = ctx.get("retry_count", 0)

    if trace_error is not None:
        status = "failed"
        failure_reason = str(trace_error)
        response_text = response_text or ""

    return {
        "trace_id": str(uuid.uuid4()),
        "prompt": prompt,
        "response": response_text,
        "latency": latency,
        "token_count": estimate_tokens(prompt, response_text, steps),
        "model_name": model_name,
        "project_id": project_id,
        "project_name": project_name,
        "api_key": api_key,
        "environment": environment,
        "status": status,
        "steps": steps,
        "retry_count": retry_count,
        "failure_reason": failure_reason,
        "slow_request": latency >= SLOW_TRACE_THRESHOLD_MS,
        "created_at": started_at.isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def persist_trace(trace_data: dict[str, Any]) -> None:
    try:
        save_trace_payload(trace_data)
    except Exception as save_error:
        console.print(f"[yellow]Trace persistence skipped:[/yellow] {save_error}")


def finalize_trace(
    prompt: str,
    model_name: str,
    project_id: str,
    project_name: str | None,
    api_key: str | None,
    environment: str,
    result: Any,
    trace_error: Exception | None,
    started_at: datetime,
    latency: float,
    render: bool = True,
) -> dict[str, Any]:
    trace_data = build_trace_payload(
        prompt, model_name, project_id, project_name, api_key, environment,
        result, trace_error, started_at, latency,
    )
    persist_trace(trace_data)
    if render:
        render_trace_report(trace_data)
    return trace_data


def _resolve_project_context(
    api_key: str | None,
    project: str | None,
    environment: str | None,
) -> tuple[str, str | None, str, str | None]:
    if api_key:
        try:
            key_record = resolve_api_key(api_key)
            return (
                key_record.project_id,
                project or key_record.project_id,
                environment or key_record.environment,
                key_record.key,
            )
        except Exception:
            return (project or "default", project, environment or "development", api_key)
    return (project or "default", project, environment or "development", None)


def trace(
    prompt: str = "",
    model_name: str = "unknown",
    api_key: str | None = None,
    project: str | None = None,
    environment: str = "development",
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        is_async = inspect.iscoroutinefunction(func)

        if is_async:

            @functools.wraps(func)
            async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
                started_at = datetime.now(timezone.utc)
                start = time.perf_counter()
                result: Any = None
                trace_error: Exception | None = None
                effective_prompt = prompt or func.__name__
                project_id, project_name, effective_environment, resolved_key = _resolve_project_context(
                    api_key=api_key, project=project, environment=environment,
                )

                ctx_token = _current_trace_context.set({
                    "project_id": project_id,
                    "project_name": project_name,
                    "environment": effective_environment,
                    "api_key": resolved_key,
                    "collected_steps": [],
                    "retry_count": 0,
                })

                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as error:
                    trace_error = error
                    raise
                finally:
                    latency = round((time.perf_counter() - start) * 1000, 2)
                    finalize_trace(
                        prompt=effective_prompt,
                        model_name=model_name,
                        project_id=project_id,
                        project_name=project_name,
                        api_key=resolved_key,
                        environment=effective_environment,
                        result=result,
                        trace_error=trace_error,
                        started_at=started_at,
                        latency=latency,
                        render=True,
                    )
                    _current_trace_context.reset(ctx_token)

            return async_wrapper

        else:

            @functools.wraps(func)
            def wrapper(*args: Any, **kwargs: Any) -> Any:
                started_at = datetime.now(timezone.utc)
                start = time.perf_counter()
                result: Any = None
                trace_error: Exception | None = None
                effective_prompt = prompt or func.__name__
                project_id, project_name, effective_environment, resolved_key = _resolve_project_context(
                    api_key=api_key, project=project, environment=environment,
                )

                ctx_token = _current_trace_context.set({
                    "project_id": project_id,
                    "project_name": project_name,
                    "environment": effective_environment,
                    "api_key": resolved_key,
                    "collected_steps": [],
                    "retry_count": 0,
                })

                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as error:
                    trace_error = error
                    raise
                finally:
                    latency = round((time.perf_counter() - start) * 1000, 2)
                    finalize_trace(
                        prompt=effective_prompt,
                        model_name=model_name,
                        project_id=project_id,
                        project_name=project_name,
                        api_key=resolved_key,
                        environment=effective_environment,
                        result=result,
                        trace_error=trace_error,
                        started_at=started_at,
                        latency=latency,
                        render=True,
                    )
                    _current_trace_context.reset(ctx_token)

            return wrapper

    return decorator


def simulate_llm_response(prompt: str = "Explain transformers for a production RAG + agent engineering team.") -> dict[str, Any]:
    import random

    question = prompt
    session_id = str(uuid.uuid4())[:8]
    steps: list[dict[str, Any]] = []
    retry_count = random.randint(0, 2)
    attempt_count = retry_count + 1
    corpus_options = [
        "attention_is_all_you_need",
        "rag_failure_playbook",
        "agent_latency_benchmarks",
        "toolformer_notes",
        "long_context_eval_report",
        "retrieval_system_design",
    ]

    embedding_dims = random.choice([1536, 3072])
    query_vector_checksum = hex(random.getrandbits(24))
    simulate_step(
        steps=steps,
        tool_name="query_embedding",
        input_data={
            "session_id": session_id,
            "query": question,
            "embedding_model": "text-embedding-3-large",
        },
        output_data={
            "vector_dimensions": embedding_dims,
            "embedding_norm": round(random.uniform(0.98, 1.04), 4),
            "checksum": query_vector_checksum,
            "replay": {"stage": "embedding", "seed_hint": session_id},
        },
        min_delay=0.08,
        max_delay=0.22,
        random_module=random,
    )

    retrieved_docs = random.randint(14, 24)
    top_k = random.randint(6, 9)
    simulate_step(
        steps=steps,
        tool_name="vector_retrieval",
        input_data={
            "session_id": session_id,
            "query": question,
            "index": "research_embeddings_v2",
            "top_k": top_k,
            "filters": {"domain": "llm-systems", "freshness_days": 180},
        },
        output_data={
            "documents_found": retrieved_docs,
            "candidate_chunks": top_k,
            "latency_bucket": random.choice(["p50", "p75", "p95"]),
            "selected_ids": random.sample(corpus_options, k=min(top_k, len(corpus_options))),
            "replay": {
                "stage": "retrieval",
                "query_hash": query_vector_checksum,
                "cursor": f"retrieval:{session_id}",
            },
        },
        min_delay=0.18,
        max_delay=0.42,
        random_module=random,
    )

    reranked_chunks = random.randint(4, 6)
    simulate_step(
        steps=steps,
        tool_name="rerank_context",
        input_data={
            "session_id": session_id,
            "strategy": "cross-encoder",
            "candidate_count": top_k,
        },
        output_data={
            "reranked_chunks": reranked_chunks,
            "coverage_score": round(random.uniform(0.82, 0.96), 3),
            "dropped_chunks": max(0, top_k - reranked_chunks),
            "replay": {"stage": "rerank", "selected_chunk_count": reranked_chunks},
        },
        min_delay=0.09,
        max_delay=0.24,
        random_module=random,
    )

    simulate_step(
        steps=steps,
        tool_name="agent_planner",
        input_data={
            "session_id": session_id,
            "mode": "multi-hop-reasoning",
            "objective": "teach architecture and operational tradeoffs",
        },
        output_data={
            "plan": [
                "summarize transformer core concepts",
                "connect self-attention to scaling behavior",
                "map concepts to RAG and tool-using agents",
                "call out failure modes and observability metrics",
            ],
            "planner_confidence": round(random.uniform(0.81, 0.94), 3),
            "requires_tool_validation": retry_count > 0,
            "replay": {"stage": "planning", "plan_id": f"plan-{session_id}"},
        },
        min_delay=0.12,
        max_delay=0.31,
        random_module=random,
    )

    simulate_step(
        steps=steps,
        tool_name="context_window_allocator",
        input_data={
            "session_id": session_id,
            "budget_tokens": random.randint(4800, 7200),
            "response_budget": random.randint(900, 1400),
        },
        output_data={
            "allocated_context_tokens": random.randint(3000, 5200),
            "reserved_for_tools": random.randint(500, 900),
            "compression_applied": random.choice([True, False]),
            "replay": {
                "stage": "budgeting",
                "slot_map": ["system", "retrieval", "tools", "generation"],
            },
        },
        min_delay=0.05,
        max_delay=0.18,
        random_module=random,
    )

    if retry_count > 0:
        for attempt in range(1, attempt_count):
            simulate_step(
                steps=steps,
                tool_name="tool_schema_lookup",
                input_data={
                    "session_id": session_id,
                    "attempt": attempt,
                    "requested_tool": "citation_builder",
                },
                output_data={
                    "error": random.choice(
                        [
                            "schema registry timeout",
                            "stale tool contract version",
                            "partial metadata returned",
                        ]
                    ),
                    "retryable": True,
                    "replay": {
                        "stage": "tool_lookup",
                        "attempt": attempt,
                        "decision": "retry",
                    },
                },
                min_delay=0.11,
                max_delay=0.28,
                random_module=random,
                success=False,
            )
            simulate_step(
                steps=steps,
                tool_name="retry_guard",
                input_data={
                    "session_id": session_id,
                    "attempt": attempt,
                    "policy": "exponential_backoff_with_jitter",
                },
                output_data={
                    "status": "retry_scheduled",
                    "backoff_ms": random.randint(180, 650),
                    "guardrail_state": "within_threshold",
                    "replay": {
                        "stage": "retry",
                        "attempt": attempt,
                        "next_attempt": attempt + 1,
                    },
                },
                min_delay=0.07,
                max_delay=0.19,
                random_module=random,
            )

    simulate_step(
        steps=steps,
        tool_name="tool_schema_lookup",
        input_data={
            "session_id": session_id,
            "attempt": attempt_count,
            "requested_tool": "citation_builder",
        },
        output_data={
            "tool_contract_version": f"2026.05.{random.randint(10, 28)}",
            "arguments_validated": True,
            "replay": {
                "stage": "tool_lookup",
                "attempt": attempt_count,
                "decision": "continue",
            },
        },
        min_delay=0.09,
        max_delay=0.21,
        random_module=random,
    )

    simulate_step(
        steps=steps,
        tool_name="citation_builder",
        input_data={
            "session_id": session_id,
            "source_count": reranked_chunks,
            "format": "inline-bullets",
        },
        output_data={
            "citations_generated": reranked_chunks,
            "deduplicated_sources": random.randint(3, reranked_chunks),
            "replay": {"stage": "tool_execution", "artifact_id": f"cite-{session_id}"},
        },
        min_delay=0.1,
        max_delay=0.23,
        random_module=random,
    )

    generation_started = time.perf_counter()
    time.sleep(random.uniform(0.95, 1.9))
    response = f"""
Transformers are neural architectures built around self-attention, which means the model can score how strongly every token should attend to every other token while building the next internal representation. That shift matters because it removes the strictly sequential bottleneck of older recurrent systems and makes training dramatically more parallel, which is why transformers became the default foundation for modern language models, multimodal systems, retrieval-heavy copilots, and agent frameworks.

At a systems level, the important intuition is that each layer repeatedly mixes three things: token identity, token position, and context relevance. Multi-head attention lets the model inspect several interaction patterns at once, so one head can track local syntax, another can follow long-range references, and another can focus on task-specific structure such as citations, code blocks, or tool outputs. Feed-forward blocks then reshape those mixed representations into features the next layer can use. Stack enough of these layers and the model learns abstractions that look like reasoning traces, latent memory lookups, planning heuristics, and style control even though the runtime primitive is still next-token prediction.

For production RAG and agent systems, transformers are only one part of the story. The operational pipeline usually includes query embedding, vector retrieval, reranking, prompt assembly, tool selection, retry handling, and final generation. A good answer is not just a function of the base model weights; it also depends on whether retrieval returned the right evidence, whether the planner selected the right tools, whether context budgeting dropped a critical chunk, and whether retries recovered from transient failures without hiding instability from operators.

That is why observability matters. When a transformer-based application appears to hallucinate, the root cause may actually be upstream: a low-recall vector search, schema drift in a tool contract, latency-induced truncation, or a retry path that silently swapped evidence sets between attempts. High-fidelity traces let teams inspect the exact execution graph, including step durations, retries, tool outputs, retrieval confidence, and token budgets. This makes it possible to distinguish model limitations from systems integration issues.

In practical terms, transformers excel because they scale with data, compute, and context more effectively than earlier sequence models. Self-attention produces rich contextual representations; retrieval extends the model with fresh external knowledge; tools let the system act beyond pure text generation; and planners coordinate these components into multi-step workflows. The resulting stack is powerful, but it is also failure-prone. The healthiest engineering pattern is to treat the LLM as one subsystem inside a larger distributed decision engine and trace every important boundary the same way you would trace a payment pipeline or a search request path.

If you are testing a dashboard, this run is intentionally token-heavy and observability-rich: it includes retrieval, planning, context allocation, tool validation, optional retries, and a long-form answer so latency, token volume, retries, and step timelines are all visible in the resulting trace payload. Session `{session_id}` completed after `{attempt_count}` tool lookup attempt(s), with `{len(steps)}` replayable steps recorded before generation finished.
""".strip()
    generation_duration = round((time.perf_counter() - generation_started) * 1000, 2)
    steps.append(
        {
            "step_id": str(uuid.uuid4()),
            "tool_name": "response_generation",
            "input": {
                "session_id": session_id,
                "model": "gpt-4.1-mini",
                "temperature": 0.4,
                "max_output_tokens": 1400,
            },
            "output": {
                "preview": response[:220],
                "output_sections": 6,
                "estimated_completion_tokens": estimate_tokens(response),
                "replay": {
                    "stage": "generation",
                    "response_id": f"resp-{session_id}",
                    "attempt_count": attempt_count,
                },
            },
            "duration": generation_duration,
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

    return {
        "response": response,
        "status": "warning" if retry_count > 0 else "success",
        "retry_count": retry_count,
        "steps": steps,
        "observability": {
            "session_id": session_id,
            "retrieval_candidates": retrieved_docs,
            "final_context_chunks": reranked_chunks,
            "attempt_count": attempt_count,
        },
    }


def run_live_trace(
    prompt: str,
    model_name: str = "gpt-4.1-mini",
    project: str | None = None,
    api_key: str | None = None,
    environment: str = "development",
    render: bool = True,
) -> dict[str, Any]:
    started_at = datetime.now(timezone.utc)
    start = time.perf_counter()
    result = None
    trace_error: Exception | None = None
    project_id, project_name, effective_environment, resolved_key = _resolve_project_context(
        api_key=api_key,
        project=project,
        environment=environment,
    )

    console.print()
    console.print(header("Tracing request...", MascotState.LOADING))
    console.print()

    _STEP_EVENTS: list[tuple[str, str]] = [
        ("query.embed", "Embedding prompt"),
        ("vector.search", "Searching vector index"),
        ("context.rerank", "Reranking context"),
        ("agent.plan", "Planning tool execution"),
        ("context.allocate", "Allocating context window"),
        ("tool.chain", "Running tool chain"),
        ("llm.generate", "Generating answer"),
    ]

    with TraceStream(prompt, model_name) as stream:
        finished_steps: list[dict[str, Any]] = []
        for event_name, label in _STEP_EVENTS:
            stream.emit(event_name, label)
            if label == "Generating answer":
                try:
                    result = simulate_llm_response(prompt)
                    finished_steps = coerce_steps(result)
                except Exception as error:
                    trace_error = error
                    raise

    # If simulation didn't generate steps, emit step events from simulation
    if not finished_steps and result:
        finished_steps = coerce_steps(result)

    latency = round((time.perf_counter() - start) * 1000, 2)
    trace_data = finalize_trace(
        prompt=prompt,
        model_name=model_name,
        project_id=project_id,
        project_name=project_name,
        api_key=resolved_key,
        environment=effective_environment,
        result=result,
        trace_error=trace_error,
        started_at=started_at,
        latency=latency,
        render=False,
    )
    print_summary(trace_data)
    status = str(trace_data.get("status", "success")).lower()
    if status == "success":
        console.print(message("Trace complete", MascotState.SUCCESS))
    elif status in ("warning", "failed"):
        console.print(message("Warning: tool execution failed", MascotState.WARNING))
    console.print()
    return trace_data


@trace(
    prompt="Explain transformers",
    model_name="gpt-4.1-mini",
    project="demo-workspace",
    environment="development",
)
def llm_response() -> dict[str, Any]:
    return simulate_llm_response()
