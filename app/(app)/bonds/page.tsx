import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bonds — BondVault",
};

export default function BondsPage() {
  return <BondsPageClient />;
}

import { BondsPageClient } from "./client";
