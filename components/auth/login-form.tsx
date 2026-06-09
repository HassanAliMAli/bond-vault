"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

const formStagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } };
const formItem = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const result = await signIn.email({ email, password, callbackURL: "/vault" });
      if (result.error) {
        setError(result.error.message || "Unable to sign in.");
      }
    } catch {
      setError("Unable to sign in.");
    } finally { setLoading(false); }
  };

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-5" variants={formStagger} initial="hidden" animate="visible">
      {error && (
        <motion.div className="bg-red/10 border border-red/30 text-red px-4 py-3 rounded-[var(--radius-sm)] text-sm font-medium"
          initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: "auto", y: 0 }}
          transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}>{error}</motion.div>
      )}
      <motion.div variants={formItem}><Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" autoFocus /></motion.div>
      <motion.div variants={formItem}>
        <div className="relative">
          <Input label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-white transition-colors pt-2" tabIndex={-1}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
      <motion.div variants={formItem} className="pt-2"><Button type="submit" variant="primary" size="xl" className="w-full" loading={loading}>Sign In</Button></motion.div>
      <motion.div variants={formItem} className="text-center">
        <p className="text-sm text-gray">Don&apos;t have an account?{" "}
          <Link href="/register" className="text-gold hover:text-gold-light font-medium underline-offset-2 hover:underline transition-colors">Create one</Link></p>
      </motion.div>
    </motion.form>
  );
}
