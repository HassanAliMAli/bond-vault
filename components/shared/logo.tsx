"use client";

import { cn } from "@/lib/utils";

function Logo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const sizeClasses = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex-shrink-0">
        <svg width={size === "sm" ? 28 : size === "md" ? 34 : 42} height={size === "sm" ? 28 : size === "md" ? 34 : 42} viewBox="0 0 42 42" fill="none">
          <rect width="42" height="42" rx="10" fill="#E2B04A" />
          <path d="M12 18h18v-2a4 4 0 0 0-4-4H16a4 4 0 0 0-4 4v2Z" fill="#0A0E17" />
          <rect x="10" y="18" width="22" height="14" rx="3" fill="#EAECF0" />
          <circle cx="21" cy="24" r="2.5" fill="#E2B04A" />
          <path d="M21 26.5v3" stroke="#E2B04A" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="15" y="29" width="12" height="1.5" rx="0.75" fill="#E2B04A" fillOpacity={0.3} />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight whitespace-nowrap text-white", sizeClasses[size])}>
          Bond<span className="text-gold">Vault</span>
        </span>
      )}
    </div>
  );
}

export { Logo };
