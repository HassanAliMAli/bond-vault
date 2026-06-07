"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-black/5 via-black/3 to-black/5 bg-[length:200%_100%]",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-full rounded-[var(--radius-sm)]",
        variant === "rectangular" && "rounded-[var(--radius-md)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
export type { SkeletonProps };
