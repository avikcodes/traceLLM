"""
TraceLLM RAG Pipeline Example

Demonstrates a simple RAG pipeline with tracing.
Uses OpenAI for both embedding and generation.
Captures: retrieval steps, generation, latency.

Usage:
    export OPENAI_API_KEY="sk-..."
    python -m examples.rag_example
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI

from tracellm import trace, trace_tool
from tracellm.integrations.openai import wrap_openai


client = OpenAI()
client = wrap_openai(client)


SIMULATED_DOCUMENTS = {
    "observability": "Observability in LLM systems means having visibility into prompts, completions, token usage, latency, and errors across the entire pipeline.",
    "tracing": "Tracing captures the full execution graph of an LLM application including tool calls, retrieval steps, and intermediate reasoning.",
    "monitoring": "Production LLM monitoring requires tracking metrics like token throughput, error rates, latency percentiles, and cost per request.",
    "rag": "Retrieval-Augmented Generation combines vector search with LLM generation to produce grounded, factually accurate responses.",
}


@trace_tool(name="retrieve_documents")
def retrieve_documents(query: str) -> list[dict[str, str]]:
    query_lower = query.lower()
    results = []
    for key, doc in SIMULATED_DOCUMENTS.items():
        if key in query_lower or query_lower in key:
            results.append({"title": key, "content": doc})
    return results if results else [{"title": "general", "content": "LLM systems require careful observability to ensure reliability and performance."}]


@trace_tool(name="generate_answer")
def generate_answer(context: str, query: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Answer based on the provided context."},
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {query}"},
        ],
        max_tokens=200,
    )
    return response.choices[0].message.content


@trace(project="rag-demo", environment="development")
def run_rag(query: str) -> str:
    docs = retrieve_documents(query)
    context = "\n".join(d["content"] for d in docs)
    answer = generate_answer(context, query)
    return answer


if __name__ == "__main__":
    result = run_rag("What is observability in LLM systems?")
    print(f"\nRAG Response: {result}")
