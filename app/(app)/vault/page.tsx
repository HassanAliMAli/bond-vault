import type { Metadata } from "next";
import { VaultPageClient } from "./client";

export const metadata: Metadata = {
  title: "Vault — BondVault",
};

export default function VaultPage() {
  return <VaultPageClient />;
}
