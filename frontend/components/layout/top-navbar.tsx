"use client";

import { Bell, Command, Search, Wifi } from "lucide-react";
import { usePathname } from "next/navigation";

import { useObservabilityStream } from "@/components/providers/observability-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Observability Dashboard",
    subtitle: "Track LLM performance, cost, and execution health in real time.",
  },
  "/traces": {
    title: "Trace Explorer",
    subtitle: "Inspect prompts, responses, token usage, and trace outcomes.",
  },
  "/failures": {
    title: "Failure Tracking",
    subtitle: "Surface failed traces, retries, and slow requests before they spread.",
  },
  "/live-logs": {
    title: "Live Logs",
    subtitle: "Watch websocket events and streaming trace activity as they land.",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Review volume, latency, and token patterns across the day.",
  },
  "/settings": {
    title: "Workspace Settings",
    subtitle: "Tune environments, alerts, API keys, and observability defaults.",
  },
};

export function TopNavbar() {
  const pathname = usePathname();
  const {
    connectionState,
    projects,
    selectedEnvironment,
    selectedProjectId,
    setSelectedEnvironment,
    setSelectedProjectId,
    socketUrl,
  } = useObservabilityStream();
  const current =
    pageMeta[pathname] ??
    (pathname.startsWith("/traces/")
      ? {
          title: "Trace Detail",
          subtitle: "Drill into prompt execution, timeline events, and tool behavior.",
        }
      : pageMeta["/"]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-2xl md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="pl-14 md:pl-0">
          <div className="flex items-center gap-3">
            <p className="font-heading text-2xl font-semibold tracking-tight text-white">
              {current.title}
            </p>
            <Badge variant="neutral">
              {selectedProjectId === "all"
                ? "All projects"
                : projects.find((project) => project.project_id === selectedProjectId)?.name ?? selectedProjectId}
            </Badge>
            <Badge
              variant={
                selectedEnvironment === "production"
                  ? "failed"
                  : selectedEnvironment === "staging"
                    ? "warning"
                    : "info"
              }
            >
              {selectedEnvironment}
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">{current.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="bg-transparent text-sm text-white outline-none"
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select
              value={selectedEnvironment}
              onChange={(event) => setSelectedEnvironment(event.target.value)}
              className="bg-transparent text-sm text-white outline-none"
            >
              <option value="all">All envs</option>
              <option value="development">development</option>
              <option value="staging">staging</option>
              <option value="production">production</option>
            </select>
          </div>
          <div className="hidden min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-zinc-400 shadow-inner md:flex">
            <Search className="size-4 text-zinc-500" />
            <span>Search traces, prompts, agents, models...</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-500">
              <Command className="size-3" />K
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/18 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            <Wifi className="size-4" />
            {connectionState} - {socketUrl.replace(/^wss?:\/\//, "")}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="border-white/10 bg-white/6 text-zinc-100 hover:bg-white/10"
          >
            <Bell />
          </Button>
        </div>
      </div>
    </header>
  );
}
