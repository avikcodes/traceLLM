import time
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import BaseMessage

from tracellm.utils import build_tool_step, estimate_tokens, console
from tracellm.db import save_trace_payload


def _get_trace_context() -> dict[str, Any] | None:
    try:
        from tracellm.tracer import _current_trace_context
        return _current_trace_context.get()
    except ImportError:
        return None


def _finalize_lc_trace(trace_data: dict[str, Any]) -> None:
    ctx = _get_trace_context() or {}
    trace_data.setdefault("project_id", ctx.get("project_id") or "default")
    trace_data.setdefault("project_name", ctx.get("project_name"))
    trace_data.setdefault("environment", ctx.get("environment") or "development")
    trace_data.setdefault("api_key", ctx.get("api_key"))
    try:
        save_trace_payload(trace_data)
    except Exception as e:
        console.print(f"[yellow]LangChain trace persist skipped: {e}[/yellow]")


class TracellmCallbackHandler(BaseCallbackHandler):
    def __init__(self) -> None:
        super().__init__()
        self.trace_id = str(uuid.uuid4())
        self.steps: list[dict[str, Any]] = []
        self.start_time = time.perf_counter()
        self.start_dt = datetime.now(timezone.utc)
        self._chain_stack: list[dict[str, Any]] = []
        self._retry_count = 0
        self._error: str | None = None
        self._llm_inputs: list[str] = []
        self._llm_outputs: list[str] = []

    @property
    def always_verbose(self) -> bool:
        return True

    def on_llm_start(self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any) -> None:
        self._llm_inputs.append(str(prompts))

    def on_llm_end(self, response: Any, **kwargs: Any) -> None:
        content = ""
        try:
            if hasattr(response, "generations"):
                content = str(response.generations)
            elif hasattr(response, "text"):
                content = response.text
        except Exception:
            content = str(response)
        self._llm_outputs.append(content[:500])

    def on_llm_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        self._error = str(error)

    def on_chain_start(self, serialized: dict[str, Any], inputs: dict[str, Any], **kwargs: Any) -> None:
        step = {
            "step_id": str(uuid.uuid4()),
            "tool_name": serialized.get("id", ["unknown"])[-1],
            "input": {"inputs": inputs},
            "output": {},
            "duration": 0.0,
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "_start": time.perf_counter(),
        }
        self._chain_stack.append(step)

    def on_chain_end(self, outputs: dict[str, Any], **kwargs: Any) -> None:
        if self._chain_stack:
            step = self._chain_stack.pop()
            step["duration"] = round((time.perf_counter() - step["_start"]) * 1000, 2)
            step["output"] = {"outputs": outputs}
            del step["_start"]
            self.steps.append(step)

    def on_chain_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        if self._chain_stack:
            step = self._chain_stack.pop()
            step["duration"] = round((time.perf_counter() - step["_start"]) * 1000, 2)
            step["output"] = {"error": str(error)}
            step["success"] = False
            del step["_start"]
            self.steps.append(step)
        self._error = str(error)

    def on_tool_start(self, serialized: dict[str, Any], input_str: str, **kwargs: Any) -> None:
        step = {
            "step_id": str(uuid.uuid4()),
            "tool_name": serialized.get("name", "unknown_tool"),
            "input": {"input": input_str},
            "output": {},
            "duration": 0.0,
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "_start": time.perf_counter(),
        }
        self._chain_stack.append(step)

    def on_tool_end(self, output: str, **kwargs: Any) -> None:
        if self._chain_stack:
            step = self._chain_stack.pop()
            step["duration"] = round((time.perf_counter() - step["_start"]) * 1000, 2)
            step["output"] = {"output": output[:500]}
            del step["_start"]
            self.steps.append(step)

    def on_tool_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        if self._chain_stack:
            step = self._chain_stack.pop()
            step["duration"] = round((time.perf_counter() - step["_start"]) * 1000, 2)
            step["output"] = {"error": str(error)}
            step["success"] = False
            del step["_start"]
            self.steps.append(step)
        self._retry_count += 1

    def on_retriever_start(self, serialized: dict[str, Any], query: str, **kwargs: Any) -> None:
        step = {
            "step_id": str(uuid.uuid4()),
            "tool_name": "retriever",
            "input": {"query": query},
            "output": {},
            "duration": 0.0,
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "_start": time.perf_counter(),
        }
        self._chain_stack.append(step)

    def on_retriever_end(self, documents: list[Any], **kwargs: Any) -> None:
        if self._chain_stack:
            step = self._chain_stack.pop()
            step["duration"] = round((time.perf_counter() - step["_start"]) * 1000, 2)
            doc_previews = [str(doc)[:200] for doc in documents[:5]]
            step["output"] = {"documents": doc_previews, "count": len(documents)}
            del step["_start"]
            self.steps.append(step)

    def on_retriever_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        if self._chain_stack:
            step = self._chain_stack.pop()
            step["duration"] = round((time.perf_counter() - step["_start"]) * 1000, 2)
            step["output"] = {"error": str(error)}
            step["success"] = False
            del step["_start"]
            self.steps.append(step)

    def flush_trace(
        self,
        prompt: str | None = None,
        response: str | None = None,
        status: str = "success",
    ) -> dict[str, Any]:
        latency = (time.perf_counter() - self.start_time) * 1000
        total_input = " ".join(self._llm_inputs) if self._llm_inputs else (prompt or "")
        total_output = " ".join(self._llm_outputs) if self._llm_outputs else (response or "")

        trace_data = {
            "trace_id": self.trace_id,
            "prompt": total_input,
            "response": total_output,
            "latency": round(latency, 2),
            "token_count": estimate_tokens(total_input, total_output),
            "model_name": "langchain",
            "status": status if not self._error else "failed",
            "steps": self.steps,
            "retry_count": self._retry_count,
            "failure_reason": self._error,
            "slow_request": latency >= 1500.0,
            "created_at": self.start_dt.isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        _finalize_lc_trace(trace_data)
        return trace_data
