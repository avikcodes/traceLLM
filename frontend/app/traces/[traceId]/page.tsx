"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BrainCircuit, Clock3, Coins, RefreshCcw, TriangleAlert } from "lucide-react";

import { ExecutionFlow } from "@/components/timeline/execution-flow";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeTrace } from "@/hooks/use-observability-data";
import { formatCompactNumber, formatDuration, formatFullTimestamp } from "@/lib/format";

export default function TraceDetailPage() {
  const params = useParams<{ traceId: string }>();
  const traceId = params?.traceId ?? "";
  const { trace, loading } = useRealtimeTrace(traceId);

  if (!loading && !trace) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-zinc-300">
        Trace not found.
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-zinc-300">
        Loading trace detail...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/traces"
            className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100"
          >
            <ArrowLeft className="size-4" />
            Back to traces
          </Link>
          <h1 className="mt-3 font-heading text-3xl text-white">{trace.trace_id}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">
            Full request and execution detail for a single LLM trace with replayable tool-call observability.
          </p>
        </div>
        <Badge
          variant={
            trace.status === "success"
              ? "success"
              : trace.status === "warning"
                ? "warning"
                : "failed"
          }
        >
          {trace.status}
        </Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Latency",
            value: formatDuration(trace.latency),
            icon: Clock3,
          },
          {
            label: "Token Count",
            value: formatCompactNumber(trace.token_count),
            icon: Coins,
          },
          {
            label: "Model",
            value: trace.model_name ?? "unknown",
            icon: BrainCircuit,
          },
          {
            label: "Retries",
            value: String(trace.retry_count),
            icon: RefreshCcw,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{item.label}</p>
                  <p className="mt-2 font-heading text-3xl text-white">{item.value}</p>
                </div>
                <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200">
                  <item.icon className="size-5" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Full Prompt</CardTitle>
            <CardDescription>Original input captured for this trace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 font-mono text-sm leading-7 text-zinc-200">
              {trace.prompt}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Trace Metadata</CardTitle>
            <CardDescription>Timing, warnings, and persistence details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-400">Started at</span>
              <span className="text-white">{formatFullTimestamp(trace.created_at)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-400">Updated at</span>
              <span className="text-white">{formatFullTimestamp(trace.updated_at)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-400">Slow request</span>
              <span className="text-white">{trace.slow_request ? "Yes" : "No"}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2 text-rose-200">
                <TriangleAlert className="size-4" />
                Failure reason
              </div>
              <p className="mt-2 text-zinc-300">{trace.failure_reason ?? "No failure recorded."}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Full Response</CardTitle>
          <CardDescription>Model output persisted for this trace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 text-sm leading-7 text-zinc-200">
            {trace.response ?? "No response payload captured."}
          </div>
        </CardContent>
      </Card>

      <ExecutionFlow key={trace.trace_id} steps={trace.steps} />
    </div>
  );
}
