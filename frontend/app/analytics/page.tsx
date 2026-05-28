"use client";

import { useRealtimeAnalytics } from "@/hooks/use-observability-data";
import { formatCompactNumber, formatDuration, formatPercent } from "@/lib/format";

export default function AnalyticsPage() {
  const { data, loading } = useRealtimeAnalytics();
  const s = data?.summary;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-sm font-semibold text-foreground">Analytics</h1>

      {loading ? (
        <div className="card flex-1 flex items-center justify-center">
          <div className="text-sm text-muted">Loading...</div>
        </div>
      ) : !s ? (
        <div className="card flex-1 flex items-center justify-center">
          <div className="text-sm text-muted">No data available</div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Total Traces", value: formatCompactNumber(s.total_traces) },
              { label: "Avg Latency", value: formatDuration(s.average_latency) },
              { label: "P95 Latency", value: formatDuration(s.p95_latency) },
              { label: "Success Rate", value: formatPercent(s.success_rate) },
              { label: "Total Tokens", value: formatCompactNumber(s.total_token_usage) },
            ].map((item) => (
              <div key={item.label} className="card p-4">
                <div className="text-xs text-muted mb-1">{item.label}</div>
                <div className="text-lg font-semibold text-foreground">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Status breakdown */}
            <div className="card flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Status Breakdown</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {(data?.status_breakdown ?? []).map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors">
                    <span className="text-sm text-foreground capitalize">{item.key}</span>
                    <span className="text-sm text-foreground font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Model breakdown */}
            <div className="card flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Model Breakdown</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {(data?.model_breakdown ?? []).map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-hover transition-colors">
                    <span className="text-sm text-foreground">{item.key}</span>
                    <span className="text-sm text-muted">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent failures */}
          <div className="card">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Recent Failures</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {(data?.recent_failures ?? []).length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted text-center">No recent failures</div>
              ) : (
                data?.recent_failures.map((trace) => (
                  <div key={trace.trace_id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors">
                    <span className="text-xs text-error font-medium">Failed</span>
                    <span className="text-xs font-mono text-muted">{trace.trace_id.slice(0, 8)}</span>
                    <span className="text-sm text-foreground truncate flex-1">{trace.prompt.slice(0, 60)}</span>
                    <span className="text-sm text-muted flex-shrink-0">{formatDuration(trace.latency)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 24h breakdown */}
          <div className="card">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">24h Breakdown</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="text-left px-4 py-2 font-medium">Hour</th>
                    <th className="text-right px-4 py-2 font-medium">Latency</th>
                    <th className="text-right px-4 py-2 font-medium">Tokens</th>
                    <th className="text-right px-4 py-2 font-medium">Traces</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.charts ?? []).map((point) => (
                    <tr key={point.label} className="border-b border-border/30 hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-2 text-muted">{point.label}</td>
                      <td className="px-4 py-2 text-right text-foreground">{formatDuration(point.latency)}</td>
                      <td className="px-4 py-2 text-right text-foreground">{point.tokens.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-foreground">{point.traces}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
