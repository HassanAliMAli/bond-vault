"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-elevation-1 hover:shadow-elevation-2",
        secondary:
          "bg-surface border border-[var(--border)] text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-elevation-1",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200",
        ghost:
          "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
        "ghost-emerald":
          "text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100",
        outline:
          "border border-emerald-300 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100",
        link:
          "text-slate-500 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-[var(--radius-sm)]",
        md: "h-11 px-4 text-sm",
        lg: "h-13 px-6 text-base",
        xl: "h-14 px-8 text-base font-semibold",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...(props as React.ComponentPropsWithoutRef<"button">)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
