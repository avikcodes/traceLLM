"use client";

import { Activity, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebsocketLogs } from "@/hooks/use-websocket-logs";
import { formatTimestamp } from "@/lib/format";
import { LiveLogEvent } from "@/lib/types";

const eventVariant: Record<LiveLogEvent["status"], "success" | "warning" | "failed" | "info"> = {
  success: "success",
  warning: "warning",
  failed: "failed",
  info: "info",
};

export function LiveLogsPanel() {
  const { activityLabel, connectionState, events } = useWebsocketLogs();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="font-heading">Realtime Activity</CardTitle>
            <span className="flex items-center gap-2 rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
              <Radio className="size-3 animate-pulse" />
              {activityLabel}
            </span>
          </div>
          <CardDescription>
            Live incoming traces, latency updates, and websocket connection events.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Activity className="size-4 text-emerald-300" />
          Connection: {connectionState}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length ? events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.05] lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Badge variant={eventVariant[event.status]}>{event.kind}</Badge>
                  <p className="font-medium text-white">{event.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{event.detail}</p>
              </div>
              <p className="text-sm text-zinc-500">{formatTimestamp(event.timestamp)}</p>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
              Waiting for realtime websocket events from the backend.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
