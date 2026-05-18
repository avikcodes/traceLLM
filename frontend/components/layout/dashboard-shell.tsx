"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_24%),radial-gradient(circle_at_80%_0%,_rgba(59,130,246,0.16),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#030712_42%,_#020617_100%)] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-28 size-72 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute bottom-12 right-[12%] size-80 rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px] opacity-20" />
      </div>

      <Sidebar mobileOpen={mobileOpen} onToggle={() => setMobileOpen((open) => !open)} />

      <div className="relative md:pl-72">
        <TopNavbar />
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
