"use client";

import { Bell, Command, Search, Wifi } from "lucide-react";
import { usePathname } from "next/navigation";

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
            <Badge variant="neutral">Dark mode</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">{current.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-zinc-400 shadow-inner md:flex">
            <Search className="size-4 text-zinc-500" />
            <span>Search traces, prompts, agents, models...</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-500">
              <Command className="size-3" />K
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/18 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
            <Wifi className="size-4" />
            ws://localhost:8000/ws
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
