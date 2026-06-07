"use client";

import { useState, useCallback } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { CheckButton } from "@/components/check/check-button";
import { SlotMachine } from "@/components/check/slot-machine";
import { ResultsPanel } from "@/components/check/results-panel";
import { DenominationBadge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_BONDS = 127;
const MOCK_RESULTS = {
  matches: [
    { id: "1", bondNumber: "447892", denomination: "200", prizeType: "2nd Prize", prizeAmount: "Rs. 40,000", drawDate: "Jun 1, 2026", drawNumber: "87" },
    { id: "2", bondNumber: "128367", denomination: "200", prizeType: "3rd Prize", prizeAmount: "Rs. 15,000", drawDate: "May 15, 2026", drawNumber: "86" },
    { id: "3", bondNumber: "882341", denomination: "750", prizeType: "3rd Prize", prizeAmount: "Rs. 7,500", drawDate: "May 15, 2026", drawNumber: "86" },
  ], totalChecked: 127,
};
type CheckState = "idle" | "slot-machine" | "checking" | "results";

export function CheckPageClient() {
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [showSlot, setShowSlot] = useState(false);
  const [results, setResults] = useState<typeof MOCK_RESULTS | null>(null);

  const handleStartCheck = useCallback(() => { setCheckState("slot-machine"); setShowSlot(true); setResults(null); }, []);
  const handleSlotComplete = useCallback(() => { setShowSlot(false); setCheckState("checking"); setTimeout(() => { setResults(MOCK_RESULTS); setCheckState("results"); }, 1000); }, []);
  const handleCheckAgain = useCallback(() => { setCheckState("idle"); setResults(null); }, []);

  return (
    <PageTransition className="space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{checkState === "results" ? (results?.matches?.length ? "Results Found" : "Check Complete") : "Check Your Bonds"}</h1>
        <p className="text-sm text-gray max-w-md mx-auto">
          {checkState === "idle" && "Match your entire portfolio against historical draw results in seconds."}
          {checkState === "slot-machine" && "Scanning every bond against draw databases..."}
          {checkState === "checking" && "Processing results..."}
          {checkState === "results" && `${(results?.totalChecked ?? 0).toLocaleString()} bonds checked against historical draws`}
        </p>
      </div>
      <AnimatePresence mode="wait">
        {checkState === "idle" && (
          <motion.div key="idle" className="flex flex-col items-center gap-8 py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
            <CheckButton onClick={handleStartCheck} />
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray">
              <span>Will check against:</span>
              {["100","200","750","1500","7500","25000","40000"].map(d => <DenominationBadge key={d} denomination={d} />)}
            </div>
          </motion.div>
        )}
        {(checkState === "slot-machine" || checkState === "checking") && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {showSlot && <SlotMachine isRunning={showSlot} onComplete={handleSlotComplete} totalBonds={MOCK_BONDS} />}
            {!showSlot && <div className="flex items-center justify-center py-20"><CheckButton loading progress={0.85} totalBonds={MOCK_BONDS} /></div>}
          </motion.div>
        )}
        {checkState === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ResultsPanel matches={results.matches} totalChecked={results.totalChecked} onCheckAgain={handleCheckAgain} /></motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
