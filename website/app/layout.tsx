import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TraceLLM | AI Observability Platform",
  description:
    "TraceLLM helps teams trace prompts, latency, token usage, retries, tool calls, and execution paths in realtime.",
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
