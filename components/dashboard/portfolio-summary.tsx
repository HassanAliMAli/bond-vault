"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FormattedCounter } from "@/components/shared/animated-counter";
import { Vault, ScrollText, Trophy } from "lucide-react";

interface PortfolioSummaryProps {
  totalBonds: number;
  totalChecked: number;
  totalMatches: number;
}

const statCards = [
  {
    key: "total",
    label: "Total Bonds",
    icon: Vault,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    key: "checked",
    label: "Last Checked",
    icon: ScrollText,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    suffix: "",
  },
  {
    key: "matches",
    label: "Winners Found",
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

export function PortfolioSummary({ totalBonds, totalChecked, totalMatches }: PortfolioSummaryProps) {
  const values = {
    total: totalBonds,
    checked: totalChecked,
    matches: totalMatches,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        const value = values[stat.key as keyof typeof values];
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              delay: i * 0.1,
            }}
          >
            <Card variant="glass" className="relative overflow-hidden">
              <div
                className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${stat.bg}`}
              />
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="font-display text-3xl font-bold text-slate-900 tracking-tight">
                      {stat.key === "checked" ? (
                        "Jun 15"
                      ) : (
                        <FormattedCounter to={value} duration={1.2} />
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {stat.key === "total" && `${value} bonds in your vault`}
                      {stat.key === "checked" && "Last draw checked"}
                      {stat.key === "matches" && `${value > 0 ? "🎉 " : ""}Across all draws`}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
