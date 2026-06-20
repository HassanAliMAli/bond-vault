"use client";

import Link from "next/link";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 lg:p-6 lg:max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
        <footer className="hidden lg:flex items-center justify-center gap-4 py-3 px-4 border-t border-dark-600 text-xs text-dark-500">
          <span>&copy; {new Date().getFullYear()} BondVault</span>
          <Link href="/privacy" className="hover:text-gray transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-gray transition-colors">Terms</Link>
        </footer>
      </div>
      <MobileNav />
    </div>
  );
}
