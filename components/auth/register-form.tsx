"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "One uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "One number", passed: /\d/.test(password) },
    { label: "One special character", passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = checks.filter((c) => c.passed).length;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ];

  return (
    <motion.div
      className="space-y-2 mt-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              level <= strength ? strengthColor[strength] : "bg-slate-200"
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: level * 0.1 }}
          />
        ))}
      </div>
      <p className="text-xs text-muted">{strengthLabel[strength]}</p>
      <div className="space-y-1.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-xs">
            {check.passed ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <X className="h-3 w-3 text-slate-300" />
            )}
            <span
              className={check.passed ? "text-emerald-700" : "text-slate-400"}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/vault");
    } catch {
      setError("Unable to create account. Please try again.");
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
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
        />
        <PasswordStrength password={password} />
      </motion.div>

      <motion.div variants={formItem}>
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={
            passwordMismatch ? "Passwords do not match" : undefined
          }
        />
        {confirmPassword && !passwordMismatch && (
          <motion.p
            className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Check className="h-3 w-3" />
            Passwords match
          </motion.p>
        )}
      </motion.div>

      <motion.div variants={formItem} className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="w-full"
          loading={loading}
        >
          Create Account
        </Button>
      </motion.div>

      <motion.div variants={formItem} className="text-center">
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </motion.form>
  );
}
