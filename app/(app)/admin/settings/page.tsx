import type { Metadata } from "next";
import { AdminSettingsClient } from "./client";

export const metadata: Metadata = {
  title: "Settings — Admin — BondVault",
};

export default function AdminSettingsPage() {
  return <AdminSettingsClient />;
}
