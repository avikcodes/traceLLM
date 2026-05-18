"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartPoint } from "@/lib/types";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-6 text-sm">
          <span className="text-zinc-400">{item.name}</span>
          <span className="font-medium text-white">{item.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCardFrame({
  title,
  description,
  loading,
  children,
}: {
  title: string;
  description: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="font-heading">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-[280px] w-full rounded-3xl" /> : children}
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  data,
  loading,
}: {
  data: ChartPoint[];
  loading?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const shouldShowSkeleton = loading || !mounted;

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <ChartCardFrame
        title="Latency Trend"
        description="Median completion time over recent traffic windows."
        loading={shouldShowSkeleton}
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="latencyGlow" x1="0" x2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="url(#latencyGlow)"
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 5, fill: "#22d3ee", stroke: "#0f172a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCardFrame>

      <ChartCardFrame
        title="Token Usage"
        description="Prompt and completion volume flowing through the platform."
        loading={shouldShowSkeleton}
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tokenFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#38bdf8"
                fill="url(#tokenFill)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCardFrame>

      <ChartCardFrame
        title="Traces Over Time"
        description="Ingestion throughput across recent windows."
        loading={shouldShowSkeleton}
      >
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8}>
              <defs>
                <linearGradient id="tracesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="traces" fill="url(#tracesFill)" radius={[12, 12, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCardFrame>
    </div>
  );
}
