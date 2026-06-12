"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DenominationData { denomination: number; count: number; }
interface DenominationBreakdownProps { data: DenominationData[]; total: number; }

const denomColors: Record<number, string> = {
  100: "bg-denom-100",
  200: "bg-denom-200",
  750: "bg-denom-750",
  1500: "bg-denom-1500",
  7500: "bg-denom-7500",
  25000: "bg-denom-25000",
  40000: "bg-denom-40000",
};

export function DenominationBreakdown({ data, total }: DenominationBreakdownProps) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-lg)] bg-dark-800/50 border border-dark-600 p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Portfolio Breakdown</h2>
      <div className="space-y-3">
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <motion.div key={item.denomination} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray">Rs. {item.denomination.toLocaleString()}</span>
                <span className="text-sm font-medium text-white">{item.count} bonds ({percentage.toFixed(0)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-dark-700">
                <motion.div
                  className={cn("h-full rounded-full", denomColors[item.denomination] || "bg-gold")}
                  initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
