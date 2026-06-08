"use client";

import { useDeferredValue, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useRealtimeTrace, useRealtimeTraces } from "@/hooks/use-observability-data";
import { StepTimeline } from "@/components/console/step-timeline";
import { TraceInspector } from "@/components/console/trace-inspector";
import { formatDuration, formatFullTimestamp, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TraceRecord, TraceStep } from "@/lib/types";

function TraceDetail({ trace }: { trace: TraceRecord }) {
  const { trace: liveTrace } = useRealtimeTrace(trace.trace_id);
  const current = liveTrace ?? trace;
  const [selectedStep, setSelectedStep] = useState<TraceStep | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Summary bar */}
      <div className="card px-4 py-3 mb-4 flex items-center gap-6 text-sm">
        <span className="text-muted">Trace</span>
        <span className="font-mono text-foreground text-xs">{current.trace_id}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Model</span>
        <span className="text-foreground font-medium">{current.model_name ?? "—"}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Latency</span>
        <span className="text-foreground font-medium">{formatDuration(current.latency)}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Tokens</span>
        <span className="text-foreground font-medium">{current.token_count.toLocaleString()}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Retries</span>
        <span className="text-foreground font-medium">{current.retry_count}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Steps</span>
        <span className="text-foreground font-medium">{current.steps.length}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">At</span>
        <span className="text-foreground">{formatFullTimestamp(current.created_at)}</span>
      </div>

      {/* Two-panel content */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="card flex-1 overflow-y-auto">
            <StepTimeline
              steps={current.steps}
              activeStep={activeStepIndex}
              onStepSelect={(step, index) => {
                setSelectedStep(step);
                setActiveStepIndex(index);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Prompt</span>
              </div>
              <pre className="p-4 text-sm text-foreground/70 whitespace-pre-wrap overflow-y-auto max-h-40 font-sans leading-relaxed">
                {current.prompt || "∅"}
              </pre>
            </div>
            <div className="card">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Response</span>
              </div>
              <pre className="p-4 text-sm text-foreground/70 whitespace-pre-wrap overflow-y-auto max-h-40 font-sans leading-relaxed">
                {current.response ? current.response.slice(0, 1000) + (current.response.length > 1000 ? "\n…" : "") : "∅"}
              </pre>
            </div>
          </div>
        </div>

        <div className="w-[380px] flex-shrink-0">
          <TraceInspector trace={current} selectedStep={selectedStep} />
        </div>
      </div>
    </div>
  );
}

export default function TracesPage() {
  const [search, setSearch] = useState("");
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
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

  const selectedTrace = selectedTraceId ? items.find((t) => t.trace_id === selectedTraceId) ?? null : null;

  if (selectedTrace) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 pt-4">
          <button
            onClick={() => setSelectedTraceId(null)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Traces
          </button>
        </div>
        <TraceDetail trace={selectedTrace} />
      </div>
    );
  }

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
                    className="border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => setSelectedTraceId(trace.trace_id)}
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
                    <td className="px-4 py-3 text-sm text-muted">
                      View →
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
