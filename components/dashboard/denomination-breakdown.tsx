"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DenominationBadge } from "@/components/ui/badge";
import { FormattedCounter } from "@/components/shared/animated-counter";

interface DenominationData { denomination: string; count: number; }

const barColors: Record<string, string> = {
  "100": "bg-cyan/18", "200": "bg-amber", "750": "bg-orange",
  "1500": "bg-cyan", "7500": "bg-green", "25000": "bg-amber", "40000": "bg-cyan",
};
const bgColors: Record<string, string> = {
  "100": "bg-cyan/[0.04]", "200": "bg-amber/[0.05]", "750": "bg-orange/[0.05]",
  "1500": "bg-cyan/[0.05]", "7500": "bg-green/[0.05]", "25000": "bg-amber/[0.08]", "40000": "bg-cyan/[0.08]",
};

interface DenominationBreakdownProps { data: DenominationData[]; total: number; }

export function DenominationBreakdown({ data, total }: DenominationBreakdownProps) {
  return (
    <Card variant="elevated">
      <CardHeader><CardTitle>By Denomination</CardTitle></CardHeader>
      <CardContent>
        <div className="flex h-3 rounded-full overflow-hidden mb-6 border border-cyan/10">
          {data.map((d) => {
            const pct = (d.count / total) * 100;
            if (pct < 1) return null;
            return (
              <motion.div key={d.denomination} className={barColors[d.denomination]}
                style={{ width: `${pct}%` }} initial={{ width: 0 }}
                animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.3 }} />
            );
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((d, i) => (
            <motion.div key={d.denomination}
              className={`rounded-[var(--radius-md)] p-4 ${bgColors[d.denomination]} border-2 border-transparent hover:border-cyan/15 transition-all cursor-pointer group`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 + i * 0.06 }}
              whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div className="flex items-center justify-between mb-1">
                <DenominationBadge denomination={d.denomination} />
              </div>
              <p className="text-2xl font-bold text-black"><FormattedCounter to={d.count} duration={1} /></p>
              <p className="text-xs text-muted mt-0.5">bonds</p>
            </motion.div>
          ))}
          {data.length === 0 && <div className="col-span-full py-8 text-center"><p className="text-sm text-muted">No bonds added yet</p></div>}
        </div>
      </CardContent>
    </Card>
  );
}
