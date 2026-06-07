"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DenominationBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";

interface Winner { id: string; bondNumber: string; denomination: string; prizeType: string; prizeAmount: string; drawDate: string; }
interface RecentWinnersProps { winners: Winner[]; }

export function RecentWinners({ winners }: RecentWinnersProps) {
  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Winners</CardTitle>
        <Link href="/check"><Button variant="ghostGold" size="sm" className="gap-1 text-gold">Check All <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
      </CardHeader>
      <CardContent>
        {winners.length > 0 ? (
          <div className="space-y-3">
            {winners.map((w, i) => (
              <motion.div key={w.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-green/5 border border-green/20"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 24 }}>
                <div className="w-9 h-9 rounded-full bg-green/10 flex items-center justify-center shrink-0"><Trophy className="h-4 w-4 text-green" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-semibold text-white">#{w.bondNumber}</span><DenominationBadge denomination={w.denomination} /></div>
                  <p className="text-xs text-gray">{w.prizeType} — {w.prizeAmount} · {w.drawDate}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-dark-700 mx-auto mb-3 flex items-center justify-center"><Trophy className="h-6 w-6 text-dark-500" /></div>
            <p className="text-sm text-gray mb-4">No winners yet</p>
            <Link href="/check"><Button variant="secondary" size="sm">Check My Bonds</Button></Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
