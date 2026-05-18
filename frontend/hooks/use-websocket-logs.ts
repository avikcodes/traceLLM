"use client";

import { useEffect, useMemo, useState } from "react";

import { mockTraces, seedLiveEvents } from "@/lib/mock-data";
import { LiveLogEvent } from "@/lib/types";

type ConnectionState = "connecting" | "open" | "closed" | "error";

const statusCycle: Array<LiveLogEvent["status"]> = ["success", "warning", "failed"];

export function useWebsocketLogs() {
  const [events, setEvents] = useState<LiveLogEvent[]>(seedLiveEvents);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  useEffect(() => {
    let heartbeat: ReturnType<typeof setInterval> | undefined;

    const appendEvent = (event: LiveLogEvent) => {
      setEvents((current) => [event, ...current].slice(0, 12));
    };

    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = () => {
      setConnectionState("open");

      heartbeat = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        }
      }, 5000);
    };

    socket.onmessage = (message) => {
      const raw = JSON.parse(message.data) as { status?: string; message?: string };

      appendEvent({
        id: `socket_${Date.now()}`,
        kind: "system",
        title: raw.status === "connected" ? "WebSocket connected" : "Gateway event",
        detail: raw.message ?? "TraceLLM websocket message received",
        timestamp: new Date().toISOString(),
        status: "info",
      });
    };

    socket.onerror = () => {
      setConnectionState("error");
    };

    socket.onclose = () => {
      setConnectionState("closed");
    };

    const simulator = setInterval(() => {
      const trace = mockTraces[Math.floor(Math.random() * mockTraces.length)];
      const status = statusCycle[Math.floor(Math.random() * statusCycle.length)];
      const latency = trace.latency + Math.floor(Math.random() * 180 - 60);

      appendEvent({
        id: `sim_${Date.now()}`,
        kind: Math.random() > 0.5 ? "trace" : "latency",
        title: Math.random() > 0.5 ? "Incoming trace observed" : "Latency window updated",
        detail:
          Math.random() > 0.5
            ? `${trace.traceId} streamed from ${trace.environment} on ${trace.model}`
            : `${trace.environment} median latency now ${Math.max(latency, 420)} ms`,
        timestamp: new Date().toISOString(),
        status,
      });
    }, 3200);

    return () => {
      if (heartbeat) {
        clearInterval(heartbeat);
      }
      clearInterval(simulator);
      socket?.close();
    };
  }, []);

  const activityLabel = useMemo(() => {
    if (connectionState === "open") {
      return "streaming";
    }
    if (connectionState === "connecting") {
      return "connecting";
    }
    return "mock fallback";
  }, [connectionState]);

  return { events, connectionState, activityLabel };
}
