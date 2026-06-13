"use client";

import { useDeferredValue, useState } from "react";
import { Download, FileText } from "lucide-react";

import { TraceList } from "@/components/console/trace-list";
import { StepTimeline } from "@/components/console/step-timeline";
import { TraceInspector } from "@/components/console/trace-inspector";
import { useRealtimeTraces } from "@/hooks/use-observability-data";
import { cn } from "@/lib/utils";
import { TraceRecord, TraceStep } from "@/lib/types";
import { downloadTracesAsJson, downloadTracesAsMarkdown } from "@/lib/format";

type StatusFilter = "all" | "success" | "failed";

export default function ConsolePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { items: traces, loading } = useRealtimeTraces({ limit: 50 });
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [selectedStep, setSelectedStep] = useState<TraceStep | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const deferredSearch = useDeferredValue(search);

  const filtered = traces.filter((t) => {
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

  const latestTrace = filtered[0] ?? null;
  const displayTrace = selectedTrace ?? latestTrace;

  return (
    <div className="flex-1 flex min-h-0">
      {/* Left: Trace List Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-4 py-3 border-b border-border space-y-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search traces..."
            className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent/50 transition-colors placeholder:text-muted/50"
          />
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-1">
              <button
                onClick={() => downloadTracesAsMarkdown(filtered, "all_traces.md")}
                className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                title="Export Markdown"
              >
                <FileText className="size-3" />
                MD
              </button>
              <button
                onClick={() => downloadTracesAsJson(filtered, "all_traces.json")}
                className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                title="Export JSON"
              >
                <Download className="size-3" />
                JSON
              </button>
            </div>
          </div>
        </div>
        <TraceList
          traces={filtered}
          selectedTrace={displayTrace}
          onSelect={(trace) => {
            setSelectedTrace(trace);
            setSelectedStep(null);
            setActiveStepIndex(-1);
          }}
          loading={loading}
        />
      </div>

      {/* Center: Step Timeline */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="card m-3">
          {displayTrace ? (
            <StepTimeline
              steps={displayTrace.steps}
              activeStep={activeStepIndex}
              onStepSelect={(step, index) => {
                setSelectedStep(step);
                setActiveStepIndex(index);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-muted">
              {loading ? "Loading..." : "No traces yet"}
            </div>
          )}
        </div>
      </div>

      {/* Right: Inspector Panel */}
      <div className="w-[380px] flex-shrink-0 border-l border-border bg-surface p-3 overflow-y-auto">
        <TraceInspector trace={displayTrace} selectedStep={selectedStep} />
      </div>
    </div>
  );
}
