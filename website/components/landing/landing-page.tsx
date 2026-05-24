"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  Braces,
  Cable,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Command,
  Cpu,
  Database,
  GitBranch,
  Gauge,
  LayoutDashboard,
  Orbit,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const featureCards = [
  { icon: ScanSearch, title: "Prompt Tracing", description: "Capture prompts, parameters, outputs, and branch context with infrastructure-grade clarity." },
  { icon: Orbit, title: "Agent Replay", description: "Step through every agent decision with tool state, retries, and output deltas attached." },
  { icon: ShieldAlert, title: "Failure Detection", description: "Surface regressions, malformed responses, and latency breaches before they hit production workflows." },
  { icon: Gauge, title: "Token Analytics", description: "Measure token volume, burn patterns, and model efficiency across environments and teams." },
  { icon: Cable, title: "Tool Call Tracking", description: "Inspect every tool invocation with inputs, outputs, timing, and terminal-first logs." },
  { icon: Webhook, title: "Realtime WebSockets", description: "Stream live execution state into shared observability surfaces without waiting for refresh cycles." },
  { icon: GitBranch, title: "Execution Timelines", description: "Follow the full graph from request start to final response with every branch preserved." },
  { icon: TimerReset, title: "Retry Detection", description: "Identify hidden retry loops, fallback churn, and orchestration instability early." },
  { icon: Braces, title: "Export Reports", description: "Move traces into incidents, reviews, and CI pipelines with structured export artifacts." },
  { icon: Command, title: "CLI + Dashboard Workflow", description: "Work from the shell by default and pivot into deeper visual analysis only when needed." },
];

const architectureSteps = [
  { title: "Developer App", subtitle: "Agents, chains, APIs", icon: Bot },
  { title: "TraceLLM SDK", subtitle: "Hooks, spans, events", icon: Cpu },
  { title: "FastAPI Backend", subtitle: "Ingest and normalize", icon: Waves },
  { title: "MongoDB", subtitle: "Trace persistence", icon: Database },
  { title: "Realtime Dashboard", subtitle: "Replay and analytics", icon: LayoutDashboard },
];

const replaySteps = [
  { label: "Agent Start", status: "active", meta: "session:init · 00ms" },
  { label: "Retriever Tool", status: "success", meta: "vector.search · 124ms" },
  { label: "LLM Call", status: "active", meta: "gpt-4.1 · 1.8s · 1.9k tokens" },
  { label: "Latency Spike", status: "warning", meta: "p95 breach · +620ms" },
  { label: "Retry", status: "danger", meta: "retry#1 · structured output mismatch" },
  { label: "Success", status: "success", meta: "response:ready · 2.6s total" },
];

const dashboardMetrics = [
  { label: "Trace Throughput", value: "42.8K", detail: "+18.2% / hour" },
  { label: "P95 Latency", value: "812ms", detail: "Down 94ms" },
  { label: "Tool Success", value: "99.21%", detail: "2 alerts muted" },
  { label: "Retry Ratio", value: "4.7%", detail: "3 flows regressing" },
];

const terminalLogLines = [
  "prompt captured",
  "token usage tracked",
  "latency measured",
  "replay generated",
];

const liveEvents = [
  { kind: "trace.open", at: "00:00:03", text: "agent/customer-support-runner" },
  { kind: "ws.push", at: "00:00:04", text: "span:retriever.query.documents" },
  { kind: "tool.exec", at: "00:00:05", text: "tool/vector_search returned 12 chunks" },
  { kind: "latency.p95", at: "00:00:06", text: "completion latency crossed 800ms threshold" },
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
      <Badge className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-neutral-300">
        {eyebrow}
      </Badge>
      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-neutral-400 sm:text-lg">
        {description}
      </p>
    </div>
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
    <div className="font-mono text-sm text-neutral-100 sm:text-base">
      {visibleText}
      <span className="ml-1 inline-block h-5 w-2 translate-y-1 animate-pulse bg-white/80" />
    </div>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-300">
      {children}
    </span>
  );
}

