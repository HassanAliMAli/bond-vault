"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Search, Bell, ScanLine, Upload, Download, BarChart3, Clock, Database, Lock, Smartphone, Globe } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Shield, title: "Digital Portfolio", description: "Store unlimited prize bonds in a secure digital vault. Organize by denomination, search by number, and access from anywhere." },
  { icon: Search, title: "Instant Draw Checking", description: "Check your entire portfolio against all historical draws in seconds. Our matching engine finds winners instantly." },
  { icon: Bell, title: "Smart Notifications", description: "Get notified via email, WhatsApp, or SMS when your bonds win. Configurable per-channel preferences." },
  { icon: ScanLine, title: "OCR Scanning", description: "Scan bond numbers using your device camera. Browser-side processing means your images never leave your device." },
  { icon: Upload, title: "Bulk Import", description: "Import hundreds of bonds at once from CSV, XLSX, or TXT files. Automatic duplicate detection." },
  { icon: Download, title: "Portfolio Export", description: "Export your portfolio as CSV or XLSX. Perfect for record-keeping, tax filing, or analysis." },
  { icon: BarChart3, title: "Portfolio Analytics", description: "View your portfolio breakdown by denomination, track winnings over time, and analyze your bond holdings." },
  { icon: Clock, title: "Historical Draw Data", description: "Access complete historical draw results from National Savings Pakistan. New draws added promptly." },
  { icon: Database, title: "Match History", description: "Complete record of all winning matches. Each match is snapshot-stored for permanent record keeping." },
  { icon: Lock, title: "Secure Authentication", description: "Enterprise-grade authentication powered by Better Auth. Your data is encrypted and protected." },
  { icon: Smartphone, title: "Mobile Responsive", description: "Full-featured on every device. Manage your portfolio on desktop, tablet, or phone." },
  { icon: Globe, title: "Cloud Native", description: "Built on Cloudflare's global network. Fast, reliable, and scalable to millions of users." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-dark-600">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">BondVault</Link>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Login</Button></Link>
            <Link href="/register"><Button variant="primary">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-white text-center mb-4">Features</h1>
        <p className="text-gray text-center max-w-2xl mx-auto mb-12">Everything you need to manage your prize bond portfolio efficiently.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-6 rounded-[var(--radius-lg)] bg-dark-800/50 border border-dark-600 hover:border-dark-500 transition-all">
              <feature.icon className="h-8 w-8 text-gold mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
