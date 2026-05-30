import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceLLM | Terminal-first LLM Observability",
  description:
    "Open-source, terminal-first observability for LLMs and AI agents. Trace prompts, tool calls, retries, latency, tokens, and execution flows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
