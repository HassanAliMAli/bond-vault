"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "green" | "blue" | "red";
  size?: "sm" | "md";
}

const badgeVariants: Record<string, string> = {
  default: "bg-dark-700 text-gray border-dark-600",
  gold: "bg-gold/10 text-gold border-gold/20",
  green: "bg-green/10 text-green border-green/20",
  blue: "bg-blue/10 text-blue border-blue/20",
  red: "bg-red/10 text-red border-red/20",
};

const denomVariant: Record<string, BadgeProps["variant"]> = {
  "100": "default", "200": "gold", "750": "red",
  "1500": "blue", "7500": "green", "25000": "gold", "40000": "green",
};

function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium transition-colors",
      size === "sm" ? "text-xs" : "text-sm",
      badgeVariants[variant], className
    )} {...props} />
  );
}

function DenominationBadge({ denomination, className }: { denomination: number | string; className?: string }) {
  const d = String(denomination);
  return <Badge variant={denomVariant[d] || "default"} className={cn("tabular-nums", className)}>Rs. {d}</Badge>;
}

export { Badge, DenominationBadge };
export type { BadgeProps };
