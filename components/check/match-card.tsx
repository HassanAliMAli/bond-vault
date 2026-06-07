"use client";

import { motion } from "framer-motion";
import { DenominationBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trophy, Award, Star } from "lucide-react";

interface MatchCardProps {
  bondNumber: string;
  denomination: string;
  prizeType: string;
  prizeAmount: string;
  drawDate: string;
  drawNumber: string;
  index?: number;
}

const prizeIcons: Record<string, React.ReactNode> = {
  "1st Prize": <Trophy className="h-5 w-5 text-emerald-500" />,
  "2nd Prize": <Award className="h-5 w-5 text-amber-500" />,
  "3rd Prize": <Star className="h-5 w-5 text-rose-400" />,
};

const prizeColors: Record<string, string> = {
  "1st Prize": "border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent",
  "2nd Prize": "border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent",
  "3rd Prize": "border-l-rose-400 bg-gradient-to-r from-rose-50/50 to-transparent",
};

export function MatchCard({
  bondNumber,
  denomination,
  prizeType,
  prizeAmount,
  drawDate,
  drawNumber,
  index = 0,
}: MatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 26,
        delay: 0.1 + index * 0.08,
      }}
    >
      <Card
        variant="outlined"
        className={`border-l-4 ${prizeColors[prizeType] || "border-l-emerald-500"} p-4`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white border border-[var(--border)] flex items-center justify-center shrink-0">
            {prizeIcons[prizeType] || <Trophy className="h-5 w-5 text-emerald-500" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-base font-semibold text-slate-900">
                #{bondNumber}
              </span>
              <DenominationBadge denomination={denomination} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-700">{prizeType}</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-emerald-600">{prizeAmount}</span>
              <span className="text-slate-300">·</span>
              <span className="text-muted text-xs">
                Draw #{drawNumber} — {drawDate}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
