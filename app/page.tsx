"use client";

import { redirect } from "next/navigation";

export default function HomePage() {
  // In MVP, always redirect to login for now
  // Will be replaced with session check
  redirect("/login");
}
