"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Vault, ScrollText, PlusCircle, SearchCheck, Settings, ScanLine, Upload, Download, CreditCard, Receipt } from "lucide-react";

const mobileNavItems = [
  { href: "/vault", label: "Vault", icon: Vault },
  { href: "/bonds", label: "Bonds", icon: ScrollText },
  { href: "/check", label: "Check", icon: SearchCheck },
  { href: "/bonds/add", label: "Add", icon: PlusCircle },
  { href: "/bonds/scan", label: "Scan", icon: ScanLine },
  { href: "/bonds/import", label: "Import", icon: Upload },
  { href: "/bonds/export", label: "Export", icon: Download },
  { href: "/plans", label: "Plan", icon: CreditCard },
  { href: "/payments", label: "Pay", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-dark-800 border-t border-dark-600 shadow-elevation-3 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 rounded-[var(--radius-sm)] transition-colors duration-200",
                isActive ? "text-gold" : "text-gray hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-all", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-tight truncate">{item.label}</span>
              {isActive && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
