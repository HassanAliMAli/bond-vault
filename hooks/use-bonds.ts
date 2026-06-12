"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useBonds(params?: {
  denomination?: string;
  search?: string;
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ["bonds", params],
    queryFn: () => api.bonds.list(params as Record<string, string | undefined>),
    staleTime: 30_000,
  });
}

export function useCreateBond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bondNumber: string; denomination: number }) =>
      api.bonds.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
    },
  });
}

export function useUpdateBond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { bondNumber?: string; denomination?: number } }) =>
      api.bonds.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
    },
  });
}

export function useDeleteBond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.bonds.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
    },
  });
}

export function useArchiveBond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.bonds.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
    },
  });
}

export function useRestoreBond() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.bonds.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
    },
  });
}
