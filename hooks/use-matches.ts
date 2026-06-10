"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useMatches(params?: {
  status?: string;
  denomination?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ["matches", params],
    queryFn: () => api.matches.list(params as Record<string, string | undefined>),
    staleTime: 30_000,
  });
}

export function useCheckBonds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bondNumber: string; denomination: number }) =>
      api.check.run(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useMarkViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.matches.markViewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
