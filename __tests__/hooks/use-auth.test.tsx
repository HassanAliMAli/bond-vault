import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

global.fetch = vi.fn();
const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
  },
}));

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

describe("useAuth", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns user data from /api/v1/user/profile", async () => {
    const userData = { id: "u1", email: "test@test.com" };
    mockFetch.mockResolvedValueOnce(mockJsonResponse(userData));

    const { useAuth } = await import("@/hooks/use-auth");
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(userData);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/user/profile", expect.any(Object));
  });

  it("returns null user when API fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: false, error: { message: "Unauthorized" } }) });

    const { useAuth } = await import("@/hooks/use-auth");
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("signOut calls authClient.signOut and redirects", async () => {
    const { authClient } = await import("@/lib/auth-client");
    const { useAuth } = await import("@/hooks/use-auth");
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    const originalLocation = window.location;
    Object.defineProperty(window, "location", { value: { href: "" }, writable: true });

    await result.current.signOut();
    expect(authClient.signOut).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");

    Object.defineProperty(window, "location", { value: originalLocation, writable: true });
  });
});


