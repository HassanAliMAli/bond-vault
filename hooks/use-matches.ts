"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard.get(),
    staleTime: 30_000,
  });
}

export function useCheckBonds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.check.run(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
