"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TraceyMascot } from "@/components/docs/tracey-mascot";

const tips = [
  "Need help setting up MongoDB?",
  "Need help creating your first trace?",
  "Need help debugging?",
  "Need help with installation?",
  "Check the Troubleshooting page for common issues.",
];

export function FloatingTracey() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 rounded-2xl border border-border bg-card p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TraceyMascot className="size-8" />
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Tracey Says
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground transition hover:text-foreground"
              aria-label="Close help panel"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-2">
            {tips.map((tip) => (
              <p key={tip} className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                {tip}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            I&apos;m Tracey, your developer assistant. Check the docs for more help.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/90 text-white shadow-lg backdrop-blur-sm transition hover:bg-emerald-500 hover:shadow-emerald-500/25"
        aria-label={open ? "Close Tracey help" : "Open Tracey help"}
      >
        {open ? (
          <X className="size-6" />
        ) : (
          <TraceyMascot className="size-8" />
        )}
      </button>
    </div>
  );
}
