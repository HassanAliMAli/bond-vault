"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Bell, Lock, ScanSearch, BarChart3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

const features = [
  { icon: Shield, title: "Digital Vault", description: "Store all your prize bonds in one secure digital portfolio. Organize by denomination." },
  { icon: ScanSearch, title: "Instant Checking", description: "Match your bonds against historical draw results in seconds. No manual searching." },
  { icon: Bell, title: "Win Alerts", description: "Get notified immediately when your bonds win. Never miss a prize again." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-dark-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 lg:right-1/4 -translate-y-1/2 w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] bg-gold/5 rounded-full blur-[120px] animate-pulse-glow" />

          <svg className="absolute top-8 right-8 lg:top-16 lg:right-16 w-28 h-28 lg:w-36 lg:h-36 text-white opacity-[0.03]" viewBox="0 0 120 120" fill="currentColor" aria-hidden="true">
            <path d="M 40 20 A 35 35 0 1 0 85 55 A 28 28 0 1 1 40 20 Z" />
            <polygon points="72,8 76.5,19 88.5,19 79,26 83.5,37 72,30 60.5,37 65,26 55.5,19 67.5,19" />
          </svg>

          <div className="absolute bottom-0 left-0 right-0 h-20 opacity-[0.015]"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, #E2B04A 40px, #E2B04A 41px)`,
              backgroundSize: "41px 100%",
            }}
          />

          <svg className="absolute bottom-0 left-0 w-full opacity-[0.02]" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,40 C200,20 400,50 600,30 C800,10 1000,45 1200,25 L1200,60 L0,60 Z" fill="#E2B04A" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...fadeUp(0)}>
              <h1 className="font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-tight text-white">
                Your Prize Bond Portfolio,<br />
                <span className="text-gold">Digitized</span>
              </h1>

              <p className="text-base lg:text-lg text-gray max-w-lg mt-6 leading-relaxed">
                Store, organize, and check your Pakistani prize bonds against historical draw results. Never manually search again.
              </p>

              <motion.div {...fadeUp(0.15)} className="flex flex-wrap gap-4 mt-8">
                <Link href="/register"><Button variant="primary" size="xl">Start Free</Button></Link>
                <Link href="/pricing"><Button variant="outline" size="xl">View Pricing</Button></Link>
              </motion.div>

              <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-x-8 gap-y-3 mt-12">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gold shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Secure &amp; Private</p>
                    <p className="text-xs text-gray">Your data is always protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-gold shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Instant Results</p>
                    <p className="text-xs text-gray">Check any bond in seconds</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gold shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">Win Alerts</p>
                    <p className="text-xs text-gray">Get notified the moment you win</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-xl">
                <Image
                  src="/hero-vault.png"
                  alt="BondVault secure vault — store and manage your Pakistani prize bonds"
                  width={720}
                  height={647}
                  priority
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />

                <div className="absolute -top-3 -left-3 lg:-top-4 lg:-left-4 bg-dark-800/90 border border-gold/30 rounded-lg p-2.5 shadow-lg backdrop-blur-sm animate-float">
                  <Lock className="h-4 w-4 lg:h-5 lg:w-5 text-gold" />
                </div>

                <div className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 bg-dark-800/90 border border-gold/30 rounded-lg p-2.5 shadow-lg backdrop-blur-sm animate-float" style={{ animationDelay: "1s" }}>
                  <ScanSearch className="h-4 w-4 lg:h-5 lg:w-5 text-gold" />
                </div>

                <div className="absolute -bottom-3 -left-3 lg:-bottom-4 lg:-left-4 bg-dark-800/90 border border-gold/30 rounded-lg p-2.5 shadow-lg backdrop-blur-sm animate-float" style={{ animationDelay: "2s" }}>
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gold" />
                </div>

                <div className="absolute -bottom-3 -right-3 lg:-bottom-4 lg:-right-4 bg-dark-800/90 border border-gold/30 rounded-lg p-2.5 shadow-lg backdrop-blur-sm animate-float" style={{ animationDelay: "0.5s" }}>
                  <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-gold" />
                </div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" aria-hidden="true">
                  <line x1="30" y1="30" x2="110" y2="60" stroke="#E2B04A" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.25" />
                  <line x1="370" y1="30" x2="290" y2="60" stroke="#E2B04A" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.25" />
                  <line x1="30" y1="370" x2="110" y2="340" stroke="#E2B04A" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.25" />
                  <line x1="370" y1="370" x2="290" y2="340" stroke="#E2B04A" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.25" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-white text-center mb-12"
        >
          Everything You Need
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-[var(--radius-lg)] bg-dark-800/50 border border-dark-600 hover:border-dark-500 transition-all"
            >
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
