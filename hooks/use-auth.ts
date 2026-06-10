"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
    signOut: async () => {
      await api.auth.logout();
      window.location.href = "/login";
    },
  };
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.auth.login(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; password: string; fullName?: string }) =>
      api.auth.register(data),
  });
}
