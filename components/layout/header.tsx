"use client";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-600"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-slate-500">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-semibold">
          A
        </div>
      </div>
    </header>
  );
}
