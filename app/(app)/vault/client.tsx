"use client";

import { PageTransition } from "@/components/shared/page-transition";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { DenominationBreakdown } from "@/components/dashboard/denomination-breakdown";
import { RecentWinners } from "@/components/dashboard/recent-winners";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { useRouter } from "next/navigation";

const MOCK_DATA = {
  totalBonds: 127,
  totalChecked: 15,
  totalMatches: 3,
  denominations: [
    { denomination: "100", count: 42, color: "warm" },
    { denomination: "200", count: 38, color: "amber" },
    { denomination: "750", count: 22, color: "rose" },
    { denomination: "1500", count: 15, color: "violet" },
    { denomination: "7500", count: 7, color: "emerald" },
    { denomination: "25000", count: 3, color: "gold" },
  ],
  winners: [
    {
      id: "1",
      bondNumber: "447892",
      denomination: "200",
      prizeType: "2nd Prize",
      prizeAmount: "Rs. 40,000",
      drawDate: "Jun 1, 2026",
    },
    {
      id: "2",
      bondNumber: "128367",
      denomination: "200",
      prizeType: "3rd Prize",
      prizeAmount: "Rs. 15,000",
      drawDate: "May 15, 2026",
    },
    {
      id: "3",
      bondNumber: "882341",
      denomination: "750",
      prizeType: "3rd Prize",
      prizeAmount: "Rs. 7,500",
      drawDate: "May 15, 2026",
    },
  ],
};

const EMPTY_DATA = {
  totalBonds: 0,
  totalChecked: 0,
  totalMatches: 0,
  denominations: [],
  winners: [],
};

export function VaultPageClient() {
  const router = useRouter();
  const data = MOCK_DATA; // TODO: Replace with real data
  const isEmpty = data.totalBonds === 0;

  if (isEmpty) {
    return (
      <PageTransition>
        <EmptyState
          illustration="vault"
          title="Your vault is empty"
          description="Add your first prize bond to start building your digital portfolio. We'll track draws and notify you of any wins."
          action={{
            label: "Add Your First Bond",
            onClick: () => router.push("/bonds/add"),
          }}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-900">
          Welcome back
        </h1>
        <p className="text-sm text-muted mt-1">Your bond vault at a glance</p>
      </div>

      <PortfolioSummary
        totalBonds={data.totalBonds}
        totalChecked={data.totalChecked}
        totalMatches={data.totalMatches}
      />

      <DenominationBreakdown
        data={data.denominations}
        total={data.totalBonds}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentWinners winners={data.winners} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </PageTransition>
  );
}
