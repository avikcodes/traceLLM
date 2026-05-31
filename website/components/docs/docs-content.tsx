import type { ReactNode } from "react";

type DocSection = {
  id: string;
  title: string;
  content: ReactNode;
};

function Callout({
  variant = "info",
  children,
}: {
  variant?: "info" | "tip" | "warning" | "note";
  children: ReactNode;
}) {
  const colors = {
    info: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    tip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    note: "border-blue-400/20 bg-blue-400/10 text-blue-200",
  };
  const labels = { info: "Info", tip: "Tip", warning: "Warning", note: "Note" };
  return (
    <div className={`my-6 rounded-2xl border px-5 py-4 ${colors[variant]}`}>
      <p className="mb-1 font-mono text-xs uppercase tracking-widest">{labels[variant]}</p>
      <div className="text-sm leading-7 opacity-90">{children}</div>
    </div>
  );
}

function CodeBlock({
  code,
  lang = "bash",
  label,
}: {
  code: string;
  lang?: string;
  label?: string;
}) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
      {label && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="font-mono text-xs text-zinc-500">{label}</span>
          <span className="cursor-pointer font-mono text-xs text-zinc-600 transition hover:text-zinc-400">
            Copy
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 font-mono text-xs text-zinc-500">
        <span>{lang}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-7 text-zinc-300">
        {code}
      </pre>
    </div>
  );
}

function StepCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-[#09090d] p-5">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-400/10 font-mono text-sm text-violet-200">
          {number}
        </span>
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <div className="pl-10 text-sm leading-7 text-zinc-400">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-[#09090d]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-zinc-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-zinc-400">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const sections: Record<string, DocSection[]> = {
  "getting-started/what-is-tracellm": [
    {
      id: "what-is-tracellm",
      title: "What is TraceLLM?",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM is an open-source, local-first observability platform for LLMs and AI agents.
            It captures every step of every execution — prompts, responses, tool calls, latency,
            token usage, and errors — so you can debug, replay, and analyze your AI workflows with
            surgical precision.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["Trace prompts", "Record every prompt sent to any LLM provider"],
              ["Monitor execution", "Watch agentic workflows unfold in real time"],
              ["Inspect tool calls", "See which tools were invoked and what they returned"],
              ["Replay workflows", "Step through past executions as if they were live"],
              ["Debug failures", "Pinpoint errors, retries, and unexpected branches"],
              ["Analyze latency", "Measure time spent per span and per tool call"],
              ["Track token usage", "Count prompt and completion tokens per trace"],
            ].map(([label, desc]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-[#09090d] p-4"
              >
                <p className="mb-0.5 font-medium text-white">{label}</p>
                <p className="text-sm leading-6 text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "what-problem-does-it-solve",
      title: "What problem does TraceLLM solve?",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Building with LLMs means dealing with non-deterministic outputs, hidden tool call
            chains, and unpredictable latency. When something goes wrong — a hallucination, a
            broken tool call, a timeout — you need more than logs. You need a complete, replayable
            record of exactly what happened.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM gives you that record. Every trace is a first-class artifact you can inspect,
            share, and replay. Instead of guessing why an agent took a wrong turn, you open the
            trace and see every decision, every API response, every millisecond.
          </p>
          <Callout variant="info">
            Traces are stored locally by default. No data leaves your machine unless you choose
            to export it.
          </Callout>
        </>
      ),
    },
    {
      id: "why-traditional-debugging-fails",
      title: "Why traditional debugging fails for AI systems",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Traditional logging and APM tools assume deterministic request-response patterns. A
            web request comes in, the server processes it, a response goes out. AI systems break
            that model entirely.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            A single user request can spawn multiple LLM calls, tool executions, retries, and parallel
            branches. The execution is a directed graph — not a straight line. Standard metrics like
            p99 latency lose meaning when you need to trace an agentic loop that called three tools,
            retried twice, and then took a different path on the fifth attempt.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM models execution as a directed graph of spans, events, and state transitions
            — the only abstraction rich enough to represent AI workflows. It stores the full
            context, not just a log line.
          </p>
        </>
      ),
    },
    {
      id: "how-tracellm-works",
      title: "How TraceLLM works",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            When you instrument your code — via the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator,
            CLI, or SDK integration — TraceLLM captures the full execution context:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li>Prompts and model responses</li>
            <li>Tool calls and their return values</li>
            <li>Latency per span and per call</li>
            <li>Token counts (prompt and completion)</li>
            <li>Errors, retries, and exception stacks</li>
          </ul>
          <p className="mt-4 leading-7 text-zinc-400">
            Each trace is stored in MongoDB, streamed in real time via WebSocket, and surfaced in
            the dashboard for inspection and replay. The entire stack runs locally — no cloud
            dependency, no data leakage.
          </p>
          <CodeBlock
            code={`# A trace captures the full lifecycle of an LLM interaction
{
  "id": "tr_abc123",
  "prompt": "Explain transformers",
  "response": "A transformer is a neural network architecture...",
  "model": "gpt-4o",
  "latency_ms": 1240,
  "tokens": { "prompt": 12, "completion": 184 },
  "timestamp": "2026-05-31T10:30:00Z",
  "spans": [ ... ]
}`}
            lang="json"
            label="Trace shape"
          />
        </>
      ),
    },
    {
      id: "who-should-use",
      title: "Who should use TraceLLM",
      content: (
        <>
          <ul className="mt-4 list-inside list-disc space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">AI engineers</span> debugging complex agentic workflows
              with multiple tool calls and branching logic.
            </li>
            <li>
              <span className="text-white">Teams shipping LLM features</span> to production who
              need visibility into latency, cost, and failure modes.
            </li>
            <li>
              <span className="text-white">Researchers</span> analyzing model behavior across
              prompts, providers, and parameters.
            </li>
            <li>
              <span className="text-white">Anyone tired of printf-debugging</span> their AI stack
              and ready for first-class observability tooling.
            </li>
          </ul>
        </>
      ),
    },
  ],

  "getting-started/quick-start": [
    {
      id: "quick-start",
      title: "Quick Start",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Get from zero to your first trace in under two minutes. You only need a terminal and
            Python 3.10+.
          </p>
        </>
      ),
    },
    {
      id: "step-1-install",
      title: "Step 1 — Install",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Install TraceLLM via pip. The package includes the CLI, SDK, and all runtime
            dependencies.
          </p>
          <CodeBlock code="pip install tracellm" lang="bash" label="terminal" />
          <Callout variant="tip">
            Use a virtual environment: <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">python -m venv .venv && source .venv/bin/activate</code>
          </Callout>
        </>
      ),
    },
    {
      id: "step-2-start-stack",
      title: "Step 2 — Start the Stack",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Start all TraceLLM services with a single command:
          </p>
          <CodeBlock code="tracellm start" lang="bash" label="terminal" />
          <p className="mt-4 leading-7 text-zinc-400">
            This launches three services automatically:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">Dashboard</p>
              <p className="text-sm leading-6 text-zinc-500">
                Web UI at <span className="font-mono text-zinc-300">localhost:3000</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">WebSocket</p>
              <p className="text-sm leading-6 text-zinc-500">
                Real-time event stream at <span className="font-mono text-zinc-300">localhost:3200</span>
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">MongoDB</p>
              <p className="text-sm leading-6 text-zinc-500">
                Trace storage at <span className="font-mono text-zinc-300">localhost:27017</span>
              </p>
            </div>
          </div>
          <Callout variant="note">
            The first start may take a moment while MongoDB initializes. Subsequent starts are
            near-instant.
          </Callout>
        </>
      ),
    },
    {
      id: "step-3-run-trace",
      title: "Step 3 — Run Your First Trace",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Run a trace against any prompt. TraceLLM sends the prompt to your configured LLM
            provider and captures the full execution.
          </p>
          <CodeBlock
            code={`tracellm trace "Explain transformers"`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            You will see the trace ID printed to the terminal along with the model response,
            latency, and token usage.
          </p>
        </>
      ),
    },
    {
      id: "step-4-open-dashboard",
      title: "Step 4 — Open the Dashboard",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Navigate to <a href="http://localhost:3000" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">http://localhost:3000</a>{" "}
            in your browser. Your trace appears in the trace list as soon as it completes.
          </p>
          <div className="my-6 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50">
            <p className="font-mono text-sm text-zinc-600">Dashboard screenshot placeholder</p>
          </div>
          <p className="mt-4 leading-7 text-zinc-400">
            Click on the trace to inspect the full detail: prompt, response, timing breakdown,
            and every span that was created during execution.
          </p>
        </>
      ),
    },
    {
      id: "step-5-replay-trace",
      title: "Step 5 — Replay the Trace",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Replay any recorded trace with the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">replay</code> command. This re-executes the
            trace using the captured inputs and shows the same execution path.
          </p>
          <CodeBlock
            code={`tracellm replay tr_abc123`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Replace <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tr_abc123</code> with the ID returned by your trace command. Replay is
            useful for debugging failures without running the full workflow again.
          </p>
          <Callout variant="tip">
            Replay respects the original trace&apos;s latency profile by default. Pass{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">--real-time</code> to throttle replay to the original speed.
          </Callout>
        </>
      ),
    },
  ],

  "getting-started/installation": [
    {
      id: "prerequisites",
      title: "Prerequisites",
      content: (
        <>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li>Python 3.10 or later</li>
            <li>MongoDB 6.0 or later (local or remote)</li>
            <li>
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">pip</code> (Python package manager, included with Python 3.10+)
            </li>
          </ul>
          <Callout variant="info">
            TraceLLM works with any MongoDB-compatible service, including MongoDB Atlas and
            local Docker instances.
          </Callout>
        </>
      ),
    },
    {
      id: "install-tracellm",
      title: "Install TraceLLM",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The recommended install path is via pip. All runtime dependencies — including the CLI,
            SDK, and WebSocket client — are bundled in a single package.
          </p>
          <CodeBlock code="pip install tracellm" lang="bash" label="terminal" />
          <p className="mt-4 leading-7 text-zinc-400">To install with optional extras:</p>
          <CodeBlock
            code={`pip install "tracellm[openai]"     # OpenAI integration
pip install "tracellm[groq]"       # Groq integration
pip install "tracellm[langchain]"   # LangChain integration
pip install "tracellm[all]"         # All integrations`}
            lang="bash"
            label="terminal"
          />
        </>
      ),
    },
    {
      id: "verify-installation",
      title: "Verify Installation",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Confirm TraceLLM installed correctly:
          </p>
          <CodeBlock
            code={`tracellm --version
tracellm --help`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            You should see the version number and a list of available commands. To verify the
            full stack starts correctly:
          </p>
          <CodeBlock code="tracellm start --check" lang="bash" label="terminal" />
          <Callout variant="tip">
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">start --check</code> runs a health probe on each service without
            keeping the process running.
          </Callout>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">Common installation issues and their fixes:</p>
          <Table
            headers={["Issue", "Solution"]}
            rows={[
              [
                "pip install fails",
                "Upgrade pip: pip install --upgrade pip",
              ],
              [
                "MongoDB connection refused",
                "Ensure MongoDB is running: mongod --dbpath /data/db",
              ],
              [
                "Port 3000 already in use",
                "Set TRACELLM_PORT=3001 before starting",
              ],
              [
                "WebSocket won't connect",
                "Check firewall rules for port 3200",
              ],
              [
                "Command not found after install",
                "Verify your Python bin directory is in PATH",
              ],
              [
                "ImportError in SDK code",
                "Ensure no other tracellm versions are installed: pip list | grep tracellm",
              ],
            ]}
          />
        </>
      ),
    },
  ],

  "getting-started/first-trace": [
    {
      id: "first-trace",
      title: "First Trace",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            This walkthrough creates your first trace, explains what happens at each internal
            stage, and shows you how to inspect and replay the result.
          </p>
        </>
      ),
    },
    {
      id: "run-your-first-trace",
      title: "Run Your First Trace",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Make sure TraceLLM is installed and the stack is running, then execute:
          </p>
          <CodeBlock
            code={`tracellm trace "Explain transformers"`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM sends the prompt to your configured LLM provider, captures the response,
            and records the full execution as a trace. The terminal output shows:
          </p>
          <CodeBlock
            code={`Trace ID:     tr_2kf9q3m1
Model:        gpt-4o
Latency:      1.24s
Prompt Tokens:  12
Completion Tokens: 184
Status:       success

A transformer is a neural network architecture...`}
            lang="text"
            label="Example output"
          />
        </>
      ),
    },
    {
      id: "what-happens-internally",
      title: "What Happens Internally",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Each trace passes through seven distinct stages. Understanding these stages helps
            you debug issues and interpret the data in the dashboard.
          </p>
          <StepCard number="1" title="Request Created">
            The CLI constructs a request using your prompt and the default model configuration.
            It selects the LLM provider based on environment variables or the local config file.
          </StepCard>
          <StepCard number="2" title="Trace Generated">
            A trace object is created with a unique ID (<span className="font-mono text-zinc-300">tr_</span> prefix), a timestamp,
            and metadata including the model name, provider, and prompt length.
          </StepCard>
          <StepCard number="3" title="Metrics Captured">
            As the LLM call executes, TraceLLM records latency, token usage (prompt and
            completion), and estimated cost. These metrics power the analytics dashboard.
          </StepCard>
          <StepCard number="4" title="Stored in MongoDB">
            The complete trace document — including spans, events, and all metadata — is
            persisted to the <span className="font-mono text-zinc-300">traces</span> collection in MongoDB. This enables historical
            querying and replay.
          </StepCard>
          <StepCard number="5" title="WebSocket Event Emitted">
            A real-time event is pushed to all connected WebSocket clients. The dashboard
            listens on this channel and updates without needing to poll.
          </StepCard>
          <StepCard number="6" title="Dashboard Updated">
            The dashboard receives the event and renders the trace in the trace list. Clicking
            the trace opens the inspector with the full execution graph.
          </StepCard>
          <StepCard number="7" title="Replay Available">
            Once stored, the trace is immediately replayable via{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm replay {"<id>"}</code>.
            Replay re-executes the trace using captured inputs and preserves the original spans.
          </StepCard>
        </>
      ),
    },
    {
      id: "inspect-in-dashboard",
      title: "Inspect in the Dashboard",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Open <a href="http://localhost:3000" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">http://localhost:3000</a> and find your trace in the list. Click it to see:
          </p>
          <div className="my-6 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50">
            <p className="font-mono text-sm text-zinc-600">Trace inspector screenshot placeholder</p>
          </div>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li>The full prompt and model response</li>
            <li>A waterfall view of every span and its duration</li>
            <li>Token usage broken down per call</li>
            <li>Any errors or retries that occurred</li>
          </ul>
        </>
      ),
    },
    {
      id: "next-steps",
      title: "Next Steps",
      content: (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              [
                "Instrument your code",
                "Use the @trace decorator to automatically trace Python functions.",
                "/docs/sdk/trace-decorator",
              ],
              [
                "Integrate with OpenAI",
                "Trace OpenAI requests with zero-config SDK integration.",
                "/docs/integrations/openai",
              ],
              [
                "Explore the dashboard",
                "Browse traces, analytics, and live logs in the web UI.",
                "/docs/dashboard/overview",
              ],
              [
                "Export trace data",
                "Export traces as JSON for sharing or offline analysis.",
                "/docs/cli/tracellm-export",
              ],
            ].map(([title, desc, href]) => (
              <a
                key={title}
                href={href}
                className="rounded-2xl border border-white/10 bg-[#09090d] p-5 transition hover:border-violet-300/30 hover:bg-white/[0.035]"
              >
                <p className="mb-1 font-medium text-white">{title}</p>
                <p className="text-sm leading-6 text-zinc-500">{desc}</p>
              </a>
            ))}
          </div>
        </>
      ),
    },
  ],
  "cli/tracellm": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm</code> command is the top-level entry point for the TraceLLM
            SDK and developer CLI. When run without a subcommand, it opens an interactive
            command palette that lets you navigate and execute any TraceLLM operation using
            arrow keys.
          </p>
        </>
      ),
    },
    {
      id: "syntax",
      title: "Syntax",
      content: (
        <>
          <CodeBlock
            code={`tracellm [COMMAND] [OPTIONS] [ARGS]`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">Available commands:</p>
          <CodeBlock
            code={`start            Start the TraceLLM observability stack
trace            Run a production-style traced prompt simulation
replay           Replay a saved trace from MongoDB
monitor          Watch incoming traces in real time
export           Export traces from MongoDB
demo             Generate a realistic demo trace
create-project   Create a project and generate a secure API key`}
            lang="text"
            label="commands"
          />
        </>
      ),
    },
    {
      id: "interactive-palette",
      title: "Interactive Palette",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Running <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm</code> without any arguments launches a full-screen Rich
            TUI that lists every available command. Navigate with the arrow keys, press{" "}
            <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">Enter</kbd> to
            select, and press <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">q</kbd> or{" "}
            <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">Esc</kbd> to quit.
          </p>
          <Callout variant="tip">
            In headless environments where raw terminal input is unavailable, the palette
            falls back to a numbered menu automatically.
          </Callout>
        </>
      ),
    },
    {
      id: "global-options",
      title: "Global Options",
      content: (
        <>
          <Table
            headers={["Option", "Description"]}
            rows={[
              ["--help", "Show the help message and exit"],
              ["--version", "Show the installed TraceLLM version"],
            ]}
          />
        </>
      ),
    },
    {
      id: "examples",
      title: "Examples",
      content: (
        <>
          <CodeBlock
            code={`# Open the interactive command palette
tracellm

# Show help for the CLI
tracellm --help

# Run a specific subcommand
tracellm trace "Explain quantum computing"`}
            lang="bash"
            label="terminal"
          />
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "No such command",
                "Typo or unknown subcommand",
                "Run tracellm --help to list valid commands",
              ],
              [
                "Palette not rendering",
                "Terminal does not support raw input",
                "The fallback numbered menu activates automatically",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Callout variant="warning">
            If the palette appears garbled, ensure your terminal supports ANSI escape
            sequences and has a minimum width of 80 columns.
          </Callout>
        </>
      ),
    },
  ],

  "cli/tracellm-start": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm start</code> command boots the entire TraceLLM observability
            stack: the FastAPI backend server, WebSocket endpoint, and — optionally — the
            frontend dashboard. It is the standard way to launch a local development
            environment.
          </p>
        </>
      ),
    },
    {
      id: "syntax",
      title: "Syntax",
      content: (
        <>
          <CodeBlock
            code={`tracellm start [OPTIONS]`}
            lang="bash"
            label="terminal"
          />
          <Table
            headers={["Option", "Type", "Default", "Description"]}
            rows={[
              ["--port, -p", "int", "8000", "Port for the API server"],
              ["--dashboard, -d", "flag", "false", "Open the dashboard in your browser"],
              ["--dashboard-port", "int", "3000", "Port for the frontend dashboard"],
            ]}
          />
        </>
      ),
    },
    {
      id: "what-happens-internally",
      title: "What Happens Internally",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Loads environment variables</span> from a{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">.env</code> file using
              python-dotenv.
            </li>
            <li>
              <span className="text-white">Checks MongoDB connectivity</span> by pinging the
              server at <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">MONGO_URL</code>. If unreachable, logs a yellow warning and
              continues — the API will start without persistence.
            </li>
            <li>
              <span className="text-white">Starts the FastAPI server</span> via a
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> subprocess.Popen</code> running{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">uvicorn app.main:app</code> on the
              specified port with live reload enabled.
            </li>
            <li>
              <span className="text-white">Performs a health check</span> by polling{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">http://127.0.0.1:&lt;port&gt;/</code>{" "}
              with a 15-second timeout. The check retries every 500ms.
            </li>
            <li>
              <span className="text-white">Opens the dashboard</span> (if{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">--dashboard</code> is set) in
              the default browser using <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">webbrowser.open</code>.
            </li>
            <li>
              <span className="text-white">Renders a status table</span> showing API Server,
              MongoDB, Dashboard, and WebSocket status.
            </li>
            <li>
              <span className="text-white">Blocks on the API process</span> until{" "}
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">Ctrl+C</kbd> is pressed, then
              terminates the uvicorn process gracefully.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "example-output",
      title: "Example Output",
      content: (
        <>
          <CodeBlock
            code={`  ╭─── TraceLLM ───────────────────────────────────────────────╮
  │                                                          │
  │   ████████╗██████╗  █████╗  ██████╗███████╗             │
  │   ╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝             │
  │      ██║   ██████╔╝███████║██║     █████╗               │
  │      ██║   ██╔══██╗██╔══██║██║     ██╔══╝               │
  │      ██║   ██║  ██║██║  ██║╚██████╗███████╗             │
  │      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚══════╝             │
  │                                                          │
  │   LLM Observability Platform                             │
  ╰──────────────────────────────────────────────────────────╯

  TraceLLM starting...

  ✓ MongoDB connected
  ✓ API ready
  ✓ WebSocket ready

  ╭── TraceLLM Stack ────────────────────────────────────────╮
  │                                                          │
  │  API Server   ● http://127.0.0.1:8000                    │
  │  MongoDB      ● Connected                                │
  │  Dashboard    ● http://localhost:3000                     │
  │  WebSocket    ws://127.0.0.1:8000/ws                     │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯`}
            lang="text"
            label="Terminal output"
          />
        </>
      ),
    },
    {
      id: "environment-variables",
      title: "Environment Variables",
      content: (
        <>
          <Table
            headers={["Variable", "Required", "Description"]}
            rows={[
              ["MONGO_URL", "No (warning if missing)", "MongoDB connection string for trace persistence"],
            ]}
          />
          <Callout variant="warning">
            Without <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">MONGO_URL</code>, the API starts but traces are not persisted.
            Set it to a valid MongoDB URI before running traces.
          </Callout>
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "Port already in use",
                "Another process is using the port",
                "Use --port to specify a different port",
              ],
              [
                "MongoDB not reachable",
                "MongoDB is not running or MONGO_URL is wrong",
                "Start MongoDB or check your MONGO_URL value",
              ],
              [
                "API failed to start",
                "Dependency issue or port conflict",
                "Check the uvicorn logs for the exact error",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Callout variant="info">
            If the health check times out, ensure no firewall is blocking the port and that
            all dependencies are installed. Run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">pip install tracellm[all]</code> to ensure all extras are
            available.
          </Callout>
        </>
      ),
    },
  ],

  "cli/tracellm-trace": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm trace</code> command sends a prompt to your configured LLM
            provider and captures the full execution as a trace. It simulates a production
            RAG + agent workflow — embedding, vector search, reranking, planning, tool
            chaining, and generation — and records every span with timing and metadata.
          </p>
        </>
      ),
    },
    {
      id: "syntax",
      title: "Syntax",
      content: (
        <>
          <CodeBlock
            code={`tracellm trace [OPTIONS] PROMPT`}
            lang="bash"
            label="terminal"
          />
          <Table
            headers={["Argument", "Type", "Required", "Description"]}
            rows={[
              ["PROMPT", "string", "Yes", "The prompt text to trace (positional)"],
            ]}
          />
          <Table
            headers={["Option", "Type", "Default", "Description"]}
            rows={[
              ["--model", "str", "gpt-4.1-mini", "Model name label for the trace"],
              ["--project", "str", "default", "Project identifier or display name"],
              ["--environment", "str", "development", "Environment label"],
              ["--api-key", "str", "None", "TraceLLM API key for project resolution"],
            ]}
          />
        </>
      ),
    },
    {
      id: "what-happens-internally",
      title: "What Happens Internally",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Context resolution</span> — If{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">--api-key</code> is provided, the
              project ID, name, and environment are looked up from MongoDB. Otherwise the
              provided flags are used directly.
            </li>
            <li>
              <span className="text-white">Event stream starts</span> — A rich live trace
              stream displays timestamped events as they occur: query embedding, vector
              search, context reranking, agent planning, context allocation, tool chaining,
              and LLM generation.
            </li>
            <li>
              <span className="text-white">Simulation runs</span> — The internal simulation
              executes a multi-step agentic workflow with random delays, retries, and
              embedding dimensions to produce realistic trace data.
            </li>
            <li>
              <span className="text-white">Trace finalized</span> — Latency, token counts,
              status, and all step data are assembled into a trace payload.
            </li>
            <li>
              <span className="text-white">Persistence</span> — The trace is saved to MongoDB
              via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">save_trace_payload</code>.
            </li>
            <li>
              <span className="text-white">Summary rendered</span> — A trace report card is
              printed showing model, latency, tokens, retries, status, timestamp, and trace
              ID.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "example-output",
      title: "Example Output",
      content: (
        <>
          <CodeBlock
            code={`  Tracing request...

  query.embed        Embedding prompt
  vector.search      Searching vector index
  context.rerank     Reranking context
  agent.plan         Planning tool execution
  context.allocate   Allocating context window
  tool.chain         Running tool chain
  llm.generate       Generating answer

  ╭── Trace Summary ─────────────────────────────────────────╮
  │                                                          │
  │  Model       gpt-4.1-mini                                │
  │  Latency     3,420 ms                                    │
  │  Tokens      1,247                                       │
  │  Retries     1                                           │
  │  Status      SUCCESS                                     │
  │  Timestamp   2026-05-31T14:22:10Z                        │
  │  Trace ID    tr_2kf9q3m1                                 │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯

  Trace complete`}
            lang="text"
            label="Terminal output"
          />
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "Prompt is required",
                "No prompt argument provided",
                "Add a prompt string: tracellm trace \"your prompt\"",
              ],
              [
                "Trace persistence failed",
                "MongoDB is unavailable",
                "Start MongoDB or check your MONGO_URL",
              ],
              [
                "Simulation error",
                "Internal trace step failed",
                "Check the error output — it is captured in the trace",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Callout variant="warning">
            The trace command simulates an LLM workflow end-to-end, including random retries.
            If you see a yellow warning about retries, this is expected behavior — the
            workflow automatically retries failed tool calls.
          </Callout>
        </>
      ),
    },
  ],

  "cli/tracellm-replay": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm replay</code> command fetches a saved trace from MongoDB and
            re-executes its timeline step by step in the terminal. Each step is rendered with
            a tree visualization showing the execution order, status, input, and output.
          </p>
        </>
      ),
    },
    {
      id: "syntax",
      title: "Syntax",
      content: (
        <>
          <CodeBlock
            code={`tracellm replay [OPTIONS] TRACE_ID`}
            lang="bash"
            label="terminal"
          />
          <Table
            headers={["Argument", "Type", "Required", "Description"]}
            rows={[
              ["TRACE_ID", "string", "Yes", "The trace ID to replay (e.g. tr_2kf9q3m1)"],
            ]}
          />
          <Table
            headers={["Option", "Type", "Default", "Description"]}
            rows={[
              ["--speed", "float", "1.0", "Replay speed multiplier (min 0.1)"],
              ["--show-response", "flag", "false", "Print the full saved response after replay"],
            ]}
          />
        </>
      ),
    },
    {
      id: "what-happens-internally",
      title: "What Happens Internally",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Fetches the trace</span> from MongoDB by ID via{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">fetch_trace</code>.
            </li>
            <li>
              <span className="text-white">Renders metadata</span> — trace ID, status,
              latency, retry count, and step count in a replay header panel.
            </li>
            <li>
              <span className="text-white">Iterates steps</span> using Rich Live display. For
              each step it renders an execution tree showing which steps are completed (✓),
              active (▶), and pending, alongside a detail panel with tool name, duration,
              status, input (clipped to 200 chars), and output (clipped to 200 chars).
            </li>
            <li>
              <span className="text-white">Throttles timing</span> — waits{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">duration / 1000 / speed</code>{" "}
              seconds between steps, clamped between 80ms and 550ms.
            </li>
            <li>
              <span className="text-white">Prints final report</span> — a summary table plus
              a response preview (up to 600 chars). If{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">--show-response</code> is set, the
              full response is printed.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "example-output",
      title: "Example Output",
      content: (
        <>
          <CodeBlock
            code={`  Replaying execution timeline...

  ╭── Replay ────────────────────────────────────────────────╮
  │                                                          │
  │  trace_id   tr_2kf9q3m1                                  │
  │  status     SUCCESS                                      │
  │  latency    3420.00 ms                                   │
  │  retries    1                                            │
  │  steps      9                                            │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯

  ╭── Replaying step 3/9 ────────────────────────────────────╮
  │                                                          │
  │  ╭── Execution Timeline ─────────────────────────────╮   │
  │  │                                                    │   │
  │  │  ✓ query.embed                                     │   │
  │  │  ✓ vector.search                                   │   │
  │  │  ▶ context.rerank                                  │   │
  │  │  ○ agent.plan                                      │   │
  │  │  ○ context.allocate                                │   │
  │  │  ○ tool.chain                                      │   │
  │  │  ○ llm.generate                                    │   │
  │  │                                                    │   │
  │  ╰────────────────────────────────────────────────────╯   │
  │                                                          │
  │  ╭── Step Detail ────────────────────────────────────╮   │
  │  │                                                    │   │
  │  │  step       3/9                                    │   │
  │  │  tool       context.rerank                         │   │
  │  │  duration   340 ms                                 │   │
  │  │  status     OK                                     │   │
  │  │  input      {"query": "Explain transformers",...}  │   │
  │  │  output     {"reranked": true, "matches": 5}       │   │
  │  │                                                    │   │
  │  ╰────────────────────────────────────────────────────╯   │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯

  Replay complete`}
            lang="text"
            label="Terminal output"
          />
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "Trace not found",
                "Invalid trace ID or trace was deleted",
                "Verify the trace ID with tracellm export or the dashboard",
              ],
              [
                "No steps to replay",
                "Trace exists but has no recorded steps",
                "Some traces may be empty — check the trace in the dashboard",
              ],
              [
                "MongoDB connection failed",
                "Database is unreachable",
                "Ensure MongoDB is running and MONGO_URL is correct",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Callout variant="tip">
            Use <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">--speed 2</code> to replay twice as fast for quick debugging, or{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">--speed 0.5</code> to watch each step in slow motion.
          </Callout>
        </>
      ),
    },
  ],

  "cli/tracellm-monitor": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm monitor</code> command opens a full-screen live dashboard
            — like htop for AI systems. It connects to the backend WebSocket for real-time
            trace events and falls back to polling MongoDB when the server is unavailable,
            with automatic reconnection.
          </p>
        </>
      ),
    },
    {
      id: "syntax",
      title: "Syntax",
      content: (
        <>
          <CodeBlock
            code={`tracellm monitor [OPTIONS]`}
            lang="bash"
            label="terminal"
          />
          <Table
            headers={["Option", "Type", "Default", "Description"]}
            rows={[
              ["--refresh, -r", "float", "2.0", "Polling interval in seconds"],
              ["--limit, -l", "int", "10", "Number of recent traces to display"],
              ["--ws-host", "str", "env or 127.0.0.1", "Backend WebSocket host"],
              ["--ws-port", "int", "env or 8000", "Backend WebSocket port"],
            ]}
          />
        </>
      ),
    },
    {
      id: "what-happens-internally",
      title: "What Happens Internally",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Starts a WebSocket listener</span> in a background
              daemon thread that auto-discovers the endpoint by probing common ports (8000,
              8001, 8080, 3000).
            </li>
            <li>
              <span className="text-white">Connects to the WebSocket</span> at{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ws://&lt;host&gt;:&lt;port&gt;/ws</code>{" "}
              and listens for <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace.created</code> events. Implements exponential
              backoff reconnection from 1s to 30s.
            </li>
            <li>
              <span className="text-white">Renders a Rich Live dashboard</span> with two
              panels:
              <ul className="ml-6 mt-2 list-disc space-y-1">
                <li>Overview — total traces, completed, errors, avg latency, P95 latency, total tokens, WebSocket status</li>
                <li>Recent Traces — time, status, model, latency, tokens, steps, and prompt preview</li>
              </ul>
            </li>
            <li>
              <span className="text-white">Switches data sources</span> — uses live WebSocket
              events when connected, polls MongoDB every <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">--refresh</code> seconds
              otherwise.
            </li>
            <li>
              <span className="text-white">Handles shutdown</span> on{" "}
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">Ctrl+C</kbd> — sets the stop event, terminates the WebSocket
              thread, and prints {`"Monitor stopped."`}
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "example-output",
      title: "Example Output",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The monitor renders a full-screen dashboard that updates in real time:
          </p>
          <CodeBlock
            code={`╭── TraceLLM Monitor ─────────────────────── Ctrl+C to stop ──╮
│                                                                  │
│  Monitor active                                                   │
│                                                                  │
│  ╭── Overview ───────────────────────────────────────────────╮   │
│  │                                                            │   │
│  │  Total Traces    12                                       │   │
│  │  Completed       10                                       │   │
│  │  Errors          2                                        │   │
│  │  Avg Latency     2,340 ms                                 │   │
│  │  P95 Latency     4,120 ms                                 │   │
│  │  Total Tokens    14,823                                   │   │
│  │  WebSocket       ● Connected                              │   │
│  │                                                            │   │
│  ╰────────────────────────────────────────────────────────────╯   │
│                                                                  │
│  ╭── Recent Traces (12 unique) ─────────────────────────────╮   │
│  │                                                            │   │
│  │  Time      Status   Model          Latency  Tokens  Steps  │   │
│  │  14:22:10  SUCCESS  gpt-4.1-mini   3420ms  1,247   9      │   │
│  │  14:20:05  SUCCESS  gpt-4.1-mini   1890ms    892   7      │   │
│  │  14:18:30  FAILED   gpt-4.1-mini   4500ms    312   3      │   │
│  │  14:15:44  SUCCESS  gpt-4.1-mini   2760ms  1,024   8      │   │
│  │  14:12:10  SUCCESS  gpt-4.1-mini   3120ms  1,156   9      │   │
│  │                                                            │   │
│  ╰────────────────────────────────────────────────────────────╯   │
╰──────────────────────────────────────────────────────────────────╯`}
            lang="text"
            label="Monitor dashboard"
          />
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "WebSocket Unavailable",
                "Backend is not running or port is wrong",
                "Start the stack with tracellm start first, or specify --ws-port",
              ],
              [
                "DB poll error",
                "MongoDB is unreachable",
                "Check MongoDB connection and MONGO_URL",
              ],
              [
                "Dashboard is empty",
                "No traces have been recorded yet",
                "Run tracellm trace to generate traces",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Callout variant="info">
            When the WebSocket is unreachable, the monitor falls back to polling MongoDB
            automatically. You will see a yellow {`"Unavailable"`} status and the polling
            interval indicator in the subtitle.
          </Callout>
          <Callout variant="tip">
            Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">TRACELLM_WS_HOST</code> and{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">TRACELLM_WS_PORT</code> environment variables to configure
            the WebSocket endpoint without passing CLI flags.
          </Callout>
        </>
      ),
    },
  ],

  "cli/tracellm-export": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm export</code> command fetches recent traces from MongoDB and
            writes them to a file in JSON or CSV format. Exported data includes full trace
            objects with all steps (JSON) or a flat summary table (CSV).
          </p>
        </>
      ),
    },
    {
      id: "syntax",
      title: "Syntax",
      content: (
        <>
          <CodeBlock
            code={`tracellm export [OPTIONS]`}
            lang="bash"
            label="terminal"
          />
          <Table
            headers={["Option", "Type", "Default", "Description"]}
            rows={[
              ["--format", "str", "json", "Export format: json or csv"],
              ["--limit", "int", "100", "Number of recent traces to export (1–1000)"],
            ]}
          />
        </>
      ),
    },
    {
      id: "what-happens-internally",
      title: "What Happens Internally",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Validates format</span> — raises an error if the
              format is not <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">json</code> or{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">csv</code>.
            </li>
            <li>
              <span className="text-white">Fetches recent traces</span> from MongoDB via{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">fetch_recent_traces(limit)</code>.
            </li>
            <li>
              <span className="text-white">Creates export directory</span> —{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">./exports/</code> is created if it
              does not exist.
            </li>
            <li>
              <span className="text-white">Generates a timestamp</span> in the format{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">YYYYMMDD-HHMMSS</code> for the
              filename.
            </li>
            <li>
              <span className="text-white">Writes the file</span>:
              <ul className="ml-6 mt-2 list-disc space-y-1">
                <li>JSON — full trace objects with all steps, serialized with model_dump(mode={'"json"'})</li>
                <li>CSV — flat fields only: trace_id, project_id, prompt, model, status, latency, tokens, retries, timestamps, step count. Steps are not included.</li>
              </ul>
            </li>
            <li>
              <span className="text-white">Prints success message</span> — shows the number
              of exported traces and the file path.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "example-output",
      title: "Example Output",
      content: (
        <>
          <CodeBlock
            code={`  Exporting traces...

  ╭── Export Successful ─────────────────────────────────────╮
  │                                                          │
  │  12 traces exported                                      │
  │  File: exports/traces-20260531-142210.json               │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯`}
            lang="text"
            label="Terminal output"
          />
        </>
      ),
    },
    {
      id: "json-format",
      title: "JSON Export Format",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Each exported JSON file contains an array of trace objects. Each trace includes
            the full execution details:
          </p>
          <CodeBlock
            code={`[
  {
    "trace_id": "tr_2kf9q3m1",
    "project_id": "default",
    "project_name": "default",
    "environment": "development",
    "prompt": "Explain transformers",
    "model_name": "gpt-4.1-mini",
    "status": "success",
    "latency": 3420.0,
    "token_count": 1247,
    "retry_count": 1,
    "slow_request": false,
    "failure_reason": null,
    "created_at": "2026-05-31T14:22:10",
    "updated_at": "2026-05-31T14:22:14",
    "steps": [
      {
        "tool_name": "query.embed",
        "duration": 180.0,
        "success": true,
        "input": {},
        "output": { "embedding": [...] }
      }
    ]
  }
]`}
            lang="json"
            label="exported-traces.json"
          />
        </>
      ),
    },
    {
      id: "csv-format",
      title: "CSV Export Format",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The CSV format exports flat fields suitable for spreadsheet analysis. Steps are
            not included — only the step count per trace is recorded.
          </p>
          <CodeBlock
            code={`trace_id,project_id,project_name,environment,prompt,model_name,status,latency,token_count,retry_count,slow_request,failure_reason,created_at,updated_at,step_count
tr_2kf9q3m1,default,default,development,"Explain transformers",gpt-4.1-mini,success,3420.0,1247,1,false,,2026-05-31T14:22:10,2026-05-31T14:22:14,9
tr_4h8j2p5,default,default,development,"What is attention?",gpt-4.1-mini,success,1890.0,892,0,false,,2026-05-31T14:20:05,2026-05-31T14:20:08,7`}
            lang="text"
            label="exported-traces.csv"
          />
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "Invalid format",
                "Format is not json or csv",
                "Use --format json or --format csv",
              ],
              [
                "Export directory unwritable",
                "Permissions issue with ./exports/",
                "Check directory permissions or create it manually",
              ],
              [
                "No traces to export",
                "MongoDB is empty",
                "Run some traces first with tracellm trace",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Callout variant="tip">
            Export files are written to <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">./exports/</code> relative to the current
            working directory. Use absolute paths or run the command from your project root.
          </Callout>
        </>
      ),
    },
  ],
  "sdk/trace-decorator": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator is the primary instrumentation API in
            TraceLLM. Wrapping any function with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> automatically captures
            the full execution context — prompt, response, latency, token usage, errors, and
            nested tool calls — and persists it as a trace document in MongoDB.
          </p>
        </>
      ),
    },
    {
      id: "syntax",
      title: "Syntax",
      content: (
        <>
          <CodeBlock
            code={`from tracellm import trace

@trace(
    prompt="optional prompt or defaults to function name",
    model_name="gpt-4.1-mini",
    project="my-project",
    environment="production",
    api_key="tlm_sk_...",
)
def my_function():
    ...`}
            lang="python"
            label="@trace decorator"
          />
        </>
      ),
    },
    {
      id: "parameters",
      title: "Parameters",
      content: (
        <>
          <Table
            headers={["Parameter", "Type", "Default", "Description"]}
            rows={[
              ["prompt", "str", '"" (falls back to func.__name__)', "The prompt or operation label recorded on the trace"],
              ["model_name", "str", '"unknown"', "Model identifier stored on the trace for filtering and analytics"],
              ["project", "str or None", "None", "Project name for grouping traces in the dashboard"],
              ["environment", "str", '"development"', "Environment label: development, staging, or production"],
              ["api_key", "str or None", "None", "TraceLLM API key for project context resolution"],
            ]}
          />
          <Callout variant="note">
            When <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">api_key</code> is provided, the project ID, project name, and
            environment are resolved from the database record. Otherwise the decorator&apos;s
            parameter values are used directly.
          </Callout>
        </>
      ),
    },
    {
      id: "trace-lifecycle",
      title: "Trace Lifecycle",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Every decorated function triggers the same six-stage lifecycle:
          </p>
          <StepCard number="1" title="Start Time Captured">
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">datetime.now(timezone.utc)</code> records the human-readable timestamp.
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> time.perf_counter()</code> starts the high-precision latency timer.
          </StepCard>
          <StepCard number="2" title="Project Context Resolved">
            If an API key was provided, the project ID, name, and environment are looked
            up from MongoDB. Otherwise the decorator arguments or defaults are used.
          </StepCard>
          <StepCard number="3" title="Context Variable Set">
            A <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">contextvars.ContextVar</code> is initialized with empty step and retry
            counters. Any <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace_tool</code> or SDK integration calls that execute
            inside this function will append their steps to this context.
          </StepCard>
          <StepCard number="4" title="Function Executes">
            The wrapped function runs. If it raises, the exception is captured and
            re-raised after finalization.
          </StepCard>
          <StepCard number="5" title="Trace Finalized">
            The latency delta is computed. A trace payload is built with all metadata,
            steps, token estimates, and status. The payload is persisted to MongoDB and
            broadcast via WebSocket. A summary report is rendered to the console.
          </StepCard>
          <StepCard number="6" title="Context Reset">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ContextVar</code> is reset so sibling or subsequent calls start with
            a clean state.
          </StepCard>
        </>
      ),
    },
    {
      id: "metadata-capture",
      title: "Metadata Capture",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Every trace stores these fields, automatically populated by the decorator:
          </p>
          <Table
            headers={["Field", "Source", "Example"]}
            rows={[
              ["trace_id", "Auto-generated UUID4", "tr_2kf9q3m1"],
              ["prompt", "Decorator argument or function name", '"classify_document"'],
              ["model_name", "Decorator argument", '"gpt-4.1-mini"'],
              ["latency", "time.perf_counter() delta", "3420.00"],
              ["token_count", "estimate_tokens() heuristic", "1247"],
              ["status", "Coerced from result or retry count", '"success"'],
              ["project_id", "Resolved from API key or argument", '"default"'],
              ["environment", "Resolved or argument", '"production"'],
              ["slow_request", "true if latency >= 1500ms", "false"],
              ["retry_count", "Collected from nested tools", "1"],
              ["failure_reason", "Exception or result field", "null"],
              ["created_at", "Function start time", "2026-05-31T14:22:10Z"],
            ]}
          />
        </>
      ),
    },
    {
      id: "examples",
      title: "Examples",
      content: (
        <>
          <CodeBlock
            code={`from tracellm import trace

# Basic usage — prompt defaults to function name
@trace()
def classify_document(text: str) -> str:
    return "classified as important"

# With explicit prompt and model
@trace(prompt="classify_document", model_name="gpt-4o")
def classify(text: str) -> str:
    return process(text)

# Production environment with project grouping
@trace(
    prompt="process_payment",
    model_name="gpt-4o",
    project="payment-service",
    environment="production",
    api_key="tlm_sk_abc123def456",
)
def process_payment(transaction: dict) -> str:
    return execute(transaction)`}
            lang="python"
            label="Usage patterns"
          />
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "trace() missing required positional argument",
                "Decorator called without parentheses",
                "Use @trace(), not @trace",
              ],
              [
                "Trace persistence skipped",
                "MongoDB is unavailable",
                "The trace still completes — check MONGO_URL and start MongoDB",
              ],
              [
                "API key not found",
                "Invalid or expired API key",
                "Generate a new key with tracellm create-project",
              ],
            ]}
          />
          <Callout variant="warning">
            Always use <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">@trace()</code> with parentheses, not{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">@trace</code>. The decorator factory requires invocation to return the
            actual wrapper.
          </Callout>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Callout variant="tip">
            If traces are not appearing in the dashboard, verify that MongoDB is
            running and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">MONGO_URL</code> is set. The decorator logs a yellow
            &quot;Trace persistence skipped&quot; warning when persistence fails, but the
            function itself still executes normally.
          </Callout>
        </>
      ),
    },
  ],

  "sdk/sync-functions": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator works with synchronous functions out of the
            box. When applied to a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">def</code> function (not <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">async def</code>), the
            decorator returns a synchronous wrapper that transparently captures the
            same trace lifecycle without any additional configuration.
          </p>
        </>
      ),
    },
    {
      id: "how-it-works",
      title: "How It Works",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The decorator uses <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">inspect.iscoroutinefunction(func)</code> to detect
            whether the decorated function is async. For sync functions, it generates a
            plain <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">def wrapper(*args, **kwargs)</code> that:
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 leading-7 text-zinc-400">
            <li>Records the start timestamp and perf counter</li>
            <li>Resolves project context from API key or decorator arguments</li>
            <li>Sets the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ContextVar</code> for child step collection</li>
            <li>Calls <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">func(*args, **kwargs)</code> synchronously</li>
            <li>Computes latency, builds the trace payload, persists it, and resets the context</li>
          </ol>
        </>
      ),
    },
    {
      id: "example-sync-trace",
      title: "Example: Syncing a Classification Pipeline",
      content: (
        <>
          <CodeBlock
            code={`from tracellm import trace

@trace(
    prompt="classify_invoice",
    model_name="gpt-4o",
    project="doc-processing",
    environment="production",
)
def classify_invoice(invoice_text: str) -> dict:
    # Simulate processing
    categories = ["receipt", "invoice", "purchase_order"]
    result = {"category": categories[hash(invoice_text) % 3], "confidence": 0.94}
    return result

# Usage
output = classify_invoice("INV-2026-05-31: Widget order #4412")
print(output["category"])  # "invoice"`}
            lang="python"
            label="sync_function.py"
          />
        </>
      ),
    },
    {
      id: "latency-and-tokens",
      title: "Latency and Token Tracking",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            For sync functions, latency is measured with{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">time.perf_counter()</code> before and after the function
            call. The delta is converted to milliseconds and rounded to two decimal places.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            Token counts are estimated heuristically from the prompt text, response text,
            and step inputs/outputs using <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">estimate_tokens()</code>:
          </p>
          <CodeBlock
            code={`def estimate_tokens(*parts: Any) -> int:
    text = " ".join(str(part) for part in parts if part is not None)
    if not text.strip():
        return 0
    return max(1, len(text.split()) + len(text) // 4)`}
            lang="python"
            label="token estimation"
          />
          <Callout variant="info">
            When using the OpenAI integration, actual token counts from the API response
            (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">completion.usage.total_tokens</code>) replace the heuristic estimate.
          </Callout>
        </>
      ),
    },
    {
      id: "error-handling",
      title: "Error Handling",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            If the decorated function raises an exception, the trace is still finalized
            and persisted — but with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">{`status: "failed"`}</code> and the exception message
            recorded as <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">failure_reason</code>. The exception is re-raised after the trace
            is saved, so existing error handling in your application continues to work.
          </p>
          <CodeBlock
            code={`@trace(prompt="risky_operation")
def might_fail(value: int) -> int:
    if value < 0:
        raise ValueError("negative values not allowed")
    return value * 2

try:
    might_fail(-1)
except ValueError:
    pass  # Trace was still saved with status="failed"
           # and failure_reason="negative values not allowed"`}
            lang="python"
            label="error_handling.py"
          />
        </>
      ),
    },
    {
      id: "production-patterns",
      title: "Production Patterns",
      content: (
        <>
          <CodeBlock
            code={`from tracellm import trace

# Batch processing with per-item tracing
@trace(prompt="process_batch", model_name="gpt-4o-mini")
def process_batch(items: list[dict]) -> list[dict]:
    results = []
    for item in items:
        results.append(transform(item))
    return results

# Multi-step business logic
@trace(
    prompt="fulfill_order",
    model_name="gpt-4o",
    project="order-service",
    environment="production",
)
def fulfill_order(order: dict) -> dict:
    validated = validate_order(order)
    priced = calculate_pricing(validated)
    confirmed = submit_to_warehouse(priced)
    return {
        "order_id": confirmed["id"],
        "status": "fulfilled",
        "total": priced["total"],
    }`}
            lang="python"
            label="production.py"
          />
        </>
      ),
    },
  ],

  "sdk/async-functions": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator fully supports async functions. When applied to
            an <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">async def</code> function, the decorator returns an async wrapper that
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> await</code>s the original function and captures the same trace lifecycle —
            all while preserving the async event loop context.
          </p>
        </>
      ),
    },
    {
      id: "how-it-works",
      title: "How It Works",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Detection is automatic: <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">inspect.iscoroutinefunction(func)</code> returns
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> True</code> for <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">async def</code> functions, and the decorator generates an
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> async def async_wrapper</code> instead of a sync wrapper. The trace
            lifecycle is identical in both paths:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">Sync Path</p>
              <p className="text-sm leading-6 text-zinc-500">result = func(*args, **kwargs)</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">Async Path</p>
              <p className="text-sm leading-6 text-zinc-500">result = await func(*args, **kwargs)</p>
            </div>
          </div>
          <p className="mt-4 leading-7 text-zinc-400">
            The context variable (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">contextvars.ContextVar</code>) used for step collection
            is natively async-safe. Each concurrent coroutine chain gets its own isolated
            context, so tracing parallel async workflows does not produce interleaved steps.
          </p>
        </>
      ),
    },
    {
      id: "example-async-trace",
      title: "Example: Async API Handler",
      content: (
        <>
          <CodeBlock
            code={`from tracellm import trace

@trace(
    prompt="generate_embedding",
    model_name="text-embedding-3-large",
    project="search-service",
    environment="production",
)
async def generate_embedding(text: str) -> list[float]:
    # Simulate an async embedding API call
    import asyncio
    await asyncio.sleep(0.3)
    return [0.0123] * 1536

@trace(
    prompt="search_documents",
    model_name="gpt-4o-mini",
    project="search-service",
    environment="production",
)
async def search_documents(query: str) -> list[dict]:
    embedding = await generate_embedding(query)
    results = await vector_search(embedding)
    return rerank(results)

# In your async application
async def handler(request):
    results = await search_documents(request.query)
    return {"results": results}`}
            lang="python"
            label="async_api.py"
          />
        </>
      ),
    },
    {
      id: "async-error-handling",
      title: "Async Error Handling",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Async error handling follows the same pattern as sync — exceptions are captured,
            the trace is persisted with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">{`status: "failed"`}</code>, and the exception is
            re-raised.
          </p>
          <CodeBlock
            code={`@trace(prompt="fetch_external_data", model_name="gpt-4o")
async def fetch_data(url: str) -> dict:
    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10)
        response.raise_for_status()
        return response.json()

# If the HTTP call fails, the trace captures the exception
# and re-raises so your application can handle it
try:
    data = await fetch_data("https://api.example.com/data")
except httpx.HTTPStatusError:
    # Trace was already persisted with failure details
    log.error("Failed to fetch data")`}
            lang="python"
            label="async_error.py"
          />
        </>
      ),
    },
    {
      id: "running-async-traces",
      title: "Running Async Traces",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Async traced functions must be called with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">await</code> from within an
            async context, or executed via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">asyncio.run()</code>:
          </p>
          <CodeBlock
            code={`# From an async context
response = await my_traced_function("input")

# From a sync entry point
import asyncio
result = asyncio.run(my_traced_function("input"))`}
            lang="python"
            label="async_execution.py"
          />
          <Callout variant="warning">
            Calling an async-traced function without <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">await</code> returns a
            coroutine object instead of executing the function. The trace is not created
            until the coroutine is awaited.
          </Callout>
        </>
      ),
    },
    {
      id: "production-patterns",
      title: "Production Patterns",
      content: (
        <>
          <CodeBlock
            code={`from tracellm import trace
import asyncio

# Parallel async tracing with isolated contexts
@trace(prompt="process_item", model_name="gpt-4o-mini")
async def process_item(item: dict) -> dict:
    enriched = await enrich(item)
    classified = await classify(enriched)
    return classified

@trace(prompt="batch_process", project="data-pipeline")
async def batch_process(items: list[dict]) -> list[dict]:
    tasks = [process_item(item) for item in items]
    return await asyncio.gather(*tasks)

# FastAPI integration
from fastapi import FastAPI

app = FastAPI()

@app.post("/classify")
async def classify_endpoint(text: str):
    result = await classify_document(text)
    return {"trace_id": result.trace_id, "category": result.category}`}
            lang="python"
            label="async_production.py"
          />
        </>
      ),
    },
  ],

  "sdk/nested-traces": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Nested tracing is the mechanism that lets a parent <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> function
            automatically collect steps from child functions and SDK integrations that
            execute within its scope. This produces a complete execution graph in a single
            trace document.
          </p>
        </>
      ),
    },
    {
      id: "how-it-works",
      title: "How It Works",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Nesting is powered by a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">contextvars.ContextVar</code> named{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">_current_trace_context</code>. When a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code>-decorated
            function starts, it creates a new context dict with an empty{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">collected_steps</code> list and stores it on the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ContextVar</code>.
            Child decorators and integrations read the same <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ContextVar</code> and
            append their step records to that list.
          </p>
          <CodeBlock
            code={`# Parent sets the context:
ctx_token = _current_trace_context.set({
    "collected_steps": [],
    "retry_count": 0,
    ...
})

# Child appends to the parent's list:
def _try_append_step(step):
    ctx = _current_trace_context.get()
    if ctx is not None:
        ctx["collected_steps"].append(step)

# When parent finalizes, it reads collected steps:
ctx = _current_trace_context.get()
if ctx and not steps:
    steps = ctx.get("collected_steps", [])`}
            lang="python"
            label="context_mechanism.py"
          />
        </>
      ),
    },
    {
      id: "trace-tool-decorator",
      title: "The @trace_tool Decorator",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace_tool</code> decorator is designed to instrument individual tool
            calls within a traced function. It records each invocation as a step and
            attaches it to the nearest parent <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> context. It also supports
            automatic retries with exponential backoff.
          </p>
          <Table
            headers={["Parameter", "Type", "Default", "Description"]}
            rows={[
              ["name", "str or None", "None", "Tool name (defaults to function name)"],
              ["max_retries", "int", "0", "Number of automatic retries on failure"],
              ["capture_input", "bool", "true", "Capture function arguments as step input"],
              ["capture_output", "bool", "true", "Capture return value as step output"],
            ]}
          />
          <CodeBlock
            code={`from tracellm import trace, trace_tool

@trace_tool(name="vector_search", max_retries=2)
def search_vectors(query: str, top_k: int = 10) -> list[float]:
    # If this raises, @trace_tool retries up to 2 times
    # with exponential backoff: 0.5s, 1.0s
    return vector_db.query(query, top_k)

@trace(prompt="rag_query", model_name="gpt-4o")
def rag_pipeline(question: str) -> str:
    # This call to search_vectors creates a step
    # automatically attached to the rag_pipeline trace
    results = search_vectors(question, top_k=5)
    return generate_answer(question, results)`}
            lang="python"
            label="trace_tool.py"
          />
          <Callout variant="tip">
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">@trace_tool</code> detects sync vs async automatically, just like{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">@trace</code>. Use it with async functions for tracing concurrent
            tool calls.
          </Callout>
        </>
      ),
    },
    {
      id: "nesting-behavior",
      title: "Nesting Behavior",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The nesting model is single-level for trace documents: steps from all child
            contexts are flattened into the parent&apos;s <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">steps</code> array. Each step
            contains its own metadata (tool name, duration, status, input, output) so the
            execution graph can be reconstructed during replay.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li>Child steps are appended to the parent in execution order</li>
            <li>Each step has a unique <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">step_id</code> (UUID4)</li>
            <li>Retry count is aggregated across all child executions</li>
            <li>Because <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ContextVar</code> is used, parallel execution via{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">asyncio.gather</code> or threading produces correct, non-interleaved
              step lists per trace</li>
          </ul>
        </>
      ),
    },
    {
      id: "example-nested-workflow",
      title: "Example: Nested Agent Workflow",
      content: (
        <>
          <CodeBlock
            code={`from tracellm import trace, trace_tool

# ── Tool layer (instrumented with @trace_tool) ──────────────

@trace_tool(name="retrieve", max_retries=1)
def retrieve(query: str) -> list[dict]:
    docs = vector_db.similarity_search(query, k=5)
    return docs

@trace_tool(name="rerank")
def rerank(docs: list[dict], query: str) -> list[dict]:
    return sorted(docs, key=lambda d: d["score"], reverse=True)[:3]

@trace_tool(name="generate", max_retries=2)
def generate(context: str, query: str) -> str:
    return llm.complete(prompt=context, query=query)

# ── Orchestration layer (instrumented with @trace) ──────────

@trace(
    prompt="answer_question",
    model_name="gpt-4o",
    project="rag-service",
    environment="production",
)
def answer_question(query: str) -> dict:
    docs = retrieve(query)
    ranked = rerank(docs, query)
    context = build_context(ranked)
    answer = generate(context, query)
    return {"answer": answer, "sources": len(ranked)}`}
            lang="python"
            label="nested_workflow.py"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            When <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">answer_question</code> runs, the resulting trace contains three
            steps (retrieve, rerank, generate). Each step records its own duration,
            input, output, and success status. The trace is persisted once with a single
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace_id</code>.
          </p>
        </>
      ),
    },
    {
      id: "context-isolation",
      title: "Context Isolation",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Because <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">contextvars.ContextVar</code> is used, each concurrent execution
            chain gets its own isolated context. This means parallel traces do not
            interfere with each other:
          </p>
          <CodeBlock
            code={`@trace(prompt="parallel_process")
async def process_all(items: list[str]) -> list[dict]:
    # Each call to process_item gets its own context
    # Steps are NOT interleaved between items
    tasks = [process_item(item) for item in items]
    return await asyncio.gather(*tasks)

@trace_tool(name="process_item")
async def process_item(item: str) -> dict:
    step1 = await do_something(item)
    step2 = await do_something_else(step1)
    return {"item": item, "result": step2}`}
            lang="python"
            label="context_isolation.py"
          />
          <Callout variant="info">
            Step collection respects async context switches. If a child tool calls
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs"> await</code> and another coroutine runs during that await, steps from the
            other coroutine are correctly routed to their own parent&apos;s context.
          </Callout>
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "Steps not appearing in trace",
                "@trace_tool used without parent @trace",
                "Ensure a @trace-decorated function calls the @trace_tool function",
              ],
              [
                "Duplicate tool names in steps",
                "Multiple @trace_tool functions with the same name",
                "Set explicit name= on each @trace_tool to distinguish them",
              ],
              [
                "Retry not happening",
                "max_retries not set or function is not raising",
                "Set max_retries=N and ensure the function raises on failure",
              ],
            ]}
          />
        </>
      ),
    },
  ],

  "integrations/openai": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The OpenAI integration automatically traces every chat completion request made
            through an OpenAI client. It captures prompts, responses, model names, latency,
            token usage, streaming chunks, and retry attempts — all as structured steps
            within a TraceLLM trace.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            Two API surfaces are available: <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">wrap_openai()</code> monkey-patches an
            existing <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">OpenAI</code> instance, and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceOpenAI</code> is a drop-in
            replacement class that self-wraps on initialization.
          </p>
        </>
      ),
    },
    {
      id: "installation",
      title: "Installation",
      content: (
        <>
          <CodeBlock
            code={`pip install "tracellm[openai]"`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            This installs <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">openai&gt;=1.6.0</code> alongside TraceLLM. Alternatively,
            install TraceLLM and OpenAI separately:
          </p>
          <CodeBlock
            code={`pip install tracellm openai`}
            lang="bash"
            label="terminal"
          />
        </>
      ),
    },
    {
      id: "setup",
      title: "Setup",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Set your OpenAI API key and wrap your client:
          </p>
          <CodeBlock
            code={`from openai import OpenAI
from tracellm import trace
from tracellm.integrations.openai import wrap_openai

client = OpenAI()
client = wrap_openai(client)`}
            lang="python"
            label="setup.py"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Or use the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceOpenAI</code> class directly:
          </p>
          <CodeBlock
            code={`from tracellm.integrations.openai import TraceOpenAI

client = TraceOpenAI()  # auto-wrapped`}
            lang="python"
            label="TraceOpenAI.py"
          />
        </>
      ),
    },
    {
      id: "example",
      title: "Example",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The standard pattern pairs <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> with a wrapped client. The decorator
            provides the outer trace container (project, environment, metadata), and every
            chat completion call inside it is captured as a step:
          </p>
          <CodeBlock
            code={`from openai import OpenAI
from tracellm import trace
from tracellm.integrations.openai import wrap_openai

client = OpenAI()
client = wrap_openai(client)

@trace(
    prompt="ask_llm",
    model_name="gpt-4o",
    project="customer-support",
    environment="production",
)
def ask_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=500,
    )
    return response.choices[0].message.content

result = ask_llm("What is the capital of France?")
print(result)`}
            lang="python"
            label="openai_example.py"
          />
        </>
      ),
    },
    {
      id: "streaming",
      title: "Streaming",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Streaming is supported transparently. The integration collects chunks as they
            arrive, reconstructs the full response, and records the stream as a single
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> openai_chat_stream</code> step with chunk count metadata:
          </p>
          <CodeBlock
            code={`@trace(prompt="ask_stream", project="streaming-demo")
def ask_stream(prompt: str) -> str:
    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    full = ""
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            content = chunk.choices[0].delta.content
            print(content, end="", flush=True)
            full += content
    print()
    return full`}
            lang="python"
            label="openai_stream.py"
          />
          <Callout variant="info">
            During streaming, the trace is finalized after all chunks are consumed. The
            trace payload includes the complete response, total latency, and estimated
            token count (one token per content-bearing chunk).
          </Callout>
        </>
      ),
    },
    {
      id: "retries",
      title: "Retries and Error Handling",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The integration respects the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">max_retries</code> parameter on chat completion
            calls. Each retry attempt is recorded as a separate step with exponential
            backoff (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">0.5 * 2^attempt</code>, capped at 5s). Failed attempts are marked
            with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">success=False</code>, and the final exception is re-raised if all
            retries are exhausted:
          </p>
          <CodeBlock
            code={`@trace(prompt="unreliable_api", project="retry-demo")
def call_with_retries(prompt: str) -> str:
    # max_retries is passed directly to the OpenAI SDK
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_retries=3,          # <-- TraceLLM captures each retry as a step
    )
    return response.choices[0].message.content`}
            lang="python"
            label="openai_retry.py"
          />
        </>
      ),
    },
    {
      id: "what-trace-captures",
      title: "What the Trace Captures",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Each OpenAI call produces a trace containing:
          </p>
          <Table
            headers={["Data", "Non-Streaming", "Streaming"]}
            rows={[
              ["Prompt", "Full messages array", "Full messages array"],
              ["Response", "Full message content", "Full reconstructed content"],
              ["Model", "From response metadata", "From request kwargs"],
              ["Latency", "perf_counter delta (ms)", "perf_counter delta (ms)"],
              ["Token count", "OpenAI usage.total_tokens", "Estimated from chunks"],
              ["Finish reason", "From choices[0].finish_reason", "N/A"],
              ["Steps", "openai_chat step", "openai_chat_stream step"],
              ["Retries", "Separate step per attempt", "Separate step per attempt"],
            ]}
          />
        </>
      ),
    },
    {
      id: "expected-output",
      title: "Expected Output",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            After running a traced OpenAI call, the console shows a trace summary panel
            and the dashboard displays the trace with its captured step:
          </p>
          <CodeBlock
            code={`  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                              │
  │  Trace ID     tr_a1b2c3d4                                    │
  │  Prompt       What is the capital of France?                 │
  │  Model        gpt-4o                                         │
  │  Project      customer-support                               │
  │  Environment  production                                     │
  │  Latency      1,240.00 ms                                    │
  │  Token Count  87                                             │
  │  Retries      0                                              │
  │  Steps        1                                              │
  │  Status        SUCCESS                                       │
  │                                                              │
  ╰──────────────────────────────────────────────────────────────╯

  #  Tool              Duration  Status  Detail
  1  openai_chat         1240ms     OK`}
            lang="text"
            label="Console output"
          />
        </>
      ),
    },
    {
      id: "verification",
      title: "Verification",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>Check the console for the trace summary panel after each call</li>
            <li>Open the dashboard at <a href="http://localhost:3000" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">http://localhost:3000</a> and find your trace</li>
            <li>Inspect the trace details — the step should show model, messages, and finish reason</li>
            <li>Verify token counts match the OpenAI response metadata</li>
          </ol>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Table
            headers={["Issue", "Cause", "Fix"]}
            rows={[
              [
                "No traces appear",
                "wrap_openai() not called or client created after wrapping",
                "Ensure wrap_openai(client) is called and the wrapped client is used",
              ],
              [
                "Streaming traces have 0 tokens",
                "Stream ended before chunks were collected",
                "Check that the stream is fully consumed before the @trace function returns",
              ],
              [
                "OpenAI import error",
                "openai package not installed",
                "Run pip install 'tracellm[openai]' or pip install openai>=1.6.0",
              ],
              [
                "API key not set",
                "OPENAI_API_KEY environment variable is missing",
                "Set export OPENAI_API_KEY=sk-... or pass api_key= to OpenAI()",
              ],
            ]}
          />
        </>
      ),
    },
  ],

  "integrations/groq": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Groq exposes an OpenAI-compatible API, which means the TraceLLM OpenAI
            integration works with Groq out of the box. Use <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">wrap_openai()</code> or
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> TraceOpenAI</code> with a Groq client configured to point at{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">https://api.groq.com</code>.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            All the same capabilities apply: prompt and response capture, latency measurement,
            token tracking, streaming support, and retry recording.
          </p>
        </>
      ),
    },
    {
      id: "installation",
      title: "Installation",
      content: (
        <>
          <CodeBlock
            code={`pip install "tracellm[openai]"`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            The OpenAI client library is used to communicate with Groq&apos;s API since Groq
            is fully OpenAI-compatible. No separate Groq package is required.
          </p>
        </>
      ),
    },
    {
      id: "setup",
      title: "Setup",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Create an OpenAI client pointed at Groq&apos;s base URL, then wrap it with
            TraceLLM:
          </p>
          <CodeBlock
            code={`from openai import OpenAI
from tracellm import trace
from tracellm.integrations.openai import wrap_openai

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key="gsk_...",  # Your Groq API key
)
client = wrap_openai(client)`}
            lang="python"
            label="groq_setup.py"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Or use the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceOpenAI</code> class with a custom base URL:
          </p>
          <CodeBlock
            code={`from tracellm.integrations.openai import TraceOpenAI

client = TraceOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key="gsk_...",
)
# Auto-wrapped — no need to call wrap_openai()`}
            lang="python"
            label="groq_traceopenai.py"
          />
        </>
      ),
    },
    {
      id: "example",
      title: "Example",
      content: (
        <>
          <CodeBlock
            code={`from openai import OpenAI
from tracellm import trace
from tracellm.integrations.openai import wrap_openai

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key="gsk_your_groq_api_key",
)
client = wrap_openai(client)

@trace(
    prompt="groq_inference",
    model_name="llama-3.3-70b-versatile",
    project="multi-provider",
    environment="production",
)
def run_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content

result = run_groq("Explain Groq LPU inference in one paragraph.")
print(result)`}
            lang="python"
            label="groq_example.py"
          />
        </>
      ),
    },
    {
      id: "streaming",
      title: "Streaming",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Groq streaming works identically to OpenAI streaming through the wrapped client:
          </p>
          <CodeBlock
            code={`@trace(prompt="groq_stream", project="multi-provider")
def groq_stream(prompt: str) -> str:
    stream = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    full = ""
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            full += chunk.choices[0].delta.content
    return full`}
            lang="python"
            label="groq_stream.py"
          />
        </>
      ),
    },
    {
      id: "what-trace-captures",
      title: "What the Trace Captures",
      content: (
        <>
          <Table
            headers={["Data", "Source"]}
            rows={[
              ["Prompt", "Messages array sent to Groq API"],
              ["Response", "Full model output text"],
              ["Model name", "From request kwargs (e.g. llama-3.3-70b-versatile)"],
              ["Latency", "time.perf_counter() before and after the API call"],
              ["Token count", "Estimated via heuristic if Groq returns usage; counted from chunks in streaming"],
              ["Steps", "Single openai_chat step per completion"],
              ["Retries", "max_retries generates a step per attempt"],
            ]}
          />
        </>
      ),
    },
    {
      id: "verification",
      title: "Verification",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>Run the example and confirm the trace summary appears in the console</li>
            <li>Open the TraceLLM dashboard and locate the trace by project name</li>
            <li>Inspect the step detail to verify the Groq model name and response</li>
            <li>Compare latency against direct Groq API calls to confirm minimal overhead</li>
          </ol>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Table
            headers={["Issue", "Cause", "Fix"]}
            rows={[
              [
                "401 Unauthorized",
                "Invalid or missing Groq API key",
                "Set api_key= to a valid Groq key from console.groq.com",
              ],
              [
                "404 Not Found",
                "Incorrect base_url or model name",
                "Use https://api.groq.com/openai/v1 and a valid model name",
              ],
              [
                "Model not found",
                "Groq does not host the requested model",
                "Check available models at console.groq.com/docs/models",
              ],
              [
                "No traces recorded",
                "wrap_openai() not called on the Groq client",
                "Ensure client = wrap_openai(client) is executed",
              ],
            ]}
          />
        </>
      ),
    },
  ],

  "integrations/langchain": [
    {
      id: "overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The LangChain integration uses a custom <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">BaseCallbackHandler</code> to
            instrument LangChain chains, LLM calls, tools, and retrievers. Every event
            — chain start/end, LLM invocation, tool execution, retriever query — is
            captured as a step in the trace timeline.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            The handler collects steps throughout the chain execution. When the chain
            finishes, you call <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">handler.flush_trace()</code> to persist the complete trace
            to MongoDB.
          </p>
        </>
      ),
    },
    {
      id: "installation",
      title: "Installation",
      content: (
        <>
          <CodeBlock
            code={`pip install "tracellm[langchain]"`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            This installs <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">langchain-core&gt;=0.1.0</code>. If you use a specific provider
            like <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">langchain-openai</code>, install it separately:
          </p>
          <CodeBlock
            code={`pip install "tracellm[langchain]" langchain-openai`}
            lang="bash"
            label="terminal"
          />
        </>
      ),
    },
    {
      id: "setup",
      title: "Setup",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Create a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TracellmCallbackHandler</code> instance and pass it via the LangChain
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> config</code> dictionary. After the chain completes, call{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">flush_trace()</code> to persist:
          </p>
          <CodeBlock
            code={`from tracellm import trace
from tracellm.integrations.langchain import TracellmCallbackHandler
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

handler = TracellmCallbackHandler()

@trace(prompt="langchain_chain", project="langchain-demo")
def run_chain(prompt: str) -> str:
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

    messages = [
        SystemMessage(content="You are a helpful assistant."),
        HumanMessage(content=prompt),
    ]
    result = llm.invoke(messages, config={"callbacks": [handler]})

    handler.flush_trace(prompt=prompt, response=result.content)
    return result.content`}
            lang="python"
            label="langchain_setup.py"
          />
        </>
      ),
    },
    {
      id: "example",
      title: "Example: Multi-Step Chain",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            For complex chains with multiple steps, the handler captures each one
            individually:
          </p>
          <CodeBlock
            code={`from tracellm import trace
from tracellm.integrations.langchain import TracellmCallbackHandler
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

handler = TracellmCallbackHandler()

@trace(
    prompt="summarize_and_translate",
    model_name="gpt-4o",
    project="translation-service",
    environment="production",
)
def summarize_and_translate(text: str, target_lang: str) -> str:
    llm = ChatOpenAI(model="gpt-4o", temperature=0.3)

    summarize_prompt = ChatPromptTemplate.from_messages([
        ("system", "Summarize the following text in 2-3 sentences."),
        ("user", "{text}"),
    ])
    translate_prompt = ChatPromptTemplate.from_messages([
        ("system", "Translate the following to {language}."),
        ("user", "{summary}"),
    ])

    summarize_chain = summarize_prompt | llm | StrOutputParser()
    translate_chain = translate_prompt | llm | StrOutputParser()

    summary = summarize_chain.invoke(
        {"text": text},
        config={"callbacks": [handler]},
    )
    translation = translate_chain.invoke(
        {"summary": summary, "language": target_lang},
        config={"callbacks": [handler]},
    )

    handler.flush_trace(prompt=text, response=translation)
    return translation

result = summarize_and_translate(
    "LangChain is a framework for developing applications powered by language models...",
    "French",
)
print(result)`}
            lang="python"
            label="langchain_chain.py"
          />
        </>
      ),
    },
    {
      id: "what-trace-captures",
      title: "What the Trace Captures",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TracellmCallbackHandler</code> hooks into five LangChain event types:
          </p>
          <Table
            headers={["Event", "Callback Method", "Step Captured"]}
            rows={[
              ["LLM start/end", "on_llm_start / on_llm_end", "Prompt text and response content"],
              ["Chain start/end", "on_chain_start / on_chain_end", "Chain name, inputs, outputs, duration per chain"],
              ["Tool start/end", "on_tool_start / on_tool_end", "Tool name, input string, output (truncated to 500 chars)"],
              ["Retriever start/end", "on_retriever_start / on_retriever_end", "Query, document count, document previews"],
              ["Error events", "on_*_error methods", "Error message and success=False status"],
            ]}
          />
          <Callout variant="info">
            The handler keeps an internal chain stack to correctly pair nested start/end
            events, even when chains, tools, and retrievers are interleaved.
          </Callout>
        </>
      ),
    },
    {
      id: "flush-trace",
      title: "The flush_trace() Method",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            After the chain completes, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">flush_trace()</code> finalizes and persists the
            trace. It accepts optional overrides:
          </p>
          <Table
            headers={["Parameter", "Type", "Default", "Description"]}
            rows={[
              ["prompt", "str or None", "Joined LLM inputs", "Override the trace prompt text"],
              ["response", "str or None", "Joined LLM outputs", "Override the trace response text"],
              ["status", "str", '"success"', 'Override status (success, warning, failed)'],
            ]}
          />
        </>
      ),
    },
    {
      id: "verification",
      title: "Verification",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>Run the chain and confirm the trace summary appears in the console</li>
            <li>Open the dashboard and filter by the project name used in @trace</li>
            <li>Inspect the trace steps — each chain, LLM call, and tool invocation appears as a row</li>
            <li>Verify latency per step matches the actual execution duration</li>
          </ol>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: (
        <>
          <Table
            headers={["Issue", "Cause", "Fix"]}
            rows={[
              [
                "No steps captured",
                "Callbacks not passed in config",
                "Add config={'callbacks': [handler]} to every chain/tool invocation",
              ],
              [
                "Trace not persisted",
                "flush_trace() was not called",
                "Call handler.flush_trace() after the chain completes",
              ],
              [
                "LangChain import error",
                "langchain-core not installed",
                "Run pip install 'tracellm[langchain]'",
              ],
              [
                "Steps appear out of order",
                "Nested chains with shared handler",
                "Use a separate handler instance per top-level @trace function",
              ],
            ]}
          />
          <Callout variant="tip">
            For LangChain agents and tool-using chains, each tool invocation generates
            a separate step. Use the dashboard step inspector to see the input/output
            of every tool call in the execution timeline.
          </Callout>
        </>
      ),
    },
  ],

  "core-concepts/replay-engine": [
    {
      id: "why-replay-exists",
      title: "Why Replay Exists",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            AI systems are non-deterministic. The same prompt can produce different
            responses, different latency, different tool call paths, and different failure
            modes on every run. When something goes wrong in production — a hallucination,
            a timeout, a broken tool chain — you cannot simply re-run and hope to see the
            same behavior.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            Replay solves this by storing every step of every execution as structured data.
            Instead of guessing what happened, you open a past trace and watch it unfold
            again — same steps, same timing, same inputs, same outputs — reconstructed from
            the captured trace document.
          </p>
          <Callout variant="info">
            Replay is the observability equivalent of a flight data recorder. It captures
            enough information to reconstruct the full execution graph without needing the
            original LLM provider or external services to be available.
          </Callout>
        </>
      ),
    },
    {
      id: "what-is-replay",
      title: "What Is Replay",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Replay is the process of reconstructing a past execution from its stored trace.
            Given a trace ID, TraceLLM fetches the complete trace document from MongoDB and
            replays each step in sequence, rendering a live execution tree and step detail
            panel in the terminal.
          </p>
          <CodeBlock
            code={`tracellm replay tr_2kf9q3m1`}
            lang="bash"
            label="terminal"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            The replay command takes a trace ID and an optional speed multiplier. It does
            not call any LLM — it reads the captured data and re-renders the execution
            timeline at human-readable speed.
          </p>
          <Table
            headers={["Flag", "Default", "Description"]}
            rows={[
              ["--speed", "1.0", "Replay speed multiplier (min 0.1)"],
              ["--show-response", "false", "Print the full saved response after replay"],
            ]}
          />
        </>
      ),
    },
    {
      id: "how-replay-works",
      title: "How Replay Works Internally",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The replay engine follows a precise sequence to reconstruct the execution:
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Fetch trace</span> — The trace document is
              retrieved from MongoDB via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">fetch_trace(trace_id)</code>. This returns
              a validated <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceSchema</code> object with all steps, metadata, and
              timing information.
            </li>
            <li>
              <span className="text-white">Render metadata header</span> — The trace ID,
              status, latency, retry count, and step count are displayed in a header panel
              so you know what you are about to watch.
            </li>
            <li>
              <span className="text-white">Iterate steps</span> — For each step (1-indexed),
              two panels are rendered inside a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">rich.live.Live</code> display:
              <ul className="ml-6 mt-2 list-disc space-y-1">
                <li>An <span className="text-white">execution tree</span> showing all steps with the current one highlighted and previous ones marked complete</li>
                <li>A <span className="text-white">step detail panel</span> showing tool name, duration, status, input (clipped to 200 chars), and output (clipped to 200 chars)</li>
              </ul>
            </li>
            <li>
              <span className="text-white">Throttle timing</span> — The engine sleeps
              between steps to simulate the original pacing. The delay is derived from the
              step&apos;s stored duration, divided by the speed multiplier, and clamped to a
              range that keeps the replay readable.
            </li>
            <li>
              <span className="text-white">Render final report</span> — After all steps are
              replayed, a summary table with the full trace report is printed. If{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">--show-response</code> is set,
              the complete model response is displayed in a separate panel.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "timing-mechanism",
      title: "Timing Mechanism",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The replay engine preserves the relative pacing of the original execution by
            using the stored step duration as a guide. The actual sleep logic is:
          </p>
          <CodeBlock
            code={`delay = step_duration_ms / 1000 / speed
sleep = max(0.08, min(0.55, delay))`}
            lang="python"
            label="timing logic"
          />
          <Table
            headers={["Scenario", "Stored Duration", "Delay at 1x Speed", "Delay at 2x Speed"]}
            rows={[
              ["Very fast step", "50 ms", "80 ms (clamped)", "80 ms (clamped)"],
              ["Normal step", "340 ms", "340 ms", "170 ms"],
              ["Slow step", "1200 ms", "550 ms (clamped)", "550 ms (clamped)"],
            ]}
          />
          <p className="mt-4 leading-7 text-zinc-400">
            The 80ms floor ensures even sub-millisecond steps are visible. The 550ms ceiling
            prevents a single slow step from stalling the replay. The speed multiplier
            scales linearly — <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">--speed 2</code> halves every delay,{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">--speed 0.5</code> doubles it.
          </p>
        </>
      ),
    },
    {
      id: "execution-tree",
      title: "Execution Tree",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            During replay, each step iteration renders a tree visualization of the entire
            execution. The tree uses three visual states:
          </p>
          <CodeBlock
            code={`  agent:start
  ├── ✓  query.embed              180ms  OK
  ├── ✓  vector.search            340ms  OK
  ├── ▶  context.rerank           280ms        ← active step
  ├──    agent.plan               210ms
  ├──    context.allocate         120ms
  ├──    tool.chain               450ms
  ├──    llm.generate            1240ms
  └── ✓  done`}
            lang="text"
            label="Execution tree during replay (step 3 of 7)"
          />
          <Table
            headers={["Icon", "Meaning", "Style"]}
            rows={[
              ["✓", "Step completed (previous step)", "Green, dimmed"],
              ["▶", "Step currently replaying", "Cyan, bold"],
              ["  (space)", "Step pending (future step)", "Dimmed"],
              ["✗", "Failed or retried step", "Red"],
            ]}
          />
          <p className="mt-4 leading-7 text-zinc-400">
            The tree is rendered by <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">build_execution_tree()</code> in the
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> tree_renderer</code> module. It uses Rich Tree components with guide lines
            to show the execution flow. A final <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">done</code> node is appended at the
            bottom and colored green (all steps successful) or yellow (any warnings).
          </p>
        </>
      ),
    },
    {
      id: "failure-appearance",
      title: "How Failures Appear",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Traces with failures or warnings produce different replay output:
          </p>
          <CodeBlock
            code={`  ╭── Replay ────────────────────────────────────────────────╮
  │                                                          │
  │  trace_id   tr_f9k2m4x7                                  │
  │  status     WARNING                                      │
  │  latency    4,120.00 ms                                  │
  │  retries    2                                            │
  │  steps      6                                            │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯

  agent:start
  ├── ✓  query.embed              190ms  OK
  ├── ✓  vector.search            310ms  OK
  ├── ▶  tool_schema_lookup       250ms  RETRY    ← failed attempt
  ├──    retry_guard              150ms
  ├──    tool_schema_lookup       280ms  OK       ← successful retry
  ├──    response_generation     2450ms  OK
  └── ✗  done`}
            lang="text"
            label="Replay with retries"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Failed steps show <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">RETRY</code> or <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">FAILED</code> in the status column.
            The step detail panel shows the error message in the output field. After replay
            completes, the console displays a warning message (yellow) instead of the
            standard success message (green).
          </p>
        </>
      ),
    },
    {
      id: "step-detail-panel",
      title: "Step Detail Panel",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Alongside the execution tree, each step shows a detail panel with the full
            captured data:
          </p>
          <CodeBlock
            code={`  ╭── Step Detail ──────────────────────────────────────────╮
  │                                                          │
  │  step       3/9                                          │
  │  tool       context.rerank                               │
  │  duration   340 ms                                       │
  │  status     OK                                           │
  │  input      {"query": "Explain transformers",            │
  │              "strategy": "cross-encoder",                 │
  │              "candidate_count": 8}                        │
  │  output     {"reranked_chunks": 5,                        │
  │              "coverage_score": 0.912}                     │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯`}
            lang="text"
            label="Step detail"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Input and output values are truncated to 200 characters to keep the display
            readable. The duration is the actual captured duration from the original
            execution, not a replay estimate.
          </p>
        </>
      ),
    },
    {
      id: "complete-replay-output",
      title: "Complete Replay Output",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Here is the full terminal output of a replay from start to finish:
          </p>
          <CodeBlock
            code={`$ tracellm replay tr_2kf9q3m1

  ╭──────────────────────────────────────────────────────────╮
  │  🦖 Replaying execution timeline...                      │
  ╰──────────────────────────────────────────────────────────╯

  ╭── Replay ────────────────────────────────────────────────╮
  │                                                          │
  │  trace_id   tr_2kf9q3m1                                  │
  │  status     SUCCESS                                      │
  │  latency    3,420.00 ms                                  │
  │  retries    1                                            │
  │  steps      9                                            │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯

  ╭── Replaying step 3/9 ────────────────────────────────────╮
  │                                                          │
  │  ╭── Execution Tree ─────────────────────────────────╮   │
  │  │                                                    │   │
  │  │  agent:start                                       │   │
  │  │  ├── ✓  query.embed              180ms  OK         │   │
  │  │  ├── ✓  vector.search            340ms  OK         │   │
  │  │  ├── ▶  context.rerank           280ms             │   │
  │  │  ├──    agent.plan               210ms             │   │
  │  │  ├──    context.allocate         120ms             │   │
  │  │  ├──    tool.chain               450ms             │   │
  │  │  ├──    llm.generate            1240ms             │   │
  │  │  └── ✓  done                                       │   │
  │  │                                                    │   │
  │  ╰────────────────────────────────────────────────────╯   │
  │                                                          │
  │  ╭── Step Detail ────────────────────────────────────╮   │
  │  │                                                    │   │
  │  │  step       3/9                                    │   │
  │  │  tool       context.rerank                         │   │
  │  │  duration   340 ms                                 │   │
  │  │  status     OK                                     │   │
  │  │  input      {"query": "Explain transformers",...}  │   │
  │  │  output     {"reranked": true, "matches": 5}       │   │
  │  │                                                    │   │
  │  ╰────────────────────────────────────────────────────╯   │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯

  🦖 Replay complete

  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                          │
  │  Trace ID     tr_2kf9q3m1                                │
  │  Prompt       Explain transformers                       │
  │  Model        gpt-4.1-mini                               │
  │  Project      default                                    │
  │  Environment  development                                │
  │  Latency      3,420.00 ms                                │
  │  Token Count  1,247                                      │
  │  Retries      1                                          │
  │  Steps        9                                          │
  │  Status        SUCCESS                                   │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯`}
            lang="text"
            label="Full replay output"
          />
        </>
      ),
    },
  ],

  "core-concepts/trace-model": [
    {
      id: "what-is-a-trace",
      title: "What Is a Trace",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            A trace is a structured record of a single LLM-powered execution. It captures
            everything that happened from the moment a request was initiated to the moment
            a response was returned — including every tool call, retry, latency measurement,
            and error along the way.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            Each trace is persisted as a MongoDB document and exposed through the dashboard,
            CLI, and API. Traces are immutable once created — they serve as a permanent
            audit log of every AI operation in your system.
          </p>
        </>
      ),
    },
    {
      id: "trace-schema",
      title: "TraceSchema",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceSchema</code> Pydantic model defines the shape of every trace
            document. It is validated on write and read, ensuring data integrity at both
            persistence boundaries.
          </p>
          <Table
            headers={["Field", "Type", "Default", "Description"]}
            rows={[
              ["trace_id", "str", "required (UUID4)", "Unique identifier for the trace"],
              ["prompt", "str", "required", "The input prompt or operation name"],
              ["response", "Optional[str]", "None", "The LLM or system response text"],
              ["latency", "float", "required (>= 0)", "Total execution time in milliseconds"],
              ["token_count", "int", "required (>= 0)", "Estimated or actual token count"],
              ["model_name", "Optional[str]", "None", "Model identifier (e.g. gpt-4o)"],
              ["project_id", "str", '"default"', "Project grouping identifier"],
              ["project_name", "Optional[str]", "None", "Human-readable project name"],
              ["api_key", "Optional[str]", "None", "API key used (stored for audit)"],
              ["environment", "str", '"development"', 'Runtime environment label'],
              ["status", 'Literal["success","warning","failed"]', "required", "Execution outcome"],
              ["steps", "list[StepSchema]", "[]", "Ordered list of execution steps"],
              ["retry_count", "int", "0", "Number of retries across all steps"],
              ["slow_request", "bool", "false", "True if latency >= 1500ms"],
              ["failure_reason", "Optional[str]", "None", "Error message if status is failed"],
              ["created_at", "datetime", "utcnow()", "ISO 8601 timestamp of execution start"],
              ["updated_at", "datetime", "utcnow()", "ISO 8601 timestamp of persistence"],
            ]}
          />
        </>
      ),
    },
    {
      id: "step-schema",
      title: "StepSchema",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Each trace contains an ordered list of steps. A step represents a single
            atomic operation — a tool call, an LLM invocation, a retry attempt, a
            retrieval query — that occurred during the execution.
          </p>
          <Table
            headers={["Field", "Type", "Default", "Description"]}
            rows={[
              ["step_id", "str", "required (UUID4)", "Unique identifier for this step"],
              ["tool_name", "str", "required", 'Name of the tool or operation (e.g. "vector_search")'],
              ["input", "dict", "{}", "Input parameters passed to the tool"],
              ["output", "dict", "{}", "Output or result returned by the tool"],
              ["duration", "float", "required (>= 0)", "Wall-clock time in milliseconds"],
              ["success", "bool", "required", "Whether the step completed without error"],
              ["timestamp", "datetime", "utcnow()", "ISO 8601 timestamp of execution"],
            ]}
          />
          <Callout variant="note">
            Step durations are measured independently from total trace latency. The sum
            of step durations may be less than the total latency due to overhead from
            the decorator, context switching, and I/O waits.
          </Callout>
        </>
      ),
    },
    {
      id: "validation-rules",
      title: "Validation Rules",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Both schema models enforce constraints at the Pydantic level:
          </p>
          <CodeBlock
            code={`# StepSchema validators
@field_validator("duration")
def validate_duration(cls, value: float) -> float:
    if value < 0:
        raise ValueError("duration must be >= 0")
    return value

# TraceSchema validators
@field_validator("latency")
def validate_latency(cls, value: float) -> float:
    if value < 0:
        raise ValueError("latency must be >= 0")
    return value

@field_validator("token_count", "retry_count")
def validate_non_negative(cls, value: int) -> int:
    if value < 0:
        raise ValueError("value must be >= 0")
    return value`}
            lang="python"
            label="validation"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">status</code> is typed as a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">Literal</code>, so only the values
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> "success"</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">"warning"</code>, and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">"failed"</code> are accepted.
            Any invalid value is rejected at the API or persistence layer.
          </p>
        </>
      ),
    },
    {
      id: "status-inference",
      title: "Status Inference",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            When a trace is persisted, the status is inferred through a fallback chain:
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 leading-7 text-zinc-400">
            <li>If the payload explicitly sets <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">status</code> to a valid value, use it</li>
            <li>If any step has <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">success=False</code>, status becomes <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">"failed"</code></li>
            <li>If <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">failure_reason</code> is set or <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">retry_count &gt; 0</code>, status becomes <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">"warning"</code></li>
            <li>Otherwise, status is <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">"success"</code></li>
          </ol>
        </>
      ),
    },
    {
      id: "full-trace-example",
      title: "Full Trace Example",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Here is a complete trace document as it appears in MongoDB, after normalization
            and validation:
          </p>
          <CodeBlock
            code={`{
  "trace_id": "tr_2kf9q3m1",
  "prompt": "Explain transformers",
  "response": "Transformers are neural architectures built around self-attention...",
  "latency": 3420.0,
  "token_count": 1247,
  "model_name": "gpt-4.1-mini",
  "project_id": "default",
  "project_name": null,
  "api_key": null,
  "environment": "development",
  "status": "success",
  "retry_count": 1,
  "slow_request": true,
  "failure_reason": null,
  "created_at": "2026-05-31T14:22:10",
  "updated_at": "2026-05-31T14:22:14",
  "steps": [
    {
      "step_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "tool_name": "query_embedding",
      "input": {
        "session_id": "abc12345",
        "query": "Explain transformers",
        "embedding_model": "text-embedding-3-large"
      },
      "output": {
        "vector_dimensions": 1536,
        "embedding_norm": 0.9983,
        "checksum": "0xa1b2c3"
      },
      "duration": 180.42,
      "success": true,
      "timestamp": "2026-05-31T14:22:10"
    },
    {
      "step_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "tool_name": "vector_retrieval",
      "input": {
        "session_id": "abc12345",
        "query": "Explain transformers",
        "index": "research_embeddings_v2",
        "top_k": 8
      },
      "output": {
        "documents_found": 18,
        "candidate_chunks": 8,
        "selected_ids": [
          "attention_is_all_you_need",
          "rag_failure_playbook"
        ]
      },
      "duration": 340.15,
      "success": true,
      "timestamp": "2026-05-31T14:22:10"
    }
  ]
}`}
            lang="json"
            label="MongoDB document"
          />
        </>
      ),
    },
    {
      id: "how-traces-are-stored",
      title: "How Traces Are Stored",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Traces flow through a multi-stage pipeline from creation to persistence:
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Payload construction</span> — The
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> build_trace_payload()</code> function assembles the raw trace dict from
              the decorator&apos;s captured data, coerced result, and context variable state.
            </li>
            <li>
              <span className="text-white">Normalization</span> —{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">normalize_trace_document()</code> validates and transforms the payload
              against <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceSchema</code> and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">StepSchema</code>, filling in defaults
              and inferring any missing fields (status, retry count, slow_request flag).
            </li>
            <li>
              <span className="text-white">Persistence</span> — The normalized document is
              inserted into the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">traces</code> MongoDB collection via Motor (async driver).
              The CLI bridges the sync/async boundary with a persistent event loop.
            </li>
            <li>
              <span className="text-white">Broadcast</span> — A{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace.created</code> event is pushed to all connected WebSocket clients,
              including the dashboard and the monitor CLI.
            </li>
          </ol>
          <Callout variant="tip">
            MongoDB indexes exist on <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">trace_id</code> (unique),{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">created_at</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">status</code>,{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">model_name</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">project_id</code>, and
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs"> environment</code> for efficient querying in the dashboard and API.
          </Callout>
        </>
      ),
    },
  ],

  "core-concepts/execution-timeline": [
    {
      id: "what-is-the-timeline",
      title: "What Is the Execution Timeline",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The execution timeline is the ordered sequence of events that occur from the
            moment a traced function starts to the moment it completes. It includes the
            decorator lifecycle, every step execution, every retry, and every state
            transition. The timeline is the core abstraction that makes replay, debugging,
            and analytics possible.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            Every trace has exactly one timeline. The timeline is composed of spans
            (measured units of work) and events (timestamped state changes), both captured
            automatically by the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator and its companion tools.
          </p>
        </>
      ),
    },
    {
      id: "the-six-stage-lifecycle",
      title: "The Six-Stage Lifecycle",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Every traced function progresses through six distinct stages. These stages
            form the backbone of the execution timeline:
          </p>
          <StepCard number="1" title="Start Time Capture">
            The decorator records <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">datetime.now(timezone.utc)</code> for the human-readable
            timestamp and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">time.perf_counter()</code> for high-precision latency measurement.
            These two values anchor the entire timeline.
          </StepCard>
          <StepCard number="2" title="Context Resolution">
            Project ID, project name, environment, and API key are resolved. If an API key
            was provided, it is looked up in the database. Otherwise the decorator
            arguments or defaults are used.
          </StepCard>
          <StepCard number="3" title="Context Variable Initialization">
            A <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">contextvars.ContextVar</code> is set with an empty{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">collected_steps</code> list and a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">retry_count</code> of zero. From this
            point, any <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace_tool</code> or integration call that executes within this
            function will append its steps to this context.
          </StepCard>
          <StepCard number="4" title="Function Execution">
            The wrapped function runs. For sync functions this is a direct call; for async
            functions it is awaited. During execution, child decorators and integrations
            append step records to the context variable. If the function raises an
            exception, it is captured for the trace but re-raised.
          </StepCard>
          <StepCard number="5" title="Trace Finalization">
            In the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">finally</code> block, the latency delta is computed. The trace payload
            is built from the captured data, validated against the schema, and persisted
            to MongoDB. A WebSocket broadcast notifies all connected clients. The console
            summary is rendered.
          </StepCard>
          <StepCard number="6" title="Context Reset">
            The context variable is reset to its previous state. This ensures that sibling
            or subsequent traced calls start with a clean context, preventing step
            leakage between unrelated traces.
          </StepCard>
        </>
      ),
    },
    {
      id: "event-stream",
      title: "Event Stream",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            During live execution, the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceStream</code> context manager provides a
            real-time event stream that renders timestamped events to the console:
          </p>
          <CodeBlock
            code={`  ╭── Live Trace ───────────────────────────────────────────╮
  │                                                          │
  │  Event Stream                                            │
  │  [14:22:10]  trace.start                                 │
  │  [14:22:10]  query.embed          Embedding prompt       │
  │  [14:22:11]  vector.search        Searching vector index │
  │  [14:22:11]  context.rerank       Reranking context      │
  │  [14:22:11]  agent.plan           Planning tool execution│
  │  [14:22:11]  context.allocate     Allocating context     │
  │  [14:22:12]  tool.chain           Running tool chain     │
  │  [14:22:12]  llm.generate         Generating answer      │
  │  [14:22:14]  trace.complete                              │
  │                                                          │
  │  Prompt     Explain transformers                         │
  │  Model      gpt-4.1-mini                                 │
  │  Elapsed    4.2s                                         │
  │  Events     9                                            │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯`}
            lang="text"
            label="Live event stream"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Each event is timestamped with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">HH:MM:SS</code> precision. The stream is
            transient — it appears during execution and is replaced by the final trace
            summary when the trace completes.
          </p>
        </>
      ),
    },
    {
      id: "how-steps-relate",
      title: "How Steps Relate to the Timeline",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The timeline is a linear sequence, but the relationship between steps depends
            on how the code was instrumented:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Sequential steps</span> — Most traces consist
              of steps that run one after another. Each step has its own duration, and the
              sum of step durations is typically close to (but less than) the total trace
              latency.
            </li>
            <li>
              <span className="text-white">Retry steps</span> — When a tool fails and is
              retried, each attempt appears as a separate step in the timeline. Failed
              attempts are marked <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">success=False</code> and interleaved with backoff
              delays.
            </li>
            <li>
              <span className="text-white">Parallel steps</span> — When using
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> asyncio.gather</code>, steps from different coroutines appear in the
              timeline in the order they were appended (which may or may not match
              execution order). The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ContextVar</code> isolation ensures steps from
              different parallel branches are not interleaved at the step level.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-timing-is-preserved",
      title: "How Timing Is Preserved",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Timing is the most critical dimension of the execution timeline. TraceLLM
            preserves three layers of timing information:
          </p>
          <Table
            headers={["Layer", "Measurement", "Precision", "Purpose"]}
            rows={[
              ["Total latency", "perf_counter delta", "2 decimal ms", "Top-level duration of the entire traced function"],
              ["Per-step duration", "perf_counter delta per step", "2 decimal ms", "Wall-clock time of each individual tool or operation"],
              ["Timestamps", "datetime.now(utc)", "ISO 8601", "Absolute wall-clock time for ordering and correlation"],
            ]}
          />
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">slow_request</code> flag is set to <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">true</code> when total latency
            exceeds 1500ms. This threshold is configurable and used by the dashboard to
            highlight slow traces. Step durations are independently flagged as slow (red)
            when they exceed the same threshold.
          </p>
        </>
      ),
    },
    {
      id: "how-failures-appear",
      title: "How Failures Appear in the Timeline",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Failures and retries produce distinct patterns in the execution timeline:
          </p>
          <CodeBlock
            code={`  agent:start
  ├── ✓  query.embed              180ms  OK
  ├── ✓  vector.search            310ms  OK
  ├── ✗  tool_schema_lookup       250ms  RETRY    ← attempt 1, failed
  ├── ✓  retry_guard              150ms  OK       ← backoff + retry decision
  ├── ✓  tool_schema_lookup       280ms  OK       ← attempt 2, succeeded
  ├── ✓  response_generation     2450ms  OK
  └── ✓  done

  Retries: 1
  Status:  WARNING`}
            lang="text"
            label="Timeline with retry"
          />
          <p className="mt-4 leading-7 text-zinc-400">
            When a trace has retries, the status becomes <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">"warning"</code> and the
            retry count is incremented. The timeline shows each attempt as a separate step
            with its own duration and success flag. The step detail for a failed attempt
            includes the error message in the output field.
          </p>
          <Callout variant="warning">
            Retry steps are counted in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">_infer_retry_count()</code> by detecting
            duplicate tool names. A tool that appears more than once in the step list is
            counted as having been retried.
          </Callout>
        </>
      ),
    },
    {
      id: "timeline-in-dashboard",
      title: "Timeline in the Dashboard",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The dashboard renders the execution timeline as an interactive trace list and
            detail view. Each trace appears with its timestamp, status, model, latency,
            and token count. Clicking a trace opens the inspector, which displays the
            full step list with timing, input, and output for every step.
          </p>
          <div className="my-6 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50">
            <p className="font-mono text-sm text-zinc-600">Dashboard timeline screenshot placeholder</p>
          </div>
          <p className="mt-4 leading-7 text-zinc-400">
            The dashboard also provides an analytics view that aggregates timeline data
            across all traces: average latency, P95 latency, error rates, token usage
            trends, and breakdowns by model, project, and environment.
          </p>
        </>
      ),
    },
    {
      id: "timeline-vs-steps",
      title: "Timeline vs. Steps",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            It is important to distinguish between the execution timeline and the step
            list, though they are closely related:
          </p>
          <Table
            headers={["Dimension", "Timeline", "Step List"]}
            rows={[
              ["Definition", "The complete lifecycle of the traced function (6 stages)", "The ordered list of tool operations within that lifecycle"],
              ["Includes", "Context resolution, latency measurement, persistence, broadcast", "Tool name, input, output, duration, success, timestamp"],
              ["Granularity", "Two measurements: total latency and per-stage", "Per-step measurements with independent timing"],
              ["Visibility", "Exposed through the live event stream and trace summary", "Exposed through the step detail panel and dashboard"],
              ["Persistence", "Captured implicitly in the trace document (latency, timestamps)", "Stored explicitly as the steps array in the trace document"],
            ]}
          />
        </>
      ),
    },
  ],

  "dashboard/overview": [
    {
      id: "dashboard-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The TraceLLM dashboard is a web-based observability interface that surfaces every trace
            recorded by your LLM stack. It runs at <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">localhost:3000</code> by default and
            requires the backend (started via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm start</code>) to be running.
          </p>
        </>
      ),
    },
    {
      id: "dashboard-layout",
      title: "Dashboard Layout",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The dashboard is organized into five primary views accessible from the sidebar:
          </p>
          <Table
            headers={["View", "Description"]}
            rows={[
              ["Overview", "Summary of total traces, active projects, recent activity, and system health"],
              ["Traces", "Browse, filter, and inspect individual trace records with full step detail"],
              ["Analytics", "Aggregated metrics: latency, token usage, error rates, and trends over time"],
              ["Live Logs", "Real-time event stream of trace arrivals via WebSocket"],
              ["Failures", "Dedicated view for failed traces, retries, and slow requests"],
            ]}
          />
          <Callout variant="info">
            The dashboard connects to the backend API at <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">http://127.0.0.1:8000</code> and
            subscribes to WebSocket events at <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">ws://127.0.0.1:8000/ws</code>. Both
            addresses are configurable via environment variables.
          </Callout>
        </>
      ),
    },
    {
      id: "how-it-works",
      title: "How It Works",
      content: (
        <>
          <ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-zinc-400">
            <li>
              <span className="text-white">Traces arrive</span> from instrumented code (decorators,
              CLI, or integrations) and are persisted to MongoDB.
            </li>
            <li>
              <span className="text-white">A WebSocket event</span> (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace.created</code>)
              is broadcast to all connected clients.
            </li>
            <li>
              <span className="text-white">The dashboard</span> receives the event and updates its
              trace list in real time without polling.
            </li>
            <li>
              <span className="text-white">Clicking a trace</span> opens the inspector, which fetches
              the full trace document from <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /traces/{`{trace_id}`}</code>.
            </li>
            <li>
              <span className="text-white">The analytics view</span> queries{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /analytics</code> to render aggregated charts and breakdowns.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "first-steps",
      title: "First Steps",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">To start using the dashboard:</p>
          <StepCard number="1" title="Start the stack">
            Run <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm start</code> in your terminal. This launches the FastAPI backend
            and the WebSocket server.
          </StepCard>
          <StepCard number="2" title="Generate traces">
            Run <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm trace "your prompt"</code> or use the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator
            in your application code.
          </StepCard>
          <StepCard number="3" title="Open the dashboard">
            Navigate to <a href="http://localhost:3000" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">http://localhost:3000</a>. Traces appear automatically as they
            are created.
          </StepCard>
        </>
      ),
    },
    {
      id: "common-errors",
      title: "Common Errors",
      content: (
        <>
          <Table
            headers={["Error", "Cause", "Fix"]}
            rows={[
              [
                "Dashboard shows offline",
                "Backend not running or port mismatch",
                "Run tracellm start and verify the API is on port 8000",
              ],
              [
                "No traces appear",
                "No traces recorded or MongoDB is empty",
                "Run tracellm trace to generate a trace",
              ],
              [
                "WebSocket disconnected",
                "Backend restarted or network issue",
                "The dashboard auto-reconnects — wait a few seconds",
              ],
              [
                "Blank page on load",
                "Frontend build issue or missing dependencies",
                "Check the browser console for errors and restart the stack",
              ],
            ]}
          />
        </>
      ),
    },
  ],

  "dashboard/traces": [
    {
      id: "traces-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The Traces view lists every trace recorded by TraceLLM. Each row shows the trace ID,
            timestamp, status, model, latency, token count, and step count. Click any trace to inspect
            its full execution graph in the detail panel.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">
            The view fetches data from <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /traces</code>, which supports filtering by
            status, model, project, environment, latency range, and token count range.
          </p>
        </>
      ),
    },
    {
      id: "filtering",
      title: "Filtering Traces",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The API supports the following query parameters to narrow down trace results:
          </p>
          <Table
            headers={["Parameter", "Type", "Description"]}
            rows={[
              ["status", "string", "Filter by status: success, warning, or failed"],
              ["model", "string", "Filter by model name (e.g. gpt-4o)"],
              ["project_id", "string", "Filter by project identifier"],
              ["environment", "string", "Filter by environment: development, staging, production"],
              ["latency_min", "float", "Minimum latency in milliseconds"],
              ["latency_max", "float", "Maximum latency in milliseconds"],
              ["token_min", "int", "Minimum token count"],
              ["token_max", "int", "Maximum token count"],
              ["limit", "int", "Max results to return (1-200, default 50)"],
            ]}
          />
        </>
      ),
    },
    {
      id: "trace-inspector",
      title: "Trace Inspector",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Clicking a trace opens the inspector, which displays the full trace document including
            all metadata and every captured step. The inspector fetches a single trace via{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /traces/{`{trace_id}`}</code>.
          </p>
          <p className="mt-4 leading-7 text-zinc-400">The inspector shows:</p>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li>Trace ID, prompt, and response text</li>
            <li>Model name, project, and environment labels</li>
            <li>Total latency, token count, retry count, and status</li>
            <li>Complete step list with timing, inputs, outputs, and success status per step</li>
            <li>Failure reason when status is failed or warning</li>
          </ul>
        </>
      ),
    },
    {
      id: "step-details",
      title: "Step Details",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Each step in a trace contains structured data about a single atomic operation:
          </p>
          <Table
            headers={["Field", "Type", "Description"]}
            rows={[
              ["step_id", "string", "UUID4 unique identifier for this step"],
              ["tool_name", "string", "Name of the tool or operation (e.g. vector_retrieval)"],
              ["input", "object", "Input parameters passed to the tool"],
              ["output", "object", "Output or result returned by the tool"],
              ["duration", "float", "Wall-clock time in milliseconds"],
              ["success", "boolean", "Whether the step completed without error"],
              ["timestamp", "datetime", "ISO 8601 timestamp of execution"],
            ]}
          />
        </>
      ),
    },
    {
      id: "export-from-dashboard",
      title: "Export from Dashboard",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Individual trace data can be copied from the inspector panel. For bulk export, use
            the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm export</code> CLI command which supports JSON and CSV formats.
          </p>
          <Callout variant="tip">
            Use the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">tracellm replay {`{trace_id}`}</code> command to replay any trace from the
            terminal — no dashboard needed.
          </Callout>
        </>
      ),
    },
  ],

  "dashboard/analytics": [
    {
      id: "analytics-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The Analytics view aggregates trace data across all projects and environments into
            summary metrics, time-series charts, and breakdowns. Data is fetched from the{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /analytics</code> endpoint, which returns a pre-computed response including
            summary stats, hourly chart points, and dimension breakdowns.
          </p>
        </>
      ),
    },
    {
      id: "analytics-summary",
      title: "Summary Metrics",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The summary section displays eight key metrics computed from all available traces:
          </p>
          <Table
            headers={["Metric", "Description", "Source"]}
            rows={[
              ["Total traces", "Count of all trace documents", "collection.count_documents()"],
              ["Success rate", "Percentage of traces with status success", "traces with status == success / total"],
              ["Average latency", "Mean wall-clock time across all traces", "sum(latencies) / total"],
              ["P95 latency", "95th percentile latency", "Sorted latencies, 95th percentile index"],
              ["Total token usage", "Sum of token_count across all traces", "sum(trace.token_count)"],
              ["Failed traces", "Count of traces with status failed", "count where status == failed"],
              ["Warning traces", "Count of traces with status warning", "count where status == warning"],
              ["Slow requests", "Count of traces with latency >= 1500ms", "count where slow_request == true"],
            ]}
          />
        </>
      ),
    },
    {
      id: "time-series-charts",
      title: "Time-Series Charts",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Traces from the last 24 hours are bucketed by hour. Each bucket provides three data
            points per hourly window:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li><span className="text-white">Average latency</span> — mean of all trace latencies in that hour</li>
            <li><span className="text-white">Token usage</span> — sum of token counts in that hour</li>
            <li><span className="text-white">Trace count</span> — number of traces recorded in that hour</li>
          </ul>
          <p className="mt-4 leading-7 text-zinc-400">
            Buckets are computed by grouping traces on their <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">created_at</code> field
            formatted to <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">HH:00</code>. Traces older than 24 hours are excluded from the
            chart data.
          </p>
        </>
      ),
    },
    {
      id: "breakdowns",
      title: "Breakdowns",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The analytics endpoint returns four breakdown dimensions:
          </p>
          <Table
            headers={["Breakdown", "Key Used", "Example"]}
            rows={[
              ["Status breakdown", "trace.status", "success: 42, failed: 3, warning: 5"],
              ["Model breakdown", "trace.model_name or unknown", "gpt-4o: 20, gpt-4.1-mini: 30"],
              ["Project breakdown", "trace.project_name or project_id", "default: 40, search-service: 10"],
            ]}
          />
          <Callout variant="info">
            Breakdowns are sorted by count (most common first). The API processes up to 5000
            documents to compute analytics. For larger datasets, filter by project or time range.
          </Callout>
        </>
      ),
    },
    {
      id: "recent-failures",
      title: "Recent Failures",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The analytics view also surfaces the five most recent traces that have issues — failed
            traces, warning traces, slow requests, or traces with retries. This provides a quick
            overview of system health without navigating to the Failures view.
          </p>
        </>
      ),
    },
  ],

  "dashboard/live-logs": [
    {
      id: "live-logs-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The Live Logs view displays a real-time stream of trace events as they arrive from the
            TraceLLM WebSocket. Every time a trace is created, updated, or persisted, a{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace.created</code> event is broadcast to all connected clients — including
            this view, the CLI monitor, and any other WebSocket subscribers.
          </p>
        </>
      ),
    },
    {
      id: "websocket-connection",
      title: "WebSocket Connection",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The live logs connect to the backend WebSocket at{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ws://127.0.0.1:8000/ws</code>. On connection, the server sends a{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">system.connected</code> message. Clients can send{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">{`{"type": "ping"}`}</code> messages to which the server responds with{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">{`{"type": "system.pong"}`}</code>.
          </p>
          <CodeBlock
            code={`// Server → Client (on connect)
{
  "type": "system.connected",
  "status": "connected",
  "message": "TraceLLM websocket active"
}

// Server → Client (on trace creation)
{
  "type": "trace.created",
  "trace": { ... }  // Full TraceSchema object
}

// Client → Server (heartbeat)
{ "type": "ping", "ts": 1717151234 }

// Server → Client (heartbeat response)
{ "type": "system.pong", "timestamp": 1717151234 }`}
            lang="json"
            label="WebSocket protocol"
          />
        </>
      ),
    },
    {
      id: "log-entries",
      title: "Log Entries",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Each incoming trace event is displayed as a log entry showing:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li>Timestamp of receipt</li>
            <li>Trace ID</li>
            <li>Status badge (success/warning/failed)</li>
            <li>Model name</li>
            <li>Latency and token count</li>
            <li>Prompt preview (first 80 characters)</li>
          </ul>
          <Callout variant="tip">
            The live logs view is useful for monitoring production systems in real time. Combine
            it with the CLI monitor for a terminal-based alternative.
          </Callout>
        </>
      ),
    },
    {
      id: "auto-reconnect",
      title: "Auto-Reconnect",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The WebSocket client implements automatic reconnection with exponential backoff from
            1 to 30 seconds. If the backend restarts or the network drops, the dashboard
            automatically reconnects once the service is available again.
          </p>
          <Callout variant="warning">
            Logs accumulated while disconnected are not retroactively fetched. Only events
            broadcast after reconnection appear in the live stream. For historical data, use the
            Traces view or the Analytics view.
          </Callout>
        </>
      ),
    },
  ],

  "dashboard/failures": [
    {
      id: "failures-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The Failures view groups all traces that need attention into three categories: failed
            traces, traces with retries, and slow requests. Data is fetched from the{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /failures</code> endpoint, which applies server-side filtering and returns
            pre-categorized results.
          </p>
        </>
      ),
    },
    {
      id: "failure-categories",
      title: "Failure Categories",
      content: (
        <>
          <Table
            headers={["Category", "Definition", "Filter Logic"]}
            rows={[
              ["Failed", "trace.status == failed", "Any trace where status is explicitly failed"],
              ["Retries", "trace.retry_count > 0", "Traces with one or more retried steps"],
              ["Slow requests", "trace.slow_request == true", "Traces with total latency >= 1500ms"],
            ]}
          />
        </>
      ),
    },
    {
      id: "how-failures-are-detected",
      title: "How Failures Are Detected",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Trace status is inferred through a multi-step process in{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">normalize_trace_document()</code>:
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 leading-7 text-zinc-400">
            <li>If the payload explicitly sets status to a valid value (success/warning/failed), use it</li>
            <li>If any step has <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">success=False</code>, status becomes failed</li>
            <li>If <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">failure_reason</code> is set or <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">retry_count &gt; 0</code>, status becomes warning</li>
            <li>Otherwise, status is success</li>
          </ol>
        </>
      ),
    },
    {
      id: "retry-detection",
      title: "Retry Detection",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Retries are detected by <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">_infer_retry_count()</code> which counts duplicate
            tool names in the step list. Each time a tool name appears more than once, it is
            counted as a retry:
          </p>
          <CodeBlock
            code={`def _infer_retry_count(steps: list[dict[str, Any]]) -> int:
    retries = 0
    tool_attempts: defaultdict[str, int] = defaultdict(int)
    for step in steps:
        tool_name = step.get("tool_name", "agent")
        tool_attempts[tool_name] += 1
        if tool_attempts[tool_name] > 1:
            retries += 1
    return retries`}
            lang="python"
            label="Retry inference"
          />
        </>
      ),
    },
    {
      id: "slow-request-threshold",
      title: "Slow Request Threshold",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The slow request threshold is 1500ms, defined as{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">SLOW_TRACE_THRESHOLD_MS</code>. If a trace&apos;s total latency equals or
            exceeds this value, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">slow_request</code> is set to true. The same threshold
            is used by the CLI to color-code latency values (green below 900ms, yellow from 900ms
            to 1499ms, red at 1500ms+).
          </p>
        </>
      ),
    },
    {
      id: "failure-troubleshooting",
      title: "Troubleshooting Failures",
      content: (
        <>
          <Table
            headers={["Observation", "Common Cause", "Action"]}
            rows={[
              ["Status is failed", "Exception in traced function or step with success=False", "Inspect the failure_reason field and the step detail"],
              ["Status is warning", "Retries occurred during execution", "Review which steps were retried and check the error output"],
              ["slow_request is true", "Total latency >= 1500ms", "Optimize slow steps or increase the threshold"],
              ["Retry count is unexpected", "Duplicate tool names in step list", "Check for unintended repeated tool invocations"],
            ]}
          />
        </>
      ),
    },
  ],

  "developers/architecture": [
    {
      id: "architecture-overview",
      title: "System Architecture",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM is built as a four-layer observability stack that runs entirely on your
            own infrastructure. Every component — CLI, SDK, API server, database, WebSocket
            broker, and dashboard — can operate on a single machine with zero cloud dependencies.
          </p>
        </>
      ),
    },
    {
      id: "system-layout",
      title: "System Layout",
      content: (
        <>
          <CodeBlock
            code={`┌─────────────────────────────────────────────────────────────┐
│                      User / Application                        │
│  tracellm trace "..."   │   @trace decorator   │   SDK code    │
└───────────────────────────┬─────────────────────────────────────┘
                            │  trace payload
                            ▼
┌────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST API    │  │  WebSocket   │  │  Connection      │  │
│  │  /traces     │  │  /ws         │  │  Manager         │  │
│  │  /analytics  │  │  broadcast   │  │  (asyncio.Lock)  │  │
│  │  /failures   │  │  trace.created│ │  auto-prune      │  │
│  │  /projects   │  │  system.conn.│  │  stale conns     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                 │                                 │
└─────────┼─────────────────┼─────────────────────────────────┘
          │                 │
          ▼                 ▼
┌──────────────────┐  ┌──────────────────────────────────┐
│    MongoDB        │  │         WebSocket Clients        │
│  ┌──────────────┐ │  │  ┌──────────┐  ┌──────────────┐ │
│  │ traces       │ │  │  │Dashboard │  │ CLI Monitor  │ │
│  │ projects     │ │  │  │(Next.js) │  │ (tracellm    │ │
│  │ api_keys     │ │  │  │port 3000 │  │  monitor)    │ │
│  └──────────────┘ │  │  └──────────┘  └──────────────┘ │
│  Indexed: trace_id│  └──────────────────────────────────┘
│  created_at,      │
│  status, model    │
└──────────────────┘`}
            lang="text"
            label="Architecture diagram"
          />
        </>
      ),
    },
    {
      id: "trace-flow",
      title: "Trace Execution Flow",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Every trace passes through six stages from instrumentation to consumption:
          </p>
          <CodeBlock
            code={`User
  │
  ├── 1. Instrumentation ──► @trace decorator or CLI wraps function call
  │                           captures start time, project context
  ▼
SDK/Tracer
  │
  ├── 2. Trace Capture ──► build_trace_payload() assembles metadata,
  │                           steps, timing, status, retries
  ▼
Trace Payload
  │
  ├── 3. Persist ──► normalize_trace_document() validates against schemas,
  │                     inserts into MongoDB "traces" collection
  ▼
MongoDB
  │
  ├── 4. Broadcast ──► ConnectionManager.broadcast() sends trace.created
  │                       event to all connected WebSocket clients
  ▼
WebSocket Layer
  │
  ├── 5. Consume ──► Dashboard receives event, updates trace list in
  │                     real time without polling
  ▼
Dashboard
  │
  ├── 6. Replay ──► CLI replay fetches trace from MongoDB, renders
  │                    step-by-step execution tree in terminal
  ▼
Replay`}
            lang="text"
            label="End-to-end trace flow"
          />
        </>
      ),
    },
    {
      id: "local-first",
      title: "Local-First Architecture",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM is designed around a local-first philosophy. Every component — SDK, API,
            database, WebSocket broker, and dashboard — runs on your own infrastructure. There
            is no SaaS backend, no telemetry service, and no data egress.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">No Cloud Dependencies</p>
              <p className="text-sm leading-6 text-zinc-500">
                MongoDB runs locally (or your own Atlas cluster). The API, WebSocket, and
                dashboard are local processes. Zero data leaves your network.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">Single-Command Stack</p>
              <p className="text-sm leading-6 text-zinc-500">
                <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-zinc-300">tracellm start</code> boots the entire stack: FastAPI on port 8000,
                WebSocket on /ws, auto-detects MongoDB. No Docker Compose required.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">Offline-Capable</p>
              <p className="text-sm leading-6 text-zinc-500">
                The <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-zinc-300">@trace</code> decorator and CLI work without MongoDB. Traces are
                finalized in memory; persistence gracefully degrades.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#09090d] p-4">
              <p className="mb-0.5 font-medium text-white">MIT Licensed</p>
              <p className="text-sm leading-6 text-zinc-500">
                Fully open-source. No paid tiers, no usage limits, no vendor lock-in. You
                own all your data and infrastructure.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "system-components",
      title: "System Components",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The system is composed of five layers that work together to capture, store,
            stream, and visualize trace data:
          </p>
          <StepCard number="1" title="CLI (tracellm)">
            The Typer-based command-line interface is the primary user-facing entry point.
            It provides commands for starting the stack (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">start</code>), running
            traces (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace</code>), replaying executions (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">replay</code>), monitoring
            live events (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">monitor</code>), and exporting data (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">export</code>). The CLI
            also renders a Rich TUI command palette when invoked without arguments and a
            full-screen live monitor dashboard — like htop for AI — via the WebSocket.
          </StepCard>
          <StepCard number="2" title="SDK (@trace decorator)">
            The Python SDK provides the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator for automatic
            instrumentation of any function. It captures prompts, responses, latency, token
            usage, tool calls, retries, and errors. The decorator supports both sync and
            async functions via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">inspect.iscoroutinefunction()</code> auto-detection, uses
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">contextvars.ContextVar</code> for nested step collection, and includes
            integrations for OpenAI, Groq, and LangChain.
          </StepCard>
          <StepCard number="3" title="API Server (FastAPI)">
            The REST API server is built with FastAPI and runs on port 8000. It exposes
            endpoints for traces (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /traces</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /traces/{`{id}`}</code>),
            analytics (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /analytics</code>), failures (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /failures</code>),
            projects (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET/POST /projects</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /api-keys</code>), and
            health (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">GET /</code>). All responses are JSON with Pydantic v2 validation.
            CORS is configured to allow all origins for local development.
          </StepCard>
          <StepCard number="4" title="MongoDB (Motor)">
            MongoDB serves as the persistent store for all trace documents, project records,
            and API keys. The async connection is managed via the Motor driver, which
            integrates natively with FastAPI&apos;s event loop. The CLI bridges sync code to
            Motor through a persistent event loop in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">db.py</code> with automatic
            event-loop detection. Three collections are used: <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">traces</code>,
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">projects</code>, and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">api_keys</code>, each with appropriate indexes.
          </StepCard>
          <StepCard number="5" title="WebSocket Layer">
            A lightweight WebSocket server is embedded in the FastAPI app at <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">/ws</code>.
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ConnectionManager</code> class manages all active connections with an
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">asyncio.Lock</code> for thread safety. When a trace is persisted, a
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace.created</code> event is broadcast to all connected clients. Stale
            connections are automatically pruned during broadcast. The dashboard and CLI
            monitor both subscribe to this channel for real-time updates.
          </StepCard>
          <StepCard number="6" title="Dashboard (Next.js)">
            The web dashboard is a Next.js 16 application running on port 3000. It connects
            to the backend REST API for initial data loads and subscribes to the WebSocket
            for real-time trace events. The dashboard provides five views: Overview (summary
            metrics), Traces (browse and inspect), Analytics (charts and breakdowns),
            Live Logs (real-time event stream), and Failures (categorized issues). The
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ObservabilityProvider</code> React context manages the WebSocket connection
            and propagates events to all child components.
          </StepCard>
        </>
      ),
    },
    {
      id: "data-flow",
      title: "Data Flow",
      content: (
        <>
          <CodeBlock
            code={`@trace decorator / CLI
       │
       │  1. Record start time (datetime.utcnow + perf_counter)
       │  2. Resolve project context (API key lookup in MongoDB)
       │  3. Set ContextVar for step collection
       ▼
Function execution (sync or async)
       │
       │  @trace_tool and integration calls append steps
       │  to the parent's ContextVar.collected_steps list
       ▼
finally block
       │
       │  1. Compute latency = perf_counter delta
       │  2. build_trace_payload() — assemble full trace dict
       │  3. finalize_trace() — persist + broadcast + render
       ▼
save_trace() in trace_service.py
       │
       ├──► normalize_trace_document()
       │      ├── Coerce timestamps to UTC
       │      ├── Normalize step fields
       │      ├── Infer retry count (duplicate tool names)
       │      ├── Infer status (from steps, failure_reason, retries)
       │      └── Validate against TraceSchema + StepSchema
       │
       ├──► collection.insert_one(document)  ──►  MongoDB "traces"
       │
       └──► manager.broadcast(trace.created) ──►  WebSocket clients
              │
              ├── Dashboard: updates trace list + live logs
              ├── CLI monitor: refreshes live dashboard
              └── Other clients: any WS subscriber`}
            lang="text"
            label="Complete data flow"
          />
        </>
      ),
    },
    {
      id: "sync-async-bridge",
      title: "Sync/Async Bridge",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The CLI runs synchronously (Typer), but all MongoDB operations are async (Motor).
            TraceLLM bridges this gap with a persistent event loop in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">db.py</code>:
          </p>
          <CodeBlock
            code={`def _run_async(coro):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop is not None and loop.is_running():
        # Inside FastAPI — schedule on the existing loop
        task = loop.create_task(coro)
        task.add_done_callback(_handle_task_exception)
    else:
        # In CLI — use a persistent loop to avoid
        # "event loop is closed" errors
        if PERSISTENT_LOOP is None:
            init_persistent_loop()
        asyncio.run_coroutine_threadsafe(coro, PERSISTENT_LOOP)`}
            lang="python"
            label="db.py bridge logic"
          />
          <Callout variant="info">
            The persistent event loop pattern prevents the common &quot;event loop is closed&quot;
            error that occurs with repeated <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">asyncio.run()</code> calls from synchronous code.
            It is initialized once and reused across all CLI commands.
          </Callout>
        </>
      ),
    },
    {
      id: "project-api-key-model",
      title: "Project & API Key Model",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Projects and API keys provide multi-tenant trace isolation. API keys use a
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tlm_sk_</code> prefix with 32 cryptographically random characters. When provided
            to <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> or the CLI, the project ID, name, and environment are resolved
            from the key record in MongoDB. Keys can be scoped to specific environments
            (development, staging, production) for fine-grained access control.
          </p>
          <CodeBlock
            code={`POST /projects?name=my-app&environment=production&description=...
Response:
{
  "project": {
    "project_id": "my-app",
    "name": "my-app",
    "description": "...",
    "created_at": "2026-05-31T14:22:10"
  },
  "api_key": {
    "key": "tlm_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "project_id": "my-app",
    "environment": "production",
    "created_at": "2026-05-31T14:22:10"
  }
}`}
            lang="bash"
            label="API key creation"
          />
        </>
      ),
    },
    {
      id: "directory-structure",
      title: "Directory Structure",
      content: (
        <>
          <CodeBlock
            code={`tracellm/
├── backend/                      # Python backend (FastAPI + SDK + CLI)
│   ├── app/                      # FastAPI REST API
│   │   ├── main.py               # App creation, CORS, startup/shutdown
│   │   ├── database/
│   │   │   ├── mongodb.py        # Motor connection manager
│   │   │   ├── trace_service.py  # Trace CRUD, normalization, analytics
│   │   │   └── project_service.py# Project CRUD, API key generation
│   │   ├── models/
│   │   │   ├── trace.py          # TraceSchema, StepSchema (Pydantic)
│   │   │   ├── trace_model.py    # List, Analytics, Failure response models
│   │   │   ├── project.py        # Project, ApiKey schemas
│   │   │   └── health.py         # Health check model
│   │   ├── routes/
│   │   │   ├── health.py         # GET /
│   │   │   ├── observability.py  # GET /traces, /analytics, /failures
│   │   │   └── projects.py       # GET/POST /projects, GET /api-keys
│   │   └── websocket/
│   │       └── socket.py         # /ws endpoint, ConnectionManager
│   ├── tracellm/                 # SDK + CLI package
│   │   ├── __init__.py           # Public API: @trace, wrap_openai, etc.
│   │   ├── cli.py                # Typer CLI (start, trace, replay, ...)
│   │   ├── tracer.py             # @trace decorator, payload builder
│   │   ├── replay.py             # Replay engine
│   │   ├── monitor.py            # Live terminal monitor (htop-for-AI)
│   │   ├── exporter.py           # JSON/CSV export
│   │   ├── db.py                 # Sync/async MongoDB bridge
│   │   ├── startup.py            # Stack boot (uvicorn subprocess)
│   │   ├── trace_stream.py       # Live console event stream
│   │   ├── utils.py              # Styling, token estimation, tables
│   │   ├── integrations/
│   │   │   ├── openai.py         # OpenAI wrapper
│   │   │   ├── langchain.py      # LangChain callback handler
│   │   │   └── tool_tracer.py    # @trace_tool decorator
│   │   └── examples/             # Usage examples
│   └── .env                      # Local env config
├── frontend/                     # Next.js dashboard (port 3000)
│   ├── app/                      # Pages: /, /traces, /analytics, /failures, /live-logs, /settings
│   ├── components/               # React components
│   │   ├── providers/observability-provider.tsx  # WebSocket context
│   │   ├── console/              # Console UI components
│   │   └── ui/                   # shadcn/ui primitives
│   ├── hooks/                    # use-observability-data, use-websocket-logs
│   └── lib/                      # api.ts, types.ts, format.ts
└── website/                      # Marketing site + docs (port 3001)
    ├── app/                      # Landing page + docs
    └── components/docs/          # Documentation components`}
            lang="text"
            label="Full project structure"
          />
        </>
      ),
    },
  ],

  "developers/environment-variables": [
    {
      id: "env-overview",
      title: "Environment Variables",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM reads configuration from environment variables at startup. Variables can
            be set in a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">.env</code> file (loaded via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">python-dotenv</code>) or
            exported in the shell. The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm start</code> command loads <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">.env</code>
            automatically. Environment variable keys take precedence over <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">.env</code>
            file values.
          </p>
        </>
      ),
    },
    {
      id: "backend-variables",
      title: "Backend Variables",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            These variables configure the Python backend (FastAPI server + SDK + CLI):
          </p>
          <Table
            headers={["Variable", "Required", "Default", "Description"]}
            rows={[
              ["MONGO_URL", "Yes (for persistence)", "None", "MongoDB connection string (e.g. mongodb://localhost:27017 or Atlas SRV)"],
              ["DB_NAME", "Yes (for persistence)", "None", "MongoDB database name (e.g. tracellm)"],
              ["OPENAI_API_KEY", "For OpenAI integration", "None", "OpenAI API key for chat completions"],
              ["TRACELLM_WS_HOST", "No", "127.0.0.1", "WebSocket host for the CLI monitor"],
              ["TRACELLM_WS_PORT", "No", "8000", "WebSocket port for the CLI monitor"],
              ["TRACELLM_PORT", "No", "8000", "Port for the backend API server (used by start command)"],
              ["TRACELLM_DASHBOARD_PORT", "No", "3000", "Port for the frontend dashboard (used by start --dashboard)"],
            ]}
          />
          <Callout variant="warning">
            Without <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">MONGO_URL</code> and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">DB_NAME</code>, the API starts but traces
            are not persisted. The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">@trace</code> decorator logs a yellow
            &quot;Trace persistence skipped&quot; warning and the function still runs normally.
          </Callout>
        </>
      ),
    },
    {
      id: "frontend-variables",
      title: "Frontend Variables",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            These variables configure the Next.js dashboard and are read at build time or
            runtime (client-side):
          </p>
          <Table
            headers={["Variable", "Required", "Default", "Description"]}
            rows={[
              ["NEXT_PUBLIC_API_BASE_URL", "No", "http://localhost:8000", "Backend REST API base URL for fetch calls"],
              ["NEXT_PUBLIC_WS_URL", "No", "Inferred from API_BASE_URL (http→ws)", "WebSocket URL (e.g. ws://localhost:8000)"],
            ]}
          />
          <Callout variant="info">
            Frontend variables use the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_</code> prefix for client-side access.
            The WebSocket URL is automatically derived by replacing <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">http://</code> with
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs"> ws://</code> in the API base URL, so <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_WS_URL</code> is only
            needed for custom deployments.
          </Callout>
        </>
      ),
    },
    {
      id: "env-loading-order",
      title: "Loading Order",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Variables are resolved in the following order (later sources override earlier ones):
          </p>
          <ol className="mt-4 list-inside list-decimal space-y-2 leading-7 text-zinc-400">
            <li><span className="text-white">Default values</span> — hardcoded in code (e.g. port 8000)</li>
            <li><span className="text-white">.env file</span> — loaded by <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">python-dotenv</code> in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">app/main.py</code> and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">startup.py</code></li>
            <li><span className="text-white">Shell environment</span> — <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">export VAR=value</code> or inline prefix</li>
          </ol>
          <p className="mt-4 leading-7 text-zinc-400">
            The FastAPI backend calls <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">load_dotenv()</code> in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">app/main.py</code> on
            startup. The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">startup.py</code> module also loads it for CLI usage. The
            frontend reads <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">NEXT_PUBLIC_*</code> variables from its own environment at
            build and runtime.
          </p>
        </>
      ),
    },
    {
      id: "env-file-example",
      title: "Example .env File",
      content: (
        <>
          <CodeBlock
            code={`# ── MongoDB ────────────────────────────────────────────────
MONGO_URL=mongodb://localhost:27017
DB_NAME=tracellm

# ── LLM Provider ───────────────────────────────────────────
OPENAI_API_KEY=sk-...

# ── TraceLLM Backend ───────────────────────────────────────
TRACELLM_PORT=8000
TRACELLM_WS_HOST=127.0.0.1
TRACELLM_WS_PORT=8000

# ── TraceLLM Dashboard ─────────────────────────────────────
TRACELLM_DASHBOARD_PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`}
            lang="bash"
            label=".env"
          />
          <Callout variant="tip">
            Create a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">.env</code> file in the directory where you run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">tracellm start</code>. The CLI loads it automatically. For the frontend,
            create a separate <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">.env.local</code> in the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">frontend/</code> directory.
          </Callout>
        </>
      ),
    },
  ],

  "developers/mongodb": [
    {
      id: "mongodb-overview",
      title: "MongoDB",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM uses MongoDB as its persistent store for all trace documents, project
            records, and API keys. The connection is managed via the Motor async driver
            (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">AsyncIOMotorClient</code>), which integrates natively with FastAPI&apos;s async
            event loop. The CLI bridges sync code to Motor through a persistent event loop
            in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">db.py</code>.
          </p>
        </>
      ),
    },
    {
      id: "connection-management",
      title: "Connection Management",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            MongoDB connection is managed in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">app/database/mongodb.py</code>. The module
            uses a singleton pattern with module-level globals:
          </p>
          <CodeBlock
            code={`# Module-level globals in mongodb.py
client: Optional[AsyncIOMotorClient] = None
database: Optional[AsyncIOMotorDatabase] = None

async def connect_to_mongo(mongo_url, db_name):
    if database is not None:
        return database  # Already connected

    client = AsyncIOMotorClient(mongo_url)
    database = client[db_name]
    await client.admin.command("ping")  # Verify connectivity
    return database

def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("MongoDB is not connected yet.")
    return database

async def close_mongo_connection():
    if client is not None:
        client.close()`}
            lang="python"
            label="Connection manager"
          />
          <Callout variant="warning">
            If the connection fails, the API still starts — traces are finalized in memory
            but not persisted. The decorator logs a yellow &quot;Trace persistence skipped&quot;
            warning. Previously skipped traces are not retroactively saved when MongoDB
            becomes available.
          </Callout>
        </>
      ),
    },
    {
      id: "collections",
      title: "Collections & Schema",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Three MongoDB collections store all TraceLLM data:
          </p>
          <Table
            headers={["Collection", "Schema Model", "Purpose", "Key Indexes"]}
            rows={[
              ["traces", "TraceSchema", "Full trace documents with steps, metadata, status", "trace_id, created_at, status, model_name, project_id, environment"],
              ["projects", "ProjectSchema", "Project records with name, description, timestamps", "project_id (unique), name (unique)"],
              ["api_keys", "ApiKeySchema", "API key records with key hash, project, environment", "key (unique), project_id, environment"],
            ]}
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Each trace document follows the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">TraceSchema</code> Pydantic model, which
            enforces field types, defaults, and validators at both write and read boundaries:
          </p>
          <CodeBlock
            code={`TraceSchema:
  trace_id: str           # UUID4, prefixed "tr_"
  prompt: str              # Input prompt or operation name
  response: Optional[str]  # LLM or system response text
  latency: float           # Total execution time in ms (>= 0)
  token_count: int         # Estimated or actual tokens (>= 0)
  model_name: Optional[str]# Model identifier (e.g. gpt-4o)
  project_id: str          # Project grouping ("default")
  project_name: Optional[str]
  api_key: Optional[str]   # Stored for audit purposes
  environment: str         # "development", "staging", "production"
  status: Literal["success", "warning", "failed"]
  steps: list[StepSchema]  # Ordered execution steps
  retry_count: int         # Number of retries
  slow_request: bool       # True if latency >= 1500ms
  failure_reason: Optional[str]
  created_at: datetime     # Execution start (UTC)
  updated_at: datetime     # Persistence time (UTC)

StepSchema:
  step_id: str             # UUID4
  tool_name: str           # e.g. "vector_retrieval"
  input: dict              # Input parameters
  output: dict             # Returned result
  duration: float          # Wall-clock time in ms (>= 0)
  success: bool            # Completed without error
  timestamp: datetime      # Execution time (UTC)`}
            lang="python"
            label="Schema definitions"
          />
        </>
      ),
    },
    {
      id: "indexes",
      title: "Index Strategy",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Indexes are created automatically during the FastAPI startup event via the
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> on_event(&quot;startup&quot;)</code> handler. The creation functions are idempotent
            and safe to call on every restart:
          </p>
          <CodeBlock
            code={`# traces collection
traces.create_index("trace_id")    # Single trace lookup
traces.create_index("created_at")   # Time-range queries
traces.create_index("status")       # Filter by status
traces.create_index("model_name")   # Filter by model
traces.create_index("project_id")   # Multi-tenant isolation
traces.create_index("environment")  # Environment scoping

# projects collection
projects.create_index("project_id", unique=True)
projects.create_index("name", unique=True)

# api_keys collection
api_keys.create_index("key", unique=True)         # Key lookup
api_keys.create_index("project_id")               # List by project
api_keys.create_index("environment")              # Filter by env`}
            lang="python"
            label="MongoDB indexes"
          />
          <Callout variant="info">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">traces</code> collection indexes support all filter combinations used
            by the dashboard: status + project, model + environment, latency range + status,
            and time-sorted queries for the analytics time-series charts.
          </Callout>
        </>
      ),
    },
    {
      id: "trace-normalization-pipeline",
      title: "Trace Normalization Pipeline",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Before insertion, every trace document passes through a normalization pipeline
            in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">normalize_trace_document()</code> (in <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace_service.py</code>):
          </p>
          <CodeBlock
            code={`Input: raw trace dict from @trace/CLI
  │
  ├── 1. Parse created_at ──► _coerce_datetime()
  │      Supports datetime objects, ISO strings, or falls back to utcnow()
  │
  ├── 2. Normalize steps ──► _normalize_steps()
  │      Maps input/input_data, output/output_data keys
  │      Validates each step against StepSchema
  │      Generates step_id if missing
  │
  ├── 3. Infer retry count ──► _infer_retry_count()
  │      Counts duplicate tool_name occurrences in step list
  │      Uses explicit retry_count if provided
  │
  ├── 4. Infer status ──► _infer_status()
  │      explicit status > any failed step > failure_reason/retries > success
  │
  ├── 5. Infer failure_reason ──► _infer_failure_reason()
  │      explicit message > first failed step's output.error > tool_name
  │
  ├── 6. Set slow_request flag
  │      True if latency >= SLOW_TRACE_THRESHOLD_MS (1500ms)
  │
  └── 7. Validate ──► TraceSchema.model_dump(mode="python")
         Pydantic validation catches negative values, wrong types, etc.

Output: clean MongoDB document`}
            lang="text"
            label="Normalization pipeline"
          />
        </>
      ),
    },
    {
      id: "query-patterns",
      title: "Common Query Patterns",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The trace service provides these query patterns used by the API and dashboard:
          </p>
          <CodeBlock
            code={`# List traces with filters
db.traces.find({
    status: "failed",
    project_id: "my-app",
    environment: "production",
    latency: { $gte: 100, $lte: 5000 },
    token_count: { $gte: 50 }
}).sort({ created_at: -1 }).limit(50)

# Get single trace
db.traces.findOne({ trace_id: "tr_2kf9q3m1" })

# Analytics - all traces in date order
db.traces.find({}).sort({ created_at: 1 })

# Failures - recent failed/retry/slow traces
db.traces.find({
    $or: [
        { status: "failed" },
        { retry_count: { $gt: 0 } },
        { slow_request: true }
    ]
}).sort({ created_at: -1 }).limit(25)`}
            lang="javascript"
            label="MongoDB query patterns"
          />
        </>
      ),
    },
    {
      id: "running-mongodb",
      title: "Running MongoDB",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Start a local MongoDB instance for development:
          </p>
          <CodeBlock
            code={`# Docker (recommended)
docker run -d --name tracellm-mongo -p 27017:27017 mongo:7

# Native
mongod --dbpath /data/db --port 27017

# Verify connection
mongosh --eval "db.runCommand({ ping: 1 })"`}
            lang="bash"
            label="Start MongoDB"
          />
          <Callout variant="tip">
            MongoDB Atlas works seamlessly. Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">MONGO_URL</code> to your Atlas
            SRV connection string. The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">startup.py</code> module tests connectivity
            with a 3-second timeout and logs a warning if unreachable.
          </Callout>
        </>
      ),
    },
  ],

  "developers/websocket": [
    {
      id: "websocket-overview",
      title: "WebSocket",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            TraceLLM uses a lightweight WebSocket server embedded in the FastAPI backend for
            real-time push of trace events. The server is defined in
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> app/websocket/socket.py</code> and mounted at <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">/ws</code>. When a trace is
            persisted, a <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace.created</code> event is broadcast to all connected clients
            — including the dashboard, CLI monitor, and any custom WebSocket subscribers.
          </p>
        </>
      ),
    },
    {
      id: "connection-manager",
      title: "ConnectionManager",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ConnectionManager</code> class (singleton) manages all active WebSocket
            connections. It uses an <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">asyncio.Lock</code> for thread-safe connection
            tracking. Stale connections (those that raise exceptions during broadcast) are
            automatically disconnected and pruned:
          </p>
          <CodeBlock
            code={`class ConnectionManager:
    def __init__(self):
        self._connections: list[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.append(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            if websocket in self._connections:
                self._connections.remove(websocket)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        async with self._lock:
            connections = list(self._connections)  # Snapshot under lock

        stale: list[WebSocket] = []
        for conn in connections:
            try:
                await conn.send_json(payload)
            except Exception:
                stale.append(conn)  # Auto-prune on failure

        for conn in stale:
            await self.disconnect(conn)

manager = ConnectionManager()  # Global singleton`}
            lang="python"
            label="ConnectionManager implementation"
          />
        </>
      ),
    },
    {
      id: "endpoint",
      title: "WebSocket Endpoint (/ws)",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The WebSocket endpoint accepts connections, sends a welcome message, and then
            enters a listen loop for client messages. Clients can send <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">ping</code>
            heartbeats; the server responds with <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">system.pong</code>. When a client
            disconnects (or the connection drops), the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">WebSocketDisconnect</code>
            exception is caught and the connection is cleaned up:
          </p>
          <CodeBlock
            code={`@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)

    # Send welcome message
    await websocket.send_json({
        "type": "system.connected",
        "status": "connected",
        "message": "TraceLLM websocket active",
    })

    try:
        while True:
            message = await websocket.receive_json()
            if message.get("type") == "ping":
                await websocket.send_json({
                    "type": "system.pong",
                    "timestamp": message.get("ts"),
                })
    except WebSocketDisconnect:
        await manager.disconnect(websocket)`}
            lang="python"
            label="WebSocket endpoint"
          />
        </>
      ),
    },
    {
      id: "message-protocol",
      title: "Message Protocol",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            All WebSocket messages are JSON-encoded. The protocol defines four message types:
          </p>
          <Table
            headers={["Direction", "Type", "Payload", "When"]}
            rows={[
              ["Server → Client", "system.connected", '{ "status": "connected", "message": "..." }', "Immediately after handshake"],
              ["Server → Client", "trace.created", '{ "trace": { TraceSchema } }', "After each trace is persisted to MongoDB"],
              ["Client → Server", "ping", '{ "type": "ping", "ts": 1717151234 }', "Heartbeat (dashboard sends every 5s)"],
              ["Server → Client", "system.pong", '{ "type": "system.pong", "timestamp": 1717151234 }', "Response to client ping"],
            ]}
          />
          <CodeBlock
            code={`// Welcome message (server → client on connect)
{
  "type": "system.connected",
  "status": "connected",
  "message": "TraceLLM websocket active"
}

// Trace event (server → client on trace.created)
{
  "type": "trace.created",
  "trace": {
    "trace_id": "tr_2kf9q3m1",
    "prompt": "Explain transformers",
    "latency": 3420.0,
    "token_count": 1247,
    "status": "success",
    "steps": [...]
  }
}

// Heartbeat (client → server, every 5 seconds)
{ "type": "ping", "ts": 1717151234567 }

// Heartbeat response (server → client)
{ "type": "system.pong", "timestamp": 1717151234567 }`}
            lang="json"
            label="WebSocket protocol messages"
          />
        </>
      ),
    },
    {
      id: "broadcast-flow",
      title: "Broadcast Flow",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Broadcasting is triggered from <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace_service.save_trace()</code> immediately
            after the MongoDB insert succeeds. The trace document is validated against
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> TraceSchema</code> and serialized to JSON before broadcast:
          </p>
          <CodeBlock
            code={`# In trace_service.py:save_trace()
document = normalize_trace_document(trace_data)
await collection.insert_one(document)          # Persist to MongoDB

await manager.broadcast({                       # Push to all clients
    "type": "trace.created",
    "trace": TraceSchema.model_validate(document)
                       .model_dump(mode="json")
})

console.print(f"Trace saved to MongoDB")`}
            lang="python"
            label="Broadcast trigger"
          />
        </>
      ),
    },
    {
      id: "client-integration",
      title: "Client Integration (Dashboard)",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The Next.js dashboard connects to the WebSocket in the
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> ObservabilityProvider</code> React context. It uses a plain
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> WebSocket</code> client with a 5-second heartbeat interval to keep the
            connection alive. Incoming messages are parsed and dispatched to the React
            state via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">useEffectEvent</code>:
          </p>
          <CodeBlock
            code={`// Frontend WebSocket client (simplified)
useEffect(() => {
  const socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    setConnectionState("open");
    heartbeat = setInterval(() => {
      socket.send(JSON.stringify({ type: "ping", ts: Date.now() }));
    }, 5000);
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "trace.created") {
      setLatestTrace(message.trace);
      appendEvents(traceToEvents(message.trace));
    }
  };

  socket.onerror = () => setConnectionState("error");
  socket.onclose = () => setConnectionState("closed");

  return () => { clearInterval(heartbeat); socket.close(); };
}, [socketUrl]);`}
            lang="typescript"
            label="Dashboard WebSocket client"
          />
          <Callout variant="tip">
            The dashboard auto-reconnects via browser WebSocket built-in behavior.
            The CLI monitor (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">tracellm monitor</code>) implements its own WebSocket
            client with exponential backoff reconnection (1s to 30s) and falls back to
            polling MongoDB when the WebSocket is unavailable.
          </Callout>
        </>
      ),
    },
  ],

  "developers/api-reference": [
    {
      id: "api-overview",
      title: "API Reference",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The TraceLLM backend exposes a REST API at <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">http://127.0.0.1:8000</code>
            with endpoints for traces, analytics, failures, projects, and health checks.
            All endpoints return JSON responses. The OpenAPI docs are available at{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">/docs</code>.
          </p>
        </>
      ),
    },
    {
      id: "health",
      title: "Health",
      content: (
        <>
          <Table
            headers={["Method", "Path", "Description"]}
            rows={[
              ["GET", "/", "Health check — returns {message: 'TraceLLM backend running'}"],
            ]}
          />
          <CodeBlock
            code={`GET /
Response 200:
{
  "message": "TraceLLM backend running"
}`}
            lang="bash"
            label="Health check"
          />
        </>
      ),
    },
    {
      id: "traces-api",
      title: "Traces",
      content: (
        <>
          <Table
            headers={["Method", "Path", "Description"]}
            rows={[
              ["GET", "/traces", "List traces with filtering (status, model, project, latency, tokens)"],
              ["GET", "/traces/{trace_id}", "Get a single trace by ID"],
            ]}
          />
          <CodeBlock
            code={`GET /traces?status=failed&limit=10&project_id=default
Response 200:
{
  "total": 3,
  "items": [
    {
      "trace_id": "tr_2kf9q3m1",
      "prompt": "Explain transformers",
      "latency": 3420.0,
      "token_count": 1247,
      "status": "failed",
      "steps": [...]
    }
  ]
}`}
            lang="bash"
            label="GET /traces"
          />
          <Callout variant="info">
            The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">GET /traces/{`{trace_id}`}</code> endpoint returns a single{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">TraceSchema</code> object. A 404 is returned if the trace does not exist.
          </Callout>
        </>
      ),
    },
    {
      id: "analytics-api",
      title: "Analytics",
      content: (
        <>
          <Table
            headers={["Method", "Path", "Description"]}
            rows={[
              ["GET", "/analytics", "Aggregated analytics with summary, charts, and breakdowns"],
            ]}
          />
          <CodeBlock
            code={`GET /analytics?project_id=default
Response 200:
{
  "summary": {
    "total_traces": 50,
    "success_rate": 92.0,
    "average_latency": 1240.5,
    "p95_latency": 3420.0,
    "total_token_usage": 62350,
    "failed_traces": 2,
    "warning_traces": 2,
    "retries": 5,
    "slow_requests": 8
  },
  "charts": [
    { "label": "14:00", "latency": 1100.0, "tokens": 4500, "traces": 5 }
  ],
  "status_breakdown": [
    { "key": "success", "count": 46 },
    { "key": "failed", "count": 2 }
  ],
  "model_breakdown": [
    { "key": "gpt-4o", "count": 30 },
    { "key": "gpt-4.1-mini", "count": 20 }
  ],
  "project_breakdown": [
    { "key": "default", "count": 50 }
  ],
  "recent_failures": [...]
}`}
            lang="bash"
            label="GET /analytics"
          />
        </>
      ),
    },
    {
      id: "failures-api",
      title: "Failures",
      content: (
        <>
          <Table
            headers={["Method", "Path", "Description"]}
            rows={[
              ["GET", "/failures", "Get categorized failures: failed traces, retries, and slow requests"],
            ]}
          />
          <CodeBlock
            code={`GET /failures?limit=10&project_id=default
Response 200:
{
  "failed_traces": [...],
  "retries": [...],
  "slow_requests": [...],
  "totals": {
    "failed_traces": 2,
    "retries": 3,
    "slow_requests": 8
  }
}`}
            lang="bash"
            label="GET /failures"
          />
        </>
      ),
    },
    {
      id: "projects-api",
      title: "Projects",
      content: (
        <>
          <Table
            headers={["Method", "Path", "Description"]}
            rows={[
              ["GET", "/projects", "List all projects"],
              ["POST", "/projects", "Create a new project with an API key"],
              ["GET", "/api-keys", "List API keys, optionally filtered by project_id"],
            ]}
          />
          <CodeBlock
            code={`POST /projects?name=my-project&environment=production&description=My%20project
Response 201:
{
  "project": {
    "project_id": "my-project",
    "name": "my-project",
    "description": "My project",
    "created_at": "2026-05-31T14:22:10"
  },
  "api_key": {
    "key": "tlm_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "project_id": "my-project",
    "environment": "production",
    "created_at": "2026-05-31T14:22:10"
  }
}`}
            lang="bash"
            label="POST /projects"
          />
          <Callout variant="tip">
            API keys are shown only once at creation. Save them securely — they cannot be
            retrieved later.
          </Callout>
        </>
      ),
    },
    {
      id: "websocket-api",
      title: "WebSocket",
      content: (
        <>
          <Table
            headers={["Protocol", "Path", "Description"]}
            rows={[["WS", "/ws", "Real-time trace event stream"]]}
          />
          <p className="mt-4 leading-7 text-zinc-400">
            Connect via WebSocket to receive <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">trace.created</code> events in real time.
            See the <a href="/docs/developers/websocket" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">WebSocket documentation</a> for the full protocol reference.
          </p>
        </>
      ),
    },
  ],

  "examples/openai-example": [
    {
      id: "openai-example-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            This example traces a real OpenAI chat completion. It captures the full request-response
            cycle including prompt, response content, model name, latency, token usage, and
            streaming chunks. The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">wrap_openai</code> monkey-patches the OpenAI client so
            every <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">chat.completions.create</code> call is automatically traced.
          </p>
        </>
      ),
    },
    {
      id: "openai-example-code",
      title: "Code",
      content: (
        <>
          <CodeBlock
            code={`import os
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
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.7,
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    result = ask_llm(
        "Explain how transformer attention works in three sentences."
    )
    print(f"\\nResponse received ({len(result)} chars)")
    print(result)`}
            lang="python"
            label="openai_example.py"
          />
          <Callout variant="tip">
            Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">export OPENAI_API_KEY=&quot;sk-...&quot;</code> before running. Make sure
            the TraceLLM stack is running (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">tracellm start</code>) so traces are persisted.
          </Callout>
        </>
      ),
    },
    {
      id: "openai-example-output",
      title: "Expected Output",
      content: (
        <>
          <CodeBlock
            code={`  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                              │
  │  Trace ID     tr_f9e2a1b7                                    │
  │  Prompt       Explain how transformer attention works in     │
  │               three sentences.                               │
  │  Model        gpt-4.1-mini                                   │
  │  Project      openai-demo                                    │
  │  Environment  development                                    │
  │  Latency      1,873.42 ms                                    │
  │  Token Count  142                                            │
  │  Retries      0                                              │
  │  Steps        1                                              │
  │  Status        SUCCESS                                       │
  │                                                              │
  ╰──────────────────────────────────────────────────────────────╯

  #  Tool              Duration  Status  Detail
  1  openai_chat         1873ms     OK

Response received (486 chars)
Transformer attention works by computing three vectors — Query, Key,
and Value — from each input token. It calculates attention scores by
taking the dot product of every Query with every Key, then applies a
softmax to produce a probability distribution. These scores determine
how much each token contributes to the output, allowing the model to
focus on relevant parts of the input when generating each token.`}
            lang="text"
            label="Console output"
          />
        </>
      ),
    },
    {
      id: "openai-example-dashboard",
      title: "Dashboard Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Open <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">http://localhost:3000/traces</code> to see the trace in the dashboard:
          </p>
          <CodeBlock
            code={`TraceLLM Dashboard  >  Traces

  Status  Trace ID        Prompt                                      Model         Latency    Tokens    Time
  ─────── ─────────────── ─────────────────────────────────────────── ───────────── ────────── ──────── ─────────────────────
  ● Success  tr_f9e2a1b7  Explain how transformer attention works in  gpt-4.1-mini  1,873 ms   142      2026-05-31 14:22:10
                          three sentences.

  > Clicking the trace opens the detail view:

  ┌─ tr_f9e2a1b7 ───────────────────────────────────────────── [Success] ─┐
  │  Model  gpt-4.1-mini  |  Latency  1,873 ms  |  Tokens  142           │
  │  Retries  0  |  Steps  1  |  At  2026-05-31 14:22:10                  │
  └───────────────────────────────────────────────────────────────────────┘

  ┌─ Step Timeline ───────────────────────────────────────────────────────┐
  │                                                                       │
  │    openai_chat ─────────────────────────────────────── 1,873ms  OK    │
  │                                                                       │
  └────────────────────────────────────────────────────────────────────────┘

  ┌─ Prompt ────────────────┐  ┌─ Response ───────────────────────────────┐
  │ Explain how transformer │  │ Transformer attention works by computing │
  │ attention works in      │  │ three vectors — Query, Key, and Value —  │
  │ three sentences.        │  │ from each input token...                  │
  └─────────────────────────┘  └──────────────────────────────────────────┘`}
            lang="text"
            label="Dashboard UI"
          />
        </>
      ),
    },
    {
      id: "openai-example-replay",
      title: "Replay Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Use the CLI to replay the trace step-by-step:
          </p>
          <CodeBlock
            code={`tracellm replay tr_f9e2a1b7`}
            lang="bash"
            label="terminal"
          />
          <CodeBlock
            code={`╭────────────────── Replaying execution timeline... ──────────────────╮
│                                                                      │
│  ╭─ Replay ───────────────────────────────────────────────────────╮ │
│  │                                                                 │ │
│  │  trace_id  tr_f9e2a1b7                                         │ │
│  │  status    SUCCESS                                              │ │
│  │  latency   1873.42 ms                                           │ │
│  │  retries   0                                                    │ │
│  │  steps     1                                                    │ │
│  │                                                                 │ │
│  ╰─────────────────────────────────────────────────────────────────╯ │
│                                                                      │
│  ╭─ Step 1/1 ────────────────────────────────╮                      │
│  │                                           │                      │
│  │  step     1/1                             │                      │
│  │  tool     openai_chat                     │                      │
│  │  duration 1873 ms                         │                      │
│  │  status   OK                              │                      │
│  │  input    {'model': 'gpt-4.1-mini', ...}  │                      │
│  │  output   {'content': 'Transformer att... │                      │
│  │                                           │                      │
│  ╰───────────────────────────────────────────╯                      │
╰──────────────────────────────────────────────────────────────────────╯

  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                          │
  │  Trace ID     tr_f9e2a1b7                                │
  │  Prompt       Explain how transformer attention...       │
  │  Model        gpt-4.1-mini                               │
  │  Project      openai-demo                                │
  │  Environment  development                                │
  │  Latency      1,873.42 ms                                │
  │  Token Count  142                                        │
  │  Retries      0                                          │
  │  Steps        1                                          │
  │  Status        SUCCESS                                   │
  │                                                          │
  ╰──────────────────────────────────────────────────────────╯

Replay complete`}
            lang="text"
            label="Replay output"
          />
        </>
      ),
    },
  ],

  "examples/groq-example": [
    {
      id: "groq-example-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Groq exposes an OpenAI-compatible API, so the TraceLLM OpenAI integration works
            directly. The only change is setting <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">base_url</code> and using a Groq API key.
            This example runs <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">llama-3.3-70b-versatile</code> on Groq hardware.
          </p>
        </>
      ),
    },
    {
      id: "groq-example-code",
      title: "Code",
      content: (
        <>
          <CodeBlock
            code={`import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI
from tracellm import trace
from tracellm.integrations.openai import wrap_openai


client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.environ["GROQ_API_KEY"],
)
client = wrap_openai(client)


@trace(
    prompt="groq_inference",
    model_name="llama-3.3-70b-versatile",
    project="multi-provider",
    environment="development",
)
def run_groq(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1024,
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    result = run_groq(
        "Explain how Groq's LPU inference architecture achieves "
        "low latency compared to traditional GPU-based inference."
    )
    print(f"\\nResponse ({len(result)} chars):\\n{result}")`}
            lang="python"
            label="groq_example.py"
          />
          <Callout variant="warning">
            Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">export GROQ_API_KEY=&quot;gsk_...&quot;</code> before running. Keys are
            available at{" "}
            <a href="https://console.groq.com" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">console.groq.com</a>.
          </Callout>
        </>
      ),
    },
    {
      id: "groq-example-output",
      title: "Expected Output",
      content: (
        <>
          <CodeBlock
            code={`  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                              │
  │  Trace ID     tr_d7c4b2e9                                    │
  │  Prompt       groq_inference                                 │
  │  Model        llama-3.3-70b-versatile                        │
  │  Project      multi-provider                                 │
  │  Environment  development                                    │
  │  Latency      542.18 ms                                      │
  │  Token Count  267                                            │
  │  Retries      0                                              │
  │  Steps        1                                              │
  │  Status        SUCCESS                                       │
  │                                                              │
  ╰──────────────────────────────────────────────────────────────╯

  #  Tool              Duration  Status  Detail
  1  openai_chat          542ms     OK

Response (891 chars):
Groq's LPU (Language Processing Unit) achieves low latency by using
a deterministic, sequential processor architecture specifically
designed for LLM inference workloads. Unlike GPUs, which rely on
massive parallel SIMT execution and face memory bandwidth bottlenecks
from HBM, the LPU eliminates the need for external memory lookups
during autoregressive decoding. Its near-calculator compute model
enables tokens to be processed in a single pass through the silicon,
reducing per-token latency by 10-50x compared to GPU-based inference
for models like Llama. This makes Groq ideal for real-time
applications where response time is critical.`}
            lang="text"
            label="Console output"
          />
        </>
      ),
    },
    {
      id: "groq-example-dashboard",
      title: "Dashboard Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Open <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">http://localhost:3000/traces</code> to see the Groq trace:
          </p>
          <CodeBlock
            code={`TraceLLM Dashboard  >  Traces

  Status  Trace ID        Prompt                    Model                       Latency    Tokens    Time
  ─────── ─────────────── ───────────────────────── ────────────────────────── ────────── ──────── ─────────────────────
  ● Success  tr_d7c4b2e9  groq_inference            llama-3.3-70b-versatile    542 ms     267      2026-05-31 14:23:45

  > Detail view summary bar:

  Model: llama-3.3-70b-versatile  |  Latency: 542 ms  |  Tokens: 267
  Retries: 0  |  Steps: 1  |  At: 2026-05-31 14:23:45

  > The Analytics page (/analytics) groups this trace under the
    "multi-provider" project, showing it alongside OpenAI traces for
    cross-provider latency and cost comparisons.`}
            lang="text"
            label="Dashboard UI"
          />
        </>
      ),
    },
    {
      id: "groq-example-replay",
      title: "Replay Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Replay the trace to see the step execution timeline:
          </p>
          <CodeBlock
            code={`tracellm replay tr_d7c4b2e9 --speed 2.0`}
            lang="bash"
            label="terminal"
          />
          <CodeBlock
            code={`╭────────────────── Replaying execution timeline... ──────────────────╮
│                                                                      │
│  ╭─ Replay ───────────────────────────────────────────────────────╮ │
│  │                                                                 │ │
│  │  trace_id  tr_d7c4b2e9                                         │ │
│  │  status    SUCCESS                                              │ │
│  │  latency   542.18 ms                                            │ │
│  │  retries   0                                                    │ │
│  │  steps     1                                                    │ │
│  │                                                                 │ │
│  ╰─────────────────────────────────────────────────────────────────╯ │
│                                                                      │
│  ╭─ Step 1/1 ───────────────────────────────────────╮               │
│  │                                                    │               │
│  │  step     1/1                                      │               │
│  │  tool     openai_chat                              │               │
│  │  duration 542 ms                                   │               │
│  │  status   OK                                       │               │
│  │  input    {'model': 'llama-3.3-70b-versatile', ...}│               │
│  │  output   {'content': "Groq's LPU (Language...",   │               │
│  │            'usage': {'total_tokens': 267}}         │               │
│  │                                                    │               │
│  ╰────────────────────────────────────────────────────╯               │
╰──────────────────────────────────────────────────────────────────────╯

Replay complete`}
            lang="text"
            label="Replay output"
          />
        </>
      ),
    },
  ],

  "examples/agent-example": [
    {
      id: "agent-example-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            This example demonstrates a multi-tool agent where each tool is instrumented with
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300"> @trace_tool</code> and the orchestrator is decorated with{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code>. The trace captures every tool call including retries,
            durations, inputs, outputs, and exceptions — all as steps within a single trace.
          </p>
        </>
      ),
    },
    {
      id: "agent-example-code",
      title: "Code",
      content: (
        <>
          <CodeBlock
            code={`import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI
from tracellm import trace, trace_tool
from tracellm.integrations.openai import wrap_openai


client = OpenAI()
client = wrap_openai(client)


@trace_tool(name="search_web", max_retries=2)
def search_web(query: str) -> str:
    """Simulated web search that fails 30% of the time."""
    if random.random() < 0.3:
        raise ConnectionError("Search API temporarily unavailable")
    return f"Top result for '{query}': LLM agents are transforming enterprise workflows."


@trace_tool(name="calculate", max_retries=1)
def calculate(expression: str) -> str:
    """Evaluate a math expression safely."""
    allowed = {"+", "-", "*", "/", "(", ")", " ", ".", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"}
    if not all(c in allowed for c in expression):
        return "Error: Invalid characters in expression"
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return f"Result: {result}"
    except Exception as e:
        return f"Calculation error: {e}"


@trace_tool(name="summarize")
def summarize(text: str, max_words: int = 30) -> str:
    """Truncate text to a summary."""
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "..."


@trace(project="agent-demo", environment="development")
def run_agent(task: str) -> dict:
    search_result = search_web(task)
    calc_result = calculate("145 * 32")
    summary = summarize(f"{search_result}\\nToken count: {calc_result}")
    return {"task": task, "summary": summary, "calc": calc_result}


if __name__ == "__main__":
    result = run_agent("impact of AI agents on enterprise software")
    print(f"\\nAgent Response:")
    for key, value in result.items():
        print(f"  {key}: {value}")`}
            lang="python"
            label="agent_example.py"
          />
          <Callout variant="info">
            No API key needed for this example — tools are simulated. The{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">@trace_tool</code> decorator records each call as a step in the parent
            trace via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">contextvars.ContextVar</code>.
          </Callout>
        </>
      ),
    },
    {
      id: "agent-example-output",
      title: "Expected Output",
      content: (
        <>
          <CodeBlock
            code={`  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                              │
  │  Trace ID     tr_c5d8e2f1                                    │
  │  Prompt       impact of AI agents on enterprise software     │
  │  Model        unknown                                        │
  │  Project      agent-demo                                     │
  │  Environment  development                                    │
  │  Latency      284.15 ms                                      │
  │  Token Count  42                                             │
  │  Retries      0                                              │
  │  Steps        3                                              │
  │  Status        SUCCESS                                       │
  │                                                              │
  ╰──────────────────────────────────────────────────────────────╯

  #  Tool              Duration  Status  Detail
  1  search_web            120ms     OK
  2  calculate              35ms     OK
  3  summarize              12ms     OK

Agent Response:
  task: impact of AI agents on enterprise software
  summary: Top result for 'impact of AI agents on enterprise
           software': LLM agents are transforming enterprise...
  calc: Result: 4640

If search_web fails (30% chance), the trace shows retry attempts:

  #  Tool              Duration  Status  Detail
  1  search_web            120ms  RETRY
  2  search_web            115ms  RETRY
  3  search_web            130ms     OK
  4  calculate              35ms     OK
  5  summarize              12ms     OK`}
            lang="text"
            label="Console output"
          />
        </>
      ),
    },
    {
      id: "agent-example-dashboard",
      title: "Dashboard Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The trace appears in the dashboard with all 3 tool steps visible:
          </p>
          <CodeBlock
            code={`TraceLLM Dashboard  >  Traces

  Status  Trace ID        Prompt                                              Model    Latency   Tokens    Time
  ─────── ─────────────── ─────────────────────────────────────────────────── ─────── ───────── ──────── ─────────────────────
  ● Success  tr_c5d8e2f1  impact of AI agents on enterprise software         unknown   284 ms    42      2026-05-31 14:25:12

  > Detail view shows all 3 steps in the timeline:

  ┌─ Step Timeline ────────────────────────────────────────────────────────────┐
  │                                                                             │
  │    search_web   ───────────────────────────── 120ms  OK                     │
  │    calculate    ────────── 35ms  OK                                         │
  │    summarize    ──── 12ms  OK                                               │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘

  > Clicking a step opens the TraceInspector panel showing input/output:

  ┌─ TraceInspector ───────────────────────────────────────────────┐
  │  Step: search_web                                               │
  │  Input:  {'query': 'impact of AI agents on enterprise software'}│
  │  Output: {'result': "Top result for 'impact...'}                │
  │  Duration: 120.45 ms                                            │
  │  Success: True                                                   │
  └─────────────────────────────────────────────────────────────────┘`}
            lang="text"
            label="Dashboard UI"
          />
        </>
      ),
    },
    {
      id: "agent-example-replay",
      title: "Replay Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Replay animates each tool call in sequence with live step details:
          </p>
          <CodeBlock
            code={`tracellm replay tr_c5d8e2f1 --show-response`}
            lang="bash"
            label="terminal"
          />
          <CodeBlock
            code={`╭────────────────── Replaying execution timeline... ──────────────────╮
│                                                                      │
│  ╭─ Replay ───────────────────────────────────────────────────────╮ │
│  │                                                                 │ │
│  │  trace_id  tr_c5d8e2f1                                         │ │
│  │  status    SUCCESS                                              │ │
│  │  latency   284.15 ms                                            │ │
│  │  retries   0                                                    │ │
│  │  steps     3                                                    │ │
│  │                                                                 │ │
│  ╰─────────────────────────────────────────────────────────────────╯ │
│                                                                      │
│  ╭─ Step 1/3 ───────────────────────────────────────╮               │
│  │   step     1/3                                    │               │
│  │   tool     search_web                             │               │
│  │   duration 120 ms                                 │               │
│  │   status   OK                                     │               │
│  │   input    {'query': 'impact of AI agents...'}    │               │
│  │   output   {'result': "Top result for 'impact...  │               │
│  ╰────────────────────────────────────────────────────╯               │
│                                                                      │
│  ╭─ Step 2/3 ───────────────────────────────────────╮               │
│  │   step     2/3                                    │               │
│  │   tool     calculate                              │               │
│  │   duration 35 ms                                  │               │
│  │   status   OK                                     │               │
│  ╰────────────────────────────────────────────────────╯               │
│                                                                      │
│  ╭─ Step 3/3 ───────────────────────────────────────╮               │
│  │   step     3/3                                    │               │
│  │   tool     summarize                              │               │
│  │   duration 12 ms                                  │               │
│  │   status   OK                                     │               │
│  ╰────────────────────────────────────────────────────╯               │
╰──────────────────────────────────────────────────────────────────────╯

  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                          │
  │  Trace ID     tr_c5d8e2f1                                │
  │  Prompt       impact of AI agents on enterprise...       │
  │  ...                                                     │
  ╰──────────────────────────────────────────────────────────╯

Replay complete`}
            lang="text"
            label="Replay output"
          />
        </>
      ),
    },
  ],

  "examples/rag-example": [
    {
      id: "rag-example-overview",
      title: "Overview",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            This example demonstrates a RAG pipeline with tracing. A simulated document store
            returns relevant context, which is fed to OpenAI for grounded generation. Each stage
            (retrieval, context assembly, generation) is captured as a step in a single trace
            via <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace_tool</code> and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code>.
          </p>
        </>
      ),
    },
    {
      id: "rag-example-code",
      title: "Code",
      content: (
        <>
          <CodeBlock
            code={`import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from openai import OpenAI
from tracellm import trace, trace_tool
from tracellm.integrations.openai import wrap_openai


client = OpenAI()
client = wrap_openai(client)


KNOWLEDGE_BASE = {
    "observability": (
        "Observability in LLM systems provides visibility into prompts, completions, "
        "token usage, latency, error rates, and cost across the entire pipeline."
    ),
    "tracing": (
        "Tracing captures the full execution graph of LLM applications including "
        "tool calls, retrieval steps, intermediate reasoning, and external API calls."
    ),
    "monitoring": (
        "Production LLM monitoring tracks token throughput, error rates, latency "
        "percentiles (p50/p95/p99), and cost per request across models and providers."
    ),
    "rag": (
        "Retrieval-Augmented Generation combines vector search with LLM generation "
        "to produce grounded, factually accurate responses with source attribution."
    ),
}


@trace_tool(name="retrieve")
def retrieve(query: str) -> list[dict]:
    query_lower = query.lower()
    results = []
    for topic, content in KNOWLEDGE_BASE.items():
        if topic in query_lower or any(word in topic for word in query_lower.split()):
            results.append({"topic": topic, "content": content, "score": 0.95})
    if not results:
        results.append({
            "topic": "general",
            "content": "LLM systems benefit from comprehensive observability practices.",
            "score": 0.50,
        })
    return results


@trace_tool(name="rerank")
def rerank(documents: list[dict], query: str) -> list[dict]:
    return sorted(documents, key=lambda d: d["score"], reverse=True)[:2]


@trace_tool(name="generate")
def generate(context: str, query: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a RAG system. Answer concisely using only the "
                           "provided context. Cite sources.",
            },
            {
                "role": "user",
                "content": f"Context:\\n{context}\\n\\nQuestion: {query}",
            },
        ],
        max_tokens=300,
        temperature=0.2,
    )
    return response.choices[0].message.content


@trace(project="rag-demo", environment="development")
def run_rag(query: str) -> dict:
    docs = retrieve(query)
    top_docs = rerank(docs, query)
    context = "\\n---\\n".join(d["content"] for d in top_docs)
    answer = generate(context, query)
    return {
        "query": query,
        "sources": [d["topic"] for d in top_docs],
        "answer": answer,
    }


if __name__ == "__main__":
    result = run_rag("How does tracing help in LLM observability?")
    print(f"\\nSources: {', '.join(result['sources'])}")
    print(f"\\nAnswer:\\n{result['answer']}")`}
            lang="python"
            label="rag_example.py"
          />
          <Callout variant="tip">
            Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">export OPENAI_API_KEY=&quot;sk-...&quot;</code> before running. The retrieval
            and reranking steps are simulated; the generation step calls OpenAI.
          </Callout>
        </>
      ),
    },
    {
      id: "rag-example-output",
      title: "Expected Output",
      content: (
        <>
          <CodeBlock
            code={`  ╭── TraceLLM Trace ───────────────────────────── SUCCESS ──╮
  │                                                              │
  │  Trace ID     tr_e1f4a7c2                                    │
  │  Prompt       How does tracing help in LLM observability?    │
  │  Model        unknown                                        │
  │  Project      rag-demo                                       │
  │  Environment  development                                    │
  │  Latency      2,145.80 ms                                    │
  │  Token Count  198                                            │
  │  Retries      0                                              │
  │  Steps        3                                              │
  │  Status        SUCCESS                                       │
  │                                                              │
  ╰──────────────────────────────────────────────────────────────╯

  #  Tool              Duration  Status  Detail
  1  retrieve              12ms     OK
  2  rerank                 2ms     OK
  3  generate           2130ms     OK

Sources: tracing, observability

Answer:
Tracing helps LLM observability by capturing the full execution
graph of your application, including each tool call, retrieval step,
and API interaction. With TraceLLM, every step is recorded with its
duration, input, output, and status, making it possible to pinpoint
exactly where latency spikes or errors occur in the pipeline.
This granular visibility is essential for debugging production
RAG systems where failures can originate in retrieval, context
assembly, or generation stages.`}
            lang="text"
            label="Console output"
          />
        </>
      ),
    },
    {
      id: "rag-example-dashboard",
      title: "Dashboard Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            The RAG pipeline renders as a single trace with 3 ordered steps:
          </p>
          <CodeBlock
            code={`TraceLLM Dashboard  >  Traces

  Status  Trace ID        Prompt                                        Model    Latency    Tokens    Time
  ─────── ─────────────── ───────────────────────────────────────────── ─────── ────────── ──────── ─────────────────────
  ● Success  tr_e1f4a7c2  How does tracing help in LLM observability?  unknown  2,146 ms   198      2026-05-31 14:26:30

  > Detail view — step timeline shows the full RAG pipeline order:

  ┌─ Step Timeline ───────────────────────────────────────────────────────────┐
  │                                                                             │
  │    retrieve   ──── 12ms  OK                                                 │
  │    rerank     ─ 2ms  OK                                                     │
  │    generate   ──────────────────────────────────────────── 2130ms  OK       │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘

  > Prompt panel shows the original user query, Response panel
    shows the generated answer with source citations.

  > The Analytics page attributes all traces to "rag-demo" project,
    making it easy to monitor RAG pipeline health separately from
    other application traces.`}
            lang="text"
            label="Dashboard UI"
          />
        </>
      ),
    },
    {
      id: "rag-example-replay",
      title: "Replay Result",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            Replay animates each RAG stage with input/output detail:
          </p>
          <CodeBlock
            code={`tracellm replay tr_e1f4a7c2 --speed 1.5`}
            lang="bash"
            label="terminal"
          />
          <CodeBlock
            code={`╭────────────────── Replaying execution timeline... ──────────────────╮
│                                                                      │
│  ╭─ Replay ───────────────────────────────────────────────────────╮ │
│  │                                                                 │ │
│  │  trace_id  tr_e1f4a7c2                                         │ │
│  │  status    SUCCESS                                              │ │
│  │  latency   2145.80 ms                                           │ │
│  │  retries   0                                                    │ │
│  │  steps     3                                                    │ │
│  │                                                                 │ │
│  ╰─────────────────────────────────────────────────────────────────╯ │
│                                                                      │
│  ╭─ Step 1/3 ───────────────────────────────────────╮               │
│  │   step     1/3                                    │               │
│  │   tool     retrieve                               │               │
│  │   duration 12 ms                                  │               │
│  │   status   OK                                     │               │
│  │   input    {'query': 'How does tracing help...'}   │               │
│  │   output   {'result': [{'topic': 'tracing', ...}]  │               │
│  ╰────────────────────────────────────────────────────╯               │
│                                                                      │
│  ╭─ Step 2/3 ───────────────────────────────────────╮               │
│  │   step     2/3                                    │               │
│  │   tool     rerank                                 │               │
│  │   duration 2 ms                                   │               │
│  │   status   OK                                     │               │
│  ╰────────────────────────────────────────────────────╯               │
│                                                                      │
│  ╭─ Step 3/3 ───────────────────────────────────────╮               │
│  │   step     3/3                                    │               │
│  │   tool     generate                               │               │
│  │   duration 2130 ms                                │               │
│  │   status   OK                                     │               │
│  │   output   {'content': 'Tracing helps LLM         │               │
│  │             observability by capturing...'}       │               │
│  ╰────────────────────────────────────────────────────╯               │
╰──────────────────────────────────────────────────────────────────────╯

Replay complete`}
            lang="text"
            label="Replay output"
          />
        </>
      ),
    },
  ],

  "resources/faq": [
    {
      id: "faq-general",
      title: "General Questions",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400 font-medium text-white">What is TraceLLM?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            TraceLLM is an open-source, local-first observability platform for LLMs and AI agents.
            It captures every step of every execution — prompts, responses, tool calls, latency,
            token usage, and errors — so you can debug, replay, and analyze your AI workflows.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">Is TraceLLM free?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Yes. TraceLLM is fully open-source under the MIT license. There are no paid tiers,
            no cloud lock-in, and no usage limits. You run it entirely on your own infrastructure.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">Does TraceLLM send my data anywhere?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            No. By default, all trace data is stored locally in your MongoDB instance. No data
            leaves your machine unless you choose to export it manually.
          </p>
        </>
      ),
    },
    {
      id: "faq-installation",
      title: "Installation & Setup",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400 font-medium text-white">What are the system requirements?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Python 3.10 or later, MongoDB 6.0 or later, and pip. TraceLLM works on Linux, macOS,
            and Windows (via WSL2).
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">Do I need a GPU?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            No. TraceLLM is an observability platform — it does not run LLMs itself. It records
            and visualizes calls made to external LLM providers or local models. No GPU required.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">Can I use MongoDB Atlas?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Yes. Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">MONGO_URL</code> to your Atlas connection string. Works with any
            MongoDB-compatible service.
          </p>
        </>
      ),
    },
    {
      id: "faq-tracing",
      title: "Tracing & Instrumentation",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400 font-medium text-white">What can I trace?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Any Python function can be traced with the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator.
            The OpenAI and LangChain integrations automatically trace LLM calls, tool executions,
            and chain operations without manual instrumentation.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">Can I trace async functions?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Yes. The <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> decorator detects <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">async def</code> functions
            automatically and uses an async wrapper that preserves the event loop context.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">What is the difference between @trace and @trace_tool?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> creates a top-level trace document with its own trace ID,
            latency, and metadata. <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace_tool</code> records individual steps and
            attaches them to the nearest parent <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> context. Use{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace</code> for orchestration functions and <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">@trace_tool</code> for
            individual tool calls.
          </p>
        </>
      ),
    },
    {
      id: "faq-dashboard",
      title: "Dashboard & CLI",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400 font-medium text-white">The dashboard shows no traces. What should I check?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Ensure (1) the backend is running (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm start</code>), (2) MongoDB
            is accessible, and (3) you have actually created traces. Run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm trace "test"</code> to generate one.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">Can I use TraceLLM without the dashboard?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Yes. The CLI supports trace, replay, monitor, and export commands — all fully
            functional without the web dashboard. The dashboard is optional.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">How do I export trace data?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            Use <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm export --format json</code> or{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm export --format csv</code>. Exported files are written to the{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">./exports/</code> directory.
          </p>
        </>
      ),
    },
    {
      id: "faq-performance",
      title: "Performance & Reliability",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400 font-medium text-white">Does tracing add latency to my application?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            The overhead is minimal (sub-millisecond for the decorator itself). MongoDB
            persistence and WebSocket broadcast happen asynchronously and do not block the
            instrumented function.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">What happens if MongoDB is down?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            The instrumented function runs normally. The trace is finalized in memory but not
            persisted. A yellow &quot;Trace persistence skipped&quot; warning is logged. Once
            MongoDB is back, previously skipped traces are not retroactively saved.
          </p>

          <p className="mt-6 leading-7 text-zinc-400 font-medium text-white">How many traces can TraceLLM handle?</p>
          <p className="mt-2 leading-7 text-zinc-400">
            The limit is effectively your MongoDB capacity. The API defaults to returning 50
            traces per request (configurable up to 200). Analytics processes up to 5000 documents.
            For larger workloads, filter by project or time range.
          </p>
        </>
      ),
    },
  ],

  "resources/troubleshooting": [
    {
      id: "troubleshooting-common",
      title: "Common Issues",
      content: (
        <>
          <Table
            headers={["Issue", "Cause", "Solution"]}
            rows={[
              [
                "tracellm: command not found",
                "Python bin directory not in PATH",
                "Verify pip install location and add to PATH: export PATH=$PATH:$HOME/.local/bin",
              ],
              [
                "ModuleNotFoundError: No module named 'tracellm'",
                "Package not installed or wrong environment",
                "Run pip install tracellm and check your virtual environment",
              ],
              [
                "MongoDB connection refused",
                "MongoDB not running or wrong MONGO_URL",
                "Start MongoDB: mongod or docker run -p 27017:27017 mongo:7",
              ],
              [
                "Dashboard shows blank page",
                "Frontend build issue or port conflict",
                "Check browser console for errors, run tracellm start --dashboard-port 3001",
              ],
              [
                "WebSocket won't connect",
                "Backend not running on expected port",
                "Ensure tracellm start is running and check the port",
              ],
              [
                "Port 8000 already in use",
                "Another process using the port",
                "Use tracellm start --port 8001",
              ],
              [
                "No traces in dashboard",
                "No traces recorded or filter mismatch",
                "Run tracellm trace 'test' and check filters in dashboard",
              ],
              [
                "Trace persistence skipped",
                "MongoDB is unavailable or MONGO_URL not set",
                "Set MONGO_URL and DB_NAME, start MongoDB, restart the stack",
              ],
              [
                "ImportError for openai package",
                "OpenAI extra not installed",
                "Run pip install 'tracellm[openai]' or pip install openai>=1.6.0",
              ],
              [
                "LangChain callback not capturing steps",
                "Callbacks not passed in config",
                "Add config={'callbacks': [handler]} to every chain/tool.invoke() call",
              ],
            ]}
          />
        </>
      ),
    },
    {
      id: "troubleshooting-diagnostic",
      title: "Diagnostic Steps",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            If you encounter unexpected behavior, follow these diagnostic steps:
          </p>
          <StepCard number="1" title="Check the Stack Status">
            Run <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm start --check</code> to verify all services are running.
            This performs health probes without keeping the process running.
          </StepCard>
          <StepCard number="2" title="Verify Environment Variables">
            Ensure <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">MONGO_URL</code>, <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">DB_NAME</code>, and provider API keys
            (<code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">OPENAI_API_KEY</code>, etc.) are correctly set.
          </StepCard>
          <StepCard number="3" title="Check MongoDB Connectivity">
            Use <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">mongosh</code> to connect directly to your MongoDB instance and verify
            the <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">traces</code> collection exists.
          </StepCard>
          <StepCard number="4" title="Generate a Test Trace">
            Run <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm trace "diagnostic test"</code> and check console output for
            the trace summary panel.
          </StepCard>
          <StepCard number="5" title="Replay the Trace">
            Use <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm replay {`{trace_id}`}</code> to verify the trace was persisted
            and can be reconstructed.
          </StepCard>
        </>
      ),
    },
    {
      id: "troubleshooting-logs",
      title: "Getting Help",
      content: (
        <>
          <p className="mt-4 leading-7 text-zinc-400">
            If the diagnostic steps do not resolve your issue:
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 leading-7 text-zinc-400">
            <li>Check the backend logs — the FastAPI server outputs detailed error messages to stderr</li>
            <li>Run <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-zinc-300">tracellm --version</code> to confirm your installed version</li>
            <li>Review the <a href="/docs/resources/faq" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">FAQ</a> for additional answers</li>
          </ul>
          <Callout variant="info">
            When reporting issues, include the output of{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">tracellm --version</code>, your Python version, MongoDB version, and
            the full error message for fastest resolution.
          </Callout>
        </>
      ),
    },
  ],
};

export function getDocContent(slug: string): DocSection[] {
  return sections[slug] ?? [];
}
