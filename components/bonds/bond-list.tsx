"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BondCard } from "./bond-card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DENOMINATIONS as ALL_DENOMS } from "@/lib/constants";

interface Bond { id: string; bondNumber: string; denomination: number; addedAt: string; }
interface BondListProps { bonds: Bond[]; onDelete: (id: string) => void; onAddNew: () => void; }

const DENOMINATIONS = ALL_DENOMS;

export function BondList({ bonds, onDelete, onAddNew }: BondListProps) {
  const [search, setSearch] = useState("");
  const [denominationFilter, setDenominationFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "denomination">("newest");

  const filtered = bonds.filter((b) => {
    if (denominationFilter && b.denomination !== Number(denominationFilter)) return false;
    if (search && !b.bondNumber.includes(search)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return a.addedAt > b.addedAt ? -1 : 1;
    if (sortBy === "oldest") return a.addedAt < b.addedAt ? -1 : 1;
    return Number(a.denomination) - Number(b.denomination);
  });

  const hasFilters = denominationFilter || search;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
          <Input placeholder="Search by bond number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-white"><X className="h-4 w-4" /></button>}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-12 px-3 rounded-[var(--radius-sm)] border border-dark-600 bg-dark-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/30 cursor-pointer">
          <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="denomination">By Denomination</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setDenominationFilter(null)}
          className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all", !denominationFilter ? "bg-gold/10 border-gold/30 text-gold" : "bg-dark-800 border-dark-600 text-gray hover:border-dark-500")}>All</button>
        {DENOMINATIONS.map((d) => (
          <button key={d} onClick={() => setDenominationFilter(denominationFilter === d ? null : d)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all", denominationFilter === d ? "bg-gold/10 border-gold/30 text-gold" : "bg-dark-800 border-dark-600 text-gray hover:border-dark-500")}>
            Rs. {d}
          </button>
        ))}
        {hasFilters && (
          <button onClick={() => { setDenominationFilter(null); setSearch(""); }} className="px-3 py-1.5 rounded-full text-xs font-medium text-gray hover:text-white flex items-center gap-1"><X className="h-2.5 w-2.5" />Clear</button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2"><AnimatePresence mode="popLayout">{filtered.map((bond, i) => <BondCard key={bond.id} {...bond} onDelete={onDelete} index={i} />)}</AnimatePresence></div>
      ) : (
        <EmptyState illustration={hasFilters ? "search" : "vault"}
          title={hasFilters ? "No bonds match your filters" : "No bonds yet"}
          description={hasFilters ? "Try adjusting your search or denomination filter." : "Add your first prize bond to start your portfolio."}
          action={hasFilters ? { label: "Clear Filters", onClick: () => { setDenominationFilter(null); setSearch(""); } } : { label: "Add Your First Bond", onClick: onAddNew }} />
      )}
      {filtered.length > 0 && <p className="text-xs text-gray text-center">Showing {filtered.length} of {bonds.length} bonds</p>}
    </div>
  );
}
