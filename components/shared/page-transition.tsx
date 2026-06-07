"use client";

import { motion, type Variants } from "framer-motion";

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28, delay: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

interface PageTransitionProps { children: React.ReactNode; className?: string; }

function PageTransition({ children, className }: PageTransitionProps) {
  return <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className={className}>{children}</motion.div>;
}

export { PageTransition };
export type { PageTransitionProps };
