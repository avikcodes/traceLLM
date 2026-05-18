import { DashboardCharts } from "@/components/dashboard/charts";
import { chartData } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">p95 Latency</p>
          <p className="mt-3 font-heading text-4xl text-white">1.42s</p>
          <p className="mt-2 text-sm text-zinc-400">Down 11% versus yesterday.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Token Spend</p>
          <p className="mt-3 font-heading text-4xl text-white">$2,184</p>
          <p className="mt-2 text-sm text-zinc-400">Across all agent and assistant workloads.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Trace Throughput</p>
          <p className="mt-3 font-heading text-4xl text-white">8.4K/hr</p>
          <p className="mt-2 text-sm text-zinc-400">Peak ingestion window during US business hours.</p>
        </div>
      </section>

      <DashboardCharts data={chartData} />
    </div>
  );
}
