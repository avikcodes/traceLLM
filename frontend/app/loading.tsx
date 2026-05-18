import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-3xl" />
      <Skeleton className="h-[480px] rounded-3xl" />
    </div>
  );
}
