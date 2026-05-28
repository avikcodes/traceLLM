"""
TraceLLM OpenAI Streaming Example

Traces a real streaming OpenAI chat completion.
Captures: streaming chunks, token count, latency.

Usage:
    export OPENAI_API_KEY="sk-..."
    python -m examples.openai_stream_example
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI

from tracellm import trace
from tracellm.integrations.openai import wrap_openai


client = OpenAI()
client = wrap_openai(client)


@trace(project="openai-stream-demo", environment="development")
def ask_llm_stream(prompt: str) -> str:
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        stream=True,
    )
    full = ""
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            full += content
    print()
    return full


if __name__ == "__main__":
    result = ask_llm_stream("Explain streaming in LLMs briefly.")
    print(f"\nStream complete ({len(result)} chars)")
