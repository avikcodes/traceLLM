"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Braces,
  Cable,
  CheckCircle2,
  CircleAlert,
  Command,
  Cpu,
  Database,
  GitBranch,
  LayoutDashboard,
  Orbit,
  Play,
  Radio,
  ScanSearch,
  ShieldAlert,
  Terminal,
  TimerReset,
  Waves,
  Webhook,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GitHubStats } from "@/components/landing/github-stats";

const featureCards = [
  { icon: ScanSearch, title: "Prompt Tracing", description: "Capture prompts, parameters, outputs, and branch context with infrastructure-grade clarity." },
  { icon: Orbit, title: "Agent Replay", description: "Step through every agent decision with tool state, retries, and output deltas attached." },
  { icon: ShieldAlert, title: "Failure Detection", description: "Surface regressions, malformed responses, and latency breaches before they hit production workflows." },
  { icon: TimerReset, title: "Token Analytics", description: "Measure token volume, burn patterns, and model efficiency across environments and teams." },
  { icon: Cable, title: "Tool Call Tracking", description: "Inspect every tool invocation with inputs, outputs, timing, and terminal-first logs." },
  { icon: Webhook, title: "Realtime WebSockets", description: "Stream live execution state into shared observability surfaces without waiting for refresh cycles." },
  { icon: GitBranch, title: "Execution Timelines", description: "Follow the full graph from request start to final response with every branch preserved." },
  { icon: Radio, title: "Retry Detection", description: "Identify hidden retry loops, fallback churn, and orchestration instability early." },
  { icon: Braces, title: "Export Reports", description: "Move traces into incidents, reviews, and CI pipelines with structured export artifacts." },
  { icon: Command, title: "CLI + Dashboard Workflow", description: "Work from the shell by default and pivot into deeper visual analysis only when needed." },
];

const traces = [
  { id: "tr_01j8x2a9b4", model: "gpt-4o-mini", duration: "842ms", status: "retry", statusColor: "text-[#BBBBBB]", time: "now" },
  { id: "tr_01j8x2a8f2", model: "gpt-4.1", duration: "1.24s", status: "ok", statusColor: "text-[#9A9A9A]", time: "2m ago" },
  { id: "tr_01j8x2a7d1", model: "claude-3.5", duration: "2.1s", status: "ok", statusColor: "text-[#9A9A9A]", time: "5m ago" },
  { id: "tr_01j8x2a6c0", model: "gpt-4o", duration: "612ms", status: "error", statusColor: "text-[#6B6B6B]", time: "8m ago" },
  { id: "tr_01j8x2a50f", model: "gpt-4o-mini", duration: "1.8s", status: "ok", statusColor: "text-[#9A9A9A]", time: "12m ago" },
];

const timelineSteps = [
  { label: "agent:start", time: "00ms", detail: "Initializing execution graph for support_router", color: "border-white/[0.20] bg-white/[0.10] text-[#9A9A9A]" },
  { label: "tool:retrieve", time: "+142ms", detail: "Querying VectorStore client: vector.search matching billing error", color: "border-white/[0.15] bg-white/[0.05] text-[#9A9A9A]" },
  { label: "llm:call", time: "+320ms", detail: "Sending payload to gpt-4o-mini (4.2k tokens, 1.2s timeout)", color: "border-white/[0.15] bg-white/[0.05] text-[#9A9A9A]" },
  { label: "retry", time: "+1.52s", detail: "Structured output schema mismatch — missing key: action_required", color: "border-white/[0.15] bg-white/[0.08] text-[#BBBBBB]" },
  { label: "success", time: "+2.14s", detail: "Valid schema returned. Execution trace finalized.", color: "border-white/[0.12] bg-white/[0.08] text-[#9A9A9A]" },
];

