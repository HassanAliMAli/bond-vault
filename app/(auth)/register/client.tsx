"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export function RegisterPageClient() {
  return (
    <AuthCard
      title="Create your vault"
      description="Start building your prize bond portfolio in seconds"
    >
      <RegisterForm />
    </AuthCard>
  );
}
