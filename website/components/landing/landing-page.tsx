"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  Clock3,
  Code2,
  Copy,
  Database,
  Download,
  FileJson,
  Gauge,
  GitBranch,
  LayoutDashboard,
  MonitorDot,
  Play,
  RefreshCcw,
  Repeat2,
  SearchCode,
  Shield,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

import Link from "next/link";
import { cn } from "@/lib/utils";

const repoUrl = "https://github.com/avikcodes/traceLLM";

const heroLogs = [
  { label: "trace", text: "agent:start run_7c91 prompt='Explain transformers'", tone: "text-white" },
  { label: "tool", text: "retrieve.docs completed in 118ms", tone: "text-violet-200" },
  { label: "llm", text: "gpt-4o-mini latency=842ms tokens=1,284", tone: "text-zinc-300" },
  { label: "retry", text: "schema mismatch detected, replay checkpoint saved", tone: "text-violet-300" },
  { label: "done", text: "trace exported to ./exports/run_7c91.json", tone: "text-emerald-200" },
];

const requirements = [
  {
    icon: Terminal,
    title: "Python 3.11+",
    description: "TraceLLM requires Python 3.11 or newer.",
  },
  {
    icon: Database,
    title: "MongoDB Atlas or Self-Hosted MongoDB",
    description: "A running MongoDB instance for trace storage.",
  },
  {
    icon: Code2,
    title: "PyPI Installation",
    command: "pip install tracellm-cli",
  },
  {
    icon: FileJson,
    title: "Environment Configuration",
    description: "Set MONGO_URL and DB_NAME in your environment.",
  },
];

const installSteps = [
  {
    title: "Install",
    command: "pip install tracellm-cli",
    description: "Install the TraceLLM CLI package from PyPI.",
  },
  {
    title: "Configure",
    description: 'Create a .env file with your MongoDB connection string and database name.',
    envLines: ["MONGO_URL=your_mongodb_url", "DB_NAME=tracellm"],
  },
  {
    title: "Start",
    command: "tracellm start",
    description: "Launch the TraceLLM backend service and trace collector.",
  },
  {
    title: "Dashboard",
    description: "Open the dashboard in your browser to view live traces.",
    isLink: true,
  },
];

const features = [
  {
    icon: SearchCode,
    title: "Prompt Tracing",
    description: "Capture full prompt inputs, model responses, parameters, and metadata for every LLM call.",
  },
  {
    icon: Repeat2,
    title: "Replay Sessions",
    description: "Replay execution chains step-by-step to inspect inputs, outputs, retries, and intermediate state at any point.",
  },
  {
    icon: MonitorDot,
    title: "Live Monitoring",
    description: "Stream execution events in real time as your agent runs. See latency spikes, tool failures, and status changes instantly.",
  },
  {
    icon: Workflow,
    title: "Tool Call Visibility",
    description: "Every tool invocation — inputs, outputs, duration, and nested calls — is captured as a first-class event in the trace.",
  },
  {
    icon: Gauge,
    title: "Token Usage Tracking",
    description: "Track token consumption per model call, per session, and across your entire application.",
  },
  {
    icon: Download,
    title: "Session Export",
    description: "Export traces as structured JSON files for debugging, sharing, CI pipelines, or offline analysis.",
  },
  {
    icon: Shield,
    title: "Local First Architecture",
    description: "All trace data stays on your machine. No external servers, no data leaving your environment.",
  },
  {
    icon: Code2,
    title: "Open Source",
    description: "Fully open-source under the MIT license. Inspect, modify, and self-host without restrictions.",
  },
];

const faqItems = [
  {
    question: "Do I need MongoDB?",
    answer: "Yes. TraceLLM Version 1 stores traces in MongoDB.",
  },
  {
    question: "Is TraceLLM open source?",
    answer: "Yes. TraceLLM is fully open source under the MIT license.",
  },
  {
    question: "Does data leave my machine?",
    answer: "No. TraceLLM is local-first. All trace data stays on your machine.",
  },
  {
    question: "Do I need an API key?",
    answer: "No. TraceLLM does not require any API key or external service registration.",
  },
];

const cliCommands = [
  "pip install tracellm-cli",
  "tracellm start",
  "tracellm trace",
  "tracellm replay",
  "tracellm monitor",
];

