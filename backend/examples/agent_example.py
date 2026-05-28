"""
TraceLLM Tool-Calling Agent Example

Demonstrates an agent with multiple traced tools.
Captures: tool calls, retries, execution duration, exceptions.

Usage:
    export OPENAI_API_KEY="sk-..."
    python -m examples.agent_example
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI

from tracellm import trace, trace_tool
from tracellm.integrations.openai import wrap_openai


client = OpenAI()
client = wrap_openai(client)


@trace_tool(name="search_web", max_retries=2)
def search_web(query: str) -> str:
    import random
    if random.random() < 0.3:
        raise ConnectionError("Search API temporarily unavailable")
    return f"Search results for: {query}"


@trace_tool(name="calculate", max_retries=1)
def calculate(expression: str) -> str:
    try:
        result = eval(expression)
        return f"Result: {result}"
    except Exception as e:
        return f"Calculation error: {e}"


@trace_tool(name="format_response")
def format_response(content: str, style: str = "plain") -> str:
    if style == "uppercase":
        return content.upper()
    elif style == "bold":
        return f"**{content}**"
    return content


@trace(project="agent-demo", environment="development")
def run_agent(task: str) -> str:
    search_result = search_web(task)
    calc_result = calculate("2 + 2")
    formatted = format_response(f"{search_result}\n{calc_result}", style="uppercase")
    return formatted


if __name__ == "__main__":
    result = run_agent("latest AI news")
    print(f"\nAgent Response:\n{result}")
