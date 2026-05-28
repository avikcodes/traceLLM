"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { StepTimeline } from "@/components/console/step-timeline";
import { TraceInspector } from "@/components/console/trace-inspector";
import { useRealtimeTrace } from "@/hooks/use-observability-data";
import { TraceStep } from "@/lib/types";
import { formatDuration, formatCompactNumber, formatFullTimestamp } from "@/lib/format";

export default function TraceDetailPage() {
  const params = useParams<{ traceId: string }>();
  const traceId = params?.traceId ?? "";
  const { trace, loading } = useRealtimeTrace(traceId);
  const [selectedStep, setSelectedStep] = useState<TraceStep | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted">Loading trace...</div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted">Trace not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/traces"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground no-underline transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Traces
        </Link>
        <span className="text-muted/30">/</span>
        <span className="text-sm font-mono text-foreground">{trace.trace_id}</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent-subtle text-accent capitalize">
          {trace.status}
        </span>
      </div>

      {/* Summary bar */}
      <div className="card px-4 py-3 mb-4 flex items-center gap-6 text-sm">
        <span className="text-muted">Model</span>
        <span className="text-foreground font-medium">{trace.model_name ?? "—"}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Latency</span>
        <span className="text-foreground font-medium">{formatDuration(trace.latency)}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Tokens</span>
        <span className="text-foreground font-medium">{formatCompactNumber(trace.token_count)}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Retries</span>
        <span className="text-foreground font-medium">{trace.retry_count}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">Steps</span>
        <span className="text-foreground font-medium">{trace.steps.length}</span>
        <span className="text-muted/30">|</span>
        <span className="text-muted">At</span>
        <span className="text-foreground">{formatFullTimestamp(trace.created_at)}</span>
      </div>

      {/* Two-panel content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Timeline + Prompt/Response */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="card flex-1 overflow-y-auto">
            <StepTimeline
              steps={trace.steps}
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
                {trace.prompt || "∅"}
              </pre>
            </div>
            <div className="card">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Response</span>
              </div>
              <pre className="p-4 text-sm text-foreground/70 whitespace-pre-wrap overflow-y-auto max-h-40 font-sans leading-relaxed">
                {trace.response ? trace.response.slice(0, 1000) + (trace.response.length > 1000 ? "\n…" : "") : "∅"}
              </pre>
            </div>
          </div>
        </div>

        {/* Right: Inspector */}
        <div className="w-[380px] flex-shrink-0">
          <TraceInspector trace={trace} selectedStep={selectedStep} />
        </div>
      </div>
    </div>
  );
}
