"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";
import { useObservabilityStream } from "@/components/providers/observability-provider";
import { LiveLogEvent } from "@/lib/types";

function eventPrefix(kind: LiveLogEvent["status"]) {
  switch (kind) {
    case "failed": return "Failed";
    case "warning": return "Warning";
    case "success": return "Success";
    default: return "Info";
  }
}

export function TraceStream({ compact = false }: { compact?: boolean }) {
  const { events, connectionState } = useObservabilityStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className={cn(
      "flex flex-col h-full rounded-lg overflow-hidden",
      "bg-[#050505] border border-border"
    )}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1"
      >
        {events.length === 0 ? (
          <div className="text-sm text-muted">
            {connectionState === "open" ? "Waiting for events..." : "Connecting..."}
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-2 text-sm leading-relaxed"
            >
              <span className="text-xs text-muted/50 flex-shrink-0 mt-0.5 font-mono">
                {formatTimestamp(event.timestamp)}
              </span>
              <span className={cn(
                "text-xs flex-shrink-0 font-medium mt-0.5",
                event.status === "failed" ? "text-error" :
                event.status === "warning" ? "text-warning" :
                event.status === "success" ? "text-accent" : "text-muted"
              )}>
                [{eventPrefix(event.status)}]
              </span>
              <span className="text-sm text-foreground">
                {event.title}
              </span>
              {event.detail && (
                <span className="text-sm text-muted truncate">
                  — {event.detail}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
