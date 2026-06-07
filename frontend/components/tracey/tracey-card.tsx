"use client";

import { useTheme } from "@/contexts/theme-context";

export function TraceyCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className="card p-4 flex items-start gap-3">
      <TraceySVG theme={theme} />
      <div className="text-sm text-foreground/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function TraceySVG({ theme }: { theme: string }) {
  const bodyColor = theme === "light" ? "#7c3aed" : "#a78bfa";
  const bellyColor = theme === "light" ? "#f3f4f6" : "#1a1a2e";
  const eyeColor = theme === "light" ? "#111" : "#fff";

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className="flex-shrink-0"
      aria-label="Tracey the dinosaur"
    >
      <ellipse cx="20" cy="22" rx="14" ry="12" fill={bodyColor} opacity="0.9" />
      <ellipse cx="20" cy="25" rx="8" ry="7" fill={bellyColor} opacity="0.6" />
      <ellipse cx="14" cy="18" rx="3" ry="3.5" fill={bodyColor} opacity="0.9" />
      <ellipse cx="26" cy="18" rx="3" ry="3.5" fill={bodyColor} opacity="0.9" />
      <circle cx="14" cy="18" r="1.5" fill={eyeColor} />
      <circle cx="26" cy="18" r="1.5" fill={eyeColor} />
      <circle cx="14" cy="18" r="0.6" fill={bodyColor} opacity="0.3" />
      <circle cx="26" cy="18" r="0.6" fill={bodyColor} opacity="0.3" />
      <path
        d="M 16 28 Q 20 30 24 28"
        fill="none"
        stroke={eyeColor}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
