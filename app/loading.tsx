import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <main className="p-4 lg:p-6 lg:max-w-6xl mx-auto w-full">
      <DashboardPageSkeleton />
    </main>
  );
}
