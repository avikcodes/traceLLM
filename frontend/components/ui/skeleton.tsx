import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-linear-to-r from-white/6 via-white/12 to-white/6 bg-[length:200%_100%]",
        className
      )}
    />
  );
}
