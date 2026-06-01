export function MongoDBRequirement() {
  return (
    <div className="my-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4">
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-200">
        Version 1 Requirement
      </p>
      <div className="text-sm leading-7 text-amber-900/90 dark:text-amber-100/90">
        <p className="mb-2">
          TraceLLM currently requires MongoDB for trace storage.
        </p>
        <p className="mb-1">Required environment variables:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><code className="rounded bg-amber-400/20 px-1.5 py-0.5 font-mono text-xs text-amber-900 dark:text-amber-100">MONGO_URL</code></li>
          <li><code className="rounded bg-amber-400/20 px-1.5 py-0.5 font-mono text-xs text-amber-900 dark:text-amber-100">DB_NAME</code></li>
        </ul>
        <p className="mt-2">
          Future versions may support additional storage options.
        </p>
      </div>
    </div>
  );
}