const logLines = [
  { time: "15:08:50", level: "ws", text: "ws://localhost:8000/api/v1/telemetry connected", levelColor: "text-[#9A9A9A]" },
  { time: "15:08:50", level: "trace", text: "initialized span context: tr_01j8x2a9b4", levelColor: "text-[#9A9A9A]" },
  { time: "15:08:51", level: "tool", text: "vector.search completed (142ms, exit: 0)", levelColor: "text-[#9A9A9A]" },
  { time: "15:08:52", level: "warn", text: "validation failed: schema validation error", levelColor: "text-[#BBBBBB]" },
  { time: "15:08:53", level: "trace", text: "trace context stored in clickhouse", levelColor: "text-[#9A9A9A]" },
];

const cliCommands = [
  "$ pip install tracellm",
  "$ export TRACELLM_API_KEY=sk_live_...",
  "$ tracellm trace app.py --env prod",
  "$ tracellm replay trace_01JX8A4",
];

const demoVideos = [
  { value: "cli", label: "CLI Demo", videoId: "xxxxxxxxxxx" },
  { value: "dashboard", label: "Dashboard Demo", videoId: "xxxxxxxxxxx" },
  { value: "replay", label: "Replay Demo", videoId: "xxxxxxxxxxx" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function GithubMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.15-4.55-5.13 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.07A9.3 9.3 0 0 1 12 6.91c.85 0 1.7.12 2.5.37 1.91-1.35 2.75-1.07 2.75-1.07.55 1.42.2 2.47.1 2.73.64.73 1.03 1.66 1.03 2.79 0 3.99-2.33 4.86-4.56 5.12.36.32.68.95.68 1.93 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.27 10.27 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

function TypingCommand() {
  const command = "$ tracellm trace app.py";
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setVisibleText(command.slice(0, index));
      if (index >= command.length) {
        window.clearInterval(interval);
      }
    }, 65);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-sm text-[#F5F5F5] sm:text-base">
      {visibleText}
      <span className="ml-1 inline-block h-5 w-2 translate-y-1 animate-pulse bg-white/[0.15]" />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-block rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[#9A9A9A]">
        {eyebrow}
      </span>
      <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#F5F5F5] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#9A9A9A] sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0B0B0B] px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]">{label}</p>
      <p className="mt-2 text-base font-medium text-[#9A9A9A]">{value}</p>
    </div>
  );
}

function HeroDashboard() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative mx-auto w-full max-w-xl"
    >
      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#0B0B0B] p-3 shadow-lg shadow-black/40">
        {/* Traces Panel */}
        <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-3">
          <div className="mb-2.5 flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-xs font-medium text-[#F5F5F5]">Recent Traces</span>
            <span className="rounded bg-white/[0.10] px-1.5 py-0.5 font-mono text-[10px] text-[#9A9A9A]">Live</span>
          </div>
          <div className="space-y-1">
            {traces.map((trace) => (
              <div
                key={trace.id}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5 font-mono text-xs",
                  trace.id === "tr_01j8x2a9b4" && "bg-white/[0.08]"
                )}
              >
                <span className="w-24 truncate text-[#9A9A9A]">{trace.id}</span>
                <span className="w-20 text-[#6B6B6B]">{trace.model}</span>
                <span className="w-14 text-right text-[#9A9A9A]">{trace.duration}</span>
                <span className={cn("flex items-center gap-1.5", trace.statusColor)}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  {trace.status}
                </span>
                <span className="ml-auto text-[#6B6B6B]">{trace.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-3">
          <div className="mb-2.5 flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-xs font-medium text-[#F5F5F5]">Execution Replay</span>
            <span className="font-mono text-[10px] text-[#6B6B6B]">tr_01j8x2a9b4</span>
          </div>
          <div className="space-y-0">
            {timelineSteps.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("mt-1.5 h-2 w-2 rounded-full border", step.color)} />
                  {i < timelineSteps.length - 1 && (
                    <div className="h-8 w-px bg-white/[0.10]" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between">
                    <span className={cn("font-mono text-xs font-medium", step.label === "retry" ? "text-[#BBBBBB]" : step.label === "success" ? "text-[#9A9A9A]" : "text-[#F5F5F5]")}>
                      {step.label}
                    </span>
                    <span className="font-mono text-[10px] text-[#6B6B6B]">{step.time}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-[#6B6B6B]">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log Stream Panel */}
        <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-3">
          <div className="mb-2.5 border-b border-white/[0.06] pb-2">
            <span className="text-xs font-medium text-[#F5F5F5]">Log Stream</span>
          </div>
          <div className="space-y-1">
            {logLines.map((log, i) => (
              <div key={i} className="flex items-start gap-2 font-mono text-[11px] leading-relaxed">
                <span className="shrink-0 text-[#6B6B6B]">{log.time}</span>
                <span className={cn("shrink-0 font-medium", log.levelColor)}>
                  [{log.level}]
                </span>
                <span className="truncate text-[#9A9A9A]">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductDemo() {
  const [activeDemo, setActiveDemo] = useState("cli");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const currentVideo = demoVideos.find((v) => v.value === activeDemo)!;
  const videoRef = useRef<HTMLDivElement>(null);

  const handleWatchDemo = () => {
    setVideoLoaded(true);
    videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <motion.section
      id="demo"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65 }}
      className="relative border-b border-white/[0.06]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <span className="inline-block rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[#9A9A9A]">
              Product Demo
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#F5F5F5] sm:text-4xl md:text-5xl">
              Watch TraceLLM Trace Real LLM Workflows
            </h2>
            <p className="mt-4 text-base leading-7 text-[#9A9A9A] sm:text-lg">
              Replay executions, inspect retries, monitor latency, and trace agent execution paths in realtime.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleWatchDemo}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.12] bg-transparent px-6 text-sm font-medium text-[#F5F5F5] transition-colors hover:bg-white/[0.05]"
              >
                <Play className="size-4" />
                Watch Demo
              </button>
              <a
                href="https://github.com/avikcodes/traceLLM"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-transparent px-6 text-sm font-medium text-[#9A9A9A] transition-colors hover:border-white/[0.15] hover:text-[#F5F5F5]"
              >
                <GithubMark className="size-4" />
                View GitHub
              </a>
            </div>
          </div>

          <div ref={videoRef} className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0B0B] shadow-lg shadow-black/40"
            >
              <div className="pointer-events-none absolute -inset-[1px] rounded-xl bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {videoLoaded ? (
                <iframe
                  key={currentVideo.value}
                  src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&mute=1&loop=1&playlist=${currentVideo.videoId}&modestbranding=1&rel=0&controls=0`}
                  className="absolute inset-0 size-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : (
                <button
                  onClick={() => setVideoLoaded(true)}
                  className="relative flex size-full items-center justify-center bg-gradient-to-br from-[#111111] via-[#0B0B0B] to-[#111111]"
                >
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(rgba(124,92,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.1) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                  />

                  <span className="absolute bottom-5 left-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#6B6B6B]">
                    {currentVideo.label}
                  </span>

                  <div className="flex size-16 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.10] backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-white/[0.20] group-hover:bg-white/[0.15]">
                    <Play className="ml-0.5 size-7 text-[#9A9A9A]" />
                  </div>

                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/[0.05]" />
                </button>
              )}
            </motion.div>

            <div className="flex gap-2">
              {demoVideos.map((v) => (
                <button
                  key={v.value}
                  onClick={() => {
                    setActiveDemo(v.value);
                    setVideoLoaded(false);
                  }}
                  className={cn(
                    "rounded-lg border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-all",
                    activeDemo === v.value
                      ? "border-white/[0.15] bg-white/[0.10] text-[#9A9A9A]"
                      : "border-white/[0.06] bg-transparent text-[#6B6B6B] hover:border-white/[0.12] hover:text-[#9A9A9A]"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-[#050505] text-[#F5F5F5] noise-bg">
      {/* Subtle radial glow */}
      <div className="pointer-events-none fixed inset-0 radial-glow" />

      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 grid-bg-faded" />

      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#050505]/90 backdrop-blur-sm"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#9A9A9A]">
              <g stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="256" cy="256" r="188"/>
                <path d="M183 203C211 173 242 170 272 146C288 133 312 132 330 141C370 162 389 203 385 247C382 284 393 311 421 334"/>
                <path d="M183 203C166 214 154 232 151 255C147 287 172 307 210 307C246 307 271 296 290 279"/>
                <path d="M220 307C249 315 280 313 307 308"/>
                <path d="M299 282C303 316 290 344 271 374C255 400 249 423 256 444"/>
                <path d="M225 188L274 171"/>
                <path d="M304 195C316 195 325 204 325 216C325 228 316 237 304 237C292 237 283 228 283 216C283 204 292 195 304 195Z" fill="currentColor" stroke="none"/>
                <path d="M199 244L186 257"/>
              </g>
            </svg>
            <span className="text-sm font-semibold tracking-wider text-[#F5F5F5]">TraceLLM</span>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium text-[#9A9A9A]">
            <a href="#features" className="transition-colors hover:text-[#F5F5F5]">Features</a>
            <a href="#cli-dashboard" className="transition-colors hover:text-[#F5F5F5]">CLI</a>
            <a href="#replay" className="transition-colors hover:text-[#F5F5F5]">Replay</a>
            <a
              href="https://github.com/avikcodes/traceLLM"
              target="_blank"
              rel="noreferrer"
              className="text-[#9A9A9A] transition-colors hover:text-[#F5F5F5]"
            >
              <GithubMark className="size-5" />
            </a>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.65 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.05] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[#9A9A9A]">
                Observability Control Plane
              </span>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-[#F5F5F5] sm:text-6xl lg:text-7xl">
                Understand Every LLM Call.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#9A9A9A] sm:text-xl">
                Trace prompts, latency, token usage, retries, tool calls, and execution
                paths in realtime.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#install"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.12] bg-white px-5 text-sm font-medium text-[#050505] transition-all hover:bg-[#F5F5F5]"
                >
                  <Terminal className="size-4" />
                  Install CLI
                </a>
                <a
                  href="https://github.com/avikcodes/traceLLM"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-transparent px-5 text-sm font-medium text-[#9A9A9A] transition-colors hover:border-white/[0.15] hover:text-[#F5F5F5]"
                >
                  <GithubMark className="size-4" />
                  GitHub
                </a>
                <a
                  href="#features"
                  className="inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#F5F5F5]"
                >
                  Docs
                  <ArrowRight className="size-3.5" />
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <StatBlock label="Telemetry Spec" value="OpenTelemetry" />
                <StatBlock label="Ingestion Mode" value="SDK + API" />
                <StatBlock label="Storage Backend" value="ClickHouse" />
              </div>
            </motion.div>

            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section id="install" className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-block rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[#9A9A9A]">
              Get Started
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#F5F5F5] sm:text-4xl">
              Start tracing in under a minute
            </h2>
            <p className="mt-4 text-base leading-7 text-[#9A9A9A]">
              Install, start, and watch traces stream into your local dashboard. No signup, no cloud, no API key.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative mx-auto mt-10 max-w-xl"
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0B0B] shadow-lg shadow-black/40">
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#111111] px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F5F5F5]/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.10]" />
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B]">Terminal</span>
              </div>
              <div className="space-y-3 px-5 py-5">
                <div className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3 font-mono text-sm text-[#F5F5F5]">
                  <span className="text-[#6B6B6B]">$ </span>pip install tracellm
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/[0.10]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">then</span>
                  <div className="h-px flex-1 bg-white/[0.10]" />
                </div>
                <div className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3 font-mono text-sm text-[#F5F5F5]">
                  <span className="text-[#6B6B6B]">$ </span>tracellm start
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.05] px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-white/[0.15]" />
                  <span className="font-mono text-xs text-[#9A9A9A]/90">Dashboard opens at http://localhost:3000 — traces stream in automatically</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ProductDemo />

      {/* Features */}
      <section id="features" className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
          <SectionHeading
            eyebrow="Capabilities"
            title="Built Like Developer Tooling, Not a Marketing Layer."
            description="Every surface is tuned for signal density, incident clarity, and production workflows."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                >
                  <div className="group h-full rounded-xl border border-white/[0.08] bg-[#111111] p-5 transition-colors hover:border-white/[0.12]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-[#9A9A9A]">
                      <Icon className="size-4.5" />
                    </div>
                    <h3 className="mt-4 text-base font-medium text-[#F5F5F5]">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#9A9A9A]">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLI + Dashboard */}
      <section id="cli-dashboard" className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
          <SectionHeading
            eyebrow="Workflow"
            title="Operate From the Terminal. Investigate in the Dashboard."
            description="Local tracing stays terse and scriptable. Shared visibility stays visual and incident-ready."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* CLI */}
            <div className="rounded-xl border border-white/[0.08] bg-[#111111] p-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">CLI Workflow</span>
                <Terminal className="size-4 text-[#9A9A9A]" />
              </div>
              <div className="mt-4 space-y-2">
                {cliCommands.map((line, i) => (
                  <div
                    key={line}
                    className={cn(
                      "rounded-lg border px-3.5 py-2.5 font-mono text-sm",
                      i === 2
                        ? "border-white/[0.12] bg-white/[0.08] text-[#F5F5F5]"
                        : "border-white/[0.06] bg-[#0B0B0B] text-[#9A9A9A]"
                    )}
                  >
                    {line}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B]">
                The shell remains the source of truth for local runs, CI smoke tests, and
                low-friction debugging before reaching shared environments.
              </p>
            </div>

            {/* Dashboard */}
            <div className="rounded-xl border border-white/[0.08] bg-[#111111] p-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">Dashboard Workflow</span>
                <LayoutDashboard className="size-4 text-[#9A9A9A]" />
              </div>
              <div className="mt-4 rounded-lg border border-white/[0.06] bg-[#0B0B0B] p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">Trace Throughput</p>
                    <p className="mt-1.5 text-lg font-semibold text-[#F5F5F5]">42.8K</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#9A9A9A]/80">+18.2% / hour</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">P95 Latency</p>
                    <p className="mt-1.5 text-lg font-semibold text-[#F5F5F5]">812ms</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#9A9A9A]/80">Down 94ms</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">Tool Success</p>
                    <p className="mt-1.5 text-lg font-semibold text-[#F5F5F5]">99.21%</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#6B6B6B]">2 alerts muted</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">Retry Ratio</p>
                    <p className="mt-1.5 text-lg font-semibold text-[#F5F5F5]">4.7%</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#BBBBBB]/80">3 flows regressing</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B]">
                The dashboard turns raw traces into shared operational context across AI,
                platform, and incident response teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Section */}
      <section className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
          <SectionHeading
            eyebrow="Live Terminal"
            title="Trace From the Shell. Watch It Land Across the Stack."
            description="The terminal stays first-class, while the observability surface stays calm, legible, and operational."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
            transition={{ duration: 0.65 }}
            className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0B0B]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#111111] px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F5F5F5]/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.10]" />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                <Terminal className="size-3.5 text-[#9A9A9A]" />
                TraceLLM CLI Session
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4 px-6 py-6">
                <TypingCommand />
                <div className="space-y-2.5 font-mono text-sm text-[#9A9A9A]">
                  {["prompt captured", "token usage tracked", "latency measured", "replay generated"].map((line, index) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="size-4 text-[#9A9A9A]/60" />
                      <span>{line}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-l border-white/[0.06] bg-[#111111]/50 px-6 py-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                  websocket relay
                </p>
                <div className="mt-4 space-y-2.5">
                  {logLines.map((log, index) => (
                    <motion.div
                      key={`${log.level}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="rounded-lg border border-white/[0.06] bg-[#0B0B0B] px-3.5 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className={cn("font-mono text-xs", log.levelColor)}>{log.level}</span>
                        <span className="font-mono text-[10px] text-[#6B6B6B]">{log.time}</span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-[#9A9A9A]">{log.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Replay */}
      <section id="replay" className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
          <SectionHeading
            eyebrow="Replay Viewer"
            title="Debug Failures As a Sequence, Not a Guess."
            description="The replay surface keeps state changes legible, emphasizing chronology, failure markers, and recovery paths."
          />

          <div className="mt-12 rounded-xl border border-white/[0.08] bg-[#0B0B0B] p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              {/* Summary */}
              <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                  incident summary
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-[#0B0B0B] p-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#9A9A9A]" />
                    <div>
                      <p className="text-sm font-medium text-[#F5F5F5]">Latency spike detected</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#6B6B6B]">
                        Completion crossed the p95 threshold after a retriever payload expansion.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-[#0B0B0B] p-3">
                    <Radio className="mt-0.5 size-4 shrink-0 text-[#9A9A9A]" />
                    <div>
                      <p className="text-sm font-medium text-[#F5F5F5]">Replay restored context</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#6B6B6B]">
                        Engineers can reproduce the exact sequence with prompts, tool inputs and branches attached.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-lg border border-white/[0.06] bg-[#111111] p-4">
                <div className="space-y-1">
                  {timelineSteps.map((step, index) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.07 }}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "mt-1 flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-mono",
                            step.label === "retry" ? "border-white/[0.15] bg-white/[0.08] text-[#BBBBBB]" :
                            step.label === "success" ? "border-white/[0.12] bg-white/[0.08] text-[#9A9A9A]" :
                            "border-white/[0.12] bg-white/[0.08] text-[#9A9A9A]"
                          )}
                        >
                          {index + 1}
                        </span>
                        {index < timelineSteps.length - 1 ? (
                          <div className="my-1.5 h-10 w-px bg-white/[0.10]" />
                        ) : null}
                      </div>
                      <div className="flex-1 rounded-lg border border-white/[0.06] bg-[#0B0B0B] px-3.5 py-2.5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className={cn(
                              "text-sm font-medium",
                              step.label === "retry" ? "text-[#BBBBBB]" :
                              step.label === "success" ? "text-[#9A9A9A]" :
                              "text-[#F5F5F5]"
                            )}>
                              {step.label}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#6B6B6B]">
                              {step.detail.substring(0, 40)}
                            </p>
                          </div>
                          <span className={cn(
                            "w-fit rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]",
                            step.label === "retry" ? "border border-white/[0.12] bg-white/[0.08] text-[#BBBBBB]" :
                            step.label === "success" ? "border border-white/[0.10] bg-white/[0.08] text-[#9A9A9A]" :
                            "border border-white/[0.10] bg-white/[0.08] text-[#9A9A9A]"
                          )}>
                            {step.label === "retry" ? "warning" : step.label === "success" ? "resolved" : "active"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section id="opensource" className="relative border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0B0B] px-6 py-10 sm:px-10 sm:py-12"
          >
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-block rounded-full border border-white/[0.10] bg-white/[0.05] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-[#9A9A9A]">
                  Open Source
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#F5F5F5] sm:text-5xl">
                  Built in public for teams who want serious observability around LLM systems.
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#9A9A9A]">
                  Follow the roadmap, shape the SDK, contribute integrations, and help define
                  a calmer standard for production AI tracing.
                </p>
              </div>

              <GitHubStats />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/[0.06] px-6 py-6 text-sm text-[#6B6B6B] sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-medium text-[#F5F5F5]">TraceLLM</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B]">
              LLM observability infrastructure
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {[
              { label: "Docs", href: "#" },
              { label: "Replay", href: "#" },
              { label: "CLI", href: "#" },
              { label: "License", href: "#" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-1 text-sm transition-colors hover:text-[#F5F5F5]">
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="https://github.com/avikcodes/traceLLM"
            target="_blank"
            rel="noreferrer"
            className="text-[#6B6B6B] transition-colors hover:text-[#F5F5F5]"
          >
            <GithubMark className="size-5" />
          </a>
        </div>
      </footer>
    </main>
  );
}
