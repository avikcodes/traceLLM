"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/format";
import { TraceStep } from "@/lib/types";

function stepIcon(toolName: string, success: boolean) {
  if (!success) return "✕";
  const name = toolName.toLowerCase();
  if (name.includes("retrie") || name.includes("vector")) return "◇";
  if (name.includes("openai") || name.includes("llm") || name.includes("generat") || name.includes("chat")) return "◆";
  if (name.includes("tool") || name.includes("calc") || name.includes("search")) return "◈";
  if (name.includes("embed")) return "○";
  if (name.includes("rerank") || name.includes("plan")) return "◎";
  return "●";
}

function stepType(toolName: string): string {
  const name = toolName.toLowerCase();
  if (name.includes("retrie") || name.includes("vector")) return "Retrieval";
  if (name.includes("tool")) return "Tool Call";
  if (name.includes("calc")) return "Calculation";
  if (name.includes("search")) return "Search";
  if (name.includes("embed")) return "Embedding";
  if (name.includes("rerank")) return "Re-ranking";
  if (name.includes("plan")) return "Planning";
  if (name.includes("retry")) return "Retry";
  if (name.includes("openai") || name.includes("llm") || name.includes("generat") || name.includes("chat")) return "LLM Generation";
  return toolName;
}

export function StepTimeline({
  steps,
  activeStep,
  onStepSelect,
}: {
  steps: TraceStep[];
  activeStep: number;
  onStepSelect: (step: TraceStep, index: number) => void;
}) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted">
        No execution steps recorded
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">Execution Steps</span>
        <span className="text-xs text-muted">{steps.length} steps</span>
      </div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-3 bottom-3 w-px bg-border" />

        {steps.map((step, index) => {
          const isExpanded = expandedStep === index;
          const isActive = activeStep === index;

          return (
            <div key={step.step_id ?? index} className="relative">
              <div
                className={cn(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                  isActive ? "bg-accent-subtle" : "hover:bg-surface-hover"
                )}
                onClick={() => {
                  onStepSelect(step, index);
                  setExpandedStep(isExpanded ? null : index);
                }}
              >
                {/* Step dot */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={cn(
                    "w-[10px] h-[10px] rounded-full flex items-center justify-center text-[7px] font-bold",
                    step.success
                      ? "bg-accent-subtle text-accent"
                      : "bg-[rgba(248,113,113,0.1)] text-error"
                  )}>
                    {step.success ? "✓" : "✕"}
                  </div>
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      step.success ? "text-foreground" : "text-error"
                    )}>
                      {stepType(step.tool_name)}
                    </span>
                    <span className="text-xs text-muted">· {formatDuration(step.duration)}</span>
                    {!step.success && (
                      <span className="tag tag-error text-[11px]">Failed</span>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      <div className="card p-3">
                        <span className="text-[11px] font-medium text-muted block mb-1">Input</span>
                        <pre className="text-xs text-foreground/70 whitespace-pre-wrap overflow-x-auto max-h-32">
                          {JSON.stringify(step.input, null, 2) || "∅"}
                        </pre>
                      </div>
                      <div className="card p-3">
                        <span className="text-[11px] font-medium text-muted block mb-1">Output</span>
                        <pre className="text-xs text-foreground/70 whitespace-pre-wrap overflow-x-auto max-h-32">
                          {JSON.stringify(step.output, null, 2) || "∅"}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand indicator */}
                <span className={cn(
                  "text-xs text-muted transition-transform flex-shrink-0",
                  isExpanded && "rotate-180"
                )}>
                  ▾
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
