<div align="center">

<img src="https://raw.githubusercontent.com/avikcodes/traceLLM/main/assets/logo.png" width="140" />

# TraceLLM

### Open-Source Observability Platform for AI Applications & Agents

Track prompts, latency, token usage, execution traces, tool calls, retries, hallucinations, and agent workflows in real time.

<p align="center">
  <img src="https://img.shields.io/badge/python-3.11+-blue.svg" />
  <img src="https://img.shields.io/badge/fastapi-backend-green.svg" />
  <img src="https://img.shields.io/badge/postgresql-database-blue.svg" />
  <img src="https://img.shields.io/badge/websocket-live_logs-success.svg" />
  <img src="https://img.shields.io/badge/license-MIT-orange.svg" />
  <img src="https://img.shields.io/badge/status-active-brightgreen.svg" />
</p>

</div>

---

# What is TraceLLM?

Modern AI systems are extremely difficult to debug.

When an LLM application fails, developers usually cannot answer:

- Which prompt caused the issue?
- Why was the response slow?
- Which agent/tool failed?
- How many tokens were consumed?
- What execution path did the agent take?
- Which step caused hallucination or retry loops?

TraceLLM solves this problem.

It acts as an observability layer for AI applications.

Think:

| Traditional Infra | AI Infra Equivalent |
|---|---|
| Datadog | TraceLLM |
| Sentry | TraceLLM |
| OpenTelemetry | TraceLLM |
| APM Tools | TraceLLM |

---

# Core Idea

```text
Developer Code
      ↓
TraceLLM SDK
      ↓
Capture AI Execution
      ↓
Store Structured Traces
      ↓
Visualize + Analyze
```

---

# Example

Instead of writing this:

```python
response = llm.generate(prompt)
```

You write:

```python
from sdk import trace

@trace(prompt="Explain transformers")
def llm_response():
    return model.generate()
```

TraceLLM automatically captures:

- prompt
- response
- latency
- token usage
- timestamps
- execution metadata

---

# CLI Demo

```bash
python -m sdk.tracer demo
```

---

# Example Output

```text
TraceLLM Trace Report

Trace ID:      243e7f8d-6bbc-4ff9-9bc2-63e3e02a29ba
Prompt:        Explain transformers
Latency:       0.0108s
Token Count:   22
Status:        SUCCESS
```

---

# System Architecture

```text
                ┌────────────────────┐
                │  Developer App     │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   TraceLLM SDK     │
                │  (Decorator Layer) │
                └─────────┬──────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
  Capture Prompt   Measure Latency   Estimate Tokens
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                ┌────────────────────┐
                │ Trace Payload JSON │
                └─────────┬──────────┘
                          ▼
                ┌────────────────────┐
                │    MongoDB Atlas   │
                └─────────┬──────────┘
                          ▼
                ┌────────────────────┐
                │ Rich CLI Reporting │
                └────────────────────┘
```

---

# Features

| Feature | Status |
|---|---|
| Prompt Tracing | ✅ |
| Response Logging | ✅ |
| Latency Tracking | ✅ |
| Token Estimation | ✅ |
| MongoDB Storage | ✅ |
| Rich CLI Reports | ✅ |
| Trace IDs | ✅ |
| Typer CLI Commands | ✅ |
| FastAPI Backend | ✅ |
| WebSocket Support | ✅ |
| Agent Replay | 🚧 |
| Tool Call Tracing | 🚧 |
| Dashboard UI | 🚧 |
| Hallucination Detection | 🚧 |
| Multi-Agent Visualization | 🚧 |

---

# Tech Stack

| Layer | Technology |
|---|---|
| Language | Python |
| Backend | FastAPI |
| Database | MongoDB Atlas |
| CLI | Typer |
| Terminal UI | Rich |
| Validation | Pydantic |
| WebSockets | FastAPI WebSockets |
| Deployment | Render / Railway |
| Frontend (planned) | Next.js |
| Realtime Streams | WebSockets |
| Local Models | Ollama |

---

# Folder Structure

```text
backend/
│
├── app/
│   ├── database/
│   ├── models/
│   ├── routes/
│   └── websocket/
│
├── sdk/
│   ├── __init__.py
│   └── tracer.py
│
├── .env
├── main.py
└── requirements.txt
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/tracellm.git
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create `.env`

```env
MONGO_URL=your_mongodb_url
DB_NAME=tracellm
```

---

# Run Backend

```bash
uvicorn main:app --reload
```

---

# Run Demo

```bash
python -m sdk.tracer demo
```

---

# Trace Flow

```text
Function Call
    ↓
Trace Decorator
    ↓
Start Timer
    ↓
Execute LLM Function
    ↓
Capture Output
    ↓
Estimate Tokens
    ↓
Generate Trace Payload
    ↓
Store in MongoDB
    ↓
Render Rich CLI Report
```

---

# MongoDB Trace Example

```json
{
  "trace_id": "243e7f8d",
  "prompt": "Explain transformers",
  "response": "Transformers are neural networks...",
  "latency": 0.0108,
  "token_count": 22,
  "timestamp": "2026-05-17T03:55:41"
}
```

---

# Why TraceLLM Exists

AI infrastructure tooling is still immature.

Most developers today debug LLM systems using:
- print()
- random logs
- guesswork

TraceLLM aims to provide:
- structured tracing
- execution observability
- debugging visibility
- realtime monitoring

for modern AI-native systems.

---

# Current Roadmap

## Phase 1
- SDK tracing
- CLI reports
- MongoDB persistence

## Phase 2
- realtime dashboards
- websocket trace streaming
- agent execution graphs

## Phase 3
- hallucination analysis
- tool-call observability
- distributed tracing
- multi-agent replay system

---

# Future Vision

```text
TraceLLM = Datadog for AI Applications
```

---

# Screenshots

## CLI Trace Report

> Add screenshot here

```text
assets/demo.png
```

---

# Planned Dashboard

```text
┌─────────────────────────────┐
│  Active Agent Executions    │
├─────────────────────────────┤
│ Prompt Latency Graphs       │
│ Token Usage Heatmaps        │
│ Failure Rate Analytics      │
│ Agent Replay Timeline       │
└─────────────────────────────┘
```

---

# Example Use Cases

| Use Case | Description |
|---|---|
| AI Agents | Trace multi-step execution |
| RAG Systems | Monitor retrieval latency |
| Chatbots | Analyze token usage |
| Research Systems | Observe inference behaviour |
| Startups | Production AI debugging |
| LLM APIs | Request analytics |

---

# Performance Goals

| Metric | Goal |
|---|---|
| Trace overhead | <5ms |
| Realtime updates | <1s |
| Token estimation | O(n) |
| Mongo insert speed | Fast async writes |

---

# Inspiration

Inspired by:
- Datadog
- Sentry
- OpenTelemetry
- LangSmith
- Phoenix Arize

---

# Contributing

```bash
fork → branch → commit → PR
```

---

# License

MIT License

---

# Author

Built by Avik Ghosh

Building infrastructure tooling for AI systems.
