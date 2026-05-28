import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-surface-alt rounded-lg animate-pulse", className)}
      {...props}
    />
  );
}
