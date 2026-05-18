"use client";

import { useMemo } from "react";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { Bot, Flag, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFullTimestamp } from "@/lib/mock-data";
import { ExecutionStep } from "@/lib/types";

function iconForStep(type: ExecutionStep["type"]) {
  if (type === "tool_call") {
    return <Wrench className="size-4" />;
  }
  if (type === "response") {
    return <Bot className="size-4" />;
  }
  return <Flag className="size-4" />;
}

export function ExecutionFlow({ steps }: { steps: ExecutionStep[] }) {
  const nodes = useMemo<Node[]>(
    () =>
      steps.map((step, index) => ({
        id: step.id,
        position: { x: index * 270, y: 50 },
        data: {
          label: (
            <div className="w-56 rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-200">
                  {iconForStep(step.type)}
                </span>
                <Badge
                  variant={
                    step.status === "success"
                      ? "success"
                      : step.status === "warning"
                        ? "warning"
                        : "failed"
                  }
                >
                  {step.status}
                </Badge>
              </div>
              <p className="mt-4 font-heading text-lg">{step.label}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{step.details}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                {formatFullTimestamp(step.timestamp)}
              </p>
            </div>
          ),
        },
        draggable: false,
        selectable: false,
      })),
    [steps]
  );

  const edges = useMemo<Edge[]>(
    () =>
      steps.slice(0, -1).map((step, index) => ({
        id: `${step.id}-${steps[index + 1]?.id}`,
        source: step.id,
        target: steps[index + 1]?.id ?? step.id,
        animated: true,
        style: {
          stroke: "#38bdf8",
          strokeWidth: 2,
        },
      })),
    [steps]
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="font-heading">Execution Timeline</CardTitle>
        <CardDescription>
          Start, tool calls, response generation, and final trace completion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_32%),#020617]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            panOnScroll
            zoomOnScroll={false}
            fitViewOptions={{ padding: 0.2 }}
          >
            <MiniMap
              pannable
              zoomable
              style={{ background: "rgba(15, 23, 42, 0.95)" }}
              nodeColor={() => "#38bdf8"}
            />
            <Controls />
            <Background color="rgba(148, 163, 184, 0.16)" gap={20} />
          </ReactFlow>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <div key={`${step.id}_list`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-white">{step.label}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{step.details}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
