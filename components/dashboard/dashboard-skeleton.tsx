import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <Skeleton variant="text" className="h-8 w-48 mb-1" />
        <Skeleton variant="text" className="h-5 w-32" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[var(--radius-md)] bg-surface shadow-elevation-1 p-5 space-y-3"
          >
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="h-10 w-24" />
            <Skeleton variant="text" className="w-32" />
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-md)] bg-surface shadow-elevation-1 p-5 space-y-4">
        <Skeleton variant="text" className="w-40" />
        <Skeleton variant="rectangular" className="h-3 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[var(--radius-md)] bg-warm-50 p-4 space-y-2">
              <Skeleton variant="text" className="w-16" />
              <Skeleton variant="text" className="h-8 w-12" />
              <Skeleton variant="text" className="w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[var(--radius-md)] bg-surface shadow-elevation-1 p-5 space-y-3">
          <Skeleton variant="text" className="w-36" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" className="h-9 w-9" />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" className="w-1/2" />
                <Skeleton variant="text" className="w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[var(--radius-md)] bg-surface shadow-elevation-1 p-5 space-y-3">
          <Skeleton variant="text" className="w-32" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius-md)]">
                <Skeleton variant="circular" className="h-11 w-11" />
                <Skeleton variant="text" className="w-16" />
                <Skeleton variant="text" className="w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
