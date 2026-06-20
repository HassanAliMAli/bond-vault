import type { Metadata } from "next";
import { ExportPageClient } from "./client";

export const metadata: Metadata = {
  title: "Export Bonds — BondVault",
};

export default function ExportPage() {
  return <ExportPageClient />;
}
