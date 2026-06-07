"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="rounded-full bg-amber-50 p-4 mb-6">
        <AlertTriangle className="h-8 w-8 text-amber-600" />
      </div>
      <h3 className="font-display text-xl font-semibold text-warm-800 mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button variant="secondary" size="lg" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Try Again
          </Button>
        )}
        {action && (
          <Button variant="ghost" size="lg" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export { ErrorState };
export type { ErrorStateProps };
