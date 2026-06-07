"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DenominationBadge } from "@/components/ui/badge";
import { FormattedCounter } from "@/components/shared/animated-counter";

interface DenominationData { denomination: string; count: number; }
interface DenominationBreakdownProps { data: DenominationData[]; total: number; }

const barColors: Record<string, string> = {
  "100": "bg-dark-600", "200": "bg-gold", "750": "bg-red",
  "1500": "bg-blue", "7500": "bg-green", "25000": "bg-gold", "40000": "bg-green",
};
const bgColors: Record<string, string> = {
  "100": "bg-dark-700", "200": "bg-gold/5", "750": "bg-red/5",
  "1500": "bg-blue/5", "7500": "bg-green/5", "25000": "bg-gold/8", "40000": "bg-green/8",
};

export function DenominationBreakdown({ data, total }: DenominationBreakdownProps) {
  return (
    <Card variant="elevated">
      <CardHeader><CardTitle>By Denomination</CardTitle></CardHeader>
      <CardContent>
        <div className="flex h-3 rounded-full overflow-hidden mb-6">
          {data.map((d) => {
            const pct = (d.count / total) * 100; if (pct < 1) return null;
            return <motion.div key={d.denomination} className={barColors[d.denomination]} style={{ width: `${pct}%` }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.3 }} />;
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((d, i) => (
            <motion.div key={d.denomination}
              className={`rounded-[var(--radius-md)] p-4 ${bgColors[d.denomination]} border border-transparent hover:border-dark-500 transition-all cursor-pointer group`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 + i * 0.06 }}
              whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <DenominationBadge denomination={d.denomination} />
              <p className="text-2xl font-bold text-white mt-2"><FormattedCounter to={d.count} duration={1} /></p>
              <p className="text-xs text-gray mt-0.5">bonds</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
