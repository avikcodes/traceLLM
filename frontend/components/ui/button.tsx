import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "default",
  size = "sm",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors rounded-lg",
        size === "sm" && "text-sm px-3 py-1.5",
        size === "md" && "text-sm px-4 py-2",
        variant === "default" && "bg-accent text-white hover:bg-accent-hover",
        variant === "outline" && "bg-transparent text-muted hover:text-foreground border border-border",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
