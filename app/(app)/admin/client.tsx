"use client";

import { PageTransition } from "@/components/shared/page-transition";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "@/hooks/use-admin";
import { Users, TrendingUp, TicketCheck, Wallet, Crown } from "lucide-react";

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-5 flex items-start gap-4">
      <div className={`rounded-full p-3 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}

export function AdminDashboardClient() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <main className="p-4 lg:p-6 lg:max-w-6xl mx-auto w-full space-y-8">
        <div><Skeleton variant="text" className="h-8 w-48 mb-1" /><Skeleton variant="text" className="h-5 w-32" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-5 space-y-3">
              <Skeleton variant="text" className="w-20" /><Skeleton variant="text" className="h-10 w-16" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ErrorState title="Could not load admin dashboard" onRetry={() => refetch()} />
      </div>
    );
  }

  const s = data!.stats;

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray mt-1">Full control over BondVault</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users className="h-5 w-5 text-blue" />} label="Total Users" value={s.totalUsers} color="bg-blue/10" />
        <StatCard icon={<TicketCheck className="h-5 w-5 text-gold" />} label="Total Bonds" value={s.totalBonds} color="bg-gold/10" />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-green" />} label="Total Matches" value={s.totalMatches} color="bg-green/10" />
        <StatCard icon={<Wallet className="h-5 w-5 text-red" />} label="Pending Payments" value={s.pendingPayments} color="bg-red/10" />
        <StatCard icon={<Crown className="h-5 w-5 text-purple" />} label="Active Subs" value={s.activeSubscriptions} color="bg-purple/10" />
      </div>

      <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Quick Links</h2>
        <p className="text-sm text-gray mb-4">Manage your platform from the sidebar.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: "/admin/users", label: "Users", icon: Users },
            { href: "/admin/payments", label: "Payments", icon: Wallet },
            { href: "/admin/draws", label: "Draws", icon: TrendingUp },
            { href: "/admin/settings", label: "Settings", icon: Crown },
            { href: "/admin/audit", label: "Audit Logs", icon: TicketCheck },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="rounded-[var(--radius-sm)] bg-dark-700 hover:bg-dark-600 border border-dark-600 p-4 text-center transition-colors">
              <item.icon className="h-5 w-5 text-gold mx-auto mb-1" />
              <span className="text-sm text-white font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
