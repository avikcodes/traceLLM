import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-[0.16em] uppercase transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-white/12 bg-white/8 text-zinc-200",
        success: "border-emerald-400/20 bg-emerald-400/12 text-emerald-200",
        warning: "border-amber-400/20 bg-amber-400/12 text-amber-200",
        failed: "border-rose-400/20 bg-rose-400/12 text-rose-200",
        info: "border-cyan-400/20 bg-cyan-400/12 text-cyan-200",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
