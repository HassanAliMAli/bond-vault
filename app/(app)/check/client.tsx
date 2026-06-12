"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PageTransition } from "@/components/shared/page-transition";
import { CheckButton } from "@/components/check/check-button";
import { SlotMachine } from "@/components/check/slot-machine";
import { ResultsPanel } from "@/components/check/results-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DenominationBadge } from "@/components/ui/badge";
import { useCheckBonds } from "@/hooks/use-matches";
import { useBonds } from "@/hooks/use-bonds";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type CheckState = "idle" | "slot-machine" | "checking" | "results";

export function CheckPageClient() {
  const router = useRouter();
  const { data: bondsData } = useBonds();
  const totalBonds = bondsData?.total ?? 0;

  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [showSlot, setShowSlot] = useState(false);
  const checkBonds = useCheckBonds();
  const checkStarted = useRef(false);

  const handleStartCheck = useCallback(() => {
    if (totalBonds === 0) return;
    setCheckState("slot-machine");
    setShowSlot(true);
    checkStarted.current = false;
  }, [totalBonds]);

  const handleSlotComplete = useCallback(() => {
    setShowSlot(false);
    setCheckState("checking");
    checkStarted.current = true;
  }, []);

  useEffect(() => {
    if (checkStarted.current && checkState === "checking") {
      (checkBonds.mutate as () => void)();
      checkStarted.current = false;
    }
  }, [checkState, checkBonds]);

  useEffect(() => {
    if (checkBonds.isSuccess && checkState === "checking") {
      setCheckState("results");
    }
  }, [checkBonds.isSuccess, checkState]);

  const handleCheckAgain = useCallback(() => {
    checkBonds.reset();
    setCheckState("idle");
  }, [checkBonds]);

  const results = checkBonds.data ?? null;

  if (totalBonds === 0 && checkState === "idle") {
    return (
      <PageTransition>
        <EmptyState
          illustration="vault"
          title="No bonds to check"
          description="Add bonds to your vault before checking against historical draws."
          action={{ label: "Add Your First Bond", onClick: () => router.push("/bonds/add") }}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          {checkState === "results"
            ? (results?.matches?.length ? "Results Found" : "Check Complete")
            : "Check Your Bonds"}
        </h1>
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
              {[100, 200, 750, 1500, 7500, 25000, 40000].map(d => <DenominationBadge key={d} denomination={d} />)}
            </div>
          </motion.div>
        )}
        {(checkState === "slot-machine" || checkState === "checking") && (
          <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {showSlot && <SlotMachine isRunning={showSlot} onComplete={handleSlotComplete} totalBonds={totalBonds} />}
            {!showSlot && (
              <div className="flex items-center justify-center py-20">
                {checkBonds.isError ? (
                  <ErrorState title="Check failed" description="Could not complete the bond check." onRetry={() => { checkBonds.reset(); setCheckState("idle"); }} />
                ) : (
                  <CheckButton loading progress={0.85} totalBonds={totalBonds} />
                )}
              </div>
            )}
          </motion.div>
        )}
        {checkState === "results" && results && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ResultsPanel matches={results.matches || []} totalChecked={results.totalChecked || 0} onCheckAgain={handleCheckAgain} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
