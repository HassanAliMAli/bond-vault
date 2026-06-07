"use client";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-warm-500">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-xs font-semibold">
          A
        </div>
      </div>
    </header>
  );
}
