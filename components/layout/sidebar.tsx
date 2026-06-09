"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/hooks/use-auth";
import { Vault, ScrollText, PlusCircle, SearchCheck, Settings } from "lucide-react";

const navItems = [
  { href: "/vault", label: "Vault", icon: Vault },
  { href: "/bonds", label: "My Bonds", icon: ScrollText },
  { href: "/check", label: "Check Bonds", icon: SearchCheck },
  { href: "/bonds/add", label: "Add Bond", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full bg-dark-900 border-r border-dark-600">
      <div className="p-5 pt-6">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gold/10 text-gold border-l-2 border-gold pl-2.5"
                  : "text-gray hover:bg-dark-700 hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-gold" : "text-gray group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-dark-600">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-semibold">{initial}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">{user?.email ?? "..."}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
