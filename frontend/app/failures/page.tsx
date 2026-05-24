"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeFailures } from "@/hooks/use-observability-data";
import { formatDuration, formatTimestamp } from "@/lib/format";
import { TraceRecord } from "@/lib/types";

function FailureList({
  title,
  description,
  traces,
}: {
  title: string;
  description: string;
  traces: TraceRecord[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {traces.map((trace) => (
          <Link
            key={trace.trace_id}
            href={`/traces/${trace.trace_id}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-sm text-cyan-200">{trace.trace_id}</p>
              <Badge variant={trace.status === "failed" ? "failed" : "warning"}>{trace.status}</Badge>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-300">{trace.prompt}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
              {formatDuration(trace.latency)} - {formatTimestamp(trace.created_at)}
            </p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export default function FailuresPage() {
  const { data } = useRealtimeFailures();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-rose-400/15 bg-rose-400/8 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-rose-100/70">Failed traces</p>
          <p className="mt-3 font-heading text-4xl text-white">{data?.totals.failed_traces ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-amber-400/15 bg-amber-400/8 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-100/70">Retries</p>
          <p className="mt-3 font-heading text-4xl text-white">{data?.totals.retries ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/8 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Slow requests</p>
          <p className="mt-3 font-heading text-4xl text-white">{data?.totals.slow_requests ?? 0}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <FailureList
          title="Failed Traces"
          description="Hard failures needing investigation."
          traces={data?.failed_traces ?? []}
        />
        <FailureList
          title="Retries"
          description="Executions that retried one or more tool calls."
          traces={data?.retries ?? []}
        />
        <FailureList
          title="Slow Requests"
          description="Latency outliers that crossed the warning threshold."
          traces={data?.slow_requests ?? []}
        />
      </section>
    </div>
  );
}
