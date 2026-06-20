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

describe("useNotifications", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches notifications from /api/v1/notifications with default limit", async () => {
    const notifData = { notifications: [{ id: "n1", title: "Test", status: "pending" }], total: 1 };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(notifData));

    const { useNotifications } = await import("@/hooks/use-notifications");
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(notifData);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/notifications?limit=5&page=1", expect.any(Object));
  });

  it("accepts custom limit parameter", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ notifications: [], total: 0 }));

    const { useNotifications } = await import("@/hooks/use-notifications");
    renderHook(() => useNotifications(10), { wrapper: createWrapper() });

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("limit=10");
  });

  it("handles empty notifications", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ notifications: [], total: 0 }));

    const { useNotifications } = await import("@/hooks/use-notifications");
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.notifications).toEqual([]);
    expect(result.current.data?.total).toBe(0);
  });

  it("handles API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: false, error: { message: "Server error" } }) });

    const { useNotifications } = await import("@/hooks/use-notifications");
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useNotificationPreferences", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches preferences from /api/v1/notifications/preferences", async () => {
    const prefs = { emailEnabled: true, whatsappEnabled: false, smsEnabled: true };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(prefs));

    const { useNotificationPreferences } = await import("@/hooks/use-notifications");
    const { result } = renderHook(() => useNotificationPreferences(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(prefs);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/notifications/preferences", expect.any(Object));
  });

  it("handles all-disabled preferences", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ emailEnabled: false, whatsappEnabled: false, smsEnabled: false }));

    const { useNotificationPreferences } = await import("@/hooks/use-notifications");
    const { result } = renderHook(() => useNotificationPreferences(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ emailEnabled: false, whatsappEnabled: false, smsEnabled: false });
  });
});

describe("useUpdateNotificationPreferences", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("sends PATCH request with preferences", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({}));

    const { useUpdateNotificationPreferences } = await import("@/hooks/use-notifications");
    const { result } = renderHook(() => useUpdateNotificationPreferences(), { wrapper: createWrapper() });

    result.current.mutate({ emailEnabled: true, smsEnabled: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/notifications/preferences", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ emailEnabled: true, smsEnabled: false }),
    }));
  });

  it("sends partial preferences update", async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({}));

    const { useUpdateNotificationPreferences } = await import("@/hooks/use-notifications");
    const { result } = renderHook(() => useUpdateNotificationPreferences(), { wrapper: createWrapper() });

    result.current.mutate({ whatsappEnabled: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/notifications/preferences", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ whatsappEnabled: true }),
    }));
  });
});
