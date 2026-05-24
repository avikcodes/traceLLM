"use client";

import { AlertTriangle, Gauge, ShieldCheck, TimerReset } from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LiveLogsPanel } from "@/components/logs/live-logs-panel";
import { TracesTable } from "@/components/traces/traces-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useObservabilityStream } from "@/components/providers/observability-provider";
import { useRealtimeAnalytics, useRealtimeFailures, useRealtimeTraces } from "@/hooks/use-observability-data";
import { formatCompactNumber, formatDuration, formatPercent } from "@/lib/format";

export function DashboardOverview() {
  const { projects, selectedEnvironment, selectedProjectId } = useObservabilityStream();
  const { data: analytics, loading } = useRealtimeAnalytics();
  const { data: failures } = useRealtimeFailures(5);
  const { items: traces } = useRealtimeTraces({ limit: 5 });

  const summary = analytics?.summary;
  const metrics = [
    {
      label: "Total Traces",
      value: summary ? formatCompactNumber(summary.total_traces) : "--",
      delta: summary ? `${summary.failed_traces} failed` : "--",
      hint: "Stored live in MongoDB and refreshed from websocket events.",
    },
    {
      label: "Average Latency",
      value: summary ? formatDuration(summary.average_latency) : "--",
      delta: summary ? `P95 ${formatDuration(summary.p95_latency)}` : "--",
      hint: "Runtime speed across recent platform traffic.",
    },
    {
      label: "Token Usage",
      value: summary ? formatCompactNumber(summary.total_token_usage) : "--",
      delta: summary ? `${summary.retries} retries` : "--",
      hint: "Prompt and completion token volume across all traces.",
    },
    {
      label: "Success Rate",
      value: summary ? formatPercent(summary.success_rate) : "--",
      delta: summary ? `${summary.slow_requests} slow traces` : "--",
      hint: "Healthy traces after warnings, failures, and retries.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap gap-3">
        <Badge variant="neutral">
          {selectedProjectId === "all"
            ? "All projects"
            : projects.find((project) => project.project_id === selectedProjectId)?.name ?? selectedProjectId}
        </Badge>
        <Badge
          variant={
            selectedEnvironment === "production"
              ? "failed"
              : selectedEnvironment === "staging"
                ? "warning"
                : "info"
          }
        >
          {selectedEnvironment}
        </Badge>
        <Badge variant="info">
          {analytics?.project_breakdown?.length ?? 0} active project buckets
        </Badge>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} loading={loading} />
        ))}
      </section>

      <DashboardCharts data={analytics?.charts ?? []} loading={loading} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Failure Watch</CardTitle>
            <CardDescription>Warnings and hot paths that deserve attention right now.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-rose-400/15 bg-rose-400/8 p-4">
              <div className="flex items-center justify-between text-rose-200">
                <span className="text-sm">Failed traces</span>
                <AlertTriangle className="size-4" />
              </div>
              <p className="mt-3 font-heading text-3xl text-white">
                {failures?.totals.failed_traces ?? 0}
              </p>
            </div>
            <div className="rounded-3xl border border-amber-400/15 bg-amber-400/8 p-4">
              <div className="flex items-center justify-between text-amber-200">
                <span className="text-sm">Retries</span>
                <TimerReset className="size-4" />
              </div>
              <p className="mt-3 font-heading text-3xl text-white">{failures?.totals.retries ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/8 p-4">
              <div className="flex items-center justify-between text-cyan-200">
                <span className="text-sm">Slow requests</span>
                <Gauge className="size-4" />
              </div>
              <p className="mt-3 font-heading text-3xl text-white">
                {failures?.totals.slow_requests ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Execution Health</CardTitle>
            <CardDescription>Recent degraded traces pulled from the backend failure feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analytics?.recent_failures ?? []).map((trace) => (
              <div
                key={trace.trace_id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm text-cyan-200">{trace.trace_id}</p>
                  <ShieldCheck className="size-4 text-cyan-200" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-300">{trace.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
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
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {trace.status} - {formatDuration(trace.latency)} - retries {trace.retry_count}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <TracesTable traces={traces} loading={loading} />
        <LiveLogsPanel />
      </section>
    </div>
  );
}
