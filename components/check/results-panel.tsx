"use client";

import { motion } from "framer-motion";
import { MatchCard } from "./match-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, PartyPopper, SearchCheck } from "lucide-react";

interface Match { id: string; bondNumber: string; denomination: string; prizeType: string; prizeAmount: string; drawDate: string; drawNumber: string; }
interface ResultsPanelProps { matches: Match[]; totalChecked: number; onCheckAgain: () => void; }

export function ResultsPanel({ matches, totalChecked, onCheckAgain }: ResultsPanelProps) {
  const hasWinners = matches.length > 0;
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}>
      {hasWinners ? (
        <>
          <motion.div className="text-center py-8 px-4 bg-gradient-to-b from-green/5 to-transparent rounded-[var(--radius-xl)] border border-green/20"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.3 }}>
            <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.4 }}>
              <PartyPopper className="h-12 w-12 text-gold mx-auto mb-3" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Congratulations!</h2>
            <p className="text-sm text-gray max-w-md mx-auto">{matches.length} {matches.length === 1 ? "bond" : "bonds"} matched — {totalChecked.toLocaleString()} bonds checked</p>
          </motion.div>
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-gold" />Winning Bonds</CardTitle>
              <span className="text-sm text-gray">{matches.length} found</span>
            </CardHeader>
            <CardContent><div className="space-y-3">{matches.map((match, i) => <MatchCard key={match.id} {...match} index={i} />)}</div></CardContent>
          </Card>
          <div className="flex justify-center"><Button variant="secondary" size="lg" onClick={onCheckAgain}><SearchCheck className="h-4 w-4" />Check Again</Button></div>
        </>
      ) : (
        <EmptyState illustration="search" title="No winners this time"
          description={`${totalChecked.toLocaleString()} bonds checked against the latest draws.`}
          action={{ label: "Check Again", onClick: onCheckAgain }}
          secondaryAction={{ label: "View My Bonds", onClick: () => {} }} />
      )}
    </motion.div>
  );
}