const docs = [
  { title: "Quick Start", description: "Install TraceLLM and capture your first trace.", icon: Zap, href: "/docs/getting-started/quick-start" },
  { title: "CLI Commands", description: "Reference for start, trace, replay, monitor, and export.", icon: Terminal, href: "/docs/cli/tracellm" },
  { title: "Replay Engine", description: "Understand replay checkpoints and execution trees.", icon: RefreshCcw, href: "/docs/core/replay-engine" },
  { title: "Architecture", description: "Collector, trace store, dashboard, and export model.", icon: Boxes, href: "/docs/developers/architecture" },
  { title: "Examples", description: "Common patterns for LLM apps and agent workflows.", icon: Code2, href: "/docs/examples/openai-example" },
];

const demoCards = [
  {
    title: "Trace",
    description: "Capture prompts, latency, token usage, retries, and tool calls.",
    icon: SearchCode,
  },
  {
    title: "Replay",
    description: "Replay complete execution flows step-by-step.",
    icon: Repeat2,
  },
  {
    title: "Monitor",
    description: "Watch traces arrive live through the terminal and dashboard.",
    icon: MonitorDot,
  },
];

const demoCommands = [
  "pip install tracellm-cli",
  "tracellm start",
  'tracellm trace "Explain transformers"',
];

const traceyLabels = [
  { label: "Prompt", className: "left-4 top-10 sm:left-10" },
  { label: "Latency", className: "right-3 top-16 sm:right-8" },
  { label: "Tokens", className: "left-2 top-1/2 sm:left-6" },
  { label: "Retries", className: "right-2 top-1/2 sm:right-4" },
  { label: "Tool Calls", className: "bottom-20 left-6 sm:left-12" },
  { label: "Replay", className: "bottom-12 right-8 sm:right-16" },
];

const traceyChecklist = [
  "prompts",
  "responses",
  "token usage",
  "retries",
  "tool execution",
  "latency",
  "failures",
  "replay timeline",
];

const traceyCards = [
  { title: "Trace", description: "Capture every request and response.", icon: SearchCode },
  { title: "Replay", description: "Step through execution history.", icon: Repeat2 },
  { title: "Monitor", description: "Watch traces arrive in real time.", icon: MonitorDot },
];

type ProductDemoVideo =
  | { type: "placeholder" }
  | { type: "mp4"; src: string; poster?: string }
  | { type: "youtube" | "loom"; embedUrl: string };

function GithubMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.15-4.55-5.13 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.07A9.3 9.3 0 0 1 12 6.91c.85 0 1.7.12 2.5.37 1.91-1.35 2.75-1.07 2.75-1.07.55 1.42.2 2.47.1 2.73.64.73 1.03 1.66 1.03 2.79 0 3.99-2.33 4.86-4.56 5.12.36.32.68.95.68 1.93 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.27 10.27 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

function TraceLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 512 512"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="256" cy="256" r="188" />
        <path d="M183 203C211 173 242 170 272 146C288 133 312 132 330 141C370 162 389 203 385 247C382 284 393 311 421 334" />
        <path d="M183 203C166 214 154 232 151 255C147 287 172 307 210 307C246 307 271 296 290 279" />
        <path d="M220 307C249 315 280 313 307 308" />
        <path d="M299 282C303 316 290 344 271 374C255 400 249 423 256 444" />
        <path d="M225 188L274 171" />
        <path
          d="M304 195C316 195 325 204 325 216C325 228 316 237 304 237C292 237 283 228 283 216C283 204 292 195 304 195Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M199 244L186 257" />
      </g>
    </svg>
  );
}

function XMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.9 2.25h3.32l-7.25 8.28 8.53 11.22h-6.68l-5.23-6.82-5.99 6.82H2.28l7.75-8.86L1.85 2.25h6.85l4.73 6.24 5.47-6.24Zm-1.16 17.52h1.84L7.7 4.13H5.72l12.02 15.64Z" />
    </svg>
  );
}

