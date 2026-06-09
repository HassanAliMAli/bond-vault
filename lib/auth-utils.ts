import { NextRequest } from "next/server";
import { getDb } from "./db";

export function getUserId(req: NextRequest): string {
  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ?? "";
  if (!sessionToken) throw new Error("Unauthorized");

  const db = getDb();
  const session = db
    .prepare(
      "SELECT user_id FROM session WHERE token = ? AND expires_at > datetime('now')"
    )
    .get(sessionToken) as { user_id: string } | undefined;
  if (!session) throw new Error("Session expired");
  return session.user_id;
}
