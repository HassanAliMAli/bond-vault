import type { Metadata } from "next";
import { ScanPageClient } from "./client";

export const metadata: Metadata = {
  title: "Scan Bonds — BondVault",
};

export default function ScanPage() {
  return <ScanPageClient />;
}
