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

describe("usePlans", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches plans from /api/v1/plans", async () => {
    const plansData = { plans: [{ id: "plan_1", name: "Monthly", priceUsd: 10 }] };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(plansData));

    const { usePlans } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => usePlans(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(plansData);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/plans", expect.any(Object));
  });
});

describe("useCurrentSubscription", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns subscription when user is subscribed", async () => {
    const sub = { id: "sub_1", planId: "plan_monthly", status: "active" };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(sub));

    const { useCurrentSubscription } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => useCurrentSubscription(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sub);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/subscription/current", expect.any(Object));
  });

  it("returns null when user has no subscription", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse(null));

    const { useCurrentSubscription } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => useCurrentSubscription(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("handles API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: false, error: { message: "Unauthorized" } }) });

    const { useCurrentSubscription } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => useCurrentSubscription(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("usePayments", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches payments from /api/v1/payments", async () => {
    const paymentsData = { payments: [{ id: "pay_1", amount: 1000, status: "pending" }] };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(paymentsData));

    const { usePayments } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(paymentsData);
  });

  it("returns empty array when no payments exist", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ payments: [] }));

    const { usePayments } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.payments).toEqual([]);
  });
});

describe("useOcrUsage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches OCR usage from /api/v1/ocr/usage", async () => {
    const usageData = { used: 2, remaining: 48, limit: 50 };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(usageData));

    const { useOcrUsage } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => useOcrUsage(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(usageData);
  });
});

describe("useCreatePayment", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a payment via POST /api/v1/payments", async () => {
    const paymentResult = { paymentId: "pay_new", amount: 1000, planId: "plan_1", planName: "Monthly", status: "pending" };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(paymentResult));

    const { useCreatePayment } = await import("@/hooks/use-subscription");
    const { result } = renderHook(() => useCreatePayment(), { wrapper: createWrapper() });

    result.current.mutate({ planId: "plan_1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/payments", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ planId: "plan_1" }),
    }));
  });
});
