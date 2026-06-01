import type { ReactNode } from "react";
import { TraceyMascot } from "@/components/docs/tracey-mascot";

type TraceyVariant = "tip" | "troubleshooting" | "welcome" | "guide";

const colors = {
  tip: "border-violet-400/20 bg-violet-400/10",
  troubleshooting: "border-amber-400/20 bg-amber-400/10",
  welcome: "border-emerald-400/20 bg-emerald-400/10",
  guide: "border-blue-400/20 bg-blue-400/10",
};

const textColors = {
  tip: "text-violet-700 dark:text-violet-200",
  troubleshooting: "text-amber-700 dark:text-amber-200",
  welcome: "text-emerald-700 dark:text-emerald-200",
  guide: "text-blue-700 dark:text-blue-200",
};

const contentColors = {
  tip: "text-violet-900/90 dark:text-violet-100/90",
  troubleshooting: "text-amber-900/90 dark:text-amber-100/90",
  welcome: "text-emerald-900/90 dark:text-emerald-100/90",
  guide: "text-blue-900/90 dark:text-blue-100/90",
};

const labels = {
  tip: "Tracey Tip",
  troubleshooting: "Tracey Troubleshooting",
  welcome: "Tracey Says",
  guide: "Tracey Guide",
};

export function TraceyTip({
  variant = "tip",
  children,
}: {
  variant?: TraceyVariant;
  children: ReactNode;
}) {
  return (
    <div className={`my-6 rounded-2xl border px-5 py-4 ${colors[variant]}`}>
      <div className="mb-2 flex items-center gap-3">
        <TraceyMascot className="size-10 shrink-0" />
        <p className={`font-mono text-xs uppercase tracking-widest ${textColors[variant]}`}>
          {labels[variant]}
        </p>
      </div>
      <div className={`pl-0 text-sm leading-7 ${contentColors[variant]}`}>{children}</div>
    </div>
  );
}
