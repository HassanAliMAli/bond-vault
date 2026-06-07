import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div><Skeleton variant="text" className="h-8 w-48 mb-1" /><Skeleton variant="text" className="h-5 w-32" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-5 space-y-3">
            <Skeleton variant="text" className="w-20" /><Skeleton variant="text" className="h-10 w-24" /><Skeleton variant="text" className="w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-5 space-y-4">
        <Skeleton variant="text" className="w-40" /><Skeleton variant="rectangular" className="h-3 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[var(--radius-md)] bg-dark-700 p-4 space-y-2">
              <Skeleton variant="text" className="w-16" /><Skeleton variant="text" className="h-8 w-12" /><Skeleton variant="text" className="w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
