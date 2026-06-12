"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DenominationBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

interface BondCardProps {
  id: string; bondNumber: string; denomination: number; addedAt: string;
  onDelete?: (id: string) => void; index?: number; className?: string;
}

export function BondCard({ id, bondNumber, denomination, addedAt, onDelete, index = 0, className }: BondCardProps) {
  return (
    <motion.div
      layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: "spring", stiffness: 350, damping: 28, delay: index * 0.04 }}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 hover:border-dark-500 hover:shadow-elevation-2 transition-all",
        className
      )}
    >
      <div className="hidden sm:flex items-center text-dark-500 group-hover:text-gray transition-colors"><GripVertical className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className="text-lg font-semibold text-white tabular-nums tracking-tight">{bondNumber}</span>
        <DenominationBadge denomination={denomination} />
      </div>
      <div className="hidden sm:block text-xs text-gray whitespace-nowrap">Added {addedAt}</div>
      {onDelete && (
        <Button variant="ghost" size="icon" className="shrink-0 text-dark-500 hover:text-red hover:bg-red/10 opacity-0 group-hover:opacity-100 transition-all"
          onClick={() => onDelete(id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
}
