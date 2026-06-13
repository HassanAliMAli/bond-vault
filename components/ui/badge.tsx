import { cn } from "@/lib/utils";

const denomVariants: Record<number, string> = {
  100: "bg-denom-100/10 text-denom-100 border-denom-100/20",
  200: "bg-denom-200/10 text-denom-200 border-denom-200/20",
  750: "bg-denom-750/10 text-denom-750 border-denom-750/20",
  1500: "bg-denom-1500/10 text-denom-1500 border-denom-1500/20",
  7500: "bg-denom-7500/10 text-denom-7500 border-denom-7500/20",
  25000: "bg-denom-25000/10 text-denom-25000 border-denom-25000/20",
  40000: "bg-denom-40000/10 text-denom-40000 border-denom-40000/20",
};

function DenominationBadge({ denomination, className }: { denomination: number | string; className?: string }) {
  const d = Number(denomination);
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tabular-nums", denomVariants[d] || "bg-gray/10 text-gray border-gray/20", className)}>
      Rs. {d.toLocaleString()}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", className)}>
      {children}
    </span>
  );
}

export { DenominationBadge, Badge };
