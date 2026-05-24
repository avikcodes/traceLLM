"use client";

import { DashboardCharts } from "@/components/dashboard/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeAnalytics } from "@/hooks/use-observability-data";
import { formatCompactNumber, formatDuration, formatPercent } from "@/lib/format";

export default function AnalyticsPage() {
  const { data, loading } = useRealtimeAnalytics();
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">p95 Latency</p>
          <p className="mt-3 font-heading text-4xl text-white">
            {summary ? formatDuration(summary.p95_latency) : "--"}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Calculated from real trace latency windows.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Token Usage</p>
          <p className="mt-3 font-heading text-4xl text-white">
            {summary ? formatCompactNumber(summary.total_token_usage) : "--"}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Prompt and completion volume across the workspace.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Success Rate</p>
          <p className="mt-3 font-heading text-4xl text-white">
            {summary ? formatPercent(summary.success_rate) : "--"}
          </p>
          <p className="mt-2 text-sm text-zinc-400">Includes live updates when new traces arrive.</p>
        </div>
      </section>

      <DashboardCharts data={data?.charts ?? []} loading={loading} />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Status Breakdown</CardTitle>
            <CardDescription>Current trace health distribution from MongoDB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.status_breakdown ?? []).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-zinc-300">{item.key}</span>
                <span className="font-heading text-xl text-white">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Model Breakdown</CardTitle>
            <CardDescription>Which model families are producing the most traces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.model_breakdown ?? []).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-zinc-300">{item.key}</span>
                <span className="font-heading text-xl text-white">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
