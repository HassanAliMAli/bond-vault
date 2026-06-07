"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";
import { Eye, EyeOff } from "lucide-react";

const formStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const formItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual auth call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (email === "demo@bondvault.pk" && password === "password123") {
        router.push("/vault");
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      variants={formStagger}
      initial="hidden"
      animate="visible"
    >
      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[var(--radius-sm)] text-sm font-medium"
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {error}
        </motion.div>
      )}

      <motion.div variants={formItem}>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
        />
      </motion.div>

      <motion.div variants={formItem}>
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-600 transition-colors pt-2"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </motion.div>

      <motion.div variants={formItem} className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="w-full"
          loading={loading}
        >
          Sign In
        </Button>
      </motion.div>

      <motion.div variants={formItem} className="text-center">
        <p className="text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </motion.form>
  );
}
