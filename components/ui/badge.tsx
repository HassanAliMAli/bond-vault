"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "cyan" | "green" | "amber" | "orange";
  size?: "sm" | "md";
}

const badgeVariants: Record<string, string> = {
  default: "bg-black/5 text-black border-black/10",
  cyan: "bg-cyan/10 text-black border-cyan/30",
  green: "bg-green/10 text-black border-green/30",
  amber: "bg-amber/10 text-black border-amber/30",
  orange: "bg-orange/10 text-black border-orange/30",
};

const denomVariant: Record<string, BadgeProps["variant"]> = {
  "100": "default",
  "200": "amber",
  "750": "orange",
  "1500": "cyan",
  "7500": "green",
  "25000": "amber",
  "40000": "green",
};

function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium transition-colors",
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
    <Badge variant={v} className={cn("tabular-nums", className)}>
      Rs. {denomination}
    </Badge>
  );
}

export { Badge, DenominationBadge };
export type { BadgeProps };
