import type { Metadata } from "next";
import { AdminUsersClient } from "./client";

export const metadata: Metadata = {
  title: "Users — Admin — BondVault",
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
