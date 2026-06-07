"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DenominationBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";

interface Winner {
  id: string;
  bondNumber: string;
  denomination: string;
  prizeType: string;
  prizeAmount: string;
  drawDate: string;
}

interface RecentWinnersProps {
  winners: Winner[];
}

export function RecentWinners({ winners }: RecentWinnersProps) {
  const hasWinners = winners.length > 0;

  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Winners</CardTitle>
        <Link href="/check">
          <Button variant="ghost-gold" size="sm" className="gap-1">
            Check All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {hasWinners ? (
          <div className="space-y-3">
            {winners.map((winner, i) => (
              <motion.div
                key={winner.id}
                className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-emerald-50/50 border border-emerald-100"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Trophy className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-sm font-medium text-warm-900">
                      #{winner.bondNumber}
                    </span>
                    <DenominationBadge denomination={winner.denomination} />
                  </div>
                  <p className="text-xs text-muted">
                    {winner.prizeType} — {winner.prizeAmount} · {winner.drawDate}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-warm-50 mx-auto mb-3 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-warm-300" />
            </div>
            <p className="text-sm text-muted mb-4">No winners yet</p>
            <Link href="/check">
              <Button variant="secondary" size="sm">
                Check My Bonds
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
