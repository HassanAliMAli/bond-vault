"use client";

import { useState } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { useAdminPayments, useApprovePayment, useRejectPayment, type Payment } from "@/hooks/use-admin";
import { Check, X } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-gold/10 text-gold border border-gold/30",
  approved: "bg-green/10 text-green border border-green/30",
  rejected: "bg-red/10 text-red border border-red/30",
};

export function AdminPaymentsClient() {
  const [filter, setFilter] = useState<string>("pending");
  const { data, isLoading, isError, refetch } = useAdminPayments(filter);
  const approve = useApprovePayment();
  const reject = useRejectPayment();

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Payments</h1>
        <p className="text-sm text-gray mt-1">Review and manage subscription payments</p>
      </div>

      <div className="flex items-center gap-2">
        {["pending", "approved", "rejected"].map(s => (
          <button key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors ${
              filter === s ? "bg-gold/10 text-gold border border-gold/30" : "bg-dark-800 text-gray border border-dark-600 hover:text-white"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 p-6">
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-dark-700 rounded-[var(--radius-sm)] animate-pulse" />)}
          </div>
        </div>
      ) : isError ? (
        <ErrorState title="Could not load payments" onRetry={() => refetch()} />
      ) : !data?.payments.length ? (
        <EmptyState title="No payments" description={`No ${filter} payments to review`} />
      ) : (
        <div className="rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left py-3 px-4 text-gray font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Method</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray font-medium">Date</th>
                  <th className="text-right py-3 px-4 text-gray font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p: Payment) => (
                  <tr key={p.id} className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">Rs. {p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray">{p.method || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[p.status] || statusColors.pending}>{p.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      {p.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => approve.mutate(p.id)}
                            className="text-green hover:text-green-light transition-colors p-1" title="Approve">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => { if (confirm("Reject this payment?")) reject.mutate(p.id); }}
                            className="text-red hover:text-red-light transition-colors p-1" title="Reject">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray">{p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString() : "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
