"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SearchCheck, Sparkles } from "lucide-react";

interface CheckButtonProps {
  onClick: () => void;
  loading?: boolean;
  progress?: number;
  totalBonds?: number;
}

export function CheckButton({ onClick, loading, progress = 0, totalBonds = 0 }: CheckButtonProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-elevation-3"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 4px 8px rgba(30,28,25,0.04), 0 8px 16px rgba(30,28,25,0.08)",
              "0 8px 16px rgba(230,168,0,0.15), 0 16px 32px rgba(230,168,0,0.2)",
              "0 4px 8px rgba(30,28,25,0.04), 0 8px 16px rgba(30,28,25,0.08)",
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-medium text-warm-800 mb-1">
            Checking your bonds...
          </p>
          <p className="text-xs text-muted">
            {Math.round(progress * 100)}% complete · {totalBonds} bonds
          </p>
          <div className="mt-2 w-48 h-1.5 bg-warm-200 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Button
        variant="primary"
        size="xl"
        onClick={onClick}
        className="text-lg px-12 py-4 h-auto gap-3 shadow-elevation-2 hover:shadow-elevation-3"
      >
        <SearchCheck className="h-6 w-6" />
        Check All Bonds
      </Button>
    </motion.div>
  );
}
