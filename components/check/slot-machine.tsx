"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlotMachineProps {
  isRunning: boolean;
  onComplete: () => void;
  totalBonds: number;
}

export function SlotMachine({ isRunning, onComplete, totalBonds }: SlotMachineProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "spinning" | "slowing" | "complete">("idle");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const randomBond = () => {
    const nums = [];
    for (let i = 0; i < 6; i++) {
      nums.push(Math.floor(Math.random() * 10));
    }
    return nums.join("");
  };

  const randomDenomination = () => {
    const dens = ["100", "200", "750", "1500", "7500", "25000", "40000"];
    return dens[Math.floor(Math.random() * dens.length)];
  };

  const [currentBond, setCurrentBond] = useState(randomBond());
  const [currentDenom, setCurrentDenom] = useState(randomDenomination());

  useEffect(() => {
    if (!isRunning) {
      setPhase("idle");
      setDisplayIndex(0);
      return;
    }

    setPhase("spinning");
    let speed = 60;
    let count = 0;
    const maxCount = 20;

    const tick = () => {
      count++;
      setCurrentBond(randomBond());
      setCurrentDenom(randomDenomination());
      setDisplayIndex((prev) => prev + 1);

      if (count > maxCount) {
        setPhase("slowing");
        speed += 40;
      }

      if (count > maxCount + 8) {
        setPhase("complete");
        onComplete();
        return;
      }

      intervalRef.current = setTimeout(tick, speed);
    };

    tick();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isRunning, onComplete]);

  if (phase === "idle") return null;

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <motion.div
        className="relative overflow-hidden rounded-[var(--radius-lg)] bg-emerald-900/95 border border-emerald-700/50 p-8 w-full max-w-md shadow-elevation-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/10 via-transparent to-transparent" />

        <div className="relative z-10 space-y-2 text-center">
          <p className="text-xs text-emerald-400 font-medium uppercase tracking-widest">
            Checking
          </p>

          <motion.p
            key={currentBond}
            className="font-mono text-4xl font-bold text-white tracking-[0.3em]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.08 }}
          >
            {currentBond}
          </motion.p>

          <motion.p
            key={currentDenom}
            className="text-sm text-emerald-300 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.08 }}
          >
            Rs. {currentDenom}
          </motion.p>
        </div>
      </motion.div>

      <div className="text-center">
        <p className="text-sm text-muted">
          {phase === "spinning" && `Scanning ${totalBonds.toLocaleString()} bonds against draws...`}
          {phase === "slowing" && "Almost done..."}
          {phase === "complete" && "Check complete!"}
        </p>
        <div className="flex gap-1 justify-center mt-3">
          {[1, 2, 3].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 rounded-full bg-gold-400"
              animate={phase !== "complete" ? { opacity: [0.3, 1, 0.3] } : { opacity: 1 }}
              transition={
                phase !== "complete"
                  ? { repeat: Infinity, duration: 0.8, delay: dot * 0.15 }
                  : {}
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
