import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "muted" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  default: "border-primary/30 bg-primary/10 text-primary",
  muted: "border-border bg-secondary text-muted-foreground",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  danger: "border-red-400/30 bg-red-400/10 text-red-300"
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
