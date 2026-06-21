"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

const DENOMINATIONS = [100, 200, 750, 1500, 7500, 25000, 40000] as const;

export interface TxtImportResult {
  saved: number;
  duplicates: number;
  invalid: number;
}

export function useTxtImport() {
  const [numbers, setNumbers] = useState<string[]>([]);
  const [denominations, setDenominations] = useState<Record<number, number | null>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [presetDenomination, setPresetDenomination] = useState<number | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const queryClient = useQueryClient();

  const parseFile = useCallback(async (file: File): Promise<string[]> => {
    setIsParsing(true);
    try {
      const text = await file.text();
      const found = [...text.matchAll(/\b(\d{6})\b/g)].map((m) => m[1]);
      const unique = [...new Set(found)];
      setNumbers(unique);
      setDenominations({});
      setSelected(new Set());
      setPresetDenomination(null);
      return unique;
    } finally {
      setIsParsing(false);
    }
  }, []);

  const toggleSelect = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === numbers.length) return new Set();
      return new Set(numbers.map((_, i) => i));
    });
  }, [numbers]);

  const setDenomination = useCallback((index: number, denom: number | null) => {
    setDenominations((prev) => ({ ...prev, [index]: denom }));
  }, []);

  const applyBulkDenomination = useCallback((denom: number) => {
    setDenominations((prev) => {
      const next = { ...prev };
      for (const idx of selected) {
        next[idx] = denom;
      }
      return next;
    });
  }, [selected]);

  const applyPresetDenomination = useCallback((denom: number) => {
    setPresetDenomination(denom);
    setDenominations((prev) => {
      const next = { ...prev };
      for (let i = 0; i < numbers.length; i++) {
        if (next[i] === null || next[i] === undefined) {
          next[i] = denom;
        }
      }
      return next;
    });
  }, [numbers]);

  const clearPresetDenomination = useCallback(() => {
    setPresetDenomination(null);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (bonds: { bondNumber: string; denomination: number }[]) =>
      api.imports.txtImport(bonds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["imports"] });
    },
  });

  const save = useCallback(async (): Promise<TxtImportResult> => {
    const bonds = numbers
      .map((num, i) => ({ bondNumber: num, denomination: denominations[i] }))
      .filter((b): b is { bondNumber: string; denomination: number } => b.denomination !== null && b.denomination !== undefined);
    return saveMutation.mutateAsync(bonds);
  }, [numbers, denominations, saveMutation]);

  const reset = useCallback(() => {
    setNumbers([]);
    setDenominations({});
    setSelected(new Set());
    setPresetDenomination(null);
    saveMutation.reset();
  }, [saveMutation]);

  const unsetCount = numbers.length > 0
    ? numbers.filter((_, i) => denominations[i] === null || denominations[i] === undefined).length
    : 0;

  return {
    numbers,
    denominations,
    selected,
    presetDenomination,
    isParsing,
    isSaving: saveMutation.isPending,
    result: saveMutation.data ?? null,
    error: saveMutation.error,
    parseFile,
    toggleSelect,
    toggleSelectAll,
    setDenomination,
    applyBulkDenomination,
    applyPresetDenomination,
    clearPresetDenomination,
    save,
    reset,
    unsetCount,
    DENOMINATIONS,
  };
}
