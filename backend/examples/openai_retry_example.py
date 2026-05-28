"""
TraceLLM OpenAI Retry Example

Demonstrates tracing with automatic retries on API errors.
Captures: retry attempts, backoff, eventual success/failure.

Usage:
    export OPENAI_API_KEY="sk-..."
    python -m examples.openai_retry_example
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI, RateLimitError

from tracellm import trace
from tracellm.integrations.openai import wrap_openai


client = OpenAI()
client = wrap_openai(client)


class UnreliableWrapper:
    def __init__(self, client, fail_count=2):
        self._client = client
        self._fail_count = fail_count
        self._call_count = 0

    def chat_completions_create(self, **kwargs):
        self._call_count += 1
        if self._call_count <= self._fail_count:
            raise RateLimitError(
                "Rate limit exceeded",
                response=None,
                body={"error": "rate_limit_exceeded"},
            )
        return self._client.chat.completions.create(**kwargs)


@trace(project="retry-demo", environment="development")
def ask_with_retries(prompt: str) -> str:
    import time
    wrapper = UnreliableWrapper(client, fail_count=1)
    max_retries = 3
    last_error = None

    for attempt in range(1, max_retries + 1):
        try:
            response = wrapper.chat_completions_create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
            )
            return response.choices[0].message.content
        except RateLimitError as e:
            last_error = e
            if attempt < max_retries:
                wait = min(0.5 * (2 ** (attempt - 1)), 5.0)
                print(f"  [retry {attempt}] waiting {wait:.1f}s...")
                time.sleep(wait)

    raise last_error


if __name__ == "__main__":
    result = ask_with_retries("Hello, what can you do?")
    print(f"\nResponse: {result}")
