"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { useRealtimeTraces } from "@/hooks/use-observability-data";
import { formatDuration, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function TracesPage() {
  const [search, setSearch] = useState("");
  const { items, loading } = useRealtimeTraces({ limit: 100 });
  const deferredSearch = useDeferredValue(search);

  const filtered = deferredSearch
    ? items.filter(
        (t) =>
          t.trace_id.toLowerCase().includes(deferredSearch.toLowerCase()) ||
          t.prompt.toLowerCase().includes(deferredSearch.toLowerCase()) ||
          (t.model_name ?? "").toLowerCase().includes(deferredSearch.toLowerCase())
      )
    : items;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-sm font-semibold text-foreground">Traces</h1>
        <div className="flex-1 max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, prompt, model..."
            className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent/50 transition-colors placeholder:text-muted/50"
          />
        </div>
        <span className="text-sm text-muted">{filtered.length} results</span>
      </div>

      {loading ? (
        <div className="card flex-1 flex items-center justify-center">
          <div className="text-sm text-muted">Loading...</div>
        </div>
      ) : (
        <div className="card flex-1 overflow-hidden">
          <div className="overflow-x-auto h-full">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Trace ID</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Prompt</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Model</th>
                  <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider">Latency</th>
                  <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider">Tokens</th>
                  <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider">Retries</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((trace) => (
                  <tr
                    key={trace.trace_id}
                    className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs font-medium",
                        trace.status === "success" ? "text-accent" :
                        trace.status === "warning" ? "text-warning" :
                        trace.status === "failed" ? "text-error" : "text-muted"
                      )}>
                        {trace.status === "success" ? "Success" :
                         trace.status === "warning" ? "Warning" :
                         trace.status === "failed" ? "Failed" : trace.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted">{trace.trace_id.slice(0, 12)}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-xs truncate">
                      {trace.prompt}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {trace.model_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatDuration(trace.latency)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {trace.token_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {trace.retry_count > 0 ? trace.retry_count : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {formatTimestamp(trace.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/traces/${trace.trace_id}`}
                        className="text-sm text-muted hover:text-accent transition-colors no-underline font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-sm text-muted">
                      No traces found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