function TraceyMascot() {
  return (
    <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-[#08080b] p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,0.16),transparent_42%)]" />
      <div className="absolute inset-8 rounded-[2rem] border border-white/[0.04]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 520 520"
        className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 text-white sm:h-[390px] sm:w-[390px]"
        fill="none"
      >
        <path
          d="M177 421c-26-16-42-43-42-76 0-47 33-82 76-88 18-3 35-11 51-23 25-19 55-24 85-12 39 16 63 52 63 96 0 62-47 112-117 112h-74"
          className="fill-[#0d0d12] stroke-white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M206 251c12-48 45-92 91-115 31-16 68-9 92 16 33 34 39 87 14 128"
          className="stroke-white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M180 420c20-26 45-41 75-44m71 47c-5-29 2-57 22-84"
          className="stroke-white"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M234 177l54-19m118 123c24 11 43 29 58 55"
          className="stroke-violet-300"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx="347" cy="211" r="23" className="fill-white" />
        <circle cx="354" cy="207" r="8" className="fill-black" />
        <path
          d="M277 260c25 21 58 27 91 17"
          className="stroke-white"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M137 318h-54m27-27v54"
          className="stroke-violet-300"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect
          x="185"
          y="111"
          width="154"
          height="54"
          rx="14"
          className="fill-black stroke-white"
          strokeWidth="8"
        />
        <path d="M214 138h80" className="stroke-violet-300" strokeWidth="8" strokeLinecap="round" />
      </svg>

      <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-white/12">
        <line x1="34%" y1="29%" x2="22%" y2="14%" stroke="currentColor" strokeWidth="1" />
        <line x1="65%" y1="32%" x2="82%" y2="16%" stroke="currentColor" strokeWidth="1" />
        <line x1="36%" y1="51%" x2="17%" y2="50%" stroke="currentColor" strokeWidth="1" />
        <line x1="68%" y1="51%" x2="86%" y2="50%" stroke="currentColor" strokeWidth="1" />
        <line x1="38%" y1="69%" x2="24%" y2="83%" stroke="currentColor" strokeWidth="1" />
        <line x1="64%" y1="70%" x2="79%" y2="86%" stroke="currentColor" strokeWidth="1" />
      </svg>

      {traceyLabels.map((item) => (
        <span
          key={item.label}
          className={cn(
            "absolute rounded-full border border-white/10 bg-black/80 px-3 py-1.5 font-mono text-xs text-zinc-200 shadow-lg shadow-black/30",
            item.className
          )}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-white"
      aria-label={`${label} ${value}`}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      <p className="font-mono text-xs uppercase tracking-[0.26em] text-violet-300/80">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">{description}</p>
    </div>
  );
}

function TerminalWindow({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 bg-[#08080b] shadow-2xl shadow-violet-950/20", className)}>
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-zinc-700" />
          <span className="size-3 rounded-full bg-zinc-700" />
          <span className="size-3 rounded-full bg-violet-400/70" />
        </div>
        <span className="font-mono text-xs text-zinc-500">tracellm monitor</span>
      </div>
      <div className="space-y-4 p-5 font-mono text-sm">
        <div className="text-zinc-500">$ tracellm trace agent.py --watch</div>
        {heroLogs.map((line) => (
          <div key={line.text} className="grid grid-cols-[72px_1fr] gap-4">
            <span className="text-zinc-600">[{line.label}]</span>
            <span className={line.tone}>{line.text}</span>
          </div>
        ))}
        <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.06] p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
            <span>run_7c91 execution tree</span>
            <span>2.14s</span>
          </div>
          <pre className="text-sm leading-7 text-zinc-200">{`agent:start
├── retrieve.docs       118ms
├── tool:web_search     401ms
├── llm.generate        842ms
└── success             2.14s`}</pre>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <span className="size-2 animate-pulse rounded-full bg-violet-300" />
          <span>listening for spans, tools, retries, and token events</span>
        </div>
      </div>
    </div>
  );
}

function VisualPlaceholder({ type, title }: { type: string; title: string }) {
  const rows = {
    trace: ["prompt.input", "llm.generate", "tokens.total", "latency.p95"],
    replay: ["agent:start", "retrieve", "tool:web_search", "success"],
    monitor: ["stream connected", "span opened", "tool finished", "trace closed"],
    agent: ["planner", "retriever", "browser", "writer"],
    export: ["trace.json", "spans.jsonl", "tokens.csv", "replay.tree"],
    terminal: ["start", "trace", "replay", "monitor"],
  }[type] ?? ["span", "tool", "llm", "done"];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#09090d] p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(139,92,246,0.12),transparent_35%)]" />
      <div className="relative">
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-600">replaceable screenshot</p>
            <p className="mt-1 text-sm font-medium text-zinc-300">{title}</p>
          </div>
          <div className="rounded-md border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 font-mono text-xs text-violet-200">
            {type}
          </div>
        </div>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={row} className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-sm text-zinc-200">{row}</span>
                <span className="font-mono text-xs text-zinc-600">+{index * 171}ms</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-violet-300/70"
                  style={{ width: `${42 + index * 11}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommandRow({ command }: { command: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black px-4 py-3">
      <code className="min-w-0 truncate font-mono text-sm text-zinc-100">
        <span className="mr-2 text-violet-300">$</span>
        {command}
      </code>
      <CopyButton value={command} />
    </div>
  );
}

function ProductDemo({ video = { type: "placeholder" } }: { video?: ProductDemoVideo }) {
  return (
    <section className="border-y border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12),transparent_34%)] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-violet-300/80">Product demo</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl md:text-6xl">
            See TraceLLM in Action
          </h2>
          <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
            Watch TraceLLM trace, replay, and debug a real LLM workflow from the terminal.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-[1100px]">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#07070a] shadow-2xl shadow-black/50">
            <div className="aspect-video">
              {video.type === "mp4" ? (
                <video
                  className="h-full w-full object-cover"
                  controls
                  poster={video.poster}
                  preload="metadata"
                >
                  <source src={video.src} type="video/mp4" />
                </video>
              ) : video.type === "youtube" || video.type === "loom" ? (
                <iframe
                  src={video.embedUrl}
                  title="TraceLLM product demo"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#08080b] text-left"
                  aria-label="Play TraceLLM product demo"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
                  <div className="absolute inset-x-8 top-8 hidden rounded-2xl border border-white/10 bg-black/70 p-5 font-mono text-sm text-zinc-300 backdrop-blur sm:block">
                    <div className="mb-4 text-zinc-500">$ tracellm trace agent.py --watch</div>
                    <div className="grid gap-3">
                      <span><span className="text-violet-300">trace</span> prompt captured · 1,284 tokens</span>
                      <span><span className="text-violet-300">tool</span> web_search completed · 401ms</span>
                      <span><span className="text-violet-300">replay</span> checkpoint saved · retry detected</span>
                    </div>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <span className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-black/70 px-3 py-1.5 font-mono text-xs text-zinc-300">
                      Demo placeholder · replace with MP4, YouTube, or Loom
                    </span>
                    <span className="flex size-20 items-center justify-center rounded-full border border-white/15 bg-white text-black shadow-2xl shadow-violet-950/40 transition group-hover:scale-105">
                      <Play className="ml-1 size-8 fill-current" />
                    </span>
                  </div>
                  <span className="absolute bottom-5 right-5 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 font-mono text-xs text-zinc-200">
                    Under 2 min
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {demoCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-[#09090d] p-5">
                  <Icon className="size-5 text-violet-200" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{card.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black p-3">
            <div className="space-y-3">
              {demoCommands.map((command) => (
                <CommandRow key={command} command={command} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.16),transparent_32%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:100%_100%,56px_56px,56px_56px]" />

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <TraceLogo className="size-8 text-white" />
            <span className="font-semibold tracking-tight">TraceLLM</span>
          </a>
          <div className="hidden items-center gap-6 font-mono text-xs text-zinc-400 md:flex">
            <a className="transition hover:text-white" href="#installation">Installation</a>
            <a className="transition hover:text-white" href="#features">Features</a>
            <a className="transition hover:text-white" href="#cli">CLI</a>
            <Link className="transition hover:text-white" href="/docs">Docs</Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://x.com/Avikzx"
              target="_blank"
              rel="noreferrer"
              aria-label="TraceLLM on X"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              <XMark className="size-4" />
            </a>
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex size-10 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white sm:h-10 sm:w-auto sm:px-3"
              aria-label="TraceLLM on GitHub"
            >
              <GithubMark className="size-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-32 lg:pt-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 font-mono text-xs text-violet-200">
            <Activity className="size-3.5" />
            Open-source, local-first observability
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            Open-Source LLM Observability for Developers
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Trace prompts, responses, latency, token usage, and tool calls locally. Replay sessions,
            inspect failures, and debug AI applications with full visibility.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#installation"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Get Started
              <ArrowRight className="size-4" />
            </a>
            <a
              href="/docs"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 px-5 text-sm font-medium text-zinc-100 transition hover:border-violet-400/40 hover:bg-white/[0.04]"
            >
              <BookOpen className="size-4" />
              View Docs
            </a>
          </div>
          <div className="mt-8 max-w-xl rounded-2xl border border-white/10 bg-black p-3">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] px-4 py-3">
              <code className="font-mono text-sm text-zinc-100">
                <span className="mr-2 text-violet-300">$</span>
                pip install tracellm-cli
              </code>
              <CopyButton value="pip install tracellm-cli" />
            </div>
          </div>
          <div className="mt-6 grid max-w-xl grid-cols-3 gap-3 text-xs text-zinc-500">
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">Tracing</div>
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">Replay</div>
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">Latency</div>
          </div>
        </div>
        <TerminalWindow />
      </section>

      <section className="border-y border-white/10 bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Before You Start"
            title="Requirements"
            description="Make sure your environment meets these prerequisites before installing TraceLLM."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {requirements.map((req) => {
              const Icon = req.icon;
              return (
                <div key={req.title} className="flex flex-col rounded-2xl border border-white/10 bg-[#09090d] p-6">
                  <Icon className="size-5 text-violet-200" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{req.title}</h3>
                  {req.description && (
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{req.description}</p>
                  )}
                  {req.command && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black px-3 py-2">
                      <code className="truncate font-mono text-xs text-zinc-100">{req.command}</code>
                      <CopyButton value={req.command} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4">
            <p className="text-sm leading-6 text-amber-200">
              <strong>Note:</strong> Version 1 requires MongoDB for trace storage. SQLite support is planned for a future release.
            </p>
          </div>
        </div>
      </section>

      <ProductDemo />

      <section id="installation" className="border-y border-white/10 bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Installation"
            title="Get Started in Four Steps"
            description="Install TraceLLM, configure your MongoDB connection, and start tracing in minutes."
          />
          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {installSteps.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-white/10 bg-[#09090d] p-6">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-600">
                    Step {index + 1}
                  </span>
                  <span className="flex size-8 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 font-mono text-xs text-violet-200">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{step.description}</p>
                {step.command && (
                  <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black px-4 py-3">
                    <code className="truncate font-mono text-sm text-zinc-100">{step.command}</code>
                    <CopyButton value={step.command} label="Copy" />
                  </div>
                )}
                {step.envLines && (
                  <div className="mt-4 space-y-1 rounded-xl border border-white/10 bg-black px-4 py-3 font-mono text-xs text-zinc-100">
                    {step.envLines.map((line) => (
                      <div key={line} className="flex items-center justify-between gap-2">
                        <span>{line}</span>
                        <CopyButton value={line} />
                      </div>
                    ))}
                  </div>
                )}
                {step.isLink && (
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 font-mono text-sm text-violet-200">
                      <LayoutDashboard className="size-4" />
                      http://localhost:3000
                    </span>
                  </div>
                )}
                {index < installSteps.length - 1 && (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden size-6 text-zinc-700 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#09090d] p-6">
              <Clock3 className="size-5 text-violet-200" />
              <h3 className="mt-5 text-xl font-semibold">Why care?</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Manual debugging hides the timeline. TraceLLM shows the run as it happened: prompt,
                tool, retry, latency, token count, output.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#09090d] p-6">
              <GitBranch className="size-5 text-violet-200" />
              <h3 className="mt-5 text-xl font-semibold">What breaks?</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Slow calls, hidden retry loops, bad tool outputs, prompt drift, runaway token usage,
                and agent branches that never converge.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#09090d] p-6">
              <Database className="size-5 text-violet-200" />
              <h3 className="mt-5 text-xl font-semibold">What changes?</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                You stop reconstructing behavior from print statements and start inspecting structured,
                replayable execution data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Features"
            title="Everything You Need to Debug AI Applications"
            description="TraceLLM gives you full visibility into every LLM call, tool invocation, and agent decision."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-2xl border border-white/10 bg-[#09090d] p-6 transition hover:border-violet-400/40 hover:bg-violet-400/[0.04]">
                  <Icon className="size-5 text-violet-200" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Architecture"
            title="How TraceLLM Works"
            description="From your application code to the dashboard — trace data flows through a simple, local pipeline."
          />
          <div className="mt-14 flex flex-col items-center gap-0">
            {["Developer App", "TraceLLM SDK", "TraceLLM Backend", "MongoDB", "Dashboard"].map((item, index) => (
              <div key={item} className="flex flex-col items-center">
                <div className="flex w-64 items-center justify-center rounded-2xl border border-white/10 bg-[#09090d] px-8 py-5">
                  <span className="text-center font-mono text-sm font-medium text-white">{item}</span>
                </div>
                {index < 4 && (
                  <div className="flex flex-col items-center py-2">
                    <svg className="size-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Common questions about TraceLLM, its requirements, and architecture."
          />
          <div className="mx-auto mt-14 max-w-3xl space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-white/10 bg-[#09090d] transition open:border-violet-400/40">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-base font-medium text-white transition hover:text-violet-200">
                  {item.question}
                  <svg className="size-5 text-zinc-500 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t border-white/10 px-6 pb-5 pt-4">
                  <p className="text-sm leading-6 text-zinc-400">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="cli" className="border-y border-white/10 bg-white/[0.015] py-24">
        <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <SectionHeader
            align="left"
            eyebrow="CLI"
            title="Built for the Terminal"
            description="The CLI is the primary interface. Start tracing where the bug appears, copy the command, and keep moving."
          />
          <div className="space-y-3">
            {cliCommands.map((command) => (
              <CommandRow key={command} command={command} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-[#09090d] p-6">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-600">Replay tree</span>
              <Play className="size-4 text-violet-200" />
            </div>
            <pre className="overflow-x-auto font-mono text-sm leading-8 text-zinc-100">{`agent:start
├── retrieve
├── tool:web_search
├── llm.generate
└── success`}</pre>
          </div>
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 font-mono text-xs text-violet-200">
              <RefreshCcw className="size-3.5" />
              Replay
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Replay turns “why did it do that?” into a timeline
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-400">
              Instead of reading logs backwards, replay shows the execution tree in order. You can
              inspect the prompt, tool input, tool output, retry reason, latency, and final response
              at the exact point where behavior changed.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.015] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 font-mono text-xs text-violet-200">
              <LayoutDashboard className="size-3.5" />
              Dashboard second
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              A visual layer on top of TraceLLM
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-400">
              The dashboard is secondary by design. Use it when you want to scan runs, compare trace
              timelines, inspect token usage, or share a visual debugging session. The terminal remains
              the default workflow.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#09090d] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {["Recent traces", "Latency view", "Token usage", "Replay detail"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-black p-4">
                  <div className="mb-8 h-2 w-16 rounded-full bg-violet-300/40" />
                  <p className="text-sm font-medium text-zinc-200">{item}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">Dashboard placeholder for future screenshot.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Mascot"
            title="Meet Tracey"
            description="A tiny dinosaur that follows every prompt, tool call, retry, and model response so you never lose track of what your AI system is doing."
          />
          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <TraceyMascot />
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 font-mono text-xs text-violet-200">
                <TraceLogo className="size-4" />
                Terminal explorer
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                Never Debug Blind Again
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                TraceLLM records the full execution path of LLM applications and agents.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {traceyChecklist.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="size-4 text-violet-300" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-2 font-mono text-sm text-zinc-300">
                <p>All locally.</p>
                <p>All open source.</p>
                <p>All from the terminal.</p>
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {traceyCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-[#09090d] p-6">
                  <Icon className="size-5 text-violet-200" />
                  <h3 className="mt-5 text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="docs" className="border-t border-white/10 bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Docs"
            title="Everything needed to start tracing"
            description="Documentation is organized around the developer path: install, run, replay, understand the architecture, then adapt examples."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {docs.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-white/10 bg-[#09090d] p-5 transition hover:border-violet-400/40 hover:bg-violet-400/[0.06]"
                >
                  <Icon className="size-5 text-violet-200" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>
                  <div className="mt-5 flex items-center gap-2 font-mono text-xs text-zinc-500 transition group-hover:text-violet-200">
                    Read docs
                    <ArrowRight className="size-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <TraceLogo className="size-5 text-white" />
            <span>TraceLLM — terminal-first observability for LLMs and AI agents.</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://x.com/Avikzx"
              target="_blank"
              rel="noreferrer"
              aria-label="TraceLLM on X"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              <XMark className="size-4" />
            </a>
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="TraceLLM on GitHub"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              <GithubMark className="size-4" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
