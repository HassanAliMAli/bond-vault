import type { Metadata } from "next";
import { PlansPageClient } from "./client";

export const metadata: Metadata = {
  title: "Plans — BondVault",
};

export default function PlansPage() {
  return <PlansPageClient />;
}
