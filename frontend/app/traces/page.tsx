"use client";

import { useDeferredValue, useState } from "react";

import { TracesTable } from "@/components/traces/traces-table";
import { useRealtimeTraces } from "@/hooks/use-observability-data";

export default function TracesPage() {
  const [filters, setFilters] = useState({
    status: "",
    model: "",
    latency_min: "",
    latency_max: "",
    token_min: "",
    token_max: "",
  });
  const deferredFilters = useDeferredValue(filters);
  const { items, loading } = useRealtimeTraces({
    status: deferredFilters.status || undefined,
    model: deferredFilters.model || undefined,
    latency_min: deferredFilters.latency_min ? Number(deferredFilters.latency_min) : undefined,
    latency_max: deferredFilters.latency_max ? Number(deferredFilters.latency_max) : undefined,
    token_min: deferredFilters.token_min ? Number(deferredFilters.token_min) : undefined,
    token_max: deferredFilters.token_max ? Number(deferredFilters.token_max) : undefined,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ["Status", "status", "success | warning | failed"],
          ["Model", "model", "gpt-4.1-mini"],
          ["Min latency", "latency_min", "500"],
          ["Max latency", "latency_max", "2000"],
          ["Min tokens", "token_min", "1000"],
          ["Max tokens", "token_max", "10000"],
        ].map(([label, key, placeholder]) => (
          <label
            key={key}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300"
          >
            <span className="mb-3 block text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</span>
            <input
              value={filters[key as keyof typeof filters]}
              onChange={(event) =>
                setFilters((current) => ({ ...current, [key]: event.target.value }))
              }
              placeholder={placeholder}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-400/30"
            />
          </label>
        ))}
      </section>

      <TracesTable
        traces={items}
        loading={loading}
        title="Trace Inventory"
        description="Browse real traces and filter by latency, status, model, and token volume."
      />
    </div>
  );
}
