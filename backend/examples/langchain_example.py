"""
TraceLLM LangChain Integration Example

Traces a real LangChain chain execution.
Captures: chain steps, LLM calls, tool usage, latency.

Usage:
    export OPENAI_API_KEY="sk-..."
    python -m examples.langchain_example
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain.schema import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from tracellm import trace
from tracellm.integrations.langchain import TracellmCallbackHandler


@trace(project="langchain-demo", environment="development")
def run_langchain_chain(prompt: str) -> str:
    handler = TracellmCallbackHandler()

    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)

    messages = [
        SystemMessage(content="You are a helpful assistant."),
        HumanMessage(content=prompt),
    ]
    result = llm.invoke(messages, config={"callbacks": [handler]})

    handler.flush_trace(prompt=prompt, response=result.content)
    return result.content


if __name__ == "__main__":
    result = run_langchain_chain("What is LangChain and how does it work?")
    print(f"\nResponse received ({len(result)} chars)")
