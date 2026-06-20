"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePlans, useCreatePayment, useUploadReceipt } from "@/hooks/use-subscription";
import { Upload, CreditCard, Check, ArrowLeft, Receipt, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CheckoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data: plansData, isLoading: plansLoading } = usePlans();
  const createPayment = useCreatePayment();
  const uploadReceipt = useUploadReceipt();

  const plan = plansData?.plans?.find((p) => p.id === planId);
  const isDone = uploadReceipt.isSuccess;

  const handleCreatePayment = async () => {
    if (!planId) return;
    createPayment.mutate(
      { planId },
      {
        onSuccess: (data) => {
          setPaymentId(data.paymentId);
          toast.success("Payment request created");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please upload an image or PDF receipt");
      return;
    }
    setReceiptFile(file);
  }, []);

  const handleUploadReceipt = async () => {
    if (!paymentId || !receiptFile) return;
    uploadReceipt.mutate(
      { paymentId, receipt: receiptFile },
      {
        onSuccess: () => toast.success("Receipt uploaded. Your payment is pending review."),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (!planId) {
    return (
      <PageTransition className="space-y-6 max-w-lg mx-auto">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-base text-white font-medium">Plan not found</p>
              <p className="text-sm text-gray">Please select a plan first.</p>
              <Button variant="primary" onClick={() => router.push("/plans")}>
                <ArrowLeft className="h-4 w-4 mr-1" /> View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  if (plansLoading) {
    return (
      <PageTransition className="space-y-6 max-w-lg mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      </PageTransition>
    );
  }

  if (!plan) {
    return (
      <PageTransition className="space-y-6 max-w-lg mx-auto">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-base text-white font-medium">Plan not found</p>
              <p className="text-sm text-gray">The selected plan is no longer available.</p>
              <Button variant="primary" onClick={() => router.push("/plans")}>
                <ArrowLeft className="h-4 w-4 mr-1" /> View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Checkout</h1>
          <p className="text-sm text-gray mt-1">Complete your subscription</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/plans")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Plans
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 rounded-[var(--radius-md)] bg-dark-800/80 border border-dark-600">
            <div>
              <p className="text-sm text-gray">Plan</p>
              <p className="text-lg font-bold text-white">{plan.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray">Amount</p>
              <p className="text-lg font-bold text-gold">${plan.priceUsd}</p>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray space-y-1">
            <p>• {plan.ocrLimit} OCR scans per month</p>
            <p>• {plan.durationDays} days duration</p>
            <p>• Includes all premium features</p>
          </div>
        </CardContent>
      </Card>

      {!paymentId && !isDone && (
        <Button variant="primary" size="lg" className="w-full" onClick={handleCreatePayment} loading={createPayment.isPending}>
          <CreditCard className="h-4 w-4 mr-1" /> Create Payment Request
        </Button>
      )}

      {paymentId && !isDone && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-gold" />
              Upload Payment Receipt
            </CardTitle>
            <CardDescription>Upload a screenshot or photo of your payment confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            {!receiptFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                className={cn(
                  "flex flex-col items-center gap-3 py-8 px-4 rounded-[var(--radius-md)] border-2 border-dashed transition-colors cursor-pointer",
                  dragOver ? "border-gold bg-gold/5" : "border-dark-600 hover:border-dark-500 bg-dark-800/50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-gold" />
                <div className="text-center">
                  <p className="text-sm font-medium text-white">Upload receipt</p>
                  <p className="text-xs text-gray mt-0.5">Image or PDF</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-dark-700">
                  <Receipt className="h-5 w-5 text-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{receiptFile.name}</p>
                    <p className="text-xs text-gray">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => setReceiptFile(null)} className="text-xs text-gray hover:text-white">Change</button>
                </div>
                <Button variant="primary" size="lg" className="w-full" onClick={handleUploadReceipt} loading={uploadReceipt.isPending}>
                  <Upload className="h-4 w-4 mr-1" /> Submit Receipt
                </Button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (fileInputRef.current) fileInputRef.current.value = ""; }} />
          </CardContent>
        </Card>
      )}

      {isDone && (
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-green" />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-white">Payment Submitted</p>
                <p className="text-sm text-gray mt-1">Your payment is pending admin review. You&apos;ll be notified once it&apos;s approved.</p>
              </div>
              <div className="flex gap-3 mt-2">
                <Button variant="primary" onClick={() => router.push("/settings")}>
                  View Subscription
                </Button>
                <Button variant="secondary" onClick={() => router.push("/plans")}>
                  Back to Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}
