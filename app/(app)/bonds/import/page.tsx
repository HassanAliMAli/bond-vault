import type { Metadata } from "next";
import { ImportPageClient } from "./client";

export const metadata: Metadata = {
  title: "Import Bonds — BondVault",
};

export default function ImportPage() {
  return <ImportPageClient />;
}
