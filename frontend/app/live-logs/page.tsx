"use client";

import { LiveLogsPanel } from "@/components/logs/live-logs-panel";
import { useObservabilityStream } from "@/components/providers/observability-provider";

export default function LiveLogsPage() {
  const { socketUrl } = useObservabilityStream();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-cyan-400/12 to-blue-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Streaming</p>
          <p className="mt-3 max-w-xl font-heading text-4xl leading-tight text-white">
            Realtime websocket telemetry from the live observability backend.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
            The panel connects to <code>{socketUrl}</code>, surfaces gateway activity, and
            appends new trace events as soon as they are persisted.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">WebSocket Notes</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
            <li>The client opens a live socket on page load.</li>
            <li>Gateway connection events are appended instantly.</li>
            <li>New traces stream into charts, lists, and replay views automatically.</li>
          </ul>
        </div>
      </section>

      <LiveLogsPanel />
    </div>
  );
}
