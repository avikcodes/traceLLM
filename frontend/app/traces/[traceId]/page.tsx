import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BrainCircuit, Clock3, Coins, Database } from "lucide-react";

import { ExecutionFlow } from "@/components/timeline/execution-flow";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFullTimestamp, getTraceById } from "@/lib/mock-data";

export default async function TraceDetailPage({
  params,
}: {
  params: Promise<{ traceId: string }>;
}) {
  const { traceId } = await params;
  const trace = getTraceById(traceId);

  if (!trace) {
    notFound();
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
          <h1 className="mt-3 font-heading text-3xl text-white">{trace.traceId}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">
            Full request and execution detail for a single LLM trace, including prompt,
            response, timestamps, token use, and execution flow.
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
            value: `${trace.latency} ms`,
            icon: Clock3,
          },
          {
            label: "Token Count",
            value: trace.tokenCount.toLocaleString(),
            icon: Coins,
          },
          {
            label: "Model",
            value: trace.model,
            icon: BrainCircuit,
          },
          {
            label: "Environment",
            value: trace.environment,
            icon: Database,
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
            <CardDescription>Timing, cost, and persistence details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-400">Started at</span>
              <span className="text-white">{formatFullTimestamp(trace.steps[0].timestamp)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-400">Finished at</span>
              <span className="text-white">
                {formatFullTimestamp(trace.steps[trace.steps.length - 1].timestamp)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-400">Cost estimate</span>
              <span className="text-white">${trace.cost.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-zinc-400">Captured timestamp</span>
              <span className="text-white">{formatFullTimestamp(trace.timestamp)}</span>
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
            {trace.response}
          </div>
        </CardContent>
      </Card>

      <ExecutionFlow steps={trace.steps} />
    </div>
  );
}
