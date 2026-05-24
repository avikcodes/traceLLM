"use client";

import { useObservabilityStream } from "@/components/providers/observability-provider";

export function useWebsocketLogs() {
  return useObservabilityStream();
}
