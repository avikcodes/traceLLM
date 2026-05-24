"use client";

import { useEffect, useMemo, useState } from "react";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { Pause, Play, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatFullTimestamp } from "@/lib/format";
import { TraceStep } from "@/lib/types";

function stepVariant(step: TraceStep, active: boolean) {
  if (active) {
    return "border-cyan-300/35 bg-cyan-400/12 shadow-[0_0_32px_rgba(34,211,238,0.22)]";
  }
  return step.success
    ? "border-emerald-400/15 bg-white/[0.04]"
    : "border-rose-400/20 bg-rose-400/10";
}

export function ExecutionFlow({ steps }: { steps: TraceStep[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const safeActiveIndex = Math.min(activeIndex, Math.max(steps.length - 1, 0));

  useEffect(() => {
    if (!isPlaying || steps.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        if (current >= steps.length - 1) {
          setIsPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1300);

    return () => window.clearInterval(interval);
  }, [isPlaying, steps.length]);

  const nodes = useMemo<Node[]>(
    () =>
      steps.map((step, index) => {
        const active = index === safeActiveIndex;
        return {
          id: step.step_id,
          position: { x: index * 280, y: 30 + (index % 2) * 120 },
          data: {
            label: (
              <div
                className={`w-60 rounded-3xl border p-4 text-white backdrop-blur-xl transition-all duration-500 ${stepVariant(step, active)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-slate-950/70 text-cyan-200">
                    <Wrench className="size-4" />
                  </span>
                  <Badge variant={step.success ? "success" : "failed"}>
                    {active ? "active" : step.success ? "ok" : "failed"}
                  </Badge>
                </div>
                <p className="mt-4 font-heading text-lg">{step.tool_name}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {formatDuration(step.duration)} - {formatFullTimestamp(step.timestamp)}
                </p>
              </div>
            ),
          },
          draggable: false,
          selectable: false,
        };
      }),
    [safeActiveIndex, steps]
  );

  const edges = useMemo<Edge[]>(
    () =>
      steps.slice(0, -1).map((step, index) => ({
        id: `${step.step_id}-${steps[index + 1]?.step_id}`,
        source: step.step_id,
        target: steps[index + 1]?.step_id ?? step.step_id,
        animated: index < safeActiveIndex,
        style: {
          stroke: index < safeActiveIndex ? "#22d3ee" : "rgba(148,163,184,0.35)",
          strokeWidth: index === safeActiveIndex - 1 ? 3 : 2,
        },
      })),
    [safeActiveIndex, steps]
  );

  const activeStep = steps[safeActiveIndex];
  const progress = steps.length > 1 ? ((safeActiveIndex + 1) / steps.length) * 100 : 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="font-heading">Execution Replay</CardTitle>
          <CardDescription>
            Replay tool calls in order and inspect the active step like a workflow debugger.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-white/10 bg-white/6 text-white hover:bg-white/10"
            onClick={() => setIsPlaying((current) => !current)}
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            variant="outline"
            className="border-white/10 bg-white/6 text-white hover:bg-white/10"
            onClick={() => {
              setActiveIndex(0);
              setIsPlaying(false);
            }}
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-hidden rounded-full border border-white/10 bg-white/5">
          <div
            className="h-2 rounded-full bg-linear-to-r from-cyan-400 via-sky-300 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="h-[400px] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_34%),#020617]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            zoomOnScroll={false}
            fitViewOptions={{ padding: 0.22 }}
          >
            <MiniMap
              pannable
              zoomable
              style={{ background: "rgba(15, 23, 42, 0.95)" }}
              nodeColor={(node) => (node.id === activeStep?.step_id ? "#22d3ee" : "#334155")}
            />
            <Controls />
            <Background color="rgba(148, 163, 184, 0.12)" gap={20} />
          </ReactFlow>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-cyan-400/18 bg-cyan-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Active step</p>
            <p className="mt-3 font-heading text-3xl text-white">{activeStep?.tool_name ?? "No step"}</p>
            <p className="mt-3 text-sm leading-7 text-zinc-200">
              Duration {activeStep ? formatDuration(activeStep.duration) : "0 ms"} -{" "}
              {activeStep ? formatFullTimestamp(activeStep.timestamp) : "Waiting"}
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-zinc-300">
              <p className="font-medium text-white">Input</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6">
                {JSON.stringify(activeStep?.input ?? {}, null, 2)}
              </pre>
              <p className="mt-4 font-medium text-white">Output</p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6">
                {JSON.stringify(activeStep?.output ?? {}, null, 2)}
              </pre>
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <button
                key={step.step_id}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setIsPlaying(false);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${stepVariant(step, index === safeActiveIndex)}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">
                    {index + 1}. {step.tool_name}
                  </p>
                  <Badge variant={step.success ? "success" : "failed"}>
                    {step.success ? "success" : "failed"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-zinc-300">
                  {formatDuration(step.duration)} - {formatFullTimestamp(step.timestamp)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
