import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — BondVault",
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}

import { RegisterPageClient } from "./client";
