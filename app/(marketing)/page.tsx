"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Search, Bell, Download, Upload, ScanLine } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Shield, title: "Digital Vault", description: "Store all your prize bonds in one secure digital portfolio. Organize by denomination." },
  { icon: Search, title: "Instant Checking", description: "Match your bonds against historical draw results in seconds. No manual searching." },
  { icon: Bell, title: "Win Alerts", description: "Get notified immediately when your bonds win. Never miss a prize again." },
  { icon: ScanLine, title: "OCR Scanning", description: "Use your camera to scan bond numbers. No manual entry required." },
  { icon: Upload, title: "Bulk Imports", description: "Import your entire portfolio from CSV, XLSX, or TXT files." },
  { icon: Download, title: "Portfolio Export", description: "Export your portfolio anytime for record-keeping or analysis." },
];

export default function HomePage() {
  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl lg:text-6xl font-bold text-white mb-6">
          Your Prize Bond Portfolio,<br /><span className="text-gold">Digitized</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-gray max-w-2xl mx-auto mb-8">
          Store, organize, and check your Pakistani prize bonds against historical draw results. Never manually search again.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-4">
          <Link href="/register"><Button variant="primary" size="xl">Start Free</Button></Link>
          <Link href="/pricing"><Button variant="outline" size="xl">View Pricing</Button></Link>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-[var(--radius-lg)] bg-dark-800/50 border border-dark-600 hover:border-dark-500 transition-all">
              <feature.icon className="h-8 w-8 text-gold mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
