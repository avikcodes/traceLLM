"use client";

import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

import { fetchProjects, getWebSocketUrl } from "@/lib/api";
import { ConnectionState, LiveLogEvent, ProjectRecord, SocketMessage, TraceRecord } from "@/lib/types";

interface ObservabilityContextValue {
  activityLabel: string;
  connectionState: ConnectionState;
  events: LiveLogEvent[];
  eventVersion: number;
  latestTrace: TraceRecord | null;
  projects: ProjectRecord[];
  selectedEnvironment: string;
  selectedProjectId: string;
  setSelectedEnvironment: (value: string) => void;
  setSelectedProjectId: (value: string) => void;
  socketUrl: string;
}

const ObservabilityContext = createContext<ObservabilityContextValue | null>(null);

function traceToEvents(trace: TraceRecord): LiveLogEvent[] {
  const baseEvent: LiveLogEvent = {
    id: `trace_${trace.trace_id}_${trace.updated_at}`,
    kind: "trace",
    title: `Trace ${trace.status}`,
    detail: `${trace.trace_id} on ${trace.model_name ?? "unknown"} finished in ${Math.round(trace.latency)} ms`,
    timestamp: trace.created_at,
    status: trace.status,
  };

  if (trace.status === "failed" || trace.slow_request || trace.retry_count > 0) {
    return [
      {
        id: `failure_${trace.trace_id}_${trace.updated_at}`,
        kind: "failure",
        title: trace.status === "failed" ? "Failure detected" : "Warning detected",
        detail:
          trace.failure_reason ??
          [
            trace.retry_count > 0 ? `${trace.retry_count} retry` : null,
            trace.slow_request ? "slow request" : null,
          ]
            .filter(Boolean)
            .join(", "),
        timestamp: trace.updated_at,
        status: trace.status === "success" ? "warning" : trace.status,
      },
      baseEvent,
    ];
  }

  return [baseEvent];
}

export function ObservabilityProvider({ children }: { children: React.ReactNode }) {
  const socketUrl = useMemo(() => getWebSocketUrl(), []);
  const [events, setEvents] = useState<LiveLogEvent[]>([]);
  const [latestTrace, setLatestTrace] = useState<TraceRecord | null>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [eventVersion, setEventVersion] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [selectedEnvironment, setSelectedEnvironment] = useState("all");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const savedProjectId = window.localStorage.getItem("tracellm.project_id");
    const savedEnvironment = window.localStorage.getItem("tracellm.environment");
    if (savedProjectId) {
      setSelectedProjectId(savedProjectId);
    }
    if (savedEnvironment) {
      setSelectedEnvironment(savedEnvironment);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("tracellm.project_id", selectedProjectId);
    window.localStorage.setItem("tracellm.environment", selectedEnvironment);
  }, [selectedEnvironment, selectedProjectId]);

  useEffect(() => {
    let cancelled = false;
    fetchProjects()
      .then((result) => {
        if (!cancelled) {
          setProjects(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProjects([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventVersion]);

  const appendEvents = useEffectEvent((nextEvents: LiveLogEvent[]) => {
    setEvents((current) => [...nextEvents, ...current].slice(0, 20));
  });

  const handleMessage = useEffectEvent((message: SocketMessage) => {
    if (message.type === "trace.created") {
      setLatestTrace(message.trace);
      setEventVersion((current) => current + 1);
      appendEvents(traceToEvents(message.trace));
      return;
    }

    appendEvents([
      {
        id: `system_${Date.now()}`,
        kind: "system",
        title: message.type === "system.connected" ? "Socket connected" : "Socket heartbeat",
        detail: message.message ?? "Realtime observability stream active",
        timestamp: new Date().toISOString(),
        status: "info",
      },
    ]);
  });

  useEffect(() => {
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      setConnectionState("open");
      heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        }
      }, 5000);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as SocketMessage;
        handleMessage(message);
      } catch {
        appendEvents([
          {
            id: `system_parse_${Date.now()}`,
            kind: "system",
            title: "Socket parse warning",
            detail: "Received an unexpected websocket payload.",
            timestamp: new Date().toISOString(),
            status: "warning",
          },
        ]);
      }
    };

    socket.onerror = () => {
      setConnectionState("error");
    };

    socket.onclose = () => {
      setConnectionState("closed");
    };

    return () => {
      if (heartbeat) {
        clearInterval(heartbeat);
      }
      socket.close();
    };
  }, [socketUrl]);

  const activityLabel =
    connectionState === "open"
      ? "streaming"
      : connectionState === "connecting"
        ? "connecting"
        : "reconnecting";

  return (
    <ObservabilityContext.Provider
      value={{
        activityLabel,
        connectionState,
        events,
        eventVersion,
        latestTrace,
        projects,
        selectedEnvironment,
        selectedProjectId,
        setSelectedEnvironment,
        setSelectedProjectId,
        socketUrl,
      }}
    >
      {children}
    </ObservabilityContext.Provider>
  );
}

export function useObservabilityStream() {
  const context = useContext(ObservabilityContext);
  if (!context) {
    throw new Error("useObservabilityStream must be used inside ObservabilityProvider");
  }
  return context;
}
