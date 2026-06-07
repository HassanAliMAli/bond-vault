"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--background)]">
      <div className="relative w-full max-w-[440px]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 via-transparent to-emerald-100/20 rounded-[var(--radius-xl)] blur-3xl -z-10" />

        <motion.div
          className="bg-surface rounded-[var(--radius-xl)] shadow-elevation-4 p-8 border border-[var(--border)]"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 28,
            delay: 0.05,
          }}
        >
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
              {title}
            </h2>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
          </div>

          {children}
        </motion.div>

        <p className="text-center text-xs text-muted mt-8">
          By continuing, you agree to BondVault&apos;s{" "}
          <span className="text-emerald-600 cursor-pointer hover:underline">
            Terms
          </span>{" "}
          and{" "}
          <span className="text-emerald-600 cursor-pointer hover:underline">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
