"use client";

import { useEffect, useState } from "react";

import { DashboardCharts } from "@/components/dashboard/charts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LiveLogsPanel } from "@/components/logs/live-logs-panel";
import { TracesTable } from "@/components/traces/traces-table";
import { dashboardMetrics, chartData, mockTraces } from "@/lib/mock-data";

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} loading={loading} />
        ))}
      </section>

      <DashboardCharts data={chartData} loading={loading} />

      <section className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
        <TracesTable traces={mockTraces.slice(0, 5)} loading={loading} />
        <LiveLogsPanel />
      </section>
    </div>
  );
}
