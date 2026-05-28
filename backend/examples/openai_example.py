"""
TraceLLM OpenAI Integration Example

Traces a real OpenAI chat completion call.
Captures: prompt, response, model, latency, token usage, timestamps.

Usage:
    export OPENAI_API_KEY="sk-..."
    python -m examples.openai_example
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI

from tracellm import trace
from tracellm.integrations.openai import wrap_openai


client = OpenAI()
client = wrap_openai(client)


@trace(project="openai-demo", environment="development")
def ask_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    result = ask_llm("What is observability in LLM systems?")
    print(f"\nResponse received ({len(result)} chars)")
