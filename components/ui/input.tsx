"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helpText, id, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const hasValue = props.value !== undefined && props.value !== "";
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="relative w-full">
        {label && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 z-10 pointer-events-none font-sans transition-all duration-200",
              focused || hasValue
                ? "text-xs text-emerald-600 top-1.5 bg-surface px-1"
                : "text-sm text-muted top-3"
            )}
            animate={{
              top: focused || hasValue ? 6 : 12,
              fontSize: focused || hasValue ? "0.7rem" : "0.875rem",
              color: error ? "#F43F5E" : focused ? "#059669" : "var(--muted)",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {label}
          </motion.label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-12 w-full rounded-[var(--radius-sm)] border bg-surface px-3 py-2 font-sans text-sm text-slate-900",
            "placeholder:text-slate-400",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            error
              ? "border-rose-300 focus:ring-rose-200"
              : focused
                ? "border-emerald-400 focus:ring-emerald-200"
                : "border-[var(--border)] hover:border-slate-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
            label && "pt-5",
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <motion.p
            className="mt-1.5 text-xs text-rose-500 font-medium"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {error}
          </motion.p>
        )}
        {helpText && !error && (
          <p className="mt-1.5 text-xs text-muted">{helpText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
