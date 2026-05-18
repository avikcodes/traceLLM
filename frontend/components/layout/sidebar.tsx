"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Home,
  Menu,
  Settings,
  Sparkles,
  TableProperties,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/traces", label: "Traces", icon: TableProperties },
  { href: "/live-logs", label: "Live Logs", icon: Activity },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({
  mobileOpen,
  onToggle,
}: {
  mobileOpen: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="border-white/10 bg-slate-950/80 text-white backdrop-blur-xl hover:bg-white/10"
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/80 px-5 py-6 backdrop-blur-3xl transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="rounded-3xl border border-white/10 bg-linear-to-br from-cyan-400/12 via-transparent to-blue-500/18 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold tracking-tight text-white">
                    TraceLLM
                  </p>
                  <p className="text-sm text-zinc-400">LLM observability control plane</p>
                </div>
              </div>
              <Badge variant="info">Live</Badge>
            </div>
            <p className="text-sm leading-6 text-zinc-300">
              Monitor traces, latency, token usage, and agent execution quality in one
              production-grade workspace.
            </p>
          </div>

          <nav className="mt-6 flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => mobileOpen && onToggle()}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all duration-200",
                    active
                      ? "border-cyan-400/25 bg-linear-to-r from-cyan-400/14 to-blue-500/14 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.08)]"
                      : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/6 hover:text-zinc-100"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl border transition-colors",
                      active
                        ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-200"
                        : "border-white/8 bg-white/5 text-zinc-500 group-hover:text-zinc-100"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
              Monitoring
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Agent sessions</span>
                <span className="text-white">421 active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Tool calls / min</span>
                <span className="text-white">18.2K</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/6">
                <div className="h-full w-[72%] rounded-full bg-linear-to-r from-cyan-400 to-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
