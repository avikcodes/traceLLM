"use client";

import { useState } from "react";
import { ConsoleHeader } from "@/components/console/console-header";
import { TraceStream } from "@/components/console/trace-stream";
import { cn } from "@/lib/utils";

export function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const [showStream, setShowStream] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ConsoleHeader />
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
      <div className={cn(
        "border-t border-border transition-all",
        showStream ? "h-40" : "h-8"
      )}>
        <button
          onClick={() => setShowStream(!showStream)}
          className="flex items-center gap-2 px-4 h-8 w-full text-xs text-muted hover:text-foreground bg-background transition-colors border-none cursor-pointer"
        >
          <span className={cn(
            "inline-block transition-transform",
            showStream && "rotate-90"
          )}>▸</span>
          <span>Live Stream</span>
        </button>
        {showStream && (
          <div className="h-32 px-3 pb-3">
            <TraceStream compact />
          </div>
        )}
      </div>
    </div>
  );
}
