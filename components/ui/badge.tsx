"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "emerald" | "amber" | "rose" | "violet";
  size?: "sm" | "md";
}

const badgeVariants: Record<string, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
};

const denomVariant: Record<string, BadgeProps["variant"]> = {
  "100": "default",
  "200": "amber",
  "750": "rose",
  "1500": "violet",
  "7500": "emerald",
  "25000": "amber",
  "40000": "emerald",
};

function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans font-medium transition-colors",
        size === "sm" ? "text-xs" : "text-sm",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

function DenominationBadge({ denomination, className }: { denomination: string; className?: string }) {
  const v = denomVariant[denomination] || "default";
  return (
    <Badge variant={v} className={cn("font-mono tabular-nums", className)}>
      Rs. {denomination}
    </Badge>
  );
}

export { Badge, DenominationBadge };
export type { BadgeProps };
