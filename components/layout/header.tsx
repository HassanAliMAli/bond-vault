"use client";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Menu, Bell } from "lucide-react";

interface HeaderProps { onMenuToggle?: () => void; }

export function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/95 backdrop-blur-xl border-b border-dark-600 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="lg:hidden"><Logo size="sm" /></div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray hover:text-white">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-semibold">{initial}</div>
      </div>
    </header>
  );
}
