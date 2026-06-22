"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "What is BondVault?", a: "BondVault is a digital portfolio management platform for Pakistani Prize Bonds. It helps you store, organize, and check your bonds against historical draw results." },
  { q: "Is BondVault free?", a: "Yes! We offer a generous free tier that includes unlimited bond storage, manual entry, and historical draw checking. Premium features like imports, exports, and OCR are available on paid plans." },
  { q: "How do I check if my bonds have won?", a: "Simply add your bonds to your vault and click 'Check All Bonds'. Our matching engine compares your bonds against all historical draws and shows you any winning matches." },
  { q: "Is my data secure?", a: "Yes. We use enterprise-grade authentication via Better Auth, encrypted connections, and follow security best practices. Your data is stored in Cloudflare D1 with regular backups." },
  { q: "Can I import bonds from a file?", a: "Yes! Paid plans support importing bonds from CSV, XLSX, and TXT files. We automatically detect duplicates and show you a preview before saving." },
  { q: "How does OCR work?", a: "OCR runs entirely in your browser using Tesseract.js. Your bond certificate images never leave your device. The system extracts the bond number and denomination automatically." },
  { q: "What notifications do I get?", a: "When your bonds win in a draw, you receive a summary notification. You can choose to receive notifications via email, WhatsApp, or SMS." },
  { q: "How are draws imported?", a: "Draw results are sourced from National Savings Pakistan official publications. We process them and make them available for checking in your vault." },
  { q: "Can I export my portfolio?", a: "Yes! Paid users can export their portfolio as a CSV file, including bond numbers, denominations, statuses, and creation dates." },
  { q: "What happens to my account if I cancel?", a: "Your data remains intact for the duration of your subscription. After expiry, you have a 7-day grace period before reverting to the free tier. You can request account deletion at any time." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-white text-center mb-4">Frequently Asked Questions</h1>
        <p className="text-gray text-center mb-12">Everything you need to know about BondVault.</p>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-[var(--radius-md)] border border-dark-600 bg-dark-800/50 overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left text-white font-medium hover:bg-dark-700/50 transition-colors">
                {faq.q}
                <ChevronDown className={cn("h-4 w-4 text-gray transition-transform", openIndex === i && "rotate-180")} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <p className="px-4 pb-4 text-sm text-gray leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
