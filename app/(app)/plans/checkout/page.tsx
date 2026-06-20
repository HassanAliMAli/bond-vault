import type { Metadata } from "next";
import { CheckoutPageClient } from "./client";

export const metadata: Metadata = {
  title: "Checkout — BondVault",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
