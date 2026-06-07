"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "emerald" | "rose" | "violet" | "amber";
  size?: "sm" | "md";
}

const badgeVariants: Record<string, string> = {
  default: "bg-warm-100 text-warm-700 border-warm-200",
  gold: "bg-gold-50 text-gold-700 border-gold-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
};

const denominationColors: Record<string, string> = {
  "100": "badge-warm",
  "200": "badge-amber",
  "750": "badge-rose",
  "1500": "badge-violet",
  "7500": "badge-emerald",
  "25000": "badge-gold",
  "40000": "badge-gold",
};

function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
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

function DenominationBadge({
  denomination,
  className,
}: {
  denomination: string;
  className?: string;
}) {
  const variantKey = denominationColors[denomination] || "default";
  const variant = variantKey.replace("badge-", "") as BadgeProps["variant"];

  return (
    <Badge variant={variant} className={cn("font-mono tabular-nums", className)}>
      Rs. {denomination}
    </Badge>
  );
}

export { Badge, DenominationBadge };
export type { BadgeProps };
