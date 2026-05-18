import { TracesTable } from "@/components/traces/traces-table";
import { mockTraces } from "@/lib/mock-data";

export default function TracesPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Success</p>
          <p className="mt-3 font-heading text-4xl text-white">4,812</p>
          <p className="mt-2 text-sm text-zinc-400">Stable completions in the last 24 hours.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Warnings</p>
          <p className="mt-3 font-heading text-4xl text-amber-200">284</p>
          <p className="mt-2 text-sm text-zinc-400">Fallbacks, cache misses, and partial context events.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Failures</p>
          <p className="mt-3 font-heading text-4xl text-rose-200">39</p>
          <p className="mt-2 text-sm text-zinc-400">High-risk traces needing manual investigation.</p>
        </div>
      </section>

      <TracesTable
        traces={mockTraces}
        title="Trace Inventory"
        description="Browse every captured prompt execution and jump into full detail."
      />
    </div>
  );
}
