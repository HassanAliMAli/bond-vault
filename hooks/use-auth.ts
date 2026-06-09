"use client";

import { authClient } from "@/lib/auth-client";

export function useAuth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = authClient as any;

  const hasUseSession =
    typeof client.useSession === "function";

  if (!hasUseSession) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false as const,
      signOut: () => authClient.signOut(),
    };
  }

  const { data: session, isPending } = client.useSession();

  return {
    user: session?.user ?? null,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    signOut: () => authClient.signOut(),
  };
}
