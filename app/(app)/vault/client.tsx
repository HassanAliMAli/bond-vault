"use client";

import { PageTransition } from "@/components/shared/page-transition";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { DenominationBreakdown } from "@/components/dashboard/denomination-breakdown";
import { RecentWinners } from "@/components/dashboard/recent-winners";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useDashboard } from "@/hooks/use-matches";
import { useRouter } from "next/navigation";

export function VaultPageClient() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return (
      <main className="p-4 lg:p-6 lg:max-w-6xl mx-auto w-full">
        <DashboardPageSkeleton />
      </main>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ErrorState
          title="Could not load dashboard"
          description="Something went wrong while loading your portfolio."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!data || data.totalBonds === 0) {
    return (
      <PageTransition>
        <EmptyState illustration="vault" title="Your vault is empty"
          description="Add your first prize bond to start building your digital portfolio."
          action={{ label: "Add Your First Bond", onClick: () => router.push("/bonds/add") }} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <div><h1 className="text-2xl lg:text-3xl font-bold text-white">Welcome back</h1><p className="text-sm text-gray mt-1">Your bond vault at a glance</p></div>
      <PortfolioSummary totalBonds={data.totalBonds} totalChecked={data.totalChecked} totalMatches={data.totalMatches} />
      <DenominationBreakdown data={data.denominations} total={data.totalBonds} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><RecentWinners winners={data.winners} /></div>
        <div><QuickActions /></div>
      </div>
    </PageTransition>
  );
}
