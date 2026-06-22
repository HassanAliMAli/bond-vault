"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface Plan {
  id: string;
  name: string;
  priceUsd: number;
  durationDays: number;
  ocrLimit: number;
  importsEnabled: boolean;
  alertsEnabled: boolean;
  exportsEnabled: boolean;
  autoMonitoringEnabled: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "grace_period" | "expired" | "cancelled";
  startedAt: string;
  expiresAt: string;
  graceEndsAt: string | null;
}

export interface PaymentResult {
  paymentId: string;
  amount: number;
  planId: string;
  planName: string;
  status: string;
}

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => api.plans.list() as Promise<{ plans: Plan[] }>,
    staleTime: 300_000,
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => api.subscription.current() as Promise<Subscription | null>,
    staleTime: 60_000,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { planId: string }) => api.payments.create(data) as Promise<PaymentResult>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useUploadReceipt() {
  return useMutation({
    mutationFn: ({ paymentId, receipt }: { paymentId: string; receipt: File }) =>
      api.payments.uploadReceipt(paymentId, receipt),
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => api.payments.list() as Promise<{ payments: Payment[] }>,
    staleTime: 30_000,
  });
}

export function useOcrUsage() {
  return useQuery({
    queryKey: ["ocr", "usage"],
    queryFn: () => api.ocr.usage(),
    staleTime: 60_000,
  });
}
