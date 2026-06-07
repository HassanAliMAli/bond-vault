"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-warm-200 via-warm-100 to-warm-200 bg-[length:200%_100%]",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-full rounded-[var(--radius-sm)]",
        variant === "rectangular" && "rounded-[var(--radius-md)]",
        className
      )}
      {...props}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] bg-surface shadow-elevation-1 p-5 space-y-3">
      <Skeleton variant="circular" className="h-10 w-10" />
      <Skeleton variant="text" className="w-2/3" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-surface shadow-elevation-1">
          <Skeleton variant="circular" className="h-12 w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-2/3" />
          </div>
          <Skeleton variant="rectangular" className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-md)] bg-surface shadow-elevation-1 p-5 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="h-10 w-1/2" />
            <Skeleton variant="text" className="w-2/3" />
          </div>
        ))}
      </div>
      <div className="rounded-[var(--radius-md)] bg-surface shadow-elevation-1 p-5 space-y-4">
        <Skeleton variant="text" className="w-1/4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton, CardSkeleton, ListSkeleton, DashboardSkeleton };
export type { SkeletonProps };
