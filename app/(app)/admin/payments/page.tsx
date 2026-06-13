import type { Metadata } from "next";
import { AdminPaymentsClient } from "./client";

export const metadata: Metadata = {
  title: "Payments — Admin — BondVault",
};

export default function AdminPaymentsPage() {
  return <AdminPaymentsClient />;
}
