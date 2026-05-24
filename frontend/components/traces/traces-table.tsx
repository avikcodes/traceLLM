import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, formatTimestamp } from "@/lib/format";
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
                <th className="px-4">project</th>
                <th className="px-4">model</th>
                <th className="px-4">latency</th>
                <th className="px-4">tokens</th>
                <th className="px-4">flags</th>
                <th className="px-4">timestamp</th>
                <th className="px-4">status</th>
              </tr>
            </thead>
            <tbody>
              {traces.map((trace) => (
                <tr
                  key={trace.trace_id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]"
                >
                  <td className="rounded-l-2xl px-4 py-4 font-mono text-cyan-200">{trace.trace_id}</td>
                  <td className="max-w-[320px] px-4 py-4 text-zinc-300">
                    <p className="line-clamp-2">{trace.prompt}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Badge variant="neutral">{trace.project_name ?? trace.project_id}</Badge>
                      <Badge
                        variant={
                          trace.environment === "production"
                            ? "failed"
                            : trace.environment === "staging"
                              ? "warning"
                              : "info"
                        }
                      >
                        {trace.environment}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{trace.model_name ?? "unknown"}</td>
                  <td className="px-4 py-4 text-white">{formatDuration(trace.latency)}</td>
                  <td className="px-4 py-4 text-white">{trace.token_count.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {trace.retry_count > 0 ? <Badge variant="warning">{trace.retry_count} retry</Badge> : null}
                      {trace.slow_request ? <Badge variant="info">slow</Badge> : null}
                      {trace.failure_reason ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-200">
                          <TriangleAlert className="size-3" />
                          issue
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-400">{formatTimestamp(trace.created_at)}</td>
                  <td className="rounded-r-2xl px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={statusVariant[trace.status]}>{trace.status}</Badge>
                      <Link
                        href={`/traces/${trace.trace_id}`}
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
