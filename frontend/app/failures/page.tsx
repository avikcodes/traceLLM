"use client";

import Link from "next/link";

import { useRealtimeFailures } from "@/hooks/use-observability-data";
import { formatDuration, formatTimestamp } from "@/lib/format";

export default function FailuresPage() {
  const { data } = useRealtimeFailures(50);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted">Loading...</div>
      </div>
    );
  }

  const sections = [
    { title: "Failed Traces", items: data.failed_traces, label: "Failed" as const },
    { title: "Retries", items: data.retries, label: "Retry" as const },
    { title: "Slow Requests", items: data.slow_requests, label: "Slow" as const },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-sm font-semibold text-foreground">Failures</h1>

      {/* Summary */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-error font-semibold">{data.totals.failed_traces}</span>
          <span className="text-muted">Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-warning font-semibold">{data.totals.retries}</span>
          <span className="text-muted">Retries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-accent font-semibold">{data.totals.slow_requests}</span>
          <span className="text-muted">Slow</span>
        </div>
      </div>

      {/* Three panels */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {sections.map((section) => (
          <div key={section.title} className="card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">{section.title}</span>
              <span className="text-xs text-muted ml-2">{section.items.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {section.items.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted">None</div>
              ) : (
                section.items.map((trace) => (
                  <Link
                    key={trace.trace_id}
                    href={`/traces/${trace.trace_id}`}
                    className="block px-4 py-3 border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors no-underline"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-error">{section.label}</span>
                      <span className="text-xs font-mono text-muted">{trace.trace_id.slice(0, 8)}</span>
                    </div>
                    <p className="text-sm text-foreground truncate">{trace.prompt.slice(0, 60)}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                      <span>{formatDuration(trace.latency)}</span>
                      <span>·</span>
                      <span>{formatTimestamp(trace.created_at)}</span>
                      {trace.retry_count > 0 && (
                        <>
                          <span>·</span>
                          <span>{trace.retry_count}× retry</span>
                        </>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
