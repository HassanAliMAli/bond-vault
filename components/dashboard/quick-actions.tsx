"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, SearchCheck, ScrollText, Settings } from "lucide-react";

const actions = [
  {
    href: "/bonds/add",
    label: "Add Bond",
    description: "Store a new prize bond",
    icon: PlusCircle,
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    primary: true,
  },
  {
    href: "/check",
    label: "Check Bonds",
    description: "Match against draws",
    icon: SearchCheck,
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  },
  {
    href: "/bonds",
    label: "Manage Bonds",
    description: "View and organize",
    icon: ScrollText,
    color: "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Account preferences",
    icon: Settings,
    color: "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
  },
];

export function QuickActions() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 24,
                delay: 0.3 + i * 0.06,
              }}
            >
              <Link
                href={action.href}
                className={`group flex flex-col items-center gap-2.5 p-4 rounded-[var(--radius-md)] border border-transparent hover:border-[var(--border)] bg-surface hover:shadow-elevation-2 transition-all text-center cursor-pointer ${
                  action.primary ? "ring-1 ring-emerald-200" : ""
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
