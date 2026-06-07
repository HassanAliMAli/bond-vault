import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Bonds — BondVault",
};

export default function CheckPage() {
  return <CheckPageClient />;
}

import { CheckPageClient } from "./client";
