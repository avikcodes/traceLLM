"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useObservabilityStream } from "@/components/providers/observability-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Replay" },
  { href: "/traces", label: "Traces" },
  { href: "/analytics", label: "Analytics" },
  { href: "/live-logs", label: "Logs" },
  { href: "/settings", label: "Settings" },
];

export function ConsoleHeader() {
  const pathname = usePathname();
  const { connectionState } = useObservabilityStream();

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-foreground no-underline">
            <span className="text-accent text-lg font-semibold">◆</span>
            <span className="text-sm font-semibold">TraceLLM</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md no-underline transition-colors",
                    isActive
                      ? "text-foreground bg-surface-hover"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted">
          <span
            className={cn(
              "inline-block w-2 h-2 rounded-full",
              connectionState === "open" ? "bg-accent" : "bg-muted"
            )}
          />
          <span>{connectionState === "open" ? "Connected" : "Disconnected"}</span>
        </div>
      </div>
    </header>
  );
}
