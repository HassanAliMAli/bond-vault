import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — BondVault",
};

export default function LoginPage() {
  return <LoginPageClient />;
}

// Separate client component needed for the form
import { LoginPageClient } from "./client";
