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
  "1st Prize": <Trophy className="h-5 w-5 text-amber" />,
  "2nd Prize": <Award className="h-5 w-5 text-amber" />,
  "3rd Prize": <Star className="h-5 w-5 text-cyan" />,
};

const prizeColors: Record<string, string> = {
  "1st Prize": "border-l-amber bg-gradient-to-r from-amber/[0.05] to-transparent",
  "2nd Prize": "border-l-amber bg-gradient-to-r from-amber/[0.03] to-transparent",
  "3rd Prize": "border-l-cyan bg-gradient-to-r from-cyan/[0.05] to-transparent",
};

export function MatchCard({ bondNumber, denomination, prizeType, prizeAmount, drawDate, drawNumber, index = 0 }: MatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 26, delay: 0.1 + index * 0.08 }}
    >
      <Card variant="outlined" className={`border-l-4 ${prizeColors[prizeType] || "border-l-cyan"} p-4`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-black/10 flex items-center justify-center shrink-0">
            {prizeIcons[prizeType] || <Trophy className="h-5 w-5 text-amber" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-base font-semibold text-black">#{bondNumber}</span>
              <DenominationBadge denomination={denomination} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-black">{prizeType}</span>
              <span className="text-black/20">·</span>
              <span className="font-semibold text-green">{prizeAmount}</span>
              <span className="text-black/20">·</span>
              <span className="text-muted text-xs">Draw #{drawNumber} — {drawDate}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
