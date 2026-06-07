import type { Metadata } from "next";

export const metadata = {
  title: "Settings — BondVault",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}

import { SettingsPageClient } from "./client";