function HeroDashboard() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative mx-auto w-full max-w-2xl"
    >
      <div className="panel-glow relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-4">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-neutral-400">
              realtime trace control center
            </p>
          </div>
          <StatusBadge>LIVE / WS CONNECTED</StatusBadge>
        </div>

        <div className="relative mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center justify-between text-sm text-white">
                Live Traces
                <span className="font-mono text-xs text-neutral-500">14 active spans</span>
              </CardTitle>
              <CardDescription className="text-neutral-500">
                Prompt activity, tool edges, and retry markers in a single event plane.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {[
                { name: "agent.run", time: "84ms", width: "72%" },
                { name: "tool.retrieve", time: "124ms", width: "48%" },
                { name: "llm.complete", time: "1.82s", width: "90%" },
                { name: "retry.guard", time: "312ms", width: "37%" },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs text-neutral-300">
                    <span>{item.name}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: item.width }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-white/85"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm text-white">
                  <Activity className="size-4 text-neutral-200" />
                  WebSocket Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 font-mono text-[11px] text-neutral-300 sm:text-xs">
                {liveEvents.map((event) => (
                  <div
                    key={`${event.at}-${event.kind}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-black/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-neutral-100">{event.kind}</p>
                      <p className="mt-1 text-neutral-500">{event.text}</p>
                    </div>
                    <span className="text-neutral-600">{event.at}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.03]">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center justify-between text-sm text-white">
                  Latency + Replay
                  <span className="font-mono text-xs text-neutral-500">p95 watch</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/35 p-3">
                  <div className="flex items-end gap-2">
                    {[34, 52, 46, 74, 61, 88, 58, 72].map((height, index) => (
                      <motion.span
                        key={height + index}
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{ duration: 0.7, delay: index * 0.05 }}
                        className={cn("w-full rounded-t-full bg-white/80", index === 5 && "bg-white")}
                      />
                    ))}
                  </div>
                  <p className="mt-3 font-mono text-xs text-neutral-500">Latency histogram</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/35 p-3">
                  <div className="space-y-2">
                    {["agent:start", "tool:retrieve", "llm:call", "retry", "success"].map(
                      (item, index) => (
                        <div key={item} className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-mono text-neutral-200">
                            {index + 1}
                          </span>
                          <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                          <span className="font-mono text-xs text-neutral-300">{item}</span>
                        </div>
                      )
                    )}
                  </div>
                  <p className="mt-3 font-mono text-xs text-neutral-500">Replay execution path</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-neutral-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%)]" />

      <section className="relative border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 sm:px-8 lg:px-10">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-4 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Activity className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.16em] text-white">TraceLLM</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                  open-source observability
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-5 text-sm text-neutral-400">
              <a href="#features" className="transition hover:text-white">Features</a>
              <a href="#architecture" className="transition hover:text-white">Architecture</a>
              <a href="#replay" className="transition hover:text-white">Replay</a>
              <a href="#opensource" className="transition hover:text-white">Open Source</a>
            </nav>
          </motion.header>

          <div className="mt-16 grid items-center gap-14 lg:grid-cols-[0.98fr_1.02fr] lg:gap-14">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.65 }}
              className="relative"
            >
              <Badge className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-300">
                Minimal Observability Control Plane
              </Badge>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.075em] text-white sm:text-6xl lg:text-7xl">
                Understand <span className="text-gradient">Every LLM Call.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400 sm:text-xl">
                Trace prompts, latency, token usage, retries, tool calls, and execution
                paths in realtime.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full border border-white/12 bg-white text-black hover:bg-neutral-200"
                >
                  <a href="https://github.com/" target="_blank" rel="noreferrer">
                    <GithubMark className="size-4" />
                    Star on GitHub
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-white/12 bg-white/[0.03] px-6 text-white hover:bg-white/[0.07]"
                >
                  <a href="#cli-dashboard">
                    Read Docs
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <StatBlock label="Live traces" value="12.4M/day" />
                <StatBlock label="p95 updates" value="<250ms" />
                <StatBlock label="Terminal-first" value="SDK + CLI" />
              </div>
            </motion.div>

            <HeroDashboard />
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Live Terminal"
            title="Trace From The Shell. Watch It Land Across The Stack."
            description="The terminal stays first-class, while the observability surface stays calm, legible, and operational."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeInUp}
            transition={{ duration: 0.65 }}
            className="panel-glow relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#090909]"
          >
            <div className="terminal-scanlines absolute inset-0 opacity-20" />
            <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-white/80" />
                <span className="h-3 w-3 rounded-full bg-white/45" />
                <span className="h-3 w-3 rounded-full bg-white/25" />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
                <Terminal className="size-4 text-neutral-300" />
                TraceLLM CLI Session
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
                <TypingCommand />
                <div className="space-y-3 font-mono text-sm text-neutral-300">
                  {terminalLogLines.map((line, index) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="size-4 text-neutral-200" />
                      <span>{line}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-l border-white/8 bg-white/[0.02] px-6 py-6 sm:px-8 sm:py-8">
                <p className="font-mono text-xs uppercase tracking-[0.26em] text-neutral-500">
                  websocket relay
                </p>
                <div className="mt-4 space-y-3">
                  {liveEvents.map((event, index) => (
                    <motion.div
                      key={`${event.kind}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="rounded-2xl border border-white/8 bg-black/35 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-xs text-neutral-100">{event.kind}</span>
                        <span className="font-mono text-[11px] text-neutral-600">{event.at}</span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-400">{event.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Feature Grid"
            title="Built Like Developer Tooling, Not A Marketing Layer."
            description="Every card, panel, and data surface is tuned for signal density, incident clarity, and production workflows."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                  <Card className="group h-full rounded-[1.6rem] border-white/10 bg-white/[0.03] transition duration-300 hover:border-white/20 hover:bg-white/[0.05]">
                    <CardHeader>
                      <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-200 transition duration-300 group-hover:bg-white/[0.08]">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="pt-3 text-xl text-white">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-7 text-neutral-400">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="architecture" className="relative border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Architecture Flow"
            title="Instrument Once. Follow The Signal End To End."
            description="A restrained infra diagram that maps app execution into storage and a shared control surface without ornamental noise."
          />

          <div className="panel-glow relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
            <div className="relative grid gap-6 lg:grid-cols-5">
              {architectureSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === architectureSteps.length - 1;

                return (
                  <div key={step.title} className="relative flex flex-col items-center text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.07 }}
                      className="w-full rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-100">
                        <Icon className="size-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                      <p className="mt-2 text-sm text-neutral-500">{step.subtitle}</p>
                    </motion.div>
                    {!isLast ? (
                      <div className="pointer-events-none hidden lg:block">
                        <div className="absolute left-[calc(100%-4px)] top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-r from-white/35 to-transparent" />
                        <motion.div
                          initial={{ x: 0, opacity: 0.6 }}
                          whileInView={{ x: 34, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop" }}
                          className="absolute left-[calc(100%-6px)] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="cli-dashboard" className="relative border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="CLI + Dashboard"
            title="Operate From The Terminal. Investigate In The Dashboard."
            description="Local tracing stays terse and scriptable. Shared visibility stays visual, searchable, and incident-ready."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[1.8rem] border-white/10 bg-white/[0.03] p-1">
              <div className="rounded-[1.5rem] border border-white/8 bg-black/35 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-[0.26em] text-neutral-500">CLI Workflow</p>
                  <Terminal className="size-4 text-neutral-300" />
                </div>
                <div className="mt-5 space-y-4 font-mono text-sm">
                  {[
                    "$ pip install tracellm",
                    "$ export TRACELLM_API_KEY=sk_live_...",
                    "$ tracellm trace app.py --env prod",
                    "$ tracellm replay trace_01JX8A4",
                  ].map((line, index) => (
                    <div
                      key={line}
                      className={cn(
                        "rounded-2xl border px-4 py-3",
                        index === 2
                          ? "border-white/16 bg-white/[0.08] text-white"
                          : "border-white/8 bg-white/[0.03] text-neutral-300"
                      )}
                    >
                      {line}
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-7 text-neutral-400">
                  The shell remains the source of truth for local runs, CI smoke tests, and
                  low-friction debugging before code reaches a shared environment.
                </p>
              </div>
            </Card>

            <Card className="rounded-[1.8rem] border-white/10 bg-white/[0.03] p-1">
              <div className="rounded-[1.5rem] border border-white/8 bg-black/35 p-6">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-[0.26em] text-neutral-500">
                    Dashboard Workflow
                  </p>
                  <LayoutDashboard className="size-4 text-neutral-300" />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {dashboardMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                      <p className="mt-1 text-sm text-neutral-500">{metric.detail}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-7 text-neutral-400">
                  The dashboard turns raw traces into shared operational context across AI,
                  platform, and incident response teams.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="replay" className="relative border-b border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Replay Viewer"
            title="Debug Failures As A Sequence, Not A Guess."
            description="The replay surface keeps state changes legible, emphasizing chronology, failure markers, and recovery paths."
          />

          <div className="panel-glow mt-12 rounded-[2rem] border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
            <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.26em] text-neutral-500">
                  incident summary
                </p>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <CircleAlert className="mt-0.5 size-4 text-white" />
                    <div>
                      <p className="text-sm font-medium text-white">Latency spike detected</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-400">
                        Completion crossed the p95 threshold after a retriever payload expansion.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <Radio className="mt-0.5 size-4 text-neutral-200" />
                    <div>
                      <p className="text-sm font-medium text-white">Replay restored context</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-400">
                        Engineers can reproduce the exact sequence with prompts, tool inputs,
                        and retry branches attached.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <div className="space-y-4">
                  {replaySteps.map((step, index) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.07 }}
                      className="flex gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "mt-1 flex size-10 items-center justify-center rounded-full border text-xs font-mono",
                            step.status === "success" && "border-white/16 bg-white/[0.08] text-white",
                            step.status === "warning" && "border-white/12 bg-white/[0.05] text-neutral-200",
                            step.status === "danger" && "border-white/10 bg-black text-neutral-200",
                            step.status === "active" && "border-white/14 bg-white/[0.06] text-white"
                          )}
                        >
                          {index + 1}
                        </span>
                        {index < replaySteps.length - 1 ? (
                          <div className="my-2 h-16 w-px bg-gradient-to-b from-white/35 to-white/8" />
                        ) : null}
                      </div>
                      <div className="flex-1 rounded-[1.25rem] border border-white/8 bg-black/30 px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-base font-semibold text-white">{step.label}</p>
                            <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
                              {step.meta}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "w-fit border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em]",
                              step.status === "success" && "border-white/14 bg-white/[0.06] text-white",
                              step.status === "warning" && "border-white/12 bg-white/[0.05] text-neutral-200",
                              step.status === "danger" && "border-white/10 bg-black text-neutral-300",
                              step.status === "active" && "border-white/14 bg-white/[0.06] text-white"
                            )}
                          >
                            {step.status}
                          </Badge>
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

      <section id="opensource" className="relative border-b border-white/8">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="panel-glow relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.03] px-6 py-10 sm:px-10 sm:py-12"
          >
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Badge className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.32em] text-neutral-300">
                  Open Source
                </Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  Built in public for teams who want serious observability around LLM systems.
                </h2>
                <p className="mt-5 text-lg leading-8 text-neutral-400">
                  Follow the roadmap, shape the SDK, contribute integrations, and help define
                  a calmer standard for production AI tracing.
                </p>
              </div>

              <div className="min-w-[280px] rounded-[1.6rem] border border-white/10 bg-black/35 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-neutral-500">
                      GitHub stars
                    </p>
                    <p className="mt-3 text-4xl font-semibold text-white">14.2k</p>
                  </div>
                  <Button
                    asChild
                    className="h-11 rounded-full border border-white/12 bg-white text-black hover:bg-neutral-200"
                  >
                    <a href="https://github.com/" target="_blank" rel="noreferrer">
                      <GithubMark className="size-4" />
                      Star Repo
                    </a>
                  </Button>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex -space-x-3">
                    {["AK", "RM", "JL", "TP", "CN"].map((avatar) => (
                      <div
                        key={avatar}
                        className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-xs font-semibold text-white"
                      >
                        {avatar}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500">180+ contributors watching the roadmap</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-neutral-500 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="font-semibold text-white">TraceLLM</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.22em] text-neutral-600">
              prompt tracing for production ai systems
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {["GitHub", "Docs", "API", "License", "Discord"].map((item) => (
              <a key={item} href="#" className="inline-flex items-center gap-1 transition hover:text-white">
                {item}
                <ChevronRight className="size-3.5" />
              </a>
            ))}
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-600">
            OSS telemetry for LLM infra
          </p>
        </div>
      </footer>
    </main>
  );
}
