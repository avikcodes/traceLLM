import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { ConsoleLayout } from "@/components/layout/console-layout";
import { ObservabilityProvider } from "@/components/providers/observability-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TraceLLM Console",
  description: "LLM observability and tracing platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full bg-background text-foreground font-sans">
        <ObservabilityProvider>
          <ConsoleLayout>{children}</ConsoleLayout>
        </ObservabilityProvider>
      </body>
    </html>
  );
}
