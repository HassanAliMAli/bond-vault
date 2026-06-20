"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useImportUpload() {
  return useMutation({
    mutationFn: (file: File) => api.imports.upload(file),
  });
}

export function useImportConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (importId: string) => api.imports.confirm(importId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
  });
}

interface ImportJob {
  id: string;
  fileType: string;
  status: string;
  totalRecords: number;
  successfulRecords: number;
  duplicateRecords: number;
  invalidRecords: number;
  createdAt: string;
}

export function useImportHistory() {
  return useQuery({
    queryKey: ["imports"],
    queryFn: () => api.imports.list() as Promise<{ imports: ImportJob[] }>,
    staleTime: 30_000,
  });
}

export function useExportCsv() {
  return useMutation({
    mutationFn: async () => {
      const blob = await api.exports.csv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bondvault-portfolio-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useExportXlsx() {
  return useMutation({
    mutationFn: async () => {
      const blob = await api.exports.xlsx();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bondvault-portfolio-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
