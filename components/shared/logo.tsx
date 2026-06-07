"use client";

import { cn } from "@/lib/utils";

function Logo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex-shrink-0">
        <svg
          width={size === "sm" ? 28 : size === "md" ? 34 : 42}
          height={size === "sm" ? 28 : size === "md" ? 34 : 42}
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="42" height="42" rx="10" fill="#10B981" />
          <path d="M12 18h18v-2a4 4 0 0 0-4-4H16a4 4 0 0 0-4 4v2Z" fill="white" fillOpacity={0.9} />
          <rect x="10" y="18" width="22" height="14" rx="3" fill="white" />
          <circle cx="21" cy="24" r="2.5" fill="#10B981" />
          <path d="M21 26.5v3" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="15" y="29" width="12" height="1.5" rx="0.75" fill="#10B981" fillOpacity={0.3} />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-display font-bold tracking-tight whitespace-nowrap", sizeClasses[size])}>
          Bond<span className="text-emerald-500">Vault</span>
        </span>
      )}
    </div>
  );
}

export { Logo };
