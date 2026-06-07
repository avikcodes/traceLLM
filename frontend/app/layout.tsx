import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { ConsoleLayout } from "@/components/layout/console-layout";
import { ObservabilityProvider } from "@/components/providers/observability-provider";
import { ThemeProvider } from "@/contexts/theme-context";
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("tracellm-theme");if(t){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <ThemeProvider>
          <ObservabilityProvider>
            <ConsoleLayout>{children}</ConsoleLayout>
          </ObservabilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
