"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function adminFetch<T>(endpoint: string, config: { method?: string; body?: unknown; params?: Record<string, string | undefined> } = {}): Promise<T> {
  const { method = "GET", body, params } = config;
  let url = `/api/v1${endpoint}`;
  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) sp.set(k, v); });
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const json: { success: boolean; data: T; error?: { message: string } } = await res.json();
  if (!json.success) throw new Error(json.error?.message || "Admin API error");
  return json.data;
}

interface DashboardStats {
  stats: {
    totalUsers: number; totalBonds: number; totalMatches: number;
    pendingPayments: number; activeSubscriptions: number;
  };
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminFetch<DashboardStats>("/admin/dashboard"),
  });
}

export type AdminUser = {
  id: string; email: string; name: string; fullName: string; status: string;
  phone: string; whatsappNumber: string; emailVerified: number;
  createdAt: string; lastLoginAt: string | null;
};

interface AdminUsersResponse {
  users: AdminUser[]; total: number;
}

export function useAdminUsers(search?: string, page?: number) {
  return useQuery({
    queryKey: ["admin", "users", search, page],
    queryFn: () => adminFetch<AdminUsersResponse>("/admin/users", {
      params: { search, page: String(page || 1), limit: "20" },
    }),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => adminFetch<AdminUser>("/admin/users/" + id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      adminFetch("/admin/users/" + id, { method: "PATCH", body: data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); qc.invalidateQueries({ queryKey: ["admin", "user"] }); },
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch("/admin/users/" + id + "/suspend", { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); qc.invalidateQueries({ queryKey: ["admin", "user"] }); },
  });
}

export function useRestoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch("/admin/users/" + id + "/restore", { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); qc.invalidateQueries({ queryKey: ["admin", "user"] }); },
  });
}

export type Payment = {
  id: string; userId: string; amount: number; status: string;
  method: string; receiptUrl: string | null; reviewedBy: string | null;
  reviewedAt: string | null; createdAt: string;
};

export function useAdminPayments(status?: string) {
  return useQuery({
    queryKey: ["admin", "payments", status],
    queryFn: () => adminFetch<{ payments: Payment[] }>("/admin/payments", { params: { status } }),
  });
}

export function useApprovePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch("/admin/payments/" + id + "/approve", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payments"] }),
  });
}

export function useRejectPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch("/admin/payments/" + id + "/reject", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payments"] }),
  });
}

export type Draw = {
  id: string; denomination: number; drawNumber: string; drawDate: string;
  source: string | null; pdfR2Key: string | null; createdAt: string;
};

export function useAdminDraws() {
  return useQuery({
    queryKey: ["admin", "draws"],
    queryFn: () => adminFetch<{ draws: Draw[] }>("/admin/draws"),
  });
}

export function useCreateDraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { denomination: number; drawNumber: string; drawDate: string; source?: string }) =>
      adminFetch("/admin/draws", { method: "POST", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "draws"] }),
  });
}

export function useUploadDrawPdf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.set("pdf", file);
      const res = await fetch(`/api/v1/admin/draws/${id}/pdf`, { method: "POST", body: form, credentials: "include" });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "draws"] }),
  });
}

export function useAddWinners() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, winners }: { id: string; winners: { bondNumber: string; prizeType: string; prizeAmount: number }[] }) =>
      adminFetch("/admin/draws/" + id + "/winners", { method: "POST", body: { winners } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "draws"] }),
  });
}

export function useGenerateMatches() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch("/admin/draws/" + id + "/generate-matches", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "draws"] }),
  });
}

export type AuditLog = {
  id: string; userId: string; action: string; entityType: string;
  entityId: string | null; metadata: string | null; ipAddress: string | null; createdAt: string;
};

export function useAuditLogs(filters?: { userId?: string; entityType?: string; startDate?: string; endDate?: string; page?: number }) {
  return useQuery({
    queryKey: ["admin", "audit", filters],
    queryFn: () => adminFetch<{ logs: AuditLog[]; total: number }>("/admin/audit-logs", {
      params: { ...filters, page: String(filters?.page || 1), limit: "50" } as Record<string, string | undefined>,
    }),
  });
}

export type SettingsItem = { key: string; value: string; updatedAt: string };

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminFetch<{ settings: SettingsItem[] }>("/admin/settings"),
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string; value: string }) =>
      adminFetch("/admin/settings", { method: "PATCH", body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}
