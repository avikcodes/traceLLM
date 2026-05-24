import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ObservabilityProvider } from "@/components/providers/observability-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceLLM Dashboard",
  description: "Production-grade observability dashboard for LLM apps and AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ObservabilityProvider>
          <DashboardShell>{children}</DashboardShell>
        </ObservabilityProvider>
      </body>
    </html>
  );
}
