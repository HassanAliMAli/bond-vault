import type { Metadata } from "next";
import { AdminDashboardClient } from "./client";

export const metadata: Metadata = {
  title: "Admin Dashboard — BondVault",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
