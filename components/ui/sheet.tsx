"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./button";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  side?: "bottom" | "right";
  className?: string;
}

function Sheet({ open, onClose, children, title, description, side = "bottom", className }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const variants = {
    bottom: {
      hidden: { y: "100%" },
      visible: {
        y: 0,
        transition: { type: "spring", stiffness: 350, damping: 30 },
      },
      exit: {
        y: "100%",
        transition: { type: "spring", stiffness: 500, damping: 35 },
      },
    },
    right: {
      hidden: { x: "100%" },
      visible: {
        x: 0,
        transition: { type: "spring", stiffness: 350, damping: 30 },
      },
      exit: {
        x: "100%",
        transition: { type: "spring", stiffness: 500, damping: 35 },
      },
    },
  };

  const sheetClass = {
    bottom: "bottom-0 left-0 right-0 max-h-[90vh] rounded-t-[var(--radius-xl)]",
    right: "right-0 top-0 h-full w-full max-w-md rounded-l-[var(--radius-xl)]",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-warm-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "fixed z-50 bg-surface shadow-elevation-4 p-6 overflow-y-auto",
              sheetClass[side],
              className
            )}
            variants={variants[side]}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={side === "bottom" ? "y" : undefined}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.velocity.y > 200) onClose();
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                {title && (
                  <h2 className="font-display text-lg font-semibold text-warm-900">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-muted mt-1">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { Sheet };
export type { SheetProps };
