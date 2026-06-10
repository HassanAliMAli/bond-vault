"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [bonds, matches] = await Promise.all([
        api.bonds.list(),
        api.matches.list(),
      ]);
      const allBonds = bonds.bonds ?? [];
      const allMatches = matches.matches ?? [];

      const denomMap: Record<number, number> = {};
      for (const b of allBonds) {
        denomMap[b.denomination] = (denomMap[b.denomination] || 0) + 1;
      }

      return {
        totalBonds: allBonds.length,
        totalChecked: allBonds.length,
        totalMatches: allMatches.length,
        denominations: Object.entries(denomMap).map(([k, v]) => ({ denomination: k, count: v })),
        winners: allMatches.map((m) => ({
          id: m.id,
          bondNumber: m.bondNumberSnapshot,
          denomination: m.denominationSnapshot,
          prizeType: m.prizeTypeSnapshot,
          prizeAmount: `Rs. ${m.prizeAmountSnapshot.toLocaleString()}`,
          drawDate: m.drawDateSnapshot,
        })),
      };
    },
    staleTime: 30_000,
  });
}

export function useMatches(params?: { status?: string; denomination?: number; page?: number }) {
  return useQuery({
    queryKey: ["matches", params],
    queryFn: () => api.matches.list(params as Record<string, string | undefined>),
    staleTime: 30_000,
  });
}

export function useCheckBonds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data?: { bondNumber: string; denomination: number }) => {
      if (!data) {
        const allBonds = (await api.bonds.list()).bonds ?? [];
        const results: any[] = [];
        for (const b of allBonds) {
          const r = await api.check.run({ bondNumber: b.bondNumber, denomination: b.denomination });
          for (const m of r.matches) results.push({ id: m.bondNumber+m.drawDate, bondNumber: m.bondNumber, denomination: String(b.denomination), prizeType: m.prizeType, prizeAmount: `Rs. ${m.prizeAmount.toLocaleString()}`, drawDate: m.drawDate, drawNumber: m.drawNumber });
        }
        return { matches: results, totalChecked: allBonds.length };
      }
      const r = await api.check.run(data);
      return { matches: r.matches.map((m,i) => ({ id: m.bondNumber+m.drawDate+i, bondNumber: m.bondNumber, denomination: String(data.denomination), prizeType: m.prizeType, prizeAmount: `Rs. ${m.prizeAmount.toLocaleString()}`, drawDate: m.drawDate, drawNumber: m.drawNumber })), totalChecked: 1 };
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["matches"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}

export function useMarkViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.matches.markViewed(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["matches"] }); },
  });
}
