import type { Context, Next } from "hono";

export async function sessionMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  let sessionToken: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    sessionToken = authHeader.slice(7);
  } else {
    const cookie = c.req.header("Cookie");
    if (cookie) {
      const match = cookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) sessionToken = match[1];
    }
  }

  if (sessionToken) {
    const stmt = (c.env as Env).DB.prepare(
      "SELECT users.id as userId, users.email as userEmail, users.status as userStatus FROM users JOIN session ON session.user_id = users.id WHERE session.token = ? AND session.expires_at > datetime('now')"
    );
    const session = await stmt.bind(sessionToken).first<{
      userId: string;
      userEmail: string;
      userStatus: string;
    }>();

    if (session) {
      c.set("userId", session.userId);
      c.set("isAdmin", session.userEmail === "admin@bondvault.com");
      c.set("session", { userId: session.userId });
    }
  }

  await next();
}
