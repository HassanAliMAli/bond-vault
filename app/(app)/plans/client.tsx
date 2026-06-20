"use client";

import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlans, useCurrentSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { Check, X, Shield, Loader2 } from "lucide-react";

const FEATURES = [
  { key: "ocrLimit", label: "Monthly OCR Scans", free: "3", paid: (p: number) => `${p}` },
  { key: "importsEnabled", label: "CSV Import" },
  { key: "exportsEnabled", label: "CSV Export" },
  { key: "alertsEnabled", label: "Winner Alerts" },
  { key: "autoMonitoringEnabled", label: "Auto Monitoring" },
];

export function PlansPageClient() {
  const router = useRouter();
  const { data: plansData, isLoading } = usePlans();
  const { data: subscription } = useCurrentSubscription();

  const plans = plansData?.plans ?? [];

  if (isLoading) {
    return (
      <PageTransition className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">Choose Your Plan</h1>
          <p className="text-gray mt-2">Unlock premium features to manage your prize bond portfolio</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-white">Choose Your Plan</h1>
        <p className="text-gray mt-2">Unlock premium features to manage your prize bond portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id && subscription?.status === "active";
          const isFree = plan.priceUsd === 0;
          return (
            <Card
              key={plan.id}
              variant="elevated"
              className={cn(
                "relative flex flex-col transition-all duration-200",
                isCurrent && "ring-2 ring-gold"
              )}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold bg-gold text-dark-900 px-3 py-0.5 rounded-full">
                  Current
                </span>
              )}
              <CardContent className="flex flex-col gap-4 p-5 pt-6 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">${plan.priceUsd}</span>
                    {plan.durationDays > 0 && (
                      <span className="text-sm text-gray ml-1">
                        /{plan.durationDays <= 30 ? "mo" : `${plan.durationDays}d`}
                      </span>
                    )}
                  </div>
                  {plan.durationDays > 0 && (
                    <p className="text-xs text-gray mt-1">
                      ${(plan.priceUsd / (plan.durationDays / 30)).toFixed(2)}/month
                    </p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {FEATURES.map((f) => (
                    <div key={f.key} className="flex items-center gap-2 text-sm">
                      {f.key === "ocrLimit" ? (
                        <>
                          {isFree ? (
                            <Check className="h-3.5 w-3.5 text-green shrink-0" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-green shrink-0" />
                          )}
                          <span className="text-gray">{f.label}</span>
                          <span className="ml-auto text-white font-medium">
                            {isFree ? f.free : f.paid!(plan.ocrLimit)}
                          </span>
                        </>
                      ) : (
                        <>
                          {(plan as unknown as Record<string, boolean | number>)[f.key] ? (
                            <Check className="h-3.5 w-3.5 text-green shrink-0" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-red shrink-0" />
                          )}
                          <span className="text-gray">{f.label}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {isFree ? (
                  <Button variant="secondary" size="lg" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : isCurrent ? (
                  <Button variant="secondary" size="lg" className="w-full" disabled>
                    Active
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" className="w-full" onClick={() => router.push(`/plans/checkout?planId=${plan.id}`)}>
                    <Shield className="h-4 w-4 mr-1" /> Select {plan.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
}
