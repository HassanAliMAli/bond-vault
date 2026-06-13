import type { Metadata } from "next";
import { AdminAuditClient } from "./client";

export const metadata: Metadata = {
  title: "Audit Logs — Admin — BondVault",
};

export default function AdminAuditPage() {
  return <AdminAuditClient />;
}
