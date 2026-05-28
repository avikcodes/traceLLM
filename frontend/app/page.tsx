"use client";

import { useState } from "react";

import { TraceList } from "@/components/console/trace-list";
import { StepTimeline } from "@/components/console/step-timeline";
import { TraceInspector } from "@/components/console/trace-inspector";
import { useRealtimeTraces } from "@/hooks/use-observability-data";
import { TraceRecord, TraceStep } from "@/lib/types";

export default function ConsolePage() {
  const { items: traces, loading } = useRealtimeTraces({ limit: 50 });
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [selectedStep, setSelectedStep] = useState<TraceStep | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  const latestTrace = traces[0] ?? null;
  const displayTrace = selectedTrace ?? latestTrace;

  return (
    <div className="flex-1 flex min-h-0">
      {/* Left: Trace List Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface">
        <TraceList
          traces={traces}
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
