"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DenominationBadge } from "@/components/ui/badge";
import { FormattedCounter } from "@/components/shared/animated-counter";

interface DenominationData {
  denomination: string;
  count: number;
  color: string;
}

const denominationColors: Record<string, string> = {
  "100": "from-warm-200 to-warm-300",
  "200": "from-amber-200 to-amber-300",
  "750": "from-rose-200 to-rose-300",
  "1500": "from-violet-200 to-violet-300",
  "7500": "from-emerald-200 to-emerald-300",
  "25000": "from-gold-200 to-gold-400",
  "40000": "from-gold-300 to-gold-500",
};

const bgColors: Record<string, string> = {
  "100": "bg-warm-50",
  "200": "bg-amber-50",
  "750": "bg-rose-50",
  "1500": "bg-violet-50",
  "7500": "bg-emerald-50",
  "25000": "bg-gold-50",
  "40000": "bg-gold-100",
};

interface DenominationBreakdownProps {
  data: DenominationData[];
  total: number;
}

export function DenominationBreakdown({ data, total }: DenominationBreakdownProps) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>By Denomination</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual bar chart */}
        <div className="flex h-3 rounded-full overflow-hidden mb-6">
          {data.map((d) => {
            const pct = (d.count / total) * 100;
            if (pct < 1) return null;
            return (
              <motion.div
                key={d.denomination}
                className={`bg-gradient-to-r ${denominationColors[d.denomination]}`}
                style={{ width: `${pct}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                  delay: 0.3,
                }}
              />
            );
          })}
        </div>

        {/* Denomination cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map((d, i) => (
            <motion.div
              key={d.denomination}
              className={`rounded-[var(--radius-md)] p-4 ${bgColors[d.denomination]} border border-transparent hover:border-[var(--border)] transition-all cursor-pointer group`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                delay: 0.2 + i * 0.06,
              }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-1">
                <DenominationBadge denomination={d.denomination} />
              </div>
              <p className="font-display text-2xl font-bold text-warm-800">
                <FormattedCounter to={d.count} duration={1} />
              </p>
              <p className="text-xs text-muted mt-0.5">bonds</p>
            </motion.div>
          ))}
          {data.length === 0 && (
            <div className="col-span-full py-8 text-center">
              <p className="text-sm text-muted">No bonds added yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
