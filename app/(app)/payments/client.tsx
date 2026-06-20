"use client";

import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePayments, usePlans } from "@/hooks/use-subscription";
import { Receipt, CreditCard, Check, X, Clock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow/10 text-yellow",
  approved: "bg-green/10 text-green",
  rejected: "bg-red/10 text-red",
};

export function PaymentsPageClient() {
  const router = useRouter();
  const { data: paymentsData, isLoading } = usePayments();
  const { data: plansData } = usePlans();

  const payments = paymentsData?.payments ?? [];
  const plans = plansData?.plans ?? [];

  return (
    <PageTransition className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Payment History</h1>
          <p className="text-sm text-gray mt-1">Your past payments and their status</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/settings")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Settings
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center">
                <Receipt className="h-7 w-7 text-gray" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-white">No payments yet</p>
                <p className="text-sm text-gray mt-1">When you make a payment, it will appear here.</p>
              </div>
              <Button variant="primary" onClick={() => router.push("/plans")}>
                <CreditCard className="h-4 w-4 mr-1" /> View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const plan = plans.find((p) => p.id === payment.planId);
            return (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-[var(--radius-md)] bg-dark-800 border border-dark-600">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    payment.status === "approved" ? "bg-green/10" :
                    payment.status === "rejected" ? "bg-red/10" : "bg-yellow/10"
                  )}>
                    {payment.status === "approved" ? <Check className="h-5 w-5 text-green" /> :
                     payment.status === "rejected" ? <X className="h-5 w-5 text-red" /> :
                     <Clock className="h-5 w-5 text-yellow" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{plan?.name ?? "Unknown Plan"}</p>
                    <p className="text-xs text-gray">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">${payment.amount.toFixed(2)}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                    STATUS_STYLES[payment.status] || "bg-gray/10 text-gray"
                  )}>{payment.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
