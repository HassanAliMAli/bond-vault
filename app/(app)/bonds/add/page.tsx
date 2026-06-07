import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Bond — BondVault",
};

export default function AddBondPage() {
  return <AddBondPageClient />;
}

import { AddBondPageClient } from "./client";
