import type { Metadata } from "next";
import { AdminDrawsClient } from "./client";

export const metadata: Metadata = {
  title: "Draws — Admin — BondVault",
};

export default function AdminDrawsPage() {
  return <AdminDrawsClient />;
}
