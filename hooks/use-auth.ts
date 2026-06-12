"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.user.profile(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
    signOut: async () => {
      await authClient.signOut();
      window.location.href = "/login";
    },
  };
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authClient.signIn.email(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; fullName?: string }) =>
      authClient.signUp.email({ email: data.email, password: data.password, name: data.fullName || "" }),
  });
}
