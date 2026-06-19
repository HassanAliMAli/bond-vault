"use client";

import { useState, useRef, useEffect } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

interface HeaderProps { onMenuToggle?: () => void; }

export function Header({ onMenuToggle }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications(5);
  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n) => n.status === "pending" || n.status === "sent").length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/95 backdrop-blur-xl border-b border-dark-600 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="lg:hidden"><Logo size="sm" /></div>
      </div>
      <div className="relative" ref={ref}>
        <Button variant="ghost" size="icon" className="text-gray hover:text-white relative" onClick={() => setOpen(!open)}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red text-white text-[9px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-[var(--radius-md)] bg-dark-800 border border-dark-600 shadow-elevation-4 overflow-hidden">
            <div className="p-3 border-b border-dark-600">
              <p className="text-sm font-semibold text-white">Notifications</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-gray">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={cn("p-3 border-b border-dark-600 hover:bg-dark-700 transition-colors", (n.status === "pending" || n.status === "sent") ? "border-l-2 border-l-gold" : "")}>
                    <p className="text-sm font-medium text-white">{n.title || "Notification"}</p>
                    <p className="text-xs text-gray mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-dark-500 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
