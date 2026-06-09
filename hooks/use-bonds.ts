"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Bond } from "@/lib/api-client";

export function useBonds(params?: {
  denomination?: string;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["bonds", params],
    queryFn: () => api.bonds.list(params),
    staleTime: 30_000,
  });
}

export function useCreateBond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { denomination: string; bond_number: string }) =>
      api.bonds.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteBond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.bonds.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
