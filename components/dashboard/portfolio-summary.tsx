"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedCounter } from "@/components/shared/animated-counter";
import { Vault, ScrollText, Trophy } from "lucide-react";

interface PortfolioSummaryProps { totalBonds: number; totalChecked: number; totalMatches: number; }

const statCards = [
  { key: "total", label: "Total Bonds", icon: Vault, accent: "text-gold", bg: "bg-gold/5" },
  { key: "checked", label: "Last Checked", icon: ScrollText, accent: "text-blue", bg: "bg-blue/5" },
  { key: "matches", label: "Winners Found", icon: Trophy, accent: "text-green", bg: "bg-green/5" },
];

export function PortfolioSummary({ totalBonds, totalChecked, totalMatches }: PortfolioSummaryProps) {
  const values = { total: totalBonds, checked: totalChecked, matches: totalMatches };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon; const value = values[stat.key as keyof typeof values];
        return (
          <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.1 }}>
            <Card variant="elevated" className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 ${stat.bg}`} />
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{stat.key === "checked" ? "Jun 15" : <FormattedCounter to={value} duration={1.2} />}</p>
                    <p className="text-xs text-gray">{stat.key === "total" ? `${value} bonds` : stat.key === "matches" ? `${value > 0 ? "🎉 " : ""}Across all draws` : "Last draw checked"}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}><Icon className={`h-5 w-5 ${stat.accent}`} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
