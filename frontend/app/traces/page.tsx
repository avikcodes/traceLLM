"use client";

import { useCallback, useDeferredValue, useState } from "react";
import { ArrowLeft, Copy, Download, FileText } from "lucide-react";

import { useRealtimeTrace, useRealtimeTraces } from "@/hooks/use-observability-data";
import { StepTimeline } from "@/components/console/step-timeline";
import { TraceInspector } from "@/components/console/trace-inspector";
import { downloadTracesAsJson, downloadTracesAsMarkdown, formatDuration, formatFullTimestamp, formatTimestamp, formatTraceForClipboard } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TraceRecord, TraceStep } from "@/lib/types";

function TraceDetail({ trace }: { trace: TraceRecord }) {
  const { trace: liveTrace } = useRealtimeTrace(trace.trace_id);
  const current = liveTrace ?? trace;
  const [selectedStep, setSelectedStep] = useState<TraceStep | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formatTraceForClipboard(current));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [current]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Summary bar */}
      <div className="card px-4 py-3 mb-4 flex items-center gap-6 text-sm">
        <span className="text-muted">Trace</span>
        <span className="font-mono text-foreground text-xs">{current.trace_id}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Model</span>
        <span className="text-foreground font-medium">{current.model_name ?? "—"}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => downloadTracesAsMarkdown([current], `trace_${current.trace_id}.md`)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <FileText className="size-3.5" />
            Export MD
          </button>
          <button
            onClick={() => downloadTracesAsJson([current], `trace_${current.trace_id}.json`)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Download className="size-3.5" />
            Export JSON
          </button>
          <span className="text-muted/30">|</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Copy className="size-3.5" />
            {copied ? "Trace copied" : "Copy Trace"}
          </button>
          {copied && (
            <span className="text-xs text-accent animate-pulse">✓</span>
          )}
        </div>
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

type StatusFilter = "all" | "success" | "failed";

export default function TracesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { items, loading } = useRealtimeTraces({ limit: 100 });
  const deferredSearch = useDeferredValue(search);

  const filtered = items.filter((t) => {
    const q = deferredSearch.toLowerCase();
    if (q) {
      const matchesSearch =
        t.trace_id.toLowerCase().includes(q) ||
        t.prompt.toLowerCase().includes(q) ||
        (t.model_name ?? "").toLowerCase().includes(q) ||
        (t.failure_reason ?? "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (statusFilter === "success" && t.status !== "success") return false;
    if (statusFilter === "failed" && t.status !== "failed") return false;
    return true;
  });

  const selectedTrace = selectedTraceId ? items.find((t) => t.trace_id === selectedTraceId) ?? null : null;

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.trace_id)));
    }
  };

  const selectedTraces = items.filter((t) => selectedIds.has(t.trace_id));

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
            placeholder="Search traces..."
            className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent/50 transition-colors placeholder:text-muted/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["all", "success", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md transition-colors",
                statusFilter === f
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : f === "success" ? "Success" : "Failed"}
            </button>
          ))}
        </div>
        {selectedIds.size > 0 && (
          <>
            <button
              onClick={() => downloadTracesAsMarkdown(selectedTraces, "selected_traces.md")}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <FileText className="size-3.5" />
              MD ({selectedIds.size})
            </button>
            <button
              onClick={() => downloadTracesAsJson(selectedTraces, "selected_traces.json")}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <Download className="size-3.5" />
              JSON ({selectedIds.size})
            </button>
          </>
        )}
        <button
          onClick={() => downloadTracesAsMarkdown(filtered, "all_traces.md")}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <FileText className="size-3.5" />
          All MD
        </button>
        <button
          onClick={() => downloadTracesAsJson(filtered, "all_traces.json")}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <Download className="size-3.5" />
          All JSON
        </button>
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
                  <th className="w-10 px-2 py-3">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={selectAll}
                      className="accent-accent"
                    />
                  </th>
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
                {filtered.map((trace) => {
                  const isChecked = selectedIds.has(trace.trace_id);
                  return (
                    <tr
                      key={trace.trace_id}
                      className={cn(
                        "border-b border-border/50 transition-colors cursor-pointer",
                        isChecked ? "bg-accent/5" : "hover:bg-surface-hover"
                      )}
                    >
                      <td className="px-2 py-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleId(trace.trace_id)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-accent"
                        />
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
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
                      <td
                        className="px-4 py-3"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        <span className="text-xs font-mono text-muted">{trace.trace_id.slice(0, 12)}</span>
                      </td>
                      <td
                        className="px-4 py-3 text-foreground max-w-xs truncate"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        {trace.prompt}
                      </td>
                      <td
                        className="px-4 py-3 text-muted"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        {trace.model_name ?? "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-right text-foreground"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        {formatDuration(trace.latency)}
                      </td>
                      <td
                        className="px-4 py-3 text-right text-foreground"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        {trace.token_count.toLocaleString()}
                      </td>
                      <td
                        className="px-4 py-3 text-right text-muted"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        {trace.retry_count > 0 ? trace.retry_count : "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-muted whitespace-nowrap"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        {formatTimestamp(trace.created_at)}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-muted"
                        onClick={() => setSelectedTraceId(trace.trace_id)}
                      >
                        View →
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-sm text-muted">
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
