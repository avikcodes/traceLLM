"use client";

export default function SettingsPage() {
  const settings = [
    { key: "Default Environment", value: "development" },
    { key: "API Endpoint", value: "http://localhost:8000" },
    { key: "WebSocket", value: "ws://localhost:8000/ws" },
    { key: "Database", value: "MongoDB (tracellm)" },
    { key: "Retention", value: "30 days" },
    { key: "Version", value: "0.2.0" },
  ];

  return (
    <div className="flex flex-col h-full p-4 gap-4 max-w-2xl">
      <h1 className="text-sm font-semibold text-foreground">Settings</h1>

      <div className="card">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">Configuration</span>
        </div>
        <div>
          {settings.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm text-muted">{s.key}</span>
              <span className="text-sm text-foreground font-mono">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">About</span>
        </div>
        <div className="p-4 text-sm text-muted leading-relaxed">
          <p className="mb-2">
            TraceLLM is an open-source observability platform for LLM applications.
            It provides tracing, replay, and monitoring for AI agents and language model calls.
          </p>
          <p className="mb-1">
            <span className="text-foreground">trace_id</span> keys are UUIDv4.
          </p>
          <p className="mb-1">
            <span className="text-foreground">api_key</span> format is{' '}
            <code className="text-accent font-mono text-xs">tlm_sk_</code> followed by 32 alphanumeric characters.
          </p>
          <p>
            <span className="text-foreground">Status</span> values:{' '}
            <span className="text-accent">Success</span>,{' '}
            <span className="text-warning">Warning</span>,{' '}
            <span className="text-error">Failed</span>.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">Keyboard Shortcuts</span>
        </div>
        <div>
          {[
            { key: "⌘K", desc: "Search traces" },
            { key: "↑ ↓", desc: "Navigate list" },
            { key: "Enter", desc: "Open trace" },
            { key: "Esc", desc: "Go back" },
            { key: "⌘R", desc: "Refresh" },
          ].map((k) => (
            <div
              key={k.key}
              className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm font-mono text-accent">{k.key}</span>
              <span className="text-sm text-muted">{k.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
