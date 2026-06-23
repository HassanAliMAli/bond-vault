"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "Free",
    description: "Get started with basic bond portfolio management.",
    features: ["Store unlimited bonds", "Manual bond entry", "Historical draw checking", "3 OCR scans/month", "Basic portfolio view"],
  },
  {
    name: "Monthly",
    price: "$10",
    period: "/month",
    description: "For active bond collectors and regular checkers.",
    popular: true,
    features: ["Everything in Free", "30 OCR scans/month", "CSV/XLSX/TXT imports", "CSV exports", "Email alerts", "Priority support"],
  },
  {
    name: "Annual",
    price: "$100",
    period: "/year",
    description: "Best value for serious bond investors.",
    features: ["Everything in Monthly", "500 OCR scans/month", "Auto-monitoring", "WhatsApp & SMS alerts", "Advanced analytics", "Premium support"],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-white text-center mb-4">Simple Pricing</h1>
        <p className="text-gray text-center max-w-2xl mx-auto mb-12">Choose the plan that fits your needs. Upgrade anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={cn("relative p-6 lg:p-10 rounded-[var(--radius-lg)] border transition-all", plan.popular ? "border-gold bg-gold/5 shadow-elevation-2" : "border-dark-600 bg-dark-800/50")}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold text-dark-900 text-xs font-semibold rounded-full">Most Popular</div>}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <div className="text-3xl font-bold text-white mb-1">{plan.price}<span className="text-sm text-gray font-normal">{plan.period || ""}</span></div>
              <p className="text-sm text-gray mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray"><Check className="h-4 w-4 text-green mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant={plan.popular ? "primary" : "outline"} className="w-full">{plan.name === "Free" ? "Get Started" : "Subscribe"}</Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
