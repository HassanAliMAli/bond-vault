import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

global.fetch = vi.fn();
const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

function mockJsonResponse(data: unknown) {
  return { ok: true, json: async () => ({ success: true, data }) };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "Wrapper";
  return Wrapper;
}

describe("useAdminDashboard", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches dashboard stats from /api/v1/admin/dashboard", async () => {
    const stats = { stats: { totalUsers: 10, totalBonds: 100, totalMatches: 50, pendingPayments: 3, activeSubscriptions: 5 } };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(stats));

    const { useAdminDashboard } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useAdminDashboard(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(stats);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/dashboard", expect.any(Object));
  });
});

describe("useAdminUsers", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches users with search and page params", async () => {
    const data = { users: [{ id: "u1", email: "test@test.com", status: "active" }], total: 1 };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

    const { useAdminUsers } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useAdminUsers("test", 1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/users?search=test&page=1&limit=20", expect.any(Object));
  });
});

describe("useAdminPayments", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches payments with status filter", async () => {
    const data = { payments: [{ id: "p1", amount: 5000, status: "pending" }], total: 1 };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

    const { useAdminPayments } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useAdminPayments("pending"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/payments?status=pending&page=1&limit=20", expect.any(Object));
  });
});

describe("useApprovePayment", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("approves a payment via POST", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({}));

    const { useApprovePayment } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useApprovePayment(), { wrapper: createWrapper() });

    result.current.mutate("pay_1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/payments/pay_1/approve", expect.objectContaining({ method: "POST" }));
  });
});

describe("useRejectPayment", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("rejects a payment via POST", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({}));

    const { useRejectPayment } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useRejectPayment(), { wrapper: createWrapper() });

    result.current.mutate("pay_1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/payments/pay_1/reject", expect.objectContaining({ method: "POST" }));
  });
});

describe("useAdminDraws", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches draws with search", async () => {
    const data = { draws: [{ id: "d1", denomination: 100, drawNumber: "100", drawDate: "2025-01-15" }], total: 1 };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

    const { useAdminDraws } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useAdminDraws("100"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/draws?search=100&page=1&limit=20", expect.any(Object));
  });
});

describe("useCreateDraw", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a draw via POST", async () => {
    const created = { id: "d_new", denomination: 750, drawNumber: "99" };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(created));

    const { useCreateDraw } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useCreateDraw(), { wrapper: createWrapper() });

    result.current.mutate({ denomination: 750, drawNumber: "99", drawDate: "2025-06-15" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/draws", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ denomination: 750, drawNumber: "99", drawDate: "2025-06-15" }),
    }));
  });
});

describe("useAuditLogs", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches audit logs with date range filter", async () => {
    const data = { logs: [{ id: "a1", action: "user.login", userId: "u1" }], total: 1 };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

    const { useAuditLogs } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useAuditLogs({ startDate: "2025-01-01", endDate: "2025-06-01" }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/audit-logs?startDate=2025-01-01&endDate=2025-06-01&page=1&limit=50", expect.any(Object));
  });
});

describe("useAdminSettings", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches settings from /api/v1/admin/settings", async () => {
    const data = { settings: [{ key: "site_name", value: "BondVault" }] };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(data));

    const { useAdminSettings } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useAdminSettings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/settings", expect.any(Object));
  });
});

describe("useUpdateSetting", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("updates a setting via PATCH", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({}));

    const { useUpdateSetting } = await import("@/hooks/use-admin");
    const { result } = renderHook(() => useUpdateSetting(), { wrapper: createWrapper() });

    result.current.mutate({ key: "site_name", value: "BondVault Pro" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/admin/settings", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ key: "site_name", value: "BondVault Pro" }),
    }));
  });
});
