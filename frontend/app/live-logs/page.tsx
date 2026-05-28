"use client";

import { TraceStream } from "@/components/console/trace-stream";
import { useObservabilityStream } from "@/components/providers/observability-provider";

export default function LiveLogsPage() {
  const { connectionState, events, socketUrl } = useObservabilityStream();

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-foreground">Live Logs</h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${
              connectionState === "open" ? "bg-accent" : "bg-muted"
            }`} />
            <span className="capitalize">{connectionState}</span>
          </div>
          <span className="text-muted/30">|</span>
          <span>{events.length} events</span>
          <span className="text-muted/30">|</span>
          <span className="text-xs font-mono text-muted/70">{socketUrl}</span>
        </div>
      </div>

      <div className="flex-1">
        <TraceStream />
      </div>
    </div>
  );
}
