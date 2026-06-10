"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DenominationBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Hash, AlertCircle } from "lucide-react";

const DENOMINATIONS = [
  { value: "100", label: "Rs. 100" }, { value: "200", label: "Rs. 200" }, { value: "750", label: "Rs. 750" },
  { value: "1500", label: "Rs. 1,500" }, { value: "7500", label: "Rs. 7,500" }, { value: "25000", label: "Rs. 25,000" }, { value: "40000", label: "Rs. 40,000" },
];

interface BondFormProps { onSubmit: (data: { denomination: string; bondNumber: string }) => void; onCancel: () => void; existingNumbers?: string[]; }

export function BondForm({ onSubmit, onCancel, existingNumbers = [] }: BondFormProps) {
  const [denomination, setDenomination] = useState<string | null>(null);
  const [bondNumber, setBondNumber] = useState("");
  const [error, setError] = useState("");
  const isDuplicate = existingNumbers.includes(bondNumber);
  const isValid = denomination && /^\d{6}$/.test(bondNumber) && !isDuplicate;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white mb-3">Select Denomination</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {DENOMINATIONS.map((d, i) => {
            const selected = denomination === d.value;
            return (
              <motion.button key={d.value} type="button" onClick={() => { setDenomination(d.value); setError(""); }}
                className={cn("relative p-4 rounded-[var(--radius-md)] border text-center transition-all", selected ? "border-gold bg-gold/5 shadow-elevation-1" : "border-dark-600 bg-dark-800 hover:border-dark-500 hover:bg-dark-700")}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 350, damping: 26, delay: i * 0.05 }} whileTap={{ scale: 0.97 }}>
                <span className={cn("text-lg font-semibold block text-white")}>{d.label}</span>
                {selected && <motion.div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}><Check className="h-3 w-3 text-dark-900" /></motion.div>}
              </motion.button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {denomination && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ type: "spring", stiffness: 350, damping: 28 }}>
            <label className="block text-sm font-medium text-white mb-3">Bond Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray" />
              <Input type="text" inputMode="numeric" value={bondNumber} onChange={(e) => { setBondNumber(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder="Enter 6-digit bond number" className="pl-10 text-lg tracking-widest" maxLength={6} autoFocus error={error} />
            </div>
            <div className="mt-3 space-y-1.5">
              {bondNumber.length > 0 && /^\d+$/.test(bondNumber) && <div className="flex items-center gap-2 text-xs text-green"><Check className="h-3 w-3" />Valid number format</div>}
              {isDuplicate && <div className="flex items-center gap-2 text-xs text-red"><AlertCircle className="h-3 w-3" />This bond already exists in your vault</div>}
            </div>
            {denomination && bondNumber && !isDuplicate && <div className="mt-3 inline-flex items-center gap-2"><DenominationBadge denomination={denomination} /><span className="text-sm text-white">{bondNumber}</span></div>}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-3 pt-2">
        <Button variant="primary" size="lg" onClick={() => { if (isValid) onSubmit({ denomination: denomination!, bondNumber }); }} disabled={!isValid} className="flex-1">Add to Vault</Button>
        <Button variant="ghost" size="lg" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
