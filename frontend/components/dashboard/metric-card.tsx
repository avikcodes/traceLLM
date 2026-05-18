"use client";

import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetric } from "@/lib/types";

export function MetricCard({
  metric,
  loading,
}: {
  metric: DashboardMetric;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription className="text-zinc-400">{metric.label}</CardDescription>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-200">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <CardTitle className="font-heading text-3xl">{metric.value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-emerald-300">{metric.delta}</span>
        <span className="text-right text-zinc-400">{metric.hint}</span>
      </CardContent>
    </Card>
  );
}
