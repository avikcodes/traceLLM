"use client";

import { cn } from "@/lib/utils";
import { formatDuration, formatTimestamp } from "@/lib/format";
import { TraceRecord } from "@/lib/types";

export function TraceList({
  traces,
  selectedTrace,
  onSelect,
  loading,
}: {
  traces: TraceRecord[];
  selectedTrace: TraceRecord | null;
  onSelect: (trace: TraceRecord) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted">
        <span className="text-muted/50">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">Traces</span>
        <span className="text-xs text-muted">{traces.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {traces.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted">
            No traces yet
          </div>
        ) : (
          traces.map((trace) => {
            const isSelected = trace.trace_id === selectedTrace?.trace_id;
            return (
              <div
                key={trace.trace_id}
                className={cn(
                  "px-4 py-3 border-b border-border/50 cursor-pointer transition-colors",
                  isSelected
                    ? "bg-accent-subtle border-l-2 border-l-accent"
                    : "hover:bg-surface-hover border-l-2 border-l-transparent"
                )}
                onClick={() => onSelect(trace)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {trace.prompt}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted">{trace.model_name ?? "unknown"}</span>
                      <span className="text-muted/30">·</span>
                      <span className="text-xs text-muted">{formatDuration(trace.latency)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn(
                      "text-[11px] font-medium",
                      trace.status === "success" ? "text-accent" :
                      trace.status === "warning" ? "text-warning" :
                      trace.status === "failed" ? "text-error" : "text-muted"
                    )}>
                      {trace.status === "success" ? "Success" :
                       trace.status === "warning" ? "Warning" :
                       trace.status === "failed" ? "Failed" : trace.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-muted/60">{formatTimestamp(trace.created_at)}</span>
                  {trace.retry_count > 0 && (
                    <>
                      <span className="text-muted/30">·</span>
                      <span className="text-[11px] text-muted/60">{trace.retry_count} retries</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
