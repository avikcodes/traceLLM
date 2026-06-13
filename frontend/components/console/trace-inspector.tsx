"use client";

import { useCallback, useState } from "react";
import { Copy, Download, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { downloadTracesAsJson, downloadTracesAsMarkdown, formatDuration, formatCompactNumber, formatFullTimestamp, formatTraceForClipboard } from "@/lib/format";
import { TraceRecord, TraceStep } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-foreground font-medium">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-0">
      <div className="px-4 py-2">
        <span className="text-[11px] font-medium text-muted uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-4 pb-3">
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ label, children, maxH = "32" }: { label: string; children: React.ReactNode; maxH?: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted block mb-1.5">{label}</span>
      <pre className={`text-xs text-foreground/70 whitespace-pre-wrap overflow-y-auto max-h-${maxH} bg-surface-alt rounded-lg p-3 font-mono leading-relaxed`}>
        {children}
      </pre>
    </div>
  );
}

function StepDetail({ step }: { step: TraceStep | null }) {
  if (!step) {
    return (
      <div className="px-4 py-6 text-sm text-muted text-center">
        Select a step to inspect
      </div>
    );
  }

  return (
    <>
      <Section title="Step">
        <DetailRow label="Tool" value={step.tool_name} />
        <DetailRow label="Duration" value={formatDuration(step.duration)} />
        <DetailRow
          label="Status"
          value={
            <span className={step.success ? "text-accent" : "text-error"}>
              {step.success ? "Success" : "Failed"}
            </span>
          }
        />
      </Section>
      <Section title="Step Data">
        <CodeBlock label="Input">{JSON.stringify(step.input, null, 2) || "∅"}</CodeBlock>
      </Section>
      <Section title="">
        <CodeBlock label="Output">{JSON.stringify(step.output, null, 2) || "∅"}</CodeBlock>
      </Section>
    </>
  );
}

export function TraceInspector({
  trace,
  selectedStep,
}: {
  trace?: TraceRecord | null;
  selectedStep?: TraceStep | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!trace) return;
    navigator.clipboard.writeText(formatTraceForClipboard(trace));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [trace]);

  if (!trace) {
    return (
      <div className="card h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">Details</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted">Select a trace to inspect</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">Details</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadTracesAsMarkdown([trace], `trace_${trace.trace_id}.md`)}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <FileText className="size-3" />
            MD
          </button>
          <button
            onClick={() => downloadTracesAsJson([trace], `trace_${trace.trace_id}.json`)}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Download className="size-3" />
            JSON
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            <Copy className="size-3" />
            {copied ? "Trace copied" : "Copy"}
          </button>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded bg-accent-subtle",
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
      <div className="flex-1 overflow-y-auto">
        <Section title="Overview">
          <DetailRow label="Trace ID" value={<span className="font-mono text-xs">{trace.trace_id.slice(0, 12)}…</span>} />
          <DetailRow label="Model" value={trace.model_name ?? "—"} />
          <DetailRow label="Latency" value={formatDuration(trace.latency)} />
          <DetailRow label="Tokens" value={formatCompactNumber(trace.token_count)} />
          <DetailRow label="Retries" value={String(trace.retry_count)} />
          <DetailRow label="Environment" value={trace.environment} />
        </Section>

        <Section title="Timing">
          <DetailRow label="Started" value={formatFullTimestamp(trace.created_at)} />
          <DetailRow label="Updated" value={formatFullTimestamp(trace.updated_at)} />
          <DetailRow label="Slow Request" value={trace.slow_request ? "Yes" : "No"} />
        </Section>

        {trace.failure_reason && (
          <Section title="Error">
            <div className="text-sm text-error bg-error/5 rounded-lg p-3 font-medium">
              {trace.failure_reason}
            </div>
          </Section>
        )}

        <Section title="Prompt">
          <CodeBlock label="">{trace.prompt || "∅"}</CodeBlock>
        </Section>

        <Section title="Response">
          <CodeBlock label="">{
            trace.response
              ? trace.response.slice(0, 800) + (trace.response.length > 800 ? "\n…" : "")
              : "∅"
          }</CodeBlock>
        </Section>

        {selectedStep && (
          <div className="border-t border-border">
            <StepDetail step={selectedStep} />
          </div>
        )}
      </div>
    </div>
  );
}
