"use client";

import { motion } from "framer-motion";
import { DenominationBadge } from "@/components/ui/badge";
import { Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Winner {
  id: string;
  bondNumber: string;
  denomination: number;
  prizeType: string;
  prizeAmount: string;
  drawDate: string;
}

interface RecentWinnersProps { winners: Winner[]; }

const PRIZE_LABELS: Record<string, string> = {
  f: "1st Prize", s: "2nd Prize", t: "3rd Prize",
  first: "1st Prize", second: "2nd Prize", third: "3rd Prize",
  "1st Prize": "1st Prize", "2nd Prize": "2nd Prize", "3rd Prize": "3rd Prize",
};

export function RecentWinners({ winners }: RecentWinnersProps) {
  const router = useRouter();
  return (
    <div className="rounded-[var(--radius-lg)] bg-dark-800/50 border border-dark-600 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-semibold text-white">Recent Winners</h2>
        </div>
        {winners.length > 0 && (
          <button onClick={() => router.push("/check")} className="text-sm text-gold hover:text-gold/80 transition-colors flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {winners.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="h-10 w-10 mx-auto text-dark-600 mb-3" />
          <p className="text-sm text-gray">No winning bonds yet. Check your bonds against historical draws.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {winners.slice(0, 5).map((winner, i) => (
            <motion.div
              key={winner.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-dark-800/80 border border-dark-600"
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", (PRIZE_LABELS[winner.prizeType] || winner.prizeType) === "1st Prize" ? "bg-red" : (PRIZE_LABELS[winner.prizeType] || winner.prizeType) === "2nd Prize" ? "bg-blue" : "bg-gold")} />
                <div>
                  <p className="text-sm font-medium text-white">{winner.bondNumber}</p>
                  <p className="text-xs text-gray">{winner.drawDate}</p>
                </div>
              </div>
              <div className="text-right">
                <DenominationBadge denomination={winner.denomination} />
                <p className="text-xs font-medium text-gold mt-0.5">{PRIZE_LABELS[winner.prizeType] || winner.prizeType}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
