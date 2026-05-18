export default function SettingsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Workspace</p>
        <h2 className="mt-3 font-heading text-3xl text-white">TraceLLM Control Settings</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Default environment", "Production"],
            ["Primary model family", "gpt-4.1"],
            ["Alert routing", "Slack + email"],
            ["Retention policy", "30 days"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="mt-2 text-lg font-medium text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/8 to-white/4 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">API Ingress</p>
          <p className="mt-3 font-heading text-2xl text-white">Tracing endpoint healthy</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            SDK ingestion, websocket relay, and analytics writes are configured for the current
            demo workspace.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Safety</p>
          <div className="mt-4 space-y-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <span>PII redaction</span>
              <span className="text-emerald-300">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <span>Prompt retention controls</span>
              <span className="text-emerald-300">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <span>Escalation alerts</span>
              <span className="text-amber-300">Reviewing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
