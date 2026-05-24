"use client";

import { useEffect, useMemo, useState } from "react";

import { useObservabilityStream } from "@/components/providers/observability-provider";
import { fetchAnalytics, fetchFailures, fetchTrace, fetchTraces } from "@/lib/api";
import { AnalyticsResponse, FailureResponse, TraceFilters, TraceListResponse, TraceRecord } from "@/lib/types";

function traceMatchesFilters(trace: TraceRecord, filters: TraceFilters) {
  if (filters.status && trace.status !== filters.status) {
    return false;
  }
  if (filters.model && trace.model_name !== filters.model) {
    return false;
  }
  if (filters.latency_min !== undefined && trace.latency < filters.latency_min) {
    return false;
  }
  if (filters.latency_max !== undefined && trace.latency > filters.latency_max) {
    return false;
  }
  if (filters.token_min !== undefined && trace.token_count < filters.token_min) {
    return false;
  }
  if (filters.token_max !== undefined && trace.token_count > filters.token_max) {
    return false;
  }
  if (filters.project_id && trace.project_id !== filters.project_id) {
    return false;
  }
  if (filters.environment && trace.environment !== filters.environment) {
    return false;
  }
  return true;
}

export function useRealtimeTraces(filters: TraceFilters) {
  const { latestTrace, selectedEnvironment, selectedProjectId } = useObservabilityStream();
  const [data, setData] = useState<TraceListResponse>({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const mergedFilters = useMemo(
    () => ({
      ...filters,
      project_id: selectedProjectId === "all" ? undefined : selectedProjectId,
      environment: selectedEnvironment === "all" ? undefined : selectedEnvironment,
    }),
    [filters, selectedEnvironment, selectedProjectId],
  );
  const filterKey = JSON.stringify(mergedFilters);

  useEffect(() => {
    let cancelled = false;
    const parsedFilters = JSON.parse(filterKey) as TraceFilters;
    fetchTraces(parsedFilters)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filterKey]);

  const mergedData = useMemo(() => {
    if (!latestTrace || !traceMatchesFilters(latestTrace, mergedFilters)) {
      return data;
    }

    const withoutCurrent = data.items.filter((trace) => trace.trace_id !== latestTrace.trace_id);
    const limit = mergedFilters.limit ?? 50;
    return {
      total: data.total + (withoutCurrent.length === data.items.length ? 1 : 0),
      items: [latestTrace, ...withoutCurrent].slice(0, limit),
    };
  }, [data, mergedFilters, latestTrace]);

  return { ...mergedData, loading };
}

export function useRealtimeAnalytics() {
  const { eventVersion, selectedEnvironment, selectedProjectId } = useObservabilityStream();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAnalytics({
      project_id: selectedProjectId === "all" ? undefined : selectedProjectId,
      environment: selectedEnvironment === "all" ? undefined : selectedEnvironment,
    })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventVersion, selectedEnvironment, selectedProjectId]);

  return { data, loading };
}

export function useRealtimeFailures(limit = 25) {
  const { eventVersion, selectedEnvironment, selectedProjectId } = useObservabilityStream();
  const [data, setData] = useState<FailureResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchFailures(limit, {
      project_id: selectedProjectId === "all" ? undefined : selectedProjectId,
      environment: selectedEnvironment === "all" ? undefined : selectedEnvironment,
    })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventVersion, limit, selectedEnvironment, selectedProjectId]);

  return { data, loading };
}

export function useRealtimeTrace(traceId: string) {
  const { latestTrace } = useObservabilityStream();
  const [fetchedTrace, setFetchedTrace] = useState<TraceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTrace(traceId)
      .then((result) => {
        if (!cancelled) {
          setFetchedTrace(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [traceId]);

  const trace = useMemo(() => {
    if (latestTrace?.trace_id === traceId) {
      return latestTrace;
    }
    return fetchedTrace;
  }, [fetchedTrace, latestTrace, traceId]);

  return { trace, loading };
}
