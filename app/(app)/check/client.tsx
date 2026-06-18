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


type CheckState = "idle" | "slot-machine" | "checking" | "results";

export function CheckPageClient() {
  const router = useRouter();
  const { data: bondsData, isLoading: bondsLoading, isError: bondsError } = useBonds();
  const totalBonds = bondsData?.total ?? 0;

  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [showSlot, setShowSlot] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const checkBonds = useCheckBonds();
  const checkStarted = useRef(false);

  const resetCheck = useCallback(() => {
    checkBonds.reset();
    setCheckState("idle");
    setErrorMsg(null);
  }, [checkBonds]);

  const handleStartCheck = useCallback(() => {
    if (totalBonds === 0) return;
    checkBonds.reset();
    setCheckState("slot-machine");
    setShowSlot(true);
    setErrorMsg(null);
    checkStarted.current = false;
  }, [totalBonds, checkBonds]);

  const handleSlotComplete = useCallback(() => {
    setShowSlot(false);
    setCheckState("checking");
    checkStarted.current = true;
  }, []);

  useEffect(() => {
    if (checkStarted.current && checkState === "checking") {
      checkStarted.current = false;
      setErrorMsg(null);

      checkBonds.mutate(undefined, {
        onSuccess: () => {
          setCheckState("results");
        },
        onError: (err) => {
          setErrorMsg(err instanceof Error ? err.message : "Check failed. Please try again.");
        },
      });
    }
  }, [checkState, checkBonds]);

  const handleCheckAgain = useCallback(() => {
    resetCheck();
  }, [resetCheck]);

  const results = checkBonds.data ?? null;
  const isChecking = checkBonds.isPending;
  const showError = !!errorMsg || checkBonds.isError;

  if (bondsLoading && checkState === "idle") {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray">Loading your bonds...</p>
        </div>
      </PageTransition>
    );
  }

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
          {checkState === "results"
            ? `${(results?.matches?.length ?? 0) > 0
                ? `${results.matches.length} winning ${results.matches.length === 1 ? "bond" : "bonds"} found out of ${(results?.totalChecked ?? 0).toLocaleString()} checked`
                : `${(results?.totalChecked ?? 0).toLocaleString()} bonds checked — no winners this time`}`
            : ""}
        </p>
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray text-center space-y-1">
        <p>State: {checkState} | Slot: {String(showSlot)} | Bonds: {totalBonds} | Error: {String(!!errorMsg)} | isPending: {String(isChecking)} | isError: {String(checkBonds.isError)}</p>
        {errorMsg && <p className="text-red">Error: {errorMsg}</p>}
      </div>

      {checkState === "idle" && (
        <div className="flex flex-col items-center gap-8 py-16">
          <CheckButton onClick={handleStartCheck} />
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray">
            <span>Will check against:</span>
            {[100, 200, 750, 1500, 7500, 25000, 40000].map(d => <DenominationBadge key={d} denomination={d} />)}
          </div>
        </div>
      )}

      {checkState === "slot-machine" && showSlot && (
        <SlotMachine isRunning={showSlot} onComplete={handleSlotComplete} totalBonds={totalBonds} />
      )}

      {checkState === "checking" && (
        <div className="flex items-center justify-center py-20">
          {showError ? (
            <ErrorState
              title="Check failed"
              description={errorMsg || "Could not complete the bond check."}
              onRetry={resetCheck}
            />
          ) : (
            <CheckButton loading progress={0.85} totalBonds={totalBonds} />
          )}
        </div>
      )}

      {checkState === "results" && results && (
        <ResultsPanel matches={results.matches || []} totalChecked={results.totalChecked || 0} onCheckAgain={handleCheckAgain} />
      )}
    </PageTransition>
  );
}
