"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

const cardVariants = {
  rest: { scale: 1, y: 0, boxShadow: "var(--shadow-1)" },
  hover: {
    scale: 1.01, y: -2, boxShadow: "var(--shadow-3)",
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
  press: {
    scale: 0.98, boxShadow: "var(--shadow-1)",
    transition: { type: "spring" as const, stiffness: 600, damping: 30 },
  },
};

interface CardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
  variant?: "elevated" | "outlined" | "filled";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, variant = "elevated", children, ...props }, ref) => {
    const baseClasses = "rounded-[var(--radius-md)] p-5 transition-colors";

    const variantClasses = {
      elevated: "bg-white shadow-elevation-1 border border-[var(--border)]",
      outlined: "bg-white border-2 border-black",
      filled: "bg-black text-white",
    };

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(baseClasses, variantClasses[variant], "cursor-pointer select-none", className)}
          variants={cardVariants}
          initial="rest"
          whileHover="hover"
          whileTap="press"
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div ref={ref} className={cn(baseClasses, variantClasses[variant], className)} {...props}>
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1 pb-4", className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-semibold text-lg leading-tight tracking-tight text-black", className)} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted leading-relaxed", className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("", className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center pt-4", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export type { CardProps };
