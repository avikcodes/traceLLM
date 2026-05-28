import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "failed" | "info";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md",
        variant === "neutral" && "bg-surface-alt text-muted",
        variant === "success" && "bg-accent-subtle text-accent",
        variant === "warning" && "bg-accent-subtle text-accent",
        variant === "failed" && "bg-accent-subtle text-accent",
        variant === "info" && "bg-accent-subtle text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
