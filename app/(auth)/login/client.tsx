"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export function LoginPageClient() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to access your bond portfolio"
    >
      <LoginForm />
    </AuthCard>
  );
}
