import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/lib/mock-data";
import { TraceRecord, TraceStatus } from "@/lib/types";

const statusVariant: Record<TraceStatus, "success" | "warning" | "failed"> = {
  success: "success",
  warning: "warning",
  failed: "failed",
};

export function TracesTable({
  traces,
  title = "Recent Traces",
  description = "Latest prompt executions across production and staging.",
  loading,
}: {
  traces: TraceRecord[];
  title?: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="font-heading">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant="neutral">{traces.length} traces</Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                <th className="px-4">trace_id</th>
                <th className="px-4">prompt</th>
                <th className="px-4">latency</th>
                <th className="px-4">token_count</th>
                <th className="px-4">timestamp</th>
                <th className="px-4">status</th>
              </tr>
            </thead>
            <tbody>
              {traces.map((trace) => (
                <tr
                  key={trace.traceId}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]"
                >
                  <td className="rounded-l-2xl px-4 py-4 font-mono text-cyan-200">{trace.traceId}</td>
                  <td className="max-w-[360px] px-4 py-4 text-zinc-300">
                    <p className="line-clamp-2">{trace.prompt}</p>
                  </td>
                  <td className="px-4 py-4 text-white">{trace.latency} ms</td>
                  <td className="px-4 py-4 text-white">{trace.tokenCount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-zinc-400">{formatTimestamp(trace.timestamp)}</td>
                  <td className="rounded-r-2xl px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={statusVariant[trace.status]}>{trace.status}</Badge>
                      <Link
                        href={`/traces/${trace.traceId}`}
                        className="inline-flex items-center gap-1 text-cyan-200 transition hover:text-cyan-100"
                      >
                        Open <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
