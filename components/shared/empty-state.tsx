"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: "vault" | "search" | "general";
  className?: string;
}

const illustrations = {
  vault: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mb-6">
      <rect x="20" y="25" width="80" height="65" rx="8" stroke="var(--muted)" strokeWidth="1.5" fill="none" />
      <rect x="30" y="35" width="60" height="45" rx="4" fill="var(--border)" fillOpacity={0.3} />
      <circle cx="60" cy="58" r="8" stroke="var(--muted)" strokeWidth="1.5" />
      <path d="M60 61v5" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M75 22l-5 8M45 22l5 8" stroke="#E6A800" strokeWidth="2" strokeLinecap="round" />
      <rect x="52" y="10" width="16" height="16" rx="4" stroke="#E6A800" strokeWidth="1.5" fill="none" />
      <path d="M57 18h6M60 15v6" stroke="#E6A800" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mb-6">
      <circle cx="55" cy="48" r="22" stroke="var(--muted)" strokeWidth="1.5" />
      <path d="M70 63l14 14" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="55" cy="48" r="4" fill="var(--border)" fillOpacity={0.5} />
      <rect x="28" y="18" width="10" height="10" rx="2" stroke="#E6A800" strokeWidth="1.2" opacity={0.5} />
      <rect x="60" y="22" width="10" height="10" rx="2" stroke="#E6A800" strokeWidth="1.2" opacity={0.3} />
      <rect x="75" y="50" width="10" height="10" rx="2" stroke="#E6A800" strokeWidth="1.2" opacity={0.2} />
    </svg>
  ),
  general: (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mb-6">
      <rect x="20" y="15" width="80" height="70" rx="8" stroke="var(--muted)" strokeWidth="1.5" fill="var(--border)" fillOpacity={0.15} />
      <rect x="30" y="30" width="25" height="8" rx="4" fill="var(--muted)" fillOpacity={0.2} />
      <rect x="30" y="44" width="40" height="4" rx="2" fill="var(--muted)" fillOpacity={0.15} />
      <rect x="30" y="52" width="35" height="4" rx="2" fill="var(--muted)" fillOpacity={0.1} />
      <path d="M90 25l10-5M90 65l10 5" stroke="#E6A800" strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />
    </svg>
  ),
};

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration = "general",
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {icon || illustrations[illustration]}
      <h3 className="font-display text-xl font-semibold text-slate-800 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      <div className="flex items-center gap-3">
        {action && (
          <Button variant="primary" size="lg" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="secondary" size="lg" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
