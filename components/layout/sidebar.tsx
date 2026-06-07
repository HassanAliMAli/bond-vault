"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import {
  Vault,
  ScrollText,
  PlusCircle,
  SearchCheck,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/vault", label: "Vault", icon: Vault },
  { href: "/bonds", label: "My Bonds", icon: ScrollText },
  { href: "/check", label: "Check Bonds", icon: SearchCheck },
  { href: "/bonds/add", label: "Add Bond", icon: PlusCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full bg-emerald-900 text-warm-100 border-r border-emerald-800/50">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-gold-500/15 text-gold-300 border-l-2 border-gold-400 pl-2.5"
                  : "text-warm-300 hover:bg-white/8 hover:text-warm-100"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-gold-400" : "text-warm-400 group-hover:text-warm-200"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-800/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-100 truncate">
              ahmad@example.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
