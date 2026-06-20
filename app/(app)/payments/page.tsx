import type { Metadata } from "next";
import { PaymentsPageClient } from "./client";

export const metadata: Metadata = {
  title: "Payment History — BondVault",
};

export default function PaymentsPage() {
  return <PaymentsPageClient />;
}
