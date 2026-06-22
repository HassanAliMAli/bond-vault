"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/hooks/use-auth";
import { Vault, ScrollText, PlusCircle, SearchCheck, Settings, Shield, PanelLeftClose, PanelLeft, Upload, Download, CreditCard, Receipt, ScanLine } from "lucide-react";

const navItems = [
  { href: "/vault", label: "Vault", icon: Vault },
  { href: "/bonds", label: "My Bonds", icon: ScrollText },
  { href: "/check", label: "Check Bonds", icon: SearchCheck },
  { href: "/bonds/add", label: "Add Bond", icon: PlusCircle },
  { href: "/bonds/import", label: "Import Bonds", icon: Upload },
  { href: "/bonds/export", label: "Export", icon: Download },
  { href: "/bonds/scan", label: "Scan Bonds", icon: ScanLine },
  { href: "/plans", label: "Subscription", icon: CreditCard },
  { href: "/payments", label: "Payments", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.status === "admin";
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-full bg-dark-900 border-r border-dark-600 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo + toggle */}
      <div className={cn("flex items-center p-5 pt-6", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <Logo size="sm" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-gray hover:text-white hover:bg-dark-700 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0" : "",
                isActive
                  ? "bg-gold/10 text-gold border-l-2 border-gold"
                  : "text-gray hover:bg-dark-700 hover:text-white",
                collapsed && isActive ? "border-l-0" : ""
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-gold" : "text-gray")} />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-3">
                <p className="text-[10px] uppercase tracking-widest text-gray font-semibold">Admin</p>
              </div>
            )}
            {[
              { href: "/admin", label: "Dashboard", icon: Shield },
              { href: "/admin/users", label: "Users", icon: Shield },
              { href: "/admin/payments", label: "Payments", icon: Shield },
              { href: "/admin/draws", label: "Draws", icon: Shield },
              { href: "/admin/audit", label: "Audit Logs", icon: Shield },
              { href: "/admin/settings", label: "Settings", icon: Shield },
            ].map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200",
                    collapsed ? "justify-center px-0" : "",
                    isActive
                      ? "bg-gold/10 text-gold border-l-2 border-gold"
                      : "text-gray hover:bg-dark-700 hover:text-white",
                    collapsed && isActive ? "border-l-0" : ""
                  )}
                >
                  <Shield className={cn("h-4 w-4 shrink-0", isActive ? "text-gold" : "text-gray")} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-4 border-t border-dark-600">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-semibold shrink-0">{initial}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{user?.email ?? "..."}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
